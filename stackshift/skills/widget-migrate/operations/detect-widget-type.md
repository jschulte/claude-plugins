# Detect Widget Type

Classify a widget from the current working directory and extract identity metadata.

Skip this operation if a widget ID argument was provided -- `operations/resolve-widget-source.md` already provides the type, identity, and source path.

---

## Detection Priority

Run these checks in order. Stop at the first match.

### 1. V9 Viewmodel Widget

```bash
# Check: Groovy-based viewmodel widget
# Viewmodel widgets may live under viewmodel/widgets/ or viewmodel/{category}/
if [[ "$(pwd)" == */v9/viewmodel/* ]]; then
  WIDGET_TYPE="v9-viewmodel"
  WIDGET_NAME="$(basename "$(pwd)")"
  echo "Detected: V9 Viewmodel Widget ($WIDGET_NAME)"
fi
```

**Indicators:**
- Current path contains `/v9/viewmodel/`
- Groovy files present (`.groovy`)
- Component nesting pattern (simpler than Velocity)

### 2. V9 Velocity Widget

```bash
# Check: Velocity-based V9 widget
if [ -f "widget.vm" ] || [[ "$(pwd)" == */v9/widgets/* ]]; then
  WIDGET_TYPE="v9-velocity"

  # Extract identity from path
  # Path: ~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/
  WIDGET_DIR="$(pwd)"
  VERSION="$(basename "$WIDGET_DIR")"
  NAME="$(basename "$(dirname "$WIDGET_DIR")")"
  CATEGORY="$(basename "$(dirname "$(dirname "$WIDGET_DIR")")")"
  WIDGET_ID="${CATEGORY}.${NAME}.${VERSION}"

  echo "Detected: V9 Velocity Widget"
  echo "  Category: $CATEGORY"
  echo "  Name: $NAME"
  echo "  Version: $VERSION"
  echo "  Widget ID: v9.widgets.${WIDGET_ID}"
fi
```

**Indicators:**
- `widget.vm` file exists in current directory
- Current path matches `*/v9/widgets/{category}/{name}/{version}/`
- Portlet XML expected at `~/git/cms-web/deploy/widgets/v9/{category}-portlets.xml`

### 3. Osiris Workspace

```bash
# Check: Osiris workspace (ws-* pattern)
REPO_NAME="$(basename "$(pwd)")"
if [[ "$REPO_NAME" =~ ^ws- ]]; then
  WIDGET_TYPE="osiris"
  WIDGET_NAME="${REPO_NAME#ws-}"  # Strip ws- prefix

  echo "Detected: Osiris Workspace"
  echo "  Workspace: $REPO_NAME"
  echo "  Widget Name: $WIDGET_NAME"
fi
```

**Indicators:**
- Directory name starts with `ws-`
- Contains React/Angular components
- Has `ws-module` configuration files
- Preferences in `config/prefs.json`

### 4. Unknown

```
If none of the above patterns match:

ERROR: Unable to detect widget type.

Current directory: $(pwd)

Expected one of:
  - V9 Velocity widget: Navigate to ~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/
  - V9 Viewmodel widget: Navigate to ~/git/cms-web/htdocs/v9/viewmodel/{category}/{name}/
  - Osiris workspace: Navigate to ~/git/{ws-name}/ (directory starts with ws-)

GVM widgets are not yet supported. If you need GVM migration, report the requirement.
```

---

## Repository Validation

**For V9 widgets (Velocity and Viewmodel):**

```bash
# Check cms-web repo accessible
if [ -d ~/git/cms-web ]; then
  echo "cms-web repo: FOUND at ~/git/cms-web"
else
  echo "WARNING: cms-web repo not found at ~/git/cms-web"
  echo "Some analysis features will be limited (portlet XML, component tracing)"
  echo "Clone: git clone git@ghe.coxautoinc.com:DDC-WebPlatform/cms-web.git ~/git/cms-web"
fi

# Check cms repo accessible (for Java backend)
if [ -d ~/git/cms ]; then
  echo "cms repo: FOUND at ~/git/cms"
else
  echo "WARNING: cms repo not found at ~/git/cms"
  echo "Java backend analysis will be skipped"
  echo "Clone: git clone git@ghe.coxautoinc.com:DDC-WebPlatform/cms.git ~/git/cms"
fi
```

**For Osiris widgets:**
- No additional repos needed (self-contained workspaces)
- Check for `node_modules` and suggest `npm install` if missing
- Verify `config/prefs.json` exists (primary preference source)
- Exclude `ws-scripts` dependencies from business logic extraction (platform concerns replaced by React Router 7)

---

## Output

Detection produces state for the widget-migrate skill:

```json
{
  "widget_type": "v9-velocity",
  "widget_identity": {
    "category": "contact",
    "name": "info",
    "version": "v1",
    "widget_id": "v9.widgets.contact.info.v1"
  },
  "repos": {
    "cms_web": true,
    "cms": true
  },
  "paths": {
    "widget_vm": "~/git/cms-web/htdocs/v9/widgets/contact/info/v1/widget.vm",
    "portlet_xml": "~/git/cms-web/deploy/widgets/v9/contact-portlets.xml",
    "java_class": "~/git/cms/src/main/java/com/dealer/portlets/ContactPortlet.java"
  }
}
```

For Osiris:

```json
{
  "widget_type": "osiris",
  "widget_identity": {
    "name": "vehicle-details",
    "workspace": "ws-vehicle-details"
  },
  "repos": {},
  "paths": {
    "root": "~/git/ws-vehicle-details"
  }
}
```
