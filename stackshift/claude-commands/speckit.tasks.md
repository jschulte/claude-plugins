---
description: Generate actionable tasks from implementation plan for a feature
---

# Generate Tasks for Feature

Read the implementation plan and generate atomic, actionable task list.

## Input

Feature directory: `specs/{{FEATURE_ID}}/`

## Process

1. **Read the plan:**
   ```bash
   cat specs/{{FEATURE_ID}}/plan.md
   ```

2. **Generate atomic tasks:**
   - Each task should be specific (exact file to create/modify)
   - Testable (has clear acceptance criteria)
   - Atomic (can be done in one step)
   - Ordered by dependencies

3. **Create tasks.md:**
   ```bash
   # Save to specs/{{FEATURE_ID}}/tasks.md
   ```

## Output Format

```markdown
# Tasks: {{FEATURE_NAME}}

Based on: specs/{{FEATURE_ID}}/plan.md

## Tasks

- [ ] Create component (path/to/file.tsx)
- [ ] Add API endpoint (path/to/route.ts)
- [ ] Write tests (path/to/test.ts)
- [ ] Update documentation

## Dependencies

1. Task X must complete before Task Y

## Estimated Effort

Total: ~X hours
```

## Notes

- Break down into atomic, testable tasks
- Include file paths
- Order by dependencies
- Each task completable independently where possible
