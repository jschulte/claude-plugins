---
name: health-audit-ops
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed ops and deployment readiness audit that scores CI/CD, deployment safety, containers, infrastructure as code, environment parity, monitoring, secrets, disaster recovery, scaling, incident response, and supply chain ops; produces a bar-chart scorecard with separate engineering and live-harm grades, and only flags problems it can prove from repository artifacts.
---

# Ops & Deployment Readiness Audit Skill

Use this skill when the user wants a deep audit of a codebase's operational readiness — can this thing be safely deployed, monitored, rolled back, and operated in production? The skill may audit the whole operational layer or focus on a user-specified deploy path, environment, CI workflow, infrastructure slice, secret surface, or observability concern. This is not a code quality audit (health-audit covers that). This is the operational layer: CI/CD pipelines, infrastructure as code, deployment safety, monitoring and observability, secret management, disaster recovery, scaling, and incident response.

## Mission

Perform a rigorous, evidence-backed assessment of a repository's operational maturity and deployment readiness. Evaluate everything visible in the repo that affects how the software gets built, shipped, run, monitored, and recovered: CI/CD configs, Dockerfiles, IaC definitions, monitoring configs, deployment scripts, runbooks, and environment setup.

Think like an SRE who just joined the team and needs to understand how this thing runs. Think like an incident commander at 3 AM — what's going to help or hurt?

Do not produce vague "best practices" fluff. Do not invent operational problems. Do not criticize the absence of infrastructure that may exist outside the repository (managed services, external monitoring platforms, vendor-hosted tooling). DO flag when the repo has zero operational concerns addressed — that itself is a significant finding.

### Focus Prompt Support

This skill can take an optional prompt that describes the ops area to focus on.

Examples:
- "Focus on the deploy pipeline"
- "Review Kubernetes manifests and rollout safety"
- "Audit secrets handling"
- "Look at monitoring and alert coverage"
- "Review environment parity between staging and production"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete pipelines, scripts, IaC, environment configs, runtime manifests, and monitoring artifacts
- Audit out-of-scope areas only when they are required to explain an in-scope operational risk
- Keep findings, scores, and recommendations scoped to that area instead of implying a full operational-readiness grade
- State assumptions, included environments, excluded environments, and unverifiable external tooling plainly

If the prompt is ambiguous, infer the most likely scope from CI config, deployment scripts, infra directories, environment names, and monitoring references, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists (CI configs, Dockerfiles, IaC files, scripts)
2. **The specific configuration, code, or pattern** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world operational harm** — what breaks, who gets paged, what's the blast radius
4. **A second instance or a corroborating signal** (a reproduction, a failing test, a call path traced end to end) that confirms the problem is real. A one-off defect qualifies once you have reproduced or traced it; it does not need a twin

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical SRE would say "yeah, that's a real operational risk." |
| **Probable** | Strong signals but missing one criterion (e.g., not reproduced or traced end to end, or harm is inferred from common failure modes rather than proven). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call an operational problem. |
| **Question** | Something that looks off but needs human confirmation or knowledge of external infrastructure to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Active operational risk or imminent production danger | Deployments that can't be rolled back, secrets in plaintext, no CI on the deploy path, missing health checks on production services, data-destroying migrations with no guard |
| 🟠 **High** | Significant drag on operational reliability or deploy velocity | Slow/fragile pipelines, missing monitoring on critical paths, no deployment smoke tests, environment drift that will cause production surprises |
| 🟡 **Medium** | Meaningful but contained operational gap | Missing caching in CI, incomplete alerting coverage, Dockerfile inefficiencies, partial IaC coverage |
| 🔵 **Low** | Improvement opportunities | Better tagging strategy, enhanced logging, documentation improvements, optimization of build times |

### Scoring Discipline

Do **not** force a whole-system ops score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope

- Determine whether the user asked for a full operational audit or a focused audit
- Translate any focus prompt into concrete environments, pipelines, manifests, scripts, and monitoring artifacts
- Identify adjacent systems that materially affect the in-scope operational path
- State what is in scope and what is out of scope
- If the requested path spans build, deploy, runtime, and monitoring, follow the full path instead of reviewing one layer in isolation

