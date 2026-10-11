---
name: health-audit-api
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed API surface quality audit that scores endpoint design, request/response consistency, error handling, versioning, authentication surface, pagination & filtering, rate limiting, idempotency, documentation, webhooks, performance signals, and SDK/client experience; produces a scorecard with separate engineering and live-harm grades, a bar chart, endpoint inventory, response shape audit, error catalog, and only flags problems it can prove from the actual API contracts and implementation.
---

# API Surface Quality Health Audit Skill

Use this skill when the user wants a deep audit of the quality of an API as experienced by its consumers — developers integrating with it. The skill may audit the full API surface or focus on a user-specified endpoint family, webhook system, auth surface, SDK layer, or contract concern. This is NOT a code quality, architecture, or internal maintainability audit. `/health-audit` does that. This skill is about the external contract: consistency, predictability, correctness, and developer experience of every programmatic interface exposed to consumers. Applies to REST APIs, GraphQL APIs, webhooks, SDKs, and any programmatic interface with defined contracts.

## Mission

Perform a rigorous, evidence-backed audit of the API surface from the perspective of a developer integrating with it for the first time. Evaluate the consistency, correctness, predictability, and developer experience of the external contract across endpoint design, request/response shapes, error handling, versioning, authentication, pagination, rate limiting, idempotency, documentation, webhooks, performance signals, and SDK quality.

Calibrate the review to the actual API:
- What kind of API is this? (REST, GraphQL, gRPC, webhook system, SDK)
- Who are the consumers? (Third-party developers, internal teams, mobile clients, partner integrations)
- What is the API's maturity? (Prototype, private beta, public GA)
- Is this a single API or a suite of APIs across multiple services?
- Internal APIs between microservices count if they have defined contracts

Do not produce vague "API best practices" fluff. Do not invent problems. Do not opine on REST vs. GraphQL vs. RPC — audit the quality of whatever approach was chosen. Consistency matters more than any specific convention. If there is no external API (pure frontend app, no exposed endpoints), say so and skip.

### Focus Prompt Support

This skill can take an optional prompt that describes the API area to focus on.

Examples:
- "Focus on auth and token handling"
- "Review pagination and filtering"
- "Audit webhook delivery contracts"
- "Look at the billing endpoints"
- "Review the SDK surface for the admin API"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete endpoints, schemas, middleware, docs, specs, SDKs, and shared response utilities
- Audit out-of-scope endpoints only when they are required to explain an in-scope inconsistency or shared root cause
- Keep findings, scores, and recommendations scoped to that area instead of implying a full API-platform grade
- State assumptions, included operations, excluded operations, and checked contract sources explicitly in the output

If the prompt is ambiguous, infer the most likely scope from route groupings, tags, specs, SDK names, and resource naming, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists — route definitions, handlers, serializers, schemas, middleware
2. **The specific code, endpoint signature, or response shape** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world harm to API consumers** — what breaks, what confuses, what costs integration time
4. **A second instance or a corroborating signal** (a reproduction, a failing test, a call path traced end to end) that confirms the problem is real. A one-off defect qualifies once you have reproduced or traced it; it does not need a twin

Corroborating signals can include:
- A second endpoint exhibiting the same inconsistency
- A mismatch between the OpenAPI spec and the actual implementation
- A response shape that contradicts the pattern established by other endpoints
- An error format that differs from the API's own documented conventions

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical API platform engineer would say "yeah, that's a real problem for consumers." |
| **Probable** | Strong signals but missing one criterion (e.g., only one endpoint exhibits the issue, or consumer harm is inferred rather than proven). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call a problem. |
| **Question** | Something that looks off but needs domain context, consumer feedback, or product owner input to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Active harm to consumers or broken contract | Endpoints returning wrong status codes for error conditions, silent data loss on write operations, authentication bypasses, responses that violate the API's own documented contract, breaking changes shipped without version bump |
| 🟠 **High** | Significant friction for integration developers | Inconsistencies that force consumers to write endpoint-specific handling instead of generic client code, error responses that provide no programmatic signal for recovery, missing pagination on unbounded collections, undocumented required fields |
| 🟡 **Medium** | Meaningful but contained | Inconsistent naming conventions across a subset of endpoints, missing optional metadata (rate-limit headers, pagination cursors), incomplete error details, minor spec drift |
| 🔵 **Low** | Improvement opportunities | Polish items that would improve DX but don't cause integration failures — missing examples in docs, inconsistent optional field inclusion, verbose response shapes that could be streamlined |

