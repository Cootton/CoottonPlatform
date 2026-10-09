const assert=require('node:assert/strict');
const {CatalogRepository}=require('../dist/catalog'),{MemoryCache}=require('../dist/memory-cache');
const {searchPlan}=require('../dist/catalog-search');
async function verifySearchDatabase(db) {
 await db.query('BEGIN');
 try {
  await db.query('CREATE SCHEMA catalog_read');
  await db.query('CREATE TABLE catalog_read.test_product(id uuid,version text,category text,title text,brand text,description text,form text,material text,origin text,care text,images jsonb,updated_at timestamptz,b2c_eligible boolean,b2b_eligible boolean,visible boolean)');
  await db.query('CREATE VIEW catalog_read.visible_product AS SELECT * FROM catalog_read.test_product WHERE visible');
  await db.query('CREATE TABLE catalog_read.test_sku(id uuid,product_id uuid,code text,color text,size text)');
  await db.query('CREATE VIEW catalog_read.visible_sku AS SELECT s.* FROM catalog_read.test_sku s WHERE EXISTS(SELECT 1 FROM catalog_read.visible_product p WHERE p.id=s.product_id)');
  const ids=[1,2,3].map(n=>'00000000-0000-4000-8000-00000000000'+n),image=[{path:'/media/'+ids[0]+'/'+ 'a'.repeat(64)+'.webp',alt:'Synthetic test only',width:600,height:800}];
  for(let i=0;i<3;i++)await db.query('INSERT INTO catalog_read.test_product VALUES($1,\'1\',\'CREWNECK_TSHIRT\',$2,$3,\'Test description\',$4,\'Cotton\',\'VN\',\'Test care\',$5,\'2026-10-09T00:00:00.123456Z\',true,$6,$7)',[ids[i],['Áo Đỏ','Áo Cotton','Áo hidden'][i],i===0?'Cootton':'Other',i===0?'Boxy':'Regular',JSON.stringify(image),i===1,i!==2]);
  for(const [i,product,code,color,size] of [[1,0,'TEST-BLK-M','Đen','M'],[2,0,'TEST-WHT-L','Trắng','L'],[3,1,'TEST-BLK-L','Đen','L']])await db.query('INSERT INTO catalog_read.test_sku VALUES($1,$2,$3,$4,$5)',['10000000-0000-4000-8000-00000000000'+i,ids[product],code,color,size]);
  const repository=new CatalogRepository(new MemoryCache());repository.database=()=>db;
  const search=query=>repository.search(query);
  assert.deepEqual((await search({q:'ao do'})).items.map(p=>p.id),[ids[0]]);
  assert.deepEqual((await search({q:'ÁO ĐỎ',brand:'cootton',form:'BOXY'})).items.map(p=>p.id),[ids[0]]);
  assert.deepEqual((await search({color:'den',size:'L'})).items.map(p=>p.id),[ids[1]]);
  assert.deepEqual((await search({q:'TEST-BLK-L'})).items.map(p=>p.id),[ids[1]]);
  assert.deepEqual((await search({mode:'B2B'})).items.map(p=>p.id),[ids[1]]);
  assert.equal((await search({q:"%' OR 1=1 --"})).items.length,0);
  const first=await search({q:'ao',limit:'1'}),second=await search({q:'ao',limit:'1',cursor:first.nextCursor});
  assert.equal(first.items.length,1);assert.equal(second.items.length,1);assert.notEqual(first.items[0].id,second.items[0].id);assert.equal(second.nextCursor,null);
  // No stale search cache after a publication withdrawal at the same source version.
  await db.query('UPDATE catalog_read.test_product SET visible=false WHERE id=$1',[ids[0]]);
  assert.equal((await search({q:'ao do'})).items.length,0);
  // Match remains literal for wildcard-looking characters.
  await db.query('UPDATE catalog_read.test_product SET title=$2 WHERE id=$1',[ids[1],'Áo 100%_Cotton']);
  assert.equal((await search({q:'%_'})).items.length,1);
  return {scenarios:10};
 } finally {await db.query('ROLLBACK');}
}
module.exports={verifySearchDatabase};
if(require.main===module)require('node:test').test('PostgreSQL search: Vietnamese, literal matching, same-SKU, keyset and withdrawal',async()=>{
 const {Client}=require('pg'),url=new URL(process.env.COOTTON_TEST_DATABASE_URL??'');
 assert.ok(['localhost','127.0.0.1','[::1]'].includes(url.hostname));assert.equal(url.pathname,'/cootton_api_test');
 const db=new Client({connectionString:url.toString()});await db.connect();try{await verifySearchDatabase(db);}finally{await db.end();}
});
