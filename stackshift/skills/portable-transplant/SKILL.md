---
name: portable-transplant
description: Translate portable component specs into targeted epics for a specific project. Reads _portable-extract/ specs and a target project's BMAD docs (PRD, Architecture, optionally UX), then generates BMAD-format epics written in the target's personas, domain language, and architecture patterns. The bridge between "extracted business logic" and "ready-to-implement stories."
---

# Portable Transplant

**Translate portable component specs into targeted epics for a specific project.**

**Estimated Time:** 5-20 minutes (depending on mode)
**Prerequisites:** Portable extract completed (`_portable-extract/`), target project has BMAD docs (PRD + Architecture minimum)
**Output:** Targeted epics + transplant report in `_portable-transplant/`

---

## When to Use This Skill

Use this skill when:
- You've run `/stackshift.portable-extract` on a source codebase
- You have a TARGET project with BMAD docs (PRD, Architecture, optionally UX Design)
- You want to import business logic from the source into the target's context
- You want epics written in the target's personas, domain language, and tech patterns
- You're migrating functionality across ecosystems (car dealership -> real estate, etc.)

**Trigger Phrases:**
- "Transplant these portable specs into my target project"
- "Apply the payment calculator logic to the real estate app"
- "Translate these extracted specs for my Next.js project"
- "Import portable business logic into this BMAD project"
- "Write epics for my target project using the extracted specs"

---

## What This Skill Does

```
Source (already done)              Transplant (this skill)           Target Project
┌──────────────────┐              ┌──────────────────────┐          ┌──────────────┐
│ _portable-extract│              │ Read portable specs   │          │ PRD          │
│   epics.md       │──────┐      │ Read target BMAD docs │          │ Architecture │
│   component-spec │      ├─────→│ Map personas          │──────────│ UX Design    │
│                  │      │      │ Map domain language   │          │              │
└──────────────────┘      │      │ Map data contracts    │          └──────┬───────┘
                          │      │ Generate targeted     │                 │
                          │      │   epics + stories     │                 │
                          │      └──────────┬───────────┘                 │
                          │                 │                              │
                          │                 ▼                              │
                          │      ┌──────────────────────┐                 │
                          │      │ _portable-transplant/ │◄────────────────┘
                          │      │  targeted-epics.md    │ Written in target's
                          │      │  transplant-report.md │ personas, domain
                          └─────→│                       │ language, and
                                 └──────────────────────┘ architecture
```

1. **Reads** portable extract files (epics.md + component-spec.md)
2. **Reads** target project's BMAD docs (PRD + Architecture, optionally UX)
3. **Maps** abstract personas to target personas
4. **Maps** abstract data contracts to target data models
5. **Translates** domain language (source terms -> target terms)
6. **Generates** BMAD-format epics written for the target project
7. **Reports** what was mapped, adapted, and what needs review

---

## Input Requirements

### Portable Extract (Source)

The `_portable-extract/` directory from a previous `/stackshift.portable-extract` run:

| File | Required | Contains |
|------|----------|----------|
| `epics.md` | Yes | Abstract epics with [User]/[Admin]/[System] personas |
| `component-spec.md` | Yes | Business rules (BR-*), data contracts (DC-*), edge cases (EC-*), flows (FLOW-*) |

**Location options:**
- Current directory: `./_portable-extract/`
- Explicit path: `~/git/source-project/_portable-extract/`
- From batch results: `~/git/batch-results/service-name/_portable-extract/`

### Target BMAD Docs

The target project's planning artifacts:

| File | Required | Provides |
|------|----------|----------|
| PRD (prd.md) | Yes | Target personas, business goals, domain language, requirements context |
| Architecture (architecture.md) | Yes | Target tech stack, data models, API patterns, integration architecture |
| UX Design (ux-design-specification.md) | No | Target design system, user flows, interaction patterns |

**Location options:**
- BMAD output: `_bmad-output/planning-artifacts/`
- BMAD project: `docs/` or project root
- Explicit path specified by user

---

## Three Modes

### Mode 1: YOLO (Fully Automatic)

**Time:** ~5 minutes
**User input:** None

- Auto-maps all personas by role similarity
- Auto-translates domain language using context clues from target PRD
- Auto-maps data contracts to closest target models
- Generates targeted epics in one shot
- Marks uncertain mappings with `[AUTO-MAPPED - review recommended]`

**Best for:** Quick translation, batch processing, when you plan to refine.

### Mode 2: Guided (Recommended)

**Time:** ~10-15 minutes
**User input:** 3-8 targeted questions