### Scoring Discipline

Do **not** force a full-API score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope

- Determine whether the user asked for a full API audit or a focused audit
- Translate any focus prompt into concrete endpoints, schemas, middleware, docs, specs, and SDK surfaces
- Identify shared components that materially affect the in-scope contract
- State what is in scope and what is out of scope
- If the requested area spans request handling, auth, docs, and SDKs, follow the full path instead of reviewing one layer in isolation

### Phase 1: Understand the API Surface

Before judging the API, establish context:

- What the API does and who consumes it
- The API style (REST, GraphQL, RPC, mixed)
- Route/endpoint registration patterns (Express, FastAPI, Rails, Spring, NestJS, etc.)
- Authentication mechanism(s) in use
- Whether an OpenAPI/Swagger spec, GraphQL schema, or other contract definition exists
- How many endpoints/operations exist and how they are organized
- Whether SDKs, client libraries, or type definitions are provided
- Whether webhooks or event systems exist
- The apparent versioning strategy (if any)

### Phase 2: Scan for Evidence

Build a complete inventory and then scan for:

- Naming inconsistencies across endpoints (plural vs. singular, casing, verb vs. noun)
- Response shape drift between equivalent operations (list vs. get vs. create)
- Error response format inconsistencies
- Status code misuse (200 with error body, 404 for validation failures, etc.)
- Pagination approach inconsistencies across list endpoints
- Authentication enforcement gaps
- Missing or inconsistent rate-limit signaling
- Spec-to-implementation drift
- Undocumented behavior

### Phase 3: Validate Before Accusing

For each potential finding, ask:

- Would a real integration developer hit this and be confused or slowed down?
- Is this actually inconsistent, or is there a legitimate domain reason for the difference?
- Is it a one-off blemish, a systemic pattern, or a root cause in shared middleware?
- Could there be a valid rationale I am missing (e.g., backward compatibility constraint)?
- Is there enough evidence to present to the API team?
- Does this violate the API's own conventions, or just my preferences?

### Phase 4: Synthesize

- Group issues into systemic themes (e.g., "response shape inconsistency" vs. individual endpoint complaints)
- Separate root causes (missing shared middleware, no response serializer) from repeated symptoms
- Identify what matters most to the integration developer's first-hour experience
- Cross-reference findings across categories to surface root causes
- Distinguish between public API issues and internal API issues when both exist
- Keep conclusions scoped to the reviewed API surface unless the evidence truly supports a wider platform claim

---

## Analysis Categories

Analyze the API surface through each category independently. A single issue may appear under multiple categories if it has cross-cutting impact, but avoid padding the report by cloning the same finding everywhere. Use cross-references when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. Endpoint Design & Naming

The URL structure is the first thing a consumer reads. It should be predictable enough to guess.

- **Resource naming consistency**: Are collection endpoints consistently plural or singular? Is the convention applied uniformly (`/users` vs. `/user`, `/orders` vs. `/order`)?
- **Casing convention**: Is the URL casing consistent — kebab-case, camelCase, snake_case? Does it match across all endpoints?
- **HTTP method correctness**: GET for reads, POST for creates, PUT/PATCH for updates, DELETE for deletes. Are there violations (POST for fetching, GET with side effects)?
- **URL structure depth and clarity**: Are URLs shallow and readable (`/users/123/orders`) or deeply nested and opaque (`/api/v1/accounts/123/users/456/orders/789/items/012`)?
- **Path params vs. query params**: Is there a consistent philosophy about what goes in the path (identity) vs. query string (filtering, options)?
- **Action endpoints vs. resource endpoints**: If non-CRUD operations exist (`/users/123/activate`, `/orders/456/refund`), are they handled with a consistent pattern?
- **HATEOAS or linking patterns**: If the API includes links to related resources, is the format consistent? If not, is the URL structure guessable enough to not need them?
- **Trailing slashes**: Are trailing slashes handled consistently (always present, never present, or both accepted)?

