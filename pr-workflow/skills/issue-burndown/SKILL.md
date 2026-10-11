---
name: issue-burndown
description: Use when asked to work through many open GitHub issues at once — "fix all the open issues", clear or triage the backlog, figure out which issues are already fixed or covered by PRs, batch-fix issues, or drive a set of issues to merged PRs.
---

# Issue Burndown

End-to-end pipeline: inventory the backlog → map claims → group by shared fix →
plan per batch → one fixer subagent per batch → PR per batch → adversarial
review → merge to the integration branch. The backlog is a **claims problem
before it is a fix problem**: in a busy repo a large slice of "open" issues are
already fixed, claimed by an open PR, duplicates, or waiting on a human
decision. Fixing before mapping wastes agent-runs and collides with in-flight
work.

**Repo conventions override this skill.** Phase 0 exists to find them.

## When NOT to use

- One or two issues → just fix them with your normal debugging workflow.
- The user wants analysis only → stop after Phase 2 and report; the
  disposition table and batch table ARE the deliverable.

## Phase 0 — Read the repo's own rules first

Read before counting anything: the project's agent instructions (CLAUDE.md,
AGENTS.md), any issue-state / tracker conventions doc, any production-readiness
or audit ledger, and any repo-local sweep or definition-of-done skill — its
rules on guards, exit codes, concurrency and worktree hygiene apply here. Also
re-read active handoff notes: other sessions may own issue ranges right now.

## Phase 1 — Inventory and claim map

```bash
gh issue list --state open --limit 300 --json number,title,labels,createdAt,body
gh pr list --state open --limit 100 --json number,title,body,baseRefName,isDraft
gh pr list --state merged --limit 60 --json number,title,body,mergedAt --search "merged:>=<last release date>"
```

**Claims live in narrative prose, not machine links. Measured on a real repo:
GraphQL `closingIssuesReferences` returned zero rows and a
`closes/fixes/resolves #N` regex matched zero of 34 open PR bodies — while a
third of them fixed open issues.** The claim map is produced by READING every
non-bot open PR body and recent merged PR titles+bodies, and classifying each
`#N` reference as: fixes / partial / context / follow-up-spawned-by. A regex
pass is a starting index, never the answer. Dependabot bodies are full of
external `#N` noise — exclude bots up front.

Two structural traps:

- **Merging to a non-default branch never auto-closes issues.** If the repo
  integrates on `staging` and releases to `main`, every staging-merged fix
  leaves its issue open until release. "Fixed-awaiting-release" is a real,
  usually-large bucket — clearing it costs comments and labels, not code.
- **Referenced ≠ fixed, and unreferenced ≠ unclaimed.** Commits cite issues
  for context; parallel sessions file PRs faster than they merge; in-flight
  worktrees are invisible to `gh`. Ask the user what other sessions own before
  taking a batch.

Output: a disposition table, one row per issue:

| Bucket | Action |
|---|---|
| A. Fixed on integration branch, awaiting release | Comment with fixing PR/commit, apply the repo's awaiting-release state. Close only if repo convention says so. |
| B. Claimed by an open PR | Hands off the code. The batch is: review + land that PR. |
| C. Needs product/operator decision, or blocked external | Park with the repo's decision label; compile ONE consolidated list for the user. Never guess a product decision. |
| D. Duplicate | Close the newer, cite the survivor, carry unique repro detail over first. |
| E. Actionable now | Group in Phase 2. |

Buckets A and D are the first "batch" — pure bookkeeping, biggest
issues-closed-per-token in the whole run, shipped before any fix batch.

## Phase 2 — Group by shared fix, from the bodies

Two issues share a batch when **one change closes both**. Grouping inputs are
the issue BODIES (titles lie; bodies name files) and the repo's class labels.
Axes that yield: same helper/wrapper wrong everywhere; same silent-failure
shape; producer/consumer asymmetry; same guard missing; same subsystem seam.

**Every group must name its member issues and the shared root cause in one
sentence — derived from what the bodies say, not from what you remember about
the repo.** A group you cannot trace to specific issue numbers is a prior, not
a group; delete it. Verify the class with a grep count before committing to a
class-level fix.

Prioritize: anything red on the integration branch or blocking deploys first
(it taxes every other batch); then security/tenancy and money; then classes
with guards; then coverage; then polish. Check the batch list for file-domain
overlap with Bucket-B PRs — if a batch would touch files an open PR owns, the
batch waits behind that PR.

Post the disposition + batch tables to the user before any code. This is the
run's scope contract. Proceed per the user's standing autonomy preference;
Bucket C always waits regardless.

## Phase 3 — Plan per batch

