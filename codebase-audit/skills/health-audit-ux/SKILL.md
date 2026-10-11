---
name: health-audit-ux
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed UX health audit that scores design-system adherence, visual consistency, interaction quality, accessibility, responsive behavior, content clarity, and perceived polish; produces a scorecard with separate engineering and live-harm grades, a bar chart, and prioritized action plan, and only flags issues it can prove from code and, when possible, rendered behavior.
---

# UX Health Audit Skill

Use this skill when the user wants a deep audit of a codebase's user experience quality, visual consistency, design-system adherence, interaction patterns, accessibility, responsive behavior, content clarity, or overall polish. It can review the whole product or a user-specified flow, page cluster, role-specific surface, or feature area. This is NOT a code quality or architecture audit. `/health-audit` does that. This skill is about what users see, feel, understand, and can successfully do.

## Mission

Perform a rigorous, evidence-backed UX health audit from the user's perspective: visual consistency, design token usage, typography, color, spacing, interaction feedback, content clarity, accessibility, responsive design, navigation, form UX, and perceived performance.

Calibrate the review to the actual product:
- What kind of product is this?
- Who uses it?
- Which workflows matter most?
- Is it a prototype, an internal tool, or a production-facing product?
- Are you reviewing end-user UX, admin/operator UX, or both?

Do not produce vague "UX best practices" fluff. Do not invent problems. Do not flag patterns that match the project's own baseline just because you would have designed them differently. Every finding must be defensible from the code and, when possible, from the rendered UI.

### Focus Prompt Support

This skill can take an optional prompt that describes the UX area to focus on.

Examples:
- "Focus on onboarding"
- "Review the settings pages"
- "Audit the admin dashboard UX"
- "Look at the checkout flow on mobile"
- "Review search, empty states, and filtering"

When a focus prompt is provided:
- Treat it as the primary UX surface in scope
- Resolve it into concrete pages, layouts, shared components, routes, and interactive flows
- Inspect adjacent shared primitives only when they materially affect the requested surface
- Keep findings, scores, and recommendations scoped to that area instead of implying a whole-product audit
- State assumptions, included screens, excluded screens, and checked breakpoints plainly

If the prompt is ambiguous, infer the most likely scope from route names, component names, and navigation structure, then state the assumption rather than silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists
2. **The specific code and/or rendered behavior** that demonstrates the issue
3. **A clear articulation of user-facing harm** and **which users are affected**
4. **At least one corroborating signal** that confirms this is not a flimsy opinion

Corroborating signals can include:
- A second instance elsewhere in the codebase
- A mismatch against an explicit design guideline or token definition
- Rendered confirmation at a relevant breakpoint or interaction state
- A primary-flow location that makes the issue unavoidably visible to users

If you cannot satisfy all four criteria, the finding may still be reported, but its confidence tier must drop accordingly. Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### The Visual Confirmation Rule

If you have access to a running app, Storybook, screenshots, or browser automation, use it to confirm visible issues at relevant breakpoints and interaction states.

- Use rendered confirmation to strengthen or weaken confidence.
- If a claim is inherently visual and you cannot render it, do not overstate certainty.
- Do not present grep-only or AST-only evidence as a definitive visual bug unless the rendered result is obvious from the code.

### The Scope & Calibration Rule

Before auditing, determine:
- Product type and audience
- Primary user journeys
- Whether the surface is end-user, admin, operator, or mixed
- Product maturity and quality bar
- Audit scope: full product, feature area, or page/component slice

Severity is not absolute. The same flaw may be Low in an internal prototype, Medium in an admin tool, and High in a polished customer-facing product.

For large repositories, do **not** pretend you exhaustively verified everything. Inspect:
- Every critical or frequently used flow in scope
- A representative sample of secondary surfaces
- The shared primitives/layouts that drive repeated UX patterns

