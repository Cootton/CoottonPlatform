# API04 — phương án quay lui

Trạng thái: PROPOSED FOR REVIEW; kế hoạch cụ thể đã soạn, rollback readiness còn OPEN. Cập nhật 2026-10-09; chưa deploy hoặc đổi traffic. Kế thừa source e06d3de8 và release documents tại main e63f661a. [Hồ sơ candidate và kiểm chứng](API04_CANDIDATE_REVIEW_2026_10_09.md) là manifest tham chiếu.

## Baseline phải giữ

- API: cootton-api-act006-3c768d6; image `api@sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54` trong registry cootton-containers; recorded 100% named-revision traffic.
- Web: cootton-web-00006-7c9; image `web@sha256:92d914e98c00088a35cc32042c6300c62eb526f7fece7f9b2d534f78122aeb2a`; recorded 100% traffic với latestRevision=true.
- Applied SQL001–006, receipts, audit, outbox, publication history và private objects phải được giữ. Không database rollback, đổi key sau unknown COMMIT, purge hoặc orphan deletion.
- Project cootton-firebase, region asia-southeast1. Lượt read-only 2026-10-08T13:37:49.877745Z xác nhận hai service/revision Ready=True, đúng resolved digest và traffic như trên. Đọc lại baseline ngay trước rollout; checkpoint này không chứng minh rollback execution.

## Hai loại sự cố

1. **Lỗi Web tương thích/status/UI:** dừng bước tăng traffic; quay cả API/Web về cặp tương thích đã kiểm chứng. Không trộn Web mới với API cũ nếu chưa chứng minh HTTP201/replay/error/proxy behavior.
2. **Lỗi quyền, visibility, duplicate effects hoặc integrity:** dừng các Admin mutations bị ảnh hưởng trước. Không gọi traffic-only rollback tới ACT006 là an toàn: ACT006 có thể thiếu các bảo vệ API02–04 mới.

## Containment khi phải dùng artifact ACT006

Phương án review: một revision phục hồi dùng đúng digest ACT006 nhưng **không gắn ADMIN_DATABASE_URL**, giữ restricted public reader và identity configuration cần thiết. Source ACT006 kiểm tra ADMIN_DATABASE_URL tại AdminCatalogService.database() và trả ADMIN_NOT_CONFIGURED khi thiếu; cần chứng minh isolated/container rằng mọi command bị chặn trước media/SQL side effects và public reads vẫn đáp ứng contract.

`PREP04-RB-CONTAIN-001`: exact ACT006 registry image đã pull và chạy trong Docker `--network=none`, không ADMIN_DATABASE_URL. Gọi service.command với envelope hợp lệ cho cả 13 actions (createDraft, saveDraft, saveIntake, addDictionary, uploadImage, setImageColor, uploadVideo, submit, approve, publish, returnDraft, unpublish, archive): tất cả trả exception 503 ADMIN_NOT_CONFIGURED. Instrumented database-pool/media-preparation calls = 0. Cloud Build `c8241845-d692-4c5c-ac89-c48565a92802`. Đây là PASS cho service-method containment; không phải HTTP/auth/public-reader acceptance hoặc production rollback execution. Payload sâu chưa cần xử lý vì chặn tại database configuration gate; không tuyên bố đã kiểm mọi invalid-input case.

Lịch sử harness giữ nguyên: lượt `16d4214d...` bị Cloud Build workspace mount che application path trước verification; lượt `b328c75a...` encoder PASS nhưng rollback harness FAIL vì require reflect-metadata từ thư mục không có direct dependency. Lượt sửa bỏ require dư thừa, dùng imports/metadata của chính ứng dụng; không thay artifact hoặc source. Không đổi failed attempts thành PASS.

COOTTON_PUBLICATION_ENABLED=false chỉ là policy cho publication, không được coi là công tắc tắt mọi Admin mutation. Không sửa Firebase owner/grants hoặc nâng quyền để làm rollback chạy.

Revision containment là cấu hình khác với named ACT006 cũ; phải review config diff và có scoped deployment approval trước khi tạo. Task này chỉ hoàn thiện runbook, không tạo revision đó hoặc chuyển traffic. Nếu containment chưa kiểm chứng, dùng maintenance/stop theo phạm vi đã được phê duyệt; rollback readiness vẫn OPEN.

## Trình tự khi được giao rollout

