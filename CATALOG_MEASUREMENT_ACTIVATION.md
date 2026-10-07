# Measurement visibility fix — prepared activation scope

> **ACT006-RUNTIME-001 · 2026-10-07:** Migration006 đã áp dụng/idempotent và API `cootton-api-act006-3c768d6` đã nhận100% traffic. Đọc [runtime checkpoint](docs/operations/ACTIVATION006_CHECKPOINT_2026_10_07.md) để phân biệt DB rollback/storage helper/HTTP evidence. Boxy vẫn DRAFTv23; các ghi chú006 chưa áp dụng dưới đây là lịch sử. Full Production Gates chưa PASS.


2026-10-07 · Source/CI fix assigned; production migration/deploy not executed.

1. Verify fixed-source CI, hashes001–005, additive006 view/grants and current backup/recovery evidence.
2. In an assigned maintenance task, use the existing maintenance connection and explicit catalog-measurement-migrate.cjs. It verifies registered hashes001–005 then applies/verifies006 transactionally under the existing advisory lock. No product data, immutable review, role or storage permission change. No runtime startup migration.
3. Deploy a verified fixed API artifact using existing attached identity/config and approved limits. Shared initializer requires FIREBASE_PROJECT_ID=cootton-firebase and existing private bucket config. No downloaded credential, new IAM or public bucket.
4. Verify fresh-instance public media before Admin login, hidden-path404 and dictionary-revocation fail-closed behavior under safe scoped verification. Keep actual Boxy hidden at observed DRAFTv23 unless owner assigns republish separately.
5. Older unpublished approvals require return-to-draft/re-review before publish. Existing visible legacy snapshots are covered by006's canonical reference guard. API rollback alone retains006's guard but can reintroduce the cold media bug; rollback to005 alone reintroduces measurement revocation. Prefer contained mode/compatible roll-forward, no edits to applied005 or deletion of review history.

No commerce/order/payment/points/public video/indexing activation. Record actual artifact/revision/schema and gate evidence after authorized execution; source completion is not deployment proof.
