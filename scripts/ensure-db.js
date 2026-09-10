#!/usr/bin/env node
/**
 * Best-effort check that Postgres is reachable before starting the backend.
 * On Windows, tries to start the local Postgres service if it's stopped.
 * Never blocks `npm run dev` — just prints guidance if the DB can't be reached.
 */
const fs = require('fs');
const net = require('net');
const path = require('path');
const { execSync } = require('child_process');

const WIN_SERVICE_NAME = 'postgresql-x64-17';

function readDatabaseUrl() {
  const envPath = path.join(__dirname, '..', 'backend', '.env');
  if (!fs.existsSync(envPath)) return null;
  const content = fs.readFileSync(envPath, 'utf8');
  const match = content.match(/^DATABASE_URL\s*=\s*"?([^"\n]+)"?/m);
  return match ? match[1] : null;
}

function parseHostPort(databaseUrl) {
  try {
    const url = new URL(databaseUrl);
    return { host: url.hostname || 'localhost', port: Number(url.port) || 5432 };
  } catch {
    return { host: 'localhost', port: 5432 };
  }
}

function checkPort(host, port, timeoutMs) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const done = (ok) => {
      socket.destroy();
      resolve(ok);
    };
    socket.setTimeout(timeoutMs);
    socket.once('connect', () => done(true));
    socket.once('timeout', () => done(false));
    socket.once('error', () => done(false));
  });
}

function tryStartWindowsService() {
  try {
    execSync(`net start "${WIN_SERVICE_NAME}"`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const databaseUrl = readDatabaseUrl();
  const { host, port } = parseHostPort(databaseUrl || 'postgresql://localhost:5432');

  let reachable = await checkPort(host, port, 1000);

  if (!reachable && process.platform === 'win32') {
    console.log(`[db] Postgres not reachable on ${host}:${port}, trying to start "${WIN_SERVICE_NAME}"...`);
    tryStartWindowsService();
    for (let i = 0; i < 10 && !reachable; i++) {
      await new Promise((r) => setTimeout(r, 500));
      reachable = await checkPort(host, port, 1000);
    }
  }

  if (reachable) {
    console.log(`[db] Postgres is up on ${host}:${port}`);
  } else {
    console.warn(
      `[db] Could not confirm Postgres is running on ${host}:${port}.\n` +
        `     Start it manually (e.g. "net start ${WIN_SERVICE_NAME}" as Administrator) if the backend fails to connect.`
    );
  }
}

main();
