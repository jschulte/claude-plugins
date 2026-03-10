---
name: logic-extract
description: Traces a specific business logic flow across multiple repositories from user-provided starting points. Explores only prompt-relevant code, discovers repos the user missed, traces the algorithm end-to-end, and produces tech-agnostic BMAD specs with reference IDs (BR/DC/EC/ERR/FLOW).
allowed-tools: Read, Write, Glob, Grep, Bash, Agent
---

# Logic Extract

Trace a specific business logic flow across repos. Produce tech-agnostic specs.

**Estimated Time:** 20-60 minutes (depending on system count, mode, and complexity)
**Prerequisites:** At least one starting-point repo or file path
**Output:** 6 artifacts in `_logic-extract/` (see `operations/output-templates.md`)

---

## When to Use

- Trace a **specific** piece of business logic across multiple repos
- Understand an algorithm end-to-end (entry point to final output)
- Produce tech-agnostic specs for a particular flow (not an entire system)
- Migrate a specific feature and capture every edge case
- Unify logic scattered across services into one picture
- Generate BMAD-format epics scoped to a single capability

**When NOT to use:**
- Entire codebase analysis: use `/stackshift.reverse-engineer`
- All integration points between systems: use `/stackshift.integration-analysis`
- All business logic from one repo: use `/stackshift.portable-extract`
- Repo discovery only: use `/stackshift.discover`

---

## Three Modes

### YOLO (Fully Automatic)
**Time:** ~20-30 min | **User input:** None after kickoff

Auto-explores, auto-clones (max 2 hops), auto-traces. Marks uncertain items with `[AUTO - review recommended]`. Generates all 6 artifacts in one shot. After each phase, output a progress line: `Phase N complete -- {summary}. Proceeding to Phase N+1.`

### Guided (Recommended)
**Time:** ~30-45 min | **User input:** 3-7 targeted questions

Auto-explores high-confidence paths. Pauses for ambiguous branches, discovered repos, business rule interpretation, and edge case handling.

### Interactive
**Time:** ~45-60 min | **User input:** Full walkthrough

Review and approval at each phase boundary. Presents per-repo findings, discovered repos, and traced algorithm steps for confirmation.

---

## Process

### Phase 0: KICKOFF

#### 0.1 Collect Extraction Prompt

Ask the user what logic to trace:

```
What business logic should I trace?

Describe the flow, algorithm, or behavior you want to extract.
Be as specific or broad as you like -- I'll figure out the scope from the code.

Examples:
  "How does dealer config inheritance work across DVS and CMS?"
  "Trace the payment calculation from user input to final amount"
  "How does inventory availability get determined and displayed?"
```

If the prompt is too broad to filter code exploration (e.g., "everything" or "all the logic"), ask the user to narrow scope before proceeding.

Save the extraction prompt. This guides ALL exploration.

#### 0.2 Collect Starting Points

```
Where should I start looking?

Give me repos, directories, or files where this logic lives (or might live).

Examples:
  ~/git/dvs-services-aws                    (repo)
  ~/git/cms-web/src/services/config/        (directory)
  ~/git/payment-service/src/Calculator.java  (specific file)
  "DVS, CMS Web"                            (system names)
```

Accept repos, directories, files, or system names. If zero starting points are provided, ask for at least one before proceeding.

#### 0.3 Mode Selection

```
How should I run the extraction?

A) YOLO -- Fully automatic, no questions after setup (~20-30 min)
B) Guided -- Auto-extract + 3-7 targeted questions (recommended) (~30-45 min)
C) Interactive -- Full walkthrough with review at each phase (~45-60 min)
```

#### 0.4 Validate Starting Points

For each starting point:
- Verify the path exists on disk.
- For system names without paths: search `~/git/`, `~/code/`, `~/repos/`, sibling directories.
- If not found locally, note for remote search in Phase 2.

Report missing paths and ask the user to correct.

