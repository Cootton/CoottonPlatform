const {test}=require('node:test');
const assert=require('node:assert/strict');
const {MemoryCache}=require('../dist/memory-cache');
test('coalesces reads, isolates returned values and expires entries',async()=>{
  let time=0,calls=0,release;
  const cache=new MemoryCache(undefined,()=>time);
  const load=()=>{calls++;return new Promise(r=>release=r);};
  const a=cache.read('a',100,load),b=cache.read('a',100,load);
  release({items:[1]}); const first=await a; await b; first.items.push(2);
  assert.equal(calls,1); assert.deepEqual(await cache.read('a',100,load),{items:[1]});
  time=101; assert.deepEqual(await cache.read('a',100,async()=>({items:[3]})),{items:[3]});
});
test('invalidation fences late fills and validation fails closed',async()=>{
  const cache=new MemoryCache();let release;
  const pending=cache.read('a',1000,()=>new Promise(r=>release=r));
  cache.invalidate();release({version:1});await pending;
  assert.equal(cache.stats().entries,0);
  await cache.read('a',1000,async()=>({version:2}));
  assert.deepEqual(await cache.read('a',1000,async()=>({version:3}),async()=>false),{version:3});
  await assert.rejects(cache.read('a',1000,async()=>({version:4}),async()=>{throw Error('DB unavailable');}));
});
test('bounded LRU, oversized bypass and failed loads do not populate',async()=>{
  const cache=new MemoryCache({bytes:100,entries:2,itemBytes:50,pending:2});
  await cache.read('a',1000,async()=>1);await cache.read('b',1000,async()=>2);
  await cache.read('a',1000,async()=>9);await cache.read('c',1000,async()=>3);
  assert.equal(cache.stats().evictions,1);assert.equal(cache.stats().entries,2);
  await cache.read('big',1000,async()=>'x'.repeat(100));assert.equal(cache.stats().entries,2);
  await assert.rejects(cache.read('error',1000,async()=>{throw Error('failed');}));
  assert.equal(cache.stats().pending,0);assert.ok(cache.stats().bytes<=100);
});
