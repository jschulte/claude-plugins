---
name: reverse-engineer
description: Performs deep codebase analysis to generate 11 comprehensive documentation files. Adapts output based on the selected route -- Greenfield extracts business logic only (tech-agnostic), Brownfield extracts business logic + technical implementation (tech-prescriptive). Step 2 of 6 in reverse engineering. Use when asked to reverse engineer the codebase, extract business logic, or generate comprehensive documentation.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
  - Task
---

# Reverse Engineer (Route-Aware)

**Step 2 of 6** in the Reverse Engineering to Spec-Driven Development process.
The 6-step process: 1. Analyze, 2. Reverse Engineer (this skill), 3. Create Specs, 4. Gap Analysis, 5. Implementation Planning, 6. Implementation.

**Estimated Time:** 30-45 minutes
**Prerequisites:** Step 1 completed (`analysis-report.md` and route selection in `.stackshift-state.json`)
**Output:** 11 documentation files in `docs/reverse-engineering/`

**Route-Dependent Behavior:**
- **Greenfield:** Extract business logic only (framework-agnostic)
- **Brownfield:** Extract business logic + technical implementation details

Output is the same regardless of implementation framework (Spec Kit, BMAD, or BMAD Auto-Pilot). The framework choice only affects what happens after Step 2.

---

## Configuration Check

**Guard: Verify state file exists before proceeding.**

```bash
if [ ! -f .stackshift-state.json ]; then
  echo "ERROR: .stackshift-state.json not found."
  echo "Step 1 (Initial Analysis) must be completed first. Run /stackshift.analyze to begin."
  exit 1
fi

DETECTION_TYPE=$(cat .stackshift-state.json | jq -r '.detection_type')
ROUTE=$(cat .stackshift-state.json | jq -r '.route')

if [ "$DETECTION_TYPE" = "null" ] || [ -z "$DETECTION_TYPE" ]; then
  echo "ERROR: detection_type missing from state file. Re-run /stackshift.analyze."
  exit 1
fi
if [ "$ROUTE" = "null" ] || [ -z "$ROUTE" ]; then
  echo "ERROR: route missing from state file. Re-run /stackshift.analyze."
  exit 1
fi

echo "Detection: $DETECTION_TYPE"
echo "Route: $ROUTE"

SPEC_OUTPUT=$(cat .stackshift-state.json | jq -r '.config.spec_output_location // "."')
echo "Writing specs to: $SPEC_OUTPUT"

if [ "$SPEC_OUTPUT" != "." ]; then
  mkdir -p "$SPEC_OUTPUT/docs/reverse-engineering"
  mkdir -p "$SPEC_OUTPUT/.specify/memory/specifications"
fi
```

**State file structure:**
```json
{
  "detection_type": "monorepo-service",
  "route": "greenfield",
  "implementation_framework": "speckit",
  "config": {
    "spec_output_location": "~/git/my-new-app",
    "build_location": "~/git/my-new-app",
    "target_stack": "Next.js 15..."
  }
}
```

**Capture commit hash for incremental updates:**
```bash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_DATE=$(git log -1 --format=%ci 2>/dev/null || date -u +"%Y-%m-%d %H:%M:%S")
echo "Pinning docs to commit: $COMMIT_HASH"
```

**Extraction approach based on detection + route:**

| Detection Type | + Greenfield | + Brownfield |
|----------------|--------------|--------------|
| **Monorepo Service** | Business logic only (tech-agnostic) | Full implementation + shared packages (tech-prescriptive) |
| **Nx App** | Business logic only (framework-agnostic) | Full Nx/Angular implementation details |
| **Generic App** | Business logic only | Full implementation |

- `detection_type` determines WHAT patterns to look for (shared packages, Nx project config, monorepo structure, etc.)
- `route` determines HOW to document them (tech-agnostic vs tech-prescriptive)

---

## Phase 1: Deep Codebase Analysis

