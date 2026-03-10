---
name: architect
description: Generates a complete architecture document from reverse-engineering documents and user-specified constraints. Asks 3-5 high-level questions about tech stack, cloud provider, scale, and hard constraints, then produces architecture.md with Mermaid diagrams, service boundaries, ADRs, and infrastructure recommendations. Works standalone or as part of the BMAD Auto-Pilot workflow.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Architecture Generator

Generate an architecture document from reverse-engineering documents (hereafter "RE docs") and user constraints.

**Estimated Time:** 10-20 minutes
**Prerequisites:** Gear 2 (Reverse Engineer) completed with RE docs present
**Output:** `architecture.md` — location determined by mode detection in Step 4

This skill assumes single-session execution. If interrupted, restart from Step 1.

---

## Process

### Step 1: Load Context

Read all available RE docs from `docs/reverse-engineering/`. Read all files in parallel for speed.

**Primary architecture sources (5 files):**
- `data-architecture.md` — Current data models, API contracts, domain boundaries
- `integration-points.md` — External services, data flows, auth patterns
- `operations-guide.md` — Current deployment, infrastructure, scalability
- `decision-rationale.md` — Why current choices were made, trade-offs
- `configuration-reference.md` — Configuration landscape

**Supporting context (4 files):**
- `functional-specification.md` — What the system needs to do
- `business-context.md` — Business constraints, scale expectations, compliance
- `technical-debt-analysis.md` — What needs to change
- `observability-requirements.md` — Monitoring and logging needs

**Error handling for Step 1:**
1. Use Glob to list all files in `docs/reverse-engineering/`.
2. Compare found files against the 9 listed above. Classify each as present or missing.
3. If any primary architecture source (the first 5) is missing: report the missing files to the user and ask whether to proceed with partial context or stop. Do not silently continue.
4. If only supporting context files (the last 4) are missing: proceed, but log which files are absent. Record these gaps for the assumptions section of the architecture document.
5. If `docs/reverse-engineering/` does not exist or is empty: stop and tell the user to run Gear 2 (Reverse Engineer) first.

Log after completing Step 1: "Step 1 complete: Loaded [N] of 9 RE docs. [List any missing files.]"

### Step 2: Ask Constraint Questions

Present these questions conversationally. Skip a question only if a single unambiguous answer is directly stated in the RE docs. When skipping a question, state the detected answer and ask the user to confirm or override. If multiple options are plausible or the RE docs are silent on a topic, ask the question.

**Question 1: Tech Stack Preference**
```
What tech stack do you want for the architecture?

A) Same as current (documented in decision-rationale.md)
   [Show detected stack: e.g., "TypeScript + Next.js + PostgreSQL"]

B) Let me specify
   Ask: "What languages, frameworks, and databases?"
   Examples: "Next.js 15 + TypeScript + Prisma + PostgreSQL"
             "Python + FastAPI + SQLAlchemy + PostgreSQL"
             "Go + Gin + GORM + PostgreSQL"

C) Recommend based on requirements
   Analyze functional-specification.md + business-context.md
   Recommend stack with rationale
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
   Single-region, simple deployment, cost-optimized
   100s of users, minimal redundancy

B) Growing Product
   Multi-AZ, auto-scaling, managed services
   1,000s - 10,000s of users

C) Enterprise / High-Scale
   Multi-region, microservices-ready, full redundancy
   100,000s+ users, strict SLAs

D) Specify custom requirements
   Ask for: expected users, requests/sec, data volume, SLA targets
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

Enter constraints or press enter to skip.
```

**Question 5: Architecture Style**
If the architecture style is clear from the RE docs, skip this question: state the detected style and ask the user to confirm or override. Otherwise, ask:
```
What architecture style fits your needs?

A) Monolith (recommended for small teams / MVPs)
   Single deployable, simpler operations
   Can be modular monolith with clear boundaries

B) Microservices (recommended for larger teams / scale)
   Independent deployments, team autonomy
   Higher operational complexity

C) Serverless (recommended for event-driven / variable load)
   Pay-per-use, auto-scaling
   Cold start considerations

D) Hybrid (specify)

E) Recommend based on team size and requirements
```

