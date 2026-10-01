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
}

export interface UrlValidationResult {
  isValid: boolean;
  error?: string;
  maskedUrl: string;
  isAtlas: boolean;
  host: string;
  databaseName: string;
}

/**
 * Safely masks user credentials in a database connection URL.
 * Never exposes real passwords in logs or health endpoints.
 */
export function maskDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return '[Not Configured]';
  }
  // Matches mongodb://user:pass@host or mongodb+srv://user:pass@host or generic user:pass@host
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
    };
  }

  // Extract host and database name safely
  let host = 'localhost:27017';
  let databaseName = 'finquest';

  try {
    const afterProtocol = url.replace(/^mongodb(\+srv)?:\/\//, '');
    const withoutCreds = afterProtocol.includes('@')
      ? afterProtocol.split('@')[1]
      : afterProtocol;
    const [hostPort, pathAndQuery] = withoutCreds.split('/');
    if (hostPort) {
      host = hostPort.split('?')[0];
    }
    if (pathAndQuery) {
      databaseName = pathAndQuery.split('?')[0] || 'finquest';
    }
  } catch {
    // Graceful fallback if URL parsing has unexpected format
  }

  return {
    isValid: true,
    maskedUrl: masked,
    isAtlas,
    host,
    databaseName,
  };
}

class DatabaseManager {
  private connected: boolean = false;
  private mode: 'persistent' | 'in-memory' = 'in-memory';
  private lastChecked: Date | null = null;
  private connectionError: string | null = null;
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
      this.lastChecked = new Date();
      return true;
    } catch (err: any) {
      this.connected = false;
      this.mode = 'in-memory';
      this.connectionError = this.diagnoseError(err);
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
      this.lastChecked = new Date();
      return false;
    }

    // 2. Connect client and run ping with 1 retry
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
        this.connectionError = this.diagnoseError(err);
      }

      if (!success && attempt < maxAttempts) {
        // Short pause before second attempt
        await new Promise((res) => setTimeout(res, 300));
      }
    }

    // 3. Report state based on outcome and environment
    if (success) {
      console.log('✅ Database: MongoDB connected');
      console.log('💾 Persistence: ENABLED');
      console.log(`📍 Mode: ${validation.isAtlas ? 'MongoDB Atlas (Cloud)' : 'Local MongoDB'}`);
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

    console.warn(`⚠️  Database: MongoDB unavailable (${errorReason})`);
    console.log('📦 In-Memory Data Store is ACTIVE');
    console.log('💡 Persistence is disabled until MongoDB becomes available.');
    console.log(`📍 Target: ${validation.maskedUrl}`);

    if (!validation.isAtlas) {
      console.log('💡 Tip: Start local MongoDB service ("net start MongoDB") or configure Atlas in backend/.env');
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

  private diagnoseError(err: any): string {
    const message = err?.message || String(err || '');
    if (message.includes('10061') || message.includes('ECONNREFUSED') || message.includes('actively refused')) {
      return 'Connection refused at localhost:27017. MongoDB server is not running.';
    }
    if (message.includes('Authentication failed') || message.includes('auth error')) {
      return 'Authentication failed. Check username and password in DATABASE_URL.';
    }
    if (message.includes('timed out') || message.includes('Server selection timeout')) {
      return 'Server selection timed out. Verify network connectivity or Atlas IP access list.';
    }
    if (message.includes('getaddrinfo ENOTFOUND')) {
      return 'Host could not be resolved. Check cluster address.';
    }
    return message.split('\n')[0].substring(0, 150);
  }
}

export const databaseManager = new DatabaseManager();
export default databaseManager;
