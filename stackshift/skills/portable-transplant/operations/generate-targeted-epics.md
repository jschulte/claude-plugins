# Generate Targeted Epics

Detailed instructions for generating BMAD-format epics written in the target project's personas, domain language, and architecture patterns.

---

## Overview

Takes the mapping object from `map-to-target.md` and the portable extract's epics/component-spec, then generates targeted epics that read as if they were written natively for the target project.

**Input:**
- Portable extract (epics.md + component-spec.md)
- Combined mapping object (personas, domain language, data contracts)
- Target BMAD docs (for additional context)

**Output:**
- `_portable-transplant/targeted-epics.md`
- `_portable-transplant/transplant-report.md`

---

## Step 1: Transform Stories

For each story in the portable extract's epics.md:

### 1a: Replace Personas

Apply persona mapping to all "As a [persona]" clauses:

```
BEFORE: As a [User], I want to calculate my monthly payment
AFTER:  As a Homebuyer, I want to calculate my mortgage payment
```

**Rules:**
- Replace `[User]` with the mapped target persona name
- Replace `[Admin]` with the mapped target admin persona
- Replace `[System]` with the specific mapped system actor
- If one-to-many mapping: generate SEPARATE stories for each target persona
- Adjust story wording to reflect the target persona's perspective

**One-to-many example:**
```
Source: As a [User], I want to search available items

Target (split into two):
  Story 3.1: As a Homebuyer, I want to search property listings
             so that I can find homes within my budget
  Story 3.2: As a Property Investor, I want to search property listings
             so that I can identify investment opportunities
```

### 1b: Translate Domain Language

Apply domain language translations to:
- Story title
- Story description (the "I want" and "so that" clauses)
- Acceptance criteria text
- Any free-text descriptions

```
BEFORE: As a [User], I want to search vehicle inventory by make and model
        so that I can find cars that match my preferences

AFTER:  As a Homebuyer, I want to search property listings by location and type
        so that I can find homes that match my requirements
```

**Rules:**
- Replace all source domain terms with target equivalents
- Adjust sentence structure if translation changes meaning
- Preserve the INTENT of the story (same business value)
- If a term is excluded (no target equivalent), rephrase to omit it
- If a term is flagged for review, mark with `[REVIEW: original term was "X"]`

### 1c: Update Data Contract References

Replace portable data contract references with target model references:

```
BEFORE: Input validated per DC-IN-001 shape
AFTER:  Input validated per DC-IN-001 (mapped to MortgageApplication model)
```

**In acceptance criteria:**
```
BEFORE: - [ ] Result displayed per DC-OUT-001 shape
AFTER:  - [ ] Result displayed per DC-OUT-001 (PaymentEstimate model)
```

### 1d: Preserve Business Rule References

Business rule IDs (BR-*) stay UNCHANGED. They reference the original component-spec.md which contains the precise logic. The targeted epics add target context around the rules:

```
BEFORE: Monthly payment calculated using BR-CALC-001
AFTER:  Monthly mortgage payment calculated using BR-CALC-001
        (formula unchanged; field names mapped per data contract)
```

### 1e: Update Edge Case and Flow References

Edge cases (EC-*) and flows (FLOW-*) keep their IDs but get domain-translated descriptions:

```
BEFORE: Edge Cases: EC-001 (zero down payment)
AFTER:  Edge Cases: EC-001 (zero down payment - minimum 3.5% for FHA loans)
```

---

## Step 2: Transform Epics

### 2a: Rename Epics for Target Domain

Epic names should reflect the target domain:

```
BEFORE: Epic 1: Payment Calculation Engine
AFTER:  Epic 1: Mortgage Payment Calculator

BEFORE: Epic 2: Inventory Search & Discovery
AFTER:  Epic 2: Property Listing Search

BEFORE: Epic 3: Lead Management
AFTER:  Epic 3: Buyer Inquiry Management
```

### 2b: Update Business Goals

Replace source business goals with target equivalents:

```
BEFORE: Business Goal: Help shoppers evaluate vehicle affordability
AFTER:  Business Goal: Enable homebuyers to assess property affordability
        (aligned with target PRD goal: "Empower buyers with financial clarity")
```

Reference the target PRD's business goals where possible.

### 2c: Re-prioritize if Needed

The portable extract's priorities (P0/P1/P2) were set in the source context. In the target context, priorities may differ:

**Default:** Keep source priorities (they reflect business importance of the logic).

**Override if:** Target PRD has explicit priority guidance that conflicts. Note the change:
```
Priority: P1 (was P0 in source; target PRD priorities authentication over payments)
```

---

## Step 3: Add Target Architecture Context

For each epic, add a brief note about how it fits the target architecture:

```
## Epic 1: Mortgage Payment Calculator

**Priority:** P0
**Business Goal:** Enable homebuyers to assess property affordability
**Target Architecture Notes:**
- Implements as: React component consuming /api/mortgage/calculate endpoint
- Data layer: MortgageApplication and PaymentEstimate models
- Integration: Mortgage Rate API for live rate data
- Source component: Payment Calculation Engine (ws-payment-calculator)
```

This context comes from reading the target Architecture document.

---

## Step 4: Handle Excluded Content

Some portable extract content may not apply to the target:

### Stories with Excluded Domain Concepts

If a story relies on a domain concept that was excluded in translation:

```
Source story: "As a [User], I want to enter my trade-in vehicle value
              to reduce my monthly payment"

Target: trade-in has no equivalent in real estate

Resolution: EXCLUDE story entirely. Note in transplant report:
  "Story 2.4 excluded: trade-in concept has no real estate equivalent"
```

### Business Rules with Target-Specific Overrides

If a business rule needs target-specific values:

```
BR-VAL-003: Down payment minimum
  Source: 0% minimum (some dealers offer zero-down)
  Target: 3.5% minimum (FHA loan requirement)

Resolution: Note the override in targeted epic:
  "- [ ] Down payment validated per BR-VAL-003
         [TARGET OVERRIDE: minimum 3.5% per FHA requirement, not 0%]"
```

### Data Contracts with Gaps

If the target model has fields not in the source:

```
DC-IN-001 gap: property_type field
  Source didn't have this; target needs it for rate calculations

Resolution: Note the gap in targeted epic:
  "- [ ] Input includes property_type (condo, single-family, multi-unit)
         [NEW: not in source component, required by target architecture]"
```

---

## Step 5: Generate Cross-Reference Section

At the end of targeted-epics.md, include a cross-reference table:

```markdown
---

## Cross-Reference: Portable Extract -> Target

### Stories
| Target Story | Source Story | Adaptation |
|-------------|-------------|------------|
| 1.1 Calculate mortgage payment | 1.1 Calculate monthly payment | Domain language only |
| 1.2 Compare rate scenarios | 1.2 Compare payment plans | Domain language only |
| 2.1 Search property listings | 2.1 Search vehicle inventory | Domain + persona |
| 2.4 (excluded) | 2.4 Enter trade-in value | No target equivalent |
| 3.1 Buyer inquiry form | 3.1 Lead submission form | Domain language only |

### Business Rules
| Rule ID | Source Context | Target Context | Adaptation |
|---------|---------------|----------------|------------|
| BR-CALC-001 | Auto loan payment | Mortgage payment | Field names only |
| BR-VAL-003 | Down payment 0-100% | Down payment 3.5-100% | Target override |
| BR-DEC-001 | Auto rate tiers | Mortgage rate tiers | Thresholds updated |

### Data Contracts
| Contract | Source Model | Target Model | Gaps |
|----------|-------------|-------------|------|
| DC-IN-001 | LoanParameters | MortgageApplication | +property_type |
| DC-OUT-001 | PaymentResult | PaymentEstimate | None |
| DC-STATE-001 | CalculatorState | CalculatorSession | None |
```

---

## Step 6: Quality Checks

### No Source Domain Terms
Scan all targeted epic text for source domain terms:
- No "vehicle", "car", "dealer" (if source was car dealership)
- No source persona names
- No source service names

**If found:** Apply missed translations.

### No Abstract Personas
Scan for [User], [Admin], [System]:
- All should be replaced with target persona names
- Exception: persona mapping section that documents the mapping

**If found:** Apply persona mapping.

### Business Rule Integrity
Verify that business rules are referenced correctly:
- All BR-* IDs in targeted epics exist in component-spec.md
- No BR-* IDs were lost during translation
- Overrides are clearly marked as `[TARGET OVERRIDE]`

### Story Count Reconciliation
Compare source and target story counts:
```
Source stories: 24
Target stories: 26 (24 translated + 2 split from one-to-many persona mapping)
Excluded: 2 (no target equivalent)
Net: 26 targeted stories from 24 source stories
```

### Completeness Check
Every portable extract epic should be accounted for:
- Translated to target
- Excluded with documented reason
- Flagged for review

No epic or story should silently disappear.

---

## Output File Assembly

### targeted-epics.md

Assemble in this order:
1. YAML frontmatter (source, target, date, mode, mappings summary)
2. Introduction (what this file is, where it came from)
3. Imported Persona Context (mapped personas with source info)
4. Epics and Stories (translated content)
5. Cross-Reference Table

### transplant-report.md

Assemble in this order:
1. YAML frontmatter (source, target, date)
2. Summary statistics
3. Persona Mapping Detail (full table)
4. Domain Language Translations (full table with confidence)
5. Data Contract Mapping (full field-level mapping)
6. Business Rule Adaptations (overrides and changes)
7. Excluded Content (what was dropped and why)
8. Items Requiring Review (flagged for human attention)
9. Next Steps
