---
name: health-sweep
description: Use when the user wants a codebase audited from every angle at once. Parallel multi-perspective codebase audit that runs all health audits simultaneously, deduplicates cross-audit findings, identifies systemic themes, and produces a unified scorecard with separate engineering and live-harm grades and a prioritized remediation plan.
---

# Health Sweep — Full Codebase Audit Orchestrator

Use this skill when the user wants a comprehensive, multi-perspective health audit of a codebase. This is the capstone orchestrator for the entire health audit suite. It detects which audits apply, runs them in parallel via subagents, deduplicates cross-audit findings, identifies systemic themes that no single audit would surface, and produces a unified scorecard with a prioritized remediation plan.

Do NOT use this skill for a single-perspective audit. Use the individual audit skills directly:
- `/health-audit` — codebase and technical quality
- `/health-audit-ux` — user experience and visual consistency
- `/health-audit-data` — data handling and privacy
- `/health-audit-dx` — developer experience
- `/health-audit-seo` — SEO and web presence
- `/health-audit-api` — API surface quality
- `/health-audit-ops` — ops and deployment readiness
- `/health-audit-domain` — business logic and domain integrity

## Mission

Orchestrate a multi-perspective audit that reveals what no single audit can: the systemic patterns, cross-cutting risks, and compounding issues that only become visible when you examine a codebase from every angle simultaneously. The value of a sweep over running audits individually is threefold:

1. **Cross-audit deduplication** — The same root cause flagged from multiple perspectives becomes a high-confidence, high-priority finding
2. **Systemic theme identification** — Patterns that span audit boundaries reveal organizational and architectural issues
3. **Unified prioritization** — A single ranked action plan that weighs findings across all perspectives

---

## Arguments

- `/health-sweep` — run with auto-detected audit selection
- `/health-sweep all` — force all 8 audits regardless of applicability
- `/health-sweep tech ux dx` — run only specified audits (use short names listed below)
- `/health-sweep --target 8.0` — set a target score and focus the remediation plan on reaching it

### Audit Short Names

| Short Name | Audit | Skill |
|-----------|-------|-------|
| `tech` | Codebase & Tech | `/health-audit` |
| `ux` | User Experience | `/health-audit-ux` |
| `data` | Data & Privacy | `/health-audit-data` |
| `dx` | Developer Experience | `/health-audit-dx` |
| `seo` | SEO & Web Presence | `/health-audit-seo` |
| `api` | API Surface | `/health-audit-api` |
| `ops` | Ops & Deployment | `/health-audit-ops` |
| `domain` | Business Logic | `/health-audit-domain` |

---

## Required Workflow

### Phase 0: Detect Applicability

Before running any audits, quickly scan the codebase to determine which audits are relevant. This scan should be fast — it is a triage pass, not an audit itself. Look for the following signals:

#### Applicability Rules

| Audit | Applicable When | Detection Signals |
|-------|----------------|-------------------|
| **Codebase & Tech** (`tech`) | ALWAYS | Every codebase has architecture, maintainability, security, and testing concerns |
| **Developer Experience** (`dx`) | ALWAYS | Every codebase has onboarding, build, tooling, and contributor experience concerns |
| **User Experience** (`ux`) | Frontend exists | React, Vue, Svelte, Angular, Astro, Next.js, Nuxt, SvelteKit, HTML templates (EJS, Handlebars, Jinja, Blade), CSS/SCSS/Tailwind files, component directories, `pages/` or `views/` or `app/` routing directories |
| **Data & Privacy** (`data`) | User data is collected or stored | User models, auth systems, database schemas with PII fields, form submissions that collect personal data, analytics SDKs, cookie consent code, privacy policies |
| **SEO & Web Presence** (`seo`) | Public-facing web app | Public routes, meta tag management, sitemap/robots.txt, Open Graph tags, SSR/SSG configuration, `<head>` management utilities. NOT applicable for internal tools, CLI tools, libraries, APIs without a web frontend |
| **API Surface** (`api`) | App exposes APIs | REST route handlers, GraphQL resolvers, gRPC service definitions, OpenAPI/Swagger specs, API middleware (auth, rate limiting, versioning), webhook handlers, SDK packages |
| **Ops & Deployment** (`ops`) | CI/CD, containers, or IaC exist | GitHub Actions/GitLab CI/CircleCI configs, Dockerfiles, docker-compose, Kubernetes manifests, Terraform/CloudFormation/Pulumi files, deployment scripts, monitoring configs, Procfiles, platform config (vercel.json, netlify.toml, fly.toml) |
| **Business Logic** (`domain`) | Meaningful business logic exists | Pricing/billing calculations, permission/role systems, state machines, workflow engines, validation with business rules, financial logic, subscription/entitlement management, multi-step processes with business constraints |

