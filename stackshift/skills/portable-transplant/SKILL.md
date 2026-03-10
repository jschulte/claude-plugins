---
name: portable-transplant
description: Translates portable component specs into targeted BMAD epics for a specific target project by mapping abstract personas, domain language, and data contracts against the target's PRD and Architecture. Activated when the user has completed portable-extract and wants to import business logic into a target project.
allowed-tools:
  - Read
  - Write
  - Glob
  - Grep
  - Bash
---

# Portable Transplant

Translate portable component specs into targeted epics for a specific project.

**Estimated Time:** 5-20 minutes (depending on mode)
**Prerequisites:** Portable extract completed (`_portable-extract/`), target project has BMAD docs (PRD + Architecture minimum)
**Output:** Targeted epics + transplant report in `_portable-transplant/`

---

## Trigger Phrases

- "Transplant these portable specs into my target project"
- "Translate these extracted specs for my project"
- "Import portable business logic into this BMAD project"
- "Write epics for my target project using the extracted specs"

---

## Input Requirements

### Portable Extract (Source)

The `_portable-extract/` directory from a previous portable-extract run:

| File | Required | Contains |
|------|----------|----------|
| `epics.md` | Yes | Abstract epics with [User]/[Admin]/[System] personas, YAML frontmatter with `source_project` |
| `component-spec.md` | Yes | Business rules (BR-*), data contracts (DC-*), edge cases (EC-*), flows (FLOW-*) |

**Location resolution order:**
1. Current directory: `./_portable-extract/`
2. User-specified explicit path
3. Batch results: `~/git/batch-results/service-name/_portable-extract/`

### Target BMAD Docs

| File | Required | Provides |
|------|----------|----------|
| PRD (prd.md) | Yes | Target personas, business goals, domain language, requirements context |
| Architecture (architecture.md) | Yes | Target tech stack, data models, API patterns, integration architecture |
| UX Design (ux-design-specification.md) | No | Target design system, user flows, interaction patterns |

**Location resolution order:**
1. `_bmad-output/planning-artifacts/`
2. `docs/` or project root
3. User-specified explicit path

**If UX Design is not available:** Skip interaction pattern enrichment in Phase 3 and note in the transplant report that UX patterns were not mapped.

---

## Mode Selection

Determine which mode to use based on user request. If the user does not specify, default to Guided.

### Mode 1: YOLO (Fully Automatic)

No user interaction. Map all personas by role similarity. Translate all domain language using context clues from target PRD. Map all data contracts to closest target models. Mark uncertain mappings with `[AUTO-MAPPED - review recommended]`.

### Mode 2: Guided (Default)

3-8 targeted questions. Auto-map high-confidence items. Present mapping questions for ambiguous items (persona matches, domain terms, data contract fields). Incorporate user answers before generating epics.

### Mode 3: Interactive

Full conversation. Walk through each persona mapping, each domain term translation, and each data contract mapping individually. Present each epic for review before finalizing.

---

## Process

Phases 0, 1, 6, and 7 are identical across all modes. Phases 2-5 have mode-specific behavior documented in each phase and its referenced operations file.

### Phase 0: Locate and Verify Inputs

1. Locate the portable extract directory using the resolution order above.
2. Locate the target BMAD docs using the resolution order above.
3. Verify `epics.md` and `component-spec.md` exist in the portable extract.
4. Verify `prd.md` and `architecture.md` exist in the target docs.

**If portable extract is missing:** Tell the user to run portable-extract on the source project first. Stop.
**If target BMAD docs are missing:** Tell the user to create them via BMAD workflows or bmad-synthesize. Stop.

### Phase 1: Load, Parse, and Validate Inputs

Read all input files using the Read tool. Use parallel reads where possible.

**From portable extract, load:**
- All abstract personas with their role mappings
- All business rules (BR-CALC, BR-VAL, BR-DEC, BR-STATE)
- All data contracts (DC-IN, DC-OUT, DC-STATE)
- All edge cases (EC-*) and error states (ERR-*)
- All interaction patterns (FLOW-*)
- All epic groupings and story definitions

**From target BMAD docs, load:**
- PRD: personas (names, roles, goals), business vision, success criteria, domain terminology, FRs/NFRs
- Architecture: tech stack, data models, API contracts, integration patterns, domain model
- UX Design (if available): design system, user flows, interaction patterns

**Validation gate -- verify all of the following before proceeding:**
1. Portable extract contains at least 1 persona, at least 1 BR-* rule, and at least 1 DC-* contract.
2. Target PRD contains at least 1 named persona and identifiable domain terminology.
3. Target Architecture contains at least 1 data model or API contract.

**If validation fails:** Report which requirements are missing. If the file exists but lacks required content (empty sections, missing frontmatter, no BR-*/DC-* IDs), tell the user which file is malformed and what is missing. Stop.

> Phase 1 complete. Report: "Loaded N personas, M business rules, K data contracts from source. Target has X personas, Y data models."

### Phase 2: Map Personas

Follow `operations/map-to-target.md` Part 1 (Steps 1-5) for persona mapping. The operation handles all three modes.

> Phase 2 complete. Report: "Persona mapping: [User] -> TargetName, [Admin] -> TargetName, [System] -> TargetName(s)."

