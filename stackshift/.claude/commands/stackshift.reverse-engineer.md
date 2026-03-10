---
description: Gear 2 - Extract comprehensive documentation from codebase
---

# Gear 2: Reverse Engineering

**IMPORTANT**: This extracts comprehensive documentation from the codebase.

## Step 1: Check Implementation Framework

Read the framework choice from Gear 1:

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Implementation Framework: ${IMPL_FRAMEWORK:-speckit}"
```

**Output is the same for all frameworks** — 11 docs in `docs/reverse-engineering/`.

## Step 2: Extract Documentation

Use the Skill tool with skill="reverse-engineer".

**The skill will**:
- Create 11 comprehensive documentation files
- Saves to `docs/reverse-engineering/`
- Includes 2 new inference docs: `business-context.md` and `decision-rationale.md`
- All docs enriched with personas, domain boundaries, scalability strategy, migration matrix

**11 Output Files:**
```
docs/reverse-engineering/
├── functional-specification.md   # Business logic + personas + positioning
├── integration-points.md         # External services, APIs, data flows
├── configuration-reference.md    # All config options
├── data-architecture.md          # Data models + domain boundaries
├── operations-guide.md           # Deployment + scalability strategy
├── technical-debt-analysis.md    # Issues + migration priority matrix
├── observability-requirements.md # Monitoring, logging
├── visual-design-system.md       # UI/UX patterns
├── test-documentation.md         # Testing requirements
├── business-context.md           # Product vision, personas, goals, market
└── decision-rationale.md         # Tech selection, ADRs, design principles
```

### Step 3: Run AST Analysis for Deep Extraction

Run AST analysis for function-level code extraction:

```bash
node ~/stackshift/scripts/run-ast-analysis.mjs analyze .
```

**What AST analysis provides:**
- Function signature verification (not just "exists")
- Stub detection (functions returning placeholder text)
- Missing parameters detection
- API endpoints extracted from routing code
- Function signatures documented accurately
- Business logic patterns identified through codebase exploration
- Test coverage gaps
- Confidence scoring (0-100%)

Results are cached in `.stackshift-analysis/` and reused by all subsequent gears. AST analysis is the primary method for code inspection -- `/speckit.analyze` is a fallback if AST analysis is unavailable.