#### Detection Method

1. Scan the repository root: `package.json`, `requirements.txt`, `Cargo.toml`, `go.mod`, `Gemfile`, `pom.xml`, `build.gradle`, `composer.json`, or equivalent — to identify the tech stack
2. Check for frontend frameworks and component directories
3. Check for database schemas, ORM models, or migration files with user-related tables
4. Check for route definitions, API handlers, OpenAPI specs
5. Check for CI/CD configuration directories (`.github/workflows/`, `.gitlab-ci.yml`, `Jenkinsfile`)
6. Check for container files (`Dockerfile`, `docker-compose.yml`, `k8s/`, `helm/`)
7. Check for IaC files (`terraform/`, `cdk/`, `cloudformation/`, `pulumi/`)
8. Check for business logic indicators: pricing modules, permission systems, state machines, billing code
9. Check for public-facing web indicators: meta tags, sitemap, robots.txt, SSR configuration

#### Present the Assessment

Before proceeding, present the applicability assessment to the user in this format:

```
## Applicability Assessment

Based on repository scan:

| Audit | Status | Reason |
|-------|--------|--------|
| Codebase & Tech | ✅ Run | Always applicable |
| User Experience | ✅ Run | React frontend with Next.js detected |
| Data & Privacy | ✅ Run | User model with email, Stripe integration |
| Developer Experience | ✅ Run | Always applicable |
| SEO & Web Presence | ⬚ Skip | Internal admin tool, no public routes |
| API Surface | ✅ Run | REST API with 23 route handlers |
| Ops & Deployment | ✅ Run | GitHub Actions, Docker, Terraform detected |
| Business Logic | ✅ Run | Subscription billing, role-based permissions |

Running 7 of 8 audits. Reply to override (add/remove) or confirm to proceed.
```

Wait for user confirmation before proceeding. The user may:
- Confirm as-is
- Add audits: "also run SEO"
- Remove audits: "skip data, we don't collect user info"
- Override entirely: "just run tech, ux, and dx"

If the user passed specific audit names in the command (e.g., `/health-sweep tech ux dx`), skip the detection step and run exactly what was requested. If the user passed `all`, run all 8 without asking.

---

### Phase 1: Launch Parallel Audits

Spawn one subagent per applicable audit and run them in parallel, up to whatever concurrency limit the user or the machine sets; queue the rest. Each agent runs the FULL audit skill — no abbreviation, no summarization, no shortcuts.

Eight full audits is a large run. Say so in the applicability assessment so the user can trim the list before it starts.

#### Agent Instructions

Each subagent receives:
1. The full skill for its audit: have the agent invoke that skill, or pass it the complete contents of the skill's `SKILL.md`
2. Access to the full codebase
3. A file path to write its complete report to (one file per audit, in the directory this repository uses for audit reports or one the user names)
4. Instructions to produce the complete audit output including all findings with the finding template (including the Harm and Pattern fields), category scores with their arithmetic, the bar chart, and both grades: the Engineering score and the Live-harm score with its instance count and units

Each agent MUST:
- Run the complete workflow defined in its skill (all phases)
- Produce every section defined in its output format
- Use the full finding template with severity, confidence, location, evidence, impact, and recommendation
- Score all applicable categories with justifications
- Render its bar chart with both grade rows
- Report strengths and bright spots

Each agent MUST NOT:
- Skip phases to save time
- Summarize findings instead of producing them fully
- Omit the scoring, bar chart, or action plan sections
- Abbreviate the evidence in findings

Wait for all agents to complete before proceeding to synthesis.

