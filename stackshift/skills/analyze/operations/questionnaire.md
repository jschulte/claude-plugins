# Questionnaire Reference

Questions to configure the analysis. Present conversationally, one at a time or in small related groups. Wait for user response before continuing.

---

## Question 1: Choose Your Path

```
Which path best aligns with your goals?

A) Greenfield: Extract for migration to new tech stack
   - Extract business logic only (tech-agnostic)
   - Can implement in any stack
   - Example: Extract Rails app business logic, rebuild in Next.js

B) Brownfield: Extract for maintaining existing codebase
   - Extract business logic + technical details (tech-prescriptive)
   - Manage existing codebase with specs
   - Example: Add specs to Express API for ongoing maintenance
```

This applies to ALL detection types:
- Monorepo Service + Greenfield = Business logic for platform migration
- Monorepo Service + Brownfield = Full implementation for maintenance
- Nx App + Greenfield = Business logic for rebuild
- Nx App + Brownfield = Full Nx/Angular details for refactoring
- Generic + Greenfield = Business logic for rebuild
- Generic + Brownfield = Full implementation for management

---

## Question 2: Implementation Framework

```
Which implementation framework do you want to use?

A) GitHub Spec Kit (Recommended for most projects)
   - Feature-level specifications in .specify/
   - Task-driven implementation with /speckit.* commands
   - Best for: small-medium projects, focused features

B) BMAD Auto-Pilot (Recommended for BMAD users)
   - Auto-generates BMAD artifacts (PRD, Architecture, Epics) from reverse-eng docs
   - Three modes: YOLO (fully automatic), Guided, Interactive
   - Best for: projects wanting BMAD format without full conversation

C) BMAD Method (Full collaborative workflow)
   - Hands off to BMAD collaborative PM/Architect agents
   - BMAD creates PRD + Architecture through conversation
   - Best for: large projects needing deep collaborative refinement

D) Architecture Only
   - Generates architecture document with your constraints
   - Includes Mermaid diagrams, ADRs, infrastructure recommendations
   - Best for: when you already know what to build, need architecture

E) Portable Component Extraction
   - Extracts tech-agnostic epics + component spec
   - Output can be dropped into ANY BMAD project
   - Best for: reusable components, cross-project migration

F) Widget Migration
   - Migrates legacy widget to React Router 7 + Iris design system
   - Generates preference catalog + Iris component mapping
   - Best for: V9 Velocity, V9 Viewmodel, Osiris widget migration
```

After Gear 2 extracts documentation:
- All frameworks get the same 11 docs in docs/reverse-engineering/
- Spec Kit: Gears 3-6 create .specify/ specs, use /speckit.implement
- BMAD Auto-Pilot: /stackshift.bmad-synthesize generates BMAD artifacts automatically
- BMAD: Skip to Gear 6, hand off to *workflow-init with rich context
- Architecture Only: /stackshift.architect generates architecture.md
- Portable Extraction: /stackshift.portable-extract generates portable epics + component spec
- Widget Migration: /stackshift.widget-migrate runs full pipeline

---

## Question 3: Brownfield Mode (If Brownfield selected)

```
Do you want to upgrade dependencies after establishing specs?

A) Standard - Just create specs for current state
   - Document existing implementation as-is
   - Specs match current code exactly

B) Upgrade - Create specs + upgrade all dependencies
   - Spec current state first (100% coverage)
   - Then upgrade all dependencies to latest versions
   - Fix breaking changes with spec guidance
```

---

## Question 4: Transmission

```
How do you want to shift through the gears?

A) Manual - Review each gear before proceeding
   - You control when to advance
   - Good for first-time users

B) Cruise Control - Shift through all gears automatically
   - Hands-free, unattended execution
   - Good for experienced users or overnight runs
```

---

## Question 5: Specification Thoroughness (If Spec Kit selected)

```
How thorough should specification generation be in Gear 3?

A) Specs only (30 min - fast)
   - Generate specs for all features
   - Create plans manually with /speckit.plan as needed

B) Specs + Plans (45-60 min - recommended)
   - Generate specs + auto-generate implementation plans for incomplete features
   - Ready for /speckit.tasks when you implement

C) Specs + Plans + Tasks (90-120 min - complete roadmap)
   - Generate specs + plans + comprehensive task lists (300-500 lines each)
   - Ready for immediate implementation
```

---

## Question 6: Clarifications Strategy (If Cruise Control selected)

