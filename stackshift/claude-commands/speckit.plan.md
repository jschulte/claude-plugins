---
name: speckit.plan
description: Create implementation plan for a feature
---

# Spec Kit: Create Implementation Plan

Generate detailed implementation plan for a feature.

## Input

**Feature name:** {{FEATURE_NAME}}
**Specification:** `specs/{{FEATURE_NAME}}.md`

## Process

### Step 1: Read Specification

Load specification and understand:
- Current status (COMPLETE/PARTIAL/MISSING)
- Acceptance criteria
- Business rules
- Dependencies

### Step 2: Assess Current State

What exists now?
- For PARTIAL: What's implemented vs missing?
- For MISSING: Starting from scratch?
- For COMPLETE: Why creating plan? (refactor? upgrade?)

### Step 3: Define Target State

What should exist after implementation?
- All acceptance criteria met
- All business rules enforced
- Tests passing
- Documentation updated

### Step 4: Determine Technical Approach

**For brownfield:**
- Use existing tech stack (from specification)
- Follow existing patterns
- Maintain consistency

**For greenfield:**
- Use target_stack from .stackshift-state.json
- Choose appropriate libraries
- Design architecture

**Outline approach:**
1. Backend changes needed
2. Frontend changes needed
3. Database changes needed
4. Configuration changes needed
5. Testing strategy

### Step 5: Break Down Into Phases

```markdown
## Implementation Phases

### Phase 1: Backend (Foundation)
- Database schema changes
- API endpoints
- Business logic
- Validation

### Phase 2: Frontend (UI)
- Page/route creation
- Component development
- API integration
- State management

### Phase 3: Testing
- Unit tests
- Integration tests
- E2E tests

### Phase 4: Polish
- Error handling
- Loading states
- Edge cases
- Documentation
```

### Step 6: Identify Risks

```markdown
## Risks & Mitigations

### Risk 1: [Description]
- **Impact:** [What could go wrong]
- **Probability:** High/Medium/Low
- **Mitigation:** [How to prevent/handle]

### Risk 2: [Description]
...
```

### Step 7: Define Success Criteria

```markdown
## Success Criteria

- [ ] All acceptance criteria from specification met
- [ ] Tests passing (unit, integration, E2E)
- [ ] No new bugs introduced
- [ ] Performance within acceptable range
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Specification status updated to COMPLETE
```

---

## Output Template

Save to: `specs/{{FEATURE_NAME}}-impl.md`

```markdown
# Implementation Plan: {{FEATURE_NAME}}

**Feature Spec:** `specs/{{FEATURE_NAME}}.md`
**Created:** {{DATE}}
**Status:** {{CURRENT_STATUS}}
**Target:** ✅ COMPLETE

---

## Goal

[Clear statement of what needs to be accomplished]

## Current State

{{#if status == 'MISSING'}}
**Not started:**
- No implementation exists
- Starting from scratch
{{/if}}

{{#if status == 'PARTIAL'}}
**What exists:**
- ✅ [Component 1]
- ✅ [Component 2]

**What's missing:**
- ❌ [Component 3]
- ❌ [Component 4]
{{/if}}

## Target State

After implementation:
- All acceptance criteria met
- Full feature functionality
- Tests passing
- Production-ready

## Technical Approach

### Architecture

[Describe overall approach]

### Technology Choices

{{#if greenfield}}
**Stack:** [From .stackshift-state.json target_stack]
- Framework: [choice]
- Database: [choice]
- Libraries: [list]
{{/if}}

{{#if brownfield}}
**Existing Stack:** [From specification]
- Maintain consistency with current implementation
- Use existing patterns and libraries
{{/if}}

### Implementation Steps

1. **Backend Implementation**
   - Create/modify API endpoints
   - Implement business logic
   - Add database models/migrations
   - Add validation

2. **Frontend Implementation**
   - Create pages/routes
   - Build components
   - Integrate with backend API
   - Add state management

3. **Testing**
   - Write unit tests
   - Write integration tests
   - Write E2E tests

4. **Configuration**
   - Add environment variables
   - Update configuration files
   - Update routing

## Detailed Tasks

[High-level tasks - use `/speckit.tasks` to break down further]

### Backend
- [ ] Task 1
- [ ] Task 2

### Frontend
- [ ] Task 3
- [ ] Task 4

### Testing
- [ ] Task 5
- [ ] Task 6

## Risks & Mitigations

### Risk: [Description]
- **Impact:** [What could go wrong]
- **Mitigation:** [Prevention strategy]

## Dependencies

**Must be complete before starting:**
- [Dependency 1]
- [Dependency 2]

**Blocks these features:**
- [Feature that depends on this]

## Effort Estimate

- Backend: ~X hours
- Frontend: ~Y hours
- Testing: ~Z hours

**Total:** ~W hours

## Testing Strategy

### Unit Tests
- Test business logic in isolation
- Mock external dependencies
- Target: 80%+ coverage

### Integration Tests
- Test API endpoints with real database (test DB)
- Verify data persistence
- Test error conditions

### E2E Tests
- Test complete user flows
- Critical paths must pass
- Use realistic data

## Success Criteria

- [ ] All acceptance criteria met
- [ ] All tests passing (X/X)
- [ ] No TypeScript/linting errors
- [ ] Code review approved
- [ ] Performance acceptable
- [ ] Security review passed (if sensitive)
- [ ] Documentation updated
- [ ] Specification status: ✅ COMPLETE

## Rollback Plan

If implementation fails:
- [How to undo changes]
- [Database rollback if needed]
- [Feature flag to disable]

---

**Ready for execution:** Use `/speckit.tasks` to generate task checklist, then `/speckit.implement` to execute.
```

---

## Notes

- Plans should be detailed but not prescriptive about every line of code
- Leave room for implementation decisions
- Focus on what needs to be done, not exact how
- Include enough detail for `/speckit.tasks` to generate atomic tasks
- Consider risks and dependencies
- For greenfield: Use target stack from configuration
- For brownfield: Follow existing patterns
