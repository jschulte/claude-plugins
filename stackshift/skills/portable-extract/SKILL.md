---
name: portable-extract
description: Extract tech-agnostic portable component specs from StackShift reverse-engineering docs. Generates abstract epics and component specifications for ANY BMAD project. Bridges StackShift code analysis with reusable, platform-independent component specifications.
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
---

# Portable Component Extraction

Extract tech-agnostic, reusable component specs from StackShift reverse-engineering documentation.

**Prerequisites:** Gear 2 (Reverse Engineer) completed with all 11 docs
**Output:** 2 portable artifacts in `_portable-extract/`

---

## Terminology

- **FR** - Functional Requirement from source reverse-engineering docs (input)
- **Story** - Portable output story mapped 1:1 from a source FR, unless an FR is split during domain grouping
- **Persona** - Abstract role: `[User]`, `[Admin]`, or `[System]`

---

## When to Activate

Activate when the user says any of:
- "Extract portable component specs"
- "Create tech-agnostic specs from this codebase"
- "Generate portable epics for reuse"
- "Extract business logic for cross-project migration"
- "Run portable extraction"

Also activate when Gear 2 is complete and the user chose `portable-extract` as the implementation framework.

---

## What This Skill Produces

Read all 11 reverse-engineering docs and distill them into 2 portable artifacts:

| Artifact | Primary Source Docs | Purpose |
|---|---|---|
| `epics.md` | functional-specification, business-context, integration-points | BMAD-format epics with abstract personas, no tech-specific stories |
| `component-spec.md` | functional-specification, data-architecture, business-context, integration-points, visual-design-system | Business rules, data contracts, edge cases, interaction patterns |

**Included:** Core business logic, abstract personas, data contracts, edge cases, error states, interaction patterns, accessibility/performance requirements (functional only).

**Excluded (5 categories):**
1. **Tech Setup** - Framework config, build tooling, bundler settings
2. **CI/CD** - Deployment pipelines, Docker configs, environments
3. **Tech Debt** - Source-platform refactoring, version upgrades
4. **Source-Platform Integration** - Specific API endpoints, SDK references, service names
5. **Test Infrastructure** - Test framework config, test runners, coverage tools

---

## Three Modes

### Mode 1: YOLO (Fully Automatic)

Execute all steps without user interaction. Resolve ambiguities by choosing the most restrictive classification (e.g., `[Admin]` over `[User]` when uncertain) and mark with `[AUTO-RESOLVED]`. Log progress at each step boundary.

### Mode 2: Guided (Recommended)

Auto-populate high-confidence items. Present 3-7 targeted questions for genuinely ambiguous items:
- Persona mapping confirmation
- Conflicting business rule priority
- Integration abstraction phrasing
- Epic grouping validation

### Mode 3: Interactive

Pre-load all 11 docs. Walk through each extraction step with the user for review and approval. Present persona abstraction, exclusion filter results, draft business rules, and epic groupings individually.

---

## Document Mapping

### epics.md Sources

```
functional-specification.md
  +-- Functional Requirements  -> Epic grouping (domain-based)
  +-- User Stories             -> Abstracted stories with [User]/[Admin]/[System]
  +-- Acceptance Criteria      -> Preserved (tech-neutral criteria only)
  +-- Business Rules           -> Cross-referenced to component-spec.md (BR-*)

business-context.md
  +-- Target Users & Personas  -> Persona abstraction input
  +-- Business Goals           -> Epic priority ordering
  +-- Product Vision           -> Epic context/rationale

integration-points.md
  +-- External Services        -> Abstracted integration stories
  +-- Data Flow Diagrams       -> Interaction pattern references
```

### component-spec.md Sources

```
functional-specification.md
  +-- Business Rules           -> BR-CALC-*, BR-VAL-*, BR-DEC-*, BR-STATE-*
  +-- Non-Functional Reqs      -> Accessibility, Performance (functional only)
  +-- System Boundaries        -> Data contract boundaries

data-architecture.md
  +-- Data Models              -> DC-IN-*, DC-OUT-*, DC-STATE-*
  +-- API Contracts            -> Abstracted data contracts
  +-- Domain Model             -> State machine definitions

business-context.md
  +-- Business Constraints     -> Constraint rules in business rules section
  +-- Personas                 -> Persona definitions with abstract mapping

integration-points.md
  +-- External Services        -> Abstracted external data providers
  +-- Data Flow Diagrams       -> Interaction patterns (FLOW-*)

visual-design-system.md
  +-- User Flows               -> FLOW-* interaction patterns
  +-- Accessibility Standards  -> Accessibility requirements (functional)
  +-- Responsive Breakpoints   -> Responsive behavior requirements
```