---

### Phase 2: Cross-Audit Deduplication

The same underlying issue is often visible from multiple perspectives. Deduplication prevents the final report from being an overwhelming wall of repeated findings while amplifying the signal that cross-audit visibility provides.

#### Deduplication Rules

Two findings are candidates for merging ONLY when they meet ALL of the following:
1. **Same code location** — they reference the same file(s), function(s), or configuration, OR
2. **Same root pattern** — they describe the same systemic practice (e.g., "no input validation" across entry points), AND
3. **Same underlying cause** — fixing one would fix the other

Two findings are NOT duplicates merely because:
- They are in the same file but describe different problems
- They share a category name but reference different code
- They have similar titles but different root causes
- They both mention the same technology or pattern for different reasons

#### Merge Process

When findings are confirmed duplicates:

1. **Create a unified finding** using the finding template
2. **Title**: Use the most descriptive title from any source
3. **Severity**: Use the HIGHEST severity from any source audit
4. **Confidence**: If the audits brought different evidence, the merged finding moves up a tier once the combined evidence meets that tier's criteria. Two audits repeating the same observation is not new evidence
5. **Location**: Union of all file paths and line numbers from all source audits
6. **Evidence**: Combine the evidence from each perspective. Do not discard evidence — each perspective adds signal
7. **Impact**: Combine the impact statements, noting which dimension each audit highlighted
8. **Recommendation**: Synthesize a unified recommendation that addresses all perspectives
9. **Tag**: Add `[cross-audit: N perspectives]` where N is the number of audits that flagged it
10. **Source audits**: List which audits surfaced this finding

#### Common Cross-Audit Patterns

These patterns frequently produce duplicates. Look for them explicitly:

| Pattern | Likely Flagged By |
|---------|-------------------|
| Hardcoded secrets | tech (security), data (config safety), ops (secret management) |
| Missing loading/error states | tech (UX signals), ux (interaction feedback) |
| No tests on critical paths | tech (testing), dx (test suite health), domain (untested business rules) |
| Inconsistent error handling | tech (reliability), ux (error states), api (error responses) |
| No input validation | tech (security), api (request validation), domain (business rule enforcement) |
| Missing ARIA/accessibility | tech (UX signals), ux (accessibility), seo (accessibility as SEO) |
| Unprotected endpoints | tech (security), api (auth surface), domain (permission enforcement) |
| No logging/observability | tech (reliability), ops (monitoring), data (logging hygiene) |
| Environment variable mismanagement | tech (configuration), ops (environment parity), data (config safety) |
| Code duplication | tech (DRY/reuse), dx (code navigation) |
| Missing documentation | tech (documentation), dx (contributor docs), api (API docs) |
| Stale dependencies | tech (dependency risk), dx (dependency management), ops (supply chain) |

---

### Phase 3: Systemic Theme Identification

This is the highest-value synthesis step. Look across all audit findings for patterns that reveal systemic organizational or architectural issues. A systemic theme is NOT just "multiple audits found problems" — it is a shared root cause or missing capability that manifests differently across perspectives.

#### How to Identify Themes

1. **Group merged findings by root cause** — What underlying decision, missing practice, or architectural gap caused this cluster of findings?
2. **Look for capability gaps** — If multiple audits flag symptoms of the same missing capability, name that capability
3. **Look for philosophy gaps** — If multiple audits reveal the absence of a consistent approach to the same concern, name that approach
4. **Check for compounding effects** — Some findings in isolation are Medium severity, but when they compound across perspectives, the combined effect is High or Critical

#### Example Systemic Themes

These are illustrative, not exhaustive. Themes should emerge from the actual findings, not be forced:

