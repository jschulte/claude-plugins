# Manual Spec Generation (Fallback)

Execute this procedure ONLY if the automated path (reconcile-specs.md) fails. Do NOT execute both paths.

---

## Failure Criteria

The automated path has failed if ANY of these are true after running `cat web/reconcile-specs.md`:
- `.specify/memory/constitution.md` does not exist
- No `.specify/specs/*/spec.md` files exist
- The reconciliation prompt produced errors or no output

---

## Fallback Step 1: Initialize Spec Kit Structure

Create the directory structure manually. Do NOT run `specify init` -- it requires GitHub API access and is unnecessary.

```bash
mkdir -p .specify/memory
mkdir -p .specify/templates
mkdir -p .specify/scripts
mkdir -p .specify/specs
```

Log: "PROGRESS: Spec Kit directory structure created."

---

## Fallback Step 2: Generate Constitution

Read `docs/reverse-engineering/functional-specification.md` and create `.specify/memory/constitution.md`.

Constitution includes:
- **Purpose & Values** - Why this project exists, core principles
- **Technical Decisions** - Architecture choices with rationale
- **Development Standards** - Code style, testing requirements, review process
- **Quality Standards** - Performance, security, reliability requirements
- **Governance** - How decisions are made

Write the constitution to `.specify/memory/constitution.md`.

Verify: confirm `.specify/memory/constitution.md` exists and is non-empty.

Log: "PROGRESS: Constitution generated."

---

## Fallback Step 3: Generate Feature Specifications

Read `docs/reverse-engineering/functional-specification.md` and extract EVERY feature (complete, partial, missing).

For each feature, create a directory and spec.md:
```
.specify/specs/NNN-feature-name/spec.md
```

Use the template from `operations/templates.md`. Mark implementation status:
- COMPLETE - Fully implemented and tested
- PARTIAL - Partially implemented (detail what exists vs missing)
- MISSING - Not started

Generate specs for 100% of features -- not just gaps. Complete features need specs for future spec-driven changes.

Verify: count `.specify/specs/*/spec.md` files. Confirm count matches total features extracted.

Log: "PROGRESS: [N] feature specifications generated."

---

## Fallback Step 4: Generate Implementation Plans (Thoroughness 2+)

Skip this step if GENERATE_PLANS is false.

For each PARTIAL or MISSING feature, create a `plan.md` in the feature directory:
```
.specify/specs/NNN-feature-name/plan.md
```

Use the plan template from `operations/templates.md`.

Skip COMPLETE features -- they do not need plans.

Verify: confirm every PARTIAL/MISSING spec directory has a plan.md.

Log: "PROGRESS: [N] implementation plans generated for incomplete features."

---

## Fallback Step 5: Mark Implementation Status

Confirm each spec.md uses the standard status markers:
- COMPLETE features
- PARTIAL features (detail what exists vs missing)
- MISSING features

This enables `/speckit.analyze` to verify consistency downstream.

Log: "PROGRESS: Implementation status markers verified."