**Evidence bar**: Show endpoint definitions side by side. Point to route registration files and show naming inconsistencies with concrete examples. Quantify how many endpoints follow convention A versus convention B.

---

### 2. Request & Response Shape Consistency

The shape of the data is the API's real contract. Inconsistency here is the number-one source of integration bugs.

- **Response envelope consistency**: Do all endpoints use the same envelope structure (`{ data, error, meta }`, `{ result, pagination }`, or raw)? Or does each endpoint invent its own wrapper?
- **Field naming convention**: Is the casing consistent across all responses (camelCase, snake_case, PascalCase)? Are abbreviations handled uniformly (`id` vs. `ID`, `url` vs. `URL`)?
- **Pagination format consistency**: Do all list endpoints use the same pagination shape (`{ items, total, page, pageSize }` vs. `{ data, cursor, hasMore }`)? Or does each collection invent its own?
- **Timestamp format consistency**: Are all timestamps ISO 8601? Are some Unix epochs? Are timezone representations consistent?
- **Null handling**: Is there a consistent policy on null vs. omitted fields vs. empty strings? Do create and get responses handle optionals the same way?
- **Boolean naming**: Are booleans named consistently (`is_active`, `active`, `isActive`)? Do they use affirmative naming (`enabled` vs. `disabled`)?
- **Nested object depth**: Are deeply nested responses consistent with their shallow counterparts? Does the same sub-resource look the same whether embedded or fetched directly?
- **Collection response shape vs. single resource shape**: When you GET `/users/123`, does the user object look identical to the objects inside GET `/users`?

**Evidence bar**: Show actual response shapes from multiple endpoints side by side. Highlight where field names, envelope structure, or data formats diverge. Quantify: "X of Y endpoints use envelope A; Z use envelope B."

---

### 3. Error Handling & Error Responses

Error responses are what consumers debug against at 2 AM. They must be consistent, informative, and programmatically useful.

- **Error response format consistency**: Do all error responses use the same structure, or does each endpoint return errors differently? Show the actual error shapes.
- **HTTP status code correctness**: Are status codes semantically correct? Watch for: 200 with error body, 404 for validation failures, 500 for client errors, 400 for everything.
- **Error codes for programmatic handling**: Do errors include machine-readable codes (e.g., `INVALID_EMAIL`, `RATE_LIMIT_EXCEEDED`) that consumers can switch on? Or only human-readable messages?
- **Error message quality**: Are error messages useful to the developer debugging? Or are they generic ("An error occurred", "Bad request", "Internal server error")?
- **Validation error detail**: For 422/400 validation errors, does the response identify which field failed, what the constraint is, and what is expected? Is the format consistent across all validated endpoints?
- **Rate-limit error responses**: Do 429 responses include Retry-After headers? Is the rate-limit error body consistent with other error responses?
- **Authentication error clarity**: Can the consumer distinguish between "no credentials" (401), "bad credentials" (401), and "insufficient permissions" (403)? Are the error messages specific enough to act on?
- **Error response content type**: Do error responses use the same Content-Type as success responses (JSON), or do some return plain text or HTML error pages?

**Evidence bar**: Collect actual error response shapes from multiple endpoints and compare side by side. Show status code usage across the codebase. Quantify how many endpoints follow the dominant error pattern and how many diverge.

---

### 4. Versioning & Evolution

APIs outlive their first implementation. Versioning and evolution strategy determines whether consumers can upgrade without breaking.

- **Versioning strategy presence**: Is there a versioning mechanism? (URL path `/v1/`, header `Accept: application/vnd.api+json;version=1`, query param `?version=1`, or none at all?)
- **Versioning consistency**: Is the versioning applied uniformly across all endpoints, or do some endpoints skip it?
- **Backward compatibility signals**: Are there patterns in the code that suggest breaking changes have been introduced? Fields removed, response shapes changed, endpoints renamed?
- **Deprecation communication mechanism**: Is there a mechanism to communicate deprecation to consumers? (Sunset headers, deprecation fields in responses, documentation warnings)
- **Breaking change risk assessment**: Are there endpoints that appear to be evolving in a way that risks breaking existing consumers? Shared types being modified, response fields being removed?
- **API changelog or migration guides**: Is there evidence of version migration documentation, changelogs, or upgrade guides?

