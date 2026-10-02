import prisma from './prisma';
import { env } from './env';

export interface DatabaseDiagnostics {
  provider: 'mongodb';
  connected: boolean;
  mode: 'persistent' | 'in-memory';
  persistence: 'ENABLED' | 'DISABLED';
  isAtlas: boolean;
  host: string;
  databaseName: string;
  maskedUrl: string;
  lastChecked: string;
  error?: string | null;
  likelyCause?: string | null;
}

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  maskedUrl: string;
  isAtlas: boolean;
  host: string;
  databaseName: string;
  hasUnencodedCharacters: boolean;
}

/**
 * Safely masks user credentials in a database connection URL.
 * Never exposes real passwords in logs or health endpoints.
 */
export function maskDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '[Not Configured]';
  }
  return rawUrl.replace(/(:\/\/[^:]+:)([^@]+)(@)/g, '$1****$3');
}

/**
 * Validates whether the configured DATABASE_URL is a valid MongoDB connection string.
 */
export function validateDatabaseUrl(rawUrl?: string): UrlValidationResult {
  const url = (rawUrl || env.DATABASE_URL || '').trim();
  const masked = maskDatabaseUrl(url);

  if (!url) {
    return {
      isValid: false,
      error: 'DATABASE_URL is empty or undefined.',
      maskedUrl: '[Empty]',
      isAtlas: false,
      host: 'unknown',
      databaseName: 'unknown',
      hasUnencodedCharacters: false,
    };
  }

  const isMongo = url.startsWith('mongodb://');
  const isAtlas = url.startsWith('mongodb+srv://');

  if (!isMongo && !isAtlas) {
    return {
      isValid: false,
      error: 'DATABASE_URL must start with "mongodb://" or "mongodb+srv://".',
      maskedUrl: masked,
      isAtlas: false,
      host: 'invalid',
      databaseName: 'invalid',
      hasUnencodedCharacters: false,
    };
  }

  // Check for unencoded special characters in credentials
  let hasUnencodedCharacters = false;
  let host = isAtlas ? 'cluster0.mongodb.net' : 'localhost:27017';
  let databaseName = 'finquest';

  try {
    const afterProtocol = url.replace(/^mongodb(\+srv)?:\/\//, '');
    if (afterProtocol.includes('@')) {
      const creds = afterProtocol.split('@')[0];
      const [, pass] = creds.split(':');
      if (pass && /[@:#/\?%&]/.test(decodeURIComponent(pass) !== pass ? '' : pass)) {
        hasUnencodedCharacters = true;
      }
      const hostPart = afterProtocol.split('@')[1];
      const [h, rest] = hostPart.split('/');
      if (h) host = h.split('?')[0];
      if (rest) databaseName = rest.split('?')[0] || 'finquest';
    } else {
      const [h, rest] = afterProtocol.split('/');
      if (h) host = h.split('?')[0];
      if (rest) databaseName = rest.split('?')[0] || 'finquest';
    }
  } catch {
    // Graceful fallback
  }

  return {
    isValid: true,
    maskedUrl: masked,
    isAtlas,
    host,
    databaseName,
    hasUnencodedCharacters,
  };
}

class DatabaseManager {
  private connected: boolean = false;
  private mode: 'persistent' | 'in-memory' = 'in-memory';
  private lastChecked: Date | null = null;
  private connectionError: string | null = null;
  private likelyCause: string | null = null;
  private isTesting: boolean = false;

  public isDatabaseConnected(): boolean {
    return this.connected;
  }

  public getDatabaseMode(): 'persistent' | 'in-memory' {
    return this.mode;
  }

  public getDatabaseDiagnostics(): DatabaseDiagnostics {
    const validation = validateDatabaseUrl(env.DATABASE_URL);
    return {
      provider: 'mongodb',
      connected: this.connected,
      mode: this.mode,
      persistence: this.connected ? 'ENABLED' : 'DISABLED',
      isAtlas: validation.isAtlas,
      host: validation.host,
      databaseName: validation.databaseName,
      maskedUrl: validation.maskedUrl,
      lastChecked: this.lastChecked ? this.lastChecked.toISOString() : new Date().toISOString(),
      error: this.connectionError,
      likelyCause: this.likelyCause,
    };
  }

  /**
   * Performs an active ping to MongoDB with a strict timeout.
   */
  public async testDatabaseConnection(timeoutMs: number = 2500): Promise<boolean> {
    if (this.isTesting) {
      return this.connected;
    }
    this.isTesting = true;

    try {
      const pingPromise = prisma.$runCommandRaw({ ping: 1 });
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`MongoDB ping timed out after ${timeoutMs}ms`)), timeoutMs)
      );

      await Promise.race([pingPromise, timeoutPromise]);
      this.connected = true;
      this.mode = 'persistent';
      this.connectionError = null;
      this.likelyCause = null;
      this.lastChecked = new Date();
      return true;
    } catch (err: any) {
      this.connected = false;
      this.mode = 'in-memory';
      const diagnosed = this.diagnoseError(err);
      this.connectionError = diagnosed.error;
      this.likelyCause = diagnosed.likelyCause;
      this.lastChecked = new Date();
      return false;
    } finally {
      this.isTesting = false;
    }
  }

  /**
   * Initializes database connection with graceful retry and environment-aware fallback.
   */
  public async initializeDatabase(): Promise<boolean> {
    const validation = validateDatabaseUrl(env.DATABASE_URL);

    // 1. Validation check
    if (!validation.isValid) {
      console.warn('====================================================');
      console.warn('❌ DATABASE_URL Configuration Error:');
      console.warn(`   ${validation.error}`);
      console.warn('   Expected format:');
      console.warn('     Local: mongodb://localhost:27017/finquest');
      console.warn('     Atlas: mongodb+srv://<username>:<password>@<cluster>.mongodb.net/finquest?retryWrites=true&w=majority');
      console.warn(`   Current URL (masked): ${validation.maskedUrl}`);

      if (env.NODE_ENV === 'production') {
        console.error('🛑 Fatal: Invalid DATABASE_URL in production environment.');
        throw new Error(`Invalid DATABASE_URL configuration: ${validation.error}`);
      }

      console.warn('⚠️  Activating In-Memory Data Store as safe development fallback.');
      console.warn('====================================================');
      this.connected = false;
      this.mode = 'in-memory';
      this.connectionError = validation.error || 'Invalid DATABASE_URL';
      this.likelyCause = 'Malformed DATABASE_URL';
      this.lastChecked = new Date();
      return false;
    }

    if (validation.hasUnencodedCharacters) {
      console.warn('⚠️  Warning: Password contains special characters (@, :, /, ?, #, %, &) that may need URL encoding.');
    }

    // 2. Connect client and run ping with 1 bounded retry
    let success = false;
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await prisma.$connect();
        success = await this.testDatabaseConnection(2500);
        if (success) {
          break;
        }
      } catch (err: any) {
        const diagnosed = this.diagnoseError(err);
        this.connectionError = diagnosed.error;
        this.likelyCause = diagnosed.likelyCause;
      }

      if (!success && attempt < maxAttempts) {
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    // 3. Report state based on outcome and environment
    if (success) {
      console.log(`✅ Database: ${validation.isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'} connected`);
      console.log('💾 Persistence: ENABLED');
      console.log(`📍 Target: ${validation.maskedUrl}`);
      return true;
    }

    // Connection failed
    const errorReason = this.connectionError || 'Connection refused or timed out';

    if (env.NODE_ENV === 'production') {
      console.error('====================================================');
      console.error('❌ Database: Production MongoDB connection failed!');
      console.error(`   Target: ${validation.maskedUrl}`);
      console.error(`   Reason: ${errorReason}`);
      console.error('🛑 Halting startup to prevent data loss in production.');
      console.error('====================================================');
      throw new Error(`Production MongoDB connection failed: ${errorReason}`);
    }

    console.warn(`⚠️  Database: ${validation.isAtlas ? 'MongoDB Atlas' : 'Local MongoDB'} unavailable`);
    console.log('📦 In-Memory Data Store is ACTIVE');
    console.log('💡 Persistence is disabled until MongoDB becomes available.');
    console.log(`📍 Target: ${validation.maskedUrl}`);

    if (validation.isAtlas) {
      console.log('\n🔎 Likely causes:');
      console.log('   • Atlas IP access list does not allow this machine (most common)');
      console.log('   • Atlas cluster is paused or in maintenance');
      console.log('   • Database credentials invalid or unencoded special characters');
      console.log('   • Local firewall, VPN, or network restrictions blocking port 27017');
      console.log('💡 Fix: In MongoDB Atlas → Network Access → Add IP Address (Allow current IP or 0.0.0.0/0)');
    } else {
      console.log('\n🔎 Likely causes:');
      console.log('   • Local MongoDB service is not started (run "net start MongoDB")');
      console.log('   • MongoDB Community Edition is not installed locally');
      console.log('💡 Tip: Start local MongoDB or configure MongoDB Atlas in backend/.env');
    }

    return false;
  }

  public async disconnectDatabase(): Promise<void> {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors on shutdown
    } finally {
      this.connected = false;
      this.mode = 'in-memory';
    }
  }

  private diagnoseError(err: any): { error: string; likelyCause: string } {
    const message = err?.message || String(err || '');

    // TLS Alert / IP Whitelist rejection
    if (message.includes('fatal alert: InternalError') || message.includes('alert number 80')) {
      return {
        error: 'MongoDB Atlas rejected TLS handshake (fatal alert: InternalError).',
        likelyCause: 'Atlas Network Access (IP Whitelist) is blocking your IP address. Add your IP in Atlas dashboard.',
      };
    }

    // Local connection refused
    if (message.includes('10061') || message.includes('ECONNREFUSED') || message.includes('actively refused')) {
      return {
        error: 'Connection refused at localhost:27017.',
        likelyCause: 'Local MongoDB service is not running on port 27017.',
      };
    }

    // Authentication failure
    if (message.includes('Authentication failed') || message.includes('auth error') || message.includes('bad auth')) {
      return {
        error: 'MongoDB user authentication failed.',
        likelyCause: 'Invalid username or password in DATABASE_URL. Check credentials in backend/.env.',
      };
    }

    // Timeout
    if (message.includes('timed out') || message.includes('Server selection timeout')) {
      return {
        error: 'Server selection timed out.',
        likelyCause: 'Atlas cluster not reachable. Verify Atlas Network Access IP whitelist or cluster status.',
      };
    }

    // DNS failure
    if (message.includes('ENOTFOUND') || message.includes('getaddrinfo')) {
      return {
        error: 'DNS/SRV resolution failed for cluster hostname.',
        likelyCause: 'Cluster hostname could not be resolved. Check internet connection and DNS settings.',
      };
    }

    return {
      error: message.split('\n')[0].substring(0, 150),
      likelyCause: 'Unknown database error',
    };
  }
}

export const databaseManager = new DatabaseManager();
export default databaseManager;
