---
name: speckit.tasks
description: Generate actionable tasks from implementation plan
---

# Spec Kit: Generate Tasks

Read implementation plan and generate atomic, actionable task list.

## Input

**Implementation plan:** `specs/{{PLAN_NAME}}.md`

## Process

### Step 1: Read the Plan

Load `specs/{{PLAN_NAME}}.md`:
- Understand the goal
- Review current vs target state
- Read technical approach
- Note any existing tasks

### Step 2: Break Down Into Atomic Tasks

Generate specific, actionable tasks:

**Criteria for good tasks:**
- **Specific:** Exact file to create/modify
- **Atomic:** Can be completed in one step
- **Testable:** Has clear acceptance criteria
- **Ordered:** Dependencies clear

**Example:**
```markdown
## Tasks

- [ ] Create LoginPage component (app/login/page.tsx)
  - Acceptance: User can enter email/password, submit triggers API call

- [ ] Add Zod validation schema (lib/validation/auth.ts)
  - Acceptance: Email format validated, password min 8 chars

- [ ] Implement login API endpoint (app/api/auth/login/route.ts)
  - Acceptance: Returns JWT on valid credentials, 401 on invalid

- [ ] Create useAuth hook (hooks/useAuth.ts)
  - Acceptance: Provides login function, loading state, error state

- [ ] Add login route (app/layout.tsx)
  - Acceptance: /login route accessible, protected routes redirect if not authenticated
```

### Step 3: Identify Dependencies

List tasks that must be done in order:
```markdown
## Dependencies

1. Zod schema must exist before API endpoint (for validation)
2. API endpoint must work before useAuth hook (hook calls it)
3. useAuth must exist before LoginPage (page uses it)

## Suggested Order

1. Zod validation schema
2. API endpoint
3. useAuth hook
4. LoginPage component
5. Route configuration
```

### Step 4: Add Acceptance Criteria

For each task, define how to know it's done:

```markdown
- [ ] Task name
  - **Acceptance:** Specific, testable criteria
  - **Test:** How to verify (unit test, manual test, etc.)
  - **Files:** Exact file paths
```

### Step 5: Estimate Effort (Optional)

```markdown
## Effort Estimates

- Create LoginPage: ~30 minutes
- Add Zod schema: ~15 minutes
- Implement API endpoint: ~45 minutes
- Create useAuth hook: ~30 minutes
- Add routing: ~15 minutes

**Total:** ~2.5 hours
```

---

## Output Format

```markdown
# Tasks: {{FEATURE_NAME}}

**Based on:** `specs/{{PLAN_NAME}}.md`
**Generated:** {{DATE}}

## Tasks Checklist

### Backend

- [ ] Create API endpoint (app/api/feature/route.ts)
  - Acceptance: Responds with 200, returns expected data
  - Test: Integration test passing

- [ ] Add database model (prisma/schema.prisma)
  - Acceptance: Model matches specification
  - Test: Migration runs successfully

- [ ] Implement business logic (lib/services/feature.ts)
  - Acceptance: All business rules enforced
  - Test: Unit tests passing

### Frontend

- [ ] Create page component (app/feature/page.tsx)
  - Acceptance: Page renders, shows data from API
  - Test: Component test passing

- [ ] Create UI components (components/Feature*.tsx)
  - Acceptance: Components match design system
  - Test: Storybook stories passing

- [ ] Add API integration (lib/api/feature.ts)
  - Acceptance: Calls backend endpoint, handles errors
  - Test: Mock API test passing

### Testing

- [ ] Write unit tests (lib/services/feature.test.ts)
  - Acceptance: 80%+ coverage of business logic

- [ ] Write integration tests (tests/integration/feature.test.ts)
  - Acceptance: API endpoint tests passing

- [ ] Write E2E test (tests/e2e/feature.spec.ts)
  - Acceptance: User flow test passing

### Configuration

- [ ] Add environment variables (.env.example)
  - Acceptance: All required vars documented

- [ ] Update routing (app/layout.tsx)
  - Acceptance: Feature accessible at correct path

## Dependencies

1. Backend must be complete before frontend integration
2. Database model must exist before API endpoint
3. API must work before UI can call it

## Total Tasks: X

## Estimated Effort: Y hours

## Ready for Implementation

Use `/speckit.implement {{FEATURE_NAME}}` to execute these tasks.
```

---

## Notes

- Generate realistic task breakdown
- Don't skip testing tasks
- Include configuration changes
- Be specific about file paths
- Order tasks logically
- Each task should be completable independently (where possible)