---

## Process

### Step 0: Verify Prerequisites

Run the following check:

```bash
PROJECT_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)
DOCS_DIR="$PROJECT_ROOT/docs/reverse-engineering"
REQUIRED_DOCS=("functional-specification.md" "integration-points.md" "configuration-reference.md" "data-architecture.md" "operations-guide.md" "technical-debt-analysis.md" "observability-requirements.md" "visual-design-system.md" "test-documentation.md" "business-context.md" "decision-rationale.md")

MISSING=0
MISSING_NAMES=()
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$DOCS_DIR/$doc" ]; then
    MISSING_NAMES+=("$doc")
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo "MISSING $MISSING docs: ${MISSING_NAMES[*]}"
  exit 1
fi

echo "All 11 reverse-engineering docs found. Ready for portable extraction."
```

**Error recovery:**
- If ALL docs missing: halt and tell the user to run `/stackshift.reverse-engineer` first.
- If only `business-context.md` and/or `decision-rationale.md` missing (legacy 9-doc run): log `[REDUCED COVERAGE]` warning and proceed. See "Legacy 9-Doc Handling" below.
- If any other doc is missing: halt and tell the user which docs are missing. Do not proceed with partial core docs.

#### Legacy 9-Doc Handling

Older Gear 2 runs produced 9 docs (missing `business-context.md` and `decision-rationale.md`). When these are missing, apply these reduced-coverage rules throughout the pipeline:

- **Persona extraction**: Source personas from `functional-specification.md` user stories only. Skip business-context.md persona scan.
- **Epic priority ordering**: Default all epics to P1 (no business goal data available for priority differentiation).
- **Business constraints**: Omit the business constraints sub-section in component-spec.md. Add a note: `[REDUCED COVERAGE - business-context.md unavailable]`.
- **Decision rationale**: Omit decision rationale references. This does not affect core extraction.

Log at start: `"[REDUCED COVERAGE] Proceeding with 9 docs. business-context.md and/or decision-rationale.md missing. Persona sources, epic priorities, and business constraints will have reduced coverage."`

### Step 1: Load All Reverse-Engineering Docs

Read all available docs from `docs/reverse-engineering/` into memory. Parse each for structured content:
- Extract all FRs, NFRs, user stories, personas
- Extract all business rules, validation rules, calculation formulas
- Extract all data models and API contracts (for data contract abstraction)
- Extract all integration points (for abstraction)
- Note all `[INFERRED]` and `[NEEDS USER INPUT]` markers

**Error recovery:** If any individual doc fails to read, log a warning with the filename and continue with remaining docs. Track which docs were skipped and note affected coverage areas in the final portability report.

Log: `"Loaded N/11 docs. Extracted M FRs, K personas, J integration points."`

### Step 2: Choose Mode

Ask the user which mode to use:

```
How should portable component specs be generated?

A) YOLO - Fully automatic, no questions asked (~10 min)
B) Guided - Auto-fill + 3-7 targeted questions (~15-20 min) (Recommended)
C) Interactive - Step-by-step review (~20-25 min)
```

If running in batch context with `extraction_mode` pre-set, skip this prompt and use the specified mode.

### Step 3: Abstract Personas

Follow the process in `operations/abstract-personas.md`, applying the current mode (YOLO/Guided/Interactive as selected in Step 2):

1. Extract all source personas from business-context.md and functional-specification.md
2. Classify each into `[User]`, `[Admin]`, or `[System]`
3. In Guided/Interactive mode: present mapping for confirmation
4. In YOLO mode: apply most-restrictive classification and mark uncertain items `[AUTO-RESOLVED]`

**Error recovery:** If zero personas are extracted, halt and report: `"No personas found in source docs. Verify functional-specification.md contains user stories with persona references."` Do not proceed with empty persona mapping.

Log: `"Mapped N source personas to abstract roles: X [User], Y [Admin], Z [System]."`

### Step 4: Extract Business Rules & Data Contracts