State clearly what was inspected deeply, what was sampled, and what could not be verified.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All evidence criteria met. A skeptical designer or frontend lead would agree this is a real UX issue. |
| **Probable** | Strong signals, but missing one criterion or lacking rendered confirmation. |
| **Observation** | Worth noting, but not strong enough to call a problem with confidence. |
| **Question** | Something that looks off and needs domain context, design review, or user testing to validate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Users are blocked, misled, or immediately lose trust | Primary flows that look broken, accessibility barriers preventing task completion, blank or unusable states on important journeys, destructive/confusing UX on high-risk actions |
| 🟠 **High** | Users will probably notice and the product feels meaningfully rougher | Repeated inconsistencies on prominent surfaces, missing states on common flows, responsive breakage on common devices, copy or navigation that causes real confusion |
| 🟡 **Medium** | Noticeable quality issue with contained blast radius | Token drift, spacing/typography inconsistency, weak secondary-state handling, avoidable friction in non-primary flows |
| 🔵 **Low** | Legitimate refinement opportunity | Small polish issues, minor alignment/copy improvements, subtle consistency cleanups |

### Scoring Discipline

Do **not** force a score for a category you did not meaningfully inspect.

- If a category is out of scope, mark it `N/A`.
- If a category was only partially inspected, say so in the justification.
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights.

A precise partial audit is better than a fake full-product score.

---

## Required Workflow

### Phase 0: Understand the Product and Scope

Before judging the UX, establish context:

- What the user explicitly asked you to focus on
- What the product appears to do
- Who the likely users are
- Which journeys seem business-critical or high-frequency
- Whether there are separate end-user and admin/operator experiences
- What level of polish is appropriate for the product's maturity
- What exact surface is in scope for this audit

If the scope is narrow, do not smuggle in product-wide conclusions unless the evidence really supports them.

### Phase 1: Establish the Visual Truth

Before auditing anything, you MUST understand what "correct" looks like for this project. Without a baseline, every finding is just taste.

#### 1a: Find Explicit Design Guidelines

Search for design documentation, brand guides, style guides, UX specs, and intentional design decisions:

- Brand guidelines, style guides, design-system docs
- Design token definitions
- Component documentation, pattern libraries, Storybook
- UX specs, wireframes, or planning docs in markdown
- Figma/design links referenced in docs
- Tone and voice guides, content guidelines
- Accessibility requirements or WCAG targets

Read what you find. Extract the authoritative values or rules for colors, typography, spacing, component behavior, interaction patterns, and tone.

#### 1b: Map the Design System Implementation

Identify:
- Component library in use (shadcn, Radix, MUI, Chakra, Mantine, Headless UI, etc.)
- Styling approach (Tailwind, CSS Modules, styled-components, Emotion, vanilla CSS, etc.)
- Theme/token files (`tailwind.config`, CSS variables, theme objects, token files)
- Global styles and resets
- Shared UI primitives and layout components

Read the token/theme source files carefully. These are usually the closest thing to a source of truth in the implementation.

#### 1c: Check Rendered Reality When Possible

If the UI can be rendered, inspect representative screens at the breakpoints and states that matter:

- Mobile, tablet, desktop, and any layout-specific breakpoints the app uses
- Loading, error, empty, success, hover, focus, active, and disabled states
- Navigation transitions, dialogs, dropdowns, and forms

Rendered behavior is especially important for:
- Layout breakage
- Contrast and readability
- Focus visibility
- Content truncation
- Visual hierarchy
- Motion and perceived performance

#### 1d: Infer Implicit Patterns from the Code

Read 3-5 finished-looking pages or components and the shared primitives they depend on to establish the implicit visual vocabulary:

- Which spacing values are most common?
- Which color tokens or utilities dominate?
- How are loading, error, and empty states handled?
- What do cards, buttons, forms, dialogs, and tables look like?
- What layout patterns recur (max-widths, grids, sidebars, page headers)?

#### 1e: Build the UX Baseline

Compile a structured baseline separating:
- **Explicit guidelines**: written, authoritative rules
- **Implemented system rules**: token/theme definitions and shared UI primitives
- **Inferred patterns**: the dominant approach visible in finished code
- **Uncertain areas**: places where the project has no clear baseline

If guidelines and implementation conflict, do not blindly assume the docs are correct. Ask:
- Do the docs appear current?
- Is the code clearly newer or more intentionally adopted?
- Is the mismatch widespread or isolated?

If you cannot prove which source is authoritative, downgrade confidence and frame the conflict as a Question or Probable finding.

### Phase 2: Build the Evidence Inventory

Walk through every user-facing page, component, and layout in scope. For each, catalog:

