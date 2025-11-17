---
name: speckit.implement
description: Implement feature from specification and plan
---

# Spec Kit: Implement Feature

Systematically implement a feature from its specification and implementation plan.

## Inputs

**Feature name:** 008-user-profile/tasks.md

**Files to read:**
- Specification: `specs/specs/008-user-profile/tasks.md`
- Implementation Plan: `specs/specs/008-user-profile/tasks.md`
## Implementation Process

### Step 1: Review Specification

Read `specs/specs/008-user-profile/tasks.md`:

- Understand the feature overview
- Read all user stories
- Review acceptance criteria (these are your tests!)
- Note dependencies on other features
- Check current status (COMPLETE/PARTIAL/MISSING)

### Step 2: Review Implementation Plan

Read `specs/specs/008-user-profile/tasks.md`:

- Understand current vs target state
- Review technical approach
- Read the task list
- Note risks and mitigations
- Review testing strategy

### Step 3: Execute Tasks Systematically

For each task in the implementation plan:

1. **Read the task description**
2. **Implement the task:**
   - Create/modify files as needed
   - Follow existing code patterns
   - Use appropriate frameworks/libraries
   - Add proper error handling
   - Include logging where appropriate

3. **Test the task:**
   - Run relevant tests
   - Manual testing if needed
   - Verify acceptance criteria

4. **Mark task complete:**
   - Update task checklist
   - Note any issues or deviations

5. **Continue to next task**

### Step 4: Validate Against Acceptance Criteria

After all tasks complete, verify each acceptance criterion:

```markdown
## Acceptance Criteria Validation

- [x] User can register with email/password
  ✅ Tested: Registration form works, user created in DB

- [x] Passwords meet complexity requirements
  ✅ Tested: Weak passwords rejected with proper error message

- [x] Verification email sent
  ✅ Tested: Email sent via SendGrid, token valid for 24h

- [ ] User can reset password
  ❌ NOT IMPLEMENTED: Deferred to future sprint
```

### Step 5: Run Tests

Execute test suite:

```bash
# Run unit tests
npm test

# Run integration tests (if available)
npm run test:integration

# Run E2E tests for this feature (if available)
npm run test:e2e
```

Report test results:
- Tests passing: X/Y
- New tests added: Z
- Coverage: X%

### Step 6: Update Specification Status

Update `specs/specs/008-user-profile/tasks.md`:

**If fully implemented:**
```markdown
## Status
✅ **COMPLETE** - Fully implemented and tested

## Implementation Complete

- Date: [current date]
- All acceptance criteria met
- Tests passing: X/X
- No known issues
```

**If partially implemented:**
```markdown
## Status
⚠️ **PARTIAL** - Core functionality complete, missing: [list]

## Implementation Status

**Completed:**
- ✅ [What was implemented]

**Still Missing:**
- ❌ [What's still needed]

**Reason:** [Why not fully complete]
```

### Step 7: Commit Changes

Create commit with reference to specification:

```bash
git add .
git commit -m "feat: implement specs/008-user-profile/tasks.md (specs/008-user-profile/tasks.md)

Implemented from specification: specs/specs/008-user-profile/tasks.md

Completed:
- [Task 1]
- [Task 2]
- [Task 3]

Tests: X passing
Status: COMPLETE"
```

---

## Output Format

Provide summary:

```markdown
## Implementation Complete: specs/008-user-profile/tasks.md

### Tasks Completed
- [x] Task 1: [description] (file.ts)
- [x] Task 2: [description] (file2.ts)
- [x] Task 3: [description]

### Files Created/Modified
- src/feature/component.ts (142 lines)
- src/api/endpoint.ts (78 lines)
- tests/feature.test.ts (95 lines)

### Tests
- Unit tests: 12/12 passing ✅
- Integration tests: 3/3 passing ✅
- Coverage: 87%

### Acceptance Criteria
- [x] Criterion 1 ✅
- [x] Criterion 2 ✅
- [x] Criterion 3 ✅

### Status Update
- Previous: ❌ MISSING
- Now: ✅ COMPLETE

### Commit
✅ Committed: feat: implement specs/008-user-profile/tasks.md

### Next Steps
Ready to shift into next feature or run `/speckit.analyze` to validate.
```

---

## Error Handling

If implementation fails:
- Save progress (mark completed tasks)
- Update spec with partial status
- Document blocker
- Provide recommendations

If tests fail:
- Fix issues before marking complete
- Update spec if acceptance criteria need adjustment
- Document test failures

---

## Notes

- Work incrementally (one task at a time)
- Test frequently (after each task if possible)
- Commit early and often
- Update spec status accurately
- Cross-reference related specs
- For greenfield: Use target_stack from state
- For brownfield: Maintain existing patterns and stack
