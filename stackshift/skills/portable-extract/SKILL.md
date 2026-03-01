---
name: portable-extract
description: Extract tech-agnostic portable component specs from StackShift reverse-engineering docs. Generates abstract epics and component specifications that can be dropped into ANY BMAD project. Three modes - YOLO (fully automatic), Guided (ask on ambiguities), Interactive (full conversation with pre-loaded context). Bridges StackShift's deep code analysis with reusable, platform-independent component specifications.
---

# Portable Component Extraction

**Extract tech-agnostic, reusable component specs from StackShift reverse-engineering documentation.**

**Estimated Time:** 10-25 minutes (depending on mode)
**Prerequisites:** Gear 2 (Reverse Engineer) completed with all 11 docs
**Output:** 2 portable artifacts in `_portable-extract/`

---

## When to Use This Skill

Use this skill when:
- Gear 2 has generated all 11 reverse-engineering docs
- You want to extract reusable component specs that work in ANY project
- You chose `portable-extract` as the implementation framework in Gear 1
- You want to migrate business logic from one ecosystem to a completely different one
- You need abstract epics and specs that are free of source-platform specifics

**Trigger Phrases:**
- "Extract portable component specs"
- "Create tech-agnostic specs from this codebase"
- "Generate portable epics for reuse"
- "Extract business logic for cross-project migration"
- "Run portable extraction"

---

## What This Skill Does

Reads all 11 reverse-engineering docs and distills them into 2 portable artifacts:

| Portable Artifact | Primary Source Docs | Purpose |
|---|---|---|
| `epics.md` | functional-specification, business-context, integration-points | BMAD-format epics with abstract personas, no tech-specific stories |
| `component-spec.md` | functional-specification, data-architecture, business-context, integration-points, visual-design-system | Business rules, data contracts, edge cases, interaction patterns |

**What gets INCLUDED:**
- Core business logic (calculations, validations, decision trees)
- Abstract personas (`[User]`, `[Admin]`, `[System]`)
- Data contracts (inputs, outputs, state shapes)
- Edge cases and error states
- Interaction patterns and user flows
- Accessibility and performance requirements (functional, not implementation)

**What gets EXCLUDED (5 categories):**
1. **Tech Setup** - Framework config, build tooling, bundler settings, linter rules
2. **CI/CD** - Deployment pipelines, GitHub Actions, Docker configs, environments
3. **Tech Debt** - Source-platform-specific refactoring, migration items, version upgrades
4. **Source-Platform Integration** - Specific API endpoints, SDK references, service names, auth provider specifics
5. **Test Infrastructure** - Test framework config, test runners, coverage tools, fixtures

---

## Three Modes

### Mode 1: YOLO (Fully Automatic)

**Time:** ~10 minutes
**User input:** None

- Maps all 11 docs to portable artifacts automatically
- Abstracts all personas to `[User]`/`[Admin]`/`[System]` without asking
- Applies exclusion filter automatically
- Resolves ambiguities with best-effort inference
- Generates both artifacts in one shot

**Best for:** Quick extraction, batch processing, when you plan to refine later.

### Mode 2: Guided (Recommended)

**Time:** ~15-20 minutes
**User input:** 3-7 targeted questions

- Auto-populates everything the docs can answer (high confidence)
- Presents targeted questions ONLY for genuinely ambiguous items:
  - Persona mapping confirmation ("We mapped 4 source roles to [User]. Correct?")
  - Business rule priority ("These 3 rules conflict when [X]. Which takes precedence?")
  - Integration abstraction ("DealerSocket API provides inventory. Abstract as 'external inventory provider'?")
  - Epic grouping ("FRs group into [N] domains. Does this grouping make sense?")
- Generates both artifacts with user input incorporated

**Best for:** Most projects. Good balance of speed and quality.

### Mode 3: Interactive

**Time:** ~20-25 minutes
**User input:** Full conversation

- Pre-loads all 11 docs as context
- Walks through persona abstraction step by step
- Reviews exclusion filter results with you
- Shows draft business rules for approval
- Presents epic groupings for refinement
- Most thorough, but slowest

**Best for:** Critical components, when precision matters, when reuse context is nuanced.

---

## Document Mapping (Detailed)

### epics.md Generation

```
Source -> Portable Epics Sections
-------------------------------------------------------------
functional-specification.md
  +-- Functional Requirements  -> Epic grouping (domain-based)
  +-- User Stories             -> Abstracted stories with [User]/[Admin]/[System]
  +-- Acceptance Criteria      -> Preserved (tech-neutral criteria only)
  +-- Business Rules           -> Cross-referenced to component-spec.md (BR-*)

business-context.md
  +-- Target Users & Personas  -> Persona abstraction input (see operations/abstract-personas.md)
  +-- Business Goals           -> Epic priority ordering
  +-- Product Vision           -> Epic context/rationale

integration-points.md
  +-- External Services        -> Abstracted integration stories
  +-- Data Flow Diagrams       -> Interaction pattern references
```

