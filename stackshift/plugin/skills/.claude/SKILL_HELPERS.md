# Skill Helper Functions

Internal guidelines for Claude when using RE Toolkit skills.

## Workflow State Management

### Auto-Tracking Progress

When a skill completes, automatically update the workflow state:

```javascript
// After completing a step
const { exec } = require('child_process');
exec('node ${CLAUDE_PLUGIN_ROOT}/scripts/state-manager.js complete <step-id>');
```

### Checking Progress

Before starting a skill, check current progress:

```javascript
// Get current status
exec('node ${CLAUDE_PLUGIN_ROOT}/scripts/state-manager.js status', (err, stdout) => {
  const status = JSON.parse(stdout);
  // Use status to determine next steps
});
```

### State File Location

State is stored in project root as `.stackshift-state.json`:

```json
{
  "version": "1.0.0",
  "created": "2024-01-15T10:30:00.000Z",
  "updated": "2024-01-15T11:45:00.000Z",
  "currentStep": "create-specs",
  "completedSteps": ["analyze", "reverse-engineer"],
  "metadata": {
    "projectName": "my-app",
    "projectPath": "/path/to/my-app"
  },
  "stepDetails": {
    "analyze": {
      "started": "2024-01-15T10:30:00.000Z",
      "completed": "2024-01-15T10:35:00.000Z",
      "status": "completed"
    },
    "reverse-engineer": {
      "started": "2024-01-15T10:35:00.000Z",
      "completed": "2024-01-15T11:05:00.000Z",
      "status": "completed"
    },
    "create-specs": {
      "started": "2024-01-15T11:05:00.000Z",
      "status": "in_progress"
    }
  }
}
```

## Skill Invocation Patterns

### Sequential Workflow

Skills should check if prerequisites are met:

```markdown
## When to Use This Skill

**Prerequisites:**
- Step N-1 must be completed
- Output file X must exist

**Auto-checks:**
1. Load state file
2. Verify completedSteps includes prerequisite
3. Verify output files exist
4. If not met, guide user to complete prerequisites first
```

### Resume Capability

If a skill was interrupted, it should be able to resume:

```markdown
## Resume Logic

1. Check if output files partially exist
2. Ask user: "I see you've started this step. Resume or start over?"
3. If resume: Skip completed parts, continue from where left off
4. If start over: Warn about overwriting, then proceed
```

## Progress Reporting

### Start of Skill

When skill activates:
```markdown
Starting Step N: [Skill Name]
Progress: N/6 steps completed (X%)
```

### During Skill

Show sub-progress:
```markdown
Step N.1: [Sub-task] ✅ Complete
Step N.2: [Sub-task] 🔄 In progress...
Step N.3: [Sub-task] ⏳ Pending
```

### End of Skill

When skill completes:
```markdown
✅ Step N Complete: [Skill Name]

Output:
- [File 1] created
- [File 2] created

Progress: N/6 steps completed (X%)

Next Step: Use the `[next-skill]` skill to [description]
```

## Error Handling

### Missing Prerequisites

```markdown
❌ Cannot start Step N: Prerequisites not met

Missing:
- Step [X] must be completed first
- File [Y] must exist

Recommendation:
Run the `[prerequisite-skill]` skill first.
```

### Partial Completion

```markdown
⚠️ Step N partially complete

Found existing files:
- [File 1] ✅
- [File 2] ❌ Missing

Would you like to:
1. Resume and complete missing parts
2. Start over (overwrites existing files)
3. Skip this step (if already complete elsewhere)
```

## Cross-Skill References

### Linking to Other Skills

In skill documentation, reference related skills:

```markdown
See also:
- Previous: `[prev-skill]` - [Description]
- Next: `[next-skill]` - [Description]
- Related: `[related-skill]` - [Description]
```

### Workflow Visualization

Show where user is in the process:

```markdown
Workflow Progress:
1. ✅ analyze
2. ✅ reverse-engineer
3. 🔄 create-specs       ← You are here
4. ⏳ gap-analysis
5. ⏳ complete-spec
6. ⏳ implement
```

## Template Access

### Loading Templates

Skills can access templates from plugin:

```javascript
const templatePath = '${CLAUDE_PLUGIN_ROOT}/../templates/[template-name].md';
// Read and use template
```

### Template Variables

When using templates, replace these variables:

- `{{PROJECT_NAME}}` - From state.metadata.projectName
- `{{CURRENT_DATE}}` - ISO date
- `{{STEP_NUMBER}}` - Current step number (1-6)
- `{{TOTAL_STEPS}}` - Total steps (6)

## Best Practices

### Skill Activation

1. **Check state first** - Verify prerequisites
2. **Show progress** - Let user know where they are
3. **Confirm action** - Ask before overwriting files
4. **Update state** - Mark step as started
5. **Generate output** - Create expected files
6. **Validate output** - Verify files created successfully
7. **Mark complete** - Update state to completed
8. **Guide next step** - Tell user what to do next

### User Communication

- Be encouraging and supportive
- Show clear progress indicators
- Explain what's happening at each step
- Provide estimates of time/effort
- Offer choices when applicable
- Confirm understanding before proceeding

### Error Recovery

- Don't fail silently
- Provide clear error messages
- Suggest solutions
- Offer to retry or skip
- Never leave user stuck

## State Transitions

```
null → analyze → reverse-engineer → create-specs → gap-analysis → complete-spec → implement → null
  ↑                                                                                           ↓
  └───────────────────────────────────────────────────────────────────────────────────────────┘
                                    (reset)
```

Each skill:
1. Validates current state
2. Executes its task
3. Updates state
4. Points to next skill
