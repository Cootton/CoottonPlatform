'use client';
import { useState } from 'react';
import { discoveryScore,simulateCpmAuction,type AuctionBid,type DiscoveryWeights } from '@cootton/contracts';
type Product={id:string;title:string;version:string};
const reasons={PUBLICATION_REQUIRED:'Chưa được công bố',QUALITY_EVIDENCE_REQUIRED:'Thiếu điểm chất lượng',BELOW_RELEVANCE:'Không đủ độ khớp',BELOW_QUALITY:'Không đủ chất lượng',BELOW_RESERVE:'Dưới giá sàn'};
export function AdAuctionWorkbench({products,inspect}:{products:readonly Product[];inspect:(id:string)=>Promise<{version:string;lifecycle:string;publication:{enabled:boolean;published:boolean}}>}) {
  const [weights,setWeights]=useState<DiscoveryWeights>({relevance:6000,verifiedReviews:2500,sellerTrust:1500});
  const [bids,setBids]=useState<AuctionBid[]>([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const [reserve,setReserve]=useState('0'),[slots,setSlots]=useState(1),[minRelevance,setMinRelevance]=useState(3000),[minQuality,setMinQuality]=useState(0);
  let rows:ReturnType<typeof simulateCpmAuction>=[];
  let policyError='';
  try{discoveryScore({relevance:0,verifiedReviews:0,sellerTrust:0},weights);rows=simulateCpmAuction(bids,{version:'CPM-SIMULATION-001',slots,minRelevance,minQuality,reserveCpmVnd:reserve});}catch{policyError='Kiểm tra tổng trọng số 100%, giá sàn nguyên VND, số vị trí 1–4 và điểm trong khoảng 0–100.';}
  async function add(form:FormData) {
    setError('');setBusy(true);
    try {
      const id=String(form.get('product')),product=products.find(p=>p.id===id);
      if(!product)throw Error('Hãy chọn sản phẩm hiện có.');
      const signal=(key:string)=>{const value=String(form.get(key)??'');return value===''?null:Number(value)*100;};
      const relevance=signal('relevance');if(relevance===null)throw Error('Cần điểm độ khớp mô phỏng.');
      const quality=discoveryScore({relevance,verifiedReviews:signal('reviews'),sellerTrust:signal('trust')},weights);
      const current=await inspect(id);
      const response=await fetch('/api/catalog/products/'+id+'/visibility',{cache:'no-store',signal:AbortSignal.timeout(18000)});
      if(!response.ok&&response.status!==404)throw Error('Chưa xác minh được khả năng hiển thị công khai. Hãy thử lại.');
      const visible=response.ok?await response.json():null;
      const publicEligible=current.lifecycle==='APPROVED'&&current.publication.enabled&&current.publication.published&&visible?.id===id&&visible?.version===current.version;
      const bid:AuctionBid={id:crypto.randomUUID(),productId:id,cpmVnd:String(form.get('cpm')),relevance,quality,publicEligible};
      const next=[...bids.filter(b=>b.productId!==id),bid];
      simulateCpmAuction(next,{version:'CPM-SIMULATION-001',slots,minRelevance,minQuality,reserveCpmVnd:reserve});
      setBids(next);
    } catch(e){setError(e instanceof Error?e.message:'Không tính được bảng đấu thầu.');}finally{setBusy(false);}
  }
  return <section className="auction-workbench"><span className="eyebrow">COOTTON / QUẢNG CÁO</span><h2>Bảng đấu thầu CPM</h2>
    <p><strong>Mô phỏng — chưa phát quảng cáo hoặc thu phí.</strong> Chỉ dùng sản phẩm trong trang quản trị đang mở. Dữ liệu điểm nhập bên dưới là giả định để tính thử; không phải đánh giá đã xác minh.</p>
    <details><summary>Trọng số và quy tắc đề xuất</summary><div className="search-filters">{([['relevance','Độ khớp từ khóa'],['verifiedReviews','Đánh giá đã xác minh'],['sellerTrust','Độ tin cậy người bán']] as const).map(([key,label])=><label key={key}>{label} (%)<input type="number" min="0" max="100" step="1" value={weights[key]/100} onChange={e=>{setWeights({...weights,[key]:Number(e.target.value)*100});setBids([]);}}/></label>)}</div><p>Tổng trọng số phải bằng 100%. Điểm thiếu bằng chứng sẽ để trống. Đổi trọng số sẽ xóa các lượt tính cũ.</p>
      <div className="search-filters"><label>Giá sàn CPM (VND)<input inputMode="numeric" value={reserve} onChange={e=>setReserve(e.target.value)}/></label><label>Số vị trí mô phỏng<input type="number" min="1" max="4" value={slots} onChange={e=>setSlots(Number(e.target.value))}/></label><label>Độ khớp tối thiểu (%)<input type="number" min="0" max="100" value={minRelevance/100} onChange={e=>setMinRelevance(Number(e.target.value)*100)}/></label><label>Chất lượng tối thiểu (%)<input type="number" min="0" max="100" value={minQuality/100} onChange={e=>setMinQuality(Number(e.target.value)*100)}/></label></div>
      <p>Đề xuất: ưu tiên giá CPM × điểm chất lượng, hòa điểm xét chất lượng rồi ID. Giá trả là giá đã đặt theo mô hình giá thứ nhất. Các quy tắc này cần được duyệt trước khi dùng thực tế.</p></details>
    <form action={add} className="admin-form"><label>Sản phẩm hiện có<select name="product" required><option value="">Chọn sản phẩm</option>{products.map(p=><option key={p.id} value={p.id}>{p.title}</option>)}</select></label>
      <label>Giá đặt cho 1.000 lượt hiển thị hợp lệ (VND)<input name="cpm" inputMode="numeric" pattern="[1-9][0-9]{0,14}" required/></label>
      <div className="search-filters">{[['relevance','Độ khớp mô phỏng'],['reviews','Điểm đánh giá mô phỏng'],['trust','Điểm tin cậy mô phỏng']].map(([key,label])=><label key={key}>{label} (0–100)<input name={key} type="number" min="0" max="100" step="1" required={key==='relevance'}/></label>)}</div>
      <button className="button" disabled={busy||products.length===0||Boolean(policyError)}>{busy?'Đang kiểm tra sản phẩm…':'Thêm vào bảng tính thử'}</button></form>
    <p role="alert">{policyError||error}</p><div className="auction-table"><table><caption>Người quảng cáo: Cootton. Kết quả mô phỏng cho các mức giá nhập trong phiên này.</caption><thead><tr><th scope="col">Sản phẩm</th><th scope="col">CPM đã đặt</th><th scope="col">Chất lượng</th><th scope="col">Kết quả</th><th scope="col">Thao tác</th></tr></thead><tbody>{rows.map(row=><tr key={row.id}><td>{products.find(p=>p.id===row.productId)?.title??row.productId}</td><td>{row.cpmVnd} VND</td><td>{row.quality===null?'Thiếu dữ liệu':row.quality/100+'%'}</td><td>{row.reason?reasons[row.reason]:row.outcome==='SELECTED'?'Được chọn trong mô phỏng':'Ngoài số vị trí'}</td><td><button type="button" onClick={()=>setBids(bids.filter(b=>b.id!==row.id))} aria-label={'Xóa mức giá của '+(products.find(p=>p.id===row.productId)?.title??'sản phẩm')}>Xóa</button></td></tr>)}</tbody></table></div>
    {!bids.length&&<p>Chưa có mức giá nào. Dữ liệu chỉ giữ trong phiên, không lưu lên hệ thống.</p>}
  </section>;
}