1. Design tokens and hardcoded values for color, spacing, typography, borders, radius, and shadow
2. Interactive-state coverage: loading, error, empty, success, hover, focus, active, disabled
3. Content and microcopy quality
4. Responsive behavior across breakpoints
5. Accessibility semantics and labeling
6. Navigation, wayfinding, and form handling
7. Perceived performance and visual stability signals

Prefer inventories and counts over scattered anecdotes:
- Token/hardcoded-value counts
- Page-by-page state coverage
- Repeated copy/terminology differences
- Repeated layout variants
- Repeated responsive breakages

### Phase 3: Validate Before Accusing

For each potential finding, ask:
- Would a real user notice this and care?
- Is this actually inconsistent with the baseline, or just a legitimate variant?
- Is it a one-off blemish, a systemic pattern, or a root-cause issue in shared primitives?
- Is the severity appropriate for this product type and user group?
- Could there be a valid rationale I am missing?
- Do I have enough evidence to defend this in front of the team?

### Phase 4: Synthesize

- Group findings into systemic themes
- Separate root causes from repeated symptoms
- Distinguish end-user UX issues from admin/operator UX issues
- Separate quick wins from structural design debt
- Cross-reference findings across categories to surface root causes
- Call out strengths and explicitly note what was examined but not flagged

---

## Analysis Categories

Analyze the codebase through each category independently. A single issue may appear under multiple categories if it has cross-cutting impact, but avoid padding the report by cloning the same finding everywhere. Use cross-references when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. Design Token Adherence & Style Consistency

This is the foundation. A design system only works if the code actually uses it.

- **Hardcoded color values**: Hex codes, `rgb()`, `hsl()`, or named colors used instead of tokens, CSS variables, or sanctioned utilities
- **Hardcoded spacing values**: Pixel/rem literals used instead of the spacing scale
- **Hardcoded typography values**: Raw font sizes, weights, or line heights that bypass the type scale
- **Hardcoded border/radius/shadow values**: Values that bypass token definitions
- **Inline styles or ad hoc overrides**: Style objects or one-off overrides that bypass the project's styling approach without a clear reason
- **Magic numbers**: Unexplained widths, heights, z-indexes, offsets, and breakpoints
- **Token misuse**: Using the wrong semantic token or utility for the job
- **Orphaned custom values**: Tokens or CSS variables defined but barely used, suggesting drift between the system and the implementation

**Evidence bar**: Show the hardcoded value, the file and line, and the token or shared pattern that should have been used. Quantify where possible. If the project has no token system, report that as a systemic finding rather than turning every literal value into a separate complaint.

---

### 2. Visual Consistency Across Views

The product should look like one system, not several stitched together.

- **Card styles**: Border radius, shadow, padding, border treatment
- **Button variants**: Primary, secondary, ghost, destructive, link
- **Form field styles**: Inputs, selects, textareas, toggles, checkboxes
- **Table styles**: Header treatment, density, row spacing, borders, alignment
- **Dialog styles**: Overlay treatment, padding, radius, close affordances, animation
- **List and grid patterns**: Gap, density, alignment, item chrome
- **Heading hierarchy**: Equivalent page and section headings using equivalent styles
- **Iconography**: Icon family, stroke/weight, size, alignment, color treatment
- **Page chrome**: Max-width, header structure, page padding, footer treatment

**Evidence bar**: Show two or more equivalent surfaces side by side with the actual differing values or classes. Explain which one aligns with the baseline and which diverges.

---

### 3. Typography & Readability

How text looks and reads across the product.

- **Type-scale consistency**: Headings, labels, body, captions drawn from a coherent scale
- **Font-weight usage**: Regular, medium, semibold, bold used consistently for the same jobs
- **Line height and letter spacing**: Consistency and readability of text rhythm
- **Text truncation**: Graceful handling of long content without hiding critical information
- **Font loading and fallback behavior**: Only flag if code or rendered evidence supports the problem
- **Readability**: Line length, text contrast, paragraph structure, density
- **Responsive typography**: Text remaining readable across viewports

**Evidence bar**: Show the actual text styles in use with file locations. For inconsistencies, show the competing values. For readability issues, measure line length or contrast where practical.

---

### 4. Color System & Contrast

