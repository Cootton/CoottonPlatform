const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createApp}=require('../dist/main');
const {AdminIdentityGuard}=require('../dist/admin-auth');
const {AdminCatalogService}=require('../dist/admin-catalog');
const {CatalogRepository}=require('../dist/catalog');
const {UnauthorizedException,ConflictException,NotFoundException,BadRequestException,ServiceUnavailableException}=require('@nestjs/common');
const spec=require('../../../docs/contracts/openapi.json');

test('actual Nest HTTP transport:201 command/replay, safe errors, parser limits and headers',async()=>{
 const originals=[AdminIdentityGuard.prototype.canActivate,AdminCatalogService.prototype.command,CatalogRepository.prototype.image];
 const receipt={id:'11111111-1111-4111-8111-111111111111',version:'1'};
 // Transport-only fixture. No Firebase, credentials, canonical database or object storage.
 AdminIdentityGuard.prototype.canActivate=async function(ctx){if(!ctx.switchToHttp().getRequest().headers.authorization)throw new UnauthorizedException('secret-token');return true;};
 AdminCatalogService.prototype.command=async function(_request,body){if(body.action==='conflict')throw new ConflictException('VERSION_CONFLICT secret');return receipt;};
 CatalogRepository.prototype.image=async function(seller){if(seller==='invalid')throw new BadRequestException();if(seller==='missing')throw new NotFoundException();throw new ServiceUnavailableException();};
 const app=await createApp();
 try{
 await app.listen(0,'127.0.0.1');const origin=await app.getUrl(),url=origin+'/v1/admin/catalog/commands';
 const send=(body,headers={})=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json',Authorization:'Bearer fixture',...headers},body});
 const verify=async(response,status,code)=>{assert.equal(response.status,status);assert.match(response.headers.get('cache-control'),/no-store/);assert.equal(response.headers.get('x-content-type-options'),'nosniff');const data=await response.json();assert.deepEqual(Object.keys(data).sort(),['code','message','requestId']);assert.equal(data.code,code);assert.equal(data.message,code);assert.match(data.requestId,/^[0-9a-f-]{36}$/);assert.ok(!JSON.stringify(data).includes('secret'));};
 for(let attempt=0;attempt<2;attempt++){const response=await send(JSON.stringify({action:'fixture'}));assert.equal(response.status,201);assert.deepEqual(await response.json(),receipt);}
 assert.ok(spec.paths['/v1/admin/catalog/commands'].post.responses['201']);assert.equal(spec.paths['/v1/admin/catalog/commands'].post.responses['200'],undefined);
 await verify(await send(JSON.stringify({action:'conflict'})),409,'CONFLICT');
 await verify(await send('{}',{Authorization:''}),401,'AUTHENTICATION_REQUIRED');
 await verify(await send('{broken'),400,'INVALID_INPUT');
 await verify(await send('{}',{'Content-Type':'text/plain'}),415,'UNSUPPORTED_MEDIA_TYPE');
 await verify(await send(JSON.stringify({padding:'x'.repeat(12*1024*1024)})),413,'PAYLOAD_TOO_LARGE');
 for(const [path,status,code] of [['invalid',400,'INVALID_INPUT'],['missing',404,'NOT_FOUND'],['unavailable',503,'UNAVAILABLE']])await verify(await fetch(origin+'/v1/catalog/media/'+path+'/a.webp'),status,code);
 }finally{await app.close();[AdminIdentityGuard.prototype.canActivate,AdminCatalogService.prototype.command,CatalogRepository.prototype.image]=originals;}
});

test('OpenAPI: all13 operations have success schemas, safe errors and contract references',()=>{
 const operations=Object.values(spec.paths).flatMap(p=>Object.values(p));assert.equal(operations.length,13);
 for(const op of operations){assert.equal(op['x-contract-record'],'docs/contracts/API_ENDPOINT_CONTRACTS.md');for(const [status,response] of Object.entries(op.responses)){assert.ok(response.headers['Cache-Control']);assert.ok(response.content);if(Number(status)>=400)assert.equal(response.content['application/json'].schema.$ref,'#/components/schemas/SafeError');}}
 assert.ok(spec.paths['/v1/catalog/media/{seller}/{file}'].get.responses['400']);
 assert.equal(spec.paths['/v1/admin/session'].get.responses['409'],undefined);
 assert.equal(spec.components.schemas.AdminCommand.oneOf.length,13);
});
