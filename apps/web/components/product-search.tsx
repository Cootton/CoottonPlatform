'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CATEGORIES, catalogSearch, publicSearchPage, searchQuery, type CatalogSearch, type CatalogPage } from '@cootton/contracts';

export function ProductSearch({initialInput,initialPage}:{initialInput:CatalogSearch;initialPage:CatalogPage|null}) {
  const [input,setInput]=useState(initialInput),[page,setPage]=useState(initialPage);
  const [status,setStatus]=useState<'ready'|'loading'|'error'>(initialPage?'ready':'error');
  const [retry,setRetry]=useState(0),[invalid,setInvalid]=useState(false);
  const sequence=useRef(0),composing=useRef(false);
  const key=searchQuery(input).toString(),initialKey=searchQuery(initialInput).toString();
  const path=input.mode==='B2B'?'/b2b':'/';
  useEffect(()=>{
    if(invalid){setPage(null);setStatus('ready');return;}
    if(key===initialKey && retry===0) {setPage(initialPage);setStatus(initialPage?'ready':'error');return;}
    const controller=new AbortController(),generation=++sequence.current;
    setStatus('loading');setPage(null);
    const timer=setTimeout(async()=>{
      try {
        if(composing.current)return;
        const response=await fetch(`/api/catalog/search?${key}`,{cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(18000)])});
        if(!response.ok)throw Error();
        const result=publicSearchPage(await response.json(),input.mode,input.limit);
        if(generation!==sequence.current || controller.signal.aborted)return;
        setPage(result);setStatus('ready');
        const address=new URLSearchParams(key);address.delete('mode');
        window.history.replaceState(null,'',`${path}?${address}#catalog`);
      } catch {
        if(!controller.signal.aborted && generation===sequence.current){setPage(null);setStatus('error');}
      }
    },300);
    return ()=>{clearTimeout(timer);controller.abort();sequence.current++;};
  },[key,initialKey,initialPage,retry,input.mode,input.limit,path,invalid]);
  function change(field:'q'|'category'|'brand'|'form'|'color'|'size',value:string) {
    sequence.current++;
    try {
      const query=Object.fromEntries(searchQuery({...input,[field]:value || (field==='category'?null:''),cursor:null}));
      catalogSearch(query);setInput({...input,[field]:value || (field==='category'?null:''),cursor:null});setInvalid(false);setStatus('loading');setPage(null);
    } catch {setInput({...input,[field]:value,cursor:null});setInvalid(true);sequence.current++;}
  }
  const filtered=Boolean(input.q||input.category||input.brand||input.form||input.color||input.size);
  const next=page?.nextCursor?searchQuery(input,page.nextCursor):null;
  if(next)next.delete('mode');
  return <section id="catalog" className="catalog-section">
    <div className="section-heading"><div><span className="eyebrow">{input.mode==='B2C'?'Dành cho bạn':'Danh mục bán sỉ'}</span><h2>Tìm sản phẩm của bạn</h2></div><p>Khám phá sản phẩm đã được Cootton công bố.</p></div>
    <form className="search-form" action={path} method="get" onSubmit={event=>{event.preventDefault();if(!invalid)setRetry(v=>v+1);}} aria-label="Tìm và lọc sản phẩm">
      <label className="search-main">Tên sản phẩm, chất liệu hoặc mã SKU
        <div className="search-entry"><input type="search" name="q" value={input.q} maxLength={160} placeholder="Tìm sản phẩm…" autoComplete="off" aria-describedby="search-help" aria-invalid={invalid} onChange={e=>change('q',e.target.value)} onCompositionStart={()=>{composing.current=true;}} onCompositionEnd={()=>{composing.current=false;setRetry(v=>v+1);}}/><button type="submit">Tìm kiếm</button></div>
      </label>
      <p id="search-help" className="muted search-help">Có thể tìm bằng tiếng Việt có dấu hoặc không dấu. Kết quả cập nhật khi bạn gõ.</p>
      <div className="search-filters">
        <label>Danh mục<select name="category" value={input.category??''} onChange={e=>change('category',e.target.value)}><option value="">Tất cả danh mục</option>{Object.entries(CATEGORIES).map(([code,label])=><option key={code} value={code}>{label}</option>)}</select></label>
        <label>Thương hiệu<input name="brand" value={input.brand} maxLength={160} placeholder="Tất cả thương hiệu" onChange={e=>change('brand',e.target.value)}/></label>
        <label>Form<input name="form" value={input.form} maxLength={80} placeholder="Ví dụ: Boxy" onChange={e=>change('form',e.target.value)}/></label>
        <label>Màu<input name="color" value={input.color} maxLength={80} placeholder="Theo tên màu sản phẩm" onChange={e=>change('color',e.target.value)}/></label>
        <label>Kích cỡ<input name="size" value={input.size} maxLength={80} placeholder="Theo tên size sản phẩm" onChange={e=>change('size',e.target.value)}/></label>
      </div>
      <div className="search-actions"><span>Chưa nhận đơn hoặc thanh toán.</span>{filtered&&<a href={path+'#catalog'} onClick={e=>{e.preventDefault();setInput({...initialInput,q:'',category:null,brand:'',form:'',color:'',size:'',cursor:null});setInvalid(false);setRetry(v=>v+1);}}>Xóa bộ lọc</a>}</div>
    </form>
    <p className="search-status" role="status" aria-live="polite" aria-atomic="true">{invalid?'Từ khóa tối đa 160 ký tự và 8 từ; hãy rút gọn để tìm tiếp.':status==='loading'?'Đang tìm sản phẩm…':status==='error'?'Chưa tải được kết quả.':page?.items.length?`${page.items.length} sản phẩm trên trang này.`:filtered?'Không có sản phẩm phù hợp.':'Chưa có sản phẩm được công bố.'}</p>
    <div aria-busy={status==='loading'}>
      {status==='loading'&&<div className="search-loading" aria-hidden="true"><span/><span/><span/><span/></div>}
      {status==='error'&&<div className="notice" role="alert"><h3>Tìm kiếm đang tạm thời không khả dụng</h3><p>Vui lòng thử lại. Bộ lọc của bạn vẫn được giữ.</p><button className="button" type="button" onClick={()=>setRetry(v=>v+1)}>Thử lại</button></div>}
      {status==='ready'&&page?.items.length===0&&<div className="empty-state"><span className="empty-symbol" aria-hidden="true">⌕</span><h3>{filtered?'Chưa tìm thấy sản phẩm phù hợp':'Danh mục đang được chuẩn bị'}</h3><p>{filtered?'Thử từ khóa ngắn hơn hoặc bỏ bớt bộ lọc.':'Sản phẩm sẽ xuất hiện khi được công bố. Hiện chưa có dữ liệu để giới thiệu.'}</p><Link href="/huong-dan">Hướng dẫn chọn sản phẩm →</Link></div>}
      {status==='ready'&&page&&<div className="product-grid">{page.items.map(p=><Link key={p.id} className="product-card" href={`/p/${p.id}/${p.slug}${input.mode==='B2B'?'?mode=B2B':''}`}><div className="product-image">{p.images[0]&&<img src={p.images[0].path} alt={p.images[0].alt} width={p.images[0].width} height={p.images[0].height} loading="lazy"/>}</div><span className="eyebrow">{CATEGORIES[p.category]}</span><h3>{p.title}</h3><p>{p.brand}</p><span>Xem chi tiết →</span></Link>)}</div>}
      {status==='ready'&&next&&<div className="pagination"><Link className="button secondary" href={`${path}?${next}#catalog`}>Xem trang tiếp theo →</Link></div>}
    </div>
  </section>;
}
