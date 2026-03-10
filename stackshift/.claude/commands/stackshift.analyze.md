---
description: Gear 1 - Analyze codebase and detect tech stack
---

# Gear 1: Analysis

**IMPORTANT**: This command detects the tech stack and configures the project for all gears.

## Step 1: Detect Tech Stack, Route, and Framework

Use the Skill tool to detect tech stack:

Use the Skill tool with skill="analyze".

**The skill will**:
- Read file structure
- Detect frameworks from package.json
- Choose route (Greenfield/Brownfield)
- Choose implementation framework (GitHub Spec Kit / BMAD Auto-Pilot / BMAD Method / Architecture Only / Portable Extraction)
- Auto-detect app type (monorepo, Nx, etc.)
- Create analysis-report.md
- Save to .stackshift-state.json

**Framework choice determines workflow after Gear 2**:
- **GitHub Spec Kit**: Gears 3-6 create `.specify/` specs, use `/speckit.implement`
- **BMAD Auto-Pilot**: `/stackshift.bmad-synthesize` auto-generates BMAD artifacts (PRD, Architecture, Epics)
- **BMAD Method**: Hands off to `*workflow-init` for collaborative BMAD workflow
- **Architecture Only**: `/stackshift.architect` generates architecture.md with user constraints
- **Portable Extraction**: `/stackshift.portable-extract` generates portable epics + component spec

### Step 2: Run AST Analysis

Run AST analysis for deep, function-level code inspection:

```bash
node ~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**What AST analysis provides:**
- Function signature verification (not just "exists")
- Stub detection (functions returning placeholder text)
- Missing parameters detection
- Business logic pattern analysis
- Test coverage gaps
- Confidence scoring (0-100%)

Results are cached in `.stackshift-analysis/` and reused by all subsequent gears. This is the primary method for code inspection -- `/speckit.analyze` is a fallback if AST analysis is unavailable.