### Phase 1: Understand the System

- Determine what the product appears to do and how it's deployed
- Identify the deployment target (cloud provider, container orchestrator, serverless, bare metal — whatever the repo reveals)
- Map the path from code commit to production (CI configs, deployment scripts, IaC)
- Identify what environments exist (dev, staging, prod) from configs and scripts
- Find the critical operational paths — what must stay running, what's the cost of downtime
- Determine whether ops concerns are handled in-repo or externally (look for signals: references to external dashboards, links to runbooks hosted elsewhere, comments mentioning external tools)

### Phase 2: Scan for Evidence

- CI/CD pipeline configuration and completeness
- Deployment scripts, strategies, and safety mechanisms
- Dockerfile quality and container configuration
- Infrastructure as Code presence, coverage, and quality
- Environment configuration and parity signals
- Monitoring, alerting, and observability setup
- Secret handling patterns and exposure risks
- Backup, recovery, and disaster preparedness signals
- Scaling configuration and resource management
- Incident response documentation and tooling
- Dependency update and supply chain security automation

### Phase 3: Validate Before Accusing

For each potential finding, ask:
- Is this a real operational risk, or am I applying a standard that doesn't fit this project's scale?
- What proves it? Can I point to a specific file, config, or absence?
- Could this be handled by an external service or platform not visible in the repo?
- Does it materially affect deployment safety, reliability, or incident response?
- Is there a legitimate reason for this approach (cost, team size, project stage)?
- If something is missing, are there signals it exists elsewhere?

### Phase 4: Synthesize

- Group issues into systemic operational themes
- Identify the most dangerous gaps — what will hurt first and worst
- Separate quick wins (add a health check endpoint) from structural problems (redesign deployment pipeline)
- Cross-reference findings across categories to surface root causes
- Distinguish between "missing" and "exists elsewhere" — if you see references to external monitoring, note it rather than flagging monitoring as absent
- Keep conclusions scoped to the reviewed operational surface unless the evidence truly supports a wider claim

---

## Analysis Categories

Analyze the repository's operational posture through each category independently. A single operational gap may appear under multiple categories if it has cross-cutting impact — that's expected and useful. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. CI/CD Pipeline Health

Evaluate the build and integration pipeline — the first line of defense against bad deployments:

- **Pipeline configuration quality**: Is the CI/CD defined as code (GitHub Actions, GitLab CI, CircleCI, Jenkins pipelines, etc.)? Are workflows well-structured with clear job names, logical grouping, and appropriate triggers? Or is it a monolithic run-everything job?
- **Job structure and parallelization**: Are independent jobs parallelized? Are there unnecessary sequential dependencies? Is the DAG of jobs sensible for the work being done?
- **Caching strategy**: Are dependency installs cached (node_modules, pip cache, Maven repo)? Are build artifacts cached between jobs? Are Docker layers cached? Missing caching signals slow, expensive pipelines.
- **Pipeline speed signals**: Look for signs of pipeline duration — number of steps, heavy operations without caching, full test suites on every push instead of selective running. Long pipelines slow deployment velocity.
- **Failure notification**: Are pipeline failures configured to notify (Slack, email, PR comments)? Or do they fail silently, leaving broken builds unnoticed?
- **Branch protection and required checks**: Are there branch protection rules enforced via CI? Are there required status checks before merge? Is the main/production branch protected?
- **Test and quality gates**: Does the pipeline run tests, linting, type checking, security scanning? Are these blocking or advisory? Are there different gate levels for different branches?
- **Pipeline maintenance signals**: Are there pinned action versions vs. floating tags? Are there deprecated actions or runners? Are matrix builds used appropriately?

**Evidence bar**: Show the actual CI configuration files, point to specific job definitions, identify missing stages or inefficient patterns. Compare what the pipeline does against what the codebase requires (e.g., a TypeScript project with no type-checking step). Quantify where possible — number of jobs, estimated pipeline duration from step count.

