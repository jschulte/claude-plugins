---
name: cms-web-widget-analyzer
description: Specialized agent for analyzing legacy CMS-web V9 widgets (Velocity-based) and Viewmodel widgets (Groovy-based). Understands complex component nesting patterns, helper object dependencies, portlet configurations, and Java backend integration. Extracts complete business logic from multi-layered widget architecture.
---

# CMS-Web Widget Analyzer

**Purpose:** Deep analysis and business logic extraction from legacy CMS-web widgets

**Expertise:**
- Velocity template analysis (5-7 level component nesting)
- Groovy Viewmodel widget analysis
- Java backend portlet integration
- Helper object dependency chains
- Component include/nesting patterns
- Preference cascade systems

---

## Widget Types Handled

### Type 1: V9 Velocity Widgets

**Location:** `cms-web/htdocs/v9/widgets/{category}/{name}/{version}/`

**Structure:**
```
v9/widgets/contact/info/v1/
├── widget.vm           # Entry point (~80 lines)
├── widget.inc          # Include marker
├── widget.md           # Documentation
└── widget-debug.vm     # Debug mode
```

**Backend:**
- Portlet XML: `cms-web/deploy/widgets/v9/{category}-portlets.xml`
- Java Class: `cms/src/.../com/dealer/portlets/{Category}Portlet.java`

**Complexity:**
- Widget sets context → calls assembler → loads component → components nest 5-7 deep
- 100+ conditional branches
- Helper objects with deep DVS integration
- Dynamic component assembly

### Type 2: V9 Viewmodel Widgets

**Location:** `cms-web/htdocs/v9/viewmodel/widgets/{name}/`

**Structure:**
- Groovy-based instead of Velocity
- Simpler pattern (more straightforward)
- Still uses component nesting

---

## Analysis Methodology

### Phase 1: Widget Discovery & Classification

**Determine widget type:**

```bash
# Check if V9 Velocity widget
if [ -f "widget.vm" ] && [ -d "../../widgets/" ]; then
  WIDGET_TYPE="v9-velocity"
  WIDGET_PATH=$(pwd)
  WIDGET_NAME=$(basename $(dirname $(dirname $WIDGET_PATH)))
fi

# Check if V9 Viewmodel widget
if [ -d "htdocs/v9/viewmodel/widgets/" ]; then
  WIDGET_TYPE="v9-viewmodel"
fi

# Check if Osiris widget (already handled)
if [[ $(basename $(pwd)) == ws-* ]]; then
  WIDGET_TYPE="osiris"
fi
```

### Phase 2: Extract Widget Configuration

**For V9 Velocity widgets:**

**Assumed repository locations:**
- CMS-web: `~/git/cms-web`
- CMS (Java backend): `~/git/cms`

