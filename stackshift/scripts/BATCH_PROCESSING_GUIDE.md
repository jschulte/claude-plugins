# StackShift Batch Processing Guide

**Maximize Your $700 in Claude Code Web Credits** 💰

Perfect for analyzing multiple projects efficiently before credits expire!

---

## Quick Strategy

### Burn Through Credits Productively

**Your situation:**
- $700 in free Claude Code Web tokens
- Expires in 3 days
- Want to analyze multiple projects

**StackShift solution:**
- Batch prepare projects locally (fast, cheap)
- Run cruise control in Web (slow, token-heavy)
- Download results
- Repeat!

**Estimated capacity:**
- Small projects (~10k LOC): 20-30k tokens → **20-30 projects**
- Medium projects (~50k LOC): 50-100k tokens → **7-14 projects**
- Large projects (~200k LOC): 150-300k tokens → **2-5 projects**

---

## Workflow: Maximum Efficiency

### Day 1 Morning: Prep Locally (15 minutes)

```bash
cd /path/to/project-1
../stackshift/scripts/prepare-web-batch.sh project-1 brownfield cruise p0_p1

cd /path/to/project-2
../stackshift/scripts/prepare-web-batch.sh project-2 greenfield cruise all

cd /path/to/project-3
../stackshift/scripts/prepare-web-batch.sh project-3 brownfield cruise p0
```

**Result:** 3 branches ready for Web, each pre-configured

### Day 1 Afternoon: Run in Web (Hands-Free!)

**Project 1:**
```
1. Claude Code Web → Load branch: stackshift-web/project-1-...
2. Say: "Resume StackShift cruise control from the beginning"
3. Let it run (30-90 minutes depending on size)
4. Download .specify/ and docs/
5. Close tab
```

**Project 2:**
```
1. New tab → Load branch: stackshift-web/project-2-...
2. Say: "Resume StackShift cruise control from the beginning"
3. Let it run
4. Download results
5. Close tab
```

**Project 3:** Same pattern

**Run multiple in parallel tabs!** Each session is independent.

### Day 2: More Projects!

Repeat for as many projects as you have.

### Day 3: Final Push

Any remaining credits → Use for implementation phases (Gear 6) or additional projects.

---

## Batch Preparation Script Usage

### Basic Usage

```bash
./scripts/prepare-web-batch.sh <project-name> <route> [mode] [scope]
```

### Examples

**Brownfield, Cruise Control, P0+P1:**
```bash
cd ~/projects/my-app
../stackshift/scripts/prepare-web-batch.sh my-app brownfield cruise p0_p1
```

**Greenfield, Cruise Control, All Features:**
```bash
cd ~/projects/legacy-app
../stackshift/scripts/prepare-web-batch.sh legacy-app greenfield cruise all
```

**Just Specs (No Implementation):**
```bash
cd ~/projects/docs-only
../stackshift/scripts/prepare-web-batch.sh docs-only brownfield cruise none
```

### What It Does

1. Creates branch: `stackshift-web/<project>-<timestamp>`
2. Creates `.stackshift-state.json` with configuration
3. Creates `.specify/` structure
4. Copies Spec Kit fallback templates
5. Creates `STACKSHIFT_WEB_INSTRUCTIONS.md`
6. Commits and pushes to GitHub
7. Prints next steps

---

## Token Optimization Tips

### 1. Use Cruise Control

**Manual mode:** You pay for thinking time between gears
**Cruise control:** Straight through, minimum tokens

**Savings:** ~20-30% fewer tokens

### 2. Brownfield for Existing Apps

If you're documenting existing apps (not rebuilding):
- Use **brownfield** route
- Set scope to **none** or **p0**
- Just want the specs, not new implementation

**Tokens:** ~50k-150k per project (specs only)

### 3. Greenfield for Rebuilds

If you're actually rebuilding:
- Use **greenfield** route
- Set scope to **p0_p1** or **all**
- Full implementation in new stack

**Tokens:** ~200k-500k per project (with implementation)

### 4. Parallel Processing

Run 3-5 projects in parallel tabs:
- Each tab is independent
- Maximize token usage rate
- Don't wait for sequential completion

### 5. Defer Clarifications

Always use **defer** strategy:
- Don't stop for questions
- Mark [NEEDS CLARIFICATION]
- Implement around them
- Clarify later locally (free!)

**Savings:** ~10-20% faster

---

## Recommended Project Mix

**To maximize your $700:**

### Option A: Specs Only (Maximum Coverage)
```
20 projects × ~30k tokens = ~600k tokens
- All brownfield, scope: none
- Just generate specifications
- Quick analysis (30-60 min each)
- Perfect for documentation sprints
```

### Option B: Balanced (Specs + Some Implementation)
```
10 projects × ~60k tokens = ~600k tokens
- Brownfield, scope: p0
- Specs + critical features
- Medium runtime (1-2 hours each)
- Good balance
```

### Option C: Deep Implementations
```
3-4 large projects × ~200k tokens = ~700k tokens
- Greenfield or brownfield
- Scope: p0_p1 or all
- Full implementation
- Long runtime (3-6 hours each)
- Maximum value per project
```

---

## Execution Checklist

### Before Starting (Local)

- [ ] List all projects to analyze
- [ ] Choose route for each (greenfield/brownfield)
- [ ] Choose scope for each (none/p0/p0_p1/all)
- [ ] Run prepare-web-batch.sh for each
- [ ] Verify branches pushed to GitHub

### During Execution (Web)

