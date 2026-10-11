# Codebase Audit

Three Claude Code skills for reviewing a whole codebase, or one area of it. Each reports
only what it can point to in the code.

```
/plugin marketplace add jschulte/claude-plugins
/plugin install codebase-audit@jschulte
```

| Skill | Ask it | You get |
|---|---|---|
| `health-audit` | "How healthy is this code?" | A 12-category scorecard with two separate grades: how well it is built, and how much it is hurting users right now |
| `arch-audit` | "Where are our own conventions broken?" | Every violation of every convention the codebase has adopted, with file and line, grouped into fix tracks |
| `finish-line` | "What does done look like, and how do we get there?" | An architectural assessment and a staged roadmap, agreed with you before any spec is written |

They work in that order. `health-audit` diagnoses and names the systemic patterns.
`arch-audit` takes one pattern and enumerates every instance of it. `finish-line` turns
the findings into a route.

All three default to read-only investigation. None of them edits code, files issues or
pushes unless you ask for that separately.

## Notes

- `health-audit` and `arch-audit` take an optional focus, such as "audit the billing
  pipeline" or "arch-audit soft-delete".
- `arch-audit` pauses after discovering the conventions and shows you the list before
  the sweep, so you can correct an invariant it inferred wrongly.
- `arch-audit` can fan out one subagent per convention. On a large repository that is
  a lot of tokens; give it a focus to keep the sweep small.

MIT licensed.
