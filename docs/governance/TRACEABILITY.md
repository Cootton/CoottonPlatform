# Requirement → decision → contract → gate → evidence

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