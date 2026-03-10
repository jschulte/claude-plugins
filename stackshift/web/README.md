# StackShift for Claude Code Web

**Use StackShift in your browser - no installation required!**

---

## Quick Start

1. **Go to:** https://claude.ai/code
2. **Connect to GitHub**
3. **Select your repo** from dropdown
4. **Copy-paste:** [`WEB_BOOTSTRAP.md`](WEB_BOOTSTRAP.md) (entire file)
5. **Hit enter** and let StackShift run!

---

## How It Works

**WEB_BOOTSTRAP.md is idempotent:**

- Downloads StackShift to `.stackshift/` (once)
- Detects what already exists
- Resumes from appropriate gear
- Safe to paste multiple times

**Auto-detection:**

- Has specs/ with plans? → Jump to Gear 6 (implement)
- Has docs/? → Resume Gear 3 (create specs)
- Has analysis? → Resume Gear 2 (docs)
- Has state file? → Resume from currentStep
- Fresh repo? → Start Gear 1

---

## Examples

### Fresh Repo

```
Paste WEB_BOOTSTRAP.md
→ Starts Gear 1: Analysis
→ Runs through all 6 gears
```

### Repo with Existing Specs

```
Paste WEB_BOOTSTRAP.md
→ Detects specs/
→ Jumps to Gear 6: Implementation
→ Asks which feature to implement
```

### Interrupted Session

```
Paste WEB_BOOTSTRAP.md
→ Reads .stackshift-state.json
→ Resumes from where you stopped
```

---

## What You Get

**StackShift generates:**

- `analysis-report.md`
- `docs/reverse-engineering/` (8 files)
- `.specify/memory/constitution.md`
- `specs/FEATURE-ID/` (directories with spec.md, plan.md)
- `.stackshift-state.json` (progress tracking)

**All committed to your branch automatically.**

---

## After Completion

```bash
# Pull the branch locally
git fetch origin
git checkout <branch-name>
git log  # See StackShift's commits

# Review and merge to main
git checkout main
git merge <branch-name>
```

**Or continue in Web:**

- Paste WEB_BOOTSTRAP.md again - it resumes from where you left off
- Use `/speckit.tasks` and `/speckit.implement` for more features (if available)

---

**One prompt, works everywhere!** 🚗
