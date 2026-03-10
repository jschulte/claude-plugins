---
description: Generate architecture document from reverse-engineering docs + your constraints. Includes Mermaid diagrams, ADRs, and infrastructure recommendations.
---

# Architecture Generator

**IMPORTANT**: This generates a complete architecture document based on reverse-engineering docs and your constraints.

## Step 0: Verify Prerequisites

```bash
# Check that reverse-engineering docs exist
ls docs/reverse-engineering/*.md 2>/dev/null | wc -l
```

If fewer than 9 docs: Run `/stackshift.reverse-engineer` first.

## Step 1: Generate Architecture

Use the Skill tool with skill="architect".

**The skill will**:
- Read all reverse-engineering docs
- Ask 3-5 constraint questions (tech stack, cloud, scale, hard constraints)
- Generate architecture.md with Mermaid diagrams, ADRs, service boundaries
- Write to project root or `_bmad-output/planning-artifacts/`

## Step 2: Review

After generation:
- Review architecture document and Mermaid diagrams
- Validate ADRs capture key decisions
- Check cost estimates and scaling strategy
