---
description: Gear 4 - Analyze gaps and create prioritized implementation roadmap
---

# Gear 4: Gap Analysis

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

**This analyzes the codebase to identify implementation gaps.**

### Step 1: Run AST-Powered Analysis (PRIMARY METHOD)

Run AST analysis as the primary gap analysis method:

```bash
# Run AST-powered roadmap generation (includes gap analysis)
node ~/stackshift/scripts/run-ast-analysis.mjs roadmap . --format=markdown
```

**What AST analysis provides** (primary capabilities):
- Function signature verification (not just "exists")
- Stub detection (functions returning placeholder text)
- Missing parameters detection
- Business logic pattern analysis
- Test coverage gaps
- Confidence scoring (0-100%)
- Detailed roadmap with phases, priorities, and effort estimates

### Step 2: Run /speckit.analyze (FALLBACK)

**Only if AST analysis fails or is unavailable**, fall back to `/speckit.analyze`:

Use `/speckit.analyze` or the Skill tool with skill="gap-analysis" to analyze the codebase for gaps.

### Step 3: Review Gap Analysis

The roadmap shows:
- All features with implementation status (check/partial/missing)
- Confidence scores for each gap
- Prioritized implementation phases
- Effort estimates
- Missing functions, stubs, incomplete features

---

## Path B: BMAD Method (implementation_framework: bmad)

### BMAD Handles Gap Analysis Differently

BMAD's workflow (`*workflow-init`) handles gap analysis through its agents:
- **Analyst agent** reviews the `docs/` structure
- **PM agent** identifies gaps from `docs/prd.md`
- **Architect agent** analyzes technical gaps from `docs/architecture.md`

**Recommended**: Proceed to Gear 6 for BMAD handoff. Let BMAD agents handle their own gap analysis with the comprehensive docs StackShift generated.
