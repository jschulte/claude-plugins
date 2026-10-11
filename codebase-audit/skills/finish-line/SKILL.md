---
name: finish-line
description: "Define and reach a product and architecture finish line from an empty, partial or established repository. Use user intent and existing evidence to assess or propose sound architecture, identify gaps and consolidation, and discuss a practical completion roadmap. Agree on the destination before solidifying specs or selected implementation plans; implement when authorized."
---

# Finish Line

Use the user's intended experience as the destination and the actual repository as the starting point. Assess or propose an architecture that makes the product correct, reliable, scalable and easier to understand and change. The intended benefits are lower maintenance burden, faster safe fixes/features, and fewer competing implementations. Reuse sound existing work; add capabilities in service of the agreed product outcome.

## Default deliverable and depth

**Default to a rigorous assessment and a proposed medium-level product and architecture roadmap for discussion.** Begin with the whole system's structure after establishing its purpose. Explain the problems, affected users, practical corrections, shared responsibilities to reuse, and observable finished behavior. Investigate deeply enough to support those judgments; present them concisely.

Capture the user's narrative, signature interaction and constraints, not just a feature list. Translate them into the shortest meaningful successful journey and the outcomes the product must deliver. A requested immediate capture experience, for example, must survive architectural planning as an observable interaction requirement. Distinguish requested outcomes from inferred opportunities; do not turn an illustrative example into a universal requirement.

Keep two levels distinct:

- **Assessment and roadmap:** explain the intended destination, cover the requested system, cross-area consolidations, existing work, priorities and acceptance outcomes. Present unsettled scope as a proposal. Future work may be well understood without exact interfaces, file reservations or test scripts.
- **Specs and implementation handoffs:** after the direction is agreed and this detail is requested, specify the next selected chunks—ordinarily one to three unless the user chooses another scope. Expand later chunks when selected and recheck their then-current source and owners.

A request to review the whole platform, be thorough, or explain what needs fixing does not by itself request an exhaustive implementation specification. Do not generate a packet for every finding or section, fill a template's optional fields, or keep writing distant specs to make a roadmap look complete. Explicit requests for broader implementation planning override this default.

## Scope and authority

Honor the user's scope, baseline, constraints and established authorization. The skill defaults to investigation, safe verification and planning artifacts; it does not itself authorize implementation, external tracker updates, live-data mutations, publication, merges or deployment. Do not ask again for authority already granted.

When the user also authorizes execution, carry the agreed plan through selected implementation, review and relevant acceptance, reusing repository workflows. The discussion point settles unresolved direction; it does not cancel authorized work or require repeated approval for routine steps. A plan alone does not satisfy an agreed implementation/completion request.

Use the selected repository and its documentation conventions. Preserve other workers' changes; isolate planning when useful. Keep related-repository inspection limited to relevant contracts. Adapt to the product: a library needs consumer/API review, not an invented admin dashboard.

## Deliver the agreed work

When the user selects end-to-end delivery of an agreed issue, slice or goal, use the repository's own delivery workflow (or a delivery skill, if one is installed) for plan critique, implementation, review, integration CI and release verification. Carry forward the accepted roadmap, existing owners, exclusions and authorization. Promotion to production requires whatever release authority the repository defines. Do not route an assessment-only request into implementation or repeat a settled architecture discussion.

## Establish reality and reconcile work

1. Identify the user's desired experience, core jobs, explicit constraints, supported/held/retired scope, expected operating conditions and consequential failures. Combine that intent with current behavior; do not assume the existing feature list defines the whole destination. Prioritize by actual usage and user value where known; label assumptions where evidence is missing.
2. Pin the reviewed source and inspect relevant in-flight branches, PRs and release evidence. Distinguish an old planning checkout, current source, a worker's candidate and a verified release. Attribute worker reports; record unknown deployment/runtime state.
3. Read existing decisions, architecture programs, design conventions, issues and prior reviews. Credit implemented contributions and retain approved commitments. Combine the new roadmap with existing consolidation/hardening/refinement work rather than silently replacing that work with the newly found bugs.
4. Reconcile overlapping owners and changes. Continue through an existing issue/PR when it owns the same repair; do not dispatch a competing implementation. Historical counts and status labels are leads, not current acceptance evidence.

Adapt to the starting state. For an **empty repository**, propose the smallest credible architecture and product slices from the user's intent; expose assumptions and tradeoffs instead of inventing defect counts or current consumers. For a **partial system**, distinguish working behavior, foundations to retain, architectural repairs and missing intended capabilities. For an **established system**, assess architecture and journeys broadly, converge parallel mechanisms and preserve compatibility/data obligations. Unknowns do not justify starting over; existing code does not require preserving a harmful design.

Give an early account of the product and intended review depth, then proceed. Resolve routine technical choices from evidence. Ambiguity about detail is a reason to start at assessment/roadmap level rather than assume exhaustive planning.

## Assess the architectural foundation first

Read the architecture baseline and criteria in [review lenses](references/review-lenses.md). Map actual domains, dependency direction, entrypoints, authoritative rules/writes, persistence and external-effect boundaries before organizing a page-by-page repair list; mark proposed boundaries separately where implementation is absent. For larger systems, inventory direct database access outside intended owners, parallel services/writers, duplicated policies/calculations/client/UI mechanisms, cycles and high-coupling areas. Use existing graphs/ratchets where available; bind counts to a revision, denominator and stated exclusions, then inspect the underlying behavior.

Test architectural claims against concrete scenarios: change one rule, add a supported entrypoint, handle a concurrent/retried operation, revoke access, or increase load. Determine how many independent implementations must change and what protects correctness. Source tracing, focused probes and existing tests may establish risks; unperformed load, recovery or runtime checks remain explicit gaps.

