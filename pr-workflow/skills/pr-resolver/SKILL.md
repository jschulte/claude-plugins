---
name: pr-resolver
description: >-
  Resolve an open pull request end to end: fetch PR feedback, validate each
  review claim against the real code, fix real issues, run independent
  second-model reviews of the whole diff and patched state, run project
  verification, commit, push, post a summary comment, and label the PR ready.
  Re-invocations no-op when no new review activity exists. Use when the user
  says `/pr-resolver <PR#>` or asks to address, fix, or resolve PR review
  feedback. Skip for drafting PRs, read-only reviews, and design discussions.
---

You are resolving the review feedback on a pull request. The user's input is `<PR#>` — a GitHub pull-request number in the current repository. You produce a fix branch with reviewer concerns addressed, validated, tested, pushed, and summarized.

The principles below override defaults. Read all of them before starting.

---

## Operating principles

**Validate every reviewer claim.** Bot reviewers (Codex, Copilot, automated reviewers) are wrong often enough that every claim needs checking. Read the cited code with your own eyes before fixing. If the reviewer is wrong, document why instead of "fixing" something that isn't broken — a misleading "fix" wastes everyone's time.

**Trust nothing about the branch state.** Stacked PRs commonly get authored against a pre-fix snapshot of their base, so the branch on disk often *appears* to revert work that has since landed on the base. Always check `git diff origin/<base>...HEAD --stat` and merge the latest base in if needed before starting work — otherwise your fix gets entangled with reverts that aren't yours.

**Independent reviewers are your second pair of eyes, running in parallel with your fix work.** As soon as you've triaged the cited concerns, spawn TWO independent reviewers at once, both reviewing the WHOLE PR diff against base (not just your fixes). Use two different models when the harness offers them: a faster one tends to catch adjacent-code regressions and brittle tests, a stronger one architecture and security. If an agent wrote the PR, prefer reviewers from a different model family than its author; they share fewer blind spots. Run them while you're fixing the known issues so they finish around the same time. Integrate their findings into the same commit.

**Re-review after fixes.** After all fixes are in (known concerns + reviewer findings), run ONE confirmatory review of the patched state to catch regressions or incompletely-fixed concerns. Cap at one re-review round — if it surfaces yet more issues, the PR is under-baked and worth flagging back to the user.

**Tests are part of the change.** Every behavior change needs a regression test. Every renamed/removed symbol needs the matching test updates. Don't commit until the affected tests are green and type-check is clean.

**One commit, one summary comment.** Put the work in a single commit that follows the repo's commit convention. After push, post one summary comment on the PR (don't reply per-thread — bot threads are noisy and not always actionable).

---

## Workflow

### Pre-flight — Loop-safe early exit

This skill is sometimes triggered from `/loop` wakeups, scheduled re-checks, or repeated user invocations on the same PR number. Doing the full workflow on a PR that's already resolved is wasted work and noisy (it produces duplicate comments and redundant commits). Bail out early when there's nothing new to do.

Run these in parallel as the very first thing — before toolchain detection, before checking out a worktree:

1. `gh pr view <PR#> --json state,labels,mergeable,headRefOid,updatedAt,url`
2. `gh api repos/<owner>/<repo>/pulls/<PR#>/comments --paginate | jq '[.[] | {created_at, user: .user.login}]'`
3. `gh api repos/<owner>/<repo>/issues/<PR#>/comments --paginate | jq '[.[] | {created_at, user: .user.login}]'`
4. `gh api repos/<owner>/<repo>/pulls/<PR#>/reviews --paginate | jq '[.[] | {submitted_at, state, user: .user.login}]'`
5. Get the PR's most recent commit timestamp: `gh api repos/<owner>/<repo>/commits/<headRefOid> --jq '.commit.committer.date'`

**Exit immediately (no toolchain detection, no worktree, no sub-agents)** if EITHER:

- The PR is already `closed` or `merged`, OR
- The PR carries the `pr-ready-to-merge` label **AND** no review/comment activity has appeared since the head commit's timestamp.

