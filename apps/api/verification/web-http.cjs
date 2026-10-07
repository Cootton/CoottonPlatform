const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const ts=require('typescript');const {createRequire}=require('node:module');
const webRequire=createRequire(path.resolve(__dirname,'../../web/package.json'));
function route(file){const output=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../web/app',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const module={exports:{}};const sandbox={module,exports:module.exports,require:webRequire,process,Buffer,URL,crypto:globalThis.crypto,AbortSignal,fetch:(...args)=>globalThis.fetch(...args)};vm.runInNewContext(output,sandbox);return module.exports;}
function headers(response){assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');}
test('Web proxies preserve413/415, body stream failure is controlled, public errors no-store',async()=>{
 const originalFetch=globalThis.fetch,originalOrigin=process.env.ADMIN_WEB_ORIGIN;process.env.ADMIN_WEB_ORIGIN='https://fixture.invalid';
 const admin=route('api/admin/[...path]/route.ts'),media=route('media/[seller]/[file]/route.ts');
 const context={params:Promise.resolve({path:['catalog','commands']})};
 const request=body=>({method:'POST',headers:new Headers({authorization:'Bearer fixture',origin:'https://fixture.invalid','content-type':'application/json'}),body:body??new ReadableStream({start(c){c.enqueue(new TextEncoder().encode('{}'));c.close();}}),nextUrl:new URL('https://fixture.invalid/api/admin/catalog/commands')});
 try{
 for(const status of [201,409,413,415]){globalThis.fetch=async()=>new Response(JSON.stringify({code:'fixture'}),{status});const r=await admin.POST(request(),context);assert.equal(r.status,status);headers(r);}
 let forwarded=false;globalThis.fetch=async()=>{forwarded=true;throw Error('should not forward');};
 const broken=new ReadableStream({pull(){throw Error('private stream failure');}});const r=await admin.POST(request(broken),context);assert.equal(r.status,400);headers(r);assert.equal((await r.json()).code,'INVALID_INPUT');assert.equal(forwarded,false);
 const large=request();large.headers.set('content-length',String(12*1024*1024+1));const limit=await admin.POST(large,context);assert.equal(limit.status,413);assert.equal((await limit.json()).code,'PAYLOAD_TOO_LARGE');headers(limit);
 const bad=await media.GET(new Request('https://fixture.invalid/media'),{params:Promise.resolve({seller:'bad',file:'bad'})});assert.equal(bad.status,404);headers(bad);
 const params={params:Promise.resolve({seller:'11111111-1111-4111-8111-111111111111',file:'a'.repeat(64)+'.webp'})};
 for(const status of [404,500]){globalThis.fetch=async()=>new Response(null,{status});const r=await media.GET(new Request('https://fixture.invalid/media'),params);assert.equal(r.status,status===404?404:503);headers(r);assert.equal(await r.text(),'');}
 }finally{globalThis.fetch=originalFetch;if(originalOrigin===undefined)delete process.env.ADMIN_WEB_ORIGIN;else process.env.ADMIN_WEB_ORIGIN=originalOrigin;}
});