| If You See... | Across These Audits... | The Systemic Theme Is... |
|---------------|----------------------|--------------------------|
| Token drift (UX) + style inconsistency (tech) + fragmented component patterns (DX) | ux, tech, dx | "Design system adoption is incomplete — the system exists but is not enforced" |
| Weak error handling (tech) + missing error states (UX) + inconsistent error responses (API) | tech, ux, api | "No error handling philosophy — each module handles errors ad hoc" |
| No auth on some endpoints (tech) + permission gaps (domain) + auth surface issues (API) | tech, domain, api | "Authorization is bolt-on, not architectural — the system has no unified permission model" |
| PII in logs (data) + no observability (ops) + swallowed errors (tech) | data, ops, tech | "Observability is absent — the team cannot see what the system is doing" |
| No tests on business logic (tech) + untested state transitions (domain) + poor test DX (DX) | tech, domain, dx | "Testing culture is absent — not a coverage gap but a practice gap" |
| Build slowness (DX) + CI pipeline issues (ops) + outdated deps (tech) | dx, ops, tech | "Toolchain neglect — the build and deploy infrastructure has not kept pace with the application" |
| Missing loading states (UX) + N+1 queries (tech) + no caching (API) | ux, tech, api | "Performance is unmanaged — no performance budget, no monitoring, no consistent optimization" |

#### Theme Structure

For each systemic theme, produce:

```
### Theme: [Descriptive Name]

**Appears in**: [list of audit short names]
**Confidence**: [how confident are you this is a real systemic issue, not a coincidence]

**Root Cause**:
[What organizational practice, architectural decision, or missing capability
is driving this pattern across multiple perspectives]

**Manifestations**:
- [audit name]: [how it manifests in this perspective — reference the specific finding]
- [audit name]: [how it manifests in this perspective — reference the specific finding]
- [audit name]: [how it manifests in this perspective — reference the specific finding]

**Combined Impact**:
[The impact across ALL perspectives combined. This should be MORE than the
sum of individual finding impacts — explain the compounding effect]

**Unified Remediation**:
[A single remediation strategy that addresses the root cause across all
perspectives. This should be more strategic than "fix each finding individually"]

**Estimated Effort**: [Small / Medium / Large / XL]
```

---

### Phase 4: Unified Scorecard

#### Per-Audit Scores

Collect both grades from each audit agent. Present them together:

| Audit | Engineering | Grade | Live Crit/High | Live harm | Grade | Key Risk |
|-------|-------------|-------|----------------|-----------|-------|----------|
| Codebase & Tech | 7.2 | C | 0 C / 3 H | 6.5 | C | [highest-severity finding title] |
| User Experience | 7.8 | B | 0 C / 1 H | 8.0 | B | [highest-severity finding title] |
| Data & Privacy | 6.4 | C | 1 C / 2 H | 5.0 | D | [highest-severity finding title] |
| Developer Experience | 7.5 | B | 0 C / 0 H | 9.5 | A | [highest-severity finding title] |
| SEO & Web Presence | — | — | — | — | — | N/A (internal tool) |
| API Surface | 6.8 | C | 0 C / 2 H | 6.5 | C | [highest-severity finding title] |
| Ops & Deployment | 5.9 | D | 1 C / 1 H | 5.0 | D | [highest-severity finding title] |
| Business Logic | 8.1 | B | 0 C / 1 H | 8.0 | B | [highest-severity finding title] |

Each audit's grades follow the calibration anchors in `/health-audit`: C is typical working production code, not a failing mark.

#### Grand Grades

The sweep reports two grand grades, never blended into one.

**Grand Engineering** is a WEIGHTED average of the per-audit Engineering scores. Do NOT use equal weights — weight by the audit's relevance and impact for this specific codebase type.

##### Weight Assignment Guidelines

| Codebase Type | Higher Weight | Lower Weight |
|--------------|---------------|--------------|
| **SaaS web app** | tech, ux, api, domain | seo, ops |
| **Internal tool** | tech, dx, domain | seo, ux |
| **Public marketing site** | ux, seo, ops | api, domain, data |
| **API-first platform** | tech, api, ops, domain | ux, seo |
| **Library / SDK** | tech, dx, api | ux, seo, ops |
| **CLI tool** | tech, dx | ux, seo |
| **E-commerce** | tech, ux, domain, data, seo | dx |
| **Regulated / fintech** | tech, domain, data, ops, api | seo, ux |

For each sweep, determine the codebase type and assign weights that sum to 100% across the audits that were actually run. State your weight assignment and reasoning.

