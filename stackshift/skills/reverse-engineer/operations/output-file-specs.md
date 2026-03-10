# Output File Specifications

Reference for the 11 documentation files generated in `docs/reverse-engineering/`.
For each file, apply the greenfield or brownfield variant based on the ROUTE variable.

---

## 1. functional-specification.md
**Focus:** Business logic, WHAT the system does (not HOW)

**Sections:**
- Executive Summary (purpose, users, value)
- **User Personas** (inferred from user-facing features, auth roles, UI flows)
  - For each persona: Name, Role, Goals, Pain Points, Key Workflows
  - Greenfield: Infer from feature set and user stories
  - Brownfield: Infer from auth roles, UI routes, API consumers
- **Product Positioning** (inferred from README, package description, marketing copy)
  - What problem does this solve?
  - Who is the target audience?
  - What makes this approach unique?
- Functional Requirements (FR-001, FR-002, ...)
- User Stories (P0/P1/P2/P3 priorities, tied to personas)
- Non-Functional Requirements (NFR-001, ...)
- Business Rules (validation, authorization, workflows)
- System Boundaries (scope, integrations)
- Success Criteria (measurable outcomes)

**Critical:** Framework-agnostic, testable, measurable. Personas and positioning may be partially inferred -- mark uncertain items with `[INFERRED]`.

## 2. integration-points.md
**Single source of truth** for all external dependencies and data flows.

**Sections:**
- **External Services & APIs Consumed**
  - For each: Service name, purpose, authentication method, endpoints used
  - SDKs and client libraries in use
  - Rate limits and quotas (if documented)
- **Internal Service Dependencies** (for microservices/monorepos)
  - Service-to-service calls
  - Shared databases or message queues
  - Event bus / pub-sub topics
- **Data Flow Diagrams** (Mermaid)
  - Request flows for key user journeys
  - Data pipeline flows (ETL, streaming)
  - Event propagation paths
- **Authentication & Authorization Flows**
  - OAuth/OIDC providers
  - Token lifecycle
  - Permission model
- **Third-Party SDK Usage**
  - Payment processors, email providers, analytics
  - Version pinning and update strategy
- **Webhook & Event Integrations**
  - Incoming webhooks (endpoints, payloads)
  - Outgoing events (triggers, formats)
  - Retry and failure handling

## 3. configuration-reference.md
**Complete inventory** of all configuration:
- Environment variables
- Config file options
- Feature flags
- Secrets and credentials (how managed)
- Default values

## 4. data-architecture.md
**All data models and API contracts:**
- Data models (with field types, constraints, relationships)
- API endpoints (request/response formats)
- JSON Schemas
- GraphQL schemas (if applicable)
- Database ER diagram (textual)
- **Domain Model / Bounded Contexts**
  - Identify natural domain boundaries in the codebase
  - Map aggregates and entities per domain
  - Document cross-domain relationships and dependencies
  - Greenfield: Abstract domain model (implementation-agnostic)
  - Brownfield: Current domain boundaries with file/module mapping

## 5. operations-guide.md
**Deployment and maintenance:**
- Deployment procedures
- Infrastructure overview
- Monitoring and alerting
- Backup and recovery
- Troubleshooting runbooks
- **Scalability & Growth Strategy**
  - Current bottlenecks and capacity limits
  - Horizontal vs vertical scaling opportunities
  - Caching strategy (current and recommended)
  - Database scaling approach (read replicas, sharding, partitioning)
  - CDN and edge deployment opportunities
  - Greenfield: Scalability requirements and targets
  - Brownfield: Current capacity + recommended evolution

## 6. technical-debt-analysis.md
**Issues and improvements:**
- Code quality issues
- Missing tests
- Security vulnerabilities
- Performance bottlenecks
- Refactoring opportunities
- **Migration Priority Matrix**
  - Categorize all debt items by: Impact (High/Medium/Low) x Effort (High/Medium/Low)
  - Quadrant mapping:
    - **Quick Wins**: High Impact + Low Effort (do first)
    - **Strategic**: High Impact + High Effort (plan carefully)
    - **Fill-ins**: Low Impact + Low Effort (do opportunistically)
    - **Deprioritize**: Low Impact + High Effort (defer or skip)
  - Dependency ordering: Which items must be done before others?
  - Estimated effort per item (hours/days)
  - Suggested migration phases with ordering

## 7. observability-requirements.md
**Logging, monitoring, alerting:**
- What to log (events, errors, metrics)
- Monitoring requirements (uptime, latency, errors)
- Alerting rules and thresholds
- Debugging capabilities

## 8. visual-design-system.md
**UI/UX patterns:**
- Component library
- Design tokens (colors, typography, spacing)
- Responsive breakpoints
- Accessibility standards
- User flows

## 9. test-documentation.md
**Testing requirements:**
- Test strategy
- Coverage requirements
- Test patterns and conventions
- E2E scenarios
- Performance testing

