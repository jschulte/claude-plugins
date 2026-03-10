# Reconcile & Complete Specifications - StackShift Recovery Prompt

**Purpose**: Fix repositories that went through an earlier version of StackShift and have incomplete spec coverage.

**Use Case**: You have:
- ✅ `docs/reverse-engineering/` with comprehensive documentation (8-10 files)
- ⚠️ Incomplete specs (only gaps, not full features)
- ⚠️ Missing specs for existing functionality
- ❌ Can't use `/speckit.*` commands effectively because specs don't cover the full app

**Goal**: Get COMPLETE spec coverage for the ENTIRE application (existing + missing features), properly formatted for GitHub Spec Kit.

---

## Your Task

You are reconciling incomplete specifications for a repository that has been partially processed by StackShift.

The goal is to take the business logic captured in the reverse engineering documents, and use that to build a Github spec kit compatible specification that lays out everything that the application does, end to end, and leaves room for improvements going forward. This approach should put the entire app under "spec control" and we can then continue using Github spec kit moving forward naturally, as if it had always been used in the app.

### The Problem

Earlier versions of StackShift created specs ONLY for gaps/missing features, not for existing functionality. This means:
- Existing features aren't under spec control
- Can't use specs to guide future changes
- Specs don't represent the full application
- Implementation phase only builds gaps, ignores existing code

**Your mission**: Create specs for EVERYTHING, not just gaps.

---

## Step 1: Audit Current State

First, understand what you have:

### Check Documentation
```bash
# Verify reverse engineering docs exist
ls docs/reverse-engineering/

# Should contain 9 comprehensive files from StackShift:
# - functional-specification.md (THE COMPLETE APP)
# - integration-points.md (External services, APIs, dependencies - CRITICAL!)
# - configuration-reference.md
# - data-architecture.md
# - operations-guide.md
# - technical-debt-analysis.md
# - observability-requirements.md
# - visual-design-system.md
# - test-documentation.md
```

### Check Existing Specs
```bash
# Check what specs exist
ls specs/ 2>/dev/null || ls .specify/memory/specifications/ 2>/dev/null

# Common issues:
# - Only 2-5 specs (should be 15-30 for a real app)
# - Specs only describe MISSING features
# - No specs for existing functionality
# - Specs not in proper Spec Kit format
```

### Audit Findings

After checking, tell me:
1. **How many reverse-engineering docs exist?** (should be 8-10)
2. **How many specs currently exist?** (probably too few)
3. **What do current specs cover?** (probably just gaps/missing features)
4. **Are existing features documented in specs?** (probably NO - this is the problem!)

---

## Step 2: Read ALL Reverse Engineering Documentation

Read EVERY file in `docs/reverse-engineering/` to understand the COMPLETE application:

### Critical: Read Functional Specification
```bash
cat docs/reverse-engineering/functional-specification.md
```

**This file describes the ENTIRE application** - both what exists AND what's missing.

### Also Read Supporting Docs
- `integration-points.md` - ALL external services, APIs, dependencies (CRITICAL!)
- `data-architecture.md` - All data models
- `configuration-reference.md` - All config and environment variables
- `operations-guide.md` - Deployment and operational details
- `technical-debt-analysis.md` - Implementation status
- `observability-requirements.md` - Monitoring and logging
- `visual-design-system.md` - UI/UX patterns
- `test-documentation.md` - Testing approach

**Goal**: Understand EVERY capability the application has or needs.

---

## Step 3: Extract ALL Features (Existing + Missing)

From the reverse engineering docs, create a COMPLETE feature inventory.

### Feature Categories

**Category A - COMPLETE Features (✅)**:
These are fully implemented and working. Examples:
- User Authentication (login, registration - fully working)
- Product Catalog (listing, search - backend + frontend complete)
- Database Schema (all tables exist and are used)

**Category B - PARTIAL Features (⚠️)**:
These are started but incomplete. Examples:
- Shopping Cart (backend API done, frontend missing)
- User Profile (display works, editing broken)
- Payment Processing (Stripe integrated but no UI)

**Category C - MISSING Features (❌)**:
These are documented but not implemented. Examples:
- Email Notifications (mentioned but no code)
- Admin Dashboard (planned but not started)
- Export to PDF (required but missing)

### IMPORTANT: Create Specs for ALL THREE Categories!

**Do NOT skip COMPLETE features!** Even if something is 100% implemented, it needs a spec so that:
- Future changes are guided by spec
- Testing requirements are documented
- Business rules are captured
- Refactoring preserves behavior

---

