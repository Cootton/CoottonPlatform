# Requirement → decision → contract → gate → evidence

> **PREP04-CLOUD-READ-003 / EVD-REL04-CLOUD-001 · 2026-10-08 08:14 UTC:** [Cloud Shell read checkpoint](../operations/API04_CLOUD_READ_EVIDENCE_2026_10_08.md) directly confirms API100% ACT006, Web100% cootton-web-00006-7c9, immutable baseline images and matching attached-account IAM bindings. This supersedes earlier cloud-read BLOCKED/pending notices for the operator configuration read only. Web rollback identifiers are recorded; actual runtime GCS operations, rollback validation, candidate image/FFmpeg, SDK investigation, API04-RECOVERY-002 and full Production Gates remain OPEN. **NOT READY TO DEPLOY**. Older snapshots below retain historical scope.

> **PREP-REL04-001 · 2026-10-08:** [PR25 merge và release preparation](../operations/API04_RELEASE_PREPARATION_2026_10_08.md) pins merged source e06d3de8, scoped CI/cloud evidence and candidate/rollback requirements. Web login/read recovered in one observed session without a code change; historical network failure/root cause remains OPEN. Live cloud access, intended service identity, actual registry/encoder digests, SDK warning investigation and full Production Gates remain OPEN. Preparation is NOT READY TO DEPLOY; ACT006 remains last verified runtime.

> **EVD-REL04-VIDEO-SQL-001 · 2026-10-08:** [Video/SQL and Firebase follow-up](../operations/API04_VIDEO_SQL_FIREBASE_EVIDENCE_2026_10_08.md) records actual encoder + HTTP + disposable PostgreSQL recovery PASS at7e3f5ecd. CI storage/identity are transport fixtures; a subsequent real GCS + isolated PostgreSQL run PASSed with exactly two additional private video/poster objects (six total). Identity remains a fixture; SDK listener warnings are retained for investigation. Actual human Firebase source SDK verification PASSed via masked Cloud Shell (a9f5b01d), with missing/tampered401 and deployed ACT006 owner session200. Browser Web login still fails with network-request-failed; the full identity matrix remains OPEN. Historical one-run GCS evidence is preserved; no rollout or full gate PASS.

> **EVD-REL04-PREFLIGHT-001 · 2026-10-08:** Frozen main `e667bec1`; verification source PR25 `3439c676`. [Preflight/isolated checkpoint](../operations/API04_PREFLIGHT_ISOLATED_EVIDENCE_2026_10_08.md) records real HTTP/PostgreSQL uncertain-COMMIT/replay/conflict/revocation proof and one real GCS run with exactly four private unattached fixtures. Actual Firebase human admission, encoder/SQL attachment recovery and full release preflight remain OPEN. ACT006 remains deployed runtime; no rollout or full gate PASS. Older blanket “real Storage not tested” notices are superseded only for this bounded GCS scenario.

> **MERGE-API04-001 · 2026-10-08:** PR19–23 đã merge theo dependency; source baseline `d2b34490385c20de773a81fdc1e6f58ca8d4ef08`. Đọc [merge checkpoint và kế hoạch triển khai riêng](../operations/API04_MERGE_CHECKPOINT_2026_10_08.md). Các ghi chú open/stacked/source proposal trước đây là lịch sử. ACT006 vẫn là runtime checkpoint đã kiểm chứng gần nhất; task này chưa triển khai hay kiểm chứng retry/media recovery trên production. API04-RECOVERY-002 và full Production Gates vẫn OPEN.

> **ACT006-RUNTIME-001 · 2026-10-07:** Migration006 đã áp dụng/idempotent và API `cootton-api-act006-3c768d6` đã nhận100% traffic. Đọc [runtime checkpoint](../operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) để phân biệt DB rollback/storage helper/HTTP evidence. Boxy vẫn DRAFTv23; các ghi chú006 chưa áp dụng dưới đây là lịch sử. Full Production Gates chưa PASS.


> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.


`GOV-TRACE-001` · 2026-10-07. ID của kiến thức không approval. Một row “covered” chỉ nói có tài liệu, không PASS runtime.

Effective applicability: [CURRENT_STATE](CURRENT_STATE.md). Review resolutions tại [RVW-ENG-001](REVIEW.md) và [ADR-KNOWLEDGE-002](../adr/knowledge-002-review-reconciliation.md); CONFLICT-001…010 đã closed về interpretation, OPEN-001…007 là registry gồm completed documentation reconcile và remaining evidence/adoption triggers.

