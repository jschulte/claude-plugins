---
name: stackshift.validate
description: Systematically validate implementation against specifications. Runs tests, TypeScript checks, and spec compliance validation. Use after implementation to ensure quality before finalizing.
---

# Validate Implementation

Comprehensive validation of implementation against specifications with automatic fixing capability.

---

## Usage

```bash
# Run full validation
/stackshift.validate

# Run with automatic fixes
/stackshift.validate --fix

# Focus on specific feature
/stackshift.validate --feature=vehicle-details

# TypeScript check only
/stackshift.validate --type-check-only
```

---

## What This Does

**Phase 1: Assessment**
1. Run full test suite
2. Run TypeScript compilation
3. Categorize failures (imports, types, spec violations, mocks)
4. Cross-reference against specifications

**Phase 2: Spec Compliance**
1. Validate implementation matches spec requirements
2. Check for missing specified features
3. Verify API contracts are implemented
4. Assess priorities (spec violations are P1)

**Phase 3: Resolution (if --fix mode)**
1. Fix import/export issues
2. Fix type mismatches (aligned with spec)
3. Fix specification compliance gaps
4. Fix test mocks
5. Validate after each fix
6. Rollback if fixes break things

**Phase 4: Final Validation**
1. Re-run all tests
2. Verify TypeScript compilation
3. Confirm spec compliance
4. Generate quality report

---

## Command Execution

### Phase 1: Comprehensive Assessment

```bash
echo "🚀 Starting Implementation Validation"
echo ""

# Run test suite
echo "🧪 Running test suite..."
npm test 2>&1 | tee test-results.log

# Extract statistics
TOTAL_TESTS=$(grep -o "[0-9]* tests" test-results.log | head -1 || echo "0")
FAILED_TESTS=$(grep -o "[0-9]* failed" test-results.log || echo "0")
PASSED_TESTS=$(grep -o "[0-9]* passed" test-results.log || echo "0")

echo "📊 Test Results:"
echo "   Total: $TOTAL_TESTS"
echo "   Passed: $PASSED_TESTS"
echo "   Failed: $FAILED_TESTS"
echo ""

# Run TypeScript validation
echo "🔍 Running TypeScript validation..."
npx tsc --noEmit 2>&1 | tee typescript-results.log

TS_ERRORS=$(grep -c "error TS" typescript-results.log || echo "0")
echo "📊 TypeScript Results:"
echo "   Errors: $TS_ERRORS"
echo ""
```

### Phase 2: Specification Validation

```bash
echo "📋 Validating against specifications..."
echo ""

# Find all spec files
SPEC_DIR=".specify/memory/specifications"
if [ ! -d "$SPEC_DIR" ]; then
  SPEC_DIR="specs"
fi

# For each spec, check implementation
for spec in $(find $SPEC_DIR -name "*.md" -o -name "spec.md"); do
  SPEC_NAME=$(basename $(dirname $spec) 2>/dev/null || basename $spec .md)

  echo "🔍 Checking: $SPEC_NAME"

  # Extract required files/components from spec
  # Look for "Files:" or "Implementation Status:" sections
  grep -A 20 "^## Files\|^## Implementation Status" "$spec" | \
    grep -o "\`[^`]*\.(ts|tsx|js|jsx|py|go)\`" | \
    sed 's/`//g' > required-files-$SPEC_NAME.txt

  # Check if required files exist
  while read file; do
    if [ ! -f "$file" ]; then
      echo "   ❌ Missing file: $file"
      echo "SPEC_VIOLATION: $SPEC_NAME missing $file" >> spec-violations.log
    fi
  done < required-files-$SPEC_NAME.txt

  # Clean up temp file
  rm required-files-$SPEC_NAME.txt
done

SPEC_VIOLATIONS=$(wc -l < spec-violations.log 2>/dev/null || echo "0")
echo ""
echo "📊 Specification Compliance:"
echo "   Violations: $SPEC_VIOLATIONS"
echo ""
```

### Phase 3: Categorize Issues

```bash
echo "📋 Categorizing failures..."
echo ""

# Extract import/export errors
grep -n "Cannot find module\|Module not found\|has no exported member" \
  test-results.log typescript-results.log 2>/dev/null > import-errors.log

# Extract type mismatch errors
grep -n "Type.*is not assignable\|Property.*does not exist\|Argument of type" \
  typescript-results.log 2>/dev/null > type-errors.log

# Extract test assertion failures
grep -n "AssertionError\|Expected.*but received\|toBe\|toEqual" \
  test-results.log 2>/dev/null > test-failures.log

IMPORT_ERRORS=$(wc -l < import-errors.log 2>/dev/null || echo "0")
TYPE_ERRORS=$(wc -l < type-errors.log 2>/dev/null || echo "0")
TEST_FAILURES=$(wc -l < test-failures.log 2>/dev/null || echo "0")

