# Output Templates

Artifact format specifications for all 6 logic-extract output files.

---

## flow-trace.md Template

```markdown
# Flow Trace: {Extraction Prompt}

## Overview
{1-2 paragraph summary of the entire flow}

## Entry Point
{Where and how the flow begins}

## Trace Steps

### Trace Step 1: {Description}
**System:** {repo/service}
**Input:** {data shape}
**Logic:** {what happens}
**Output:** {data shape}
**Error paths:** {what can go wrong}

### Trace Step 2: {Description}
...

## Cross-System Diagram

```mermaid
{sequence diagram}
```

## Decision Points
{All branches with conditions and outcomes}

## Configuration Dependencies
{All config values, feature flags, env vars that affect the flow}
```

---

## business-rules.md Categories

| Category | ID Pattern | What to Extract |
|----------|-----------|-----------------|
| Calculations | BR-CALC-NNN | Formulas, aggregations, derivations |
| Validations | BR-VAL-NNN | Input constraints, business constraints, range checks |
| Decisions | BR-DEC-NNN | If/else logic, switch cases, routing decisions |
| State transitions | BR-STATE-NNN | State machines, workflow steps, lifecycle changes |

**Strip all tech-specific references:**
- "Redis cache with 5min TTL" becomes "Cache resolved config with configurable TTL"
- "MongoDB query on dealerConfig collection" becomes "Look up dealer configuration by dealer ID"
- Framework annotations (e.g., Spring @Cacheable) are omitted entirely

---

## data-contracts.md Categories

| Category | ID Pattern | What to Extract |
|----------|-----------|-----------------|
| Inputs | DC-IN-NNN | Data entering the flow (user input, API request) |
| Outputs | DC-OUT-NNN | Data leaving the flow (API response, rendered result) |
| State | DC-STATE-NNN | Intermediate data shapes within the flow |
| Cross-system | DC-XSYS-NNN | Data shapes at repo boundaries |

Document shapes as abstract contracts, not schemas:
```
DC-IN-001: Config Request
- siteId: string (required) — unique identifier for the dealer's site
- includeDefaults: boolean (optional, default true) — whether to include national defaults
```

---

## Edge Cases and Error States

| Category | ID Pattern | What to Extract |
|----------|-----------|-----------------|
| Edge cases | EC-NNN | Unusual but valid inputs, boundary conditions |
| Error states | ERR-NNN | Failures, invalid inputs, system unavailability |

---

## Interaction Flows (FLOW-*)

High-level flow patterns from the sequence diagram:

```
FLOW-001: Config Resolution
1. [System] receives config request (DC-IN-001)
2. [System] checks cache
3. If miss: [System] retrieves raw config, applies override hierarchy (BR-DEC-001)
4. [System] resolves dealer metadata (DC-XSYS-001)
5. [System] returns resolved config (DC-OUT-001)
Error: If dealer not found -> ERR-001
```

---

## Persona Abstraction

Replace all tech-specific actors with abstract personas:
- Specific user types become `[User]`
- Admin/operator types become `[Admin]`
- Automated processes, services become `[System]`

---

## epics.md Template

Each epic maps to a logical chunk of the traced flow:

```markdown
## Epic 1: {Flow Segment}

**Priority:** P0
**Flow coverage:** FLOW-001 trace steps 1-3

### Story 1.1: {Title}

**As a** [System]
**I need** {capability}
**So that** {business value}

**Acceptance Criteria:**
- [ ] {Criterion referencing BR-CALC-001}
- [ ] {Criterion referencing DC-IN-001}
- [ ] {Edge case EC-001 handled}

**Business Rules:** BR-CALC-001, BR-VAL-002
**Data Contracts:** DC-IN-001, DC-OUT-001
**Depends on:** (none — this is upstream)
```

### epics.md YAML Frontmatter

```yaml
---
source_project: "{starting point repos}"
extraction_date: "{current date}"
extraction_mode: "guided"
extraction_prompt: "{the user's prompt}"
repos_analyzed:
  - ~/git/dvs-services-aws
  - ~/git/cms-web
  - ~/git/cms-core
persona_mapping:
  "[User]": ["Dealer", "Site Visitor"]
  "[Admin]": ["Dealer Admin", "Platform Admin"]
  "[System]": ["Config Service", "Cache Service", "Event Bus"]
---
```

### Cross-Reference Requirements

Every story references:
- **BR-*** IDs from `business-rules.md`
- **DC-*** IDs from `data-contracts.md`
- **EC-*/ERR-*** IDs from `component-spec.md`
- **FLOW-*** IDs from `component-spec.md`
- **Depends on** other story IDs (data-flow ordering)

---

## Output Directory Structure

```
_logic-extract/
├── extraction-manifest.md    # Prompt, repos explored, discovery log
├── flow-trace.md             # End-to-end algorithm + Mermaid diagram
├── data-contracts.md         # All data shapes (DC-*)
├── business-rules.md         # Decision logic, validations (BR-*)
├── component-spec.md         # Unified tech-agnostic spec (BR/DC/EC/ERR/FLOW)
└── epics.md                  # BMAD-format implementation epics
```

| # | File | Phase | Description |
|---|------|-------|-------------|
| 1 | `extraction-manifest.md` | 0-2 | Extraction prompt, repos explored, discovery log, confirmed scope |
| 2 | `flow-trace.md` | 3 | End-to-end algorithm trace with Mermaid sequence/flow diagram |
| 3 | `data-contracts.md` | 4 | All data shapes: DC-IN, DC-OUT, DC-STATE, DC-XSYS |
| 4 | `business-rules.md` | 4 | Decision logic, validations, calculations: BR-CALC, BR-VAL, BR-DEC, BR-STATE |
| 5 | `component-spec.md` | 4 | Unified spec: business rules + data contracts + edge cases (EC-*) + error states (ERR-*) + interaction flows (FLOW-*) |
| 6 | `epics.md` | 5 | BMAD-format epics with stories referencing all BR/DC/FLOW IDs, ordered by data-flow dependency |