- Auto-maps high-confidence items
- Presents mapping questions for ambiguous items:
  - "Source [User] maps to which target persona? (a) Homebuyer (b) Property Investor (c) Both"
  - "Source 'vehicle price' maps to target 'property value' -- correct?"
  - "Source DC-IN-001 (loan parameters) maps to target's MortgageApplication model?"
  - "Domain term 'inventory' -> 'listings' or 'properties' in target?"
- Generates targeted epics with user input incorporated

**Best for:** Most projects. Good balance of speed and accuracy.

### Mode 3: Interactive

**Time:** ~15-20 minutes
**User input:** Full conversation

- Walks through persona mapping step by step
- Reviews each domain term translation
- Shows data contract mapping for approval
- Presents each epic for review before finalizing
- Most thorough, but slowest

**Best for:** Critical projects, when the domain gap is large, when precision matters.

---

## Process

### Step 0: Locate and Verify Inputs

```
Locate portable extract:
1. Check current directory for _portable-extract/
2. If not found, ask user for path
3. Verify epics.md and component-spec.md exist

Locate target BMAD docs:
1. Check _bmad-output/planning-artifacts/ for prd.md + architecture.md
2. Check docs/ for BMAD artifacts
3. If not found, ask user for path
4. Verify PRD + Architecture exist (UX optional)
```

**If portable extract is missing:** Guide user to run `/stackshift.portable-extract` on the source project first.
**If target BMAD docs are missing:** Guide user to create them via BMAD workflows or `/stackshift.bmad-synthesize`.

### Step 1: Load and Parse All Inputs

**From portable extract, load:**
- All abstract personas with their mappings
- All business rules (BR-CALC, BR-VAL, BR-DEC, BR-STATE)
- All data contracts (DC-IN, DC-OUT, DC-STATE)
- All edge cases (EC-*) and error states (ERR-*)
- All interaction patterns (FLOW-*)
- All epic groupings and story definitions

**From target BMAD docs, load:**
- **PRD:** Personas (names, roles, goals), business vision, success criteria, domain terminology, FRs/NFRs
- **Architecture:** Tech stack, data models, API contracts, integration patterns, domain model
- **UX Design (if available):** Design system, user flows, interaction patterns

### Step 2: Map Personas

Follow the process in `operations/map-to-target.md` (Persona Mapping section):

1. Extract all personas from target PRD
2. Match abstract roles to target personas:
   - `[User]` -> Which target persona(s) are primary consumers?
   - `[Admin]` -> Which target persona(s) are configurers/managers?
   - `[System]` -> Which target actors are automated/API?
3. Handle many-to-many mappings (one abstract role -> multiple target personas)
4. In Guided mode: present mapping for confirmation
5. In YOLO mode: auto-map by role description similarity

### Step 3: Map Domain Language

Follow the process in `operations/map-to-target.md` (Domain Language section):

1. Build a glossary from the target PRD's terminology
2. Identify source domain terms in portable specs
3. Create translation table:
   ```
   Source Term          -> Target Term
   "vehicle"           -> "property"
   "dealer"            -> "agent" or "broker"
   "inventory"         -> "listings"
   "VIN"               -> "MLS number"
   "test drive"        -> "property tour"
   "monthly payment"   -> "mortgage payment"
   ```
4. In Guided mode: present uncertain translations for confirmation
5. Apply translations to all stories, acceptance criteria, and business rule descriptions

### Step 4: Map Data Contracts

Follow the process in `operations/map-to-target.md` (Data Contract section):

1. Read target architecture's data models
2. Match portable DC-IN/DC-OUT/DC-STATE to target models:
   - Match by semantic similarity (not field names)
   - DC-IN-001 (loan_parameters) -> target's MortgageApplication model
   - DC-OUT-001 (payment_result) -> target's PaymentEstimate model
3. Identify gaps:
   - Fields in portable spec not in target model (needs adding)
   - Target model fields not in portable spec (already handled)
4. Generate adapter notes for any structural mismatches

### Step 5: Generate Targeted Epics

Follow the process in `operations/generate-targeted-epics.md`:

1. Take each abstract epic and story from portable extract
2. Apply persona mapping (replace [User] with target persona name)
3. Apply domain language translation
4. Apply data contract mapping (reference target model names)
5. Preserve business rule references (BR-* IDs stay the same)
6. Add target architecture context to acceptance criteria
7. Format as BMAD create-epics-stories output

### Step 6: Write Output

Create `_portable-transplant/` directory and write:

```
_portable-transplant/
├── targeted-epics.md       # BMAD-format epics for the target project
└── transplant-report.md    # Mapping details and adaptation notes
```

### Step 7: Generate Transplant Report

