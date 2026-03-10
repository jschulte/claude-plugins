# Reconciliation -- Phase 7 Operation

**Purpose:** Compare integration analysis findings against the target project's existing plan. Surface gaps, conflicts, and incorrect assumptions.
**Called from:** SKILL.md Phase 7
**Output:** `_integration-analysis/reconciliation-report.md`, `_integration-analysis/open-questions.md`

---

## ToC

1. [Read Target Project](#1-read-target-project)
2. [Compare Plan vs Reality](#2-compare-plan-vs-reality)
3. [Surface Open Questions](#3-surface-open-questions)
4. [Output Formats](#4-output-formats)
5. [Mode-Specific Behavior](#5-mode-specific-behavior)
6. [Quality Checklist](#6-quality-checklist)

---

## 1. Read Target Project

Ask for the target project path:

```
Where is the target project we're planning for?

Target: ~/git/dealer-platform
```

**IMPORTANT:** If the target project has no planning artifacts (no `_bmad-output/`, no PRD, no architecture doc), skip the comparison and instead produce a "greenfield reconciliation" that maps integration analysis findings directly to recommended planning artifacts. Log: "No existing plan found. Generating greenfield recommendations."

Read all available planning artifacts:
- `_bmad-output/planning-artifacts/prd.md` -- product requirements, personas, business goals
- `_bmad-output/planning-artifacts/architecture.md` -- tech stack, service boundaries, ADRs, design decisions
- `_bmad-output/planning-artifacts/ux-design-specification.md` -- design system, UI patterns, component library
- `_bmad-output/planning-artifacts/epics.md` -- existing epics and stories
- `_bmad-output/implementation-artifacts/sprint-status.yaml` -- what's already been built
- `.specify/memory/constitution.md` -- Spec Kit constitution (if using Spec Kit)
- `CLAUDE.md`, `README.md` -- project conventions, coding standards
- `docs/reference/` -- any reference documentation already written

Also detect the actual tech stack from code:
- `package.json`, `tsconfig.json`, framework configs
- Existing type definitions, shared packages, implemented services
- What's already been built vs. what's just planned

In YOLO mode, if no target project path was provided during kickoff, check for a `target_project` field in `.stackshift-state.json`. If still not found, skip Phases 7-8 entirely and log: "No target project specified. Skipping reconciliation and go-forward plan. Run again with a target project path to enable Phases 7-8."

---

## 2. Compare Plan vs Reality

Systematically compare the two pictures across every dimension:

### Scope Comparison

| Question | Existing Plan Says | Integration Analysis Says | Gap |
|----------|-------------------|--------------------------|-----|
| How many systems are in play? | {from PRD/arch} | {from system inventory} | Missing systems? Extra systems? |
| What capabilities are in scope? | {from epics} | {from capability map} | Capabilities the plan missed? Capabilities the plan assumed that don't exist? |
| What data models are needed? | {from architecture} | {from data-architecture.md} | Models the plan got wrong? Fields missing? Conflicts not addressed? |
| What integrations are required? | {from architecture} | {from integration-contracts.md} | Integrations the plan didn't account for? Assumed integrations that don't exist? |

### Assumption Validation

- Does the architecture assume a data model that doesn't match reality?
- Does the PRD assume capabilities that require systems not in the plan?
- Do the epics assume integration patterns that don't exist in the legacy platform?
- Does the plan account for the override/inheritance patterns discovered in Phase 2?
- Does the plan address the pain points discovered in Phase 4?

### Coverage Gaps

- Capabilities discovered in the integration analysis that have NO corresponding epic in the existing plan
- Integration contracts that have NO corresponding story (who builds the adapter?)
- Data model conflicts that have NO resolution strategy in the architecture
- Pain points that have NO mitigation in any existing epic

### Over-Planning

- Epics/stories in the existing plan for capabilities that should be PRUNED
- Architecture decisions that assume systems work differently than they actually do
- Unnecessary abstractions planned for things that are simpler in reality

### Sequencing Conflicts

- Does the existing plan build things in an order that respects the dependency matrix?
- Are there epics planned early that depend on integrations planned later?
- Does the plan's phasing align with the L0->L1->L2->L3 layers from Phase 5?

---

## 3. Surface Open Questions

For every gap, conflict, and incorrect assumption, formulate a clear question that needs a team decision:

```markdown
### Category: Scope

Q1: The plan doesn't account for Label Services integration.
    Discovery found CMS Web calls Label Services for all UI text.
    - Option A: Add Label Services integration to L1 (it's on the critical path for any UI)
    - Option B: Hardcode English labels in L1, add Label Services in L2
    - Option C: The new platform handles labels differently -- explain how

### Category: Data Model

Q3: The architecture assumes a single canonical Dealer type, but DVS and ADD
    have fundamentally different dealer models (string ID vs numeric ID,
    different field sets). The plan has no story for reconciling them.
    - Option A: Build an adapter layer that maps both to a canonical type
    - Option B: Pick one as authoritative, migrate the other
    - Option C: Keep both, with a mapping table

### Category: Sequencing

Q4: Epic 3 (Page Layout) depends on DVS config delivery, but Epic 2
    (Config Service) doesn't include DVS integration -- it only has stub data.
    When does real DVS integration happen?
    - Option A: Add DVS integration to Epic 2 (expand scope)
    - Option B: Add a new Epic 2.5 for DVS integration
    - Option C: Epic 3 uses stub data too, real DVS integration comes later

### Category: Pain Points

Q5: PAIN-001 (dealer ID type mismatch) causes ~0.1% silent failures today.
    The architecture doesn't address this. When should it be fixed?
    - Option A: L0 Foundation -- fix it in the type system from day 1
    - Option B: L1 MVP -- handle it in the BFF adapter
    - Option C: Accept the same workaround the legacy platform uses
```

---

## 4. Output Formats

### reconciliation-report.md

```markdown
# Reconciliation Report

## Target Project
- **Path:** ~/git/dealer-platform
- **Planning docs found:** PRD, Architecture, UX Spec, Epics (7 epics, 34 stories)
- **Already implemented:** Epic 1 (complete), Epic 2 (in progress)

## Comparison Summary
| Dimension | Plan | Reality | Delta |
|-----------|------|---------|-------|
| Systems in scope | 4 | 7 | +3 missing from plan |
| Capabilities planned | 28 | 42 | +14 unplanned capabilities |
| Integration contracts | 5 | 12 | +7 unaccounted integrations |
| Data model conflicts | 0 acknowledged | 4 found | 4 need resolution |
| Pain points addressed | 2 | 11 | 9 unaddressed |

## Detailed Findings

### What the plan gets right
{List of things that align well}

### What the plan is missing
{Capabilities, integrations, data model issues not in the plan}

### What the plan gets wrong
{Incorrect assumptions about how systems work}

### What the plan over-plans
{Things that should be pruned or simplified based on reality}

### Sequencing issues
{Dependency violations in the current epic ordering}
```

### open-questions.md

```markdown
# Open Questions for Team Review

## Critical (must answer before proceeding)
{Questions that block the go-forward plan}

## Important (should answer for L1/L2 planning)
{Questions that affect scope and sequencing}

## Deferrable (can answer later)
{Questions that only affect L3 or can be resolved during implementation}
```

---

## 5. Mode-Specific Behavior

**YOLO mode:** Generate all questions with recommended answers (Option A/B/C with rationale), mark as `[AUTO - team review required]`. Proceed to Phase 8 using the recommended answers.

**Guided mode:** Present the most critical questions (top 5-10) and ask the team. Auto-answer lower-priority ones with `[AUTO]` markers.

**Interactive mode:** Walk through every question with the team. Do not proceed until all are resolved.

---

## 6. Quality Checklist

Before completing Phase 7:

- [ ] All available planning artifacts from the target project were read
- [ ] Scope comparison covers: systems, capabilities, data models, integrations
- [ ] Assumption validation checks at least 5 dimensions
- [ ] Every coverage gap has a corresponding open question
- [ ] Every open question has 2-3 concrete options (not open-ended)
- [ ] Questions are prioritized: Critical > Important > Deferrable
- [ ] Reconciliation report includes "what the plan gets right" (not just gaps)
- [ ] In YOLO mode, every auto-answered question has rationale
