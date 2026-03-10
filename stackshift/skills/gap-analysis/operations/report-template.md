# Gap Analysis Report Template

Write this report to `docs/gap-analysis-report.md`. Replace all `[bracketed]` placeholders with actual values from the analysis.

---

```markdown
# Gap Analysis Report

**Date:** [Current Date]
**Analysis Method:** [AST analysis / Spec Kit / Manual review]

---

## Executive Summary

- **Overall Completion:** ~[N]%
- **Complete Features:** [N] ([N]%)
- **Partial Features:** [N] ([N]%)
- **Missing Features:** [N] ([N]%)
- **Critical Issues:** [N]
- **Clarifications Needed:** [N]

---

## Analysis Results

### Inconsistencies Detected

1. **[spec-name.md]** ([STATUS])
   - Specification: [what the spec says]
   - Implementation: [what actually exists]
   - Impact: [user/system impact]

2. **[spec-a.md] -> [spec-b.md]**
   - [spec-a] depends on [spec-b]
   - [spec-b] status: [STATUS]
   - Impact: [consequence]

3. **Orphaned Code: [filename]**
   - Implementation exists without specification
   - Action: Create specification or remove code

---

## Gap Details

### Missing Features ([N] features)

#### [Feature-ID]: [Feature Name] [Priority]
**Specification:** `specs/[feature-name].md`
**Status:** MISSING (not started)
**Impact:** [user impact description]
**Effort:** ~[N] hours
**Dependencies:** [list or None]

**Needs Clarification:**
- [NEEDS CLARIFICATION] [question 1]
- [NEEDS CLARIFICATION] [question 2]

### Partial Features ([N] features)

#### [Feature-ID]: [Feature Name] [Priority]
**Specification:** `specs/[feature-name].md`
**Status:** PARTIAL

**Implemented:**
- [what exists]

**Missing:**
- [what is missing]

**Effort to Complete:** ~[N] hours
**Blockers:** [list or None]

**Needs Clarification:**
- [NEEDS CLARIFICATION] [question]

---

## Technical Debt

### High Priority (Blocking)
- [item with impact description]

### Medium Priority
- [item with impact description]

### Low Priority
- [item with impact description]

---

## Prioritized Roadmap

### Phase 1: P0 Critical (~[N] hours)

**Goals:**
- Unblock core user workflows
- Fix security issues
- Complete essential features

**Tasks:**
1. [Task description] (~[N]h)
2. [Task description] (~[N]h)

### Phase 2: P1 High Value (~[N] hours)

**Goals:**
- Build high-value features
- Address important technical debt
- Improve test coverage

**Tasks:**
1. [Task description] (~[N]h)
2. [Task description] (~[N]h)

### Phase 3: P2/P3 Enhancements (~[N] hours or defer)

**Goals:**
- Nice-to-have features
- Polish and refinements

**Tasks:**
1. [Task description] (~[N]h)
2. [Task description] (~[N]h)

---

## Clarifications Needed ([N] total)

### Critical (P0) - [N] items
1. **[Feature] - [Topic]:** [Question]

### Important (P1) - [N] items
2. **[Feature] - [Topic]:** [Question]

### Nice-to-Have (P2) - [N] items
3. **[Feature] - [Topic]:** [Question]

---

## Recommendations

1. Resolve P0 clarifications first (Step 5: complete-spec)
2. Focus on Phase 1 before expanding scope
3. Use /speckit.implement for systematic implementation
4. Update specifications as you go to keep them accurate
5. Re-run analysis regularly to track progress

---

## Next Steps

1. Run complete-spec skill to resolve clarifications
2. Begin Phase 1 implementation
3. Use `/speckit.implement` for each feature
4. Update implementation status in specifications
5. Re-run analysis to validate progress
```
