---
name: health-audit-seo
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed SEO & web presence health audit that scores meta tags, social sharing, structured data, crawlability, Core Web Vitals signals, image optimization, URL architecture, performance, accessibility-as-SEO, and internationalization; produces a scorecard with separate engineering and live-harm grades, a bar chart, and prioritized action plan, and only flags issues it can prove from code.
---

# SEO & Web Presence Health Audit Skill

Use this skill when the user wants a deep audit of a web application's discoverability, search engine optimization, social sharing quality, structured data, crawlability, Core Web Vitals signals, or overall public-facing technical foundation. The skill may audit the whole public surface or focus on a user-specified route family, content type, metadata concern, crawlability issue, or sharing surface. This is NOT a code quality or architecture audit — `/health-audit` does that. This is NOT a UX polish audit — `/health-audit-ux` does that. This skill is about how search engines see the site, how social platforms render shared links, and whether the technical SEO foundation is solid.

## Mission

Perform a rigorous, evidence-backed SEO and web presence audit from two perspectives: how Googlebot (and other crawlers) experience the site, and how a person sees a link shared on social media. Evaluate the technical foundation that determines discoverability: meta tags, structured data, crawlability, rendering strategy, Core Web Vitals signals, image optimization, URL architecture, resource loading, accessibility signals that affect SEO, and internationalization.

This audit only applies to web applications with public-facing pages. If the project is an internal tool, API-only service, native mobile app, or has no publicly accessible HTML pages, say so and skip the audit.

Do not guess at search rankings, traffic numbers, keyword competitiveness, or SERP position. Do not produce vague "SEO best practices" fluff. Do not invent problems. Audit the technical foundation only — the things visible in the source code that directly affect how crawlers index, how social platforms render, and how real users experience page load.

### Focus Prompt Support

This skill can take an optional prompt that describes the SEO/web-presence area to focus on.

Examples:
- "Focus on Open Graph tags"
- "Review crawlability for docs pages"
- "Audit blog post metadata and structured data"
- "Look at product pages on mobile performance"
- "Review internationalization and canonicals"

When a focus prompt is provided:
- Treat it as the primary surface in scope
- Resolve it into concrete routes, templates, head-management code, structured-data emitters, and rendering paths
- Audit out-of-scope pages only when they are required to explain an in-scope systemic issue
- Keep findings, scores, and recommendations scoped to that area instead of implying a site-wide SEO audit
- State assumptions, included routes, excluded routes, and checked rendering states plainly

If the prompt is ambiguous, infer the most likely scope from route structure, metadata code, content directories, and sitemap/robots configuration, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths and line numbers** where the problem exists
2. **The specific code, markup, or configuration** that demonstrates the issue (include snippets)
3. **A clear articulation of real-world harm** — how this affects crawlability, indexing, social sharing, or page performance for real users
4. **A second instance or a corroborating signal** (a reproduction, a failing test, a call path traced end to end) that confirms the problem is real. A one-off defect qualifies once you have reproduced or traced it; it does not need a twin

Corroborating signals can include:
- The same issue on multiple pages or routes
- A missing tag that is present on some pages but absent on others (inconsistency)
- A rendering strategy that makes content invisible to crawlers (confirmed by code path)
- A resource loading pattern that appears across multiple pages

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier (see below). Speculation, hypotheticals, and "this could potentially affect rankings..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical senior frontend engineer or SEO specialist would say "yeah, that's a real problem." |
| **Probable** | Strong signals but missing one criterion (e.g., not reproduced or traced end to end, or harm is inferred from industry consensus rather than proven in this codebase). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call a problem. |
| **Question** | Something that looks off but needs production testing, Google Search Console data, or domain context to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Pages are invisible or actively harmful to discoverability | Entire site or critical pages blocked from indexing, `noindex` on pages that should be indexed, broken canonical URLs causing duplicate content, missing or empty title tags on primary pages, SPA with no SSR/SSG rendering content invisible to crawlers |
| 🟠 **High** | Significant SEO value left on the table or social sharing is broken | Missing or incorrect Open Graph tags on key pages, no structured data where it would earn rich results, duplicate titles/descriptions across many pages, render-blocking resources severely impacting Core Web Vitals, missing sitemap for a content-heavy site |
| 🟡 **Medium** | Meaningful but contained issues | Suboptimal meta tag lengths, missing alt text on non-critical images, inconsistent URL patterns, partial structured data implementation, unoptimized images without next-gen formats |
| 🔵 **Low** | Improvement opportunities | Minor resource hint optimizations, cosmetic URL improvements, additional structured data types, font loading refinements |

