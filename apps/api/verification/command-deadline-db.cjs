const assert=require('node:assert/strict'),{randomUUID}=require('node:crypto'),{Pool}=require('pg'),{setTimeout:delay}=require('node:timers/promises');
const {CommandBudget,inCommandBudget,commandPool}=require('../dist/command-budget');
const {AdminCatalogService}=require('../dist/admin-catalog'),{MemoryCache}=require('../dist/memory-cache');
// Only invoked inside the existing guarded disposable database fixture.
module.exports=async function deadlineDatabase({maintenance,req,owner}){
 const url=new URL(process.env.COOTTON_TEST_DATABASE_URL??'');assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));assert.equal(url.pathname,'/cootton_api_test');assert.equal(decodeURIComponent(url.username),'cootton_test');
 const pool=new Pool({connectionString:url.toString(),max:1,connectionTimeoutMillis:2000});
 const scoped=async(ms,fn)=>{const budget=new CommandBudget(ms);try{return await inCommandBudget(budget,fn);}finally{budget.dispose();}};
 const counts=async()=>Object.fromEntries(await Promise.all(['audit','outbox','command'].map(async t=>[t,(await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.'+t)).rows[0].n])));
 const active=async value=>{await maintenance.query('BEGIN');try{await maintenance.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[req.adminIdentity.project+':'+req.adminIdentity.subject]);await maintenance.query('UPDATE catalog_core.principal SET active=$1 WHERE id=$2',[value,owner]);await maintenance.query('COMMIT');}catch(e){await maintenance.query('ROLLBACK');throw e;}};
 let loseAck=true,committed=false;
 try{
  await pool.query('SELECT 1');
  await scoped(100,async()=>{const client=await commandPool(pool).connect();await assert.rejects(client.query('SELECT pg_sleep(2)'),e=>e.getStatus?.()===503);client.release();});
  assert.equal((await pool.query('SELECT 1 AS healthy')).rows[0].healthy,1);
  await active(true);const before=await counts(),service=new AdminCatalogService(new MemoryCache()),input={key:randomUUID(),action:'createDraft',payload:{title:'Synthetic deadline commit receipt'}};
  service.database=()=>({connect:async()=>{const raw=await pool.connect();try{await raw.query('SET ROLE cootton_catalog_admin');assert.equal((await raw.query('SELECT current_user')).rows[0].current_user,'cootton_catalog_admin');}catch(e){raw.release(true);throw e;}
   return new Proxy(raw,{get(target,property){if(property==='query')return async(sql,...args)=>{const result=await target.query(sql,...args);if(sql==='COMMIT'&&loseAck){loseAck=false;committed=true;await delay(800);}return result;};const value=Reflect.get(target,property);return typeof value==='function'?value.bind(target):value;}});
  }});
  await scoped(400,()=>assert.rejects(service.command(req,input),e=>e.getStatus?.()===503));assert.equal(committed,true,'real COMMIT must precede delayed acknowledgement');
  const after=await counts();for(const [t,n]of Object.entries(before))assert.equal(after[t],n+1);
  const receipt=(await maintenance.query('SELECT result FROM catalog_core.command WHERE key=$1',[input.key])).rows[0].result;
  assert.deepEqual(await scoped(3000,()=>service.command(req,input)),receipt);assert.deepEqual(await counts(),after);
  console.log('REL04-DEADLINE-DB-001 PASS: real pg_sleep lease discarded, fresh lease healthy; real restricted-role COMMIT before deadline503; exact-key replay preserves one command/audit/outbox receipt');
 }finally{await pool.end();await active(false);}
};
