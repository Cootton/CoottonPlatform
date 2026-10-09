import { parseEntityId } from '@cootton/contracts';
import { getProduct } from '../../../../../../lib/catalog';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}):Promise<Response> {
  let id:string;
  try {id=parseEntityId((await params).id);if(new URL(request.url).search)throw Error();}
  catch{return Response.json({code:'INVALID_INPUT'},{status:400,headers});}
  try {
    const value=await getProduct(id);
    if(!value)return Response.json({code:'NOT_FOUND'},{status:404,headers});
    return Response.json({id:value.product.id,version:value.product.version,commerceEnabled:false},{headers});
  } catch {return Response.json({code:'UNAVAILABLE'},{status:503,headers});}
}
