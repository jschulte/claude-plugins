---
description: Cross-system integration analysis. Give it starting points (repos, config dirs, system names) — it discovers the full ecosystem, profiles each system, maps how they connect, and produces a phased implementation plan with dependency-ordered epics.
---

# Integration Analysis

**IMPORTANT**: Read the full skill definition before proceeding.

## Step 1: Load the Skill

Read the skill file at `skills/integration-analysis/SKILL.md` in the StackShift plugin directory. This contains the complete 8-phase process.

Also read the operations files:
- `skills/integration-analysis/operations/system-profiling.md`
- `skills/integration-analysis/operations/cross-system-mapping.md`
- `skills/integration-analysis/operations/functionality-tiering.md`

## Step 2: Run Phase 0 (Kickoff)

Follow the SKILL.md Phase 0 process exactly:

1. **Mode selection** — Ask YOLO / Guided / Interactive
2. **Collect starting points** — The user provides repos, config dirs, system names, or context packs
3. **Discover the ecosystem** — Trace integration surfaces in code and docs (in-band), search GitHub for unfound systems (off-band), clone repos found remotely
4. **Present the discovered ecosystem** — Show the graph with confidence levels, ask user to confirm/add/remove
5. **Save state** — Write to `.stackshift-state.json`

## Step 3: Run Phases 1-8

Follow the SKILL.md phases sequentially:

- **Phase 1**: Inventory — enrich system list with metadata and roles
- **Phase 2**: System Profiling — deep-dive each system (parallelizable with Task agents)
- **Phase 3**: Cross-System Analysis — map capabilities, contracts, shared data, flows
- **Phase 4**: Pain & Tiering — register pain points, triage T1/T2/T3/PRUNE
- **Phase 5**: Implementation Layers — assemble L0 → L1 → L2 → L3
- **Phase 6**: Epic/Story Generation — tech-agnostic epics from the layered plan
- **Phase 7**: Reconciliation — compare discovered reality vs target project's existing plan
- **Phase 8**: Go-Forward Plan — merge everything into implementation-ready epics

All output goes to `_integration-analysis/` in the current directory.

## When to Use

- Integrating multiple legacy or new systems into a unified platform
- Need to understand how systems connect (not just individual codebases)
- Want a layered implementation plan instead of a big-bang rewrite
- Previous integration attempts failed because context was incomplete
- Planning a platform migration and need to reconcile the plan with reality

$ARGUMENTS