- **Semantic color usage**: Success, warning, error, info, neutral, destructive used consistently
- **Background hierarchy**: Page, card, elevated, overlay, and selected-state hierarchy
- **Text contrast**: Actual text-on-background contrast in context
- **Interactive contrast**: Buttons, links, inputs, chips, and focus indicators across states
- **Color-only meaning**: Status or errors conveyed through color alone
- **Dark mode consistency**: If supported, parity and correctness of the dark palette
- **Opacity and alpha usage**: Consistent disabled, muted, overlay, and backdrop values

**Evidence bar**: Show the resolved colors in context. For contrast issues, give the ratio. For dark-mode issues, show the light-only value or missing dark variant that causes the break.

---

### 5. Spacing & Layout Coherence

- **Spacing-scale compliance**: Padding, margin, and gap values drawn from the scale
- **Consistency for equivalent elements**: Cards, sections, panels, lists, and forms using comparable spacing
- **Layout-pattern consistency**: Content max-widths, grid structure, sidebar widths, page shells
- **Responsive layout behavior**: Layouts collapsing or reflowing at the right breakpoints
- **Alignment**: Labels, actions, card headers, table columns, icon-text pairs
- **Whitespace balance**: Productive density versus cramped or empty layouts
- **Overflow handling**: Long content, wide tables, long URLs, unbreakable strings

**Evidence bar**: Show the specific spacing values and the layout classes/CSS responsible. Reference the spacing scale or shared layout primitives as the baseline.

---

### 6. Interaction Feedback & State Coverage

Every user action should have visible feedback. Every async operation should show a state.

- **Loading states**: What the user sees while waiting
- **Error states**: Meaningful, actionable feedback when things fail
- **Empty states**: Helpful next-step guidance instead of blank space
- **Success feedback**: Clear confirmation after mutations and saves
- **Button states**: Loading, disabled, duplicate-submit prevention
- **Hover and focus states**: Visible and consistent interactive affordances
- **Disabled states**: Clear styling and, when needed, explanation
- **Destructive-action confirmation**: Delete/remove/irreversible flows handled safely
- **Optimistic updates**: Graceful rollback when the optimistic path fails

**Evidence bar**: Trace the interaction path. Show the component, the async operation or event handler, and what the user sees or does not see during each state.

---

### 7. Content & Microcopy Quality

The words in the UI are part of the experience.

- **Action labels**: Buttons and links that accurately describe the outcome
- **Error messages**: Specific, actionable, user-readable errors
- **Terminology consistency**: The same concept named the same way everywhere
- **Placeholder versus label confusion**: Placeholders used as labels or instructions
- **Help text**: Complex inputs supported with clear contextual guidance
- **Tone consistency**: Formality, warmth, precision, and directness staying coherent
- **Leftover development text**: Test strings, TODOs, debug output, internal jargon
- **Truncation and overflow text**: Truncated copy still remaining understandable and accessible

**Evidence bar**: Quote the actual UI strings from the code. For inconsistencies, show the competing terms in different locations. For weak errors, show the message the user actually receives.

---

### 8. Accessibility & Inclusive Design

Not "does it pass an automated checker" - does it actually work for people using assistive technologies?

- **Keyboard navigation**: Reachability, operability, focus order, escape behavior
- **Focus indicators**: Visible focus treatment on every focusable element
- **Screen-reader labels**: Meaningful accessible names for controls, fields, images
- **Semantic HTML**: Correct use of headings, lists, buttons, links, landmarks
- **Form accessibility**: Labels, descriptions, required-state communication, field-error association
- **ARIA usage**: Correct use of roles, labels, live regions, and relationships
- **Color independence**: Meaning not conveyed by color alone
- **Touch targets**: Adequate hit areas on mobile
- **Motion sensitivity**: Respect for `prefers-reduced-motion` and avoidance of harmful motion

**Evidence bar**: Show the exact element or markup, what is missing or wrong, and what correct behavior would look like. For keyboard issues, describe the tab path or trap.

---

### 9. Responsive Design & Viewport Adaptation

How the product adapts across devices and window sizes.

- **Breakpoint coverage**: Mobile, tablet, desktop, and any custom breakpoints
- **Content reflow**: Multi-column layouts stacking sensibly
- **Navigation adaptation**: Mobile navigation remaining usable
- **Touch-friendly sizing**: Control size and tap spacing
- **Image and media responsiveness**: Scaling, cropping, aspect-ratio handling
- **Text adaptation**: Readable sizing and line length on all viewports
- **Horizontal scrolling**: Unwanted overflow and fixed-width breakage
- **Print styles**: If relevant to the product, whether pages print sanely