---

### 2. Deployment Safety

This is where deployments go right or catastrophically wrong:

- **Deployment strategy**: Is there evidence of blue-green, canary, rolling, or gradual deployment? Or does it appear to be big-bang (push and pray)? Check deployment scripts, IaC, and CI deploy jobs for strategy signals.
- **Rollback capability**: Can a failed deployment be rolled back? Is there a rollback script, a previous-version reference, or container image tagging that enables rollback? Or would rollback require manual intervention?
- **Deployment scripts quality**: Are deploy scripts idempotent? Do they handle partial failures? Are they documented? Do they have error handling, or do they `set -e` and hope?
- **Database migration safety**: Are migrations run as part of deployment? Are they reversible? Is there separation between schema migration and data migration? Are there guards against destructive migrations (column drops, table drops)?
- **Feature flags for gradual rollout**: Is there a feature flag system (LaunchDarkly, Unleash, custom)? Can new functionality be deployed dark and enabled gradually?
- **Deployment lock/mutex**: Is there protection against concurrent deployments? Can two people deploy simultaneously and corrupt state?
- **Smoke tests post-deploy**: After deployment, is there automated verification that the deploy succeeded? Health check hits, synthetic transactions, basic endpoint probes?
- **Deployment documentation**: Is the deployment process documented? Could someone who's never deployed this system do it from the docs alone?

**Evidence bar**: Trace the deployment path from CI config to production. Show the specific deploy scripts or jobs, identify what safety mechanisms exist and which are missing. For migration safety, examine actual migration files for destructive operations without guards.

---

### 3. Container & Build Artifacts

If the project uses containers, evaluate the quality and security of the container setup:

- **Dockerfile quality**: Multi-stage builds to minimize image size? Appropriate base images (not `latest`, not bloated full OS images)? Non-root user? Proper `.dockerignore`? Layer ordering optimized for cache (dependencies before code)?
- **Image size signals**: Are there signs of bloated images — installing unnecessary packages, copying entire repo including dev dependencies, no multi-stage separation of build and runtime?
- **Base image currency**: Are base images pinned to specific versions? Are they recent or ancient? Are they from official/trusted sources?
- **Docker Compose for local dev**: Is there a docker-compose for local development? Does it mirror production topology? Are volumes, networks, and service dependencies properly configured?
- **Container health checks**: Do container definitions include HEALTHCHECK instructions? Do orchestrator configs (Kubernetes manifests, ECS task definitions) define health/readiness probes?
- **Build reproducibility**: Are builds reproducible? Are dependency lock files (package-lock.json, poetry.lock, go.sum) copied into the container? Are build args and environment properly managed?
- **Artifact versioning**: Are built artifacts (containers, packages) versioned meaningfully? Git SHA tags, semantic versions, or just `latest`?

**Evidence bar**: Show the actual Dockerfile(s) and container configs. Point to specific lines with issues (e.g., `FROM node:latest` instead of a pinned version, `COPY . .` before `npm install`, running as root). Compare against container best practices with specific, provable impact.

---

### 4. Infrastructure as Code

Evaluate whether infrastructure is defined, versioned, and managed as code:

- **IaC presence and coverage**: Is Terraform, CloudFormation, Pulumi, CDK, or similar present? What infrastructure does it cover — all resources, or just some? Are there resources referenced in code that aren't defined in IaC (suggesting manual creation)?
- **State management**: For Terraform, is state stored remotely (S3, GCS, Terraform Cloud) with locking (DynamoDB)? Or is state local/committed to the repo (dangerous)?
- **Module organization**: Is IaC organized into logical modules? Or is it a single monolithic file? Is there appropriate use of modules for reusable patterns?
- **Environment separation**: Are dev/staging/prod environments defined separately? Through workspaces, separate directories, variable files? Can someone accidentally apply staging changes to production?
- **Variable management**: Are variables well-organized? Are sensitive values marked as sensitive? Are there sensible defaults? Is there a clear distinction between environment-specific and shared configuration?
- **Drift detection**: Are there signals of drift detection or prevention — plan-only CI jobs, policy enforcement (Sentinel, OPA), automated drift checks?
- **Plan-before-apply enforcement**: Does the CI pipeline require a plan step with human approval before apply? Or can changes be applied directly?
- **Resource tagging**: Are resources consistently tagged (environment, team, cost center, managed-by)? Tagging is critical for operational visibility and cost management.

