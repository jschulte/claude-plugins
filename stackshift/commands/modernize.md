---
description: Execute Brownfield Upgrade Mode - spec-driven dependency modernization workflow. Runs 4-phase process: spec-guided test coverage, baseline analysis, dependency upgrade with spec-guided fixes, and spec validation. Based on thoth-cli dependency upgrade process adapted for spec-driven development.
---

# StackShift Modernize: Spec-Driven Dependency Upgrade

**Brownfield Upgrade Mode** - Execute after completing Gears 1-6

Run this command to modernize all dependencies while using specs as your guide and safety net.

---

## Quick Status Check

```bash
# Check prerequisites
echo "=== Prerequisites Check ==="

# 1. Specs exist?
SPEC_COUNT=$(find .specify/memory/specifications -name "*.md" 2>/dev/null | wc -l)
echo "Specs found: $SPEC_COUNT"

# 2. /speckit commands available?
ls .claude/commands/speckit.*.md 2>/dev/null | wc -l | xargs -I {} echo "Speckit commands: {}"

# 3. Tests passing?
npm test --silent && echo "Tests: ✅ PASSING" || echo "Tests: ❌ FAILING"

# 4. StackShift state?
cat .stackshift-state.json 2>/dev/null | jq -r '"\(.path) - Gear \(.currentStep // "complete")"' || echo "No state file"

if [ "$SPEC_COUNT" -lt 1 ]; then
  echo "❌ No specs found. Run Gears 1-6 first."
  exit 1
fi
```

---

## Phase 0: Spec-Guided Test Coverage Foundation

**Goal:** 85%+ coverage using spec acceptance criteria as test blueprint

**Time:** 30-90 minutes | **Mode:** Autonomous test writing

### 0.1: Load Specifications & Baseline Coverage

```bash
echo "=== Phase 0: Spec-Guided Test Coverage ==="
mkdir -p .upgrade

# List all specs
find .specify/memory/specifications -name "*.md" | sort | tee .upgrade/all-specs.txt
SPEC_COUNT=$(wc -l < .upgrade/all-specs.txt)

# Baseline coverage
npm test -- --coverage --watchAll=false 2>&1 | tee .upgrade/baseline-coverage.txt
COVERAGE=$(grep "All files" .upgrade/baseline-coverage.txt | grep -oE "[0-9]+\.[0-9]+" | head -1 || echo "0")

echo "Specs: $SPEC_COUNT"
echo "Coverage: ${COVERAGE}%"
echo "Target: 85%"
```

### 0.2: Map Tests to Specs

Create `.upgrade/spec-coverage-map.json` mapping each spec to its tests:

```bash
# For each spec, find which tests validate it
# Track which acceptance criteria are covered vs. missing
```

### 0.3: Write Tests for Missing Acceptance Criteria

**For each spec with missing coverage:**

1. Read spec file
2. Extract acceptance criteria section
3. For each criterion without a test:
   - Write test directly validating that criterion
   - Use Given-When-Then from spec
   - Ensure test actually validates behavior

**Example:**

```typescript
// From spec: user-authentication.md
// AC-3: "Given user logs in, When session expires, Then user redirected to login"

describe('User Authentication - AC-3: Session Expiration', () => {
  it('should redirect to login when session expires', async () => {
    // Given: User is logged in
    renderWithAuth(<Dashboard />, { authenticated: true });

    // When: Session expires
    await act(async () => {
      expireSession(); // Helper to expire token
    });

    // Then: User redirected to login
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
```

### 0.4: Iterative Coverage Improvement

