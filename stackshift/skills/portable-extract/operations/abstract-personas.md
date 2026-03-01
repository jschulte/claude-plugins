# Abstract Personas

Detailed instructions for extracting source personas and mapping them to abstract portable roles.

---

## Overview

Transform source-specific personas (e.g., "Dealer Admin", "Car Shopper", "DealerSocket Sync Service") into abstract, reusable personas that work in any project context:

- **[User]** - Primary consumer of the component
- **[Admin]** - Configurer, manager, or power user
- **[System]** - Automated processes, APIs, scheduled jobs, external integrations

---

## Step 1: Extract Source Personas

Scan two primary documents for persona definitions:

### From business-context.md

Extract all entries under "Target Users & Personas" and "Stakeholder Map":
- Named personas with roles and descriptions
- Stakeholder categories
- User segments or customer types

### From functional-specification.md

Extract all entries from:
- User Stories: "As a [persona]..." - collect all unique persona names
- User Personas section (if present)
- System actors mentioned in requirements (e.g., "The system shall...", "The scheduler runs...")

### From integration-points.md

Extract all:
- External service actors (e.g., "Payment Gateway calls webhook...", "Inventory feed pushes updates...")
- System-to-system actors
- Scheduled/automated processes

**Compile a deduplicated list of all source personas with their source document and context.**

---

## Step 2: Classify into Abstract Roles

Apply the following classification rules in order:

### [User] Classification

A source persona maps to `[User]` if it:
- Is described as a customer, end user, visitor, shopper, buyer, or consumer
- Primarily USES the component's features (not configures them)
- Has goals centered on accomplishing a task (buying, viewing, submitting, searching)
- Does NOT have elevated privileges or configuration access

**Examples:**
- "Car Shopper" -> [User]
- "Customer" -> [User]
- "Website Visitor" -> [User]
- "Guest User" -> [User]
- "Logged-in User" -> [User]

### [Admin] Classification

A source persona maps to `[Admin]` if it:
- Has configuration, management, or oversight responsibilities
- Can change settings, approve items, manage other users
- Has elevated privileges compared to regular users
- Manages content, products, pricing, or workflows

**Examples:**
- "Dealer Admin" -> [Admin]
- "Finance Manager" -> [Admin]
- "Content Editor" -> [Admin]
- "Store Manager" -> [Admin]
- "Super User" -> [Admin]

### [System] Classification

A source persona maps to `[System]` if it:
- Is an automated process (cron job, scheduler, sync service)
- Is an external API or service integration
- Is a webhook receiver or event handler
- Has no human interaction (purely machine-to-machine)

**Examples:**
- "DealerSocket Inventory Sync" -> [System]
- "Payment Gateway Webhook" -> [System]
- "Nightly Price Updater" -> [System]
- "Credit Bureau API" -> [System]
- "Email Notification Service" -> [System]

---

## Step 3: Handle Ambiguity

### Multiple User Roles

When the source has multiple distinct user types (e.g., "Buyer" AND "Seller"):

1. **If they use the SAME features:** Merge into `[User]` with a note
2. **If they use DIFFERENT features:** Keep as `[User]` but document the distinction in the persona definition:
   ```
   ### [User]
   Primary consumer. In source context, this maps to two distinct roles:
   - **Buyer-type**: Searches, compares, purchases
   - **Seller-type**: Lists, manages inventory, fulfills
   Both are [User] because they are primary consumers, not administrators.
   ```

### Admin vs Power User

When the distinction between admin and power user is unclear:
- If they can change SETTINGS that affect other users -> `[Admin]`
- If they just have MORE features but same privilege level -> `[User]`
- If uncertain, classify as `[Admin]` (more restrictive is safer)

### Multiple System Actors

When there are many system actors:
- Group all automated/API actors under `[System]`
- Preserve the distinction in the persona definition with sub-categories:
  ```
  ### [System]
  Automated processes and integrations. Maps from:
  - **Data providers**: External inventory feeds, pricing APIs
  - **Event handlers**: Webhook receivers, queue consumers
  - **Scheduled tasks**: Nightly syncs, cache warmers
  ```

### Personas That Span Categories

Rare but possible: a persona that acts as both [User] and [Admin] depending on context.
- Classify based on PRIMARY role in the component being extracted
- Document the dual nature in persona definition
- In stories, use the role that applies to THAT story

---

## Step 4: Preserve Source Mapping

Always document the mapping for traceability:

```yaml
persona_mapping:
  "[User]":
    source_personas: ["Car Shopper", "Guest Visitor", "Registered Customer"]
    primary_goals: ["Find vehicles", "Compare options", "Submit leads"]
  "[Admin]":
    source_personas: ["Dealer Admin", "Finance Manager"]
    primary_goals: ["Configure pricing", "Manage inventory display", "Review leads"]
  "[System]":
    source_personas: ["DealerSocket Sync", "Payment Gateway", "Analytics Tracker"]
    primary_goals: ["Sync inventory data", "Process payments", "Track user behavior"]
```

This mapping goes into the YAML frontmatter of both output files.

---

## Step 5: Quality Check

After abstraction, verify:

1. **Completeness**: Every source persona is mapped to exactly one abstract role
2. **Story coherence**: Read through user stories with abstract personas - do they still make sense?
   - BAD: "As a [User], I want to configure pricing tiers" (this is [Admin] work)
   - GOOD: "As a [Admin], I want to configure pricing tiers"
3. **No leakage**: No source persona names appear in the final output (except in the mapping section)
4. **Balanced distribution**: If ALL personas map to [User] and none to [Admin] or [System], re-examine - there's almost always at least one admin/system actor
5. **System actors captured**: If integration-points.md mentions external services, there should be [System] actors

---

## Mode-Specific Behavior

### YOLO Mode
- Apply classification rules automatically
- Use best-effort for ambiguous cases
- Mark uncertain mappings with `[AUTO-MAPPED]`

### Guided Mode
- Auto-classify obvious mappings
- Present uncertain cases to user:
  ```
  Persona Mapping Review:

  Confident mappings:
    [User] <- Car Shopper, Guest Visitor
    [System] <- DealerSocket Sync, Payment Gateway

  Needs confirmation:
    "Finance Manager" - classified as [Admin]. Correct?
    "Power Dealer" - classified as [Admin], but could be [User]. Which?
  ```

### Interactive Mode
- Present each source persona individually
- Ask user to confirm or override classification
- Allow custom sub-categories within [User]/[Admin]/[System]
