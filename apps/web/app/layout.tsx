import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';
export const metadata: Metadata = { title: 'Cootton', robots: { index: false, follow: false } };
export default function Layout({ children }: { children: ReactNode }) {
  return <html lang="vi"><body><a className="skip-link" href="#main">Đến nội dung chính</a><header className="site-header"><Link className="wordmark" href="/" aria-label="Cootton — trang chủ">cootton</Link><nav aria-label="Điều hướng chính"><Link href="/#catalog">Sản phẩm</Link><Link href="/b2b">Bán sỉ</Link><Link href="/huong-dan">Hướng dẫn</Link></nav><span className="header-note">THỜI TRANG · COOTTON</span></header>{children}<footer><Link className="wordmark" href="/">cootton</Link><p>Khám phá thời trang theo cách của bạn.</p><Link href="/huong-dan">Hướng dẫn chọn sản phẩm</Link><small>Website hiện giới thiệu danh mục. Chưa nhận đơn hoặc thanh toán.</small></footer></body></html>;
}
