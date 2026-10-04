'use client';
import {useState} from 'react';
import type {Intake} from './product-intake';
type Props={intake:Intake;dictionaries:{id:string;label:string}[];lifecycle:string;publication:{enabled:boolean;published:boolean;issues:string[]};busy:boolean;onCommand:(action:string,payload:unknown)=>Promise<void>;media:{id:string;alt:string}[];onPreview:(asset:string)=>Promise<{base64:string}>};
export default function ProductPublication({intake,dictionaries,lifecycle,publication,busy,onCommand,media,onPreview}:Props) {
  const [previews,setPreviews]=useState<Record<string,string>>({});
  const [notice,setNotice]=useState('');
  const label=(id:string)=>dictionaries.find(d=>d.id===id)?.label??'Chưa xác định';
  const run=async(action:string,payload:unknown)=>{setNotice('');try{await onCommand(action,payload);}catch{setNotice('Chưa thực hiện được. Kiểm tra trạng thái và phiên đăng nhập.');}};
  return <aside className="notice" aria-label="Duyệt và xuất bản"><h3>Duyệt và xuất bản sản phẩm</h3><p>{publication.published?'Đang hiển thị trên website người mua.':'Chưa xuất bản.'} Website chỉ giới thiệu sản phẩm, chưa nhận đơn hoặc thanh toán.</p>
  {!publication.enabled&&<p>Luồng đang chờ kích hoạt cấu hình và quyền database đã được duyệt.</p>}
  {publication.issues.length?<><h4>Cần bổ sung</h4><ul>{publication.issues.map(v=><li key={v}>{v}</li>)}</ul></>:<p>Đã đủ dữ liệu để gửi kiểm tra. Người duyệt vẫn phải xác minh nội dung và quyền sử dụng media.</p>}
  {lifecycle!=='DRAFT'&&<><h4>Dữ liệu cần kiểm tra</h4><p>Chất liệu: {intake.fabric?.description??'Thiếu'}</p><table><thead><tr><th>Màu / size</th><th>Giá bán lẻ tham khảo (VND)</th></tr></thead><tbody>{intake.variants.map(s=><tr key={s.id}><td>{label(s.color_id)} / {label(s.size_id)}</td><td>{s.price??'Thiếu'}</td></tr>)}</tbody></table><h4>Bảng size (cm)</h4><ul>{intake.chart.map(c=><li key={c.size_id+c.measurement_id}>{label(c.size_id)} / {label(c.measurement_id)}: {c.value_cm} cm</li>)}</ul></>}
  {lifecycle!=='DRAFT'&&media.map(m=><div key={m.id}><p>{m.alt}</p><button type="button" disabled={busy} onClick={async()=>{try{const d=await onPreview(m.id);setPreviews(v=>({...v,[m.id]:'data:image/webp;base64,'+d.base64}));}catch{setNotice('Không tải được ảnh để kiểm tra.');}}}>Xem ảnh để kiểm tra</button>{previews[m.id]&&<img src={previews[m.id]} alt={m.alt} width={240}/>}</div>)}
  {publication.enabled&&<>
    {lifecycle==='DRAFT'&&<button disabled={busy||!!publication.issues.length} type="button" onClick={()=>run('submit',{})}>Gửi kiểm tra</button>}
    {lifecycle==='IN_REVIEW'&&<form action={f=>run('approve',{declaration:f.get('declaration'),confirmed:f.get('confirmed')==='on'})}><fieldset disabled={busy||!!publication.issues.length}><label>Kết quả kiểm tra và nguồn xác nhận<textarea name="declaration" required maxLength={10000}/></label><label><input name="confirmed" type="checkbox" required/>Tôi đã kiểm tra thông tin, giá tham khảo, bảng size, ảnh đúng màu và quyền sử dụng toàn bộ media.</label><button>Duyệt sản phẩm</button></fieldset></form>}
    {lifecycle==='APPROVED'&&!publication.published&&<button disabled={busy||!!publication.issues.length} type="button" onClick={()=>run('publish',{})}>Xuất bản lên website</button>}
    {lifecycle!=='DRAFT'&&lifecycle!=='ARCHIVED'&&<form action={f=>run(publication.published?'unpublish':'returnDraft',{reason:f.get('reason')})}><label>Lý do ẩn hoặc trả về chỉnh sửa<textarea name="reason" required maxLength={2000}/></label><button disabled={busy}>{publication.published?'Ẩn sản phẩm và trả về nháp':'Trả về nháp'}</button></form>}
  </>}
  <p role="status">{notice}</p></aside>;
}
