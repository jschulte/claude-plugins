# Plan Generation (Thoroughness Level 2+)

Execute this operation AFTER specs are verified. Skip entirely if GENERATE_PLANS is false.

---

## Process

### 1. Scan Specs Directory

```bash
find .specify/specs -name "spec.md" -type f | sort
```

### 2. Identify Incomplete Features

Parse the Status section from each spec.md. Filter for:
- PARTIAL features (partially implemented)
- MISSING features (not started)

Skip COMPLETE features -- they do not need implementation plans.

Log: "PROGRESS: Found [N] incomplete features requiring plans."

### 3. Generate Plans in Parallel (5 at a time)

For each PARTIAL/MISSING feature, dispatch a subagent:

```javascript
Task({
  subagent_type: 'general-purpose',
  model: 'sonnet',
  description: `Create plan for ${featureName}`,
  prompt: `
    Read: .specify/specs/${featureId}/spec.md
    Read: skills/create-specs/operations/templates.md (plan.md section)

    Generate implementation plan following the plan.md template:
    - Assess current state (what exists vs missing)
    - Define target state (all acceptance criteria)
    - Determine technical approach
    - Break into implementation phases
    - Identify risks and mitigations
    - Define success criteria

    Save to: .specify/specs/${featureId}/plan.md

    Target: 300-500 lines, detailed but not prescriptive
  `
});
```

### 4. Verify Coverage

```bash
# Count plans vs incomplete specs
INCOMPLETE=$(grep -rl "PARTIAL\|MISSING" .specify/specs/*/spec.md | wc -l)
PLANS=$(find .specify/specs -name "plan.md" -type f | wc -l)
echo "Plans: $PLANS / Incomplete specs: $INCOMPLETE"
```

Confirm every PARTIAL/MISSING spec has a corresponding plan.md. Report any gaps.

Log: "PROGRESS: Plan generation complete. [N] plans generated for [M] incomplete features."
