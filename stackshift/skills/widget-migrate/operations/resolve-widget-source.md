# Resolve Widget Source

**Operation:** Given a widget identifier (e.g., `v9.widgets.contact.info.v1`, `ws-hours`, `v9.viewmodel.map.dynamic`), resolve the filesystem path to its source code. Clone the repository if not present locally.

---

## When to Use

This operation runs when widget-migrate is invoked with a **widget identifier argument** instead of being run from within a widget directory. It allows developers to run the pipeline from any repo (e.g., their target platform repo) without first navigating to the legacy source.

---

## Widget ID Patterns

### Pattern 1: V9 Velocity Widget
**Format:** `v9.widgets.{category}.{name}.{version}`
**Example:** `v9.widgets.contact.info.v1`, `v9.widgets.model-selector.responsive.v1`

```
Widget ID: v9.widgets.contact.info.v1
  -> category: contact
  -> name: info
  -> version: v1
  -> source_path: ~/git/cms-web/htdocs/v9/widgets/contact/info/v1/
  -> portlet_xml: ~/git/cms-web/deploy/widgets/v9/contact-portlets.xml
  -> repo: cms-web
```

### Pattern 2: V9 Viewmodel Widget
**Format:** `v9.viewmodel.{category}.{name}`
**Example:** `v9.viewmodel.map.dynamic`, `v9.viewmodel.locations.mobile_call`

```
Widget ID: v9.viewmodel.map.dynamic
  -> category: map
  -> name: dynamic
  -> source_path: ~/git/cms-web/htdocs/v9/viewmodel/{category}/{name}/
  -> repo: cms-web
```

**Note:** Viewmodel directory structure varies. Widgets may live under `v9/viewmodel/{category}/{name}/` or `v9/viewmodel/widgets/{name}/`. The conventional path check tries `{category}/{name}/` first. The Tier 2 broad search handles alternative layouts.

### Pattern 3: Osiris Widget
**Format:** `ws-{name}`
**Example:** `ws-hours`, `ws-facet-browse`, `ws-vehicle-media`

```
Widget ID: ws-hours
  -> name: hours
  -> workspace: ws-hours
  -> source_path: ~/git/osiris/ws-hours/
  -> alt_source_path: ~/git/ws-hours/  (standalone clone)
  -> repo: osiris (monorepo) or ws-hours (standalone)
```

---

## Resolution Logic

Resolution uses a **tiered search strategy**: check conventional paths first, then search `~/git/` broadly, then offer to clone.

```
FUNCTION resolve_widget_source(widget_id):

  # 1. Parse the widget ID to determine type and search terms
  IF widget_id starts with "v9.widgets.":
    type = "v9-velocity"
    parts = widget_id.split(".")  # ["v9", "widgets", category, name, version]
    category = parts[2]
    name = parts[3]
    version = parts[4]
    repo_url = "git@ghe.coxautoinc.com:DDC-WebPlatform/cms-web.git"

  ELSE IF widget_id starts with "v9.viewmodel.":
    type = "v9-viewmodel"
    parts = widget_id.split(".")  # ["v9", "viewmodel", category, name]
    category = parts[2]
    name = parts[3]
    repo_url = "git@ghe.coxautoinc.com:DDC-WebPlatform/cms-web.git"

  ELSE IF widget_id starts with "ws-":
    type = "osiris"
    workspace = widget_id
    name = widget_id.replace("ws-", "")
    repo_url = "git@ghe.coxautoinc.com:DDC-WebPlatform/osiris.git"

  ELSE:
    ERROR: "Unrecognized widget ID format: {widget_id}"
    HINT: "Expected one of:"
    HINT: "  v9.widgets.{category}.{name}.{version}"
    HINT: "  v9.viewmodel.{category}.{name}"
    HINT: "  ws-{name}"
    RETURN error

  # 2. Tier 1: Check conventional paths
  source_path = check_conventional_paths(type, category, name, version, workspace)
  IF source_path found:
    LOG: "Found at conventional path: {source_path}"
    RETURN { type, source_path, widget_identity }

  # 3. Tier 2: Search ~/git/ broadly
  source_path = search_git_directory(type, category, name, version, workspace)
  IF source_path found:
    LOG: "Found via ~/git/ search: {source_path}"
    RETURN { type, source_path, widget_identity }

  # 4. Tier 3: Offer to clone
  PROMPT: "Widget source not found locally."
  PROMPT: "Clone from {repo_url}? (This may take a few minutes for large repos)"

  IF user approves:
    repo_path = "~/git/" + repo_name_from_url(repo_url)
    RUN: git clone {repo_url} {repo_path}
    # Re-run tier 1+2 after clone
    source_path = check_conventional_paths(...) OR search_git_directory(...)
    IF source_path found:
      RETURN { type, source_path, widget_identity }
    ELSE:
      ERROR: "Clone succeeded but widget not found. Check widget ID spelling."
      RETURN error
  ELSE:
    ERROR: "Cannot proceed without widget source."
    RETURN error

END FUNCTION
```