**Evidence bar**: Identify the specific breakpoints or viewport widths where issues occur and show the classes/CSS causing the problem.

---

### 10. Navigation & Information Architecture

Can users find what they need and understand where they are?

- **Wayfinding**: Page titles, active nav state, breadcrumbs, section labels
- **Navigation consistency**: Stable navigation structure across similar surfaces
- **Deep linking**: Pages working correctly when loaded directly
- **Back-button behavior**: Client-side routing preserving expected history
- **Route and page transitions**: Feedback during long navigations
- **Dead ends**: Pages with no clear onward action or return path
- **Menu and dropdown behavior**: Closing, positioning, keyboard support
- **Link integrity**: Broken routes, placeholders, dead links

**Evidence bar**: Trace the route or link logic and show where the user can get lost, stuck, or misled.

---

### 11. Form UX & Input Handling

Forms are where users do real work. Bad form UX burns trust quickly.

- **Validation timing**: Blur, change, submit, and whether the timing is humane
- **Error display**: Inline, specific, persistent, and field-associated
- **Field grouping**: Related inputs grouped sensibly
- **Input types**: Email/tel/url/number/date/etc. chosen appropriately
- **Auto-focus and error focus**: Focus management on load and after failed submission
- **Submission behavior**: Loading, disabling, Enter-key behavior, duplicate prevention
- **Data persistence**: Draft preservation, unsaved-changes protection, recovery
- **Multi-step forms**: Progress, back navigation, step-local validation
- **Reset and cancel behavior**: Safe discard flows and warnings where needed

**Evidence bar**: Show the form component, validation logic, error display implementation, and submission handler. Tie the code to the user-visible result.

---

### 12. Perceived Performance & Visual Stability

Not raw benchmark performance - what the user perceives about speed and stability.

- **Layout shift**: Elements jumping as content or fonts load
- **Skeletons and placeholders**: Stable loading versus blank or jarring loading
- **Time to interactive**: Content appearing before it is actually usable
- **Progressive disclosure**: Important content showing up early instead of waiting for everything
- **Transition smoothness**: Dialogs, accordions, route transitions, drawers
- **Render-blocking behavior**: Synchronous work that visibly freezes the UI
- **Perceived responsiveness**: Immediate visual acknowledgement after click/tap/type
- **Stale-data indicators**: If the product uses caching/offline patterns, whether staleness is communicated

**Evidence bar**: Show the component or page, the render/loading path, and describe what the user experiences. For layout shift, identify what moves and what triggers it.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much are users being blocked, misled or shut out right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a consistent design system with four live broken flows. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Polished, consistent, trustworthy |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Mostly solid, some noticeable rough edges |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Functional, but inconsistent or under-polished |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Frequent friction, weak consistency, missing important states |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Visibly broken, inaccessible, or hard to trust |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is user-facing (people cannot finish a task, are misled, or are shut out today) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
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

Use these weights for full-product audits. If categories are `N/A`, renormalize across the categories that were actually scored.

| Category | Weight |
|----------|--------|
| Design Token Adherence & Style Consistency | 10% |
| Visual Consistency Across Views | 12% |
| Typography & Readability | 8% |
| Color System & Contrast | 8% |
| Spacing & Layout Coherence | 10% |
| Interaction Feedback & State Coverage | 14% |
| Content & Microcopy Quality | 6% |
| Accessibility & Inclusive Design | 12% |
| Responsive Design & Viewport Adaptation | 8% |
| Navigation & Information Architecture | 4% |
| Form UX & Input Handling | 5% |
| Perceived Performance & Visual Stability | 3% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
Design Token Adherence       7.8 | ████████████████░░░░
Visual Consistency           6.9 | ██████████████░░░░░░
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
**Affected Users**: [End users / admins / operators / all users / specific cohort]
**Location**: [File paths and line numbers]

**Evidence**:
[Code snippets, resolved classes/tokens, rendered observations, side-by-side
comparisons, or state traces that prove the issue. Include the corroborating
signal here.]