```bash
# 1. Find widget.vm entry point
WIDGET_VM=$(find . -name "widget.vm" | head -1)
WIDGET_DIR=$(dirname "$WIDGET_VM")

# 2. Extract widget identity
# From path: ~/git/cms-web/htdocs/v9/widgets/contact/info/v1/widget.vm
# Extract: category=contact, name=info, version=v1
CATEGORY=$(basename $(dirname $(dirname "$WIDGET_DIR")))
NAME=$(basename $(dirname "$WIDGET_DIR"))
VERSION=$(basename "$WIDGET_DIR")
WIDGET_ID="${CATEGORY}.${NAME}.${VERSION}"

echo "Widget: v9.widgets.${WIDGET_ID}"

# 3. Find portlet XML (known location)
PORTLET_XML=~/git/cms-web/deploy/widgets/v9/${CATEGORY}-portlets.xml

if [ -f "$PORTLET_XML" ]; then
  echo "✅ Found portlet XML: $PORTLET_XML"

  # Extract preferences from portlet XML
  grep -A 100 "<portlet-name>v9.widgets.${WIDGET_ID}</portlet-name>" "$PORTLET_XML" | \
    grep -B 1 "<name>" | \
    grep "<name>" | \
    sed 's/.*<name>\(.*\)<\/name>.*/\1/' | \
    sort | \
    tee .upgrade/widget-preferences.txt
else
  echo "⚠️ Portlet XML not found at expected location"
fi

# 4. Find Java backend portlet class (known pattern)
# Pattern: cms/src/main/java/com/dealer/portlets/{Category}Portlet.java
# Example: cms/src/main/java/com/dealer/portlets/ContactPortlet.java

JAVA_CLASS_NAME="${CATEGORY^}Portlet.java"  # Capitalize first letter
JAVA_CLASS=$(find ~/git/cms/src -name "$JAVA_CLASS_NAME" | head -1)

if [ -f "$JAVA_CLASS" ]; then
  echo "✅ Found Java backend: $JAVA_CLASS"

  # Extract key methods
  grep -E "public|protected" "$JAVA_CLASS" | \
    grep -v "^//" | \
    tee .upgrade/java-backend-methods.txt
else
  echo "⚠️ Java backend not found - trying alternate search..."

  # Fallback: Search for widget name in all portlet files
  JAVA_CLASS=$(find ~/git/cms/src -name "*Portlet.java" | \
    xargs grep -l "$WIDGET_ID" | head -1)

  if [ -f "$JAVA_CLASS" ]; then
    echo "✅ Found via content search: $JAVA_CLASS"
  else
    echo "❌ Java backend not found - widget may be template-only"
  fi
fi
```

**File Locations:**

| Component | Path Pattern | Example |
|-----------|-------------|---------|
| **Widget VM** | `~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/widget.vm` | `~/git/cms-web/htdocs/v9/widgets/contact/info/v1/widget.vm` |
| **Portlet XML** | `~/git/cms-web/deploy/widgets/v9/{category}-portlets.xml` | `~/git/cms-web/deploy/widgets/v9/contact-portlets.xml` |
| **Java Class** | `~/git/cms/src/main/java/com/dealer/portlets/{Category}Portlet.java` | `~/git/cms/src/.../ContactPortlet.java` |
| **Components** | `~/git/cms-web/htdocs/v9/components/{subcat}/{name}/{version}/component.vm` | `~/git/cms-web/htdocs/v9/components/vcard/default/v1/component.vm` |
| **Assembler** | `~/git/cms-web/htdocs/v9/assemblers/component/default/v1/assembler.vm` | (Standard assembler) |

### Phase 3: Component Dependency Tree Analysis (Use Read Tool + LLM!)

**Critical: Trace all #parse calls recursively using Read tool**

**Approach:**

1. **Read widget.vm using Read tool**
   - Understand the Velocity template logic
   - Identify all #parse() calls
   - Extract component paths from #parse('/v9/assemblers/...')

2. **For each #parse call found:**
   - Construct full path: `~/git/cms-web/htdocs{component_path}`
   - Use Read tool to load that component
   - Analyze what the component does (use LLM comprehension!)
   - Look for nested #parse calls within that component
   - Recursively analyze (max depth 10)

3. **For each component, understand:**
   - **Purpose:** What does this component render?
   - **Inputs:** What variables does it expect ($icon, $button, etc.)?
   - **Business Logic:** Any conditionals or data processing?
   - **Output:** What HTML/markup does it generate?
   - **Nested Includes:** Does it #parse other components?

**Example LLM-Native Analysis:**

