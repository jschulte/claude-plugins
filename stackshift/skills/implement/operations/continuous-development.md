# Continuous Spec-Driven Development

Reference file for ongoing development workflows after the reverse engineering process completes.

---

## New Features

Run these commands in sequence:
1. `/speckit.specify` -- create the specification
2. `/speckit.plan` -- create the implementation plan
3. `/speckit.tasks` -- generate task list
4. `/speckit.implement` -- execute implementation
5. `/speckit.analyze` -- validate against spec

---

## Refactoring

1. Update affected specifications with `/speckit.specify`.
2. Update the implementation plan with `/speckit.plan`.
3. Implement changes with `/speckit.implement`.
4. Validate no regression with `/speckit.analyze`.

---

## Bug Fixes

1. If the bug reveals a requirement gap, update the spec with `/speckit.specify`.
2. Fix the implementation manually or with `/speckit.implement`.
3. Validate the fix with `/speckit.analyze`.

---

## Best Practices

- One feature at a time. Do not start multiple features in parallel.
- Follow the roadmap priority order: P0 then P1 then P2.
- Use `/speckit.implement` instead of implementing manually.
- Run `/speckit.analyze` after every feature completion.
- Commit after each feature is complete and validated.
- If new requirements are discovered during implementation, update specs first.

## Quality Standards

For each implementation, verify:
- All acceptance criteria are met
- Tests are added and passing
- TypeScript types are correct (if applicable)
- Error handling is implemented
- Loading states exist for async operations
- Responsive design is applied (if UI)
- Accessibility standards are met
