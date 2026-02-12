---
name: architect
description: Generate a complete architecture document from reverse-engineering docs + user constraints. Asks 3-5 high-level questions (tech stack, cloud provider, scale, constraints), then generates architecture.md with Mermaid diagrams, service boundaries, ADRs, and infrastructure recommendations. Works standalone or as part of the BMAD Auto-Pilot workflow.
---

# Architecture Generator

**Generate a complete, opinionated architecture document from reverse-engineering docs + your constraints.**

**Estimated Time:** 10-20 minutes
**Prerequisites:** Gear 2 (Reverse Engineer) completed with all 11 docs
**Output:** `architecture.md` (standalone or in `_bmad-output/planning-artifacts/`)

---

## When to Use This Skill

Use this skill when:
- You have reverse-engineering docs and want an architecture document
- You're planning a migration and need to define the target architecture
- You want architecture recommendations based on code analysis + your constraints
- You need ADRs generated from actual codebase decisions
- You're reimagining a system and need a fresh architecture

**Trigger Phrases:**
- "Generate an architecture document"
- "Design the target architecture"
- "What architecture should we use?"
- "Create architecture with ADRs"
- "Plan the infrastructure"

---

## What This Skill Does

1. Reads all 11 reverse-engineering docs (understands current state)
2. Asks you 3-5 high-level constraint questions
3. Generates a complete architecture document that respects your constraints
4. Includes Mermaid diagrams, ADRs, and infrastructure recommendations
5. Bridges the gap between "what exists" and "what should be built"

---

## Process

### Step 1: Load Context

Read all available reverse-engineering docs from `docs/reverse-engineering/`:

**Primary architecture sources:**
- `data-architecture.md` — Current data models, API contracts, domain boundaries
- `integration-points.md` — External services, data flows, auth patterns
- `operations-guide.md` — Current deployment, infrastructure, scalability
- `decision-rationale.md` — Why current choices were made, trade-offs
- `configuration-reference.md` — Configuration landscape

**Supporting context:**
- `functional-specification.md` — What the system needs to do
- `business-context.md` — Business constraints, scale expectations, compliance
- `technical-debt-analysis.md` — What needs to change
- `observability-requirements.md` — Monitoring and logging needs

### Step 2: Ask Constraint Questions

Present these questions conversationally. Skip questions where the answer is already clear from the docs.

**Question 1: Tech Stack Preference**
```
What tech stack do you want for the architecture?

A) Same as current (documented in decision-rationale.md)
   → [Show detected stack: e.g., "TypeScript + Next.js + PostgreSQL"]

B) Let me specify
   → Ask: "What languages, frameworks, and databases?"
   → Examples: "Next.js 15 + TypeScript + Prisma + PostgreSQL"
   →           "Python + FastAPI + SQLAlchemy + PostgreSQL"
   →           "Go + Gin + GORM + PostgreSQL"

C) Recommend based on requirements
   → Analyze functional-spec + business-context
   → Recommend stack with rationale
```

**Question 2: Deployment Target**
```
Where will this run?

A) AWS (EC2, ECS, Lambda, RDS, etc.)
B) Google Cloud (GKE, Cloud Run, Cloud SQL, etc.)
C) Azure (AKS, App Service, Azure SQL, etc.)
D) Self-hosted / On-premise
E) Hybrid (specify)
F) Recommend based on requirements
```

**Question 3: Scale Expectations**
```
What scale should the architecture support?

A) Startup / MVP
   → Single-region, simple deployment, cost-optimized
   → 100s of users, minimal redundancy

B) Growing Product
   → Multi-AZ, auto-scaling, managed services
   → 1,000s - 10,000s of users

C) Enterprise / High-Scale
   → Multi-region, microservices-ready, full redundancy
   → 100,000s+ users, strict SLAs

D) Specify custom requirements
   → Ask for: expected users, requests/sec, data volume, SLA targets
```

**Question 4: Hard Constraints** (free text, optional)
```
Any hard constraints to keep in mind?

Examples:
- "Must be HIPAA compliant"
- "Budget under $500/month"
- "Team of 3 developers, keep it simple"
- "Must support offline mode"
- "No vendor lock-in"
- "Must use Kubernetes"

Enter constraints or press enter to skip:
```