```markdown
## Component: vcard/default/v1

**Read:** ~/git/cms-web/htdocs/v9/components/vcard/default/v1/component.vm

**Analysis:**

**Purpose:** Renders a contact vCard with dealer information

**Inputs Expected:**
- $contactAccount - Account object with name, address, phone
- $departmentAccount - Department object (if applicable)
- $vCardOrder - CSV list controlling display order
- $idPhone1, $idPhone2, $idPhone3 - Department IDs for phones
- Multiple CSS class preferences

**Business Logic:**
1. Loops through $vCardOrder array to render sections in order
2. For each section (name, address, phone, email, hours):
   - Checks if data exists ($v.exists())
   - Checks feature flags ($ff.isEnabled())
   - Renders section using nested components

3. Phone number handling:
   - For each phone ID (idPhone1, idPhone2, idPhone3):
     - Fetches phone from $phone.getNumberForAttribute()
     - Formats with $phone.formatNumber()
     - Renders as link if $phoneNumbersAsLinks is true
     - Uses icon component for phone icon

4. Address rendering:
   - Checks if account has address
   - Formats multi-line address
   - Includes "Get Directions" button if enabled
   - Uses icon component for location icon

**Nested Components (7 total):**
1. ui/icon/v1 - For address icon, phone icons
2. ui/button/v1 - For "Get Directions" button
3. photo/default/v1 - For dealer/staff photo
4. ui/state/v1 - For badges/status indicators
5. [3 more components...]

**Business Rules:**
- vCardOrder controls display sequence
- Phone sections only shown if phone numbers exist
- Directions button feature-flagged
- Photo display conditional on photoUrl existence
```

**This uses Claude's understanding of Velocity syntax and business logic, not just grep!**

### Phase 4: Helper Object Analysis (LLM Comprehension!)

**Read the Velocity templates and identify helper usage:**

**Use LLM to understand helper calls in context:**

1. **Read widget.vm and component.vm files**
2. **Identify all $helper.* calls and understand:**
   - **What data is being requested?**
   - **Why is it needed?**
   - **How is the result used in the template?**

**Example Intelligent Analysis:**

```markdown
## Helper Object Usage in Contact Widget

### $helper.getAccount($contactAccountId)
**Purpose:** Fetches account data from DVS
**Returns:** Account object with name, address, phone, etc.
**Used for:** Displaying dealer contact information
**Business Logic:** Primary data source for contact details

### $helper.getClosestChildAccountFromZip($postalcode, $accountId, $exclude, $include)
**Purpose:** Finds nearest dealer location based on user's ZIP code
**Business Logic:** Geographic proximity matching
**Returns:** Account object for nearest dealer
**Used when:** useClosestAccountToZip preference is true
**Critical Business Rule:** Shows user most relevant dealer location

### $helper.getDepartment($accountId, $departmentId)
**Purpose:** Fetches specific department data (SALES, SERVICE, etc.)
**Returns:** Department object with department-specific contact info
**Used for:** Showing department phone numbers
**Business Logic:** Supports multi-department dealer structures

### $npvresourcetool.getAccountCategoryNames($accountId)
**Purpose:** Gets account categories (AUTO, MARINE, RV, etc.)
**Returns:** List of category strings
**Used for:** Conditional logic (AUTO dealers get different defaults)
**Critical Business Rule:** Industry-specific behavior branching

### $format.escapeHTML($value)
**Purpose:** XSS protection for user input
**Security:** Prevents HTML injection
**Used for:** All user-provided data displayed in template

### $link.page($pageAlias)
**Purpose:** Generates URL to CMS page
**Returns:** LinkBuilder for constructing links
**Used for:** Directions button, contact page links
**Business Logic:** Deep linking into CMS page structure

### $phone.formatNumber($number)
**Purpose:** Formats phone for display (e.g., (123) 456-7890)
**Business Logic:** Locale-aware phone formatting
**Used for:** All phone number displays

### $v.exists($variable)
**Purpose:** Null-safe variable existence check
**Used for:** Defensive rendering (prevent null pointer errors)
**Pattern:** Wraps all optional data access
```

**This analysis understands the business PURPOSE of each helper, not just that it's called!**

### Phase 5: Conditional Logic Extraction (LLM Understanding!)

**Read Velocity templates and understand conditional logic:**

**For each #if statement, understand:**
- **What is being checked?**
- **Why is this check happening?**
- **What's the business rule?**
- **What changes based on the condition?**

**Example Intelligent Analysis:**

```markdown
## Conditional Business Rules in Contact Widget

### Rule 1: ZIP-Based Account Selection
```velocity
#if($v.exists($useClosestAccountToZip))
  #if($v.exists($params.get("geoZip")))
    #set($postalcode = $!format.escapeHTML($params.get("geoZip")))
  #end
  #set($contactAccountId = $helper.getClosestChildAccountFromZip(...).id)
