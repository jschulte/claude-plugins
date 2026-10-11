---
name: health-audit
description: Use when the user wants a scored health audit of a codebase or one area of it. Deep evidence-backed audit that scores architecture, maintainability, duplication, UX signals, performance, security, reliability, testing, consistency, documentation, technical debt, and strategic fitness; produces a bar-chart scorecard with a separate engineering grade and live-harm grade, and only flags problems it can prove.
---

# Health Audit Skill

Use this skill when the user wants a deep audit of a codebase's health, quality, maintainability, UX implications, architecture, duplication, testing, or long-term fitness. The skill may audit the whole system or focus on a user-specified area, workflow, module, or risk surface.

## Mission

Perform a rigorous, evidence-backed codebase health audit from multiple perspectives: engineering quality, architecture, maintainability, duplication/DRY, UX and product signals, performance, security, reliability, testing quality, consistency, documentation/DX, technical debt, and strategic product fitness.

Do not produce vague "best practices" fluff. Do not invent problems. Do not nitpick style unless it causes real confusion, defects, or maintenance cost.

### Focus Prompt Support

This skill can take an optional prompt that describes the area of the system to focus on.

Examples:
- "Focus on the billing pipeline"
- "Review auth/session management"
- "Audit the admin reporting flow"
- "Look at the sync worker and retry logic"
- "Review the checkout path from cart to payment confirmation"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete files, modules, routes, jobs, tests, and shared dependencies
- Audit out-of-scope code only when it is required to explain an in-scope finding
- Keep findings, scores, and recommendations scoped to that area instead of pretending to grade the entire repository
- State assumptions, included areas, and excluded areas explicitly in the output

If the prompt is ambiguous, infer the most likely scope from the repository structure and naming, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists
2. **The specific code or pattern** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world harm** — who is affected and how
4. **A second instance or a corroborating signal** (a reproduction, a failing test, a call path traced end to end) that confirms the problem is real. A one-off defect qualifies once you have reproduced or traced it; it does not need a twin

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical staff engineer would say "yeah, that's a real problem." |
| **Probable** | Strong signals but missing one criterion (e.g., not reproduced or traced end to end, or harm is inferred rather than proven). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call a problem. |
| **Question** | Something that looks off but needs human confirmation or domain context to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Active harm or imminent risk | Data loss, security vulnerability, broken user flows, silent failures in production |
| 🟠 **High** | Significant drag on quality or velocity | Patterns that measurably slow development, degrade UX, or will escalate if ignored |
| 🟡 **Medium** | Meaningful but contained | Real issues with workarounds, or debt that compounds slowly |
| 🔵 **Low** | Improvement opportunities | Legitimate enhancements that would raise the bar but aren't urgent |

### Scoring Discipline

Do **not** force a full-repository score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope
- Determine whether the user asked for a whole-system audit or a focused audit
- Translate any focus prompt into concrete modules, files, routes, workers, jobs, schemas, and tests
- Identify adjacent shared infrastructure that materially affects the in-scope area
- State what is explicitly in scope and what is out of scope
- If the requested area spans multiple layers, follow the full path instead of reviewing one layer in isolation

### Phase 1: Understand the System
- Determine what the product appears to do
- Identify major domains/modules
- Identify architectural patterns
- Infer critical user journeys where possible
- Find likely business-critical paths
- Map the requested focus area onto those domains and paths if the audit is scoped

### Phase 2: Scan for Evidence
- Repeated patterns and duplication
- Hotspots (high complexity + high coupling)
- Inconsistency across equivalent concerns
- Unnecessary complexity
- Likely UX friction implied by code
- Missing tests in risky areas
- Hidden coupling and dependency issues

### Phase 3: Validate Before Accusing
For each potential finding, ask:
- Is this real?
- What proves it?
- Is it recurring?
- Does it materially matter?
- Could there be a legitimate reason?
- Is there enough evidence to present?

