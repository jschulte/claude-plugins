---
name: implement
description: Use GitHub Spec Kit commands to systematically build missing features from specifications in specs/. Validates against acceptance criteria and achieves 100% spec completion. Step 6 of 6 in the reverse engineering process.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Edit
---

# Implement from Spec (with GitHub Spec Kit)

Step 6 of 6 in the Reverse Engineering to Spec-Driven Development process.

## Directory Convention

All artifact paths use a single convention:
- `specs/` -- canonical location for all specifications and implementation plans
- `docs/gap-analysis-report.md` -- phased implementation roadmap
- `.stackshift-state.json` -- session state and progress tracking

---

## Context Routing

Determine execution context before proceeding.

Run `git branch --show-current` to get the current branch name.

**If the branch is `main` or `master`:** Execute Context A (Handoff). Read `operations/handoff.md` and follow the handoff procedure.

**If the branch matches pattern `NNN-*` (e.g., `002-feature-name`):** Execute Context B (Standard Implementation). Proceed to the Process Overview below.

**If neither pattern matches:** Ask the user which context applies -- are they starting fresh from reverse engineering (Context A) or working on an existing feature (Context B)?

The handoff (Context A) happens only once after initial reverse engineering. After that, always use Context B on feature branches.

---

## Process Overview (Context B: Standard Implementation)

### Step 1: Review Implementation Roadmap

Read `docs/gap-analysis-report.md` and identify the phased plan:
- Phase 1 (P0 Critical) -- essential features, security fixes, blocking issues
- Phase 2 (P1 High Value) -- important features, high user impact
- Phase 3 (P2/P3) -- nice-to-have, future enhancements

Confirm with the user:
- Start with Phase 1 (P0 items)?
- Any blockers to address first?
- Time constraints?

Report: "Starting Phase [X]. [Y] features to implement. First feature: [name]."

### Step 2: Generate Tasks for Current Feature

Run `/speckit.tasks [feature-name]` to generate actionable tasks from the implementation plan.

This reads `specs/[feature-name].md`, breaks down the plan into specific tasks, and creates a task checklist.

**If `/speckit.tasks` fails:** Read `operations/error-recovery.md` and follow the `/speckit.tasks` recovery procedure.

### Step 3: Implement Feature

Run `/speckit.implement [feature-name]` to execute the implementation plan.

This command:
1. Loads tasks from the `/speckit.tasks` output
2. Walks through each task systematically
3. Generates code for each task
4. Tests against acceptance criteria
5. Updates specification status markers
6. Commits changes with descriptive messages

Review all generated code before committing. Do not blindly accept generated output.

**If `/speckit.implement` fails or partially completes:** Read `operations/error-recovery.md` and follow the `/speckit.implement` recovery procedure.

### Step 4: Validate Implementation

Run `/speckit.analyze` to verify the implementation.

This checks:
- Implementation matches the specification
- All acceptance criteria are met
- No inconsistencies with related specs
- Status markers are accurate

**If `/speckit.analyze` reports issues:**
- If the implementation is incomplete (missing feature), fix the implementation to match the spec.
- If the spec is outdated (requirements changed during implementation), update the spec first, then re-run `/speckit.analyze`.
- If uncertain, ask the user which should be the source of truth.

Repeat validation until `/speckit.analyze` reports no issues.

**If `/speckit.analyze` fails:** Read `operations/error-recovery.md` and follow the `/speckit.analyze` recovery procedure.

### Step 5: Update Progress and Commit

After each feature:

1. Run `/speckit.analyze` to confirm feature status (X/Y features complete).
2. Mark the feature as complete in `docs/gap-analysis-report.md`.
3. Update `.stackshift-state.json` with current phase and feature progress.
4. Commit: `git commit -m "feat: implement [feature-name] ([spec-file].md)"`
5. Report: "Phase [X]: [completed]/[total] features complete. Next: [feature-name]."

### Step 6: Iterate Until Complete

Repeat Steps 2-5 for each feature in the roadmap.

**Priority checkpoint after all P0 features complete:** Pause and report status to the user. Confirm before proceeding to P1. Example: "Phase 1 complete ([N] P0 features implemented). Ready to start Phase 2 ([M] P1 features). Proceed?"

**Priority checkpoint after all P1 features complete:** Pause and report status. Confirm before proceeding to P2/P3.

**Iteration bound:** If more than 20 features need implementation, pause after every 5 features and report cumulative progress to the user.

---

## Progress Tracking

After each feature implementation cycle, report progress in this format:

```
Phase [X]: [completed]/[total] features complete.
Overall: [total_completed]/[total_all] features ([percentage]%).
Current feature: [COMPLETE/FAILED].
Next: [next-feature-name].
```

Update `.stackshift-state.json` after each feature so sessions can resume from the correct point.

On session resume, read `.stackshift-state.json` to determine the current phase and which feature to continue with.

---

## Post-Implementation

After all features are implemented:
1. Read `operations/post-implementation.md` and follow the validation, review, and coverage mapping procedures.
2. Report the final status to the user.

For ongoing development workflows (new features, refactoring, bug fixes), read `operations/continuous-development.md`.

---

## Success Criteria

After this skill completes:
- All P0 features implemented (Phase 1 complete)
- All P1 features implemented (Phase 2 complete)
- P2/P3 features implemented or intentionally deferred
- All specifications in `specs/` marked COMPLETE
- `/speckit.analyze` reports no issues
- All tests passing
- `.stackshift-state.json` updated with final status
