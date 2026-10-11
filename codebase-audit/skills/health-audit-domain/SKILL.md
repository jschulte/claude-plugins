---
name: health-audit-domain
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed business logic and domain integrity audit that scores domain model correctness, state machine completeness, pricing/billing accuracy, permission enforcement, validation consistency, edge case handling, feature gating, workflow integrity, data consistency, temporal logic, and integration contracts; produces a scorecard with separate engineering and live-harm grades, a bar chart, domain concept map, state machine diagrams, permission matrix, business rule inventory, and only flags problems it can prove.
---

# Business Logic & Domain Integrity Audit Skill

Use this skill when the user wants a deep audit of whether the codebase faithfully and completely implements the business domain. The skill may audit the whole domain model or focus on a user-specified workflow, state machine, pricing path, entitlement system, permission model, or business rule cluster. This is NOT a code quality audit (`/health-audit` does that) or a UX audit (`/health-audit-ux` does that). This skill is about whether the business rules are correct, consistent, complete, and impossible to circumvent. This audit finds the bugs that cost money — pricing errors, permission gaps, billing edge cases, state machine impossibilities, and logic that silently does the wrong thing.

## Mission

Perform a rigorous, evidence-backed business logic and domain integrity audit: domain model accuracy, state machine correctness, pricing and billing logic, permission enforcement, validation consistency across entry points, edge case handling, feature gating and entitlements, workflow completeness, data consistency, temporal logic, and external integration contracts.

Think like a product manager who just discovered a billing bug. Think like a QA engineer hunting edge cases. Think like a financial auditor checking calculations. Think like a lawyer asking "what happens if...?"

Do not flag code quality issues unless they directly threaten business rule correctness. Do not report vague "best practices" violations. Do not nitpick naming or style. Every finding must answer: "What business rule is wrong, missing, or inconsistent, and what real-world harm does it cause?"

### Focus Prompt Support

This skill can take an optional prompt that describes the business/domain area to focus on.

Examples:
- "Focus on subscription lifecycle logic"
- "Review billing, credits, and refunds"
- "Audit RBAC and entitlements"
- "Look at order state transitions"
- "Review invoicing rules for enterprise accounts"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete entities, state machines, calculations, permission checks, workflows, and tests
- Audit out-of-scope logic only when it is required to explain an in-scope contradiction or shared rule
- Keep findings, scores, and recommendations scoped to that area instead of implying a full-domain correctness grade
- State assumptions, included workflows, excluded workflows, and unresolved domain questions explicitly in the output

If the prompt is ambiguous, infer the most likely scope from entity names, route names, service names, tests, and docs, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists
2. **The specific code or logic** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world business harm** — who loses money, gets unauthorized access, encounters impossible states, or receives incorrect results
4. **At least one corroborating signal** — a second instance, a contradictory implementation elsewhere, a missing guard, or a test that reveals the gap. A one-off defect qualifies once you have reproduced or traced it

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### The Domain Humility Rule (NON-NEGOTIABLE)

This is the hardest audit to do without domain expertise. You are reading code and inferring business rules — you may not fully understand the domain. Therefore:

- **Be transparent** about what you are inferring versus what you can prove from code, tests, documentation, or naming
- **Use the Question confidence tier generously** — many findings will need domain expert confirmation
- **State what you understood and what you could not determine** about the domain
- **Do not assume a business rule is wrong** just because it seems unusual — it may reflect domain knowledge you lack
- **Do assume a business rule is suspicious** when two parts of the code contradict each other about the same concept

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. The code provably implements a business rule incorrectly, inconsistently, or incompletely. A domain expert reviewing your evidence would say "yes, that's a real problem." |
| **Probable** | Strong signals but missing one criterion. For example: a pricing calculation looks wrong but you lack domain context to confirm the correct formula, or a permission gap exists but the endpoint may be intentionally public. |
| **Observation** | A pattern that warrants attention but lacks sufficient evidence to call a problem. Worth flagging for domain expert review. |
| **Question** | Something that looks off but requires business context to evaluate. You cannot determine correctness from the code alone. Frame these as specific questions for the domain expert. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones. In this audit especially, a false positive wastes more trust than a missed finding.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Active financial loss, security breach, or data corruption | Pricing calculations that overcharge or undercharge, permission bypasses that expose sensitive data, state transitions that lose or corrupt business data, billing logic that silently fails |
| 🟠 **High** | Significant business risk or logic gap that will eventually cause harm | Inconsistent business rule enforcement across entry points, state machine gaps that allow impossible states, missing validation on financial operations, feature gating that can be bypassed |
| 🟡 **Medium** | Meaningful logic issue with contained blast radius | Edge cases in non-critical calculations, timezone handling that affects non-financial operations, workflow gaps in secondary flows, denormalized data that can drift |
| 🔵 **Low** | Improvement to business logic robustness | Missing but non-critical validation, minor inconsistencies in non-financial logic, enhancement opportunities for domain model clarity |

