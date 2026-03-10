# Widget Migration Guide

Migrate legacy CMS widgets (V9 Velocity, V9 Viewmodel, Osiris) to **React Router 7 + Iris Design System + TypeScript** with a single command.

---

## TL;DR

From your target platform repo:

```
/stackshift.widget-migrate v9.widgets.model-selector.responsive.v1
```

This auto-resolves the widget source, extracts everything, and writes specs to `docs/specs/widgets/model-selector-responsive/`. Then use BMAD's `/create-story` to turn those specs into implementation-ready stories.

---

## Folder Structure

The pipeline reads from legacy source repos and writes to the target platform repo. Here's where everything lives:

### Legacy Source Repos (read-only — where widgets come from)

```
~/git/cms-web/                                    # V9 Velocity + Viewmodel widgets
  htdocs/v9/widgets/                              # Velocity widget templates
    contact/info/v1/widget.vm                     #   e.g., v9.widgets.contact.info.v1
    model-selector/responsive/v1/widget.vm        #   e.g., v9.widgets.model-selector.responsive.v1
    inventory-search/form/v2/widget.vm            #   e.g., v9.widgets.inventory-search.form.v2
    hours/default/v1/widget.vm                    #   e.g., v9.widgets.hours.default.v1
  htdocs/v9/viewmodel/                            # Viewmodel widgets (Groovy-based)
    map/dynamic/                                  #   e.g., v9.viewmodel.map.dynamic
    locations/mobile_call/                         #   e.g., v9.viewmodel.locations.mobile_call
  htdocs/v9/pages/                                # Page templates (which widgets go where)
    inventory-listing/search-results/v1/pages.xml #   SRP page definition
    inventory-detail/responsive/v1/pages.xml      #   VDP page definition
  deploy/widgets/v9/                              # Portlet XML (preference definitions)
    contact-portlets.xml                          #   Preferences for contact widgets
    inventory-search-portlets.xml                 #   Preferences for search widgets

~/git/osiris/                                     # Osiris widgets (flat layout)
  ws-hours/                                       #   e.g., ws-hours
  ws-facet-browse/                                #   e.g., ws-facet-browse
  ws-inv-listing/                                 #   e.g., ws-inv-listing
  ws-inv-data/                                    #   e.g., ws-inv-data
  ws-vehicle-media/                               #   e.g., ws-vehicle-media
  ws-specials/                                    #   e.g., ws-specials
  ws-navigation/                                  #   e.g., ws-navigation

~/git/ws-hours/                                   # Some devs clone Osiris widgets standalone
~/git/ws-facet-browse/                            #   (pipeline checks here as fallback)

~/git/cms-core/                                   # Java backend (portlet classes, helpers)
```

### Target Platform Repo (where specs are written)

```
~/git/ai/dealer-platform/                         # Your target repo (run commands from here)
  docs/specs/widgets/                             # Widget migration specs output
    ws-hours/                                     #   Extracted from ~/git/osiris/ws-hours/
      portable-component-spec.md
      preference-catalog.md
      iris-component-mapping.md
      targeted-epics.md
      extraction-manifest.json
      migration-report.md
    ws-facet-browse/                              #   Extracted from ~/git/osiris/ws-facet-browse/
      ...
    model-selector-responsive/                    #   Extracted from ~/git/cms-web/.../model-selector/responsive/v1/
      ...
    contact-info/                                 #   Extracted from ~/git/cms-web/.../contact/info/v1/
      ...
  _bmad-output/
    planning-artifacts/
      epics.md                                    #   Epic 3 stories reference widget specs
    implementation-artifacts/
      3-6-dealer-contact-hours-widget.md          #   BMAD story (created by /create-story)
```

### How It Connects

```
Legacy Source                    Pipeline                    Target Repo
─────────────                   ────────                    ───────────
~/git/cms-web/                                              ~/git/ai/dealer-platform/
  htdocs/v9/widgets/    ──→  /widget-migrate  ──→    docs/specs/widgets/{name}/
  deploy/widgets/v9/                                        ↓
                                                     /create-story reads specs
~/git/osiris/                                               ↓
  packages/ws-*/         ──→  /widget-migrate  ──→   _bmad-output/.../story.md
                                                            ↓
                                                     /dev-story implements
```

