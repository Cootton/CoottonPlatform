import { Pool } from 'pg';

/** Backend-only connection. Never log the URL or pass it to a browser client. */
export function createDatabasePool(connectionString: string | undefined = process.env.DATABASE_URL): Pool {
  let url: URL;
  try { url = new URL(connectionString ?? ''); }
  catch { throw new Error('DATABASE_CONFIG_INVALID'); }
  if (!['postgres:', 'postgresql:'].includes(url.protocol)
    || !url.hostname.endsWith('.neon.tech') || !url.hostname.includes('-pooler.')
    || !url.username || !url.password || url.pathname !== '/cootton'
    || (url.port && url.port !== '5432') || url.hash) {
    throw new Error('DATABASE_CONFIG_INVALID');
  }
  // pg connection-string SSL options override ssl objects. Parse individual
  // fields instead so URL query parameters cannot weaken certificate validation.
  const pool = new Pool({
    host: url.hostname, port: 5432, database: 'cootton',
    user: decodeURIComponent(url.username), password: decodeURIComponent(url.password),
    ssl: { rejectUnauthorized: true, minVersion: 'TLSv1.2' },
    enableChannelBinding: true,
    max: 5, min: 0, connectionTimeoutMillis: 15000, idleTimeoutMillis: 30000,
    statement_timeout: 10000, query_timeout: 12000,
    application_name: 'cootton-api',
  });
  pool.on('error', () => { console.error('DATABASE_IDLE_CONNECTION_FAILED'); });
  return pool;
}
