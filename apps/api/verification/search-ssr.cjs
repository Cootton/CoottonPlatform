const http=require('node:http'),{spawn}=require('node:child_process'),assert=require('node:assert/strict');
const root=require('node:path').resolve(__dirname,'../../..'),node=process.execPath;
(async()=>{
 const backend=http.createServer((request,response)=>{response.setHeader('Content-Type','application/json');response.end(JSON.stringify({items:[],nextCursor:null,mode:new URL(request.url,'http://fixture').searchParams.get('mode')??'B2C',commerceEnabled:false}));});
 await new Promise(resolve=>backend.listen(0,'127.0.0.1',resolve));
 const availablePort=http.createServer();await new Promise(resolve=>availablePort.listen(0,'127.0.0.1',resolve));const webPort=availablePort.address().port;await new Promise(resolve=>availablePort.close(resolve));
 const port=backend.address().port,child=spawn(node,[root+'/node_modules/next/dist/bin/next','start','-p',String(webPort),'-H','127.0.0.1'],{cwd:root+'/apps/web',env:{...process.env,CATALOG_API_ORIGIN:'http://127.0.0.1:'+port},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let output='';child.stdout.on('data',v=>output+=v);child.stderr.on('data',v=>output+=v);
 try{
  for(let i=0;i<60;i++){try{await fetch('http://127.0.0.1:'+webPort+'/');break;}catch{await new Promise(resolve=>setTimeout(resolve,200));}}
  const read=async path=>{const response=await fetch('http://127.0.0.1:'+webPort+path);assert.equal(response.status,200);return response.text();};
  const home=await read('/?q=ao&color=den&size=L');assert.ok(home.includes('Tìm sản phẩm của bạn'));assert.ok(home.includes('name="q"'));assert.ok(home.includes('name="size"'));assert.ok(home.includes('noindex'));assert.ok(home.includes('Không có sản phẩm phù hợp'));assert.ok(!home.includes('name="CPM"'));
  const b2b=await read('/b2b?q=ao');assert.ok(b2b.includes('Danh mục bán sỉ'));
  const invalid=await read('/?sellerId=private');assert.ok(invalid.includes('Bộ lọc chưa hợp lệ'));
  const error=await fetch('http://127.0.0.1:'+webPort+'/api/catalog/search?q=a&q=b');assert.equal(error.status,400);assert.equal(error.headers.get('cache-control'),'no-store');
  const page=await fetch('http://127.0.0.1:'+webPort+'/api/catalog/search?q=ao');assert.equal(page.status,200);assert.equal((await page.json()).commerceEnabled,false);
  const admin=await read('/admin');assert.ok(!admin.includes('Bảng đấu thầu CPM'));assert.ok(admin.includes('đăng nhập')||admin.includes('Đăng nhập'));
  console.log('PASS: production Next HTTP/SSR, B2B, noindex, filters, safe BFF and unauthenticated Admin hiding (6 scenarios).');
 }finally{child.kill();await new Promise(resolve=>backend.close(resolve));}
})().catch(error=>{console.error(error);process.exitCode=1});
