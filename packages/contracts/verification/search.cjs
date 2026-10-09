const {test}=require('node:test'),assert=require('node:assert/strict');
const {catalogSearch,normalizeSearch,searchQuery,publicSearchPage,discoveryScore,simulateCpmAuction}=require('../dist');
test('Vietnamese normalization and bounded search inputs',()=>{
 assert.equal(normalizeSearch('  Đồ ÁO   THUN '),'do ao thun');
 assert.equal(normalizeSearch('a\u0301o'),'ao');
 for(const query of [{q:['x']},{q:'x'.repeat(161)},{q:'a b c d e f g h i'},{q:'x\u0000'},{limit:'51'},{limit:20},{category:'PRIVATE'},{sellerId:'private'},{mode:'b2c'},{cursor:'bad!'}])assert.throws(()=>catalogSearch(query));
 const input=catalogSearch({mode:'B2B',q:'Áo thun',color:'Đen',size:'L',limit:'3'});
 assert.deepEqual(catalogSearch(Object.fromEntries(searchQuery(input))),input);
});
test('search response validates mode, no-commerce and cursor, strips envelope secrets',()=>{
 const safe={items:[],mode:'B2C',commerceEnabled:false,nextCursor:null};
 assert.deepEqual(publicSearchPage({...safe,secret:'private'},'B2C'),safe);
 for(const page of [{...safe,mode:'B2B'},{...safe,commerceEnabled:true},{...safe,nextCursor:'bad!'}, {...safe,items:null}])assert.throws(()=>publicSearchPage(page,'B2C'));
});
const weights={relevance:6000,verifiedReviews:2500,sellerTrust:1500};
test('quality combines explicit weights, preserves missing evidence and rejects invalid scores',()=>{
 assert.equal(discoveryScore({relevance:8000,verifiedReviews:6000,sellerTrust:10000},weights),7800);
 assert.equal(discoveryScore({relevance:8000,verifiedReviews:null,sellerTrust:10000},weights),null);
 assert.throws(()=>discoveryScore({relevance:10001,verifiedReviews:0,sellerTrust:0},weights));
 assert.throws(()=>discoveryScore({relevance:100,verifiedReviews:0,sellerTrust:0},{...weights,relevance:5900}));
});
const policy={version:'SIM-1',minRelevance:3000,minQuality:2000,reserveCpmVnd:'1000',slots:1};
function bid(id,cpm,quality=8000,extra={}){return {id,productId:'00000000-0000-4000-8000-'+String(id.charCodeAt(0)).padStart(12,'0'),cpmVnd:cpm,relevance:8000,quality,publicEligible:true,...extra};}
test('CPM auction protects relevance/publication, uses exact integers and deterministic ties',()=>{
 const rows=simulateCpmAuction([bid('a','999999999999999',10000,{relevance:2999}),bid('b','10000',6000),bid('c','9000',9000),bid('d','20000',null),bid('e','20000',9000,{publicEligible:false})],policy);
 assert.equal(rows.find(r=>r.id==='c').outcome,'SELECTED');
 assert.equal(rows.find(r=>r.id==='a').reason,'BELOW_RELEVANCE');
 assert.equal(rows.find(r=>r.id==='d').reason,'QUALITY_EVIDENCE_REQUIRED');
 assert.equal(rows.find(r=>r.id==='e').reason,'PUBLICATION_REQUIRED');
 const huge=simulateCpmAuction([bid('z','999999999999998',10000),bid('y','999999999999999',10000)],policy);
 assert.equal(huge.find(r=>r.id==='y').outcome,'SELECTED');assert.equal(huge[1].auctionScore,'9999999999999990000');
 assert.equal(simulateCpmAuction([bid('b','1000'),bid('a','1000')],policy).find(r=>r.id==='a').outcome,'SELECTED');
 assert.throws(()=>simulateCpmAuction([bid('a','1.5')],policy));
 assert.throws(()=>simulateCpmAuction([bid('a',1000)],policy));
 assert.throws(()=>simulateCpmAuction([bid('a','1000',8000,{publicEligible:'true'})],policy));
 assert.throws(()=>simulateCpmAuction([bid('a','1000'),bid('a','2000')],policy));
 assert.throws(()=>simulateCpmAuction([],{...policy,slots:0}));
});
