---
description: Translate portable component specs into targeted epics for a specific project. Maps abstract personas, domain language, and data contracts to a target project's BMAD docs.
---

# Portable Transplant

**IMPORTANT**: This translates portable extract specs into targeted epics for a specific project.

## Step 0: Verify Prerequisites

Two sets of inputs are required:

**Portable Extract (source):**
```bash
# Check for portable extract files
ls _portable-extract/epics.md _portable-extract/component-spec.md 2>/dev/null
# Or ask user for path if not in current directory
```

**Target BMAD Docs:**
```bash
# Check for target BMAD docs
ls _bmad-output/planning-artifacts/prd.md _bmad-output/planning-artifacts/architecture.md 2>/dev/null
# Or check docs/ directory
# Or ask user for path
```

If portable extract is missing: Run `/stackshift.portable-extract` on the source project first.
If target BMAD docs are missing: Create them via BMAD workflows or `/stackshift.bmad-synthesize`.

## Step 1: Translate Portable Specs to Target Context

Use the Skill tool with skill="portable-transplant".

**The skill will**:
- Read portable extract files (epics.md + component-spec.md)
- Read target BMAD docs (PRD + Architecture, optionally UX Design)
- Ask which mode: YOLO (automatic), Guided (recommended), or Interactive
- Map abstract personas to target personas
- Translate domain language (source terms -> target terms)
- Map data contracts to target data models
- Generate targeted epics written in the target's context
- Output targeted-epics.md and transplant-report.md to `_portable-transplant/`

## Step 2: Review and Use

After generation:
- Review targeted-epics.md in `_portable-transplant/`
- Check transplant-report.md for mapping details and items needing review
- Feed into BMAD: use as input for `*create-epics-stories` or `*create-story`
- Or use directly for implementation planning in the target stack
- Resolve items marked [REVIEW] or [TARGET OVERRIDE]
