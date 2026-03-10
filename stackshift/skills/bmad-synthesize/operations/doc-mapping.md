# Document-to-Artifact Mapping Tables

Reference tables defining how each reverse-engineering doc maps to BMAD artifact sections.

---

## prd.md Mapping

```
Source -> BMAD PRD Section
-------------------------------------------------------------------
business-context.md
  +-- Product Vision           -> ## Product Vision
  +-- Target Users & Personas  -> ## Target Users
  +-- Business Goals           -> ## Success Criteria / ## KPIs
  +-- Competitive Landscape    -> ## Market Context
  +-- Stakeholder Map          -> ## Stakeholders
  +-- Business Constraints     -> ## Constraints & Assumptions

functional-specification.md
  +-- Functional Requirements  -> ## FR1: Title, ## FR2: Title, ...
  +-- Non-Functional Reqs      -> ## NFR1: Title, ## NFR2: Title, ...
  +-- User Stories             -> Embedded in FRs as acceptance criteria
  +-- Business Rules           -> ## Business Rules
  +-- System Boundaries        -> ## Scope
  +-- Success Criteria         -> ## Success Criteria
  +-- User Personas            -> Supplements ## Target Users
  +-- Product Positioning      -> Supplements ## Product Vision

technical-debt-analysis.md
  +-- Migration Priority Matrix -> ## Known Issues & Constraints
  +-- Security Vulnerabilities  -> ## NFR: Security Requirements

integration-points.md
  +-- External Services        -> ## External Dependencies
  +-- Auth Flows               -> ## NFR: Authentication & Authorization
```

## architecture.md Mapping

```
Source -> BMAD Architecture Section
-------------------------------------------------------------------
data-architecture.md
  +-- Data Models              -> ## Data Models
  +-- API Endpoints            -> ## API Contracts
  +-- Database ER Diagram      -> ## Data Layer
  +-- JSON/GraphQL Schemas     -> ## API Contracts (detail)
  +-- Domain Model / Contexts  -> ## Domain Model

integration-points.md
  +-- External Services        -> ## External Integrations
  +-- Internal Service Deps    -> ## Service Architecture
  +-- Data Flow Diagrams       -> ## System Architecture Diagram
  +-- Auth Flows               -> ## Authentication Architecture
  +-- Webhook Integrations     -> ## Event Architecture

operations-guide.md
  +-- Deployment Procedures    -> ## Deployment Architecture
  +-- Infrastructure Overview  -> ## Infrastructure
  +-- Scalability Strategy     -> ## Scalability & Performance
  +-- Monitoring               -> ## Observability Architecture

decision-rationale.md
  +-- Technology Selection     -> ## Technology Stack
  +-- ADRs                     -> ## ADR-001: Title, ## ADR-002: Title, ...
  +-- Design Principles        -> ## Design Principles
  +-- Trade-offs               -> ## Trade-offs & Constraints

configuration-reference.md
  +-- Environment Variables    -> ## Configuration Architecture
  +-- Feature Flags            -> ## Feature Management

observability-requirements.md
  +-- Logging Strategy         -> ## Observability Architecture
  +-- Monitoring Strategy      -> ## Monitoring & Alerting
  +-- Alerting Rules           -> ## SLA & SLO Targets
```

## epics.md Mapping

```
Source -> BMAD Epics
-------------------------------------------------------------------
functional-specification.md
  +-- FRs grouped by domain    -> ## Epic N: Domain Name
  +-- User Stories per FR      -> ### Story N.M: Title
  +-- Acceptance Criteria      -> Acceptance Criteria per story

business-context.md
  +-- Personas                 -> "As a [persona]..." in user stories
  +-- Business Goals           -> Epic priority ordering

technical-debt-analysis.md
  +-- Migration Priority Matrix -> ## Epic: Technical Debt Resolution
  +-- Quick Wins               -> High-priority stories in debt epic

integration-points.md
  +-- External Integrations    -> ## Epic: Integration & Connectivity
```

### Epic Grouping Strategy

1. Group FRs by domain/feature area (auth, data management, reporting, etc.)
2. Each group becomes an Epic.
3. Each FR within a group becomes a Story.
4. Add a "Technical Foundation" epic for infrastructure/debt items.
5. Add an "Integration" epic for external service work.
6. Order by priority: P0 epics first, then P1, P2, P3.
7. Group epics by domain: analyze FR titles and descriptions for common themes.
8. Assign each story the priority of its source FR.
9. Use story format: "As a [persona from business-context], I want [FR description], so that [business goal]".
10. Number ADRs sequentially from decision-rationale.md, preserving original order.

## ux-design-specification.md Mapping

```
Source -> BMAD UX Design Section
-------------------------------------------------------------------
visual-design-system.md
  +-- Component Library        -> ## Component Inventory
  +-- Design Tokens            -> ## Design Tokens
  +-- Responsive Breakpoints   -> ## Responsive Design
  +-- Accessibility Standards  -> ## Accessibility Requirements
  +-- User Flows               -> ## User Flows

business-context.md
  +-- Personas                 -> ## User Personas (with journey maps)
  +-- Business Constraints     -> ## Design Constraints

functional-specification.md
  +-- User Stories             -> ## Key User Journeys
  +-- Business Rules           -> ## Interaction Patterns
```

## Coverage Targets

| Artifact | Expected Coverage (11 docs) | Expected Coverage (9 docs, legacy) |
|---|---|---|
| prd.md | ~90% | ~60% |
| architecture.md | ~85% | ~70% |
| epics.md | ~75% | ~55% |
| ux-design-specification.md | ~65% | ~45% |
