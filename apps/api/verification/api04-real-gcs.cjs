// Manual cloud verification only; deliberately excluded from credential-free CI.
// REL04-GCS-001. Run only after operator approval of this bounded write manifest.
const assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {Module,createRequire}=require('node:module'),{randomUUID,createHash}=require('node:crypto');
const {getStorage}=require('firebase-admin/storage'),sharp=require('sharp');
const {firebaseApp}=require('../dist/firebase-app');
(async()=>{
 if(process.env.COOTTON_API04_GCS_VERIFY!=='isolated-unattached' ||
    process.env.FIREBASE_PROJECT_ID!=='cootton-firebase' ||
    process.env.COOTTON_MEDIA_BUCKET!=='cootton-catalog-media-524673981677')throw Error('EXPLICIT_TEST_SCOPE_REQUIRED');
 const realBucket=getStorage(firebaseApp()).bucket(process.env.COOTTON_MEDIA_BUCKET);
 const metadata=(await realBucket.getMetadata())[0];
 assert.equal(metadata.iamConfiguration?.uniformBucketLevelAccess?.enabled,true);
 assert.equal(metadata.iamConfiguration?.publicAccessPrevention,'enforced');
 const run=randomUUID(),image=await sharp({create:{width:1,height:1,channels:3,background:'#eeeeee'}}).webp().toBuffer();
 assert.ok(image.length<1024);
 const digest=createHash('sha256').update(image).digest('hex');
 const imagePath='/media/'+run+'/'+digest+'.webp',gzipKey=randomUUID(),gzipPath='/media/'+gzipKey+'/'+digest+'.webp',videoKey=randomUUID();
 const manifest={id:'REL04-GCS-001',run,source:process.env.COOTTON_VERIFIED_SOURCE??'UNRECORDED',bucket:process.env.COOTTON_MEDIA_BUCKET,imagePath,gzipPath,videoKey,writes:'four new private objects; no overwrite/delete/DB/publication',identity:'existing ADC; record actual principal separately without tokens'};
 console.log(JSON.stringify(manifest));
 let streams=0,failPoster=true;
 // Delegate to the actual SDK. The sole injected fault denies the first poster
 // creation locally, after a real immutable video write. No permission is changed.
 const bucket={file:(name,options)=>{
  const file=realBucket.file(name,options);
  return {save:async(...args)=>{if(failPoster&&name.startsWith('posters/'+videoKey+'/')){failPoster=false;throw {code:503};}return file.save(...args);},getMetadata:(...args)=>file.getMetadata(...args),createReadStream:(...args)=>{streams++;return file.createReadStream(...args);}};
 }};
 const filename=path.resolve(__dirname,'../dist/catalog-media.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 mod.require=id=>id==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>bucket})}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);
 await mod.exports.storeImmutable(imagePath,image,'image/webp');
 const initial=(await realBucket.file(imagePath.slice(1)).getMetadata())[0];
 await mod.exports.storeImmutable(imagePath,image,'image/webp');
 const reused=(await realBucket.file(imagePath.slice(1)).getMetadata())[0];
 assert.equal(reused.generation,initial.generation);assert.equal(streams,1);
 await realBucket.file(gzipPath.slice(1)).save(image,{resumable:false,gzip:true,contentType:'image/webp',preconditionOpts:{ifGenerationMatch:0},metadata:{cacheControl:'private, no-store'}});
 const gzip=(await realBucket.file(gzipPath.slice(1)).getMetadata())[0];assert.equal(gzip.contentEncoding,'gzip');
 const before=streams;await assert.rejects(mod.exports.storeImmutable(gzipPath,image,'image/webp'),e=>e.getStatus()===503);assert.equal(streams,before);
 // Persistence-only bytes, never a playable/public product video or encoder test.
 const normalized={output:Buffer.from('Synthetic private persistence fixture only'),poster:image};
 await assert.rejects(mod.exports.storeVideoMedia(normalized,videoKey),e=>e.getStatus()===503);
 const recovered=await mod.exports.storeVideoMedia(normalized,videoKey);
 const firstVideo=(await realBucket.file(recovered.path.slice(1)).getMetadata())[0];
 await mod.exports.storeVideoMedia(normalized,videoKey);
 const lastVideo=(await realBucket.file(recovered.path.slice(1)).getMetadata())[0];
 assert.equal(lastVideo.generation,firstVideo.generation);
 for(const name of [imagePath,gzipPath,recovered.path,recovered.posterPath]){
  const m=(await realBucket.file(name.slice(1)).getMetadata())[0];assert.equal(m.cacheControl,'private, no-store');
  console.log(JSON.stringify({id:'REL04-GCS-OBJECT',name,generation:m.generation,size:m.size,contentType:m.contentType,contentEncoding:m.contentEncoding??'identity'}));
 }
 console.log('REL04-GCS-001 PASS: real immutable generation reuse, compressed-object rejection before stream, partial poster recovery; private objects retained');
})().catch(()=>{console.error('REL04-GCS-001 FAILED: stop and retain private manifest; no automatic cleanup');process.exitCode=1;});
