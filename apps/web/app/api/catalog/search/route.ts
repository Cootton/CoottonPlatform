import { catalogSearch } from '@cootton/contracts';
import { searchCatalog } from '../../../../lib/catalog';
export const dynamic='force-dynamic';
const headers={'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'};
export async function GET(request:Request):Promise<Response> {
  const params=new URL(request.url).searchParams, query:Record<string,string>={};
  let input;
  try {
    for(const [key,value] of params) {if(Object.hasOwn(query,key)) throw Error();query[key]=value;}
    input=catalogSearch(query);
  } catch {return Response.json({code:'INVALID_INPUT'},{status:400,headers});}
  try {return Response.json(await searchCatalog(input),{headers});}
  catch {return Response.json({code:'UNAVAILABLE'},{status:503,headers});}
}
