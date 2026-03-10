---
description: Cruise Control - Automatically run all 6 gears in sequence
---

# Cruise Control: Automatic Mode

**IMPORTANT**: This runs all 6 gears automatically in sequence.

## Step 1: Run All 6 Gears Sequentially

Use the Skill tool with skill="cruise-control".

**The skill will run** (varies by framework choice):

### GitHub Spec Kit Path
1. **Gear 1**: Detect tech stack + route + framework
2. **Gear 2**: Extract documentation
3. **Gear 3**: Create specs (auto-detects status from codebase)
4. **Gear 4**: Gap analysis
5. **Gear 5**: Complete specs (evidence-based)
6. **Gear 6**: Implement + verify

### BMAD Method Path
1. **Gear 1**: Detect tech stack + route + framework
2. **Gear 2**: Extract documentation in BMAD `docs/` format
3-5. **Skipped**: BMAD agents handle specs/gaps/clarifications
6. **Gear 6**: Handoff to BMAD `*workflow-init`

### Portable Extraction Path
1. **Gear 1**: Detect tech stack + route + framework
2. **Gear 2**: Extract all 11 documentation files
3-5. **Replaced**: Portable extraction generates abstract epics + component spec
6. **Done**: Portable artifacts in `_portable-extract/`

### Step 0: Run AST Analysis

Run AST analysis before starting the gear sequence:

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

Results are cached in `.stackshift-analysis/` and reused by all subsequent gears automatically. AST analysis is the primary method for code inspection -- `/speckit.analyze` is a fallback if AST analysis is unavailable.

**Like automatic transmission**: Set route and framework, StackShift handles everything.
