const {test}=require('node:test');
const assert=require('node:assert/strict');
const {publicProduct,productSlug}=require('../dist/index.js');
// Transport fixtures only, never seeded to Neon or represented as real products.
const safe={id:'00000000-0000-4000-8000-000000000001',version:'1',title:'Áo thun cổ tròn',category:'CREWNECK_TSHIRT',brand:'Fixture',description:'Fixture',form:null,material:'Fixture',origin:'Fixture',care:'Fixture',images:[{path:'/media/00000000-0000-4000-8000-000000000002/'+ 'a'.repeat(64)+'.webp',alt:'Fixture',width:600,height:800}]};
test('public transport discards private source/evidence fields and nested media secrets',()=>{
  const output=publicProduct({...safe,originEvidenceRef:'PRIVATE',ownerEmail:'PRIVATE',images:[{...safe.images[0],secret:'PRIVATE'}]});
  assert.equal(JSON.stringify(output).includes('PRIVATE'),false);
});
test('media transport rejects external URLs and invalid canonical asset identity',()=>{
  assert.throws(()=>publicProduct({...safe,images:[{...safe.images[0],path:'https://example.com/private?token=secret'}]}));
  assert.throws(()=>publicProduct({...safe,images:[{...safe.images[0],path:'/media/'+ '-'.repeat(36)+'/'+ 'a'.repeat(64)+'.webp'}]}));
});
test('canonical slug normalization is bounded and independent from identity',()=>{
  assert.equal(productSlug('Áo thun cổ tròn'),'ao-thun-co-tron');
  assert.equal(productSlug('👕'),'san-pham');
  assert.ok(productSlug('Áo '.repeat(100)).length<=120);
});
