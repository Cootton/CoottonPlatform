const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{Module,createRequire}=require('node:module');
function fixture(){
 const objects=new Map();let failPoster=false,downloads=0;const saves=[];
 const filename=path.resolve(__dirname,'../dist/catalog-media.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 const storage={file:(name,options)=>({
  save:async(bytes,opts)=>{saves.push(name);assert.equal(opts.preconditionOpts.ifGenerationMatch,0);if(failPoster&&name.startsWith('posters/'))throw {code:503};if(objects.has(name))throw {code:412};objects.set(name,{bytes:Buffer.from(bytes),generation:'7',size:String(bytes.length),contentType:opts.contentType,cacheControl:opts.metadata.cacheControl});},
  getMetadata:async()=>[objects.get(name)],
  download:async range=>{downloads++;const object=objects.get(name);assert.equal(options.generation,object.generation);assert.equal(range.start,0);return [object.bytes.subarray(0,range.end+1)];}
 })};
 mod.require=id=>id==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>storage})}:id==='./firebase-app'?{firebaseApp:()=>({})}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);process.env.COOTTON_MEDIA_BUCKET='recovery-fixture';
 return {media:mod.exports,objects,saves,failPoster:value=>failPoster=value,downloads:()=>downloads};
}
test('immutable retry verifies exact bytes, generation, size, type and private cache metadata',async()=>{
 const f=fixture(),name='/media/11111111-1111-4111-8111-111111111111/'+'a'.repeat(64)+'.webp',bytes=Buffer.from('fixture');
 await f.media.storeImmutable(name,bytes,'image/webp');await f.media.storeImmutable(name,bytes,'image/webp');assert.equal(f.downloads(),1);
 const object=f.objects.get(name.slice(1));
 for(const change of [o=>o.bytes=Buffer.from('corrupt'),o=>o.size='999999999',o=>o.contentType='text/html',o=>o.cacheControl='public',o=>o.generation=undefined]){
  const saved={...object};change(object);await assert.rejects(f.media.storeImmutable(name,bytes,'image/webp'),e=>e.getStatus()===503&&e.message==='MEDIA_RECOVERY_CONFLICT');Object.assign(object,saved);
 }
 assert.equal(f.objects.size,1);assert.equal(object.bytes.toString(),'fixture');
});
test('partial video write resumes existing verified video and creates missing poster without overwrite',async()=>{
 const f=fixture(),result={output:Buffer.from('normalized video fixture'),poster:Buffer.from('normalized poster fixture')},key='11111111-1111-4111-8111-111111111111';
 f.failPoster(true);await assert.rejects(f.media.storeVideoMedia(result,key),e=>e.getStatus()===503);assert.equal(f.objects.size,1);
 f.failPoster(false);const stored=await f.media.storeVideoMedia(result,key);assert.equal(f.objects.size,2);assert.equal(f.downloads(),1);
 await f.media.storeVideoMedia(result,key);assert.equal(f.objects.size,2);assert.equal(f.downloads(),3);assert.ok(f.objects.has(stored.path.slice(1)));assert.ok(f.objects.has(stored.posterPath.slice(1)));
});