### Phase 4: Synthesize
- Group issues into systemic themes
- Identify what matters most
- Separate quick wins from structural problems
- Cross-reference findings across categories to surface root causes
- Keep conclusions scoped to the reviewed area unless the evidence truly supports a repo-wide claim

---

## Analysis Categories

Analyze the codebase through each category independently. A single code problem may be discussed under several categories when its impact crosses them, but for scoring it is charged to exactly one: its root-cause category (see Scoring).

---

### 1. Architecture & System Design

Evaluate the structural health and coherence of the system design:

- **Dependency direction violations**: Does lower-level code import from higher-level modules? Are there circular dependencies? Do utility layers depend on application layers?
- **Abstraction leaks**: Implementation details bleeding across module boundaries. Database schemas exposed to UI layers. Third-party API specifics scattered across business logic instead of wrapped in adapters.
- **God modules/files**: Files or classes that have accumulated too many responsibilities. Use line count, import count, and export count as signals — but confirm with a qualitative read.
- **Orphaned architecture**: Patterns that were started but never completed. Migration leftovers where old and new approaches coexist without a clear path to convergence.
- **Missing boundaries**: Code that should be separated (business logic in UI components, data access in controllers) but isn't. Look for boundaries that *should* exist based on what the code does, not just what folders it's in.
- **Inconsistent patterns**: The same category of problem solved multiple different ways across the codebase without an obvious evolution path.
- **Domain modeling**: Quality of the domain abstractions, cohesion of concepts, and scalability of the structure.

**Evidence bar**: Produce a dependency map or call chain for problematic areas. Show concrete imports/exports. Explain the architectural principle being violated and why it matters for this specific codebase.

---

### 2. Maintainability & Readability

Think like a new hire on day two. What would make you slow, confused, or afraid to ship?

- **Naming confusion**: Variables, functions, files, or folders whose names mislead about their purpose. Components named after implementation details instead of what they do. Inconsistent abbreviations or acronyms.
- **Function/file complexity**: Deeply nested conditionals, long functions, files that do too many things. Cognitive load that forces the reader to hold too much state in their head.
- **Hidden behavior**: Side effects buried in getters, constructors that do I/O, functions whose names don't reveal their full scope of action.
- **Onboarding friction**: Missing or misleading README, undocumented setup steps, hidden prerequisites, environment configuration that requires tribal knowledge.
- **Surprising logic**: Code whose behavior deviates from what a reader would expect based on its naming, location, or surrounding patterns.

**Evidence bar**: For naming issues, show the name, what it actually does, and why the gap is harmful. For complexity, identify the specific functions/files and quantify (line count, nesting depth, branch count). For onboarding, walk through the actual setup process.

---

### 3. DRY / Reuse / Duplication

Pay special attention here. Go beyond textual similarity:

- **Copy-paste code**: Near-identical functions, components, or modules that differ only in small details. Show side-by-side comparisons.
- **Reimplemented utilities**: Multiple hand-rolled versions of the same logic (date formatting, validation, string manipulation, API response shaping) instead of a shared utility.
- **Repeated business logic**: Validators, transformations, serializers, mappers, form state logic, or loading/error/empty-state handling duplicated across modules.
- **Parallel hierarchies**: Component trees, route definitions, API handlers, or type definitions that mirror each other structurally — indicating a missing abstraction.
- **Configuration duplication**: Magic numbers, URLs, thresholds, feature flags, or business rules defined in multiple places with no single source of truth.
- **Schema/type drift**: Identical or near-identical data shapes defined separately that should share a definition. Near-duplicate code that has drifted over time.

**Evidence bar**: Show at minimum two concrete instances side by side. Calculate an approximate duplication percentage where possible. Explain what a consolidated version would look like and what risk the current duplication introduces (e.g., "if the rule in `orderValidator.ts:45` changes, the identical rule in `cartValidator.ts:112` will silently diverge").

---

### 4. Product & User Experience Signals

Think like a user, not a developer. Read the code and ask: *"What does this actually feel like to use?"*

