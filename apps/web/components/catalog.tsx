import Link from 'next/link';
import { catalogSearch, searchQuery, type SalesMode } from '@cootton/contracts';
import { searchCatalog } from '../lib/catalog';
import { ProductSearch } from './product-search';

type Search=Record<string,string|string[]|undefined>;
export async function Catalog({mode,search}:{mode:SalesMode;search:Search}) {
  const path=mode==='B2B'?'/b2b':'/';
  let input;
  try {
    if(search.mode!==undefined) throw Error();
    input=catalogSearch({...search,mode});
  } catch {return <section className="notice" role="alert"><h2>Bộ lọc chưa hợp lệ</h2><p>Hãy chọn lại bộ lọc để tiếp tục.</p><Link href={path}>Xem tất cả</Link></section>;}
  let page=null;
  try {page=await searchCatalog(input);} catch { /* Render a recoverable unavailable state, never false empty. */ }
  return <ProductSearch key={searchQuery(input).toString()} initialInput={input} initialPage={page}/>;
}
