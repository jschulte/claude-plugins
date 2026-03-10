---
name: integration-analysis
description: Analyzes integration surfaces across multi-system ecosystems. From starting-point repos and config directories, discovers connected systems, profiles each one, maps cross-system capabilities, tiers functionality (T1/T2/T3/PRUNE), and generates a layered implementation plan (L0-L3) with dependency-ordered epics.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Agent
---

# Integration Analysis

**Estimated Time:** 30-90 minutes (depending on system count, mode, and available inputs)
**Prerequisites:** At least one starting-point repo or config directory
**Output:** Analysis artifacts + dependency-ordered epics in `_integration-analysis/`

---

## Resume Check

Before starting, check for `.stackshift-state.json` with `integration-analysis.status = 'in_progress'`. If found, present:

```
A previous integration analysis was interrupted at Phase {N}.
Resume from Phase {N+1}? (Y/n)
```

If yes, load the saved system list and generated artifacts, skip completed phases. In YOLO mode, auto-resume from the interrupted phase.

---

## Three Modes

### YOLO (Fully Automatic)
~30-45 min. No user input after initial system list. Auto-extracts, auto-tiers, marks uncertain items with `[AUTO - review recommended]`.

### Guided (Recommended)
~45-60 min. Auto-extracts + 5-10 targeted questions about ambiguous boundaries, pain points, tier assignments, data ownership, and missing context.

### Interactive
~60-90 min. Full walkthrough with review and approval at each phase.

---

## Phase 0: KICKOFF

### 0.1 Mode Selection

```
How should I run the integration analysis?

A) YOLO -- Fully automatic, no questions after setup (~30-45 min)
B) Guided -- Auto-extract + 5-10 targeted questions (recommended) (~45-60 min)
C) Interactive -- Full walkthrough with review at each phase (~60-90 min)
```

Save selection to state.

### 0.2 Collect Starting Points

```
Give me one or more starting points and I'll figure out the ecosystem.
Anything helps -- repos, config dirs, system names, docs, context packs.
```

Accept any combination of: code paths, config directories, context pack paths, Discover output (`.stackshift/ecosystem-map.md`), system names, Reverse Engineer docs.

**When consuming Discover output,** expect `ecosystem-map.md` to contain a systems table with columns [Name, Confidence, Path, Signals] and a dependency section with system-to-system edges. If the format is unrecognizable, fall back to treating the file as a context document and extract system names manually.

### 0.3 Discover the Ecosystem

Trace actual API contracts, data flows, and consumer/provider relationships from starting points. Discovery works in two bands:

- **In-band:** Deep analysis of locally available codebases and docs (high confidence)
- **Off-band:** GitHub/GitLab searches for systems not found locally (lower confidence)

**Step 1: In-band -- Analyze integration surfaces in starting-point repos**

For each starting-point repo with local code access, use Task agents in parallel to extract:
- API clients and HTTP calls (reveals consumed systems)
- API contracts exposed (reveals consumers of this system)
- Service interfaces and SDKs (formalized dependencies)
- Config referencing external systems (env vars, endpoint URLs)
- Database and cache connections (shared data stores)
- Event/message contracts (async integration partners)
- Documented integration points (README, ADRs, docs/)
- Reverse Engineer docs if available (highest quality source)

**Step 2: In-band -- Locate discovered systems locally**

Search common development directories for newly discovered systems. Quote all paths in shell commands to handle spaces and special characters:

```bash
SEARCH_DIRS=(
  "$(dirname "$STARTING_REPO")"
  "$HOME/git"
  "$HOME/code"
  "$HOME/src"
  "$HOME/repos"
)
```

If found locally, repeat Step 1 on the new repo (recursive discovery). **MUST NOT exceed recursion depth of 2 hops** from user-provided starting points without user confirmation. In YOLO mode, stop at 2 hops and log: "Recursion depth limit reached. Proceeding with discovered systems."

**Step 3: In-band -- Analyze config data directories**

Parse config files (XML, YAML, JSON, properties) for service endpoints, data sources, feature flags, and override keys.

**Step 4: In-band -- Analyze context packs and existing docs**