```bash
ITERATION=1
TARGET=85
MIN=80

while (( $(echo "$COVERAGE < $TARGET" | bc -l) )); do
  echo "Iteration $ITERATION: ${COVERAGE}%"

  # Stop conditions
  if (( $(echo "$COVERAGE >= $MIN" | bc -l) )) && [ $ITERATION -gt 5 ]; then
    echo "✅ Min coverage reached"
    break
  fi

  # Find spec with lowest coverage
  # Write tests for missing acceptance criteria
  # Prioritize P0 > P1 > P2 specs

  npm test -- --coverage --watchAll=false --silent
  PREV=$COVERAGE
  COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)
  GAIN=$(echo "$COVERAGE - $PREV" | bc)

  # Diminishing returns?
  if (( $(echo "$GAIN < 0.5" | bc -l) )) && (( $(echo "$COVERAGE >= $MIN" | bc -l) )); then
    echo "✅ Diminishing returns (${GAIN}% gain)"
    break
  fi

  ITERATION=$((ITERATION + 1))
  [ $ITERATION -gt 10 ] && break
done

echo "✅ Phase 0 Complete: ${COVERAGE}% coverage"
```

### 0.5: Completion Marker

```bash
cat > .upgrade/stackshift-upgrade.yml <<EOF
widget_name: $(cat package.json | jq -r '.name')
route: brownfield-upgrade
started: $(date -u +"%Y-%m-%dT%H:%M:%SZ")

phase_0_complete: true
phase_0_coverage: $COVERAGE
specs_analyzed: $SPEC_COUNT
all_tests_passing: true
EOF
```

---

## Phase 1: Baseline & Analysis (READ-ONLY)

**Goal:** Understand current state, plan upgrade, identify spec impact

**Time:** 15-30 minutes | **Mode:** Read-only analysis

**🚨 NO FILE MODIFICATIONS IN PHASE 1**

### 1.1: Spec-Code Baseline

```bash
echo "=== Phase 1: Baseline & Analysis ==="

# Run spec analysis
/speckit.analyze | tee .upgrade/baseline-spec-analysis.txt

# Document which specs are COMPLETE/PARTIAL/MISSING
grep -E "✅|⚠️|❌" .upgrade/baseline-spec-analysis.txt > .upgrade/baseline-spec-status.txt
```

### 1.2: Dependency Analysis

```bash
# Current dependencies
npm list --depth=0 > .upgrade/dependencies-before.txt

# Outdated packages
npm outdated --json > .upgrade/outdated.json || echo "{}" > .upgrade/outdated.json

# Count major upgrades
MAJOR_COUNT=$(cat .upgrade/outdated.json | jq '[.[] | select(.current != .latest)] | length')
echo "Major upgrades: $MAJOR_COUNT"
```

### 1.3: Spec Impact Analysis

**For each major dependency upgrade, identify affected specs:**

```bash
# Create impact analysis
cat > .upgrade/spec-impact-analysis.json <<'EOF'
{
  "react": {
    "current": "17.0.2",
    "latest": "19.2.0",
    "breaking": true,
    "affectedSpecs": [
      "user-interface.md",
      "form-handling.md"
    ],
    "acceptanceCriteria": [
      "user-interface.md: AC-1, AC-3",
      "form-handling.md: AC-2"
    ],
    "testFiles": [
      "components/UserInterface.test.tsx"
    ],
    "risk": "HIGH"
  }
}
EOF
```

### 1.4: Generate Upgrade Plan

Create `.upgrade/UPGRADE_PLAN.md`:

```markdown
# Upgrade Plan

## Summary
- Dependencies to upgrade: ${MAJOR_COUNT} major versions
- Specs affected: [count from impact analysis]
- Risk level: [HIGH/MEDIUM/LOW]
- Estimated effort: 2-4 hours

## Critical Upgrades (Breaking Changes Expected)

### react: 17.0.2 → 19.2.0
- **Breaking Changes:**
  - Automatic batching
  - Hydration mismatches
  - useId for SSR
- **Affected Specs:**
  - user-interface.md (AC-1, AC-3, AC-5)
  - form-handling.md (AC-2, AC-4)
- **Test Files:**
  - components/UserInterface.test.tsx
  - components/FormHandler.test.tsx
- **Risk:** HIGH

[Continue for all major upgrades...]

## Spec Impact Summary

### High-Risk Specs (Validate Carefully)
1. user-interface.md - React changes affect all components
2. form-handling.md - State batching changes

### Low-Risk Specs (Quick Validation)
[List specs unlikely to be affected]

## Upgrade Sequence
1. Update package.json versions
2. npm install
3. Fix TypeScript errors
4. Fix test failures (spec-guided)
5. Fix build errors
6. Validate with /speckit.analyze
```

