---
name: widget-migrate
description: End-to-end legacy widget migration pipeline. Accepts a widget ID as argument (e.g., v9.widgets.model-selector.responsive.v1, ws-hours) — auto-resolves source location, extracts business logic, generates preference catalog, maps to Iris design system, and produces BMAD-compatible specs and stories for React Router 7 + Iris + TypeScript. Run from your target repo — no need to navigate to the widget source.
allowed-tools: Read, Write, Edit, Bash, Glob, Grep
---

# Widget Migration Pipeline

Migrate legacy widgets to React Router 7 + Iris design system + TypeScript.

**Estimated Time:** 15-40 minutes (depending on mode and widget complexity)
**Target Stack:** React Router 7 + Iris Design System + TypeScript (hard-coded, no questions)
**Output:** Widget specs in `docs/specs/widgets/{widget-name}/` + BMAD-compatible stories

---

## When This Skill Activates

Activate when:
- A legacy widget (V9 Velocity, V9 Viewmodel, or Osiris) needs migration to React Router 7 + Iris
- The user requests the full pipeline: resolve -> detect -> extract -> map -> generate specs + stories
- The user wants preference-complete and component-complete migration artifacts
- Output should feed directly into BMAD's `/create-story` and `/dev-story` workflows

**Trigger Phrases:**
- "Migrate this widget"
- "Widget migration"
- "Convert this widget to React"
- "Migrate to Iris"
- `/stackshift.widget-migrate v9.widgets.model-selector.responsive.v1`
- `/stackshift.widget-migrate ws-hours`

**Not supported:** GVM widgets. If the user requests GVM migration, respond: "GVM widget migration is not yet supported. Only V9 Velocity, V9 Viewmodel, and Osiris widgets are supported."

---

## Invocation

### Option A: Widget ID as Argument (Recommended)

Run from the **target platform repo** (e.g., `dealer-platform/`):

```
/stackshift.widget-migrate v9.widgets.model-selector.responsive.v1
/stackshift.widget-migrate ws-hours
/stackshift.widget-migrate v9.viewmodel.map.dynamic
```

The pipeline auto-resolves the widget source location, extracts everything, and writes output to `docs/specs/widgets/`.

### Option B: From Widget Directory (Legacy)

Navigate to the widget source directory and run:

```
cd ~/git/cms-web/htdocs/v9/widgets/model-selector/responsive/v1/
/stackshift.widget-migrate
```

Output goes to `_widget-migrate/` in the widget directory.

---

## Pipeline Overview

Step 0: Resolve + Detect -> Step 1: Extract -> Step 2: Preference Catalog -> Step 3: Iris Mapping -> Step 4: Portable Specs -> Step 5: Targeted Epics -> Step 6: Migration Report -> Step 7: Write Output

Target stack is hard-coded: React Router 7 + Iris + TypeScript. No questions about target.

---

## Three Modes

### Mode 1: YOLO (Fully Automatic)

**Time:** ~15-20 minutes
**User input:** None after initial mode selection

- Run full extraction and generation without pausing
- Resolve ambiguities with best-effort inference
- Mark uncertain items with `[AUTO - review recommended]`

**Best for:** Batch processing, quick assessment.

### Mode 2: Guided (Recommended)

**Time:** ~25-30 minutes
**User input:** 3-8 targeted questions

- Auto-extract high-confidence items
- Pause to ask targeted questions for ambiguous items only:
  - "This preference has no obvious React equivalent. Best mapping?"
  - "This component has no direct Iris match. Custom component or closest equivalent?"
  - "These 3 business rules interact. Confirm priority order?"

**Best for:** Most widget migrations. Good balance of speed and quality.

### Mode 3: Interactive

**Time:** ~30-40 minutes
**User input:** Full conversation at each step

- Present preference catalog for approval before continuing to Step 3
- Present Iris mapping for approval before continuing to Step 4
- Review each epic before finalizing Step 5

