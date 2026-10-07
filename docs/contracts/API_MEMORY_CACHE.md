# API memory cache — V001 implementation

One injected MemoryCache singleton shared by public catalog and Admin invalidation. No new service, dependency, schema, credential or production deployment. Public JSON DTOs only; Admin, Auth, payments, inventory and media bytes remain uncached. HTTP no-store remains unchanged.

Limits:16MiB serialized key/value budget,1000 retained entries,256KiB per entry,100 unique pending loads. Actual process RAM includes JS overhead beyond serialized budget. LRU eviction; monotonic expiration; TTL jitter90–100 percent. Catalog lists30s, details60s; validated canonical query parameters in keys. Empty lists may remain empty for30s. No negative404/error caching or stale-on-error.

Cache hits containing products revalidate IDs/versions through the existing restricted visible_product view. This deliberately retains a lightweight database query to respect verifier receipt expiry and withdrawal, without changing applied migrations or exposing validity internals. Invalidated/expired visibility reloads canonical public DTOs; DB validation failure returns503. List membership additions can lag at most30s. Cache does not authorize commerce or return exact price/stock.

After successful Admin canonical COMMIT, invalidate the catalog singleton. Generation fencing stops earlier in-flight loaders repopulating invalidated entries. Same-key concurrent loads coalesce; failed loads clear pending state. Returned JSON is parsed anew to prevent caller mutation contaminating cache. Disable via COOTTON_CACHE_DISABLED=true; stats() reports aggregate counters only, no keys or user data.

RAM is per process/revision and ephemeral. No cross-instance invalidation guarantee. The visibility check still runs against PostgreSQL; future publication needs its own transactional projection/version contract. Redis integration is not implemented.

Validation: TypeScript build and verification/cache.cjs exercise concurrent misses, expiry, mutation isolation, late fill after invalidation, visibility rejection, validation failure, LRU bounds, oversized values and loader errors. No production database writes or data seed.
