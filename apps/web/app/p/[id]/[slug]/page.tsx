import Link from 'next/link';
import { notFound } from 'next/navigation';
import { parseEntityId, CATEGORIES } from '@cootton/contracts';
import { getProduct } from '../../../../lib/catalog';
type Props={params:Promise<{id:string;slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>};
export const dynamic='force-dynamic';
export async function generateMetadata({params}:Props){
  const {id}=await params;
  try{parseEntityId(id);const data=await getProduct(id);if(!data)return {title:'Không tìm thấy sản phẩm — Cootton'};
    const p=data.product;return {title:`${p.title} — ${p.brand}`,description:`${p.title}. ${p.material}. Xuất xứ: ${p.origin}. Xem thông tin màu và kích thước; website chưa nhận thanh toán.`,alternates:{canonical:`/p/${p.id}/${p.slug}`}};
  }catch{return {title:'Sản phẩm — Cootton'};}
}
export default async function Product({params,searchParams}:Props){
  const {id}=await params, query=await searchParams;
  try{parseEntityId(id);}catch{notFound();}
  if(Object.keys(query).some(k=>!['mode','skuAfter'].includes(k))||(query.mode!==undefined&&query.mode!=='B2C'&&query.mode!=='B2B')||Array.isArray(query.skuAfter))notFound();
  let data;
  try{data=await getProduct(id,query.skuAfter);}catch{return <main id="main" className="help-page"><div className="notice" role="alert"><h1>Chưa tải được sản phẩm</h1><p>Vui lòng thử lại sau ít phút.</p><Link href="/">Quay lại danh mục</Link></div></main>;}
  if(!data)notFound();
  const p=data.product, after=new URLSearchParams();if(query.mode==='B2B')after.set('mode','B2B');if(data.skus.nextCursor)after.set('skuAfter',data.skus.nextCursor);
  return <main id="main" className="product-page"><nav aria-label="Đường dẫn"><Link href="/">Cootton</Link><span> / {CATEGORIES[p.category]} / {p.title}</span></nav><div className="product-layout"><div className="gallery">{p.images.map((image,i)=><img key={image.path} src={image.path} alt={image.alt} width={image.width} height={image.height} loading={i===0?'eager':'lazy'} fetchPriority={i===0?'high':'auto'}/>)}</div><section><span className="eyebrow">{p.brand} / {CATEGORIES[p.category]}</span><h1>{p.title}</h1><p className="description">{p.description}</p><dl><dt>Chất liệu</dt><dd>{p.material}</dd><dt>Xuất xứ</dt><dd>{p.origin}</dd>{p.form&&<><dt>Form</dt><dd>{p.form}</dd></>}<dt>Chăm sóc</dt><dd>{p.care}</dd></dl><h2>Màu và kích thước</h2><ul className="sku-list">{data.skus.items.map(s=><li key={s.id}><strong>{s.color} · {s.size}</strong><small>{s.code}</small>{s.price&&<span>Giá tham khảo: {new Intl.NumberFormat('vi-VN').format(BigInt(s.price))} ₫</span>}</li>)}</ul>{data.skus.nextCursor&&<Link href={`/p/${p.id}/${p.slug}?${after}`}>Xem thêm màu và kích thước →</Link>}<h2>Bảng size</h2>{data.chart?.length?<table><thead><tr><th>Size</th><th>Số đo</th><th>cm</th></tr></thead><tbody>{data.chart.map(c=><tr key={c.size+c.measurement}><td>{c.size}</td><td>{c.measurement}</td><td>{c.cm}</td></tr>)}</tbody></table>:<p>Xem số đo trong mô tả sản phẩm.</p>}<aside className="notice"><h2>Chưa mở mua hàng</h2><p>Giá hiển thị là giá tham khảo của catalog. Hiện chưa nhận đơn hoặc thanh toán.</p></aside></section></div></main>;
}