- [ ] Open Claude Code Web (https://claude.ai/code)
- [ ] Load first branch (e.g., stackshift-web/project-1-...)
- [ ] Say: "Resume StackShift cruise control from the beginning"
- [ ] StackShift runs and commits all changes to the branch
- [ ] Open additional tabs for parallel processing
- [ ] Monitor progress occasionally (check commit history)

### After Completion (Local)

- [ ] Pull branches: `git fetch origin`
- [ ] Review changes: `git checkout stackshift-web/project-1-...`
- [ ] Merge to main: `git checkout main && git merge stackshift-web/project-1-...`
- [ ] Or create PR for review
- [ ] Delete remote branches (cleanup): `git push origin --delete stackshift-web/project-1-...`
- [ ] Review deferred clarifications
- [ ] Run /speckit.clarify locally (free!)

---

## Download Strategy

After each project completes in Web:

### Essential Files

1. **.stackshift-state.json** - Your configuration and progress
2. **.specify/memory/** - All specifications and plans
3. **docs/reverse-engineering/** - Comprehensive documentation
4. **analysis-report.md** - Initial analysis
5. **docs/gap-analysis-report.md** - Gap analysis and roadmap

### Quick Download

In Claude Code Web files panel:
- Right-click `.specify/` → Download folder
- Right-click `docs/` → Download folder
- Right-click `.stackshift-state.json` → Download file

### Merge Back to Main

```bash
# Locally, after downloading
cd ~/projects/my-app
git checkout main

# Copy downloaded files
cp -r ~/Downloads/.specify ./
cp -r ~/Downloads/docs ./
cp ~/Downloads/.stackshift-state.json ./

# Commit
git add .specify/ docs/ .stackshift-state.json
git commit -m "docs: add StackShift specifications and documentation

Generated via StackShift in Claude Code Web:
- Route: brownfield
- Documentation: 8 files in docs/reverse-engineering/
- Specifications: X features in .specify/memory/
- Implementation: P0+P1 features complete

Deferred clarifications can be resolved with /speckit.clarify"

git push

# Delete web branch (cleanup)
git push origin --delete stackshift-web/my-app-20241115-120000
```

---

## Troubleshooting

### Session Timeout

If Claude Code Web times out mid-process:

1. **Download current .stackshift-state.json**
2. **Start new session**
3. **Upload project + state file**
4. **Say:** "Resume StackShift from current gear"

Claude reads the state and continues!

### Out of Memory

If project too large for Web:

1. **Lower scope:** Change to `p0` or `none`
2. **Split work:** Do Gears 1-5 in Web, Gear 6 locally
3. **Use local plugin:** Switch to local for large projects

### Rate Limiting

If hitting rate limits:

1. **Spread across days:** Don't burn all $700 in one day
2. **Stagger sessions:** Wait a few minutes between projects
3. **Use parallel tabs:** But not too many (3-5 max)

---

## Example: 10 Projects in 3 Days

### Day 1: Prep + Run 4 Projects

**Morning (Local - 30 min):**
```bash
for i in {1..10}; do
  cd ~/projects/project-$i
  ../stackshift/scripts/prepare-web-batch.sh project-$i brownfield cruise none
done
```

**Afternoon (Web - 4 hours):**
- Project 1-4 in parallel tabs
- Download results
- ~$200-250 in tokens

### Day 2: Run 4 More Projects

- Projects 5-8 in parallel tabs
- Download results
- ~$200-250 in tokens

### Day 3: Final 2 Projects + Implementation

- Projects 9-10
- OR: Go back to projects 1-4 and implement (scope: p0_p1)
- Burn remaining ~$200-300 in tokens

---

## ROI Analysis

**Value you get:**

For $700 in tokens, you could generate:

### Specifications Only (Fastest ROI)
- 20-30 projects fully specified
- Each project gets:
  - 8 comprehensive documentation files
  - 10-20 GitHub Spec Kit feature specifications
  - Implementation plans for all missing features
  - Gap analysis and roadmap
- **Value:** Months of documentation work automated
- **Future benefit:** All projects now spec-driven

### With Implementation
- 5-10 projects fully specified + implemented
- Each project gets everything above PLUS:
  - P0+P1 features implemented
  - Tests added
  - Ready for production
- **Value:** Months of development work automated

---

## Pro Tips

1. **Start with small projects** - Learn the workflow
2. **Use cruise control** - Minimize token usage
3. **Defer clarifications** - Resolve locally later (free!)
4. **Download frequently** - Don't lose work
5. **Parallel processing** - 3-5 tabs simultaneously
6. **Commit immediately** - After downloading each project
7. **Monitor progress** - Check .stackshift-state.json periodically
8. **Specs only for most** - Implementation scope: none (faster)
9. **Implement select few** - Deep dive on high-value projects
10. **Clean up branches** - Delete stackshift-web/* after downloading

---

## Estimated Timeline

**With $700 in tokens:**

**Specs-Only Sprint:**
- 20 projects × 30-60 min each = 10-20 hours total
- Run 3-5 in parallel = Complete in 2-3 days
- Download specs after each completes
- Massive documentation sprint!

**Mixed Sprint:**
- 10 projects with specs = 5-10 hours
- 3 projects with implementation = 10-15 hours
- Total: 15-25 hours over 3 days
- Good balance of coverage and depth

---

**Ready to maximize those credits!** 🚗💨💰

Use the prepare-web-batch.sh script to queue up projects, then burn through them in Claude Code Web with cruise control!
