# Convert Reverse Engineering Docs to GitHub Spec Kit Format

**Purpose**: This prompt converts existing `docs/reverse-engineering/` documentation into proper GitHub Spec Kit specifications.

**Use Case**: You've already run StackShift Gears 1-2 and have comprehensive reverse engineering documentation, but need it formatted as GitHub Spec Kit specs for the `/speckit-*` workflow.

**Instructions**: Copy this entire file and paste it into Claude.ai or Claude Code. Claude will read your reverse engineering docs and create properly formatted specs.

---

## Your Task

You are helping convert existing reverse engineering documentation into GitHub Spec Kit format specifications.

### Step 1: Locate Reverse Engineering Documentation

Look for the `docs/reverse-engineering/` directory in the current repository. This should contain files like:
- `functional-specification.md`
- `data-architecture.md`
- `api-documentation.md`
- `integration-points.md`
- `business-logic.md`
- `deployment-architecture.md`
- And other analysis documents

### Step 2: Read All Documentation

Read through ALL files in `docs/reverse-engineering/` to understand:
- What features the application has
- What the business logic does
- What data models exist
- What APIs are exposed
- What integrations are present
- What the tech stack is

### Step 3: Extract Features

From the reverse engineering docs, identify distinct features or capabilities. Group related functionality together. Each feature will become one specification.

**Examples**:
- User Authentication (login, registration, password reset)
- Product Catalog (listing, search, filtering)
- Shopping Cart (add items, update quantities, checkout)
- Payment Processing (credit cards, validation, receipts)
- Order Management (create, update, track, cancel)
- Admin Dashboard (reporting, analytics, user management)

### Step 4: Create Spec Kit Specifications

For EACH feature identified, create a specification file following this exact structure:

#### File Location
```
specs/F{NNN}-{feature-slug}/spec.md
```

Where:
- `{NNN}` is a zero-padded number starting at 001
- `{feature-slug}` is lowercase with hyphens (e.g., "user-authentication")

#### File Structure

```markdown
# Feature Specification: {Feature Name}

**Feature Branch**: `{NNN}-{feature-slug}`
**Created**: {YYYY-MM-DD}
**Status**: Draft
**Priority**: P0 | P1 | P2

## User Scenarios & Testing *(mandatory)*

### User Story 1 - {Capability Name} (Priority: P0/P1/P2)

As a {user type}, I need {capability} so that {benefit}.

**Why this priority**: {Explain business value and urgency}

**Independent Test**: {How to test this story in isolation}

**Acceptance Scenarios**:

1. **Given** {precondition}, **When** {action}, **Then** {expected outcome}
2. **Given** {precondition}, **When** {action}, **Then** {expected outcome}
3. **Given** {precondition}, **When** {action}, **Then** {expected outcome}

---

### User Story 2 - {Another Capability} (Priority: P0/P1/P2)

{Repeat structure for 3-5 user stories per feature}

---

### Edge Cases

- {List 5-10 edge cases that need handling}
- {Consider error conditions, boundary values, concurrent access}
- {Think about what could go wrong}

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST {specific requirement with measurable criteria}
- **FR-002**: System MUST {specific requirement with measurable criteria}
- **FR-003**: System SHOULD {optional requirement}
- **FR-004**: System MUST {specific requirement with measurable criteria}

{Aim for 10-15 functional requirements per feature}

### Key Entities *(include if feature involves data)*

- **{Entity Name}**: {Description of what this entity represents}
- **{Entity Name}**: {Description and key attributes}

{List 3-7 key data entities involved in this feature}

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: {Specific metric}: {Expected value/behavior}
- **SC-002**: {Performance metric}: {Response time/throughput}
- **SC-003**: {Quality metric}: {Accuracy/completeness}

{Define 8-12 measurable success criteria}

### Non-Functional Requirements

- **Performance**: {Response times, throughput, scalability targets}
- **Reliability**: {Uptime, error rates, fault tolerance}
- **Security**: {Authentication, authorization, data protection}
- **Maintainability**: {Code quality, documentation, testability}
- **Usability**: {User experience, accessibility, learnability}

## Assumptions

1. {List technical assumptions}
2. {List environment assumptions}
3. {List dependency assumptions}
4. {List constraint assumptions}

{Typically 3-7 assumptions}

## Dependencies

- {External systems, libraries, or services required}
- {Infrastructure requirements}
- {Other features that must exist first}

## Out of Scope

- {Things that are explicitly NOT part of this feature}
- {Future enhancements to be done later}
- {Alternative approaches that were rejected}

## References

- {Links to external documentation}
- {Standards or specifications followed}
- {Related features or background reading}
```

