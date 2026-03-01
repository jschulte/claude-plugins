# Cross-System Mapping — Phase 3 Operation

**Purpose:** Analyze integration surfaces between all profiled systems.
**Called from:** SKILL.md Phase 3
**Output:** `capability-map.md`, `integration-contracts.md`, `data-architecture.md`

---

## Overview

This is the core analytical phase. With all system profiles in hand, we now look across systems to find:
- **Shared capabilities** — the same business function served by multiple systems
- **Integration contracts** — the API surfaces where systems connect
- **Shared data** — entities that appear in multiple systems (with conflicts)
- **End-to-end flows** — user journeys that cross system boundaries
- **Dependencies** — who depends on whom, and how deeply

This phase should run in the **main context** (not delegated to subagents) because it requires synthesizing information from all profiles simultaneously.

---

## Step 1: Capability Mapping

### Process

1. **Extract all capabilities** from every system profile's "Capabilities" section
2. **Normalize capability names** — same business function may have different names across systems
3. **Group by business domain** — e.g., "Inventory", "Configuration", "Content Management", "Analytics"
4. **Map participation** — for each capability, which systems participate and in what role?

### Participation Roles

| Role | Meaning |
|------|---------|
| **Primary** | Owns the core logic and data for this capability |
| **Secondary** | Provides supporting functionality |
| **Consumer** | Only reads/uses the capability's output |
| **Duplicates** | Independently implements the same capability (integration smell) |

### Output Format

```markdown
# Capability Map

## Summary
- **Total capabilities identified:** {N}
- **Cross-system capabilities (2+ systems):** {N}
- **Single-system capabilities:** {N}
- **Duplicated capabilities (same logic, multiple systems):** {N}

## By Business Domain

### Domain: Tenant Configuration
| Capability | Config Svc | User Svc | Web App | API GW | Notes |
|------------|-----------|----------|---------|--------|-------|
| Tenant metadata storage | Primary | Duplicates | Consumer | Consumer | CONFLICT: Both Config Svc and User Svc store tenant metadata |
| Config hierarchy resolution | Primary | - | Consumer | - | Config Svc is sole owner |
| Override management | Primary | - | - | - | |
| Site-level customization | Primary | - | Consumer | - | |

### Domain: Content & Layout
| Capability | Web App | Config Svc | API GW | Notes |
|------------|---------|-----------|--------|-------|
| Page layout resolution | Primary | Secondary (provides config) | - | |
| Widget rendering | Primary | - | Secondary (provides data) | |
| Template selection | Primary | Secondary (provides variation) | - | |

### Domain: Inventory
...
```

### Mermaid Visualization

Generate a capability-centric Mermaid diagram:

```markdown
```mermaid
graph TB
    subgraph "Tenant Configuration"
        TC[Tenant Config] --> CS[Config Svc]
        TC --> US[User Svc]
        TC -.-> WA[Web App]
    end
    subgraph "Content & Layout"
        CL[Page Layout] --> WA
        CL -.-> CS
        WR[Widget Rendering] --> WA
        WR -.-> AG[API Gateway]
    end
    subgraph "Inventory"
        INV[Inventory Data] --> IS[Inventory Svc]
        INV -.-> AG
    end
```
```

**Legend:** Solid arrows = Primary/Secondary. Dashed arrows = Consumer.

---

## Step 2: Integration Contract Documentation

### Process

1. **For each pair of systems that integrate**, document the contract
2. **Prioritize** — document the most critical integrations first
3. **Include both directions** — System A calls B AND B calls A (if bidirectional)
4. **Note asymmetries** — where one system knows about another but not vice versa

### Per-Contract Documentation

For each system-to-system integration:

```markdown
## Contract: {System A} → {System B}

### Overview
- **Direction:** {A calls B | B calls A | Bidirectional}
- **Protocol:** {REST | GraphQL | Event/Message | Shared DB | File | SDK}
- **Criticality:** {Critical | Important | Optional}
  - Critical = calling system fails without this
  - Important = degraded experience without this
  - Optional = enhancement only

### Endpoints / Interfaces
| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| /api/v2/config/{siteId} | GET | Fetch site config | API Key |

### Data Exchange
| Direction | Payload Type | Key Fields | Format |
|-----------|-------------|------------|--------|
| Request | SiteConfigRequest | siteId, locale | JSON |
| Response | SiteConfig | pages, widgets, theme | JSON |

### Error Handling
| Error | HTTP Code | Caller Behavior |
|-------|-----------|----------------|
| Site not found | 404 | Show default page |
| Service unavailable | 503 | Serve from cache |
| Rate limited | 429 | Exponential backoff |

### Known Issues
- {Issue description and current workaround}

### SLA / Performance
- **Expected latency:** {p50, p99}
- **Rate limit:** {requests/second}
- **Availability:** {uptime target}
```

### Contract Matrix

Generate a summary matrix showing all integrations:

```markdown
### Integration Matrix

|  | Config Svc | User Svc | Web App | API GW | i18n Svc | Inventory Svc |
|--|-----------|----------|---------|--------|----------|---------------|
| **Config Svc** | - | REST→ | REST← | - | - | - |
| **User Svc** | REST← | - | REST← | REST← | - | - |
| **Web App** | REST→ | REST→ | - | REST→ | REST→ | - |
| **API GW** | - | REST→ | REST← | - | - | REST→ |
| **i18n Svc** | - | - | REST← | - | - | - |
| **Inventory Svc** | - | - | - | REST← | - | - |

→ = row system calls column system
← = column system calls row system
```

---

## Step 3: Shared Data Model Analysis

### Process

1. **Identify shared entities** — same real-world concept appearing in multiple systems
2. **Map field-level correspondence** — which fields map to which?
3. **Detect conflicts** — different types, different constraints, different defaults
4. **Determine source of truth** — for each field, which system is authoritative?
5. **Document transformations** — how data changes as it crosses boundaries

### Shared Entity Analysis

For each entity that appears in 2+ systems:

```markdown
## Shared Entity: Tenant

### Representations
| System | Type Name | Key Fields | Source |
|--------|-----------|------------|--------|
| Config Service | TenantConfig | tenantId, name, brand, group, hierarchy | Primary (config) |
| User Service | TenantRecord | id, tenantName, brandCode, groupId | Primary (metadata) |
| Web App | TenantContext | tenantId, name, brand | Consumer (merged) |

### Field Mapping
| Concept | Config Svc Field | User Svc Field | Web App Field | Conflict? |
|---------|-----------------|----------------|---------------|-----------|
| Tenant ID | tenantId (string) | id (number) | tenantId (string) | YES: number vs string |
| Name | name | tenantName | name | No (same concept, different field name) |
| Brand | brand (string) | brandCode (enum) | brand (string) | YES: free text vs enum |

### Source of Truth
| Field | Authoritative System | Reason |
|-------|---------------------|--------|
| Tenant ID | User Service | User Service is the system of record for tenant identity |
| Config overrides | Config Service | Config Service owns the config hierarchy |
| Tenant name | User Service | User Service is the master data source |

### Conflicts Requiring Resolution
| Conflict | Severity | Resolution Strategy |
|----------|----------|-------------------|
| tenantId: string vs number | BLOCKING | Standardize on string in new platform |
| brand: free text vs enum | DEGRADING | Use enum as canonical, map free text |
```

### Data Flow Diagram

For key user journeys, trace data across systems:

```markdown
### Flow: Page Render

```mermaid
sequenceDiagram
    participant Browser
    participant WA as Web App
    participant CS as Config Service
    participant US as User Service
    participant AG as API Gateway
    participant LS as i18n Service

    Browser->>WA: GET /tenant-page
    WA->>CS: GET /config/{siteId}
    CS-->>WA: SiteConfig (pages, widgets, theme)
    WA->>US: GET /tenant/{tenantId}
    US-->>WA: TenantRecord (name, address, hours)
    WA->>LS: GET /labels/{locale}
    LS-->>WA: Labels (UI strings)
    WA->>AG: GET /inventory/{tenantId}
    AG-->>WA: InventorySummary
    WA-->>Browser: Rendered HTML
