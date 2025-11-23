---
description: Resolve [NEEDS CLARIFICATION] markers interactively
---

# Spec Kit: Clarify Specifications

Find and resolve all `[NEEDS CLARIFICATION]` markers in specifications.

## Process

### Step 1: Find All Clarifications

Scan `specs/` for `[NEEDS CLARIFICATION]` markers:

```bash
grep -r "\[NEEDS CLARIFICATION\]" specs/
```

Create a list:
```markdown
## Clarifications Needed

### High Priority (P0)
1. **user-authentication.md:**
   - [NEEDS CLARIFICATION] Password reset: email link or SMS code?

2. **photo-upload.md:**
   - [NEEDS CLARIFICATION] Max file size: 5MB or 10MB?
   - [NEEDS CLARIFICATION] Supported formats: just images or also videos?

### Medium Priority (P1)
3. **analytics-dashboard.md:**
   - [NEEDS CLARIFICATION] Chart types: line, bar, pie, or all three?
   - [NEEDS CLARIFICATION] Real-time updates or daily aggregates?

[... list all ...]
```

### Step 2: Ask Questions by Priority

**For each clarification (P0 first):**

```
**Feature:** user-authentication
**Question:** For password reset, should we use email link or SMS code?

**Context:**
- Email link: More secure, standard approach
- SMS code: Faster, but requires phone number

**Recommendation:** Email link (industry standard)

What would you prefer?
```

### Step 3: Record Answers

For each answer received:

```markdown
## Answer: Password Reset Method

**Question:** Email link or SMS code?
**Answer:** Email link with 1-hour expiration
**Additional Details:**
- Link format: /reset-password?token={jwt}
- Token expires: 1 hour
- Email template: Branded with reset button
```

### Step 4: Update Specifications

For each answer, update the corresponding specification:

**Before:**
```markdown
## Password Reset

[NEEDS CLARIFICATION] Should we use email link or SMS code?
```

**After:**
```markdown
## Password Reset

Users can reset their password via email link.

**Implementation:**
- User requests reset via /api/auth/reset-password
- System sends email with unique token (JWT, 1-hour expiry)
- Email contains link: /reset-password?token={jwt}
- User clicks link, enters new password
- Token validated, password updated

**Acceptance Criteria:**
- [ ] User can request password reset
- [ ] Email sent within 30 seconds
- [ ] Link expires after 1 hour
- [ ] Token is single-use
- [ ] Password successfully updated after reset
```

### Step 5: Cross-Reference Updates

If clarification affects multiple specs, update all:

Example: Max file size affects both photo-upload and document-upload specs

### Step 6: Validate Completeness

After all clarifications:

```bash
# Check no markers remain
grep -r "\[NEEDS CLARIFICATION\]" specs/

# Should return: No matches (or only in comments/examples)
```

---

## Output Format

```markdown
# Clarification Session Complete

**Date:** {{DATE}}
**Clarifications resolved:** X

## Summary

### Photo Upload Feature
✅ Max file size: 10MB
✅ Supported formats: JPEG, PNG, WebP
✅ Upload method: Drag-drop and click-browse (both)
✅ Max photos per item: 10

### Analytics Dashboard
✅ Chart types: Line, bar, pie (all three)
✅ Data refresh: Real-time for alerts, daily aggregates for charts
✅ Date ranges: 7d, 30d, 90d, all time

### User Authentication
✅ Password reset: Email link (1-hour expiry)
✅ Session duration: 24 hours (configurable)
✅ Rate limiting: 10 attempts per hour

[... all clarifications ...]

## Specifications Updated

Updated X specifications:
1. user-authentication.md
2. photo-upload.md
3. analytics-dashboard.md
[...]

## Validation

✅ No [NEEDS CLARIFICATION] markers remaining
✅ All acceptance criteria complete
✅ Specifications ready for implementation

## Next Steps

Ready for Gear 6: Implementation

Use `/speckit.tasks` and `/speckit.implement` for each feature.
```

---

## Defer Mode

If clarifications_strategy = "defer":

Instead of asking questions, just document them:

```markdown
# Deferred Clarifications

**File:** .specify/memory/deferred-clarifications.md

## Items to Clarify Later

1. **photo-upload.md:**
   - Max file size?
   - Supported formats?

2. **analytics-dashboard.md:**
   - Chart types?
   - Real-time or aggregated?

[... list all ...]

## How to Resolve

When ready, run `/speckit.clarify` to answer these questions.
```

Then continue with implementation of fully-specified features.

---

## Notes

- Ask questions in priority order (P0 first)
- Provide context and recommendations
- Allow "defer to later" for non-critical clarifications
- Update all related specs when answering
- Validate no markers remain at the end
- If user is unsure, mark as P2/P3 (lower priority)