**Evidence bar**: Show the IaC file structure, specific configuration patterns, and state management setup. Identify resources mentioned in application code or deployment scripts that lack IaC definitions. For state management, show the backend configuration.

---

### 5. Environment Configuration & Parity

Environment drift is one of the top causes of "works in staging, breaks in prod":

- **Environment definition**: How many environments exist? Are they defined explicitly (in IaC, CI configs, docker-compose files) or implicitly (through scattered env var references)?
- **Environment variable management**: Is there a clear pattern for managing env vars across environments? `.env.example` files, environment-specific config files, external config services? Or are env vars scattered across CI configs, deployment scripts, and application code?
- **Secret injection strategy**: How do secrets reach the application in each environment? Environment variables, mounted files, secret managers? Is the pattern consistent across environments?
- **Configuration drift signals**: Do environment configs share a common template, or are they independently maintained (prone to drift)? Are there environment-specific code paths that suggest behavioral differences between environments?
- **Feature parity**: Do all environments run the same version of backing services (databases, caches, queues)? Are there signals that staging differs significantly from production in capability?
- **Environment provisioning**: Can a new environment be stood up from what's in the repo? Or would it require tribal knowledge, manual steps, or access to undocumented systems?

**Evidence bar**: Map all environment references found in the repo — CI configs, IaC, docker-compose files, .env files, application config. Show where environments diverge. Identify env vars referenced in code that lack definition in any config file.

---

### 6. Monitoring & Observability

You can't operate what you can't see. Evaluate the monitoring posture visible in the repository:

- **Application monitoring setup**: Are there APM integrations (Datadog, New Relic, OpenTelemetry)? Is instrumentation present in the application code? Are custom metrics defined for business-critical operations?
- **Log aggregation configuration**: Is structured logging configured? Are log levels used consistently? Is there a log shipping configuration (Fluentd, Logstash, CloudWatch agent)?
- **Alerting rules**: Are alerts defined as code (Terraform, Datadog monitors as JSON, PagerDuty configs)? What conditions trigger alerts? Are there alert thresholds for the critical paths identified in Phase 1?
- **Dashboard definitions**: Are monitoring dashboards defined as code (Grafana JSON, Datadog dashboard definitions)? Or are they only in a vendor UI (not evaluable from the repo)?
- **Health check endpoints**: Does the application expose health/readiness/liveness endpoints? Do they check downstream dependencies (database, cache, external services) or just return 200?
- **Distributed tracing**: Is distributed tracing configured? Are trace IDs propagated through the request lifecycle? Is there correlation between logs and traces?
- **SLO/SLI definitions**: Are service level objectives or indicators defined anywhere — in code, config, or documentation? Are there error budgets or reliability targets?
- **Error tracking**: Is an error tracking service integrated (Sentry, Bugsnag, Rollbar)? Is it configured with appropriate context (user info, request data, release version)?

**Evidence bar**: Show monitoring configuration files, instrumentation code, alert definitions, and health check implementations. Identify critical application paths (from Phase 1) that lack monitoring coverage. Map what's monitored versus what's blind.

---

### 7. Secret Management

Secrets are the most common source of security incidents in operational systems:

- **Secret storage and injection**: How are secrets stored? Vault, AWS Secrets Manager, GCP Secret Manager, environment variables, config files? Is there a consistent pattern or are secrets handled differently across services?
- **Rotation signals**: Is there evidence of secret rotation — rotation scripts, short-lived credentials, certificate renewal automation? Or do secrets appear to be static, long-lived values?
- **Secret sprawl**: Is the same secret referenced in multiple places (CI config, deployment script, IaC, docker-compose)? Multiple definitions increase the risk of inconsistency during rotation.
- **Default/example credentials**: Are there `.env.example` or config templates with default credentials that look like real values? Are there hardcoded fallback credentials in application code?
- **.env file handling**: Is `.env` in `.gitignore`? Are there `.env` files committed to the repo? Is there a `.env.example` or `.env.template` for developer onboarding?
- **CI secret configuration**: Are CI secrets referenced via the platform's secret management (GitHub Secrets, GitLab CI Variables)? Or are they hardcoded in pipeline files?
- **Least privilege signals**: Do service accounts or API keys appear to have scoped permissions, or are there signs of overly broad access (admin keys, root credentials, wildcard IAM policies)?

**Evidence bar**: Search for secret patterns — API keys, tokens, passwords, connection strings — in all repo files. Show where secrets are referenced and how they're injected. Identify secrets defined in multiple locations. Check `.gitignore` for secret file patterns.

---

### 8. Disaster Recovery & Backup

When things go wrong at scale, can the system recover?

- **Database backup configuration**: Are backups configured in IaC (RDS automated backups, Cloud SQL backup config)? Are backup retention periods defined? Are backups encrypted?
- **Backup verification signals**: Is there any evidence of backup testing — restore scripts, backup verification jobs in CI, documented restore procedures?
- **Recovery documentation**: Are there documented procedures for recovering from common disaster scenarios (database corruption, region failure, accidental deletion)?
- **Data restoration procedures**: Are there scripts or documented steps for restoring from backup? Can a restore be performed by someone who hasn't done it before?
- **RTO/RPO signals**: Are recovery time objective or recovery point objective targets documented? Does the backup configuration align with stated targets?
- **Multi-region/availability zone configuration**: Is the infrastructure configured for redundancy across zones or regions? Are there signals of geographic distribution in IaC or deployment configs?
- **Failover setup**: Are there failover configurations (database replicas, load balancer health checks, DNS failover)? Is failover automated or manual?

**Evidence bar**: Show IaC backup configurations, recovery scripts, and documentation. Identify databases or persistent storage defined in IaC without backup configuration. Check for restore procedures and whether they're tested.

---

### 9. Scaling & Resource Management

Can the system handle growth without manual intervention or budget surprises?

- **Auto-scaling configuration**: Are auto-scaling policies defined in IaC? What metrics trigger scaling (CPU, memory, request count, queue depth)? Are scaling thresholds reasonable?
- **Resource limits**: Are CPU and memory limits defined for containers/services? Are they appropriate for the workload, or are they default/placeholder values?
- **Horizontal vs vertical scaling signals**: Is the application architecture amenable to horizontal scaling (stateless services, externalized state)? Or does it have signals of vertical-only scaling (in-memory state, local file storage)?
- **Connection pooling**: Are database connection pools configured? Are pool sizes appropriate for the scaling configuration? Can connection exhaustion occur during scale-up?
- **Queue/worker scaling**: If there are background job processors or queue consumers, can they scale independently? Are there dead letter queues for failed jobs?
- **Cost optimization signals**: Are there signs of cost awareness — reserved instances, spot/preemptible instances, right-sized resources, scheduled scaling, lifecycle policies for storage?
- **Load testing infrastructure**: Is there load testing configuration (k6, Locust, Artillery, JMeter)? Are load tests part of the CI pipeline or documented as a process?

**Evidence bar**: Show auto-scaling configs, resource limits, and connection pool settings from IaC and application configs. Identify services that can scale but have dependencies that can't (e.g., auto-scaling web tier with fixed-size database connection pool).

---

### 10. Incident Response Readiness

When production breaks at 3 AM, is the team prepared?