### Phase 3: Map Domain Language

Follow `operations/map-to-target.md` Part 2 (Steps 1-5) for domain language translation. The operation handles all three modes.

> Phase 3 complete. Report: "N domain terms translated, M excluded, K flagged for review."

### Phase 4: Map Data Contracts

Follow `operations/map-to-target.md` Part 3 (Steps 1-5) for data contract mapping. The operation handles all three modes.

> Phase 4 complete. Report: "N contracts mapped, M gaps identified, K adapter notes generated."

**Mapping validation checkpoint -- verify before proceeding to generation:**
1. Every abstract persona has at least one target mapping.
2. Every domain term has a translation, an exclusion, or a review flag.
3. Every DC-* contract has a target model mapping or a documented gap.

**If validation fails:** Report which mappings are incomplete. In Guided/Interactive mode, ask the user to resolve. In YOLO mode, mark incomplete mappings with `[INCOMPLETE - review required]` and proceed.

### Phase 5: Generate Targeted Epics

Follow `operations/generate-targeted-epics.md` (Steps 1-6) for epic generation and quality checks.

> Phase 5 complete. Report: "Generated N epics with M stories. K stories excluded, J items flagged for review."

### Phase 6: Write Output

Write output files following `operations/write-output.md`.

1. Create `_portable-transplant/` directory if it does not exist.
2. Write to `_portable-transplant/targeted-epics.md` (overwrite if exists).
3. Write to `_portable-transplant/transplant-report.md` (overwrite if exists).

### Phase 7: Report Summary

Output a summary to the user:

```
Portable Transplant Complete
==============================
Source: [source_project name]
Target: [target_project name]
Mode: [mode used]

Persona Mapping: N personas mapped
Domain Language: M terms translated, K excluded
Data Contracts: J contracts mapped, L gaps identified
Epics Generated: X epics, Y stories
Items Needing Review: Z (see transplant-report.md)

Next Steps:
  1. Review targeted-epics.md
  2. Resolve items marked [REVIEW]
  3. Feed into BMAD: use as input for create-epics-stories or create-story
```

---

## Multi-Source Transplant

To transplant from multiple portable extracts into a single target:

1. Run the transplant process for each source separately.
2. Write each source's output to `_portable-transplant/{source-name}/` where `source-name` is the `source_project` value from the portable extract's epics.md frontmatter, lowercased and hyphenated.
3. After all sources are processed, check for conflicts across sources:
   - **Duplicate BR-* IDs:** If two sources define the same BR-* ID, prefix with the source name (e.g., `payment-BR-CALC-001`, `inventory-BR-CALC-001`).
   - **Overlapping epic domains:** If two sources produce epics covering the same functional area, flag for user review: "Sources A and B both produce epics for [domain]. Merge or keep separate?"
   - **Contradictory persona mappings:** If source A maps [User] to PersonaX and source B maps [User] to PersonaY, ask the user which mapping to use or keep both with source context.
4. Merge into a unified `_portable-transplant/targeted-epics.md` for the target, or keep separate per-source files if the user prefers.

---

## Integration with BMAD Workflows

### Feeding into create-epics-stories

1. Copy `_portable-transplant/targeted-epics.md` to the target project.
2. Run BMAD's `*create-epics-stories` workflow.
3. Tell the BMAD agent: "I have imported epics from a portable transplant. Review and incorporate them into the project's epic structure."

### Feeding into create-story

1. Reference specific stories from targeted-epics.md.
2. Run `*create-story` for each story.
3. BMAD expands the story with implementation details for the target stack.

### After Transplant

The business rules in component-spec.md remain the source of truth for logic. The targeted epics reference them by ID. When implementing:
1. Read the story in targeted-epics.md (target language).
2. Read the business rule in component-spec.md (precise logic).
3. Implement using the target's architecture patterns.

---

## Error Recovery

| Situation | Action |
|-----------|--------|
| Portable extract files exist but are malformed (missing frontmatter, no BR-*/DC-* IDs, empty sections) | Report which file is malformed and what content is missing. Stop. |
| Target docs exist but lack required content (no personas in PRD, no data models in Architecture) | Report which doc is missing what. Stop. |
| Partial mapping failure (some personas/terms/contracts could not be mapped) | In YOLO: mark with `[INCOMPLETE]` and proceed. In Guided/Interactive: ask the user to resolve. |
| Read tool fails on a file | Report the file path and error. Ask the user to verify the path. Stop. |
| Target has no UX Design document | Skip interaction pattern enrichment. Note in transplant report. Proceed normally. |
| Multi-source conflict (duplicate BR-* IDs, overlapping epics) | Flag conflicts. Ask user for resolution preference. Do not silently merge. |

---

## Success Criteria

- `_portable-transplant/targeted-epics.md` written with valid YAML frontmatter
- All abstract personas mapped to target personas (no `[User]`/`[Admin]`/`[System]` remaining except in mapping documentation)
- Domain language translated (no source-specific terms in epic/story text)
- Data contracts mapped to target models (gaps documented)
- Business rule references preserved (all BR-* IDs intact and traceable to component-spec.md)
- `_portable-transplant/transplant-report.md` written with complete mapping detail
- Output is valid BMAD epic/story format
