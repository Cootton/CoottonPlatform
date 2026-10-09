const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const {createRequire}=require('node:module'),webRequire=createRequire(path.resolve(__dirname,'../../web/package.json'));
function load(file,extra={}) {
 const output=ts.transpileModule(fs.readFileSync(path.resolve(__dirname,'../../web',file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
 const module={exports:{}};vm.runInNewContext(output,{module,exports:module.exports,require:key=>extra[key]??webRequire(key),process,URL,URLSearchParams,Response,AbortSignal,fetch:(...args)=>globalThis.fetch(...args)});return module.exports;
}
test('same-origin search BFF rejects duplicate/unknown inputs and rebuilds public allowlist',async()=>{
 const originalFetch=globalThis.fetch;let forwarded=0;
 const library=load('lib/catalog.ts'),route=load('app/api/catalog/search/route.ts',{'../../../../lib/catalog':library});
 const request=query=>new Request('https://fixture.invalid/api/catalog/search?'+query);
 const check=async(query,status)=>{const response=await route.GET(request(query));assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');return response.json();};
 try {
  globalThis.fetch=async()=>{forwarded++;return new Response(JSON.stringify({items:[],mode:'B2C',commerceEnabled:false,nextCursor:null,privateSource:'secret'}));};
  const output=await check('q=ao',200);assert.equal(JSON.stringify(output).includes('secret'),false);
  const before=forwarded;for(const query of ['q=a&q=b','sellerId=private','limit=51','q='+('x'.repeat(161))])await check(query,400);assert.equal(forwarded,before);
  globalThis.fetch=async()=>new Response(JSON.stringify({items:[],mode:'B2B',commerceEnabled:false,nextCursor:null}));await check('q=ao',503);
  globalThis.fetch=async()=>{throw Error('private backend details');};const error=await check('q=ao',503);assert.equal(JSON.stringify(error),'{"code":"UNAVAILABLE"}');
 }finally{globalThis.fetch=originalFetch;}
});
test('visibility BFF exposes only current public identity/version and fails closed',async()=>{
 const id='00000000-0000-4000-8000-000000000001';let result={product:{id,version:'3',secret:'PRIVATE'}};
 const route=load('app/api/catalog/products/[id]/visibility/route.ts',{'../../../../../../lib/catalog':{getProduct:async()=>{if(result instanceof Error)throw result;return result;}}});
 const request=new Request('https://fixture.invalid/api/catalog/products/'+id+'/visibility'),context={params:Promise.resolve({id})};
 let response=await route.GET(request,context);assert.equal(response.status,200);assert.deepEqual(await response.json(),{id,version:'3',commerceEnabled:false});assert.equal(response.headers.get('cache-control'),'no-store');
 result=null;response=await route.GET(request,context);assert.equal(response.status,404);
 result=new Error('private');response=await route.GET(request,context);assert.equal(response.status,503);assert.ok(!JSON.stringify(await response.json()).includes('private'));
 response=await route.GET(request,{params:Promise.resolve({id:'bad'})});assert.equal(response.status,400);
 response=await route.GET(new Request(request.url+'?token=bad'),context);assert.equal(response.status,400);
});
