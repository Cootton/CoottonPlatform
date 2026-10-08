# API04 — manifest cấu hình và ngưỡng vận hành

`FIX04-CONFIG-OPS-001` · 2026-10-09, Asia/Saigon. Observed configuration + **PROPOSED FOR REVIEW**; không ACCEPTED, không deploy.

Đọc [SDK/HTTP evidence](API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md) và [rollback runbook](API04_ROLLBACK_RUNBOOK.md). Các setting quan sát không phải quyết định tối ưu; các số đề xuất dưới đây chưa trở thành SLO hay cấu hình serving.

## Cấu hình serving quan sát

Project `cootton-firebase`, region `asia-southeast1`. Service descriptions đọc qua Google Cloud trong lượt chuẩn bị 09/10; không đổi settings. Không xuất secret values hoặc bearer tokens.

| Setting | API đang phục vụ | Web đang phục vụ |
|---|---|---|
| Revision / traffic |cootton-api-act006-3c768d6 /100% named revision|cootton-web-00006-7c9 /100% latestRevision=true|
| Immutable digest suffix |api@sha256:75065b4658ce021d8a7777f9261a9837759982954ff49b1b64b021538ee42d54|web@sha256:92d914e98c00088a35cc32042c6300c62eb526f7fece7f9b2d534f78122aeb2a|
| CPU / RAM |1CPU /512MiB|1CPU /512MiB|
| Container concurrency / maxScale |10 /1|10 /1|
| Request timeout |60s|60s|
| CPU throttling / startup CPU boost |true /false|true /false|
| Runtime account |cootton-auth-verifier@cootton-firebase.iam.gserviceaccount.com|cootton-web-runtime@cootton-firebase.iam.gserviceaccount.com|
| Secret references |DATABASE_URL→cootton-catalog-reader-url:1; ADMIN_DATABASE_URL→cootton-catalog-admin-url:1|Không secret reference trong service manifest|
| Safe config |FIREBASE_PROJECT_ID=cootton-firebase; COOTTON_MEDIA_BUCKET=cootton-catalog-media-524673981677; COOTTON_PUBLICATION_ENABLED=true; HOST=0.0.0.0; port8080|CATALOG_API_ORIGIN và ADMIN_API_ORIGIN=https://cootton-api-agg2nh5esq-as.a.run.app; ADMIN_WEB_ORIGIN=https://cootton-web-agg2nh5esq-as.a.run.app; port8080|

Origins/ports/traffic được đọc lại trực tiếp từ serving service descriptions, không suy ra từ probe (probe dùng origins riêng). Lấy lại resolved digest, env **allowlist**, secret version refs, ports, URL bindings, grants và traffic trước rollout; log secret references thay vì values. Applied SQL001–006/checksum và complete writer privilege acceptance chưa được chứng nhận bởi bảng này. Không dùng role owner/maintenance để vượt gap.

Source `988c8a83…` tạo PostgreSQL pool bằng parse từng field, TLS certificate validation=true/minVersionTLSv1.2, channel binding=true, max5/min0, connection timeout15s, idle30s, statement10s/query12s. Không để URL query override TLS. Đây là cấu hình source, không phải measured long-term connection/transaction health; tổng transaction và pool wait cần budget toàn request.

Effective reader metadata đã PASS trên đúng image/account/secret pin: current_user=cootton_catalog_reader, table-level SELECT đủ4visible views=true, table-level product DML=false, table-level principal/review SELECT=false. Probe dùng compiled pool, BEGIN READ ONLY/ROLLBACK,0writes. Không dùng assertion này thay column-level/full role/function/transaction acceptance; [evidence register trong hồ sơ](API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md) giữ failed harness và lượt xác nhận riêng.

Effective Admin metadata: current_user=cootton_catalog_admin, không superuser/CREATEDB/CREATEROLE; table-level product SELECT/INSERT=true, UPDATE/DELETE=false; INSERT command/audit/outbox=true; table-level principal DML=false. Product UPDATE theo12cột mutable, không cho UPDATE id/seller_id/model_token/kind discriminator/created_at. Đây là giới hạn theo cột có chủ đích phù hợp các UPDATE tường minh đã đối chiếu; không mở table UPDATE để làm harness PASS. Initial full-table assertion STOP và column diagnostic OBSERVED được giữ riêng. Complete13-action/function/inherited-role/column-negative acceptance còn OPEN, không execute production DML để thay metadata proof.

Job proof dùng1task/parallelism1/maxretries0,1CPU/512MiB/300s; HTTP jobs chỉ gắn reader secret:1, không admin secret. Job creation không thay service configuration. Không lập schedule; job retained để provenance, chạy lại cần scoped assignment.

## Deadline hiện tại và điểm chặn

Source API mới: native media read15s (credential + body); encoder có các giới hạn riêng ffprobe10s + ffmpeg80s + ffprobe10s + poster10s = **110s upper budget chỉ cho các subprocess**. Storage save/getMetadata, SQL/authorization, queue và truyền response còn ngoài con số này. Cloud Run API60s và Web60s hiện tại có thể hết thời gian trước handler; Web Admin BFF source timeout120s không làm Cloud Run60s dài hơn. Web catalog18s/media20s; media read15s cộng SQL/metadata chưa có một deadline toàn request. Liveness/fixture nhỏ PASS không giải quyết mismatch.

