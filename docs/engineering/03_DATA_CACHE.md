# Data, consistency và caching

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-DATA-001` · ACCEPTED PostgreSQL truth theo DEC-DATA-001; Redis/partitioning additions PROPOSED/LATER.

## Store theo trách nhiệm

| Loại | Strength / trade-off | Cootton applicability |
|---|---|---|
| Relational PostgreSQL | Transactions, constraints, joins; query/index/locks cần thiết kế | Canonical commerce trên Neon current |
| Key-value Redis | Low-latency lookup, TTL/counters; eviction/durability/failover có giới hạn | Optional derived cache/rate counters, không business truth |
| Document | Flexible document schema, aggregate reads; cross-document constraints khác relational | Không thay canonical DB đã chốt bằng Firestore |
| Wide-column | Partition-key-centric distributed workloads | LATER, không tự thêm Cassandra |
| Graph | Traversals/relationships | In-app graphs hoặc PostgreSQL trước; dedicated DB LATER |
| Search index | Ranking/full-text/filter projections | Derived và rebuildable; advanced cluster LATER |
| Time-series/vector | Time-window analytics / similarity | LATER; no cross-model memory/egress bypass |
| Object storage | Blobs/media, lifecycle/versioning | Approved media; DB references và access metadata |

Object key không authorization. Private evidence dùng scoped access, retention, content validation và version/hash khi cần; public media approved derivatives. Object write + DB transaction không atomic xuyên stores: staging/reference state, retry, cleanup và reconciliation phải rõ. Không blob lớn/logs/model history trong commerce DB.

## SQL joins và query discipline

INNER trả matching pairs; LEFT giữ mọi left rows và NULL khi không match; RIGHT tương ứng đổi bên; FULL giữ cả unmatched; CROSS tạo Cartesian product. JOIN cardinality one-to-many có thể nhân hàng và double-count tiền. Aggregate child rows trước join, kiểm tra grain/uniqueness; `SUM(order.total)` sau joining items thường sai. Filter trên right table ở WHERE có thể biến LEFT thành matching-only; đặt condition ở ON nếu muốn giữ unmatched.

Indexes hỗ trợ lookup/sort/ranges khi planner thấy phù hợp; không bảo đảm index scan cho mọi query. B-tree không phải đoạn binary search array trong bài học. Composite index theo equality/range/order/workload; index tăng write/storage costs. Dùng actual query plans/rows/locks để review N+1, overfetch và long transactions; bounded fields/windows/keyset. Parameterized SQL và backend allowlists, không string interpolation từ user/AI.

## Transactions và consistency

Atomicity cho scoped PostgreSQL transaction, constraints/FK/unique/check bảo vệ được ràng buộc tương ứng; cross-row financial invariants cần posting/locking protocol. READ COMMITTED có snapshot mỗi statement; đọc rồi ghi không tự tránh lost-update/oversell. D03/D04 dùng guarded mutations, row/version locking và stable lock order. SERIALIZABLE có thể abort, cần bounded retry cùng operation; không bao external payment call vào retry closure.

Strong consistency cho commit stock/payment/permissions; eventual projections dùng cho discovery/reports có `asOf`/watermark và stale policy. Read replica có lag, không authority cho checkout hoặc grant revocation. Read-your-writes cần path/version contract. CAP nói khi network partition tồn tại phải đánh đổi linearizable consistency với mọi-request availability theo mô hình; không phải chọn hai ô tùy ý trong normal operations. ACID consistency (invariants) khác CAP consistency. Payment uncertainty phải PENDING/UNKNOWN/reconcile, không đoán thành công để có availability.

## Partitioning vs sharding

Partitioning chia logical table thành physical partitions trong database, range/list/hash; lợi khi pruning/retention/maintenance phù hợp, không thay index và không tự horizontal scale. Partition key/query/unique constraints/lock costs phải review. Không partition chỉ vì table có nhiều rows. Sharding chia ownership/data qua DB nodes, phức tạp cross-shard joins/transactions/rebalancing/routing; LATER. Replication sao chép state, khác phân mảnh; backup có independent recovery, khác replica bị propagate bad writes.

## ARCH-CACHE-002 — historical claim giữ, Redis không mandatory

Cache là derived data. Redis primary trong assistant snippet không override accepted no-Redis-required V1. Khi được phê duyệt cache: versionable keys có namespace/scope, TTL, commit-before-invalidation, explicit freshness/withdrawal policy và safe failure behavior. Không cache grants/financial state làm authority. TTL hạn chế stale window nhưng không thay invalidation. Commit→invalidate có crash/race window: versioned reads hoặc durable invalidation/outbox, replay/backfill; không claim absolute consistency từ delete-key.

| Strategy | Read/write path | Khi cân nhắc |
|---|---|---|
| Cache-aside | App read cache, miss→DB→populate; DB commit rồi invalidate | Default đề xuất cho public catalog khi cache cần |
| Read-through | Cache abstraction tự load authoritative source | Cần provider/library và failure contract |
| Write-through | Write qua cache layer và đồng bộ source | Không giả atomic DB+cache; ACK/failure semantics rõ |
| Write-around | Write DB; invalidate existing cached version; refill on read | Writes ít đọc lại |
| Write-back/behind | ACK cache rồi persist sau | Không cho payments/ledger/critical stock/auth; risk mất acknowledged write |

Stampede: coalesce/single-flight, jitter, bounded refill; lock lease/fencing nếu distributed lock thực sự cần. Stale-while-revalidate chỉ cho dữ liệu cho phép stale, không resurrect withdrawn private products. Penetration: bounded negative cache/rate limiting; Bloom filter LATER, false positives có thể xảy ra và stale membership nguy hiểm, không financial truth. Hot keys: monitor per-key load, cap values/requests; cache outage→bounded fallback, không đồng loạt đập DB.

Trace: D01/D03/D04/D08/D09/D10; GATE-DATA-001, GATE-PERF-001. Sources: [PostgreSQL isolation](https://www.postgresql.org/docs/18/transaction-iso.html), [partitioning](https://www.postgresql.org/docs/18/ddl-partitioning.html). Semantics reference không chứng minh actual Neon settings.