**Exclusion filter applied:**
- No tech debt epics (from technical-debt-analysis.md)
- No CI/CD stories
- No test infrastructure stories
- No source-platform-specific integration stories
- Integration stories abstracted: "DealerSocket API" -> "external inventory data provider"

### component-spec.md Generation

```
Source -> Component Spec Sections
-------------------------------------------------------------
functional-specification.md
  +-- Business Rules           -> BR-CALC-*, BR-VAL-*, BR-DEC-*, BR-STATE-*
  +-- Non-Functional Reqs      -> Accessibility, Performance (functional only)
  +-- System Boundaries        -> Data contract boundaries

data-architecture.md
  +-- Data Models              -> DC-IN-*, DC-OUT-*, DC-STATE-* (shapes, not schemas)
  +-- API Contracts            -> Abstracted data contracts (not endpoints)
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

```bash
# Check that Gear 2 is complete
DOCS_DIR="docs/reverse-engineering"
REQUIRED_DOCS=("functional-specification.md" "integration-points.md" "configuration-reference.md" "data-architecture.md" "operations-guide.md" "technical-debt-analysis.md" "observability-requirements.md" "visual-design-system.md" "test-documentation.md" "business-context.md" "decision-rationale.md")

MISSING=0
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$DOCS_DIR/$doc" ]; then
    echo "MISSING: $doc"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo "ERROR: $MISSING docs missing. Run Gear 2 first: /stackshift.reverse-engineer"
  exit 1
fi

echo "All 11 reverse-engineering docs found. Ready for portable extraction."
```

**If docs are missing:** Guide user to run `/stackshift.reverse-engineer` first.
**If only 9 docs exist (legacy):** business-context.md and decision-rationale.md may be missing from older runs. Generate them first using the reverse-engineer skill, or proceed with reduced coverage (warn user).

### Step 1: Load All Reverse-Engineering Docs

Read all 11 docs from `docs/reverse-engineering/` into memory. Parse each for structured content:
- Extract all FRs, NFRs, user stories, personas
- Extract all business rules, validation rules, calculation formulas
- Extract all data models and API contracts (for data contract abstraction)
- Extract all integration points (for abstraction)
- Note all `[INFERRED]` and `[NEEDS USER INPUT]` markers

### Step 2: Choose Mode

Ask the user which mode to use:

```
How should portable component specs be generated?

A) YOLO - Fully automatic, no questions asked (~10 min)
   Best for: Quick extraction, batch processing, refine later

B) Guided - Auto-fill + 3-7 targeted questions (~15-20 min) (Recommended)
   Best for: Most projects, good balance of speed and quality

C) Interactive - Step-by-step review (~20-25 min)
   Best for: Critical components, maximum precision
```

### Step 3: Abstract Personas

Follow the process in `operations/abstract-personas.md`:

1. Extract all source personas from business-context.md and functional-specification.md
2. Classify each into `[User]`, `[Admin]`, or `[System]`
3. In Guided/Interactive mode: present mapping for confirmation
4. In YOLO mode: apply best-effort classification

### Step 4: Extract Business Rules & Data Contracts

Follow the process in `operations/extract-business-rules.md`:

1. Extract and categorize all business rules (BR-CALC, BR-VAL, BR-DEC, BR-STATE)
2. Extract data contracts (DC-IN, DC-OUT, DC-STATE)
3. Extract edge cases (EC-*) and error states (ERR-*)
4. Extract interaction patterns (FLOW-*)
5. Strip all tech-specific references (replace with abstract equivalents)

### Step 5: Generate Portable Epics

Follow the process in `operations/generate-portable-epics.md`:

1. Inventory all source FRs
2. Apply exclusion filter (5 categories)
3. Abstract integration stories
4. Apply persona abstraction from Step 3
5. Group into domain-based epics
6. Add cross-references to component-spec.md business rules
7. Quality check: no tech names, no source personas, no API endpoints

### Step 6: Write Output

Create `_portable-extract/` directory and write both artifacts:

```
_portable-extract/
+-- epics.md              # BMAD-format portable epics
+-- component-spec.md     # Business rules, data contracts, edge cases
```

Each artifact includes YAML frontmatter:

```yaml
---
source_project: "<from state file or directory name>"
extraction_date: "<current date>"
extraction_mode: "yolo"  # or guided, interactive
source_documents:
  - docs/reverse-engineering/functional-specification.md
  - docs/reverse-engineering/business-context.md
  # ... all source docs used