1. Freeze candidate API/Web digests, source, base/encoder versions và config manifest; reviewer xác nhận các check còn applicable. Không dùng mutable tag.
2. Đọc lại service/revision/image retention, traffic mapping, existing identities, secret reference versions, SQL hashes và current visibility. Không lấy secret values.
3. Kiểm chứng cặp rollback artifacts trong isolated environment; kiểm chứng containment negative cases. Ghi exact evidence và exclusions.
4. Chốt named Web revision mapping: pin cootton-web-00006-7c9 trong recovery để tránh một lần deploy sau tự thay latestRevision target. Việc đổi hành vi latestRevision phải nằm trong approved config diff; không âm thầm ghi rằng đã khôi phục y hệt baseline.
5. Chỉ theo approved schedule/thresholds mới tạo no-traffic candidate và tăng traffic. Mỗi bước có operator hold; missing thresholds/signoff là STOP.
6. Khi trigger STOP, giữ receipts/objects và đọc trạng thái durable bằng kết nối độc lập. Với lỗi security/integrity, containment trước hoặc cùng recovery theo phương án đã duyệt; không tiếp tục mutation để thử lại.
7. Khôi phục cặp revision/traffic mapping đã duyệt; kiểm tra health, public DTO/media visibility, unauthenticated denial và Admin mutations bị chặn đúng scope. Không republish sản phẩm cũ hoặc test payment.
8. Ghi timestamp, candidate/rollback digest/revision, actual traffic percentages, trigger, effects/counts, config diff và observed outcomes. Các checks chưa chạy giữ OPEN.

## Ngưỡng dừng

Dừng ngay khi authorization/visibility bị vi phạm, duplicate effect, media overwrite/hash mismatch, leaked transaction, encoder unavailable hoặc required check fail. Ngưỡng latency/error/RSS, observation windows và nguồn monitor cần owner/ops chốt theo measurement; tài liệu này không tự đặt SLO hay hứa recovery time.

## Phiếu thực thi cần chốt trước release

| Hạng mục | Nội dung cụ thể | Review còn thiếu |
|---|---|---|
| Người ra quyết định | Owner duyệt scope rollout/containment và tác động mất Admin writes | Tên người chịu trách nhiệm/signoff thời điểm thực thi |
| Operator | Ghi baseline mới, cấu hình no-traffic revision, giữ hold từng bước; có thể dừng ngay khi invariant fail | Assignee và khả năng thực hiện đã kiểm chứng |
| Reviewer | Đối chiếu digest, HTTP compatibility, identity, config diff và monitoring | Evidence/signoff security và operations theo applicable gates |
| Config candidate | Cặp digest trong hồ sơ candidate; giữ existing accounts, pin secret reference versions, reader/admin role đúng scope | Manifest đầy đủ env/resource/concurrency/timeout/max-instances; không lấy secret values |
| Config containment | Cặp rollback artifacts; API bỏ ADMIN_DATABASE_URL, giữ public reader và identity; Web pin named revision | HTTP/public read/denial verification và review diff, không coi publication=false là write kill |
| Traffic | Named API revision và named Web revision theo manifest được duyệt, ghi percentages thực tế | Schedule, observation windows, latency/error/RSS thresholds; đề xuất 5→25→100 trước đây chưa phê duyệt |
| Unknown outcome | Giữ key/request gốc, đọc receipt và trạng thái bằng kết nối độc lập; dừng nếu không reconcile được | Áp dụng theo contract, không tạo key mới hoặc xóa media |
| Kết thúc recovery | Ghi health, public DTO/visibility, Admin denial, traffic và effects; giữ incident record | Reviewer xác nhận outcome; không tự mở lại writes khi thiếu authorization |

Nếu invariant security/integrity fail, không đợi đủ observation window để dừng. Nếu containment/public-read compatibility chưa PASS, không chuyển traffic tới bản cũ với writer credential còn gắn; giữ STOP và trình phương án maintenance có phạm vi cụ thể. Không tự provision maintenance mode hay mở rộng IAM trong preparation này.

## Acceptance của runbook và giới hạn

Runbook hoàn tất khi đủ immutable candidate/rollback manifest, evidence cho containment/compatibility/availability, approved traffic mapping và thresholds, assignee/reviewer cùng scoped approval. Bản này là kế hoạch cụ thể để review; không chứng minh rollback đã chạy. Retention/orphan cleanup API04-RECOVERY-002 vẫn OPEN và không thuộc thao tác recovery tự động.