## 10. business-context.md
**Product vision and business context -- the "why" behind the system.**

Use all available signals (README, comments, naming, config, git history) to infer as much as possible. Mark uncertain items with `[INFERRED]` and genuinely unknown items with `[NEEDS USER INPUT]`.

**Sections:**

- **Product Vision**
  - What problem does this product solve?
  - What is the core value proposition?
  - What would the elevator pitch be?
  - Infer from: README, package description, landing pages, app title/tagline

- **Target Users & Personas**
  - Primary persona (the main user -- infer from UI flows, auth roles)
  - Secondary personas (admins, API consumers, operators)
  - For each: Goals, pain points, technical sophistication
  - Infer from: Auth roles, UI complexity, API design, error messages

- **Business Goals & Success Metrics**
  - What does success look like for this product?
  - Revenue model (if detectable: SaaS, marketplace, enterprise, etc.)
  - Growth metrics (users, transactions, data volume)
  - Infer from: Pricing pages, subscription models, analytics integrations, billing code

- **Competitive Landscape** `[INFERRED]`
  - What category does this product compete in?
  - What alternatives likely exist?
  - What differentiates this approach?
  - Infer from: Feature set, technology choices, target market signals

- **Stakeholder Map**
  - End users (who uses the product)
  - Operators (who deploys and maintains)
  - Decision makers (who approves changes -- infer from approval workflows, CODEOWNERS)
  - API consumers (downstream systems)
  - Infer from: Auth roles, admin panels, API keys, deployment scripts

- **Business Constraints**
  - Compliance & regulatory (HIPAA, GDPR, SOC2 -- infer from data handling patterns)
  - Budget indicators (cloud provider choices, self-hosted vs managed)
  - Team size indicators (CODEOWNERS, commit patterns, PR templates)
  - Timeline pressure (TODO density, shortcut patterns, technical debt level)

- **Market Context** `[INFERRED]`
  - Industry vertical (healthcare, fintech, e-commerce, developer tools, etc.)
  - Market maturity signals
  - Infer from: Domain vocabulary, data models, compliance patterns

**Greenfield vs Brownfield:**
- Greenfield: Focus on what the product DOES and WHO it serves (inform new implementation choices)
- Brownfield: Focus on what the product DOES, WHO it serves, and WHY it was built this way (inform maintenance decisions)

## 11. decision-rationale.md
**Technology selection rationale and architectural decisions -- the "why" behind technical choices.**

Much of this can be inferred from configuration files, dependency choices, and code patterns. Mark inferred items with `[INFERRED]`.

**Sections:**

- **Technology Selection**
  - **Language**: Why this language? (Infer from ecosystem, team patterns, problem domain fit)
  - **Framework**: Why this framework? (Infer from features used, configuration complexity, alternatives in package.json history)
  - **Database**: Why this database? (Infer from data patterns, query complexity, scaling needs)
  - **Infrastructure**: Why this deployment model? (Infer from IaC files, cloud provider, container setup)
  - For each: Document what was chosen, why it fits, and what alternatives were likely considered

- **Architectural Decisions (ADR Format)**
  - Extract key decisions visible in the codebase
  - For each decision:
    - **Context**: What problem was being solved?
    - **Decision**: What was chosen?
    - **Rationale**: Why was this the right choice? `[INFERRED]`
    - **Consequences**: What trade-offs resulted?
  - Example decisions to look for:
    - Monolith vs microservices (infer from project structure)
    - REST vs GraphQL vs gRPC (infer from API implementation)
    - SQL vs NoSQL (infer from database choice)
    - Server-side vs client-side rendering (infer from framework)
    - Authentication approach (infer from auth implementation)
    - State management approach (infer from frontend architecture)
    - Testing strategy (infer from test framework and patterns)

- **Design Principles** (inferred from code patterns)
  - What values does the codebase prioritize?
  - Examples: "Type safety over convenience" (strict TypeScript), "Convention over configuration" (Rails/Next.js), "Explicit over implicit" (Go-style error handling)
  - Infer from: Linter config strictness, type system usage, error handling patterns, abstraction levels

- **Trade-offs Made**
  - What was sacrificed for what? Cross-reference with technical-debt-analysis.md
  - Examples: "Speed over safety" (few tests), "Simplicity over scalability" (monolith), "Control over convenience" (no ORM)
  - Look for: Missing features that similar products have, unusually simple or complex implementations, comments explaining shortcuts

- **Historical Context** (if detectable)
  - Major refactors visible in git history
  - Deprecated patterns still present
  - Migration artifacts (old config files, compatibility layers)
  - Infer from: Git history, deprecated code, TODO/FIXME comments, version suffixes

**Greenfield vs Brownfield:**
- Greenfield: Focus on WHAT decisions were made and WHY -- helps inform whether to repeat or diverge
- Brownfield: Focus on WHAT, WHY, and WHAT TO CHANGE -- helps inform evolution strategy
