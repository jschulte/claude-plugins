# Generate Preference Catalog

**Operation:** Extract every widget preference and map it to a React equivalent.

**Hard requirement:** 100% of preferences must be accounted for. Zero missing.

---

## Step 1: Extract Preferences by Widget Type

### V9 Velocity Widgets

**Primary source:** Portlet XML at `~/git/cms-web/deploy/widgets/v9/{category}-portlets.xml`

```bash
# Extract full portlet definition
PORTLET_XML=~/git/cms-web/deploy/widgets/v9/${CATEGORY}-portlets.xml
WIDGET_ID="v9.widgets.${CATEGORY}.${NAME}.${VERSION}"

# Parse all preferences
awk "/<portlet-name>${WIDGET_ID}<\/portlet-name>/,/<\/portlet>/" "$PORTLET_XML"
```

**For each `<preference>` element, extract:**
- `<name>` - Preference key
- `<value>` - Default value
- Usage in `widget.vm` and component templates (cross-reference with cms-web-widget-analyzer output)

**Secondary source:** Widget VM templates
- Look for `$!{prefName}` or `$prefName` references in templates
- Some preferences are used but not declared in portlet XML (inherited defaults)

### V9 Viewmodel Widgets

- Extract from Groovy viewmodel configuration
- Look for preference declarations in viewmodel class
- Check for `getPreference()` calls in Groovy code

### Osiris Widgets

**Primary source:** `config/prefs.json` in the workspace root (e.g., `~/git/osiris/ws-inv-listing/config/prefs.json`)

```bash
# Read Osiris preferences
PREFS_JSON="config/prefs.json"

if [ -f "$PREFS_JSON" ]; then
  echo "Found Osiris prefs.json: $PREFS_JSON"
  # Each key is a preference name
  # Parse with jq or Read tool
else
  echo "WARNING: config/prefs.json not found"
  echo "Expected at: $(pwd)/config/prefs.json"
fi
```

**Osiris prefs.json structure:**
```json
{
  "prefName": {
    "value": "default-value",
    "description": "What this preference does",
    "type": "select|boolean|string|integer|label|multi-select",
    "options": ["opt1", "opt2"],           // For select/boolean types
    "external-editable": true,             // Whether Composer UI can edit
    "grouping": "COMPOSER_GROUP_NAME",     // Composer UI grouping
    "label": "COMPOSER_LABEL_KEY",         // i18n label key
    "message": "COMPOSER_MESSAGE_KEY",     // i18n description key
    "validate": { "type": "integer", "min": 0 }  // Validation rules (optional)
  }
}
```

**For each preference key, extract:**
- Key name (preference identifier)
- `value` - Default value
- `description` - Business purpose
- `type` - Data type (`select`, `boolean`, `string`, `integer`, `label`, `multi-select`)
- `options` - Allowed values (can be strings or `{label, value}` objects)
- `external-editable` - Whether it's configurable in Composer UI (important for React prop vs hard-coded)
- `grouping` - Composer UI category (maps to React prop grouping)
- `validate` - Validation constraints (maps to React prop validation)

**Secondary sources:**
- React/Angular component prop definitions (for runtime preferences not in prefs.json)
- `ws-module` config for widget-level settings
- Environment-specific configuration files

**Osiris type-to-React mapping:**

| Osiris `type` | React Mechanism | Example |
|---------------|-----------------|---------|
| `select` (string options) | Union type prop | `layout: 'list' \| 'grid'` |
| `select` (true/false options) | Boolean prop | `showIncentives: boolean` |
| `boolean` | Boolean prop | `deliveryEnabled: boolean` |
| `string` | String prop | `calcRate: string` |
| `integer` | Number prop with validation | `deliveryBaseCost: number` |
| `label` | String prop (i18n) | `tabInfoLabel: string` |
| `multi-select` | String array prop | `scmLimitByPromotionType: string[]` |