**Question 5: Architecture Style** (only if not obvious from codebase)
```
What architecture style fits your needs?

A) Monolith (recommended for small teams / MVPs)
   → Single deployable, simpler operations
   → Can be modular monolith with clear boundaries

B) Microservices (recommended for larger teams / scale)
   → Independent deployments, team autonomy
   → Higher operational complexity

C) Serverless (recommended for event-driven / variable load)
   → Pay-per-use, auto-scaling
   → Cold start considerations

D) Hybrid (specify)

E) Recommend based on team size and requirements
```

### Step 3: Generate Architecture Document

Using the reverse-engineering docs + user constraints, generate a complete architecture document.

**Generation approach:**
1. Start from current architecture (from reverse-eng docs)
2. Apply user constraints as filters and preferences
3. Generate recommendations that bridge current → target state
4. Create ADRs justifying each major decision
5. Draw Mermaid diagrams for visual clarity

### Step 4: Write Output

**Standalone mode:** Write to `architecture.md` in project root or `docs/`

**BMAD mode:** Write to `_bmad-output/planning-artifacts/architecture.md`

---

## Output Structure

```markdown
# [Product Name] - Architecture Document

## 1. Architecture Overview

### 1.1 System Context Diagram

```mermaid
C4Context
  title System Context Diagram
  Person(user, "End User", "Primary user persona")
  System(app, "Application", "Core system")
  System_Ext(ext1, "External Service 1", "Description")
  System_Ext(ext2, "External Service 2", "Description")
  Rel(user, app, "Uses")
  Rel(app, ext1, "Calls API")
  Rel(app, ext2, "Sends events")
``​`

### 1.2 Architecture Style
[Monolith / Microservices / Serverless / Hybrid]
**Rationale:** [Why this style fits the constraints]

### 1.3 Key Design Principles
[From decision-rationale.md + user constraints]
- Principle 1: Description
- Principle 2: Description

---

## 2. Technology Stack

### 2.1 Core Technologies
| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| Language | [X] | [ver] | [why] |
| Framework | [X] | [ver] | [why] |
| Database | [X] | [ver] | [why] |
| Cache | [X] | [ver] | [why] |
| Queue | [X] | [ver] | [why] |

### 2.2 Infrastructure
| Component | Service | Rationale |
|-----------|---------|-----------|
| Compute | [EC2/ECS/Lambda/...] | [why] |
| Database | [RDS/Aurora/...] | [why] |
| Storage | [S3/EFS/...] | [why] |
| CDN | [CloudFront/...] | [why] |

---

## 3. System Architecture

### 3.1 Component Diagram

```mermaid
graph TB
  subgraph "Frontend"
    WEB[Web App]
    MOBILE[Mobile App]
  end
  subgraph "API Layer"
    GW[API Gateway]
    AUTH[Auth Service]
  end
  subgraph "Business Logic"
    SVC1[Service 1]
    SVC2[Service 2]
  end
  subgraph "Data Layer"
    DB[(Database)]
    CACHE[(Cache)]
    QUEUE[Message Queue]
  end
  WEB --> GW
  MOBILE --> GW
  GW --> AUTH
  GW --> SVC1
  GW --> SVC2
  SVC1 --> DB
  SVC1 --> CACHE
  SVC2 --> QUEUE
``​`

### 3.2 Service Boundaries
[From data-architecture.md Domain Model + decisions]

| Service | Responsibility | Domain | Dependencies |
|---------|---------------|--------|-------------|
| [Name] | [What it does] | [Domain] | [Other services] |

### 3.3 Data Flow

```mermaid
sequenceDiagram
  participant U as User
  participant F as Frontend
  participant A as API
  participant D as Database
  U->>F: Action
  F->>A: API Request
  A->>D: Query
  D-->>A: Result
  A-->>F: Response
  F-->>U: Update UI