**Error handling for Step 2:**
If the user provides contradictory constraints (e.g., "budget under $100/month" and "multi-region full redundancy"), identify the conflict explicitly, explain why the constraints conflict, and ask the user to resolve before proceeding.

For "Recommend" answers on any question, analyze functional-specification.md + business-context.md + observability-requirements.md to make an informed suggestion. Present the recommendation with rationale and ask the user to confirm.

Log after completing Step 2: "Step 2 complete: Collected constraints for [N] questions. Proceeding to generation."

### Step 3: Generate Architecture Document

Using the RE docs and user constraints, generate the architecture document. Follow the template at `operations/architecture-template.md` (relative to this skill).

**Generation approach:**
1. Start from the current architecture as described in the RE docs.
2. For each architecture decision, check user constraints and select the option that satisfies all hard constraints. Where constraints conflict, prefer the user's explicit choice over inferred preferences.
3. For each component in the current architecture, determine whether it maps to the target state unchanged, needs modification, or should be replaced. Generate recommendations that bridge current to target state.
4. Create ADRs justifying each major decision. Generate 3-10 ADRs focusing on consequential decisions. Source from decision-rationale.md where available; generate new ADRs for target-state decisions.
5. Draw Mermaid diagrams for visual clarity. Use Mermaid C4 notation for system context diagrams.
6. If the RE docs indicate a brownfield/evolution scenario (existing system being migrated or modernized), generate Section 10: Migration Path using the technical-debt-analysis.md Migration Priority Matrix. If the project is greenfield with no existing system to migrate from, omit Section 10.

**Progress signals:** Announce each major section as you generate it (e.g., "Generating Section 3: System Architecture..."). This ensures all sections are produced and prevents drift during the lengthy generation.

### Step 3.5: Verify Generated Content

Before writing the final document, verify:
1. All Mermaid diagrams use valid syntax (proper node definitions, valid arrow notation, balanced subgraphs).
2. ADR decisions are consistent with the stated user constraints. No ADR should contradict a hard constraint from Step 2.
3. Cost estimates align with the chosen cloud provider and scale tier. Flag all cost estimates as rough approximations.
4. If Section 10 (Migration Path) is included, confirm it references actual current-state findings from the RE docs.
5. The technology stack table is fully populated with rationale for each choice.

If any verification check fails, fix the issue before proceeding to Step 4.

### Step 4: Detect Mode and Write Output

**Mode detection:**
- If the directory `_bmad-output/` exists in the project root, operate in BMAD mode.
- Otherwise, operate in standalone mode.

**BMAD mode:** Write to `_bmad-output/planning-artifacts/architecture.md`. If running as part of BMAD Synthesize and RE docs have already been parsed in this session, reuse the parsed context instead of re-reading files.

**Standalone mode:** Write to `docs/architecture.md`. If the `docs/` directory does not exist, create it.

**Error handling for Step 4:**
If the file write fails, retry once. If it fails again, report the error to the user with the full file path that was attempted.

Log after completing Step 4: "Architecture document written to [full path]. Generation complete."

---

## Verification Checklist

After writing, confirm all of the following before reporting completion:
- [ ] All 10 sections present (or Section 10 intentionally omitted for greenfield)
- [ ] Mermaid diagrams included (context, component, data flow, infrastructure)
- [ ] 3-10 ADRs generated for major decisions
- [ ] User constraints respected throughout
- [ ] Cost estimation included (if cloud deployment)
- [ ] Technology stack justified with rationale
- [ ] Missing RE doc gaps noted in assumptions (if any docs were absent in Step 1)

---

## Integration with Other Skills

**BMAD Synthesize:** This skill can run as part of `/stackshift.bmad-synthesize`. Output is compatible with BMAD's architecture.md format.

**Reimagine:** `/stackshift.reimagine` may invoke this skill to generate architecture for the reimagined system. Constraint questions are informed by multi-repo capability analysis.

**Spec Kit:** The architecture document supplements `.specify/` structure and can be referenced from feature specs as architectural context.