```
How should [NEEDS CLARIFICATION] markers be handled?

A) Defer - Mark them, continue implementation around them
   - Fastest; clarify later with /speckit.clarify

B) Prompt - Stop and ask questions interactively
   - Most thorough; takes longer

C) Skip - Only implement fully-specified features
   - Safest; some features won't be implemented
```

---

## Question 7: Implementation Scope (If Cruise Control selected)

```
What should be implemented in Gear 6?

A) None - Stop after specs are ready
B) P0 only - Critical features only
C) P0 + P1 - Critical + high-value features
D) All - Every feature (may take hours/days)
```

---

## Question 8: Spec Output Location (If Greenfield selected)

```
Where should specifications and documentation be written?

A) Current repository (default)
   - Specs in: ./docs/reverse-engineering/, ./.specify/

B) New application repository
   - Specs in: ~/git/my-new-app/.specify/

C) Separate documentation repository
   - Specs in: ~/git/my-app-docs/.specify/

D) Custom location
   - Your choice: [specify path]
```

---

## Question 9: Target Stack (If Greenfield + Implementation selected)

```
What tech stack for the new implementation?

Examples:
- Next.js 15 + TypeScript + Prisma + PostgreSQL
- Python/FastAPI + SQLAlchemy + PostgreSQL
- Go + Gin + GORM + PostgreSQL
- Your choice: [specify preferred stack]
```

---

## Question 10: Build Location (If Greenfield + Implementation selected)

```
Where should the new application be built?

A) Subfolder (recommended for Web)
   - Examples: greenfield/, v2/, new-app/

B) Separate directory (local only)
   - Examples: ~/git/my-new-app, ../my-app-v2
   - Requires local Claude Code (not available in Web)

C) Replace in place (destructive)
   - Not recommended
```

If subfolder selected, ask for folder name (default: greenfield/).
If separate directory selected, ask for full path.

---

## Conditional Logic

Apply these rules based on answers:

- If Cruise Control: Ask clarifications strategy and implementation scope
- If Greenfield + implementing: Ask target stack
- If Greenfield + subfolder: Ask folder name (default: greenfield/)
- If BMAD Auto-Pilot: Skip spec thoroughness (BMAD Synthesize handles it)
- If BMAD Auto-Pilot + Cruise Control: After Gear 2, run /stackshift.bmad-synthesize in YOLO mode
- If BMAD: Skip spec thoroughness (BMAD handles its own planning)
- If BMAD + Cruise Control: Gear 6 hands off to BMAD instead of /speckit.implement
- If Architecture Only: Skip spec thoroughness, clarifications, implementation scope
- If Architecture Only + Cruise Control: After Gear 2, run /stackshift.architect
- If Portable Extraction: Skip spec thoroughness, clarifications, implementation scope
- If Portable Extraction + Cruise Control: After Gear 2, run /stackshift.portable-extract
- If Widget Migration: Skip spec thoroughness, clarifications, implementation scope, target stack (target hard-coded: React Router 7 + Iris + TypeScript)
- If Widget Migration + Cruise Control: Run /stackshift.widget-migrate in YOLO or Guided mode (bypasses standard gears)
- If Widget Migration + Manual: After analysis report, present summary and instruct user to run `/stackshift.widget-migrate` manually. Standard gears 2-6 are bypassed for widget migration regardless of transmission choice.

---

## State File

Store all answers in `.stackshift-state.json`:

```json
{
  "detection_type": "monorepo-service",
  "route": "greenfield",
  "implementation_framework": "speckit",
  "config": {
    "spec_output_location": "~/git/my-new-app",
    "build_location": "~/git/my-new-app",
    "target_stack": "Next.js 15 + React 19 + Prisma",
    "clarifications_strategy": "defer",
    "implementation_scope": "p0_p1"
  }
}
```

Field reference:
- `detection_type`: What kind of app (generic, monorepo-service, nx-app, turborepo-package, lerna-package, osiris, v9-velocity, v9-viewmodel)
- `route`: greenfield (tech-agnostic) or brownfield (tech-prescriptive)
- `implementation_framework`: speckit, bmad-autopilot, bmad, architect-only, portable-extract, or widget-migrate
- `config.spec_output_location`: Where Gear 2 writes to `{path}/docs/reverse-engineering/` and Gear 3 writes to `{path}/.specify/memory/`. Defaults to current directory.
- `config.build_location`: Where Gear 6 writes code. Defaults to `greenfield/` subfolder.

If `.stackshift-state.json` already exists when re-running analysis, ask the user whether to reuse existing configuration or start fresh.
