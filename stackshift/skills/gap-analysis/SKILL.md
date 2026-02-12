---
name: gap-analysis
description: Route-aware gap analysis. For Brownfield - uses /speckit.analyze to compare specs against implementation. For Greenfield - validates spec completeness and asks about target tech stack for new implementation. This is Step 4 of 6 in the reverse engineering process.
---

# Gap Analysis (Route-Aware)

**Step 4 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** 15 minutes
**Prerequisites:** Step 3 completed (`.specify/` directory exists with specifications)
**Output:** Route-specific analysis and implementation roadmap

---

## Configuration Check (FIRST STEP!)

**CRITICAL:** Check detection type and route:

```bash
# Load state file
DETECTION_TYPE=$(cat .stackshift-state.json | jq -r '.detection_type // .path')
ROUTE=$(cat .stackshift-state.json | jq -r '.route // .path')

echo "Detection: $DETECTION_TYPE (what kind of app)"
echo "Route: $ROUTE (how to spec it)"
```

**Routes:**
- **greenfield** → Building NEW app (tech-agnostic specs)
- **brownfield** → Managing EXISTING app (tech-prescriptive specs)

**Detection Types:**
- **generic** → Standard application
- **monorepo-service** → Service in a monorepo
- **nx-app** → Nx workspace application
- **turborepo-package** → Turborepo package
- **lerna-package** → Lerna package

**Based on route, this skill behaves differently!**

**Examples:**
- Monorepo Service + Greenfield → Analyze spec completeness for platform migration
- Monorepo Service + Brownfield → Compare specs vs current implementation
- Nx App + Greenfield → Validate specs for rebuild (framework-agnostic)
- Nx App + Brownfield → Find gaps in current Nx/Angular implementation

---

## Greenfield Route: Spec Completeness Analysis

**Goal:** Validate specs are complete enough to build NEW application

**NOT analyzing:** Old codebase (we're not fixing it, we're building new)
**YES analyzing:** Spec quality, completeness, readiness

### Step 1: Review Spec Completeness

For each specification:

```bash
# Check each spec
for spec in .specify/specs/*/spec.md; do
  echo "Analyzing: $(basename $spec)"

  # Look for ambiguities
  grep "\[NEEDS CLARIFICATION\]" "$spec" || echo "No clarifications needed"

  # Check for acceptance criteria
  grep -A 10 "Acceptance Criteria" "$spec" || echo "⚠️ No acceptance criteria"

  # Check for user stories
  grep -A 5 "User Stories" "$spec" || echo "⚠️ No user stories"
done
```

### Step 2: Identify Clarification Needs

**Common ambiguities in Greenfield specs:**
- UI/UX details missing (what should it look like?)
- Business rules unclear (what happens when...?)
- Data relationships ambiguous (how do entities relate?)
- Non-functional requirements vague (how fast? how secure?)

**Mark with [NEEDS CLARIFICATION]:**
```markdown
### Photo Upload Feature
- Users can upload photos [NEEDS CLARIFICATION: drag-drop or click-browse?]
- Photos stored in cloud [NEEDS CLARIFICATION: S3, Cloudinary, or Vercel Blob?]
- Max 10 photos [NEEDS CLARIFICATION: per fish or per tank?]
```

### Step 3: Ask About Target Tech Stack

**For Greenfield, you're building NEW - need to choose stack!**

```
I've extracted the business logic into tech-agnostic specifications.
Now we need to decide what to build the NEW application in.

What tech stack would you like to use for the new implementation?

Examples:
A) Next.js 15 + React 19 + Prisma + PostgreSQL + Vercel
B) Python FastAPI + SQLAlchemy + PostgreSQL + AWS ECS
C) Ruby on Rails 7 + PostgreSQL + Heroku
D) Your choice: [describe your preferred stack]
```

**Document choice** in Constitution for consistency.

### Step 4: Create Implementation Roadmap

**Greenfield roadmap focuses on BUILD ORDER:**

```markdown
# Greenfield Implementation Roadmap

## Tech Stack Selected
- Frontend: Next.js 15 + React 19
- Backend: Next.js API Routes
- Database: PostgreSQL + Prisma
- Auth: NextAuth.js
- Hosting: Vercel

## Build Phases

### Phase 1: Foundation (Week 1)
- Set up Next.js project
- Database schema with Prisma
- Authentication system
- Base UI components

### Phase 2: Core Features (Week 2-3)
- User management
- Fish tracking
- Tank management
- Water quality logging

### Phase 3: Advanced Features (Week 4)
- Photo upload
- Analytics dashboard
- Notifications
- Social features

## All Features are ❌ MISSING
(Greenfield = building from scratch)

Ready to proceed to:
- Step 5: Resolve clarifications
- Step 6: Implement features in new stack
```

