# Review Cootton Knowledge System v0.1.0 và repository

`KN-REVIEW-002` · 2026-10-08 · PROPOSED FOR REVIEW. Đọc [master](MASTER_ARCHITECTURE.md) và [source register](SOURCE_EVIDENCE_REGISTER.md).

## Nhận xét chính

v0.1.0 có giá trị như một thư viện học tập và bàn giao nguồn: tách lời user/assistant, giữ provenance, không suy phê duyệt từ chữ ACCEPTED trong câu trả lời. Tuy nhiên, nó thiếu đối chiếu repository nên các skeleton KB-C01–C12 dễ làm Work hiểu rằng mọi contract/implementation đều chưa tồn tại. Repository đã có stack chốt, D01–D10, Admin/catalog và nhiều scenario source/CI/runtime. Cần biến thư viện thành bản đồ áp dụng vào các tài liệu có thẩm quyền, thay vì dựng một kiến trúc song song.

Review này đọc main pinned `e06d3de8e74bc7cb431734d32d339ef63e1824ef`, cây repository và các governing/scoped files; đọc thêm hai checkpoint của PR26 tại head `cad72a773383a0ef145dcc1467ab5d3ea52030a4`. Đây không phải kiểm toán toàn bộ code, penetration test hay xác nhận runtime mới.

## Findings và cách sửa

| ID / mức ưu tiên | Finding | Ảnh hưởng | Resolution trong v0.2.0 |
|---|---|---|---|
| KN-F01 / P1 | Registry cũ ghi mọi skeleton NOT_IMPLEMENTED/NOT_VERIFIED | Bỏ qua source, contracts và evidence đã có; dễ làm lại công việc | KB IDs chỉ còn topic aliases; map D01–D10/DEC/API, evidence theo từng scope |
| KN-F02 / P1 | Thiếu source/runtime/overlay separation | Có thể dùng merged source hoặc operator ADC để tuyên bố release ready | Pin main, ghi ACT006 riêng, PR26 unmerged riêng, evidence matrix |
| KN-F03 / P1 | Nhận xét trước đề nghị checkout như bước tiếp theo | Bỏ qua browser identity/release/media gaps; mở commerce sớm | Release preflight và API05 catalog journey trước; checkout là milestone có điều kiện |
| KN-F04 / P1 | Phê duyệt “tất cả kiến thức tối nay” chưa map artifact/version | Có thể biến kiến thức tham khảo thành quyền triển khai | Giữ explicit general approval, PENDING_SCOPE_MAPPING; không gán ACCEPTED mới |
| KN-F05 / P2 | Có nhiều chủ đề hạ tầng nhưng chưa có adoption criteria | Tăng chi phí/độ phức tạp trước workload | V1/PROPOSED/LATER và measurement triggers rõ; giữ NestJS/Neon |
| KN-F06 / P2 | Gate roll-up và historical pending notices có nhiều lớp thời gian | Người đọc mở lại quyết định đã giải quyết hoặc coi scenario PASS là full PASS | Dẫn newest scoped overlay; lịch sử được giữ, không xóa evidence; gate-wide signoff riêng |
| KN-F07 / P2 | Knowledge catalog lớn nhưng thiếu việc cụ thể/dependency | Work khó biết làm gì trước, điều gì chặn hoàn tất | Backlog có output, exit checks, owner role cần assign và scope |
| KN-F08 / P2 | Captured chat có overlap, image/reference thiếu bản gốc | Không thể bảo đảm export đầy đủ hoặc source coverage tuyệt đối | Capture coverage chỉ tính 176 groups đã thu thập; public docs không chứa raw chat |

P1/P2 là ưu tiên review tài liệu, không phải kết luận vulnerability đã được chứng minh trong runtime.

## Điểm mạnh nên giữ

- Backend là nguồn canonical cho permission, price/state/inventory/financial invariants; client và AI không sửa truth.
- D03 đã mô tả stock holds, quote acceptance, idempotency, payment uncertainty và transactional boundaries. Không cần mở lại kiến trúc checkout từ số không.
- API02–04 phân biệt retry chính xác, conflict/version, reauthorization trước replay và uncertain COMMIT. Media không bị xóa chỉ vì SQL catch.
- Evidence giữ source/CI/real isolated PostgreSQL/operator GCS/live browser riêng. Merge không giả thành deploy; credentials không giả thành runtime identity.
- Selective reuse và immutable applied migrations giúp tránh phá dữ liệu/hạ tầng đã có.

## Trạng thái cần đọc chính xác

Theo main, actual Firebase SDK admission và ACT006 owner session đã có scoped evidence; browser login còn failed ở checkpoint cũ. PR26 ghi WEB-AUTH-OBS-001 hồi phục trong một phiên và reload read-only, không có thay đổi source/config gây ra. Vì thế hiện tại phải ghi **recorded recovery; root cause/recurrence OPEN**, không tiếp tục tuyên bố browser luôn hỏng hoặc identity matrix đã PASS.

PR26 cũng ghi operator cloud configuration read COMPLETE, API ACT006100%, Web00006-7c9/latestRevision mapping, attached-account IAM. Điều này không chứng minh effective GCS generation operations của runtime account, candidate artifact readiness hay rollback execution. PR26 là nguồn unmerged, cần reconcile khi merge hoặc head thay đổi.

API04-RECOVERY-002, candidate image/encoder compatibility, actual SDK listener warning investigation, monitoring/stop thresholds, rollback protection regression và applicable reviewer signoff vẫn OPEN. Kiến thức đầy đủ không thay các bằng chứng này.

## Kết luận review

Có thể dùng v0.2.0 làm navigation và kế hoạch review. Không dùng nó như release certification. Ưu tiên tái sử dụng baseline và hoàn tất gaps thật; không thay cả repository chỉ vì được phép sửa nếu cần. Nội dung mới là đề xuất của assistant, chưa có owner phê duyệt từng work package.
