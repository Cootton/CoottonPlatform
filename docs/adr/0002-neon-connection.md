# Neon backend connection

Owner authorized secure connection and a read-only SELECT 1 on 2026-10-01.

- PostgreSQL 18, Neon Free, Singapore, database cootton. Use the pooled endpoint.
- Backend-only DATABASE_URL in apps/api/.env, ignored by Git. The committed example is empty. Windows ACL tightening was denied by the local environment; user-only ACL enforcement is not confirmed. No credentials in frontend bundles, repository, logs or planning documents.
- pg parses explicit connection fields; URL SSL options cannot override certificate validation. TLS requires trusted certificates and TLS 1.2 or newer. Enable SCRAM channel binding when supported by the server.
- Pool is lazy, maximum 5 per process, minimum 0, connect timeout 15 seconds, idle timeout 30 seconds, statement timeout 10 seconds. No keepalive schedule defeating Neon scale-to-zero.
- Build API then run `pnpm --filter @cootton/api db:check`. The command loads its private .env, opens one connection, begins READ ONLY, executes SELECT 1, rolls back, and closes the connection. Failures expose only a generic error.
- Actual check succeeded on 2026-10-01: value 1. No schema, migration, business writes, role changes or application deployment.
- Existing cootton_owner credential is authorized only for this local connectivity check. It must not become the production runtime identity. A restricted runtime role remains pending locked schema and explicit access provisioning.
- The connector is ready for backend integration; current public liveness endpoint stays independent of database availability. No business repository or routes are created by this change.

References: https://node-postgres.com/features/ssl and https://node-postgres.com/apis/pool.