For the activity check: compare `created_at` / `submitted_at` of every review and comment against the head commit's `committer.date`. Ignore the resolver's own summary comment (the one starting with `## Review feedback resolved`) — its timestamp is naturally after the commit and would otherwise look like "new activity." If the only thing newer than the commit is that summary, treat it as "no new activity."

When exiting early, print one line to the user and stop:

> PR #N already resolved (label `pr-ready-to-merge` present, no new review activity since commit `<short-sha>`). Skipping.

If the PR is closed/merged, say:

> PR #N is `<state>`. Nothing to do.

**Do not** post a comment, push, or take any other side-effecting action on early exit. This is what makes the skill safe to call in a loop.

If the PR is open and either (a) lacks the label, or (b) has new reviewer activity newer than the head commit, proceed to Phase 0.

### Phase 0 — Detect the toolchain

Before anything else, figure out what kind of repo this is and what commands to run. Cache the results internally; the rest of the workflow refers back to them.

Detection order (each step short-circuits if a match is found):

**1. Package manager (Node-family repos)**
- `bun.lockb` → `bun`, test cmd `bun test`
- `pnpm-lock.yaml` → `pnpm`, run cmd `pnpm exec`, script cmd `pnpm run`
- `yarn.lock` → `yarn`, run cmd `yarn`, script cmd `yarn run`
- `package-lock.json` or `package.json` only → `npm`, run cmd `npx`, script cmd `npm run`

**2. Test runner (Node)**
Read `package.json`. Look at `devDependencies` and `scripts.test` for the binary:
- `vitest` → `<run-cmd> vitest run` (specific paths) or `<script-cmd> test`
- `jest` → `<run-cmd> jest` or `<script-cmd> test`
- `mocha` → `<run-cmd> mocha` or `<script-cmd> test`
- `ava`, `tap`, `node --test` — same pattern: prefer the explicit binary if you need to scope to specific files

If `scripts.test` exists and you don't need to scope, just run `<script-cmd> test`.

**3. Type-checker (Node)**
- `tsconfig.json` exists + `typescript` in devDependencies → check `package.json` for a `type-check` or `typecheck` script (and an `:incremental` variant if present); otherwise fall back to `<run-cmd> tsc --noEmit`. Prefer the incremental script if both exist (faster local loop).
- No tsconfig → skip type-check phase.

**4. Linter / formatter**
- `.eslintrc*` or `eslint.config.*` → `<run-cmd> eslint <files>`
- `biome.json` or `biome.jsonc` → `<run-cmd> @biomejs/biome check <files>`
- `.prettierrc*` (formatter only — usually paired with a linter): run via the linter's autofix or `<run-cmd> prettier --write <files>`
- No lint config → skip lint.

**5. Non-Node ecosystems**
If `package.json` is absent or the repo is multilingual, detect the dominant language by lockfile / config:
- Python: `pyproject.toml` / `requirements.txt` / `Pipfile`
  - test: `pytest` (or `python -m pytest`); fall back to `python -m unittest`
  - type-check: `mypy .` or `pyright` if listed
  - lint: `ruff check`, `flake8`, or `black --check`
- Go: `go.mod`
  - test: `go test ./...` (scope with `./pkg/...` if PR is narrow)
  - lint: `golangci-lint run` if config present, else `go vet ./...`
  - type-check: `go build ./...` doubles as type-check
- Rust: `Cargo.toml`
  - test: `cargo test`
  - lint: `cargo clippy --all-targets -- -D warnings`
  - type-check: `cargo check`
- Ruby: `Gemfile` → `bundle exec rspec` / `rubocop`
- Elixir: `mix.exs` → `mix test` / `mix credo`
- Java/Kotlin: `pom.xml` / `build.gradle*` → `mvn test` / `./gradlew test`

**6. CI as a fallback signal**
If detection above is ambiguous, peek at `.github/workflows/*.yml` (or `.gitlab-ci.yml`, `.circleci/config.yml`) for the commands CI actually runs. CI is the authoritative answer to "how does this repo verify itself?"

