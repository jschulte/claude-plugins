# Go-Forward Plan -- Phase 8 Operation

**Purpose:** Merge integration analysis findings, reconciliation decisions, and target project context into a complete implementation-ready plan.
**Called from:** SKILL.md Phase 8
**Output:** `_integration-analysis/go-forward-plan/` directory

---

## ToC

1. [Merge All Inputs](#1-merge-all-inputs)
2. [Produce Holistic Epic/Story Plan](#2-produce-holistic-epicstory-plan)
3. [Integrate with Existing Plan](#3-integrate-with-existing-plan)
4. [Output Structure](#4-output-structure)
5. [Mode-Specific Behavior](#5-mode-specific-behavior)
6. [Quality Checklist](#6-quality-checklist)

---

## 1. Merge All Inputs

Combine:
- **Tech-agnostic epics** from Phase 6 -- the ground-truth capabilities needed
- **Reconciliation decisions** from Phase 7 -- team answers to scope, sequencing, and data model questions
- **Target project context** -- PRD, architecture, UX spec, tech stack, conventions
- **Existing work** -- what's already built, what epics/stories already exist
- **PRUNE list** -- capabilities explicitly excluded

**IMPORTANT:** If the target project has no existing plan (greenfield scenario from Phase 7), skip the merge step and generate a fresh plan directly from the tech-agnostic epics, adapted to the target's tech stack.

In YOLO mode, use the auto-recommended answers from Phase 7 reconciliation as the decisions. Log: "Using auto-recommended reconciliation answers. Tag [AUTO] on all decision-derived stories."

---

## 2. Produce Holistic Epic/Story Plan

For each implementation layer, generate targeted epics that:

- **Respect the target's tech stack** -- React Router 7 loaders, GraphQL resolvers, Iris components, Zod schemas (whatever the target uses)
- **Follow the target's architecture** -- which service handles what, where types live, how data flows per the architecture doc
- **Match the target's UX spec** -- specific design system components, patterns, and tokens
- **Incorporate reconciliation decisions** -- the team's answers to Phase 7 questions are baked in
- **Build on existing work** -- reference already-implemented epics, extend existing stories, do not duplicate
- **Respect the dependency matrix** -- stories are ordered so prerequisites come first
- **Address pain points** -- stories that resolve specific PAIN-NNN items are tagged

### Implementation-Ready Story Template

Phase 8 stories replace Phase 6 tech-agnostic stories with the same STORY-{layer}-{number} IDs. Phase 8 adds implementation specifics from the target project.

```markdown
### STORY-{layer}-{number}: {Title}

**Epic:** {epic name}
**Systems:** {list of systems involved}
**Depends on:** {STORY IDs that must be complete first}
**Addresses:** {PAIN-NNN if applicable}
**Reconciliation:** {Q-NNN decision that informed this story, if applicable}

**As a** {persona from PRD}
**I need** {capability}
**So that** {business value from PRD}

**Acceptance Criteria:**
- [ ] {Specific to target tech stack -- e.g., "GraphQL query returns DealerConfig type"}
- [ ] {Specific to target architecture -- e.g., "config-service caches in Redis with 5min TTL"}
- [ ] {Specific to target UX -- e.g., "Renders using Iris PageLayout with dealer theme tokens"}
- [ ] {Integration assertion -- e.g., "DVS config endpoint returns valid response for test dealer 5001157"}

**Implementation notes:**
- Service: {which service in the target monorepo}
- Types: {which shared-types to use/create}
- Tests: {what to test, per target's testing conventions}
```

---

## 3. Integrate with Existing Plan

If the target project already has epics:

- **Merge, do not replace** -- keep existing epic IDs and structure where they still make sense
- **Extend** -- add new stories to existing epics for integration capabilities the original plan missed
- **Reorder** -- adjust epic/story sequencing based on the dependency matrix
- **Remove** -- mark stories that should be pruned (with rationale from reconciliation)
- **Add** -- create new epics for capabilities the original plan did not account for
- **Annotate** -- add integration context to existing stories (e.g., "this story also needs to handle the DVS string-vs-numeric ID conflict per Q3 decision")

---

## 4. Output Structure

```
_integration-analysis/go-forward-plan/
  plan-summary.md                     # Executive summary: what changed, what's new, phasing overview
  L0-foundation/
    epic-shared-types.md              # Zod schemas, shared-types package, canonical data models
    epic-config-service.md            # GraphQL schema, Redis cache, DVS integration
    epic-auth-infrastructure.md       # OAuth, JWT, service-to-service auth
  L1-mvp/
    epic-basic-page-render.md         # React Router 7, Iris layout, CMS->DVS->content flow
    epic-core-inventory.md            # IrisDataTable, WIAPI->Web Inventory integration
  L2-production/
    epic-full-dealer-config.md        # Complete DVS hierarchy, all override patterns
    epic-complete-inventory.md        # Search, filtering, all inventory features
    epic-label-integration.md         # Label Services, i18n support
  L3-complete/
    epic-analytics.md                 # If kept per reconciliation decision
    epic-admin-tools.md
    epic-performance.md
  dependency-graph.md                 # Mermaid graph: full story ordering across all layers
  coverage-matrix.md                  # Capabilities -> stories mapping, 100% coverage verification
  reconciliation-decisions.md         # Record of all team decisions from Phase 7
  delta-from-existing-plan.md         # What changed from the original plan: added, removed, reordered, modified
```

### plan-summary.md Format

```markdown
# Go-Forward Plan Summary

## What Changed from the Original Plan
- **Added:** {N} new epics, {M} new stories (for capabilities the original plan missed)
- **Modified:** {N} existing stories (integration context added)
- **Reordered:** {N} stories moved earlier/later based on dependency analysis
- **Removed:** {N} stories pruned (with rationale)
- **New phase structure:** L0 -> L1 -> L2 -> L3 (was: Epic 1-7 linear)

## Phasing Overview
| Phase | Epics | Stories | Coverage | Milestone |
|-------|-------|---------|----------|-----------|
| L0: Foundation | 3 | 12 | 15% | Shared infra works, types defined, auth functional |
| L1: MVP | 2 | 18 | 40% | Basic dealer page renders end-to-end |
| L2: Production | 4 | 28 | 80% | Full feature set, ready for real dealers |
| L3: Complete | 3 | 14 | 100% | Enhancements, optimization, admin tools |

## Key Decisions Made (from Reconciliation)
{Summary of team decisions from Phase 7, linked to Q-NNN IDs}

## Known Risks
{From pain registry + reconciliation, things the team should watch for}
```

---

## 5. Mode-Specific Behavior

**YOLO mode:** Generate the full plan using auto-recommended reconciliation answers. Mark all decision-derived stories with `[AUTO]`. Write all artifacts without user confirmation.

**Guided mode:** Present the plan summary and ask:
```
Here's the go-forward plan. It modifies the existing plan based on what we
discovered about the real platform:

{summary}

Does this look right?
A) Looks good -- write the full plan to _integration-analysis/go-forward-plan/
B) Adjust -- let's discuss specific changes before finalizing
C) Re-reconcile -- I have new information that changes some Phase 7 answers
```

**Interactive mode:** Walk through each epic with the team before finalizing.

---

## 6. Quality Checklist

Before completing Phase 8:

- [ ] Every capability from implementation-layers.md has at least one implementation-ready story
- [ ] All reconciliation decisions from Phase 7 are incorporated
- [ ] Stories reference target project's tech stack, architecture, and UX spec
- [ ] Existing work (already-built epics) is acknowledged and not duplicated
- [ ] Dependency ordering is respected (no story depends on an unscheduled prerequisite)
- [ ] PRUNE items are explicitly excluded with rationale
- [ ] Coverage matrix shows 100% capability coverage (minus PRUNE)
- [ ] Delta document clearly explains what changed from the original plan and why
- [ ] Plan summary is readable by a non-technical stakeholder
