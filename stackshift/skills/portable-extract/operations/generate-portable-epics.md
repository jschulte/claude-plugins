# Generate Portable Epics

Detailed instructions for generating BMAD-format epics with abstract personas, exclusion filtering, and cross-references to component-spec.md.

---

## Overview

Transform source functional requirements into portable, domain-grouped epics that:
- Use abstract personas ([User], [Admin], [System]) instead of source-specific roles
- Exclude non-portable stories (tech debt, CI/CD, test infra, platform-specific)
- Abstract integration stories (specific services -> generic providers)
- Cross-reference business rules in component-spec.md by ID

---

## Step 1: Inventory Source Functional Requirements

### Primary Source
Read `functional-specification.md` and extract ALL functional requirements:
- FR IDs and titles
- Priority levels (P0, P1, P2, P3)
- User stories ("As a [persona]...")
- Acceptance criteria
- Business rules referenced

### Secondary Sources
- `business-context.md` - Business goals (for epic priority ordering)
- `integration-points.md` - External service stories (for abstraction)
- `technical-debt-analysis.md` - Identify which FRs are tech-debt items (for exclusion)

**Create a master FR inventory:**
```
FR-001: User Authentication     [P0] [auth]        -> INCLUDE
FR-002: Vehicle Search          [P0] [search]      -> INCLUDE
FR-003: Migrate to React 18    [P1] [tech-debt]    -> EXCLUDE
FR-004: CI Pipeline Setup      [P1] [cicd]         -> EXCLUDE
FR-005: DealerSocket Sync      [P1] [integration]  -> ABSTRACT
FR-006: Payment Calculation    [P0] [payments]      -> INCLUDE
...
```

---

## Step 2: Apply Exclusion Filter

Classify each FR into one of these categories and mark accordingly:

### Category 1: Tech Setup (EXCLUDE)
Stories about framework configuration, build tooling, or environment setup.

**Detection patterns:**
- Mentions specific frameworks by name as the goal (not as context)
- "Set up", "Configure", "Initialize" + tech tool
- Build system, bundler, linter, formatter configuration
- Environment setup (Node version, Docker base image, etc.)

**Examples to exclude:**
- "Set up Next.js project with TypeScript"
- "Configure ESLint and Prettier"
- "Set up Webpack build pipeline"
- "Initialize database migrations"

### Category 2: CI/CD (EXCLUDE)
Stories about deployment pipelines, continuous integration, or release processes.

**Detection patterns:**
- GitHub Actions, Jenkins, CircleCI references
- Deployment, release, publish workflows
- Docker image building and pushing
- Environment promotion (staging -> production)

**Examples to exclude:**
- "Set up GitHub Actions CI pipeline"
- "Configure automated deployment to staging"
- "Create Docker multi-stage build"
- "Set up release tagging workflow"

### Category 3: Tech Debt (EXCLUDE)
Stories about fixing source-platform issues, upgrading dependencies, or refactoring.

**Detection patterns:**
- References to technical-debt-analysis.md items
- "Upgrade", "Migrate", "Refactor" + specific technology
- Performance improvements tied to specific infrastructure
- Security patches for specific dependencies

**Examples to exclude:**
- "Upgrade React from 17 to 18"
- "Migrate from Moment.js to date-fns"
- "Refactor class components to functional components"
- "Fix N+1 query in vehicle listing endpoint"

### Category 4: Source-Platform Integration (ABSTRACT, not exclude)
Stories about specific external services that should be ABSTRACTED, not removed.

**Detection patterns:**
- Specific service/API names (DealerSocket, Stripe, SendGrid, etc.)
- Specific endpoint URLs
- Platform-specific authentication flows
- Vendor SDK usage

**Abstraction rules:**
- Replace service name with generic role:
  - "DealerSocket" -> "external inventory data provider"
  - "Stripe" -> "payment processor"
  - "SendGrid" -> "email delivery service"
  - "Auth0" -> "identity provider"
  - "S3" -> "file storage service"
  - "Twilio" -> "messaging service"
- Keep the BUSINESS FUNCTION, remove the VENDOR
- Preserve the data contract (what data flows in/out)

**Example transformation:**
```
BEFORE: "As a Dealer Admin, I want to sync inventory from DealerSocket API
         so that vehicle listings are always up to date"

AFTER:  "As an [Admin], I want to sync inventory from an external inventory
         data provider so that listings are always up to date"
```

### Category 5: Test Infrastructure (EXCLUDE)
Stories about test setup, test frameworks, or test tooling.

**Detection patterns:**
- Test framework setup (Jest, Cypress, Playwright, etc.)
- Test coverage requirements (specific percentages tied to tooling)
- Test data management infrastructure
- Mock/stub service setup

**Examples to exclude:**
- "Set up Jest with React Testing Library"
- "Create Cypress E2E test suite"
- "Set up mock server for API testing"
- "Achieve 80% code coverage with Istanbul"

**Note:** Testing REQUIREMENTS (functional) are different from test INFRASTRUCTURE:
- INCLUDE: "Payment calculation must be verified with boundary values" (functional requirement)
- EXCLUDE: "Set up Jest test runner with coverage reporting" (test infrastructure)

---

## Step 3: Abstract Integration Stories

For stories in Category 4 (not excluded, but abstracted):

