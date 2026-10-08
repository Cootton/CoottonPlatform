# API04 — bản ứng viên và kiểm chứng chuẩn bị release

> **FIX04-READ-OPS-001 · 2026-10-09:** source SDK fix `988c8a83…`, API candidate `7a053d12…`; CI/build PASS, actual-account1.000 reads/0SDK warnings, HTTP read/negative checks PASS. Read [scoped SDK/HTTP evidence](API04_SDK_HTTP_OPERATIONS_EVIDENCE_2026_10_09.md) and [observed config / proposed thresholds](API04_RUNTIME_CONFIG_AND_THRESHOLDS_2026_10_09.md). API588 evidence below remains historical. ACT006 remains serving; no serving deployment/traffic change. Thresholds/deadline changes are PROPOSED, full gates and API04-RECOVERY-002 remain OPEN. **NOT READY TO DEPLOY**.

`PREP04-CANDIDATE-001` · tổng hợp 2026-10-09, Asia/Saigon. Các lượt build/runtime ban đầu chạy ngày 2026-10-08 UTC. **NOT READY TO DEPLOY**.

## Thẩm quyền và phạm vi

Lời người dùng: “chốt bản build ứng viên, kiểm chứng bằng tài khoản dịch vụ thực tế, điều tra cảnh báo media và hoàn thiện phương án quay lui”, sau đó “tiếp tục công việc”. Đây là giao việc chuẩn bị và kiểm chứng; không phải bằng chứng phê duyệt rollout, traffic, IAM hay toàn bộ Production Gates. Runbook và các bước release còn lại là đề xuất assistant để review. Không thêm quyết định ACCEPTED.

Source ứng dụng cố định: `e06d3de8e74bc7cb431734d32d339ef63e1824ef`. Nền tài liệu đã merge: `e63f661ae792180fff1898f235b73eb10c974d72`. Các trạng thái UNBUILT trong checkpoint trước là lịch sử đối với cặp artifact dưới đây. ACT006 vẫn là runtime; chưa tạo revision phục vụ API/Web hoặc chuyển traffic.

## Artifact đã build và push

Cloud Build `a4aefc75-e2bf-47db-b9f5-5aa242407421`: **SUCCESS**, source tar tại SHA cố định, Dockerfile.api và Dockerfile.web cùng source. Dùng digest khi release, không dùng tag.

