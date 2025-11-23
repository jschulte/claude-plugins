---
name: stackshift.review
description: Perform comprehensive code review across multiple dimensions - correctness, standards, security, performance, and testing. Returns APPROVED/NEEDS CHANGES/BLOCKED with specific feedback.
---

# Code Review

Comprehensive multi-dimensional code review with actionable feedback.

---

## Usage

```bash
# Review recent changes
/stackshift.review

# Review specific feature
/stackshift.review "pricing display feature"

# Review before deployment
/stackshift.review "OAuth2 implementation before production"
```

---

## What This Reviews

### 🔍 Correctness
- Does it work as intended?
- Are all requirements met?
- Logic errors or edge cases?
- Matches specification requirements?

### 📏 Standards Compliance
- Follows project conventions?
- Coding style consistent?
- Documentation adequate?
- Aligns with constitution principles?

### 🔒 Security Assessment
- No obvious vulnerabilities?
- Proper input validation?
- Secure data handling?
- Authentication/authorization correct?

### ⚡ Performance Review
- Efficient implementation?
- Resource usage reasonable?
- Scalability considerations?
- Database queries optimized?

### 🧪 Testing Validation
- Adequate test coverage?
- Edge cases handled?
- Error conditions tested?
- Integration tests included?

---

## Review Process

### Step 1: Identify What Changed

```bash
echo "🔍 Identifying changes to review..."

# Get recent changes
git diff HEAD~1 --name-only > changed-files.txt

# Show files to review
echo "Files to review:"
cat changed-files.txt | sed 's/^/  - /'

# Count by type
BACKEND_FILES=$(grep -E "api/|src/.*\.ts$|lib/" changed-files.txt | wc -l)
FRONTEND_FILES=$(grep -E "site/|pages/|components/.*\.tsx$" changed-files.txt | wc -l)
TEST_FILES=$(grep -E "\.test\.|\.spec\.|__tests__" changed-files.txt | wc -l)

echo ""
echo "📊 Changes breakdown:"
echo "   Backend: $BACKEND_FILES files"
echo "   Frontend: $FRONTEND_FILES files"
echo "   Tests: $TEST_FILES files"
echo ""
```

### Step 2: Review Each Dimension

```bash
echo "🔍 Performing multi-dimensional review..."
echo ""

# Correctness Check
echo "✓ Correctness Review"

# Check if tests exist for changed files
for file in $(cat changed-files.txt); do
  if [[ ! "$file" =~ \.test\. && ! "$file" =~ \.spec\. ]]; then
    # Look for corresponding test file
    TEST_FILE="${file%.ts}.test.ts"
    if [ ! -f "$TEST_FILE" ]; then
      echo "   ⚠️  Missing tests for: $file"
      echo "ISSUE: No test coverage for $file" >> review-issues.log
    fi
  fi
done

# Check against spec requirements
echo "   Checking against specifications..."
# Implementation reviews code against spec requirements

echo ""

# Standards Compliance
echo "✓ Standards Review"

# Check for common issues
grep -rn "console.log\|debugger" $(cat changed-files.txt) > debug-statements.log 2>/dev/null
if [ -s debug-statements.log ]; then
  echo "   ⚠️  Debug statements found:"
  cat debug-statements.log
  echo "ISSUE: Debug statements in production code" >> review-issues.log
fi

# Check for TODO/FIXME
grep -rn "TODO\|FIXME\|XXX\|HACK" $(cat changed-files.txt) > todos.log 2>/dev/null
if [ -s todos.log ]; then
  echo "   ⚠️  Unresolved TODOs found:"
  cat todos.log
  echo "ISSUE: Unresolved TODO comments" >> review-issues.log
fi

echo ""

# Security Assessment
echo "✓ Security Review"

# Check for common security issues
grep -rn "eval(\|innerHTML\|dangerouslySetInnerHTML" $(cat changed-files.txt) > security-issues.log 2>/dev/null
if [ -s security-issues.log ]; then
  echo "   ❌ Security concerns found:"
  cat security-issues.log
  echo "CRITICAL: Security vulnerability" >> review-issues.log
fi

# Check for hardcoded secrets/credentials
grep -rn "password.*=\|api.*key.*=\|secret.*=" $(cat changed-files.txt) > credentials.log 2>/dev/null
if [ -s credentials.log ]; then
  echo "   ❌ Potential hardcoded credentials:"
  cat credentials.log
  echo "CRITICAL: Hardcoded credentials" >> review-issues.log
fi

echo ""

# Performance Review
echo "✓ Performance Review"

# Check for common performance issues
grep -rn "for.*in.*forEach\|while.*push\|map.*filter.*map" $(cat changed-files.txt) > performance-issues.log 2>/dev/null
if [ -s performance-issues.log ]; then
  echo "   ⚠️  Potential performance issues:"
  cat performance-issues.log | head -5
  echo "ISSUE: Inefficient loops or chaining" >> review-issues.log
fi

echo ""

# Testing Validation
echo "✓ Testing Review"

# Check test quality
if [[ "$TEST_FILES" -gt 0 ]]; then
  # Check for proper test structure
  grep -rn "describe\|it(\|test(" $(grep "\.test\.\|\.spec\." changed-files.txt) > test-structure.log 2>/dev/null
  TEST_COUNT=$(grep -c "it(\|test(" test-structure.log || echo "0")

  echo "   Test cases found: $TEST_COUNT"

  if [[ "$TEST_COUNT" -lt 5 ]]; then
    echo "   ⚠️  Low test coverage detected"
    echo "ISSUE: Insufficient test cases (< 5)" >> review-issues.log
  fi
else
  echo "   ⚠️  No tests added for changes"
  echo "ISSUE: No test files modified" >> review-issues.log
fi

echo ""
```

