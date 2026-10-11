# Codebase Audit

Claude Code skills for reviewing a whole codebase, or one area of it. Each reports only
what it can point to in the code.

```
/plugin marketplace add jschulte/claude-plugins
/plugin install codebase-audit@jschulte
```

| Skill | Ask it | You get |
|---|---|---|
| `health-audit` | "How healthy is this code?" | A 12-category scorecard with two separate grades: how well it is built, and how much it is hurting users right now |
| `health-sweep` | "Audit this from every angle." | `health-audit` plus whichever lenses apply, run in parallel, then merged into one scorecard, the themes that cut across them, and one ranked action plan |
| `arch-audit` | "Where are our own conventions broken?" | Every violation of every convention the codebase has adopted, with file and line, grouped into fix tracks |
| `finish-line` | "What does done look like, and how do we get there?" | An architectural assessment and a staged roadmap, agreed with you before any spec is written |

They work in that order. `health-audit` diagnoses and names the systemic patterns.
`arch-audit` takes one pattern and enumerates every instance of it. `finish-line` turns
the findings into a route.

## The lenses

Each lens is a full audit of one perspective, with the same two-grade scoring as
`health-audit`. Run one alone, or let `health-sweep` pick the ones that apply.

| Skill | Perspective |
|---|---|
| `health-audit-ux` | Design-system adherence, visual consistency, interaction quality, accessibility |
| `health-audit-api` | Endpoint design, request and response consistency, errors, versioning |
| `health-audit-data` | Personal data handling, data flows, logging, consent |
| `health-audit-domain` | Business rules, state machines, permissions, money |
| `health-audit-dx` | Onboarding, build speed, test suite health, tooling |
| `health-audit-ops` | CI/CD, deployment safety, containers, infrastructure, monitoring |
| `health-audit-seo` | Meta tags, social sharing, structured data, crawlability |

## Notes

- All of these default to read-only investigation. None of them edits code, files
  issues or pushes unless you ask for that separately.
- Most take an optional focus, such as "audit the billing pipeline" or "arch-audit
  soft-delete".
- `health-sweep` shows you which lenses it plans to run and waits for your answer. A
  full sweep is up to eight complete audits, each in its own subagent, so trim the list
  if you only care about some of them.
- `arch-audit` pauses after discovering the conventions and shows you the list before
  the sweep, so you can correct an invariant it inferred wrongly.

MIT licensed.
