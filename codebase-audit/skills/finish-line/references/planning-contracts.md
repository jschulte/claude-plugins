# Roadmap, evidence and selected implementation contracts

Use the contract matching the request. These are information requirements, not a mandatory file schema. Start with an assessment and proposed destination for discussion unless that direction is already settled. A roadmap is a complete deliverable in its own right; the implementation section applies only after alignment to chunks selected for detailed planning.

## Baseline and findings

Record the scope, exclusions, product/usage assumptions and exact source revision for each relevant repository. Separate additional uncommitted evidence, implementation candidates and verified release/runtime state. Bind comparisons to revisions; do not expose unrelated private content or secrets.

Capture the intended user experience and distinguish it from observed behavior. Identify an empty, partial or established starting state. With no implementation, use explicit proposed capabilities, boundaries and validation experiments; do not fabricate code findings or demand an existing consumer inventory. With existing code, credit and reuse sound parts while identifying both architectural corrections and missing requested outcomes.

For each material finding, retain its canonical issue or stable identity, severity, affected users, triggering condition, expected/actual behavior and consequence. Include exact file/symbol evidence, applicable test/runtime results and their limits, practical correction, preserved behavior and a closure scenario. Source confidence and severity are different judgments. Group siblings only when they share a repair and guard; credit fixed findings instead of filing them again.

Reconcile existing work as retained direction, implemented contribution, reviewed, integrated, released, accepted, superseded or unknown. Preserve approved program commitments unless the user changes them. An overlapping PR creates coordination work, not permission to start a second implementation. Keep provenance without reproducing entire historical reports.

## Medium-level roadmap — default

Lead with the architectural condition: principal boundaries and owners, foundational correctness/security/scaling risks, repeated mechanisms and change amplification, existing architecture work to retain, and the few structural corrections with the greatest benefit. Include useful measurements and their limits. A service-extraction count or a collection of page defects does not substitute for this diagnosis.

Present the proposed finish line and stages for reaching it before freezing specifications. Distinguish observed facts, recommended scope and accepted user decisions. Invite discussion of consequential tradeoffs and exclusions; preserve already-settled answers. The initial proposal may expose further breadth review needed and is not itself proof of complete coverage. After feedback, revise the canonical roadmap before expanding selected work into detailed plans.

Give the owner a readable explanation of the system's condition and the work required to reach its intended quality bar. A concise section row or short paragraph should answer:

| Question | Useful content |
| --- | --- |
| What is wrong or uncertain? | Evidence-backed diagnosis, severity/impact, users and meaningful coverage limits. “Not tested” is a verification gap, not automatically a defect. |
| What should change? | Practical correction and observable finished behavior, including the important failure/recovery case. Avoid prescribing every interface or test implementation. |
| What should be reused? | Existing business/data/UI authority, affected consumer groups, candidate obsolete paths and differences that must remain. |
| Where does it belong? | Canonical issue/program, related work and priority/dependency. An existing identity is sufficient; do not invent a second packet hierarchy. |

Cover all agreed areas at this level, including alternate actors and operational journeys. Avoid applying every hypothetical failure mode to every section. An application may need saved-state and keyboard acceptance; a formatting library needs a malformed-input contract, not an operator repair console.

After individual assessments, connect the findings across areas. Explain the shared responsibility, evidence for combining it, surviving owner, migration/adoption direction and intentional boundaries. Distinguish genuinely shared mechanisms from similar-looking domain concepts. “Reduce duplication” needs this explanation; a full importer/deletion census can wait until that change is selected.

Organize the work into a few understandable stages by architectural risk, change-cost reduction, usage and dependencies. Shared foundations should unlock identified journeys and retire competing mechanisms. Each consolidation names a surviving authority and adoption direction, rather than merely moving files behind new wrappers. Keep UI/accessibility adoption, technical reliability and safe code reuse visible alongside defects. Preserve deliberate holds and existing obligations. A single difficult subsystem must not consume the plan while other in-scope areas remain unassessed.

Describe success through concrete outcomes rather than universal scores, component quotas or unsupported performance targets. Use the product's operating needs to justify any budget. Closing defect tickets is insufficient if service/UI adoption, promised behavior or journey/release verification is still outstanding.