Use the Task tool with `subagent_type=stackshift:stackshift-code-analyzer:AGENT` to perform analysis. If the agent is unavailable, fall back to the Explore agent.

**Error recovery:** If a subagent fails or returns empty results for a sub-phase, retry once with the Explore agent. If the retry also fails, record the gap with an `[ANALYSIS INCOMPLETE]` marker and continue with remaining sub-phases.

**Missing components:** If a sub-phase finds no relevant code (e.g., no frontend in a backend-only service), document the absence in the corresponding output file rather than skipping the sub-phase.

Launch sub-phases 1.1 through 1.6 in parallel using separate subagent invocations. Collect all results before proceeding to Phase 2.

#### 1.1 Backend Analysis
- Find all API endpoints and record their method, route, auth requirements, parameters, and purpose.
- Catalog every data model including schemas, types, interfaces, and field definitions.
- Inventory all configuration sources: env vars, config files, and settings.
- Map every external integration: APIs, services, and databases.
- Extract business logic from services, utilities, and algorithms.

#### 1.2 Frontend Analysis
- List all pages and routes with their purpose and auth requirements.
- Catalog all components by category: layout, form, and UI components.
- Document state management: store structure and global state patterns.
- Map the API client layer: how the frontend calls the backend.
- Extract styling patterns: design system, themes, and component styles.

#### 1.3 Infrastructure Analysis
- Document deployment configuration: IaC tools, cloud provider, and services.
- Map CI/CD pipelines and workflows.
- Catalog database setup: type, schema, and migrations.
- Identify storage systems: object storage, file systems, and caching.

#### 1.4 Testing Analysis
- Locate all test files and identify the testing frameworks in use.
- Classify tests by type: unit, integration, and E2E.
- Estimate coverage percentages by module.
- Catalog test data: mocks, fixtures, and seed data.

#### 1.5 Business Context Analysis
- Read README, CONTRIBUTING, and any marketing or landing pages.
- Extract package descriptions and repository metadata.
- Identify comment patterns indicating user-facing features.
- Collect error messages and user-facing strings for persona inference.
- Analyze naming conventions to reveal domain concepts.
- Examine git history for decision archaeology.

#### 1.6 Decision Archaeology
- Inspect dependency manifests (package.json, go.mod, requirements.txt) for technology choices.
- Analyze config files (tsconfig, eslint, prettier) for design philosophy.
- Review CI/CD configuration for deployment decisions.
- Run git blame on key architectural files to identify decision points.
- Collect comments with "why" explanations (TODO, HACK, FIXME, NOTE).
- Look for rejected alternatives visible in git history or comments.

**Progress signal:** After all sub-phases complete, log: "Phase 1 complete: Analysis gathered for [list which sub-phases produced results]."

---

## Phase 2: Generate Documentation

Create `docs/reverse-engineering/` directory and generate all 11 documentation files. For each file, apply the greenfield or brownfield variant as described in `operations/output-file-specs.md`. Read that file now for the detailed per-file specifications.

If `.stackshift-docs-meta.json` already exists, overwrite it completely with fresh metadata.

### Step 2.1: Write metadata file FIRST

```bash
COMMIT_HASH=$(git rev-parse HEAD 2>/dev/null || echo "unknown")
COMMIT_DATE=$(git log -1 --format=%ci 2>/dev/null || date -u +"%Y-%m-%d %H:%M:%S")
GENERATED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

Write `docs/reverse-engineering/.stackshift-docs-meta.json`:
```json
{
  "commit_hash": "<COMMIT_HASH>",
  "commit_date": "<COMMIT_DATE>",
  "generated_at": "<GENERATED_AT>",
  "doc_count": 11,
  "route": "<greenfield|brownfield>",
  "docs": {
    "functional-specification.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "integration-points.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "configuration-reference.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "data-architecture.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "operations-guide.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "technical-debt-analysis.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "observability-requirements.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "visual-design-system.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "test-documentation.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "business-context.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" },
    "decision-rationale.md": { "generated_at": "<GENERATED_AT>", "commit_hash": "<COMMIT_HASH>" }
  }
}
```

### Step 2.2: Add metadata header to each doc

Every generated doc starts with this header after the title:

```markdown
# [Document Title]

