# Sync, async, queues và failure isolation

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-ASYNC-001` · DEC-ASYNC-001 baseline; Kafka LATER; cơ chế mới PROPOSED đến khi reviewed implementation task.

Sync: caller chờ result; phù hợp validations/transaction outcome trong request deadline. Async: durable accepted work thực hiện sau; caller cần job ID/status, cancellation/deadline/error semantics. `202` chỉ khi đã durable accept; fire-and-forget in-memory promise không bảo đảm completion. Async giảm thời gian chờ request, không tự giảm tổng compute hoặc bảo đảm ordering.

## Durable side effects

Outbox ghi business change + event vào cùng PostgreSQL transaction. Dispatcher claim bounded rows bằng reviewed lease/locks, gửi approved queue/task; crash sau publish trước mark-sent tạo duplicate. Consumer dedupe persisted event/operation ID với effect/state transaction khi có thể. External provider effect vẫn cần provider idempotency/query/reconciliation. At-least-once + idempotent consumer không thành universal exactly-once across arbitrary systems.

Event envelope đề xuất: `eventId,type,schemaVersion,aggregateId,aggregateVersion,occurredAt,correlationId`; payload minimal, không secrets/PII/model memory mặc định. D01–D10 sở hữu actual schemas, không executable format từ bảng này. Ordering theo aggregate/partition nếu contract cần; event đến muộn không ghi đè state mới. Retry transient bounded exponential backoff+jitter+deadline; permanent poison/quarantine và operator action; không endless DLQ replay. Replays phải reauthorize, kiểm tra feature gate/expiry và cùng effect keys.

Queue thường chia work cho consumers; pub/sub fanout cho nhiều subscriptions độc lập; delivery/ack/redelivery/retention của provider phải xác minh. Backlog depth và oldest-age cần alert, không chỉ queue empty/nonempty. Backpressure cap producers/consumers/concurrency để DB không bị workers làm cạn pool. Deadlines/leases không tự cancel external irreversible action đã gửi.

## Kafka — LATER

Kafka lưu partitioned event log với retention/replay và consumer groups; ordering trong partition, không toàn topic. Hợp khi cần nhiều independent consumers, stream integration/CDC, sustained event throughput và replay capability có evidence. Payment queue nhỏ không đủ lý do thêm Kafka. Partition key, retention, schema compatibility, offset/effect commit, duplicate handling, lag, brokers/quorum/security/cost/on-call phải ADR trước adoption. Kafka transaction semantics không bao remote payment gateway hoặc mọi PostgreSQL write.

Batch xử lý bounded chunks/window, tốt cho reports/backfill; resumable cursor/checkpoint và job leases. Stream xử lý liên tục; event time khác processing time, late/out-of-order events cần watermark/window/correction policy. Báo cáo Cootton phải dùng source provenance/asOf, không fake realtime từ batch trễ. CDC là database change stream, không tự là domain event; redact scope và ownership trước downstream.

## Circuit breaker và resilience

`ASYNC-CB-001` PROPOSED: CLOSED gọi bình thường; failure threshold/window→OPEN fail fast; sau cooldown HALF_OPEN thử bounded requests; success/failure theo contract quyết định đóng/mở. Không substitute retry/idempotency. Timeouts ở mọi outbound call, bulkhead quotas theo dependency, concurrency limits và fallback truthful; timeout payment vẫn UNKNOWN, không success/failure fabricated. Retry amplification qua nhiều layers phải có một owner và total budget.

Critical commerce không phụ thuộc AI/search/notifications. Provider outage có degraded read/status/support; failed email không rollback order, nhưng durable notification outcome phải recover. Trace D03/D04/D05/D07/D10; GATE-ASYNC-001. Source: [Apache Kafka introduction](https://kafka.apache.org/intro/); deployed provider guarantees cần check riêng.