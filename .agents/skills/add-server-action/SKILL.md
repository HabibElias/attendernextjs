---
name: add-server-action
description: Add an authorized Phase 1 staff Server Action with authentication, current role checks, shared Zod input, version protection, audit and safe failures.
---

# Add a staff Server Action

1. Read AGENTS.md and the spec contract. Confirm the requested Phase 1 mutation
   is authorized; no auth/inquiry business flow is implicit in setup work.
2. Add the first action module under its feature's actions folder with
   `use server`. Keep exports async and the route/controller thin.
3. Authenticate server-side; check active/current ADMIN role and MFA/recent auth
   where required. Never trust caller-supplied role, owner identity or timestamps.
4. Parse with the shared Zod schema. Validate allowed fields only; use stable
   localized field errors with no submitted values or raw Zod/provider payloads.
5. Delegate DB writes through server DAL. Check expectedVersion where defined,
   enforce business uniqueness and audit the mutation in the appropriate guarded
   transaction. Do not implement a new generic idempotency ledger.
6. Map errors to the spec's safe envelope. Distinguish conflict, denial, invalid
   fields and dependency failure; preserve truthful ambiguous-write behavior.
   A queued email is not delivered and an unauthenticated caller sees no PII.
7. Add a first test file only when needed. Begin with named `it.todo` cases for
   unauthenticated/forbidden, invalid input, stale version, audit rollback and
   successful mutation. Replace TODOs with meaningful tests before claiming done.
8. Check there is no dependency cycle or cross-feature import. Server-only
   internals stay inaccessible to clients; only valid action references cross
   the framework boundary. No secrets/private payloads in logs or errors.

## DONE CHECKLIST

1. Any file over 200 lines or function over 60? Split it into smaller modules now.
2. Run `pnpm check` and fix failures without disabling rules.
3. Report the files created and their line counts.