Extract system names, API contracts, and data flow descriptions from context packs or reverse-engineering docs.

**Step 5: Off-band -- GitHub/GitLab search for unfound systems**

Search for repos matching discovered system names. Auto-clone for deeper analysis:
- **YOLO:** Auto-clone all discovered repos, re-run Step 1
- **Guided:** List repos and ask per-repo
- **Interactive:** Present each repo and ask before cloning

If cloning fails: (1) Mark the system as `[NO CODE ACCESS - clone failed: {error}]` in the state file. (2) Include the system in Phase 2 profiling using only consumer-side code references and off-band search results. (3) Mark the resulting profile as `[PARTIAL - no code access]`.

**Step 6: Build the ecosystem graph**

Merge all discovery results. Assign confidence per node:

| Level | Criteria |
|-------|----------|
| **CONFIRMED** | User-provided starting point, or user explicitly added |
| **HIGH** | In-band tracing from 2+ independent sources |
| **MEDIUM** | Single in-band source OR found locally after off-band hint |
| **LOW** | Off-band search only, no integration evidence |

### 0.4 Present Discovered Ecosystem

Present the ecosystem as a table of systems with confidence, local code, config, docs, and relationship columns. Include a Mermaid graph of integration edges.

In Guided/Interactive mode, offer: confirm, add systems, remove systems, add context, go deeper.

**In YOLO mode:** Auto-include CONFIRMED + HIGH, include MEDIUM with `[AUTO - review recommended]`, drop LOW. Skip confirmation.

### 0.5 Save State and Proceed

Save the confirmed system list to `.stackshift-state.json`. Update state at every subsequent phase boundary.

**Log:** "Phase 0 complete -- {N} systems confirmed, {M} integration edges discovered. Proceeding to Phase 1."

---

## Phase 1: INVENTORY

**Input:** System list from Phase 0
**Output:** `system-inventory.md`

1. Auto-detect metadata for systems with code access (tech stack, repo status, monorepo detection, description)
2. Import metadata from Discover output if available (confidence scores, dependency hints)
3. Enrich with user-provided notes from Phase 0
4. Classify system roles: Source of Truth, Consumer, Transformer, Orchestrator, Gateway
5. Generate `_integration-analysis/system-inventory.md`

In Guided/Interactive mode, present enriched inventory for confirmation.

**Log:** "Phase 1 complete -- system inventory generated for {N} systems. Proceeding to Phase 2."

Update state: `"phase": 1`.

---

## Phase 2: SYSTEM PROFILING

**Input:** Per-system code repos, config data, Reverse Engineer docs (optional)
**Output:** `system-profiles/{name}.md` (one per system)

Follow the detailed process in `operations/system-profiling.md`.

Use Task agents to profile multiple systems concurrently. For each system, extract: capabilities, API surface, data models, config structures, integration points, override/inheritance patterns, auth model, constraints, pain points.

**IMPORTANT:** If a Task agent fails or times out, mark that system's profile as `[FAILED - {reason}]` in the state file. Continue with available profiles. In Guided/Interactive mode, inform the user which profiles failed and offer to retry. In YOLO mode, proceed with available profiles and flag missing ones in all downstream artifacts.

**Before proceeding to Phase 3,** verify the quality checklist in `operations/system-profiling.md`. In YOLO mode, log any failures but proceed. In Guided/Interactive mode, inform the user.

**Log:** "Phase 2 complete -- {N}/{M} system profiles generated ({K} failed). Proceeding to Phase 3."

Update state: `"phase": 2`.

---

## Phase 3: CROSS-SYSTEM ANALYSIS

**Input:** All system profiles from Phase 2
**Output:** `capability-map.md`, `integration-contracts.md`, `data-architecture.md`

**IMPORTANT:** Run this phase in the main context. Do not delegate to subagents -- this phase requires synthesizing information from all profiles simultaneously.

Follow the detailed process in `operations/cross-system-mapping.md`. Generate three artifacts:
- `_integration-analysis/capability-map.md` -- capabilities mapped across system boundaries
- `_integration-analysis/integration-contracts.md` -- API surfaces, protocols, auth, schemas
- `_integration-analysis/data-architecture.md` -- shared entities, field mapping, conflicts, source of truth