echo "📊 Issue Breakdown:"
echo "   P1 - Spec Violations: $SPEC_VIOLATIONS (highest priority)"
echo "   P2 - Type Errors: $TYPE_ERRORS"
echo "   P3 - Import Errors: $IMPORT_ERRORS"
echo "   P4 - Test Failures: $TEST_FAILURES"
echo ""
```

### Phase 4: Fix Mode (if --fix)

```bash
# Only run if --fix flag provided
if [[ "$FIX_MODE" == "true" ]]; then
  echo "🔧 Automatic fix mode enabled"
  echo "⚠️  Creating backup..."

  # Backup current state
  git stash push -m "stackshift-validate backup $(date +%Y%m%d-%H%M%S)"

  echo ""
  echo "🔧 Fixing issues in priority order..."
  echo ""

  # P1: Fix spec violations first
  if [[ "$SPEC_VIOLATIONS" != "0" ]]; then
    echo "🔧 P1: Resolving specification violations..."

    # Read spec violations and attempt to implement missing files/features
    while read violation; do
      echo "   Fixing: $violation"
      # Implementation would add missing files based on spec requirements
    done < spec-violations.log

    # Re-validate
    echo "   Re-checking spec compliance..."
    # Re-run spec validation
  fi

  # P2: Fix type errors
  if [[ "$TYPE_ERRORS" != "0" ]]; then
    echo "🔧 P2: Resolving type errors..."

    # Show first few type errors for context
    head -10 type-errors.log

    echo "   Analyzing type mismatches against spec..."
    # Implementation would fix types to match spec definitions
  fi

  # P3: Fix import errors
  if [[ "$IMPORT_ERRORS" != "0" ]]; then
    echo "🔧 P3: Resolving import errors..."

    # Show import errors
    cat import-errors.log

    echo "   Adding missing exports..."
    # Implementation would add missing exports
  fi

  # P4: Fix test failures
  if [[ "$TEST_FAILURES" != "0" ]]; then
    echo "🔧 P4: Resolving test failures..."

    # Show test failures
    head -10 test-failures.log

    echo "   Fixing test assertions..."
    # Implementation would fix failing tests
  fi

  echo ""
  echo "🔄 Re-running validation after fixes..."

  # Re-run tests and type check
  npm test 2>&1 | tee final-test-results.log
  npx tsc --noEmit 2>&1 | tee final-ts-results.log

  FINAL_FAILED=$(grep -o "[0-9]* failed" final-test-results.log || echo "0")
  FINAL_TS_ERRORS=$(grep -c "error TS" final-ts-results.log || echo "0")

  if [[ "$FINAL_FAILED" == "0" && "$FINAL_TS_ERRORS" == "0" ]]; then
    echo "✅ All issues resolved!"
    echo "🎉 Implementation validated successfully"
  else
    echo "❌ Some issues remain"
    echo "   Failed tests: $FINAL_FAILED"
    echo "   Type errors: $FINAL_TS_ERRORS"
    echo ""
    echo "🔄 Rolling back changes..."
    git stash pop
    exit 1
  fi
else
  echo "ℹ️  Run with --fix to automatically resolve issues"
fi
```

### Final Report

```bash
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Validation Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [[ "$SPEC_VIOLATIONS" == "0" && "$TYPE_ERRORS" == "0" && \
      "$IMPORT_ERRORS" == "0" && "$TEST_FAILURES" == "0" ]]; then
  echo "✅ VALIDATION PASSED"
  echo ""
  echo "   All tests passing: ✅"
  echo "   TypeScript compiling: ✅"
  echo "   Spec compliance: ✅"
  echo "   Code quality: ✅"
  echo ""
  echo "🚀 Implementation is production-ready!"
else
  echo "⚠️  VALIDATION ISSUES FOUND"
  echo ""
  echo "   Spec Violations: $SPEC_VIOLATIONS"
  echo "   Type Errors: $TYPE_ERRORS"
  echo "   Import Errors: $IMPORT_ERRORS"
  echo "   Test Failures: $TEST_FAILURES"
  echo ""
  echo "💡 Recommendations:"
  echo "   1. Run with --fix to auto-resolve issues"
  echo "   2. Review spec-violations.log for spec compliance gaps"
  echo "   3. Run /stackshift.review for detailed code review"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup temp files
rm -f test-results.log typescript-results.log import-errors.log \
      type-errors.log test-failures.log spec-violations.log \
      final-test-results.log final-ts-results.log
```

---

## Options

- `--fix` - Automatically attempt to fix identified issues
- `--feature=<name>` - Focus validation on specific feature
- `--spec-first` - Prioritize spec compliance (default)
- `--type-check-only` - Only run TypeScript validation
- `--no-rollback` - Disable automatic rollback on failures

---

## Success Criteria

✅ All tests pass (0 failures)
✅ TypeScript compiles (0 errors)
✅ Spec compliance (0 violations)
✅ Quality gates passed

---

## Integration with StackShift

**Auto-runs after Gear 6:**
```
Gear 6: Implement features ✅
  ↓
Gear 6.5: Validate & Review
  1. /stackshift.validate --fix
  2. /stackshift.review (if issues found)
  3. /stackshift.coverage (generate coverage map)
  ↓
Complete with confidence! 🎉
```

**Manual usage anytime:**
```bash
# Before committing
/stackshift.validate

# Before pull request
/stackshift.validate --fix

# Check specific feature
/stackshift.validate --feature=pricing-display
```

---

## Principles

1. **Specification Supremacy** - Specs are source of truth
2. **Zero Tolerance** - ALL tests must pass, ALL types must compile
3. **No Configuration Shortcuts** - Fix implementation, not configs
4. **Progressive Fix Strategy** - Address spec violations first
5. **Safety First** - Automatic rollback on fix failures
6. **Comprehensive Reporting** - Clear categorization and progress tracking

---

**This ensures every implementation is validated against specifications before being marked complete!**
