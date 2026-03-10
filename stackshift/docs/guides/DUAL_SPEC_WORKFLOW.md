# Dual-Spec Workflow: Maintain Old + Build New

**For organizations migrating platforms while maintaining legacy systems**

---

## The Scenario

You have:
- **Legacy app** that must be maintained for years
- **New app** being built from scratch in modern stack
- **Both apps** need spec-driven development
- **Risk of drift** between the two over time

**Challenge:** Greenfield gives agnostic specs, Brownfield gives prescriptive specs. You need BOTH!

---

## Solution: Dual-Spec Approach

Run StackShift **twice on the same codebase** with different configurations.

### Run 1: Brownfield (Manage Legacy)

**Goal:** Make the existing app spec-driven for ongoing maintenance

```bash
cd ~/git/legacy-app

# StackShift Brownfield
Route: Brownfield
Mode: Manual
Scope: None (just specs)

# Output:
.specify/                        # Prescriptive specs
└── memory/
    ├── constitution.md         # Rails 7.0, PostgreSQL 15, etc.
    └── specifications/
        ├── user-auth.md        # Includes: Rails routes, controllers, models
        ├── payments.md         # Includes: Stripe SDK version, file paths
        └── ...
```

**Result:** Legacy app can now use `/speckit.*` commands!
- Add features: `/speckit.specify`
- Validate: `/speckit.analyze`
- Maintain with specs for next 2-3 years

### Run 2: Greenfield (Extract for New App)

**Goal:** Extract business logic for rebuilding in new stack

```bash
cd ~/git/legacy-app

# StackShift Greenfield (second run)
Route: Greenfield
Mode: Cruise Control
Scope: All
Target Stack: Next.js 15 + TypeScript
Location: ~/git/new-app

# To avoid conflict, use different state file
# Save to: .stackshift-greenfield-state.json

# Output:
.specify-greenfield/             # Agnostic specs (new!)
└── memory/
    ├── constitution.md         # NO Rails mentions!
    └── specifications/
        ├── user-auth.md        # Business logic only
        ├── payments.md         # "Payment processing" not "Stripe SDK"
        └── ...

# PLUS new repo:
~/git/new-app/
├── .specify/                    # COPIED from .specify-greenfield/
└── [Next.js app built from agnostic specs]
```

**Result:** New app built from business requirements, not tied to old tech!

---

## Final Structure

### Legacy Repo
```
~/git/legacy-app/
├── [rails code]
├── .specify/                   # For Rails app (prescriptive)
│   └── memory/
│       └── specifications/
│           └── user-auth.md    # Includes Rails details
├── .specify-greenfield/        # For new app (agnostic)
│   └── memory/
│       └── specifications/
│           └── user-auth.md    # Business logic only
└── docs/
```

### New Repo
```
~/git/new-app/
├── .specify/                   # Copied from legacy's .specify-greenfield/
│   └── memory/
│       └── specifications/
│           └── user-auth.md    # Business logic (agnostic)
├── package.json                # Next.js
└── app/                        # Built from specs
```

---

## Maintaining Sync Over Time

### Scenario: New Feature Added to Legacy App

```bash
# In legacy app
cd ~/git/legacy-app

# Add feature using Spec Kit
> /speckit.specify inventory-management
> /speckit.plan inventory-management
> /speckit.implement inventory-management

# This updates: .specify/specifications/inventory-management.md
# (Prescriptive - includes Rails implementation)
```

**Now sync to new app:**

```bash
# Extract business logic version
# Use StackShift to convert prescriptive → agnostic

"Extract business logic from inventory-management.md (remove tech details)"

# This creates:
.specify-greenfield/specifications/inventory-management.md
# (Agnostic - business logic only)

# Copy to new repo
cp .specify-greenfield/specifications/inventory-management.md \
   ~/git/new-app/specs/

# In new app
cd ~/git/new-app
> /speckit.implement inventory-management
# Builds in Next.js!
```

### Scenario: Bug Fix in New App Reveals Business Rule Gap

```bash
# In new app
cd ~/git/new-app

# Discover: "Payment refunds should be capped at $10k per transaction"

# Update agnostic spec
> /speckit.specify payments
# Add business rule: "Refunds capped at $10,000 per transaction"

# Copy back to legacy
cp specs/payments.md \
   ~/git/legacy-app/.specify-greenfield/specifications/

# Convert to prescriptive and apply to legacy
cd ~/git/legacy-app
# Manually merge business rule into prescriptive spec
# (Could automate this!)

> /speckit.implement payments
# Applies same rule to Rails app!
```

---

## Simpler Alternative: One Run with Dual Output

**What if StackShift could generate BOTH spec types in one run?**

New mode: **"Dual-Spec Mode"**

```bash
Route: Dual (Brownfield + Greenfield)
Mode: Cruise Control
Old app location: . (current)
New app location: ~/git/new-app
Target stack: Next.js 15

# StackShift generates:

~/git/legacy-app/
├── .specify/                   # Prescriptive (for Rails)
│   └── memory/specifications/
│       └── user-auth.md       # Includes Rails implementation
└── .specify/agnostic/          # Agnostic (for new app)
    └── memory/specifications/
        └── user-auth.md       # Business logic only

~/git/new-app/
└── .specify/                   # Copy of agnostic specs
    └── memory/specifications/
        └── user-auth.md       # Business logic only
```

**One run, both outputs!**

---

## My Recommendation

For your use case, I'd suggest:

### Option 1: Two Runs (Works Today)

**Pros:**
- ✅ Works right now with current StackShift
- ✅ Clear separation
- ✅ Full control over each

**Cons:**
- ❌ Run StackShift twice
- ❌ Manual spec syncing

### Option 2: Dual-Spec Mode (New Feature)

**Would need:**
- New route option: "Dual"
- Generate both .specify/ (prescriptive) and .specify/agnostic/ (tech-agnostic)
- Copy agnostic to new repo
- Sync tool for future updates

**Pros:**
- ✅ One run generates both
- ✅ Automated setup
- ✅ Built-in sync awareness

**Cons:**
- ❌ Need to implement it
- ❌ More complex

---

## Quick Implementation: Dual-Spec Mode

Want me to add this? It would:

1. **New route option:** "Dual" (alongside Greenfield/Brownfield)
2. **Generate two .specify/ directories:**
   - `.specify/` - Prescriptive specs (for old app)
   - `.specify/agnostic/` - Tech-agnostic specs (for new app)
3. **In Gear 6:**
   - Maintain old app in place (prescriptive specs)
   - Build new app in separate location (agnostic specs)
4. **Bonus:** Spec sync helper tool

This would be perfect for your platform migration scenario! Should I build it? 🚀