| Requirement ID / chủ đề | Module và stable IDs | Decision / domain authority | Production gate |
|---|---|---|---|
| REQ-001 Architecture/monolith/extraction/stateless/stateful | ENG-ARCH-001, ARCH-EXTRACT-001 | DEC-ARCH-001; ADR0001; D10 | CONTRACT, OPS, RELEASE |
| REQ-002 HTTP methods/status/HTTPS/TLS/DNS/proxies | ENG-NET-001 | CORE; D08; ADR0002 | SEC, CONTRACT |
| REQ-003 Gateway/LB/CDN/real-time | ENG-NET-001 | D09/D10; gateways/streams PROPOSED | SEC, PERF, OPS |
| REQ-004 PostgreSQL/Redis/object storage/DB types/joins | ENG-DATA-001 | DEC-DATA-001; D01–D04; ADR0002 | DATA, SEC |
| REQ-005 Partition/consistency/CAP/cache | ENG-DATA-001; ARCH-CACHE-002 | CONFLICT-002/003; D03/D04/D09 | DATA, PERF |
| REQ-006 Sync/async/queues/Kafka/batch/stream/CB | ENG-ASYNC-001, ASYNC-CB-001 | DEC-ASYNC-001; D04/D07/D10 | ASYNC, DATA, OPS |
| REQ-007 Latency/throughput/scaling/pagination/pools | ENG-PERF-001 | CORE; ADR0002; D09/D10 | PERF, OPS |
| REQ-008 Compression/logging/rate limit | ENG-PERF-001 | D08/D10 | SEC, PERF |
| REQ-009 Payment/gateway/refund/reconciliation | ENG-PAY-001 | DEC-LAUNCH-001; D04/D05/D06 | PAY, DATA, SEC, OPS |
| REQ-010 Security/threat model/AI tools | ENG-SEC-001, SEC-TOOL-001; THREAT-001…010 | DEC-SEC-001; D08; V00142/86–95 | SEC, AI |
| REQ-011 Testing/Production Gates | ENG-VERIFY-001 | DEC-VERIFY-001; V001106; D10 | All applicable gates |
| REQ-012 HLD/LLD/OOP/SOLID/patterns | ENG-LLD-001; LLD-OOP-001 | CONFLICT-001; D01–D08 | CONTRACT, DATA |
| REQ-013 Complexity/graph/tree/binary search | ENG-ALG-001; LLD-ALG-SEARCH-001 | Knowledge; D01/D09 applied boundaries | CONTRACT, PERF |
| REQ-014 Linked list 10 patterns | ENG-ALG-001; LLD-DS-LINKEDLIST-001 | Knowledge; traversal guards SEC-TOOL-001 | CONTRACT, AI |
| REQ-015 Spring internals/Git/cloud/EC2 | ENG-RUNTIME-001 | CONFLICT-001; ADR0001; D10; AWS reference | CONTRACT, OPS, RELEASE |
| REQ-016 Later/proposed advanced technologies | ENG-ARCH/ASYNC/DATA/ALG | V00149/107; ADR-KNOWLEDGE-001 | CONTRACT before adoption |
| REQ-017 Stable IDs/accepted/ADR/changelog/read order | MP-INDEX-001; GOV-DEC/TRACE-001 | SRC-OWNER-20261007 | Docs validation; not runtime gate |

Gate shorthand `DATA` = `GATE-DATA-001`, etc.; `CONTRACT` = `GATE-CONTRACT-001`. Full records/exit criteria tại [gate module](../engineering/08_TESTING_PRODUCTION_GATES.md).

## Evidence inventory

| Evidence ID | Source / result | Limits |
|---|---|---|
| EVD-BASELINE-001 | SRC-REPO-503AE0 downloaded, V001/CORE/D01–D10/ADR0001–0003 read | Exact historical source, không live infra recheck |
| EVD-DB-001 | ADR0002 reported read-only SELECT1 ngày01/10/2026 | Connectivity at that time; không commerce/restore readiness |
| EVD-CATALOG-001 | ADR0003/V001123 reported restricted empty catalog projection | No fake actual data; không public release/payment proof |
| EVD-LOCAL-131 | Local129–131 reported migration/bootstrap/keyless identity/secret scoped grants | Unmerged checkpoint, no live Admin login/draft write/deploy claimed |
| EVD-DOC-001 | Link/coverage/unchanged baseline checks in VALIDATION.md | Only document structure/integrity, no application runtime |

