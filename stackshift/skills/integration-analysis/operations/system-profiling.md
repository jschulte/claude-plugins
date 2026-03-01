# System Profiling — Phase 2 Operation

**Purpose:** Build a comprehensive profile for a single system from available sources.
**Called from:** SKILL.md Phase 2
**Output:** `_integration-analysis/system-profiles/{name}.md`

---

## Overview

System profiling extracts everything needed to understand a system's role in the integration landscape. The goal is NOT to reverse-engineer the entire codebase (that's `/stackshift.reverse-engineer`), but to extract the **integration-relevant surface**: what the system does, what data it owns, what APIs it exposes/consumes, how it's configured, and where it hurts.

---

## Input Priority

Use the best available source for each extraction target. Higher priority = more reliable:

| Priority | Source | Reliability |
|----------|--------|-------------|
| 1 | Reverse Engineer docs (`docs/reverse-engineering/`) | Highest — comprehensive, structured |
| 2 | Real config data (XML, YAML, JSON configs) | High — ground truth for data models |
| 3 | Code repository (direct scanning) | High — but requires more effort to extract |
| 4 | API documentation (OpenAPI, wiki, README) | Medium — may be outdated |
| 5 | Developer knowledge (Guided/Interactive mode) | Medium — subjective but contextual |
| 6 | Inference from consumer code | Low — indirect, may miss internal details |

**Rule:** Always note the source of each extracted item. This lets reviewers assess confidence.

---

## Extraction Targets

### 1. API Endpoints

**What to extract:**
- REST routes: method, path, auth requirement, request/response types
- GraphQL schemas: queries, mutations, subscriptions, types
- Event topics: published events, consumed events, payload schemas
- gRPC services: service definitions, method signatures
- WebSocket channels: message types, connection lifecycle
- Internal APIs: service-to-service endpoints not exposed externally

**Where to look:**

| Source | What to scan |
|--------|-------------|
| Reverse Engineer docs | `integration-points.md` Section: External Services & APIs |
| Code (Java/Spring) | `@RequestMapping`, `@GetMapping`, `@PostMapping`, controller classes |
| Code (Node/Express) | `router.get()`, `router.post()`, route files |
| Code (GraphQL) | `.graphql` schema files, resolver directories |
| OpenAPI specs | `swagger.json`, `openapi.yaml` files |
| Config files | `routes.xml`, `web.xml`, API gateway configs |

**Output format:**
```markdown
### API Surface

#### REST Endpoints
| Method | Path | Auth | Purpose | Request | Response |
|--------|------|------|---------|---------|----------|
| GET | /api/v2/tenant/{id} | API Key | Get tenant config | - | TenantConfig |
| POST | /api/v2/tenant/{id}/override | OAuth | Apply override | OverridePayload | Result |

#### Events Published
| Topic/Queue | Payload | Trigger | Consumers |
|-------------|---------|---------|-----------|
| tenant.config.updated | TenantConfigEvent | Config save | Web App, Cache Service |

#### Events Consumed
| Topic/Queue | Payload | Publisher | Handler |
|-------------|---------|-----------|---------|
| inventory.updated | InventoryEvent | Inventory Service | ConfigRefreshHandler |
```

### 2. Data Models

**What to extract:**
- Core entities: name, fields, types, constraints, relationships
- Enums: name, values, usage context
- DTOs/Transfer objects: input/output shapes for API boundaries
- Config schemas: structure of configuration data
- Shared types: types used across module boundaries

**Where to look:**

| Source | What to scan |
|--------|-------------|
| Reverse Engineer docs | `data-architecture.md` — models, schemas, domain boundaries |
| Code (TypeScript) | `types/`, `interfaces/`, `*.types.ts`, `*.dto.ts` |
| Code (Java) | Entity classes, `@Entity`, `@Table`, DTO classes |
| Database | Migration files, schema definitions, `CREATE TABLE` |
| Config files | XML schemas (`.xsd`), JSON Schema files |
| GraphQL | Type definitions in `.graphql` files |

**Output format:**
```markdown
### Data Models

#### Core Entities
| Entity | Fields | Primary Key | Relationships |
|--------|--------|-------------|---------------|
| Tenant | id, name, brand, group, ... | tenantId | has-many Sites |
| Site | id, tenantId, domain, ... | siteId | belongs-to Tenant |

#### Key Types
```typescript
interface TenantConfig {
  tenantId: string;
  hierarchy: HierarchyLevel;
  overrides: Map<string, ConfigValue>;
  // ... extracted fields
}
```

### 3. Config Structures

**What to extract:**
- Configuration hierarchy (if any): levels, inheritance, override rules
- Config file formats: XML, YAML, JSON, env vars, properties
- Configurable dimensions: what can be changed without code changes
- Default values and fallback behavior
- Feature flags and toggles

**Where to look:**

| Source | What to scan |
|--------|-------------|
| Reverse Engineer docs | `configuration-reference.md` |
| Config files | `application.yml`, `config/`, `.env.example`, XML configs |
| Real config data | User-provided paths (e.g., `~/.config/my-platform/`) |
| Code | Config loading logic, environment variable reads, feature flag checks |

**Special attention for hierarchical configs (like Config Service):**
```markdown
### Configuration Hierarchy
Level 0: Default (base config for all)
Level 1: Country (country-specific overrides)
Level 2: Brand (brand-specific overrides)
Level 3: Group (tenant group overrides)
Level 4: Tenant (individual tenant overrides)
Level 5: Site (individual site overrides)

