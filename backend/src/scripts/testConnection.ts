import * as dns from 'dns';
import * as net from 'net';
import * as tls from 'tls';
import prisma from '../config/prisma';
import { validateDatabaseUrl } from '../config/database';
import { env } from '../config/env';

async function testDns(host: string): Promise<{ ok: boolean; message: string; srvHosts: string[] }> {
  const srvDomain = `_mongodb._tcp.${host}`;
  const srvHosts: string[] = [];

  try {
    const addresses = await dns.promises.resolveSrv(srvDomain);
    addresses.forEach((a) => srvHosts.push(a.name));
    return {
      ok: true,
      message: `SRV resolved ${addresses.length} replica set host(s)`,
      srvHosts,
    };
  } catch (err: any) {
    // If not SRV, try regular A/AAAA record
    try {
      const a = await dns.promises.lookup(host);
      return {
        ok: true,
        message: `Direct hostname resolved to ${a.address}`,
        srvHosts: [host],
      };
    } catch (e: any) {
      return {
        ok: false,
        message: `DNS resolution failed: ${err.message}`,
        srvHosts: [],
      };
    }
  }
}

async function testTcp(host: string, port: number = 27017, timeoutMs = 3000): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let settled = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: true, message: `TCP connection to ${host}:${port} succeeded` });
      }
    });

    socket.on('timeout', () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, message: `TCP connection to ${host}:${port} timed out after ${timeoutMs}ms` });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, message: `TCP connection to ${host}:${port} failed: ${err.message}` });
      }
    });

    socket.connect(port, host);
  });
}

async function testTls(host: string, port: number = 27017, timeoutMs = 4000): Promise<{ ok: boolean; message: string; isIpBlocked: boolean }> {
  return new Promise((resolve) => {
    let settled = false;

    const socket = tls.connect(port, host, { servername: host }, () => {
      if (!settled) {
        settled = true;
        socket.end();
        resolve({ ok: true, message: `TLS Handshake with ${host}:${port} succeeded`, isIpBlocked: false });
      }
    });

    socket.setTimeout(timeoutMs, () => {
      if (!settled) {
        settled = true;
        socket.destroy();
        resolve({ ok: false, message: `TLS Handshake timed out after ${timeoutMs}ms`, isIpBlocked: false });
      }
    });

    socket.on('error', (err) => {
      if (!settled) {
        settled = true;
        const msg = err.message || '';
        const isIpBlocked = msg.includes('alert internal error') || msg.includes('alert number 80');
        resolve({
          ok: false,
          message: isIpBlocked
            ? `TLS Alert 80 (InternalError): MongoDB Atlas rejected connection. This machine's IP is not in Atlas Network Access.`
            : `TLS Error: ${msg}`,
          isIpBlocked,
        });
      }
    });
  });
}

async function runDiagnostic() {
  console.log('====================================================');
  console.log('🔍 FINQUEST DATABASE SAFE CONNECTIVITY DIAGNOSTIC');
  console.log('====================================================');

  const validation = validateDatabaseUrl(env.DATABASE_URL);
  console.log(`🔗 Target (Masked): ${validation.maskedUrl}`);
  console.log(`🌐 Host: ${validation.host}`);
  console.log(`🗄️ Database: ${validation.databaseName}`);
  console.log(`☁️ Is Atlas: ${validation.isAtlas}`);

  if (!validation.isValid) {
    console.error(`❌ Validation Error: ${validation.error}`);
    process.exit(1);
  }

  // Step 1: DNS / SRV
  console.log('\n[1/4] Checking DNS / SRV resolution...');
  const dnsResult = await testDns(validation.host);
  if (dnsResult.ok) {
    console.log(`✅ DNS OK: ${dnsResult.message}`);
  } else {
    console.error(`❌ DNS Failed: ${dnsResult.message}`);
  }

  const targetHost = dnsResult.srvHosts[0] || validation.host;

  // Step 2: TCP Reachability
  console.log(`\n[2/4] Testing TCP reachability to ${targetHost}:27017...`);
  const tcpResult = await testTcp(targetHost, 27017, 3000);
  if (tcpResult.ok) {
    console.log(`✅ TCP OK: ${tcpResult.message}`);
  } else {
    console.warn(`⚠️ TCP Warning: ${tcpResult.message}`);
  }

  // Step 3: TLS Handshake (for Atlas)
  if (validation.isAtlas) {
    console.log(`\n[3/4] Testing TLS handshake to ${targetHost}:27017...`);
    const tlsResult = await testTls(targetHost, 27017, 4000);
    if (tlsResult.ok) {
      console.log(`✅ TLS OK: ${tlsResult.message}`);
    } else {
      console.warn(`⚠️ TLS Handshake Warning: ${tlsResult.message}`);
      if (tlsResult.isIpBlocked) {
        console.log('\n🛑 ROOT CAUSE CONFIRMED:');
        console.log('   MongoDB Atlas refused the TLS handshake (fatal alert 80).');
        console.log('   Your current IP address is not whitelisted in the MongoDB Atlas project.');
        console.log('👉 ACTION REQUIRED:');
        console.log('   1. Go to cloud.mongodb.com → Security → Network Access');
        console.log('   2. Click "Add IP Address"');
        console.log('   3. Add your current IP or allow 0.0.0.0/0 for development');
      }
    }
  } else {
    console.log('\n[3/4] Skipping TLS handshake (Local MongoDB mode)');
  }

  // Step 4: Prisma Connection & Ping
  console.log('\n[4/4] Executing Prisma { ping: 1 } via Prisma Client...');
  const startPing = Date.now();
  try {
    await prisma.$connect();
    const result = await Promise.race([
      prisma.$runCommandRaw({ ping: 1 }),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Prisma ping timeout after 4000ms')), 4000)),
    ]);
    console.log(`✅ Prisma Ping SUCCEEDED in ${Date.now() - startPing}ms!`);
    console.log('📄 Response:', JSON.stringify(result));
    console.log('\n🎉 Persistence is FULLY OPERATIONAL!');
  } catch (err: any) {
    console.warn(`⚠️ Prisma Ping did not complete (${Date.now() - startPing}ms):`, err?.message || err);
    console.log('📦 The FinQuest server will use the safe In-Memory Data Store fallback.');
  } finally {
    await prisma.$disconnect();
    console.log('\n====================================================');
  }
}

runDiagnostic().catch((e) => {
  console.error('Fatal diagnostic script error:', e);
  process.exit(1);
});