- **Silent failures**: API calls, form submissions, or data operations that swallow errors or fail without meaningful user feedback. Trace the error path — does the user ever find out something went wrong?
- **Missing loading/empty/error states**: Components that render nothing, show broken layouts, or flash incorrect content during async operations. Races between loading states and data arrival.
- **Accessibility gaps**: Missing ARIA attributes, keyboard navigation traps, missing focus management, color-only indicators, images without alt text, form inputs without labels. Be specific.
- **Performance footguns visible to users**: Unbounded list renders, missing pagination, waterfall API calls, unoptimized images, render-blocking operations. Focus on things users would *feel*.
- **Inconsistent interaction patterns**: The same user action handled differently across the app — different confirmation flows, feedback patterns, error handling.
- **Dead features**: UI elements, routes, or settings wired up in the interface but leading to broken, incomplete, or no-op functionality.
- **Brittle forms**: Confusing flows, inconsistent validation or messages, poor error recovery.

**Evidence bar**: Trace the user's journey through the code. Show the specific component/handler, what the user sees (or doesn't see), and why it's a problem. Reference actual UI text or user-facing strings from the code where possible.

---

### 5. Performance & Efficiency

- **Wasteful rendering**: Unnecessary re-renders, missing memoization on expensive computations, components re-rendering when their inputs haven't changed.
- **Avoidable recomputation**: Derived values recalculated on every call instead of cached. Missing memoization where it matters.
- **Redundant network work**: Duplicate API calls, missing request deduplication, waterfall requests that could be parallelized.
- **N+1 patterns**: Database or API queries inside loops. Data fetching patterns that scale linearly with data size when they shouldn't.
- **Poor caching**: Missing caching on expensive operations, or caching without invalidation strategy.
- **Inefficient queries**: Full table scans, missing indexes (inferred from query patterns), over-fetching data.
- **Bad async/concurrency patterns**: Blocking operations on main threads, uncontrolled parallelism, missing backpressure.

**Evidence bar**: Show the specific code path, explain the performance characteristic, and describe the user-visible or system-visible impact. Quantify where possible (e.g., "this fetches all N records when only the first page is displayed").

---

### 6. Security & Safety

Think like an attacker with access to the source code:

- **Input trust boundaries**: User input flowing into SQL queries, shell commands, file paths, HTML rendering, or deserialization without sanitization. Trace the data flow from entry to use.
- **Authentication/authorization gaps**: Endpoints or operations missing auth checks. Privilege escalation paths. Admin functionality accessible without proper role verification.
- **Secrets management**: API keys, tokens, passwords, or connection strings in source code, config files, environment defaults, or logged output.
- **Dependency risk**: Dependencies with known CVEs. Unpinned versions. Dependencies from untrusted or deprecated sources.
- **Overly permissive defaults**: CORS allowing all origins. Excessive file permissions. Debug modes enabled by default. Admin interfaces exposed without network restrictions.
- **Injection or data exposure risk**: Any path where untrusted data can influence execution or leak sensitive information.

**Evidence bar**: Show the vulnerable code, the attack vector, and the potential impact. For dependency issues, cite specific CVE IDs or advisory links where applicable.

---

### 7. Reliability & Resilience

Think like an SRE who gets paged at 3 AM. What breaks, and will anyone know?

- **Unhandled failure paths**: API calls without error handling, database operations without transaction safety, file operations without cleanup, external service calls without timeouts or retries.
- **Observability gaps**: Critical operations with no logging. Error handlers that swallow context. Missing correlation IDs. Inconsistent log levels.
- **Race conditions & timing assumptions**: Shared mutable state without synchronization. Operations that assume ordering without guarantees. Cache invalidation that can leave stale data.
- **Configuration fragility**: Hardcoded values that should be environment-driven. Missing validation on startup configuration.
- **Cascade risk**: Single points of failure. Missing circuit breakers, bulkheads, or graceful degradation paths.
- **Data integrity risks**: Missing database constraints that code relies on. Validation only at the UI layer. Operations that can leave data inconsistent if interrupted.
- **Null/undefined hazards**: Paths where null or undefined values can propagate and cause failures far from their origin.