### Step 5: Extraction Patterns

When converting from reverse engineering docs to Spec Kit format:

#### From Functional Specification → User Stories
- Look for "capabilities", "features", "what the system does"
- Convert into "As a {user}, I need {capability} so that {benefit}"
- Priority: P0 = critical path, P1 = important, P2 = nice to have

#### From API Documentation → Functional Requirements
- Each API endpoint becomes 1-3 functional requirements
- Input validation → FR about data validation
- Output format → FR about response structure
- Error handling → FR about error responses

#### From Data Architecture → Key Entities
- Database tables → Key entities
- Include primary attributes and relationships
- Reference data models from the reverse engineering docs

#### From Business Logic → Acceptance Scenarios
- Business rules → Given/When/Then scenarios
- Validation logic → Edge cases
- State transitions → Acceptance scenarios

#### From Integration Points → Dependencies
- External APIs → Dependencies section
- Third-party services → Dependencies section
- Infrastructure requirements → Dependencies section

### Step 6: Technology-Agnostic Conversion

**IMPORTANT**: Spec Kit specs describe WHAT, not HOW.

**Do This** ✅:
- "System MUST authenticate users via secure credentials"
- "System MUST store user preferences persistently"
- "System MUST respond to API requests within 200ms"

**Don't Do This** ❌:
- "System MUST use JWT tokens with RS256 algorithm"
- "System MUST store data in PostgreSQL with UUID primary keys"
- "System MUST use Redis cache with 5-minute TTL"

Implementation details belong in `plan.md`, not `spec.md`.

### Step 7: Quality Validation

Before finalizing each spec, verify:

- [ ] 3-5 user stories with clear business value
- [ ] Each user story has 3 acceptance scenarios
- [ ] 5-10 edge cases identified
- [ ] 10-15 functional requirements (MUST, SHOULD, MAY)
- [ ] Key entities listed (if data-related feature)
- [ ] 8-12 measurable success criteria
- [ ] Non-functional requirements for performance, security, reliability
- [ ] 3-7 assumptions documented
- [ ] Dependencies clearly listed
- [ ] Out of scope items specified

### Step 8: Create All Specs

After analysis, you should create:

1. **List all features found** - Show me what features you identified
2. **Confirm priority** - Ask which features should be P0, P1, P2
3. **Create spec files** - Generate all `specs/F{NNN}-{feature-slug}/spec.md` files
4. **Summarize** - Show me a table of what was created

---

## Example Conversion

### From Reverse Engineering Doc:

```markdown
# API Documentation

## POST /api/auth/login

Authenticates a user with email and password. Returns JWT token on success.

**Request**:
{
  "email": "user@example.com",
  "password": "securepassword"
}

**Response**:
{
  "token": "eyJhbGc...",
  "user": { "id": 123, "name": "John" }
}

**Errors**:
- 401: Invalid credentials
- 429: Too many attempts
```

### Becomes Spec Kit Format:

