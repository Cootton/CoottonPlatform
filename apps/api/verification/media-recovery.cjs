const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),{Module,createRequire}=require('node:module');
const {Readable}=require('node:stream');
function fixture({ignoreRange=false}={}){
 const objects=new Map();let failPoster=false,downloads=0,bytesSent=0;const saves=[],streams=[];
 const filename=path.resolve(__dirname,'../dist/catalog-media.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 const storage={file:(name,options)=>({
  save:async(bytes,opts)=>{saves.push(name);assert.equal(opts.preconditionOpts.ifGenerationMatch,0);if(failPoster&&name.startsWith('posters/'))throw {code:503};if(objects.has(name))throw {code:412};objects.set(name,{bytes:Buffer.from(bytes),generation:'7',size:String(bytes.length),contentType:opts.contentType,cacheControl:opts.metadata.cacheControl});},
  getMetadata:async()=>[objects.get(name)],
  createReadStream:()=>{throw Error('UNEXPECTED_SDK_BODY_READ');}
 })};
 const reader=require('./media-read-fixture')(async(url,opts)=>{const parsed=new URL(url),name=decodeURIComponent(parsed.pathname.split('/o/')[1]),object=objects.get(name);downloads++;assert.equal(parsed.hostname,'storage.googleapis.com');assert.equal(parsed.searchParams.get('generation'),object.generation);assert.equal(opts.redirect,'error');assert.equal(opts.headers['Accept-Encoding'],'identity');const range={start:0,end:Number(opts.headers.Range.split('-')[1])};assert.equal(range.end,Number(object.size));const bytes=ignoreRange?object.bytes:object.bytes.subarray(0,range.end+1);let offset=0;const stream=new Readable({highWaterMark:1,read(){if(offset===bytes.length){this.push(null);return;}const chunk=bytes.subarray(offset,offset+3);offset+=chunk.length;bytesSent+=chunk.length;this.push(chunk);}});streams.push(stream);return new Response(Readable.toWeb(stream),{status:206,headers:{'x-goog-generation':object.generation}});});
 mod.require=id=>id==='./media-read'?reader:id==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>storage})}:id==='./firebase-app'?{firebaseApp:()=>({})}:normal(id);
 mod._compile(fs.readFileSync(filename,'utf8'),filename);process.env.COOTTON_MEDIA_BUCKET='recovery-fixture';
 return {media:mod.exports,objects,saves,streams,failPoster:value=>failPoster=value,downloads:()=>downloads,bytesSent:()=>bytesSent};
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
test('gzip and unsupported encodings are rejected before opening any stream',async()=>{
 const f=fixture(),name='/media/11111111-1111-4111-8111-111111111111/'+'a'.repeat(64)+'.webp',bytes=Buffer.from('fixture');
 await f.media.storeImmutable(name,bytes,'image/webp');const object=f.objects.get(name.slice(1));
 for(const encoding of ['gzip','br','deflate','unknown','']){object.contentEncoding=encoding;await assert.rejects(f.media.storeImmutable(name,bytes,'image/webp'),e=>e.getStatus()===503&&e.message==='MEDIA_RECOVERY_CONFLICT');}
 assert.equal(f.downloads(),0);assert.equal(f.bytesSent(),0);assert.equal(f.streams.length,0);
 object.contentEncoding='identity';await f.media.storeImmutable(name,bytes,'image/webp');assert.equal(f.downloads(),1);
});
test('storage ignoring range is stopped at the local byte limit without consuming the tail',async()=>{
 const f=fixture({ignoreRange:true}),name='/media/11111111-1111-4111-8111-111111111111/'+'a'.repeat(64)+'.webp',bytes=Buffer.from('fixture');
 await f.media.storeImmutable(name,bytes,'image/webp');const object=f.objects.get(name.slice(1));
 // Metadata still claims the expected size; transport returns a much larger body.
 object.bytes=Buffer.concat([bytes,Buffer.alloc(1024*1024)]);
 await assert.rejects(f.media.storeImmutable(name,bytes,'image/webp'),e=>e.getStatus()===503&&e.message==='MEDIA_RECOVERY_CONFLICT');
 assert.equal(f.streams.length,1);assert.equal(f.streams[0].destroyed,true);assert.ok(f.bytesSent()<32,'oversized remainder must not be consumed');assert.equal(f.objects.size,1);
});
test('truncated stream fails integrity verification and releases the stream',async()=>{
 const f=fixture(),name='/media/11111111-1111-4111-8111-111111111111/'+'a'.repeat(64)+'.webp',bytes=Buffer.from('fixture');
 await f.media.storeImmutable(name,bytes,'image/webp');f.objects.get(name.slice(1)).bytes=bytes.subarray(0,3);
 await assert.rejects(f.media.storeImmutable(name,bytes,'image/webp'),e=>e.getStatus()===503);assert.equal(f.streams[0].destroyed,true);
});
test('partial video write resumes existing verified video and creates missing poster without overwrite',async()=>{
 const f=fixture(),result={output:Buffer.from('normalized video fixture'),poster:Buffer.from('normalized poster fixture')},key='11111111-1111-4111-8111-111111111111';
 f.failPoster(true);await assert.rejects(f.media.storeVideoMedia(result,key),e=>e.getStatus()===503);assert.equal(f.objects.size,1);
 f.failPoster(false);const stored=await f.media.storeVideoMedia(result,key);assert.equal(f.objects.size,2);assert.equal(f.downloads(),1);
 await f.media.storeVideoMedia(result,key);assert.equal(f.objects.size,2);assert.equal(f.downloads(),3);assert.ok(f.objects.has(stored.path.slice(1)));assert.ok(f.objects.has(stored.posterPath.slice(1)));
});
