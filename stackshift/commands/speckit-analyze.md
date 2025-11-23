---
description: Validate specifications against implementation
---

# Spec Kit: Analyze Specifications

Compare specifications in `specs/` against the actual codebase implementation.

## Analysis Steps

### 1. Load All Specifications

Read all files in `specs/`:
- Note status markers (✅ COMPLETE / ⚠️ PARTIAL / ❌ MISSING)
- Identify dependencies between specs
- List acceptance criteria

### 2. Validate Each Specification

For each spec marked **✅ COMPLETE:**
- **Verify implementation exists:**
  - Check file paths mentioned in spec
  - Verify API endpoints exist
  - Confirm database models match schema
  - Test that features actually work

- **If implementation missing:**
  ```
  ⚠️ Inconsistency: spec-name.md marked COMPLETE
     Reality: Implementation not found
     Files checked: [list]
     Recommendation: Update status to PARTIAL or MISSING
  ```

For each spec marked **⚠️ PARTIAL:**
- **Verify what's listed as implemented actually exists**
- **Verify what's listed as missing is actually missing**
- **Check for implementation drift** (code changed since spec written)

For each spec marked **❌ MISSING:**
- **Check if implementation exists anyway** (orphaned code)
  ```
  ⚠️ Orphaned Implementation: user-notifications feature
     Spec: Marked MISSING
     Reality: Implementation found in src/notifications/
     Recommendation: Create specification or remove code
  ```

### 3. Check for Inconsistencies

- **Conflicting requirements** between related specs
- **Broken dependencies** (spec A requires spec B, but B is MISSING)
- **Version mismatches** (spec requires v2.0, code uses v1.5)
- **Outdated technical details** (for brownfield specs)

### 4. Generate Report

Output format:

```markdown
# Specification Analysis Results

**Date:** [current date]
**Specifications analyzed:** X total

## Summary

- ✅ COMPLETE features: X (fully aligned)
- ⚠️ PARTIAL features: X (some gaps)
- ❌ MISSING features: X (not started)
- 🔴 Inconsistencies found: X

## Issues Detected

### High Priority (Blocking)

1. **user-authentication.md** (COMPLETE → should be PARTIAL)
   - Spec says: Frontend login UI required
   - Reality: No login components found
   - Impact: Users cannot authenticate
   - Recommendation: Implement login UI or update spec status

2. **photo-upload.md → fish-management.md**
   - Dependency broken
   - fish-management requires photo-upload
   - photo-upload marked PARTIAL (API incomplete)
   - Impact: Fish photos cannot be uploaded
   - Recommendation: Complete photo-upload API first

### Medium Priority

[...]

### Low Priority (Minor)

[...]

## Orphaned Implementations

Code exists without specifications:

1. **src/api/notifications.ts** (156 lines)
   - No specification found
   - Recommendation: Create specification or remove code

## Alignment Score

- Specifications ↔ Code: X% aligned
- No issues found: ✅ / Issues require attention: ⚠️

## Recommendations

1. Update status markers for inconsistent specs
2. Create specifications for orphaned code
3. Complete high-priority implementations
4. Re-run `/speckit.analyze` after fixes

## Next Steps

- Fix high-priority issues first
- Update specification status markers
- Re-run analysis to validate fixes
```

---

## Notes

- This analysis should be thorough but not modify any files
- Report inconsistencies, don't auto-fix
- Cross-reference related specifications
- Check both directions (spec → code and code → spec)
- For brownfield: Verify exact versions and file paths
- For greenfield: Check if business requirements are met (ignore implementation details)
