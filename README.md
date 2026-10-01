# Cootton Platform

Nền móng monorepo cho sàn thời trang Web + Android/iOS. Core dùng chung, AI tùy chọn. Đây chưa phải sản phẩm commerce đã triển khai.

## Cấu trúc

- apps/api: NestJS modular monolith, hiện chỉ /v1/health/live.
- apps/web: Next.js shared Web shell, chưa mở mua bán hoặc seller/admin; noindex trong giai đoạn foundation.
- packages/contracts: ID, VND, API types dùng chung; không là schema database.
- docs/contracts: contract boundaries, OpenAPI và pending business decisions.
- COOTTON_WORKING_V001.md: plan đầy đủ hiện hành, dữ liệu riêng đã che.

## Chạy nền móng

Node 24 và pnpm 10.34.6. `pnpm install --frozen-lockfile`, `pnpm build`, `pnpm check`, `pnpm verify:contracts`. Dùng `pnpm dev:api` (localhost:3001) và `pnpm dev:web` (localhost:3000). Development commands không là deployment; CI chạy kiểm tra, không ghi Cloud/database.

Đọc [contracts](docs/contracts/CORE.md), [ADR](docs/adr/0001-foundation.md) và [plan](COOTTON_WORKING_V001.md) trước task. Không tạo schema, migrations, credentials hay tính toán thanh toán bằng các giá trị chưa chốt. Chưa kết nối Firebase/Cloud SQL hoặc provider.

Không commit secrets, dữ liệu khách hàng hay thông tin ngân hàng. Chỉ cập nhật V001 tại chỗ; snapshot mới cần owner yêu cầu. AI không có quyền tự nâng quyền hoặc chia sẻ model memory.