#### 0.5 Check for Existing State

Read `.stackshift-state.json`. If a `logic-extract` entry exists with `status: "in_progress"`:
- **Less than 24 hours old:** Ask the user: "A previous extraction is in progress (Phase {N}, started {time}). Resume or restart?"
- **Older than 24 hours:** Ask the user: "A previous extraction appears abandoned (started {time}). Clear and restart?"

On restart or fresh start, write initial state:

```json
{
  "logic-extract": {
    "status": "in_progress",
    "phase": 0,
    "mode": "guided",
    "extraction_prompt": "How does dealer config inheritance work?",
    "starting_points": [
      { "path": "~/git/dvs-services-aws", "type": "repo", "exists": true }
    ],
    "discovered_repos": [],
    "started_at": "2026-02-23T10:00:00Z",
    "last_updated": "2026-02-23T10:00:00Z"
  }
}
```

Log: `Phase 0 complete -- collected prompt, {N} starting points, mode: {mode}. Proceeding to Phase 1.`

---

### Phase 1: TARGETED RECON

**Input:** Extraction prompt + starting points from Phase 0
**Output:** Per-repo summaries of prompt-relevant findings

Explore ONLY parts of each repo relevant to the extraction prompt. This is NOT exhaustive analysis.

**Dispatch:** Launch parallel Task agents (`stackshift:stackshift-code-analyzer:AGENT`) for each starting point. Wait for all agents to complete before proceeding to Phase 2. Aggregate per-repo summaries into a single findings document.

**Error recovery:** If a Task agent fails or times out, log the failure and continue with remaining agents. If fewer than half of starting points produce results, warn the user before proceeding. See `operations/edge-cases.md` for details.

| What to Find | Guided By | Output |
|--------------|-----------|--------|
| Entry points | Functions/classes/routes matching prompt keywords | Where the logic begins |
| Data models | Types, schemas, entities touched by the logic | What data flows through |
| Business rules | Validations, calculations, decision branches | The core logic |
| Config lookups | Config reads, environment checks, feature flags | What configures behavior |
| API calls | HTTP clients, service calls, event publishing | Where logic crosses boundaries |
| Error handling | Try/catch, error responses, fallback paths | What can go wrong |

**Per-repo summary format:**

```markdown
## [Repo Name] -- Targeted Recon

**Relevant to prompt:** YES / PARTIAL / TANGENTIAL

### Entry Points Found
- `src/services/config/ConfigService.java:getConfig()` -- main config retrieval

### Business Logic Found
- 6-level override hierarchy: national > regional > group > dealer > site > page

### Outbound References (discovery targets)
- Calls `ADD` service for dealer metadata
```

Update state: `phase: 1`. Log: `Phase 1 complete -- recon on {N} repos, found {M} outbound references. Proceeding to Phase 2.`

---

### Phase 2: DISCOVERY & EXPANSION

**Input:** Phase 1 outbound references
**Output:** Expanded repo set

#### 2.1 Identify Discovery Targets

From each Phase 1 summary, extract API endpoints called, service client imports, config references to external systems, event topics published/consumed, and shared data stores.

#### 2.2 Locate Discovered Repos

For each discovery target:

1. Search locally: sibling directories, `~/git/`, `~/code/`, `~/repos/`.
2. Search GitHub if not found locally: auto-detect org from starting-point repos' git remotes, then `gh api search/repositories -f q="org:{org} {system-name}"`.
3. Clone if found remotely:
   - **YOLO:** Clone automatically. On clone failure, mark as `[CLONE FAILED]` and trace from consumer-side only.
   - **Guided:** List discovered repos and ask: "Include these? (Y/n per repo)". On clone failure, report and ask whether to skip or retry.
   - **Interactive:** Present each and ask before cloning.

**Max depth:** 2 hops from starting points.

#### 2.3 Re-run Targeted Recon on New Repos

For each newly added repo, run Phase 1 targeted recon (focused on the extraction prompt).

