import { NextRequest, NextResponse } from 'next/server';

export const dynamic='force-dynamic';
const safe=(code:string,status:number)=>NextResponse.json({code,message:code,requestId:crypto.randomUUID()},{status,headers:{'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
async function forward(request:NextRequest,context:{params:Promise<{path:string[]}>}){
  const {path}=await context.params,relative=path.join('/');
  if(!['session','catalog/products','catalog/dictionaries','catalog/commands'].includes(relative)&&!/^catalog\/products\/[0-9a-f-]{36}(?:\/(?:images|thumbnails)\/[0-9a-f-]{36}|\/video(?:\/poster)?)?$/.test(relative))return safe('NOT_FOUND',404);
  const authorization=request.headers.get('authorization');
  if(!authorization||!/^Bearer [A-Za-z0-9_.-]{1,8192}$/.test(authorization))return safe('AUTHENTICATION_REQUIRED',401);
  const origin=process.env.ADMIN_WEB_ORIGIN??(process.env.NODE_ENV==='development'?'http://127.0.0.1:3000':null);
  if(!origin)return safe('UNAVAILABLE',503);
  if(request.method==='POST'&&(request.headers.get('origin')!==origin||request.headers.get('content-type')?.split(';')[0]!=='application/json'))return safe('FORBIDDEN',403);
  if(request.method==='POST'&&relative!=='catalog/commands')return safe('NOT_FOUND',404);
  if(request.method==='GET'&&relative==='catalog/commands')return safe('NOT_FOUND',404);
  let body:string|undefined;
  if(request.method==='POST'){
    const length=Number(request.headers.get('content-length')??'0');if(length>12582912)return safe('PAYLOAD_TOO_LARGE',413);
    let total=0;const chunks:Uint8Array[]=[];
    try {
      const reader=request.body?.getReader();
      if(reader){while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>12582912){await reader.cancel().catch(()=>{});return safe('PAYLOAD_TOO_LARGE',413);}chunks.push(value);}}
    }catch{return safe('INVALID_INPUT',400);}
    body=Buffer.concat(chunks).toString('utf8');
  }
  try {
    const url=new URL(process.env.ADMIN_API_ORIGIN??'http://127.0.0.1:3001');
    if(!['http:','https:'].includes(url.protocol)||url.username||url.password||url.search||url.hash)throw new Error();
    const target=new URL('/v1/admin/'+relative,url);target.search=request.nextUrl.search;
    const response=await fetch(target,{method:request.method,headers:{Authorization:authorization,'Content-Type':'application/json'},...(body!==undefined?{body}:{}),cache:'no-store',signal:AbortSignal.timeout(120000),redirect:'error'});
    if(![200,201,400,401,403,404,409,413,415,503].includes(response.status))return safe('UNAVAILABLE',503);
    return new NextResponse(await response.text(),{status:response.status,headers:{'Content-Type':'application/json','Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return safe('UNAVAILABLE',503);}
}
export const GET=forward;
export const POST=forward;
