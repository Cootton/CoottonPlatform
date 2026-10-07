# Tích hợp vào GitHub và handoff cho Work

> **SYNC-PR16-006 · 2026-10-07:** Source hiện hành là PR #16 `56f80580e50b43c94df65d3ae79ef025ea957123`; [bản đồng bộ migration006](MIGRATION006_SOURCE_SYNC.md) phân biệt source/CI đã kiểm chứng với deployment checkpoint lịch sử. Migration006 đã chuẩn bị, **chưa áp dụng production**. Các source18768a1/pending notices dưới đây là lịch sử; không chứng minh runtime đang chạy bản sửa.


`GOV-INTEGRATE-001` · Gói này là documentation subset đã sync pinned PR16 source18768a1 và checkpoint04/10; runtime overlay07/10, không thay repository source.

## Integration sequence

1. Inspect actual latest HEAD/PR status; baseline package SHA là `503ae0be7f2956af2b9c006c364e758e7ee58b03`. Nếu HEAD mới hơn, giữ changes mới và reconcile theo scope/owner authority.
2. Add COOTTON_MASTER_PLAN index, docs/engineering, docs/governance, ADR-KNOWLEDGE-001, changelog. Add CURRENT_STATE, ADR-KNOWLEDGE-002, V001 front notice và appendices MP-ENG-001/MP-REVIEW-001; không tạo V002 hoặc replace accepted text.
3. README và AGENTS chỉ thêm reading entrypoint; không replace existing execution/task restrictions. Bundle README chỉ dùng cho document package.
4. Existing contracts/ADR0001–0003 trong bundle là reference copies, byte-identical baseline; không chép đè newer contracts trên HEAD. OpenAPI và application runtime unchanged.
5. Đối chiếu PR16 ADR0004/0005, publication contract, checkpoint04/10 và FLOW-CATALOG-00107/10. Không ghi pending activation như trạng thái hiện tại. Giữ reported checkpoint provenance; sau actual reconcile thêm ADR/evidence, không assert deployed từ secrets pages.
6. Validate links/new IDs/coverage/diff và secret/privacy exposure. Nếu được giao publication riêng, tạo scoped docs PR, attach PR và review qua repo governance; không auto-merge/deploy từ tài liệu.

## Work task prompt (reusable)

```text
Read COOTTON_MASTER_PLAN.md, docs/governance/DECISIONS.md,
CURRENT_STATE.md, TRACEABILITY.md, V001 current overrides, CORE and scoped D01–D10 contracts.
Task: [concrete owner-assigned deliverable].
Record exact source SHA, authorization and stable decision/contract/gate IDs.
Preserve ACCEPTED decisions and historical text; conflicts need explicit ADR,
not silent replacement. PROPOSED/LATER are not execution requirements.
Implement only assigned scope after its dependencies are ready.
Use meaningful targeted verification and record actual evidence;
do not claim deployment/security/payment/restore readiness from docs or mocks.
Update V001 in place, ADR/changelog/traceability, then report remaining gates.
```

## Publication và privacy

Current task yêu cầu GitHub-ready tài liệu; bundle chưa upload/PR/push. No secrets/customer/bank/tax/contact private data mới. Existing redacted V001 giữ baseline. References tới setup/source files ngoài documentation subset không nghĩa chúng có trong bundle hoặc features ready; đọc full repository khi implementing.

Nếu tích hợp vào repository public hiện tại, privacy review theo source actual; không copy private configs từ local checkpoints. Không publish full chat/raw screenshots hoặc secrets để tăng traceability; source IDs/turn IDs và safe summaries đủ.