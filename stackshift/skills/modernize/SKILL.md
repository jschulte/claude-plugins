---
name: modernize
description: Activated when a brownfield project completes Gear 6 with modernize flag enabled. Upgrades all dependencies to latest stable versions, fixes breaking changes with spec guidance, synchronizes specifications, and validates coverage. Scoped to Node.js/TypeScript projects only.
allowed-tools:
  - Bash
  - Read
  - Write
  - Edit
  - Glob
  - Grep
---

# Modernize (Brownfield Dependency Upgrade)

Runs after Gear 6 for brownfield projects with `modernize: true` in `.stackshift-state.json`.

**Prerequisites:** Gears 1-6 complete, 100% spec coverage established
**Output:** Modern dependency versions, updated tests, synchronized specs, upgrade report
**Scope:** Node.js/TypeScript projects only

---

## Constraints

- Do NOT upgrade to pre-release, beta, or canary versions. Use only stable releases.
- Do NOT delete lockfiles (package-lock.json, yarn.lock, pnpm-lock.yaml).
- Do NOT run `npm audit fix --force`. Use `npm audit fix` only.
- Do NOT proceed to the next phase until the current phase passes its gate check.
- Execute phases sequentially. No phases run in parallel.
- If `/speckit.analyze` is unavailable, manually compare spec acceptance criteria against test results as a fallback.

---

## Trigger Conditions

Read `.stackshift-state.json` in the project root. Verify ALL of:
1. `path` is `"brownfield"`
2. `modernize` is `true`
3. Gear 6 (implement) is complete

If any condition is false, stop and report which condition failed.

If `path` is `"greenfield"`, stop. This skill is for brownfield projects only.

---

## State Management

**State file:** `.stackshift-state.json` (project root)
**Working directory:** `.modernize/`

On start, update `.stackshift-state.json`:
```json
{ "modernize": true, "modernizeStatus": "in-progress", "modernizeStarted": "<ISO timestamp>" }
```

On success, update:
```json
{ "modernizeStatus": "complete", "modernizeCompleted": "<ISO timestamp>" }
```

On failure, update:
```json
{ "modernizeStatus": "failed", "modernizeError": "<summary of failure>" }
```

---

## Rollback Procedure

If any phase fails and cannot be recovered:

1. Copy `.modernize/baseline-package.json` back to `package.json`.
2. Copy `.modernize/baseline-lockfile` back to the original lockfile location (if saved).
3. Run `npm install`.
4. Run `npm test` to verify baseline is restored.
5. If baseline tests pass, log "Rolled back to baseline successfully."
6. If baseline tests fail, stop and ask the user for guidance.
7. Update `.stackshift-state.json` with `modernizeStatus: "failed"`.

---

## Phase 1: Pre-Upgrade Baseline

Create the working directory and capture baseline state.

```bash
mkdir -p .modernize

cp package.json .modernize/baseline-package.json

# Save lockfile if present
if [ -f package-lock.json ]; then cp package-lock.json .modernize/baseline-lockfile; fi
if [ -f yarn.lock ]; then cp yarn.lock .modernize/baseline-lockfile; fi
if [ -f pnpm-lock.yaml ]; then cp pnpm-lock.yaml .modernize/baseline-lockfile; fi

npm test 2>&1 | tee .modernize/baseline-test-results.txt
npm run test:coverage 2>&1 | tee .modernize/baseline-coverage.txt
npm outdated 2>&1 | tee .modernize/upgrade-plan.txt
```

**If `npm test` fails at baseline:** Stop. The project has pre-existing test failures. Ask the user whether to proceed or fix tests first.

**Gate check:** `.modernize/baseline-package.json` exists AND `.modernize/baseline-test-results.txt` exists.

Log: "Phase 1 complete -- baseline captured. X packages have available updates."

---

## Phase 2: Dependency Upgrade

Upgrade all dependencies to latest stable versions.

```bash
npx npm-check-updates -u --target latest --reject '*alpha*,*beta*,*canary*,*rc*'
npm install 2>&1 | tee .modernize/install-output.txt
```

**If `npm install` fails after `ncu -u`:**
1. Read the error output from `.modernize/install-output.txt`.
2. Identify the failing package(s) from peer dependency or resolution errors.
3. Revert those specific packages to their previous versions in `package.json` (read versions from `.modernize/baseline-package.json`).
4. Run `npm install` again.
5. Document skipped packages in `.modernize/skipped-packages.txt`.
6. If install still fails after 3 attempts, execute the Rollback Procedure and ask the user.

Run security fixes:
```bash
npm audit fix 2>&1 | tee .modernize/audit-fix-output.txt
```

**Gate check:** `node_modules` directory exists AND `npm install` exited with code 0.

Log: "Phase 2 complete -- dependencies upgraded. X packages updated, Y skipped."

---

## Phase 3: Breaking Change Detection

Run the full test suite against upgraded dependencies.

```bash
npm test 2>&1 | tee .modernize/post-upgrade-test-results.txt
```

Compare results to baseline:
```bash
diff .modernize/baseline-test-results.txt .modernize/post-upgrade-test-results.txt > .modernize/test-diff.txt 2>&1 || true
```

Classify failures:
- **Breaking change failures:** Tests that were passing now fail with different assertion values or changed API signatures. These are expected and get fixed in Phase 4.
- **Infrastructure failures:** Tests fail with import errors, module-not-found, syntax errors, or timeout errors unrelated to behavior changes. These indicate install problems.

**If more than 50% of tests fail:** Execute the Rollback Procedure. The upgrade scope is too broad. Ask the user whether to attempt incremental upgrades (major versions one at a time).

**If infrastructure failures exist:** Fix import/module resolution issues before proceeding. These are not breaking changes -- they indicate incomplete installation or missing peer dependencies.

