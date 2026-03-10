---
description: Extract tech-agnostic portable component specs (epics + component spec) from reverse-engineering docs. Output can be dropped into ANY BMAD project.
---

# Portable Component Extraction

**IMPORTANT**: This generates portable, tech-agnostic component specs from StackShift's reverse-engineering docs.

## Step 0: Verify Prerequisites

```bash
# Check that reverse-engineering docs exist
ls docs/reverse-engineering/*.md 2>/dev/null | wc -l
```

If fewer than 9 docs: Run `/stackshift.reverse-engineer` first.

## Step 1: Generate Portable Artifacts

Use the Skill tool with skill="portable-extract".

**The skill will**:
- Read all 11 reverse-engineering docs
- Ask which mode: YOLO (automatic), Guided (recommended), or Interactive
- Abstract personas to [User], [Admin], [System]
- Filter out non-portable stories (tech debt, CI/CD, platform-specific)
- Extract business rules, data contracts, edge cases
- Generate epics.md and component-spec.md in `_portable-extract/`
- Output portability report with extraction summary

## Step 2: Review and Use

After generation:
- Review artifacts in `_portable-extract/`
- Copy to your target project
- Adapt persona definitions for new context
- Use as input for BMAD workflows, Spec Kit specs, or direct implementation

### Next Steps

1. **For BMAD projects**: Feed `epics.md` into `*create-epics-stories` or `*workflow-init`
2. **For Spec Kit projects**: Convert `component-spec.md` into `.specify/` feature specs
3. **For direct implementation**: Use both files as requirements for any tech stack