### Scoring Discipline

Do **not** force a site-wide SEO score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Determine Applicability

Before anything else, answer:
- What the user explicitly asked you to focus on, if anything
- Does this project serve public-facing HTML pages?
- Is it an SPA, SSR, SSG, or hybrid?
- Are there content pages that should be indexed (blog, products, docs, landing pages)?
- Is this a marketing site, web app, documentation site, e-commerce site, or something else?

If the project has no public-facing pages, state this clearly and skip the audit.

### Phase 1: Understand the Rendering Strategy

This is the most consequential decision for SEO. Identify:
- **Framework**: Next.js, Nuxt, Gatsby, Remix, Astro, SvelteKit, plain React SPA, Vue SPA, Angular, etc.
- **Rendering mode**: SSR, SSG, ISR, CSR-only, hybrid (per-route)
- **Per-route rendering**: Which pages are server-rendered vs. client-only?
- **Head management**: How are meta tags set? (`next/head`, `react-helmet`, `@nuxtjs/seo`, `useHead`, manual `<head>`, etc.)
- **Routing**: File-based, config-based, or programmatic? Dynamic routes?

The rendering strategy determines the severity of nearly every other finding. A missing meta tag on an SSG page is fixable; a missing meta tag on a CSR-only SPA means crawlers may never see it at all.

### Phase 2: Scan for Evidence

Systematically examine:
- Every page/route and its meta tag configuration
- Head management patterns and dynamic tag generation
- Open Graph and social sharing implementation
- Structured data (JSON-LD, microdata, RDFa)
- robots.txt and sitemap configuration
- Image handling and optimization pipeline
- Resource loading patterns (preload, prefetch, code splitting)
- URL structure and routing patterns
- Accessibility patterns that affect SEO (headings, alt text, semantic HTML, lang attribute)
- Internationalization implementation if present

### Phase 3: Validate Before Accusing

For each potential finding, ask:
- Is this real? Can I see it in the code?
- Does the rendering strategy make this visible or invisible to crawlers?
- Is this a single page issue or a systemic pattern?
- Does this materially affect discoverability or social sharing?
- Could there be a legitimate reason (e.g., intentionally noindexed staging pages)?
- Is there enough evidence to present?

### Phase 4: Synthesize

- Group issues into systemic themes (e.g., "head management is entirely absent" vs. "three pages missing descriptions")
- Identify root causes — a missing head management library causes dozens of symptoms
- Separate quick wins from structural problems
- Cross-reference findings across categories to surface the highest-impact improvements
- Distinguish between "invisible to crawlers" and "suboptimal for crawlers"
- Keep conclusions scoped to the reviewed routes or SEO surface unless the evidence truly supports a wider site claim

---

## Analysis Categories

Analyze the codebase through each category independently. A single code problem may appear under multiple categories if it has cross-cutting impact — that's expected and useful. Use cross-references when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. Meta Tags & Head Management

The foundation of how search engines understand each page. Every public page needs correct, unique, dynamic meta tags.

- **Title tags**: Present on every page, unique per page, descriptive of page content, proper length (50-60 characters), not truncated or generic ("Home | Site Name" on every page)
- **Meta descriptions**: Present and unique per page, proper length (150-160 characters), compelling and accurate, not duplicated across pages
- **Canonical URLs**: Present on every page, pointing to the correct canonical version, handling trailing slashes consistently, handling query parameters correctly
- **Viewport meta**: Present and correctly configured (`width=device-width, initial-scale=1`)
- **Charset declaration**: Present early in `<head>` (`<meta charset="utf-8">`)
- **Robots meta**: Appropriate `noindex`/`nofollow` directives — nothing accidentally blocked, staging/dev pages excluded from indexing
- **Head management approach**: How dynamic are the meta tags? Are they hardcoded, template-driven, or dynamically generated per page? Is the head management library configured correctly for the rendering strategy?
- **Favicon and touch icons**: Present and properly linked (`favicon.ico`, `apple-touch-icon`, manifest icons)

**Evidence bar**: For each route or page template, show the actual meta tag output (or absence). For dynamic pages, trace the code path that generates the tags. Show side-by-side comparisons of pages with identical or missing titles/descriptions. Quantify: how many pages have unique titles vs. duplicates vs. missing.

---

