# Handoff: Reverse Engineering to Spec-Driven Development

The one-time transition from reverse engineering (Gears 1-5) to standard GitHub Spec Kit workflow.

---

## When This Applies

Execute this handoff when all of these conditions are true:
- The current branch is `main` or `master`
- Gears 1-5 are complete (gap analysis shows PARTIAL or MISSING features)
- Implementation plans exist in `specs/`
- No feature branch has been created yet

---

## Handoff Procedure

### Step 1: Summarize Completion

Report to the user what has been accomplished:
- Gear 1 (Analysis) -- tech stack detected, completeness assessed
- Gear 2 (Reverse Engineering) -- comprehensive documentation files created
- Gear 3 (Specifications) -- GitHub Spec Kit structure created in `specs/`
- Gear 4 (Gap Analysis) -- missing features identified and prioritized in `docs/gap-analysis-report.md`
- Gear 5 (Complete Specification) -- all clarifications resolved, no `[NEEDS CLARIFICATION]` markers remain

Report the artifacts that now exist:
- `analysis-report.md`
- `docs/reverse-engineering/` (documentation files)
- `docs/gap-analysis-report.md`
- `specs/` (feature specifications and implementation plans)
- `.stackshift-state.json` (complete history)

### Step 2: Explain the Transition

Explain to the user:
- StackShift reverse engineering (one-time) is complete.
- Going forward, use GitHub Spec Kit commands for all development: `/speckit.tasks`, `/speckit.implement`, `/speckit.analyze`.
- The workflow is: feature branch, implement from specs, validate, merge.

### Step 3: Show Remaining Work

Read `docs/gap-analysis-report.md` and list all features that need implementation, grouped by priority:
- P0/P1 (high priority) -- list each feature with status, estimated effort, and spec path in `specs/`
- P2/P3 (medium/low priority) -- list each feature similarly

Report total estimated effort by priority tier.

### Step 4: Offer Feature Branch Setup

Recommend the highest-priority feature to implement first. Explain why it was chosen (highest priority, foundational dependency, clearest plan).

Ask the user: "Create a feature branch and start implementing, or provide instructions for manual setup?"

**If the user says yes:** Proceed to Step 5.
**If the user says no:** Proceed to Step 6.

### Step 5: Create Feature Branch (User Accepts)

Run these commands:

```bash
FEATURE_NAME="[feature-name-from-plan]"
FEATURE_NUMBER="002"  # Increment from existing branches

git checkout -b ${FEATURE_NUMBER}-${FEATURE_NAME}
```

Create a `WORKING_ON.md` file in the branch root with:
- Feature name and branch name
- Path to the specification in `specs/`
- Path to the implementation plan in `specs/`
- Status: In Progress
- Next steps: `/speckit.tasks`, `/speckit.implement`, `/speckit.analyze`

Commit and push:
```bash
git add WORKING_ON.md
git commit -m "chore: set up feature branch for ${FEATURE_NAME}"
git push -u origin ${FEATURE_NUMBER}-${FEATURE_NAME}
```

Report to the user that the branch is ready and instruct them to run `/speckit.tasks` to begin.

### Step 6: Provide Manual Instructions (User Declines)

Provide the user with instructions for manual setup:
1. Pick a feature from `specs/` that has an implementation plan.
2. Create a branch: `git checkout -b NNN-feature-name`
3. Run `/speckit.tasks` to generate task list.
4. Run `/speckit.implement` to execute implementation.
5. Run `/speckit.analyze` to validate.
6. Commit and create a PR against main.
7. After merge, pick the next feature and repeat.

---

## Handoff Checklist

Before completing the handoff, verify:
- All specifications are finalized (no `[NEEDS CLARIFICATION]` markers)
- Gap analysis is complete with a prioritized roadmap
- Implementation plans exist in `specs/` for all PARTIAL/MISSING features
- The user understands the feature branch workflow
- The user knows to use `/speckit.*` commands going forward
- Next steps are clear

---

## After Handoff

This handoff happens only once. If the user returns later, remind them:
- Reverse engineering is complete.
- Use `/speckit.*` commands for all ongoing development.
- Feature branch naming convention: `001-`, `002-`, `003-` (numeric prefix for ordering).
