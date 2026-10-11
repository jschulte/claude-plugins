---
name: productionize
description: Use when your own draft PR needs to become something a human can actually review — "/productionize 87", "productionize this PR", "get PR #12 ready for review", "prep #53 for review", "publish this PR". Assumes the PR already exists and you authored it. Not for reviewing someone else's PR, not for a branch that has no PR yet, and not for replying to one individual review comment.
---

# productionize — draft PR to reviewable PR

A draft PR is private scratch. Publishing it is the moment three things have to agree:
the diff, the prose that describes it, and the verification claims attached to it. Most
"ready for review" PRs fail because one of the three drifted — a body describing the
second commit, a `## Verified` list nobody ran, a review thread answered in chat.

This skill closes that gap for **one** PR and hands a reviewer something approvable
without archaeology.

## The one-PR rule

Other sessions work other PRs on the same repo at the same time. Everything below is
scoped to the target PR's own worktree.

- Never edit, stage, or commit in the user's main checkout.
- Never touch another worktree, or a branch that isn't this PR's head.
- Never `git stash`, `reset --hard`, `checkout -f`, or `clean` anywhere you did not create.
- Never rewrite history or force-push. Push is fast-forward only.
- One PR per invocation. When you finish, name the next PR — do not start it.

## Phase 0 — Resolve the target

Resolve all six before touching anything. Print them as a block; the user sees what you
locked onto before you act on it.

| | How |
|---|---|
| Repo + PR | Argument (`87`, `#87`, `owner/repo#87`, URL) or infer from the current branch |
| Host | Parse `git remote get-url origin`; export `GH_HOST` when it isn't github.com |
| Base | From the API. **Never assume `main`** — stacked PRs base on another branch |
| Head + head SHA | From the API. The SHA is your move-detection baseline for the whole run |
| Gate | Repo's own definition of done, else a definition-of-done skill if one is installed, else `references/gate.md` |
| Verification commands | Only scripts/targets that actually exist in this repo |

**The gate file lives on the PR's tree, not yours.** Read it with
`git show origin/<head>:<path>`, not from the working directory — the branch you are
publishing may be the branch that introduces or changes the gate. Reading the local copy
gates the PR against a standard from some other branch, and nothing about the output
looks wrong.

If the repo has no gate and no definition-of-done skill is installed, print `references/gate.md` as the
standard for this run before you use it.

Commands for every step: `references/commands.md`.

## Phase 1 — Isolate

Create a **detached** worktree in a scratch directory outside the repository (a session
scratchpad or `mktemp -d`) at the resolved head SHA:

```bash
git worktree add --detach "$WT" <head-sha>
cd "$WT" || exit 1
```

Detached is not a preference. `git worktree add "$WT" <branch>` fails outright when that
branch is checked out in any other worktree, which on a stacked repo it usually is.

`cd "$WT" || exit 1` is not decoration either. A `cd` that fails leaves you in the
user's main checkout, where every later `git` command in the run edits their work.
Confirm with `git status -sb` and `git rev-parse HEAD` before the first edit.

Install dependencies in the new worktree before running anything, one install at a time.
Concurrent installs across worktrees can exit 0 and still leave dependencies missing,
which then reads as a failing gate. Verify the install by a real check, not by exit code.

## Phase 2 — Investigate

1. **The diff that exists:** `git diff origin/<base>...origin/<head>`. Read every changed
   file and the code that owns it — not just the hunks.
2. **All three feedback endpoints.** They are disjoint sets and skipping one silently
   drops asks: `issues/<n>/comments` (PR conversation), `pulls/<n>/comments` (inline),
   `pulls/<n>/reviews` (review bodies). Also pull thread resolution state via GraphQL.
3. **Re-test every review claim against current HEAD.** Sort into already-fixed,
   obsolete, valid, partially addressed. A claim you cannot reproduce is not valid — say
   so with what you ran.
4. **Who stacks on this branch:** `gh pr list --base <head>`. Children make this branch's
   contracts shared; changing one is a decision, not a cleanup.
5. **Intent vs. diff.** Where the PR body, commits, and code disagree about what this
   change is, that disagreement is the first thing to resolve.

## Phase 3 — Consensus before design

Split what you found:

- **Mechanical** — a wrong name, a stale doc line, a missing test, a dead default, a
  comment that narrates. Fix these. Do not ask.
- **Genuine** — anything that changes behavior, a contract, a dependency, a shared
  abstraction, or what the PR is claiming to do.

For each genuine one, use the question tool: the choice, the options, the tradeoff, your
recommendation. Then implement the answer end to end — not the half that's cheap.

Do not build an abstraction for a mock or a transitional service unless a durable
consumer exists today.

## Phase 4 — Fix

Work to the gate. Comment policy is in `references/gate.md` — or the repo's own, when it
has one — and it gets a dedicated pass, not a glance at your own additions:

**Strip useless comments ruthlessly, in every file the PR touches.** Walk the whole
file, not just the hunks. Delete every comment that restates the code, narrates the
change, records how it got here, or addresses a reviewer — whoever wrote it, whenever
it was written. Keep only the real, useful stuff: a why, an invariant, a gotcha, a
non-visible decision. A comment that fails the policy but points at something true and
non-obvious gets rewritten down to exactly that; one that doesn't is deleted without
replacement. Cruft noticed in owning code the PR doesn't touch is named in the report,
not edited — the one-PR rule holds.

## Phase 5 — Verify

Run the narrowest relevant test immediately after the first edit — not at the end. Then:

1. Focused tests for every behavior you changed.
2. The repo's full gate (lint, typecheck, tests, format check, production build where one
   applies). Name each command and its result.
3. Boundaries unit tests can't reach — process start, real network calls, config loading,
   container boot — exercised directly.
4. Generated files checked for drift: lockfiles, snapshots, codegen output.
5. A final adversarial pass: assume the change is wrong and try to prove it.

Then offer a multi-reviewer pass if a review skill is installed.
Offer it — don't auto-run it.

**Anything you could not verify gets said, in the PR body, in plain words.** A gap named
is a reviewer's cue. A gap papered over is what gets you a second review round.

## Phase 6 — Publish

In order:

1. Worktree clean except the files this run changed. Commit only those.
2. Re-query the remote head SHA. It must still equal the SHA from Phase 0, and an
   ancestor of your new HEAD. If it moved, stop and report — someone else pushed.
3. `git push origin HEAD:<head-branch>`. No force, ever. A rejected push is information,
   not an obstacle to route around.
4. **Replace** the PR body — never append a "review round 2" section. The description is
   the single source of truth for what the PR now is. Sections, in this order:

```
## What this is
## The thinking
## What I'd like feedback on
## Verified
## Rollback
```

`## Verified` names commands and counts (`pnpm test — 214 passed, 3 files`), never
"tests pass". `## Rollback` gives a real path: what to revert, and what else breaks if
you do.

## Phase 7 — Transition

1. Resolve only threads actually addressed by the diff, or conclusively rebutted with
   evidence. Reply first, then resolve. An unaddressed thread stays open.
2. Wait for post-push CI to finish. Inspect the actual checks — branch protection is not
   evidence.
3. Mark non-draft.
4. Add `pr-ready-for-review`, creating the label first if the repo lacks it. On GitHub
   Enterprise, `gh pr edit --add-label` can fail with a Projects Classic error; use the
   issues labels API instead.

## Phase 8 — Scorecard

Close with exactly these, and nothing else:

- **Gate table** — each numbered gate item, pass/fail/n-a, one line of evidence.
- **Verification evidence** — commands and counts, as run.
- **Residual risks** — what a reviewer should look hardest at, and what you couldn't verify.
- **Final state** — head SHA, open + non-draft, label present, mergeable, unresolved
  thread count, checks status, worktree clean and matching remote.
- **PR link.**
- **Next PR in numerical order** — named, not started.

## Red flags — stop

| You're about to | Instead |
|---|---|
| `git push --force` / `--force-with-lease` | Stop. Report the divergence and ask. |
| Diff against `origin/main` without checking the base | Get the base from the API. |
| Run `git` after a `cd` you didn't verify | `git status -sb` first. You may be in their checkout. |
| Resolve a thread you answered in chat only | Reply on the thread, then resolve. |
| Append a review-round section to the body | Rewrite the body. |
| Write `## Verified: all tests pass` | Name the command and the count, or don't claim it. |
| Start the next PR "since I'm here" | Name it and stop. |
| Fix a shared contract that children stack on | That's a Phase 3 question. |

## Rationalizations

| Excuse | Reality |
|---|---|
| "The base is obviously main" | Stacked PRs are the common case in a stack. Two seconds to check; a whole bogus diff if you're wrong. |
| "The gate file in my checkout is the same one" | Not on a branch that touches the gate. Read it from the head tree. |
| "The push was rejected, I'll just force it" | A rejection means the remote has commits you don't. Force-pushing deletes someone's work. |
| "It's my own PR, history rewriting is fine" | Reviewers have read the old commits and other branches are based on them. |
| "The reviewer's comment is obsolete, resolving it" | Say why it's obsolete on the thread. Silent resolution reads as ignoring them. |
| "I'll note the unverified part in chat" | Chat isn't the PR. It goes in the body. |
| "A second review pass is overkill for this diff" | Fine — that's why it's an offer. Say you skipped it. |
| "One more PR while the context is warm" | Scope creep across PRs is how a stack gets tangled. Stop. |

## Quick reference

- Commands, verified: `references/commands.md`
- Fallback gate, comment policy, PR body template: `references/gate.md`
- Branch that has no PR yet → open the draft PR first; this skill starts from one.
- Review feedback on a PR that is already out for review → `pr-resolver`.
- Is it safe to merge or release? → `bulletproof`.