**Evidence bar**: Show the versioning pattern in route definitions. Identify endpoints that deviate from the versioning convention. If no versioning exists, quantify the number of endpoints and the implied blast radius of any breaking change.

---

### 5. Authentication & Authorization Surface

Auth is the first thing a consumer must get right. If it is confusing, integration stops at step one.

- **Auth mechanism clarity**: Is the authentication mechanism obvious from the code? (API key in header, Bearer token, OAuth flow, session cookie, mutual TLS) Can a consumer figure out what to send without tribal knowledge?
- **Auth error messages**: When auth fails, does the consumer know exactly why? ("API key missing" vs. "Unauthorized" vs. empty 401)
- **Token handling patterns**: If tokens are used, are refresh flows, expiration, and token format handled consistently?
- **Scope/permission model clarity**: If the API has scopes or permissions, are they documented? Do error messages indicate which scope is missing?
- **Auth documentation**: Is the auth mechanism documented alongside the API, or must it be reverse-engineered?
- **Consistent auth enforcement**: Are all endpoints that should require auth actually protected? Are there endpoints that accidentally skip auth middleware?
- **Auth consistency across API surfaces**: If there are multiple APIs (REST + webhooks + WebSocket), is the auth model consistent or does each use a different mechanism?

**Evidence bar**: Show auth middleware registration and identify endpoints that are or are not covered. Show actual auth error responses. If auth is inconsistent, show which endpoints use which mechanism.

---

### 6. Pagination, Filtering & Query Patterns

List endpoints are the workhorses of any API. Inconsistency here multiplies client-side complexity.

- **Pagination approach consistency**: Do all list endpoints paginate the same way? (cursor-based, offset-based, page-number-based) Are the parameter names consistent (`page`, `limit`, `offset`, `cursor`, `pageSize`, `per_page`)?
- **Default and maximum page sizes**: Are defaults documented or discoverable? Are maximums enforced consistently? Can a consumer accidentally fetch unbounded results?
- **Filter parameter patterns**: Is there a consistent pattern for filtering? (`?status=active`, `?filter[status]=active`, `?where={"status":"active"}`) Or does each endpoint invent its own?
- **Sort parameter patterns**: Is sorting exposed? Is the format consistent (`?sort=created_at`, `?sort=-created_at`, `?orderBy=createdAt&order=desc`)?
- **Search functionality**: If search exists, is it consistent across searchable endpoints? Same parameter name, same behavior?
- **Field selection / sparse fieldsets**: Can consumers request only the fields they need? Is the mechanism consistent?
- **Bulk operation support**: For operations that consumers would naturally want to batch (create many, delete many, update many), are bulk endpoints available?
- **Consistency across all list endpoints**: Do ALL collection endpoints support the same query parameters, or do some support filtering while others don't?

**Evidence bar**: Inventory all list endpoints and show which query parameters each supports. Build a comparison table showing pagination, filter, and sort support across endpoints. Quantify the inconsistencies.

---

### 7. Rate Limiting & Quotas

Rate limiting is invisible when it works. When consumers hit limits without warning, integrations break in production.

