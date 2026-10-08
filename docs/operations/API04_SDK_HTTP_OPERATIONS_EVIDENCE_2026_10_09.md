# API04 — SDK, HTTP/public-read và cấu hình vận hành

> **REVIEW-API04-PR28-29-001 · 2026-10-09:** Owner assigned review/merge PR28→PR29. PR28 merged main59ad8560; PR29 now targets main. [Review/read-order checkpoint](API04_PR28_PR29_REVIEW_2026_10_09.md) distinguishes source merge from serving runtime and deploy approval. Earlier draft/stacked notes are historical. Operational thresholds/deadline changes are still PROPOSED; ACT006 remains runtime, API04-RECOVERY-002 and full release gates OPEN. **NOT READY TO DEPLOY**.

`FIX04-READ-OPS-001` · 2026-10-09, Asia/Saigon · **NOT READY TO DEPLOY**.

## Thẩm quyền và trạng thái

Lời người dùng: “xử lý cảnh báo SDK chưa được xử lý và bằng chứng HTTP/public-read, cấu hình cùng các ngưỡng vận hành còn thiếu. để API04 vẫn chưa đủ điều kiện deploy”, sau đó “tiếp tục công việc”. Đây là giao sửa lỗi, kiểm chứng và hoàn thiện hồ sơ. Không suy diễn thành phê duyệt rollout hoặc phê duyệt các ngưỡng số do assistant đề xuất. Không thêm ACCEPTED; không chuyển traffic, tạo serving revision, cấp IAM, áp dụng SQL, sửa dữ liệu sản phẩm hoặc ghi/xóa media production.

Các kết quả quan sát bên dưới là bằng chứng thực thi có phạm vi. Các ngưỡng và cấu hình tương lai ở [manifest vận hành](API04_RUNTIME_CONFIG_AND_THRESHOLDS_2026_10_09.md) là **PROPOSED**, chưa được phê duyệt. [Bản ứng viên trước](API04_CANDIDATE_REVIEW_2026_10_09.md) và các failed attempts được giữ làm lịch sử.

## Source, artifact và CI