``​`

---

## 4. Data Architecture

### 4.1 Domain Model
[From data-architecture.md Domain Model / Bounded Contexts]

### 4.2 Data Models
[From data-architecture.md — adapted to target stack]

### 4.3 Data Flow
- Where data enters the system
- How it's transformed
- Where it's stored
- How it's accessed

### 4.4 Database Strategy
- Primary database: [type, why]
- Read replicas: [if applicable]
- Caching layer: [strategy]
- Data retention: [policy]

---

## 5. API Design

### 5.1 API Style
[REST / GraphQL / gRPC — with rationale]

### 5.2 Key Endpoints
[From data-architecture.md API Endpoints — adapted to target]

### 5.3 Authentication & Authorization
[From integration-points.md Auth Flows]

---

## 6. Infrastructure & Deployment

### 6.1 Infrastructure Diagram

```mermaid
graph TB
  subgraph "Cloud Provider"
    subgraph "Region"
      subgraph "AZ-1"
        APP1[App Instance]
        DB1[(Primary DB)]
      end
      subgraph "AZ-2"
        APP2[App Instance]
        DB2[(Replica)]
      end
    end
    LB[Load Balancer]
    CDN[CDN]
  end
  CDN --> LB
  LB --> APP1
  LB --> APP2
  APP1 --> DB1
  DB1 --> DB2
``​`

### 6.2 Deployment Strategy
- CI/CD pipeline
- Blue/green or rolling deployments
- Environment strategy (dev, staging, production)

### 6.3 Scaling Strategy
[From operations-guide.md Scalability Strategy + user scale constraints]

### 6.4 Cost Estimation
[Based on cloud provider + scale expectations]
- Compute: $X/month
- Database: $X/month
- Storage: $X/month
- Network: $X/month
- **Total estimated:** $X/month

---

## 7. Security Architecture

### 7.1 Security Model
[From integration-points.md Auth + business-context Compliance]
- Authentication method
- Authorization model
- Data encryption (at rest, in transit)
- Secrets management

### 7.2 Compliance Requirements
[From business-context.md Business Constraints]

---

## 8. Observability

### 8.1 Logging
[From observability-requirements.md]

### 8.2 Monitoring & Alerting
[From observability-requirements.md]

### 8.3 SLAs & SLOs
[Based on scale expectations]

---

## 9. Architectural Decision Records

### ADR-001: [Decision Title]
**Status:** Accepted
**Context:** [What problem needed solving]
**Decision:** [What was decided]
**Rationale:** [Why this choice]
**Consequences:** [Trade-offs and implications]
**Alternatives Considered:** [What else was evaluated]

### ADR-002: [Decision Title]
...

[Generate ADRs for: architecture style, database choice, cloud provider,
 auth approach, API style, deployment strategy, and any other major decisions.
 Source from decision-rationale.md where available, generate new ones for
 target-state decisions.]

---

## 10. Migration Path (if applicable)

### 10.1 Current → Target State
[From technical-debt-analysis.md Migration Priority Matrix]

### 10.2 Migration Phases
- Phase 1: [Foundation — infrastructure, CI/CD]
- Phase 2: [Core — primary services, database]
- Phase 3: [Integration — external services, migration]
- Phase 4: [Optimization — performance, monitoring]

### 10.3 Risk Mitigation
- Rollback strategy
- Feature flags for gradual rollout
- Data migration approach
```

---

## Integration with Other Skills

### With BMAD Synthesize
- Architecture Generator can run as part of `/stackshift.bmad-synthesize`
- Or run standalone for more detailed architecture with user constraints
- Output is compatible with BMAD's architecture.md format

### With Reimagine
- `/stackshift.reimagine` may call this skill to generate architecture for the reimagined system
- Constraint questions informed by multi-repo capability analysis

### With Spec Kit
- Architecture document supplements `.specify/` structure
- Can be referenced from feature specs as architectural context

---

## Success Criteria

- ✅ Architecture document generated with all 10 sections
- ✅ Mermaid diagrams included (context, component, data flow, infrastructure)
- ✅ ADRs generated for all major decisions
- ✅ User constraints respected throughout
- ✅ Cost estimation included (if cloud deployment)
- ✅ Migration path included (if brownfield/evolution)
- ✅ Technology stack justified with rationale

---

## Technical Notes

- Read all 11 reverse-eng docs in parallel for speed
- Use Mermaid C4 notation for system context diagrams where appropriate
- Generate minimum 3 ADRs, maximum ~10 (focus on consequential decisions)
- Cost estimates are rough approximations — flag as estimates
- For "Recommend" answers, analyze functional requirements + NFRs + business constraints to make informed suggestions
- If running as part of BMAD Synthesize, share parsed doc context (don't re-read)
