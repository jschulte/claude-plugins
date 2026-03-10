---
name: reimagine
description: Synthesizes reverse-engineering docs from 2+ repositories into a unified capability map, identifies duplication and gaps, facilitates brainstorming to reimagine the system, and generates new specifications. Trigger phrases - reimagine these services, consolidate these repos, synthesize a new vision, redesign from multiple repos.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Agent
---

# Reimagine

Take reverse-engineering docs from multiple repos. Reimagine them as something better.

**Estimated Time:** 30-60 minutes (depending on repo count and depth)
**Prerequisites:** Batch processing completed on 2+ repos, OR manually prepared reverse-engineering docs from multiple repos
**Output:** Capability map, reimagined vision, new specifications (Spec Kit or BMAD format)

This skill assumes single-session execution. If interrupted, the capability map and vision documents written to disk serve as partial checkpoints. Resume from Step 4 using the saved `CAPABILITY_MAP.md`.

---

## When to Use This Skill

Activate when:
- The user has batch-processed multiple related repos with StackShift
- The user wants to consolidate or redesign multiple services/apps
- The user is planning a major platform modernization
- The user wants to explore how existing capabilities could work together differently
- The user has reverse-engineering docs from several codebases and wants a fresh perspective

**Trigger Phrases:**
- "Reimagine these services as a unified platform"
- "How could these apps work together better?"
- "Consolidate these microservices"
- "Design a new system from these existing capabilities"
- "Synthesize a new vision from multiple repos"

---

## Process

### Step 1: Locate Repo Documentation

Determine where the reverse-engineering docs live using one of three options.

**Option A: From Batch Results**

Run the following command (adapt paths as needed):
```bash
BATCH_DIR="${HOME}/git/stackshift-batch-results"
find "${BATCH_DIR}" -type d -name "reverse-engineering" -path "*/docs/*"
```

**Option B: Manual Repo List**

Ask the user to provide paths to repos or their reverse-engineering docs:
```
Which repos should I analyze?

Provide paths to repos or their docs/reverse-engineering/ directories:
1. ~/git/user-service
2. ~/git/billing-api
3. ~/git/notification-hub
4. ~/git/admin-dashboard
...
```

**Option C: From Active Directory**

If in a monorepo, scan for subdirectories with reverse-engineering docs (adapt paths as needed):
```bash
for dir in "${PWD}"/*/; do
  if [ -d "${dir}docs/reverse-engineering" ]; then
    echo "Found: ${dir}"
  fi
done
```

**Validate each discovered repo.** Each repo must have at minimum:
- `functional-specification.md` (required)
- `integration-points.md` (required)
- `data-architecture.md` (required)
- Additional docs improve analysis quality but are not required

**Error handling for Step 1:**
1. Use Glob to list all files in each repo's `docs/reverse-engineering/` directory.
2. For each repo, check whether all 3 required documents exist.
3. If a repo is missing any required document: inform the user which docs are missing from which repo and ask whether to (a) proceed with available docs, (b) skip that repo, or (c) abort entirely.
4. If Option A or C finds zero repos with reverse-engineering docs: stop and tell the user to run batch processing first or provide paths manually.
5. If only 1 repo is found: warn the user that reimagine requires 2+ repos. Ask whether to proceed with a single-repo analysis (reduced value) or abort.
6. Track which repos had complete vs. incomplete docs for annotation in the capability map.

Log after completing Step 1: "Step 1 complete: Found [N] repos with reverse-engineering docs. [M] repos have all 3 required docs. [List any repos with missing docs.]"

### Step 2: Load and Parse All Docs

For each validated repo, read the key documents using parallel Task agents.

**Per-repo extraction targets (required docs):**
- From `functional-specification.md`: All FRs, user stories, personas, business rules
- From `integration-points.md`: External services, APIs consumed/exposed, data flows
- From `data-architecture.md`: Data models, API contracts, domain boundaries

**Per-repo extraction targets (optional docs -- skip if not found, note the gap):**
- From `business-context.md`: Product vision, personas, business goals
- From `decision-rationale.md`: Tech stack, ADRs, design principles
- From `technical-debt-analysis.md`: Pain points, migration priorities
- From `configuration-reference.md`: Shared config patterns
- From `operations-guide.md`: Deployment model, infrastructure

For optional documents: if the document does not exist, skip it and note the gap. Missing optional docs reduce analysis depth but do not block processing.

**Parallel processing:** Dispatch Task agents to read docs from multiple repos concurrently. For large batches (10+ repos), process in batches of 5 repos at a time.

**Error handling for Step 2:**
1. If a Task agent fails or times out on a repo: retry once. If the retry fails, proceed with available results and inform the user which repo could not be fully loaded.
2. If a required document exists but contains no extractable content (empty or malformed): treat that repo as having incomplete documentation and annotate accordingly.
3. If more than half of the repos fail to load: stop and report the failures to the user. Ask whether to proceed with the successfully loaded repos or abort.

