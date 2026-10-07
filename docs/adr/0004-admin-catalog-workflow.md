# ADR 0004 — Human Admin and canonical catalog workflow

2026-10-03 owner assigned V001/OpenAPI synchronization and minimal Admin → draft → review → publish. Owner explicitly has no actual product data/images yet. Build input workflow; no fabricated products, automatic source approval, private email authority or public production deployment.

## Locked implementation boundaries

One backend, one PostgreSQL database and shared contracts. Firebase Admin SDK verifies ID tokens with revocation checks against configured cootton-firebase project; human identity maps to an explicitly provisioned canonical principal. No register-admin endpoint. Browser uses Firebase in-memory bearer tokens, no localStorage tokens or cookies for this slice. Same-origin Next BFF forwards bearer tokens only to server-configured backend. Private requests are no-store, mutations require exact origin and JSON, no bearer/PII in URLs or logs. Token auth age bounded for mutations; default deny until configuration/bootstrap exists. No financial, security-grant, AI or arbitrary SQL actions exposed.

Canonical catalog draft storage must implement D01 source facts, controlled dictionaries, seller identity, immutable SKU codes, source/evidence references and size charts. Admin edit inputs never constitute media processing or source verification. Media approval/upload and D02 effective offering prerequisites remain explicit. Incomplete draft allowed; submit/approve/publish validate completeness against D01. Source/product mutation, version check, idempotency result, audit and outbox must share one database transaction. Solo verified human Admin may review sourced data, but cannot manufacture missing facts.

Public projection is derived, not an input store. Do not edit migration001 or renew expired receipts without canonical verification. No continuous keepalive poller. Before enabling product publication, replace receipt-dependent availability with transactionally synchronized, version-guarded publication/revocation and bounded public freshness; schema change must be additive/reviewed and retain source authority. Payments/stock/points remain inactive and current noindex stays until D10 public release gates.

Actual Firebase UID/login configuration, SDK service credentials or runtime identity, scoped database writer, media storage and product facts require actual configuration. Unknown values remain unconfigured. Documentation and source completion must not be described as actual private-login/publication evidence.