Source sửa lỗi cố định: `988c8a83e5d617bf6143149985c156066721dfe3`. [PR29](https://github.com/Cootton/CoottonPlatform/pull/29) được chuẩn bị trên PR28; PR28 đã merge tại59ad8560 và PR29 chuyển về main theo giao việc review/merge09/10. Đọc [review checkpoint](API04_PR28_PR29_REVIEW_2026_10_09.md) và actual GitHub merge state. Merge hoặc CI không có nghĩa là deploy.

| Thành phần | Bằng chứng |
|---|---|
| API ứng viên thay thế | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api@sha256:7a053d1292af650ec14f207c4bc16562d5be5493209e2d655988ce35ba640017` |
| Cloud Build | `d65a9f98-9253-42eb-ac09-e1c00214104c`, SUCCESS; registry push hoàn tất 2026-10-08T18:51:06.911034544Z |
| Web giữ nguyên artifact | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/web@sha256:3d6d02a8d377704a334bd03ed9da64839b5088613147bfad0b704979e6d85bbb` — source Web/lockfile không đổi |
| CI source cố định | [Container build checks](https://github.com/Cootton/CoottonPlatform/actions/runs/37826907457) và [Foundation checks](https://github.com/Cootton/CoottonPlatform/actions/runs/37826907323): SUCCESS |
| Runtime soak | Node v24.21.0, Storage SDK 8.2.0; không thay dependency |

API digest `588db486…` thuộc ứng viên trước, vẫn có cảnh báo; không dùng kết quả bản sửa để chứng nhận lại image cũ. Chỉ digest mới bên trên được đóng băng. Dockerfile còn resolver/base tag có thể thay đổi; không tuyên bố rebuild bit-identical hoặc cross-version encoder equality.

Lượt source đầu `eaadabcc…` thất bại vì test harness require thiếu đuôi `.cjs`: CI Container `37826121216`, Foundation `37826121141`/`37825928996`, Cloud Build `37f1c228-679c-4302-8a1c-3dde545b067a`. Sửa đường dẫn harness rồi build lại source `988c8a83…`. Không đổi các failed attempts thành PASS.

## Điều tra và sửa đường đọc media

`FIX04-TRANSPORT-001`: execution `cootton-api04-transport-20261009-h4q7t`, API ứng viên cũ, ADC của `cootton-auth-verifier@cootton-firebase.iam.gserviceaccount.com`. 60 lượt trên hai object đã có, chia 20 SDK range, 20 SDK full, 20 native fetch. Tất cả hash/generation/metadata khớp; warning lần lượt **20/20/0**. Diagnostic SHA256 `60a3b79f1e2328bbfdaa65f850c37240f5c3992b76929d45de418efa0337f666`. Không writes.

Stack quan sát đi qua internal PassThrough, Node pipeline/end-of-stream và teeny-request 11.0.1. Cả SDK full và range đều cảnh báo, native body transport không cảnh báo trong mẫu này. Đây là bằng chứng cô lập đường transport, chưa phải chứng minh upstream memory leak. [Node v24.21.0](https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/stream.md) giải thích pipeline có thể giữ listener; [Google Storage JSON API](https://docs.cloud.google.com/storage/docs/json_api/v1/objects/get) hỗ trợ alt=media, Range và generation pin.

Source mới dùng `readPinnedMedia` với ADC Firebase hiện có, HTTPS endpoint Google cố định, generation cụ thể, local byte cap tối đa 8MiB, deadline 15s gồm lấy credential/body, encoding identity, từ chối redirect/encoding/generation sai, hủy body và nhả reader trong finally. Range có thêm một byte sentinel; nếu server bỏ qua Range, local cap vẫn chặn trước khi copy chunk quá giới hạn. Không nâng listener limit hoặc tắt warning.

Các đường preview image/video/thumbnail và đọc lại object khi create-if-generation-match0 gặp412 dùng reader mới. Kiểm metadata size/MIME/private,no-store/encoding/generation và SHA256 trước khi trả bytes; 412 vẫn so sánh exact expected bytes. Visibility/authorization vẫn diễn ra trước media I/O. SDK immutable save/getMetadata và transaction/idempotency không bị thay thế.

CI kiểm reader thật đã compile với chỉ credential/fetch boundary được inject: overflow, truncation, read/consumer failure, cleanup,403, redirect, encoding, generation mismatch, invalid input và200 reader instances. Các recovery/Firebase/video-SQL tests dùng compiled reader; fake SDK body read chủ động throw để bắt đường cũ còn sót. Không coi injected faults là sự cố GCS thực tế.

## Runtime thực tế trên đúng image đã sửa

Evidence ID trong raw log: `PREP04-FIX04-SDK-SOAK-001` (giữ nguyên ID harness). Execution `cootton-api04-sdk-soak-20261009-2l6q8`; script SHA256 `11088a4d76bc64517c850998edccb2c2afcb51a339a026de9973e9a622e7ce25`. Gọi trực tiếp compiled `/workspace/apps/api/dist/media-read.js` từ API digest `7a053d12…`, không reimplement transport trong probe.

Identity lấy từ runtime metadata và đối chiếu account API hiện có. 1 task, parallelism1, max retries0, timeout300s,1CPU/512MiB; không DB secret, schedule hoặc serving endpoint.

| Quan sát | Kết quả |
|---|---:|
| Đọc tuần tự, luân phiên hai fixture | 1.000 PASS |
| MaxListenersExceededWarning / emitter cảnh báo | 0 / 0 |
| SHA256, exact size, metadata trước/sau, generation không đổi | PASS |
| Latency p50 / p95 / max | 27,61 / 36,93 / 92,50 ms |
| RSS trước / sau warm100 / sau1.000 | 79.114.240 / 108.199.936 / 115.408.896 bytes |
| RSS drift từ warm100 đến1.000 | 7.208.960 bytes (~6,88MiB) |
| Heap warm100 / sau1.000 | 20.223.256 / 21.335.000 bytes |
| Cloud writes | 0 |

Video generation `1791426801241775`,2204 bytes,video/mp4; poster generation `1791426801948489`,294 bytes,image/webp. Không công bố private object names. Active resource type list tại warm100 và1.000 giữ cùng PipeWrap/PipeWrap/TCPSocketWrap/Immediate. Không suy diễn thành số lượng mọi handle ổn định hoặc leak-free lâu dài. Hai fixture nhỏ, workload tuần tự, explicit GC; không chứng minh concurrency10, tải lớn, toàn bộ SDK hoặc mọi upload. Kết luận: cảnh báo đã được khắc phục trong **body-read path của candidate mới** trong phạm vi đã kiểm; image đang phục vụ chưa nhận bản sửa.

## HTTP/public-read

Ba job API chạy actual Nest HTTP trên localhost trong container, cùng account API, DATABASE_URL pinned reader secret version1, **không ADMIN_DATABASE_URL**. Dùng actual restricted catalog, không seed/publish dữ liệu.

| Artifact / execution | HTTP kết quả | p95 / max ms | Child RSS KiB |
|---|---|---:|---:|
| API588 / `cootton-api04-http-candidate-20261009-bhlsn` |26 PASS|26,30 /746,49|103.772|
| ACT006750 / `cootton-api04-http-rollback-20261009-np2wd` |26 PASS|29,22 /75,54|104.764|
| API7a053 / `cootton-api04-http-sdkfix-20261009-b79s4` |26 PASS|17,70 /890,04|105.204|

Mỗi lượt gồm liveness200; catalog20×200/empty items/commerceEnabled false; limit51→400; nonexistent detail404; hidden media404; session thiếu token401; command thiếu token401. Kiểm no-store/nosniff và safe error envelope. Không writes. p95 là mẫu hỗn hợp tuần tự gồm health/errors và20 list requests, không phải SLO endpoint hoặc benchmark load.

Positive public list/detail và cached withdrawal HTTP được kiểm trong CI source `988c8a83…`: actual Nest + local PostgreSQL, SET LOCAL ROLE restricted reader, migrations001–006 trong loopback-only disposable transaction. List/detail có synthetic publication, không lộ private DTO fields; vô hiệu measurement dictionary không tăng product version thì cached list rỗng, detail/media404. Cuối test ROLLBACK. Đây là chứng minh HTTP + SQL visibility trên dữ liệu thử nghiệm, **không phải production publication journey**, không thử positive media body bằng GCS qua public HTTP.

Web candidate3d6 execution `cootton-api04-web-read-20261009-cjkjd`, account Web hiện có, không secrets: `/`200, `/b2b`200, nonexistent product404, hidden media404, unauth session/commands401; noindex=true,0writes,RSS116.752KiB. Public upstream là API ACT006 đang phục vụ. Đây là compatibility read/negative smoke với ACT006; chưa chứng minh cặp Web3d6/API7a053 đầy đủ, authorized201/replay hoặc end-to-end positive media.

## Effective reader privileges — actual database metadata

`FIX04-READER-PRIVILEGE-002`: execution `cootton-api04-reader-role-v2-20261009-5nrhn`, API7a053, account API hiện có, pinned reader secret:1. Dùng compiled `createDatabasePool` của ứng dụng (certificate validation/channel binding giữ nguyên), BEGIN READ ONLY rồi ROLLBACK; chỉ truy vấn PostgreSQL privilege metadata. Script SHA256 `e6f49941529fb0a79679571887e5392be475156623dcfb94ad0ebb2048f4348e`.

PASS: current_user đúng cootton_catalog_reader; table-level SELECT trên đủ4visible views=true; table-level INSERT/UPDATE/DELETE product=false; table-level SELECT principal/product_review=false;0writes. Không chứng minh column-level grants, mọi relation/function, role membership, DML failure path hoặc Admin writer. Lượt harness trước `cootton-api04-reader-role-20261009-ng9kf` (`6090dae71ef74c93317f3f8178d8aa7293627770646128458b39f1c38b7fee61`) STOP/PRIVILEGE_PROBE_FAILED và không có diagnostic stage/code; không suy ra nguyên nhân quyền/TLS từ lỗi chung đó. Lượt sau dùng actual application pool và object OIDs qua pg_catalog, không đổi TLS/IAM/grants.

## Effective Admin metadata — table grants khác column grants

`FIX04-ADMIN-PRIVILEGE-001`: execution `cootton-api04-admin-role-20261009-27pjf`, script `8f26679f11b7db51f031a8553c0b1c3499b33f259399e4bb00c5b4702959cce4`, STOP/PRIVILEGE_MISMATCH. Harness đòi table-level SELECT+INSERT+UPDATE cho product, quá rộng đối với column grants; giữ nguyên kết quả STOP, không dùng nó để xin/cấp UPDATE toàn bảng.

`FIX04-ADMIN-PRIVILEGE-DIAG-001`: execution `cootton-api04-admin-role-diag-20261009-pmq6l`, script `4d955b89c45c907e7e76a6c76f10a003c3a58443a87bfa06aff48272eda983f7`, OBSERVED: current_user=cootton_catalog_admin, không superuser/CREATEDB/CREATEROLE; INSERT cả command/audit/outbox=true; table-level principal DML=false; product full-table assertion=false.

`FIX04-ADMIN-COLUMN-001`: execution `cootton-api04-admin-columns-20261009-gvvq8`, script `f12b8e98114bcf61ee67528e04c6076153db4fe8ed161192e4eadeb42c08ea32`, OBSERVED. Product table SELECT/INSERT=true, UPDATE/DELETE=false. UPDATE được cấp theo cột: title, description, care, category_id, brand_id, form_id, country_id, origin_evidence_id, care_evidence_id, lifecycle, version, updated_at. UPDATE=false trên id, seller_id, model_token, category_kind, brand_kind, form_kind, country_kind, created_at. INSERT được cấp trên20cột quan sát.

Đối chiếu các UPDATE product tường minh trong admin-catalog.ts tại source988c8a83 phù hợp tập cột mutable này. Kết quả giải thích table-level assertion thất bại bằng column grants, không chứng minh toàn bộ13actions/functions/inherited-role policy. Ba job dùng exact API7a053/account API hiện có/admin secret version1/compiled TLS pool; BEGIN READ ONLY/ROLLBACK,0writes, không execute business command hoặc đổi grant.

## Cấu hình, quay lui và điều kiện còn mở

[Manifest cấu hình/ngưỡng](API04_RUNTIME_CONFIG_AND_THRESHOLDS_2026_10_09.md) phân biệt observed settings, proposed acceptance và missing evidence. [Runbook rollback](API04_ROLLBACK_RUNBOOK.md) giữ cặp ACT006/Web cũ và containment không ADMIN_DATABASE_URL. HTTP ACT006 read/negative smoke bên trên bổ sung service-method containment13 actions trước đó; không chứng minh authenticated HTTP503 cho mọi action hoặc rollback production execution.

Các gate còn OPEN: ngân sách deadline video/SQL/storage và cấu hình timeout đồng bộ; owner signoff cho ngưỡng/monitor/rollback; full actual Firebase identity/provider/revocation matrix; complete column/role/function/transaction privilege acceptance và real create/412 under intended identity; positive public media và exact candidate API/Web pair; concurrency/load/max-input proof; backup/restore và rollback exercise; applied schema hash/status recheck; cross-encoder exact-request recovery; API04-RECOVERY-002 durable intents/retention/orphan policy. Không xóa object/receipt để đóng gate.

SDK body-read warning và các HTTP reads trên có scoped PASS. GATE-SEC/DATA/PUBLISH/PERF/OPS/RELEASE chưa được đóng hàng loạt. **API04 vẫn NOT READY TO DEPLOY**. Source/artifact/config/identity/encoder/grant/schema/traffic thay đổi phải kiểm lại phần bằng chứng tương ứng.