#### 2.4 Present Confirmed Repo Set

```
Starting from {N} starting points, I traced references and found {M} total repos:

| # | Repo | Relevance | Key Findings |
|---|------|-----------|-------------|
| 1 | dvs-services-aws | PRIMARY | Config hierarchy, override logic |
| 2 | cms-web | PRIMARY | Config consumer |

Does this set look right?
A) Looks good -- proceed with deep trace
B) Add repos -- I'm missing some
C) Remove repos -- some aren't relevant
```

**YOLO mode:** Auto-include PRIMARY + SUPPORTING, skip confirmation.

Update state: `phase: 2`. Log: `Phase 2 complete -- {M} repos confirmed. Proceeding to Phase 3.`

---

### Phase 3: DEEP TRACE

**Input:** Confirmed repo set + Phase 1 findings
**Output:** `flow-trace.md`

Execute Phase 3 in main context, not subagents. This is the most context-intensive phase.

#### 3.1 Identify the Entry Point

From Phase 1 findings, identify where the logic begins: user action, system trigger, or API call.

#### 3.2 Follow the Data

From the entry point, follow the data through every trace step. For each trace step document:
- **What happens** -- transformation, validation, decision, lookup, mutation
- **What data enters** -- input shape
- **What data exits** -- output shape
- **What can go wrong** -- error paths, edge cases, fallbacks
- **What configures it** -- config values, feature flags, environment variables
- **Where it crosses boundaries** -- API calls, event publishing, DB writes

#### 3.3 Trace Across Repo Boundaries

When the logic crosses from one repo to another:
- Document the contract at the boundary (request/response shapes).
- Pick up the trace in the receiving repo.
- Note any data transformation at the boundary.

#### 3.4 Generate Mermaid Diagram

Create a sequence or flow diagram showing data movement across systems. Use a maximum of 20 participants. If the flow involves more systems, group related systems into composite participants.

#### 3.5 Document Decision Points

For every branch: what condition is evaluated, all possible outcomes, common vs. edge case paths, implicit defaults.

#### 3.6 Write `flow-trace.md`

See `operations/output-templates.md` for the template. Use "Trace Step" numbering (not "Step") to avoid ambiguity with phase sub-steps.

**Mode behavior:**
- **YOLO:** Execute all sub-steps automatically. Mark uncertain trace steps with `[AUTO]`.
- **Guided:** Pause after 3.6 for flow trace review before Phase 4.
- **Interactive:** Present each trace step for review.

#### 3.7 Validation Checkpoint

Before proceeding to Phase 4, verify the flow trace:
1. Every entry point reaches a terminal state.
2. No gaps in the trace (each trace step's output connects to the next trace step's input).
3. The Mermaid diagram matches the traced steps.

If any check fails, fix the trace before proceeding. In Guided/Interactive modes, present the flow trace for user review.

Update state: `phase: 3`, add `flow-trace.md` to `artifacts_generated`. Log: `Phase 3 complete -- traced {N} steps across {M} systems. Proceeding to Phase 4.`

---

### Phase 4: SPECIFICATION

**Input:** Flow trace from Phase 3
**Output:** `business-rules.md`, `data-contracts.md`, `component-spec.md`

Synthesize the traced algorithm into tech-agnostic specs with reference IDs. See `operations/output-templates.md` for ID patterns and format specifications.

#### 4.1 Extract Business Rules (BR-*)

Extract calculations (BR-CALC-*), validations (BR-VAL-*), decisions (BR-DEC-*), and state transitions (BR-STATE-*). Strip all tech-specific references. Config lookups that affect the logic ARE business rules (BR-DEC-*).

#### 4.2 Extract Data Contracts (DC-*)

Extract inputs (DC-IN-*), outputs (DC-OUT-*), state (DC-STATE-*), and cross-system contracts (DC-XSYS-*). Cross-system boundary contracts are the most important -- get these right.

