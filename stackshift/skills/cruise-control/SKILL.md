---
name: cruise-control
description: Orchestrates all 6 StackShift gears sequentially without manual intervention. Supports 7 execution paths including GitHub Spec Kit, BMAD Auto-Pilot, BMAD Method, Architecture Only, Portable Extraction, and Widget Migration.
allowed-tools:
  - Read
  - Write
  - Edit
  - Bash
  - Glob
  - Grep
  - Task
---

# Cruise Control Orchestrator

Run all StackShift gears sequentially without stopping between gears.

---

## Activation

Activate when the user requests automatic, unattended, or hands-free StackShift execution. Common trigger phrases: "cruise control", "run automatically", "autopilot", "full workflow", "all gears".

---

## Setup: Collect Configuration

Present the following prompts in order. Skip prompts that do not apply to the selected path (see skip rules below).

**Prompt 1 - Route Selection:**
Ask the user to choose:
- A) Greenfield - Shift to new tech stack
- B) Brownfield - Manage existing code

**Prompt 2 - Implementation Framework:**
Ask the user to choose:
- A) GitHub Spec Kit - Feature specs in .specify/, /speckit.* commands
- B) BMAD Auto-Pilot - Auto-generate BMAD artifacts from reverse-eng docs
- C) BMAD Method - Same docs, hands off to BMAD's collaborative agents
- D) Architecture Only - Generate architecture.md with your constraints
- E) Portable Extraction - Tech-agnostic business logic extraction
- F) Widget Migration - Legacy widget to React Router 7 + Iris

**Prompt 3 - Clarifications Handling** (Spec Kit only):
- A) Defer - Mark them, implement around them, clarify later
- B) Prompt - Stop and ask questions interactively
- C) Skip - Only implement fully-specified features

**Prompt 4 - Implementation Scope** (Spec Kit only):
- A) P0 only - Critical features
- B) P0 + P1 - Critical and high-value
- C) All - Everything
- D) None - Stop after specs are ready

**Prompt 5 - BMAD Synthesize Mode** (BMAD Auto-Pilot only):
- A) YOLO - Fully automatic, no questions
- B) Guided - Auto-fill + targeted questions

**Prompt 6 - Architecture Constraints** (Architecture Only only):
Collect: tech stack, cloud provider, scale, hard constraints.

**Prompt 7 - Portable Extraction Mode** (Portable Extraction only):
- A) YOLO - Fully automatic
- B) Guided - Auto-fill + targeted questions

**Prompt 8 - Widget Migration Mode** (Widget Migration only):
- A) YOLO - Fully automatic
- B) Guided - Auto-fill + targeted questions
Target stack is always React Router 7 + Iris + TypeScript (not configurable).

**Skip rules:**
- BMAD Method: skip prompts 3-6
- BMAD Auto-Pilot: skip prompts 3-4, 6-7
- Architecture Only: skip prompts 3-5, 7-8
- Portable Extraction: skip prompts 3-6, 8
- Widget Migration: skip prompts 3-7

After collecting all applicable answers, write them to `.stackshift-state.json`:

```json
{
  "auto_mode": true,
  "auto_config": {
    "route": "<greenfield|brownfield>",
    "implementation_framework": "<speckit|bmad-autopilot|bmad|architect-only|portable-extract|widget-migrate>",
    "clarifications_strategy": "<defer|prompt|skip>",
    "implementation_scope": "<p0|p0_p1|all|none>",
    "synthesize_mode": "<yolo|guided>",
    "architecture_constraints": { ... }
  }
}
```

Log: `"Configuration saved. Starting cruise control with [framework] on [route] path."`

---

## Gear Transition Protocol

After each gear completes, do the following before proceeding:

1. Verify expected output files exist using Glob or Read.
2. Update `.stackshift-state.json`: set `currentStep` to the completed gear name and append it to `completedSteps`.
3. Log: `"Gear [N] ([name]) complete. Output: [list files]. Shifting to Gear [N+1]."`
4. If any expected output is missing or a gear produced an error, stop execution immediately. Log: `"Gear [N] ([name]) FAILED. Missing: [files]. Error: [message]."` Ask the user: "Gear [N] failed. Retry this gear, or skip it and continue?"

---

## Execution: GitHub Spec Kit Path

### Gear 1: Analyze

Run the analyze skill. Pass the route and framework selections.

Execute AST analysis: `node scripts/run-ast-analysis.mjs analyze .`

Verify output: `analysis-report.md` exists and `.stackshift-analysis/` directory was created.

Set `implementation_framework` to `speckit` in `.stackshift-state.json`.

If Gear 1 fails: check that the codebase directory is valid and contains source files. Ask user whether to retry or abort.

Proceed to Gear 2.

### Gear 2: Reverse Engineer

Launch the `stackshift:stackshift-code-analyzer:AGENT` agent via Task tool. Extract documentation based on route (greenfield = business logic only, brownfield = business + technical).

