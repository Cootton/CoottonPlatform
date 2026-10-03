# Cootton deployment checkpoint — 2026-10-03

API and Web are deployed. Authenticated Admin acceptance passed after the owner retried directly; no password or token inspected.

- API: https://cootton-api-agg2nh5esq-as.a.run.app ; ready revision cootton-api-00001-nhk ; source 960a9bd82c24d1ef5df9007f2f76c1cb28a6bc18.
- Admin: https://cootton-web-agg2nh5esq-as.a.run.app/admin ; ready Web revision cootton-web-00003-hgf serving 100% traffic ; source d1bde2a59973e6e9601ffb6567f763cade830fa8.
- Initial Cloud Build 5e1acd78-8b2d-4779-b93f-ed16ed0668ff SUCCESS. Diagnostic Web Cloud Build 463b3e87-d620-4a5e-974a-666946f6566d SUCCESS. Web TypeScript check passed.
- API identity cootton-auth-verifier: scoped Firebase Auth read and two version-1 database secrets. Web identity cootton-web-runtime: no database secrets. No service-account key created.
- Both services: asia-southeast1, min0/max1, 1CPU, 512MiB, concurrency10, request billing, public HTTPS invocation. Admin application authorization remains required.
- Verified HTTPS health/catalog 200, empty canonical catalog; unauthenticated Admin API/BFF session401; configured Admin page200; exact mutation origin. Authenticated UI showed verified management permission, logout control and product management after backend session, dictionaries and catalog reads completed.
- Initial Firebase sign-in failed with generic notice. Added allowlisted safe configuration/network/credential diagnostics without raw auth logging. Owner then signed in successfully; initial root cause was not conclusively established.
- Synthetic sample draft create/save is not yet exercised; no actual product supplied. Publication, commerce, payments and points remain inactive.
- Existing custom domains and legacy data have not been replaced or purged. Source changes remain on draft PR16, not claimed merged.
