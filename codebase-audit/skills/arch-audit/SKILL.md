---
name: arch-audit
description: Use when the user wants every violation of a codebase convention found, not a sample. Exhaustive architectural invariant sweep — discovers established codebase patterns, defines what "correct" looks like, then mechanically checks EVERY instance and surfaces violations. Unlike sampling-based audits, this finds the 300 bugs that code reviews miss.
---

# Architectural Invariant Audit

You are performing an **exhaustive architectural invariant sweep**. This is fundamentally different from a code review or health audit:

- A **code review** asks "does this look right?" (subjective, sample-based)
- A **health audit** asks "how healthy is this?" (evidence-backed, scored)
- An **arch-audit** asks "where are the established patterns violated?" (exhaustive, mechanical, objective)

Your job: discover what conventions this codebase has established, define what "correct" looks like for each one, then check **every single instance** — not a sample, not what catches your eye, but ALL of them.

## Core Principle

> "A codebase with 300 known bugs and one with 300 unknown bugs differ only in whether someone asked the right questions."

This skill IS the right questions, systematized.

---

## How This Differs from `/health-audit`

| Dimension | health-audit | arch-audit |
|-----------|--------------------------|------------|
| **Mode** | Read code, evaluate quality | Discover patterns, check every instance |
| **Finds** | Whatever catches the eye | Every violation of every invariant |
| **Misses** | Absences (missing filter, missing arg) | Instances its enumeration search cannot see (dynamic dispatch, generated code, aliases) |
| **Output** | Scored report with findings | Violation register with fix tracks |
| **Best for** | "How's the code?" | "What's silently broken?" |

**Recommended workflow:** Run `health-audit` first to diagnose systemic issues, then `arch-audit` to enumerate every instance. They're complementary.

---

## Focus Prompt Support

This skill accepts an optional focus prompt:

- No focus: audit the entire codebase across all pattern classes
- Focused: `"auth patterns"`, `"soft-delete"`, `"error handling in webhooks"`, `"state machine coverage"`
- Stack-specific: `"Prisma queries"`, `"Next.js API routes"`, `"React hooks"`

When focused, skip Phase 1 pattern classes outside the scope and go deep on the requested area.

---

## Rules

### The Exhaustiveness Rule (NON-NEGOTIABLE)

For every invariant you check, you must:
1. **Enumerate ALL instances** — use grep/glob to find every occurrence, not a sample
2. **Check EACH instance** — no "and 47 similar" hand-waving
3. **Report the exact count** — "Checked 142 instances, 38 violations found"
4. **List every violation** with file path and line number

If you find yourself writing "and similar patterns in other files," STOP. Go find those files. List them.

### The Pattern Discovery Rule

Do NOT enforce an invariant the codebase never adopted. The pattern classes in Phase 1 say where to look; the rules themselves emerge FROM the codebase:
1. Find the pattern (e.g., "this codebase uses `deletedAt` for soft-delete on 22 models")
2. Find the gold standard (e.g., "the `publicFilter` helper correctly adds `deletedAt: null`")
3. Define the invariant (e.g., "every query on a soft-deletable model must include `deletedAt: null` or use a filter helper")
4. Check every instance

Imported rules miss project-specific conventions and waste time checking patterns that don't exist.

### The Absence Rule

Most silent failures are **absences** — a missing filter, a missing argument, a missing error handler. Your scanner must detect what ISN'T there, not just what IS:
- Query WITHOUT `deletedAt` filter on a soft-deletable model
- Auth wrapper WITHOUT org-id resolver
- State write WITHOUT audit log
- External API call WITHOUT error handling
- Transaction WITHOUT tenant context

### Severity Classification

| Severity | Definition |
|----------|-----------|
| **CRITICAL** | Active data leak, security bypass, or compliance violation in production right now |
| **HIGH** | Silently broken feature, data integrity risk, or will break at scale |
| **MEDIUM** | Inconsistency that could cause bugs under specific conditions |
| **LOW** | Convention violation with no current impact but adds maintenance risk |

### Agent Strategy

Use parallel agents when the harness supports them. Each pattern class is independent, so one agent per class works well; group small classes together and respect any concurrency limit the user or the machine sets.

