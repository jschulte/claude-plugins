---
description: "Migrate a legacy widget to React Router 7 + Iris. Accepts widget ID as argument (e.g., v9.widgets.model-selector.responsive.v1, ws-hours). Auto-resolves source, extracts specs, writes to docs/specs/widgets/."
---

# Widget Migration

**IMPORTANT**: This migrates legacy widgets to React Router 7 + Iris design system + TypeScript.

## Step 0: Resolve Widget Source

**Check if a widget ID was provided as an argument:** `$ARGUMENTS`

### If widget ID argument provided:

Follow the source resolution process in `operations/resolve-widget-source.md`:

1. Parse the widget ID to determine type:
   - `v9.widgets.{category}.{name}.{version}` → V9 Velocity
   - `v9.viewmodel.{category}.{name}` → V9 Viewmodel
   - `ws-{name}` → Osiris

2. Resolve the filesystem path:
   - V9 Velocity: `~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/`
   - V9 Viewmodel: `~/git/cms-web/htdocs/v9/viewmodel/` (glob for exact path)
   - Osiris: `~/git/osiris/{ws-name}/` or `~/git/{ws-name}/`

3. Validate the path exists. If the repo is missing, ask user to clone:
   - cms-web: `git clone git@ghe.coxautoinc.com:DDC-WebPlatform/cms-web.git ~/git/cms-web`
   - osiris: `git clone git@ghe.coxautoinc.com:DDC-WebPlatform/osiris.git ~/git/osiris`

4. Determine output directory (write specs to current repo):
   - V9: `docs/specs/widgets/{category}-{name}/` (drop v9.widgets. prefix and version)
   - V9 Viewmodel: `docs/specs/widgets/{category}-{name}/` (drop v9.viewmodel. prefix)
   - Osiris: `docs/specs/widgets/{ws-name}/` (keep as-is)

### If no argument (running from widget directory):

```bash
# Check we're in a recognized widget directory
REPO_NAME=$(basename $(pwd))

if [ -f "widget.vm" ] || [[ "$(pwd)" == */v9/widgets/* ]]; then
  echo "V9 Velocity widget detected"
elif [[ "$(pwd)" == */v9/viewmodel/* ]]; then
  echo "V9 Viewmodel widget detected"
elif [[ "$REPO_NAME" =~ ^ws- ]]; then
  echo "Osiris workspace detected"
else
  echo "ERROR: Not in a recognized widget directory and no widget ID provided."
  echo ""
  echo "Usage:"
  echo "  /stackshift.widget-migrate v9.widgets.model-selector.responsive.v1"
  echo "  /stackshift.widget-migrate ws-hours"
  echo "  /stackshift.widget-migrate v9.viewmodel.map.dynamic"
  echo ""
  echo "Or navigate to a widget directory:"
  echo "  cd ~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/"
  echo "  /stackshift.widget-migrate"
fi
```

## Step 1: Run Widget Migration Pipeline

Use the Skill tool with skill="widget-migrate".

**The skill will**:
1. Auto-detect widget type (V9 Velocity, V9 Viewmodel, Osiris, GVM)
2. Extract business logic (delegates to cms-web-widget-analyzer for V9, code-analyzer for Osiris)
3. Generate preference catalog (every preference mapped to React equivalent)
4. Generate Iris component mapping (every UI component mapped to Iris)
5. Generate portable specs (tech-agnostic business rules and epics)
6. Generate targeted epics for React Router 7 + Iris (implementation-ready stories)
7. Write migration report with complexity assessment
8. Write all output to the resolved output directory

## Step 2: Review Output

**If invoked with widget ID argument**, review artifacts in `docs/specs/widgets/{widget-name}/`:

```
docs/specs/widgets/{widget-name}/
  portable-component-spec.md    # Business rules, data contracts
  preference-catalog.md         # Every preference -> React equivalent
  iris-component-mapping.md     # Legacy UI -> Iris components
  targeted-epics.md             # React Router 7 + Iris implementation stories
  extraction-manifest.json      # Machine-readable metadata
  migration-report.md           # Summary, complexity, gaps
```

**If invoked from widget directory**, review artifacts in `_widget-migrate/` (legacy behavior).

### Next Steps (BMAD Integration)

1. **Review specs** in `docs/specs/widgets/{widget-name}/`
2. **Run `/bmad-bmm-create-story`** for the relevant Epic 3 story — create-story will reference these widget specs in Dev Notes
3. **Run `/bmad-bmm-dev-story`** to implement — the story has full context from widget specs
4. **Reference `portable-component-spec.md`** for precise business rules during implementation
