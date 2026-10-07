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

Đọc [contracts](docs/contracts/CORE.md), [ADR](docs/adr/0001-foundation.md) và [plan](COOTTON_WORKING_V001.md) trước task. Không tạo schema, migrations, credentials hay tính toán thanh toán bằng các giá trị chưa chốt. Đã chuẩn bị connector Neon PostgreSQL và xác nhận SELECT 1 chỉ đọc. Xem [cấu hình kết nối](docs/adr/0002-neon-connection.md). Chưa tạo schema, kết nối commerce hoặc triển khai ứng dụng.

Không commit secrets, dữ liệu khách hàng hay thông tin ngân hàng. Chỉ cập nhật V001 tại chỗ; snapshot mới cần owner yêu cầu. AI không có quyền tự nâng quyền hoặc chia sẻ model memory.

## Catalog website

Read-only buyer catalog now connects to Neon PostgreSQL through a restricted API role. Home/category/B2B/help/product pages implemented; actual catalog starts empty. See [setup and evidence](CATALOG_SETUP.md). No purchase/payment activation or public production deployment claimed. Runtime private .env.catalog is ignored; original owner read-check .env is not the API runtime identity.


## Master Plan and evidence

Start with [COOTTON_MASTER_PLAN](COOTTON_MASTER_PLAN.md), then [CURRENT_STATE](docs/governance/CURRENT_STATE.md), [traceability](docs/governance/TRACEABILITY.md) and [gate evidence](docs/governance/GATE_EVIDENCE.md). These documents distinguish pinned PR16 source, the reported 2026-10-04 deployment checkpoint and observed 2026-10-07 withdrawal to DRAFTv23. Read the current evidence overlay before historical pending-status headers. Catalog acceptance does not certify commerce or general production readiness.