### Step 3: Generate Review Report

```bash
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📋 Review Report"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_ISSUES=$(wc -l < review-issues.log 2>/dev/null || echo "0")
CRITICAL_ISSUES=$(grep -c "CRITICAL" review-issues.log 2>/dev/null || echo "0")

if [[ "$TOTAL_ISSUES" == "0" ]]; then
  echo "### ✅ APPROVED"
  echo ""
  echo "**Strengths:**"
  echo "- All quality checks passed"
  echo "- Spec compliance validated"
  echo "- Security review clean"
  echo "- Performance acceptable"
  echo "- Test coverage adequate"
  echo ""
  echo "**Decision:** Ready for next phase/deployment"
else
  if [[ "$CRITICAL_ISSUES" -gt 0 ]]; then
    echo "### 🚫 BLOCKED"
    echo ""
    echo "**Critical Issues Found:** $CRITICAL_ISSUES"
    echo ""
    echo "Critical issues must be resolved before proceeding:"
  else
    echo "### 🔄 NEEDS CHANGES"
    echo ""
    echo "**Issues Found:** $TOTAL_ISSUES"
    echo ""
    echo "Issues requiring attention:"
  fi

  echo ""
  cat review-issues.log | sed 's/^/  - /'
  echo ""

  echo "**Recommendations:**"
  echo "  1. Address critical security/spec violations first"
  echo "  2. Run /stackshift.validate --fix to auto-resolve technical issues"
  echo "  3. Add missing test coverage"
  echo "  4. Remove debug statements and TODOs"
  echo "  5. Re-run review after fixes"
  echo ""

  if [[ "$CRITICAL_ISSUES" -gt 0 ]]; then
    echo "**Decision:** BLOCKED - Cannot proceed until critical issues resolved"
  else
    echo "**Decision:** NEEDS CHANGES - Address issues before finalizing"
  fi
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Cleanup
rm -f changed-files.txt debug-statements.log todos.log security-issues.log \
      credentials.log performance-issues.log test-structure.log review-issues.log
```

---

## Review Categories

### ✅ APPROVED
- All critical issues resolved
- Meets quality standards
- Ready for next phase/deployment

### 🔄 NEEDS CHANGES
- Issues found requiring fixes
- Specific feedback provided
- Return to implementation

### 🚫 BLOCKED
- Fundamental issues requiring redesign
- Critical security vulnerabilities
- Major spec violations

---

## Quality Standards

- **No rubber stamping** - Actually review, don't just approve
- **Specific feedback** - Actionable recommendations with line numbers
- **Priority classification** - Critical, Important, Suggestion
- **Evidence-based** - Cite specific files, lines, patterns

---

## Integration with StackShift

**Auto-runs after:**
- Gear 6 completion
- `/stackshift.validate` finds issues
- Before final commit

**Manual usage:**
```bash
# Before committing
/stackshift.review

# After implementing feature
/stackshift.review "vehicle details feature"

# Before deployment
/stackshift.review "all changes since last release"
```

---

## Example Output

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Review Report
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 🔄 NEEDS CHANGES

**Issues Found:** 3

Issues requiring attention:

  - ISSUE: Debug statements in production code
  - ISSUE: No test coverage for api/handlers/pricing.ts
  - ISSUE: Inefficient loops or chaining in data-processor.ts

**Recommendations:**
  1. Remove console.log from api/handlers/pricing.ts:45
  2. Add test file: api/handlers/pricing.test.ts
  3. Refactor nested loops in data-processor.ts:78-82
  4. Re-run review after fixes

**Decision:** NEEDS CHANGES - Address issues before finalizing

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

**Quality assurance before every finalization!**
