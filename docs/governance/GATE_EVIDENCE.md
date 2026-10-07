# Gate evidence sau synchronization

> **MERGE-API04-001 · 2026-10-08:** PR19–23 đã merge theo dependency; source baseline `d2b34490385c20de773a81fdc1e6f58ca8d4ef08`. Đọc [merge checkpoint và kế hoạch triển khai riêng](../operations/API04_MERGE_CHECKPOINT_2026_10_08.md). Các ghi chú open/stacked/source proposal trước đây là lịch sử. ACT006 vẫn là runtime checkpoint đã kiểm chứng gần nhất; task này chưa triển khai hay kiểm chứng retry/media recovery trên production. API04-RECOVERY-002 và full Production Gates vẫn OPEN.

> **ACT006-RUNTIME-001 · 2026-10-07:** Migration006 đã áp dụng/idempotent và API `cootton-api-act006-3c768d6` đã nhận100% traffic. Đọc [runtime checkpoint](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) để phân biệt DB rollback/storage helper/HTTP evidence. Boxy vẫn DRAFTv23; các ghi chú006 chưa áp dụng dưới đây là lịch sử. Full Production Gates chưa PASS.


> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.


`GOV-GATE-EVD-001` · 2026-10-07 · Review tài liệu bởi Codex; không thay approval của owner/domain/security/operations reviewers.

Nguồn: [pinned PR16](https://github.com/Cootton/CoottonPlatform/pull/16) head `18768a1ded3be76d4df9a0960369170b50c72850`; [checkpoint 04/10](../operations/CATALOG_PUBLICATION_CHECKPOINT_2026_10_04.md); [browser 07/10](CATALOG_FLOW_EVIDENCE.md). Checkpoint là reported evidence; browser là observed evidence cho scenario ghi rõ. Runtime revision/digest được checkpoint báo, chưa introspect lại. Product cuối DRAFTv23; không public commerce.

## Requirement → authority → evidence → gate

| Requirement | Authority / executable source tại pinned PR | Evidence | Gate và giới hạn |
|---|---|---|---|
| FLOW-REQ-001 Nhập facts/SKU/chart/media có nguồn | D01, ADR0004; apps/api/src/product-intake.ts; apps/web/app/admin/page.tsx | EVD-DEPLOY-20261004, 16SKU/12chart/5ảnh | CONTRACT/DATA/PUBLISH: historical actual acceptance; không re-run intake07/10 |
| FLOW-REQ-002 Review snapshot và publication version | ADR0005, CATALOG_PUBLICATION; apps/api/migrations/005_catalog_publication.sql; apps/api/src/catalog-publication.ts | EVD-DEPLOY-20261004, source-change rejection và authenticated review/publish | DATA/PUBLISH: reported; receipt/concurrency/crash matrix chưa independently audited |
| FLOW-REQ-003 Buyer đọc đúng DTO/catalog-only | ADR0005/CATALOG_PUBLICATION; apps/api/src/catalog.ts; apps/web/app/p/[id]/[slug]/page.tsx | EVD-BROWSER-20261007: detail16SKU/chart/5ảnh trước withdraw | PUBLISH/SEC: visible UI verified; không kiểm toàn bộ private-field negatives |
| FLOW-REQ-004 Withdraw chặn subsequent reads | ADR0005/CATALOG_PUBLICATION; publication service + public views + media guard | EVD-BROWSER-20261007: v22→v23, detail404/list absent, một URL ảnh bị từ chối | PUBLISH: scoped acceptance observed; chưa kiểm cả5URL/race/multiple instances trong lượt này |
| FLOW-REQ-005 Không commerce/AI/indexing activation | DEC-LAUNCH-001, ADR0005, D04/D08/D10 | Checkpoint và buyer UI chưa mua hàng; contract commerceEnabled=false | PAY/AI/RELEASE: disabled scope; không tự gắn NOT_APPLICABLE khi chưa reviewer signoff |

Executable paths ở bảng thuộc full PR repository, không phải files trong documentation bundle. Stable source SHA là locator; không dựng fake line numbers. Thay HEAD phải đối chiếu lại paths/contracts trước implementation.

## Gate roll-up

| Gate ID | Trạng thái tổng | Evidence hiện có / còn thiếu |
|---|---|---|
| GATE-CONTRACT-001 | NOT_EVALUATED | Pinned contracts/ADR có; compatibility/domain reviewer signoff cho release chưa có |
| GATE-DATA-001 | NOT_EVALUATED | Checkpoint migration/idempotent rerun/receipts báo PASS; thiếu independent replay/concurrency/unknown-commit proof và receiptv23 |
| GATE-SEC-001 | NOT_EVALUATED | Owner authenticated withdraw observed; checkpoint unauth401/private media; thiếu revoked/cross-principal/cross-resource/security negative coverage |
| GATE-ASYNC-001 | NOT_EVALUATED | Outbox records được checkpoint báo; không proof consumer crash/retry/reorder recovery. Outbox tồn tại nên không tự N/A |
| GATE-PERF-001 | NOT_EVALUATED | Source bounded cache có; chưa workload/SLO/pool/latency evidence |
| GATE-PAY-001 | BLOCKED | Commerce/payment disabled; provider/finality/reconciliation/funding chưa đủ để activation |
| GATE-AI-001 | BLOCKED | Không mở inference/tools từ catalog flow; chưa denial/isolation/egress evidence cho activation |
| GATE-OPS-001 | NOT_EVALUATED | Deployment checkpoint có digest/revisions; thiếu budget/monitoring/duty/independent restore/reconciliation evidence |
| GATE-RELEASE-001 | BLOCKED | Đã có scoped historical catalog deployment; general/public commerce/indexing release thiếu applicable gates/signoff; PR16 chưa merge |
| GATE-PUBLISH-001 | NOT_EVALUATED | Selected catalog journey có reported+observed acceptance; full eligibility/privacy/race matrix và reviewer acceptance chưa đủ cho gate-wide PASS |

**Không gate tổng nào được promote PASS từ docs sync.** Selected scenario thành công được lưu đúng mức evidence, không phủ nhận deployment đã xảy ra và không coi deployment là full readiness.

Recheck triggers: code/schema/auth/media/cache/permission changes; redeploy hoặc traffic revision change; republish/product version change; review source expiry hoặc quyền media thay đổi; release scope mở commerce/indexing/AI. Current v23 evidence không đảm bảo publication tương lai. Owner/domain/operations reviewer và execution scope phải được ghi khi đóng gate; không invent reviewer approval hay thời hạn expiry.

## API04 scoped overlay · 2026-10-07

[API04 evidence](API04_EVIDENCE.md) records source CI proof separately from production. Real disposable DB and Storage transport fixtures exercise API04-I01–I07; no production crash/failover, real Storage retry, orphan cleanup or restore is claimed. API04-RECOVERY-002 remains OPEN. Full gates and ACT006 runtime checkpoint are unchanged.