**Grand Live harm** is NOT an average of the per-audit Live-harm scores. After Phase 3 deduplication, count the unique live or reachable-today Verified Critical (×3) and High (×1) instances across all audits (a finding two audits both reported counts once), divide by units for the whole in-scope codebase (source lines excluding tests / 50,000, minimum 1), and map the result with the Live-harm table in `/health-audit`. Show the count, the units and the result.

##### Grade Scale

| Range | Grade | Meaning |
|-------|-------|---------|
| 9.0-10.0 | A | Reference quality |
| 7.5-8.9 | B | Strong |
| 6.0-7.4 | C | Sound, typical production work |
| 4.0-5.9 | D | Weak: the structure keeps producing defects, or users regularly hit live ones |
| 0.0-3.9 | F | Failing |

#### Master Bar Chart

Render a text-only horizontal bar chart with 20 blocks per row showing each audit's Engineering score, then the two grand grades:

```
Codebase & Tech       7.2 | ██████████████░░░░░░
User Experience       7.8 | ████████████████░░░░
Data & Privacy        6.4 | █████████████░░░░░░░
Developer Experience  7.5 | ███████████████░░░░░
SEO & Web Presence      — | ---- skipped -------
API Surface           6.8 | ██████████████░░░░░░
Ops & Deployment      5.9 | ████████████░░░░░░░░
Business Logic        8.1 | ████████████████░░░░
─────────────────────────────────────────────────
GRAND ENGINEERING     7.2 | ██████████████░░░░░░
GRAND LIVE HARM       5.0 | ██████████░░░░░░░░░░
```

Use `█` for filled and `░` for empty. Use `---- skipped -------` for skipped audits.

---

### Phase 5: Prioritized Master Action Plan

Rank ALL findings (after deduplication) across ALL audits into a single prioritized list.

#### Ranking Formula

Each finding's priority score is determined by:

```
priority = severity_weight × confidence_weight × cross_audit_multiplier × effort_efficiency
```

Where:
- `severity_weight`: Critical = 4, High = 3, Medium = 2, Low = 1
- `confidence_weight`: Verified = 1.0, Probable = 0.7, Observation = 0.3, Question = 0.1
- `cross_audit_multiplier`: 1 + (0.5 × (number_of_source_audits - 1)) — findings seen by multiple audits get boosted
- `effort_efficiency`: Large = 0.5, Medium = 1.0, Small = 2.0 — quick wins rank higher at equal severity

#### Action Plan Format

Present the top 20 actions:

```
### Action 1: [Title]

**Priority Score**: [calculated score]
**Severity**: [Critical/High/Medium/Low] | **Confidence**: [tier] | **Effort**: [Small/Medium/Large]
**Source Audit(s)**: [which audit(s) surfaced this]
**Cross-Audit Signal**: [if applicable, how many perspectives flagged this]

**What to do**: [One concrete, actionable sentence]
**Why it matters now**: [One sentence connecting to business/user/team impact]
**Addresses**: [Cross-reference finding titles]
```

---

### Phase 6: Score Improvement Roadmap

For each audit whose Engineering grade is below B (7.5), identify the 3-5 specific changes that would move it above 7.5; for each audit whose Live-harm grade is below C, list the fixes that clear its live Critical and High instances. This section is what turns the audit into a planning document.

#### Roadmap Format

```
### [Audit Name]: Engineering [current] → 7.5+ target, Live harm [current]

Current: Engineering [score] ([grade]), Live harm [score] ([grade])
Gap: [Engineering points needed; live Critical/High instances to clear]

| # | Change | Categories Affected | Score Impact | Effort |
|---|--------|-------------------|-------------|--------|
| 1 | [specific change] | [categories whose pattern it removes, or live instances it clears] | +[points from the recipe] | [effort] |
| 2 | [specific change] | [which scoring categories improve] | +[estimated points] | [effort] |
| 3 | [specific change] | [which scoring categories improve] | +[estimated points] | [effort] |

**Fastest path to B**: [which of the above changes, in which order,
gets to 7.5 with the least total effort]
```

If the user specified `--target`, use that score instead of 7.5 as the threshold.

---

## Output Format