```markdown
# Feature Specification: User Authentication

**Feature Branch**: `001-user-authentication`
**Created**: 2024-11-17
**Status**: Draft
**Priority**: P0

## User Scenarios & Testing

### User Story 1 - Secure Login (Priority: P0)

As a registered user, I need to log in with my email and password so that I can access my account securely.

**Why this priority**: Core authentication is critical path for all user features. Without login, users cannot access the application.

**Independent Test**: Can be tested by attempting login with valid credentials - should return authentication token and user data.

**Acceptance Scenarios**:

1. **Given** valid email and password, **When** user submits login request, **Then** system returns authentication token and user profile
2. **Given** invalid password, **When** user submits login request, **Then** system returns 401 error without exposing which field was wrong
3. **Given** too many failed attempts, **When** user submits login request, **Then** system returns 429 rate limit error

---

### Edge Cases

- What happens when email is valid but account is disabled?
- How does system handle concurrent login attempts from same account?
- What happens when database is unavailable during authentication?
- How are passwords with special characters handled?
- What happens when JWT secret key is rotated?

## Requirements

### Functional Requirements

- **FR-001**: System MUST accept email and password credentials via secure HTTPS endpoint
- **FR-002**: System MUST validate email format before authentication attempt
- **FR-003**: System MUST return authentication token upon successful credential verification
- **FR-004**: System MUST return user profile data with authentication token
- **FR-005**: System MUST return 401 status for invalid credentials without revealing which field failed
- **FR-006**: System MUST implement rate limiting to prevent brute force attacks
- **FR-007**: System MUST return 429 status when rate limit is exceeded
- **FR-008**: System MUST hash passwords using industry-standard algorithms
- **FR-009**: System MUST generate cryptographically secure tokens
- **FR-010**: System MUST log authentication attempts for security monitoring

### Key Entities

- **User**: Contains credentials, profile data, and account status
- **AuthenticationToken**: Secure token proving user identity and authorization
- **LoginAttempt**: Record of authentication attempts for rate limiting and auditing

## Success Criteria

### Measurable Outcomes

- **SC-001**: Login succeeds for valid credentials 99.9% of the time
- **SC-002**: Login request completes within 500ms at 95th percentile
- **SC-003**: Invalid login attempts return appropriate errors without data leakage
- **SC-004**: Rate limiting activates after configurable threshold (default: 5 attempts per 15 minutes)
- **SC-005**: Generated tokens remain valid for configured duration
- **SC-006**: Zero successful brute force attacks in security testing
- **SC-007**: All authentication events are logged with timestamp and outcome
- **SC-008**: System handles 1000 concurrent login requests without degradation

### Non-Functional Requirements

- **Performance**: Login requests must complete in under 500ms
- **Reliability**: Authentication service must maintain 99.9% uptime
- **Security**: Passwords must never be logged or exposed; all tokens cryptographically secure
- **Maintainability**: Authentication logic must be unit tested with 95%+ coverage
- **Usability**: Error messages must be helpful without revealing security information

## Assumptions

1. HTTPS is enforced at infrastructure level for all API endpoints
2. User accounts are pre-registered (this spec doesn't cover registration)
3. Database stores hashed passwords (not plaintext)
4. Infrastructure supports session/token storage
5. Rate limiting can be implemented at application or infrastructure level

## Dependencies

- User database with hashed credentials
- Token generation library (JWT or similar)
- Rate limiting service or middleware
- Logging infrastructure
- Email validation utilities

## Out of Scope

- User registration and account creation
- Password reset and recovery
- Multi-factor authentication (MFA)
- Social login (OAuth providers)
- Session management and logout
- Account lockout policies
- Password strength requirements (should be separate spec)

## References

- OWASP Authentication Guidelines
- RFC 7519 (JWT specification)
- CWE-307 (Improper Restriction of Excessive Authentication Attempts)
```

---

## Ready to Convert?

I'm ready to help! Here's what I need from you:

1. **Confirm repository location**: Where is your `docs/reverse-engineering/` directory?
2. **Read permissions**: Do I have access to read those files?
3. **Preferences**: Any specific features you want prioritized or excluded?

Once confirmed, I'll:
1. Read all reverse engineering documentation
2. Identify features
3. Create GitHub Spec Kit formatted specifications
4. Provide a summary of what was created

**Let's begin!** Tell me the repository path and I'll start the conversion.
