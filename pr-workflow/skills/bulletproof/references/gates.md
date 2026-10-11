# Risk-Selected Evidence Gates

Read only the sections triggered by the diff, project instructions, or requested review scope. These are evidence options, not a universal checklist.

## Baseline for every review

- Confirm the exact base/head diff, commit range, generated files, submodules, and unresolved conflicts.
- Inspect applicable project instructions, release policy, CI definitions, required checks, and issue/history index when the repository requires it.
- Find callers, consumers, and existing tests for changed public functions, routes, components, schemas, and events. Use the repository's code graph first when instructed and available.
- Check diff hygiene: accidental secrets, environment files, debug code, disabled guards, broad generated churn, and unrelated changes.
- Inspect existing PR review threads and CI failures. Revalidate rather than blindly repeating or dismissing them.

## Static checks, tests, and builds

Select checks that can falsify the risks identified:

- Run focused tests for changed behavior and importing/consuming paths.
- Run affected lint/type/static analysis when those tools cover the changed language or generated contracts.
- Run a production build when build-time behavior, bundling, SSR/prerendering, generated types, assets, or deployment packaging changed and exact-head CI does not already prove it.
- Broaden to the full suite when the diff changes shared infrastructure, repository rules require it, or targeted failures reveal broad coupling.

Do not clear caches in a shared checkout. Use an isolated worktree for clean-build evidence. Do not write missing tests in audit-only mode; describe them in findings.

## Database and migration changes

Read the repository's migration rules before executing database commands.

- Verify ordering, immutability of prior migrations, fresh-database replay, and schema/client generation parity.
- Use a uniquely named disposable database or isolated service. Validate the exact target before cleanup; never use a fixed shared name or a broad path/environment variable.
- Review destructive DDL, long locks, table rewrites, backfill cost, constraint validation, enum sequencing, data conversion, and production-sized behavior.
- Trace expand/contract and rolling-deploy compatibility: old code with new schema and new code with old/intermediate schema.
- Compare application invariants and state transitions with triggers, constraints, RLS policies, indexes, and foreign keys.
- Identify backup, forward-repair, and rollback limitations. A clean fresh replay does not prove production lock duration or data compatibility.

## API, authentication, authorization, and tenancy

- Compare every changed caller payload with route parsing and strict validation.
- Verify authentication wrappers, role/capability checks, organization scoping, object ownership, and public-route allowlists.
- Follow tenant context through service calls, transactions, async callbacks, database policies, caches, and exports.
- Check pagination/bounded queries, N+1 behavior, input size, rate limiting, error disclosure, and idempotency where relevant.
- Test or reason through anonymous, wrong-role, wrong-tenant, stale-version, deleted-object, and concurrent-update cases.

## Payments, providers, and external side effects

- Verify amount, currency, decimal/rounding, supplier/customer identity, destination account, fee, tax, and retained snapshot authority.
- Classify provider failures before recovery: definitive rejection, ambiguous transport outcome, late success, duplicate/out-of-order event, and permanent missing resource are different states.
- Trace provider success followed by local persistence failure. Require a stable provider/idempotency reference or another exact recovery mechanism.
- Check retries and webhook replay for duplicate domain rows, allocations, emails, refunds, captures, transfers, and fulfillment.
- Review partial fulfillment, inventory/quota races, cancellation, expiration, refund/chargeback, compensation, and terminal recovery states.
- For shared or allocated payments, verify each downstream consumer supports allocations rather than assuming a direct foreign key.
- Confirm signing/authenticity, event ordering, replay resistance, audit evidence, reconciliation, operator repair, and observability.

## Jobs, queues, webhooks, and concurrency

- Verify stable deduplication keys, overlap protection, leases/locks, retry limits, backoff, poison-message handling, and terminal states.
- Keep external I/O outside long database transactions unless the design explicitly tolerates it.
- Trace side-effect success followed by transaction rollback or process death.
- Review timeouts at every nested layer and ensure timeout/lock settings do not invalidate deduplication.
- Check multi-worker races, stale events, replacement/supersession, clock assumptions, and recovery after partial progress.

## UI and user journeys

Rendered QA is required when visual/interaction behavior changed or the user requested release QA; it is not automatic for server-only changes.

- Exercise the actual changed journey, including save/persistence, refresh, errors, confirmation, cancellation, and permission states.
- Inspect representative desktop/mobile viewports and relevant browser engines in proportion to the change.
- Verify keyboard access, focus, labels, accessible names, loading/error announcements, reduced motion, and touch behavior.
- Inspect screenshots or the rendered page for clipping, aspect ratio, stacking, responsive layout, fonts, color schemes, and dynamic content.
- For public pages, inspect SSR output, metadata, canonical/robots behavior, structured data, hydration, cache keys, and returning-visitor asset compatibility.
- Do not create smoke scripts or screenshots inside the repository in audit-only mode; use disposable output locations.

## Configuration, flags, and deployment compatibility

- Inventory added, renamed, and removed configuration. Check templates, validation, secret/config stores, CI/build-time injection, and deployment manifests.
- Verify defaults fail safely and that disabled, partially rolled out, stale-client, and rollback states work.
- Check architecture/runtime compatibility, dependency lockfiles, container/build context, migrations-before-code ordering, and startup behavior.
- Confirm new routes/jobs/events are registered and owned operationally rather than merely present in source.

## Observability, operations, and release evidence

- Determine whether the feared failures create useful logs, metrics, traces, alerts, audit records, and operator actions.
- Validate release/readiness automation against real evidence. Empty input, arbitrary IDs/timestamps, path existence, or mocked deployment data must not produce a pass.
- Reuse remote checks only when they correspond to the exact reviewed head SHA and applicable configuration.
- Treat canceled, skipped, non-gating, flaky, and still-running checks accurately; inspect the underlying job rather than an aggregate label when needed.
- Distinguish source-ready, CI-ready, merged, deployed, flag-enabled, migrated, and live-observed states.

## Security and privacy

- Inspect trust boundaries, injection, request forgery, unsafe deserialization, secrets, PII, logging, upload/file handling, dependency risk, and privilege escalation where the diff exposes them.
- Verify administrative or repair paths require the correct authority and create durable audit evidence.
- Escalate destructive validation, production access, credential use, or live probes for separate authorization.

## Evidence summary

For every selected gate record:

- exact SHA and environment;
- command, remote check, or inspection performed;
- result and relevant counts/paths;
- what the evidence proves;
- what it does not cover;
- whether failure is introduced by the branch, pre-existing, or attribution-unknown;
- whether it blocks the current release regardless of attribution.
