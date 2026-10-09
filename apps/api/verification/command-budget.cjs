const {test}=require('node:test'),assert=require('node:assert/strict');
const {EventEmitter}=require('node:events'),{setTimeout:delay}=require('node:timers/promises');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os'),{Module,createRequire}=require('node:module');
const {CommandBudget,inCommandBudget,commandWait,commandWrite,commandPool,executeCommandFile,commandTimeoutMs}=require('../dist/command-budget');
const unavailable=e=>e.getStatus?.()===503;
async function scope(ms,task){const budget=new CommandBudget(ms),keep=setInterval(()=>{},1000);try{return await inCommandBudget(budget,()=>task(budget));}finally{clearInterval(keep);budget.dispose();}}
function client(query=async()=>({rows:[]})){const raw=new EventEmitter(),releases=[];raw.query=query;raw.release=destroy=>releases.push(Boolean(destroy));return {raw,releases};}

test('deadline config fails closed; concurrent contexts do not share cancellation',async()=>{
 const previous=process.env.COOTTON_COMMAND_DEADLINE_MS;
 try{delete process.env.COOTTON_COMMAND_DEADLINE_MS;assert.equal(commandTimeoutMs(),45000);for(const bad of ['0','999','150001','NaN','45000.5',' 45000']){process.env.COOTTON_COMMAND_DEADLINE_MS=bad;assert.throws(commandTimeoutMs);}}
 finally{if(previous===undefined)delete process.env.COOTTON_COMMAND_DEADLINE_MS;else process.env.COOTTON_COMMAND_DEADLINE_MS=previous;}
 const values=await Promise.all([scope(20,()=>assert.rejects(commandWait(()=>delay(80)),unavailable)),scope(250,()=>commandWait(async()=>{await delay(50);return 'active';}))]);assert.equal(values[1],'active');
});
test('late verifier/read result cannot admit a following write',async()=>{
 let writes=0;
 await scope(20,async()=>{await assert.rejects(commandWait(async()=>{await commandWait(()=>delay(60));await commandWrite(async()=>writes++);}),unavailable);await delay(80);assert.equal(writes,0);});
});
test('late pool acquisition is destroyed once; no SQL is dispatched',async()=>{
 let resolve,queries=0;const f=client(async()=>{queries++;return {rows:[]};});
 await scope(20,async()=>{const pool=commandPool({connect:()=>new Promise(r=>resolve=r)});await assert.rejects(pool.connect(),unavailable);resolve(f.raw);await delay(10);assert.deepEqual(f.releases,[true]);assert.equal(queries,0);assert.equal(f.raw.listenerCount('error'),0);});
});
test('pending SQL lease is destroyed; late result cannot dispatch COMMIT or ROLLBACK',async()=>{
 let queries=[];const f=client(async sql=>{queries.push(sql);await delay(60);return {rows:[]};});
 await scope(20,async()=>{const lease=await commandPool({connect:async()=>f.raw}).connect();await assert.rejects(lease.query('SELECT pending'),unavailable);await assert.rejects(lease.query('COMMIT'),unavailable);await assert.rejects(lease.query('ROLLBACK'),unavailable);lease.release();await delay(70);assert.deepEqual(queries,['SELECT pending']);assert.deepEqual(f.releases,[true]);assert.equal(f.raw.listenerCount('error'),0);});
});
test('successful SQL leases release normally; SQL errors destroy the transaction lease',async()=>{
 for(const failed of [false,true]){const f=client(async function(){assert.equal(this,f.raw);if(failed)throw Object.assign(new Error('constraint'),{code:'23505'});return {rows:[{ok:true}]};});await scope(200,async()=>{const pool=commandPool({connect:async()=>f.raw});if(failed)await assert.rejects(pool.query('SELECT'),e=>e.code==='23505');else assert.equal((await pool.query('SELECT')).rows[0].ok,true);assert.deepEqual(f.releases,[failed]);assert.equal(f.raw.listenerCount('error'),0);});}
});
test('encoder is killed and closed before its caller can clean up or continue',async()=>{
 const folder=fs.mkdtempSync(path.join(os.tmpdir(),'cootton-deadline-test-')),marker=path.join(folder,'late'),pidFile=path.join(folder,'pid');
 try{await scope(500,async()=>{await assert.rejects(executeCommandFile(process.execPath,['-e',"require('node:fs').writeFileSync(process.argv[2],String(process.pid));setTimeout(()=>require('node:fs').writeFileSync(process.argv[1],'late'),1500)",marker,pidFile],3000));});const pid=Number(fs.readFileSync(pidFile,'utf8'));assert.throws(()=>process.kill(pid,0),e=>e.code==='ESRCH');assert.equal(fs.existsSync(marker),false);}
 finally{fs.rmSync(folder,{recursive:true,force:true});}
});
test('native media read aborts under the request budget and releases its reader',async()=>{
 const load=require('./media-read-fixture.cjs');let cancelled=0,released=0,signal;
 const media=load(async(_url,opts)=>{signal=opts.signal;return {status:200,headers:new Headers(),body:{getReader:()=>({read:()=>new Promise(()=>{}),cancel:async()=>cancelled++,releaseLock:()=>released++})}};});
 process.env.COOTTON_MEDIA_BUCKET='deadline-fixture';await scope(25,()=>assert.rejects(media.readPinnedMedia('media/test','7',5,()=>{}),unavailable));assert.equal(signal.aborted,true);assert.equal(cancelled,1);assert.equal(released,1);
});
test('opaque immutable upload may settle late; no poster, overwrite or deletion follows',async()=>{
 const filename=path.resolve(__dirname,'../dist/catalog-media.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 const saves=[],objects=new Map();let release;
 const storage={file:name=>({save:async(bytes,opts)=>{saves.push(name);assert.equal(opts.preconditionOpts.ifGenerationMatch,0);assert.ok(opts.timeout>0&&opts.timeout<=10000);await new Promise(r=>release=r);objects.set(name,Buffer.from(bytes));},delete:()=>{throw Error('FORBIDDEN_DELETE');}})};
 mod.require=id=>id==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>storage})}:id==='./firebase-app'?{firebaseApp:()=>({})}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);process.env.COOTTON_MEDIA_BUCKET='deadline-fixture';
 await scope(30,async()=>{const pending=mod.exports.storeVideoMedia({output:Buffer.from('video'),poster:Buffer.from('poster')},'11111111-1111-4111-8111-111111111111');const observed=pending.catch(e=>e);await assert.rejects(commandWait(()=>pending),unavailable);assert.equal(saves.length,1);release();assert.ok(unavailable(await observed));assert.equal(saves.length,1);assert.equal(objects.size,1);assert.match(saves[0],/^videos\//);});
});
test('actual Nest HTTP deadline covers a stalled body parser and late identity verifier',async()=>{
 const http=require('node:http'),{createApp}=require('../dist/main'),{AdminIdentityGuard}=require('../dist/admin-auth'),{AdminCatalogService}=require('../dist/admin-catalog');
 const original=AdminIdentityGuard.prototype.canActivate,originalCommand=AdminCatalogService.prototype.command,previous=process.env.COOTTON_COMMAND_DEADLINE_MS;let commands=0,app;
 process.env.COOTTON_COMMAND_DEADLINE_MS='1000';AdminIdentityGuard.prototype.canActivate=async()=>{await commandWait(()=>delay(1400));return true;};AdminCatalogService.prototype.command=async()=>{commands++;return {};};
 try{app=await createApp();await app.listen(0,'127.0.0.1');const origin=await app.getUrl(),url=origin+'/v1/admin/catalog/commands';
  const response=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});assert.equal(response.status,503);const data=await response.json();assert.deepEqual(Object.keys(data).sort(),['code','message','requestId']);assert.equal(data.code,'UNAVAILABLE');assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');await delay(500);assert.equal(commands,0);
  await new Promise((resolve,reject)=>{const req=http.request(url,{method:'POST',headers:{'Content-Type':'application/json','Content-Length':'100'}},res=>{let body='';res.on('data',c=>body+=c);res.on('end',()=>{try{assert.equal(res.statusCode,503);assert.equal(JSON.parse(body).code,'UNAVAILABLE');req.destroy();resolve();}catch(e){reject(e);}});});req.on('error',reject);req.write('{');});assert.equal(commands,0);
 }finally{if(app)await app.close();AdminIdentityGuard.prototype.canActivate=original;AdminCatalogService.prototype.command=originalCommand;if(previous===undefined)delete process.env.COOTTON_COMMAND_DEADLINE_MS;else process.env.COOTTON_COMMAND_DEADLINE_MS=previous;}
});