**7. Project-specific overrides**
Check for, in order:
- `CLAUDE.md` at repo root or `app/CLAUDE.md` (or wherever the repo nests its primary code)
- `.claude/skills/pr-resolver-overrides.md`
- `AGENTS.md` / `CONTRIBUTING.md`

If any of these spell out test/type-check/lint commands, **prefer them over auto-detection** — they're project conventions and may include things detection can't see (custom wrappers, env vars, working-dir requirements like "always run from `app/`").

**8. Hooks**
If `.husky/`, `lefthook.yml`, or `.git/hooks/pre-commit` exist, the project has pre-commit hooks. Respect them — never run `--no-verify` without explicit user authorization. If a hook fails, fix the underlying problem; don't bypass it.

State briefly to the user what you detected before starting Phase 1 — one line, e.g.:

> Detected: pnpm + vitest + tsc (incremental) + eslint. Pre-commit hooks via husky.

This makes it easy for the user to correct you if detection went wrong.

### Phase 1 — Acquire context

Run in parallel:

1. `gh pr view <PR#> --json number,title,state,headRefName,baseRefName,body,url,createdAt`
2. `gh api repos/<owner>/<repo>/pulls/<PR#>/comments --paginate` — inline review threads
3. `gh api repos/<owner>/<repo>/issues/<PR#>/comments --paginate` — general PR-level comments
4. `gh api repos/<owner>/<repo>/pulls/<PR#>/reviews --paginate` — review summaries (Approve/Request changes/Comment)
5. `gh pr checks <PR#>` — CI status (failed CI is a real review concern)

If the PR was created less than ~10 minutes ago and bot reviews aren't in yet, wait a few minutes (with a scheduled wakeup, if the harness has one) and re-poll. Don't start fixing without seeing all review comments unless the user explicitly says to skip waiting.

### Phase 2 — Check out the branch in a dedicated worktree

**Never operate in the primary worktree.** It is often shared with the user's active work (other agent sessions, in-flight edits, a different branch checked out). Switching branches under that tree can clobber WIP or trigger automatic stashes that destroy in-flight edits. Always work in a separate worktree.

**Step 1 — Reuse an existing worktree if the branch is already checked out somewhere.**

```bash
git fetch origin <headRef>
git worktree list --porcelain
```

Parse the output for a `worktree <path>` block whose `branch` line is `refs/heads/<headRef>`. If found, that's your working directory — `cd` there and continue. (Don't create a duplicate worktree; git refuses to check the same branch out twice anyway.)

Before reusing it, sanity-check that worktree's state:

```bash
git -C <worktree-path> status --porcelain
git -C <worktree-path> rev-parse --abbrev-ref HEAD
```

If it has uncommitted changes you didn't make, stop and ask the user — that's somebody else's in-flight work, not yours to commit over.

**Step 2 — Otherwise, create a fresh worktree for the PR.**

Pick a sibling path outside the primary repo root to avoid collisions:

```bash
REPO_ROOT=$(git rev-parse --show-toplevel)
WORKTREE_DIR="${REPO_ROOT}/../$(basename "$REPO_ROOT")-pr-<PR#>"
git worktree add --detach "$WORKTREE_DIR" "origin/<headRef>"
cd "$WORKTREE_DIR" || exit 1
```

Detached on purpose. `-B <headRef>` would re-point a local branch of that name, which may hold someone's unpushed commits. A failed `cd` leaves you in the primary checkout, hence the `|| exit 1`. Push later with `git push origin HEAD:<headRef>`.

**Step 3 — From the worktree, sync and merge base.**

```bash
git merge --ff-only origin/<headRef>
git fetch origin <baseRef>
git log --oneline origin/<baseRef> ^HEAD | head -10
```

If commits exist on the base that aren't in HEAD, merge them in:

```bash
git merge --no-edit origin/<baseRef>
```

Resolve any conflicts manually. If the merge re-introduces fixes from prior PRs (common for stacked PRs), that's expected.

After the merge, re-stat the actual PR-net diff:

```bash
git diff origin/<baseRef>...HEAD --stat
```

