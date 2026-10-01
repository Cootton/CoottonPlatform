import { NextRequest, NextResponse } from 'next/server';
import { getProduct } from './lib/catalog';
import { parseEntityId } from '@cootton/contracts';
export async function proxy(request:NextRequest){
  const [, ,id,slug]=request.nextUrl.pathname.split('/');
  if(!id||!slug)return NextResponse.next();
  try{
    const valid=parseEntityId(id),data=await getProduct(valid);
    if(data&&(decodeURIComponent(slug)!==data.product.slug||id!==data.product.id)){
      const target=request.nextUrl.clone();target.pathname=`/p/${data.product.id}/${data.product.slug}`;
      return NextResponse.redirect(target,301);
    }
  }catch{/* Product page handles missing/unavailable without leaking details. */}
  return NextResponse.next();
}
export const config={matcher:'/p/:id/:slug'};
