---
name: bulletproof
description: Use when evaluating whether an existing branch or pull request is safe to merge or release, especially for release-grade review, ready-to-ship, hardening, bulletproofing, or hesitation-before-shipping requests.
---

# Bulletproof Pre-Ship Review

## Overview

Produce an honest, evidence-backed release verdict. Passing checks are supporting evidence; the core job is to determine whether the changed system still preserves its contracts across real user, data, provider, and recovery paths.

**Core principle:** review the failure semantics before selecting gates. Never turn a review request into unauthorized implementation or release work.

## Choose the operating mode

Infer only what the user actually authorized. When unclear, use **audit-only**.

| Mode | Allowed work | Not implied |
|---|---|---|
| Audit-only (default) | Inspect code, PR state, history, CI, and docs; fetch remote refs; run safe diagnostic checks; use disposable local resources | Source edits, test creation, commits, pushes, PR comments, issue changes, merge, deploy |
| Audit-and-fix | Audit plus the specifically authorized code/test changes and local verification | Push, PR mutation, merge, deploy |
| Release execution | Only the external mutations the user explicitly requested | Any adjacent publication, rollout, or cleanup |

Updating a remote branch is a separate mutation. If requested, determine whether the user means local integration or the remote PR branch. Record the remote SHA before the update, use the repository's accepted merge/rebase policy without rewriting history unless explicitly authorized, and verify the final remote SHA and ancestry. Do not treat “review,” “ship,” or “bulletproof” alone as permission to push.

In audit-only mode, continue gathering independent findings after discovering a blocker. Do not “stop and fix,” create regression tests, save reports in the repository, or edit the PR.

## Establish the exact review state

1. Read the applicable instruction hierarchy and project release/migration/runbook documents. Do not assume a particular instruction filename, package manager, runtime, framework, base branch, or CI system.
2. Resolve the PR's actual base and head from current remote evidence. Record base SHA, head SHA, merge base, divergence, worktree status, and whether required checks belong to that exact head.
3. Preserve user work. If the checkout is dirty, or a command may write caches, generated files, dependencies, databases, or build output, use an isolated worktree or other disposable environment. Never stash, switch, clean, or delete caches in the user's active dirty checkout.
4. If a base update was authorized, perform it before the substantive review. Report before/after SHAs, integration method, conflicts, push status, and final ancestry. Substantive conflict resolution is code authorship; do it only when authorized.
5. Review the post-integration diff. Distinguish the code reviewed, remote CI, merge state, deployment, and live behavior; none proves the others.

## Build the risk map

Inventory changed behavior, not just files. Identify:

- user journeys and operator workflows affected;
- money, identity, permissions, tenant boundaries, irreversible data, external side effects, and legal/compliance outputs;
- schema, API, event, job, feature-flag, configuration, and rollout compatibility;
- callers, consumers, tests, generated artifacts, and operational dependencies;
- bypassed hooks or checks, unresolved review threads, and relevant prior defects required by project instructions.

For large or high-risk diffs, use independent read-only review lanes when collaboration is available. Partition by failure domain, not arbitrary file count, and validate every reported concern against the exact reviewed code. Do not disclose private repository material to external models without permission.

## Mandatory semantic contract review

Trace every applicable seam in both directions. These checks are mandatory even when tests and CI are green.

| Seam | Questions to answer |
|---|---|
| UI or caller -> API/schema | Does each real payload satisfy the callee's current validation, required fields, versioning, and ownership rules? |
| Application state -> database constraints | Do runtime transition graphs, enums, triggers, RLS, uniqueness, and nullability agree? |
| First attempt -> retry/replay | Is retained state reused, or does replay create conflicting IDs, rows, allocations, or side effects? |
| Provider I/O -> local persistence/recovery | What happens if the provider succeeds and the next database write fails? Can the exact object be recovered? |
| Direct flow -> batched/allocated flow | Do refunds, compensation, reporting, documents, and reconciliation support both relationship shapes? |
| Authority/identity -> destination/effect | Is the selected account, tenant, supplier, billing entity, or recipient the same authority used to quote and record the action? |
| Success -> fulfillment failure -> compensation | Are definitive failure, ambiguous outcome, refund, recovery, and terminal states complete and reachable? |
| Transaction -> report/document | Do canonical source types, adjustments, identifiers, and snapshots appear in reports, receipts, exports, and reversals? |
| Role/tenant -> data access | Are route authorization, service scoping, transaction context, and database enforcement aligned? |
| Old version -> new version | Can rolling deploys, stale clients, cached assets, existing rows, and disabled flags coexist safely? |