### 1.5: Update Tracking

```bash
cat >> .upgrade/stackshift-upgrade.yml <<EOF
phase_1_complete: true
phase_1_date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
planned_major_upgrades: $MAJOR_COUNT
high_risk_specs: [count]
upgrade_plan_created: true
EOF
```

---

## Phase 2: Dependency Upgrade & Spec-Guided Fixes

**Goal:** Upgrade all dependencies, fix breaking changes using specs

**Time:** 1-4 hours | **Mode:** Implementation with spec guidance

### 2.1: Pre-Flight Check

```bash
echo "=== Pre-Flight Health Check ==="

npm test && echo "Tests: ✅" || (echo "Tests: ❌ STOP" && exit 1)
npm run build && echo "Build: ✅" || (echo "Build: ❌ STOP" && exit 1)
npm run lint 2>/dev/null && echo "Lint: ✅" || echo "Lint: ⚠️ OK"

# Must be green to proceed
```

### 2.2: Create Upgrade Branch

```bash
git checkout -b upgrade/dependencies-to-latest
git add .upgrade/
git commit -m "docs: upgrade baseline and plan

Phase 0: Coverage ${COVERAGE}%
Phase 1: Analysis complete
Specs: $SPEC_COUNT validated
Ready for Phase 2
"
```

### 2.3: Upgrade Dependencies

```bash
echo "=== Upgrading Dependencies ==="

# Upgrade to latest
npx npm-check-updates -u
npm install

# Update Node (optional but recommended)
echo "22.21.0" > .nvmrc
nvm install 22.21.0
nvm use

# Document changes
npm list --depth=0 > .upgrade/dependencies-after.txt
```

### 2.4: Detect Breaking Changes

```bash
echo "=== Testing After Upgrade ==="

npm test 2>&1 | tee .upgrade/test-results-post-upgrade.txt

# Extract failures
grep -E "FAIL|✕" .upgrade/test-results-post-upgrade.txt > .upgrade/failures.txt || true
FAILURE_COUNT=$(wc -l < .upgrade/failures.txt)

echo "Breaking changes: $FAILURE_COUNT test failures"
```

### 2.5: Spec-Guided Fix Loop

**Autonomous iteration until all tests pass:**

```bash
ITERATION=1
MAX_ITERATIONS=20

while ! npm test --silent 2>&1; do
  echo "=== Fix Iteration $ITERATION ==="

  # Get first failing test
  FAILING_TEST=$(npm test 2>&1 | grep -m 1 "FAIL" | grep -oE "[^ ]+\.test\.[jt]sx?" || echo "")

  if [ -z "$FAILING_TEST" ]; then
    echo "No specific test file found, checking for general errors..."
    npm test 2>&1 | head -50
    break
  fi

  echo "Failing test: $FAILING_TEST"

  # Find spec from coverage map
  SPEC=$(jq -r "to_entries[] | select(.value.testFiles[] | contains(\"$FAILING_TEST\")) | .key" .upgrade/spec-coverage-map.json || echo "")

  if [ -n "$SPEC" ]; then
    echo "Validates spec: $SPEC"
    echo "Loading spec acceptance criteria..."
    cat ".specify/memory/specifications/$SPEC" | grep -A 20 "Acceptance Criteria"
  fi

  # FIX THE BREAKING CHANGE
  # - Read spec acceptance criteria
  # - Understand intended behavior
  # - Fix code to preserve that behavior
  # - Run test to verify fix

  # Log fix
  echo "[$ITERATION] Fixed: $FAILING_TEST (spec: $SPEC)" >> .upgrade/fixes-applied.log

  # Commit incremental fix
  git add -A
  git commit -m "fix: breaking change in $FAILING_TEST

Spec: $SPEC
Fixed to preserve acceptance criteria behavior
"

  ITERATION=$((ITERATION + 1))

  if [ $ITERATION -gt $MAX_ITERATIONS ]; then
    echo "⚠️ Max iterations reached - manual review needed"
    break
  fi
done

echo "✅ All tests passing"
```