---

## Supported Widget Types

| Widget ID Pattern | Type | Source Location |
|---|---|---|
| `v9.widgets.{category}.{name}.{version}` | V9 Velocity | `~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/` |
| `v9.viewmodel.{category}.{name}` | V9 Viewmodel | `~/git/cms-web/htdocs/v9/viewmodel/{category}/{name}/` |
| `ws-{name}` | Osiris | `~/git/osiris/{ws-name}/` or `~/git/{ws-name}/` |

**Examples:**
```
/stackshift.widget-migrate v9.widgets.contact.info.v1
/stackshift.widget-migrate v9.widgets.inventory-search.form.v2
/stackshift.widget-migrate v9.viewmodel.map.dynamic
/stackshift.widget-migrate ws-hours
/stackshift.widget-migrate ws-facet-browse
/stackshift.widget-migrate ws-vehicle-media
```

If the source repository isn't found locally, the pipeline prompts you to clone it.

---

## What Gets Produced

All output writes to `docs/specs/widgets/{widget-name}/` in your current repo:

```
docs/specs/widgets/contact-info/
  portable-component-spec.md    # Business rules (BR-*), data contracts (DC-*),
                                # edge cases (EC-*), error states (ERR-*),
                                # interaction patterns (FLOW-*)
  preference-catalog.md         # Every preference mapped to React prop/hook/context (PREF-*)
                                # Includes TypeScript props interface
  iris-component-mapping.md     # Every legacy UI component -> Iris equivalent (COMP-*)
                                # Includes full Iris component tree
  targeted-epics.md             # Implementation-ready stories for React Router 7 + Iris
                                # Zero legacy terms, all ACs reference BR-*/PREF-*/COMP-*
  extraction-manifest.json      # Machine-readable metadata: widget type, metrics, complexity
  migration-report.md           # Summary, complexity assessment, gaps, next steps
```

### Widget Name Derivation

Output directory names follow kebab-case conventions:

| Widget ID | Output Name |
|---|---|
| `v9.widgets.model-selector.responsive.v1` | `model-selector-responsive` |
| `v9.widgets.contact.info.v1` | `contact-info` |
| `v9.widgets.content.hero.v1` | `content-hero` |
| `v9.viewmodel.map.dynamic` | `map-dynamic` |
| `ws-hours` | `ws-hours` |

---

## Three Modes

| Mode | Time | User Input | Best For |
|---|---|---|---|
| **YOLO** | ~15-20 min | None | Batch processing, quick assessment |
| **Guided** (recommended) | ~25-30 min | 3-8 questions | Most widgets — good speed/quality balance |
| **Interactive** | ~30-40 min | Full review | Complex widgets, critical business logic |

---

## The Pipeline (7 Steps)

```
[Step 0: Resolve + Detect]
  Parse widget ID → resolve source path → validate exists
      ↓
[Step 1: Extract Business Logic]
  V9: cms-web-widget-analyzer (7-phase deep analysis)
  Osiris: stackshift code-analyzer
      ↓
[Step 2: Preference Catalog]
  Every preference → React prop/hook/context mapping
  100% coverage required
      ↓
[Step 3: Iris Component Mapping]
  Every legacy component → Iris equivalent
  100% coverage required
      ↓
[Step 4: Portable Specs]
  Tech-agnostic business rules, data contracts, edge cases
  BR-*, DC-*, EC-*, ERR-*, FLOW-* IDs
      ↓
[Step 5: Targeted Epics]
  React Router 7 + Iris + TypeScript stories
  Zero legacy terms, cross-referenced to BR-*/PREF-*/COMP-*
      ↓
[Step 6: Migration Report]
  Complexity assessment, gaps, metrics
      ↓
[Step 7: Write Output]
  All artifacts → docs/specs/widgets/{widget-name}/
```

---

