# Output Templates

Templates for the two portable extraction artifacts. Read this file when writing output in Step 6.

---

## epics.md Structure

```markdown
---
source_project: "<from state file or directory name>"
extraction_date: "<current date>"
extraction_mode: "yolo"  # or guided, interactive
source_documents:
  - docs/reverse-engineering/functional-specification.md
  - docs/reverse-engineering/business-context.md
  # ... all source docs used
persona_mapping:
  "[User]":
    source_personas: ["Customer", "Shopper", "Visitor"]
    primary_goals: ["Find items", "Compare options", "Submit inquiries"]
  "[Admin]":
    source_personas: ["Dealer Admin", "Manager"]
    primary_goals: ["Configure settings", "Manage inventory"]
  "[System]":
    source_personas: ["Inventory Sync", "Payment Gateway"]
    primary_goals: ["Sync data", "Process payments"]
exclusions_applied:
  tech_setup: 3        # stories filtered
  cicd: 2              # stories filtered
  tech_debt: 5         # stories filtered
  platform_integration: 4  # stories abstracted
  test_infra: 1        # stories filtered
portability_score: 92  # percentage of included stories requiring no abstraction
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

---

## component-spec.md Structure

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
**Precision:** [Rounding rules, decimal places]
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