### 2.6: Build & Lint

```bash
# Fix build
npm run build || (echo "Fixing build errors..." && [fix build])

# Fix lint (often ESLint 9 config changes)
npm run lint || (echo "Fixing lint..." && [update eslint.config.js])
```

### 2.7: Phase 2 Complete

```bash
npm test && npm run build && npm run lint

FINAL_COVERAGE=$(jq '.total.lines.pct' coverage/coverage-summary.json)

cat >> .upgrade/stackshift-upgrade.yml <<EOF
phase_2_complete: true
phase_2_date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
test_coverage_after: $FINAL_COVERAGE
fixes_applied: $(wc -l < .upgrade/fixes-applied.log)
all_passing: true
EOF
```

---

## Phase 3: Spec Validation & PR

**Goal:** Validate specs match code, create PR

**Time:** 15-30 minutes

### 3.1: Spec Validation

```bash
echo "=== Phase 3: Spec Validation ==="

# Run spec analysis
/speckit.analyze | tee .upgrade/final-spec-analysis.txt

# Check for drift
if grep -q "drift\|mismatch\|inconsistent" .upgrade/final-spec-analysis.txt; then
  echo "⚠️ Drift detected - investigating..."
  # Review and fix any drift
fi
```

### 3.2: Generate Upgrade Report

```bash
# Create comprehensive report
cat > .upgrade/UPGRADE_REPORT.md <<EOF
# Dependency Upgrade Report

**Date:** $(date)
**Project:** $(cat package.json | jq -r '.name')
**Route:** Brownfield Upgrade (StackShift Modernize)

## Summary

- **Dependencies Upgraded:** $(wc -l < .upgrade/dependencies-after.txt) packages
- **Breaking Changes Fixed:** $(wc -l < .upgrade/fixes-applied.log)
- **Test Coverage:** ${BASELINE_COVERAGE}% → ${FINAL_COVERAGE}%
- **Spec Validation:** ✅ $(grep -c "✅ COMPLETE" .upgrade/final-spec-analysis.txt) specs validated
- **Security:** $(npm audit --json | jq '.metadata.vulnerabilities.total // 0') vulnerabilities

## Major Dependency Upgrades

$(npm outdated --json | jq -r 'to_entries[] | "- **\(.key):** \(.value.current) → \(.value.latest)"')

## Breaking Changes Fixed

$(cat .upgrade/fixes-applied.log)

## Spec Validation Results

- **Total Specs:** $SPEC_COUNT
- **Validated:** ✅ All passing
- **Drift:** None detected
- **Specs Updated:** [if any, list why]

## Test Coverage

- **Before:** ${BASELINE_COVERAGE}%
- **After:** ${FINAL_COVERAGE}%
- **Target:** 85% ✅

## Security Improvements

$(npm audit --json | jq -r '.vulnerabilities | to_entries[] | select(.value.via[0].severity == "high" or .value.via[0].severity == "critical") | "- \(.key): \(.value.via[0].title)"' || echo "No high/critical vulnerabilities")

## Validation Checklist

- [x] All tests passing
- [x] Build successful
- [x] Lint passing
- [x] Coverage ≥85%
- [x] Specs validated (/speckit.analyze)
- [x] No high/critical vulnerabilities
- [ ] Code review
- [ ] Merge approved
EOF

cat .upgrade/UPGRADE_REPORT.md
```

### 3.3: Create Pull Request