1. **Replace service names** with generic provider roles (see abstraction rules above)
2. **Replace API endpoint references** with abstract data flow descriptions
3. **Replace auth mechanism details** with "authenticate with [provider type]"
4. **Preserve the business value** - the "so that" clause should remain meaningful
5. **Link to data contracts** in component-spec.md that define the interface shape

**Quality check:** Read the abstracted story aloud. Does it make sense without knowing the source platform?

---

## Step 4: Apply Persona Abstraction

Using the persona mapping from `operations/abstract-personas.md`:

1. Replace all source persona names in "As a [persona]" clauses
2. Replace persona references in acceptance criteria
3. Replace persona references in story descriptions
4. Verify the persona assignment makes sense for each story

**Common replacements:**
```
"As a Car Shopper"     -> "As a [User]"
"As a Dealer Admin"    -> "As an [Admin]"
"As the Sync Service"  -> "As [System]"
"As a Finance Manager" -> "As an [Admin]"
"As a Guest User"      -> "As a [User]"
```

---

## Step 5: Group into Domain-Based Epics

Group the remaining (included + abstracted) stories into epics by BUSINESS DOMAIN, not by technical layer.

### Grouping Rules

1. **Identify natural domains** from FR titles and descriptions:
   - Authentication & identity
   - Search & discovery
   - Calculation & pricing
   - Data management & CRUD
   - Notifications & communication
   - Reporting & analytics
   - Configuration & settings
   - Integration & data sync

2. **Each domain becomes an epic** with:
   - A descriptive name (e.g., "Payment Calculation Engine", not "API Layer")
   - A business goal from business-context.md
   - A priority based on the highest-priority story in the epic
   - All stories that belong to this domain

3. **Avoid technical groupings:**
   - BAD: "Frontend Epic", "Backend Epic", "Database Epic"
   - GOOD: "Vehicle Search & Discovery", "Payment Processing", "Inventory Management"

4. **Handle cross-cutting stories:**
   - If a story spans multiple domains, place it in the domain it PRIMARILY serves
   - Add a cross-reference note to the other domain's epic

### Epic Priority

Inherit from the stories within:
- If any story is P0, the epic is P0
- Otherwise, use the highest priority among stories
- Within an epic, maintain original story priorities

---

## Step 6: Add Cross-References

For each story, add references to component-spec.md IDs:

```markdown
### Story 1.1: Calculate Monthly Payment
**As a** [User], **I want** to see my estimated monthly payment,
**so that** I can evaluate affordability.

**Acceptance Criteria:**
- [ ] Monthly payment calculated using BR-CALC-001
- [ ] Down payment validated per BR-VAL-003
- [ ] Interest rate determined by BR-DEC-001
- [ ] Result displayed per DC-OUT-001 shape

**Business Rules:** BR-CALC-001, BR-VAL-003, BR-DEC-001
**Data Contracts:** DC-IN-001, DC-OUT-001
**Edge Cases:** EC-001 (zero down payment), EC-003 (maximum term)
**Flows:** FLOW-001 (payment calculation flow)
```

**Cross-reference checklist:**
- Every acceptance criterion that involves a calculation links to BR-CALC-*
- Every acceptance criterion that involves validation links to BR-VAL-*
- Every acceptance criterion with conditional behavior links to BR-DEC-*
- Input/output shapes link to DC-IN-*/DC-OUT-*
- Known edge cases link to EC-*
- Multi-step processes link to FLOW-*

---

## Step 7: Quality Checks

Run these checks on the final epics before writing output:

### No Tech Names Check
Scan all story text for technology-specific terms:
- Framework names (React, Angular, Vue, Django, Spring, etc.)
- Database names (PostgreSQL, MongoDB, DynamoDB, etc.)
- Service names (AWS, GCP, Azure service names)
- Library names (Axios, Prisma, Sequelize, etc.)
- Language-specific terms (npm, pip, gem, etc.)

**If found:** Abstract or remove.

### No Source Personas Check
Scan all "As a" clauses for non-abstract personas:
- Should only contain [User], [Admin], [System]
- No source-specific role names

**If found:** Apply persona mapping.

### No API Endpoints Check
Scan for URL patterns, HTTP methods, or endpoint references:
- No /api/v1/... paths
- No GET/POST/PUT/DELETE references
- No webhook URLs

**If found:** Abstract to business operation descriptions.

### Story Coherence Check
Read each story and verify:
- The persona assignment makes sense for the action
- The acceptance criteria are testable without tech context
- The business value ("so that") is meaningful
- Cross-references to component-spec.md are valid IDs

### Epic Balance Check
Verify epic distribution:
- No epic has fewer than 2 stories (merge small epics)
- No epic has more than 10 stories (consider splitting)
- All stories are assigned to exactly one epic
- No stories were accidentally dropped during filtering

---

## Exclusion Summary Format

Track and report what was filtered:

```
Exclusion Summary:
  Total source FRs:           35
  Included (as-is):           20
  Included (abstracted):       4  (platform integration -> generic)
  Excluded (tech setup):       3  (FR-008, FR-015, FR-022)
  Excluded (CI/CD):            2  (FR-009, FR-023)
  Excluded (tech debt):        5  (FR-003, FR-010, FR-016, FR-024, FR-030)
  Excluded (test infra):       1  (FR-011)
  ---
  Final stories:              24  (in 6 epics)
  Portability score:          92%
```

The portability score is calculated as:
```
score = (included_as_is / (included_as_is + abstracted)) * 100
```

Stories that required abstraction lower the score slightly because they may need manual review in the target context.