Log after each repo loads: "Loaded [repo-name]: [N] documents found, [M] capabilities extracted."
Log after completing Step 2: "Step 2 complete: Loaded docs from [N] of [T] repos. [List any repos with load failures or incomplete data.]"

### Step 3: Generate Capability Map

Synthesize all extracted information into a unified capability map with four sub-analyses.

#### 3.1 Business Capability Inventory

Group all functional requirements across repos by business domain:

```
Business Capability Map
=======================

Authentication & Identity
  +-- user-service: User registration, login, password reset, OAuth
  +-- admin-dashboard: Admin login, role management, SSO
  +-- billing-api: API key authentication, webhook signatures
  Overlap: 3 separate auth implementations

Payment & Billing
  +-- billing-api: Stripe integration, invoicing, subscription management
  +-- user-service: Basic payment method storage
  Overlap: Payment data in 2 services
```

#### 3.2 Technical Overlap Analysis

Identify where repos duplicate functionality. Report shared data models, duplicated logic, inconsistent APIs, and shared dependencies.

#### 3.3 Pain Points and Opportunities

Extract from technical debt analyses across repos. List each pain point with the number of repos affected.

#### 3.4 Dependency Graph

Show how repos depend on each other using a Mermaid diagram. For 10+ services, simplify the graph by clustering related services.

**Error handling for Step 3:**
1. If extracted data is insufficient to build a meaningful capability map (fewer than 3 total capabilities identified across all repos): stop and tell the user the docs lack sufficient detail. Suggest running a more thorough reverse-engineering pass.
2. If a repo contributed zero capabilities (all docs were present but no extractable content): annotate the repo as "no capabilities extracted" in the map and inform the user.

**Validation checkpoint:** Before proceeding to Step 4, verify that:
- Every repo that was loaded contributed at least one capability (or is annotated as empty).
- Every required doc that was loaded was processed.
- The overlap analysis identified at least one overlap or explicitly stated "no overlap found."

Log after completing Step 3: "Step 3 complete: Capability map generated with [X] business capabilities across [N] repos. [Y]% functional overlap identified. [Z] pain points found."

### Step 4: Present Capability Map to User

Write `CAPABILITY_MAP.md` to the output directory (see Step 7 for output location). Then display the capability map and ask for the user's reaction:

```
I've analyzed [N] repositories and extracted the capability map above.

Key findings:
- [X] distinct business capabilities identified
- [Y]% functional overlap between services
- [Z] pain points spanning multiple repos
- [W] different tech stacks in use

What direction would you like to explore?

A) Consolidation -- Merge overlapping services into fewer, better ones
B) Platform -- Build a unified platform that replaces all services
C) Evolution -- Keep services but fix pain points and standardize
D) Hybrid -- Some consolidation + some new capabilities
E) Free-form -- Open discussion guided by the capability map
```

Wait for the user to choose a direction before proceeding.

### Step 5: Brainstorming Session

This is the collaborative, creative step. Based on the user's direction:

#### Consolidation Path
- Propose which services to merge and which to keep separate
- Present data model unification strategy
- Identify shared infrastructure opportunities
- Estimate effort vs. benefit for each consolidation

#### Platform Path
- Propose a unified domain model spanning all capabilities
- Design new service boundaries based on business domains (not existing code)
- Identify the core platform vs. optional modules
- Map current capabilities to new architecture

#### Evolution Path
- Propose shared libraries and standards
- Design API gateway for consistent external interface
- Plan shared auth, notification, and observability services
- Keep existing services but connect them better

#### Hybrid Path
- Identify which services benefit from consolidation and which should evolve independently
- Propose consolidated core (shared infrastructure, auth, data) with independent edge services
- Define clear boundaries between consolidated and independent components
- Map migration priority by combining consolidation benefit with evolution cost

#### Free-form Path
- Open discussion guided by capability map
- Ask probing questions: "What if auth was a shared service?"
- Explore non-obvious combinations: "What if billing + notifications were one service?"
- Challenge assumptions: "Do you need 3 separate databases?"

**Throughout brainstorming:**
- Reference specific capabilities from the map
- Quantify overlap and duplication
- Propose concrete architectural patterns
- Draw Mermaid diagrams for proposed architectures
- Keep the user engaged with questions and options

### Step 6: Define the Reimagined Vision

Once the brainstorming converges on a direction, formalize it:

```
Reimagined Vision
=================

Name: [New System Name]
Vision: [One-sentence description]

Architecture Style: [Monolith / Microservices / Modular Monolith / ...]

New Service Boundaries:
1. [Service A] -- combines capabilities from [repo1, repo2]
2. [Service B] -- new service for [capability]
3. [Service C] -- evolved from [repo3]

Unified Data Model:
- [Entity 1] -- single source of truth (replaces 3 separate models)
- [Entity 2] -- new entity for [purpose]

Eliminated Duplication:
- Auth: Single shared auth service (saves ~X hours/month)
- Email: Unified notification service (eliminates 3 implementations)
- API: Consistent REST standards across all services

New Capabilities:
- [Capability that emerges from combining repos]
- [Capability enabled by shared infrastructure]

Migration Strategy:
- Migration Phase 1: Shared infrastructure (auth, notifications, API gateway)
- Migration Phase 2: Data model unification
- Migration Phase 3: Service consolidation
- Migration Phase 4: New capabilities
```

