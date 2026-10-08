const assert=require('node:assert/strict'),fs=require('node:fs/promises'),syncfs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {randomUUID}=require('node:crypto'),{Module,createRequire}=require('node:module'),{Readable}=require('node:stream'),{execFile}=require('node:child_process'),{promisify}=require('node:util');
const media=require('../dist/catalog-media');
const execute=promisify(execFile);

// Actual encoder + HTTP + PostgreSQL; storage is a named transport fixture.
// Optional real GCS execution is deliberately NOT enabled by CI.
module.exports=async function videoSqlRecovery({maintenance,writer,service,send,response,admission}){
 const original=media.prepareVideo,originalDb=service.database,originalBucket=process.env.COOTTON_MEDIA_BUCKET;
 const objects=new Map();let folder,preparations=0,posterFault=true,sqlFault=true,lostCommit=true,planned;
 const real=process.env.COOTTON_API04_VIDEO_GCS_VERIFY==='two-private-unattached';let realBucket;
 if(real){assert.equal(process.env.FIREBASE_PROJECT_ID,'cootton-firebase');assert.equal(process.env.COOTTON_MEDIA_BUCKET,'cootton-catalog-media-524673981677');assert.equal(process.env.FIREBASE_AUTH_EMULATOR_HOST,undefined);realBucket=require('firebase-admin/storage').getStorage(require('../dist/firebase-app').firebaseApp()).bucket(process.env.COOTTON_MEDIA_BUCKET);const [m]=await realBucket.getMetadata();assert.equal(m.iamConfiguration?.uniformBucketLevelAccess?.enabled,true);assert.equal(m.iamConfiguration?.publicAccessPrevention,'enforced');}
 const key=randomUUID(),filename=path.resolve(__dirname,'../dist/catalog-media.js'),normal=createRequire(filename),mod=new Module(filename);mod.filename=filename;
 const storage={file:(name,options)=>({
  save:async(bytes,opts)=>{assert.equal(opts.preconditionOpts.ifGenerationMatch,0);if(posterFault&&name.startsWith('posters/')){posterFault=false;throw {code:503};}assert.ok(planned.has(name),'only two predetermined object paths permitted');if(real){await realBucket.file(name).save(bytes,opts);const [m]=await realBucket.file(name).getMetadata();objects.set(name,{...m,bytes:Buffer.from(bytes)});return;}if(objects.has(name))throw {code:412};assert.ok(objects.size<2);objects.set(name,{bytes:Buffer.from(bytes),generation:String(objects.size+1),size:String(bytes.length),contentType:opts.contentType,cacheControl:opts.metadata.cacheControl});},
  getMetadata:async()=>real?realBucket.file(name).getMetadata():[objects.get(name)],
  createReadStream:()=>{throw Error('UNEXPECTED_SDK_BODY_READ');}
 })};
 const transport=real?null:require('./media-read-fixture.cjs')(async(url,opts)=>{const u=new URL(url),name=decodeURIComponent(u.pathname.split('/o/')[1]),object=objects.get(name);assert.equal(u.searchParams.get('generation'),object.generation);assert.equal(opts.headers['Accept-Encoding'],'identity');return new Response(object.bytes,{status:206,headers:{'x-goog-generation':object.generation}});});
 mod.require=id=>id==='./media-read'&&!real?transport:id==='firebase-admin/storage'?{getStorage:()=>({bucket:()=>storage})}:id==='./firebase-app'&&!real?{firebaseApp:()=>({})}:normal(id);
 mod._compile(syncfs.readFileSync(filename,'utf8'),filename);
 const counts=async()=>Object.fromEntries(await Promise.all(['audit','outbox','command','evidence','video_asset','product_video'].map(async t=>[t,(await maintenance.query('SELECT count(*)::int AS n FROM catalog_core.'+t)).rows[0].n])));
 const unchanged=async expected=>assert.deepEqual(await counts(),expected);
 try{
  folder=await fs.mkdtemp(path.join(os.tmpdir(),'cootton-video-sql-'));
  const source=path.join(folder,'synthetic.mp4');
  await execute('ffmpeg',['-nostdin','-v','error','-f','lavfi','-i','color=c=black:s=720x406:r=30:d=0.5','-an','-c:v','libx264','-threads','1','-pix_fmt','yuv420p','-movflags','+faststart',source],{timeout:10000});
  const input=await fs.readFile(source);
  const first=await mod.exports.normalizeVideo(input),second=await mod.exports.normalizeVideo(input);
  assert.ok(first.output.equals(second.output),'same encoder must produce repeatable video bytes');assert.ok(first.poster.equals(second.poster),'poster bytes repeatable');
  assert.equal(first.width,720);assert.equal(first.height,406);assert.ok(first.durationMs>0&&first.durationMs<=60000);
  const atoms=[];for(let i=0;i+8<=first.output.length;){const n=first.output.readUInt32BE(i);assert.ok(n>=8);atoms.push(first.output.toString('ascii',i+4,i+8));i+=n;}
  assert.ok(atoms.indexOf('moov')>=0&&atoms.indexOf('moov')<atoms.indexOf('mdat'));
  const digest=bytes=>require('node:crypto').createHash('sha256').update(bytes).digest('hex');
  planned=new Set(['videos/'+key+'/'+digest(first.output)+'.mp4','posters/'+key+'/'+digest(first.poster)+'.webp']);
  if(real)console.log(JSON.stringify({id:'REL04-VIDEO-GCS-MANIFEST',key,objects:[...planned],limit:2,source:process.env.COOTTON_VERIFIED_SOURCE??'UNRECORDED',writes:'new private unattached objects retained; SQL uses disposable localhost only'}));
  else process.env.COOTTON_MEDIA_BUCKET='isolated-video-sql-fixture';
  media.prepareVideo=async(...args)=>{preparations++;return mod.exports.prepareVideo(...args);};
  const draft=await response(await send({key:randomUUID(),action:'createDraft',payload:{title:'Synthetic encoder and SQL recovery'}}),201);
  const before=await counts(),upload={key,action:'uploadVideo',id:draft.id,expectedVersion:'1',payload:{base64:input.toString('base64'),alt:'Synthetic black clip',rights:'Locally generated solid-color test fixture; no customer or licensed third-party content'}};
  service.database=()=>({query:(...args)=>writer.query(...args),connect:async()=>({query:async(sql,...args)=>{
   if(sqlFault&&sql.startsWith('INSERT INTO catalog_core.outbox')){sqlFault=false;throw Error('Isolated video SQL rollback');}
   const result=await writer.query(sql,...args);if(sql==='COMMIT'&&lostCommit){lostCommit=false;throw Error('Isolated video durable COMMIT acknowledgement lost');}return result;
  },release(){}})});
  await response(await send(upload),503,'UNAVAILABLE');assert.equal(objects.size,1);assert.equal(preparations,1);await unchanged(before);
  const videoGeneration=[...objects.values()][0].generation;
  await response(await send(upload),503,'UNAVAILABLE');assert.equal(objects.size,2);assert.equal(preparations,2);await unchanged(before);
  assert.equal((await maintenance.query('SELECT version::text FROM catalog_core.product WHERE id=$1',[draft.id])).rows[0].version,'1');
  await response(await send(upload),503,'UNAVAILABLE');assert.equal(preparations,3);assert.equal(objects.size,2);
  const durable=await counts();for(const [t,n]of Object.entries(before))assert.equal(durable[t],n+1);
  const asset=(await maintenance.query('SELECT path,poster_path,width,height,byte_length FROM catalog_core.video_asset WHERE id=$1',[key])).rows[0];
  assert.equal(asset.width,720);assert.equal(asset.height,406);assert.equal(asset.byte_length,first.output.length);
  assert.ok(objects.get(asset.path.slice(1)).bytes.equals(first.output));assert.ok(objects.get(asset.poster_path.slice(1)).bytes.equals(first.poster));
  assert.equal(objects.get(asset.path.slice(1)).generation,videoGeneration);
  const recovered=await response(await send(upload),201);assert.equal(recovered.version,'2');assert.equal(preparations,3);await unchanged(durable);
  assert.deepEqual(await response(await send(upload),201),recovered);assert.equal(preparations,3);
  await response(await send({...upload,payload:{...upload.payload,alt:'Changed'}}),409,'CONFLICT');
  await response(await send({...upload,key:randomUUID()}),409,'CONFLICT');assert.equal(preparations,3);await unchanged(durable);
  await writer.query('BEGIN');await assert.rejects(writer.query('UPDATE catalog_core.video_asset SET approved=true'),e=>e.code==='42501');await writer.query('ROLLBACK');
  await admission(false);await response(await send(upload),403,'FORBIDDEN');assert.equal(preparations,3);await unchanged(durable);await admission(true);
  const encoder=await execute('ffmpeg',['-version'],{timeout:5000,maxBuffer:16384});console.log(encoder.stdout.split('\n')[0]);
  if(real)for(const [name,m]of objects)console.log(JSON.stringify({id:'REL04-VIDEO-GCS-OBJECT',name,generation:m.generation,size:m.size,contentType:m.contentType,cacheControl:m.cacheControl}));
  console.log('REL04-VIDEO-SQL-001 PASS: actual repeatable playable encoding; HTTP poster failure, SQL rollback, lost durable COMMIT,201 replay; one attachment/evidence/audit/outbox/receipt;409 without processing; storage='+ (real?'real GCS via operator ADC':'transport fixture')+'; identity transport fixture');
 }finally{
  media.prepareVideo=original;service.database=originalDb;
  if(originalBucket===undefined)delete process.env.COOTTON_MEDIA_BUCKET;else process.env.COOTTON_MEDIA_BUCKET=originalBucket;
  await writer.query('ROLLBACK').catch(()=>{});
  if(folder)await fs.rm(folder,{recursive:true,force:true});
 }
};
