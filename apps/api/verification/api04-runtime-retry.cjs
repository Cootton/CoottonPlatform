const assert=require('node:assert/strict'),fs=require('node:fs/promises'),path=require('node:path');
const {randomUUID}=require('node:crypto');
const {createApp}=require('../dist/main');
const {AdminIdentityGuard}=require('../dist/admin-auth');
const {AdminCatalogService}=require('../dist/admin-catalog');
const {MemoryCache}=require('../dist/memory-cache');
const {UnauthorizedException}=require('@nestjs/common');

// REL04-V02/V03: actual HTTP + PostgreSQL, isolated identity/transport controls.
// Called only after the parent fixture enforces localhost/cootton_api_test.
// No Firebase SDK, cloud credentials, GCS or production connection is involved.
module.exports=async function runtimeRetry({maintenance,writer,req,owner}){
 const original=AdminIdentityGuard.prototype.canActivate;
 let app,restricted=false,loseCommit=true;
 const counts=async()=>Object.fromEntries(await Promise.all(['audit','outbox','command'].map(async table=>[table,(await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.'+table)).rows[0].n])));
 const admission=async active=>{await maintenance.query('BEGIN');try{await maintenance.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[req.adminIdentity.project+':'+req.adminIdentity.subject]);await maintenance.query('UPDATE catalog_core.principal SET active=$1 WHERE id=$2',[active,owner]);await maintenance.query('COMMIT');}catch(e){await maintenance.query('ROLLBACK');throw e;}};
 try{
  // Reuse exact runtime bootstrap grants in the disposable fixture; never run
  // bootstrap or grant against an external database.
  const bootstrap=await fs.readFile(path.join(__dirname,'../admin-bootstrap.cjs'),'utf8');
  const grants=[...bootstrap.matchAll(/client\.query\('(GRANT [^']+ TO cootton_catalog_admin)'\)/g)].map(m=>m[1]);
  assert.equal(grants.length,6);
  for(const grant of grants)await maintenance.query(grant);
  await admission(true);
  await writer.query('SET ROLE cootton_catalog_admin');restricted=true;
  assert.equal((await writer.query('SELECT current_user AS role')).rows[0].role,'cootton_catalog_admin');
  await writer.query('BEGIN');await assert.rejects(writer.query('UPDATE catalog_core.principal SET active=true'),e=>e.code==='42501');await writer.query('ROLLBACK');
  AdminIdentityGuard.prototype.canActivate=async function(ctx){
   const request=ctx.switchToHttp().getRequest();
   if(request.headers.authorization!=='Bearer isolated-runtime-fixture')throw new UnauthorizedException();
   request.adminIdentity={...req.adminIdentity};return true;
  };
  app=await createApp();
  const service=app.get(AdminCatalogService),cache=app.get(MemoryCache);
  service.database=()=>({
   query:(...args)=>writer.query(...args),
   connect:async()=>({query:async(sql,...args)=>{const result=await writer.query(sql,...args);if(sql==='COMMIT'&&loseCommit){loseCommit=false;throw Error('Isolated lost COMMIT acknowledgement');}return result;},release(){}})
  });
  await app.listen(0,'127.0.0.1');const endpoint=(await app.getUrl())+'/v1/admin/catalog/commands';
  const send=(body,authorized=true)=>fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json',...(authorized?{Authorization:'Bearer isolated-runtime-fixture'}:{})},body:JSON.stringify(body),signal:AbortSignal.timeout(5000)});
  const response=async(r,status,code)=>{assert.equal(r.status,status);assert.match(r.headers.get('cache-control'),/no-store/);assert.equal(r.headers.get('x-content-type-options'),'nosniff');const value=await r.json();if(code){assert.deepEqual(Object.keys(value).sort(),['code','message','requestId']);assert.equal(value.code,code);assert.equal(value.message,code);}return value;};
  const input={key:randomUUID(),action:'createDraft',payload:{title:'Synthetic isolated HTTP recovery'}},before=await counts();
  await response(await send(input,false),401,'AUTHENTICATION_REQUIRED');assert.deepEqual(await counts(),before);
  await response(await send(input),503,'UNAVAILABLE');
  const receipt=(await maintenance.query('SELECT result FROM catalog_core.command WHERE actor_id=$1 AND operation=$2 AND key=$3',[owner,'createDraft',input.key])).rows[0].result;
  assert.equal(receipt.version,'1');
  for(const [table,n]of Object.entries(before))assert.equal((await counts())[table],n+1);
  await cache.read('isolated-stale-cache',10000,async()=>({version:'old'}));
  assert.deepEqual(await response(await send({payload:input.payload,key:input.key,action:input.action}),201),receipt);assert.equal(cache.stats().entries,0);
  await response(await send({...input,payload:{title:'Changed fingerprint'}}),409,'CONFLICT');
  for(const [table,n]of Object.entries(before))assert.equal((await counts())[table],n+1);
  const archive={key:randomUUID(),action:'archive',id:receipt.id,expectedVersion:'1',payload:{reason:'Synthetic runtime version verification'}};
  const archived=await response(await send(archive),201);assert.equal(archived.version,'2');
  assert.deepEqual(await response(await send(input),201),receipt);
  assert.equal((await maintenance.query('SELECT version::text FROM catalog_core.product WHERE id=$1',[receipt.id])).rows[0].version,'2');
  await response(await send({...archive,key:randomUUID()}),409,'CONFLICT');
  const final=await counts();for(const [table,n]of Object.entries(before))assert.equal(final[table],n+2);
  await admission(false);await response(await send(input),403,'FORBIDDEN');assert.deepEqual(await counts(),final);
  console.log('REL04-HTTP-DB-001 PASS: restricted writer, HTTP503 after real COMMIT,201 exact replay,409 conflicts, revoked receipt403, atomic counts; identity transport fixture');
 }finally{
  if(app)await app.close();
  AdminIdentityGuard.prototype.canActivate=original;
  await writer.query('ROLLBACK').catch(()=>{});
  if(restricted)await writer.query('RESET ROLE');
 }
};
