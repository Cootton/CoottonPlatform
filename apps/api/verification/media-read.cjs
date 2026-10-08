const {test}=require('node:test'),assert=require('node:assert/strict');
const load=require('./media-read-fixture');
const name='media/11111111-1111-4111-8111-111111111111/'+'a'.repeat(64)+'.webp';
process.env.COOTTON_MEDIA_BUCKET='transport-fixture';
function fixture({chunks=[Buffer.from('bytes')],status=206,headers={},failure=false}={}){
 let calls=0,cancels=0;const seen=[];
 const reader={async read(){if(failure)throw new Error('READ_FAILED');const value=chunks.shift();return value?{done:false,value}:{done:true};},async cancel(){cancels++;},releaseLock(){seen.push('released');}};
 const native=load(async(url,opts)=>{calls++;seen.push({url,opts});return {status,headers:new Headers(headers),body:{getReader:()=>reader,cancel:async()=>{cancels++;}}};});
 return {native,calls:()=>calls,cancels:()=>cancels,seen};
}
test('fixed authenticated HTTPS endpoint, generation, identity encoding and byte bound',async()=>{
 const f=fixture();let bytes=0;await f.native.readPinnedMedia(name,'7',5,b=>bytes+=b.length);assert.equal(bytes,5);
 const {url,opts}=f.seen[0],u=new URL(url);assert.equal(u.origin,'https://storage.googleapis.com');assert.equal(u.searchParams.get('generation'),'7');assert.equal(u.searchParams.get('alt'),'media');assert.equal(decodeURIComponent(u.pathname.split('/o/')[1]),name);assert.equal(opts.redirect,'error');assert.equal(opts.headers['Accept-Encoding'],'identity');assert.equal(opts.headers.Range,'bytes=0-5');assert.ok(opts.signal.aborted);assert.equal(f.cancels(),1);assert.ok(f.seen.includes('released'));
});
test('oversize, truncation, stream errors and consumer mismatch cancel and release',async()=>{
 for(const config of [{chunks:[Buffer.alloc(6)]},{chunks:[Buffer.alloc(2)]},{failure:true},{consumer:true}]){
  const f=fixture(config);await assert.rejects(f.native.readPinnedMedia(name,'7',5,b=>{if(config.consumer)throw new Error('MISMATCH');}));assert.equal(f.cancels(),1);assert.ok(f.seen.includes('released'));
 }
});
test('denied status, transformed bytes and wrong generation cancel before consumption',async()=>{
 for(const config of [{status:403},{status:302},{headers:{'content-encoding':'gzip'}},{headers:{'content-encoding':'br'}},{headers:{'x-goog-generation':'8'}}]){
  const f=fixture(config);let consumed=0;await assert.rejects(f.native.readPinnedMedia(name,'7',5,()=>consumed++));assert.equal(consumed,0);assert.equal(f.cancels(),1);
 }
});
test('invalid bounds/generations and credential failures never start a body request',async()=>{
 for(const [generation,size] of [['0',5],['7',0],['bad',5],['7',8388609]]){const f=fixture();await assert.rejects(f.native.readPinnedMedia(name,generation,size,()=>{}));assert.equal(f.calls(),0);}
 let requests=0;const f=load(async()=>{requests++;throw Error();},()=>({options:{credential:{getAccessToken:async()=>{throw Error('AUTH_FAILED');}}}}));await assert.rejects(f.readPinnedMedia(name,'7',5,()=>{}));assert.equal(requests,0);
});
test('repeated readers use fresh streams and release every resource without limit suppression',async()=>{
 let calls=0,cancels=0,released=0;const f=load(async()=>{calls++;let done=false;return {status:200,headers:new Headers(),body:{getReader:()=>({async read(){if(done)return {done:true};done=true;return {done:false,value:Buffer.from('bytes')};},async cancel(){cancels++;},releaseLock(){released++;}})}};});
 for(let i=0;i<200;i++)await f.readPinnedMedia(name,'7',5,()=>{});assert.equal(calls,200);assert.equal(cancels,200);assert.equal(released,200);
});