```markdown
# Health Sweep — Full Codebase Audit

## 1. Executive Summary

[3-4 paragraphs for a CTO or VP of Engineering. Answer these questions:
- What is the overall health of this codebase across all perspectives?
- What are the 2-3 biggest risks that leadership should understand?
- Where is the product genuinely strong?
- What should the team prioritize in the next quarter?
- Are there systemic issues that individual teams would not see from
  their own perspective?

Write for someone who will read this section and maybe nothing else.
Be direct. Use plain language. No jargon.]

## 2. Audits Performed

| Audit | Status | Engineering | Live harm | Key Risk |
|-------|--------|-------------|-----------|----------|
| Codebase & Tech | ✅ | 7.2 C | 6.5 C | [one-liner] |
| User Experience | ✅ | 7.8 B | 8.0 B | [one-liner] |
| Data & Privacy | ✅ | 6.4 C | 5.0 D | [one-liner] |
| Developer Experience | ✅ | 7.5 B | 9.5 A | [one-liner] |
| SEO & Web Presence | ⬚ skipped | — | — | N/A (internal tool) |
| API Surface | ✅ | 6.8 C | 6.5 C | [one-liner] |
| Ops & Deployment | ✅ | 5.9 D | 5.0 D | [one-liner] |
| Business Logic | ✅ | 8.1 B | 8.0 B | [one-liner] |

## 3. Master Scorecard Bar Chart

[All audits on one chart, plus both grand grades. Use the format defined
in Phase 4.]

## 4. Grand Grades

**Engineering**: [score] | **Grade**: [grade]
**Live harm**: [score] | **Grade**: [grade] | [deduplicated Critical/High count, units]
**Weighting Rationale**: [1-2 sentences explaining why audits were weighted
as they were for this codebase type]

## 5. Systemic Themes

[Cross-cutting patterns that appear across multiple audits. These are the
highest-value findings of the sweep — insights that no single audit would
produce. Use the theme structure defined in Phase 3.]

### Theme 1: [name]
[full theme structure]

### Theme 2: [name]
[full theme structure]

...

## 6. Cross-Audit Findings (Highest Signal)

[All findings that were flagged by 2+ audits, after deduplication. These
are sorted by priority score. Each uses the standard finding template with
the [cross-audit: N perspectives] tag and source audit attribution.]

## 7. All Findings by Severity

[Every finding from every audit, after deduplication, sorted by severity
(Critical → High → Medium → Low). Within each severity band, sort by
confidence (Verified → Probable → Observation → Question). Each finding
uses the standard finding template and is tagged with its source audit(s).]

### Critical Findings
[findings]

### High Findings
[findings]

### Medium Findings
[findings]

### Low Findings
[findings]

## 8. Strengths Across All Perspectives

[What multiple audits agreed the codebase does well. This is NOT filler —
evidence-backed strengths with source audit attribution. Group by theme
where possible.]

## 9. Prioritized Master Action Plan

[Top 20 actions using the format defined in Phase 5. These are ranked by
the priority formula across all audits.]

## 10. Score Improvement Roadmap

[For each audit scoring below B (7.5), the specific changes needed to
reach the target score. Use the format defined in Phase 6.]

## 11. Audit-Specific Deep Dives

[For each audit that was run, link to its complete report, saved as its own
file by the subagent. Do not paste the full reports into this one: the
synthesis above must stand without them, and eight reports in one document
is unreadable.]

| Audit | Full report |
|-------|-------------|
| Codebase & Tech | [path] |
| ... | ... |

## 12. Final Verdict

**Engineering**: [score] — [grade] · **Live harm**: [score] — [grade]

[2-3 sentence plain-language verdict. What do the two grades mean for the
team: how well is it built, and how much is hurting people now? Is this codebase healthy enough to build on confidently? What is
the single most important thing to address?]
```

---

## Core Rules

### The Orchestrator's Value-Add

The sweep orchestrator adds value through SYNTHESIS, not summarization. The individual audit agents produce the raw findings. The orchestrator's job is:

1. **Deduplication** — Merge overlapping findings from different perspectives
2. **Amplification** — Cross-audit findings are higher signal than single-audit findings
3. **Theme identification** — Surface systemic issues that span audit boundaries
4. **Unified prioritization** — One ranked list across all perspectives
5. **Gap identification** — What systemic issues do the themes reveal that no single audit flagged?