That stat is what you're reviewing — not the raw PR diff (which may include unrelated reverts caused by stale base).

**Remember the worktree path** — every subsequent phase (fixes, tests, sub-agent reviews, commit, push) runs inside it. When spawning sub-agents (Phase 4/5), pass the absolute worktree path so they `cd` into the right place rather than the primary repo. After Phase 7, tell the user the worktree path so they can `git worktree remove <path>` once they're done. Don't auto-remove it — the user may want to poke at it post-merge.

### Phase 3 — Validate each review concern

For each inline comment, summary review point, and CI failure:

1. **Read the cited file/lines yourself.** Don't trust the diff hunk in the comment.
2. **Reason about the claim from first principles.** Is the asserted bug actually possible given the surrounding code? Could the reviewer have missed a guard, a default, or an extension that registers the missing thing automatically?
3. **Reproduce or disprove.** When practical: write a small script, run a test, or grep for the assumed-missing symbol. Don't accept "the bot said so" as proof.
4. **Categorize each concern**: REAL (will fix), WRONG (document why and skip), DESIGN-SCOPE (note in summary, no fix), DUPLICATE (multiple bots flag the same thing).

Keep an internal table of `[concern, classification, fix plan]` so the commit message and PR summary comment can cite each one.

### Phase 4 — Fix the cited concerns AND spawn whole-changeset reviews in parallel

This phase has two parallel tracks. Start them in the same response so they run concurrently.

**Track A — Fix the cited concerns** (your foreground work):

For each REAL concern:

- Apply the smallest correct fix. No drive-by refactors.
- Add a regression test if the change alters runtime behavior.
- If a test relies on a stub/mock, make sure the stub matches the new contract.

**Track B — Spawn TWO parallel adversarial reviews of the WHOLE PR diff** (background):

The cited concerns are only what the first reviewers happened to notice. An independent pass on the whole changeset catches what they missed and what isn't on your fix list.

In the same response that starts Track A, spawn TWO background sub-agents (`run_in_background: true`) reviewing the entire `git diff origin/<base>...HEAD`:

1. **Fast-model review** — a general-purpose sub-agent on a faster model (for example `model: sonnet`). Sharp on adjacent-code regressions, brittle test assumptions, and edge cases.
2. **Strong-model review** — a general-purpose sub-agent on the strongest model available (for example `model: opus`). Sharp on architecture, security, and big-picture concerns.

Each prompt MUST include — in this exact order — to avoid producing a generic "review the code" pass:

1. **Identity & access**: PR number, branch name, base SHA, and the **absolute path of the dedicated PR worktree from Phase 2** (not the primary repo root) so the reviewer can `cd` and run `git diff origin/<base>...HEAD` themselves.
2. **Don't-re-flag list**: every known concern you're already fixing in Track A. Phrase it as "DO NOT re-flag these — they are being addressed in parallel:" with file:line cites.
3. **Domain-specific cues**: 3–6 bullets calling out the parts of the codebase this PR touches that are the most likely to hide bugs (e.g., payment webhook handlers, tenant-context propagation, migration ordering, auth flows, env-var fallbacks). Tailor to the PR's actual surface — don't paste a generic list.
4. **Universal review checklist** (paste this verbatim each time):
   - Race conditions / concurrency (esp. read-then-write without a lock or compare-and-set)
   - Resource leaks: timers not cleared, streams left unread, transactions or connections held open
   - Auth gaps: any new routes or entrypoints? Does each use the repo's standard auth wrapper or middleware for its audience?
   - Secret leakage: env vars in URLs, headers logged, default values that are real production identifiers
   - PII handling: addresses/emails/phones being returned by public routes, logged, or transmitted unescaped to webhooks
   - Webhook signature verification: any new external-webhook routes that trust the body without verifying its signature?
   - Idempotency: external API calls with no deterministic dedupe key; provider retries that apply a state change twice
   - Type safety holes: casts and `any`-style escapes that hide real type mismatches
   - Test coverage gaps: error paths, feature-disabled paths, fallback paths
   - Schema/migration ordering: migrations that conflict with ones on the base branch; a value added and used in the same migration where the database forbids it
   - Dead code / half-finished work: imports of nonexistent symbols, TODOs claiming planned work, unused new modules
   - Scheduled jobs and serverless handlers: timeout handling, retry behavior, secret retrieval edge cases
   - Dangerous default behaviors: hardcoded fallback values that page real people / hit prod systems from staging or dev