Each agent should:
1. Receive the discovered invariant definition
2. Enumerate all instances (grep/glob)
3. Check each instance
4. Return: invariant name, total instances checked, violations with file:line, severity

---

## Phase 0: Codebase Reconnaissance

Before looking for patterns, understand what you're working with.

1. **Stack identification**: Framework, ORM, auth system, external services, deployment model
2. **File structure map**: Top-level directories, routing conventions, service layer organization
3. **Domain inventory**: What does this app do? What are the core entities? What are the user roles?
4. **Scale signals**: How many routes? How many models? How many API endpoints? This tells you how large the sweep will be.

Output: A brief (~20 line) summary that orients the pattern discovery phase.

---

## Phase 1: Pattern Discovery

Scan the codebase to discover what conventions exist. For each pattern class below, determine:
- **Does this pattern exist in this codebase?** (skip if not)
- **What does the "gold standard" implementation look like?** (find the best example)
- **How many instances exist?** (rough count via grep)
- **What's the invariant?** (what must be true for every instance)

### Pattern Classes to Investigate

Not every codebase has every pattern. Skip classes that don't apply. Add new classes you discover. The examples use web-application vocabulary (ORM queries, route handlers, auth wrappers); translate them to the stack in front of you.

#### 1. Authentication & Authorization
- What auth wrappers/middleware exist?
- How is org/tenant scoping enforced?
- What's the contract for each wrapper? (What does it receive? What must callers provide?)
- Are there default parameters that could be footguns?

**Invariant template:** "Every [route type] must use [wrapper] with [required args]. The resolver must return [entity type], not [common mistake]."

#### 2. Data Access — Soft Delete
- Which models have `deletedAt` (or equivalent)?
- What filter helpers exist?
- Where are they applied vs. where are they missing?

**Invariant template:** "Every query on [model] must include `deletedAt: null` or use [helper]. Public endpoints must use [specific helper]."

#### 3. Data Access — Tenant Isolation
- How is multi-tenancy enforced? (RLS, org-scoped queries, middleware?)
- Which operations require tenant context?
- Are there `$transaction` callbacks that write tenant data without setting context?

**Invariant template:** "Every `$transaction` that writes to [tenant-scoped tables] must call [RLS setup function] at the top of the callback."

#### 4. State Machines & Status Transitions
- Which entities have status fields?
- Which have dedicated transition services?
- Which have direct writes that bypass the service?
- Do transition services log audit events? Use CAS? Invalidate caches?

**Invariant template:** "Every write to [Model.status] must go through [transition service]. Direct `update({ data: { status } })` is a violation."

#### 5. Error Handling
- What's the error handling convention? (`try/catch` with `logger.error`? Error boundaries? Response helpers?)
- Where are errors swallowed? (`.catch(() => {})`, `.catch(console.warn)`, empty catch blocks)
- Are there "fire and forget" patterns that should actually propagate errors?

**Invariant template:** "Every catch block must either (a) rethrow, (b) log with `logger.error` and return an error response, or (c) be explicitly marked as intentional fire-and-forget with a comment."

#### 6. External Service Integration
- What external services does the app call? (Payment providers, email, auth, storage, etc.)
- Are there idempotency keys on create operations?
- Is there cleanup on partial failure? (Create in external service → fail on local DB → orphaned external record)
- Are there retry/reconciliation mechanisms?

**Invariant template:** "Every [service].create() call must include an idempotency key. Every external-then-local write sequence must handle partial failure."

#### 7. Caching & Invalidation
- What caching layers exist? (ISR, Redis, in-memory, query cache?)
- Do state transitions invalidate relevant caches?
- Are there write paths that skip invalidation?

**Invariant template:** "Every service that modifies [entity] must call [invalidation function]. Callers of transition services must not need to remember to invalidate."

#### 8. Background Jobs & Cron
- How are jobs registered and scheduled?
- Are there registered jobs with no trigger mechanism?
- Are there schedule mismatches between registry and scheduler?

**Invariant template:** "Every job in [registry] must have a corresponding entry in [scheduler config] with matching schedule."

