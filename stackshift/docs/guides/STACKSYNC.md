# StackSync: Keep Legacy and Greenfield in Sync

**Synchronize specifications between legacy and greenfield applications during platform migrations**

---

## The Problem

During multi-year platform migrations:

```
Year 1: Build new app from specs
Year 2-3: Run both apps in parallel
  ├── Legacy gets bug fixes
  ├── New app gets features
  ├── Business logic evolves
  └── Apps drift apart! ❌
```

**Challenge:** How to keep both apps aligned during the transition?

---

## The Solution: StackSync

**StackSync compares specifications and helps you synchronize:**

```bash
# Compare two repos
stackshift sync ~/git/legacy-app ~/git/new-app

# StackSync analyzes:
✅ Features in both repos
⚠️  Features only in legacy (need to add to new?)
⚠️  Features only in new (backport to legacy?)
🔍 Features with different logic (specs evolved?)
```

---

## How It Works

### Step 1: Compare Specifications

**Read specs from both repos:**

```
Legacy: ~/git/legacy-app/specs/
- user-authentication.md (prescriptive - Rails)
- payments.md (prescriptive - Stripe gem)
- inventory.md (prescriptive - Rails)
- reporting.md (NOT IN NEW APP)

New: ~/git/new-app/specs/
- user-authentication.md (agnostic - JWT)
- payments.md (agnostic - Payment processor)
- inventory.md (agnostic - Inventory system)
- analytics-dashboard.md (NOT IN LEGACY)
```

### Step 2: Identify Differences

**StackSync generates report:**

```markdown
# Sync Analysis

**Legacy:** ~/git/legacy-app
**New:** ~/git/new-app
**Date:** 2024-01-15

## Summary

- ✅ In sync: 3 features
- ⚠️  Legacy only: 1 feature
- ⚠️  New only: 1 feature
- 🔍 Logic differs: 2 features

---

## Features in Sync (3)

### user-authentication.md
✅ Both have this feature
✅ Business logic matches
- Both support email/password
- Both have password reset
- Both have session management

### inventory.md
✅ Both have this feature
✅ Business logic matches

### payments.md
✅ Both have this feature
⚠️  **Logic difference detected:**

**Legacy spec:**
- Refund cap: $5,000

**New spec:**
- Refund cap: $10,000

**Question:** Which is correct? Should both match?

---

## Features Only in Legacy (1)

### reporting.md
⚠️  Exists in legacy, missing in new

**Options:**
A) Add to new app (implement from spec)
B) Mark as legacy-only (not migrating)
C) Defer (add later)

---

## Features Only in New (1)

### analytics-dashboard.md
⚠️  Exists in new, missing in legacy

**Options:**
A) Backport to legacy (add feature)
B) Mark as new-only (not worth backporting)
C) Defer (maybe backport later)

---

## Business Logic Differences (2)

### payments.md - Refund cap mismatch
- Legacy: $5,000
- New: $10,000

**Recommendation:** New is correct (business requirement updated)

**Actions:**
A) Update legacy spec to $10,000 (sync forward)
B) Update new spec to $5,000 (sync backward)
C) Keep different (intentional)
D) Investigate (not sure which is right)

### inventory.md - Stock threshold
- Legacy: Alert at 10 units
- New: Alert at 5 units

**Actions:**
[Same options as above]
```

### Step 3: Interactive Resolution

**StackSync asks for each difference:**

```
Feature: reporting.md (legacy only)

This feature exists in legacy but not in new app.

Options:
A) Add to new app - Implement from legacy spec
B) Mark as legacy-only - Won't migrate this feature
C) Defer - Decide later

Your choice: ?
```

### Step 4: Execute Sync

Based on answers:

**Add to new app:**
```bash
# Copy spec from legacy
cp ~/git/legacy-app/.specify/specifications/reporting.md \
   ~/git/new-app/.specify/specifications/

# Convert prescriptive → agnostic
# (Remove Rails-specific implementation details)

# Create implementation plan
cd ~/git/new-app
> /speckit.plan reporting
> /speckit.implement reporting
```

**Update specs:**
```bash
# For business logic differences
# Update both specs to match
```

**Mark as different:**
```bash
# Add note to specs
# "Intentionally different - legacy uses $5k cap, new uses $10k cap"
```

---

## StackSync Modes

### Mode 1: Analyze Only (Default)

Just show differences, don't modify anything:

```bash
stackshift sync ~/git/legacy ~/git/new --analyze-only

# Shows report, no changes
```

### Mode 2: Interactive Sync

Ask questions and apply changes:

```bash
stackshift sync ~/git/legacy ~/git/new --interactive

# Ask about each difference
# Apply changes based on answers
```

### Mode 3: Auto-Sync (One Direction)

Automatically sync one way:

```bash
# Legacy → New (one-way)
stackshift sync ~/git/legacy ~/git/new --direction forward --auto

# Adds missing features from legacy to new
# Updates new specs to match legacy logic
# Doesn't modify legacy

# New → Legacy (one-way)
stackshift sync ~/git/legacy ~/git/new --direction backward --auto

# Backports features from new to legacy
# Updates legacy specs to match new logic
```

### Mode 4: Bi-directional (Smart Sync)

```bash
stackshift sync ~/git/legacy ~/git/new --bidirectional

# For each difference:
# - If only in legacy: Prompt (add to new?)
# - If only in new: Prompt (backport to legacy?)
# - If logic differs: Prompt (which is correct?)
# - If timestamps help: Use newer version
```

---

## Configuration

**.stacksync-config.json:**

```json
{
  "legacy_repo": "~/git/legacy-app",
  "new_repo": "~/git/new-app",
  "sync_rules": {
    "default_direction": "forward",  // legacy → new
    "auto_add_features": false,      // prompt for new features
    "auto_sync_logic": false,        // prompt for logic differences
    "prefer_newer": true,            // if timestamps differ, use newer
    "legacy_only_features": [        // known legacy-only
      "admin-panel",
      "old-reporting"
    ],
    "new_only_features": [           // known new-only
      "analytics-dashboard",
      "realtime-updates"
    ]
  }
}
```

---

## Use Case: Monthly Sync

**Month 1:**
```bash
# Both apps built, specs in sync
Legacy: 15 features
New: 15 features
✅ Identical business logic
```

**Month 2:**
```bash
# Legacy got bug fix
Legacy: user-auth.md updated (password validation stricter)

# Sync
stackshift sync ~/git/legacy ~/git/new --interactive

Found: user-auth.md logic updated in legacy
Action: Update new app spec to match
Result: ✅ Both apps now have stricter validation
```

**Month 3:**
```bash
# New app got new feature
New: analytics-dashboard.md added

# Sync
stackshift sync ~/git/legacy ~/git/new --interactive

Found: analytics-dashboard.md only in new
Options:
A) Backport to legacy
B) Mark as new-only
C) Defer

You choose: B (new-only, not worth backporting)

# StackSync records this decision in config
# Won't prompt again
```

---

## Implementation Plan

Would add to StackShift:

### 1. New Skill: `sync`

```
"Sync specs between legacy and new app"
→ Interactive comparison and resolution
```

### 2. New MCP Tool: `stackshift_sync`

```typescript
{
  name: "stackshift_sync",
  arguments: {
    legacy_path: "~/git/legacy",
    new_path: "~/git/new",
    mode: "interactive"
  }
}
```

### 3. CLI Tool: `stackshift-sync`

```bash
npx stackshift-sync \
  --legacy ~/git/legacy \
  --new ~/git/new \
  --interactive
```

### 4. Comparison Engine

- Reads specs from both locations
- Compares features (by filename)
- Compares business logic (acceptance criteria, business rules)
- Generates diff report
- Offers resolution options

---

## Smart Features

### Timestamp-Based

```markdown
payments.md

Legacy: Updated 2024-01-10
New: Updated 2024-01-15

Logic differs:
- Refund cap: $5k (legacy) vs $10k (new)

StackSync: New version is newer, assume it's correct?
→ Update legacy to match
```

### Semantic Comparison

```markdown
Not just filename matching, but semantic:

Legacy: "user-authentication.md"
New: "auth.md"

StackSync: These appear to be the same feature (both handle user login)
→ Compare as equivalent
```

### Change Tracking

```markdown
.stacksync-history.json:

{
  "syncs": [
    {
      "date": "2024-01-15",
      "changes": [
        {
          "feature": "payments",
          "action": "updated legacy to match new",
          "detail": "Refund cap $5k → $10k"
        }
      ]
    }
  ]
}
```

---

## Real World Example

**Your scenario:**

```
Jan: Build new app (greenfield)
  Legacy: 20 features (Rails + specs)
  New: 20 features (Next.js + specs)
  ✅ In sync

Feb-Dec: Both apps evolve
  Legacy: +3 bug fixes, +1 security update
  New: +5 features, +2 bug fixes
  ⚠️  Drifting...

Monthly: Run StackSync
  → Copy bug fixes: legacy → new
  → Security update: legacy → new
  → New features: mark as new-only (don't backport)
  ✅ Critical logic stays in sync

Year 2: Migrate users from legacy → new

Year 3: Deprecate legacy
  → Stop syncing
  → New app is source of truth
```

---

## Should I Build It?

**Option B + StackSync** would give you:

1. **Dual-Spec Mode** - Generate both spec types in one run
2. **StackSync** - Keep them aligned over time
3. **Smart diffing** - Understand what changed
4. **Interactive resolution** - You control what syncs
5. **Sync history** - Track what was synchronized

**Estimated effort:** ~2-3 hours to implement both features

**Value:** Solves the "parallel maintenance during migration" problem completely!

Want me to build it? This would make StackShift the definitive tool for platform migrations! 🚀