5. **Output format** (paste verbatim):
   - `## Additional concerns (NOT in known-fix list)` — bullets of `**file:line** — concern → recommended fix` with quoted code
   - `## False positives I'd warn against` — anything that LOOKS suspicious but is actually fine, with reasoning
   - `## SUMMARY` — `Additional REAL issues: N` and `Severity: ...` (P0/P1/P2/P3 counts)
6. **Tone & length**: "Be ruthless on substance — skip style nits and padding. Cap report at 400 words."

After both background reviews return, merge their findings with your Track A work. Apply credible additional findings into the same commit. Skip findings that are out-of-scope (separate stories) or clearly false positives — note these in the PR summary so reviewers see you considered them.

After all fixes (Track A + integrated reviews), run the gates detected in Phase 0:

- **Affected tests** — scope to the touched files when the runner supports it (e.g., `pnpm exec vitest run path/to/test`, `pytest path/to/test_thing.py`, `go test ./pkg/...`, `cargo test --package foo`). Falling back to the full suite is fine if scoping is awkward.
- **Type-check** — if applicable to the language. Use the incremental variant if the project provides one.
- **Lint** — touched files only.

If anything fails, fix it before proceeding. Don't push red.

### Phase 5 — Re-review the patched state

After all fixes are integrated and gates are green, run ONE confirmatory review of the patched state. Prefer a reviewer from a different model family than the first pass when a tool for it is connected (a cross-vendor review MCP server or CLI): a third opinion from elsewhere catches blind spots the first pair share. Otherwise use a single background sub-agent on the strongest model available. Don't spawn another pair — the cost isn't justified for a confirmatory pass.

Give the reviewer the absolute worktree path from Phase 2, the base ref, and a prompt that includes:

1. **Context block**: PR number, branch, base. State that the original fix list and first-pass review findings have already been applied; this pass is a confirmatory re-review of the resulting state.
2. **What to focus on**:
   - Regressions introduced by the fixes themselves
   - Concerns from the first pair that were applied incompletely
   - New edge cases that the patched code surfaces but the original didn't
3. **Don't re-flag list**: every concern that was deliberately classified WRONG / DESIGN-SCOPE / DEFERRED, with one-line rationale each. Phrase as "DO NOT re-flag — explicit decisions made on this PR:".
4. **The same universal review checklist as Phase 4 Track B**, pasted verbatim.
5. **Output format**: `## Confirmed clean` / `## Outstanding issues` (with file:line + recommended fix) / `## SUMMARY` (`Outstanding REAL issues: N`, P0/P1/P2/P3 counts).
6. **Tone & length**: "Be ruthless on substance. Skip style nits. Cap at 300 words. If everything is clean, say so in 1–2 sentences and stop."

If the re-review surfaces new credible issues, apply them and re-run the gates. **Cap the loop at one re-review round.** If the re-review keeps finding new significant issues, the PR is under-baked — flag back to the user instead of looping further.

### Phase 6 — Commit, push, summarize

Commit with a message in the repo's convention (Conventional Commits shown):

```
fix(<scope>): address PR #<num> review feedback

- <one bullet per REAL concern, terse>
- ...
```

Follow the repo's rules on tool attribution in commits. Use present tense. The body should let a future archaeologist understand *why* each change was made without needing to re-read the PR threads.

Push: `git push origin HEAD:<headRef>`. That works from a detached worktree and from a reused branch checkout alike. Never force.

Post **one** PR comment summarizing the resolution. Format it for human reviewers, not bots:

