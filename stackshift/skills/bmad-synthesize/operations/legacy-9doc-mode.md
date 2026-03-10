# Legacy 9-Doc Mode

Defines behavior when only 9 reverse-engineering docs exist (missing `business-context.md` and `decision-rationale.md` from older StackShift runs).

---

## Detection

If Step 0 finds exactly 9 docs with `business-context.md` and `decision-rationale.md` missing, warn the user:

```
WARNING: Legacy 9-doc set detected.
Missing: business-context.md, decision-rationale.md

These docs were added in StackShift v2.3. Without them:
- PRD will miss Product Vision, Target Users, Market Context, Stakeholders (~4 sections)
- Architecture will miss Technology Stack rationale and ADRs (~3 sections)
- Epics will use generic persona format instead of named personas
- UX spec will miss persona journey maps and design constraints

Options:
A) Generate missing docs first (run /stackshift.reverse-engineer for just these 2 docs)
B) Proceed with reduced coverage (sections marked [UNAVAILABLE])
```

If user chooses B, apply the rules below.

---

## Affected Sections by Artifact

### prd.md (reduced from ~90% to ~60% coverage)

| Section | Impact | Behavior |
|---|---|---|
| Product Vision | UNAVAILABLE | Write: `[UNAVAILABLE - requires business-context.md. Run /stackshift.reverse-engineer to generate.]` |
| Target Users | DEGRADED | Use only functional-specification.md User Personas section. Omit journey maps and pain points. |
| Success Criteria | DEGRADED | Use only functional-specification.md Success Criteria. Omit business-goal-derived KPIs. |
| Market Context | UNAVAILABLE | Write: `[UNAVAILABLE - requires business-context.md]` |
| Stakeholders | UNAVAILABLE | Write: `[UNAVAILABLE - requires business-context.md]` |
| Constraints & Assumptions | DEGRADED | Infer constraints from technical-debt-analysis.md and operations-guide.md. Mark as `[AUTO-INFERRED]`. |
| All other sections | NORMAL | No change. |

### architecture.md (reduced from ~85% to ~70% coverage)

| Section | Impact | Behavior |
|---|---|---|
| Technology Stack | DEGRADED | Infer from codebase analysis in other docs (package.json references, config files). Mark as `[AUTO-INFERRED from codebase]`. |
| ADRs | UNAVAILABLE | Write: `[UNAVAILABLE - requires decision-rationale.md]` |
| Design Principles | UNAVAILABLE | Write: `[UNAVAILABLE - requires decision-rationale.md]` |
| Trade-offs & Constraints | DEGRADED | Infer from technical-debt-analysis.md trade-off mentions. Mark as `[AUTO-INFERRED]`. |
| All other sections | NORMAL | No change. |

### epics.md (reduced from ~75% to ~55% coverage)

| Section | Impact | Behavior |
|---|---|---|
| User story personas | DEGRADED | Use generic format: "As a user..." instead of named personas. |
| Epic priority ordering | DEGRADED | Order by FR priority (P0 first) without business-goal weighting. |
| All other sections | NORMAL | No change. |

### ux-design-specification.md (reduced from ~65% to ~45% coverage)

| Section | Impact | Behavior |
|---|---|---|
| User Personas | DEGRADED | Use functional-specification.md User Personas only. No journey maps. |
| Design Constraints | UNAVAILABLE | Write: `[UNAVAILABLE - requires business-context.md]` |
| All other sections | NORMAL | No change. |

---

## Coverage Score Adjustment

When calculating `coverage_score` in artifact frontmatter, count UNAVAILABLE sections as 0% and DEGRADED sections as 50% of their normal weight.

---

## Synthesis Report Addendum

Append to the standard synthesis report:

```
Legacy Mode: 9/11 docs (missing business-context.md, decision-rationale.md)
  - [N] sections marked [UNAVAILABLE]
  - [M] sections marked [DEGRADED] with auto-inferred content
  - Recommendation: Run /stackshift.reverse-engineer to generate missing docs, then re-run synthesize
```