- **Runbooks**: Are there runbooks or operational playbooks for common failure scenarios? Are they specific to this system (not generic templates)?
- **On-call configuration signals**: Are there PagerDuty, OpsGenie, or similar integrations in the repo? Are escalation schedules defined as code?
- **Incident communication templates**: Are there templates for incident communication (status page updates, internal updates, post-mortem formats)?
- **Post-mortem process**: Is there evidence of a post-mortem process — templates, past post-mortem documents, a blameless culture signal?
- **Escalation paths**: Are escalation procedures documented? Is it clear who to contact for different types of incidents?
- **Status page integration**: Is there integration with a status page service (Statuspage, Cachet, Instatus)? Can the status page be updated programmatically?
- **Graceful degradation modes**: Does the application have circuit breakers, fallback modes, or graceful degradation paths? Can non-critical features be disabled independently?
- **Kill switches**: Are there mechanisms to quickly disable problematic features or integrations without a full deployment? Feature flags, config toggles, or admin endpoints?

**Evidence bar**: Show runbook files, incident templates, on-call configs, and circuit breaker implementations. Identify critical paths (from Phase 1) that lack runbooks. Assess whether a new team member could handle an incident using only what's in the repo.

---

### 11. Dependency & Supply Chain Ops

The operational risk from dependencies is separate from code quality — it's about keeping production safe from upstream problems:

- **Dependency update automation**: Is Dependabot, Renovate, or similar configured? What's the update strategy — auto-merge patches, manual review for minors/majors? Are updates grouped logically?
- **Security scanning in CI**: Is there automated security scanning (Snyk, npm audit, pip-audit, trivy, grype) in the CI pipeline? Are scan results blocking or advisory? Are there ignored vulnerabilities with documented justification?
- **Container scanning**: Are container images scanned for vulnerabilities? Is scanning part of the build pipeline or only ad-hoc?
- **SBOM generation**: Is a Software Bill of Materials generated as part of the build? Is it published or stored for audit purposes?
- **License compliance**: Is there license checking configured? Are there LICENSE files? Could dependency licenses conflict with the project's license or usage?
- **Pinned vs floating versions**: Are production dependencies pinned to exact versions (lock files committed)? Are there floating version ranges that could introduce breaking changes?
- **Critical dependency health**: Are core dependencies actively maintained? Are there signals of abandoned or deprecated dependencies in use?

**Evidence bar**: Show Dependabot/Renovate configs, CI scanning steps, and lock file presence. Identify dependencies with known vulnerabilities if scanning output is visible. Check whether lock files are committed and whether CI installs from lock files (npm ci vs npm install).

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How exposed is production, and the people on call for it, right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a solid pipeline with four live gaps in recovery. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Production-hardened, battle-tested operational posture |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Solid operational foundation with room for hardening |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Functional but with meaningful operational gaps |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Significant operational risk, incidents likely |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Not operationally ready, deploying this is dangerous |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is operational (a live outage, data-loss or security exposure, or a deploy that can break production today) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
2. Divide by **units** = in-scope source lines (tests excluded) / 50,000, minimum 1.
3. Map the result:

| Critical/High per unit | Score | Grade |
|---|---|---|
| 0 | 9.5 | A |
| up to 1 | 8.0 | B |
| up to 2.5 | 6.5 | C |
| up to 5 | 5.0 | D |
| over 5 | 3.0 | F |

State the count, the units and the result: `(1 Critical × 3 + 5 High) / 1.6 units = 5.0 per unit → D`. The count is a lower bound set by audit depth; say how deep the audit went.

### Calibration check before finalizing

- If the Strengths section names a reference-quality mechanism, its category cannot score below 7.0 unless a Critical pattern is charged to it; say which.
- A category below 6.0 needs at least one Verified High or Critical pattern charged to it.
- Medium and Low volume never moves a letter by itself. Their count grows with audit effort, not with how bad the work is.
- Read the two grades back against the anchors table. If a staff engineer who knows the area would say "that is not what it is like", fix the scores, not the anchors.

### Weights

| Category | Weight |
|----------|--------|
| CI/CD Pipeline Health | 14% |
| Deployment Safety | 15% |
| Container & Build Artifacts | 8% |
| Infrastructure as Code | 10% |
| Environment Configuration & Parity | 7% |
| Monitoring & Observability | 14% |
| Secret Management | 10% |
| Disaster Recovery & Backup | 6% |
| Scaling & Resource Management | 5% |
| Incident Response Readiness | 6% |
| Dependency & Supply Chain Ops | 5% |

