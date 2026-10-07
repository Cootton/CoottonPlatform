# ADR 0005 — Reviewed catalog publication without commerce

2026-10-04. Owner assigned V001/GitHub synchronization and completion of review/publication. Actual Boxy product facts, measurements and images are supplied by the owner. Owner confirmed commercial permission for the full black shirt image and requested Cootton care advice.

The first release publishes product information only. Reviewed B2C draft prices are reference prices, not D02 effective purchase offers. Seller B2C/B2B transaction flags remain false. No stock reservation, order, payment, refund, CP/VC/VCS or marketplace activation follows publication. This scoped decision supersedes the historical requirement for an effective commerce offering before catalog presentation; that requirement still applies before purchasing.

Migration005 adds immutable product reviews and a current publication pointer. Public views require current canonical product version, APPROVED lifecycle, active seller, active referenced dictionaries and active referenced SKUs. Old receipt projections remain stored but are no longer served. No receipt-renewal worker is introduced.

Review captures a private sourced snapshot and a human declaration. Publication requires that exact reviewed snapshot to still match canonical facts. Media permission is approved for this product within that review; shared asset global approval is not granted or changed. Editing requires hiding/returning to draft and reviewing again.

Gallery images are delivered through an allowlisted same-origin proxy; only paths attached to currently visible products are served. Storage remains private. No arbitrary object access, signed URLs or third-party image fetching. Public image responses use no-store so hiding is effective for subsequent requests. Already downloaded images cannot be recalled. The existing private video is not exposed in this slice.

Runtime publication is disabled by default. Activating migration005, scoped grants and the flag requires the concrete scope in CATALOG_PUBLICATION_ACTIVATION.md. Source completion is not proof of actual migration, review, publication or deployment.