Module→contract links point to preserved files; future implementation rows phải thêm exact paths/lines/source SHA, test scenario và gate result. Không tạo fake code traceability khi task chưa implementing. Khi runtime change merged, thêm evidence mới; không sửa evidence lịch sử thành current PASS.

## Open work registry

| ID | Pending / trigger | Blocks |
|---|---|---|
| OPEN-001 | CLOSED for documentation: pinned PR16 synced, ADR0004/0005 imported; runtime evidence bounded by FLOW-CATALOG-001 | Merge/deployment identity still independently verified before future release |
| OPEN-002 | Ratify historical chat ACCEPTED snippets nếu cần normative policy | Redis/Spring không được chọn từ snippets |
| OPEN-003 | Catalog-only intake/review/publish checkpoint04/10; withdrawal live07/10 completed, now DRAFTv23 | Effective commerce offering remains pending before purchasing |
| OPEN-004 | Merchant/provider onboarding, actual operational policy/funding where relevant | Payment/points/marketplace activation |
| OPEN-005 | Actual auth/private sessions/grants and negative evidence | Private Admin production readiness |
| OPEN-006 | Actual hosting/budget/monitoring/backup/restore/rollback evidence | Production release |
| OPEN-007 | Measured workload justifying advanced services | Redis/Kafka/sharding/CQRS/microservices/gossip adoption |

## SYNC-PR16-001 evidence additions

| Stable ID | Source | Applicability |
|---|---|---|
| SRC-PR16-18768A1 | PR16 exact head18768a1, open07/10; V001 through141, ADR0004/0005, publication contract | Prepared source; historical activation status |
| EVD-DEPLOY-20261004 | docs/operations/CATALOG_PUBLICATION_CHECKPOINT_2026_10_04.md | Reported owner activation/migration/build/deployed catalog acceptance |
| EVD-BROWSER-20261007 | FLOW-CATALOG-001 | Observed buyer read and Admin withdraw v22→v23, detail404/list absent |
| DEC-CATALOG-001 | ADR0005 | Accepted scoped catalog-only presentation; commerce remains disabled |
| CHG-SYNC-001 | CHANGELOG | Explicit precedence correction, no silent overwrite of accepted decisions |

## Flow-level traceability and gate roll-up

[FLOW-REQ-001…005 → authority/source → evidence → gate](GATE_EVIDENCE.md) hoàn thiện traceability cho catalog journey. EVD-DEPLOY-20261004 là reported checkpoint; EVD-BROWSER-20261007 là observed scenarios; không nhập hai mức evidence thành toàn bộ gate PASS. [Screenshot buyer404](../evidence/COOTTON_WITHDRAW_BUYER_2026_10_07.png) được đóng gói cùng tài liệu để link không phụ thuộc workspace cũ.

## SYNC-PR16-006 — current source regression evidence

| Stable ID | Decision → implementation → evidence | State |
|---|---|---|
| SRC-PR16-56F8058 | PR16 head56f80580e50b43c94df65d3ae79ef025ea957123 → ADR0006 → migration006/shared Firebase initializer | Current prepared source; supersedes18768a1 implementation |
| EVD-CI-PR16-56F8058 | PR16-F001/F002 → API and disposable PostgreSQL tests → Foundation37605401243 / Container37605401224 | PASS for bounded source/CI scope; not production |
| CHG-SYNC-006 | [Source/migration reconciliation](MIGRATION006_SOURCE_SYNC.md) → source/CI/activation mapping and release recheck triggers |006 not production-applied; full gates retain open status |


## RULE-API-001 — Endpoint contract and data control · 2026-10-07

Owner ACCEPTED:

> Mỗi endpoint phải mô tả request/response, quyền truy cập, điều kiện dữ liệu, tác động nghiệp vụ, hành vi khi retry hoặc xung đột, và bằng chứng kiểm thử.

[Required endpoint fields and review record](../engineering/ENDPOINT_CONTRACT_RULE.md) · REQ-API-CONTRACT-001 · ADR-KNOWLEDGE-003. Applies to every endpoint; preserve existing accepted contracts. Compliance requires scoped implementation/test evidence; existing endpoints are not automatically certified and Production Gates remain unchanged.



## API-01 — Source inventory evidence