### Scoring Discipline

Do **not** force a whole-domain score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope

- Determine whether the user asked for a full domain audit or a focused audit
- Translate any focus prompt into concrete entities, workflows, calculations, state machines, permissions, and tests
- Identify adjacent rules or systems that materially affect the in-scope business logic
- State what is in scope and what is out of scope
- If the requested workflow spans UI/API/jobs/integrations, follow the full rule path instead of reviewing one layer in isolation

### Phase 1: Understand the System and Domain

Before judging business logic, you must understand what business this code serves:

- **Determine the business domain**: What does this product do? What industry? Who pays?
- **Identify domain entities**: Users, accounts, orders, subscriptions, invoices, products, permissions, etc.
- **Map entity relationships**: What owns what? What references what? What depends on what?
- **Identify entity lifecycles**: Which entities have states? What are the state transitions?
- **Find the money trail**: Where does pricing happen? Billing? Refunds? Credits? Usage tracking?
- **Find the access control model**: How are permissions structured? Roles? Policies? Row-level security?
- **Locate business rule enforcement points**: Where are rules checked — UI, API, service layer, database?
- **Read existing documentation**: READMEs, docs, comments, specs, ADRs, schema files, seed data
- **Read the test suite**: Tests often encode business rules more explicitly than the production code

### Phase 2: Scan for Evidence

Systematically examine each domain area:

- **Pricing and financial calculations**: Trace every path that computes money — prices, discounts, taxes, totals, refunds, prorations, usage charges
- **State transitions**: For each stateful entity, map every transition in code and check for impossible or missing paths
- **Permission checks**: Trace every protected operation and verify the check matches the intended access model
- **Validation logic**: Find every place a business rule is enforced and check for consistency across entry points
- **Edge cases**: Test boundary conditions in business logic — zero quantities, empty collections, maximum values, concurrent operations
- **Feature gating**: Trace entitlement checks and verify they enforce plan/tier limits correctly
- **Data consistency**: Find denormalized or derived data and check that updates propagate correctly
- **External integrations**: Verify that assumptions about external systems are validated and failures are handled at the business level

### Phase 3: Validate Before Accusing

For each potential finding, ask:

- **Is this actually wrong?** Or does it reflect domain knowledge I lack?
- **What proves it?** Can I show two contradictory implementations, a missing guard, or a provably incorrect calculation?
- **Does it matter?** What real-world harm would this cause? Is it on a critical business path?
- **Could there be a legitimate reason?** Is this an intentional business decision, a known trade-off, or a deprecated path?
- **Am I the right judge?** If I cannot determine correctness without domain expertise, this is a Question, not a Verified finding.
- **Is it enforced elsewhere?** A missing validation in one layer may be compensated by another — check before flagging.

### Phase 4: Synthesize

- Group findings into systemic themes (e.g., "validation is inconsistent across all entry points" vs. individual instances)
- Identify root causes versus symptoms
- Cross-reference findings: a permission gap + a missing validation + scattered business logic may share a root cause
- Separate "provably wrong" from "probably wrong" from "needs domain expert"
- Build the domain concept map, state machine diagrams, permission matrix, and business rule inventory
- Identify which business rules are the highest-risk and least-protected
- Keep conclusions scoped to the reviewed workflow or rule set unless the evidence truly supports a wider domain claim

---

## Analysis Categories

Analyze the codebase through each category independently. A single code problem may appear under multiple categories if it has cross-cutting impact — that's expected and useful. Cross-reference when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. Domain Model Integrity

Do the domain objects accurately represent the business? Is the model complete and self-consistent?