---

## Brownfield Route: Implementation Gap Analysis

**Goal:** Identify gaps in EXISTING codebase implementation

**YES analyzing:** Old codebase vs specs
**Using:** AST-powered analysis as primary method, /speckit.analyze as fallback

**IMPORTANT**: You MUST run the AST analysis tool - don't just read the instructions!

### Step 1: Verify Prerequisites

**CRITICAL:** Check if prerequisite scripts are installed (needed for fallback):

```bash
# Check for scripts (used by /speckit.analyze fallback)
if [ ! -f .specify/scripts/bash/check-prerequisites.sh ]; then
  echo "GitHub Spec Kit scripts not found - /speckit.analyze fallback unavailable"
  echo "AST analysis will be the sole analysis method"
fi
```

### Step 2a: Run AST-Powered Analysis (PRIMARY METHOD)

**ACTION REQUIRED**: Run the AST analysis for deep code inspection:

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

**This IS the primary gap analysis method.** It provides deeper, more accurate analysis than spec-level comparison alone.

### Step 2b: Run /speckit.analyze (FALLBACK)

**Only if AST analysis fails or is unavailable**, fall back to GitHub Spec Kit's validation:

```bash
> /speckit.analyze
```

**What it checks:**
- Specifications marked COMPLETE but implementation missing
- Implementation exists but not documented in specs
- Inconsistencies between related specifications
- Conflicting requirements across specs
- Outdated implementation status

**If this command also fails with "Script not found"**, the scripts weren't installed. Use Step 2c instead.

### Step 2c: Manual Gap Analysis (last resort if both methods unavailable)

If both AST analysis and `/speckit.analyze` are unavailable, do manual analysis:

```bash
# For each spec, check implementation status
for spec in .specify/specs/*/spec.md; do
  feature=$(dirname "$spec" | xargs basename)
  echo "Analyzing: $feature"

  # Extract status from spec
  status=$(grep "^## Status" "$spec" -A 1 | tail -1)
  echo "  Status: $status"

  # Look for [NEEDS CLARIFICATION] markers
  clarifications=$(grep -c "\[NEEDS CLARIFICATION\]" "$spec" 2>/dev/null || echo "0")
  echo "  Clarifications needed: $clarifications"

  echo ""
done
```

This is the least thorough option and should only be used as a last resort.

---

## Process Overview

### Step 1: Verify Prerequisites

Check that AST analysis scripts and GitHub Spec Kit scripts are available (see above).

### Step 2: Run Analysis

Run AST analysis first (primary method). If it fails, fall back to `/speckit.analyze`. If that also fails, use manual analysis.

**Output example:**
```
Analyzing specifications vs implementation...

Issues Found:

1. user-authentication.md marked PARTIAL
   - Spec says: Frontend login UI required
   - Reality: No login components found in codebase

2. analytics-dashboard.md marked MISSING
   - Spec exists but no implementation

3. Inconsistency detected:
   - fish-management.md requires photo-upload feature
   - photo-upload.md marked PARTIAL (upload API missing)

4. Orphaned implementation:
   - src/api/notifications.ts exists
   - No specification found for notifications feature

Summary:
- 3 COMPLETE features
- 4 PARTIAL features
- 5 MISSING features
- 2 inconsistencies
- 1 orphaned implementation
```

### Step 2: Detailed Gap Analysis

Expand on AST analysis findings with deeper analysis:

#### A. Review PARTIAL Features

For each ⚠️ PARTIAL feature:
- What exists? (backend, frontend, tests, docs)
- What's missing? (specific components, endpoints, UI)
- Why incomplete? (was it deprioritized? ran out of time?)
- Effort to complete? (hours estimate)
- Blockers? (dependencies, unclear requirements)

#### B. Review MISSING Features

For each ❌ MISSING feature:
- Is it actually needed? (or can it be deprioritized?)
- User impact if missing? (critical, important, nice-to-have)
- Implementation complexity? (simple, moderate, complex)
- Dependencies? (what must be done first)

#### C. Technical Debt Assessment

From `docs/reverse-engineering/technical-debt-analysis.md`:
- Code quality issues
- Missing tests (unit, integration, E2E)
- Documentation gaps
- Security vulnerabilities
- Performance bottlenecks

#### D. Identify Clarification Needs

Mark ambiguous areas with `[NEEDS CLARIFICATION]`:
- Unclear requirements
- Missing UX/UI details
- Undefined behavior
- Unspecified constraints

