import { createDatabasePool } from './database';

async function inspect(): Promise<void> {
  const pool = createDatabasePool();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const tables = await client.query<{schema: string; name: string}>(
        `SELECT schemaname AS schema, tablename AS name FROM pg_tables
         WHERE schemaname NOT IN ('pg_catalog','information_schema') ORDER BY 1,2`);
      const roles = await client.query<{exists: boolean}>(
        "SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname='cootton_catalog_reader') AS exists");
      console.log(JSON.stringify({tables: tables.rows, readerExists: roles.rows[0]?.exists}));
      await client.query('ROLLBACK');
    } finally { client.release(); }
  } finally { await pool.end(); }
}
inspect().catch(() => { console.error('CATALOG_INSPECTION_FAILED'); process.exitCode=1; });
