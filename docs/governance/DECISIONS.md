# Decision governance, nguồn và conflict register

`GOV-DEC-001` · 2026-10-07 · Documentation contract được yêu cầu trong task hiện tại.

## Status và precedence

`ACCEPTED`: owner/reviewer có thẩm quyền đã chốt scoped decision có nguồn. `PROPOSED`: đề xuất chưa phê duyệt. `LATER`: kiến thức/hướng ngoài V1, chưa cấp quyền thực thi. `SUPERSEDED`: bị thay bằng quyết định explicit có link. Không tự đổi nhãn lịch sử; ghi effective applicability và superseding reference riêng.

Ưu tiên: yêu cầu trực tiếp mới nhất của owner cho scope → scoped owner overrides/contracts/ADR mới nhất có bằng chứng → baseline cũ → kiến thức tham khảo. Main là baseline Git đã publish; checkpoint chưa merge vẫn cần giữ làm provenance và reconcile với owner authority, không vì chưa merge mà xóa quyết định. Chat assistant hoặc web page không là owner approval. Scope approval không là deployment/financial authorization.

Mỗi ID tồn tại lâu dài, không tái dùng. Đổi filename/heading giữ ID và redirect/link. Không renumber D01–D10, `LLD-*`, `ARCH-CACHE-002` hoặc ADR hiện hữu. Aliases `DEC-*` trỏ vào nguồn cũ.

## Source inventory

| Source ID | Nguồn | Đọc được / giới hạn |
|---|---|---|
| SRC-OWNER-20261007 | Yêu cầu trực tiếp hiện tại | Yêu cầu tổng hợp đầy đủ, giữ ACCEPTED, dùng stable IDs/ADR/gates; không chọn lại stack |
| SRC-REPO-503AE0 | Main SHA 503ae0be7f2956af2b9c006c364e758e7ee58b03 | V001 §§1–128, CORE/D01–D10, ADR0001–0003; source download chỉ đọc |
| SRC-CHAT-6AC4 | Conversation 6ac4c006-7fc0-83ec-a08c-66b1a68ea3d5 | 5 turns trả về, nextCursor=null; OOP/cache/binary-search/linked-list; attachments không làm nguồn bằng chứng |
| SRC-LOCAL-131 | Local 2026-09-30 outputs/COOTTON_MASTER_PLAN.md | Checkpoints129–131 ngày03/10; không có trong main tại lúc đọc; runtime claims chưa tái xác minh |
| SRC-TECH-001 | Tài liệu chính thức link trong modules | Xác minh semantics; không chọn vendor/phiên bản/hạ tầng thay owner |

## Historical ACCEPTED claims giữ nguyên

| ID gốc | Claimed status | Nguồn turn | Effective interpretation / conflict |
|---|---|---|---|
| LLD-OOP-001 | ACCEPTED (assistant claim) | 890f2cb2-3d82-4029-bcc9-2945be9f270e | Encapsulation/composition/interfaces có ích; Java/Spring không thay NestJS. Owner ratification của snippet chưa thấy |
| LLD-ALG-SEARCH-001 | ACCEPTED (assistant claim) | a6c40ac7-7f61-4099-99bf-9c96e3266a38 | Ordered/monotonic search, complexity; knowledge guidelines, không mandate implementation |
| LLD-DS-LINKEDLIST-001 | ACCEPTED (assistant claim) | c2a5d649-5b1f-49d5-b074-72d7e104be95 | 10 patterns giữ; persistent business data PostgreSQL |
| ARCH-CACHE-002 | ACCEPTED (assistant claim) | b899be58-67d2-4952-86aa-f2a84bceee0a | Giữ PostgreSQL truth/commit-before-invalidate/TTL rules. `Redis primary` không có owner approval thấy được và xung đột §§49,107; Redis remains PROPOSED, not V1 dependency |

Không sửa snippets thành approved decisions giả. Owner yêu cầu giữ ACCEPTED không được dùng để tự phê duyệt từng dòng assistant từng viết. Nếu owner ratifies sau này, tạo ADR và cập nhật evidence, không xóa lịch sử claim/conflict.

## Conflict register — resolved về applicability

Đọc [CURRENT_STATE](CURRENT_STATE.md) trước; [review report](REVIEW.md) ghi resolutions. Sources bổ sung: SRC-OWNER-REVIEW-20261007 (yêu cầu review hiện tại), SRC-REPO-RECHECK-001 (main-file connector07/10 trả tới128; không latest-tip/runtime verification).

