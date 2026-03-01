# Extract Business Rules

Detailed instructions for extracting tech-agnostic business rules, data contracts, edge cases, and interaction patterns from reverse-engineering docs.

---

## Overview

Extract and categorize all business logic into portable, implementation-independent specifications. Each rule gets a unique ID for cross-referencing with epics.md stories.

**ID Prefixes:**
- `BR-CALC-*` - Calculation rules (formulas, not code)
- `BR-VAL-*` - Validation rules (constraints, not column types)
- `BR-DEC-*` - Decision trees (IF/THEN logic)
- `BR-STATE-*` - State machines (states + transitions)
- `DC-IN-*` - Input data contracts (shapes, not endpoints)
- `DC-OUT-*` - Output data contracts (shapes, not schemas)
- `DC-STATE-*` - Internal state contracts (shapes, not storage)
- `EC-*` - Edge cases and boundary conditions
- `ERR-*` - Error states and recovery
- `FLOW-*` - Interaction patterns and user flows

---

## Step 1: Extract Calculation Rules (BR-CALC-*)

### Source Documents
- `functional-specification.md` - Business Rules section, FR descriptions
- `data-architecture.md` - Computed fields, derived values

### What to Extract
Any rule that COMPUTES a value from inputs:
- Mathematical formulas (e.g., monthly payment = principal * rate / (1 - (1+rate)^-term))
- Aggregations (e.g., total = sum of line items * quantity)
- Derived values (e.g., APR = nominal rate * compounding periods)
- Rounding rules (e.g., round to nearest cent, round up for tax)
- Percentage calculations (e.g., down payment = price * down_payment_pct)

### How to Make Tech-Agnostic
- Express formulas in mathematical notation, NOT code
- Use descriptive variable names, not field names from the database
- Include units where applicable (dollars, percentage, months)
- Document precision requirements (decimal places, rounding mode)

### Template
```
#### BR-CALC-001: [Descriptive Name]
**Description:** [What this calculates in plain English]
**Formula:** [Mathematical expression]
**Inputs:** [List of DC-IN references and fields]
**Output:** [DC-OUT reference and field]
**Precision:** [Rounding rules, decimal places]
**Edge Cases:** [EC references]
**Example:**
  - Input: { principal: 25000, annual_rate: 0.049, term_months: 60 }
  - Output: { monthly_payment: 471.78 }
```

---

## Step 2: Extract Validation Rules (BR-VAL-*)

### Source Documents
- `functional-specification.md` - Business Rules, acceptance criteria, NFRs
- `data-architecture.md` - Field constraints, data model annotations

### What to Extract
Any rule that VALIDATES input or state:
- Required field checks
- Range constraints (min/max values)
- Format validations (email, phone, postal code patterns)
- Cross-field validations (end_date must be after start_date)
- Business constraint validations (loan amount cannot exceed vehicle price)
- State-dependent validations (can only submit if status is "draft")

### How to Make Tech-Agnostic
- Express constraints in plain language, NOT database column types
- Use "must be" / "must not be" / "must match" language
- Don't reference specific ORMs, validators, or frameworks
- Describe the CONSTRAINT, not the implementation

### Template
```
#### BR-VAL-001: [Descriptive Name]
**Description:** [What this validates]
**Constraint:** [Rule in plain language]
**Applies to:** [DC-IN reference and fields]
**When:** [Context - always, or conditional]
**Error:** [ERR reference when validation fails]
```

---

## Step 3: Extract Decision Trees (BR-DEC-*)

### Source Documents
- `functional-specification.md` - Business Rules, conditional logic in FRs
- `business-context.md` - Business constraints with conditional behavior

### What to Extract
Any rule that makes a DECISION based on conditions:
- Pricing tier selection
- Feature flag / eligibility determination
- Routing logic (which path to take)
- Permission checks (who can do what)
- Conditional display logic (show/hide based on state)

### How to Make Tech-Agnostic
- Express as IF/THEN/ELSE chains, not code
- Use business terms, not variable names
- Document the DEFAULT outcome
- List all known conditions exhaustively