Verify output: `docs/reverse-engineering/` contains all 9 expected files including `integration-points.md`.

If Gear 2 fails: check `docs/reverse-engineering/` for partial output. Report which files are missing. Ask user whether to retry or skip.

Proceed to Gear 3.

### Gear 3: Create Specifications

Run the create-specs skill in automated mode. Generate the constitution using the appropriate route template. Create all feature specs programmatically. Create implementation plans for incomplete features. Set up `/speckit.*` slash commands.

Verify output: `.specify/` directory exists with `constitution.md` and at least one spec under `.specify/specs/`.

If Gear 3 fails: check whether `.specify/` was partially created. Report status. Ask user whether to retry or skip.

Proceed to Gear 4.

### Gear 4: Gap Analysis

Run the gap-analysis skill (equivalent to `/speckit.analyze`). Identify PARTIAL and MISSING features. Create prioritized roadmap. Mark [NEEDS CLARIFICATION] items.

Verify output: gap analysis report exists in `.specify/`.

If Gear 4 fails: report the error. Ask user whether to retry or skip.

Proceed to Gear 5.

### Gear 5: Complete Specification

Branch on the `clarifications_strategy` from configuration:
- If `defer`: skip this gear, log "Deferring clarifications." Proceed to Gear 6.
- If `prompt`: run the complete-spec skill interactively. Ask the user clarification questions. Resume after answers.
- If `skip`: mark unclear features as P2, log "Unclear features marked P2." Proceed to Gear 6.

If Gear 5 fails: report the error. Ask user whether to retry or skip.

Proceed to Gear 6.

### Gear 6: Implement

Branch on the `implementation_scope` from configuration:
- If `none`: log "Specs ready. Stopping before implementation." Mark workflow complete.
- If `p0`: run the implement skill for P0 features only.
- If `p0_p1`: run the implement skill for P0 and P1 features.
- If `all`: run the implement skill for all features.

Use `/speckit.tasks` and `/speckit.implement` for each feature.

If Gear 6 fails: report which feature failed. Ask user whether to retry that feature, skip it, or abort.

Verify output: implemented features match the requested scope.

Log: "Cruise control complete. All gears finished for GitHub Spec Kit path."

---

## Execution: BMAD Auto-Pilot Path

### Gear 1: Analyze

Run the analyze skill. Set `implementation_framework` to `bmad-autopilot` in `.stackshift-state.json`.

Verify output: `analysis-report.md` exists.

If Gear 1 fails: ask user whether to retry or abort.

Proceed to Gear 2.

### Gear 2: Reverse Engineer

Launch the `stackshift:stackshift-code-analyzer:AGENT` agent via Task tool. Extract all 11 documentation files including `business-context.md` and `decision-rationale.md`.

Verify output: `docs/reverse-engineering/` contains all 11 files.

If Gear 2 fails: report which files are missing. Ask user whether to retry or skip.

Proceed to BMAD Synthesize.

### Gears 3-5: BMAD Synthesize

Run the bmad-synthesize skill in the selected mode (YOLO or Guided, from `synthesize_mode` in config).

Verify output: `_bmad-output/planning-artifacts/` contains `prd.md`, `architecture.md`, `epics.md`, `ux-design-specification.md`.

If BMAD Synthesize fails: report which artifacts are missing. Ask user whether to retry or skip.

Proceed to Gear 6.

### Gear 6: BMAD Handoff

If the user wants BMAD refinement: display BMAD installation instructions and `*workflow-init` command.

If artifacts are sufficient: mark workflow complete.

Log: "Cruise control complete. BMAD Auto-Pilot path finished."

---

## Execution: BMAD Method Path

### Gear 1: Analyze

Run the analyze skill. Set `implementation_framework` to `bmad` in `.stackshift-state.json`.

Verify output: `analysis-report.md` exists.

If Gear 1 fails: ask user whether to retry or abort.

Proceed to Gear 2.

### Gear 2: Reverse Engineer

Launch the `stackshift:stackshift-code-analyzer:AGENT` agent via Task tool. Extract all 11 documentation files.

Verify output: `docs/reverse-engineering/` contains all 11 files.

If Gear 2 fails: report which files are missing. Ask user whether to retry or skip.

Skip Gears 3-5. Proceed to Gear 6.

### Gear 6: BMAD Handoff

Display instructions for BMAD installation and setup. Provide the `*workflow-init` command. Explain how to point BMAD to `docs/reverse-engineering/`.

Log: "Cruise control complete. BMAD Method path finished. BMAD takes over from here."

---

## Execution: Architecture Only Path

### Gear 1: Analyze

Run the analyze skill. Set `implementation_framework` to `architect-only` in `.stackshift-state.json`. Store the architecture constraints collected during setup.

Verify output: `analysis-report.md` exists.

If Gear 1 fails: ask user whether to retry or abort.

Proceed to Gear 2.