- **Entity completeness**: Are all necessary business concepts represented as explicit entities or value objects? Are there business concepts that exist only as raw primitives (strings, numbers) when they deserve a proper type?
- **Relationship accuracy**: Do the relationships between entities match the business reality? Are cardinalities correct (one-to-many vs. many-to-many)? Are ownership and containment relationships properly modeled?
- **Impossible states**: Does the model allow states that make no business sense? Can an order have no line items? Can a subscription exist without a plan? Can a user have conflicting roles?
- **Invariant enforcement**: Are domain invariants (rules that must always be true) enforced at the model level? Or can external code put entities into invalid states by manipulating fields directly?
- **Ubiquitous language**: Is there a consistent vocabulary for domain concepts? Or does the same business concept have different names in different parts of the code (e.g., "customer" in the UI, "user" in the API, "account" in the database)?
- **Anemic domain model**: Are entities just data bags with no behavior, while business rules live scattered across services, utilities, and controllers? This increases the risk of inconsistent rule application.
- **Missing value objects**: Are concepts like Money, EmailAddress, PhoneNumber, DateRange, or Percentage modeled as primitives instead of value objects with validation and behavior?
- **Schema versus code drift**: Does the database schema match the code's model of the domain? Are there columns, tables, or constraints that the code ignores, or code assumptions that the schema does not enforce?

**Evidence bar**: Show the entity definition, the business concept it represents, and the specific gap. For impossible states, show how the model permits the invalid state (e.g., no constraint preventing an empty order). For naming inconsistencies, show the same concept under different names with file locations. For missing invariants, show the field that can be set to an invalid value and the code path that allows it.

---

### 2. State Machine & Lifecycle Correctness

For entities with lifecycles — orders, subscriptions, users, tickets, payments, approvals — are the transitions correct and complete?

- **Transition completeness**: Are all valid state transitions explicitly defined? Can you reach every valid state from the initial state? Are there states with no entry path or no exit path?
- **Invalid transition prevention**: Are invalid transitions actively blocked? Or can code set any state at any time without validation? What happens if someone tries an invalid transition — error, silent no-op, or corruption?
- **Transition atomicity**: Are state transitions atomic? If a transition involves multiple updates (change status + update timestamp + send notification), can a failure leave the entity in an inconsistent state?
- **Orphaned states**: Are there states that entities can enter but never leave? Dead-end states with no transition out and no cleanup process?
- **Concurrent transitions**: What happens if two transitions are attempted simultaneously? Are there race conditions in state changes?
- **Side effects on transition**: Are the correct side effects triggered on each transition (notifications, billing events, audit logs)? Are any side effects missing or firing on the wrong transition?
- **State-dependent behavior**: Does code that depends on entity state handle all possible states? Are there switch statements or conditionals that miss states or have incorrect default cases?
- **Lifecycle event ordering**: Are events that should happen in a specific order actually enforced? Can out-of-order transitions occur?

**Evidence bar**: Map the state machine as implemented in code — show every state and every transition with file locations. Identify gaps: states with no exit, transitions with no guard, missing side effects. For race conditions, show the non-atomic code path. Compare what the code allows against what the business domain requires.

---

### 3. Pricing, Billing & Financial Logic

This is where bugs cost real money. Every cent matters.