persona_mapping:
  "[User]": ["Customer", "Shopper", "Visitor"]
  "[Admin]": ["Dealer Admin", "Manager"]
  "[System]": ["Inventory Sync", "Payment Gateway"]
exclusions_applied:
  tech_setup: 3        # stories filtered
  cicd: 2              # stories filtered
  tech_debt: 5         # stories filtered
  platform_integration: 4  # stories abstracted
  test_infra: 1        # stories filtered
portability_score: 92  # percentage of content that is fully tech-agnostic
---
```

### Step 7: Generate Portability Report

Output a summary showing:

```
Portable Extraction Complete
=============================

Mode: Guided
Source: ws-payment-calculator

Artifacts Generated:
  epics.md          - 6 epics, 24 stories (from 35 source FRs)
  component-spec.md - 18 business rules, 12 data contracts, 8 edge cases

Persona Mapping:
  [User]   <- Customer, Shopper, Guest User
  [Admin]  <- Dealer Admin, Finance Manager
  [System] <- Payment Gateway, Credit Bureau API

Exclusion Summary:
  11 stories filtered (tech setup: 3, CI/CD: 2, tech debt: 5, test infra: 1)
  4 integration stories abstracted (source-specific -> generic providers)

Portability Score: 92%
  Items needing review: 2 (marked [REVIEW] in output)

Cross-References:
  24 stories reference 18 business rules in component-spec.md
  All BR-* IDs are consistent across both files

Next Steps:
  1. Copy _portable-extract/ to your target project
  2. Adapt persona definitions for new context
  3. Run BMAD workflows with portable epics as input
  4. Or use component-spec.md directly for implementation planning
```

---

## Output Format

### epics.md Structure

```markdown
---
source_project: "..."
extraction_date: "..."
extraction_mode: "guided"
persona_mapping:
  "[User]": ["...source personas..."]
  "[Admin]": ["...source personas..."]
  "[System]": ["...source personas..."]
---

# [Component Name] - Portable Epics

> These epics are tech-agnostic and can be used in any BMAD project.
> Personas use abstract roles: [User], [Admin], [System].
> Business rules reference component-spec.md by ID (BR-CALC-001, etc.).

## Persona Definitions

### [User]
Primary consumer of the component. Mapped from: [source personas].
**Core needs:** [list]

### [Admin]
Configurer and manager. Mapped from: [source personas].
**Core needs:** [list]

### [System]
Automated processes and external integrations. Mapped from: [source personas].
**Core needs:** [list]

---

## Epic 1: [Domain Name]

**Priority:** P0
**Business Goal:** [from business-context.md]

### Story 1.1: [Title]
**As a** [User], **I want** [capability], **so that** [business value].

**Acceptance Criteria:**
- [ ] [Criterion referencing BR-CALC-001]
- [ ] [Criterion referencing BR-VAL-003]

**Business Rules:** BR-CALC-001, BR-VAL-003
**Data Contracts:** DC-IN-001, DC-OUT-002

### Story 1.2: [Title]
...

---

## Epic 2: [Domain Name]
...
```

### component-spec.md Structure

```markdown
---
source_project: "..."
extraction_date: "..."
extraction_mode: "guided"
---

# [Component Name] - Component Specification

> Tech-agnostic specification of business rules, data contracts, and behavior.
> Can be implemented in any technology stack.

## Business Rules

### Calculations

#### BR-CALC-001: [Rule Name]
**Description:** [What this calculates]
**Formula:** [Mathematical formula, not code]
**Inputs:** DC-IN-001 (field1, field2)
**Output:** DC-OUT-001 (result_field)
**Edge Cases:** EC-001, EC-002
**Example:**
  - Input: { field1: 100, field2: 0.05 } -> Output: { result: 105 }

#### BR-CALC-002: [Rule Name]
...

### Validations

#### BR-VAL-001: [Rule Name]
**Description:** [What this validates]
**Constraint:** [Rule in plain language]
**Error:** ERR-001

#### BR-VAL-002: [Rule Name]
...

### Decision Trees

#### BR-DEC-001: [Decision Name]
**Description:** [What decision this makes]
**Logic:**
  - IF [condition1] THEN [outcome1]
  - ELSE IF [condition2] THEN [outcome2]
  - ELSE [default outcome]

### State Machines

#### BR-STATE-001: [State Machine Name]
**States:** [list]
**Transitions:**
  - [State A] -> [State B]: when [trigger]
  - [State B] -> [State C]: when [trigger]
**Initial State:** [state]
**Terminal States:** [states]

---

## Data Contracts

### Inputs