**Osiris `external-editable` mapping:**
- `true` -> React prop (configurable per widget instance)
- `false` -> Internal default or site-config (not exposed to Composer equivalent)
- Not present -> Treat as internal/developer-only preference

---

## Step 2: Classify Each Preference

For every extracted preference, determine:

### Category

| Category | Description | Examples |
|----------|-------------|---------|
| **display** | Controls what is shown/hidden | `hideVcard`, `showDirectionsButton` |
| **behavior** | Controls how widget behaves | `useClosestAccountToZip`, `phoneNumbersAsLinks` |
| **data-source** | Controls where data comes from | `contactAccountId`, `departmentId` |
| **feature-flag** | Enables/disables features | `enableSocialLinks`, `showHoursSection` |
| **styling** | Controls visual presentation | `vCardCssClass`, `iconSize` |
| **ordering** | Controls display sequence | `vCardOrder`, `phoneOrder` |

### Type

| Type | Description | Examples |
|------|-------------|---------|
| **boolean** | true/false toggle | `hideVcard: false` |
| **string** | Free-text value | `contactAccountId: ""` |
| **number** | Numeric value | `maxPhoneNumbers: 3` |
| **enum** | One of fixed values | `layout: "vertical"` |
| **csv-list** | Comma-separated ordered list | `vCardOrder: "name,address,phone"` |
| **id-reference** | Reference to another entity | `departmentId: "SALES"` |

### Scope

| Scope | Description | React Mechanism |
|-------|-------------|-----------------|
| **widget-prop** | Set per widget instance | React component prop |
| **page-context** | Derived from page/URL context | React context or route params |
| **site-config** | Site-wide configuration | Environment config / React context |
| **user-state** | Based on user session/location | React context from data provider |

---

## Step 3: Map to React Mechanism

Apply these mapping rules:

| Legacy Pattern | React Mechanism | React Type |
|---------------|-----------------|------------|
| Boolean feature flag (`hideVcard`) | React prop + feature flag context | `boolean` prop, or `useFeatureFlag()` hook |
| String display text (`title`) | React prop | `string` prop |
| CSV ordering list (`vCardOrder`) | React prop | `string[]` prop |
| Account ID reference (`contactAccountId`) | React context from data provider | Via `useAccount()` hook or context |
| Department ID reference (`departmentId`) | React prop or context | `string` prop |
| CSS class override (`vCardCssClass`) | Iris design token / `className` prop | `string` prop (Iris token name) |
| Enum selection (`layout`) | React prop | Union type (`'vertical' \| 'horizontal'`) |
| Numeric limit (`maxPhoneNumbers`) | React prop | `number` prop |
| Boolean behavior toggle (`useClosestAccountToZip`) | React prop + hook logic | `boolean` prop controlling hook behavior |
| Boolean link behavior (`phoneNumbersAsLinks`) | React prop | `boolean` prop |

### Special Cases

**Preferences that become hooks:**
- `useClosestAccountToZip` -> `useNearestLocation(zip, accountId, enabled)` hook
- `contactAccountId` -> `useAccount(accountId)` hook
- `departmentId` -> `useDepartment(accountId, departmentId)` hook

**Preferences that become context:**
- Site-wide config values -> `<SiteConfigProvider>` context
- User geolocation -> `<UserLocationProvider>` context
- Account data -> `<AccountProvider>` context

**Preferences that map to Iris tokens:**
- CSS class overrides -> Iris `sx` prop or semantic design tokens
- Size values -> Iris size tokens (`sm`, `md`, `lg`)
- Color values -> Iris color tokens

---

## Step 4: Document Preference Interactions

**Identify dependency chains:**

```
Example dependency chain:
  useClosestAccountToZip = true
    -> requires: user ZIP code (from geoZip param or geolocation)
    -> modifies: contactAccountId (overrides with nearest account)
    -> affects: all account-dependent preferences (departmentId, phone IDs)
```

**Document conditional rendering:**