Lead the findings with the structural diagnosis: what to keep, where boundaries or invariants are weak, and which consolidations reduce change cost and failure risk. Do not assume a folder named `service`, a green test suite or an ADR establishes adoption. For layered applications, aim for cohesive domain operations consumed consistently by UI/transport/job/tool adapters, with appropriately owned policy, state and transactions. Preserve useful modularity; thin wrappers around every query, universal service frameworks or automatic microservice splits do not establish sound architecture.

## Discuss what done should mean

After enough investigation to offer a grounded view, present an owner-readable assessment and proposed finish line. Explain what the project is trying to accomplish, its architectural condition, the observable qualities of a finished system, what to retain/consolidate/retire, intentional exclusions and a few stages for getting there. Include the evidence limits and the decisions/tradeoffs that materially affect direction. Do not bury this overview beneath a completed specification package.

Give the user a real opportunity to discuss and change the proposal before solidifying it into specs or detailed implementation plans. End that assessment turn with the overview and focused discussion points; do not immediately continue into detailed planning or treat silence as agreement. Existing user decisions and explicitly approved direction carry forward—do not add a ceremonial approval step or ask the same questions again. A user who has already settled the destination and requested concrete plans can proceed directly at that level.

After feedback, revise the roadmap and record the accepted direction, exclusions and remaining decisions in its canonical home. Continue the agreed review/planning scope; broader speculative design remains deferred.

## Review breadth, then synthesize across areas

Use the relevant [review lenses](references/review-lenses.md). Map the agreed areas and connected actor journeys, including supporting operations and failure paths. Substantively assess every in-scope area; disclose sampled pages/states and unreviewed boundaries. Inventories and source-file counts do not substitute for review.

Trace behavior through input, authority, computation/state change, side effects, presentation and recovery. Inspect rendered interactions when material and available. Missing browser, database or provider evidence remains a named verification obligation. Complete the breadth assessment before spending the review on extensive design for one complex area; investigate consequential defects promptly without losing the wider scope.

**Perform a cross-area synthesis after the area reviews.** Compare repeated symptoms and competing owners: business operations, data access, authorization/context, clients, UI patterns, queries/metrics, templates/history and external effects as applicable. Name the common responsibility, existing implementation to keep, evidenced consumers and intentional differences. A stack of independent area reports is insufficient.

Distinguish reusable definitions from instances and immutable history. Prefer adoption of existing services, policies, clients and UI primitives over new frameworks. At roadmap level, establish the consolidation direction and affected consumer groups; reserve an exhaustive file migration census for selected implementation or deletion work. Similar names or component counts alone do not justify consolidation or removal.

For visual products, assess familiar page/control arrangements, navigation, forms, feedback, accessibility and recovery as part of the core journey. Establish reference patterns in high-use work, then migrate comparable consumers. Preserve useful specialist interactions and branding; fewer independent implementations is the objective, not an arbitrary component quota.

## Record findings and build the roadmap

Use [planning contracts](references/planning-contracts.md) for the appropriate level of detail. Findings need severity, affected users, trigger/consequence, exact source evidence, a practical remedy and closure behavior. Separate source-confirmed defects, reproduced failures, hypotheses, missing promised behavior, structural debt and optional expansion. Group siblings when the same repair and guard apply; keep genuinely different mechanisms distinct.

Sequence structural corrections and their consumer adoption by consequence, dependency, change-cost reduction and user value. Pull foundational correctness/security risks forward, then use high-use journeys to deliver and verify the architecture incrementally. Avoid both isolated leaf patches that preserve a broken shared mechanism and a platform-wide rewrite before any useful improvement lands. UI coherence and accessibility travel with those journeys. Technical complexity, prior research depth or a large existing packet is not a priority signal. Keep held scope and deliberate deferrals explicit.

Where tracker work is authorized, use canonical issues for defects **and** consolidation/adoption/acceptance obligations. Reuse the existing project or program where it fits; suggest a separate project only for a meaningful ownership or delivery boundary. Put selected implementation instructions on the owning issue or linked canonical spec. Do not create duplicate per-page issues or a second writable status ledger.

## Keep artifacts small and stop at the requested finish line

Use an owner-readable roadmap, concise area assessments and supporting evidence where needed; a small repository may fit in one document. Link existing authorities instead of copying them. Keep exact evidence separate from repeated explanatory prose. A new file should serve navigation, ownership or resumption, not merely satisfy a schema. Do not enforce a word quota that conceals material risk.

An **initial assessment/proposal is ready for discussion** when its architectural diagnosis, proposed destination and route have credible evidence and explicit coverage limits. Mark remaining breadth work; do not call a sampled assessment a completed full-system review. The agreed **review/roadmap is complete** when the architectural foundation and requested areas have substantive assessments, cross-area corrections and existing commitments are reconciled, and outcomes, owners, sequence and remaining decisions/verification are clear. A bug inventory without a systems-level judgment is incomplete. Exact implementation plans for every later area are not a missing deliverable at roadmap level.

If handoffs were requested, also verify the selected chunks' source, design, paths, ownership, dependencies and discriminating acceptance. Shared-file conflicts or unresolved central decisions prevent that chunk being called ready; they do not require specifying the rest of the platform. A narrow fix does not close its parent outcome, and closing the bug list does not prove UI/service adoption or complete journeys.

Keep planning, implementation, integration, release and runtime acceptance distinct. Validate links and coverage after substantive review. Preserve a compact resume checkpoint with canonical locations, reviewed revision, completed scope, active owners and the next bounded action. Reconcile drift when resuming instead of restarting or expanding the artifact set. Conclude with the system's condition, practical finish line and next work; state the actual evidence limits.