```bash
# Final commit
git add -A
git commit -m "$(cat <<'EOF'
chore: upgrade all dependencies to latest versions

Spec-driven upgrade using StackShift modernize workflow.

Phases Completed:
- Phase 0: Test coverage ${BASELINE_COVERAGE}% → ${FINAL_COVERAGE}%
- Phase 1: Analysis & planning
- Phase 2: Upgrades & spec-guided fixes
- Phase 3: Validation ✅

See .upgrade/UPGRADE_REPORT.md for complete details.
EOF
)"

# Push
git push -u origin upgrade/dependencies-to-latest

# Create PR
gh pr create \
  --title "chore: Upgrade all dependencies to latest versions" \
  --body-file .upgrade/UPGRADE_REPORT.md
```

### 3.4: Final Tracking Update

```bash
cat >> .upgrade/stackshift-upgrade.yml <<EOF
phase_3_complete: true
upgrade_complete: true
completion_date: $(date -u +"%Y-%m-%dT%H:%M:%SZ")
pr_number: $(gh pr list --head upgrade/dependencies-to-latest --json number -q '.[0].number')
pr_url: $(gh pr list --head upgrade/dependencies-to-latest --json url -q '.[0].url')
final_status: SUCCESS
EOF

echo ""
echo "🎉 ========================================="
echo "   MODERNIZATION COMPLETE!"
echo "========================================="
echo ""
echo "✅ Dependencies: All latest versions"
echo "✅ Tests: All passing"
echo "✅ Coverage: ${FINAL_COVERAGE}% (target: 85%)"
echo "✅ Specs: Validated with /speckit.analyze"
echo "✅ Build: Successful"
echo "✅ Security: Vulnerabilities resolved"
echo ""
echo "📋 Report: .upgrade/UPGRADE_REPORT.md"
echo "🔗 PR: $(gh pr list --head upgrade/dependencies-to-latest --json url -q '.[0].url')"
echo ""
```

---

## Key Differences from thoth-cli

**Generic upgrade workflow:**
- 3 phases (coverage, discovery, implementation)
- Target latest versions per package manager
- Enzyme removal required
- ESLint 9 flat config required
- Batch processing 90+ widgets

**StackShift modernize (Generic + Spec-driven):**
- 4 phases (includes spec validation)
- Latest versions (whatever is current)
- **Spec acceptance criteria guide test writing**
- **Specs guide breaking change fixes**
- **Continuous spec validation**
- Single repo focus

**What we learned from thoth-cli:**
- ✅ Phase 0 test coverage foundation
- ✅ Read-only analysis phase
- ✅ Iterative fix loop
- ✅ Autonomous test writing
- ✅ Comprehensive tracking files
- ✅ Validation before proceeding

**What we added for specs:**
- ✅ Spec acceptance criteria = test blueprint
- ✅ Spec impact analysis
- ✅ Spec-guided breaking change fixes
- ✅ /speckit.analyze validation
- ✅ Spec-coverage mapping

---

## Success Criteria

- ✅ All dependencies at latest stable
- ✅ Test coverage ≥85%
- ✅ All tests passing
- ✅ Build successful
- ✅ /speckit.analyze: No drift
- ✅ PR created
- ✅ Security issues resolved

---

## Troubleshooting

**"Tests failing after upgrade"**
```bash
# 1. Find failing test
npm test 2>&1 | grep FAIL

# 2. Find spec
jq '.[] | select(.testFiles[] | contains("failing-test.ts"))' .upgrade/spec-coverage-map.json

# 3. Read spec acceptance criteria
cat .specify/memory/specifications/[spec-name].md | grep -A 10 "Acceptance Criteria"

# 4. Fix to match spec
# 5. Verify with npm test
```

**"Can't reach 85% coverage"**
```bash
# Check which acceptance criteria lack tests
cat .upgrade/spec-coverage-map.json | jq '.[] | select(.missingCoverage | length > 0)'

# Write tests for those criteria
```

**"/speckit.analyze shows drift"**
```bash
# Review what changed
/speckit.analyze

# Fix code to match spec OR
# Update spec if intentional improvement
```

---

**Remember:** Specs are your north star. When breaking changes occur, specs tell you what behavior to preserve.