- **Pricing calculation correctness**: Are prices calculated correctly? Are the formulas right? Do unit prices, quantities, discounts, and taxes combine correctly? Trace the full calculation from input to final amount.
- **Discount and coupon logic**: Are discount calculations correct? Can discounts stack when they shouldn't? Can a percentage discount exceed the item price? Are expiration dates checked? Can a coupon be applied multiple times?
- **Tax handling**: Is tax calculated correctly? Is it applied to the right base (pre-discount or post-discount)? Are tax-exempt cases handled? Are different tax rates for different jurisdictions correct?
- **Rounding behavior**: How are monetary values rounded? Is rounding consistent (always up, always down, banker's rounding)? Do rounding errors accumulate across line items? Does the sum of rounded line items match the rounded total?
- **Proration logic**: For upgrades, downgrades, mid-cycle changes — is proration calculated correctly? Are partial periods handled? Does the math work for edge cases like same-day changes or changes on billing boundaries?
- **Refund calculations**: Are refunds calculated correctly? Is the refund amount validated against the original charge? Can a refund exceed the original payment? Are partial refunds tracked correctly?
- **Currency handling**: If the system handles multiple currencies, are conversions correct? Are amounts stored with appropriate precision? Is the currency code stored alongside amounts? Are there floating-point arithmetic issues?
- **Free tier and plan boundaries**: Are free-tier limits enforced correctly? What happens at the exact boundary? Is usage tracked accurately? Can the boundary be circumvented?

**Evidence bar**: Trace the complete calculation path from inputs to final amount, showing every operation. For rounding issues, show the specific rounding call and demonstrate where cents can be lost or gained. For discount stacking, show the code path that allows or prevents multiple discounts. For proration, calculate a specific example using the code's logic and show whether the result is correct.

---

### 4. Permissions & Access Control Logic

Who can do what? The answer in the code must match the answer in the business requirements.

- **Role/permission model completeness**: Are all necessary roles defined? Are all necessary permissions granular enough? Are there operations that lack any permission check?
- **Privilege escalation paths**: Can a lower-privileged user gain higher privileges? Can a regular user access admin endpoints? Can users modify their own role/permission assignments?
- **Resource ownership verification**: When a user accesses a resource, is ownership verified? Can user A access user B's data by manipulating IDs or parameters?
- **Sharing and invitation logic**: If resources can be shared, is the sharing permission model correct? Can shared access be revoked? Are invitation tokens single-use and expirable?
- **Permission inheritance**: If permissions are hierarchical (org → team → project → resource), is inheritance implemented correctly? Can a lower-level permission override a higher-level restriction?
- **Admin override boundaries**: What can admins do? Are there operations even admins should not perform without additional authorization? Are admin actions audited?
- **Multi-tenancy data isolation**: In multi-tenant systems, is data isolation enforced at every query? Can tenant A see tenant B's data? Are there global queries that leak across tenants?
- **API versus UI permission divergence**: Are the same permissions enforced at the API level as at the UI level? Can a user bypass UI restrictions by calling the API directly?

**Evidence bar**: Build a permission matrix from the code: for each role, what operations are permitted and where are they checked. Show any endpoint or operation that lacks a permission check. For ownership verification, show the query or check and demonstrate whether user ID is validated. For multi-tenancy, show the query and whether tenant scoping is applied.

---

### 5. Validation & Business Rule Enforcement

Where are business rules enforced? Are they enforced consistently across all entry points?

- **Enforcement layer analysis**: For each critical business rule, where is it enforced — UI only, API middleware, service layer, database constraints, or some combination? Rules enforced only in the UI can be bypassed via API.
- **Cross-entry-point consistency**: Are the same validation rules applied when data enters via the web UI, API, webhook, background job, admin panel, or data import? Are there entry points that skip validation?
- **Duplicate rule divergence**: When the same business rule is implemented in multiple places, have the implementations drifted? Show side-by-side comparisons.
- **Constraint completeness**: Are all business constraints represented somewhere in the system? Are there rules that exist only in documentation or team knowledge but not in code?
- **Validation error quality**: When validation fails, does the user get a meaningful, specific error? Or a generic "invalid input" with no guidance?
- **Negative validation**: Are "must not" rules enforced as carefully as "must" rules? (e.g., "orders cannot be modified after shipping" — is this actually prevented?)
- **Validation bypass paths**: Are there admin tools, internal APIs, migration scripts, or seeding operations that bypass business validation? If so, are those bypasses intentional and documented?
- **Database-level enforcement**: Are critical constraints (uniqueness, foreign keys, check constraints, not-null) enforced at the database level as a safety net? Or does the system rely entirely on application-level validation?

**Evidence bar**: For each critical business rule, show where it is enforced and where it is missing. Show the entry points that skip validation. For divergent rules, show the two implementations side by side with the differing logic highlighted. For bypass paths, show the code path that skips validation and whether it is intentional.

---

### 6. Edge Cases & Boundary Conditions

The bugs that slip through normal testing. The corner cases that real users inevitably hit.

- **Zero and null handling**: What happens when quantities are zero? When optional fields are null? When collections are empty? Does the business logic handle these correctly or throw unexpected errors?
- **Off-by-one in date/time logic**: Are date range comparisons correct (inclusive vs. exclusive endpoints)? Does "expires on March 17" mean the user has access all day on March 17, or does it expire at midnight?
- **Timezone handling**: Are dates and times stored, compared, and displayed in the correct timezone? Are there comparisons between timezone-aware and timezone-naive values? Do business operations that span timezones work correctly?
- **Daylight Saving Time and leap year**: Are there date calculations that break during DST transitions (23-hour or 25-hour days)? Does February 29 logic work? Do "add one month" operations handle month-length differences?
- **Unicode and special characters**: Do business-critical fields (names, addresses, product titles, search queries) handle Unicode correctly? Are there length validations that count bytes instead of characters? Do special characters break formatting, search, or comparison operations?
- **Maximum and minimum values**: Are business limits enforced correctly? What happens at the exact boundary (e.g., exactly 100 items when the limit is 100)? Are integer overflow, maximum string length, and maximum collection size handled?
- **Concurrent modification**: What happens when two users modify the same entity simultaneously? Is there optimistic locking, last-write-wins, or nothing? What is the business impact of the chosen strategy?
- **Floating-point arithmetic**: Are financial calculations performed with floating-point numbers instead of decimal/integer types? Show where precision loss can occur and the monetary impact.

**Evidence bar**: Show the specific code path, the edge case input, and the resulting behavior. For date/time issues, show the comparison or calculation and explain why it is wrong. For concurrency, show the read-modify-write cycle and the absence of locking. For floating-point, show the arithmetic operation and the precision risk.

---

### 7. Feature Gating & Entitlements

Does the code correctly enforce what each user or plan is entitled to?

- **Feature flag logic correctness**: Are feature flags checked correctly? Are there flags that are checked inconsistently (enabled in one place, not checked in another)? Are flag names consistent?
- **Plan/tier entitlement enforcement**: Are plan limits enforced at the right level? Can a user on a free plan access premium features by knowing the right URL or API endpoint?
- **Trial and expiration logic**: Are trial periods calculated correctly? What happens at the exact moment of expiration? Is there a grace period? Is the transition from trial to paid/expired handled atomically?
- **Upgrade and downgrade paths**: When a user upgrades, do they get immediate access to new features? When they downgrade, is access to premium features revoked? Is data created with premium features handled correctly after downgrade?
- **Grandfathering logic**: If plan features change, are existing users on old plans handled correctly? Is there code that properly distinguishes grandfathered entitlements from current plan features?
- **Post-cancellation access**: After a subscription is cancelled, what does the user retain access to? Is it immediate cutoff, end-of-period access, or data-export-only? Is this correctly implemented?
- **Usage limit enforcement**: For usage-based features, are limits checked before the operation, after, or not at all? Can a user exceed their limit with concurrent requests? Are overages handled correctly?
- **Entitlement caching**: If entitlements are cached, can stale cache entries grant access to features the user should no longer have? Is cache invalidation correct on plan changes?

**Evidence bar**: Trace the entitlement check from the user action to the permission decision. Show where the check happens, what data it uses, and whether it can be bypassed. For upgrade/downgrade, trace the state changes and verify all entitlement-dependent code paths are updated. For caching, show the cache TTL and the invalidation logic (or lack thereof).

---

### 8. Workflow & Process Integrity

Multi-step business processes — onboarding, checkout, approval chains, fulfillment — must be complete and robust.

- **Process completeness**: Are all steps of multi-step workflows present and in the correct order? Can steps be skipped? Are there missing steps that the business process requires?
- **Stuck-state prevention**: Can a user get stuck mid-workflow with no way to proceed or go back? Are there timeout or cleanup mechanisms for abandoned workflows?
- **Partial completion handling**: If a multi-step process fails mid-way, what state is the system in? Is there rollback logic? Are partially completed workflows visible and resumable?
- **Timeout and expiration**: Do pending actions expire? Are there processes that wait indefinitely for human input? Are expiration times appropriate for the business context?
- **Notification triggers**: Are notifications (email, SMS, in-app) triggered at the correct points in the workflow? Are there missing notifications for important state changes? Are there duplicate or premature notifications?
- **Approval workflows**: If the system has approval processes, are they enforced? Can they be bypassed? Are approvers correctly identified? Can an approver approve their own request?
- **Idempotency of workflow steps**: Can workflow steps be safely retried? If a step is executed twice (due to retry, network issue, or user double-click), does the business outcome remain correct?
- **Order-dependent operations**: Are there operations that must happen in sequence but are not enforced to do so? Can asynchronous processing cause out-of-order execution?

**Evidence bar**: Trace the complete workflow from initiation to completion, showing every step and decision point. Show where the user can get stuck, where partial completion leaves data inconsistent, and where steps can be skipped or repeated. For approval bypasses, show the missing check. For idempotency, show the non-idempotent operation and the retry path.

---

### 9. Data Consistency & Integrity

Is derived, denormalized, and aggregated data kept correct?

- **Derived value synchronization**: Are computed values (totals, counts, averages, statuses) recalculated or updated when their source data changes? Can source data change without the derived value updating?
- **Denormalized copy consistency**: When data is denormalized for performance (e.g., storing a user's name on every order), are the copies updated when the source changes? Or do they become stale?
- **Race conditions in business updates**: Are there read-modify-write patterns on business-critical data without proper concurrency control? Can two simultaneous operations produce an incorrect result?
- **Counter and aggregate accuracy**: Are counters (view counts, usage counts, inventory levels) updated atomically? Can concurrent increments/decrements produce incorrect totals?
- **Foreign key and referential integrity**: Are relationships between entities enforced? Can you delete a parent entity and orphan its children? Are cascade deletes correct for the business domain?
- **Soft delete consistency**: If the system uses soft deletes, is soft-deleted data excluded from all business queries? Can soft-deleted entities still participate in business operations?
- **Eventual consistency handling**: If the system uses eventual consistency (message queues, event sourcing, CQRS), are there business operations that require strong consistency but don't get it?
- **Data migration integrity**: Are there incomplete data migrations that leave the database in a mixed state? Do old records conform to current business rules?

**Evidence bar**: Show the source data, the derived or denormalized value, and the code path (or lack thereof) that keeps them in sync. For race conditions, show the non-atomic operation and the concurrent access path. For referential integrity, show the missing constraint and the deletion code that can orphan records.

---

### 10. Temporal & Scheduling Logic

Date and time are among the most error-prone areas in business logic.

- **Date/time comparison correctness**: Are comparisons between dates correct? Are boundary conditions handled (is "before end of day" actually before 23:59:59 or before 00:00:00 of the next day)? Are there comparisons between dates with different precisions (date vs. datetime)?
- **Timezone-aware operations**: Are business operations that depend on the user's timezone handled correctly? Are there hardcoded timezone assumptions (e.g., assuming UTC or a specific timezone)?
- **Scheduling edge cases**: For recurring events or scheduled operations, are edge cases handled? What happens when a monthly event is scheduled for the 31st? Are DST transitions handled in scheduling?
- **Recurring event generation**: Is recurrence logic correct? Do "every two weeks" and "every month" handle edge cases? Are there off-by-one errors in recurrence calculations?
- **Deadline and expiration calculation**: Are deadlines calculated correctly? Are business days versus calendar days distinguished? Are weekends and holidays considered when relevant?
- **Business hours and calendar logic**: If the system has business-hours logic, is it correct? Are holidays handled? Are different timezones for different locations supported?
- **Time-window operations**: For time-based access (early bird pricing, flash sales, maintenance windows), are the start and end times checked correctly? Are timezone conversions applied before comparison?
- **Clock skew and ordering**: Are there operations that depend on timestamp ordering across different services or servers? Can clock skew cause incorrect business logic?

**Evidence bar**: Show the date/time operation, the inputs, and the result. For timezone issues, show where timezone information is lost or incorrectly applied. For scheduling, show the recurrence logic and a specific edge case where it fails. For business hours, show the calculation and the timezone handling.

---

### 11. Integration & External System Contracts

Are assumptions about external systems validated, and are failures handled at the business level?

- **External API assumption validation**: Are assumptions about external API responses (field presence, value ranges, formats) validated? What happens when an external API returns unexpected data?
- **Webhook handler idempotency**: Are webhook handlers idempotent? If the same webhook is delivered twice (which external systems often do), does the business operation execute correctly once, or twice?
- **External failure business handling**: When an external system fails, is the failure handled at the business level (not just technically)? If a payment processor is down, is the order left in a correct state? Is the user informed appropriately?
- **Retry semantics correctness**: Are retries appropriate for the business operation? Is a charge retried when it should not be? Is an idempotency key used for financial operations?
- **External data transformation fidelity**: When data is received from or sent to external systems, are the transformations correct? Are there precision losses, truncations, or format mismatches?
- **External system version assumptions**: Does the code assume a specific version of an external API? Are there deprecated endpoints or features in use?
- **Callback and async completion handling**: For asynchronous external operations (payment processing, background checks, file processing), is the completion callback handled correctly? What happens if the callback never arrives?
- **Rate limiting and quota handling**: Are external API rate limits respected? What happens when quotas are exceeded? Is the business impact handled (e.g., queuing versus dropping)?

**Evidence bar**: Show the integration code, the assumptions it makes about the external system, and what happens when those assumptions fail. For idempotency, show the webhook handler and demonstrate whether duplicate delivery causes duplicate business effects. For retries, show the retry logic and explain whether the business operation is safe to retry.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much are users, money, or obligations being hurt right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a well-modelled domain with four live rule violations. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Business rules are correct, consistent, complete, and well-protected |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Mostly sound business logic with minor gaps in edge cases or secondary paths |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Core logic works but significant gaps in consistency, edge cases, or enforcement |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Business rules are frequently inconsistent, incomplete, or bypassable |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Business logic is provably wrong, produces incorrect financial results, or lacks fundamental protections |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is user-facing (wrong money, bypassable permissions, or invalid states users can reach) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
2. Divide by **units** = in-scope source lines (tests excluded) / 50,000, minimum 1.
3. Map the result:

| Critical/High per unit | Score | Grade |
|---|---|---|
| 0 | 9.5 | A |
| up to 1 | 8.0 | B |
| up to 2.5 | 6.5 | C |
| up to 5 | 5.0 | D |
| over 5 | 3.0 | F |

State the count, the units and the result: `(1 Critical × 3 + 5 High) / 1.6 units = 5.0 per unit → D`. The count is a lower bound set by audit depth; say how deep the audit went.

### Calibration check before finalizing

- If the Strengths section names a reference-quality mechanism, its category cannot score below 7.0 unless a Critical pattern is charged to it; say which.
- A category below 6.0 needs at least one Verified High or Critical pattern charged to it.
- Medium and Low volume never moves a letter by itself. Their count grows with audit effort, not with how bad the work is.
- Read the two grades back against the anchors table. If a staff engineer who knows the area would say "that is not what it is like", fix the scores, not the anchors.

### Weights

| Category | Weight |
|----------|--------|
| Domain Model Integrity | 8% |
| State Machine & Lifecycle Correctness | 14% |
| Pricing, Billing & Financial Logic | 16% |
| Permissions & Access Control Logic | 14% |
| Validation & Business Rule Enforcement | 10% |
| Edge Cases & Boundary Conditions | 8% |
| Feature Gating & Entitlements | 7% |
| Workflow & Process Integrity | 6% |
| Data Consistency & Integrity | 7% |
| Temporal & Scheduling Logic | 5% |
| Integration & External System Contracts | 5% |

Weights sum to 100%. Pricing/Financial Logic, Permissions, and State Machine Correctness carry the most weight because bugs in these areas cost real money or create real liability.

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
Domain Model Integrity         7.8 | ████████████████░░░░
State Machine Correctness      6.9 | ██████████████░░░░░░
```

Use `█` for filled and `░` for empty. End the chart with two rows: `Engineering (weighted)`, then `Live harm`.

---

## Finding Template

Each finding must follow this structure:

```markdown
#### [SEVERITY EMOJI] [Finding Title]

**Category**: [Root-cause category, the one this finding is charged to]
**Severity**: [Critical / High / Medium / Low]
**Confidence**: [Verified / Probable / Observation / Question]
**Harm**: [User-facing: live | reachable today | not yet reachable] or [Engineering drag]
**Pattern**: [Name of the root-cause pattern this instance belongs to, if any]
**Location**: [File paths and line numbers]

**Evidence**:
[Code snippets, side-by-side comparisons, calculation traces, state machine gaps,
or permission matrix holes that PROVE this is a real issue. This is the most
important section. Show the business rule as implemented and explain why it is
wrong, inconsistent, or incomplete.]

**Business Impact**:
[What goes wrong in the real world. Be specific — "customers are overcharged by
$X when...", "users with role Y can access Z when they shouldn't...", "orders
can reach state A which has no exit, causing..."]

**Recommendation**:
[Concrete, actionable fix. Not "consider improving" — instead, "add a guard in
`OrderService.transition()` at `src/services/order.ts:142` that prevents
transition from 'shipped' to 'pending', and add a database constraint on the
`status` column to enforce valid values."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# Business Logic & Domain Integrity Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a product owner, CTO, or
engineering lead. What is the business domain? What are the highest-risk
findings? What business operations are most at risk? What should leadership
understand about the integrity of the business logic?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually reviewed, which
entities/workflows/calculations/permissions were inspected deeply vs broadly,
what was explicitly out of scope, and what could not be determined without
domain input.]

## 3. Domain Understanding Statement
[State explicitly: what you understood about the business domain, what you
inferred, what you could not determine, and what assumptions you made. This
transparency is essential — the reader needs to know the limits of your
domain knowledge.]

## 4. Domain Concept Map
[The key domain entities, their relationships, and lifecycle states as
understood from the code. Present as a structured list or diagram showing:
- Entity names and what they represent
- Relationships between entities (ownership, reference, containment)
- Key attributes and their business meaning
- Which entities have lifecycles/state machines]

## 5. State Machine Diagrams
[For each entity with a lifecycle, show:
- All states found in code
- All transitions found in code (with file locations)
- Missing transitions or orphaned states
- Side effects triggered on each transition
Use text-based diagrams.]

## 6. Permission Matrix
[Who can do what, as implemented (not as documented). Show:
- Roles/permission levels found in code
- Operations each role can perform
- Where each permission check occurs
- Gaps: operations with no permission check
- Conflicts: inconsistent checks for the same operation]

## 7. Business Rule Inventory
[For each identified business rule:
- What the rule is
- Where it is enforced (file paths for each enforcement point)
- Whether it is enforced consistently across all entry points
- Whether it is enforced at the database level as a safety net
Flag rules that are enforced inconsistently or only at the UI level.]

## 8. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality]

## 9. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 10. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 11. Financial Logic Deep Dive
[Dedicated section for pricing, billing, and financial calculation analysis.
Trace key calculations end-to-end. Show rounding behavior. Verify discount
and tax logic. This section exists even if no issues are found — document
what was verified.]

## 12. Access Control Deep Dive
[Dedicated section for permission and access control analysis. Present the
full permission matrix. Show any gaps or bypasses. Document multi-tenancy
isolation. This section exists even if no issues are found.]

## 13. Prioritized Action Plan
[Top 10 actions ordered by (business risk × effort efficiency). For each:
- What to do (one sentence)
- Why it matters to the business (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 14. Strengths & Bright Spots
[Mandatory. What the business logic does well. Solid invariant enforcement,
thorough validation, correct financial calculations, well-designed state
machines, comprehensive permission checks. Give credit where it is due.]

## 15. What Was Not Flagged
[Issues considered but rejected for insufficient evidence or domain knowledge.
Questions that need domain expert input. Transparency about what you chose
not to report and why.]

## 16. Questions for Domain Experts
[Specific questions that arose during the audit that require business context
to answer. Frame each question clearly with the code context that prompted it.
These are not findings — they are requests for information that could reveal
findings.]

## 17. Appendix: Evidence Notes
[Supporting data, file lists, calculation traces, state machine raw data,
permission check inventory]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of business logic health]
```

For focused audits, keep the scope visible near the top of the report and mark unrelated sections or categories as `N/A` rather than pretending they were evaluated.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report code quality issues that do not threaten business rule correctness
- ❌ Flag business rules as "wrong" when you lack the domain context to judge — use the Question tier instead
- ❌ Assume the business domain works like other domains you have seen — every business has unique rules
- ❌ Treat inconsistency as automatically wrong — sometimes different contexts legitimately require different rules
- ❌ Pad the report with edge cases that could never occur in practice
- ❌ Ignore the difference between "this rule is wrong" and "this rule is poorly coded but correct"
- ❌ Claim financial impact without tracing the actual calculation
- ❌ Report a permission gap without verifying the endpoint is actually reachable and unprotected
- ❌ Let a narrow focus prompt silently expand into a fake whole-domain audit
- ❌ Present UI-only findings — that is `/health-audit-ux` territory
- ❌ Present architecture or maintainability findings — that is `/health-audit` territory
- ❌ Score a category low without multiple proven findings to justify it
- ❌ Pretend you understand the domain better than you do

DO:
- ✅ Think like someone who loses money when the code is wrong
- ✅ Trace every financial calculation from input to output — show the math
- ✅ Build the permission matrix from code, not from documentation
- ✅ Map every state machine from actual transition code, not from comments or enums alone
- ✅ Check every entry point for a business rule — UI, API, webhook, background job, admin tool
- ✅ State the requested focus area, included workflows, excluded workflows, and unresolved domain questions plainly
- ✅ Show your work so the reader can verify every finding independently
- ✅ Use the Question tier generously and write clear questions for domain experts
- ✅ Distinguish between "provably wrong" and "suspicious but needs domain confirmation"
- ✅ Cross-reference findings across categories to identify systemic root causes
- ✅ Call out when business logic is well-implemented — silence implies you did not check
- ✅ State what was examined deeply versus broadly when the repository is large
- ✅ If evidence is insufficient, say so plainly and downgrade confidence
- ✅ Consider the product's stage — a prototype and a production billing system have different standards
- ✅ Quantify business impact where possible — "$X per occurrence", "Y% of users affected", "Z operations per day at risk"
