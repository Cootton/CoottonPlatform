# ADR-KNOWLEDGE-001 — Tích hợp kiến thức mà giữ decision authority

- Stable ID: `ADR-KNOWLEDGE-001`; filename không định danh ADR Admin0004 được nhắc trong V001.
- Status: ACCEPTED cho documentation structure theo SRC-OWNER-20261007; không phê duyệt tech proposals.
- Date: 2026-10-07 Asia/Saigon.
- Supersedes: none. Preserves: ADR0001–0003, D01–D10, V001 owner overrides.

## Context

Chuỗi học mở rộng sang Spring, Redis, Kafka và nhiều patterns. Repository đã chọn NestJS modular monolith, PostgreSQL/Neon, direct-sale website trước payment. Nhãn ACCEPTED do assistant viết trong chat không đủ chứng minh owner chốt vendor hay triển khai.

## Decision

Thêm COOTTON_MASTER_PLAN index, modular engineering docs, nguồn/claim/conflict register, traceability và gates; cập nhật V001 bằng additive section. Giữ baseline contracts và nội dung cũ. Phân biệt decision status, implementation status, runtime evidence và execution authorization. Bài học framework-specific chỉ reference; advanced technology LATER/PROPOSED.

Không chọn Redis làm requirement V1 từ ARCH-CACHE-002; giữ nguyên historical claimed label, ghi applicability/conflict. Không tạo canonical DB thứ hai, đổi stack sang Spring, bật CP/VC/VCS, đổi selective reuse thành purge, hay suy ra deployment từ checkpoint secrets.

## Alternatives

Một tài liệu dài thay toàn bộ V001: khó audit, dễ mất overrides. Dùng chat memory: không độc lập, mất traceability. Chấp nhận tất cả assistant snippets: tự cấp approval và tăng scope. Chọn index+modules giúp đọc theo task, vẫn giữ nguồn đầy đủ.

## Consequences và verification

Work phải đọc index/governance trước task, link stable IDs tới contracts/gates, update changelog. Link/file/coverage/integrity checks xác nhận cấu trúc tài liệu; không chứng minh commerce runtime. Integration vào HEAD mới cần diff/reconciliation; không auto-publish/deploy. Owner ratification hoặc tech change tương lai cần ADR riêng.