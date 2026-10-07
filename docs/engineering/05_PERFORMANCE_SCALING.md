# Performance và scaling

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-PERF-001` · Targeted measurement theo DEC-VERIFY-001; không benchmark/provisioning trong task tài liệu.

Latency là thời gian một operation; throughput là operations/time. p50 không thay p95/p99, averages che tail; tăng concurrency có thể tăng throughput rồi làm latency/locks/queue worse. Little's Law `L = λW` dùng ở stable system, nhất quán units/boundaries; không capacity forecast bằng công thức khi overload transient. Đo end-to-end và breakdown network/edge/app/DB/provider, warm/cold riêng.

Vertical scaling tăng resources một node, đơn giản nhưng có ceiling/downtime/cost. Horizontal thêm replicas, cần stateless API, shared durable correctness, instance/connection budget; load balancer không scale DB writes tự động. Autoscale burst có thể gây DB pool storm. Bottleneck có thể query/locks/IO/provider rate, không CPU. Scale sau measurement và owner budget approval, không auto paid upgrades.

## Bounded work contracts

Cursor/keyset theo stable indexed ordering + unique tie-breaker; cursor scoped tới filters/order/authorization. Existing catalog/report default20/max50 giữ nguyên. Offset đơn giản cho small views nhưng deep offsets tốn scan, concurrent writes gây missing/duplicates; keyset cũng cần snapshot/freshness semantics nếu yêu cầu consistent export. Client không được đòi `limit=unlimited`; exports async bounded window/quota, không tải mọi rows vào memory.

Pools reuse DB connections giảm handshake; max5/process trong ADR0002 là accepted baseline, không max5 toàn deployment. Tính `sum(processes × poolMax) + workers + rollout surge + operational reserve <= actual DB connection budget`; pooled endpoint không phép app concurrency vô hạn. Acquisition/connect/statement/request timeouts có thứ tự trong deadline; bounded queue, controlled429/503, cancellation và graceful drain. Chỉ tuning actual capabilities; transaction pooling cần xem prepared statements/session-state compatibility.

Compression giảm bytes nhưng tốn CPU; negotiate supported algorithms, không nén lại compressed media, cap decompression/request size. Không expose secrets cùng attacker-controlled reflection trong compressed response nếu tạo side channel. Responsive images/CDN/field selection thường giúp hơn generic compression. Private no-store và canonical withdrawal contracts vẫn áp dụng.

Async logging có bounded buffer, overflow policy, redaction và delivery metrics; application debug logs có thể sample/drop, mandatory financial/security audit không được fire-and-forget mất dấu. Audit records atomic với business mutation/outbox, không stack/token/card/customer raw; storage/retention riêng để không đầy commerce DB.

## Rate limiting và admission

Token bucket cho controlled bursts; leaky bucket smoothing; fixed windows dễ boundary bursts, sliding windows chính xác hơn nhưng tốn state. Keys theo authenticated principal/action/scope và abuse signals, không chỉ IP (NAT/shared IP và proxy spoofing). Separate login, public catalog, private writes, exports và provider quotas. Quota counters không financial ledger. Distributed counter atomicity/failure mode cần review; Redis optional không mandate để có limiter. Return429 truthful và bounded Retry-After khi có; financial retries cùng key và recovery rules.

## Baseline budgets và evidence

D10 internal availability99.5%/30days, warm API p95≤500ms; D09 CWV p75 LCP≤2.5s, INP≤200ms, CLS≤0.1 là mục tiêu design, chưa measured PASS. Giữ actual D10 timeout/transaction/retry/job budget table; không thêm targets trái contract. Load verification cần expected mix/data size/burst duration/cache state, concurrency/payment mocks where approved, cold-start separation, error/latency/lock/pool saturation và recovery. Cost/quotas actual chưa biết → pending, không invent capacity con số.

Performance review order: fix query shape/N+1/indices → bounded payload/media → pool/concurrency/backpressure → cache nếu chứng minh → vertical/horizontal theo bottleneck → advanced architecture ADR. Trace D09/D10, GATE-PERF-001, GATE-OPS-001.