Deployment Safety, CI/CD Pipeline Health, and Monitoring & Observability carry the most weight — these are the daily operational concerns that determine whether deployments succeed and incidents get caught.

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```
CI/CD Pipeline Health             7.8 | ████████████████░░░░
Deployment Safety                 6.2 | ████████████░░░░░░░░
Container & Build Artifacts       8.1 | ████████████████░░░░
Infrastructure as Code            5.5 | ███████████░░░░░░░░░
Environment Configuration        7.0 | ██████████████░░░░░░
Monitoring & Observability        4.3 | █████████░░░░░░░░░░░
Secret Management                 6.8 | ██████████████░░░░░░
Disaster Recovery & Backup        3.2 | ██████░░░░░░░░░░░░░░
Scaling & Resource Management     5.9 | ████████████░░░░░░░░
Incident Response Readiness       4.1 | ████████░░░░░░░░░░░░
Dependency & Supply Chain Ops     7.5 | ███████████████░░░░░
──────────────────────────────────────────────────────
Engineering (weighted)            6.1 | ████████████░░░░░░░░
Live harm                         5.0 | ██████████░░░░░░░░░░
```

Use `█` for filled and `░` for empty. End the chart with two rows: `Engineering (weighted)`, then `Live harm`.

---

## Finding Template

Each finding must follow this structure:

```
#### [SEVERITY EMOJI] [Finding Title]

**Category**: [Root-cause category, the one this finding is charged to]
**Severity**: [Critical / High / Medium / Low]
**Confidence**: [Verified / Probable / Observation / Question]
**Harm**: [Operational: live | reachable on the next deploy or incident | latent] or [Engineering drag]
**Pattern**: [Name of the root-cause pattern this instance belongs to, if any]
**Location**: [File paths and line numbers]

**Evidence**:
[CI configs, Dockerfile snippets, IaC excerpts, script contents, or
configuration patterns that PROVE this is a real operational issue.
This is the most important section.]

**Impact**:
[What breaks and when. "During deployment, this causes..." or "If this
service fails, the team will not know because..." or "At 3 AM, the
on-call engineer will be unable to..." Be operational and specific.]

**Recommendation**:
[Concrete, actionable fix. Not "consider adding monitoring" — instead,
"add a /health endpoint in `src/app.ts` that checks database connectivity,
configure the ALB target group health check in `infra/alb.tf:45` to hit it,
and add a Datadog monitor for 5xx rate > 1% in `monitoring/monitors.tf`."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```
# Ops & Deployment Readiness Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a technical leader or VP of
Engineering. Can we deploy this safely? Can we operate it? What happens when
something breaks? What's the biggest operational risk right now?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually reviewed, which
pipelines/environments/configs were inspected deeply vs broadly, what was
explicitly out of scope, and what may exist outside the repo and could not be
verified.]

## 3. Deployment Flow Diagram
[Trace the path from code merge to production as understood from CI configs,
deployment scripts, and IaC. Show each stage: build → test → deploy staging →
approve → deploy prod (or whatever the actual flow is). Flag gaps in the flow.
If no deployment pipeline is visible, that itself is the finding.]

## 4. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality]

## 5. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 6. Environment Matrix
[Table of all environments found in the repo, how they're configured,
what differs between them, and a parity assessment. Example:

| Aspect | Development | Staging | Production | Parity |
|--------|------------|---------|------------|--------|
| Database | SQLite local | RDS PostgreSQL | RDS PostgreSQL | ⚠️ Dev differs |
| Cache | None | Redis | Redis | ⚠️ Dev missing |
| Config source | .env file | CI secrets | AWS SSM | 🔴 All different |
]