```
```

---

## Step 4: End-to-End Flow Tracing

### Process

1. **Identify key user journeys** that cross system boundaries
2. **Trace the data path** through each system
3. **Note transformations** — where data changes shape
4. **Identify failure points** — where the flow breaks if a system is down
5. **Measure system span** — how many systems does this flow touch?

### Flow Template

```markdown
### Flow: {Flow Name}

**Trigger:** {User action or system event}
**Systems involved:** {list}
**Critical path:** {which systems MUST respond for the flow to work?}
**Graceful degradation:** {what happens if optional systems are down?}

**Steps:**
1. {Actor} → {System A}: {action} ({data})
2. {System A} → {System B}: {action} ({data})
3. {System B} → {System A}: {response} ({data})
4. {System A} → {Actor}: {result}

**Failure modes:**
| System Down | Impact | Mitigation |
|-------------|--------|------------|
| {System B} | {description} | {cache / fallback / error} |
```

---

## Step 5: Dependency Matrix Generation

### Process

1. **Build adjacency matrix** from integration contracts
2. **Calculate dependency depth** — transitive dependencies (A→B→C means A depends on C)
3. **Identify circular dependencies** — A→B→A (integration smell)
4. **Calculate fan-in/fan-out** — systems with high fan-in are critical infrastructure
5. **Identify orphan systems** — systems with no integrations (verify they belong in scope)

### Metrics

```markdown
### Dependency Metrics

| System | Fan-In | Fan-Out | Depth | Role |
|--------|--------|---------|-------|------|
| Config Service | 3 | 0 | 0 | Pure provider (critical infrastructure) |
| User Service | 3 | 1 | 1 | Provider with one dependency |
| Web App | 0 | 4 | 2 | Pure consumer (orchestrator) |
| API Gateway | 1 | 2 | 2 | Middleman |

**Fan-in** = number of systems that depend on this system
**Fan-out** = number of systems this system depends on
**Depth** = longest dependency chain from this system

**Critical infrastructure** (high fan-in): Config Service, User Service, i18n Service
**Orchestrators** (high fan-out): Web App
**Middlemen** (both): API Gateway
```

---

## Step 6: Duplication Detection

### Process

1. **Compare capabilities** across systems for functional overlap
2. **Compare data models** for structural overlap
3. **Compare API contracts** for redundant endpoints
4. **Classify duplication type:**

| Type | Description | Example |
|------|-------------|---------|
| **Functional duplication** | Same business logic in multiple systems | Email sending in 3 services |
| **Data duplication** | Same data stored in multiple systems | Tenant name in Config Service and User Service |
| **API duplication** | Same data available via multiple APIs | Tenant info from Config Service API and User Service API |
| **Logic divergence** | Same concept, different rules | Price calculation differs between systems |

### Output

```markdown
### Duplication Registry

| What's Duplicated | Systems | Type | Risk | Recommendation |
|-------------------|---------|------|------|----------------|
| Tenant metadata | Config Service, User Service | Data duplication | HIGH — data divergence | Designate single source of truth |
| Label resolution | Web App, API Gateway | Functional duplication | MEDIUM — inconsistent labels | Centralize in i18n Service |
```

---

## Quality Checklist

Before completing Phase 3:

- [ ] Capability map covers all capabilities from all system profiles
- [ ] Each capability has participation roles assigned (Primary/Secondary/Consumer/Duplicates)
- [ ] Integration contracts documented for all system-to-system boundaries
- [ ] Each contract includes protocol, auth, error handling, and SLA
- [ ] Shared entities identified with field-level mapping
- [ ] Source of truth designated for each shared field
- [ ] Conflicts flagged with severity (BLOCKING/DEGRADING/COSMETIC)
- [ ] At least 2-3 key flows traced end-to-end with sequence diagrams
- [ ] Dependency matrix generated with fan-in/fan-out metrics
- [ ] Duplication detected and classified
- [ ] Mermaid diagrams generated for capability map and data flows
