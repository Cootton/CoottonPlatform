# Cootton Knowledge System — repository edition v0.2.0

`KN-MASTER-002` · Review ngày 2026-10-08 · Trạng thái bộ tài liệu: PROPOSED FOR REVIEW.

Đây là điểm đọc đầu tiên của **bộ kiến thức**, sau đó Work phải tuân theo [COOTTON_MASTER_PLAN](../../COOTTON_MASTER_PLAN.md) và thứ tự đọc bắt buộc của repository. Không thay V001, contracts hay các quyết định đã có bằng bản tóm tắt này.

## Kết luận kiến trúc

Cootton đã có nền móng và luồng catalog; cần hoàn thiện bằng chứng và vận hành trước khi mở thêm chức năng. NestJS/TypeScript modular monolith, shared Next.js Web và PostgreSQL canonical là baseline đã chốt. Neon là database hiện dùng; Cloud SQL là hướng chuyển đổi có điều kiện. Launch một seller Cootton, website trước payment; CP top-up paused, CP/VC/VCS inactive. AI optional, core hoạt động khi không có AI.

```mermaid
flowchart TD
  U[Buyer và human Admin] --> W[Shared Next.js Web]
  W --> A[NestJS API /v1]
  A --> B[Canonical authorization và domain invariants]
  B --> P[(PostgreSQL trên Neon)]
  B --> M[Private media và controlled public projection]
  P --> O[Durable receipts / audit / outbox theo contract]
  O -. theo scoped activation .-> J[Bounded workers]
  A -. optional, chưa mở từ catalog .-> G[AI Tool Gateway]
  G --> I[Per-model isolation và approved tools]
```

Sơ đồ mô tả quan hệ logic. Không chứng minh các worker hay AI đang chạy. Media/private data, quyền và trạng thái publish do backend quyết định; host, URL, nhãn role và AI không tự cấp quyền. Cache là dữ liệu dẫn xuất, không thay database hoặc ledger.

## Năm lớp kiến thức thống nhất

| Lớp | Trách nhiệm | Nguồn có thẩm quyền |
|---|---|---|
| Yêu cầu và quyết định | Phạm vi launch, owner approval, invariants | V001, CURRENT_STATE, DECISIONS, D01–D10 |
| Contracts | Request/response, quyền, dữ liệu, side effects, retry/conflict | CORE, API endpoint/authz/transaction/media contracts, OpenAPI |
| Thiết kế và source | Framework, modules, database/adapters, cache, frontend | ADR, docs/engineering, apps và migrations đã áp dụng |
| Evidence và release | Source/CI/isolated/runtime/browser, rollback, reviewer signoff | Scoped checkpoints, GATE_EVIDENCE, deployment plan |
| Thư viện học tập | Patterns, Spring/Java, AI/RAG, scaling | docs/engineering và knowledge capture; adoption phải có lý do và scope |

Một ý tưởng đi từ thư viện → đề xuất áp dụng → contract/ADR → implementation theo authorization → evidence → gate/release. Không đi thẳng từ “đã học” sang production.

## Cửa đọc theo nhu cầu

1. [Review và các sửa đổi so với v0.1.0](REVIEW_REPORT.md).
2. [Bản đồ kiến thức và contract](KNOWLEDGE_MAP.md).
3. [Kế hoạch theo dependency và checkpoint](DETAILED_PLAN.md).
4. [Backlog có deliverable và tiêu chí hoàn tất](EXECUTION_BACKLOG.md).
5. [Các quyết định còn mở và ma trận bằng chứng](DECISIONS_AND_EVIDENCE.md).
6. [Nguồn, lời người dùng và giới hạn truy cập](SOURCE_EVIDENCE_REGISTER.md).

## Current checkpoint và giới hạn

Main được review tại `e06d3de8e74bc7cb431734d32d339ef63e1824ef`. ACT006 là runtime checkpoint ghi nhận trong repository, không phải source API02–04 mới đã được rollout. SQL001–006 đã áp dụng theo checkpoint, phải giữ immutable. [PR26](https://github.com/Cootton/CoottonPlatform/pull/26) head `cad72a773383a0ef145dcc1467ab5d3ea52030a4` là **unmerged overlay** được đọc riêng: browser Admin đã hồi phục trong một phiên; nguyên nhân/recurrence vẫn OPEN, cấu hình cloud được đọc nhưng effective runtime operations và release blockers còn mở.

Task này review tài liệu/source và lập kế hoạch; không chạy lại application tests hay kiểm chứng production. Không gate nào được nâng PASS bởi bộ kiến thức. Phê duyệt tổng quát của user được lưu ở source register; chỉ dẫn chiếu ACCEPTED đã có trong repository, không tự cấp ACCEPTED cho đề xuất mới.

## Adoption boundary

V1: modular monolith, bounded queries/cache, canonical authorization, durable retry/transactions, private/public projections, targeted verification. Redis, dedicated API Gateway, SSE/WebSocket và circuit breaker implementation chỉ PROPOSED khi có use case/measurement. Kafka, event sourcing, sharding, microservices, Kubernetes, multi-region active-active, graph/vector cluster là LATER. Không thêm chúng để hoàn thành một checklist học tập.

Changelog v0.2.0: chuyển từ knowledge skeleton sang repository mapping; sửa trạng thái đã triển khai/đã chốt; đưa release readiness lên trước commerce; giữ v0.1.0 làm artifact lịch sử. V001 vẫn cập nhật tại chỗ, không tạo V002.