#else
  #if($useAccountIdParam == 'true')
    #set($contactAccountId = $!format.escapeHTML($params.get('accountId')))
  #end
#end
```

**Business Rule:** "When useClosestAccountToZip is enabled and user's ZIP is available, show the geographically nearest dealer location instead of default account"

**Purpose:** Improve user experience by showing most relevant location
**Impact:** Changes which dealer contact info is displayed
**Complexity:** Involves proximity service, geographic calculations

### Rule 2: Auto Dealer Department Defaults
```velocity
#set($cat = $npvresourcetool.getAccountCategoryNames($catId))
#if($cat.contains('AUTO'))
  #if(!$idPhone1 || $idPhone1 == '')
    #set($idPhone1 = 'SALES')
  #end
  #if(!$idPhone2 || $idPhone2 == '')
    #set($idPhone2 = 'SERVICE')
  #end
  #if(!$idPhone3 || $idPhone3 == '')
    #set($idPhone3 = 'PARTS')
  #end
#end
```

**Business Rule:** "Auto dealerships get SALES, SERVICE, PARTS as default department phone numbers if not explicitly configured"

**Purpose:** Industry-standard defaults for auto dealers
**Impact:** Ensures auto dealers show department-specific contact info
**Why It Matters:** Auto industry convention for customer service structure

### Rule 3: vCard Visibility Toggle
```velocity
#if($hideVcard != "true")
  [Render entire vCard component]
#end
```

**Business Rule:** "hideVcard preference completely suppresses vCard rendering"

**Purpose:** Allow pages to include contact widget but hide vCard portion
**Impact:** Widget can be used for data loading without UI display

### Rule 4: Phone as Link
```velocity
#if($vCardPhoneNumbersAsLinks)
  <a href="tel:${phoneNumber}">$formattedPhone</a>
#else
  $formattedPhone
#end
```

**Business Rule:** "Phone numbers can be clickable tel: links based on preference"

**Purpose:** Mobile UX - tap to call functionality
**Impact:** Enables or disables click-to-call on mobile devices
```

**This extracts the BUSINESS MEANING of conditionals, not just their syntax!**

### Phase 6: Portlet Configuration Analysis

**Extract widget preferences from portlet XML:**

**Location:** `~/git/cms-web/deploy/widgets/v9/{category}-portlets.xml`

```bash
# Read portlet XML
PORTLET_XML=~/git/cms-web/deploy/widgets/v9/${CATEGORY}-portlets.xml

echo "=== Extracting Portlet Configuration ==="

# Extract the entire portlet definition
awk "/<portlet-name>v9.widgets.${WIDGET_ID}<\/portlet-name>/,/<\/portlet>/" "$PORTLET_XML" > .upgrade/portlet-definition.xml

# Parse preferences
echo "=== Widget Preferences ==="
grep -A 2 "<preference>" .upgrade/portlet-definition.xml | \
  grep -E "<name>|<value>" | \
  paste - - | \
  sed 's/<name>\(.*\)<\/name>.*<value>\(.*\)<\/value>/\1 = \2/' | \
  tee .upgrade/widget-preferences-parsed.txt

# Count preferences
PREF_COUNT=$(grep -c "<preference>" .upgrade/portlet-definition.xml)
echo "Total preferences: $PREF_COUNT"
```

**Portlet XML Structure:**
```xml
<portlet>
  <portlet-name>v9.widgets.contact.info.v1</portlet-name>
  <portlet-class>com.dealer.portlets.ContactPortlet</portlet-class>
  <portlet-info>
    <title>Contact Information</title>
  </portlet-info>
  <portlet-preferences>
    <preference>
      <name>hideVcard</name>
      <value>false</value>
    </preference>
    <preference>
      <name>useClosestAccountToZip</name>
      <value>true</value>
    </preference>
    <preference>
      <name>idPhone1</name>
      <value></value>  <!-- Empty = auto-default based on account type -->
    </preference>
    <preference>
      <name>vCardOrder</name>
      <value>name,address,phone,email,hours,social</value>
    </preference>
    <!-- 50+ more preferences -->
  </portlet-preferences>
</portlet>
```

