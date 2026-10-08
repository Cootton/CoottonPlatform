const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs/promises');const path=require('node:path');const {randomUUID}=require('node:crypto');const {Client}=require('pg');
const {publicationFacts,publicSnapshot}=require('../dist/catalog-publication');const {CatalogRepository}=require('../dist/catalog');const {MemoryCache}=require('../dist/memory-cache');
test('006 guards legacy and new publication snapshots on cold and cached reads',async()=>{
 const url=new URL(process.env.COOTTON_TEST_DATABASE_URL??'');
 // Refuse every production/non-loopback destination before connecting or applying DDL.
 assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));assert.equal(url.pathname,'/cootton_api_test');
 const db=new Client({connectionString:url.toString()});await db.connect();
 try{
  await db.query('BEGIN');await db.query('CREATE ROLE cootton_catalog_admin NOLOGIN');await db.query('CREATE ROLE cootton_catalog_reader NOLOGIN');
  for(const file of ['001_catalog_read.sql','002_admin_catalog.sql','003_product_intake.sql','004_product_media.sql','005_catalog_publication.sql'])await db.query(await fs.readFile(path.join(__dirname,'../migrations',file),'utf8'));
  await db.query('GRANT USAGE ON SCHEMA catalog_read TO cootton_catalog_reader');await db.query('GRANT SELECT ON catalog_read.visible_product,catalog_read.visible_sku TO cootton_catalog_reader');
  const actor=randomUUID(),seller=randomUUID(),product=randomUUID(),evidence=randomUUID(),sku=randomUUID(),asset=randomUUID();
  await db.query("INSERT INTO catalog_core.principal(id,project,subject,active) VALUES($1,'cootton-firebase','synthetic-ci-principal',true)",[actor]);
  await db.query("INSERT INTO catalog_core.seller(id,name,source,active) VALUES($1,'Synthetic CI seller','Local fixture only',true)",[seller]);
  async function dictionary(kind,code){let d=(await db.query('SELECT id FROM catalog_core.dictionary WHERE kind=$1 AND code=$2',[kind,code])).rows[0];if(!d){d={id:randomUUID()};await db.query('INSERT INTO catalog_core.dictionary(id,kind,code,token,label,source) VALUES($1,$2,$3,$3,$3,$4)',[d.id,kind,code,'Synthetic CI definition']);}return d.id;}
  const category=await dictionary('CATEGORY','CREWNECK_TSHIRT'),brand=await dictionary('BRAND','COOTTON'),form=await dictionary('FORM','BOXY'),country=await dictionary('COUNTRY','VN'),size=await dictionary('SIZE','S'),color=await dictionary('COLOR','BLACK'),measurement=await dictionary('MEASUREMENT','BODY_LENGTH');
  await db.query('INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,$3,$4)',[evidence,seller,'Synthetic fixture; not a real product',actor]);
  await db.query(`INSERT INTO catalog_core.product(id,seller_id,model_token,title,description,care,category_id,brand_id,form_id,country_id,origin_evidence_id,care_evidence_id,lifecycle,version) VALUES($1,$2,'TEST','CI product','Synthetic fixture','CI care',$3,$4,$5,$6,$7,$7,'APPROVED',3)`,[product,seller,category,brand,form,country,evidence]);
  await db.query("INSERT INTO catalog_core.fabric(id,product_id,role,description,source_id,gsm_kind) VALUES($1,$2,'MAIN','Cotton',$3,'UNKNOWN')",[randomUUID(),product,evidence]);
  await db.query('INSERT INTO catalog_core.sku(id,product_id,seller_id,color_id,size_id,code) VALUES($1,$2,$3,$4,$5,$6)',[sku,product,seller,color,size,'S-M-BLK-S']);
  await db.query('INSERT INTO catalog_core.size_chart(product_id,size_id,measurement_id,value_cm,source_id) VALUES($1,$2,$3,66,$4)',[product,size,measurement,evidence]);
  const mediaPath='/media/'+asset+'/'+'a'.repeat(64)+'.webp';
  await db.query('INSERT INTO catalog_core.asset(id,seller_id,path,sha256,width,height,rights_evidence_id) VALUES($1,$2,$3,$4,450,450,$5)',[asset,seller,mediaPath,'a'.repeat(64),evidence]);
  await db.query('INSERT INTO catalog_core.product_media(product_id,asset_id,position,alt) VALUES($1,$2,1,$3)',[product,asset,'Synthetic image']);
  const facts=await publicationFacts(db,(await db.query('SELECT * FROM catalog_core.product WHERE id=$1',[product])).rows[0]);
  const legacy=publicSnapshot(facts,'3');legacy.dictionaryIds=legacy.dictionaryIds.filter(id=>id!==measurement);
  const review=randomUUID();await db.query('INSERT INTO catalog_core.product_review(id,product_id,product_version,actor_id,declaration,snapshot) VALUES($1,$2,2,$3,$4,$5)',[review,product,actor,'Synthetic legacy reviewed snapshot',JSON.stringify({...legacy,product:{...legacy.product,version:'2'}})]);
  await db.query('INSERT INTO catalog_core.publication(product_id,review_id,source_version,visible,snapshot) VALUES($1,$2,3,true,$3)',[product,review,JSON.stringify(legacy)]);
  // Show the original bug under 005, then apply only the new migration.
  await db.query('UPDATE catalog_core.dictionary SET active=false WHERE id=$1',[measurement]);
  assert.equal((await db.query('SELECT * FROM catalog_read.visible_product')).rowCount,1);
  await db.query(await fs.readFile(path.join(__dirname,'../migrations/006_catalog_measurement_visibility.sql'),'utf8'));
  const cache=new MemoryCache();const repository=new CatalogRepository(cache);
  repository.database=()=>({query:(...args)=>db.query(...args)}); // local test DB, never runtime connection
  async function expectVisible(visible){
   await db.query('SET LOCAL ROLE cootton_catalog_reader');
   try{for(const view of ['visible_product','visible_sku','visible_media','visible_size_chart'])assert.equal((await db.query('SELECT * FROM catalog_read.'+view)).rowCount,visible?1:0);}
   finally{await db.query('RESET ROLE');}
   if(visible){assert.equal((await repository.detail(product,{})).chart.length,1);assert.equal((await repository.list({})).items.length,1);}
   else{await assert.rejects(repository.detail(product,{}),e=>e.getStatus()===404);assert.equal((await repository.list({})).items.length,0);await assert.rejects(repository.image(asset,'a'.repeat(64)+'.webp'),e=>e.getStatus()===404);}
  }
  process.env.COOTTON_PUBLICATION_ENABLED='true';
  await expectVisible(false);await db.query('UPDATE catalog_core.dictionary SET active=true WHERE id=$1',[measurement]);cache.invalidate();await expectVisible(true);
  // Populate detail/list cache, revoke without a product version bump, fail closed.
  await db.query('UPDATE catalog_core.dictionary SET active=false WHERE id=$1',[measurement]);await expectVisible(false);
  cache.invalidate();await expectVisible(false);await db.query('UPDATE catalog_core.dictionary SET active=true WHERE id=$1',[measurement]);cache.invalidate();await expectVisible(true);
  // New snapshot also includes measurement IDs; old review remains unchanged.
  const current=publicSnapshot(facts,'3');assert.ok(current.dictionaryIds.includes(measurement));
  await db.query('UPDATE catalog_core.publication SET snapshot=$2 WHERE product_id=$1',[product,JSON.stringify(current)]);cache.invalidate();await expectVisible(true);
  await db.query('UPDATE catalog_core.dictionary SET active=false WHERE id=$1',[measurement]);await expectVisible(false);
  assert.deepEqual((await db.query('SELECT snapshot FROM catalog_core.product_review WHERE id=$1',[review])).rows[0].snapshot.product.version,'2');
  assert.equal((await db.query("SELECT has_table_privilege('cootton_catalog_reader','catalog_core.product_review','SELECT') AS v")).rows[0].v,false);

  // Actual Nest HTTP + local PostgreSQL under the restricted reader role.
  // Synthetic rows stay in this loopback transaction and are rolled back.
  const {createApp}=require('../dist/main'),originalDatabase=CatalogRepository.prototype.database;
  CatalogRepository.prototype.database=()=>({query:(...args)=>db.query(...args)});
  const app=await createApp();
  try {
   await app.listen(0,'127.0.0.1');const origin=await app.getUrl();
   async function httpRead(route,status){
    await db.query('SET LOCAL ROLE cootton_catalog_reader');
    try {const r=await fetch(origin+route);assert.equal(r.status,status);assert.equal(r.headers.get('cache-control'),'no-store');assert.equal(r.headers.get('x-content-type-options'),'nosniff');return await r.json();}
    finally {await db.query('RESET ROLE');}
   }
   await db.query('UPDATE catalog_core.dictionary SET active=true WHERE id=$1',[measurement]);app.get(MemoryCache).invalidate();
   const list=await httpRead('/v1/catalog/products',200),detail=await httpRead('/v1/catalog/products/'+product,200);
   assert.equal(list.items.length,1);assert.equal(detail.chart.length,1);
   function privateFree(value){if(value&&typeof value==='object'){for(const [key,item] of Object.entries(value)){assert.ok(!['actor_id','subject','fingerprint','review_id','rights_evidence_id','origin_evidence_id'].includes(key),'private DTO field');privateFree(item);}}}
   privateFree(list);privateFree(detail);
   // Both responses are now cached; revoke without a product version bump.
   await db.query('UPDATE catalog_core.dictionary SET active=false WHERE id=$1',[measurement]);
   assert.equal((await httpRead('/v1/catalog/products',200)).items.length,0);
   await httpRead('/v1/catalog/products/'+product,404);
   await httpRead('/v1/catalog/media/'+asset+'/'+'a'.repeat(64)+'.webp',404);
  } finally {await app.close();CatalogRepository.prototype.database=originalDatabase;}
 }finally{await db.query('ROLLBACK').catch(()=>{});await db.end();delete process.env.COOTTON_PUBLICATION_ENABLED;}
});
