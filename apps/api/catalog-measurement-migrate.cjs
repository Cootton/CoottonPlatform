// Explicit maintenance only; never run on startup or in production from CI.
const fs=require('node:fs/promises');const {createHash}=require('node:crypto');const {createDatabasePool}=require('./dist/database');
async function run(){const pool=createDatabasePool();let db;try{
 db=await pool.connect();await db.query('BEGIN');await db.query('SELECT pg_advisory_xact_lock(734910021)');
 const files=['001_catalog_read.sql','002_admin_catalog.sql','003_product_intake.sql','004_product_media.sql','005_catalog_publication.sql','006_catalog_measurement_visibility.sql'];
 for(const file of files){const version=file.slice(0,3),sql=await fs.readFile('migrations/'+file,'utf8'),digest=createHash('sha256').update(sql.replace(/\r\n/g,'\n')).digest('hex');
  const row=(await db.query('SELECT digest FROM catalog_read.schema_migration WHERE version=$1',[version])).rows[0];
  if(row){if(row.digest!==digest)throw Error('MIGRATION_DRIFT');}
  else if(version!=='006')throw Error('BASELINE_REQUIRED');
  else{await db.query(sql);await db.query('INSERT INTO catalog_read.schema_migration(version,digest) VALUES($1,$2)',[version,digest]);}
 }
 await db.query('COMMIT');console.log('CATALOG_MEASUREMENT006_VERIFIED');
}catch(e){if(db)await db.query('ROLLBACK').catch(()=>{});throw e;}finally{db?.release();await pool.end();}}
run().catch(()=>{console.error('CATALOG_MEASUREMENT_MIGRATION_FAILED_RECONCILE_BEFORE_RETRY');process.exitCode=1;});