**Best for:** Complex widgets, critical business logic, maximum precision.

---

## Process

### Step 0: Resolve + Detect Widget

**If a widget ID argument is provided**, follow `operations/resolve-widget-source.md`:

1. Parse widget ID to determine type (`v9.widgets.*`, `v9.viewmodel.*`, `ws-*`)
2. Resolve filesystem path to source code
3. Validate source exists (offer to clone repo if missing)
4. Extract widget identity metadata

**If no argument** (running from widget directory), follow `operations/detect-widget-type.md`:

1. Check current directory against detection patterns
2. Classify as: `v9-velocity`, `v9-viewmodel`, or `osiris`
3. Extract widget identity (category, name, version for V9; workspace name for Osiris)
4. Validate repository access (cms-web, cms for V9)
5. If unknown: error with guidance on expected directory structure

**Error handling:** If resolution or detection fails (repo not found, path invalid, unknown format), stop the pipeline. Do not proceed to Step 1 without a confirmed widget type and source path.

**Progress signal:** Log "Step 0 complete: Detected {widget_type} at {source_path}". Update `.stackshift-state.json` `steps_completed` array with `"resolve"` and `"detect"`.

**Detection state saved:**
```json
{
  "detection_type": "v9-velocity",
  "implementation_framework": "widget-migrate",
  "resolved_from": "argument",
  "widget_identity": {
    "category": "model-selector",
    "name": "responsive",
    "version": "v1",
    "widget_id": "v9.widgets.model-selector.responsive.v1"
  },
  "source": {
    "path": "~/git/cms-web/htdocs/v9/widgets/model-selector/responsive/v1/",
    "repo": "~/git/cms-web"
  }
}
```

### Step 1: Extract Business Logic

**Note:** The `cms-web-widget-analyzer` agent uses "Phase" for its internal stages. These are not the same as widget-migrate "Steps".

**Delegate extraction based on widget type:**

#### For V9 Velocity and V9 Viewmodel Widgets

Invoke the `cms-web-widget-analyzer` agent (defined in `agents/cms-web-widget-analyzer/AGENT.md`).