## Step 4: Create Comprehensive Specifications

For **EVERY feature** (complete, partial, or missing), create a GitHub Spec Kit specification.

### File Structure

```
specs/
├── 001-user-authentication/
│   ├── spec.md              ← Full spec (even though feature exists!)
│   └── plan.md              ← Only if PARTIAL or MISSING
├── 002-product-catalog/
│   ├── spec.md              ← Full spec (even though complete!)
│   └── plan.md              ← Skip if COMPLETE
├── 003-shopping-cart/
│   ├── spec.md              ← Full spec
│   └── plan.md              ← Yes (partial feature)
├── 004-payment-processing/
│   ├── spec.md              ← Full spec
│   └── plan.md              ← Yes (partial feature)
└── 005-email-notifications/
    ├── spec.md              ← Full spec
    └── plan.md              ← Yes (missing feature)
```

### Spec.md Format (Same for ALL Features)

```markdown
# Feature Specification: {Feature Name}

**Feature Branch**: `{NNN}-{feature-slug}`
**Created**: {date}
**Status**: Draft
**Priority**: P0 | P1 | P2

## User Scenarios & Testing *(mandatory)*

### User Story 1 - {Capability} (Priority: P0/P1/P2)

As a {user type}, I need {capability} so that {benefit}.

**Why this priority**: {Business value}

**Independent Test**: {How to test this}

**Acceptance Scenarios**:
1. **Given** {precondition}, **When** {action}, **Then** {outcome}
2. **Given** {precondition}, **When** {action}, **Then** {outcome}
3. **Given** {precondition}, **When** {action}, **Then** {outcome}

---

{3-6 user stories per feature}

---

### Edge Cases

- {5-10 edge cases}

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST {requirement}
- **FR-002**: System MUST {requirement}
{10-15 functional requirements}

### Key Entities *(if data-related)*

- **{Entity}**: {Description}

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: {Metric}: {Expected value}
{8-12 success criteria}

### Non-Functional Requirements

- **Performance**: {Response times}
- **Reliability**: {Uptime, error rates}
- **Security**: {Auth, encryption}
- **Maintainability**: {Code quality}

## Implementation Status *(CRITICAL FOR RECONCILIATION)*

### Current State (What EXISTS in codebase)

**Backend**:
- ✅ API endpoint: POST /api/auth/login (implemented in src/auth/login.ts)
- ✅ JWT token generation (implemented)
- ✅ Password hashing with bcrypt (implemented)
- ❌ Password reset endpoint (missing)

**Frontend**:
- ✅ Login page (src/pages/Login.tsx - complete)
- ❌ Registration page (missing)
- ❌ Password reset UI (missing)

**Tests**:
- ✅ Unit tests for login API (12 tests, 95% coverage)
- ⚠️ Integration tests partial (no error case coverage)
- ❌ E2E tests missing

**Overall Feature Status**: ⚠️ **PARTIAL** (Backend 75%, Frontend 33%, Tests 60%)

### Target State (What SHOULD exist)

{What needs to be built/completed to reach 100%}

### Gap Summary

**Must Build**:
- Backend: Password reset endpoint
- Frontend: Registration page, password reset UI
- Tests: E2E test suite

**Estimated Effort**: {X person-days}

---

## Assumptions

1. {Technical assumptions}
{3-7 assumptions}

## Dependencies

- {Systems, libraries, other features}

## Out of Scope

- {Things NOT in this feature}

## References

- Implementation: `src/auth/` directory
- Tests: `src/__tests__/auth/`
- API Docs: `docs/reverse-engineering/api-documentation.md`
```

### Critical Differences from Old Format

**OLD (Gap-Only) Spec**:
```markdown
# Feature: Email Notifications

Status: ❌ MISSING

What needs to be built:
- Send email on registration
- Send email on password reset
```

**NEW (Complete) Spec**:
```markdown
# Feature Specification: User Authentication

## Implementation Status

### Current State (What EXISTS)
- ✅ Login API complete (src/auth/login.ts)
- ✅ JWT tokens working
- ✅ Login UI complete
- ❌ Registration missing
- ❌ Password reset missing

### Target State (What SHOULD exist)
- All user auth flows complete

### Gap Summary
- Build registration
- Build password reset

Overall: ⚠️ PARTIAL (67% complete)
```

The new format captures BOTH what exists AND what's missing!

---

## Step 5: Handle Existing Specs

If specs already exist, you need to reconcile them:

### Strategy A: Merge Existing Specs (Recommended)

