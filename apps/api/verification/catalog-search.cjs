const {test}=require('node:test'),assert=require('node:assert/strict');
const {searchPlan,searchCursor}=require('../dist/catalog-search');
const {CatalogRepository}=require('../dist/catalog'),{MemoryCache}=require('../dist/memory-cache'),{createApp}=require('../dist/main');
const id='00000000-0000-4000-8000-000000000001';
const fixture={id,version:'1',title:'Áo thun',category:'CREWNECK_TSHIRT',brand:'Fixture',description:'Test only',form:'Boxy',material:'Cotton',origin:'VN',care:'Test',images:[{path:'/media/'+id+'/'+ 'a'.repeat(64)+'.webp',alt:'Fixture',width:600,height:800}],search_rank:50,cursor_at:'2026-10-09T00:00:00.123456Z'};
test('search SQL binds all caller text, same-SKU conjunction and scoped keyset cursor',()=>{
 const payload="x%_' OR 1=1 --",plan=searchPlan({q:payload,color:'Đen',size:'L',limit:'1'});
 assert.ok(!plan.text.includes(payload));assert.ok(plan.values.some(v=>String(v).includes("1=1")));
 assert.match(plan.text,/EXISTS\(SELECT 1 FROM catalog_read.visible_sku s WHERE s.product_id=p.id AND .*s.color.* AND .*s.size/);
 const after=searchCursor(plan.input,fixture);
 assert.doesNotThrow(()=>searchPlan({q:payload,color:'Đen',size:'L',limit:'1',cursor:after}));
 for(const change of [{q:'different'},{color:'Trắng'},{size:'M'},{mode:'B2B'},{limit:'2'}])assert.throws(()=>searchPlan({q:payload,color:'Đen',size:'L',limit:'1',cursor:after,...change}));
 assert.throws(()=>searchPlan({cursor:Buffer.from('null').toString('base64url')}));
});
test('actual Nest search HTTP validates parameters, paginates and fails closed on withdrawal/outage',async()=>{
 const original=CatalogRepository.prototype.database;
 let available=true,visible=true,calls=0;
 CatalogRepository.prototype.database=()=>({query:async(text)=>{calls++;if(!available)throw Error('private DB details');return {rows:text.startsWith('SELECT id,version')?(visible?[{id,version:'1'}]:[]):[fixture,{...fixture,id:'00000000-0000-4000-8000-000000000002'}]};}});
 const app=await createApp();
 try {
  await app.listen(0,'127.0.0.1');const origin=await app.getUrl();
  const read=async(query,status)=>{const response=await fetch(origin+'/v1/catalog/search?'+query);assert.equal(response.status,status);assert.equal(response.headers.get('cache-control'),'no-store');assert.equal(response.headers.get('x-content-type-options'),'nosniff');return response.json();};
  const result=await read('q=ao&limit=1',200);assert.equal(result.items[0].id,id);assert.ok(result.nextCursor);assert.equal(result.commerceEnabled,false);assert.equal(result.items[0].search_rank,undefined);
  const before=calls;for(const query of ['q=a&q=b','limit=51','q='+('x'.repeat(161)),'cursor=bad!','sellerId=private'])await read(query,400);assert.equal(calls,before);
  visible=false;const hidden=await read('q=ao&limit=1',503);assert.equal(hidden.code,'UNAVAILABLE');
  available=false;const outage=await read('',503);assert.ok(!JSON.stringify(outage).includes('private'));
 } finally {await app.close();CatalogRepository.prototype.database=original;}
});
