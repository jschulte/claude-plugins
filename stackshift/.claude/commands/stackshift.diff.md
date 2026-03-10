---
name: stackshift.diff
description: Compare specifications between directories or git commits to visualize what changed. Useful for PR reviews and tracking spec evolution.
---

# Spec Diff

Compare specifications between two locations to see what changed.

## What This Command Does

This command compares specifications and shows:

1. **Added specs** - New specifications that didn't exist before
2. **Removed specs** - Specifications that were deleted
3. **Modified specs** - Specifications with changed content
4. **Section-level changes** - Which sections were added, removed, or modified

## Usage Patterns

### Compare with Previous Git Commit

Compare current specs with the previous commit:

```bash
# Create temp directory with previous commit's specs
git show HEAD~1:.specify/memory/specifications/ > /tmp/old-specs/

# Then compare
/stackshift.diff /tmp/old-specs .specify/memory/specifications
```

### Compare Two Branches

```bash
# Checkout base branch specs to temp
git show main:.specify/memory/specifications/ > /tmp/main-specs/

# Compare with current branch
/stackshift.diff /tmp/main-specs .specify/memory/specifications
```

### Compare Two Repositories

```bash
/stackshift.diff ~/git/legacy-app ~/git/new-app
```

## Output Format

```markdown
# Specification Diff Report

**Generated:** 2024-11-24 10:30:00
**Base:** /path/to/base
**Compare:** /path/to/compare

## Summary

| Status | Count |
|--------|-------|
| ➕ Added | 2 |
| ➖ Removed | 1 |
| 📝 Modified | 3 |
| ✅ Unchanged | 10 |
| **Total** | **16** |

## Changes

### ➕ user-mfa
**File:** `user-mfa.md`
**Status:** added

New specification added: Multi-factor Authentication

### 📝 user-authentication
**File:** `user-authentication.md`
**Status:** modified

**Section Changes:**

- `+` **Session Management**
  - + Session timeout increased to 60 minutes
  - + Added refresh token support

- `~` **Acceptance Criteria**
  - + Must support MFA verification
  - - Legacy OAuth 1.0 support removed

### ➖ legacy-login
**File:** `legacy-login.md`
**Status:** removed

Specification removed: Legacy Login System
```

## When to Use

1. **PR Reviews** - See what specs changed in a pull request
2. **Migration Tracking** - Compare legacy and new app specs
3. **Audit Trail** - Track how specs evolved over time
4. **Sync Verification** - Ensure specs are in sync across repos

## Integration with CI/CD

The GitHub Actions workflow (`.github/workflows/spec-alignment.yml`) automatically runs spec diff on PRs and posts a comment with the changes.

---

## Execute Diff

To compare specifications, I need two directories:

1. **Base directory** - The "before" state (e.g., main branch, legacy app)
2. **Compare directory** - The "after" state (e.g., feature branch, new app)

**Please provide the two directories to compare:**

```
Base: [path to base specs]
Compare: [path to compare specs]
```

Or specify a git ref to compare against:

```
Compare current specs with: [git ref like HEAD~1, main, v1.0.0]
```

**For git comparison, I'll:**
1. Create a temporary directory
2. Extract specs from the git ref
3. Compare with current `.specify/` directory
4. Show the diff report

**Example:**
```
Compare current specs with HEAD~1
```
