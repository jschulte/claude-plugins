# Changelog

All notable changes to StackShift will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-03-05

### Added
- **Widget Migration: Argument-based invocation** — Run `/stackshift.widget-migrate v9.widgets.model-selector.responsive.v1` from your target repo without navigating to the widget source. Accepts `v9.widgets.*`, `v9.viewmodel.*`, and `ws-*` widget IDs
- **Widget Migration: Source resolution** — New `operations/resolve-widget-source.md` auto-resolves widget IDs to filesystem paths, with clone-if-missing prompts for repos not found locally
- **Widget Migration: BMAD integration** — Output writes directly to `docs/specs/widgets/{widget-name}/` in the target repo, producing specs compatible with BMAD's `/create-story` and `/dev-story` workflows. No intermediate synthesis step needed
- **Widget Migration: extraction-manifest.json** — Machine-readable metadata file with widget metrics, complexity assessment, and source tracking

### Changed
- Widget migration output directory changed from `_widget-migrate/` to `docs/specs/widgets/{widget-name}/` when invoked with a widget ID argument (legacy cwd behavior preserved)
- Widget name derivation follows ADR-006 kebab-case conventions (e.g., `v9.widgets.model-selector.responsive.v1` → `model-selector-responsive`)
- Migration report now includes BMAD integration section with next steps for `/create-story`

## [2.3.1] - 2026-02-20

### Added
- Slash command for integration-analysis skill

## [2.3.0] - 2026-02-19

### Added
- **Integration Analysis**: New `/stackshift.integration-analysis` skill for cross-system integration analysis. Give it starting points (repos, config dirs, system names) and it discovers the full ecosystem, profiles each system, maps connections, and produces a phased implementation plan with dependency-ordered epics

## [2.2.0] - 2026-02-18

### Added
- **Widget Migration**: New `/stackshift.widget-migrate` skill for end-to-end legacy widget migration. Detects widget type (V9 Velocity, V9 Viewmodel, Osiris), extracts business logic, maps preferences, maps to Iris design system components, and generates implementation-ready epics for React Router 7 + Iris + TypeScript
- **Portable Component Extraction**: New `/stackshift.portable-extract` skill to extract tech-agnostic, reusable component specs from reverse-engineering docs
- **Portable Transplant**: New `/stackshift.portable-transplant` skill to translate portable specs into targeted epics for a specific project's patterns

### Fixed
- Osiris prefs.json structure handling and ws-scripts exclusion

## [2.1.0] - 2026-02-14

### Added
- **Ecosystem Discovery**: New `/stackshift.discover` skill to auto-discover all related repos from a single starting point by scanning 10 signal categories (npm packages, Docker Compose, env vars, API calls, CI/CD triggers, workspace configs, message queues, infrastructure refs, etc.)
- OpenCode support with commands and agents
- Spec validation hooks for git operations
- CMS web widget analyzer agent restored

### Changed
- Updated all repo URLs from OSS fork to enterprise GHE

## [2.0.0] - 2026-02-12

### Added
- **BMAD Auto-Pilot**: `/stackshift.bmad-synthesize` auto-generates BMAD artifacts (PRD, Architecture, Epics, UX Design) from reverse-engineering docs. Three modes: YOLO, Guided, Interactive
- **Architecture Generator**: `/stackshift.architect` generates architecture docs with Mermaid diagrams, ADRs, cost estimation, and migration paths
- **Reimagine**: `/stackshift.reimagine` for multi-repo synthesis — load docs from multiple repos, extract unified capability map, brainstorm redesign
- **Refresh Docs**: `/stackshift.refresh-docs` for incremental doc updates pinned to git commit hashes
- Two new reverse-engineering docs: `business-context.md` and `decision-rationale.md` (11 total, up from 9)
- New framework options in Gear 1: BMAD Auto-Pilot and Architecture Only

### Changed
- Reverse engineering now generates 11 docs (up from 9)
- Enriched existing docs: functional-specification.md (personas, positioning), data-architecture.md (bounded contexts), operations-guide.md (scalability), technical-debt-analysis.md (migration priority matrix)
- Gear 1 now offers 4 framework choices (was 2)
- Cruise control updated for all 4 framework paths

## [1.9.0] - 2026-02-01

### Added
- Deterministic AST integration across all 6 gears
- File-based AST architecture for analysis

## [1.8.0] - 2025-11-29

### Added
- GitHub Spec Kit scripts installer for automatic prerequisite setup

### Fixed
- Gear 4 script dependency issue where `/speckit.analyze` failed with missing scripts

## [1.7.0] - 2025-11-28

Previous releases — see git history.