### Non-Negotiable Rules

- Each audit agent MUST run the FULL audit process. The entire point of the sweep is thoroughness across perspectives. Abbreviated audits produce weak synthesis.
- Deduplication must be CONSERVATIVE. Only merge findings that reference the same code or the same root pattern. Two different problems in the same file are NOT duplicates. When in doubt, keep them separate.
- The systemic theme identification is what makes the sweep more valuable than running audits individually. This is where you connect dots across perspectives. Do not skip or rush this step.
- Do NOT create artificial findings that no individual audit surfaced. The orchestrator synthesizes — it does not invent.
- Do NOT average scores naively. Weight by applicability and impact for the specific codebase type.
- Do NOT weight all audits equally in the grand Engineering grade.
- Do NOT average per-audit Live-harm scores; recount deduplicated instances.
- DO mark clearly which findings came from which audit source(s).
- DO be transparent about which audits were skipped and why.
- DO NOT run audits that truly do not apply. An SEO audit on a CLI tool, or a UX audit on a headless API service, is noise that dilutes the signal. The applicability detection exists for a reason.
- The Score Improvement Roadmap section is critical — it tells the team exactly what to fix to reach a target grade. This is what feeds into downstream planning. Do not skip it.

### Evidence Standard

The sweep inherits the evidence standard from all individual audits:

| Tier | Definition |
|------|-----------|
| **Verified** | All evidence criteria met. Cross-audit confirmation further strengthens this. |
| **Probable** | Strong signals but missing one criterion. A second audit can upgrade it to Verified when it supplies the missing criterion. |
| **Observation** | Worth noting, lacks sufficient evidence to call a problem. |
| **Question** | Needs human confirmation or domain context. |

Cross-audit confirmation is the strongest form of evidence. When two independent audits, looking at the codebase from different perspectives with different evaluation criteria, both flag the same issue — that is a high-confidence finding.

### Severity Classification

Inherited from all individual audits:

| Severity | Definition |
|----------|-----------|
| 🔴 **Critical** | Active harm or imminent risk |
| 🟠 **High** | Significant drag on quality or velocity |
| 🟡 **Medium** | Meaningful but contained |
| 🔵 **Low** | Improvement opportunities |

For cross-audit findings, use the highest severity from any source audit.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Summarize away audit outputs — each audit's full report stays available as its own linked file
- ❌ Average scores naively — use weighted composites with codebase-type-aware weights
- ❌ Create artificial findings that no individual audit surfaced
- ❌ Skip the deduplication step — raw concatenation of 8 audits creates an overwhelming mess
- ❌ Weight all audits equally in the grand Engineering grade — weight by relevance to the codebase
- ❌ Blend Engineering and Live harm into one number — report both
- ❌ Run audits that truly don't apply — noise is worse than gaps
- ❌ Rush systemic theme identification — this is the sweep's primary value-add
- ❌ Force themes when there are none — if findings don't cluster, say so
- ❌ Present the sweep as "8 audits stapled together" — it must be a synthesis
- ❌ Skip the Score Improvement Roadmap — it is the bridge from audit to action
- ❌ Abbreviate individual audits to fit everything in — thoroughness is the point
- ❌ Merge findings aggressively — conservative deduplication preserves signal

Do:
- ✅ Run every applicable audit completely and in parallel
- ✅ Deduplicate conservatively, only when findings share root cause or code location
- ✅ Identify systemic themes that connect findings across audit boundaries
- ✅ Assign cross-audit findings higher priority than single-audit findings
- ✅ Weight the grand Engineering grade by codebase type and audit relevance
- ✅ Produce a unified prioritized action plan across all perspectives
- ✅ Keep the full unabridged output of each audit as its own file and link it from the deep-dive section
- ✅ Be transparent about applicability decisions and weight assignments
- ✅ Highlight strengths that multiple audits agreed on — these are genuine competitive advantages
- ✅ Make the Score Improvement Roadmap actionable enough to feed into sprint planning
- ✅ Write the Executive Summary for someone who will read only that section
- ✅ Present the applicability assessment and let the user override before proceeding