### 2. Open Graph & Social Sharing

When someone shares a link on Twitter, LinkedIn, Slack, Discord, or iMessage, what do they see? Bad social previews kill click-through rates.

- **og:title**: Present, meaningful, not identical to `<title>` if a shorter/punchier version is appropriate
- **og:description**: Present, compelling, appropriate length
- **og:image**: Present, correct dimensions (1200x630 recommended for most platforms), high quality, not a tiny favicon or broken URL
- **og:url**: Present, pointing to the canonical URL
- **og:type**: Present and correct (`website`, `article`, `product`, etc.)
- **Twitter card tags**: `twitter:card` (summary, summary_large_image), `twitter:title`, `twitter:description`, `twitter:image` — or relying on OG fallback correctly
- **Dynamic OG images**: For content-heavy sites (blogs, docs, products), are OG images generated dynamically per page, or is every page sharing the same generic image?
- **Social preview quality**: Would a human looking at the shared link preview want to click it?

**Evidence bar**: Show the actual OG tags rendered for key pages. For missing tags, show the code that renders the `<head>` and demonstrate the absence. For image issues, show the image URL/path and any dimension/format concerns. Test multiple page types — home, content pages, dynamic pages.

---

### 3. Structured Data / JSON-LD

Structured data earns rich results in search (breadcrumbs, FAQ dropdowns, star ratings, product prices, article dates). Missing structured data means missing SERP real estate.

- **Schema.org presence**: Is any structured data implemented? JSON-LD (preferred), microdata, or RDFa?
- **Organization/WebSite schema**: Basic identity markup on the homepage
- **Breadcrumb schema**: Navigation breadcrumbs marked up for search display
- **Article schema**: For blog/content sites — headline, author, datePublished, dateModified, image
- **Product schema**: For e-commerce — name, price, availability, reviews, images
- **FAQ schema**: For pages with FAQ content
- **Local business schema**: For businesses with physical locations
- **Appropriate schema for site type**: Not every schema type applies — evaluate what's appropriate and what's missing for THIS specific site

**Evidence bar**: Show the actual JSON-LD blocks (or absence thereof) in the rendered output. For dynamic pages, trace how structured data is generated. Compare against Google's recommended properties for each schema type. Note which schema types are appropriate for this site but missing entirely.

---

### 4. Crawlability & Indexing

Can search engines actually find, crawl, and index the content?

- **robots.txt**: Present, correctly configured, not accidentally blocking important paths, allowing crawlers access to CSS/JS needed for rendering
- **XML sitemap**: Present, auto-generated, complete (includes all indexable pages), excludes non-indexable pages, submitted or discoverable via robots.txt
- **noindex/nofollow usage**: Intentional and correct — not accidentally applied to pages that should be indexed
- **JavaScript rendering**: Is content available in the initial HTML response, or does it require JavaScript execution? Crawlers can execute JS, but it's slower and less reliable
- **SSR/SSG for critical pages**: Are the most important pages (homepage, landing pages, product pages, blog posts) server-rendered or statically generated?
- **Internal linking**: Are important pages reachable through internal links, or are they orphaned?
- **URL structure clarity**: Clean, descriptive, human-readable URLs without unnecessary parameters or hash fragments
- **Crawl budget considerations**: For large sites, are low-value pages (filters, sorts, pagination variants) handled to avoid wasting crawl budget?

**Evidence bar**: Show the robots.txt content, sitemap configuration, and rendering output for key pages. For JavaScript-dependent content, show what the initial HTML response contains vs. what appears after JS execution. Trace the route configuration to identify orphaned or unlinked pages.

---

### 5. Core Web Vitals Signals

Code-level signals that would likely affect LCP, CLS, and INP. These are code-based predictions, not field measurements — but the patterns are well-established.

- **LCP signals**: Hero image optimization (format, size, loading priority), font loading strategy (blocking vs. swap), render-blocking CSS/JS in the critical path, server response time signals (heavy server-side computation before first byte)
- **CLS signals**: Images and media without explicit `width`/`height` attributes, dynamically injected content above the fold (ads, banners, cookie notices), font swap causing text reflow, late-loading components that push content down
- **INP signals**: Heavy event handlers on interactive elements, long-running synchronous JavaScript on user interaction, main-thread-blocking operations triggered by clicks/taps/keystrokes, unoptimized re-renders on input
- **FID/TTI signals**: Large JavaScript bundles blocking main thread on load, synchronous third-party scripts, heavy initialization logic running before the page is interactive