**Evidence bar**: Show the specific code path, explain the failure scenario, and describe the blast radius. "What breaks, how does it manifest, and who notices?"

---

### 8. Testing & Verification

Not "test coverage percentage" — focus on confidence in critical paths:

- **Missing tests on high-risk code**: Identify the specific code paths most dangerous to change (payment flows, auth logic, data mutations, complex state machines) and check if those are tested.
- **Weak assertions**: Tests that run code but don't meaningfully verify outcomes. Tests that assert on implementation details instead of behavior.
- **Brittle tests**: Tests coupled to implementation details, snapshot tests that get blindly updated, tests that break from unrelated changes.
- **Low confidence around risky logic**: Complex business rules or state transitions with no test coverage.
- **False comfort from shallow tests**: High line coverage but low branch/path coverage. Tests that pass even when the code is broken.

**Evidence bar**: Name the critical path and show the absence of tests, or show the test and explain why its assertions are insufficient. Don't just count test files — evaluate whether the tests actually protect against regression.

---

### 9. Consistency & Standards

Evaluate whether the codebase reads like it was written by one team or twenty strangers:

- **Style fragmentation**: Mixed formatting, naming conventions, or structural patterns that suggest absent or unenforced standards. Check if a linter/formatter is configured and whether the code conforms.
- **API design inconsistency**: REST endpoints, function signatures, return types, or error shapes that follow different conventions across the codebase.
- **Multiple ways of doing the same thing**: Data fetching, state management, routing, or error handling solved differently in different places without an obvious evolution path.
- **Import/export discipline**: Mixed import styles, inconsistent barrel files, re-exports that obscure the actual source.
- **Type safety gaps**: `any` usage, disabled strict checks, runtime type assertions that bypass compile-time safety.
- **Comment quality spectrum**: Excessive obvious comments alongside complex uncommented logic. Stale comments that contradict the code.

**Evidence bar**: Show concrete examples of the inconsistency — side by side where possible. Quantify where you can (e.g., "37 instances of `any` across 12 files, concentrated in the `/api` layer").

---

### 10. Documentation & Developer Experience

- **Setup clarity**: Can a new developer get running from the README alone? Flag missing steps, undocumented prerequisites, outdated instructions.
- **Discoverability**: Can someone find what they need? Are modules, utilities, and patterns discoverable from the file structure?
- **Undocumented assumptions**: Implicit requirements, magic values, or environmental dependencies that aren't explained anywhere.
- **Unclear contracts**: Module interfaces, API boundaries, or data shapes whose expected behavior must be reverse-engineered from implementation.
- **Build/tooling pain**: Slow builds, flaky CI, overly complex build configurations, outdated tooling that blocks upgrades.
- **Dead code & broken windows**: Commented-out code blocks, unused imports, unreachable branches, TODO/FIXME/HACK comments older than 6 months, disabled tests.

**Evidence bar**: For setup issues, walk through the actual process and flag where you'd get stuck. For dead code, quantify it. For tooling, check if the tooling matches the team's stated technology direction.

---

### 11. Technical Debt & Change Risk

- **Blast-radius hotspots**: Files that combine high complexity with high coupling — the most dangerous to change. Identify these explicitly.
- **Legacy chokepoints**: Old patterns or outdated approaches that block adoption of newer, better patterns.
- **Overgrown modules**: Modules that have accumulated responsibilities beyond their original scope and now resist decomposition.
- **Abstractions increasing cost**: Abstractions that add complexity without delivering proportional value. Indirection that makes the code harder to understand without meaningful flexibility benefit.
- **Fragility that slows change**: Areas where small changes have unpredictable ripple effects due to hidden coupling.
- **Dependency tree health**: Total dependency count, depth of transitive dependencies, outdated dependencies, unmaintained dependencies.

