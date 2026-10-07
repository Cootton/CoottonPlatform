const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs/promises'),path=require('node:path');const {randomUUID}=require('node:crypto');const {Client}=require('pg');
const {authorizeOwnerCatalog,CATALOG_COMMAND_CAPABILITIES}=require('../dist/catalog-authorization');
const {AdminCatalogService}=require('../dist/admin-catalog');const {MemoryCache}=require('../dist/memory-cache');
const media=require('../dist/catalog-media');
test('disposable PostgreSQL: singleton owner, cross-product media, revoked replay and serialized command/revoke',{timeout:30000},async()=>{
 const url=new URL(process.env.COOTTON_TEST_DATABASE_URL??'');
 assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));assert.equal(url.pathname,'/cootton_api_test');assert.equal(decodeURIComponent(url.username),'cootton_test');
 const maintenance=new Client({connectionString:url.toString()}),writer=new Client({connectionString:url.toString()}),revoker=new Client({connectionString:url.toString()});
 await maintenance.connect();let prepared=false,clientsConnected=false,releaseWriter=()=>{};
 const originals=[media.previewImage,media.previewVideo,process.env.COOTTON_PUBLICATION_ENABLED];let storageReads=0;
 try{
  assert.equal((await maintenance.query("SELECT to_regnamespace('catalog_core') IS NOT NULL AS exists")).rows[0].exists,false);
  assert.equal((await maintenance.query("SELECT count(*)::int AS n FROM pg_roles WHERE rolname IN ('cootton_catalog_admin','cootton_catalog_reader')")).rows[0].n,0);
  await maintenance.query('BEGIN');await maintenance.query('CREATE ROLE cootton_catalog_admin NOLOGIN');await maintenance.query('CREATE ROLE cootton_catalog_reader NOLOGIN');
  for(const file of ['001_catalog_read.sql','002_admin_catalog.sql','003_product_intake.sql','004_product_media.sql','005_catalog_publication.sql','006_catalog_measurement_visibility.sql'])await maintenance.query(await fs.readFile(path.join(__dirname,'../migrations',file),'utf8'));
  await maintenance.query('GRANT USAGE ON SCHEMA catalog_core TO cootton_catalog_admin');await maintenance.query('GRANT SELECT ON catalog_core.principal TO cootton_catalog_admin');
  const owner=randomUUID(),seller=randomUUID(),a=randomUUID(),b=randomUUID(),asset=randomUUID(),evidence=randomUUID(),video=randomUUID();
  await maintenance.query("INSERT INTO catalog_core.principal(id,project,subject,active) VALUES($1,'cootton-firebase','api03-owner-fixture',true)",[owner]);
  await maintenance.query("INSERT INTO catalog_core.seller(id,name,source,active) VALUES($1,'Synthetic API03 seller','Disposable CI fixture only',true)",[seller]);
  for(const [id,name]of [[a,'A'],[b,'B']])await maintenance.query('INSERT INTO catalog_core.product(id,seller_id,model_token,title) VALUES($1,$2,$3,$3)',[id,seller,name]);
  await maintenance.query("INSERT INTO catalog_core.evidence(id,seller_id,declaration,actor_id) VALUES($1,$2,'Synthetic CI media rights fixture',$3)",[evidence,seller,owner]);
  await maintenance.query('INSERT INTO catalog_core.asset(id,seller_id,path,sha256,width,height,rights_evidence_id) VALUES($1,$2,$3,$4,100,100,$5)',[asset,seller,'/media/'+asset+'/'+'a'.repeat(64)+'.webp','a'.repeat(64),evidence]);
  await maintenance.query("INSERT INTO catalog_core.product_media(product_id,asset_id,position,alt) VALUES($1,$2,1,'Synthetic asset B')",[b,asset]);
  await maintenance.query('INSERT INTO catalog_core.media_thumbnail(asset_id,path,sha256,width,height) VALUES($1,$2,$3,100,100)',[asset,'/thumbnails/'+asset+'/'+'b'.repeat(64)+'.webp','b'.repeat(64)]);
  await maintenance.query("INSERT INTO catalog_core.video_asset(id,seller_id,path,sha256,poster_path,width,height,duration_ms,byte_length,alt,rights_evidence_id) VALUES($1,$2,$3,$4,$5,100,100,1000,100,'Synthetic video',$6)",[video,seller,'/videos/'+video+'/'+'c'.repeat(64)+'.mp4','c'.repeat(64),'/posters/'+video+'/'+'d'.repeat(64)+'.webp',evidence]);
  await maintenance.query('INSERT INTO catalog_core.product_video(product_id,seller_id,video_id) VALUES($1,$2,$3)',[b,seller,video]);
  await maintenance.query('COMMIT');prepared=true;await writer.connect();await revoker.connect();clientsConnected=true;
  const req={headers:{},method:'POST',adminIdentity:{project:'cootton-firebase',subject:'api03-owner-fixture',authTime:Math.floor(Date.now()/1000),signInProvider:'password'}};
  process.env.COOTTON_PUBLICATION_ENABLED='true';
  // Real role cannot update its own admission; row locks would require new privileges, so retain subject advisory guard.
  await maintenance.query('BEGIN');await maintenance.query('SET LOCAL ROLE cootton_catalog_admin');
  assert.equal(await authorizeOwnerCatalog(maintenance,req,'session'),owner);
  await assert.rejects(maintenance.query('UPDATE catalog_core.principal SET active=true'),e=>e.code==='42501');await maintenance.query('ROLLBACK');
  await assert.rejects(maintenance.query("INSERT INTO catalog_core.principal(id,project,subject,active) VALUES($1,'cootton-firebase','another-fixture',true)",[randomUUID()]),e=>e.code==='23505');
  await assert.rejects(maintenance.query("INSERT INTO catalog_core.seller(id,name,source) VALUES($1,'Other','Fixture')",[randomUUID()]),e=>e.code==='23505');
  media.previewImage=async()=>{storageReads++;return {mime:'image/webp',base64:'Zml4dHVyZQ=='};};media.previewVideo=async()=>{storageReads++;return {mime:'video/mp4',base64:'Zml4dHVyZQ=='};};
  const service=new AdminCatalogService(new MemoryCache());
  service.database=()=>({query:(...args)=>maintenance.query(...args),connect:async()=>({query:(...args)=>writer.query(...args),release(){}})});
  for(const thumbnail of [false,true]){await assert.rejects(service.image(req,a,asset,thumbnail),e=>e.getStatus()===404);assert.equal(storageReads,thumbnail?1:0);assert.equal((await service.image(req,b,asset,thumbnail)).mime,'image/webp');}
  for(const poster of [false,true]){const before=storageReads;await assert.rejects(service.video(req,a,poster),e=>e.getStatus()===404);assert.equal(storageReads,before);assert.ok(await service.video(req,b,poster));}
  const key=randomUUID(),input={key,action:'createDraft',payload:{title:'Synthetic API03 authorized draft'}};
  const result=await service.command(req,input);assert.equal(result.lifecycle,'DRAFT');
  for(const table of ['audit','outbox','command'])assert.equal((await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.'+table)).rows[0].n,1);
  const guard=async(client)=>client.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',['cootton-firebase:api03-owner-fixture']);
  await revoker.query('BEGIN');await guard(revoker);await revoker.query('UPDATE catalog_core.principal SET active=false WHERE id=$1',[owner]);await revoker.query('COMMIT');
  const beforeReads=storageReads;
  // Persisted receipt exists; active owner must still be checked before replay.
  await assert.rejects(service.command(req,input),e=>e.getStatus()===403);
  for(const action of Object.keys(CATALOG_COMMAND_CAPABILITIES)){
   const command={key:randomUUID(),action,...(['createDraft','addDictionary'].includes(action)?{}:{id:a,expectedVersion:'1'}),payload:{}};
   await assert.rejects(service.command(req,command),e=>e.getStatus()===403);
  }
  assert.equal(storageReads,beforeReads);assert.equal((await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.command')).rows[0].n,1);
  await revoker.query('BEGIN');await guard(revoker);await revoker.query('UPDATE catalog_core.principal SET active=true WHERE id=$1',[owner]);await revoker.query('COMMIT');
  let enteredResolve;const entered=new Promise(resolve=>enteredResolve=resolve),release=new Promise(resolve=>releaseWriter=resolve);
  service.database=()=>({query:(...args)=>maintenance.query(...args),connect:async()=>({query:async(sql,...args)=>{const rows=await writer.query(sql,...args);if(sql.includes('FROM catalog_core.principal')){enteredResolve();await release;}return rows;},release(){}})});
  const pending=service.command(req,{key:randomUUID(),action:'createDraft',payload:{title:'Synthetic serialized command'}});
  await entered;
  await revoker.query('BEGIN');await revoker.query("SET LOCAL lock_timeout='100ms'");
  await assert.rejects(guard(revoker),e=>e.code==='55P03');await revoker.query('ROLLBACK');
  releaseWriter();assert.equal((await pending).lifecycle,'DRAFT');
  await revoker.query('BEGIN');await guard(revoker);await revoker.query('UPDATE catalog_core.principal SET active=false WHERE id=$1',[owner]);await revoker.query('COMMIT');
  await assert.rejects(authorizeOwnerCatalog(maintenance,req,'session'),e=>e.getStatus()===403);
  assert.equal((await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.command')).rows[0].n,2);
 }finally{
  releaseWriter();if(clientsConnected){await writer.query('ROLLBACK').catch(()=>{});await revoker.query('ROLLBACK').catch(()=>{});await writer.end();await revoker.end();}
  await maintenance.query('ROLLBACK').catch(()=>{});
  if(prepared){await maintenance.query('DROP SCHEMA catalog_core CASCADE');await maintenance.query('DROP SCHEMA catalog_read CASCADE');await maintenance.query('DROP ROLE cootton_catalog_admin');await maintenance.query('DROP ROLE cootton_catalog_reader');}
  await maintenance.end();[media.previewImage,media.previewVideo]=originals;if(originals[2]===undefined)delete process.env.COOTTON_PUBLICATION_ENABLED;else process.env.COOTTON_PUBLICATION_ENABLED=originals[2];
 }
});