- **Rate-limit headers**: Do responses include standard rate-limit headers (`X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, or `RateLimit-*` per IETF draft)?
- **Rate-limit response format**: When limits are hit, does the 429 response include a body consistent with the API's error format? Does it include `Retry-After`?
- **Quota communication**: Are rate limits documented? Can consumers discover their limits programmatically?
- **Rate-limit scope clarity**: Is it clear what the rate limit applies to? (Per API key, per IP, per endpoint, per user, global)
- **Graceful degradation**: Are there signals of tiered rate limiting (warning headers before hard cutoff)?
- **Consistency of rate-limit behavior**: Are rate limits applied uniformly, or do some endpoints have different limits without documentation?

**Evidence bar**: Show rate-limit middleware configuration, header injection code, and 429 response handlers. If rate limiting is absent, note the risk for endpoints that could be abused or overloaded.

---

### 8. Idempotency & Safety

Consumers will retry. Networks are unreliable. The API must handle retries gracefully.

- **Idempotency key support**: Do mutating endpoints (POST, PUT, PATCH) accept an idempotency key header? Is it documented?
- **Safe retry behavior**: Can a consumer safely retry a failed POST without creating duplicates? Is this guaranteed by the API or left to the consumer?
- **Duplicate request handling**: How does the API behave when it receives the same create request twice? Silent duplicate, error, or idempotent success?
- **Concurrent modification handling**: Do update endpoints support ETags, `If-Match`, or optimistic concurrency? Can two consumers unknowingly overwrite each other?
- **Operation atomicity**: For multi-step operations, are they atomic? If a batch operation partially fails, what does the consumer see?
- **DELETE idempotency**: Does deleting an already-deleted resource return 404 or 204? Is it consistent?

**Evidence bar**: Show the handler code for mutating endpoints and identify whether idempotency is addressed. For concurrent modification, show the update handler and whether any concurrency control exists. Quantify how many mutating endpoints have idempotency support versus how many do not.

---

### 9. Documentation & Discoverability

The API is only as good as the consumer's ability to discover and understand it.

- **OpenAPI/Swagger spec presence and accuracy**: Does an OpenAPI spec exist? Is it generated from code or hand-maintained? Does it cover all endpoints?
- **Spec-to-implementation drift**: Do the documented request/response shapes match what the code actually produces? Are there endpoints in code but missing from the spec, or vice versa?
- **Example requests and responses**: Does the documentation include realistic examples, or only schema definitions?
- **Endpoint discoverability**: Can a consumer find all available endpoints from the spec or a discovery endpoint? Is there a logical grouping/tagging?
- **SDK generation readiness**: Is the OpenAPI spec complete and correct enough to generate a working SDK? Are operation IDs meaningful?
- **Postman/Insomnia collection availability**: Are there importable collections or quick-start resources for testing?
- **Inline documentation**: Do route handlers, schemas, or types include descriptions that flow into generated documentation?

**Evidence bar**: Compare the OpenAPI spec (if any) to actual route definitions and handler code. Identify endpoints missing from docs, documented endpoints that no longer exist, and response shapes that have drifted. Quantify the drift.

---

### 10. Webhook & Event Design

If the API pushes events, those events are part of the contract and deserve the same rigor as the request/response API.

- **Webhook payload consistency**: Do all webhook payloads follow the same envelope structure? Are field naming conventions consistent with the REST API?
- **Event type naming**: Is there a consistent naming convention for event types (`order.created`, `user.updated` vs. `ORDER_CREATED`, `UserUpdated`)? Is the convention documented?
- **Delivery reliability signals**: Is there evidence of retry logic, dead-letter handling, or delivery-status endpoints?
- **Payload signature/verification**: Are webhook payloads signed? Is the verification mechanism documented and consistent?
- **Event schema versioning**: Are webhook schemas versioned? Can consumers handle schema evolution without breaking?
- **Webhook registration API quality**: If consumers register webhooks via API, is the registration endpoint consistent with the rest of the API's design conventions?
- **Event completeness**: Do webhook payloads include enough data for the consumer to act, or do they require follow-up API calls to get the full picture?

**Evidence bar**: Show webhook payload structures and compare to REST API response shapes. Show event type naming conventions. If no webhook system exists, mark this category N/A.

---

### 11. Performance & Efficiency Signals

Not benchmarking — identifying patterns in the code that will cause consumer-visible performance problems.

- **N+1 query patterns**: Handler code that executes database queries inside loops when serving list endpoints. Show the query-in-loop pattern.
- **Over-fetching**: Endpoints that return entire database rows when the consumer only needs a subset. Response payloads that include large unused fields.
- **Missing caching headers**: Responses that could be cached (reference data, static lookups) but don't include `Cache-Control`, `ETag`, or `Last-Modified`.
- **Synchronous external calls**: Request handlers that make synchronous calls to external services, blocking the response.
- **Compression support**: Whether the API supports `Accept-Encoding: gzip` for large payloads.
- **Conditional requests**: Support for `If-None-Match` / `If-Modified-Since` to avoid transferring unchanged data.
- **Batch/bulk endpoints**: For operations consumers commonly perform in loops (create many, fetch many by ID), are batch alternatives available to reduce round trips?
- **Unbounded responses**: List endpoints that can return thousands of items with no pagination or maximum limit.

**Evidence bar**: Show the handler code, the query pattern or response construction, and explain the consumer-visible impact (slow responses, excessive bandwidth, unnecessary round trips). Quantify payload sizes where possible.

---

### 12. SDK & Client Experience

The last mile. Whether the API is easy to consume programmatically, with or without an official SDK.

- **SDK existence and accuracy**: If SDKs exist, do their types and methods match the current API? Are they auto-generated or hand-maintained?
- **Type definitions**: Are TypeScript types, JSON Schema, or language-specific type definitions provided? Do they match the actual API responses?
- **SDK-to-API drift**: If SDKs are hand-maintained, are they up to date with the latest API changes?
- **Client generation readiness**: If no SDK exists, is the OpenAPI spec complete and correct enough for a consumer to generate one?
- **Error handling in SDKs**: Do SDKs surface the API's error codes and messages, or do they swallow details?
- **Consistent naming in SDKs**: Do SDK method names map logically to API endpoints? Are conventions consistent?
- **SDK documentation and examples**: Do SDKs include usage examples, or must consumers read source code?

**Evidence bar**: Compare SDK types and method signatures to actual API endpoints and response shapes. Show drift between SDK and API. If no SDK exists, evaluate whether the API's shape supports clean client generation by examining the OpenAPI spec completeness and response consistency.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much are API consumers, their users, or the business being hurt right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a clean resource model and wrapped errors with four live contract bugs. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Consistent, predictable, a pleasure to integrate with |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Mostly solid, some inconsistencies that require workarounds |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Functional, but consumers need to write endpoint-specific handling |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Frequent inconsistencies, missing conventions, integration is painful |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | The API actively misleads or blocks consumers |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is user-facing (API consumers or their end users) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
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

Use these weights for full API audits. If categories are `N/A`, renormalize across the categories that were actually scored.

| Category | Weight |
|----------|--------|
| Endpoint Design & Naming | 12% |
| Request & Response Shape Consistency | 15% |
| Error Handling & Error Responses | 15% |
| Versioning & Evolution | 5% |
| Authentication & Authorization Surface | 8% |
| Pagination, Filtering & Query Patterns | 10% |
| Rate Limiting & Quotas | 5% |
| Idempotency & Safety | 5% |
| Documentation & Discoverability | 8% |
| Webhook & Event Design | 5% |
| Performance & Efficiency Signals | 7% |
| SDK & Client Experience | 5% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
Endpoint Design & Naming        7.8 | ████████████████░░░░
Request & Response Consistency  6.9 | ██████████████░░░░░░
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
**Location**: [File paths and line numbers — route definitions, handlers, serializers, middleware]

**Evidence**:
[Code snippets, endpoint definitions, response shape comparisons, status code
usage, spec-vs-implementation diffs that PROVE this is a real issue. This is
the most important section. Show side-by-side comparisons where applicable.]

**Consumer Impact**:
[What the integration developer experiences. Be specific — "consumers must
write endpoint-specific error parsing because...", "retry logic breaks
because...", "the SDK type does not match the actual response because..."]

**Recommendation**:
[Concrete, actionable fix. Not "consider standardizing" — instead, "add a
shared `formatErrorResponse()` middleware in `src/middleware/errors.ts` that
all route handlers use, producing `{ error: { code, message, details } }`
consistently."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# API Surface Quality Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for the API team lead or product
owner. What is the first-hour experience like for a developer integrating
with this API? What is working well, what is the biggest risk to consumer
adoption and trust, and what should leadership understand?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually reviewed, which
endpoints/schemas/specs/SDKs were inspected deeply vs broadly, what was
explicitly out of scope, and what could not be verified.]

## 3. API Surface Overview
[What kind of API this is, how many endpoints/operations exist, what
framework powers it, what authentication is used, whether an OpenAPI spec
exists, who the consumers appear to be, and what the versioning strategy is.]

## 4. Endpoint Inventory
[Table of every endpoint with: HTTP method, path, auth requirement, request
body (Y/N), paginated (Y/N), and consistency notes. This is the foundation
of the audit.]

| Method | Path | Auth | Body | Paginated | Notes |
|--------|------|------|------|-----------|-------|
| GET | /api/v1/users | API Key | N | Y | — |
| POST | /api/v1/users | API Key | Y | — | — |

## 5. Response Shape Audit
[Side-by-side comparison of response formats across endpoints. Show where
envelope structure, field naming, pagination format, or timestamp handling
diverges. This section makes consistency or drift visually obvious.]

## 6. Error Response Catalog
[Inventory of every distinct error response format found across the API.
Show the actual shapes, which endpoints produce them, and whether they are
consistent.]

## 7. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality. Mark out-of-scope
categories as N/A.]

## 8. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 9. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 10. API Contract vs. Documentation Drift
[Where the OpenAPI spec, SDK types, or documentation diverge from actual
implementation. Table format showing: what the spec says, what the code does,
and which is likely correct.]

## 11. Prioritized Action Plan
[Top 10 actions ordered by (consumer impact × effort efficiency). For each:
- What to do (one sentence)
- Why it matters to API consumers (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 12. Strengths & Bright Spots
[Mandatory. What the API does well. Consistent patterns, thoughtful error
handling, clean naming, good documentation, solid pagination — evidence-backed
praise.]

## 13. What Was Not Flagged
[Issues considered but rejected for insufficient evidence. Transparency about
what you chose not to report and why.]

## 14. Appendix: Evidence Notes
[Supporting data, endpoint lists, response shape inventories, error format
inventories, spec coverage analysis.]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of API surface quality]
```

For focused audits, keep the scope visible near the top of the report and mark unrelated sections or categories as `N/A` rather than pretending they were evaluated.

For APIs with no webhooks, no SDK, or no OpenAPI spec, collapse or mark the corresponding sections as N/A rather than silently skipping them.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report issues you cannot point to in actual route definitions, handlers, schemas, or response shapes
- ❌ Opine on REST vs. GraphQL vs. RPC — audit the quality of whatever approach was chosen
- ❌ Flag conventions as "wrong" when they are internally consistent — consistency is the standard, not your preferred convention
- ❌ Treat this as a code quality or architecture review — that is `/health-audit`
- ❌ Assume that different == wrong. Two endpoints may legitimately have different shapes if they serve different domains. Prove the inconsistency causes consumer harm.
- ❌ Pad the report with theoretical API design principles that aren't violated in this codebase
- ❌ Score a category as low without multiple proven findings to justify it
- ❌ Score categories you did not inspect — mark them N/A
- ❌ Let a narrow focus prompt silently expand into a fake full-API audit
- ❌ Present findings that are actually "I would have designed this API differently"
- ❌ Ignore the API's maturity, audience, and usage context when calibrating severity
- ❌ Double-count one root cause (e.g., missing error middleware) as many separate findings without cross-referencing

DO:
- ✅ Think like a developer integrating with this API for the first time — what is confusing, inconsistent, or undocumented?
- ✅ Quantify everything: endpoint counts, consistency ratios, error format variants, spec coverage percentages
- ✅ Show your work — the reader should be able to verify every finding independently
- ✅ Build the endpoint inventory first. It is the foundation of every other analysis.
- ✅ Compare response shapes side by side. Consistency is visible, not theoretical.
- ✅ Cross-reference findings across categories to identify systemic root causes (e.g., "no shared response serializer" explains both response shape drift and error format inconsistency)
- ✅ Consider the API's stage and audience when calibrating severity — a private beta has different standards than a public GA API
- ✅ Distinguish between "this is inconsistent" and "this inconsistency costs consumers real integration time"
- ✅ Call out when something is done well — silence on a category implies you didn't check it
- ✅ Explicitly note what was examined deeply vs. broadly
- ✅ State the requested focus area, included operations, excluded operations, and checked contract sources plainly
- ✅ If evidence is insufficient, say so plainly and downgrade confidence
- ✅ Prefer actionable insight over generic API design advice
- ✅ If the API has no external consumers today but is structured as a public API, audit it as one
