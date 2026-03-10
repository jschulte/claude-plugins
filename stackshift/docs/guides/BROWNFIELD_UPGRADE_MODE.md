<!--
SPDX-License-Identifier: MIT
Copyright (c) 2024 Jonah Schulte
-->

# Brownfield Upgrade Mode

**Modernize dependencies without a full rewrite**

---

## Overview

Brownfield Upgrade Mode allows you to upgrade ALL dependencies to their latest versions after establishing complete spec coverage. Unlike a full rewrite (Greenfield), this approach modernizes your existing codebase systematically using specs as your safety net.

**When to use:**
- Legacy app stuck on old dependencies (security vulnerabilities)
- Want modern tooling benefits without full rewrite
- Have completed StackShift Gears 1-6 (full spec coverage)
- Ready for systematic modernization

**What you get:**
- All dependencies at latest stable versions
- 85%+ test coverage (improved using spec acceptance criteria)
- Specs validated to match upgraded code
- Security vulnerabilities eliminated
- Breaking changes fixed with spec guidance

---

## Inspiration: existing migration tools



### Phase 0: Spec-Guided Test Coverage (30-90 min)

**Goal:** Achieve 85%+ test coverage BEFORE upgrading

**Why first:**
- Acts as safety net during upgrade
- Detects regressions immediately
- Validates behavior preservation

**Approach:**
1. Load all specs from `.specify/memory/specifications/`
2. Extract acceptance criteria from each spec
3. Map existing tests to acceptance criteria
4. Write tests for missing criteria
5. Iterate until 85%+ coverage

**Output:**
- `.upgrade/spec-coverage-map.json` - Maps tests to specs
- 85%+ test coverage
- Every acceptance criterion has test

**Example:**

From `user-authentication.md`:
```markdown
## Acceptance Criteria
- AC-1: Given valid email, When user submits, Then account created
- AC-2: Given weak password, When user submits, Then error shown
- AC-3: Given user logs in, When session expires, Then redirect to login
```

Tests written:
```typescript
// AC-1 test
it('should create account with valid email', ...)

// AC-2 test
it('should show error for weak password', ...)

// AC-3 test
it('should redirect to login when session expires', ...)
```

---

### Phase 1: Baseline & Analysis - READ ONLY (15-30 min)

**Goal:** Understand current state and plan upgrade

**Why read-only:**
- Understand impact before making changes
- Plan fixes before breaking things
- Identify high-risk areas

**Steps:**
1. Run `/speckit.analyze` → Document current spec-code alignment
2. Run `npm outdated` → See what will change
3. Analyze spec impact → Which specs affected by breaking changes?
4. Generate upgrade plan → `.upgrade/UPGRADE_PLAN.md`
5. Create tracking file → `.upgrade/stackshift-upgrade.yml`

**Output:**
- `.upgrade/UPGRADE_PLAN.md` - Complete upgrade plan
- `.upgrade/spec-impact-analysis.json` - Which specs affected
- `.upgrade/dependencies-before.txt` - Current versions
- `.upgrade/stackshift-upgrade.yml` - Progress tracking

**Example Spec Impact:**

```json
{
  "react": {
    "current": "17.0.2",
    "latest": "19.2.0",
    "breaking": true,
    "affectedSpecs": [
      "user-interface.md",  // Uses React components
      "form-handling.md"    // State batching changes
    ],
    "risk": "HIGH"
  }
}
```

---

### Phase 2: Upgrade & Spec-Guided Fixes (1-4 hours)

**Goal:** Upgrade dependencies, fix breaking changes

**Approach:**
1. Create upgrade branch
2. Upgrade ALL dependencies (`npx npm-check-updates -u`)
3. Run tests → Detect failures
4. For EACH failure:
   - Load spec that test validates (from coverage map)
   - Read acceptance criterion test is checking
   - Fix code to preserve spec behavior
   - Verify fix with test
   - Commit incremental fix
5. Continue until all tests pass

**Spec-Guided Fix Example:**

```
Test fails: user-interface.test.ts - "renders user profile"

1. Find spec: spec-coverage-map.json → "user-interface.md"

2. Load spec:
   cat .specify/memory/specifications/user-interface.md

3. Find AC:
   "AC-5: Given user profile data, When component renders,
    Then displays name, email, and avatar"

4. Fix code:
   - React 19 changed rendering behavior
   - Update component to preserve "displays name, email, avatar" behavior
   - Ensure spec AC-5 still met

5. Verify:
   npm test -- user-interface.test.ts ✅
```

**Decision Matrix:**