## Canonical tracking and document budget

Use the repository's current issue/program and documentation rules. When external updates are authorized:

- Search existing issues before creating findings. Reuse the same root-cause/guard owner; preserve older completed contributions when recording a residual defect.
- Track consolidation, consumer adoption and acceptance work as well as bugs, using existing parent issues/checklists where appropriate. Avoid an issue per page when one shared repair owns the class.
- Put implementation details on the canonical issue or its linked specification. Keep project fields for scheduling/status; local files may provide navigation, working drafts or supporting evidence, without becoming a second source of truth.
- Reuse the existing project/program unless a distinct delivery or ownership boundary warrants a separate one. Retain existing phases and combine the review's outcomes with them.

Without tracker authorization, retain those mappings and proposed changes locally and state what remains unpublished. Do not treat the skill as authorization or repeatedly ask for previously granted permission.

Scale area coverage with system breadth; scale implementation detail with the selected work. Prefer one roadmap/index and compact assessments plus evidence as needed. Do not multiply specs, ledgers, manifests and resume files containing the same facts. A detailed appendix is justified when its evidence changes a decision or enables verification, not because a template has a slot for it.

## Implementation handoff — selected chunks only

When requested, prepare the next bounded chunks, ordinarily one to three unless another scope is specified. Each must let an implementer act without rediscovering the central design:

1. Problem, affected users, resulting behavior and canonical finding/outcome owner.
2. Checked source baseline, prerequisites and current PR/worker ownership. Distinguish a prepared, unclaimed chunk from one assigned to an implementer.
3. Exact create/edit/delete paths and read-only dependencies; affected consumers and obsolete implementations to retire. For cross-repository work, identify each write-set and integration owner.
4. Surviving authority or primitive, essential interfaces/invariants and a bounded sequence. Include lifecycle, policy, data units, errors and compatibility only where they matter to the change.
5. Existing tests to preserve/move, discriminating regressions and necessary integration/runtime checks. Verify what proposed commands run. A mock must not erase the boundary the test claims to prove.
6. Applicable migration, release, rollback and retirement order, completion evidence and parent obligations the slice leaves open.

Say which paths are new; verify existing edit/delete paths and actual consumers before reserving them. Resolve overlapping writers, including shared tests, schemas, client files and audit baselines. Reuse existing services/clients and ready plans after reconciling their source. Do not duplicate helpers already being implemented in an active PR.

Unresolved central design or ownership makes that chunk investigatory or dependent; do not fabricate exactness. Routine future execution checks belong in the handoff. Later roadmap stages remain at medium level until selected. An explicit request for a broader detailed plan overrides this default without making placeholders “ready.”

## Completion and evidence

**Proposal ready for discussion:** credible architectural assessment, suggested observable finish line, broad correction sequence, assumptions and meaningful discussion points. Further review is named; acceptance and full coverage are not implied.

**Roadmap complete:** the architectural foundation and agreed populations were substantively assessed, sampling/unknowns are visible, cross-area corrections and approved commitments are reconciled, and outcomes, ownership, sequence and unresolved decisions/verification are clear. Every outcome maps to tracked work or an explicit remaining obligation; it need not map to an execution-ready packet.

**Selected handoff prepared:** its design, source, paths, prerequisites and verification are specified. Assignment and exclusive file ownership must be confirmed before dispatch. A requested handoff with unresolved essentials remains unfinished; completing the roadmap does not waive it.

**Execution requested:** after direction is agreed, continue the authorized selected implementation and verification. Completion means the promised product behavior and architectural outcomes satisfy their evidence-backed acceptance, with deliberate deferrals visible. An architecture cleanup without the intended user journey, or working screens on unaccepted structural foundations, does not meet that finish line.

**Implemented / reviewed / integrated / released / runtime accepted:** each needs evidence for that particular state. Use the product's distribution or execution boundary; not every repository has a deployment. Attribute worker claims separately from independent checks and preserve the exact revision, environment, meaningful test results and limits.

Check substantive coverage and cross-area reasoning before links/counts. Keep a concise decision record only where owner judgment changes scope or acceptance; do not ask the user to choose routine code organization. End when the requested deliverable is satisfied. Name future implementation planning as future work instead of extending a finished review into a speculative specification program.