**Validation checkpoint:** Present the reimagined vision to the user and ask for explicit confirmation before proceeding to spec generation:

```
Does this vision accurately reflect our brainstorming?

[A] Yes, proceed to spec generation
[B] Adjust -- [ask what to change]
[C] Redo brainstorming with a different direction
```

Wait for the user to confirm before proceeding to Step 7.

### Step 7: Generate New Specifications

Based on the reimagined vision, generate specifications in the user's preferred format.

**Ask:** "Generate specs in Spec Kit format, BMAD format, or both?"

#### Spec Kit Output
- Create `.specify/` structure for the reimagined system
- Generate `constitution.md` with new principles and tech stack
- Create feature specs for each service/module -- each spec must include: problem statement, functional requirements (mapped from capability map), non-functional requirements, and success metrics
- Include migration specs (from current state to reimagined state)

#### BMAD Output
- Generate `prd.md` for the reimagined system -- must include: problem statement, target users, functional requirements mapped from capability map, non-functional requirements, and success metrics
- Generate `architecture.md` with new service boundaries, ADRs, and Mermaid diagrams
- Generate `epics.md` with migration + new capability epics, each with acceptance criteria
- Generate `ux-design-specification.md` if the reimagined system has a user interface

#### Both
- Generate both formats (Spec Kit for implementation, BMAD for planning)

**Output location:** Create the output directory at `[BATCH_DIR]/reimagined-system/` if a batch directory was identified in Step 1. Otherwise, create it at the current working directory.

```
reimagined-system/
+-- VISION.md                           # The reimagined vision document
+-- CAPABILITY_MAP.md                   # Full capability map from all repos
+-- docs/
|   +-- reverse-engineering/            # Synthesized from all repos
|       +-- functional-specification.md # Unified functional spec
|       +-- integration-points.md       # New integration architecture
|       +-- data-architecture.md        # Unified data model
|       +-- business-context.md         # Combined business context
|       +-- decision-rationale.md       # New architectural decisions
+-- .specify/                           # If Spec Kit format chosen
|   +-- memory/
|       +-- constitution.md
|       +-- specifications/
|           +-- 001-shared-auth/
|           +-- 002-unified-notifications/
|           +-- ...
+-- _bmad-output/                       # If BMAD format chosen
    +-- planning-artifacts/
        +-- prd.md
        +-- architecture.md
        +-- epics.md
```

**Error handling for Step 7:**
1. If writing a file fails (permission error, disk full): report the error to the user and attempt to write remaining files. Summarize which files were written and which failed.
2. If the vision document lacks sufficient detail to generate a complete spec (e.g., no service boundaries defined): ask the user to fill in the missing detail before generating.

Log after completing Step 7: "Step 7 complete: Generated [N] specification files in [format] at [output-path]."

### Step 8: Validate Completion

Before presenting final output to the user, verify each criterion is met:

- All repo docs loaded and parsed (or failures documented)
- Capability map generated with business domains identified
- Overlap analysis shows duplication percentage and specifics
- Pain points extracted from cross-repo technical debt
- Dependency graph visualized (Mermaid)
- Brainstorming session produced a clear direction (confirmed by user)
- Reimagined vision document generated and confirmed by user
- New specifications generated in chosen format
- Migration path from current to reimagined state included

If any criterion is not met, address the gap before finalizing. Report the final status to the user.

---

## Integration with Other Skills

### With Batch Processing (`/stackshift.batch`)
Run batch first to generate reverse-engineering docs for all repos. Reimagine reads the batch results. Typical workflow: batch, then reimagine, then architect, then implement.

### With Architecture Generator (`/stackshift.architect`)
After reimagining, use `/stackshift.architect` with user constraints. The architecture generator creates detailed architecture for the new vision. Constraint questions are informed by the capability map.

### With BMAD Synthesize (`/stackshift.bmad-synthesize`)
Reimagine can generate initial BMAD artifacts. Then hand off to BMAD Synthesize for refinement, or hand off to full BMAD for collaborative refinement.

---

## Technical Notes

- Use parallel Task agents to read docs from multiple repos simultaneously.
- For large batches (10+ repos), process capability extraction in batches of 5.
- Mermaid diagrams may need to be simplified for 10+ service dependency graphs.
- Domain clustering for capability grouping: analyze FR titles, data models, and integration points for common themes.
- The brainstorming session must be genuinely interactive -- do not present a predetermined answer.
- Migration phases should be ordered by: risk (low first), value (high first), dependency (prerequisites first).
- If batch results include AST analysis, use function-level data for more precise overlap detection.
- `functional-specification.md` must contain at least one functional requirement (FR-XXX pattern or equivalent). If the document exists but contains no extractable requirements, treat the repo as having incomplete functional documentation.