```bash
gh pr comment <PR#> --body "$(cat <<'EOF'
## Review feedback resolved

**Addressed (commit `<short-sha>`):**
- **<file>:<line>** — <concern in 1 line> → <fix in 1 line>
- ...

**Reviewed but not fixed:**
- **<concern>** — <why: e.g., "Underline ext is auto-registered by StarterKit v3; verified in dist. Added clarifying comment + regression test.">

**Verification:**
- <N> affected tests pass
- type-check + lint clean
- <any other gates>
EOF
)"
```

The "Reviewed but not fixed" section is critical — it tells reviewers you read their concern, explains why no code change was needed, and shows the work. This is how trust gets built.

After the comment posts successfully, **apply the `pr-ready-to-merge` label** so this PR is easy to spot in the merge queue / dashboard view:

```bash
# Create the label idempotently the first time it's used in a repo.
# `gh label create` exits non-zero if the label already exists — that's fine, swallow it.
gh label create pr-ready-to-merge \
  --color "0E8A16" \
  --description "Reviewer feedback resolved by /pr-resolver — ready for human merge" \
  2>/dev/null || true

gh pr edit <PR#> --add-label pr-ready-to-merge
```

The label is the signal the pre-flight guard (above) keys off to short-circuit re-invocations. Don't skip applying it — without the label, every `/loop` wakeup will re-run the full workflow.

If the label-add fails (permissions, repo without label-write access), don't fail the whole run — log the failure to the user and continue. The PR is still resolved; only the marker is missing.

### Phase 7 — Report to user

Tell the user, in the chat:

- One-line summary: "PR #N — addressed X concerns, deferred Y."
- The new commit SHA and the PR URL.
- Any flag that needs human attention (e.g., "design-scope concern about split-view inspector — surfacing for your call").

Don't recap fixes the user can read in the PR comment.

---

## Failure modes to avoid

- **Don't ever check out the PR branch in the primary worktree.** Always work in a dedicated worktree (reused if one already has the branch, freshly created with `git worktree add` otherwise). Switching branches under a shared primary tree clobbers in-flight edits from other sessions.
- **Don't commit without bot reviews if they're imminent.** Two commits within 10 minutes look bad. If unsure, ask: "Bots haven't posted yet — wait or proceed?"
- **Don't mass-reply to bot threads.** Single summary comment only.
- **Don't `git push --force` unless the user explicitly authorizes it.** Stacked PRs are sensitive to history rewrites.
- **Don't skip the merge-base check.** Stale base state on stacked PRs is common and not catching it leads to reviewers asking "why are you reverting X?"
- **Don't accept reviewer claims unverified.** A wrong "fix" applied at the bot's request is worse than no fix.
- **Don't expand scope.** If you find unrelated bugs, mention them in the PR comment for follow-up — don't fix them in this commit.
- **Don't run the full test suite if the PR is narrow.** Scope to touched files when the runner supports it; full suite only when scoping is impractical or the change is broad.
- **Don't assume a tool exists.** If your detected linter / type-checker isn't actually installed (`command not found`), say so and skip that gate rather than failing loudly.
- **Don't skip the pre-flight guard.** It's the only thing that makes the skill safe to call from `/loop`. Skipping straight to Phase 0 on a re-invocation produces duplicate commits, duplicate PR comments, and re-runs sub-agent reviews on already-resolved PRs.
- **Don't forget to apply the `pr-ready-to-merge` label.** It's how the user (and the pre-flight guard) tells "done" from "in progress." A successful run that leaves the label off looks indistinguishable from one that crashed mid-Phase-4.

---

## Notes on Node.js specifics

The most common Node failure mode is running tooling from the wrong working directory. Many monorepos nest the app under `app/`, `apps/web/`, `packages/foo/`, etc. Detection should look at where the lockfile lives — that's typically the right cwd. If the repo has a workspace setup (pnpm workspaces, npm workspaces, Yarn workspaces, Turborepo, Nx), use the workspace command (`pnpm --filter <pkg> exec ...`, `nx test <pkg>`) when it's clear which package the PR touches.

If the repo uses `husky` + `lint-staged`, expect pre-commit hooks to format and lint touched files automatically — don't redo that work manually.
