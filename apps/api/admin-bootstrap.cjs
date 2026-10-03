// Explicit maintenance only. Run from apps/api with node --env-file=.env admin-bootstrap.cjs.
// Never run in API startup or CI. Never prints credentials or owner subject.
const fs=require('node:fs/promises');
const {createHash,randomBytes,randomUUID}=require('node:crypto');
const {createDatabasePool}=require('./dist/database.js');
async function run(){
  const identity=JSON.parse(await fs.readFile('.env.admin-identity','utf8'));
  if(identity.project!=='cootton-firebase'||typeof identity.subject!=='string'||!identity.subject||identity.subject.length>128)throw Error('IDENTITY_REQUIRED');
  const sql=await fs.readFile('migrations/002_admin_catalog.sql','utf8');
  const digest=createHash('sha256').update(sql.replace(/\r\n/g,'\n')).digest('hex');
  const baseline=await fs.readFile('migrations/001_catalog_read.sql','utf8');
  const baselineDigest=createHash('sha256').update(baseline.replace(/\r\n/g,'\n')).digest('hex');
  const pool=createDatabasePool();let client;
  try{
    client=await pool.connect();await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(734910021)');
    const previous=(await client.query("SELECT digest FROM catalog_read.schema_migration WHERE version='001'")).rows[0];
    if(previous?.digest!==baselineDigest)throw Error('BASELINE_DRIFT');
    const applied=(await client.query("SELECT digest FROM catalog_read.schema_migration WHERE version='002'")).rows[0];
    if(applied){
      if(applied.digest!==digest)throw Error('MIGRATION_DRIFT');
      const principal=(await client.query('SELECT 1 FROM catalog_core.principal WHERE project=$1 AND subject=$2 AND active',[identity.project,identity.subject])).rowCount;
      if(!principal)throw Error('OWNER_MAPPING_MISMATCH');
      await fs.access('.env.admin');await client.query('ROLLBACK');console.log('ADMIN_BOOTSTRAP_ALREADY_APPLIED');return;
    }
    if((await client.query("SELECT to_regnamespace('catalog_core') IS NOT NULL AS exists")).rows[0].exists)throw Error('UNKNOWN_CANONICAL_SCHEMA');
    if((await client.query("SELECT 1 FROM pg_roles WHERE rolname='cootton_catalog_admin'")).rowCount)throw Error('UNKNOWN_RUNTIME_ROLE');
    const password=randomBytes(32).toString('hex');const runtime=new URL(process.env.DATABASE_URL);
    runtime.username='cootton_catalog_admin';runtime.password=password;
    const reader=await fs.readFile('.env.catalog','utf8');
    if(!reader.startsWith('DATABASE_URL=')||reader.includes('ADMIN_DATABASE_URL='))throw Error('READER_CONFIG_INVALID');
    await fs.writeFile('.env.admin',reader.trim()+'\nADMIN_DATABASE_URL='+runtime.toString()+'\nFIREBASE_PROJECT_ID=cootton-firebase\n',{flag:'wx',mode:0o600});
    await client.query(sql);
    await client.query(`CREATE ROLE cootton_catalog_admin LOGIN PASSWORD '${password}' NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION`);
    await client.query('GRANT USAGE ON SCHEMA catalog_core,catalog_read TO cootton_catalog_admin');
    await client.query('GRANT SELECT ON catalog_core.principal,catalog_core.seller,catalog_core.dictionary,catalog_core.evidence,catalog_core.product,catalog_core.command TO cootton_catalog_admin');
    await client.query('GRANT INSERT ON catalog_core.product,catalog_core.audit,catalog_core.command,catalog_core.outbox TO cootton_catalog_admin');
    await client.query('GRANT UPDATE(title,description,care,category_id,brand_id,form_id,country_id,origin_evidence_id,care_evidence_id,lifecycle,version,updated_at) ON catalog_core.product TO cootton_catalog_admin');
    await client.query('GRANT SELECT(id), UPDATE(b2c_eligible,b2b_eligible) ON catalog_read.public_product TO cootton_catalog_admin');
    await client.query('ALTER ROLE cootton_catalog_admin SET statement_timeout=10000');
    await client.query('ALTER ROLE cootton_catalog_admin SET idle_in_transaction_session_timeout=15000');
    await client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[identity.project+':'+identity.subject]);
    const actor=randomUUID();
    await client.query('INSERT INTO catalog_core.principal(id,project,subject,active) VALUES($1,$2,$3,true)',[actor,identity.project,identity.subject]);
    const seller=randomUUID();
    await client.query("INSERT INTO catalog_core.seller(id,name,source,active,b2c_enabled,b2b_enabled) VALUES($1,'Cootton','Owner-approved single Cootton seller; all commerce remains inactive',true,false,false)",[seller]);
    await client.query("INSERT INTO catalog_core.audit(id,actor_id,action,resource_id,version) VALUES($1,$2,'OWNER_APPROVED_CATALOG_BOOTSTRAP',$2,1)",[randomUUID(),actor]);
    await client.query("INSERT INTO catalog_read.schema_migration(version,digest) VALUES('002',$1)",[digest]);
    await client.query('COMMIT');
    console.log(JSON.stringify({migration:'002',digest,activeCatalogAdmins:1,seededProducts:0,commerceEnabled:false}));
  }catch(error){if(client)try{await client.query('ROLLBACK');}catch{}throw error;}
  finally{client?.release();await pool.end();}
}
run().catch(()=>{console.error('ADMIN_BOOTSTRAP_INCOMPLETE_RECONCILE_MIGRATION_AND_PRIVATE_CONFIG');process.exitCode=1;});