| ID | Historical conflict | Effective resolution | Status |
|---|---|---|---|
| CONFLICT-001 | Spring/Java vs TypeScript/NestJS | DEC-ARCH-001: NestJS runtime, Spring reference | RESOLVED |
| CONFLICT-002 | Redis primary claim vs optional Redis | DEC-CACHE-001: derived rules; Redis PROPOSED | RESOLVED |
| CONFLICT-003 | Cloud SQL vs Neon | DEC-DATA-001: Neon current, reviewed migration LATER | RESOLVED |
| CONFLICT-004 | Marketplace/CP launch vs direct-sale | DEC-LAUNCH-001: direct-sale first, points inactive | RESOLVED |
| CONFLICT-005 | Absolute no-tests vs106 | DEC-VERIFY-001: targeted checks trong scoped task | RESOLVED |
| CONFLICT-006 | Main128 vs local129–131 | Separate source/reported evidence; OPEN-001 tracks proof gap | RESOLVED_INTERPRETATION |
| CONFLICT-007 | Blanket rebuild vs selective reuse127 | DEC-LEGACY-001: compatible resources preserved | RESOLVED |
| CONFLICT-008 | Old header no-deploy vs owner128 | DEC-RELEASE-001: conditional authorization kept; readiness not proven | RESOLVED |
| CONFLICT-009 | CORE financial pending vs D02/D04–D06 | Financial table CURRENT_STATE; missing actual configs separate | RESOLVED |
| CONFLICT-010 | Cookie design vs reported bearer BFF | DEC-AUTH-001: bearer approach reported; cookie alternative not simultaneous | RESOLVED_INTERPRETATION |

Không unresolved normative conflict sau review. RESOLVED_INTERPRETATION không chứng nhận missing merge/implementation/runtime evidence; OPEN ledger giữ proof requirements. Không ratify vendor hoặc bỏ production gates khi đóng conflict.

## Task record tối thiểu

```yaml
id: TASK-<domain>-<stable-number>
scope: concrete_deliverable
authorization: owner_message_or_scoped_task_reference
decision_ids: []
contract_ids: []
source_commit: exact_SHA
invariants: []
implementation_status: NOT_STARTED
gate_ids: []
evidence: [] # SHA, environment, timestamp, scenario, result, artifact
pending_decisions: []
rollback_or_recovery: approved_plan_or_NOT_READY
```

Task `ACCEPTED` cần reviewer evidence; production `ENABLED` cần scoped release authorization và gates PASS. Unknown contract chặn feature phụ thuộc, không cần chặn unrelated safe documentation/catalog.

## ADR workflow

ADR ghi context, alternatives, decision status/source, scope, consequences, supersedes/superseded_by, rollout/recovery và gate impacts. Proposal không được đổi runtime trước approval. Thay accepted decision phải explicit ADR + contract revision + compatibility/data migration analysis; changelog ghi before/after, lý do, nguồn, reviewer. Không merge ADR để âm thầm unlock payment hoặc AI egress.


## SYNC-PR16-001 — newer source/evidence overlay

SRC-PR16-18768A1, EVD-DEPLOY-20261004 và EVD-BROWSER-20261007 bổ sung các source rows lịch sử. Đọc CURRENT_STATE/FLOW-CATALOG-001 trước. ADR0004 xác lập human bearer Admin; ADR0005 scoped catalog-only override và migration005 publication pointer thay receipt-renewal model. DEC-CATALOG-001 giữ commerce/offering gates trước purchase. OPEN-001 documentation reconcile đã đóng; published v22 checkpoint đã được browser withdrawal v23 thay làm current state. Không xóa source rows cũ hoặc ratify assistant proposals.
## RULE-GITHUB-001 — Owner-requested contributor workflow2026-10-09

Owner explicitly yêu cầu tạo rule để tránh lỗi đọc/publish quá lớn. [Quy tắc](GITHUB_REVIEW_CAPACITY_RULE.md) và AGENTS xác định metadata/scoped reads, review package, soft payload guardbands, standard Git khi được duyệt và fail-closed sau review rejection. Numeric defaults là lựa chọn workflow nội bộ, không ACCEPTED vendor limits/approval override. Không thay domain ACCEPTED policies; source local, publication pending.

## DEC-SEARCH-001 / DEC-ADS-001 — Owner direction2026-10-09

Direct owner assignment authorizes native Cootton application source and purple/white interface. Owner selects three natural-ranking criteria: keyword relevance, verified reviews, seller trust; advertising CPM; Cootton first with multi-seller later. Owner explicitly replies “Giữ đề xuất để thử nghiệm” for weights60/25/15, CPM×quality and first-price auction: these remain PROPOSED, not ACCEPTED runtime policy. No rating evidence, valid-impression/budget/debit contract or release approval supplied. Detailed provenance/boundaries: SEARCH-ADS-001 and ADR0010. Historical decisions remain unchanged.
