import Link from 'next/link';
import { CATEGORIES, category, type SalesMode } from '@cootton/contracts';
import { listCatalog } from '../lib/catalog';

type Search=Record<string,string|string[]|undefined>;
export async function Catalog({mode,search}:{mode:SalesMode;search:Search}){
  const path=mode==='B2B'?'/b2b':'/';
  let selected:ReturnType<typeof category>;
  let cursor:string|undefined;
  try{
    if(Object.keys(search).some(key=>!['category','cursor'].includes(key))) throw new Error();
    selected=category(search.category);
    if(search.cursor!==undefined && (typeof search.cursor!=='string'||!/^[A-Za-z0-9_-]{1,1024}$/.test(search.cursor))) throw new Error();
    cursor=search.cursor;
  }catch{return <section className="notice" role="alert"><h2>Bộ lọc chưa hợp lệ</h2><p>Hãy chọn lại danh mục để tiếp tục.</p><Link href={path}>Xem tất cả</Link></section>;}
  const query=new URLSearchParams({mode});
  if(selected)query.set('category',selected);if(cursor)query.set('cursor',cursor);
  let page;
  try{page=await listCatalog(query);}catch{
    return <section className="notice" role="alert"><span className="eyebrow">Vui lòng thử lại</span><h2>Chưa tải được danh mục</h2><p>Danh mục đang tạm thời không khả dụng. Bạn có thể tải lại trang sau ít phút.</p><a className="button" href={path}>Tải lại danh mục</a></section>;
  }
  const next=new URLSearchParams();if(selected)next.set('category',selected);if(page.nextCursor)next.set('cursor',page.nextCursor);
  return <section id="catalog" className="catalog-section">
    <div className="section-heading"><div><span className="eyebrow">{mode==='B2C'?'Dành cho bạn':'Dành cho bán sỉ'}</span><h2>Khám phá Cootton</h2></div><p>Chọn một danh mục để tìm sản phẩm.</p></div>
    <nav className="categories" aria-label="Danh mục sản phẩm"><Link className={!selected?'selected':''} href={path} aria-current={!selected?'page':undefined}>Tất cả</Link>{Object.entries(CATEGORIES).map(([code,label])=><Link key={code} href={`${path}?category=${code}`} className={selected===code?'selected':''} aria-current={selected===code?'page':undefined}>{label}</Link>)}</nav>
    {page.items.length===0?<div className="empty-state"><span className="empty-symbol" aria-hidden="true">↗</span><span className="eyebrow">Một khởi đầu mới</span><h3>{cursor?'Bạn đã xem hết danh mục':'Sản phẩm sẽ sớm có mặt'}</h3><p>{selected?'Danh mục này chưa có sản phẩm được công bố.':'Cootton đang chuẩn bị danh mục sản phẩm. Hãy quay lại để khám phá những thiết kế mới.'}</p><Link href="/huong-dan">Tìm hiểu cách chọn sản phẩm <span aria-hidden="true">→</span></Link></div>:
    <div className="product-grid">{page.items.map(p=><Link key={p.id} className="product-card" href={`/p/${p.id}/${p.slug}${mode==='B2B'?'?mode=B2B':''}`}><div className="product-image">{p.images[0]&&<img src={p.images[0].path} alt={p.images[0].alt} width={p.images[0].width} height={p.images[0].height} loading="lazy"/>}</div><span className="eyebrow">{CATEGORIES[p.category]}</span><h3>{p.title}</h3><p>{p.brand}</p><span>Xem chi tiết →</span></Link>)}</div>}
    {page.nextCursor&&<div className="pagination"><Link className="button secondary" href={`${path}?${next}`}>Xem trang tiếp theo →</Link></div>}
  </section>;
}