**STOP trước release video:** chưa có deadline hợp nhất/cancellation, proof max-input/concurrent requests, tổng budget SQL/storage metadata/save và config review. SQL per-statement timeout không tự giới hạn toàn transaction. Tăng Cloud Run timeout đơn lẻ không chứng minh an toàn và không ngăn side effects sau HTTP timeout. Unknown COMMIT phải tra durable state rồi retry cùng request/key còn được phép; không tạo key mới hoặc xóa media.

Đề xuất kỹ thuật để review, chưa áp dụng:

| Tầng / ngân sách | Giá trị đề xuất | Điều kiện |
|---|---:|---|
| Public read handler toàn request |≤15s|Phân bổ SQL/auth/metadata/body trong tổng budget; không cộng các timeout riêng rồi gọi15s là toàn request|
| Public catalog BFF / media proxy |18s /20s|Giữ source hiện tại, kiểm upstream deadline + overhead|
| Admin/video handler toàn request |≤150s|110s subprocess +≤30s tổng auth/SQL/storage +10s dự phòng; phải có per-stage/cancellation thật và kiểm COMMIT semantics|
| Cloud Run API |180s|Chỉ đề xuất sau khi handler bound150s được kiểm chứng|
| Web Admin BFF |195s|Cần source change và kiểm request abort/uncertain outcome; hiện tại120s|
| Cloud Run Web |210s|Đủ BFF195s + margin; cần owner/operator signoff và đồng bộ rollout|
| Initial isolated acceptance load |concurrency1, sau đó10 ở1CPU/512MiB|Giữ serving concurrency10; không giả lập rằng encoder processing guard là queue hoặc admission control toàn hệ thống|

Các150/180/195/210s là **assistant proposal**, chưa có benchmark maximum video để chấp nhận. Nếu bounded handler không đạt, giữ STOP và review kiến trúc xử lý riêng; không âm thầm bỏ budget hoặc chuyển sang async job.

## Ngưỡng nghiệm thu đề xuất

Số đo đối chiếu:1.000 sequential tiny-media reads p95~36,93ms, RSS max~110,06MiB, drift sau warm100~6,88MiB. API mixed HTTP26checks p95~17,70ms/max~890ms, child RSS~102,74MiB. Web smoke chỉ6checks. Không dùng các mẫu này để suy ra tải thật/SLO thương mại.

| Quan sát / cửa sổ | HOLD / STOP đề xuất | Ý nghĩa và bằng chứng cần |
|---|---|---|
| Authorization, visibility, hash/generation, overwrite, duplicate receipt/effect |STOP ngay khi có1vi phạm|Dừng Admin mutation liên quan; giữ receipts/media, containment theo runbook|
| Required probe / SDK warning |STOP nếu bất kỳ required check fail hoặc warning tái hiện ở reader mới|Không tắt warning để vượt gate; phân biệt emitter/path|
| Canary read/negative acceptance |≥10phút và≥50requests đúng route mix;0unexpected5xx/timeout|N ít: HOLD, không coi0request là PASS;401/404 expected không tính lỗi|
| Public API latency |p95≤2s cho list/detail riêng,≥50requests/route|Đề xuất acceptance bound; không dùng mixed26checks thay route-specific measurement|
| Warm Web SSR latency |p95≤3s,≥50requests/route; cold start báo riêng|Đề xuất, chưa measured đủ sample|
| Availability sau acceptance |5xx/timeout>1% trong5phút khiN≥100 →STOP; vớiN<100 bất kỳ unexpected error →HOLD/điều tra|Đây là rollout guard đề xuất, chưa phải approved long-term SLO|
| Memory / soak |RSS≤384MiB(75%512); warmup100 rồi thêm1.000reads drift≤32MiB;≥3lượt độc lập|STOP nếu OOM/restart; mẫu hiện tại chỉ1lượt1.000tổng, không chứng nhận cả đề xuất|
| CPU/video |Báo CPU và elapsed; không STOP vì CPU100% riêng lẻ|Encoding dùng CPU bình thường; STOP theo budget/error/OOM/concurrency correctness|
| Recovery / traffic |0unexpected durable effects; giữ exact digest/traffic snapshot|Không gọi traffic rollback đến old API an toàn nếu thiếu protections|

Monitoring cần lưu timestamps, image/config fingerprint, route/status/classification, latency, warning count/path, RSS/heap/OOM/restart, active requests/media processing, operation/key outcome và version/count bằng aggregate an toàn. Không log tokens, request body chứa media, connection strings, private object URLs/subjects. Quy định người trực tiếp nhận alert, kênh/thời gian phản hồi, dashboard/log query và retention còn **UNASSIGNED/OPEN**; không tạo alert/channel hoặc gửi thông báo cho người khác trong task này.

## Điều kiện xác nhận và mở lại

Owner/reviewer cần phê duyệt cụ thể bộ ngưỡng, budget, cách canary, operator/alert owner, containment/rollback và phạm vi identity/write tests. Phê duyệt “kiến thức tối nay” không mặc nhiên gắn ACCEPTED cho các giá trị mới trong tài liệu này. Cấu hình quan sát, kết quả probe và đề xuất phải tiếp tục tách biệt.

Chỉ đóng GATE-PERF/OPS sau đủ sample/max-input/concurrency, exact API/Web pair, monitoring/backup-restore/rollback evidence và signoff. Đổi source/digest/Node/SDK/encoder/resource/concurrency/secrets/grants/schema/flags/origins hoặc traffic phải kiểm lại affected proof. **API04 NOT READY TO DEPLOY**.
