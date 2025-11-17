# Convert to Spec Kit Format

**Skill**: convert-to-speckit
**Purpose**: Convert existing `docs/reverse-engineering/` documentation into GitHub Spec Kit specifications
**Use Case**: Repository has reverse engineering docs from StackShift Gears 1-2, but needs proper Spec Kit format

---

## What This Skill Does

This skill reads your existing reverse engineering documentation and converts it into properly formatted GitHub Spec Kit specifications, ready for the `/speckit-*` workflow commands.

### Prerequisites

Your repository should have:
- `docs/reverse-engineering/` directory with documentation files
- `.specify/templates/` with Spec Kit templates (will be created if missing)

### Process

1. **Scan** - Read all files in `docs/reverse-engineering/`
2. **Analyze** - Identify distinct features and capabilities
3. **Extract** - Pull out business logic, data models, APIs, integrations
4. **Convert** - Map to GitHub Spec Kit format
5. **Create** - Generate `specs/F{NNN}-{feature}/spec.md` files
6. **Validate** - Ensure all required sections are complete

---

## Step 1: Locate Documentation

I'll scan for reverse engineering documentation:

```
docs/reverse-engineering/
├── functional-specification.md
├── data-architecture.md
├── api-documentation.md
├── integration-points.md
├── business-logic.md
├── deployment-architecture.md
└── [other analysis files]
```

**Action**: Let me read all files in this directory to understand the application.

---

## Step 2: Extract Features

From the documentation, I'll identify distinct features. Each feature becomes one specification.

**Examples of features**:
- User Authentication (login, registration, password reset)
- Product Catalog (listing, search, filtering)
- Shopping Cart (add to cart, update, checkout)
- Payment Processing (cards, validation, receipts)
- Order Management (create, track, update, cancel)
- Admin Dashboard (reporting, analytics, user management)

**Question for you**: After I list the features I found, you can:
- Confirm priorities (P0 = critical, P1 = important, P2 = enhancement)
- Add features I might have missed
- Skip features not needed right now

---

## Step 3: Create Specifications

For each feature, I'll create a properly formatted specification following this structure:

### File: `specs/F{NNN}-{feature-slug}/spec.md`

```markdown
# Feature Specification: {Feature Name}

**Feature Branch**: `{NNN}-{feature-slug}`
**Created**: {date}
**Status**: Draft
**Priority**: P0 | P1 | P2

## User Scenarios & Testing *(mandatory)*

### User Story 1 - {Capability} (Priority: P0/P1/P2)

As a {user type}, I need {capability} so that {benefit}.

**Why this priority**: {Business value explanation}

**Independent Test**: {How to test this in isolation}

**Acceptance Scenarios**:
1. **Given** {precondition}, **When** {action}, **Then** {outcome}
2. **Given** {precondition}, **When** {action}, **Then** {outcome}
3. **Given** {precondition}, **When** {action}, **Then** {outcome}

---

{3-5 user stories per feature}

---

### Edge Cases

- {5-10 edge cases that need handling}

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST {requirement}
- **FR-002**: System MUST {requirement}
- **FR-003**: System SHOULD {optional requirement}

{10-15 functional requirements}

### Key Entities *(if data-related)*

- **{Entity}**: {Description}

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: {Metric}: {Expected value}
- **SC-002**: {Performance metric}

{8-12 success criteria}

### Non-Functional Requirements

- **Performance**: {Response times, throughput}
- **Reliability**: {Uptime, error rates}
- **Security**: {Auth, encryption, protection}
- **Maintainability**: {Code quality, tests}

## Assumptions

1. {Technical assumptions}
2. {Environment assumptions}
{3-7 assumptions}

## Dependencies

- {External systems, libraries, services}

## Out of Scope

- {Things NOT in this feature}
- {Future enhancements}

## References

- {Documentation links}
- {Standards followed}
```

---

## Conversion Mapping