**Evidence bar**: Show the specific code patterns (image tags without dimensions, render-blocking scripts, heavy event handlers) with file paths and line numbers. Explain which Core Web Vital is likely affected and why. Do not claim specific CWV scores — describe the code-level risk signals.

---

### 6. Image & Media Optimization

Images are typically the largest assets on a page and the primary driver of LCP.

- **Next-gen formats**: WebP or AVIF usage vs. JPEG/PNG only. Is the framework's image optimization pipeline being used (e.g., `next/image`, Nuxt Image)?
- **Responsive images**: `srcset` and `sizes` attributes for serving appropriately sized images across devices
- **Lazy loading**: Images below the fold using `loading="lazy"`, above-the-fold images NOT lazy loaded (they should load eagerly or be preloaded)
- **Dimension attributes**: `width` and `height` attributes present on `<img>` tags to prevent CLS
- **Alt text quality**: Descriptive, meaningful alt text on content images; decorative images properly marked (`alt=""` or `role="presentation"`)
- **Image compression signals**: Unoptimized source images served directly, missing image optimization pipeline, oversized images for their display context
- **Video and embed optimization**: Lazy loading of iframes/embeds, facade patterns for heavy third-party embeds (YouTube, maps)

**Evidence bar**: Show specific image tags with missing attributes, wrong formats, or missing optimization. Quantify: how many images lack alt text, how many lack dimensions, how many are served without optimization. Show the image component or pipeline configuration (or absence thereof).

---

### 7. URL Architecture

Clean, meaningful URLs are a ranking signal and improve user experience.

- **Clean URL structure**: Descriptive slugs, no unnecessary IDs or parameters in the URL path, human-readable
- **Consistent patterns**: Uniform URL patterns across similar content types (`/blog/[slug]` not sometimes `/blog/[slug]` and sometimes `/posts/[id]`)
- **Trailing slash consistency**: Either always or never, enforced consistently across the site, with redirects for the wrong variant
- **URL parameter handling**: Search/filter parameters handled correctly — either canonical tags pointing to the unparameterized version or proper pagination
- **Pagination strategy**: `rel="next"`/`rel="prev"` for paginated content, or infinite scroll with proper URL updates, or view-all pages
- **Redirect chains**: Multiple sequential redirects that slow crawling and dilute link equity
- **404 page quality**: Custom 404 page that helps users (and crawlers) find the right content, returns a proper 404 status code (not a soft 404)
- **Dynamic route coverage**: All dynamic route patterns generating valid, crawlable URLs

**Evidence bar**: Show the routing configuration, URL generation logic, and actual URL patterns. For inconsistencies, show competing patterns side by side. For redirect issues, trace the redirect chain. Check that the 404 page returns the correct status code.

---

### 8. Performance & Loading

Resource loading strategy directly affects both Core Web Vitals and crawl efficiency.

- **Resource hints**: `<link rel="preload">` for critical assets (fonts, hero images, above-the-fold CSS), `<link rel="preconnect">` for third-party origins, `<link rel="dns-prefetch">` for secondary third-party origins
- **Render-blocking resources**: CSS and JavaScript in `<head>` without `async` or `defer` that block first paint
- **Code splitting**: Route-based code splitting to avoid loading unnecessary JavaScript, dynamic imports for heavy components
- **Bundle size signals**: Large vendor bundles, unshaken tree imports, inclusion of unnecessary polyfills or libraries
- **Font loading strategy**: `font-display: swap` or `optional` to prevent invisible text, font preloading for critical fonts, subsetting for large font files
- **Above-the-fold optimization**: Critical CSS inlined or prioritized, hero images preloaded, non-critical resources deferred
- **Compression**: Gzip or Brotli compression configured for text assets (HTML, CSS, JS, JSON, SVG)
- **Third-party script impact**: Analytics, chat widgets, A/B testing scripts loaded in a way that doesn't block rendering

**Evidence bar**: Show the actual `<head>` content and resource loading order. Identify render-blocking resources by file path. Show font loading configuration. For bundle size, reference the build configuration or output. Quantify the number of render-blocking resources.

---

### 9. Accessibility as SEO

Accessibility and SEO share significant overlap. Search engines rely on the same semantic signals that assistive technologies use.