Follow the process in `operations/extract-business-rules.md`, applying the current mode (YOLO/Guided/Interactive as selected in Step 2):

1. Extract and categorize all business rules (BR-CALC, BR-VAL, BR-DEC, BR-STATE)
2. Extract data contracts (DC-IN, DC-OUT, DC-STATE)
3. Extract edge cases (EC-*) and error states (ERR-*)
4. Extract interaction patterns (FLOW-*)
5. Strip all tech-specific references (replace with abstract equivalents)

**Error recovery:** If zero business rules are found, log a warning and generate component-spec.md with empty business rules section and a note: `"[WARNING] No business rules extracted. Review functional-specification.md for missing business logic documentation."` Continue to Step 5.

Log: `"Extracted N business rules, M data contracts, K edge cases, J interaction patterns."`

### Step 5: Generate Portable Epics

Follow the process in `operations/generate-portable-epics.md`, applying the current mode (YOLO/Guided/Interactive as selected in Step 2):

1. Inventory all source FRs
2. Apply exclusion filter (5 categories)
3. Abstract integration stories
4. Apply persona abstraction from Step 3
5. Group into domain-based epics
6. Add cross-references to component-spec.md business rules
7. Quality check: no tech names, no source personas, no API endpoints

**Error recovery:** If the exclusion filter removes ALL FRs, halt and report: `"All N FRs were excluded by the filter. Review exclusion categories -- the source may contain only infrastructure stories with no portable business logic."` Do not write empty artifacts.

Log: `"Generated N epics with M stories from K source FRs. Excluded J stories (tech setup: A, CI/CD: B, tech debt: C, test infra: D). Abstracted E integration stories."`

### Step 5.5: Validate Cross-References

Before writing output, verify consistency between the two artifacts:

1. Confirm every BR-*/DC-*/EC-*/ERR-*/FLOW-* ID referenced in epics.md exists in component-spec.md
2. Confirm all persona references in stories are abstract (`[User]`, `[Admin]`, `[System]` only)
3. Confirm no empty epics exist (each epic has at least 2 stories)
4. Confirm exclusion counts from Step 5 match the actual filtered FRs

Fix any inconsistencies found before proceeding.

### Step 6: Write Output

Create `_portable-extract/` directory and write both artifacts using the templates in `operations/output-templates.md`:

```
_portable-extract/
+-- epics.md              # BMAD-format portable epics
+-- component-spec.md     # Business rules, data contracts, edge cases
```

Each artifact includes YAML frontmatter with source tracking, persona mapping, exclusion summary, and portability score.

### Step 7: Generate Portability Report

Output a summary:

```
Portable Extraction Complete
=============================

Mode: [selected mode]
Source: [project name]

Artifacts Generated:
  epics.md          - N epics, M stories (from K source FRs)
  component-spec.md - N business rules, M data contracts, K edge cases

Persona Mapping:
  [User]   <- [source personas]
  [Admin]  <- [source personas]
  [System] <- [source personas]

Exclusion Summary:
  N stories filtered (tech setup: A, CI/CD: B, tech debt: C, test infra: D)
  M integration stories abstracted (source-specific -> generic providers)

Portability Score: N%
  Items needing review: M (marked [REVIEW] in output)

Cross-References:
  N stories reference M business rules in component-spec.md
  All BR-* IDs are consistent across both files

Coverage Notes:
  [Any REDUCED COVERAGE or WARNING notes from the pipeline]
```

---

## Success Criteria

Verify the following before reporting completion:

- Confirm all files in `_portable-extract/` exist: epics.md, component-spec.md
- Confirm epics.md contains domain-grouped epics with abstract personas only
- Confirm component-spec.md contains categorized business rules with BR-*/DC-*/EC-*/ERR-*/FLOW-* IDs
- Confirm no tech-specific names appear in output (no framework names, no API endpoints, no service names)
- Confirm all persona references use `[User]`, `[Admin]`, or `[System]`
- Confirm cross-references between epics.md stories and component-spec.md rules are consistent
- Confirm exclusion filter was applied: no tech debt, CI/CD, test infra, or platform-specific stories remain
- Confirm each artifact has YAML frontmatter with source tracking and persona mapping
- Confirm portability report shows extraction summary and score

---

## Statelessness

This skill is stateless. All work is computed in memory until Step 6 writes output. If interrupted before Step 6, re-run from Step 0. No partial state is persisted.