### Template
```
#### BR-DEC-001: [Decision Name]
**Description:** [What decision this makes]
**Logic:**
  - IF [business condition 1] THEN [outcome 1]
  - ELSE IF [business condition 2] THEN [outcome 2]
  - ELSE IF [business condition 3] THEN [outcome 3]
  - ELSE [default outcome]
**Inputs:** [DC-IN references]
**Outcomes:** [List of possible outcomes with descriptions]
```

---

## Step 4: Extract State Machines (BR-STATE-*)

### Source Documents
- `functional-specification.md` - Workflow descriptions, status fields
- `data-architecture.md` - Status/state enum fields, lifecycle descriptions

### What to Extract
Any entity with a defined lifecycle of states and transitions:
- Order status (draft -> submitted -> processing -> complete)
- Application status (new -> under_review -> approved/rejected)
- Document lifecycle (draft -> review -> published -> archived)
- User account state (active -> suspended -> closed)

### How to Make Tech-Agnostic
- Define states as descriptive names, not enum values or constants
- Define transitions as trigger conditions, not API calls
- Specify which actor ([User], [Admin], [System]) triggers each transition
- Document guard conditions for transitions

### Template
```
#### BR-STATE-001: [State Machine Name]
**Description:** [What entity's lifecycle this tracks]
**States:**
  - [State A]: [Description of this state]
  - [State B]: [Description]
  - [State C]: [Description]
**Transitions:**
  - [State A] -> [State B]: [Trigger] (actor: [User/Admin/System])
  - [State B] -> [State C]: [Trigger] (actor: [System])
  - [State B] -> [State A]: [Trigger] (actor: [Admin]) -- rollback
**Initial State:** [State A]
**Terminal States:** [State C]
**Guard Conditions:**
  - [State A] -> [State B]: requires BR-VAL-003 to pass
```

---

## Step 5: Extract Data Contracts (DC-*)

### Source Documents
- `data-architecture.md` - Data models, API request/response shapes
- `functional-specification.md` - Input/output descriptions in FRs
- `integration-points.md` - External data shapes (abstracted)

### Input Contracts (DC-IN-*)

What data the component RECEIVES:
- User form submissions
- External data provider payloads (abstracted - not specific APIs)
- Configuration inputs
- Query parameters / filter criteria

### Output Contracts (DC-OUT-*)

What data the component PRODUCES:
- Calculation results
- Display data for UI rendering
- Data sent to external consumers (abstracted)
- Report/export data shapes

### State Contracts (DC-STATE-*)

What data the component HOLDS internally:
- Session/wizard state
- Accumulated selections
- Cached computation results
- Current step in a multi-step flow

### How to Make Tech-Agnostic
- Use generic type names: `string`, `number`, `boolean`, `date`, `enum`, `list`, `map`
- Don't use language-specific types (no `int32`, `varchar(255)`, `BigDecimal`)
- Describe shapes with field names, types, and constraints
- Mark fields as `required` or `optional`
- Include valid ranges / allowed values

### Template
```
#### DC-IN-001: [Contract Name]
**Description:** [What data this represents]
**Shape:**
  - field_name: type (required/optional) - [description]
  - field_name: enum [value1, value2, value3] (required) - [description]
  - nested_object: map
    - sub_field: type - [description]
**Constraints:**
  - field_name: [constraint, e.g., > 0, max 100 chars, matches pattern]
**Source:** [Which FR or business rule needs this input]
```

---

## Step 6: Extract Edge Cases (EC-*)

### Source Documents
- `functional-specification.md` - Acceptance criteria edge cases, boundary conditions
- `test-documentation.md` - Test scenarios that reveal edge cases
- `business-context.md` - Business constraints that create edge cases

### What to Extract
- Boundary values (zero, negative, maximum, minimum)
- Empty/null states (no items in list, no selection made)
- Timing issues (concurrent submissions, expired sessions)
- Conflicting rules (what happens when two business rules conflict?)
- Unusual but valid inputs (special characters, extremely long values)
- State transition edge cases (what if transition is attempted twice?)

