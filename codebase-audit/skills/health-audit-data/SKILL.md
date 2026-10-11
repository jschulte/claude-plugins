---
name: health-audit-data
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed data and privacy health audit that scores PII handling, data flow hygiene, logging practices, consent implementation, analytics inventory, data retention, third-party sharing, session management, regulatory signals, and configuration safety; produces a scorecard with separate engineering and live-harm grades, a bar chart, PII inventory, data flow map, and only flags problems it can prove from code.
---

# Data & Privacy Health Audit Skill

Use this skill when the user wants a deep audit of how a codebase handles user data — collection, storage, transmission, logging, sharing, retention, consent, and regulatory compliance signals. The skill may audit the whole system or focus on a user-specified data path, processor, storage surface, consent flow, or regulatory concern. This is NOT a security audit (preventing unauthorized access). `/health-audit` covers security posture. This skill is about whether *authorized* data handling is responsible, transparent, and compliant.

## Mission

Perform a rigorous, evidence-backed audit of data handling and privacy practices from two perspectives: a privacy-conscious user who wants to know what happens to their data, and a data protection auditor who needs to verify responsible handling.

Evaluate what personal data is collected, where it flows, who it is shared with, how long it lingers, whether users consented, and whether the implementation matches the promises made in privacy policies and consent dialogs.

Do not produce vague compliance fluff. Do not assume every app must be GDPR-compliant — determine what regulations likely apply based on code signals (user location handling, language support, payment currencies, cookie domains, deployment regions). Do not invent problems. Do not flag patterns that are perfectly adequate for the product's context.

Distinguish clearly between:
- "This is non-compliant" — the code violates a regulation that demonstrably applies
- "This lacks evidence of compliance" — the code neither proves nor disproves compliance
- "This is a privacy risk regardless of regulation" — irresponsible data handling that harms users even without a legal obligation

### Focus Prompt Support

This skill can take an optional prompt that describes the data/privacy area to focus on.

Examples:
- "Focus on analytics and consent"
- "Review how auth/session data is stored"
- "Audit deletion and retention for customer accounts"
- "Look at logging of PII in the backend"
- "Review third-party data sharing in checkout"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete data entry points, storage locations, processors, logs, SDKs, policies, and deletion paths
- Audit out-of-scope code only when it is required to explain an in-scope finding
- Keep findings, scores, and recommendations scoped to that area instead of implying a full privacy audit of the whole repository
- State assumptions, included data flows, and excluded data flows explicitly in the output

If the prompt is ambiguous, infer the most likely scope from schema names, service integrations, route names, config, and consent code, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists
2. **The specific code or pattern** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world harm** — what data is exposed, to whom, and what the consequence is for the user
4. **At least one corroborating signal** that confirms this is a pattern, not a one-off

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical privacy engineer would say "yeah, that's a real problem." |
| **Probable** | Strong signals but missing one criterion (e.g., not reproduced or traced end to end, or harm is inferred rather than directly observable). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call a problem. |
| **Question** | Something that looks off but needs human confirmation, legal review, or domain context to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Active data exposure or imminent regulatory violation | PII leaked in logs/URLs/client bundles, user data sent to third parties without consent, credentials in source code, sensitive data stored in plaintext without encryption, missing deletion capability for regulated data |
| 🟠 **High** | Significant privacy risk or compliance gap | Tracking before consent, excessive data collection without justification, PII in error messages sent to monitoring services, session tokens in insecure storage, no evidence of data retention limits on sensitive stores |
| 🟡 **Medium** | Meaningful but contained privacy concern | Inconsistent consent implementation, PII logged at debug level, analytics collecting more data than documented, soft-delete without hard-delete path, consent that cannot be withdrawn |
| 🔵 **Low** | Improvement opportunity for privacy posture | Missing privacy-by-design patterns, data minimization opportunities, consent UX friction, documentation gaps for data flows |

### Scoring Discipline

Do **not** force a whole-system privacy score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope

Before auditing privacy posture, determine:

- Whether the user asked for a whole-system audit or a focused audit
- Which data classes, processors, jurisdictions, or flows are in scope
- Which adjacent systems must be inspected to understand the in-scope flow
- What is explicitly out of scope

If the requested area spans multiple layers, follow the full path from collection to deletion rather than auditing one layer in isolation.

### Phase 1: Understand the System

Before auditing data practices, establish context:

- What the product does and who uses it
- What user data the product likely needs to function (legitimate data requirements)
- What jurisdictions the product likely serves (language files, currency handling, cookie domains, deployment config, user location fields)
- What third-party services are integrated (SDKs, APIs, embedded widgets)
- What privacy promises are made (privacy policies, consent dialogs, terms of service referenced in code)
- Whether the product handles especially sensitive data (health, financial, children's data, biometric)

### Phase 2: Scan for Evidence

Walk the codebase systematically looking for:

- Every point where user data enters the system (forms, APIs, imports, OAuth)
- Every point where user data leaves the system (API calls, analytics, logging, exports, third-party SDKs)
- Every place where user data is stored (databases, caches, local storage, cookies, session stores, files)
- Every place where user data appears in logs, error messages, or monitoring
- Every consent mechanism and what it gates
- Every third-party script, SDK, or service that touches user data
- Every retention or deletion mechanism (or absence thereof)
- Configuration and secrets handling patterns

### Phase 3: Validate Before Accusing

For each potential finding, ask:

- Is this actually PII or sensitive data, or am I being overly broad?
- Is there a legitimate business reason for this data handling?
- Does the consent mechanism actually cover this data use?
- Could there be a server-side control I cannot see from this codebase alone?
- Is the regulation I am citing actually applicable to this product?
- Is there enough evidence to present to a privacy engineer or DPO?

### Phase 4: Synthesize

- Group findings into systemic themes (e.g., "logging hygiene is a systemic problem" rather than listing every log statement separately)
- Identify which regulations likely apply and why
- Map the complete data flow from collection to deletion (or lack thereof)
- Build the PII inventory from evidence
- Catalog every third-party data recipient
- Separate quick wins from structural privacy debt
- Cross-reference findings across categories to surface root causes
- Keep conclusions scoped to the reviewed area unless the evidence truly supports a wider system claim

---

## Analysis Categories

Analyze the codebase through each category independently. A single code problem may appear under multiple categories if it has cross-cutting impact — that's expected and useful. Use cross-references when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. PII Collection & Storage

What personal data is collected and how responsibly is it stored?

- **Data inventory**: Identify every piece of personally identifiable information the system collects — names, emails, phone numbers, addresses, IP addresses, device IDs, payment data, government IDs, biometric data, location data, behavioral data
- **Data minimization**: Is the system collecting only what it needs? Look for fields collected but never used, overly broad data models, "just in case" data collection
- **Encryption at rest**: How is sensitive data stored? Plaintext passwords, unencrypted PII in databases, sensitive data in unencrypted file stores
- **Sensitive data in plaintext**: Credit card numbers, SSNs, health data, or other highly sensitive fields stored without field-level encryption or tokenization
- **PII in URLs and query parameters**: User identifiers, emails, or other PII passed as URL parameters where they appear in browser history, server logs, and referrer headers
- **PII in client-side storage**: Personal data in localStorage, sessionStorage, or non-httpOnly cookies where it is accessible to any script on the page
- **Schema signals**: Database schemas, ORM models, or type definitions that reveal the shape and sensitivity of stored data
- **Default values and seed data**: Test data, seed scripts, or fixtures containing real or realistic PII

**Evidence bar**: Show the specific data fields, where they are collected (form fields, API endpoints, OAuth scopes), where they are stored (database columns, cache keys, cookie names), and whether appropriate protections exist. For minimization issues, show the field being collected and the absence of any code that uses it.

---

### 2. Data Flow & Transmission

How does user data move between client, server, and third parties?

- **HTTPS enforcement**: Is TLS enforced for all data transmission? Look for hardcoded HTTP URLs, missing HSTS headers, mixed content signals
- **Sensitive data in request/response bodies**: API responses returning more user data than the client needs (over-fetching), full user objects sent when only a name was required
- **Sensitive data in headers**: Authorization tokens, user IDs, or PII in custom headers that may be logged by proxies or CDNs
- **Data sent to analytics without consent**: User data included in analytics payloads, tracking events fired with PII attached, user IDs sent to third-party analytics
- **Cross-origin data exposure**: CORS configuration that allows broad access to user data endpoints, credentials included in cross-origin requests unnecessarily
- **WebSocket and real-time data**: PII transmitted over WebSocket connections, real-time feeds containing more user data than necessary
- **File upload handling**: User-uploaded content stored without sanitization, EXIF data preserved in uploaded images, file metadata containing PII
- **API response filtering**: Whether API responses are filtered based on the requesting user's permissions or whether all data is returned and filtered client-side

**Evidence bar**: Trace the data flow from the point of collection to every destination. Show the API endpoint, the request/response shape, and what data travels where. For over-fetching, show the full response versus what the client actually uses.

---

### 3. Logging & Observability Hygiene

What user data appears in logs, error reports, and monitoring systems?

- **PII in log statements**: User emails, names, IPs, or other identifiers logged in application logs. Search for log/console/logger calls that interpolate user objects or PII fields
- **Sensitive data in error messages**: Stack traces or error responses that include user data, database query content, or request bodies with PII
- **Credentials in debug output**: API keys, tokens, passwords, or secrets logged during debugging or error handling
- **Over-logging user data**: Logging entire request bodies, full user objects, or complete database records when only an ID was needed
- **Log level discipline**: Sensitive data logged at INFO or lower levels that will appear in production, versus DEBUG-only logging that is acceptably verbose
- **Error reporting services**: What data is sent to Sentry, Bugsnag, Datadog, or similar services — do they receive user PII alongside error reports?
- **Audit trail vs. surveillance**: Is user activity logging proportionate and purposeful, or does it cross into surveillance territory?

**Evidence bar**: Show the specific log statement, what data it captures, and where that log likely ends up (console, file, third-party service). For error reporting, show the error handler configuration and what user context is attached.

---

### 4. Consent & Transparency

Does the app ask before collecting, and can users actually control their data?

- **Cookie consent implementation**: Is there a consent banner? Does it actually block cookies/tracking before consent is given, or is it cosmetic?
- **Consent timing**: Are tracking scripts, analytics, and cookies loaded BEFORE consent is obtained? Check script loading order and consent gate implementation
- **Consent granularity**: Is it all-or-nothing ("Accept All"), or can users choose categories (analytics, marketing, functional)? Does the implementation actually respect category choices?
- **Consent withdrawal**: Can users withdraw consent after giving it? Is there a mechanism to revoke, and does it actually stop data collection?
- **Consent storage and persistence**: How and where consent preferences are stored, whether they survive across sessions, whether they are transmitted to the server
- **Privacy policy references**: Does the code reference a privacy policy? Are consent dialogs linked to the policy? Do the data practices match what the policy likely promises?
- **Transparency signals**: Can users see what data has been collected about them? Is there a data export or account data view?
- **Dark patterns**: Consent UIs that make "Accept" visually dominant, pre-checked boxes, confusing language, or "reject" options hidden behind extra clicks

**Evidence bar**: Show the consent implementation code — the banner component, the consent state management, and crucially, the conditional logic that gates tracking/analytics on consent. Show whether scripts load before or after consent. For granularity, show the consent options presented and whether the backend/frontend actually branches on individual categories.

---

### 5. Analytics & Tracking Inventory

Every piece of code that observes, measures, or reports on user behavior.

- **Analytics SDKs**: Google Analytics, Mixpanel, Amplitude, Segment, Heap, PostHog, Plausible, and similar. What version, what configuration, what data is sent
- **Tracking pixels**: Facebook Pixel, LinkedIn Insight, Twitter/X pixel, Google Ads conversion tracking, and similar marketing pixels
- **Session recording**: Hotjar, FullStory, LogRocket, Microsoft Clarity, or similar session replay tools. What data do they capture?
- **A/B testing tools**: Optimizely, LaunchDarkly, Split, or similar. What user data is sent to variant assignment?
- **Custom event tracking**: Application-specific tracking events — what user actions are tracked, what data is attached to each event
- **Fingerprinting signals**: Canvas fingerprinting, WebGL fingerprinting, font enumeration, or other browser fingerprinting techniques
- **Documentation**: Is the tracking inventory documented anywhere? Does the team know what data each service collects?
- **Consent gating**: Which of these services are loaded conditionally on consent, and which fire unconditionally?

**Evidence bar**: For each tracking service found, show: the script/SDK inclusion, the initialization code, example event calls with the data payload, and whether it is gated on consent. Produce a complete inventory table.

---

### 6. Data Retention & Deletion

Can user data actually be removed, and is there evidence that it ever is?

- **Retention policies**: Any evidence of data retention limits — TTLs on database records, expiration on cached data, archival processes, scheduled cleanup jobs
- **Soft-delete vs. hard-delete**: Does deleting a user account or record actually remove the data, or does it set a `deleted_at` flag while preserving everything?
- **Right to be forgotten**: Can a user's data actually be fully purged from the system? Is there a deletion endpoint, script, or process?
- **Cascading deletion completeness**: When a user is deleted, are all associated records (posts, comments, uploads, analytics events, audit logs) also removed?
- **Data lingering in backups/logs/caches**: Even if primary data is deleted, does it persist in database backups, log files, CDN caches, search indexes, or message queues?
- **Account deletion UX**: Is account deletion accessible to users, or does it require contacting support? Is the process clearly communicated?
- **Temporary data cleanup**: Upload temp files, session data, password reset tokens, email verification tokens — are these cleaned up after use?

**Evidence bar**: Show the deletion mechanism (or absence of one). Trace what happens when a user is deleted — which tables/collections are affected, which are not. For retention, show TTL configurations, cron jobs, or cleanup scripts. For lingering data, show where deleted user data might persist.

---

### 7. Third-Party Data Sharing

What user data leaves the system boundary, and to whom?

- **API integrations sending user data**: External API calls that include user PII in request bodies, headers, or query parameters
- **Webhook payloads**: Outbound webhooks that contain user data — what data, to what destination, with what authentication
- **Embedded third-party widgets**: Chat widgets, support tools, payment forms, social embeds, or maps that can read page content or user data
- **CDN and asset hosting**: User-uploaded content served through third-party CDNs — what metadata is accessible, what headers are sent
- **Email and notification services**: SendGrid, Mailgun, Twilio, or similar — what user data is transmitted for communications
- **Payment processors**: Stripe, PayPal, Braintree — what user data beyond payment data is shared
- **Social login providers**: OAuth integrations — what scopes are requested, what profile data is retrieved and stored
- **Data processing documentation**: Are third-party data recipients documented? Are there data processing agreements referenced in the code or config?

**Evidence bar**: For each external service that receives user data, show: the API call or SDK usage, the data payload, and what PII is included. Produce an inventory of every third-party data recipient.

---

### 8. Session & Authentication Data

How is identity and session state managed from a privacy perspective?

- **Token storage location**: Are auth tokens in httpOnly secure cookies (good), localStorage (accessible to XSS), or sessionStorage? Are refresh tokens properly protected?
- **Session expiration**: Do sessions expire? What are the timeout values? Are there idle timeouts?
- **Token refresh security**: How are tokens refreshed? Is the refresh token rotated? Can old refresh tokens be reused?
- **Remember-me implementation**: How does "remember me" work? What is stored, for how long, and where?
- **Session data contents**: What user data is stored in the session object? Is it minimal (user ID + role) or does it contain full PII?
- **Logout completeness**: Does logout invalidate the token server-side, or does it only clear the client-side token? Can a copied token be used after logout?
- **Multi-device session awareness**: Can users see and revoke active sessions on other devices?
- **Authentication event logging**: Are login attempts, password changes, and session events logged? Is the logging proportionate?

**Evidence bar**: Show the token storage code, session configuration, and logout implementation. For session contents, show what data is serialized into the session or token payload. For expiration, show the TTL configuration.

---

### 9. Regulatory Signal Compliance

What regulations likely apply, and is there evidence of compliance?

- **Jurisdiction signals**: User location handling, language/locale support, currency handling, cookie domains, deployment regions, terms of service references — use these to infer which regulations likely apply
- **GDPR signals**: If EU users are likely — evidence of right to access (data export), right to erasure (deletion), right to portability (data download), consent records (consent log), data processing documentation, lawful basis references
- **CCPA/CPRA signals**: If California users are likely — do-not-sell mechanism, opt-out of data sharing, privacy rights request handling, notice at collection
- **COPPA signals**: If children might use the product — age verification, parental consent mechanisms, data collection limits for minors
- **HIPAA signals**: If health data is involved — encryption requirements, access controls, audit logging, BAA references
- **PCI DSS signals**: If payment card data is handled — tokenization, encryption, scope minimization, SAQ or compliance references
- **Data processing agreements**: References to DPAs, sub-processor lists, or data protection impact assessments in code, config, or documentation
- **Cookie classification**: Are cookies classified as strictly necessary, functional, analytics, or marketing? Does the classification match actual behavior?

**Evidence bar**: First establish which regulations likely apply based on code signals. Then evaluate compliance signals for each applicable regulation. Do NOT audit against regulations that clearly do not apply. Show the code signals that indicate applicability (e.g., "the app has `locale: 'de-DE'` support and a `.eu` cookie domain, indicating EU users are served"). Then show compliance evidence or gaps.

---

### 10. Environment & Configuration Safety

Are secrets, keys, and privacy-relevant configuration handled safely?

- **Secrets in source code**: API keys, database passwords, JWT secrets, encryption keys, or service account credentials committed to the repository
- **API keys in client bundles**: Server-side API keys exposed in frontend JavaScript bundles, environment variables prefixed with `NEXT_PUBLIC_` or `REACT_APP_` that should be server-only
- **Environment variable handling**: Is there a `.env.example` documenting required variables? Are sensitive variables clearly separated from non-sensitive ones?
- **.env files in version control**: `.env` files committed to the repository, or `.gitignore` patterns that do not cover all environment file variants
- **Default credentials**: Default passwords, API keys, or tokens in configuration that are meant to be changed but may not be
- **Environment parity**: Configuration that differs between environments in ways that affect privacy — debug logging enabled by default, analytics in development sending to production, consent bypassed in staging
- **Feature flags affecting privacy**: Feature flags that control data collection, tracking, or consent behavior — are they documented and properly managed?

**Evidence bar**: Show the specific secret, key, or configuration value and where it appears. For client-side exposure, show the bundling configuration that makes server-side values accessible to the browser. For .env issues, show the .gitignore rules and what they miss.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much are the people whose data this is, the business, or the law being hurt right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a sound consent model with two live PII leaks. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Privacy-by-design, comprehensive consent, minimal data collection, clear data lifecycle |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Solid data handling with some gaps in documentation, retention, or consent coverage |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Functional privacy controls but inconsistent implementation, missing coverage in some areas |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Significant gaps in data handling, consent, or retention; privacy is an afterthought |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Active data exposure, no consent gates, PII leaking into logs/URLs/third-parties |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is user-facing (people's data exposed, kept or shared without a lawful basis, or consent ignored) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
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
| PII Collection & Storage | 15% |
| Data Flow & Transmission | 14% |
| Consent & Transparency | 13% |
| Logging & Observability Hygiene | 10% |
| Analytics & Tracking Inventory | 10% |
| Data Retention & Deletion | 10% |
| Third-Party Data Sharing | 8% |
| Session & Authentication Data | 7% |
| Regulatory Signal Compliance | 7% |
| Environment & Configuration Safety | 6% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
PII Collection & Storage        7.8 | ████████████████░░░░
Data Flow & Transmission        6.9 | ██████████████░░░░░░
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
**Data Affected**: [What specific user data is at risk — emails, names, tokens, etc.]
**Location**: [File paths and line numbers]

**Evidence**:
[Code snippets, data flow traces, configuration values, or log output samples
that PROVE this is a real issue. This is the most important section.]

**Impact**:
[What happens to the user's data as a result. Be specific — "user emails are
sent to [third-party service] without consent" or "full user objects including
password hashes appear in application logs."]

**Regulatory Relevance**:
[Which regulation(s) this finding touches, if any, and why. If no regulation
applies, state the privacy principle violated.]

**Recommendation**:
[Concrete, actionable fix. Not "consider improving" — instead, "redact the
`email` and `name` fields from the Sentry context in `src/lib/error-handler.ts:34`
by replacing `setUser(user)` with `setUser({ id: user.id })`."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# Data & Privacy Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a non-technical stakeholder.
What user data does this product handle? How responsibly does it handle it?
What is the biggest privacy risk? What should leadership understand about
the product's data practices?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually reviewed, which data
flows/processors/stores were inspected deeply vs broadly, what was explicitly
out of scope, and what could not be verified from this codebase alone.]

## 3. Applicable Regulatory Landscape
[Based on code signals, which regulations likely apply and why. List the
evidence that indicates each regulation's applicability. Do NOT assume
regulations apply without evidence. State clearly which regulations were
evaluated and which were deemed not applicable.]

## 4. Data Flow Map
[Trace how user data enters the system, moves through it, and leaves it.
Show:
- Entry points (forms, APIs, OAuth, imports)
- Internal movement (client → server → database → cache)
- Exit points (analytics, logging, third-party APIs, exports)
- Storage locations (databases, caches, cookies, localStorage, files)
Use a text diagram or structured list. This section is the foundation
for understanding everything else.]

## 5. PII Inventory
[Table of every PII field found in the codebase:

| PII Field | Collected Where | Stored Where | Logged? | Transmitted To | Encrypted? | Retention |
|-----------|----------------|--------------|---------|----------------|------------|-----------|

Be thorough. Include fields found in database schemas, form definitions,
API types, and configuration.]

## 6. Tracking & Analytics Inventory
[Every third-party service that touches user data:

| Service | Type | Data Collected | Consent Gated? | Documentation |
|---------|------|---------------|----------------|---------------|

Include analytics, tracking pixels, session recording, A/B testing,
error reporting, and any other observability service.]

## 7. Consent Coverage Matrix
[Which data collection points have consent gates and which do not:

| Data Collection Point | Consent Required? | Consent Implemented? | Granularity | Withdrawal? |
|-----------------------|-------------------|---------------------|-------------|-------------|

Show whether consent is actually enforced or merely decorative.]

## 8. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality.]

## 9. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows.]

## 10. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 11. Data Retention Assessment
[Dedicated section for what data is kept, for how long, and what deletion
capabilities exist. Include:
- Evidence of retention policies (or their absence)
- Deletion mechanism analysis (what gets deleted, what lingers)
- Backup and cache retention concerns]

## 12. Third-Party Data Sharing Assessment
[Dedicated section mapping every external service that receives user data,
what data it receives, and under what legal basis or consent.]

## 13. Prioritized Action Plan
[Top 10 actions ordered by (privacy risk × effort efficiency). For each:
- What to do (one sentence)
- Why it matters for user privacy (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 14. Strengths & Bright Spots
[Mandatory. What the codebase does well for privacy. Good patterns,
thoughtful consent implementation, proper data minimization, clean
separation of concerns around sensitive data.]

## 15. What Was Not Flagged
[Issues considered but rejected for insufficient evidence.
Transparency about what you chose not to report and why.
Include areas where server-side controls may exist but could
not be verified from the codebase alone.]

## 16. Appendix: Evidence Notes
[Supporting data, file lists, metric summaries, complete inventories.]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of data & privacy health.]
```

For focused audits, keep the scope visible near the top of the report and mark unrelated sections or categories as `N/A` rather than pretending they were evaluated.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report issues you cannot point to in the actual code
- ❌ Assume every app must comply with GDPR, CCPA, HIPAA, etc. — determine applicability from evidence
- ❌ Conflate security vulnerabilities (XSS, SQL injection) with privacy issues — focus on authorized data handling, not unauthorized access
- ❌ Flag every use of analytics as a privacy violation — contextual, consented analytics is fine
- ❌ Produce generic compliance checklists without connecting them to actual code findings
- ❌ Pad the report with low-value findings to appear thorough
- ❌ Let a narrow focus prompt silently expand into a fake whole-system privacy audit
- ❌ Score a category as low without multiple proven findings to justify it
- ❌ Assume the absence of a visible control means the control does not exist — it may be server-side, in a different repo, or handled by infrastructure
- ❌ Present "this lacks evidence of compliance" as "this is non-compliant" — they are different claims
- ❌ Treat all PII as equally sensitive — an email address and a Social Security number require very different handling

DO:
- ✅ Quantify everything you can (PII field counts, number of third-party data recipients, log statements containing PII, unencrypted sensitive fields)
- ✅ Show your work — the reader should be able to verify every finding independently
- ✅ Consider the product's stage, audience, and data sensitivity when calibrating severity
- ✅ Distinguish between "this is wrong" and "this will become wrong at scale"
- ✅ Distinguish between "non-compliant," "lacks evidence of compliance," and "privacy risk regardless of regulation"
- ✅ Cross-reference findings across categories to identify systemic patterns
- ✅ Call out when something is handled well — silence on a category implies you didn't check it
- ✅ Build the PII inventory and data flow map before making judgments — understand the data before auditing the handling
- ✅ Think like a privacy-conscious user AND a data protection auditor
- ✅ Prefer actionable insight over generic compliance advice
- ✅ If the repository is large, state what was examined deeply vs broadly
- ✅ State the requested focus area, included data flows, excluded flows, and unverifiable controls plainly
- ✅ If evidence is insufficient, say so plainly — "could not determine from this codebase alone" is a valid and honest conclusion
