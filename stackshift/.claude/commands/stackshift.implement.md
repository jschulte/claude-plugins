---
description: Gear 6 - Implement features from specifications
---

# Gear 6: Implementation

**IMPORTANT**: Behavior depends on `implementation_framework` from Gear 1.

## Step 0: Check Implementation Framework

```bash
IMPL_FRAMEWORK=$(cat .stackshift-state.json 2>/dev/null | grep -o '"implementation_framework"[^,]*' | cut -d'"' -f4)
echo "Framework: ${IMPL_FRAMEWORK:-speckit}"
```

---

## Path A: GitHub Spec Kit (implementation_framework: speckit)

### Step 1: Implement Features

Use the Skill tool with skill="implement".

**The skill will**:
- Build features using `/speckit.tasks` and `/speckit.implement`
- Only implement PARTIAL and MISSING features
- Follow spec requirements exactly

### Step 2: Verify Implementation

After implementing each feature, verify the state:

```bash
cat .stackshift-state.json
```

**What to check**:
- Functions exist with correct signatures
- No stubs remaining
- Test files created

---

## Path B: BMAD Auto-Pilot (implementation_framework: bmad-autopilot)

### BMAD Artifacts Already Generated

If you ran `/stackshift.bmad-synthesize` (or cruise control did it automatically), BMAD artifacts are ready:

```
_bmad-output/planning-artifacts/
├── prd.md                       # Product Requirements Document
├── architecture.md              # Technical Architecture + ADRs
├── epics.md                     # Epic & Story Breakdown
└── ux-design-specification.md   # UX Design Requirements
```

### Next Steps

1. **Use artifacts directly** for implementation planning
2. **Or refine with BMAD agents:**
   ```bash
   npx bmad-method@alpha install
   ```
   Then run `*workflow-init` — BMAD agents will use the pre-generated artifacts as starting point

---

## Path C: BMAD Method (implementation_framework: bmad)

### StackShift Complete - Handoff to BMAD

StackShift has prepared your codebase with comprehensive reverse-engineering documentation.

**Generated files (same for all paths):**
```
docs/reverse-engineering/
├── functional-specification.md   # Business logic, requirements, personas
├── integration-points.md         # External services, APIs, data flows
├── configuration-reference.md    # All config options, env vars
├── data-architecture.md          # Data models, API contracts, domains
├── operations-guide.md           # Deployment, infrastructure, scaling
├── technical-debt-analysis.md    # Issues, improvements, migration matrix
├── observability-requirements.md # Monitoring, logging
├── visual-design-system.md       # UI/UX patterns
├── test-documentation.md         # Testing requirements
├── business-context.md           # Product vision, personas, goals
└── decision-rationale.md         # Tech selection, ADRs, principles
```

### Next Steps for BMAD

1. **Install BMAD** (if not already):
   ```bash
   npx bmad-method@alpha install
   ```

2. **Load the Analyst agent** in your IDE (see BMAD docs for instructions)

3. **Run workflow-init**:
   ```
   *workflow-init
   ```

4. **Point BMAD to StackShift's documentation**:

   When BMAD asks about your project, tell it:
   ```
   This project has been analyzed by StackShift. Comprehensive reverse-engineering
   documentation is available in docs/reverse-engineering/. Please use these 11
   documents as context for creating the PRD and architecture.

   Key documents:
   - functional-specification.md - Business requirements, user stories, personas
   - business-context.md - Product vision, business goals, competitive landscape
   - data-architecture.md - Data models, API contracts, domain boundaries
   - integration-points.md - External dependencies, data flows, auth
   - decision-rationale.md - Technology selection, ADRs, design principles
   ```

5. **BMAD takes over** - PM and Architect agents will:
   - Read StackShift's reverse-engineering docs
   - Collaboratively create PRD through conversation with you
   - Collaboratively create Architecture through conversation with you
   - Dev agent implements based on finalized docs

---

## Path D: Architecture Only (implementation_framework: architect-only)

### Architecture Document Generated

If you ran `/stackshift.architect` (or cruise control did it automatically), the architecture document is ready.

**Review:** `architecture.md` with Mermaid diagrams, ADRs, infrastructure recommendations.

### Next Steps

- Use the architecture document to guide manual implementation
- Or feed it into Spec Kit or BMAD for structured implementation planning

---

## Path E: Portable Extraction (implementation_framework: portable-extract)

### Portable Artifacts Generated

If you ran `/stackshift.portable-extract` (or cruise control did it automatically), portable component specs are ready:

```
_portable-extract/
├── epics.md              # BMAD-format epics with abstract personas
└── component-spec.md     # Business rules, data contracts, edge cases
```

### Next Steps

1. **Copy to target project**: Copy `_portable-extract/` to your new project
2. **Adapt personas**: Map [User]/[Admin]/[System] to your target domain's personas
3. **Use with BMAD**: Feed epics.md into `*create-epics-stories` or `*workflow-init`
4. **Use with Spec Kit**: Convert component-spec.md into `.specify/` feature specs
5. **Use directly**: Artifacts are self-contained for implementation in any stack

---

### Why StackShift + BMAD Works

**StackShift provides rich context, BMAD provides collaborative refinement:**

| StackShift Does | BMAD Does |
|-----------------|-----------|
| AST-powered code extraction | Collaborative PRD creation with PM agent |
| Semantic business logic analysis | Collaborative Architecture with Architect agent |
| Accurate API/data documentation | Agent-driven implementation workflow |
| Comprehensive 11-doc output | Scale-adaptive planning (Quick -> Enterprise) |
| Business context inference | Business context validation and refinement |
| Decision rationale extraction | ADR refinement and new decision recording |

**You get the best of both worlds:**
- StackShift's deep, accurate reverse engineering as input
- BMAD's interactive, collaborative artifact creation as output