Override rule: Lower level wins. Unset = inherit from parent.
```

### 4. Integration Points

**What to extract:**
- Outbound API calls: which external systems does this system call?
- Inbound API consumers: who calls this system's APIs?
- Shared data stores: databases, caches, file systems shared with other systems
- Event publishing: what events does this system emit?
- Event consuming: what events does this system listen for?
- SDK/library dependencies: shared libraries used across systems

**Where to look:**

| Source | What to scan |
|--------|-------------|
| Reverse Engineer docs | `integration-points.md` — the single source of truth |
| Code | HTTP client calls, SDK imports, queue publishers/consumers |
| Config | Connection strings, API URLs, queue names, topic ARNs |
| Infrastructure | Terraform/CloudFormation refs to shared resources |

**Output format:**
```markdown
### Integration Points

#### Outbound (this system calls)
| Target System | Protocol | Purpose | Auth | Criticality |
|---------------|----------|---------|------|-------------|
| User Service | REST | Tenant metadata | API Key | Critical — page won't render without |
| i18n Service | REST | Translated labels | None | Critical — UI text |

#### Inbound (others call this system)
| Caller | Protocol | Endpoint | Auth | Volume |
|--------|----------|----------|------|--------|
| Web App | REST | /api/config/{siteId} | Internal | ~10K req/min |

#### Shared Resources
| Resource | Type | Shared With | Access Pattern |
|----------|------|-------------|---------------|
| tenant-config-cache | Redis | Web App, Cache Service | Read-through cache |
```

### 5. Override/Inheritance Patterns

**What to extract:**
- How does configuration cascade from general to specific?
- What's the merge strategy (deep merge, shallow replace, append)?
- What's overridable vs. locked?
- How are overrides keyed (composite keys, simple keys)?

**This is critical for systems like Config Service where the override model IS the core business logic.**

### 6. Authentication & Authorization Model

**What to extract:**
- How does the system authenticate callers? (API key, OAuth, session, mutual TLS)
- What authorization model is used? (RBAC, ABAC, simple roles)
- How are permissions structured?
- Are there service-to-service auth patterns distinct from user auth?

### 7. Constraints & Limitations

**What to extract:**
- Rate limits (requests/second, requests/minute)
- Data size limits (max payload, max records)
- Latency requirements (SLA, p99 targets)
- Known limitations (can't do X, Y breaks under Z)
- Deprecation timeline (end-of-life dates, migration deadlines)

### 8. Pain Points

**What to extract:**
- Technical debt items from `technical-debt-analysis.md`
- Known bugs or workarounds from code comments (TODO, HACK, FIXME)
- Developer complaints from interactive input
- Performance bottlenecks from observability data
- Integration friction from consumer-side code (retry logic, error handling, workarounds)

---

## Profile Template

Each system profile follows this structure:

```markdown
# System Profile: {System Name}

> **Profiled by StackShift** | Date: {date} | Sources: {list of sources used}

## Overview
- **Name:** {name}
- **Role:** {Source of Truth | Consumer | Transformer | Orchestrator | Gateway}
- **Tech Stack:** {language, framework, runtime}
- **Repository:** {path or URL}
- **Status:** {Active | Legacy | Deprecated | Planned}
- **Owner:** {team or org}

## Capabilities
{List of business capabilities this system provides, grouped by domain}

## API Surface
{REST endpoints, GraphQL schema, events — see extraction format above}

## Data Models
{Core entities, key types, enums — see extraction format above}

## Configuration
{Config hierarchy, configurable dimensions, defaults}

## Integration Points
{Outbound calls, inbound consumers, shared resources — see extraction format above}

## Override/Inheritance Patterns
{How config cascades, merge strategy, override keys}

## Auth Model
{Authentication method, authorization model, service-to-service patterns}

## Constraints
{Rate limits, data limits, latency SLAs, known limitations}

## Pain Points
{Technical debt, known issues, developer frustrations, workarounds}
| Pain Point | Severity | Workaround | Innovation Opportunity |
|------------|----------|------------|----------------------|
| {description} | Critical/Major/Minor | {current workaround} | {how new platform could solve} |
```

---

## Parallelization

Phase 2 is the most parallelizable phase. Use Task agents to profile multiple systems concurrently:

```
Main Agent
  ├── Task Agent 1 → Profile Config Service
  ├── Task Agent 2 → Profile User Service
  ├── Task Agent 3 → Profile API Gateway
  ├── Task Agent 4 → Profile i18n Service
  └── Task Agent 5 → Profile Inventory Service
```

Each Task agent:
1. Reads available inputs for its assigned system
2. Extracts all 8 targets
3. Writes the system profile to `_integration-analysis/system-profiles/{name}.md`
4. Returns a summary to the main agent

**Important:** Task agents should NOT attempt cross-system analysis. That happens in Phase 3 with all profiles loaded.

---

## Quality Checklist

Before marking a profile complete:

- [ ] All 8 extraction targets addressed (or marked `[NOT APPLICABLE]` with reason)
- [ ] Sources cited for each major claim
- [ ] API endpoints include auth requirements
- [ ] Data models include field types and constraints
- [ ] Integration points include criticality assessment
- [ ] Pain points include severity and current workaround
- [ ] Config hierarchy documented if system uses inheritance
- [ ] Profile marked `[PARTIAL]` if code access was unavailable