For each risky seam, write the concrete failure sequence: starting state, action, partial success, interruption or race, retry/cleanup behavior, final state, affected user, and recovery path.

## Audit the tests, not only the code

Tests can conceal a contract break. Look for:

- hand-built fixtures that production can never create;
- mocks that remove the integration boundary where failure occurs;
- unit state machines that disagree with database constraints;
- tests that assert a stale payload or incorrect filter instead of desired behavior;
- happy-path-only provider, webhook, retry, compensation, and allocated-flow coverage;
- a green test at one layer paired with contradictory real-database or end-to-end behavior.

Name the smallest regression test that would prove each confirmed finding. Write it only in an authorized fix mode.

## Select evidence by risk

Read [references/gates.md](references/gates.md) and run only the sections triggered by the risk map, repository instructions, or requested scope.

Rules for every gate:

- Prefer exact-head remote evidence when it is trustworthy; do not rerun expensive work merely for ceremony.
- Run targeted checks before broad suites. Broaden when coupling, failure evidence, project rules, or release risk requires it.
- Use repository-declared commands and pinned runtimes. Never hardcode npm, main, Next.js, Prisma, or a fixed database name without evidence.
- Cite the command/check, exact SHA, scope, result, and what it did not cover.
- “Not run,” “not available,” and “still running” are evidence gaps, not passes.
- A pre-existing failure may still block release if it affects the changed path, invalidates the evidence, or creates unacceptable current risk. Separate attribution from release impact.
- Diagnostic commands must respect the selected operating mode. In audit-only mode, do not repair failures or add artifacts.

## Findings contract

Lead with actionable findings, ordered by severity:

- **P0:** immediate catastrophic loss, broad compromise, or unrecoverable production harm.
- **P1:** release blocker causing incorrect money/data/authorization/lifecycle behavior or a broken core journey.
- **P2:** important defect or operational weakness that should be fixed but may permit a bounded release decision.
- **P3:** low-risk maintainability or polish issue.

Each finding includes:

1. a mechanism-specific title;
2. tight file/line evidence;
3. the failure sequence and why it matters;
4. affected users/operators;
5. a practical fix at the correct architectural seam;
6. the missing or misleading test;
7. confidence and any unverified premise.

Distinguish independent findings from already-open review threads. Do not inflate severity, list speculative possibilities as defects, or bury the verdict under passing checks.

## Verdict and handoff

End with one of:

- **Ready:** no known blockers and required evidence is complete for the reviewed scope.
- **Ready after fixes:** bounded, named fixes remain; do not use this for structural blockers.
- **Not ready:** one or more release blockers remain.
- **Not proven ready:** required evidence is unavailable, stale, still running, or outside authorized scope.

Report the exact reviewed SHAs, branch-update result, checks run, checks reused, coverage gaps, unresolved findings, and rollback/disable feasibility when relevant. State explicitly whether anything was edited, committed, pushed, posted, merged, deployed, or verified live.

## Common mistakes

| Mistake | Correct response |
|---|---|
| A universal build/lint/test/browser checklist | Select gates from the risk map and project contract. |
| Green tests treated as semantic proof | Trace real payloads, states, retries, identities, and outputs across seams. |
| “Pre-existing” used to dismiss a failure | Separate blame from whether the release is currently safe. |
| Review request turned into fixes or PR artifacts | Stay audit-only unless mutation was explicitly authorized. |
| Cache deletion, stash, or checkout in a dirty worktree | Use an isolated disposable environment. |
| Local branch state treated as the PR state | Refresh and report exact remote base/head evidence. |
| Push treated as deployment or live proof | Report code, CI, merge, deployment, and live evidence separately. |
| Missing evidence converted into optimism | Use **Not proven ready** and name the gap. |
