# Networking, HTTP/API và real-time

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-NET-001` · API semantics là kiến thức; route mới/provider/topology là PROPOSED cho đến task review. Existing CORE `/v1` giữ nguyên.

## Đường đi request

Client resolve DNS → mở connection tới edge → TLS handshake/certificate verification → HTTP request → routing/reverse proxy → backend identity/authorization/validation → business handler → safe response. Connection có thể được reuse; không phải mỗi request đều resolve DNS và handshake lại. DNS maps names qua records/resolvers/cache, không xác nhận app khỏe; TTL và propagation ảnh hưởng cutover. A/AAAA addresses, CNAME alias; mail MX không route Web.

HTTPS = HTTP qua TLS: bảo vệ confidentiality/integrity trên transport và xác thực endpoint theo certificate. Không thay authorization, input validation hoặc bảo vệ dữ liệu trong logs. Edge TLS termination cần verified/protected downstream hop phù hợp trust boundary; không tắt DB certificate verification. Trust forwarded headers chỉ từ proxy chain được cấu hình; không dùng X-Forwarded-For do client tự gửi làm identity.

Forward proxy thay mặt client ra ngoài; reverse proxy đứng trước origin, có thể terminate TLS, route, buffer và giới hạn requests. Load balancer phân phối traffic theo capacity/health; liveness process khác readiness dependency. API Gateway tập trung auth admission, quotas, routing/versioning; object-level permission và business invariants vẫn backend. CDN cache gần users cho public assets/approved public responses; private Admin/order/PII không shared-cache. WAF không thay secure code.

## HTTP methods và idempotency

| Method | Semantics | Safety / retry |
|---|---|---|
| GET / HEAD | Read representation; HEAD không response body | Safe và idempotent; không tạo financial mutation |
| POST | Create/command | Không idempotent mặc định; business command cần persisted idempotency key |
| PUT | Replace state tại URI theo contract | Idempotent intended effect; vẫn auth/version/preconditions |
| PATCH | Partial change | Không idempotent mặc định; operation và concurrency contract rõ |
| DELETE | Remove resource theo contract | Idempotent intended effect; replay response có thể khác; không delete financial history |
| OPTIONS | Describe supported communication, CORS preflight | Không business mutation |

Idempotent không có nghĩa cùng HTTP response hoặc miễn authentication. `POST /payments` không an toàn retry chỉ vì timeout; xem ENG-PAY-001. Request size/schema/field allowlist phải bounded; reject unknown sensitive fields để tránh mass assignment. API JSON VND theo CORE decimal integer string; opaque IDs không cấp quyền.

## Status và error contract (proposed mapping cho handler mới)

| Status | Khi dùng |
|---|---|
| 200 / 201 / 204 | Thành công / resource created (Location nếu hợp lệ) / no body |
| 202 | Accepted async, có durable job/status reference; không khẳng định đã hoàn thành |
| 304 | Conditional read unchanged theo validators; không body representation |
| 400 / 422 | Malformed/schema invalid / semantic validation theo endpoint contract |
| 401 / 403 | Thiếu/invalid authentication / authenticated nhưng action bị deny |
| 404 | Resource absent hoặc scoped non-disclosure đã định nghĩa; tránh existence oracle |
| 409 / 412 | State/idempotency conflict / precondition failed |
| 429 | Admission/rate limited; Retry-After khi biết |
| 500 / 502 / 503 / 504 | Internal error / invalid upstream response / unavailable / gateway timeout |

Safe `{code,message,requestId}`, không stack/secrets/raw provider payload. Existing catalog actual400/404/503 giữ route contract; bảng này không âm thầm sửa implementation. OpenAPI, DTO validation và docs phải khớp source tại reviewed SHA. Logs chứa correlation IDs, không token/query PII.

## Polling / Long Poll / SSE / WebSocket

| Pattern | Cách hoạt động / thích hợp | Chi phí và recovery |
|---|---|---|
| Polling | GET định kỳ; trạng thái job/order ít thay đổi | Dễ vận hành; interval/jitter/backoff, cancellation, không poll vô hạn |
| Long polling | Server giữ request đến event hoặc timeout; client mở lại | Giảm empty requests, giữ connection/server resources; dedupe khi reconnect |
| SSE | Server→client event stream trên HTTP; progress/notifications | Một chiều; event ID/replay window, heartbeat, proxy buffering/timeout, auth |
| WebSocket | Bidirectional long-lived connection; chat/collaboration | Connection limits, heartbeat, reconnect, per-message auth/schema/quotas, fanout |

Default đề xuất cho V1 là bounded polling nếu cần status. SSE/WebSocket PROPOSED khi UX cần; không chọn cho mọi endpoint. Không gửi access token trên URL; native EventSource header constraints cần auth design riêng. Real-time notification là signal để refetch authoritative state, không proof payment success; missed/reordered/duplicate messages phải recover. Trace: CORE/D08/D09/D10; GATE-SEC-001, GATE-PERF-001.

Nguồn semantics: [HTTP Working Group RFC9110](https://httpwg.org/specs/rfc9110.html). Không dùng HTTP method category thay domain idempotency.

## Review clarification — HTTP/auth/cache

401 có WWW-Authenticate challenge theo applicable scheme/RFC, không expose token. Private conditional304 vẫn authorize current resource trước; cache validator không bypass permissions. Private/error/rate-limit responses không shared-cache; Retry-After không permission tự resubmit financial command. Public404/negative caching tuân D09 freshness/withdrawal; không suy ra cache safety từ status alone.

## API-01 — Actual HTTP surface

Use [the pinned source inventory](API01_HTTP_INVENTORY.md) for current routes, methods, expected statuses, headers, data guards and Web proxy behavior. Generic method/status teaching above does not override these source-derived facts. API01-F001…006 are inputs to API-02/API-03/API-04; inventory verification does not close Production Gates.


API-02 adds [current endpoint/action records](../contracts/API_ENDPOINT_CONTRACTS.md) and [evidence](../governance/API02_EVIDENCE.md), with explicit prepared-versus-runtime status. Preserve API-01 source facts as historical inventory rather than rewriting them to the new proposal.