#### 9. API Response Consistency
- What response helpers exist? (`ok()`, `badRequest()`, `notFound()`, etc.)
- Are there routes that return raw `NextResponse.json()` with inconsistent shapes?
- Do error responses include appropriate status codes?

**Invariant template:** "Every API route must use [response helpers]. Raw `NextResponse.json()` with status codes is a violation."

#### 10. Input Validation
- What validation library is used? (Zod, Joi, etc.)
- Are there routes that read `req.json()` without validation?
- Are URL params validated?

**Invariant template:** "Every route that reads request body must validate through [validation library]. Unvalidated `await req.json()` is a violation."

#### 11. Testing Fidelity
- What's being mocked in tests? Are auth wrappers mocked as pass-throughs?
- Are there tests that lock in wrong behavior?
- Do mocks match the actual contract of what they're mocking?

**Invariant template:** "Test mocks of [auth wrapper] must exercise the resolver function, not stub it as a pass-through."

#### 12. Audit Logging
- What actions require audit logs?
- Which write operations are missing audit entries?
- Are audit logs inside or outside transactions?

**Invariant template:** "Every state-changing operation on [auditable entities] must create an audit log entry within the same transaction."

#### 13. Environment & Configuration
- What env vars are required?
- Are there hardcoded fallbacks that mask missing configuration?
- Are there env vars that default to production values when unset?

**Invariant template:** "Every env var used in production code paths must be listed in [validation file] at the appropriate tier. Hardcoded fallbacks to external domains are violations."

#### 14. Cascading Deletes & Data Retention
- What's the deletion strategy? (Soft delete, hard delete, cascade?)
- Are there cascade deletes that destroy financial/legal/compliance records?
- Are there models with important history that would be lost on parent deletion?

**Invariant template:** "Models containing [financial/legal/compliance] data must use `Restrict` or `SetNull` on delete, never `Cascade`."

#### 15. Navigation & URL Integrity
- Are there hardcoded route strings that reference non-existent paths?
- Are there redirects to deprecated URLs?
- Do internal fetch calls match actual API route paths?

**Invariant template:** "Every hardcoded route string must resolve to an existing page or API route. Every `fetch('/api/...')` must match an actual route file."

---

## Phase 2: Invariant Plan (Present to User)

After Phase 1 discovery, present the user with:

```
## Discovered Patterns & Invariants

I found N pattern classes active in this codebase. Here's what I'll check:

### 1. [Pattern Name]
- **Gold standard:** [file:line] — [what it does right]
- **Invariant:** [what must be true for every instance]
- **Estimated instances:** ~N (based on grep count)
- **Risk if violated:** [what breaks]

### 2. [Pattern Name]
...

### Skipped (not present in this codebase):
- [Pattern class] — no evidence found

**Total estimated work:** ~N instances across M invariants.
Shall I proceed with the full sweep, or adjust any invariants?
```

Wait for user approval before Phase 3. The user may:
- Approve all
- Adjust invariant definitions
- Add custom invariants they know about
- Skip certain classes
- Focus on a subset

---

## Phase 3: Exhaustive Sweep (parallel agents)

Launch one agent per pattern class (or group small ones). Each agent receives:
1. The invariant definition from Phase 2
2. The grep/glob commands to enumerate instances
3. Instructions to check EVERY instance and report violations

**Agent prompt template:**

```
You are checking a single architectural invariant across an entire codebase.

**Invariant:** [definition]
**Gold standard example:** [file:line]
**How to find instances:** [grep/glob pattern]

Steps:
1. Run the grep/glob to find ALL instances
2. For EACH instance, check if it satisfies the invariant
3. Classify violations by severity (CRITICAL/HIGH/MEDIUM/LOW)
4. Report format:

## [Invariant Name]
- **Instances checked:** N
- **Violations found:** M
- **Compliance rate:** X%

### Violations
| # | File:Line | Severity | What's wrong | Fix hint |
|---|-----------|----------|-------------|----------|
| 1 | path:42   | HIGH     | Missing X   | Add X    |

### Notes
[Any patterns, root causes, or architectural observations]
```

---

## Phase 4: Synthesis

After all agents report:

1. **Verify** — Re-read every CRITICAL and HIGH violation yourself, plus a sample of the rest from each agent. A grep-driven check flags instances that satisfy the invariant another way (a wrapper, a default, a database policy). Drop what you cannot confirm and report the false-positive rate you measured.
2. **Deduplicate** — Some violations appear in multiple invariant checks (e.g., a route missing both auth AND soft-delete)
3. **Cross-reference** — Find root causes that explain multiple violations (e.g., "26 routes broken because of one unsafe default")
4. **Group into fix tracks** — Cluster violations that should be fixed together (same file, same pattern, same root cause)
5. **Prioritize** — Order fix tracks by: CRITICAL first, then by ROI (fixes-per-hour)
6. **Identify architectural decisions** — Some fixes require a design choice before implementation (e.g., "build an ORM extension vs. codemod every query")

### Output Format

```markdown
# Arch-Audit Report: [Project Name]

## Executive Summary
- **Patterns audited:** N
- **Total instances checked:** N
- **Violations found:** N (X critical, Y high, Z medium, W low)
- **Compliance rate:** X%
- **Architectural decisions needed:** N

## Architectural Decisions Required
[Decisions that gate large families of fixes — must be resolved before bulk fixing]

### D1: [Decision Title]
- **Trigger:** [What invariant violations require this decision]
- **Options:** A, B, C with tradeoffs
- **Recommendation:** [Your recommendation with reasoning]
- **Violations gated:** N findings across M files

## Invariant Results

### [Pattern 1]: [Compliance Rate]%
| # | File:Line | Severity | Violation | Fix |
|---|-----------|----------|-----------|-----|

### [Pattern 2]: [Compliance Rate]%
...

## Fix Tracks
[Grouped clusters of violations that should be fixed together]

### Track 1: [Name] (N violations, estimated effort)
- **Root cause:** [Why these exist]
- **Fix pattern:** [What the fix looks like]
- **Files:** [List]

## Recommended Execution Order
1. [Critical hotfixes — do now]
2. [Architectural decisions — decide now]
3. [High-ROI fix tracks — do next sprint]
4. [Medium/low — schedule in backlog]
```

---

## Anti-Patterns to Avoid

1. **"And similar patterns in other files"** — NO. List every file. That's the whole point.
2. **Imported invariants** — NO. The Phase 1 classes say where to look; each rule must come from this codebase's own gold standard.
3. **Sampling** — NO. Check every instance. Use `wc -l` on your grep output to verify completeness.
4. **Scope creep into code review** — This is NOT about code quality, naming, or style. It's about invariant violations. A function can be ugly but correct; ignore ugly, flag incorrect.
5. **Reporting "potential" issues** — Every finding must be a concrete violation with a file path and line number. "This could potentially..." is not a finding.
6. **Fixing during the audit** — Research only. Produce the report. Fixes come after the user reviews and approves.

---

## Post-Audit: Creating Architectural Tests

The highest-ROI follow-up to an arch-audit is **codifying the invariants as CI tests**. For each invariant checked, recommend a test that enforces it going forward:

```typescript
// Example: no query on a soft-deletable model without a deletedAt filter
test("soft-deletable queries filter deletedAt", () => {
  const offenders = sourceFiles()
    .flatMap(findQueriesOnSoftDeletableModels)
    .filter((query) => !query.filtersDeletedAt && !query.usesFilterHelper);
  expect(offenders.map((q) => `${q.file}:${q.line}`)).toEqual([]);
});
```

This turns a one-time audit into a permanent safety net. New code that violates an invariant fails CI immediately.

---

## Checklist Before Reporting

- [ ] Every invariant has a concrete grep/glob search that found ALL instances
- [ ] Instance counts are exact, not estimated
- [ ] Each invariant names what its search could not see (dynamic calls, generated code, aliases)
- [ ] CRITICAL and HIGH violations were re-read and confirmed, not taken from an agent report
- [ ] Every violation has a file path and line number
- [ ] Violations are classified by severity with reasoning
- [ ] Cross-references identify shared root causes
- [ ] Fix tracks group related violations for efficient fixing
- [ ] Architectural decisions are identified where needed
- [ ] The report is actionable — a developer can pick up any fix track and start working