- **Heading hierarchy**: Single `<h1>` per page, logical heading order (no skipping levels), headings that describe page structure — search engines use heading hierarchy to understand content organization
- **Link text quality**: Descriptive anchor text (not "click here", "read more", "learn more" without context) — link text is a strong relevance signal for the linked page
- **Image alt text**: Descriptive alt text on content images helps search engines understand image content and drives image search traffic
- **Language attribute**: `<html lang="...">` set correctly — tells search engines the primary language of the page
- **Semantic HTML**: Proper use of `<nav>`, `<main>`, `<article>`, `<section>`, `<header>`, `<footer>`, `<aside>` — helps crawlers understand page structure
- **Anchor link integrity**: Internal links using proper `<a href>` tags (not `<div onClick>` navigation) so crawlers can follow them

**Evidence bar**: Show specific heading hierarchies, link text examples, and semantic markup usage. For heading issues, show the actual heading structure of key pages. For link text, show the worst offenders. Quantify: how many images lack alt text, how many links use generic text.

---

### 10. Internationalization & Localization

For sites serving multiple languages or regions. If the site is single-language/single-region, score this N/A.

- **hreflang implementation**: Correct `<link rel="alternate" hreflang="...">` tags pointing between language/region variants, self-referencing hreflang on each page
- **URL strategy for locales**: Consistent approach — subdirectories (`/en/`, `/fr/`), subdomains (`en.example.com`), or separate domains — not a mix
- **Language detection**: Appropriate handling of user language preferences without cloaking (showing different content to crawlers than users)
- **Translated content signals**: Are meta tags, OG tags, and structured data translated, or only body content?
- **Default language fallback**: Clear `x-default` hreflang for the default/fallback version
- **Region-specific content**: Appropriate handling of region-specific content (currency, addresses, phone formats) without creating duplicate content

**Evidence bar**: Show the hreflang tags on key pages, URL patterns for different locales, and language detection logic. For missing translations, show meta tags that are in the wrong language for their locale. Quantify: how many locale variants exist and how completely they are implemented.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How much search and sharing visibility is being lost right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a sound rendering strategy with four live indexing gaps. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Comprehensive, correct, well-implemented |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Mostly solid, some gaps or inconsistencies |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Basics present but incomplete or inconsistent |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Significant gaps, many pages missing critical elements |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Fundamentally broken, major content invisible to crawlers |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is visibility-facing (pages search engines or social previews cannot read correctly today) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and engineering-drag findings do not count here.
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

Use these weights for full-site audits. If categories are `N/A` (e.g., Internationalization on a single-language site), renormalize across the categories that were actually scored.

| Category | Weight |
|----------|--------|
| Meta Tags & Head Management | 15% |
| Open Graph & Social Sharing | 8% |
| Structured Data / JSON-LD | 8% |
| Crawlability & Indexing | 15% |
| Core Web Vitals Signals | 15% |
| Image & Media Optimization | 10% |
| URL Architecture | 7% |
| Performance & Loading | 10% |
| Accessibility as SEO | 7% |
| Internationalization & Localization | 5% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
Meta Tags & Head Management    7.8 | ████████████████░░░░
Open Graph & Social Sharing    6.9 | ██████████████░░░░░░
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
**Harm**: [Visibility: live | reachable today | not yet reachable] or [Engineering drag]
**Pattern**: [Name of the root-cause pattern this instance belongs to, if any]
**Location**: [File paths and line numbers]

**Evidence**:
[Code snippets, rendered markup, tag comparisons, or configuration data
that PROVE this is a real issue. This is the most important section.
Show the actual tags, the actual markup, the actual configuration.]

**Impact**:
[How this affects crawlability, indexing, social sharing, or user
experience. Be specific — "Googlebot sees..." or "when shared on
Twitter, users see..." or "this page will not appear in search because..."]

**Recommendation**:
[Concrete, actionable fix. Not "consider adding meta tags" — instead,
"add a dynamic `<title>` tag in `app/blog/[slug]/page.tsx` using the
post title: `<title>{post.title} | Site Name</title>`"]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# SEO & Web Presence Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a product owner or
marketing lead. How discoverable is this site? How does it look when
shared on social media? What is the biggest risk to search visibility?
What is the rendering strategy and does it support SEO?]

## 2. Scope & Method
[What the user asked you to focus on, what routes/templates were actually
reviewed, whether rendered output was inspected, which route families were
explicitly out of scope, and what could not be verified.]

## 3. Rendering Strategy Assessment
[Critical context for everything that follows. What framework is used,
what rendering mode (SSR/SSG/CSR/hybrid), how meta tags are managed,
and what this means for crawlability. This shapes the severity of
every other finding.]

## 4. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality. Mark out-of-scope
categories as N/A.]

