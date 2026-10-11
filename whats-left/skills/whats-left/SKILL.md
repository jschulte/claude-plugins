---
name: whats-left
description: Use when the user invokes /whats-left, or asks where the session stands and what remains — "what's left", "what's still to do", "where are we", "what have we done and what's remaining", "are we done?", "wrap this up" — especially after a long or multi-threaded session, a compaction, or coming back from a break.
---

# What's Left

## Overview

The user wants two things: an honest account of what this session has actually
accomplished, and the complete list of work still standing between here and
done, in the order it should happen. They intend to answer with "yes please"
and have you carry all of it out. So the remaining-work list is a plan you are
about to execute, and anything you leave off it will not get done.

`/recap` tells the story in a few lines. This is the full ledger, followed by
an offer to finish the job.

The work can be anything: code, a release, an investigation, a document, data
cleanup, a batch of emails, infrastructure. The procedure is the same; only
the evidence and the finish line change. Where the steps below name git or CI,
substitute whatever plays that role for the work at hand.

## Procedure

1. **Sweep the whole session, not just the recent part.** Go back to the first
   message (and any compaction summary) and collect:
   - every request the user made, including the small asides and the "oh,
     and also" ones
   - everything you said you would do, come back to, or check later
   - follow-ups you noticed and mentioned in passing
   - failures, skipped steps, workarounds and TODOs left in code
   - questions either side asked that never got an answer
   - background tasks, agents and scheduled jobs you started

2. **Check the claims against the real state.** Memory of the session drifts,
   and a step that was "done" an hour ago may have been undone, or never
   landed. Run whatever applies, in parallel:
   - `git status`, `git log` against the base branch, unpushed commits, stashes
   - open PRs for the branch, their checks and unresolved review threads
   - CI and deploy runs for what was pushed
   - the tests, lint and typecheck for the changed code, if they have not run
     since the last edit
   - any still-running background work

   When a check cannot be run (a tool is switched off, no access, no network),
   skip it, carry on with the rest, and name the unchecked source in the
   report. One missing check never stops the sweep.

   A thing counts as done only when you have seen the evidence. Otherwise it
   goes in the report as unverified, or in the remaining work as a step to
   verify.

3. **Work out where "done" really is.** Trace each goal to its true finish
   line as the user would define it: code written is rarely it. Commit, push,
   PR, review feedback, merge, deploy, checking the change in the deployed
   environment, cleaning up branches and temp files, updating docs, closing
   the issue. Every one of those that applies and has not happened is a
   remaining step.

4. **Write the report** in the shape below.

5. **On "yes"**, finish the work: carry out every step in order without
   checking in between steps. When a step fails, diagnose and fix it and keep
   going; when the work turns up a new step the finish line requires, add it
   and do it. Stop only for a step in "Needs you", or when something new and
   risky comes up that was not on the list; in that case keep going on every
   step that does not depend on it. When finished, report what was done
   against the same numbered list, with evidence, and what is still open.

## Report shape

**Where we are** — one or two sentences: the goal of the session and how close
it is.

**Done** — one line per outcome, grouped by goal when there were several. Each
line states the result and its evidence (PR number, commit, test run, URL).
Mark anything you could not confirm as `unverified`. Outcomes, not a diary of
steps taken.

**Remaining work** — a numbered list in execution order, covering everything
through the finish line. Each step says what will be done, where, and how you
will know it worked. Write each one concretely enough that the user can judge
it without asking a follow-up: "Fix the two failing assertions in
`tests/cart.test.ts` (stale price fixture), rerun the suite", not "fix tests".
Mark with ⚠ any step that is hard to undo or reaches outside the workspace
(pushing to the default branch, production, deleting data, sending messages),
so the user's yes covers it knowingly.

**Needs you** — things only the user can do or decide, each with the exact
command or choice and your recommendation. Say which numbered steps each one
blocks. Leave the section out when it is empty.

There is no "follow-ups" or "things to consider" section. See the next
heading.

End with one question: **"Want me to handle everything?"**, followed by a
line saying what that covers ("steps 1-7; I'll stop at 5 for your key") so
that a bare "yes please" is unambiguous.

## No loose ends

The user does not want a list of things they "should probably" get to later.
A trailing pile of suggestions hands the work back to them and most of it is
never done. So every item the sweep turns up, including follow-ups, nice-to-
haves and things you noticed along the way, gets exactly one of three fates
before the report is written:

- **Do it.** It becomes a numbered step in "Remaining work". This is the
  default for anything that belongs to the session's goal, anything left
  half-finished, and anything small enough to finish now.
- **File an issue.** For work that is real but is a separate piece of work:
  it needs its own design, is large, or is unrelated to this session's goal.
  Filing it is itself a numbered step ("File issue: <title>"), in the
  project's tracker (GitHub issues via `gh` unless the project uses something
  else). Write the issue so someone with no memory of this session can pick
  it up: what was observed, where, why it matters, and what done looks like.
- **Drop it.** If it is not worth doing or filing, it is not worth mentioning.
  Leave it out of the report entirely.

Anything half-done is finished or reverted, never left in place with a note.

The same holds after "yes": the final report ends with every step done, every
deferred item as a link to its filed issue, and at most the "Needs you" items
still open. It contains no new suggestions; anything discovered during the
run was already done or filed.

## Closing banner

People who run several sessions in separate tabs flip through them to see
which are finished. The last thing in the final report, after everything
else, is one of these two banners, printed exactly as shown in a code block,
so the state of the tab is readable at a glance from the bottom of the
screen.

When every step is done and nothing is waiting on the user:

```
████████████████████████████████████████████████
██                                            ██
██               WE'RE DONE                   ██
██                                            ██
████████████████████████████████████████████████
```

When the run has gone as far as it can and "Needs you" items remain:

```
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
░░                                            ░░
░░        NOT DONE - WAITING ON YOU           ░░
░░                                            ░░
░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
```

Under the second one, add a single line naming what is needed. Nothing
follows the banner otherwise.

The done banner is a claim the user will trust without reading the rest, so
it goes up only when the work is verified finished: any failed step, red
check or unverified result means the second banner. The first report, the one
that ends with the offer, carries no banner, because the work has not been
run yet. The exception is a sweep that finds nothing remaining, which ends
with the done banner.

## Rules of thumb

- If nothing remains, say so in one line, skip the offer and print the done
  banner. Do not invent work to fill the list.
- If a step depends on an answer from the user, put the question in "Needs
  you" and still list the step, noting which way you will go by default.
- Be thorough in the list and brief in each line. Length should come from the
  number of real items, not from explanation.
- Bad news goes in plainly: a red test, a failed deploy or a half-finished
  change is stated as such in "Done" or "Remaining work", never softened.