#### DC-IN-001: [Contract Name]
**Description:** [What data this represents]
**Shape:**
  - field1: number (required) - [description]
  - field2: string (optional) - [description]
  - field3: enum [A, B, C] (required) - [description]
**Constraints:** field1 > 0, field2 max 255 chars

### Outputs

#### DC-OUT-001: [Contract Name]
**Description:** [What this produces]
**Shape:**
  - result: number - [description]
  - status: enum [success, error] - [description]

### State

#### DC-STATE-001: [State Name]
**Description:** [What state this represents]
**Shape:**
  - current_step: enum [step1, step2, step3]
  - accumulated_value: number
  - selections: list of [DC-IN-001]

---

## Edge Cases

#### EC-001: [Edge Case Name]
**Trigger:** [What causes this edge case]
**Expected Behavior:** [What should happen]
**Related Rules:** BR-CALC-001, BR-VAL-002

#### EC-002: [Edge Case Name]
...

---

## Error States

#### ERR-001: [Error Name]
**Trigger:** BR-VAL-001 fails
**User-Facing Message:** [Abstract message, not UI copy]
**Recovery:** [How to recover]

#### ERR-002: [Error Name]
...

---

## Interaction Patterns

#### FLOW-001: [Flow Name]
**Description:** [What this flow accomplishes]
**Steps:**
  1. [User] provides DC-IN-001
  2. System validates (BR-VAL-001, BR-VAL-002)
  3. System calculates (BR-CALC-001)
  4. System returns DC-OUT-001
  5. [User] reviews result
**Error Path:** If step 2 fails -> ERR-001 -> return to step 1

#### FLOW-002: [Flow Name]
...

---

## Accessibility Requirements

- [Functional accessibility requirement, not implementation detail]
- [e.g., "All interactive elements must be keyboard-navigable"]
- [e.g., "Error messages must be associated with their input fields"]
- [e.g., "Loading states must be announced to screen readers"]

## Performance Requirements

- [Functional performance requirement, not infrastructure detail]
- [e.g., "Calculation results must appear within 200ms of input change"]
- [e.g., "Form submission must complete within 2 seconds"]

## Localization Requirements

- [e.g., "Currency formatting must respect locale settings"]
- [e.g., "Date display must support multiple formats"]
- [e.g., "Number separators must be locale-aware"]
```

---

## Integration with Existing Workflows

### From Spec Kit -> Portable Extract

If you already ran Gears 1-5 with Spec Kit and want portable specs too:
1. The reverse-engineering docs are already generated
2. Run `/stackshift.portable-extract` directly
3. Portable artifacts supplement (don't replace) `.specify/` structure

### From Portable Extract -> Target Project

After generating portable artifacts:
1. Copy `_portable-extract/` to your target project
2. Adapt persona definitions for new context (e.g., [User] -> "Homebuyer" in real estate)
3. Review and customize business rules for new domain constraints
4. Use as input for BMAD workflows, Spec Kit specs, or direct implementation

### Batch Mode Integration

When running batch processing (`/stackshift.batch`):
- Batch session can include `extraction_mode: "yolo"` in answers
- Each repo gets portable specs generated automatically after Gear 2
- Useful for extracting reusable components across many services

---

## Success Criteria

- All files in `_portable-extract/` generated: epics.md, component-spec.md
- epics.md contains domain-grouped epics with abstract personas only
- component-spec.md contains categorized business rules with BR-*/DC-*/EC-*/ERR-*/FLOW-* IDs
- No tech-specific names in output (no framework names, no API endpoints, no service names)
- All persona references use [User], [Admin], or [System]
- Cross-references between epics.md stories and component-spec.md rules are consistent
- Exclusion filter applied: no tech debt, CI/CD, test infra, or platform-specific stories
- Each artifact has YAML frontmatter with source tracking and persona mapping
- Portability report shows extraction summary and score

---

## Next Steps

After Portable Extraction:

1. **Review artifacts** in `_portable-extract/`
2. **Copy to target project** and adapt persona definitions
3. **Use with BMAD**: Feed epics.md into BMAD's `*create-epics-stories` or `*workflow-init`
4. **Use with Spec Kit**: Convert component-spec.md into `.specify/` feature specs
5. **Use directly**: Artifacts are self-contained and can guide implementation in any stack

---

## Technical Notes

- Read all 11 docs using the Read tool (parallel reads recommended)
- Persona abstraction uses the process in operations/abstract-personas.md
- Business rule extraction uses the process in operations/extract-business-rules.md
- Epic generation uses the process in operations/generate-portable-epics.md
- BR/DC/EC/ERR/FLOW IDs must be unique and consistent across both output files
- Exclusion filter is applied BEFORE epic grouping to avoid empty epics
