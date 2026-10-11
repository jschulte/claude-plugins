# Architectural fitness and product review lenses

Use these criteria to reason about the system as a whole before individual repairs. Select applicable concerns and pursue material evidence gaps; this is neither a feature checklist nor a requirement for fifty reports. Architectural quality means fitness for the product's users, operating conditions and expected changes, with explicit tradeoffs.

## Architecture baseline

Map the important domains/modules, their dependency direction, entrypoints, data and business-rule owners, external effects and deployment/runtime boundaries. A small diagram or table is enough; extend an existing architectural map when accurate. Compare the intended design with actual consumers, including older and alternate paths.

In an empty repository, use the same concerns to evaluate proposed boundaries against the intended journey. Mark them as proposals, choose the simplest viable architecture, and identify the experiments needed to test risky assumptions. In a partial repository, keep actual and proposed parts distinguishable. Do not invent implementation evidence or migrate consumers that do not exist.

For a large application, establish useful inventories at the reviewed revision:

- Database access in routes, pages, actions, tools, jobs and other adapters that should use existing domain operations. Find actual queries/writes, including aliases and raw SQL where relevant; distinguish tests, migrations and justified infrastructure access. Imports alone can miss indirect bypasses or count harmless types.
- Multiple write/rule owners for the same invariant, parallel service directories, old/new implementations still live, and drift in copied validation, calculations, status transitions or permission checks.
- Repeated client request/error/cache mechanisms and UI interaction patterns; distinguish behavioral duplication from useful domain components and deliberate presentation differences.
- Dependency cycles, excessive cross-domain imports, high fan-out, large coordination hubs and changes that require synchronized edits across unrelated areas. Use real change history when available; label source-based estimates.
- Critical invariant coverage and enforcement gaps after code moves: security, concurrency, PII, network/transaction boundaries and obsolete compatibility paths.

Reuse existing inventories, graphs and quality guards before introducing tooling. State each metric's definition, denominator, exclusions, revision and sampling. Explain why the observed pattern matters. A lower count without fewer independent rules or safer changes is not architectural acceptance.

## What a sound system should provide

These are practical code-level criteria. Inspect the questions relevant to the product; record material findings and unknowns rather than mechanically filling every cell.

| Concern | Questions and evidence to examine |
| --- | --- |
| Domain boundaries and cohesion | Does each module own a coherent business responsibility? Are similarly named concepts genuinely the same? Can maintainers identify the authoritative operation without searching several parallel systems? |
| Layering and dependencies | Do UI, transport and background adapters consume the intended domain contracts? Where do database access, business rules or framework/provider types leak across boundaries? Are cycles or sideways imports making unrelated domains inseparable? |
| Duplication and consolidation | Which rules, writers, schemas, queries, clients or UI behaviors are implemented repeatedly? Where have copies already drifted? Can a surviving owner absorb real callers while preserving deliberate differences and retiring obsolete paths? |
| Data and lifecycle integrity | Are constraints, units, Decimal/date/time semantics and transitions explicit? Are reusable definitions separate from configured instances and submitted/signed/history snapshots? Can partial copies, null/default handling or multiple writers silently change meaning? |
| Transactions and concurrency | Who owns atomicity? Are expected-state checks enforced at the write? What happens under competing updates, duplicate commands, lock contention, partial failure or replay? Does external I/O hold database transactions open? |
| Security and trust boundaries | Do all entrypoints enforce authentication, resource/tenant authorization and revocation? Trace injection, unsafe rendering, outbound requests, file handling, secret/PII exposure and dependency risk where applicable. A cloud perimeter cannot repair a code-level authorization defect. |
| Contracts and validation | Do shared runtime schemas and typed results reach all untrusted inputs and consumers? Are errors and saved/queued/delivered outcomes truthful? Can internal ORM or provider representations escape through public/client interfaces? |
| State, cache and client consistency | Who owns authoritative state? Are cache keys/invalidation scoped correctly? Can an org switch, late response, optimistic update or failed refresh show stale data or reverse the apparent outcome of a successful operation? |
| External effects and recovery | Are operation identity, delivery/checkpoint evidence, timeouts and retry limits explicit? Can provider ambiguity, duplicate delivery, cancellation or worker failure be recovered without repeating money or losing work? Reuse existing queues/outboxes before adding mechanisms. |
| Scalability and resource use | Trace N+1 queries, query plans/index needs, result completeness/paging/export, amplification, payload/media size, pools, locks, queues and memory. Does expected peak demand expose a shared bottleneck or require a measured change? Do not prescribe caching, microservices or new infrastructure without evidence. |
| Changeability and comprehensibility | How many independent implementations must change for one rule or feature? Can a new consumer use an existing operation without copying it? Are boundaries discoverable and dependencies replaceable where useful? Does an abstraction reduce decisions and change cost, or merely add indirection? |
| Tests and architectural enforcement | Do tests exercise invariants and real boundaries, including denial, concurrency and recovery? Can guards detect regrowth across moved code? Which mocks, stale ratchets or duplicate suites give false confidence or slow safe feedback? |
| UI and interaction architecture | Do comparable pages reuse accessible collection/detail/editor/action patterns, control placement and vocabulary? Are focus, keyboard, responsive, empty/pending/error and saved-state behaviors consistent? Keep specialist workspaces where the job requires them. |
| Operations, delivery and evolution | Are configuration/secrets, observability, artifact identity, environment parity, compatibility, migrations, rollout/rollback and restore evidence credible? Can maintainers diagnose a cross-layer failure? Are dependencies, retired routes, flags and retained data obligations managed without a second hidden system? |