### Tier 1: Conventional Paths

Check the expected locations first (fastest, no filesystem scan):

```
FUNCTION check_conventional_paths(type, category, name, version, workspace):

  IF type == "v9-velocity":
    path = "~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/"
    IF exists(path): RETURN path

  ELSE IF type == "v9-viewmodel":
    path = "~/git/cms-web/htdocs/v9/viewmodel/{category}/{name}/"
    IF exists(path): RETURN path
    # Alternative layout: viewmodel/widgets/{name}/
    path = "~/git/cms-web/htdocs/v9/viewmodel/widgets/{name}/"
    IF exists(path): RETURN path

  ELSE IF type == "osiris":
    # Check monorepo first
    path = "~/git/osiris/{workspace}/"
    IF exists(path): RETURN path

    # Check standalone clone
    path = "~/git/{workspace}/"
    IF exists(path): RETURN path

  RETURN null

END FUNCTION
```

### Tier 2: Search ~/git/ Broadly

If conventional paths miss, search `~/git/` for the widget. This handles repos cloned to non-standard locations, nested directories, or alternative monorepo structures.

```
FUNCTION search_git_directory(type, category, name, version, workspace):

  IF type == "v9-velocity":
    # Search for the widget.vm file in any cms-web clone
    results = GLOB("~/git/**/v9/widgets/{category}/{name}/{version}/widget.vm")
    # Also try: find ~/git -path "*/v9/widgets/{category}/{name}/{version}" -type d
    IF results not empty:
      RETURN directory_of(results[0])

  ELSE IF type == "v9-viewmodel":
    # Viewmodel paths vary — search by name
    results = GLOB("~/git/**/v9/viewmodel/**/{name}/")
    IF results not empty:
      RETURN results[0]

  ELSE IF type == "osiris":
    # Search for the workspace anywhere under ~/git/
    results = GLOB("~/git/**/{workspace}/config/prefs.json")
    IF results not empty:
      candidate = directory_of(results[0])
      IF validate_osiris_workspace(candidate): RETURN candidate

    # Fallback: workspace directory without prefs.json
    results = GLOB("~/git/**/{workspace}/package.json")
    IF results not empty:
      candidate = directory_of(results[0])
      IF validate_osiris_workspace(candidate): RETURN candidate

  RETURN null

END FUNCTION
```

### Osiris Workspace Validation

After resolving a candidate Osiris path via broad search, validate it is a genuine Osiris workspace (not an unrelated directory with the same name):

```
FUNCTION validate_osiris_workspace(path):
  # Must have ws- prefix in directory name
  IF basename(path) does not start with "ws-": RETURN false
  # Must have at least one: config/prefs.json, package.json with ws- name, or ws-module config
  IF exists(path + "/config/prefs.json"): RETURN true
  IF exists(path + "/package.json"):
    Read package.json name field
    IF name starts with "ws-": RETURN true
  RETURN false
END FUNCTION
```

**Performance note:** The `~/git/` search uses Glob with targeted patterns, not a recursive `find` of the entire tree. Tier 1 conventional paths hit first in most cases.

---

## Output

Resolution produces enriched detection state:

```json
{
  "widget_type": "v9-velocity",
  "resolved_from": "argument",
  "widget_identity": {
    "category": "contact",
    "name": "info",
    "version": "v1",
    "widget_id": "v9.widgets.contact.info.v1"
  },
  "source": {
    "path": "~/git/cms-web/htdocs/v9/widgets/contact/info/v1/",
    "repo": "~/git/cms-web",
    "portlet_xml": "~/git/cms-web/deploy/widgets/v9/contact-portlets.xml"
  }
}
```

For Osiris:

```json
{
  "widget_type": "osiris",
  "resolved_from": "argument",
  "widget_identity": {
    "name": "hours",
    "workspace": "ws-hours",
    "widget_id": "ws-hours"
  },
  "source": {
    "path": "~/git/osiris/ws-hours/",
    "repo": "~/git/osiris"
  }
}
```

---

## Integration with Detect Widget Type

When `resolve-widget-source` runs successfully, its output **replaces** the cwd-based detection in `detect-widget-type.md`. The downstream steps (extract, preference catalog, iris mapping, etc.) use the resolved `source.path` as their working directory.

```
IF widget_id argument provided:
  Run resolve-widget-source(widget_id)  # This operation
  Skip detect-widget-type (already resolved)
ELSE:
  Run detect-widget-type  # Original cwd-based detection
END IF
```