Write a plan for each batch (with a planning skill, if one is installed) after
research, never from issue text alone: read the implicated code (the issue's
stated fix and even its facts are regularly wrong), enumerate every instance
of the class (script the count — don't sample), find prior art (a canonical
helper may already exist), and decide the guard that ships with the fix. Have
the strongest available model review the plan for high-risk batches before
dispatch.

## Phase 4 — Execute: exactly one fixer in flight

**One implementation subagent at a time. Not two "provably disjoint" ones,
not a wave.** File domains that look disjoint share generated clients, test
lanes, ratchet baselines, and lockfiles; every recorded collision in this
skill's history started with "these can safely run in parallel". Pipeline
overlap is allowed only for non-mutating work: plan batch N+1 and review batch
N-1 while batch N's fixer runs.

Per batch: fresh worktree branched off the integration branch (never off the
release branch), own database if real-DB tests exist, dependencies installed
per repo gotchas. Brief the fixer with the plan plus your research **framed as
evidence to verify, not fact to inherit** ("re-derive my counts; if your
research contradicts this brief, the contradiction is the finding"), the
repo's landmine list, and the deliverable contract: fix + class sweep + guard
+ tests updated in the same change + **targeted** local gates with real exit
codes: tests of the directories touched, any guard or audit tests bound to the
changed paths (grep the test tree for the path or symbol), the repo's fast
structure checks, lint on changed files, and the type-check. Never the whole
slow suite in every lane: several lanes each running it on one machine produce
hours of load and phantom timeouts in tests that pass alone, and no real
finding. CI on the pushed branch owns the full sweep; a CI red is the signal to
widen the lane's scope next time.

## Phase 5 — One PR per batch

Target the integration branch. Body carries: the issues and the shared root
cause; class-sweep evidence (count before → zero after); the guard and the
revert-probe output proving the guard fails without the fix; gate results as
real numbers, not "tests pass"; what was deliberately excluded and where it is
filed. Use the repo's PR template/DoD if one exists.

## Phase 6 — Review it three times

Three passes, in order, none skippable:

1. **Mechanical (you):** read the full diff; check for phantom files
   (criss-cross merge base → merge current integration tip in, never rebase),
   deleted-or-weakened guards, ratchet counts moved the right way, migration
   replay from empty DB.
2. **Adversarial (fresh agent, strongest model):** instructed to REFUTE the
   fix, name any class instance missed, and call the guard vacuous unless
   proven otherwise. High-risk batches get a second independent engine.
3. **Verification (you, in your own verify worktree — never the fixer's):**
   re-run the targeted lane (same scope as the fixer's contract) and the guard
   revert-probe yourself. Subagent evidence is a claim, not a result. The full
   sweep is CI's, once, on the pushed head.

Every confirmed finding gets fixed, then the targeted gates re-run — not just
the red ones. Real findings out of scope get filed, not silently absorbed.

## Phase 7 — Merge, serially, and close the loop

Merge criteria, all required: CI green on a head that already contains the
current integration tip; zero unresolved review findings; ledgers/inventory
updated in-PR where the repo demands it. Then:

```bash
gh pr merge <N> --merge --delete-branch   # or the repo's convention
```

Follow the repo's CI policy for when gates run. Where CI is expensive or shares
one runner, batch: merge the reviewed PR branches locally into one integration
branch, reconcile any position- or line-keyed baselines on the merged tree,
push once, fix reds there, then merge it into the base so every member PR
closes as merged. Never cancel a run to make room. After each merge: apply the
repo's post-merge label if it has one, and comment on each issue with the
fixing PR — closing it or marking awaiting-release per repo convention. Never
push the release/default branch; releases are a separate, user-gated event.

## Red flags — stop and re-read the phase

| Thought | Reality |
|---|---|
| "I'll grep PR bodies for `closes #`" | Measured zero hits on a repo where a third of open PRs fix issues. Read the bodies. |
| "These two batches touch different dirs, run both" | One fixer in flight. Shared lanes/ratchets/clients collide anyway. |
| "This PR references the issue, so it's handled" | Referenced ≠ fixed. Verify the claim or revert-probe it. |
| "I know this repo — the batches are payments, email, …" | Groups come from issue bodies, not from memory. Name member issues or delete the group. |
| "CI is green, merge it" | Green ≠ reviewed, and green on a stale base ≠ green on the tip. |
| "Run the whole suite in every lane, to be safe" | Several lanes doing that on one machine give phantom timeouts and no real red. Touched dirs + bound guard tests; CI sweeps once. |
| "Dispatch all the gates now, they run in parallel" | On a shared runner, parallel gates starve each other. Follow the repo's CI policy; never cancel a run to make room. |
| "The issue explains the fix, just implement it" | Issue facts and proposed fixes are regularly wrong. Read the code first. |
| "Closing stale issues isn't real progress" | Bucket A/D is the cheapest burndown in the run and unblocks the count everyone reads. |