| Requirement / evidence | Source and coverage | Gate scope / remaining work |
|---|---|---|
| REQ-API01-INVENTORY-001 / EVD-API01-SOURCE-001 | [HTTP inventory](../engineering/API01_HTTP_INVENTORY.md); main `a2d893e3b9828cc42691ac1d9a4e299a7c41dec1`; 16 source files verified against Git blob hashes; 13 backend method/path pairs match OpenAPI; 10 logical Web proxies mapped | Inventory checks PASS only; GATE-CONTRACT-001 and SEC/DATA/RELEASE not closed. API01-F001…006 require contract/status/auth/edge-case follow-up |

RULE-API-001 is owner-authorized; its [PR19 documentation](https://github.com/Cootton/CoottonPlatform/pull/19) is a separate unmerged review dependency. No existing ADR or ACCEPTED decision changed. ACT006 runtime evidence remains bounded to its original scenarios.



## API-02 — Contract reconciliation

REQ-API-CONTRACT-002 → owner RULE-API-001 / CORE / ADR0004–0007 → [endpoint/action contracts](../contracts/API_ENDPOINT_CONTRACTS.md), OpenAPI and scoped API/Web transport changes → http-contract.cjs + web-http.cjs under existing verify:api CI → [EVD-API02-001](API02_EVIDENCE.md). API01-F001/F002/F003 corrected in prepared source/spec; F005 compatibility/query/type behavior explicit; F004/API-03 and deeper F006/API-04 remain open. No production gate-wide PASS or runtime deployment claimed.



## API-03 — Owner authorization evidence

REQ-API-AUTHZ-003 → D08/ADR0004 + singleton principal/seller migration002 + owner API-03 assignment → [matrix](../contracts/API_AUTHORIZATION_MATRIX.md), ADR0008 and central owner policy/admin identity/service source → AUTH03-IDENTITY/POLICY/REPLAY/HTTP/DB-001 → [EVD-API03-001](API03_EVIDENCE.md) → GATE-SEC/CONTRACT/DATA/RELEASE (not full PASS). API01-F004 is resolved for current single-owner boundary only; delegated grants/expiry/scopes/MFA/recovery and external media effects remain open. Evidence separates mocked identity transport, actual PostgreSQL and unchanged production runtime.



## API04-TX-001 · Owner assignment2026-10-07

| ID | Source / decision | Implementation / evidence | Remaining gate |
|---|---|---|---|
| API04-I01–I05 | RULE-API-001, D01/CORE atomic commands and durable principal-operation-key receipt | admin-catalog transaction; API04-T01–T04 in admin-authorization-db.cjs; [evidence](API04_EVIDENCE.md) | Production retry/concurrency/failover |
| API04-I06–I07 | Private immutable media, source-backed attachment | catalog-media storeImmutable/storeVideoMedia; API04-T05 media-recovery.cjs; [ADR0009](../adr/0009-command-media-recovery.md) | Real Storage generation/IAM and encoder-version compatibility |
| API04-RECOVERY-002 | [Recovery runbook](../contracts/API_TRANSACTION_MEDIA_RECOVERY.md) | PROPOSED durable intent/reconciliation/retention; no deletion implementation | Policy, reviewed migration/grants if needed, cleanup/restore proof |

No full Production Gate is promoted. This source checkpoint supersedes API-04 pending notices only within the prepared source/tests scope; ACT006 stays runtime authority.

EVD-API04-001 pins source7a3aa187 to Foundation37687748134/Container37687748147 SUCCESS (2026-10-08 Asia/Saigon); see API04_EVIDENCE.md for counts, failure history and scope limits. PR23 is the review artifact; no runtime/deployment evidence inferred.


PR23-F001 → API04-I06 / ADR0009 follow-up → catalog-media generation-pinned stream with encoding admission/local byte bound → media-recovery encoding/ignored-range/truncated tests → EVD-PR23-F001 (sourcee75e757f,Foundation37688677208/Container37688677294 SUCCESS). Finding RESOLVED for source/CI; actual Storage/runtime and full Production Gates OPEN.


## PREP04-CLOUD-READ-003 — release configuration traceability

Owner read-only preflight assignment → helper a137fbd2 → directly observed08:14Z service/traffic/attached-account IAM summary → [EVD-REL04-CLOUD-001](../operations/API04_CLOUD_READ_EVIDENCE_2026_10_08.md) → PREP04-ACCESS configured read COMPLETE; PREP04-SA runtime operations, PREP04-ENC/SDK, rollback validation, API04-RECOVERY-002 and full release gates OPEN. Candidate source remains e06d3de8; observed deployed API remains ACT006. No new ADR decision or production mutation.