**Before proceeding to Phase 4,** verify the quality checklist in `operations/cross-system-mapping.md`.

**Log:** "Phase 3 complete -- {N} capabilities mapped, {M} integration contracts documented, {K} shared entities analyzed. Proceeding to Phase 4."

Update state: `"phase": 3`.

---

## Phase 4: PAIN & FUNCTIONALITY TIERING

**Input:** Cross-system analysis + user/developer input
**Output:** `pain-registry.md`, `functionality-tiers.md`

Follow the detailed process in `operations/functionality-tiering.md` (Parts 1 and 2).

Assign each pain point a sequential identifier in the format `PAIN-NNN` (e.g., PAIN-001, PAIN-002) as defined in the operation file.

In Guided mode, present auto-assigned tiers and ask targeted questions about low-confidence assignments. In YOLO mode, auto-assign all tiers.

**Before proceeding to Phase 5,** verify the quality checklists for Pain Registry and Functionality Tiers in `operations/functionality-tiering.md`.

**Log:** "Phase 4 complete -- {N} pain points registered, {M} capabilities tiered (T1:{a} T2:{b} T3:{c} PRUNE:{d}). Proceeding to Phase 5."

Update state: `"phase": 4`.

---

## Phase 5: IMPLEMENTATION LAYERS

**Input:** Tiered capabilities + dependency matrix
**Output:** `implementation-layers.md`

Follow the detailed process in `operations/functionality-tiering.md` (Part 3).

Assemble tiered capabilities into layers: L0 Foundation, L1 Proof, L2 Production, L3 Complete. Include dependency analysis, coverage tracking, and critical path identification.

**Before proceeding to Phase 6,** verify the quality checklist for Implementation Layers in `operations/functionality-tiering.md`.

**Log:** "Phase 5 complete -- implementation layers defined (L0:{a} L1:{b} L2:{c} L3:{d} capabilities). Critical path identified. Proceeding to Phase 6."

Update state: `"phase": 5`.

---

## Phase 6: EPIC/STORY GENERATION (Optional)

**Input:** Implementation layers + system profiles + capability map
**Output:** `_integration-analysis/epics/` directory

Follow the detailed process in `operations/epic-generation.md`.

Generate technology-agnostic, dependency-ordered epics and stories from the layered plan. Each layer becomes one or more epics with cross-system-aware stories.

In Guided mode, ask before generating. In YOLO mode, auto-generate for all layers.

**Log:** "Phase 6 complete -- {N} epics, {M} stories generated across {K} layers. Proceeding to Phase 7."

Update state: `"phase": 6`.

---

## Phase 7: RECONCILIATION (Optional -- requires target project)

**Input:** Tech-agnostic epics from Phase 6 + target project's existing planning artifacts
**Output:** `_integration-analysis/reconciliation-report.md`, `_integration-analysis/open-questions.md`

Follow the detailed process in `operations/reconciliation.md`.

Compare integration analysis findings against the target project's existing plan. Surface gaps, conflicts, incorrect assumptions, over-planning, and sequencing issues.

**IMPORTANT:** If no target project path is provided (or the target has no planning artifacts), follow the greenfield path defined in `operations/reconciliation.md`.

**Log:** "Phase 7 complete -- {N} gaps found, {M} open questions generated ({K} critical). Proceeding to Phase 8."

Update state: `"phase": 7`.

---

## Phase 8: GO-FORWARD PLAN (Optional -- requires target project)

**Input:** Reconciliation answers + tech-agnostic epics + target project context
**Output:** `_integration-analysis/go-forward-plan/`

Follow the detailed process in `operations/go-forward-plan.md`.

Merge integration analysis findings, reconciliation decisions, and target project context into a complete, implementation-ready plan with epics and stories adapted to the target tech stack.

**Log:** "Phase 8 complete -- go-forward plan generated with {N} epics, {M} stories across {K} layers."

Update state: `"phase": 8`, `"status": "complete"`.

---

## Output Artifacts

All artifacts written to `_integration-analysis/` directory:

