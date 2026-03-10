# Epic/Story Generation -- Phase 6 Operation

**Purpose:** Generate technology-agnostic, dependency-ordered epics and stories from the layered implementation plan.
**Called from:** SKILL.md Phase 6
**Output:** `_integration-analysis/epics/` directory

---

## ToC

1. [Layer to Epic Mapping](#layer-to-epic-mapping)
2. [Story Generation](#story-generation)
3. [Cross-Referencing](#cross-referencing)
4. [Output Structure](#output-structure)
5. [BMAD Handoff](#bmad-handoff)
6. [Quality Checklist](#quality-checklist)

---

## Layer to Epic Mapping

Each implementation layer becomes one or more epics:

| Layer | Epic Pattern |
|-------|-------------|
| **L0: Foundation** | Epic per shared concern: "Establish shared type system", "Implement config service", "Set up auth infrastructure" |
| **L1: MVP** | Epic per end-to-end flow: "Basic page render flow (CMS -> DVS -> content)", "Core inventory display (WIAPI -> Web Inventory)" |
| **L2: Production** | Epic per capability cluster: "Full dealer configuration", "Complete inventory integration", "Search and filtering" |
| **L3: Complete** | Epic per enhancement area: "Analytics integration", "Admin tooling", "Performance optimization" |

---

## Story Generation

For each epic, generate stories that are:

- **Technology-agnostic** -- no framework names, no implementation details, just business capability and integration behavior
- **Dependency-ordered** -- stories within an epic are ordered by the dependency matrix (build the thing other things depend on first)
- **Cross-system aware** -- stories that span system boundaries explicitly state which systems participate and what data flows between them
- **Testable** -- each story has acceptance criteria that can be verified at the integration level

### Story Template

```markdown
### STORY-{layer}-{number}: {Title}

**Systems:** {list of systems involved}
**Depends on:** {STORY IDs that must be complete first}
**Tier:** {T1/T2/T3}

**As a** [User/Admin/System]
**I need** {capability}
**So that** {business value}

**Acceptance Criteria:**
- [ ] {System A} provides {data/capability} to {System B} via {contract from integration-contracts.md}
- [ ] {Business rule from capability map}
- [ ] {Data flows correctly per data-architecture.md}
- [ ] {Pain point PAIN-NNN is addressed}

**Integration notes:**
- Data: {which shared entities are involved, from data-architecture.md}
- Contract: {which integration contract governs this, from integration-contracts.md}
- Risk: {any pain points or known issues from pain-registry.md}
```

Assign each pain point a sequential identifier in the format `PAIN-NNN` (e.g., PAIN-001, PAIN-002) as defined in `operations/functionality-tiering.md`.

---

## Cross-Referencing

Every story references artifacts from earlier phases:
- **Capability IDs** from `capability-map.md`
- **Contract IDs** from `integration-contracts.md`
- **Pain point IDs** (PAIN-NNN) from `pain-registry.md`
- **Data entity references** from `data-architecture.md`

This traceability means a developer can follow any story back to the integration analysis that motivated it.

---

## Output Structure

```
_integration-analysis/epics/
  L0-foundation/
    epic-shared-types.md
    epic-config-service.md
    epic-auth-infrastructure.md
  L1-mvp/
    epic-basic-page-render.md
    epic-core-inventory.md
  L2-production/
    epic-full-dealer-config.md
    epic-complete-inventory.md
    epic-search-filtering.md
  L3-complete/
    epic-analytics.md
    epic-admin-tools.md
    epic-performance.md
  story-dependency-graph.md    # Mermaid graph showing story ordering across all layers
  coverage-matrix.md           # Which capabilities are covered by which stories
```

---

## BMAD Handoff

The generated epics and stories feed directly into BMAD:
- Copy `_integration-analysis/epics/` into `_bmad-output/planning-artifacts/`
- Epics map to BMAD epics, stories map to BMAD user stories
- Layer ordering maps to sprint/phase planning
- The dependency graph informs sprint sequencing -- never schedule a story before its dependencies

Alternatively, use `/stackshift.bmad-synthesize` with the integration analysis artifacts as input for more automated BMAD artifact generation.

### Guided Mode Prompt

In Guided mode, ask before generating:

```
The implementation layers are ready. Want me to generate technology-agnostic epics and stories from them?

A) Yes -- generate epics/stories for all layers
B) Yes, but only L0 + L1 -- I'll plan L2/L3 later
C) No -- I'll use the implementation layers to plan manually
```

In YOLO mode, auto-generate for all layers.

---

## Quality Checklist

Before completing Phase 6:

- [ ] Every capability from implementation-layers.md has at least one story
- [ ] Every story has acceptance criteria referencing integration artifacts
- [ ] Story dependency ordering matches the dependency matrix
- [ ] PAIN-NNN references in stories match pain-registry.md entries
- [ ] Coverage matrix shows 100% capability coverage across all stories
- [ ] Mermaid dependency graph renders correctly
- [ ] Stories are technology-agnostic (no framework names or implementation details)
- [ ] Each layer's epics have clear scope boundaries (no overlap between layers)
