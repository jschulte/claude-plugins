# PR Workflow

Four Claude Code skills for the life of a pull request on GitHub. They need the `gh`
CLI, signed in.

```
/plugin marketplace add jschulte/claude-plugins
/plugin install pr-workflow@jschulte
```

| Skill | When | What it does | Writes? |
|---|---|---|---|
| `productionize` | Your draft PR is ready for a human | Reconciles the diff, the description and the verification claims, fixes what is mechanical, rewrites the body, then marks the PR ready | Commits and pushes to the PR branch |
| `pr-resolver` | Reviewers have commented | Checks every review claim against the code, fixes the real ones, runs two independent reviews of the whole diff, posts one summary comment | Commits and pushes to the PR branch |
| `bulletproof` | Before you merge or release | Traces the changed contracts across real failure paths and gives a verdict: ready, ready after fixes, not ready, or not proven ready | No. Audit-only unless you say otherwise |
| `issue-burndown` | The backlog has dozens of open issues | Works out which are already fixed, claimed or duplicates, groups the rest by shared root cause, and lands one reviewed PR per group | Opens and merges PRs |

## Notes

- Every skill that edits code works in its own git worktree and never in your main
  checkout. None of them force-pushes.
- `productionize` and `pr-resolver` are safe to run on stacked PRs: both read the base
  branch from the API instead of assuming `main`.
- `pr-resolver` exits early when a PR has no new review activity, so it can run on a
  loop. It marks finished PRs with a `pr-ready-to-merge` label.
- `issue-burndown` shows you its plan (which issues it will close as bookkeeping and
  which batches it will fix) before it writes any code.
- A repository's own rules win. Each skill reads the project's instructions first and
  uses its commands, conventions and definition of done where they exist.

MIT licensed.
