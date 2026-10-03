const {test}=require('node:test');
const assert=require('node:assert/strict');
const {draftFields,inputVersion,inputObject}=require('../dist');
const draft={title:'  Áo thật  ',description:'',care:'',categoryId:null,brandId:null,formId:null,countryId:null,originEvidenceId:null,careEvidenceId:null};
test('draft missing optional facts stays missing, never fabricated',()=>{
  assert.deepEqual(draftFields(draft),{...draft,title:'Áo thật'});
  assert.throws(()=>draftFields({...draft,categoryId:''}));
});
test('draft rejects mass assignment, invalid source ID and unsafe version',()=>{
  assert.throws(()=>draftFields({...draft,lifecycle:'APPROVED'}));
  assert.throws(()=>draftFields({...draft,originEvidenceId:'someone@example.com'}));
  assert.throws(()=>draftFields({...draft,title:'x'.repeat(161)}));
  assert.throws(()=>inputVersion('0'));
  assert.throws(()=>inputVersion('9223372036854775807'));
  assert.equal(inputVersion('9007199254740993'),'9007199254740993');
  assert.throws(()=>inputObject({role:'ADMIN'},[]));
});
test('owner-approved sample is one incomplete private draft, never a publication receipt',()=>{
  const sample=require('../../../docs/fixtures/catalog-sample.json');
  const parsed=draftFields(sample.draftPayload);
  assert.equal(sample.isRealProduct,false);
  assert.equal(sample.publishAllowed,false);
  assert.equal(sample.expected.publiclyVisible,false);
  assert.equal(parsed.originEvidenceId,null);
  assert.equal(parsed.countryId,null);
  assert.ok(parsed.title.includes('MẪU KIỂM TRA'));
});