**Document for each preference:**
- Name (configuration key)
- Default value
- Business purpose (what it controls)
- Data type (boolean, string, CSV list, etc.)
- Impact on widget behavior

### Phase 7: Java Backend Analysis (Use LLM Intelligence!)

**Find the Java portlet class:**

**Expected location:** `~/git/cms/src/main/java/com/dealer/portlets/{Category}Portlet.java`

**Example:** Contact widget → `~/git/cms/src/main/java/com/dealer/portlets/ContactPortlet.java`

**Finding strategy:**

1. **Construct path from widget category:**
   - Widget path: `/v9/widgets/contact/info/v1/`
   - Category: `contact`
   - Java class: `ContactPortlet.java`

2. **Use Glob tool to find the file:**
   ```typescript
   Glob({
     pattern: "**/com/dealer/portlets/*${category}*Portlet.java",
     path: "~/git/cms/src"
   })
   ```

3. **Read the Java file using Read tool**

**Analyze with LLM understanding (not grep!):**

**Read the entire Java portlet class and analyze:**

1. **Understand the doView() or processAction() methods**
   - These are the entry points called by the CMS engine
   - What data does it fetch?
   - What business logic does it execute?
   - What does it put in request attributes for Velocity template?

2. **Identify business logic methods**
   - Look for methods that implement business rules
   - Example: `getDefaultPhoneIdsForAutoDealer()`
   - Example: `findNearestDealerByZip()`
   - Understand WHAT they do, not just pattern match

3. **Trace data flow:**
   - What comes in (request parameters)?
   - What gets fetched (DVS, external services)?
   - What gets transformed (calculations, formatting)?
   - What goes to template (request attributes)?

4. **Extract business rules:**
   - Conditional logic (if statements)
   - Example: "If account is AUTO category, default to SALES/SERVICE/PARTS departments"
   - Example: "If ZIP provided, find closest dealer location"
   - Understand the WHY behind the logic

5. **Document external dependencies:**
   - DVS document queries (Account, Department documents)
   - External service calls (proximity service, phone service)
   - Helper service methods
   - What data these provide to the business logic

**Example Analysis (using LLM understanding):**

```markdown
## Java Backend Business Logic

### ContactPortlet.java Analysis

**Entry Point:** `doView()` method

**Business Logic:**

1. **Account Selection Logic**
   - If `useClosestAccountToZip` preference is true:
     - Get user's ZIP code from geoZip parameter
     - Call proximity service to find nearest dealer location
     - Use nearest dealer as contactAccountId
   - Otherwise:
     - Use accountId from preference or parameter
   - Purpose: Show user the most relevant dealer location

2. **Auto Dealer Department Defaults**
   - Check if account has "AUTO" category
   - If AUTO dealer and phone IDs not specified:
     - Default idPhone1 = "SALES"
     - Default idPhone2 = "SERVICE"
     - Default idPhone3 = "PARTS"
   - Purpose: Auto dealers get industry-standard department structure

3. **Data Fetching**
   - Fetch Account document from DVS using accountId
   - Fetch Department document if departmentId specified
   - Store in request attributes for Velocity template access
   - Purpose: Provide contact data to frontend

4. **Helper Service Integration**
   - Uses AccountService.getAccount() → DVS query
   - Uses AccountService.getDepartment() → DVS query
   - Uses ProximityService.findNearestDealer() → ZIP-based search
   - Uses AccountService.getCategories() → Account type checking

**Business Rules Extracted:**
- ZIP-based dealer selection (when enabled)
- AUTO category gets department phone defaults
- Account fallback hierarchy (nearest → contact → parent)

**External Dependencies:**
- DVS (document store) - Account and Department documents
- Proximity Service - Geographic dealer search
- Account Service - Account data and categorization
```

**This is intelligent analysis, not pattern matching!**

---

## Output: Comprehensive Extraction

### Documentation Files Generated

**For V9 Velocity Widget:**