| # | File | Phase | Description |
|---|------|-------|-------------|
| 1 | `system-inventory.md` | 1 | Systems with metadata, ownership, locations, roles |
| 2 | `system-profiles/{name}.md` | 2 | Per-system: capabilities, APIs, data models, config, constraints, pain |
| 3 | `capability-map.md` | 3 | Capabilities mapped across systems |
| 4 | `integration-contracts.md` | 3 | API surfaces, data flows, protocol details |
| 5 | `data-architecture.md` | 3 | Shared entities, conflicts, source of truth |
| 6 | `pain-registry.md` | 4 | Pain points per system and at integration boundaries |
| 7 | `functionality-tiers.md` | 4 | T1/T2/T3/PRUNE per capability |
| 8 | `implementation-layers.md` | 5 | L0-L3 with dependency matrix and coverage |
| 9 | `epics/{layer}/*.md` | 6 | Tech-agnostic epics and stories |
| 10 | `epics/story-dependency-graph.md` | 6 | Story ordering across layers |
| 11 | `epics/coverage-matrix.md` | 6 | Capabilities to stories mapping |
| 12 | `reconciliation-report.md` | 7 | Plan vs. reality comparison |
| 13 | `open-questions.md` | 7 | Prioritized questions for the team |
| 14 | `go-forward-plan/plan-summary.md` | 8 | Executive summary with phasing and risks |
| 15 | `go-forward-plan/{layer}/*.md` | 8 | Implementation-ready epics in target tech stack |
| 16 | `go-forward-plan/delta-from-existing-plan.md` | 8 | What changed and why |

---

## State Management

**MUST save state at each phase boundary.** Updates `.stackshift-state.json` with:

```json
{
  "integration-analysis": {
    "status": "in_progress",
    "phase": 3,
    "mode": "guided",
    "systems_total": 8,
    "systems_profiled": 5,
    "artifacts_generated": ["system-inventory.md", "system-profiles/dvs.md"],
    "started_at": "2026-02-19T10:00:00Z",
    "last_updated": "2026-02-19T10:35:00Z"
  }
}
```

Phase values: `0` (kickoff), `1` (inventory), `2` (profiling), `3` (cross-system), `4` (tiering), `5` (layers), `6` (epics), `7` (reconciliation), `8` (go-forward), `complete`.

---

## Edge Cases

### Only 2 Systems
Capability map becomes a side-by-side comparison. Skip dependency matrix visualization. Still identify shared data models and contracts.

### System With No Code Access
Profile from available sources (API docs, config data, developer knowledge). Mark profile as `[PARTIAL - no code access]`. Include in cross-system analysis using consumer-side code.

### Extremely Large System Count (15+)
Batch Phase 2 profiling into groups of 5. Group capability map by domain. In YOLO mode, auto-focus on the 5 most interconnected systems first, then expand. In Guided/Interactive mode, suggest focusing.

### Conflicting Data Models
Document both representations in `data-architecture.md`. Flag with severity: BLOCKING, DEGRADING, COSMETIC. Recommend resolution strategy.

### Pre-existing Reverse Engineer Docs Are Stale
Check `.stackshift-docs-meta.json` for commit hash vs. current HEAD. If stale, warn user and suggest `/stackshift.refresh-docs` first. If refresh not possible, mark profile as `[STALE DOCS - generated at commit {hash}]`.

### Circular Dependencies Discovered
If `operations/cross-system-mapping.md` Step 5 detects circular dependencies, flag them in the dependency matrix with severity. In Guided/Interactive mode, present to user for resolution. In YOLO mode, log and continue.

---

## Technical Notes

- Use parallel Task agents for Phase 2 profiling (see `operations/system-profiling.md`)
- Prefer Reverse Engineer docs over re-analyzing code when available
- Config data (XML, YAML, JSON) is often the most reliable source for data model extraction
- **IMPORTANT:** Cross-system analysis (Phase 3) runs in main context, not subagents
- Mermaid diagrams should stay under 30 nodes for readability
- Pain points from developer input (Guided/Interactive mode) are often more valuable than auto-detected ones
- Implementation layers should each produce a verifiable milestone
