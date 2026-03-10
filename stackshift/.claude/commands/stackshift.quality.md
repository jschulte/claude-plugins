---
name: stackshift.quality
description: Analyze specification quality and get scores on completeness, testability, and clarity. Provides actionable feedback for improving specs.
---

# Spec Quality Analysis

Analyze the quality of specifications in this project and provide actionable feedback.

## What This Command Does

This command analyzes all specifications in the `.specify/` directory and scores them on:

1. **Completeness** (35% weight)
   - Are all required sections present? (Feature, User Stories, Acceptance Criteria, Technical Requirements)
   - Are recommended sections included? (Dependencies, Out of Scope, Implementation Notes)
   - Are there unresolved `[NEEDS CLARIFICATION]` or `TODO` markers?

2. **Testability** (35% weight)
   - Are acceptance criteria measurable? (specific numbers, timeouts, status codes)
   - Do criteria use definitive language? (must, shall, will)
   - Are there vague criteria? (should be good, performant, seamless)

3. **Clarity** (30% weight)
   - Is the language unambiguous? (avoiding: appropriate, reasonable, some, various)
   - Are sentences concise? (< 40 words)
   - Are examples provided? (code blocks, Given/When/Then)

## Process

1. **Find specifications** in `.specify/memory/specifications/` or alternative locations
2. **Analyze each spec** for completeness, testability, and clarity
3. **Calculate scores** (0-100) for each dimension
4. **Identify issues** (errors, warnings, info)
5. **Generate suggestions** for improvement
6. **Output report** with visual score bars

## Output Format

```
# Specification Quality Report

**Generated:** 2024-11-24 10:30:00
**Project:** /path/to/project

## Summary

Overall Score:    ████████░░ 80/100
Completeness:     █████████░ 90/100
Testability:      ███████░░░ 70/100
Clarity:          ████████░░ 80/100

**Specs Analyzed:** 5
**Issues:** 2 errors, 5 warnings, 3 info

## Specifications

### ✅ user-authentication (92/100)
| Metric | Score |
|--------|-------|
| Completeness | 95/100 |
| Testability | 90/100 |
| Clarity | 90/100 |

### ⚠️ payment-processing (65/100)
| Metric | Score |
|--------|-------|
| Completeness | 70/100 |
| Testability | 55/100 |
| Clarity | 70/100 |

**Issues:**
- ⚠️ Found 3 "[NEEDS CLARIFICATION]" markers
- ⚠️ Vague or untestable criteria: "should be fast and responsive..."

**Suggestions:**
- 💡 Make 3 criteria more specific with measurable values
- 💡 Consider adding "Testing Strategy" section
```

## Scoring Thresholds

| Score | Rating | Action |
|-------|--------|--------|
| 80-100 | ✅ Good | Ready for implementation |
| 60-79 | ⚠️ Needs Work | Address warnings before implementing |
| 0-59 | ❌ Poor | Significant revision needed |

## Example Usage

**After running StackShift Gear 3 (Create Specs):**
```
/stackshift.quality
```

**Before implementing a feature:**
```
/stackshift.quality
# Review suggestions
# Fix issues in specs
# Re-run to verify improvement
```

## Integration with CI/CD

Copy `.github/workflows/spec-alignment.yml` to your repository to automatically check spec quality on PRs:

```yaml
- Runs spec quality analysis
- Posts report as PR comment
- Fails PR if score < 60 or errors > 0
```

---

## Execute Analysis

Now analyzing specification quality in the current directory...

```bash
# Find specs directory
SPEC_DIR=""
if [ -d ".specify/memory/specifications" ]; then
  SPEC_DIR=".specify/memory/specifications"
elif [ -d ".specify/specifications" ]; then
  SPEC_DIR=".specify/specifications"
elif [ -d "specs" ]; then
  SPEC_DIR="specs"
fi

if [ -z "$SPEC_DIR" ]; then
  echo "❌ No specifications directory found!"
  echo "Expected: .specify/memory/specifications/, .specify/specifications/, or specs/"
  exit 0
fi

echo "📂 Found specs in: $SPEC_DIR"
ls -la "$SPEC_DIR"/*.md 2>/dev/null || echo "No .md files found"
```

**Analyze each specification file for:**

1. **Required sections** - Check for `## Feature`, `## User Stories`, `## Acceptance Criteria`, `## Technical Requirements`

2. **Incomplete markers** - Search for `[NEEDS CLARIFICATION]`, `[TODO]`, `[TBD]`, `[PLACEHOLDER]`

3. **Testable criteria** - Look for specific numbers, timeouts, status codes in acceptance criteria

4. **Ambiguous language** - Flag words like: appropriate, reasonable, adequate, sufficient, good, fast, various, some

5. **Long sentences** - Flag sentences > 40 words

6. **Code examples** - Bonus for having code blocks or Given/When/Then format

Generate a comprehensive quality report with scores and actionable suggestions for each specification.