| Thành phần | Registry artifact |
|---|---|
| API | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/api@sha256:588db48698db2c1886b081f40cfebf7e684a58a00cd060ad29a003d0e02e9654` |
| Web | `asia-southeast1-docker.pkg.dev/cootton-firebase/cootton-containers/web@sha256:3d6d02a8d377704a334bd03ed9da64839b5088613147bfad0b704979e6d85bbb` |
| Base quan sát trong build | `node@sha256:d6aa754f16b3197301076f047b5def2f02ea1dbbc2ca920407d46d7ec7f87b20` |
| Node | `v24.21.0` |
| FFmpeg và ffprobe | `5.1.9-0+deb12u1` |
| SHA256 ffmpeg | `0dafc1360bb07743f76abeb1e4ae16b0aaa1331e9041a0e8d6a8524111dc0cbb` |
| SHA256 ffprobe | `0e598fe6d247bfe63757f5c839dc145a166b3f876f2875ca88a306a5b8ec5a58` |

Dockerfile chạy cache/publication/media/video verification trong API image; video 2 PASS, 0 SKIP. Việc ghi nhận digest không chứng minh Dockerfile có thể rebuild bit-identical: base tag và apt resolver vẫn có thể thay đổi. Chỉ cặp artifact đã ghi được đóng băng.

Lịch sử lỗi giữ nguyên: local API build thành công nhưng push từ Cloud Shell Docker gặp lỗi kết nối registry; chuyển sang Cloud Build đã push thành công. Không gộp local push failure thành remote build failure. Không thay dependency hoặc source ứng dụng để làm build PASS.

`PREP04-ENC-REPEAT-001`: pull đúng API registry digest rồi chạy Docker `--network=none`; tạo một clip black 720×406/30fps/0.5s và gọi normalizeVideo hai lần trên cùng bytes. Video và poster đều byte-identical: PASS. Input SHA256 `70682440db0eb96d20372df50c81ad8c26d097615b77157afa073d9dfe32f902`; output video `d608b7ebe09d49d45cef8043a02c0f33313a2013fccef64c7458ca6da826b0e8` (2204 bytes), poster `bea9ccb6dab6c66b57d07f72e9b8f5bb70c619b786fe3060faae92a9fee5a17d` (294 bytes). Metadata: 720×406, 500ms. Không cloud reads/writes trong workload. Kết quả giới hạn một fixture; không chứng minh cross-version equality với Ubuntu6.1.1 hoặc mọi video người dùng.

Lượt offline đầu `16d4214d-8fa2-43f3-9687-b3139255b997` FAIL trước verification vì Cloud Build mount workspace che `/workspace` của image; rollback step chưa chạy. Sửa cách chạy bằng Docker container độc lập, không đổi image/source. Lượt kế tiếp `b328c75a-386d-4f29-848f-02499813ec71` có encoder step PASS nhưng build tổng FAIL vì rollback harness require reflect-metadata từ thư mục không có direct dependency. Phải đọc riêng kết quả từng step; không đổi lịch sử FAIL thành PASS.

## Tài khoản dịch vụ thực tế — PASS giới hạn read

`PREP04-SDK-ACTUAL-001`: Cloud Run job `cootton-api04-read-wo9unntm`, execution `cootton-api04-read-wo9unntm-z8s5f`, chạy đúng API digest trên. Identity lấy qua runtime metadata và xác nhận `cootton-auth-verifier@cootton-firebase.iam.gserviceaccount.com`; dùng ADC của job, không mượn operator token.

Job có 1 task, parallelism 1, max retries 0, timeout 300s, 1 CPU/512MiB. Không schedule, không gắn database secret, không có endpoint phục vụ traffic. Diagnostic script SHA256 `43aa42e50a79d759912186a457f727a2e0795e888f4e936d16a66a810a506cb5`. Resource được giữ để truy vết, không có tự động chạy lại.

- 200 lượt đọc luân phiên đúng hai video/poster fixture đã có; generation-pinned, giới hạn byte cục bộ, `decompress:false`, stream destroy trong finally.
- Đối chiếu SHA256 với tên bất biến, size/MIME/private,no-store/identity encoding và generation không đổi: PASS.
- Video: generation `1791426801241775`, 2204 bytes, video/mp4. Poster: generation `1791426801948489`, 294 bytes, image/webp. Không công bố đường dẫn object hoặc raw metadata.
- 0 cloud writes, không thêm fixture, không SQL, không purge/delete. Chưa kiểm lại cả sáu object lịch sử.

PASS này chứng minh effective metadata/read rights trên hai object dưới identity thực. Không chứng minh actual create-if-generation-match0, SDK save/412, đầy đủ Firebase Auth privileges, runtime database binding hoặc toàn bộ HTTP identity matrix. Impersonation của operator từng bị PERMISSION_DENIED; không cấp Token Creator/IAM mới. Kiểm chứng bằng runtime ADC giải quyết giới hạn cho lượt read này, không sửa lịch sử permission denial.

## Điều tra cảnh báo media — tái hiện, chưa đóng

Đúng candidate/Node24.21.0/Storage SDK8.2.0: 200 reads PASS, **200 MaxListenersExceededWarning**, 100 emitter phân biệt; warning mẫu vượt ngưỡng tại 11 listeners, mức listener quan sát cao nhất trên warning emitter là 12. Exposed read stream có tối đa 3 listeners được probe ghi nhận. Hai số đo này thuộc các stream khác nhau.

Stack mẫu đi qua internal `PassThrough`, `node:internal/streams/pipeline`, `end-of-stream`, và `teeny-request@11.0.1/build/src/index.js:194`. Cảnh báo được thu nhận, không nâng listener limit hoặc tắt warning. Tài liệu [Node v24.21.0 stream.pipeline](https://raw.githubusercontent.com/nodejs/node/v24.21.0/doc/api/stream.md) mô tả khả năng giữ listener sau callback và rủi ro khi tái dùng stream sau failure; đây là cơ chế để điều tra, không chứng minh nguyên nhân cụ thể của SDK trong lượt này.

| Chỉ số sau GC, workload tuần tự | Trước | Sau 200 reads |
|---|---:|---:|
| RSS bytes | 79,544,320 | 88,039,424 |
| Heap bytes | 14,383,232 | 17,491,872 |

Cuối lượt chỉ ghi `PipeWrap` trong active resources. Không suy ra leak-free hoặc leak từ 200 lượt ngắn. Operator probe trước đó giữ nhiều stack record hơn, vì vậy không dùng chênh lệch bộ nhớ giữa hai probe làm bằng chứng sửa lỗi. Workload runtime chỉ giữ bốn stack mẫu.

Kết luận điều tra: warning được tái hiện trong đường SDK transport của chính artifact; byte integrity và read permissions không bị phá trong scenario này. **PREP04-SDK vẫn OPEN**. Việc tiếp theo cần đối chiếu warning theo loại object/transport path, chạy soak có giới hạn và abort/error/retry scenarios trong môi trường cô lập, rồi review dependency/cleanup remedy. Mọi bản sửa tạo artifact mới phải build, kiểm lại và cập nhật digest; không che warning để giữ digest này.

## Quay lui và điều kiện còn thiếu

[Runbook quay lui](API04_ROLLBACK_RUNBOOK.md) ghi cặp baseline, containment, thứ tự dừng/khôi phục, bảo toàn SQL/receipts/objects, điểm review latestRevision và các ngưỡng chưa phê duyệt. Traffic-only rollback về ACT006 có thể phục hồi bản thiếu API02–04 protections; cần containment Admin mutations.

`PREP04-RB-CONTAIN-001`, Cloud Build `c8241845-d692-4c5c-ac89-c48565a92802`: exact old API digest được pull, Docker network=none, không ADMIN_DATABASE_URL. 13 service.command actions đều 503 ADMIN_NOT_CONFIGURED, instrumented SQL/media calls = 0: PASS cho service-method containment. Sửa harness require dư thừa bằng imports của ứng dụng; không thay source/image. Public-reader/HTTP/mixed-version compatibility vẫn OPEN. Re-read API/Web service sau kiểm chứng xác nhận vẫn 100% ACT006 và 100% Web00006-7c9/latestRevision=true.

Build containment tổng SUCCESS, kết thúc `2026-10-08T18:18:06.265652Z` (2026-10-09 01:18:06 Asia/Saigon). Bằng chứng này không thay cho review/phê duyệt runbook.

Full rollback execution, HTTP/public-reader compatibility, exact secret-version/config diff, encoder cross-version recovery, actual write precondition dưới service identity, full identity matrix, monitoring/backup/restore, approved thresholds/signoff và API04-RECOVERY-002 vẫn OPEN. Historical PostgreSQL/HTTP/GCS proofs không tự trở thành proof của candidate phục vụ production.

Chuỗi công việc sau review: xử lý SDK/encoder recovery gaps → kiểm chứng cặp API/Web và containment qua HTTP trong môi trường cô lập → chốt manifest/config/monitor thresholds cùng người chịu trách nhiệm → scoped release approval → no-traffic revisions/readiness → approved traffic progression. Chưa cho phép tự động tiến lên khi còn thiếu evidence.

Không thay V001, D01–D10/DEC, SQL001–006, quyền, sản phẩm, payment/points/AI hoặc noindex. Chỉ preparation build và diagnostic job có thay đổi cloud; application services giữ nguyên traffic.
