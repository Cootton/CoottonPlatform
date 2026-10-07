import { NextResponse } from 'next/server';
export const dynamic='force-dynamic';
const hidden=(status:number)=>new NextResponse(null,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export async function GET(_request:Request,{params}:{params:Promise<{seller:string;file:string}>}) {
  const {seller,file}=await params;
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(seller)||! /^[a-f0-9]{64}\.webp$/.test(file))return hidden(404);
  try {
    const origin=new URL(process.env.CATALOG_API_ORIGIN??'http://127.0.0.1:3001');
    if(!['http:','https:'].includes(origin.protocol)||origin.username||origin.password||origin.search||origin.hash)throw Error();
    const response=await fetch(new URL('/v1/catalog/media/'+seller+'/'+file,origin),{cache:'no-store',redirect:'error',signal:AbortSignal.timeout(20000)});
    if(!response.ok)return hidden(response.status===404?404:503);
    if(response.headers.get('content-type')!=='image/webp')throw Error();
    const reader=response.body?.getReader();if(!reader)throw Error();
    const chunks:Uint8Array[]=[];let size=0;
    while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>3145728){await reader.cancel();throw Error();}chunks.push(value);}
    return new NextResponse(Buffer.concat(chunks),{headers:{'Content-Type':'image/webp','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
  }catch{return hidden(503);}
}
