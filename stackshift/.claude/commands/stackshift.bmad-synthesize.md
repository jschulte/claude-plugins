---
description: Auto-generate BMAD artifacts (PRD, Architecture, Epics, UX Design) from reverse-engineering docs. Three modes - YOLO, Guided, Interactive.
---

# BMAD Synthesize

**IMPORTANT**: This generates BMAD planning artifacts from StackShift's reverse-engineering docs.

## Step 0: Verify Prerequisites

```bash
# Check that reverse-engineering docs exist
ls docs/reverse-engineering/*.md 2>/dev/null | wc -l
```

If fewer than 9 docs: Run `/stackshift.reverse-engineer` first.

## Step 1: Generate BMAD Artifacts

Use the Skill tool with skill="bmad-synthesize".

**The skill will**:
- Read all 11 reverse-engineering docs
- Ask which mode: YOLO (automatic), Guided (recommended), or Interactive
- Map docs to BMAD artifacts: prd.md, architecture.md, epics.md, ux-design-specification.md
- Write to `_bmad-output/planning-artifacts/`
- Generate synthesis report with coverage percentages

## Step 2: Review or Hand Off

After generation:
- Review artifacts in `_bmad-output/planning-artifacts/`
- Optionally refine with BMAD agents: `npx bmad-method@alpha install && *workflow-init`
- Or use artifacts directly for implementation planning
