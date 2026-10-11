---
name: deliver-me
description: Use when the user hands over a change to carry all the way through without supervision — "/deliver-me <issue, feature, bug or goal>", "just get it done", "ship this", "take this issue end to end", "build it and open the PR, I'm heading out". Not for questions, plan-only requests, or reviewing someone else's work.
---

# Deliver Me

One request in, one reviewed and verified pull request out. No check-ins on the way:
decide, write the decision down, keep going.

**Core principle:** the change should read as if this codebase's own team wrote it on a
careful day, and every claim in the final report is something you observed.

## Done means all four

1. The work is committed on its own branch, pushed, with a PR open. No remote: committed
   on a branch, and the report says so. Never uncommitted, never on the default branch.
2. It fits the codebase (Phase 2).
3. It is verified at the highest rung available (Phase 6).
4. The report has the fixed shape below.

Stop early only for a missing credential, or an action that is destructive or cannot be
undone (production deploy, live-data migration, force-push, deletion). Finish everything
else first, then report the one thing you left.

## Phases

**0. Ground.** Read the repo's own rules (CLAUDE.md, AGENTS.md, CONTRIBUTING, definition
of done); they override this skill. Look for an open PR, branch or issue that already
covers the request and continue it instead of competing. Create the branch now; use a
separate worktree if the checkout is dirty or shared.

**1. Understand.** State the outcome in one sentence and the checks that would prove it.
Reproduce the bug or show the gap before changing anything. Where the request is
ambiguous, take the reading that is safest for users and their data, and record it as a
decision.

**2. Fit.** Before designing, read the nearest existing thing of the same kind, end to
end, with its tests. Then fill in this table. It is required. It goes in the PR body;
with no PR, it goes in the commit body.

| Need | Reuse | Where |
|---|---|---|
| Entry point and registration | | |
| Auth and permissions | | |
| Input validation | | |
| Data access | | |
| Units and formatting | | |
| Response and error shape | | |
| Tests and test helpers | | |
| Docs, lists and scripts that enumerate this kind of thing | | |

A row may say "new" only after a search you can name. Extend a helper before forking it.

When the request and the codebase disagree:

| The request… | Do |
|---|---|
| differs in *how* (shape, naming, layering) | Follow the codebase. Record it. |
| cannot be right for the data (one currency assumed, one tenant assumed) | Build the behavior that is correct. Record it. |
| removes a protection (auth, validation, tenant scoping, audit, retention) | Build it as asked, put the trade-off first in the PR and the report, and do not merge or deploy it yourself. |
| needs a mechanism the codebase lacks (cache, queue, dependency) | Use the smallest thing that satisfies it. Record it as a new pattern. |

**3. Plan, then attack the plan.** Write a short plan: files, order, tests, how it will
be verified. Then read it as a reviewer who wants to reject it. Which consumers break?
What happens when it is empty, unauthorized, repeated, concurrent? Is there a smaller
change? What would the tests miss? Revise once.

**4. Build.** Where the repo has tests, write the failing test first. Update everything
the fit table's last row found.

**5. Review your own diff.** Read the whole diff as if someone else wrote it: against
the fit table, for leftovers, for names, for untested failure paths. Use a review skill
or a fresh subagent when one is available. Fix what you find and rerun the checks.

**6. Verify.** Run the repo's gate for what you touched (lint, types, tests, build) and
any smoke script. Then climb as high as the repo allows and name the rung you reached:

1. **Deployed** — the preview or staging environment this repo deploys branches to.
   Confirm the deployed revision is yours, then exercise the change there.
2. **Running** — the real application started locally, exercised through its real
   interface (HTTP, CLI, UI), including one failure case.
3. **Tests only.**

**7. Publish.** Commit in the repo's convention, push, open the PR. Merge only when the
repo's rules or the user say you may.

## Report

Exactly these parts, in this order:

- **Outcome** — one line, with the PR link or branch name.
- **Decisions I made for you** — each with the alternative and how to switch.
- **New patterns or departures** — or "none".
- **Verified** — the rung, the commands, the counts.
- **Not verified** — plainly.
- **Left for you** — merge, deploy, anything blocked.

## Red flags

| Thought | Reality |
|---|---|
| "It works, I'll leave it in the working tree" | Uncommitted is not delivered. Branch, commit, PR. |
| "I'll write a quick helper for this" | Search first. Name the search in the fit table. |
| "They asked for it, so I'll just do it" | Do it, and say what it costs, first, where they will read it. |
| "Tests pass, so it works" | That is the bottom rung. Start the thing and use it. |
| "I should ask before continuing" | Decide, record it, continue. The report is where they overrule you. |