```
Portable Transplant Complete
==============================

Source: ws-payment-calculator (car dealership)
Target: homequest-app (real estate platform)
Mode: Guided

Persona Mapping:
  [User]   -> Homebuyer (from target PRD)
  [Admin]  -> Property Manager (from target PRD)
  [System] -> MLS Data Feed, Mortgage API (from target Architecture)

Domain Language (12 terms translated):
  vehicle -> property, dealer -> agent, VIN -> MLS number,
  inventory -> listings, monthly payment -> mortgage payment, ...

Data Contract Mapping:
  DC-IN-001 (loan_parameters) -> MortgageApplication model
  DC-OUT-001 (payment_result) -> PaymentEstimate model
  DC-STATE-001 (calculator_state) -> CalculatorSession model
  Gap: 2 fields need adding to target model (see report)

Epics Generated:
  6 epics, 24 stories (translated from portable extract)
  All BR-* references preserved
  All FLOW-* patterns adapted for target context

Items Needing Review: 3
  - Story 2.3: "property tour scheduling" - no direct source equivalent, inferred
  - BR-DEC-001: Decision logic may need target-specific thresholds
  - DC-IN-001: "property_type" field not in source, added from target PRD

Next Steps:
  1. Review targeted-epics.md
  2. Feed into BMAD: use as input for *create-epics-stories or *create-story
  3. Or use directly for implementation planning
  4. Resolve items marked [REVIEW] in the epics
```

---

## Output Format

### targeted-epics.md Structure

```markdown
---
source_project: "ws-payment-calculator"
target_project: "homequest-app"
transplant_date: "<current date>"
transplant_mode: "guided"
source_portable_extract: "/path/to/_portable-extract/"
target_bmad_docs: "/path/to/target/prd.md, architecture.md"
persona_mapping:
  "[User]": "Homebuyer"
  "[Admin]": "Property Manager"
  "[System]": ["MLS Data Feed", "Mortgage API"]
domain_translations: 12
data_contract_mappings: 6
---

# [Target Project Name] - Imported Epics from [Source Component]

> These epics were transplanted from [source] portable specs into [target] context.
> Business rules reference the original component-spec.md by ID (BR-CALC-001, etc.).
> Domain language and personas have been translated to match this project.

## Imported Persona Context

### Homebuyer (mapped from [User])
Primary consumer. Uses payment calculation features to evaluate affordability.
**Original source roles:** Car Shopper, Guest Visitor

### Property Manager (mapped from [Admin])
Configures calculation parameters, manages listing display settings.
**Original source roles:** Dealer Admin, Finance Manager

### MLS Data Feed (mapped from [System])
Automated property data synchronization from external listing service.
**Original source roles:** DealerSocket Inventory Sync

---

## Epic 1: Mortgage Payment Calculation

**Priority:** P0
**Business Goal:** Enable homebuyers to evaluate property affordability
**Source Epic:** Payment Calculation Engine (portable-extract)

### Story 1.1: Calculate Monthly Mortgage Payment
**As a** Homebuyer, **I want** to calculate my estimated monthly mortgage payment
using the property price and my down payment,
**so that** I can evaluate whether a property fits my budget.

**Acceptance Criteria:**
- [ ] Monthly payment calculated using BR-CALC-001 (adapted for mortgage rates)
- [ ] Down payment validated per BR-VAL-003
- [ ] Interest rate determined by BR-DEC-001 (mortgage rate tiers)
- [ ] Result displayed per DC-OUT-001 shape (mapped to PaymentEstimate model)

**Business Rules:** BR-CALC-001, BR-VAL-003, BR-DEC-001
**Data Contracts:** DC-IN-001 -> MortgageApplication, DC-OUT-001 -> PaymentEstimate
**Edge Cases:** EC-001 (zero down payment), EC-003 (maximum term)
**Flows:** FLOW-001 (mortgage calculation flow)

### Story 1.2: ...
```

### transplant-report.md Structure