> **Generated by StackShift** | Commit: `<short-hash>` | Date: `<GENERATED_AT>`
> Run `/stackshift.refresh-docs` to update with latest changes.
```

### Step 2.3: Generate files with checkpoints

Generate files in this order, logging progress after each:

**Batch 1 (core architecture):**
1. functional-specification.md
2. data-architecture.md
3. integration-points.md
4. configuration-reference.md

After writing files 1-4, log: "Generated 4/11 files (core architecture complete)." Verify the output directory contains 4 files before continuing.

**Batch 2 (operations and quality):**
5. operations-guide.md
6. technical-debt-analysis.md
7. observability-requirements.md
8. visual-design-system.md
9. test-documentation.md

After writing files 5-9, log: "Generated 9/11 files (operations and quality complete)." Verify the output directory contains 9 files before continuing.

**Batch 3 (context and decisions):**
10. business-context.md
11. decision-rationale.md

After writing files 10-11, log: "Generated 11/11 files. Phase 2 complete."

**Output structure:**
```
docs/reverse-engineering/
├── .stackshift-docs-meta.json
├── functional-specification.md
├── integration-points.md
├── configuration-reference.md
├── data-architecture.md
├── operations-guide.md
├── technical-debt-analysis.md
├── observability-requirements.md
├── visual-design-system.md
├── test-documentation.md
├── business-context.md
└── decision-rationale.md
```

---

## Success Criteria

- All 11 documentation files generated in `docs/reverse-engineering/`
- Comprehensive coverage of all application aspects
- Framework-agnostic functional specification (for greenfield)
- Complete data model documentation
- Business context captured with clear `[INFERRED]` / `[NEEDS USER INPUT]` markers
- Decision rationale documented with ADR format
- Integration points fully mapped with data flow diagrams
- `.stackshift-docs-meta.json` created with commit hash for incremental updates
- Each doc has metadata header with commit hash and generation date

---

## Next Step

Once all documentation is generated:

**For GitHub Spec Kit** (`implementation_framework: speckit`):
Proceed to Step 3 -- use `/stackshift.create-specs` to transform docs into `.specify/` specs.

**For BMAD Method** (`implementation_framework: bmad`):
Proceed to Step 6 -- hand off to BMAD's `*workflow-init`. BMAD's PM and Architect agents use the reverse-engineering docs as context.

**For BMAD Auto-Pilot** (`implementation_framework: bmad-autopilot`):
Proceed to `/stackshift.bmad-synthesize` to auto-generate BMAD artifacts. The 11 reverse-engineering docs provide ~90% of what BMAD needs.

---

## DO / DON'T

**DO:**
- Describe WHAT the system does, not HOW (especially for greenfield)
- Use all available signals for inference: README, comments, naming, config, git history
- Mark confidence levels: no marker = confident, `[INFERRED]` = reasonable inference, `[NEEDS USER INPUT]` = genuinely unknown
- Cross-reference between docs (e.g., tech debt informs trade-offs)
- Cite specific evidence for each inference

**DON'T:**
- Hard-code framework names in functional specs (greenfield)
- Mix business logic with technical implementation (greenfield)
- Fabricate business goals with no supporting evidence
- State inferences as facts without marking them
- Skip a section because it requires inference -- attempt it and mark confidence

---

## Completeness Checklist

Verify analysis captured:
- ALL API endpoints (not just the obvious ones)
- ALL data models (including DTOs, types, interfaces)
- ALL configuration options (check multiple files)
- ALL external integrations
- ALL user-facing strings and error messages (for persona/context inference)
- ALL config files (for decision rationale inference)

Each document must be comprehensive, accurate, organized, actionable, and honest about inferred vs verified information.