```
docs/reverse-engineering/
├── widget-overview.md                  # Widget purpose, user stories
├── component-dependency-tree.md        # Full nesting structure
├── helper-object-usage.md              # All $helper.* calls documented
├── business-rules.md                   # All #if conditionals explained
├── portlet-configuration.md            # All preferences and defaults
├── java-backend-logic.md               # Portlet class business logic
├── component-catalog.md                # All components used
│   ├── Main component (vcard)
│   ├── Icon component
│   ├── Button component
│   ├── Photo component
│   └── [7 total components]
├── data-flow.md                        # Data sources and transformations
└── migration-complexity-assessment.md  # Complexity metrics, LOC, nesting depth
```

### Business Logic Extraction Focus

**What to capture:**

1. **User-Facing Functionality**
   - What does the widget DO from user perspective?
   - What problem does it solve?
   - What are the user interactions?

2. **Business Rules (from Velocity conditionals)**
   ```velocity
   #if($cat.contains('AUTO'))
     # Show SALES, SERVICE, PARTS phone numbers
   #else
     # Show generic contact
   #end
   ```
   → Business Rule: "Auto dealers get department-specific phones by default"

3. **Data Transformations**
   ```velocity
   $helper.getClosestChildAccountFromZip($postalcode, $accountId)
   ```
   → Business Rule: "Find nearest dealer location by ZIP code"

4. **Feature Flags**
   ```velocity
   #if($ff.isEnabled('SHOW_DIRECTIONS_BUTTON'))
   ```
   → Business Rule: "Directions button is feature-flagged"

5. **Helper Object Logic**
   - What business logic is in $helper methods?
   - What DVS queries are made?
   - What calculations/transformations?

6. **Preference-Driven Behavior**
   - How do preferences change widget behavior?
   - What are the defaults?
   - What are the validation rules?

---

## Complexity Metrics

**Track these metrics:**

```json
{
  "widget": "v9.widgets.contact.info.v1",
  "analysis_metrics": {
    "total_files_analyzed": 15,
    "velocity_templates": 8,
    "java_classes": 2,
    "lines_of_code": 1740,
    "component_nesting_depth": 5,
    "components_included": 7,
    "conditional_branches": 47,
    "helper_calls": 23,
    "feature_flags": 8,
    "preferences": 52,
    "data_sources": ["DVS", "AccountService", "PhoneService"],
    "complexity_score": "VERY_HIGH"
  }
}
```

---

## Integration with StackShift

**This agent is invoked through the Widget Migration pipeline:**

```
User in ~/git/cms-web/htdocs/v9/widgets/{category}/{name}/{version}/
  |
  v
/stackshift.widget-migrate (or cruise control with widget-migrate framework)
  |
  v
Step 0: detect-widget-type.md -> v9-velocity (or v9-viewmodel)
  |
  v
Step 1: Delegates to cms-web-widget-analyzer agent
  |
  v
Agent performs deep analysis (Phases 1-7):
  Phase 1: Widget Discovery & Classification
  Phase 2: Widget Configuration Extraction
  Phase 3: Component Dependency Tree Analysis
  Phase 4: Helper Object Analysis
  Phase 5: Conditional Logic Extraction
  Phase 6: Portlet Configuration Analysis
  Phase 7: Java Backend Analysis
  |
  v
Agent outputs feed subsequent widget-migrate steps:
  portlet-configuration.md    -> Step 2: generate-preference-catalog.md
  component-catalog.md        -> Step 3: generate-iris-mapping.md
  component-dependency-tree.md -> Step 3: generate-iris-mapping.md
  business-rules.md           -> Step 4: portable spec generation
  helper-object-usage.md      -> Step 4: portable spec generation
  java-backend-logic.md       -> Step 4: portable spec generation
  data-flow.md                -> Step 4: portable spec generation
  widget-overview.md          -> Step 6: migration report
  |
  v
Steps 2-6: Widget-migrate generates preference catalog, Iris mapping,
           portable specs, targeted React Router 7 + Iris epics, and report
```

**Output-to-step mapping:**