### Step 3: Prioritize Implementation

Classify gaps by priority:

**P0 - Critical**
- Blocking major use cases
- Security vulnerabilities
- Data integrity issues
- Broken core functionality

**P1 - High Priority**
- Important for core user value
- High user impact
- Competitive differentiation
- Technical debt causing problems

**P2 - Medium Priority**
- Nice-to-have features
- Improvements to existing features
- Minor technical debt
- Edge cases

**P3 - Low Priority**
- Future enhancements
- Polish and refinements
- Non-critical optimizations

### Step 4: Create Implementation Roadmap

Phase the work into manageable chunks:

**Phase 1: P0 Items** (~X hours)
- Complete critical features
- Fix security issues
- Unblock major workflows

**Phase 2: P1 Features** (~X hours)
- Build high-value features
- Address important technical debt
- Improve test coverage

**Phase 3: P2/P3 Enhancements** (~X hours or defer)
- Nice-to-have features
- Polish and refinements
- Optional improvements

---

## Output Format

Create `docs/gap-analysis-report.md` (supplementing Spec Kit's output):

```markdown
# Gap Analysis Report

**Date:** [Current Date]
**Based on:** AST analysis (primary) + /speckit.analyze (fallback) + manual review

---

## Executive Summary

- **Overall Completion:** ~66%
- **Complete Features:** 3 (25%)
- **Partial Features:** 4 (33%)
- **Missing Features:** 5 (42%)
- **Critical Issues:** 2
- **Clarifications Needed:** 8

---

## Spec Kit Analysis Results

### Inconsistencies Detected by /speckit.analyze

1. **user-authentication.md** (PARTIAL)
   - Spec: Frontend login UI required
   - Reality: No login components exist
   - Impact: Users cannot authenticate

2. **photo-upload.md → fish-management.md**
   - fish-management depends on photo-upload
   - photo-upload.md is PARTIAL (API incomplete)
   - Impact: Fish photos cannot be uploaded

3. **Orphaned Code: notifications.ts**
   - Implementation exists without specification
   - Action: Create specification or remove code

---

## Gap Details

### Missing Features (❌ 5 features)

#### F003: Analytics Dashboard [P1]
**Specification:** `specs/analytics-dashboard.md`
**Status:** ❌ MISSING (not started)
**Impact:** Users cannot track metrics over time
**Effort:** ~8 hours
**Dependencies:** None

**Needs Clarification:**
- [NEEDS CLARIFICATION] What metrics to display?
- [NEEDS CLARIFICATION] Chart types (line, bar, pie)?
- [NEEDS CLARIFICATION] Real-time or daily aggregates?

#### F005: Social Features [P2]
...

### Partial Features (⚠️ 4 features)

#### F002: Fish Management [P0]
**Specification:** `specs/fish-management.md`
**Status:** ⚠️ PARTIAL

**Implemented:**
- ✅ Backend API (all CRUD endpoints)
- ✅ Fish list page
- ✅ Fish detail view

**Missing:**
- ❌ Fish profile edit page
- ❌ Photo upload UI (blocked by photo-upload.md)
- ❌ Bulk import feature

**Effort to Complete:** ~4 hours
**Blockers:** Photo upload API must be completed first

**Needs Clarification:**
- [NEEDS CLARIFICATION] Photo upload: drag-drop or click-browse?
- [NEEDS CLARIFICATION] Max photos per fish?

---

## Technical Debt

### High Priority (Blocking)
- Missing integration tests (0 tests, blocks deployment)
- No error handling in 8 API endpoints (causes crashes)
- Hardcoded AWS region (prevents multi-region)

### Medium Priority
- Frontend components lack TypeScript types
- No loading states in UI (poor UX)
- Missing rate limiting on API (security risk)

### Low Priority
- Inconsistent code formatting
- No dark mode support
- Missing accessibility labels

---

## Prioritized Roadmap

### Phase 1: P0 Critical (~12 hours)

**Goals:**
- Unblock core user workflows
- Fix security issues
- Complete essential features

**Tasks:**
1. Complete F002: Fish Management UI (~4h)
   - Implement photo upload API
   - Build fish edit page
   - Connect to backend

2. Add error handling to all APIs (~3h)

3. Implement integration tests (~5h)

### Phase 2: P1 High Value (~20 hours)

**Goals:**
- Build analytics dashboard
- Implement notifications
- Improve test coverage

**Tasks:**
1. F003: Analytics Dashboard (~8h)
2. F006: Notification System (~6h)
3. Add rate limiting (~2h)
4. Improve TypeScript coverage (~4h)

### Phase 3: P2/P3 Enhancements (~TBD)

**Goals:**
- Add nice-to-have features
- Polish and refinements

**Tasks:**
1. F005: Social Features (~12h)
2. F007: Dark Mode (~6h)
3. F008: Admin Panel (~10h)

---

## Clarifications Needed (8 total)

### Critical (P0) - 2 items
1. **F002 - Photo Upload:** Drag-drop, click-browse, or both?
2. **F004 - Offline Sync:** Full data or metadata only?

### Important (P1) - 4 items
3. **F003 - Analytics:** Which chart types and metrics?
4. **F006 - Notifications:** Email, push, or both?
5. **F003 - Data Refresh:** Real-time or daily aggregates?
6. **F006 - Alert Frequency:** Per event or digest?

### Nice-to-Have (P2) - 2 items
7. **F007 - Dark Mode:** Full theme or toggle only?
8. **F005 - Social:** Which social features (share, comment, like)?

---

## Recommendations

1. **Resolve P0 clarifications first** (Step 5: complete-spec)
2. **Focus on Phase 1** before expanding scope
3. **Use /speckit.implement** for systematic implementation
4. **Update specs as you go** to keep them accurate
5. **Run /speckit.analyze regularly** to catch drift

---

## Next Steps

1. Run complete-spec skill to resolve clarifications
2. Begin Phase 1 implementation
3. Use `/speckit.implement` for each feature
4. Update implementation status in specs
5. Re-run `/speckit.analyze` to validate progress
```

---

## GitHub Spec Kit Integration

After gap analysis, leverage Spec Kit commands:

### Validate Continuously
```bash
# Re-run after making changes
> /speckit.analyze

# Should show fewer issues as you implement
```

### Implement Systematically
```bash
# Generate tasks for a feature
> /speckit.tasks user-authentication

# Implement step-by-step
> /speckit.implement user-authentication

# Updates spec status automatically
```

### Clarify Ambiguities
```bash
# Before implementing unclear features
> /speckit.clarify analytics-dashboard

# Interactive Q&A to fill gaps
```

---

## Success Criteria

After running this skill, you should have:

- ✅ AST analysis results reviewed (primary method)
- ✅ `/speckit.analyze` results reviewed (if used as fallback)
- ✅ All inconsistencies documented
- ✅ PARTIAL features analyzed (what exists vs missing)
- ✅ MISSING features categorized
- ✅ Technical debt cataloged
- ✅ `[NEEDS CLARIFICATION]` markers added
- ✅ Priorities assigned (P0/P1/P2/P3)
- ✅ Phased implementation roadmap
- ✅ `docs/gap-analysis-report.md` created
- ✅ Ready to proceed to Step 5 (Complete Specification)

---

## Next Step

Once gap analysis is complete, proceed to:

**Step 5: Complete Specification** - Use the complete-spec skill to resolve all `[NEEDS CLARIFICATION]` markers interactively.

---

## Technical Notes

- AST analysis is the primary method for gap analysis and code inspection
- `/speckit.analyze` is a fallback when AST analysis is unavailable
- Manual analysis supplements with deeper insights when both are unavailable
- Gap report complements AST analysis output
- Keep both `.specify/memory/` specs and gap report updated
- Re-run AST analysis frequently to track progress

---

## Route Comparison: What Gap Analysis Means

| Aspect | Greenfield | Brownfield |
|--------|-----------|-----------|
| **Analyzing** | Spec completeness | Existing code vs specs |
| **Goal** | Validate specs ready to build NEW | Find gaps in CURRENT implementation |
| **AST Analysis** | Skip (no old code to compare) | Run (primary gap analysis method) |
| **/speckit.analyze** | Skip (no old code to compare) | Fallback (if AST unavailable) |
| **Gap Definition** | Missing requirements, ambiguities | Missing features, partial implementations |
| **Roadmap** | Build order for NEW app | Fill gaps in EXISTING app |
| **Tech Stack** | ASK user (choosing for new) | Already decided (current stack) |
| **All Features** | ❌ MISSING (building from scratch) | Mix of ✅⚠️❌ (some exist) |

**Key Insight:**
- **Greenfield:** Specs describe WHAT to build (old code doesn't matter) - Same for ALL detection types
- **Brownfield:** Specs describe current reality (validate against old code) - Same for ALL detection types

**Detection type doesn't change gap analysis approach** - it only affects what patterns were analyzed in Gear 2

---

**Remember:** Check route first! Greenfield analyzes SPECS, Brownfield analyzes IMPLEMENTATION.
