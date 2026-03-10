# Error Recovery: Speckit Command Failures

Reference file for handling failures in `/speckit.tasks`, `/speckit.implement`, and `/speckit.analyze`.

---

## General Recovery Procedure

When any speckit command fails:

1. Read the error output carefully.
2. Verify the spec file exists at the expected path in `specs/`.
3. Verify the spec file contains a valid implementation plan section.
4. Retry the command once.
5. If the retry also fails, report to the user with:
   - The exact error message
   - The spec file path that was used
   - What was attempted
   - Suggested next steps

---

## /speckit.tasks Failures

**Spec file not found:**
- Run `ls specs/` to list available spec files.
- Verify the feature name matches a file in `specs/`.
- If the file exists under a different name, use the correct name.
- If no spec file exists, inform the user that Step 5 (complete-spec) must be run first.

**Empty or malformed task output:**
- Read the spec file directly and verify it contains an implementation plan.
- If the plan section is missing, inform the user the spec needs an implementation plan added via `/speckit.plan`.

---

## /speckit.implement Failures

**Task execution fails mid-implementation:**
- Note which task number failed and the error.
- Check if the failure is due to a missing dependency (file, package, API endpoint).
- If a dependency is missing, implement or stub the dependency first, then retry.
- If the generated code has syntax errors, fix them manually and continue to the next task.

**Partial completion (some tasks succeed, some fail):**
- Commit the successfully implemented tasks.
- Report which tasks failed and why.
- Ask the user whether to retry the failed tasks or skip them.

**Implementation conflicts with existing code:**
- Read the conflicting file to understand the current state.
- Determine if the spec or the existing code should take precedence.
- If uncertain, ask the user which should be authoritative.

---

## /speckit.analyze Failures

**Analyze produces no output:**
- Verify specs exist in `specs/`.
- Run `/speckit.analyze` with a specific spec name instead of running it globally.
- If still no output, read the spec file manually and verify implementation against acceptance criteria by hand.

**Analyze reports spec-code mismatch:**
- If the implementation is incomplete (missing feature), fix the implementation to match the spec.
- If the spec is outdated (requirements changed during implementation), update the spec first, then re-run `/speckit.analyze`.
- If uncertain which is correct, ask the user which should be the source of truth.

---

## Maximum Retry Policy

Do not retry any single speckit command more than twice. After two failures on the same command with the same arguments, stop and report the issue to the user with full context.
