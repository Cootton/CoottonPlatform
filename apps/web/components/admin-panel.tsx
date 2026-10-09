'use client';
import { useRef, useState } from 'react';
import ProductPublication from './product-publication';
import { AdAuctionWorkbench } from './ad-auction-workbench';
import ProductIntake, { type Intake } from './product-intake';
import { initializeApp, getApps, type FirebaseOptions } from 'firebase/app';
import { getAuth, inMemoryPersistence, setPersistence, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';
type Product = {
    id: string;
    title: string;
    lifecycle: string;
    version: string;
};
type Detail = Product & {
    intake: Intake;
    publication:{enabled:boolean;published:boolean;issues:string[]};
    description: string;
    care: string;
    category_id: string | null;
    brand_id: string | null;
    form_id: string | null;
    country_id: string | null;
    origin_evidence_id: string | null;
    care_evidence_id: string | null;
};
type Dictionary = {
    id: string;
    kind: string;
    code: string;
    label: string;
};
const fields = [['categoryId', 'CATEGORY', 'Ngành hàng'], ['brandId', 'BRAND', 'Thương hiệu'], ['formId', 'FORM', 'Form'], ['countryId', 'COUNTRY', 'Xuất xứ']] as const;
const message = (status: number) => status === 401 ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.' : status === 403 ? 'Tài khoản này chưa được cấp quyền quản trị.' : status === 409 ? 'Thao tác chưa thể hoàn tất: dữ liệu đã thay đổi hoặc còn thiếu điều kiện. Hãy tải lại và kiểm tra.' : status === 400 ? 'Thông tin chưa hợp lệ. Vui lòng kiểm tra các trường.' : 'Chưa kết nối được hệ thống quản trị. Cần hoàn tất cấu hình đăng nhập và database.';
export default function AdminPanel({ config }: {
    config: FirebaseOptions | null;
}) {
    const [user, setUser] = useState<User | null>(null), [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [notice, setNotice] = useState(''), [items, setItems] = useState<Product[]>([]), [dictionaries, setDictionaries] = useState<Dictionary[]>([]), [detail, setDetail] = useState<Detail | null>(null), [after, setAfter] = useState<string | null>(null);
    const [applicability, setApplicability] = useState<{
        form_id: string;
        category_id: string;
    }[]>([]), [categorySelection, setCategorySelection] = useState<string | null>(null);
    const pending = useRef<{
        fingerprint: string;
        key: string;
    } | null>(null);
    async function command(value: Record<string, unknown>) {
        const fingerprint = JSON.stringify(value);
        if (pending.current && pending.current.fingerprint !== fingerprint)
            throw new Error('Thao tác trước chưa xác định kết quả. Hãy gửi lại đúng thông tin trước khi bắt đầu thao tác khác.');
        pending.current ??= { fingerprint, key: crypto.randomUUID() };
        return call('catalog/commands', { ...value, key: pending.current.key });
    }
    const auth = () => {
        if (!config)
            throw new Error('Chưa cấu hình đăng nhập Firebase.');
        const app = getApps().find(a => a.name === 'cootton-admin-web') ?? initializeApp(config, 'cootton-admin-web');
        return getAuth(app);
    };
    async function call(path: string, body?: unknown, identity: User | null = user) {
        if (!identity)
            throw new Error('Vui lòng đăng nhập.');
        const token = await identity.getIdToken();
        const response = await fetch('/api/admin/' + path, { method: body ? 'POST' : 'GET', headers: { Authorization: 'Bearer ' + token, ...(body ? { 'Content-Type': 'application/json' } : {}) }, ...(body ? { body: JSON.stringify(body) } : {}), cache: 'no-store', signal: AbortSignal.timeout(22000) });
        if (!response.ok) {
            if (body && [400, 401, 403, 404, 409].includes(response.status))
                pending.current = null;
            throw new Error(message(response.status));
        }
        return response.json();
    }
    async function run(work: () => Promise<void>) {
        if (busy)
            return;
        setBusy(true);
        setNotice('');
        try {
            await work();
        }
        catch (e) {
            setNotice(e instanceof Error ? e.message : 'Không thực hiện được thao tác.');
        }
        finally {
            setBusy(false);
        }
    }
    async function load(identity: User | null = user, cursor?: string) { const data = await call('catalog/products' + (cursor ? '?after=' + encodeURIComponent(cursor) : ''), undefined, identity); setItems(data.items); setAfter(data.nextCursor); }
    async function login(form: FormData) {
        await run(async () => {
            const identityAuth = auth();
            await setPersistence(identityAuth, inMemoryPersistence);
            let identity: User;
            try {
                identity = (await signInWithEmailAndPassword(identityAuth, String(form.get('email') ?? '').trim(), String(form.get('password') ?? ''))).user;
            }
            catch (error) {
                const code = typeof error === 'object' && error !== null && 'code' in error && typeof error.code === 'string' ? error.code : '';
                const notices: Record<string, string> = { 'auth/invalid-credential': 'Firebase không chấp nhận thông tin đăng nhập. Kiểm tra mật khẩu Firebase của tài khoản này.', 'auth/wrong-password': 'Firebase không chấp nhận thông tin đăng nhập. Kiểm tra mật khẩu Firebase của tài khoản này.', 'auth/user-not-found': 'Firebase không chấp nhận thông tin đăng nhập. Kiểm tra mật khẩu Firebase của tài khoản này.', 'auth/invalid-api-key': 'Cấu hình đăng nhập Firebase chưa hợp lệ (auth/invalid-api-key).', 'auth/api-key-not-valid.-please-pass-a-valid-api-key.': 'Cấu hình đăng nhập Firebase chưa hợp lệ.', 'auth/app-not-authorized': 'Ứng dụng chưa được Firebase cho phép đăng nhập (auth/app-not-authorized).', 'auth/unauthorized-domain': 'Tên miền chưa được Firebase cho phép đăng nhập (auth/unauthorized-domain).', 'auth/operation-not-allowed': 'Phương thức Email/mật khẩu chưa được Firebase bật (auth/operation-not-allowed).', 'auth/network-request-failed': 'Không kết nối được Firebase. Kiểm tra kết nối mạng và thử lại (auth/network-request-failed).', 'auth/too-many-requests': 'Firebase tạm giới hạn đăng nhập. Vui lòng thử lại sau (auth/too-many-requests).', 'auth/user-disabled': 'Tài khoản bị Firebase vô hiệu hóa (auth/user-disabled).' };
                throw new Error(notices[code] ?? 'Không đăng nhập được. Firebase chưa xác thực phiên; vui lòng thử lại sau.');
            }
            try {
                await call('session', undefined, identity);
                const dict = await call('catalog/dictionaries', undefined, identity);
                await load(identity);
                setDictionaries(dict.items);
                setApplicability(dict.applicability);
                setUser(identity);
                setReady(true);
                setNotice('Đã xác minh quyền quản trị.');
            }
            catch (error) {
                await signOut(identityAuth);
                setUser(null);
                setReady(false);
                throw error;
            }
        });
    }
    async function create(form: FormData) { await run(async () => { const result = await command({ action: 'createDraft', payload: { title: form.get('title') } }); await load(); setDetail(await call('catalog/products/' + result.id)); pending.current = null; setNotice('Đã lưu sản phẩm nháp. Chưa xuất bản.'); }); }
    async function save(form: FormData) {
        if (!detail)
            return;
        await run(async () => {
            const payload: Record<string, unknown> = { title: form.get('title'), description: form.get('description'), care: form.get('care'), ...(form.get('careDeclaration')?{careDeclaration:form.get('careDeclaration')}:{}) };
            for (const [key] of fields)
                payload[key] = form.get(key) || null;
            payload.originEvidenceId = detail.origin_evidence_id;
            payload.careEvidenceId = detail.care_evidence_id;
            await command({ action: 'saveDraft', id: detail.id, expectedVersion: detail.version, payload });
            const updated = await call('catalog/products/' + detail.id);
            await load();
            setDetail(updated);
            pending.current = null;
            setNotice('Đã lưu bản nháp.');
        });
    }
    return <main id="main" className="help-page"><span className="eyebrow">Cootton / Quản trị</span><h1>Quản lý sản phẩm</h1><p>Nhập dữ liệu thật, kiểm tra rồi duyệt trước khi xuất bản. Hiện chưa nhận đơn hoặc thanh toán.</p>
    {!config && <aside className="notice"><h2>Chưa cấu hình đăng nhập</h2><p>Cần cấu hình ứng dụng Firebase và xác minh tài khoản quản trị trước khi nhập dữ liệu. Không có tài khoản Admin mặc định.</p></aside>}
    {!ready ? <form action={login} className="admin-form"><label>Email<input name="email" type="email" autoComplete="username" required maxLength={254} disabled={busy || !config}/></label><label>Mật khẩu<input name="password" type="password" autoComplete="current-password" required maxLength={4096} disabled={busy || !config}/></label><button type="submit" className="admin-button" disabled={busy || !config}>{busy ? 'Đang xác minh…' : 'Đăng nhập Admin'}</button></form> : <><button type="button" onClick={() => run(async () => { await signOut(auth()); setReady(false); setUser(null); setDetail(null); setItems([]); setDictionaries([]); pending.current = null; })} disabled={busy}>Đăng xuất</button>
    <section><h2>Tạo sản phẩm nháp</h2><form action={create} className="admin-form"><label>Tên sản phẩm<input name="title" required maxLength={160}/></label><button className="admin-button" disabled={busy}>Lưu nháp</button></form></section>
    <section><h2>Danh sách lựa chọn</h2><p>Màu, size, quốc gia và định nghĩa số đo được khai báo có nguồn. Form áo dùng danh sách Cootton; không tạo form tự do.</p><form action={async (form) => run(async () => { await command({ action: 'addDictionary', payload: { kind: form.get('kind'), code: form.get('code'), token: form.get('token'), label: form.get('label'), source: form.get('source') } }); const dict = await call('catalog/dictionaries'); setDictionaries(dict.items); setApplicability(dict.applicability); pending.current = null; setNotice('Đã thêm lựa chọn.'); })} className="admin-form"><label>Loại lựa chọn<select name="kind"><option value="COLOR">Màu</option><option value="SIZE">Size</option><option value="COUNTRY">Quốc gia sản xuất</option><option value="MEASUREMENT">Định nghĩa số đo</option></select></label><label>Mã danh mục<input name="code" required pattern="[A-Z0-9_]{1,32}" maxLength={32}/></label><label>Mã gợi nhớ SKU<input name="token" required pattern="[A-Z0-9]{1,16}" maxLength={16}/></label><label>Tên hiển thị<input name="label" required maxLength={160}/></label><label>Định nghĩa và nguồn<textarea name="source" required maxLength={2000}/></label><button disabled={busy}>Thêm lựa chọn</button></form></section>
    <section><h2>Sản phẩm đã nhập</h2>{!items.length ? <p>Chưa có sản phẩm.</p> : <ul>{items.map(p => <li key={p.id}><button type="button" disabled={busy} onClick={() => run(async () => { setCategorySelection(null); setDetail(await call('catalog/products/' + p.id)); })}>{p.title || 'Bản nháp chưa có tên'} · {p.lifecycle} · phiên bản {p.version}</button></li>)}</ul>}<button type="button" disabled={busy} onClick={() => run(() => load())}>Tải lại danh sách</button>{after && <button type="button" disabled={busy} onClick={() => run(() => load(user, after))}>Trang tiếp theo</button>}</section>
    {detail && <section key={detail.id + ':' + detail.version}><h2>Thông tin bản nháp</h2>{detail.lifecycle !== 'DRAFT' ? <div><p>Sản phẩm không ở trạng thái cho phép sửa bản nháp.</p><h3>{detail.title}</h3><p>{detail.description}</p><p>Xuất xứ: {dictionaries.find(d=>d.id===detail.country_id)?.label}</p><h4>Hướng dẫn chăm sóc</h4><p>{detail.care}</p></div> : <form action={save} className="admin-form"><label>Tên sản phẩm<input name="title" defaultValue={detail.title} maxLength={160}/></label><label>Mô tả<textarea name="description" defaultValue={detail.description} maxLength={10000} rows={5}/></label><label>Hướng dẫn chăm sóc<textarea name="care" defaultValue={detail.care} maxLength={2000} rows={3}/></label><label>Nguồn hướng dẫn chăm sóc (bắt buộc khi thay đổi nội dung)<textarea name="careDeclaration" maxLength={10000}/></label>{fields.map(([key, kind, label]) => <label key={key}>{label}<select name={key} onChange={key === 'categoryId' ? e => setCategorySelection(e.target.value) : undefined} defaultValue={detail[({ categoryId: 'category_id', brandId: 'brand_id', formId: 'form_id', countryId: 'country_id' } as const)[key]] ?? ''}><option value="">Chưa chọn</option>{dictionaries.filter(d => d.kind === kind && (kind !== 'FORM' || applicability.some(a => a.form_id === d.id && a.category_id === (categorySelection ?? detail.category_id)))).map(d => <option key={d.id} value={d.id}>{d.label}</option>)}</select></label>)}<button className="admin-button" disabled={busy}>Lưu thay đổi</button></form>}
    {detail.lifecycle === 'DRAFT' && <ProductIntake key={detail.id + ':' + detail.version} intake={detail.intake} dictionaries={dictionaries} onCommand={async (action, payload) => { await run(async () => { await command({ action, id: detail.id, expectedVersion: detail.version, payload }); setDetail(await call('catalog/products/' + detail.id)); await load(); pending.current = null; setNotice(action === 'uploadImage' ? 'Đã lưu ảnh riêng tư, chưa duyệt.' : 'Đã lưu chi tiết sản phẩm.'); }); }} onMediaPreview={(kind,asset) => call('catalog/products/'+detail.id+(kind==='image'?'/images/'+asset:kind==='thumbnail'?'/thumbnails/'+asset:kind==='poster'?'/video/poster':'/video'))}/>}
    <ProductPublication intake={detail.intake} dictionaries={dictionaries} lifecycle={detail.lifecycle} publication={detail.publication} busy={busy} media={detail.intake.media} onPreview={asset=>call('catalog/products/'+detail.id+'/images/'+asset)} onCommand={async(action,payload)=>{await run(async()=>{await command({action,id:detail.id,expectedVersion:detail.version,payload});setDetail(await call('catalog/products/'+detail.id));await load();pending.current=null;setNotice('Đã cập nhật trạng thái sản phẩm.');});}}/></section>}</>}
    {ready&&<AdAuctionWorkbench products={items} inspect={id=>call('catalog/products/'+id)}/>}
    <p role="status" aria-live="polite">{notice}</p>
    <style jsx>{`.admin-form{display:grid;gap:16px;max-width:720px}.admin-form label{display:grid;gap:6px}.admin-form input,.admin-form textarea,.admin-form select{padding:12px;border:1px solid #667a70;border-radius:8px;font:inherit;background:white;color:#182e25}.admin-button{padding:12px 20px;border:0;border-radius:8px;background:#14392b;color:white;cursor:pointer}button:disabled{opacity:.5;cursor:wait}section{margin:32px 0}li{margin:10px 0}`}</style>
  </main>;
}
