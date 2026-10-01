import { createDatabasePool } from './database';

async function check(): Promise<void> {
  const pool = createDatabasePool();
  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN READ ONLY');
      const result = await client.query<{ value: number }>('SELECT 1 AS value');
      if (result.rowCount !== 1 || result.rows[0]?.value !== 1) {
        throw new Error('DATABASE_CHECK_INVALID');
      }
      await client.query('ROLLBACK');
      console.log(JSON.stringify({ status: 'connected', query: 'SELECT 1', value: 1,
        readOnly: true, tlsCertificateValidation: true }));
    } finally { client.release(true); }
  } finally { await pool.end(); }
}

check().catch(() => {
  // Driver errors may contain credentials, SQL or server details. Keep them private.
  console.error('DATABASE_CHECK_FAILED');
  process.exitCode = 1;
});