## Put structural claims through concrete scenarios

Use a small set of consequential scenarios to connect architecture with behavior and change cost. Examples: change a fee or eligibility rule; add a job/tool caller; switch organization during a request; process a command twice; lose the provider response after it succeeds; increase concurrent work at a deadline; roll back a release with a schema transition. Choose the scenarios the product actually needs.

Trace all involved owners and entrypoints for the selected scenario. Use safe executable probes, existing tests, concurrency/replay checks or measured workloads when warranted and permitted. Record the stimulus, expected result, observed mechanism and evidence limit. Do not claim load resilience, tenant isolation or recoverability from a diagram or mocked happy path. An inaccessible environment leaves a specific test obligation.

For proposed consolidation, explain what remains authoritative, which consumers move, what duplication disappears and the likely change/testing benefit. Inspect actual consumers before deletion, including dynamic, generated, registry/flagged and external uses. Preserve snapshots and compatibility obligations. Assess the tradeoff: sharing unrelated business concepts or making one giant service can increase coupling even as line counts fall. A service may be an in-process module; network separation requires its own justification.

## Adapt the architecture review to the product

| Product | Connected experience and relevant boundaries |
| --- | --- |
| Web/mobile/desktop application | User and operator journeys, client/server state, tenant/resource authority, accessible UI and background outcomes. |
| API, library or SDK | Integration/installation, public versus internal contracts, types/runtime agreement, errors, compatibility, dependency footprint and release packaging. |
| CLI/developer tool | Scripting and interactive use, stdout/stderr/exit codes, configuration precedence, credentials, interruption and destructive-operation recovery. |
| Worker/distributed workflow | Admission versus durable completion, acknowledgments, ordering, leases, duplicate delivery, poison work and backpressure. |
| Data/research/ML | Input provenance, schema assumptions, leakage, evaluation validity, reproducibility, nondeterminism, cost and serving/rerun behavior. |
| Infrastructure/deployment | Provisioning/state ownership, drift, isolation, artifact/configuration identity, capacity, rollout/restore and resource cost. |
| Documentation/content | Authority and freshness, source/generated ownership, navigation, accessibility, references and publication/archival behavior. |

For visual products, inspect complete cross-surface journeys as well as page shapes. For nonvisual products, assess API/command vocabulary, diagnostics and integration ergonomics instead of inventing UI work. Include public, reduced-permission and operator experiences; an admin screen alone cannot establish them.

## Guidance behind these lenses

The criteria above are a practical synthesis for this skill, not a claim to perform formal certification or reproduce an entire framework. The following primary references were consulted on 2026-09-06:

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/) and its [six pillars](https://docs.aws.amazon.com/wellarchitected/latest/framework/the-pillars-of-the-framework.html) inform operational excellence, security, reliability, performance efficiency, cost and sustainability. Adapt relevant questions to the actual runtime/provider; do not turn every code review into a full AWS infrastructure audit.
- [CMU SEI software architecture](https://www.sei.cmu.edu/software-architecture/) and [modifiability tactics](https://www.sei.cmu.edu/library/modifiability-tactics/) inform system-level quality/tradeoff reasoning and the relationship between coupling, cohesion and cost of change.
- [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) provides a broader product-quality model. Only its public overview was consulted; this skill does not reproduce or certify compliance with the full standard.

Use these as orientation, not mandatory reading on every invocation. Fetch the relevant official source if a specific standard/version or claim becomes consequential. Evaluate both code and runtime security where they overlap; neither replaces the other. Keep actual findings evidence-backed and recommendations proportional to the system.
