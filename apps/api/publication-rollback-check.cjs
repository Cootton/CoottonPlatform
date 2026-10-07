// Run only under approved maintenance scope. All DDL/data changes roll back.
const fs=require('node:fs/promises'),assert=require('node:assert/strict');
const {createDatabasePool}=require('./dist/database');
(async()=>{const pool=createDatabasePool();let db;try{
 db=await pool.connect();await db.query('BEGIN');await db.query("SET LOCAL lock_timeout='3s'");
 const already=Boolean((await db.query("SELECT to_regclass('catalog_core.publication') AS t")).rows[0].t);
 if(!already)await db.query(await fs.readFile('migrations/005_catalog_publication.sql','utf8'));
 for(const t of ['product_review','publication'])assert.equal((await db.query("SELECT has_table_privilege('cootton_catalog_admin',$1,'DELETE') AS v",['catalog_core.'+t])).rows[0].v,false);
 assert.equal((await db.query("SELECT has_table_privilege('cootton_catalog_admin','catalog_core.product_review','UPDATE') AS v")).rows[0].v,false);
 for(const t of ['visible_product','visible_sku','visible_media','visible_size_chart']){
  await db.query('SET LOCAL ROLE cootton_catalog_reader');await db.query('SELECT * FROM catalog_read.'+t+' LIMIT 1');await db.query('RESET ROLE');
 }
 assert.equal((await db.query("SELECT has_table_privilege('cootton_catalog_reader','catalog_core.product_review','SELECT') AS v")).rows[0].v,false);
 await db.query('ROLLBACK');
 assert.equal(Boolean((await db.query("SELECT to_regclass('catalog_core.publication') AS t")).rows[0].t),already);
 console.log('PUBLICATION005_VIEW_COMPATIBILITY_AND_SCOPED_ROLES_PASSED_ALL_CHANGES_ROLLED_BACK');
}finally{if(db)await db.query('ROLLBACK').catch(()=>{});db?.release();await pool.end();}})().catch(e=>{console.error('PUBLICATION005_ROLLBACK_CHECK_FAILED',e.code||e.name);process.exitCode=1;});