## 7. Monitoring Coverage Map
[Map critical application paths against monitoring coverage:

| Path | Metrics | Logging | Alerting | Tracing | Status |
|------|---------|---------|----------|---------|--------|
| User auth | ✅ | ✅ | ❌ | ❌ | Partial |
| Payment flow | ❌ | ✅ | ❌ | ❌ | Blind |
| API endpoints | ✅ | ✅ | ✅ | ✅ | Covered |

Flag any critical path with no monitoring as a finding.]

## 8. Secret Inventory
[Where secrets are referenced, how they're injected, rotation signals:

| Secret | Referenced In | Injection Method | Rotation Signal |
|--------|--------------|-------------------|-----------------|
| DATABASE_URL | .env, docker-compose, CI | Env var | None visible |
| API_KEY | src/config.ts, .env | Env var | None visible |
| AWS_SECRET_KEY | terraform/main.tf | AWS profile | IAM managed |
]

## 9. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 10. Prioritized Action Plan
[Top 10 actions ordered by (severity × effort efficiency). For each:
- What to do (one sentence)
- Why it matters most right now (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 11. Strengths & Bright Spots
[Mandatory. What the operational setup does well. Good CI pipeline structure,
thoughtful deployment scripts, proper secret handling, comprehensive monitoring,
well-organized IaC. Credit where it's due.]

## 12. What Was Not Flagged
[Issues considered but rejected for insufficient evidence. Things that might
exist outside the repo. Transparency about what you chose not to report and why.
Specifically call out if operational tooling appears to live outside the repo
(signals: references to external dashboards, vendor-specific config that's
managed in the vendor UI, comments mentioning external systems).]

## 13. Appendix: Evidence Notes
[Supporting data, file lists, config summaries, dependency counts]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary.
Example: "C (6.1) — Deployable but operationally fragile; monitoring gaps and
missing rollback capability create significant incident risk."]
```

For focused audits, keep the scope visible near the top of the report and mark unrelated sections or categories as `N/A` rather than pretending they were evaluated.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report operational issues you can't point to in actual repo artifacts (CI configs, IaC, Dockerfiles, scripts, configs)
- ❌ Assume a cloud provider, orchestrator, or platform unless the code makes it explicit
- ❌ Criticize the absence of infrastructure that may exist outside the repo (external monitoring, managed backups, vendor-hosted CI) — instead, note the gap and flag it as a Question
- ❌ Recommend enterprise-grade operational tooling for a weekend project or early prototype
- ❌ Pad the report with low-value findings to appear thorough
- ❌ Treat "no Kubernetes" as a problem — many excellent production systems run without it
- ❌ Let a narrow focus prompt silently expand into a fake whole-system ops audit
- ❌ Score a category as low without multiple proven findings to justify it
- ❌ Present findings that are actually just "I would have set this up differently"
- ❌ Assume that absence of evidence is evidence of absence — missing monitoring configs might mean monitoring is configured in a vendor UI

DO:
- ✅ Evaluate only what's visible in the repository — IaC, CI configs, Dockerfiles, scripts, monitoring configs, documentation
- ✅ Show your work — the reader should be able to verify every finding by opening the referenced file
- ✅ Consider the project's apparent stage and scale when calibrating severity — a seed-stage startup and a fintech platform have different operational needs
- ✅ Distinguish between "missing from the repo" and "does not exist" — flag the uncertainty
- ✅ Think like an SRE who just joined the team and needs to understand how this thing runs
- ✅ Think like an incident commander at 3 AM — what's going to help or hurt right now
- ✅ Cross-reference findings across categories to identify systemic operational gaps
- ✅ Call out when something is well-done — good operational practices deserve recognition
- ✅ Prefer actionable, specific recommendations over generic advice
- ✅ Quantify everything you can (pipeline step counts, image sizes, resource limits, secret reference counts)
- ✅ If the repository has zero operational artifacts (no CI, no Dockerfile, no IaC, no monitoring), state that clearly as the primary finding — the entire system is operationally invisible
- ✅ If evidence is insufficient, say so plainly
- ✅ If the repository is large, state what was examined deeply vs broadly
- ✅ State the requested focus area, included environments, excluded environments, and unverifiable external tooling plainly