## 5. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 6. Findings by Category
[Grouped by category, then by severity within each category
(Critical → Low). Use the finding template above.]

## 7. Page-by-Page Meta Audit
[Table showing every route/page template and its meta tag status:

| Route | Title | Description | Canonical | OG Tags | Structured Data |
|-------|-------|-------------|-----------|---------|-----------------|
| `/` | ✅ unique | ✅ unique | ✅ | ⚠️ missing og:image | ❌ none |
| `/blog/[slug]` | ✅ dynamic | ❌ missing | ✅ | ✅ complete | ✅ Article |

Use: ✅ = correct, ⚠️ = partial/issues, ❌ = missing, - = not applicable]

## 8. Core Web Vitals Risk Assessment
[Code-level signals that would likely affect LCP, CLS, and INP.
Organized by vital, with specific code references. Do not claim
specific scores — describe risk signals from the code.]

## 9. Structured Data Inventory
[What schema markup exists, what's missing for this site type, and
what rich results the site is eligible for but not earning.]

## 10. Resource Loading Analysis
[Render-blocking resources, unoptimized assets, missing resource hints,
font loading strategy, and third-party script impact. Show the actual
loading order and identify bottlenecks.]

## 11. Prioritized Action Plan
[Top 10 actions ordered by (SEO impact × effort efficiency). For each:
- What to do (one sentence)
- Why it matters for discoverability (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)]

## 12. Strengths & Bright Spots
[Mandatory. What the site does well from an SEO perspective. Good
patterns, thoughtful meta tag management, solid rendering strategy,
well-implemented structured data, excellent image optimization.]

## 13. What Was Not Flagged
[Issues considered but rejected for insufficient evidence.
Transparency about what you chose not to report and why.]

## 14. Appendix: Evidence Notes
[Supporting data, file lists, tag inventories, route lists,
resource loading summaries]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of SEO health]
```

For narrow audits (e.g., "just check our OG tags"), you may collapse or omit sections that are genuinely `N/A`, but say so explicitly instead of silently pretending they were covered.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report issues you cannot point to in the actual code or configuration
- ❌ Guess at search rankings, traffic, keyword performance, or SERP positions — audit the technical foundation only
- ❌ Treat this as a content strategy or keyword research exercise — you are auditing technical SEO, not content quality
- ❌ Flag patterns that are appropriate for the site's type and scale (a 5-page marketing site does not need the same sitemap strategy as a 50,000-page e-commerce site)
- ❌ Claim specific Core Web Vitals scores from code analysis alone — describe the risk signals
- ❌ Pad the report with low-value findings to appear thorough
- ❌ Score categories you did not inspect
- ❌ Let a narrow focus prompt silently turn into a site-wide SEO report
- ❌ Ignore the rendering strategy when assessing severity — a missing meta tag on an SSR page is very different from one on a CSR-only SPA
- ❌ Double-count one root cause (e.g., no head management library) as dozens of separate findings without cross-referencing
- ❌ Drift into architecture, security, or UX polish review — those are `/health-audit` and `/health-audit-ux`
- ❌ Assume every site needs every type of structured data — evaluate what's appropriate for THIS site

Do:
- ✅ Quantify everything you can: pages with missing titles, images without alt text, routes without OG tags, render-blocking resources count
- ✅ Show your work so the reader can independently verify every finding
- ✅ Identify the rendering strategy first — it determines the severity of everything else
- ✅ Think like Googlebot AND like a person seeing a shared link on social media
- ✅ Don't just check if tags exist — check if they're correct, unique per page, and properly dynamic
- ✅ Distinguish between "invisible to crawlers" (critical) and "suboptimal for crawlers" (medium/low)
- ✅ Cross-reference findings to expose root causes — a missing head management library explains dozens of missing tags
- ✅ Call out strong SEO patterns with the same evidence standard you use for problems
- ✅ Consider the site type when evaluating structured data — a blog needs Article schema, an e-commerce site needs Product schema, a docs site may not need either
- ✅ State what was examined deeply versus broadly when the codebase is large
- ✅ State the requested focus area, included routes, excluded routes, and verification limits plainly
- ✅ If evidence is insufficient, say so plainly and downgrade confidence
- ✅ Check that SSR/SSG is actually working — a Next.js project configured for SSR but accidentally client-rendering key pages is a critical finding
