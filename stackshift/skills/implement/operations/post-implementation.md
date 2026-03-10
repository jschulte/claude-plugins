# Post-Implementation: Validate, Review, and Coverage

Reference file for validation, code review, and spec coverage mapping after implementation completes.

---

## Validate and Review

### Run Validation

Run `/stackshift.validate --fix` to validate the implementation against specs.

This checks:
- Full test suite passes
- TypeScript compilation succeeds
- Spec compliance verified
- Code quality standards met
- Auto-fixes applied where possible
- Rollback performed if fixes fail

If validation passes, proceed to code review. If critical issues cannot be auto-fixed, report them to the user for manual resolution.

### Code Review

Run `/stackshift.review` to perform a comprehensive review across five dimensions:
1. Correctness -- works as intended, meets requirements
2. Standards -- follows conventions, well documented
3. Security -- no vulnerabilities, proper validation
4. Performance -- efficient, scalable implementation
5. Testing -- adequate coverage, edge cases handled

If issues are found, provide specific feedback with line numbers and recommendations.

---

## Spec Coverage Map

After validation passes, generate the coverage map.

Analyze all specs in `specs/` and produce:
1. ASCII box diagrams -- visual map of each spec's files
2. Reverse index -- which spec(s) cover each file
3. Coverage statistics -- percentages by category
4. Heat map -- visual coverage representation
5. Gap analysis -- files not covered by specs
6. Shared files -- high-risk files used by multiple specs

Write output to `docs/spec-coverage-map.md`.

---

## Coverage Health Report

After generating the coverage map, report a summary to the user showing:
- Overall coverage percentage (files covered / total files)
- Coverage by category (backend, frontend, infrastructure, database, scripts)
- Number of specs and files covered
- Number of gap files needing review
- High-risk shared files (used by 4+ specs)
- Path to full report: `docs/spec-coverage-map.md`

---

## Completion

After validation, review, and coverage mapping all pass, report to the user:
- The 6-step reverse engineering to spec-driven development process is complete
- The codebase is fully specified and implemented
- Ongoing development should use `/speckit.specify` -> `/speckit.plan` -> `/speckit.tasks` -> `/speckit.implement` -> `/speckit.analyze`