**Evidence bar**: Use actual counts and measurements from the codebase. Show the data, not just the conclusions. Rank by impact. For coupling metrics, show which modules have the most inbound/outbound dependencies.

---

### 12. Strategic Product Fitness

- **Ability to evolve safely**: Can the codebase accommodate likely next features without major restructuring?
- **Feature velocity support or drag**: Does the architecture accelerate or impede shipping new features?
- **Structure vs. roadmap mismatch**: Is the codebase organized in a way that aligns with how the product is likely to grow?
- **Implementation quality vs. product ambition**: Does the quality of the code match the aspirations of the product?

**Evidence bar**: This category draws on patterns found in other categories. Cross-reference architectural issues, tech debt, and coupling metrics to assess strategic fitness. Be explicit about what structural changes would be needed for likely evolution paths.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The 12-category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much are users, the business, or the law being hurt right now? | Verified Critical/High findings with user-facing harm, counted per instance |

A well-built area with four live bugs is "Engineering B, Live harm D". An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like |
|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. |
| C | 6.0–7.4 | Sound, typical production code. It works, carries ordinary debt and a steady trickle of bugs. |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or users regularly hit live ones. |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. |

C is the grade for typical working code, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production code, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production code with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (a single-writer invariant, a real-database suite on the risky path, a guard that makes a defect class impossible, a boundary with measured low coupling). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is a DRY pattern even when the bug shows up as a UX or reliability failure; an untested seam that let a regression ship is a Testing pattern.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (drift-between-copies, High) − 0.5 (god files, Medium) = 7.0`.

Every category a slice actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories).

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is user-facing and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
2. Divide by **units** = in-scope source lines (tests excluded) / 50,000, minimum 1.
3. Map the result:

| Critical/High per unit | Score | Grade |
|---|---|---|
| 0 | 9.5 | A |
| up to 1 | 8.0 | B |
| up to 2.5 | 6.5 | C |
| up to 5 | 5.0 | D |
| over 5 | 3.0 | F |

State the count, the units and the result: `(1 Critical × 3 + 13 High) / 3.8 units = 4.2 per unit → D`. The count is a lower bound set by audit depth; say how deep the audit went.

### Calibration check before finalizing

- If the Strengths section names a reference-quality mechanism, its category cannot score below 7.0 unless a Critical pattern is charged to it; say which.
- A category below 6.0 needs at least one Verified High or Critical pattern charged to it.
- Medium and Low volume never moves a letter by itself. Their count grows with audit effort, not with how bad the code is.
- Read the two grades back against the anchors table. If a staff engineer who knows the area would say "that is not what it is like", fix the scores, not the anchors.

### Weights

| Category | Weight |
|----------|--------|
| Architecture & System Design | 12% |
| Maintainability & Readability | 10% |
| DRY / Reuse / Duplication | 10% |
| Product & User Experience Signals | 10% |
| Performance & Efficiency | 8% |
| Security & Safety | 10% |
| Reliability & Resilience | 10% |
| Testing & Verification | 10% |
| Consistency & Standards | 7% |
| Documentation & Developer Experience | 5% |
| Technical Debt & Change Risk | 5% |
| Strategic Product Fitness | 3% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality (a solid core and leaky admin screens, say), add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the send engine is excellent, the settings pages are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row, one row per category, then both grades as the final two rows:

```
Architecture & System Design   7.8 | ████████████████░░░░
Maintainability & Readability  6.9 | ██████████████░░░░░░
...
Engineering (weighted)         7.1 | ██████████████░░░░░░
Live harm                      5.0 | ██████████░░░░░░░░░░
```

Use █ for filled and ░ for empty.

---

## Finding Template

Each finding must follow this structure:

```
#### [SEVERITY EMOJI] [Finding Title]

**Category**: [Root-cause category, the one this finding is charged to]
**Severity**: [Critical / High / Medium / Low]
**Confidence**: [Verified / Probable / Observation / Question]
**Harm**: [User-facing: live | reachable today | not yet reachable] or [Engineering drag]
**Pattern**: [Name of the root-cause pattern this instance belongs to, if any]
**Location**: [File paths and line numbers]