If a spec already exists for a feature:
1. **Read existing spec** - See what it says
2. **Read reverse engineering docs** - See the full picture
3. **Merge information** - Combine both sources
4. **Add Implementation Status section** - Show what exists vs what's missing
5. **Rewrite in proper Spec Kit format** - Use the template above

### Strategy B: Archive and Recreate

If existing specs are too incomplete:
1. **Archive old specs** - Move to `specs-backup/`
2. **Create fresh comprehensive specs** - From reverse engineering docs
3. **Reference old specs** - Pull any useful information

### Strategy C: Keep Complete Specs, Add Missing

If some specs are good:
1. **Keep well-formatted complete specs** - Don't touch what works
2. **Identify missing feature specs** - Compare to reverse engineering docs
3. **Create specs for missing features** - Fill the gaps in spec coverage
4. **Update partial specs** - Add Implementation Status sections

**Recommended**: Use Strategy A (merge) for best results.

---

## Step 6: Verify Complete Coverage

After creating specs, validate coverage:

### Coverage Checklist

Compare `docs/reverse-engineering/functional-specification.md` to `specs/`:

**For EACH capability/feature mentioned in functional spec**:
- [ ] Has a corresponding `specs/###-feature-name/` directory
- [ ] Has a complete `spec.md` file
- [ ] Spec includes Implementation Status section
- [ ] Spec marks what EXISTS (✅) vs what's MISSING (❌)
- [ ] Spec includes user stories, requirements, success criteria
- [ ] Spec follows GitHub Spec Kit format

**For EACH API endpoint in `api-documentation.md`**:
- [ ] Covered by a feature spec
- [ ] Implementation status documented

**For EACH data model in `data-architecture.md`**:
- [ ] Referenced in relevant feature spec
- [ ] Listed in Key Entities section

**For EACH integration in `integration-points.md`**:
- [ ] Has its own spec OR
- [ ] Documented in related feature spec

### Target Metrics

A properly reconciled repository should have:
- **15-50 feature specs** (depending on app size)
- **100% feature coverage** (every capability has a spec)
- **Clear implementation status** (no ambiguity about what exists)
- **Proper Spec Kit format** (can use `/speckit.*` commands)

---

## Step 7: Create Implementation Plans for Incomplete Features

Only for features marked ⚠️ PARTIAL or ❌ MISSING:

### File: `specs/###-feature-name/plan.md`