### Template
```
#### EC-001: [Edge Case Name]
**Trigger:** [What specific condition causes this]
**Expected Behavior:** [What should happen - the correct outcome]
**Related Rules:** [BR-* references that are affected]
**Data State:** [What DC-STATE looks like when this occurs]
**Priority:** [Critical / Important / Nice-to-have]
```

---

## Step 7: Extract Error States (ERR-*)

### Source Documents
- `functional-specification.md` - Error handling in FRs
- `integration-points.md` - External service failure modes (abstracted)
- `test-documentation.md` - Error scenario tests

### What to Extract
- Validation failures (linked to BR-VAL-*)
- Calculation errors (division by zero, overflow)
- External provider failures (abstracted - "data provider unavailable")
- State transition failures (invalid transition attempted)
- Timeout/unavailability scenarios

### How to Make Tech-Agnostic
- Don't reference HTTP status codes
- Don't reference specific error classes or exceptions
- Describe the USER-FACING impact, not the technical error
- Use abstract recovery steps, not retry/redirect URLs

### Template
```
#### ERR-001: [Error Name]
**Trigger:** [What causes this error - link to BR-VAL or BR-DEC]
**User Impact:** [What the user experiences]
**Recovery:** [How to recover - user action or system recovery]
**Severity:** [Blocking / Degraded / Informational]
```

---

## Step 8: Extract Interaction Patterns (FLOW-*)

### Source Documents
- `visual-design-system.md` - User flows, interaction patterns
- `functional-specification.md` - Multi-step processes, workflows
- `business-context.md` - User journey descriptions

### What to Extract
- Multi-step flows (wizards, checkout processes, onboarding)
- CRUD patterns with specific business logic
- Search/filter/sort interactions
- Real-time update patterns (live calculations, auto-save)
- Confirmation/review patterns

### How to Make Tech-Agnostic
- Describe steps in terms of USER ACTIONS and SYSTEM RESPONSES
- Don't reference specific UI components (no "modal", "dropdown" - use "selection", "confirmation")
- Don't reference specific navigation (no URLs, routes)
- Focus on the DATA FLOW through the interaction

### Template
```
#### FLOW-001: [Flow Name]
**Description:** [What this flow accomplishes]
**Actor:** [User] / [Admin] / [System]
**Preconditions:** [What must be true before flow starts]
**Steps:**
  1. [Actor] provides [DC-IN-*]
  2. System validates ([BR-VAL-*])
  3. System calculates ([BR-CALC-*])
  4. System returns [DC-OUT-*]
  5. [Actor] reviews and confirms
**Success Outcome:** [What state the system is in after success]
**Error Paths:**
  - Step 2 fails -> [ERR-*] -> return to step 1
  - Step 3 fails -> [ERR-*] -> display error, allow retry
**Related Flows:** [FLOW-* references for sub-flows or next steps]
```

---

## Tech-Agnostic Filtering Checklist

After extraction, verify NONE of these appear in the output:

- [ ] No framework names (React, Angular, Spring, Django, etc.)
- [ ] No database-specific types (VARCHAR, JSONB, ObjectId, etc.)
- [ ] No API endpoint URLs (/api/v1/users, etc.)
- [ ] No HTTP methods (GET, POST, PUT, etc.)
- [ ] No specific service names (DealerSocket, Stripe, SendGrid, etc.)
- [ ] No infrastructure references (S3, Lambda, Redis, etc.)
- [ ] No code syntax (function calls, imports, decorators, etc.)
- [ ] No CSS/styling references (classes, breakpoints in px, etc.)
- [ ] No environment-specific values (localhost, staging URLs, etc.)
- [ ] No auth implementation details (JWT, OAuth tokens, session IDs, etc.)

**If any are found:** Replace with abstract equivalents:
- "DealerSocket API" -> "external inventory data provider"
- "POST /api/payments" -> "submit payment to payment processor"
- "Redis cache" -> "cache layer"
- "JWT token" -> "authentication credential"
- "S3 bucket" -> "file storage"