**Gate check:** Test results captured AND failure rate is below 50%.

Log: "Phase 3 complete -- X tests passing, Y tests failing (Z breaking changes, W infrastructure issues)."

---

## Phase 4: Fix Breaking Changes (Spec-Guided)

For each breaking change identified in Phase 3:

1. Match the failing test to its feature spec in `specs/`.
2. Read the spec's acceptance criteria to understand required behavior.
3. Update the code to work with the new dependency version while preserving spec compliance.
4. Update the test if the test itself used deprecated APIs.
5. Run the specific test to verify the fix.

After fixing all breaking changes, run the full test suite:
```bash
npm test 2>&1 | tee .modernize/post-fix-test-results.txt
```

**If tests still fail after fixing all identified breaking changes:** Compare against baseline. If failures exist that were not in the baseline, investigate. If after 3 fix iterations tests still fail, ask the user for guidance.

**Gate check:** All tests that passed at baseline now pass. No regressions.

Log: "Phase 4 complete -- X breaking changes fixed. All baseline tests restored."

---

## Phase 5: Spec Synchronization

Determine whether dependency upgrades changed observable behavior (not just implementation).

**Detection method:** Compare test output diffs from Phase 3. If tests that were passing now produce different output values (not errors), behavior changed. If tests only failed with import/syntax/API signature errors, only implementation changed.

**If behavior changed:**
1. Update the relevant feature spec to document the new behavior.
2. Update acceptance criteria if outputs or interfaces changed.
3. Update technical requirements with new dependency versions.
4. Run `/speckit.analyze` to validate spec-implementation alignment. If `/speckit.analyze` is unavailable, manually verify each spec's acceptance criteria against test results.

**If only implementation changed:**
- Update version numbers in spec technical details only.
- No functional spec changes needed.

**Gate check:** All specs in `specs/` reflect current dependency versions AND `/speckit.analyze` (or manual check) shows no drift.

Log: "Phase 5 complete -- X specs updated. No spec drift detected."

---

## Phase 6: Test Coverage Improvement

Run coverage and assess against the 85% threshold.

```bash
npm run test:coverage 2>&1 | tee .modernize/post-upgrade-coverage.txt
```

**If all modules are already at 85%+:** Skip to Phase 7. Log: "Phase 6 skipped -- all modules already at 85%+ coverage."

**If any module is below 85%:**
1. Identify modules below threshold from coverage output.
2. For each module, read its spec's acceptance criteria.
3. Write tests covering each acceptance criterion that lacks a test.
4. Re-run coverage after adding tests.

**Gate check:** `npm run test:coverage` shows all modules at 85%+.

Log: "Phase 6 complete -- coverage improved from X% to Y%. Z new tests added."

---

## Phase 7: Final Validation

Run the complete validation suite. Every check must pass.

```bash
npm run build 2>&1 | tee .modernize/build-output.txt
```
**If build fails:** Read error output. Fix compilation errors. Re-run build. If build fails after 3 attempts, ask the user.

```bash
npm test 2>&1 | tee .modernize/final-test-results.txt
```
**If any test fails:** This is a regression. Do not proceed. Fix the failing test or execute Rollback Procedure.

```bash
npm run test:coverage 2>&1 | tee .modernize/final-coverage.txt
```
**If any module is below 85%:** Return to Phase 6.

Run `/speckit.analyze` (or manual spec check).
**If spec drift detected:** Return to Phase 5.

```bash
npm audit 2>&1 | tee .modernize/final-audit.txt
```
**If high or critical vulnerabilities remain:** Run `npm audit fix` (not `--force`). If vulnerabilities persist, document them in the upgrade report and inform the user.

**Gate check:** Build passes AND all tests pass AND coverage >= 85% AND no spec drift AND no high/critical vulnerabilities.

Log: "Phase 7 complete -- all validations passed. Modernization successful."

---

## Output: Upgrade Report

Write `.modernize/UPGRADE_REPORT.md` with the following structure:

```markdown
# Dependency Modernization Report

**Date**: <ISO date>
**Project**: <project name from package.json>

## Summary

- **Dependencies upgraded**: X packages
- **Major version bumps**: X packages
- **Breaking changes fixed**: X
- **Tests fixed/added**: X tests
- **Coverage**: X% -> Y%
- **Specs updated**: X specs
- **Skipped packages**: X (see details below)

## Upgraded Dependencies

| Package | Old Version | New Version | Breaking? |
|---------|-------------|-------------|-----------|
| <name>  | <old>       | <new>       | Yes/No    |

## Skipped Packages

<List any packages that could not be upgraded and why>

## Breaking Changes Fixed

For each breaking change:
- **Package**: <name>
- **Affected feature**: <feature name>
- **Fix**: <what was changed>
- **Spec impact**: <behavior change or implementation only>

## Spec Updates

<List specs that were modified and why>

## Test Coverage

- Before: X%
- After: Y%
- New tests: Z

## Validation Results

- Build: pass/fail
- Tests: X passing, Y failing
- Coverage: X% (target: 85%+)
- Spec drift: none/details
- Vulnerabilities: X high, Y critical (or none)
```

After writing the report, update `.stackshift-state.json` with `modernizeStatus: "complete"`.

---

## Success Criteria

Modernization is complete when ALL of:
- All dependencies updated to latest stable versions (or documented as skipped)
- All tests passing (zero failures)
- Test coverage >= 85% on all modules
- Build successful
- No spec drift (verified by `/speckit.analyze` or manual check)
- No high/critical security vulnerabilities (or documented with user acknowledgment)
- Specs updated where behavior changed
- `.modernize/UPGRADE_REPORT.md` generated
- `.stackshift-state.json` updated with `modernizeStatus: "complete"`
