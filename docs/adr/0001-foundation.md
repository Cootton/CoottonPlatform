# ADR 0001 — Minimal shared foundation

Owner assigned repository foundation/core contracts on 2026-10-01 (Asia/Saigon).

Use pnpm workspace, TypeScript strict, one NestJS modular monolith with Express adapter, one shared Next.js Web codebase, and framework-independent contracts. Canonical data target is PostgreSQL; no table design or migration in this task. Mobile, AI, financial workflows and deployment follow their own readiness gates.

Technical decisions locked in this task: Node 24, opaque UUID v4 internal entity IDs, VND decimal integer strings, `/v1` prefix, liveness contract. Dependency versions are exact in package manifests and lockfile. Avoid duplicate client business logic, additional infrastructure and fake integrations.

Framework references: [NestJS](https://docs.nestjs.com/first-steps), [Next.js](https://nextjs.org/docs/app/getting-started/installation), [pnpm](https://pnpm.io/workspaces).
