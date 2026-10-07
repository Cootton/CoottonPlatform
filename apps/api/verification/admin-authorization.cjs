const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');const {Module,createRequire}=require('node:module');
const {authorizeOwnerCatalog,CATALOG_READ_OPERATIONS,CATALOG_COMMAND_CAPABILITIES,ownerCatalogCapabilities}=require('../dist/catalog-authorization');
const {AdminCatalogService}=require('../dist/admin-catalog');const {AdminIdentityGuard}=require('../dist/admin-auth');
const {createApp}=require('../dist/main');
const {MemoryCache}=require('../dist/memory-cache');
const owner='11111111-1111-4111-8111-111111111111',product='22222222-2222-4222-8222-222222222222',asset='33333333-3333-4333-8333-333333333333';
const identity=()=>({project:'cootton-firebase',subject:'owner-fixture',authTime:Math.floor(Date.now()/1000),signInProvider:'password'});
const actions=Object.keys(CATALOG_COMMAND_CAPABILITIES),publication=new Set(['submit','approve','publish','returnDraft','unpublish']);
const body=action=>({key:owner,action,...(['createDraft','addDictionary'].includes(action)?{}:{id:product,expectedVersion:'1'}),payload:{}});
function token(subject='owner-fixture'){return {uid:subject,sub:subject,aud:'cootton-firebase',iss:'https://securetoken.google.com/cootton-firebase',auth_time:Math.floor(Date.now()/1000),firebase:{sign_in_provider:'password'},email:'owner-contact@fixture.invalid',role:'ADMIN',admin:true,capabilities:['catalog.publish']};}
function fixtureGuard(verify){
 const filename=path.resolve(__dirname,'../dist/admin-auth.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 mod.require=id=>id==='firebase-admin/auth'?{getAuth:()=>({verifyIdToken:verify})}:id==='./firebase-app'?{firebaseApp:()=>({name:'isolated-fixture'})}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);return mod.exports.AdminIdentityGuard;
}
function context(headers={authorization:'Bearer fixture'}){return {switchToHttp:()=>({getRequest:()=>({headers,method:'GET'})})};}
test('all actual Admin controller methods are guarded and match policy/OpenAPI operation registries',()=>{
 const {AdminCatalogModule}=require('../dist/admin-catalog');
 const {GUARDS_METADATA,PATH_METADATA,METHOD_METADATA}=require('@nestjs/common/constants');
 const {RequestMethod}=require('@nestjs/common');
 const spec=require('../../../docs/contracts/openapi.json');
 const [controller]=Reflect.getMetadata('controllers',AdminCatalogModule);
 assert.ok(Reflect.getMetadata(GUARDS_METADATA,controller).includes(AdminIdentityGuard));
 const methods=Object.getOwnPropertyNames(controller.prototype).filter(name=>name!=='constructor');
 assert.deepEqual(methods.filter(name=>name!=='command').sort(),[...CATALOG_READ_OPERATIONS].sort());
 assert.equal(methods.length,9);
 for(const name of methods){const handler=controller.prototype[name],method=Reflect.getMetadata(METHOD_METADATA,handler),relative=Reflect.getMetadata(PATH_METADATA,handler).replace(/:([a-zA-Z]+)/g,'{$1}');assert.equal(method,name==='command'?RequestMethod.POST:RequestMethod.GET);assert.ok(spec.paths['/v1/admin/'+relative][name==='command'?'post':'get']);}
 assert.deepEqual(actions.sort(),spec.components.schemas.AdminCommand.oneOf.map(s=>s.properties.action.const).sort());
});
test('identity admission: real guard checks token/project/subject/provider/freshness; SDK failure never grants',async()=>{
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
 let supplied=token(),failure=null,calls=0;
 const Guard=fixtureGuard(async(value,revoked)=>{calls++;assert.equal(value,'fixture');assert.equal(revoked,true);if(failure)throw failure;return supplied;});
 const guard=new Guard();
 assert.equal(await guard.canActivate(context()),true);
 for(const change of [
  t=>t.aud='wrong',t=>t.iss='wrong',t=>t.uid='',t=>t.sub='other',t=>t.auth_time-=3601,t=>t.auth_time+=30,t=>t.auth_time=1.5,
  t=>t.firebase.sign_in_provider='anonymous',t=>t.firebase.sign_in_provider='custom',t=>delete t.firebase,t=>delete t.firebase.sign_in_provider
 ]){supplied=token();change(supplied);await assert.rejects(guard.canActivate(context()),e=>e.getStatus()===401);}
 for(const code of ['auth/id-token-expired','auth/id-token-revoked','auth/user-disabled','auth/user-not-found','auth/invalid-id-token']){failure={code};await assert.rejects(guard.canActivate(context()),e=>e.getStatus()===401);}
 failure={code:'auth/internal-error'};await assert.rejects(guard.canActivate(context()),e=>e.getStatus()===503);failure=null;
 const before=calls;for(const headers of [{},{authorization:'Basic fixture'},{authorization:'Bearer '+ 'a'.repeat(8193)}])await assert.rejects(guard.canActivate(context(headers)),e=>e.getStatus()===401);assert.equal(calls,before);
 process.env.FIREBASE_PROJECT_ID='wrong';await assert.rejects(guard.canActivate(context()),e=>e.getStatus()===503);
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';process.env.FIREBASE_AUTH_EMULATOR_HOST='localhost:9099';await assert.rejects(guard.canActivate(context()),e=>e.getStatus()===503);delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
});
test('owner policy covers every8 read/13 command; unknown action, forged claims and disabled readiness deny',async()=>{
 const ops=[...CATALOG_READ_OPERATIONS,...actions.map(a=>'command:'+a)];let active=true;
 const db={query:async(sql,params)=>{assert.match(sql,/active AND singleton/);return {rows:active&&params[1]==='owner-fixture'?[{id:owner}]:[]};}};
 const request={headers:{},method:'GET',adminIdentity:identity()};
 process.env.COOTTON_PUBLICATION_ENABLED='true';for(const op of ops)assert.equal(await authorizeOwnerCatalog(db,request,op),owner);
 for(const op of ['payments.refund','grant','command:deleteAll','command:__proto__'])await assert.rejects(authorizeOwnerCatalog(db,request,op),e=>e.getStatus()===403);
 for(const subject of ['buyer-fixture','staff-fixture','ai-fixture'])for(const op of ops)await assert.rejects(authorizeOwnerCatalog(db,{...request,adminIdentity:{...identity(),subject},roles:['ADMIN'],capabilities:['catalog.publish']},op),e=>e.getStatus()===403);
 active=false;for(const op of ops)await assert.rejects(authorizeOwnerCatalog(db,request,op),e=>e.getStatus()===403);active=true;
 process.env.COOTTON_PUBLICATION_ENABLED='false';for(const action of actions){if(publication.has(action))await assert.rejects(authorizeOwnerCatalog(db,request,'command:'+action),e=>e.getStatus()===409);else assert.equal(await authorizeOwnerCatalog(db,request,'command:'+action),owner);}
 assert.deepEqual(ownerCatalogCapabilities(),['catalog.read','catalog.draft']);
 delete process.env.COOTTON_PUBLICATION_ENABLED;
});
test('real service replay paths reauthorize all13 actions; revoked owner cannot receive receipt',async()=>{
 process.env.COOTTON_PUBLICATION_ENABLED='true';let active=true,receiptReads=0;
 const db={query:async(sql)=>{if(sql.includes('FROM catalog_core.principal'))return {rows:active?[{id:owner}]:[]};if(sql.includes('fingerprint,result')){receiptReads++;return {rows:[{fingerprint:currentFingerprint,result:{id:product,version:'2'}}]};}return {rows:[]};},connect:async()=>({...db,release(){}})};
 let currentFingerprint;const canonical=x=>Array.isArray(x)?'['+x.map(canonical).join(',')+']':x&&typeof x==='object'?'{'+Object.entries(x).sort(([a],[b])=>a.localeCompare(b)).map(([k,v])=>JSON.stringify(k)+':'+canonical(v)).join(',')+'}':JSON.stringify(x);
 const service=new AdminCatalogService(new MemoryCache());service.database=()=>db;
 const req={headers:{},method:'POST',adminIdentity:identity()};
 for(const action of actions){const input=body(action);currentFingerprint=require('node:crypto').createHash('sha256').update(canonical(input)).digest('hex');assert.equal((await service.command(req,input)).version,'2');}
 active=false;const before=receiptReads;for(const action of actions)await assert.rejects(service.command(req,body(action)),e=>e.getStatus()===403);assert.equal(receiptReads,before);
 delete process.env.COOTTON_PUBLICATION_ENABLED;
});
test('actual HTTP private endpoints deny absent/invalid identity and every nonowner; public health independent',async()=>{
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';process.env.COOTTON_PUBLICATION_ENABLED='true';
 const Guard=fixtureGuard(async(value)=>{if(value==='invalid')throw {code:'auth/invalid-id-token'};return token(value==='owner'?'owner-fixture':value);});
 const originalGuard=AdminIdentityGuard.prototype.canActivate,originalDatabase=AdminCatalogService.prototype.database;
 let privateReads=0,unavailable=false;
 const db={query:async(sql,params)=>{if(unavailable)throw Error('private database outage');if(sql.includes('FROM catalog_core.principal'))return {rows:params[1]==='owner-fixture'?[{id:owner}]:[]};if(/FROM catalog_core\.(product|dictionary|asset|video_asset)|FROM catalog_core\.media_thumbnail/.test(sql))privateReads++;return {rows:[],rowCount:0};},connect:async()=>({...db,release(){}})};
 AdminIdentityGuard.prototype.canActivate=Guard.prototype.canActivate;AdminCatalogService.prototype.database=()=>db;
 const app=await createApp();
 const reads=['session','catalog/products','catalog/products/'+product,'catalog/dictionaries','catalog/products/'+product+'/images/'+asset,'catalog/products/'+product+'/thumbnails/'+asset,'catalog/products/'+product+'/video','catalog/products/'+product+'/video/poster'];
 try{
  await app.listen(0,'127.0.0.1');const origin=await app.getUrl();
  for(const bearer of [null,'invalid','buyer-fixture','staff-fixture','ai-fixture']){
   const status=bearer===null||bearer==='invalid'?401:403,headers=bearer?{Authorization:'Bearer '+bearer}:{};
   for(const route of reads){const r=await fetch(origin+'/v1/admin/'+route,{headers});assert.equal(r.status,status,route);assert.equal((await r.json()).code,status===401?'AUTHENTICATION_REQUIRED':'FORBIDDEN');}
   for(const action of actions){const r=await fetch(origin+'/v1/admin/catalog/commands',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:JSON.stringify(body(action))});assert.equal(r.status,status,action);}
  }
  assert.equal(privateReads,0);
  const allowed=await fetch(origin+'/v1/admin/session',{headers:{Authorization:'Bearer owner'}});assert.equal(allowed.status,200);assert.equal((await allowed.json()).principalId,owner);
  for(const route of reads){const r=await fetch(origin+'/v1/admin/'+route,{headers:{Authorization:'Bearer owner'}});assert.equal(r.status,['session','catalog/products','catalog/dictionaries'].includes(route)?200:404,route);}
  unavailable=true;for(const route of reads){const r=await fetch(origin+'/v1/admin/'+route,{headers:{Authorization:'Bearer owner'}});assert.equal(r.status,503,route);}
  for(const action of actions){const r=await fetch(origin+'/v1/admin/catalog/commands',{method:'POST',headers:{Authorization:'Bearer owner','Content-Type':'application/json'},body:JSON.stringify(body(action))});assert.equal(r.status,503,action);}
  assert.equal((await fetch(origin+'/v1/health/live')).status,200);
 }finally{await app.close();AdminIdentityGuard.prototype.canActivate=originalGuard;AdminCatalogService.prototype.database=originalDatabase;delete process.env.COOTTON_PUBLICATION_ENABLED;}
});