### From Reverse Engineering Docs → Spec Kit

| Source | Target |
|--------|--------|
| Capabilities, features, "what it does" | User Stories |
| API endpoints, request/response | Functional Requirements |
| Database tables, schemas | Key Entities |
| Business rules, validation | Acceptance Scenarios |
| Error conditions, limits | Edge Cases |
| External APIs, services | Dependencies |
| Tech stack, frameworks | Implementation details (plan.md, not spec.md) |

### Key Principles

**Spec.md describes WHAT, not HOW**:
- ✅ "System MUST authenticate users securely"
- ❌ "System MUST use JWT with RS256 algorithm"

**Stay technology-agnostic**:
- ✅ "System MUST persist data reliably"
- ❌ "System MUST use PostgreSQL with replication"

**Focus on outcomes**:
- ✅ "System MUST respond within 200ms"
- ❌ "System MUST cache with Redis"

Implementation details go in `plan.md`, which is created later via `/speckit-plan`.

---

## Quality Validation

Before completing, I'll verify each spec has:

- [ ] 3-5 user stories with clear business value
- [ ] Each story has 3 acceptance scenarios
- [ ] 5-10 edge cases identified
- [ ] 10-15 functional requirements (MUST/SHOULD/MAY)
- [ ] Key entities listed (if data-related)
- [ ] 8-12 measurable success criteria
- [ ] Non-functional requirements (performance, security, reliability)
- [ ] 3-7 assumptions documented
- [ ] Dependencies clearly listed
- [ ] Out of scope items specified

---

## Example: Before & After

### Before (from reverse engineering docs):

```
API: POST /api/auth/login
- Takes email and password
- Returns JWT token
- Returns 401 if invalid
- Rate limited to 5 attempts
```

### After (Spec Kit format):

```markdown
### User Story 1 - Secure Login (Priority: P0)

As a registered user, I need to log in with email and password so that I can access my account securely.

**Why this priority**: Core authentication is critical for all user features.

**Independent Test**: Submit valid credentials, verify token returned.

**Acceptance Scenarios**:
1. **Given** valid email and password, **When** login submitted, **Then** authentication token and user profile returned
2. **Given** invalid credentials, **When** login submitted, **Then** 401 error returned without revealing which field failed
3. **Given** 5 failed attempts, **When** login submitted, **Then** 429 rate limit error returned

### Functional Requirements

- **FR-001**: System MUST accept email and password via secure HTTPS
- **FR-002**: System MUST validate email format before auth
- **FR-003**: System MUST return auth token on successful verification
- **FR-004**: System MUST return 401 for invalid credentials
- **FR-005**: System MUST rate limit to prevent brute force (5 attempts)
- **FR-006**: System MUST return 429 when rate limit exceeded

### Success Criteria

- **SC-001**: Login succeeds for valid credentials 99.9% of time
- **SC-002**: Login completes within 500ms at 95th percentile
- **SC-003**: Rate limiting activates after 5 attempts per 15 minutes
```

---

## Ready to Convert!

I'm ready to help convert your reverse engineering docs to Spec Kit format.

**What I need from you**:

1. **Confirm**: Do you have `docs/reverse-engineering/` with documentation?
2. **Preferences**: Any specific features to prioritize or skip?
3. **Review**: After I list features found, confirm priorities (P0/P1/P2)

**What I'll deliver**:

1. Analysis of all features found
2. Priority recommendations
3. Complete spec files in `specs/F{NNN}-{feature}/spec.md` format
4. Summary table of what was created

**Next steps after conversion**:

1. Review specs: Check they capture all requirements
2. Run `/speckit-plan` on each spec to create implementation plans
3. Run `/speckit-tasks` to generate actionable task lists
4. Run `/speckit-implement` to execute the implementation

---

**Let's begin!**

I'll start by reading your `docs/reverse-engineering/` directory. Please confirm you're ready, and I'll begin the conversion process.
