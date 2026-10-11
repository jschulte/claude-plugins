# What's Left

A Claude Code skill for the end of a long session, or the middle of a tangled one. Ask
"what's left?" and get the full ledger, checked against the real state, then say "yes
please" to have it all finished.

```
/plugin marketplace add jschulte/claude-plugins
/plugin install whats-left@jschulte
```

Then ask "what's left?", "where are we?" or "are we done?".

1. Sweeps the whole session, including the small asides, the "I'll come back to that"
   promises and anything lost in a compaction.
2. Checks each claim against the real state: git, open PRs, CI, tests, background work.
   A step counts as done only when the evidence was seen.
3. Traces each goal to its true finish line. Code written is rarely it: commit, push,
   review, merge, deploy and cleanup all count.
4. Reports what is done, a numbered plan for what remains, and what only you can do.
   Steps that are hard to undo or reach outside the workspace are marked.
5. On "yes", carries out every step in order and reports back against the same list.

There is no "things to consider" section. Every loose end is either done, filed as an
issue, or dropped.

The final report ends with a block banner, `WE'RE DONE` or `NOT DONE - WAITING ON YOU`,
so you can tell the state of a tab from the bottom of the screen.

MIT licensed.