| Situation | Action |
|-----------|--------|
| Breaking change, spec clear | Fix code to match spec |
| Breaking change, spec unclear | Run `/speckit.clarify` first |
| Breaking change is improvement | Update spec + code (document why) |
| Just API change, same behavior | Update code only (no spec change) |

---

### Phase 3: Validation & PR (15-30 min)

**Goal:** Ensure specs match code, create PR

**Steps:**
1. Run `/speckit.analyze` → Validate no drift
2. Verify coverage ≥85%
3. Run full validation (tests, build, lint)
4. Generate upgrade report
5. Create PR with spec validation

**Validation:**

```bash
# All must pass
npm test              # ✅ All passing
npm run build         # ✅ Successful
npm run lint          # ✅ No errors
/speckit.analyze      # ✅ All specs match code
npm audit             # ✅ No high/critical

# Coverage check
COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
[ $(echo "$COVERAGE >= 85" | bc) -eq 1 ] && echo "✅ Coverage: ${COVERAGE}%" || echo "❌ Coverage too low"
```

---


## Usage

### Option 1: During Initial Analysis (Gear 1)

When asked about Brownfield mode:

```
Would you like to enable Upgrade mode?

A) Standard - Spec the current state as-is
B) Upgrade - Spec current state + modernize dependencies

Choose: B
```

This sets `modernize: true` in state. After Gear 6, modernize auto-triggers.

### Option 2: After Gear 6

If you completed Gears 1-6 without upgrade mode:

```bash
# Run the slash command
/stackshift.modernize

# Or invoke the skill
"I want to modernize this application's dependencies"
```

---

## Prerequisites

Before running modernize:

- ✅ Completed Gears 1-6 (Brownfield route)
- ✅ Full spec coverage in `.specify/memory/specifications/`
- ✅ `/speckit.*` commands available
- ✅ Tests currently passing
- ✅ Build currently working
- ✅ Git working tree clean

If any missing, fix first.

---

## Files Created

```
.upgrade/
├── stackshift-upgrade.yml           # Progress tracking
├── spec-coverage-map.json           # Tests → Specs mapping
├── baseline-coverage.txt            # Pre-upgrade test coverage
├── dependencies-before.txt          # Pre-upgrade versions
├── UPGRADE_PLAN.md                  # Phase 1 analysis & plan
├── spec-impact-analysis.json        # Which specs affected
├── dependencies-after.txt           # Post-upgrade versions
├── test-results-post-upgrade.txt    # Initial test run
├── fixes-applied.log                # Each breaking change fix
├── final-spec-analysis.txt          # /speckit.analyze results
└── UPGRADE_REPORT.md                # Final comprehensive report
```

---

## Success Criteria

Upgrade complete when:

- ✅ All dependencies at latest stable versions
- ✅ Test coverage ≥85%
- ✅ All tests passing
- ✅ Build successful
- ✅ Lint passing
- ✅ `/speckit.analyze` shows all specs COMPLETE (no drift)
- ✅ No high/critical security vulnerabilities
- ✅ PR created with comprehensive report
- ✅ Specs updated if behavior changed (documented why)

---

## Benefits

**vs. Staying on Old Dependencies:**
- ✅ Eliminate security vulnerabilities
- ✅ Get modern tooling features
- ✅ Improved performance
- ✅ Active maintenance/support

**vs. Full Rewrite (Greenfield):**
- ✅ Much faster (days vs. months)
- ✅ Lower risk (incremental changes)
- ✅ Keep working code
- ✅ Spec-guided safety net

**vs. Manual Upgrade:**
- ✅ Systematic process
- ✅ Spec guidance on fixes
- ✅ Comprehensive validation
- ✅ Documented in upgrade report

---

## Example: Next.js 12 → 15 Upgrade

```bash
# Before upgrade
next: 12.3.0
react: 17.0.2
test coverage: 78%

# After Phase 0
test coverage: 87% (added tests from spec ACs)

# After Phase 1
.upgrade/UPGRADE_PLAN.md created
Identified: 5 high-risk specs affected by Next.js 15 changes

# After Phase 2
next: 15.1.0
react: 19.2.0
Breaking changes: 12 fixed (spec-guided)
All tests passing ✅

# After Phase 3
/speckit.analyze: All specs validated ✅
PR created with upgrade report
```

---

## Related Commands

- `/speckit.analyze` - Validate specs match code
- `/speckit.clarify` - Resolve spec ambiguities
- `/stackshift.modernize` - This command

---

**Remember:** Specs make upgrades safer. They're your contract defining how the system should behave. Preserve that contract while modernizing underneath.