```markdown
---
transplant_date: "<current date>"
source_project: "ws-payment-calculator"
target_project: "homequest-app"
---

# Transplant Report

## Persona Mapping Detail

| Abstract | Target | Confidence | Notes |
|----------|--------|------------|-------|
| [User] | Homebuyer | High | Both are primary consumers evaluating pricing |
| [Admin] | Property Manager | Medium | Source had finance-specific admin tasks |
| [System] | MLS Data Feed | High | Both sync external inventory/listing data |
| [System] | Mortgage API | High | Maps to source payment gateway |

## Domain Language Translations

| Source Term | Target Term | Confidence | Context |
|-------------|-------------|------------|---------|
| vehicle | property | High | Primary entity |
| dealer | agent | Medium | Could also be "broker" |
| VIN | MLS number | High | Unique identifier |
| inventory | listings | High | Available items |
| monthly payment | mortgage payment | High | Core calculation |
| down payment | down payment | High | Same term |
| trade-in value | (no equivalent) | N/A | Excluded from target |
| test drive | property tour | Medium | Exploration activity |

## Data Contract Mapping

### DC-IN-001: Loan Parameters -> MortgageApplication
| Portable Field | Target Field | Status |
|---------------|-------------|--------|
| principal | property_price | Mapped |
| down_payment | down_payment_amount | Mapped |
| annual_rate | interest_rate | Mapped |
| term_months | loan_term_months | Mapped |
| (none) | property_type | Gap - added from target |

### DC-OUT-001: Payment Result -> PaymentEstimate
| Portable Field | Target Field | Status |
|---------------|-------------|--------|
| monthly_payment | monthly_payment | Direct |
| total_interest | total_interest_paid | Mapped |
| total_cost | total_loan_cost | Mapped |

## Business Rule Adaptations

| Rule | Adaptation | Notes |
|------|-----------|-------|
| BR-CALC-001 | Formula unchanged | Same math, different field names |
| BR-VAL-003 | Range adjusted | Source: 0-100% down, Target: 3.5-100% (FHA minimum) |
| BR-DEC-001 | Thresholds updated | Mortgage rate tiers differ from auto loan tiers |

## Items Requiring Review

1. **BR-DEC-001 thresholds** - Auto loan rate tiers don't map directly to mortgage tiers. Target project needs to define its own rate decision logic.
2. **DC-IN-001 property_type** - Target model includes property_type (condo, single-family, etc.) which affects rates. Not present in source. New BR-DEC rule may be needed.
3. **FLOW-001 step 3** - Source had "trade-in value" step. Excluded in target. Flow simplified.
```

---

## Multi-Source Transplant

You can transplant from MULTIPLE portable extracts into a single target:

```
Source A: Payment Calculator     ──┐
Source B: Inventory Search       ──┼──→ Target: homequest-app
Source C: Lead Management        ──┘
```

**Process:**
1. Run transplant for each source separately
2. Each generates its own `_portable-transplant/source-name/` subdirectory
3. Review for conflicts between imported epics
4. Merge into unified epic set for the target

**Or in batch mode:**
```bash
# Transplant multiple portable extracts into one target
/stackshift.portable-transplant
  --sources ~/git/payment-calc/_portable-extract/,~/git/inventory/_portable-extract/
  --target ~/git/homequest-app/_bmad-output/planning-artifacts/
```

---

## Integration with BMAD Workflows

### Feeding into create-epics-stories

The targeted-epics.md is formatted for BMAD's epic/story structure. To use:

1. Copy `_portable-transplant/targeted-epics.md` to your target project
2. Run BMAD's `*create-epics-stories` workflow
3. Tell the BMAD agent: "I have imported epics from a portable transplant. Please review and incorporate them into the project's epic structure."
4. BMAD will validate against the PRD and architecture, then finalize

### Feeding into create-story

For individual stories:
1. Reference specific stories from targeted-epics.md
2. Run `*create-story` for each
3. BMAD will expand the story with implementation details for the target stack

### After Transplant

The business rules in component-spec.md remain the **source of truth** for logic. The targeted epics reference them by ID. When implementing, developers should:
1. Read the story in targeted-epics.md (target language)
2. Read the business rule in component-spec.md (precise logic)
3. Implement using the target's architecture patterns

---

## Batch Mode

When running batch transplants:
- Extract 50 repos with `/stackshift.batch` + portable-extract
- Then transplant all 50 into a single target project
- Or transplant selectively (only the components you need)

**Batch session configuration:**
```json
{
  "answers": {
    "implementation_framework": "portable-extract",
    "also_transplant": true,
    "transplant_target": "~/git/target-project/_bmad-output/planning-artifacts/",
    "transplant_mode": "yolo"
  }
}
```

---

## Success Criteria

- targeted-epics.md generated in `_portable-transplant/`
- All abstract personas mapped to target personas
- Domain language translated (no source-specific terms in output)
- Data contracts mapped to target models (gaps identified)
- Business rule references preserved (BR-* IDs intact)
- transplant-report.md shows complete mapping detail
- Output is valid BMAD epic/story format
- No source project names or source-specific terms in targeted epics

---

## Technical Notes

- Read portable extract files and target BMAD docs using Read tool (parallel recommended)
- Persona mapping uses semantic similarity between role descriptions
- Domain language translation uses context from target PRD terminology
- Data contract mapping matches by semantic purpose, not field names
- Business rule formulas are preserved unchanged; only descriptions and field references are translated
- Edge cases and error states are translated with domain language but logic is preserved
- Multi-source transplant creates subdirectories per source to avoid conflicts
