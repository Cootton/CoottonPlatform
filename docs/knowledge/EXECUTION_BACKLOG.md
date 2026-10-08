# Backlog bàn giao cho Work

`KN-BACKLOG-002` · v0.2.0 · **Tất cả work packages mới là PROPOSED**. Thứ tự theo [plan](DETAILED_PLAN.md); nguồn chi tiết ở [register](SOURCE_EVIDENCE_REGISTER.md). Owner bên dưới là vai trò cần phân công, chưa là account/grant hoặc reviewer đã signoff.

Scope DOC = biên soạn/review tài liệu; ISO = planned isolated execution; READ = planned bounded runtime read; RELEASE/BIZ = cần scoped assignment/approval trước mutation. Task hiện tại chỉ thực hiện DOC. Không tự chuyển việc ở bảng sang IN_PROGRESS hoặc DONE từ historical evidence.

| ID / ưu tiên | Dependency | Việc và deliverable | Exit checks | Owner / scope / nguồn |
|---|---|---|---|---|
| KN-W01 / P1 | — | Reconcile authority/main/PR26; frozen task record | SHA/head/env/runtime tách biệt, newest supersession scoped | Work + maintainer / DOC / SRC-R01,R06 |
| KN-W02 / P1 | W01 | Review knowledge mapping và scope general approval | Không ACCEPTED mới khi thiếu approval specific; không V002 | Owner + domain reviewer / DOC / SRC-U01,R02 |
| KN-W03 / P1 | W01 | Candidate artifact manifest và Web/API compatibility | Exact immutable digest/base/encoder recorded; missing artifact STOP | Release engineer / DOC→ISO→RELEASE / R05,R06 |
| KN-W04 / P1 | W01 | Sanitized live config/SQL-state recheck packet | Observed vs reported; applied001–006 hash unchanged; no secret values | Ops + data / READ / R04,R06 |
| KN-W05 / P1 | W04 | Intended-identity GCS generation operation matrix | Pinned bytes/metadata/preconditions; ADC evidence không substitute; no new grants | Security + ops / READ, bounded fixture write riêng / R05,R06 |
| KN-W06 / P1 | W05 | Actual SDK listener investigation report | Safe stack, repeated existing reads, listeners/handles/RSS; no suppression or unproven no-leak claim | API + ops / READ/ISO / R05,R06 |
| KN-W07 / P1 | W03 | Encoder/retry compatibility evidence | Candidate repeatability; old/new normalization differences handled; same key recover integrity | API + quality / ISO / API04,R06 |
| KN-W08 / P1 | W01 | Human auth browser/identity follow-up matrix | Recorded recovery scoped; recurrence/revoked/expired/nonowner/verifier outage cases attributed correctly | Security + Web / DOC→ISO/READ / R05,R06 |
| KN-W09 / P1 | W03,W04 | Rollback manifest và protection regression review | API retained image; Web latestRevision mapping decision; older auth/retry protection regression contained | Ops + security / DOC→ISO / R04,R06 |
| KN-W10 / P1 | W03,W06 | Resource/monitoring/stop threshold packet | Encoder workload, latency/error budget and observation windows accepted, no invented SLO | Ops + owner / DOC→ISO / D10,R06 |
| KN-W11 / P1 | W05,W07,W08,W09,W10 | Applicable release gate matrix/reviewer packet | Exact checks/V01–V08/R01–R02/evidence and signoff; unresolved blockers explicit | Domain/security/ops reviewers / DOC / R05,R06 |
| KN-W12 / P1 | W11 + explicit approval | Execute gated API04 rollout when assigned | No-traffic checks, approved traffic mapping, immutable checkpoint, rollback triggers | Authorized release operator / RELEASE / existing deploy plan |
| KN-W13 / P1 | W01 | API05 catalog scope and endpoint matrix | Existing API01 inventory reconciled with actual current source; label proposed, not new contract | API/Web + domain / DOC / API01–04,D01,D08 |
| KN-W14 / P1 | W13,W08,W07 | Isolated catalog end-to-end acceptance | Facts→media→review→publish→withdraw; retry/stale/denial/cache races, no invented actual data | Quality + API/Web / ISO / D01, publication/media |
| KN-W15 / P1 | W12,W14 + exact product scope | Controlled runtime catalog acceptance if assigned | Source/revision/product version/identity fixed; private/public checks; no implicit republish | Owner + authorized operator / BIZ/READ / R04,D09 |
| KN-W16 / P1 | W01 | Recovery002 policy/design packet | Durable intent/lifecycle/references/retention/grace/audit decisions reviewed; no delete/migration | Owner + data + ops / DOC / API04-RECOVERY-002 |
| KN-W17 / P1 | W16 + execution scope | Isolated recovery/restore/reconcile rehearsal | Crash/unknown COMMIT/receipt/visibility restoration; actual restore evidence when assigned | Data + ops + quality / ISO / D10,API04 |
| KN-W18 / P2 | W13,W14 | API/cache/pool capacity baseline | Representative bounded workload, indexes/pool/latency evidence; add infra only if measured need | API + ops / ISO / engineering03/05 |
| KN-W19 / P2 | W11,W16,W17 | Catalog operational handoff and duty ownership | Alert/reconcile/runbook/checkpoint reviewer ownership; gate dispositions limited to evidence | Ops + owner / DOC / D10 |
| KN-W20 / P2 | W14,W19 | Commerce delta readiness packet | Reuse D02–D06; tender/provider/finality/shipping policies resolved or explicitly blocked | Owner + finance/domain/security / DOC / D02–D06 |
| KN-W21 / P2 | W20 + commerce coding assignment | Proposed single-seller vertical slice specification | D04/D05 executable dependencies, accepted quote/holds/order/payment unknown tests; no points activation | Domain + API + quality / DOC then separate coding scope / D03,D04,D05 |
| KN-W22 / P3 | W02 + actual AI use case | Optional AI feature proposal/eval plan | Processing/egress/ACL/isolation/tools/cost/evals approved; core still independent | AI + security + owner / DOC / D08,engineering07 |
| KN-W23 / P3 | W18 + measured bottleneck | Optional scaling proposal/ADR | Measured problem/alternatives/cost/rollback; Redis etc not mandatory, no stack reset | Architecture + ops / DOC / engineering01/03/05 |

## Work package record bắt buộc khi nhận việc

ID → assignee/reviewer → authorized action scope → source SHA và artifact digest → contract IDs → environment/identity → preconditions/dependencies → inputs/output → acceptance matrix → rollback/stop conditions → sanitized evidence locators → approval reference → status/recheck triggers. Không có một field thì giữ OPEN/TBD, không tự điền người, ngày hoặc policy.

## Hoàn tất review tài liệu lần này

Bộ knowledge, review, mapping, plan, backlog và register đã được biên soạn. W01/W02 vẫn cần maintainer/owner review; các W03–W23 chưa được thực thi bởi task này. Existing evidence được dẫn chiếu, không được ghi thành kết quả chạy mới. Đề xuất sửa docs được gửi riêng để review, không merge/deploy tự động.
