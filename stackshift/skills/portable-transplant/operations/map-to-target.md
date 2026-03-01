# Map to Target

Detailed instructions for mapping portable extract abstractions to a specific target project's personas, domain language, and data models.

---

## Overview

This operation reads the portable extract's abstract representations and the target project's BMAD docs, then creates three mapping tables:

1. **Persona Mapping** - [User]/[Admin]/[System] -> target personas
2. **Domain Language Translation** - source terms -> target terms
3. **Data Contract Mapping** - DC-* shapes -> target data models

These mappings are used by the generate-targeted-epics operation to produce the final output.

---

## Part 1: Persona Mapping

### Step 1: Extract Target Personas

Read the target PRD and extract all personas:

**From PRD "Target Users" or "Personas" section:**
- Name, role, description
- Goals and motivations
- Privilege level (regular user, admin, system)

**From Architecture "System Actors" or "Integration" section:**
- External services that interact with the system
- Automated processes (cron jobs, event handlers)
- API consumers

**Compile target persona inventory:**
```
Target Personas:
  Users: Homebuyer, Property Investor, Renter
  Admins: Property Manager, Listing Agent, Platform Admin
  System: MLS Data Feed, Mortgage Rate API, Email Service
```

### Step 2: Match Abstract to Target

For each abstract role, find the best target match:

**[User] Matching Rules:**
1. Read the portable extract's [User] definition (goals, needs, mapped source roles)
2. Compare with each target user persona
3. Match by FUNCTIONAL OVERLAP:
   - Does the target persona USE similar features?
   - Do they have similar goals? (evaluate pricing, search, submit)
   - Are they the PRIMARY consumer of the component being transplanted?
4. If multiple target personas match, consider:
   - Split: generate separate stories for each ("As a Homebuyer..." AND "As a Property Investor...")
   - Merge: use the most common target persona with a note

**[Admin] Matching Rules:**
1. Read the portable extract's [Admin] definition
2. Compare with target admin/manager personas
3. Match by PRIVILEGE OVERLAP:
   - Does the target persona CONFIGURE similar settings?
   - Do they MANAGE similar entities?
   - Do they have ELEVATED access compared to users?

**[System] Matching Rules:**
1. Read the portable extract's [System] definition (sub-categories)
2. Compare with target architecture's system actors
3. Match by FUNCTION:
   - Data providers -> target's external data sources
   - Event handlers -> target's event/webhook consumers
   - Scheduled tasks -> target's automated processes

### Step 3: Handle Mapping Challenges

**One-to-Many (abstract -> multiple target personas):**
```
[User] -> Homebuyer AND Property Investor

Resolution: Generate stories for BOTH target personas.
Some stories may be Homebuyer-only, others Property Investor-only,
some shared. Use the source story's context to determine which.

Example:
  Source: "As a [User], I want to calculate monthly payment"
  -> "As a Homebuyer, I want to calculate my mortgage payment"
  -> "As a Property Investor, I want to calculate rental yield vs mortgage cost"
  (Same BR-CALC-001 rule, different framing)
```

**Many-to-One (multiple abstract sub-roles -> one target persona):**
```
[User] had sub-roles: "Buyer-type" and "Browser-type"
Target has: "Homebuyer" (covers both)

Resolution: Merge into single target persona. Note the dual nature.
```

**No Match (abstract role has no target equivalent):**
```
[Admin] was "Finance Manager" but target has no finance admin

Resolution options:
1. Map to closest: "Platform Admin" with a note
2. Flag as gap: "Target project may need a Finance Admin persona"
3. Exclude: stories requiring this role are marked [NEEDS TARGET PERSONA]
```

### Step 4: Mode-Specific Behavior

**YOLO:** Auto-map by role description similarity. Mark low-confidence with `[AUTO-MAPPED]`.

**Guided:** Present mapping table for confirmation:
```
Persona Mapping:
  [User]   -> Homebuyer          [Confident - both are primary price evaluators]
  [Admin]  -> Property Manager   [Medium - source had finance focus, target is broader]
  [System] -> MLS Data Feed      [Confident - both sync external inventory]

Questions:
  1. [Admin] maps to "Property Manager" - or should it be "Listing Agent"?
  2. Source [System] had "Payment Gateway" - target equivalent? (Mortgage API?)
```

**Interactive:** Walk through each mapping individually with full context.

---

## Part 2: Domain Language Translation

### Step 1: Build Target Glossary

Extract domain terminology from target PRD and Architecture:

**From PRD:**
- Product name and description terms
- Feature names
- Entity names (what things are called)
- Action verbs (what users do)
- Business metrics (how success is measured)

**From Architecture:**
- Model names
- API resource names
- Domain concept names
- Technical entity names

**Example target glossary:**
```
Target Domain: Real Estate
  Entities: property, listing, unit, neighborhood, school district
  Actors: homebuyer, seller, agent, broker, inspector
  Actions: list, tour, offer, bid, close, appraise
  Metrics: days on market, price per sqft, closing rate
  Models: Property, Listing, Offer, Mortgage, Appraisal
```

### Step 2: Build Source Glossary

Extract domain terminology from portable extract's content:

**From epics.md:**
- Entity names used in stories
- Action verbs in acceptance criteria
- Feature domain words

**From component-spec.md:**
- Business rule descriptions
- Data contract field descriptions
- Interaction pattern descriptions

**Example source glossary:**
```
Source Domain: Car Dealership
  Entities: vehicle, car, truck, inventory, lot
  Actors: shopper, dealer, finance manager
  Actions: search, test drive, trade in, finance, purchase
  Metrics: days on lot, price point, conversion rate
  Models: Vehicle, Inventory, Lead, Payment, TradeIn
```

### Step 3: Create Translation Table

Match source terms to target terms by semantic role:

**Entity Mapping (what things are called):**
```
vehicle          -> property         (primary entity)
car/truck        -> house/condo      (entity subtypes)
inventory        -> listings         (available items collection)
lot              -> market/area      (location grouping)
VIN              -> MLS number       (unique identifier)
mileage          -> square footage   (key metric)
model year       -> year built       (age indicator)
```

**Actor Mapping (already done in persona mapping, but domain terms too):**
```
shopper          -> homebuyer        (primary consumer)
dealer           -> agent/broker     (intermediary)
finance manager  -> mortgage advisor (finance specialist)
```

**Action Mapping (what users do):**
```
search inventory -> browse listings  (discovery)
test drive       -> tour/showing     (evaluation)
trade in         -> (no equivalent)  (excluded)
finance          -> mortgage/loan    (payment method)
purchase         -> close/buy        (transaction)
```

**Metric Mapping:**
```
days on lot      -> days on market   (time to sell)
sticker price    -> listing price    (asking price)
invoice price    -> (no equivalent)  (dealer-specific)
```

### Step 4: Handle Untranslatable Terms

Some source terms have no target equivalent:

**Option A: Exclude**
Term doesn't apply to target domain. Remove from stories.
```
"trade-in value" -> excluded (real estate doesn't have trade-ins)
```

**Option B: Generalize**
Term applies but differently. Use a generic equivalent.
```
"VIN check" -> "verification check" (generalized)
```

**Option C: Flag for Review**
Term might apply but mapping is unclear. Mark in output.
```
"dealer holdback" -> [NEEDS DOMAIN MAPPING] (target may have equivalent)
```

### Step 5: Mode-Specific Behavior

**YOLO:** Auto-translate using semantic similarity. Mark uncertain with `[AUTO-TRANSLATED]`.

**Guided:** Present translation table with confidence scores:
```
Domain Language Translation:
  vehicle -> property           [High confidence]
  inventory -> listings         [High confidence]
  test drive -> property tour   [Medium - is "showing" better?]
  trade-in -> (excluded)        [High - no target equivalent]

Questions:
  1. "test drive" -> "property tour" or "showing"?
  2. "dealer holdback" - does target have an equivalent?
```

**Interactive:** Review each translation individually.

---

## Part 3: Data Contract Mapping

### Step 1: Extract Target Data Models

Read target Architecture for all data models, including:
- Model/entity names
- Field names and types
- Relationships between models
- API request/response shapes

### Step 2: Match Portable Contracts to Target Models

For each DC-IN, DC-OUT, DC-STATE in portable extract:

1. Read the contract's description and field purposes
2. Find the target model that serves the SAME PURPOSE
3. Map fields by semantic meaning (not by name):
   ```
   DC-IN-001 (loan_parameters):
     principal       -> Property.listing_price   (the price being financed)
     down_payment    -> Offer.down_payment       (buyer's upfront payment)
     annual_rate     -> MortgageRate.rate         (interest rate)
     term_months     -> MortgageTerms.duration    (loan duration)
   ```

### Step 3: Identify Gaps

**Fields in portable spec not in target model:**
```
Gap: DC-IN-001.trade_in_value has no target equivalent
  -> Exclude (not applicable to real estate)
  -> Or flag: target model may need this field
```

**Target model fields not in portable spec:**
```
Gap: Target's MortgageApplication.property_type not in source
  -> Note: target has additional input not covered by source business rules
  -> May need new BR-DEC rule for property-type-based rate adjustments
```

### Step 4: Generate Adapter Notes

For each mapping with structural differences:
```
Adapter: DC-IN-001 -> MortgageApplication
  Direct mappings: 3 fields (principal->price, down_payment->down_payment, term->duration)
  Renamed: 1 field (annual_rate -> interest_rate)
  Excluded: 1 field (trade_in_value - no target equivalent)
  Gap: 1 field (property_type - target-specific, needs new business rule)
```

### Step 5: Mode-Specific Behavior

**YOLO:** Auto-map by field description similarity. Note gaps.

**Guided:** Present mapping with gaps highlighted:
```
Data Contract Mapping:
  DC-IN-001 -> MortgageApplication
    principal -> listing_price       [Mapped]
    down_payment -> down_payment     [Direct]
    annual_rate -> interest_rate     [Renamed]
    trade_in_value -> (none)         [Excluded]
    (none) -> property_type          [Gap - target-specific]

  Questions:
    1. Should trade_in_value be excluded or generalized?
    2. property_type affects rates - add new BR-DEC rule?
```

**Interactive:** Map each field individually with full context.

---

## Output: Combined Mapping Object

After all three parts complete, produce a combined mapping that the epic generation step consumes:

```yaml
mapping:
  personas:
    "[User]": "Homebuyer"
    "[Admin]": "Property Manager"
    "[System]":
      - name: "MLS Data Feed"
        maps_from: "DealerSocket Inventory Sync"
      - name: "Mortgage API"
        maps_from: "Payment Gateway"

  domain_language:
    - source: "vehicle"
      target: "property"
      confidence: "high"
    - source: "inventory"
      target: "listings"
      confidence: "high"
    - source: "test drive"
      target: "property tour"
      confidence: "medium"
    - source: "trade-in"
      target: null
      action: "exclude"

  data_contracts:
    DC-IN-001:
      target_model: "MortgageApplication"
      field_mappings:
        principal: "listing_price"
        down_payment: "down_payment"
        annual_rate: "interest_rate"
      excluded_fields: ["trade_in_value"]
      gap_fields: ["property_type"]
    DC-OUT-001:
      target_model: "PaymentEstimate"
      field_mappings:
        monthly_payment: "monthly_payment"
        total_interest: "total_interest_paid"
```

This mapping object is passed to the generate-targeted-epics operation.