### Gear 2: Reverse Engineer

Launch the `stackshift:stackshift-code-analyzer:AGENT` agent via Task tool. Extract all 11 documentation files.

Verify output: `docs/reverse-engineering/` contains all 11 files.

If Gear 2 fails: report which files are missing. Ask user whether to retry or skip.

Proceed to Architecture Generator.

### Gears 3-5: Architecture Generator

Run the architect skill with the user constraints from Gear 1. Generate `architecture.md` with Mermaid diagrams, ADRs, and infrastructure recommendations.

Verify output: `architecture.md` exists.

If Architecture Generator fails: report the error. Ask user whether to retry or skip.

Log: "Cruise control complete. Architecture Only path finished."

---

## Execution: Portable Extraction Path

### Gear 1: Analyze

Run the analyze skill. Set `implementation_framework` to `portable-extract` in `.stackshift-state.json`.

Verify output: `analysis-report.md` exists.

If Gear 1 fails: ask user whether to retry or abort.

Proceed to Gear 2.

### Gear 2: Reverse Engineer

Launch the `stackshift:stackshift-code-analyzer:AGENT` agent via Task tool. Extract all 11 documentation files.

Verify output: `docs/reverse-engineering/` contains all 11 files.

If Gear 2 fails: report which files are missing. Ask user whether to retry or skip.

Proceed to Portable Extraction.

### Gears 3-5: Portable Extraction

Run the portable-extract skill in the selected mode (YOLO or Guided, from `synthesize_mode` in config).

Verify output: `_portable-extract/` contains `epics.md` and `component-spec.md`.

If Portable Extraction fails: report which artifacts are missing. Ask user whether to retry or skip.

Log: "Cruise control complete. Portable Extraction path finished."

---

## Execution: Widget Migration Path

### Gear 1: Analyze

Run the analyze skill. Detect the widget type (osiris, v9-velocity, v9-viewmodel, gvm). Set `implementation_framework` to `widget-migrate` in `.stackshift-state.json`.

Verify output: `analysis-report.md` exists and widget type is identified.

If Gear 1 fails: ask user whether to retry or abort.

Skip standard Gear 2. Proceed directly to Widget Migration.

### Gears 2-6: Widget Migration Pipeline

Run the widget-migrate skill in the selected mode (YOLO or Guided, from config). Pass the widget ID as an argument for argument-based invocation.

The full pipeline runs: detect, extract, preference catalog, Iris map, portable spec, targeted epics.

Verify output in `docs/specs/widgets/{widget-name}/`:
- `preference-catalog.md`
- `iris-component-mapping.md`
- `portable-epics.md`
- `portable-component-spec.md`
- `targeted-epics.md`
- `migration-report.md`

If Widget Migration fails: report which output files are missing. Ask user whether to retry or abort.

Log: "Cruise control complete. Widget Migration path finished."

---

## Interruption and Resume

If the user says "stop", "pause", or "switch to manual mode":

1. Write the current gear number and completed outputs to `.stackshift-state.json`.
2. Set `auto_mode` to `false` in `.stackshift-state.json`.
3. Log: "Cruise control paused at Gear [N]. State saved. You can continue manually or resume cruise control later."

If the user says "resume cruise control":

1. Read `.stackshift-state.json`.
2. Set `auto_mode` back to `true`.
3. Identify the last completed gear from `completedSteps`.
4. Continue execution from the next gear in the path sequence.
5. Log: "Resuming cruise control from Gear [N]."

---

## Success Criteria

### GitHub Spec Kit
- `.stackshift-state.json` shows `implementation_framework: "speckit"` and all 6 gears in `completedSteps`
- `.specify/` directory initialized with specs
- Features implemented per requested scope

### BMAD Auto-Pilot
- `.stackshift-state.json` shows `implementation_framework: "bmad-autopilot"`
- `docs/reverse-engineering/` with all 11 files
- `_bmad-output/planning-artifacts/` with prd.md, architecture.md, epics.md, ux-design-specification.md

### BMAD Method
- `.stackshift-state.json` shows `implementation_framework: "bmad"`
- `docs/reverse-engineering/` with all 11 files
- BMAD handoff instructions provided

### Architecture Only
- `.stackshift-state.json` shows `implementation_framework: "architect-only"`
- `docs/reverse-engineering/` with all 11 files
- `architecture.md` generated with diagrams and ADRs

### Portable Extraction
- `.stackshift-state.json` shows `implementation_framework: "portable-extract"`
- `docs/reverse-engineering/` with all 11 files
- `_portable-extract/epics.md` and `_portable-extract/component-spec.md` generated

### Widget Migration
- `.stackshift-state.json` shows `implementation_framework: "widget-migrate"`
- `docs/specs/widgets/{widget-name}/` with all 6 output files
- Zero source-platform terms in targeted epics
- Every story references PREF-*, COMP-*, and BR-* IDs
