---
name: gap-analysis
description: Use /speckit.analyze to compare specifications against implementation, then create prioritized gap list. Identifies incomplete features, missing UI components, technical debt, and inconsistencies between specs and code. This is Step 4 of 6 in the reverse engineering process.
---

# Gap Analysis (with GitHub Spec Kit)

**Step 4 of 6** in the Reverse Engineering to Spec-Driven Development process.

**Estimated Time:** 15 minutes
**Prerequisites:** Step 3 completed (`.specify/` directory exists with specifications)
**Output:** Prioritized gap analysis and implementation roadmap

---

## When to Use This Skill

Use this skill when:
- You've completed Step 3 (Create Specifications)
- Have specifications in `specs/`
- Ready to identify what's missing or incomplete
- Want to validate specs against actual implementation

**Trigger Phrases:**
- "Analyze gaps in implementation"
- "What's missing from the application?"
- "Run speckit analyze"
- "Compare specs to code"

---

## What This Skill Does

Uses **GitHub Spec Kit's `/speckit.analyze`** command plus additional analysis to:

1. **Validate Consistency** - Check specs match implementation
2. **Identify Gaps** - Find PARTIAL and MISSING features
3. **Detect Inconsistencies** - Specs say one thing, code does another
4. **Catalog Technical Debt** - Code quality, tests, documentation needs
5. **Prioritize Implementation** - P0/P1/P2/P3 classification
6. **Create Roadmap** - Phased implementation plan

---

## Process Overview

### Step 1: Run /speckit.analyze

GitHub Spec Kit's built-in validation:

```bash
> /speckit.analyze
```

**What it checks:**
- Specifications marked ✅ COMPLETE but implementation missing
- Implementation exists but not documented in specs
- Inconsistencies between related specifications
- Conflicting requirements across specs
- Outdated implementation status

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

See [operations/run-speckit-analyze.md](operations/run-speckit-analyze.md)

### Step 2: Detailed Gap Analysis

Expand on `/speckit.analyze` findings with deeper analysis:

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

See [operations/detailed-gap-analysis.md](operations/detailed-gap-analysis.md)

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

See [operations/prioritization.md](operations/prioritization.md)

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
**Based on:** /speckit.analyze + manual review

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

- ✅ `/speckit.analyze` results reviewed
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

- `/speckit.analyze` is run first for automated checks
- Manual analysis supplements with deeper insights
- Gap report complements Spec Kit's output
- Keep both `.specify/memory/` specs and gap report updated
- Re-run `/speckit.analyze` frequently to track progress

---

**Remember:** This step combines GitHub Spec Kit's automated validation with manual gap analysis to create a complete picture of what needs to be built.
