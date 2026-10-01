import { Catalog } from '../../components/catalog';
export const dynamic='force-dynamic';
export const metadata={title:'Cootton — Danh mục bán sỉ',description:'Khám phá danh mục B2B Cootton. Giá, bậc số lượng và điều kiện mua được công bố theo dữ liệu sản phẩm khi sẵn sàng; chưa nhận đơn hoặc thanh toán.'};
export default async function Wholesale({searchParams}:{searchParams:Promise<Record<string,string|string[]|undefined>>}){
  return <main id="main"><section className="page-intro"><span className="eyebrow">COOTTON / B2B</span><h1>Thời trang.<br/>Theo số lượng của bạn.</h1><p>Danh mục dành cho bán sỉ. Khi sản phẩm được công bố, giá và bậc số lượng sẽ đi theo từng SKU; điều kiện tối thiểu được xác định cho phần đơn của Cootton.</p><p className="muted">Hiện chưa nhận đơn hoặc thanh toán.</p></section><Catalog mode="B2B" search={await searchParams}/></main>;
}
