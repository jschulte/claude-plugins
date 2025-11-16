---
name: speckit.specify
description: Create new feature specification
---

# Spec Kit: Create Feature Specification

Create a new feature specification in GitHub Spec Kit format.

## Input

**Feature name:** {{FEATURE_NAME}}

## Process

### Step 1: Gather Requirements

Ask the user about the feature:

```
I'll help you create a specification for: {{FEATURE_NAME}}

Let's define this feature:

1. What does this feature do? (Overview)
2. Who is it for? (User type)
3. What problem does it solve? (Value proposition)
4. What are the key capabilities? (User stories)
5. How will we know it's done? (Acceptance criteria)
6. What are the business rules? (Validation, authorization, etc.)
7. What are the dependencies? (Other features required)
8. What's the priority? (P0/P1/P2/P3)
```

### Step 2: Define User Stories

Format: "As a [user type], I want [capability] so that [benefit]"

```markdown
## User Stories

- As a user, I want to [capability] so that [benefit]
- As a user, I want to [capability] so that [benefit]
- As an admin, I want to [capability] so that [benefit]
```

### Step 3: Define Acceptance Criteria

Specific, testable criteria:

```markdown
## Acceptance Criteria

- [ ] User can [action]
- [ ] System validates [condition]
- [ ] Error shown when [invalid state]
- [ ] Data persists after [action]
```

### Step 4: Define Business Rules

```markdown
## Business Rules

- BR-001: [Validation rule]
- BR-002: [Authorization rule]
- BR-003: [Business logic rule]
```

### Step 5: Check Route and Add Technical Details

**If brownfield (tech-prescriptive):**

Ask about implementation:
```
For brownfield route, I need implementation details:

1. What API endpoints? (paths, methods)
2. What database models? (schema)
3. What UI components? (file paths)
4. What dependencies? (libraries, versions)
5. Implementation status? (COMPLETE/PARTIAL/MISSING)
```

Add technical implementation section.

**If greenfield (tech-agnostic):**

Skip implementation details, focus on business requirements only.

### Step 6: Create Specification File

Save to: `specs/{{FEATURE_NAME}}.md`

**Template:**

```markdown
# Feature: {{FEATURE_NAME}}

## Status
[❌ MISSING | ⚠️ PARTIAL | ✅ COMPLETE]

## Overview
[Clear description of what this feature does]

## User Stories
- As a [user], I want [capability] so that [benefit]
- As a [user], I want [capability] so that [benefit]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## Business Rules
- BR-001: [Rule description]
- BR-002: [Rule description]

## Non-Functional Requirements
- Performance: [requirement]
- Security: [requirement]
- Accessibility: [requirement]

{{#if brownfield}}
## Current Implementation

### Tech Stack
- Framework: [name version]
- Libraries: [list]

### API Endpoints
- [METHOD] /api/path
  - Handler: [file path]

### Database Schema
\`\`\`prisma
model Name {
  [schema]
}
\`\`\`

### Implementation Files
- [file path] ([description])
- [file path] ([description])

### Dependencies
- [library]: [version]
{{/if}}

## Dependencies
- [Other Feature] (required)
- [External Service] (required)

## Related Specifications
- [related-spec.md]

## Implementation Plan
See: `specs/{{FEATURE_NAME}}-impl.md`

## Notes
[Any additional context, gotchas, or considerations]
```

### Step 7: Create Implementation Plan (if PARTIAL or MISSING)

If status is not COMPLETE, create implementation plan:

`specs/{{FEATURE_NAME}}-impl.md`

See `/speckit.plan` for implementation plan template.

---

## Output

```markdown
✅ Feature specification created

**File:** `specs/{{FEATURE_NAME}}.md`
**Status:** {{STATUS}}
**Priority:** {{PRIORITY}}

**Summary:**
- User stories: X
- Acceptance criteria: Y
- Business rules: Z
{{#if brownfield}}
- Implementation files: N
{{/if}}

{{#if status != 'COMPLETE'}}
**Implementation Plan:** `specs/{{FEATURE_NAME}}-impl.md`
{{/if}}

**Next Steps:**
- Review specification for accuracy
- Create related specifications if needed
- Use `/speckit.plan` to create/update implementation plan
```

---

## Notes

- Follow GitHub Spec Kit format conventions
- Use status markers: ✅ ⚠️ ❌
- For brownfield: Include complete technical details
- For greenfield: Focus on business requirements only
- Cross-reference related specifications
- Create implementation plan for non-complete features