| Agent Output | Widget-Migrate Step | Purpose |
|---|---|---|
| `portlet-configuration.md` | Step 2: Preference Catalog | Source of truth for all preferences |
| `component-catalog.md` | Step 3: Iris Mapping | Legacy components to map |
| `component-dependency-tree.md` | Step 3: Iris Mapping | Nesting structure to flatten |
| `business-rules.md` | Step 4: Portable Specs | Business rules (BR-*) |
| `helper-object-usage.md` | Step 4: Portable Specs | Data access patterns |
| `java-backend-logic.md` | Step 4: Portable Specs | Backend business logic |
| `data-flow.md` | Step 4: Portable Specs | Data contracts (DC-*) |
| `widget-overview.md` | Step 6: Migration Report | Widget summary and user stories |
| `migration-complexity-assessment.md` | Step 6: Migration Report | Complexity metrics |

---

## Agent Capabilities

**Tools this agent uses:**
- **Read** - Parse Velocity templates, Java classes, XML
- **Bash** - Navigate directory structure, trace dependencies
- **Grep** - Find component includes, helper calls, conditionals
- **Task** (sub-agents) - Delegate Java analysis if complex

**Specialized Knowledge:**
- Velocity template language syntax
- Component assembler pattern
- Helper object APIs ($helper, $npvresourcetool, etc.)
- Portlet XML structure
- DVS integration patterns
- Feature flag conventions
- Preference cascade system

---

## Example Analysis Output

**Widget:** v9.widgets.contact.info.v1

**Business Logic Summary:**

**Purpose:** Display dealer contact information with account selection logic

**User Stories:**
1. As a customer, I want to see dealer contact info so I can reach them
2. As a customer near multiple locations, I want the nearest dealer by ZIP
3. As an auto dealer customer, I want department-specific phone numbers

**Business Rules:**
1. **ZIP-based Account Selection:** If `useClosestAccountToZip` enabled, find nearest dealer to user's ZIP code
2. **Auto Dealer Defaults:** AUTO dealers get SALES/SERVICE/PARTS phones by default
3. **Account Fallback:** If no contactAccountId, use $contact.Id or $accountId
4. **vCard Hiding:** Preference `hideVcard=true` skips entire card rendering
5. **Phone Number Links:** Controlled by $phoneNumbersAsLinks preference

**Data Sources:**
- DVS: Account data via $helper.getAccount()
- DVS: Department data via $helper.getDepartment()
- Service: ZIP proximity via $helper.getClosestChildAccountFromZip()
- Service: Account categories via $npvresourcetool.getAccountCategoryNames()

**Components Used:**
- vcard/default/v1 (main component, 503 lines)
  - ui/icon/v1 (address icon, phone icon)
  - ui/button/v1 (directions button)
  - photo/default/v1 (staff photo)
  - ui/state/v1 (badges)
  - [3 more UI components]

**Preferences (52 total):**
- hideVcard (boolean) - Show/hide entire card
- useClosestAccountToZip (boolean) - Enable ZIP proximity
- idPhone1, idPhone2, idPhone3 (string) - Department IDs for phones
- vCardOrder (comma-separated) - Display order of vCard sections
- [48 more preferences]

**Complexity Assessment:**
- Nesting Depth: 5 levels
- Total LOC: ~1,740 lines across 10 files
- Conditional Branches: 47
- Helper Calls: 23
- Feature Flags: 8
- Migration Complexity: VERY HIGH

**Migration Notes:**
- Component composition must be preserved (7 nested components)
- Helper logic must be replicated (23 method calls to understand)
- ZIP proximity algorithm is critical business logic
- Auto dealer defaults are industry-specific requirement
- All 52 preferences must be supported or consciously deprecated

---

## Success Criteria

Agent successfully analyzes V9 widget when:
- ✅ All #parse includes traced to leaves
- ✅ Every helper object call documented
- ✅ All conditional branches explained
- ✅ Portlet preferences cataloged
- ✅ Java backend logic extracted
- ✅ Business rules identified and documented
- ✅ Complete migration complexity assessment
- ✅ Tech-agnostic business logic documented

---

**This agent bridges the gap between legacy V9 architecture and modern spec-driven development!**
