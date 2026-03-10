# Task Generation (Thoroughness Level 3 Only)

Execute this operation AFTER plans are verified. Skip entirely if GENERATE_TASKS is false.

---

## Process

### 1. Scan for Plans

```bash
find .specify/specs -name "plan.md" -type f | sort
```

### 2. Generate Tasks in Parallel (3 at a time)

Task generation is slower due to target length (300-500 lines). Limit parallelism to 3.

For each plan, dispatch a subagent:

```javascript
Task({
  subagent_type: 'general-purpose',
  model: 'sonnet',
  description: `Create tasks for ${featureName}`,
  prompt: `
    Read: .specify/specs/${featureId}/spec.md
    Read: .specify/specs/${featureId}/plan.md
    Read: skills/create-specs/operations/templates.md (tasks.md section)

    Generate COMPREHENSIVE task breakdown following the tasks.md template:
    - Break into 5-10 logical phases
    - Each task has: status, file path, acceptance criteria, code examples
    - Include Testing phase (unit, integration, E2E)
    - Include Documentation phase
    - Include Edge Cases section
    - Include Dependencies section
    - Include Acceptance Checklist
    - Include Priority Actions

    Target: 300-500 lines (be thorough!)

    Save to: .specify/specs/${featureId}/tasks.md
  `
});
```

### 3. Verify Quality

```bash
# Check each tasks.md length
for f in $(find .specify/specs -name "tasks.md" -type f); do
  LINES=$(wc -l < "$f")
  FEATURE=$(basename $(dirname "$f"))
  if [ "$LINES" -lt 200 ]; then
    echo "WARNING: $FEATURE/tasks.md is only $LINES lines (target: 300-500)"
  else
    echo "OK: $FEATURE/tasks.md - $LINES lines"
  fi
done
```

Flag any tasks.md under 200 lines as potentially incomplete.

Log: "PROGRESS: Task generation complete. [N] task files generated, avg [M] lines."
