import { createHash, randomBytes } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { createDatabasePool } from './database';

async function migrate(): Promise<void> {
  const sql = await readFile('migrations/001_catalog_read.sql', 'utf8');
  const digest = createHash('sha256').update(sql.replace(/\r\n/g, '\n')).digest('hex');
  const pool = createDatabasePool();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query("SELECT pg_advisory_xact_lock(734910021)");
      const existing = await client.query<{exists: boolean}>("SELECT to_regclass('catalog_read.schema_migration') IS NOT NULL AS exists");
      if (existing.rows[0]?.exists) {
        const previous = await client.query<{digest: string}>("SELECT digest FROM catalog_read.schema_migration WHERE version='001'");
        if (previous.rows[0]?.digest !== digest) throw new Error('MIGRATION_DRIFT');
        await client.query('ROLLBACK');
        console.log('CATALOG_MIGRATION_ALREADY_APPLIED');
        return;
      }
      const inventory = await client.query<{count: string}>(
        "SELECT count(*)::text FROM pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema')");
      if (inventory.rows[0]?.count !== '0') throw new Error('NONEMPTY_DATABASE_REQUIRES_BACKUP_REVIEW');
      const password = randomBytes(32).toString('hex');
      const runtime = new URL(process.env.DATABASE_URL!);
      runtime.username = 'cootton_catalog_reader'; runtime.password = password;
      // wx prevents replacing an existing credential. This file is ignored and never printed.
      await writeFile('.env.catalog', `DATABASE_URL=${runtime.toString()}\n`, {flag: 'wx', mode: 0o600});
      await client.query(sql);
      await client.query(`CREATE ROLE cootton_catalog_reader LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
      await client.query('GRANT USAGE ON SCHEMA catalog_read TO cootton_catalog_reader');
      await client.query('GRANT SELECT ON catalog_read.visible_product,catalog_read.visible_sku TO cootton_catalog_reader');
      await client.query('ALTER ROLE cootton_catalog_reader SET default_transaction_read_only=on');
      await client.query('ALTER ROLE cootton_catalog_reader SET statement_timeout=10000');
      await client.query("INSERT INTO catalog_read.schema_migration(version,digest) VALUES('001',$1)", [digest]);
      await client.query('COMMIT');
      console.log(JSON.stringify({migration:'001', digest, baselineUserTables:0, seededProducts:0, runtime:'read-only public views'}));
    } catch (error) {
      // A transport failure during COMMIT is ambiguous: retain credential for reconciliation.
      try { await client.query('ROLLBACK'); } catch { /* Reconcile using migration record, never rerun blindly. */ }
      throw error;
    } finally { client.release(); }
  } finally { await pool.end(); }
}
migrate().catch(() => {
  // Keep private credential if DB result is uncertain; never print driver/SQL details.
  console.error('CATALOG_MIGRATION_FAILED_REVIEW_REQUIRED'); process.exitCode=1;
});
