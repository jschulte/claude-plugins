---
description: Multi-repo synthesis - load docs from multiple repos, extract capability map, brainstorm a reimagined system. The killer feature for enterprise modernization.
---

# Reimagine

**IMPORTANT**: This takes reverse-engineering docs from multiple repos and helps you reimagine them as a new, unified system.

## Step 0: Verify Prerequisites

Ensure you have reverse-engineering docs from 2+ repos. Either:
- Run `/stackshift.batch` first on multiple repos
- Or have manually run `/stackshift.reverse-engineer` on multiple repos

## Step 1: Reimagine

Use the Skill tool with skill="reimagine".

**The skill will**:
- Load reverse-engineering docs from all specified repos
- Generate a unified capability map (what each repo does)
- Identify duplication, overlap, and pain points
- Run a brainstorming session with you
- Generate new specifications for the reimagined system

## Step 2: Build from Vision

After reimagination:
- Review VISION.md and CAPABILITY_MAP.md
- Use `/stackshift.architect` to detail the architecture with constraints
- Use `/stackshift.bmad-synthesize` or `/stackshift.create-specs` for formal specs
- Implement the reimagined system
