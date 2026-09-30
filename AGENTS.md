# Instructions for AI contributors

- Start with COOTTON_WORKING_V001.md. This repository publication task is documentation-only.
- Follow the latest explicit owner decisions and section 106 overrides; do not interpret historical no-tests phrases as the current absolute rule.
- Do not invent executable schemas, business policies, providers, rates or missing actual data. Mark unresolved decisions explicitly.
- No application coding, provisioning, migrations, financial actions or deployment until the owner assigns that scope.
- Keep stable IDs, canonical backend ownership, ledger integrity, idempotency and authorization boundaries.
- AI is optional; core services must function without it. Preserve per-model isolation and data-processing restrictions.
- Use only necessary scoped permissions. AI_SUB_ADMIN cannot self-escalate.
- Never commit secrets, owner private identifiers, customer data or banking login information.
- Maintain V001 in place. Do not create a new working version without explicit owner instruction.