```
Example conditional:
  hideVcard = true
    -> suppresses: entire vCard section
    -> unaffected: data loading (account still fetched for other uses)
    -> overrides: all display preferences within vCard become irrelevant
```

**Document preference groups:**
- Group preferences that work together (e.g., phone1/phone2/phone3)
- Note which preferences are independent vs. interdependent
- Flag preferences that have no effect without a companion preference

---

## Output Format

Write to `{output_dir}/preference-catalog.md` (output directory is determined by SKILL.md Step 7):

```markdown
---
widget: "v9.widgets.contact.info.v1"
total_preferences: 52
extraction_date: "<date>"
---

# Preference Catalog

> Complete mapping of every legacy preference to its React Router 7 + Iris equivalent.
> 100% coverage: every preference accounted for.

## Summary

| Category | Count |
|----------|-------|
| Display | 12 |
| Behavior | 8 |
| Data Source | 6 |
| Feature Flag | 10 |
| Styling | 9 |
| Ordering | 3 |
| Other | 4 |
| **Total** | **52** |

## Preference Table

| ID | Name | Legacy Type | Default | Category | React Mechanism | React Type | Scope | Business Purpose | Dependencies |
|----|------|-------------|---------|----------|-----------------|------------|-------|-----------------|--------------|
| PREF-001 | hideVcard | boolean | false | display | React prop | `hideVcard?: boolean` | widget-prop | Hides entire vCard section | Overrides all display prefs |
| PREF-002 | useClosestAccountToZip | boolean | true | behavior | React prop + hook | `useNearestLocation?: boolean` | widget-prop | Show nearest dealer by ZIP | Requires geoZip, modifies account |
| PREF-003 | vCardOrder | csv-list | "name,address,phone,email,hours,social" | ordering | React prop | `sectionOrder?: string[]` | widget-prop | Controls vCard section display order | None |
| PREF-004 | contactAccountId | string | "" | data-source | useAccount() hook | Via AccountProvider | page-context | Primary account for contact data | None |
| PREF-005 | idPhone1 | id-reference | "" | data-source | React prop | `departmentIds?: string[]` | widget-prop | Department ID for phone 1 | Auto-defaults for AUTO category |
| ... | ... | ... | ... | ... | ... | ... | ... | ... | ... |

## Dependency Chains

### Chain 1: Account Selection
```
useClosestAccountToZip (PREF-002)
  -> geoZip (page context / geolocation)
  -> contactAccountId (PREF-004, overridden)
  -> departmentId (PREF-006, affected)
  -> idPhone1/2/3 (PREF-005/007/008, affected)
```

### Chain 2: Auto Dealer Defaults
```
Account category == "AUTO"
  -> idPhone1 defaults to "SALES" (PREF-005)
  -> idPhone2 defaults to "SERVICE" (PREF-007)
  -> idPhone3 defaults to "PARTS" (PREF-008)
```

## React Component Props Interface

Based on the preference catalog, the migrated React component should accept:

```typescript
interface ContactInfoProps {
  // Display
  hideVcard?: boolean;               // PREF-001
  showDirectionsButton?: boolean;    // PREF-009
  showSocialLinks?: boolean;         // PREF-010

  // Behavior
  useNearestLocation?: boolean;      // PREF-002
  phoneNumbersAsLinks?: boolean;     // PREF-011

  // Data Source
  accountId?: string;                // PREF-004
  departmentId?: string;             // PREF-006
  departmentIds?: string[];          // PREF-005, 007, 008

  // Ordering
  sectionOrder?: string[];           // PREF-003

  // Styling (Iris tokens)
  variant?: 'default' | 'compact';   // PREF-012
}
```

## Verification

- Total preferences in portlet XML: {N}
- Total preferences in catalog: {N}
- Coverage: 100%
- Preferences with no React equivalent: 0 (all mapped)
- Preferences deprecated (intentionally dropped): {list with justification}
```
