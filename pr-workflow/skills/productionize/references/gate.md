# Fallback gate, comment policy, PR body template

Used when the repo has no definition of done of its own and no definition-of-done skill is
installed. Print it as the standard for the run before gating against it.

## Gate

**Buttoning up the work**

1. Durable architectural decisions are documented where this repo documents them (ADR,
   README, design doc) — not only in the PR body.
2. An ADR or doc this change contradicts is updated or explicitly superseded. Both are
   not left standing.
3. Documentation describing behavior this PR changed is current.
4. No scratch, debug, or probe artifacts remain. No secrets, tokens, or credentials.

**The diff**

5. Every comment in every touched file satisfies the comment policy below —
   pre-existing cruft goes too, not just comments this change added.
6. Names match what the thing now does — no name left describing the old behavior.
7. No defensive branch or default that can never fire.
8. Behavior that changed has focused tests. Bug fixes have a test that fails without
   the fix.

**Integration**

9. The branch contains the current remote base, or the divergence is intentional and
   stated.
10. Generated files (lockfiles, snapshots, codegen) reflect the source, with no
    unrelated drift.

**Green**

11. Lint, typecheck, tests, and format check pass — each named with its result.
12. A production build passes, where the repo has one.

**Text**

13. Commit subjects follow the repo's existing convention.
14. No AI attribution or co-author trailers in commits or PR text.
15. The PR body describes the final diff, not the first draft of it.

## Comment policy

Default to no comment. Comment only non-obvious rationale, an invariant, ordering,
timing, or a gotcha that cannot be expressed clearly in the code itself.

- At a call site, explain only why this invocation must happen at **this exact location**.
  The callee's general behavior belongs on the callee's definition, once.
- Never copy task, ticket, PR, debugging, or downstream-system history into a comment.
- One idea per comment, normally no more than two lines.
- Prefer a clearer name or type over a comment.

Before finishing, re-read every comment in every file the PR touches — not just the
ones this run added — and delete anything that narrates the code, restates it, or
records how the change came about. Keep only comments that earn their lines under the
policy above. Needing more than two lines usually means the code, not the comment, is
the problem.

## PR body template

Replace the body with exactly these sections, in this order.

```markdown
## What this is

One or two sentences: what changes, and for whom. Then the shape of the diff — the
handful of files or areas that matter, and why they're in here together.

## The thinking

The decisions a reviewer would otherwise have to reverse-engineer: what was chosen, what
was rejected, and why. Alternatives that were live options, and the reason they lost.
Constraints from outside this repo that shaped it.

## What I'd like feedback on

Named, specific asks. "The retry budget in <file>: 2 attempts over 800ms — too tight for
a cold pod?" beats "let me know what you think." If a decision was close, say it was
close and say which way you leaned.

## Verified

Commands and counts, as actually run:

- `pnpm lint` — clean
- `pnpm typecheck` — clean
- `pnpm test` — 214 passed, 18 files
- `pnpm build` — succeeds
- Boundary checks unit tests don't cover: what you exercised, and how

Not verified: name it here, plainly, with the reason. This section is load-bearing —
a reviewer decides how hard to look based on it.

## Rollback

What to revert, and what breaks if you do. Name dependent branches or PRs that stack on
this one. If the change is behind a flag or config value, name the value that turns it off.
```

Rules for the body:

- **Replace it, never append.** No "Review round 2" or "Update:" sections — the body is
  the single source of truth for what the PR now is. Review history lives in the threads.
- Every claim in `## Verified` names a command. "Tests pass" is not a claim, it's a mood.
- If a section has nothing in it, say so in one line rather than deleting the heading —
  "Nothing outstanding" is information about the PR.
