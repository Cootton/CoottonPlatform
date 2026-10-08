const {test}=require('node:test');const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const {Module,createRequire}=require('node:module');
const {getApps,deleteApp,initializeApp}=require('firebase-admin/app');
const {firebaseApp}=require('../dist/firebase-app');
// Storage transport and its credential acquisition are stubbed. The production initializer and SDK app registry are real.
test('cold public image initializes backend app without an Admin request or network',async()=>{
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';process.env.COOTTON_MEDIA_BUCKET='test-private-bucket';delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
 for(const app of getApps())await deleteApp(app);
 const sha=require('node:crypto').createHash('sha256').update('stub-webp').digest('hex');
 const transport=require('./media-read-fixture.cjs')(async()=>{downloads++;return new Response(Buffer.from('stub-webp'),{status:206,headers:{'x-goog-generation':'7'}});},()=>({options:{credential:{getAccessToken:async()=>({access_token:'transport-fixture'})}}}));
 let downloads=0;const filename=path.resolve(__dirname,'../dist/catalog-media.js');const normal=createRequire(filename);
 const mod=new Module(filename);mod.filename=filename;mod.require=id=>id==='./media-read'?transport:id==='firebase-admin/storage'?{getStorage:app=>{assert.equal(app.name,'cootton-admin');return {bucket:name=>{assert.equal(name,'test-private-bucket');return {file:p=>({getMetadata:async()=>{assert.match(p,/^media\//);return [{generation:'7',size:'9',contentType:'image/webp',cacheControl:'private, no-store'}];},download:()=>{throw Error('UNEXPECTED_SDK_BODY_READ');}})};}};}}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);
 assert.equal(getApps().length,0);
 const image=await mod.exports.previewImage('/media/11111111-1111-4111-8111-111111111111/'+sha+'.webp');
 assert.equal(Buffer.from(image.base64,'base64').toString(),'stub-webp');assert.equal(downloads,1);assert.equal(getApps().length,1);assert.equal(firebaseApp(),getApps()[0]);
 process.env.FIREBASE_PROJECT_ID='wrong-project';assert.throws(()=>firebaseApp(),/FIREBASE_NOT_CONFIGURED/);
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';process.env.FIREBASE_AUTH_EMULATOR_HOST='127.0.0.1:9099';assert.throws(()=>firebaseApp(),/FIREBASE_NOT_CONFIGURED/);delete process.env.FIREBASE_AUTH_EMULATOR_HOST;
 await deleteApp(getApps()[0]);initializeApp({projectId:'wrong-project'},'cootton-admin');assert.throws(()=>firebaseApp(),/FIREBASE_PROJECT_MISMATCH/);
 for(const app of getApps())await deleteApp(app);
 process.env.FIREBASE_PROJECT_ID='cootton-firebase';process.env.COOTTON_PUBLICATION_ENABLED='true';
 const {CatalogRepository}=require('../dist/catalog');const {MemoryCache}=require('../dist/memory-cache');
 const repository=new CatalogRepository(new MemoryCache());repository.database=()=>({query:async()=>({rowCount:0,rows:[]})});
 await assert.rejects(repository.image('11111111-1111-4111-8111-111111111111','a'.repeat(64)+'.webp'),e=>e.getStatus()===404);
 assert.equal(getApps().length,0);delete process.env.COOTTON_PUBLICATION_ENABLED;
});