The agent performs deep analysis across 7 phases:
1. Widget Discovery & Classification
2. Widget Configuration Extraction
3. Component Dependency Tree Analysis (recursive #parse tracing)
4. Helper Object Analysis (business logic in $helper calls)
5. Conditional Logic Extraction (business rules from #if blocks)
6. Portlet Configuration Analysis (all preferences from XML)
7. Java Backend Analysis (portlet class business logic)

**Output used by subsequent steps:**
- `component-dependency-tree.md` -> feeds Step 3 (Iris mapping)
- `portlet-configuration.md` -> feeds Step 2 (preference catalog)
- `business-rules.md` -> feeds Step 4 (portable specs)
- `helper-object-usage.md` -> feeds Step 4 (portable specs)
- `java-backend-logic.md` -> feeds Step 4 (portable specs)
- `component-catalog.md` -> feeds Step 3 (Iris mapping)
- `data-flow.md` -> feeds Step 4 (portable specs)

#### For Osiris Widgets

Invoke the `stackshift:stackshift-code-analyzer:AGENT` agent with the standard StackShift reverse-engineering process.

The agent performs:
1. React/Angular component analysis
2. State management extraction
3. API integration mapping
4. Business logic identification
5. Configuration extraction (preferences from `config/prefs.json`)

**Output files (11 reverse-engineering docs in `docs/reverse-engineering/`):**
- `overview.md` -> feeds Step 6 (migration report)
- `component-catalog.md` -> feeds Step 3 (Iris mapping)
- `data-flow.md` -> feeds Step 4 (portable specs)
- `state-management.md` -> feeds Step 4 (portable specs)
- `api-integration.md` -> feeds Step 4 (portable specs)
- `business-logic.md` -> feeds Step 4 (portable specs)
- `configuration.md` -> feeds Step 2 (preference catalog)
- `error-handling.md` -> feeds Step 4 (portable specs)
- `routing.md` -> feeds Step 5 (targeted epics)
- `testing.md` -> feeds Step 6 (migration report)
- `dependencies.md` -> feeds Step 3 (Iris mapping)

**ws-scripts exclusion:** Osiris widgets depend on `ws-scripts` for build tooling, web server, testing framework, and development utilities. These are platform concerns that React Router 7 replaces. Exclude ws-scripts functionality from extraction.

**Error handling:** If the extraction agent fails or produces incomplete output (missing key files like component-catalog or business-logic), stop the pipeline. Report which output files are missing and suggest re-running extraction.

**Progress signal:** Log "Step 1 complete: Extracted {N} files from {widget_type} widget". Update `steps_completed` with `"extract"`.

### Step 2: Generate Preference Catalog

Follow the process in `operations/generate-preference-catalog.md`:

1. Extract all preferences from portlet XML (V9) or config files (Osiris)
2. Classify each preference (category, type, scope)
3. Map to React mechanism (prop, hook, context, design token)
4. Document preference interactions and dependency chains
5. Generate React component props interface

**Output:** `preference-catalog.md`

**Quality gate enforcement:** After generating the catalog, count all preferences in the source (portlet XML `<preference>` elements for V9, keys in `config/prefs.json` for Osiris) and compare to the catalog count.
- If counts match: proceed.
- If counts do not match: identify the missing preferences, add them to the catalog, and re-verify. Do not proceed until 100% coverage is achieved.
- In YOLO mode: if a preference has no clear React mapping, mark it `[AUTO - review recommended]` and continue.
- In Guided mode: ask the user about preferences with ambiguous mappings before proceeding.
- In Interactive mode: present the full preference catalog to the user for approval before proceeding to Step 3.

**Progress signal:** Log "Step 2 complete: {N} preferences cataloged, 100% coverage". Update `steps_completed` with `"preferences"`.

### Step 3: Generate Iris Component Mapping

Follow the process in `operations/generate-iris-mapping.md`:

1. Extract legacy UI components from widget analyzer output
2. Map each to Iris component(s) using known mapping table
3. Map styling (CSS prefs -> design tokens, inline -> sx prop)
4. Compose complex components (show how deep nesting -> flat Iris composition)
5. Identify custom components needed (with Iris primitives)

**Output:** `iris-component-mapping.md`

**Quality gate enforcement:** After generating the mapping, count all components in the dependency tree from Step 1 and compare to mapped + flagged-as-custom count.
- If counts match: proceed.
- If counts do not match: identify unmapped components, add mappings or flag as custom, and re-verify. Do not proceed until 100% accounted for.
- In YOLO mode: map uncertain components to closest Iris equivalent with `[AUTO - review recommended]`.
- In Guided mode: ask the user about components with no clear Iris match.
- In Interactive mode: present the full Iris mapping to the user for approval before proceeding to Step 4.

**Progress signal:** Log "Step 3 complete: {N} components mapped to Iris, {M} custom". Update `steps_completed` with `"iris"`.

### Step 4: Generate Portable Specs

Follow the portable-extract process (read `skills/portable-extract/SKILL.md` for reference, but execute inline -- do not invoke the separate skill):

1. Take the extracted business logic from Step 1
2. Abstract personas to [User], [Admin], [System]
3. Extract business rules (BR-CALC, BR-VAL, BR-DEC, BR-STATE)
4. Extract data contracts (DC-IN, DC-OUT, DC-STATE)
5. Extract edge cases (EC-*) and error states (ERR-*)
6. Generate domain-grouped epics (tech-agnostic)
7. Apply exclusion filter (no tech debt, CI/CD, test infra)

**Output:**
- `portable-epics.md` - Tech-agnostic epics
- `portable-component-spec.md` - Business rules, data contracts

**Cross-referencing:** Every story must reference BR-*/PREF-*/COMP-* IDs from Steps 2-3.

**Progress signal:** Log "Step 4 complete: {N} business rules, {M} data contracts extracted". Update `steps_completed` with `"portable"`.

### Step 5: Generate Targeted Epics

Follow the portable-transplant process (read `skills/portable-transplant/SKILL.md` for reference, but execute inline with hard-coded target):

**Target configuration (hard-coded):**
- **Framework:** React Router 7
- **Design system:** Iris
- **Language:** TypeScript
- **State management:** React hooks + context
- **Routing:** React Router 7 file-based routes
- **Data fetching:** React Router 7 loaders/actions

**Process:**
1. Take portable epics from Step 4
2. Apply target stack to all acceptance criteria
3. Reference Iris components from Step 3 in story details
4. Reference preference mappings from Step 2 in story details
5. Add React Router 7 + TypeScript specifics:
   - "Implement as TypeScript React component"
   - "Use Iris `<Component>` for [UI element] (see COMP-*)"
   - "Accept preferences as typed props (see PREF-*)"
   - "Implement business rule BR-* as [hook/utility/component logic]"
6. Ensure zero source-platform terms in output

**Banned terms** (replace with React equivalents):
- No "Velocity", "portlet", "#parse", "assembler"
- No "Groovy", "viewmodel"
- No "Java", "DVS", "cms-web"

**Output:** `targeted-epics.md`

**Quality gate enforcement:** After generating targeted epics:
1. Search the output for banned source-platform terms. If any found, replace them and re-verify.
2. Verify every AC references at least one BR-*, PREF-*, or COMP-* ID. If any AC lacks references, add them.
3. In YOLO mode: auto-fix and continue.
4. In Guided mode: ask the user to confirm stories with complex cross-references.
5. In Interactive mode: present each epic to the user for review before finalizing.

**Progress signal:** Log "Step 5 complete: {N} stories generated, 0 platform terms, full cross-referencing". Update `steps_completed` with `"targeted"`.

### Step 6: Write Migration Report

Follow the template in `operations/generate-migration-report.md`.

Generate `migration-report.md` by aggregating metrics from Steps 1-5.

Also generate `extraction-manifest.json` with fields: `widget_id`, `widget_type`, `widget_name`, `source_path`, `extraction_date`, `mode`, `target_stack`, and a `metrics` object containing: `total_preferences`, `total_business_rules`, `total_data_contracts`, `total_edge_cases`, `total_error_states`, `total_iris_components`, `total_custom_components`, `complexity` (VERY HIGH/HIGH/MEDIUM/LOW). Aggregate all counts from Steps 2-5 output.

**Progress signal:** Log "Step 6 complete: Migration report and manifest generated". Update `steps_completed` with `"report"`.

### Step 7: Write Output to Target Location

**Determine output directory based on invocation context:**

```
IF invoked with widget ID argument (from a target repo):
  widget_name = derive_kebab_name(widget_id)
  output_dir = {cwd}/docs/specs/widgets/{widget_name}/

ELSE IF invoked from widget source directory:
  output_dir = {cwd}/_widget-migrate/

END IF
```

**Widget name derivation (kebab-case):**

| Widget ID | Output Directory Name |
|---|---|
| `v9.widgets.model-selector.responsive.v1` | `model-selector-responsive` |
| `v9.widgets.contact.info.v1` | `contact-info` |
| `v9.viewmodel.map.dynamic` | `map-dynamic` |
| `ws-hours` | `ws-hours` |

**Derivation rules:**
- V9 widgets: `{category}-{name}` (drop `v9.widgets.` prefix and version suffix)
- V9 viewmodels: `{category}-{name}` (drop `v9.viewmodel.` prefix)
- Osiris: use as-is (already kebab-case with `ws-` prefix)

**Files written to output directory:**

```
{output_dir}/
  portable-component-spec.md    # Business rules, data contracts (Step 4)
  preference-catalog.md         # Every preference -> React equivalent (Step 2)
  iris-component-mapping.md     # Legacy UI -> Iris components (Step 3)
  targeted-epics.md             # React Router 7 + Iris implementation stories (Step 5)
  extraction-manifest.json      # Machine-readable metadata (Step 6)
  migration-report.md           # Summary, complexity, gaps (Step 6)
```

**Progress signal:** Log "Step 7 complete: {N} files written to {output_dir}". Update `steps_completed` with `"output"`.

---

## BMAD Integration

Widget-migrate output feeds directly into BMAD workflows:

1. Specs land in `docs/specs/widgets/{name}/`
2. `/create-story` reads these specs for Dev Notes (references BR-*, PREF-*, COMP-* IDs)
3. `/dev-story` uses the Dev Notes during implementation

When `/create-story` generates a widget-related Epic 3 story, it merges ACs from `targeted-epics.md` with the Epic 3 story ACs and includes widget spec references in Dev Notes. The `targeted-epics.md` stories are reference material, not replacements for `epics.md`.

---

## Batch Session Auto-Configuration

Before prompting for mode, search upward from cwd for `.stackshift-batch-session.json` (stop at the first `.git` boundary). If found, read the mode from it and skip the mode selection question.

---

## State File

Save pipeline state to `.stackshift-state.json`. Update `steps_completed` after each step.

**Lifecycle:**
- On start: if existing state file has incomplete `steps_completed` for the same widget, ask user to resume or restart. If for a different widget, overwrite.
- On completion: retain as a record.

State file includes: `detection_type`, `widget_identity`, `source`, and `widget_migrate` (mode, target_stack, output_dir, steps_completed array, preference/component/story counts). See Step 0 detection state for the identity fields.

---

## Integration with StackShift Gear System

Widget migration can be triggered from the gear system:

1. **Gear 1 (Analyze):** Detects widget type, sets `implementation_framework: "widget-migrate"`
2. **Cruise Control:** Detects `widget-migrate` framework, runs `/stackshift.widget-migrate` in YOLO or Guided mode
3. **Manual:** User runs `/stackshift.widget-migrate {widget-id}` directly

When triggered from cruise control, skip the mode question -- the batch/cruise config determines YOLO vs Guided.

---

## Success Criteria

- Widget source resolved correctly from ID argument
- Widget type detected correctly (v9-velocity, v9-viewmodel, osiris)
- All output files generated in the output directory
- Preference catalog: 100% coverage (source count = catalog count)
- Iris mapping: 100% coverage (every component accounted for)
- Targeted epics: zero source-platform terms
- Targeted epics: every AC references BR-*, PREF-*, or COMP-* IDs
- extraction-manifest.json: valid JSON with complete metrics
- Migration report: complete complexity assessment and gap analysis
- State file: all steps marked complete
- Output compatible with BMAD `/create-story` workflow

---

## Technical Notes

- Widget source resolution uses ID patterns (`operations/resolve-widget-source.md`)
- Widget detection uses directory patterns (`operations/detect-widget-type.md`)
- V9 extraction delegates to cms-web-widget-analyzer agent (`agents/cms-web-widget-analyzer/AGENT.md`)
- Osiris extraction delegates to stackshift-code-analyzer agent
- Preference catalog uses portlet XML as source of truth for V9, `config/prefs.json` for Osiris
- Iris mapping uses known component mapping table (`operations/generate-iris-mapping.md`)
- Migration report follows template in `operations/generate-migration-report.md`
- Portable spec generation follows `skills/portable-extract/SKILL.md` patterns but runs inline
- Targeted epic generation follows `skills/portable-transplant/SKILL.md` patterns with hard-coded target
- All IDs (PREF-*, COMP-*, BR-*, DC-*, EC-*, ERR-*, FLOW-*) are unique across all output files