```markdown
# Implementation Plan: {Feature Name}

## Current State

**What Exists**:
- Backend: {specific files and endpoints}
- Frontend: {specific components}
- Tests: {coverage percentage}

**Evidence**:
- Files: `src/feature/*.ts`
- Tests: `src/__tests__/feature/*.test.ts`

## Target State

**What We Need to Build**:
- Backend: {missing functionality}
- Frontend: {missing UI}
- Tests: {missing coverage}

## Technical Approach

### Backend Changes
1. {Task}
2. {Task}

### Frontend Changes
1. {Task}
2. {Task}

### Testing Strategy
1. {Test plan}

## Estimated Effort

- Backend: {X person-days}
- Frontend: {X person-days}
- Tests: {X person-days}
- **Total**: {X person-days}

## Risks

- {Risk 1 and mitigation}
- {Risk 2 and mitigation}

## Dependencies

- {Other features or systems needed}
```

**IMPORTANT**: Only create `plan.md` for incomplete features. Complete features (✅) don't need implementation plans.

---

## Step 8: Quality Validation

Before completing reconciliation, verify:

### Specification Quality

For EACH spec:
- [ ] Covers a complete, coherent feature
- [ ] Has 3-5 user stories with business value
- [ ] Has 10-15 functional requirements
- [ ] Has 8-12 success criteria
- [ ] Has Implementation Status section showing CURRENT state
- [ ] Properly categorized: ✅ COMPLETE | ⚠️ PARTIAL | ❌ MISSING
- [ ] Follows GitHub Spec Kit template format

### Coverage Quality

Across ALL specs:
- [ ] Every feature mentioned in functional-specification.md is spec'd
- [ ] Every API endpoint has a corresponding spec
- [ ] Every data model is referenced in specs
- [ ] Every integration point is documented
- [ ] No duplicate specs for same feature
- [ ] Numbering is sequential (001, 002, 003...)

### Format Quality

- [ ] All specs in `specs/###-feature-name/` directories
- [ ] All specs named `spec.md`
- [ ] All plans named `plan.md`
- [ ] Constitution exists in `.specify/memory/constitution.md`
- [ ] Can run `/speckit.analyze` successfully
- [ ] Can run `/speckit.tasks` on any spec

---

## Step 9: Create Reconciliation Summary

After completing reconciliation, create `RECONCILIATION_REPORT.md`:

```markdown
# Spec Reconciliation Report

**Date**: {date}
**Repository**: {name}
**Reverse Engineering Docs**: {count} files, {total KB}

## Before Reconciliation

- **Specs existed**: {count} specs
- **Coverage**: {X}% of application features
- **Status**: {description of what was wrong}
- **Issues**:
  - Only gap/missing features spec'd
  - Existing features not under spec control
  - {other issues}

## After Reconciliation

- **Total Specs Created**: {count} specs
- **Coverage**: 100% of application features
- **Breakdown**:
  - ✅ COMPLETE: {count} features ({X}% of total)
  - ⚠️ PARTIAL: {count} features ({X}% of total)
  - ❌ MISSING: {count} features ({X}% of total)

## Specs Created/Updated

### New Specs (Previously Missing Coverage)
1. **001-user-authentication** (✅ COMPLETE) - Captured existing auth system
2. **002-product-catalog** (✅ COMPLETE) - Documented existing catalog
3. **003-shopping-cart** (⚠️ PARTIAL) - Backend exists, frontend missing
{...list all new specs}

### Updated Specs (Previously Incomplete)
1. **015-payment-processing** - Added Implementation Status section
2. **016-order-management** - Merged with reverse engineering docs
{...list all updated specs}

### Archived Specs (Replaced/Merged)
1. **old-spec-1.md** → Merged into 003-shopping-cart
2. **gap-analysis-only.md** → Replaced with comprehensive specs

## Implementation Status Summary

| Category | Count | Percentage | Effort Remaining |
|----------|-------|-----------|------------------|
| ✅ Complete | {X} | {X}% | 0 person-days |
| ⚠️ Partial | {X} | {X}% | {X} person-days |
| ❌ Missing | {X} | {X}% | {X} person-days |
| **Total** | {X} | 100% | {X} person-days |

## Next Steps

1. ✅ Specs are now complete and comprehensive
2. ✅ All existing functionality is under spec control
3. ✅ Can run `/speckit.analyze` for validation
4. ✅ Can run `/speckit.tasks` for any feature
5. ✅ Ready for spec-driven development workflow

### To Implement Gaps

```bash
# For each PARTIAL or MISSING feature:
cd specs/###-feature-name/
/speckit.tasks          # Generate task list
/speckit.implement      # Build the feature
```

### To Modify Existing Features

Now that existing features have specs:
1. Update the spec first
2. Run `/speckit.tasks` to see what changed
3. Implement the changes
4. Specs now guide changes to existing code!

## Success

This repository is now:
- ✅ Fully spec'd (100% coverage)
- ✅ Existing features documented
- ✅ Missing features identified
- ✅ Ready for spec-driven development
- ✅ Can evolve existing code through spec updates
```

---

## Step 10: Reconciliation Workflow

Here's the step-by-step process I'll follow:

### Phase 1: Discovery (15 minutes)
1. Read `docs/reverse-engineering/functional-specification.md` completely
2. Read `docs/reverse-engineering/technical-debt-analysis.md` for status
3. Read any existing specs to understand what was already done
4. Create comprehensive feature inventory (ALL features)

### Phase 2: Analysis (10 minutes)
1. Categorize each feature: ✅ COMPLETE | ⚠️ PARTIAL | ❌ MISSING
2. Identify features missing spec coverage
3. Identify specs that need updating
4. Plan numbering scheme (001-050+)

### Phase 3: Spec Generation (30-90 minutes)
1. Create specs for COMPLETE features (capture what exists)
2. Create specs for PARTIAL features (document exists + gaps)
3. Create specs for MISSING features (document what's needed)
4. Create `plan.md` for PARTIAL and MISSING features only
5. Create or update `.specify/memory/constitution.md`

### Phase 4: Validation (10 minutes)
1. Verify 100% feature coverage
2. Check all specs follow Spec Kit format
3. Ensure Implementation Status sections are accurate
4. Test that `/speckit.analyze` works
5. Create reconciliation report

### Phase 5: Cleanup (5 minutes)
1. Archive old incomplete specs (if any)
2. Organize specs/ directory
3. Update any README references
4. Commit the reconciled specs

---

## Example: Before vs After

### BEFORE Reconciliation

**docs/reverse-engineering/functional-specification.md** (150KB):
```markdown
# Functional Specification

## Features

1. User Authentication - Login, registration, password reset, JWT tokens
2. Product Catalog - Browse products, search, filter, categories
3. Shopping Cart - Add to cart, update quantities, checkout
4. Payment Processing - Stripe integration, credit cards, receipts
5. Order Management - View orders, track shipping, cancel orders
6. Email Notifications - Registration, password reset, order confirmation
7. Admin Dashboard - User management, product management, analytics
{...25 more features}
```

**specs/** (only 3 files):
```
specs/
├── gap-001-registration.md     ← Only MISSING features spec'd
├── gap-002-admin-dashboard.md  ← Only MISSING features spec'd
└── gap-003-email-notifications.md ← Only MISSING features spec'd
```

**Problem**:
- 30 features in app
- Only 3 specs exist (10% coverage)
- Specs only cover MISSING features
- Existing features (login, catalog, cart, payments, orders) have NO specs!

---

### AFTER Reconciliation

**specs/** (30 comprehensive files):
```
specs/
├── 001-user-authentication/
│   └── spec.md                 ← ✅ COMPLETE (captured existing impl)
├── 002-product-catalog/
│   └── spec.md                 ← ✅ COMPLETE (documented working feature)
├── 003-shopping-cart/
│   ├── spec.md                 ← ⚠️ PARTIAL (backend done, frontend missing)
│   └── plan.md                 ← Implementation plan for frontend
├── 004-payment-processing/
│   ├── spec.md                 ← ⚠️ PARTIAL (Stripe works, UI missing)
│   └── plan.md                 ← Implementation plan for UI
├── 005-order-management/
│   └── spec.md                 ← ✅ COMPLETE (fully working)
├── 006-email-notifications/
│   ├── spec.md                 ← ❌ MISSING (not started)
│   └── plan.md                 ← Implementation plan
├── 007-admin-dashboard/
│   ├── spec.md                 ← ❌ MISSING (not started)
│   └── plan.md                 ← Implementation plan
{...23 more features, each with full spec}
```

**Result**:
- ✅ 30 specs for 30 features (100% coverage!)
- ✅ 18 features marked ✅ COMPLETE (existing functionality now under spec control)
- ✅ 7 features marked ⚠️ PARTIAL (partial implementation documented)
- ✅ 5 features marked ❌ MISSING (gaps identified)
- ✅ Can now use specs to guide changes to existing features!
- ✅ Can implement missing features using `/speckit.implement`

---

## Step 11: Reconciliation Execution

I'm ready to reconcile your repository! Here's what I'll do:

### Phase 1: Audit
1. Read ALL reverse engineering docs
2. List ALL features in the application
3. Check existing specs (if any)
4. Identify spec coverage gaps

**I'll show you the feature inventory and ask for confirmation before proceeding.**

### Phase 2: Generate
1. Create comprehensive specs for EVERY feature
2. Mark implementation status based on codebase evidence
3. Create `plan.md` for incomplete features only
4. Ensure proper GitHub Spec Kit format

### Phase 3: Report
1. Show you what was created
2. Provide reconciliation summary
3. Explain next steps for using the specs

---

## Expected Outcomes

After reconciliation, you'll have:

### Complete Spec Coverage
- ✅ Every feature has a spec (not just gaps!)
- ✅ Existing features documented (under spec control)
- ✅ Missing features identified (ready to build)
- ✅ Partial features detailed (know what to complete)

### Actionable Next Steps
- ✅ Can run `/speckit.analyze` to validate specs
- ✅ Can run `/speckit.tasks` on any feature
- ✅ Can run `/speckit.implement` to build gaps
- ✅ Can UPDATE specs to guide changes to existing code

### Spec-Driven Development Enabled
- ✅ Future changes start with spec updates
- ✅ Existing code evolution is spec-guided
- ✅ Not just "build missing features" but "manage entire app through specs"

---

## Ready to Reconcile!

I'm ready to help reconcile your repository specifications.

**What I need from you**:

1. **Repository path**: Where is the repo with `docs/reverse-engineering/`?
2. **Confirm access**: Do I have permission to read docs and create specs?
3. **Existing specs**: Should I merge, archive, or replace existing specs?

**What I'll deliver**:

1. Complete feature inventory (ALL features, not just gaps)
2. Comprehensive specs for EVERY feature (✅/⚠️/❌)
3. Implementation plans for incomplete features
4. Reconciliation report showing before/after
5. 100% spec coverage enabling true spec-driven development

**Reconciliation Time**: 30-90 minutes depending on app size

---

**Let's get your repository into proper spec-driven shape!**

Tell me the repository path and I'll begin the reconciliation process.