#### 4.3 Extract Edge Cases (EC-*) and Error States (ERR-*)

From the flow trace's error paths and decision points, catalog all edge cases and error states.

#### 4.4 Extract Interaction Flows (FLOW-*)

High-level flow patterns from the sequence diagram. Reference trace steps by number.

#### 4.5 Abstract Personas

Replace tech-specific actors: user types become `[User]`, admins become `[Admin]`, services become `[System]`.

#### 4.6 Write Specification Artifacts

Write `business-rules.md`, `data-contracts.md`, and `component-spec.md` (unified spec with cross-references).

**Mode behavior:**
- **YOLO:** Execute automatically. Mark ambiguous classifications with `[AUTO - review recommended]`.
- **Guided:** Pause after 4.6 for business rule classification review.
- **Interactive:** Review at each sub-step boundary.

Update state: `phase: 4`, add artifacts to `artifacts_generated`. Log: `Phase 4 complete -- {N} business rules, {M} data contracts, {P} edge cases. Proceeding to Phase 5.`

---

### Phase 5: EPIC GENERATION

**Input:** Specification artifacts from Phase 4
**Output:** `epics.md`

#### 5.1 Group by Data-Flow Dependency

Order epics so upstream capabilities come first: data providers before consumers, shared types before services, core logic before edge cases.

#### 5.2 Generate BMAD-Format Epics

Each epic maps to a logical chunk of the traced flow. See `operations/output-templates.md` for the epic/story template and YAML frontmatter format.

#### 5.3 Cross-Reference Everything

Every story references BR-*, DC-*, EC-*/ERR-*, FLOW-* IDs and depends-on links to other stories.

#### 5.4 Write `epics.md`

**Mode behavior:**
- **YOLO:** Generate automatically.
- **Guided:** Present epic structure for review before writing.
- **Interactive:** Collaborate on epic grouping and story definitions.

#### 5.5 Finalize State

Update `.stackshift-state.json`:
- Set `status: "complete"`, `phase: "complete"`.
- Record all `artifacts_generated`.
- Set `completed_at` timestamp.

On failure at any phase, set `status: "failed"` with an `error` field describing the failure and the phase where it occurred.

Log: `Phase 5 complete -- generated {N} epics with {M} stories. All 6 artifacts written to _logic-extract/.`

---

## State Management

Update `.stackshift-state.json` after each phase completes:

```json
{
  "logic-extract": {
    "status": "in_progress",
    "phase": 3,
    "mode": "guided",
    "extraction_prompt": "How does dealer config inheritance work?",
    "repos_confirmed": 4,
    "artifacts_generated": ["extraction-manifest.md", "flow-trace.md"],
    "started_at": "2026-02-23T10:00:00Z",
    "last_updated": "2026-02-23T10:25:00Z"
  }
}
```

**Status values:** `in_progress`, `complete`, `failed`.
**Phase values:** `0` (kickoff), `1` (recon), `2` (discovery), `3` (trace), `4` (spec), `5` (epics), `complete`.

---

## Edge Cases

See `operations/edge-cases.md` for handling of: single repo, 10+ repos, dead ends, circular references, no code access, clone failures, subagent failures, empty prompts, no starting points, no relevant code found, and stale state files.

---

## Integration

See `operations/integration.md` for pipeline position, upstream/downstream contracts, and success criteria.

**Key note:** The `portable-transplant` skill reads from `_portable-extract/`, not `_logic-extract/`. To feed output into portable-transplant, copy `component-spec.md` and `epics.md` to `_portable-extract/`.

---

## Technical Notes

- The extraction prompt is the filter for everything. Read it before exploring any file.
- Follow the data, not the call stack. What matters is what transforms and where.
- For repos with existing Reverse Engineer docs, prefer reading those over re-analyzing code.
- Cross-system boundary contracts (DC-XSYS-*) are the most important data contracts.
