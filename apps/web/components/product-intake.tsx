'use client';
import { useState } from 'react';
import ProductMedia, { type MediaIntake } from './product-media';
type Dict = {
    id: string;
    kind: string;
    label: string;
};
type Variant = {
    colorId: string;
    sizeId: string;
    price: string;
    stock: string;
    code?: string;
    tiers: {
        quantity: string;
        price: string;
    }[];
};
type Chart = {
    sizeId: string;
    measurementId: string;
    cm: string;
};
export type Intake = MediaIntake & {
    fabric: {
        description: string;
        gsm_kind: string;
        gsm_min: string | null;
        gsm_max: string | null;
    } | null;
    variants: {
        id: string;
        code: string;
        color_id: string;
        size_id: string;
        price: string | null;
        stock: string | null;
        reserved: string | null;
        tiers: {
            quantity: string;
            price: string;
        }[];
    }[];
    chart: {
        size_id: string;
        measurement_id: string;
        value_cm: string;
    }[];
    location: string | null;
    media: {
        id: string;
        width: number;
        height: number;
        approved: boolean;
        position: number;
        alt: string;
    }[];
};
export default function ProductIntake({ intake, dictionaries, onCommand, onMediaPreview }: {
    intake: Intake;
    dictionaries: Dict[];
    onCommand: (action: string, payload: unknown) => Promise<void>;
    onMediaPreview: (kind:'image'|'thumbnail'|'video'|'poster',asset?:string) => Promise<{base64:string;mime:string}>;
}) {
    const [fabric, setFabric] = useState(intake.fabric?.description ?? ''), [gsm, setGsm] = useState(intake.fabric?.gsm_kind ?? 'UNKNOWN'), [gsmMin, setGsmMin] = useState(intake.fabric?.gsm_min ?? ''), [gsmMax, setGsmMax] = useState(intake.fabric?.gsm_max ?? ''), [variants, setVariants] = useState<Variant[]>(intake.variants.map(v => ({ colorId: v.color_id, sizeId: v.size_id, price: v.price ?? '', stock: v.stock ?? '', code: v.code, tiers: v.tiers }))), [chart, setChart] = useState<Chart[]>(intake.chart.map(v => ({ sizeId: v.size_id, measurementId: v.measurement_id, cm: v.value_cm }))), [busy, setBusy] = useState(false), [error, setError] = useState('');
    const options = (kind: string) => dictionaries.filter(d => d.kind === kind).map(d => <option key={d.id} value={d.id}>{d.label}</option>);
    const update = (i: number, p: Partial<Variant>) => setVariants(rows => rows.map((v, n) => n === i ? { ...v, ...p } : v));
    async function run(work: () => Promise<void>) {
        setBusy(true);
        setError('');
        try {
            await work();
        }
        catch {
            setError('Không thực hiện được thao tác. Kiểm tra thông tin và thử lại.');
        }
        finally {
            setBusy(false);
        }
    }
    async function save(form: FormData) { await run(async () => { await onCommand('saveIntake', { declaration: form.get('declaration'), fabric, gsmKind: gsm, gsmMin: gsm === 'UNKNOWN' ? null : gsmMin, gsmMax: gsm === 'UNKNOWN' ? null : gsm === 'EXACT' ? gsmMin : gsmMax, location: form.get('location') || null, variants: variants.map(v => ({ colorId: v.colorId, sizeId: v.sizeId, price: v.price || null, stock: v.stock || null, tiers: v.tiers })), chart }); }); }
    return <section aria-label="Thông tin sản phẩm chi tiết"><h2>Chất liệu, màu–size, giá và tồn kho</h2><p>Giá lưu nháp, chưa áp dụng bán hàng. Để trống giá/tồn kho nếu chưa biết; nhập 0 chỉ khi đã xác nhận hết hàng. B2C và B2B dùng chung SKU và tồn kho.</p><form action={save} className="intake-form"><fieldset disabled={busy}>
 <label>Chất liệu vải<textarea value={fabric} onChange={e => setFabric(e.target.value)} maxLength={1000}/></label><label>Loại định lượng GSM<select value={gsm} onChange={e => setGsm(e.target.value)}><option value="UNKNOWN">Chưa xác định</option><option value="EXACT">Giá trị chính xác</option><option value="RANGE">Khoảng giá trị</option></select></label>{gsm !== 'UNKNOWN' && <label>{gsm === 'EXACT' ? 'GSM' : 'GSM tối thiểu'}<input type="number" min="0.01" max="999999.99" step="0.01" required value={gsmMin} onChange={e => setGsmMin(e.target.value)}/></label>}{gsm === 'RANGE' && <label>GSM tối đa<input type="number" min={gsmMin || '0.01'} max="999999.99" step="0.01" required value={gsmMax} onChange={e => setGsmMax(e.target.value)}/></label>}
 <h3>SKU theo màu và size</h3>{variants.map((v, i) => <fieldset key={i}><legend>SKU {i + 1}{v.code ? ' · ' + v.code : ' · mã tự sinh khi lưu'}</legend><label>Màu<select required value={v.colorId} disabled={!!v.code} onChange={e => update(i, { colorId: e.target.value })}><option value="">Chọn màu</option>{options('COLOR')}</select></label><label>Size<select required value={v.sizeId} disabled={!!v.code} onChange={e => update(i, { sizeId: e.target.value })}><option value="">Chọn size</option>{options('SIZE')}</select></label><label>Giá bán lẻ (VND)<input inputMode="numeric" pattern="[1-9][0-9]{0,29}" maxLength={30} value={v.price} onChange={e => update(i, { price: e.target.value })}/></label><label>Tồn kho có thể bán (chiếc)<input type="number" min="0" max="2147483647" step="1" value={v.stock} onChange={e => update(i, { stock: e.target.value })}/></label><p>Số lượng đang giữ: {intake.variants.find(a => a.code === v.code)?.reserved ?? 'chưa cấu hình'}</p><h4>Bậc giá bán sỉ theo SKU</h4><p>Bậc đầu bắt đầu từ 1 chiếc. Giá không tăng khi số lượng tăng.</p>{v.tiers.map((t, j) => <div key={j} className="tier"><label>Từ số chiếc<input required type="number" min="1" max="2147483647" step="1" value={t.quantity} onChange={e => update(i, { tiers: v.tiers.map((a, n) => n === j ? { ...a, quantity: e.target.value } : a) })}/></label><label>Đơn giá (VND)<input required inputMode="numeric" pattern="[1-9][0-9]{0,29}" maxLength={30} value={t.price} onChange={e => update(i, { tiers: v.tiers.map((a, n) => n === j ? { ...a, price: e.target.value } : a) })}/></label><button type="button" onClick={() => update(i, { tiers: v.tiers.filter((_, n) => n !== j) })}>Bỏ bậc</button></div>)}<button type="button" disabled={v.tiers.length >= 100} onClick={() => update(i, { tiers: [...v.tiers, { quantity: v.tiers.length ? '' : '1', price: '' }] })}>Thêm bậc giá</button>{!v.code && <button type="button" onClick={() => setVariants(rows => rows.filter((_, n) => n !== i))}>Bỏ SKU chưa lưu</button>}</fieldset>)}<button type="button" disabled={variants.length >= 100} onClick={() => setVariants(rows => [...rows, { colorId: '', sizeId: '', price: '', stock: '', tiers: [] }])}>Thêm màu–size / SKU</button>
 <label>Vị trí tồn kho của Cootton<input name="location" defaultValue={intake.location ?? ''} readOnly={!!intake.location} maxLength={160} placeholder="Nhập tên vị trí thực tế khi khai báo tồn kho"/></label>
 <h3>Bảng size (cm)</h3><p>Nhập số đo thực tế có nguồn. Không suy ra kích thước từ tên size.</p>{chart.map((c, i) => <div key={i} className="tier"><label>Size<select required value={c.sizeId} onChange={e => setChart(rows => rows.map((v, n) => n === i ? { ...v, sizeId: e.target.value } : v))}><option value="">Chọn size</option>{options('SIZE').filter(o => variants.some(v => v.sizeId === o.key))}</select></label><label>Số đo<select required value={c.measurementId} onChange={e => setChart(rows => rows.map((v, n) => n === i ? { ...v, measurementId: e.target.value } : v))}><option value="">Chọn số đo</option>{options('MEASUREMENT')}</select></label><label>Giá trị (cm)<input required type="number" min="0.01" max="999999.99" step="0.01" value={c.cm} onChange={e => setChart(rows => rows.map((v, n) => n === i ? { ...v, cm: e.target.value } : v))}/></label><button type="button" onClick={() => setChart(rows => rows.filter((_, n) => n !== i))}>Bỏ số đo</button></div>)}<button type="button" disabled={chart.length >= 200} onClick={() => setChart(rows => [...rows, { sizeId: '', measurementId: '', cm: '' }])}>Thêm số đo</button>
 <label>Nguồn và lý do cập nhật<textarea name="declaration" required maxLength={10000} placeholder="Nguồn xuất xứ, chăm sóc, chất liệu/GSM, bảng size, bảng giá, kiểm đếm tồn kho và lý do thay đổi. Không nhập thông tin khách hàng."/></label><button type="submit">Lưu chi tiết sản phẩm</button></fieldset></form>
 <ProductMedia intake={intake} colors={dictionaries.filter(d=>d.kind==='COLOR' && intake.variants.some(v=>v.color_id===d.id))} onCommand={onCommand} onPreview={onMediaPreview}/><p role="status">{error}</p>
 <style jsx>{`.intake-form{max-width:900px}.intake-form fieldset{border:1px solid #81988a;border-radius:8px;padding:16px;margin:12px 0;display:grid;gap:12px}.intake-form label{display:grid;gap:6px}.intake-form input,.intake-form textarea,.intake-form select{padding:10px;border:1px solid #667a70;border-radius:6px;font:inherit;max-width:100%;min-width:0}.tier{display:flex;gap:12px;flex-wrap:wrap}button{padding:10px;cursor:pointer}img{max-width:100%;height:auto}`}</style></section>;
}
