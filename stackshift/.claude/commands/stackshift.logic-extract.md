---
description: Trace a specific business logic flow across repos. Give it a prompt describing what to trace + starting points — it discovers related repos, traces the algorithm end-to-end, and produces tech-agnostic BMAD specs (BR/DC/EC/ERR/FLOW).
---

# Logic Extract

**IMPORTANT**: Read the full skill definition before proceeding.

## Step 1: Load the Skill

Read the skill file at `skills/logic-extract/SKILL.md` in the StackShift plugin directory. This contains the complete 6-phase process.

## Step 2: Run Phase 0 (Kickoff)

Follow the SKILL.md Phase 0 process exactly:

1. **Collect extraction prompt** — Ask what logic to trace
2. **Collect starting points** — Repos, directories, or files where the logic lives
3. **Mode selection** — Ask YOLO / Guided / Interactive
4. **Validate starting points** — Verify paths exist on disk
5. **Save state** — Write to `.stackshift-state.json`

## Step 3: Run Phases 1-5

Follow the SKILL.md phases sequentially:

- **Phase 1**: Targeted Recon — explore ONLY prompt-relevant parts of each repo (parallelizable)
- **Phase 2**: Discovery & Expansion — trace references to repos the user didn't mention, confirm scope
- **Phase 3**: Deep Trace — follow data from entry point to final output across all repos
- **Phase 4**: Specification — synthesize into tech-agnostic specs (BR/DC/EC/ERR/FLOW)
- **Phase 5**: Epic Generation — BMAD-format epics ordered by data-flow dependency

All output goes to `_logic-extract/` in the current directory.

## When to Use

- Tracing a specific piece of business logic across multiple repos
- Need to understand an algorithm end-to-end (entry point to final output)
- Migrating a specific feature and need every edge case captured
- Want BMAD-format epics scoped to a single capability
- Logic is scattered across services and you need one unified picture

$ARGUMENTS