## BMAD Integration

Widget-migrate output is designed to feed directly into BMAD's story lifecycle. No intermediate synthesis step needed.

### The Full Workflow

```
1. Extract widget specs
   /stackshift.widget-migrate ws-hours

2. Specs land in your repo
   docs/specs/widgets/ws-hours/
     ├── portable-component-spec.md
     ├── preference-catalog.md
     ├── iris-component-mapping.md
     ├── targeted-epics.md
     ├── extraction-manifest.json
     └── migration-report.md

3. Create a BMAD story for the relevant epic
   /bmad-bmm-create-story 3-6    (e.g., Epic 3 Story 6: Contact & Hours Widget)

   → create-story reads widget specs from docs/specs/widgets/ws-hours/
   → merges widget ACs with epic story ACs
   → includes BR-*/PREF-*/COMP-* refs in Dev Notes
   → produces: _bmad-output/implementation-artifacts/3-6-dealer-contact-hours-widget.md

4. Implement the story
   /bmad-bmm-dev-story 3-6

   → dev-story uses the full context from create-story
   → references widget specs for business rules during implementation
   → produces: working React Router 7 + Iris component
```

### What Create-Story Gets from Widget Specs

- **Acceptance criteria** from `targeted-epics.md` (merged with epic-level ACs)
- **Business rules** from `portable-component-spec.md` (cited as `BR-*` in Dev Notes)
- **React props interface** from `preference-catalog.md` (included in Dev Notes)
- **Iris component tree** from `iris-component-mapping.md` (included in Dev Notes)
- **Complexity/risk assessment** from `migration-report.md`

---

## Cross-Reference ID System

All specs use a consistent ID system that links everything together:

| ID Pattern | Source File | What It Identifies |
|---|---|---|
| `PREF-001`, `PREF-002`, ... | `preference-catalog.md` | Widget preferences → React props |
| `COMP-001`, `COMP-002`, ... | `iris-component-mapping.md` | Legacy components → Iris mappings |
| `BR-CALC-001`, `BR-VAL-001`, `BR-DEC-001`, `BR-STATE-001` | `portable-component-spec.md` | Business rules (calc, validation, decision, state) |
| `DC-IN-001`, `DC-OUT-001`, `DC-STATE-001` | `portable-component-spec.md` | Data contracts (input, output, state) |
| `EC-001`, `EC-002`, ... | `portable-component-spec.md` | Edge cases |
| `ERR-001`, `ERR-002`, ... | `portable-component-spec.md` | Error states |
| `FLOW-001`, `FLOW-002`, ... | `portable-component-spec.md` | Interaction patterns |

Every story in `targeted-epics.md` references these IDs, so you can trace any acceptance criterion back to its business rule, preference, or component mapping.

---

## Prerequisites

- **Claude Code** with StackShift plugin installed
- **Git access** to legacy repos:
  - `git@ghe.coxautoinc.com:DDC-WebPlatform/cms-web.git` (for V9 widgets)
  - `git@ghe.coxautoinc.com:DDC-WebPlatform/osiris.git` (for Osiris widgets)
- Repos cloned locally at `~/git/cms-web` and `~/git/osiris` (pipeline prompts to clone if missing)

---

## FAQ

**Can I run this from any directory?**
Yes, when you provide a widget ID as argument. The pipeline resolves the source automatically and writes output to `docs/specs/widgets/` in whatever repo you're currently in.

**What if the widget source repo isn't cloned?**
The pipeline prompts you with the clone command. Approve it and the pipeline continues.

**Does this replace portable-extract?**
Widget-migrate is a superset. It runs portable-extract internally (Step 4) but also adds preference catalog, Iris mapping, and targeted epics. If you only need tech-agnostic specs, portable-extract still works.

**Can I re-extract a widget that already has specs?**
Yes. Running widget-migrate again overwrites the existing specs in `docs/specs/widgets/{name}/`.

**What about widgets not in cms-web or osiris?**
For standalone widget repos, either navigate to the directory and run without arguments, or extend the source resolution patterns for your repo structure.