**Evidence**:
[Code snippets, side-by-side comparisons, data flow traces, or metric data
that PROVE this is a real issue. This is the most important section.]

**Impact**:
[Who is affected and how. Be specific — "users experience..." or "developers
must..." or "in production, this causes..."]

**Recommendation**:
[Concrete, actionable fix. Not "consider improving" — instead, "extract a
shared `validateAddress()` utility into `src/utils/validation.ts` that both
`OrderForm` and `CheckoutForm` consume."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```
# Codebase Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".
Then 2-3 paragraphs in plain language for a non-technical stakeholder: what is
well built, what is hurting users now, what leadership should understand.]

## 2. Scope & Method
[What was requested, what was actually reviewed, which files/modules/flows were
inspected deeply vs broadly, what was explicitly out of scope, and what could
not be verified.]

## 3. Scorecard
[Score table with each category's arithmetic and justification, the
Engineering score, the Live-harm count and score, and the sub-area breakdown
when the scope has parts of different quality]

## 4. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 5. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 6. Duplication / DRY Deep Dive
[The duplication picture as a whole: what is copied, where copies have drifted,
what a consolidated version looks like. Cross-reference section 5 findings by
title; do not repeat their evidence.]

## 7. UX & Product Health Signals
[What using the product feels like, journey by journey. Cross-reference
section 5 findings by title; do not repeat their evidence.]

## 8. Testing Confidence Assessment
[What's tested, what isn't, and where the risk lies]

## 9. Prioritized Action Plan
[Top 10 actions ordered by (severity × effort efficiency). For each:
- What to do (one sentence)
- Why it matters most right now (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 10. Strengths & Bright Spots
[Mandatory. What the codebase does well. Good patterns, thoughtful abstractions,
solid test coverage in specific areas, clean module boundaries.]

## 11. What Was Not Flagged
[Issues considered but rejected for insufficient evidence.
Transparency about what you chose not to report and why.]

## 12. Appendix: Evidence Notes
[Supporting data, file lists, metric summaries]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary
that names what is strong and what hurts]
```

For focused audits, make the scope visible near the top of the report and mark unrelated categories as `N/A` rather than pretending they were evaluated.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report issues you can't point to in the actual code
- ❌ Flag stylistic preferences as problems unless there's genuine inconsistency causing confusion
- ❌ Recommend rewrites when incremental fixes would work
- ❌ Assume a framework or library choice is "wrong" without evidence of harm
- ❌ Pad the report with low-value findings to appear thorough
- ❌ Ignore context — a startup prototype and a banking platform have different standards
- ❌ Let a narrow focus prompt silently expand into a fake whole-repo audit
- ❌ Score a category as low without multiple proven findings to justify it
- ❌ Present findings that are actually just "I would have done it differently"

DO:
- ✅ Quantify everything you can (counts, percentages, file sizes, duplication ratios)
- ✅ Show your work — the reader should be able to verify every finding independently
- ✅ Consider the codebase's apparent stage and purpose when calibrating severity
- ✅ Distinguish between "this is wrong" and "this will become wrong at scale"
- ✅ Cross-reference findings across categories to identify systemic patterns
- ✅ **Escalate to `/arch-audit`**: When you discover a systemic pattern (e.g., "several queries missing soft-delete filters"), note it prominently and recommend `/arch-audit` focused on that pattern. This audit evaluates quality; `/arch-audit` exhaustively checks every instance. The typical workflow: `/health-audit` diagnoses → `/arch-audit` enumerates → fix.
- ✅ Call out when something is fine — silence on a category implies you didn't check it
- ✅ Explicitly call out healthy areas
- ✅ Prefer actionable insight over generic advice
- ✅ Think like a maintainer, a user, and a product owner
- ✅ If the repository is large, state what was examined deeply vs broadly
- ✅ State the requested focus area, included scope, and excluded scope plainly
- ✅ If evidence is insufficient, say so plainly
