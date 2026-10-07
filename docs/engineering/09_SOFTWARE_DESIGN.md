# HLD, LLD, OOP, SOLID và design patterns

Applicability hiện hành: [GOV-STATE-001](../governance/CURRENT_STATE.md). Knowledge guidelines không tự cấp adoption/runtime authorization; historical status được giải thích tại đó.

`ENG-LLD-001` · `LLD-OOP-001` historical ACCEPTED claim giữ provenance tại GOV-DEC-001; guideline không đổi accepted stack.

HLD trả lời components/domain ownership/data flows/trust/deployment/failure/cost. LLD trả lời một slice hoạt động ra sao: endpoints/DTOs, schema/constraints/index, transaction boundaries/locks/idempotency, state transitions, adapters/errors/events, complexity và verification. HLD boxes không đủ để coder tự đặt financial schemas; LLD class diagram không đủ production readiness.

## LLD contract cho Cootton

Mỗi task link D01–D10, source authority, principal/action/scope, invariants và feature gates. Map request→validation/auth→application orchestration→domain guarded transition→repository transaction→outbox/audit→safe response. Explicit invalid/empty/unknown states và deadlines; no hidden retries/external calls trong DB transaction. Interfaces tại real provider/domain boundaries, constructor DI, cohesive services; không generic framework cho mọi CRUD.

OOP encapsulation giữ private state và exposed business operations `confirm`, `cancel`, `markPaid` bảo vệ invariant; setter bất kỳ không là domain model. Abstraction định nghĩa stable contract, giấu vendor details. Polymorphism dùng interchangeable implementations; inheritance chỉ quan hệ is-a ổn định, ưu tiên composition/roles/capabilities khi user vừa buyer vừa staff/admin. Financial model cần guarded methods+database protection, không chỉ class privacy.

| SOLID | Ý nghĩa thực dụng | Cootton / sai lầm tránh |
|---|---|---|
| SRP | Cohesive reason to change | Separate provider mapping khỏi pricing; không mỗi method một service |
| OCP | Extend tại real variation point | Thêm gateway adapter giữ port; không abstraction mọi field |
| LSP | Implementation giữ behavioral contract | Gateway không report success khi unknown; subtype không phá invariants |
| ISP | Narrow interfaces theo consumers | Read/report port khác mutation/admin port; không god interface |
| DIP | Domain/application phụ thuộc stable abstractions | Vendor SDK phía adapter; constructor injection, không global hidden dependency |

## Patterns theo vấn đề, không checklist

| Pattern | Use case | Caution/status |
|---|---|---|
| Strategy | Approved pricing/shipping/provider variation | D02 snapshot/rules authoritative, không arbitrary runtime strategy |
| Adapter | Payment/storage/carrier API mapping | Verify provider contracts và security; good boundary |
| Factory | Construct configured approved implementation | Khi creation complexity thật; no unnecessary class hierarchy |
| Builder | Assemble complex immutable validated value | Không bypass required domain fields |
| Decorator | Bounded metrics/timeouts/wrappers | Retry financial side effects cần explicit protocol |
| Repository | Domain persistence operations | Không expose arbitrary SQL/query DSL cho AI |
| Facade | Stable application use-case API | Không god orchestration giữ tất cả business rules |
| Observer/pub-sub | Notify derived consumers | Durable outbox cho required effects; in-memory listener có loss window |
| State machine | Order/payment/return transitions | D03–D06 actual states, version guards; examples không approved states |
| Command | Typed auditable mutation intent | Auth, idempotency, expiry và exact payload binding |
| Singleton | Shared DI instance khi lifecycle phù hợp | Không mutable request/user state shared across requests |

Event sourcing/CQRS/saga là architecture patterns LATER hoặc scoped proposal, không bắt buộc để áp dụng SOLID. Pattern tốt giảm coupled reasons to change và làm invariants rõ; class names dài/interfaces vô ích làm code khó đọc. Trace D01–D08, GATE-CONTRACT-001/GATE-DATA-001.