**User Impact**:
[What users see, feel, misunderstand, or are blocked by. Be concrete.]

**Ideal Behavior**:
[What good looks like in this product, using the established baseline.]

**Recommendation**:
[Concrete, actionable fix. Not "consider improving" - instead, "replace
`color: #6b7280` with `text-muted-foreground` to match the token system used
in the rest of the product."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# UX Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a product owner, designer, or
engineering lead. How does the product feel to use? Where does it feel strong,
and where does it feel rough? What is the biggest UX risk?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually in scope, what was
inspected deeply vs broadly, whether rendered UI was available, which
breakpoints/states were checked, what was explicitly out of scope, and what
could not be verified.]

## 3. UX Baseline
[Summary of explicit guidelines, token/theme sources, component library, and
dominant implemented patterns. Separate explicit rules from inferred patterns.]

## 4. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality. Mark out-of-scope categories as N/A.]

## 5. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 6. Findings by Category
[Grouped by category, then by severity within each category (Critical -> Low).
Use the finding template above.]

## 7. Token & Hardcoded Value Audit
[Required when design-system drift or token bypass is part of the story.
Quantify counts, worst offenders, and the ratio of tokenized versus ad hoc
styling where possible.]

## 8. State Coverage Matrix
[If the scope includes multiple pages or flows, show whether each handles:
loading, error, empty, success, hover, focus, and disabled states.
Use: ✅ = handled, ⚠️ = partial, ❌ = missing, - = not applicable.]

## 9. Accessibility Summary
[Keyboard navigation status, screen-reader readiness, contrast compliance,
semantic HTML usage, and notable gaps. Quantify where possible.]

## 10. Responsive Behavior Summary
[Which pages/components were checked, at which breakpoints, and what breaks.]

## 11. Prioritized Action Plan
[Top actions ordered by user impact and effort efficiency. For each:
- What to do
- Why it matters to users
- Which findings it addresses
- Estimated effort band]

## 12. Strengths & Bright Spots
[Mandatory. Evidence-backed examples of where the product is genuinely
thoughtful, consistent, accessible, or polished.]

## 13. What Was Not Flagged
[Issues considered but rejected for insufficient evidence, uncertain baseline,
or lack of meaningful user impact.]

## 14. Appendix: Evidence Notes
[Supporting data, file lists, hardcoded-value inventories, contrast notes,
page lists, or state inventories.]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of UX health]
```

For narrow audits, you may collapse or omit sections that are genuinely `N/A`, but say so explicitly instead of silently pretending they were covered.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report issues you cannot point to in the actual code or rendered output
- ❌ Treat this as a redesign exercise - you are auditing, not art-directing
- ❌ Flag patterns that match the project's own baseline as "wrong" because you prefer something else
- ❌ Assume written docs are always correct if they may be stale or superseded
- ❌ Present grep-only evidence as a verified visual bug
- ❌ Double-count one root cause as many separate findings without cross-referencing it
- ❌ Pad the report with low-value polish notes to appear thorough
- ❌ Score categories you did not inspect
- ❌ Let a narrow focus prompt silently turn into a product-wide UX report
- ❌ Ignore the product's stage, audience, and workflow criticality
- ❌ Flag every accessibility nit as Critical - prioritize by actual user impact
- ❌ Drift into architecture, security, or code-health review - that is `/health-audit`

Do:
- ✅ Quantify everything you can: hardcoded-value counts, state-coverage gaps, pages affected, contrast ratios, breakpoint failures
- ✅ Show your work so the reader can independently verify every finding
- ✅ Calibrate severity to the actual product and the users affected
- ✅ Distinguish between systemic design-system issues and local one-off blemishes
- ✅ Separate end-user UX from admin/operator UX when severity differs
- ✅ Use rendered confirmation when available, and say plainly when it was not
- ✅ Cross-reference findings to expose root causes instead of producing a flat list of symptoms
- ✅ Call out polished, thoughtful patterns with the same evidence standard you use for problems
- ✅ State what was examined deeply versus broadly when the repository is large
- ✅ State the requested focus area, included surfaces, excluded surfaces, and checked breakpoints plainly
- ✅ If evidence is insufficient, say so plainly and downgrade confidence
- ✅ Treat shared token/theme files and established primitives as strong evidence, but not infallible truth when they conflict with clearly newer implementation
