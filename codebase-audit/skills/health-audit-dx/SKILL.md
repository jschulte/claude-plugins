---
name: health-audit-dx
description: Use when the user wants one perspective of a codebase audited in depth. Deep evidence-backed Developer Experience health audit that scores onboarding friction, build performance, test suite health, local dev loop, debugging ergonomics, code navigation, CI/CD experience, dependency management, tooling overhead, contributor documentation, type safety, and error recovery guardrails; produces a scorecard with separate engineering and live-harm grades, a bar chart, and prioritized action plan, and only flags issues it can prove.
---

# Developer Experience Health Audit Skill

Use this skill when the user wants a deep audit of how it feels to work on a project as a developer. The skill may audit the full contributor experience or focus on a user-specified workflow, toolchain, package, CI path, or contributor pain point. This is NOT a code quality audit (`/health-audit` does that) and NOT a UX audit (`/health-audit-ux` does that). This skill is about the *experience of contributing* — from cloning the repo to shipping a change. Every friction point, every paper cut, every "why does this take so long?" moment.

## Mission

Perform a rigorous, evidence-backed developer experience audit from multiple perspectives: the new hire on day one, the senior dev tired of paper cuts, and the team lead evaluating tooling investments. Evaluate onboarding friction, build performance, test suite health, local development loop quality, debugging ergonomics, code navigation, CI/CD pipeline experience, dependency health, tooling overhead, contributor documentation, type safety, and error recovery guardrails.

Calibrate the review to the actual project:
- What kind of project is this? (monorepo, library, application, CLI tool, etc.)
- What language/framework ecosystem?
- How many contributors does this appear to have?
- What stage is this project? (prototype, active development, mature, maintenance mode)
- Is this open source or internal?

Do not produce vague "DX best practices" fluff. Do not invent problems. Do not flag patterns that are simply different from your preference. Every finding must represent measurable friction — quantified in steps, seconds, commands, or cognitive load.

### Focus Prompt Support

This skill can take an optional prompt that describes the developer workflow or DX surface to focus on.

Examples:
- "Focus on onboarding"
- "Review local frontend iteration speed"
- "Audit CI pain in the monorepo"
- "Look at testing ergonomics for backend contributors"
- "Review type generation and build tooling"

When a focus prompt is provided:
- Treat it as the primary audit scope
- Resolve it into concrete workflows, commands, config files, packages, scripts, docs, and CI jobs
- Audit out-of-scope areas only when they are required to explain an in-scope friction point
- Keep findings, scores, and recommendations scoped to that area instead of implying a full-project DX grade
- State assumptions, included workflows, and excluded workflows explicitly in the output

If the prompt is ambiguous, infer the most likely scope from package structure, scripts, docs, and CI configuration, then state the assumption instead of silently widening the audit.

---

## Core Rules

### The Evidence Rule (NON-NEGOTIABLE)

**You must PROVE every finding before reporting it.** For each issue you surface, provide:

1. **Concrete file paths, commands, or configuration** where the problem exists
2. **The specific friction** — what a developer actually experiences (steps counted, time estimated, errors encountered)
3. **A clear articulation of real-world harm** — who is slowed down and by how much
4. **At least one corroborating signal** that confirms this is a pattern, not a one-off

Corroborating signals can include:
- A second instance of the same friction elsewhere in the workflow
- A workaround or TODO comment indicating someone already hit this wall
- Documentation that contradicts actual behavior
- Configuration that exists to paper over a deeper problem
- An issue/PR/comment referencing the friction

If you cannot satisfy all four criteria, the finding may still be reported but must be classified at the appropriate confidence tier. Speculation, hypotheticals, and "this could potentially..." findings are forbidden at the Verified tier.

### Evidence Confidence Tiers

Classify each finding's evidence strength:

| Tier | Definition |
|------|-----------|
| **Verified** | All four evidence criteria met. A skeptical staff engineer would say "yeah, that wastes my time too." |
| **Probable** | Strong signals but missing one criterion (e.g., friction is clear but hard to quantify precisely, or not reproduced or traced end to end). |
| **Observation** | Worth noting — a pattern that warrants attention but lacks sufficient evidence to call it a real drag on productivity. |
| **Question** | Something that looks like friction but needs developer confirmation or project context to evaluate. |

Prefer fewer, stronger findings over a giant pile of noise. Before finalizing, challenge your own findings and remove weak ones.

### Severity Classification

Classify every Verified or Probable finding using this framework:

| Severity | Definition | Criteria |
|----------|-----------|----------|
| 🔴 **Critical** | Developers are blocked or regularly lose significant time | Cannot run the project from README instructions, builds broken on common platforms, tests that can't be run, missing critical setup steps that block all new contributors |
| 🟠 **High** | Measurable daily friction that compounds | Slow builds (>30s incremental), flaky tests that erode trust, dev server that crashes or requires restarts, undocumented steps that block common workflows, CI that takes >15 minutes |
| 🟡 **Medium** | Real friction with workarounds | Confusing error messages, unnecessary configuration complexity, moderate build times, documentation gaps for non-critical workflows, inconsistent tooling patterns |
| 🔵 **Low** | Improvement opportunities that would raise the bar | Minor ergonomic improvements, documentation polish, optional tooling upgrades, small configuration simplifications |

### Scoring Discipline

Do **not** force a full-project DX score for a narrow audit.

- If a category is out of scope, mark it `N/A`
- If a category was only partially inspected, say so in the justification
- Exclude `N/A` categories from the Engineering composite and renormalize the remaining weights

A precise scoped audit is better than a fake global score.

---

## Required Workflow

### Phase 0: Resolve Scope

- Determine whether the user asked for a full DX audit or a focused audit
- Translate any focus prompt into concrete workflows, scripts, packages, docs, and CI jobs
- Identify adjacent tooling that materially affects the in-scope developer journey
- State what is in scope and what is out of scope
- If the requested workflow spans multiple tools, follow the full path instead of reviewing one tool in isolation

### Phase 1: Understand the System

Before judging the DX, establish context:

- What the project does and what ecosystem it lives in
- What language(s), framework(s), and runtime(s) are in use
- How the project is structured (monorepo, multi-package, single app, library)
- What build system, test framework, and dev server are configured
- How many contributors and what the contribution patterns look like
- What the README and contributing docs promise

### Phase 2: Trace the Developer Journey

Walk through the actual developer experience step by step:

1. **Clone to running**: Follow the README literally. Count every step, note every undocumented prerequisite, time every wait.
2. **Make a change**: Find a file, edit it, see the result. How fast is the feedback loop?
3. **Run the tests**: Execute the test suite. How long? How clear are the results? Can you run one test?
4. **Read an error**: Introduce a mistake. Is the error message helpful? Does it point to the problem?
5. **Find something**: Try to locate a specific piece of functionality. How discoverable is the codebase?
6. **Ship a change**: What does the CI pipeline look like? How long? How clear are failures?

### Phase 3: Validate Before Accusing

For each potential finding, ask:
- Does this actually slow developers down, or is it just unfamiliar?
- Is the friction proportional to the project's complexity, or is it avoidable?
- Would the fix introduce more complexity than the friction it removes?
- Is there a legitimate reason this works this way?
- How many developers does this affect, and how often?
- Can I quantify the friction in steps, seconds, or commands?

### Phase 4: Synthesize

- Group issues into systemic themes (e.g., "build tooling is over-engineered" vs. individual config complaints)
- Identify what matters most by frequency and severity
- Separate quick wins from structural problems
- Cross-reference findings across categories to surface root causes
- Distinguish between "friction for new contributors" and "friction for daily contributors"
- Keep conclusions scoped to the reviewed workflow or area unless the evidence truly supports a wider project claim

---

## Analysis Categories

Analyze the project through each category independently. A single problem may appear under multiple categories if it has cross-cutting impact — that's expected. Use cross-references when one root cause drives multiple symptoms. For scoring, each finding is charged to exactly one category: its root-cause category (see Scoring).

---

### 1. Onboarding & First-Run Experience

The most important 30 minutes of a developer's relationship with the project. Clone to running — how hard is it?

- **README accuracy**: Does the README actually work when followed literally? Are steps missing, outdated, or assume knowledge the reader doesn't have? Does it specify the correct runtime/language versions?
- **Prerequisites discovery**: How many tools, runtimes, or services must be installed before the project will run? Are they listed? Are versions specified? Are installation commands provided?
- **Environment configuration**: Are there `.env` files needed? Are example files provided (`.env.example`)? Are required variables documented? What happens if you miss one — helpful error or cryptic crash?
- **First install time**: How long does dependency installation take? Are there postinstall scripts that do surprising things? Does installation require network access to private registries?
- **First build time**: From fresh clone to running dev server or passing build — how long? Are there codegen steps, database migrations, seed data, or asset compilation required?
- **Platform-specific issues**: Does the project work on macOS, Linux, and Windows? Are there platform-specific instructions? Are there known issues documented?
- **Docker/containerization**: If Docker is used, does `docker-compose up` actually work? How long does the initial build take? Is there a non-Docker path documented?
- **Success signal**: After setup, is it clear that the project is running correctly? Is there a smoke test, health check, or obvious "it works" indicator?

**Evidence bar**: Walk through the actual setup process from the README. Count every command, every undocumented step, every prerequisite. Note where you would have been stuck without reading the source code. Show the exact point where documentation diverges from reality.

---

### 2. Build & Compilation

Build speed is developer mood. Fast builds keep developers in flow; slow builds teach developers to check social media.

- **Dev build speed**: Time from save to visible change in development mode. Incremental rebuild time. Cold start time.
- **Production build speed**: Full production build time. Is it parallelized? Are there unnecessary steps?
- **Build error quality**: When a build fails, does the error message point to the problem? Or does it produce pages of webpack/vite/tsc noise that requires archaeology to decode?
- **Build configuration complexity**: How many build configuration files exist? How deeply customized are they? Can a developer understand the build pipeline without being a build-tools expert?
- **Build tool chain depth**: How many transpilers, compilers, bundlers, and processors does a source file pass through? (e.g., TypeScript → Babel → Webpack → PostCSS → ...). Each link is a potential failure point.
- **Build output awareness**: Is the production bundle size tracked? Are there size budgets? Is tree-shaking working? Can developers see the impact of their changes on bundle size?
- **Build caching**: Are build artifacts cached between runs? Is the cache reliable, or does "clean and rebuild" show up in troubleshooting docs?
- **Monorepo build coordination**: If a monorepo, does changing one package trigger rebuilds of only affected packages? Or does everything rebuild?

**Evidence bar**: Identify the build tools and configuration files. Measure or estimate build times from configuration and project size. Show specific error messages that are unhelpful. Count the number of build config files and their line counts. Trace the compilation chain for a single source file.

---

### 3. Test Suite Health

Tests that developers don't trust or don't run are worse than no tests — they consume CI time and give false confidence.

- **Test execution speed**: Total test suite run time. Can it run in under 2 minutes? Under 5? Does it take so long that developers skip running tests locally?
- **Single-test execution**: Can a developer run a single test file or a single test case easily? Is the command obvious and documented? Does it require passing obscure flags?
- **Test output clarity**: When a test fails, does the output clearly show what was expected vs. what happened? Or does it dump a wall of diff noise, serialized objects, or stack traces from test infrastructure?
- **Flaky tests**: Are there tests that pass and fail non-deterministically? Look for retry logic, `.skip`/`.only` annotations, timing-dependent assertions, or comments mentioning flakiness.
- **Test isolation**: Do tests depend on execution order, shared state, or external services? Can tests run in parallel? Do they clean up after themselves?
- **Test data setup complexity**: How much boilerplate is needed to set up test fixtures? Are there factories, builders, or helpers? Or does every test manually construct its world?
- **Mocking complexity**: How difficult is it to mock dependencies? Are mocks brittle? Do they require intimate knowledge of implementation details?
- **Coverage tooling**: Is coverage configured? Does it run automatically? Does it produce useful output or just a number?

**Evidence bar**: Identify the test framework, runner, and configuration. Show the command to run a single test. Look for skip annotations, retry configurations, and flakiness indicators. Count test files and estimate suite run time from configuration. Show examples of unclear test output or complex setup.

---

### 4. Local Development Loop

The inner loop — edit, save, see the result. This is where developers spend most of their time. Every second counts.

- **Hot reload speed and reliability**: Does saving a file produce a visible change in under 1 second? Does hot reload work reliably, or does it occasionally fail silently, requiring a manual refresh or server restart?
- **Dev server startup time**: How long from running the dev command to having a working local environment? Does it need to compile everything first?
- **Dev/prod parity**: How closely does the local development environment match production? Are there behaviors that only appear in production? Are there development-only hacks that mask real issues?
- **Local data seeding**: Is there a way to populate the local environment with realistic test data? Is it documented? Does it work reliably? How long does it take?
- **Offline development capability**: Can a developer work without network access? Are there hard dependencies on external services, APIs, or databases that block local development?
- **Docker-compose complexity**: If Docker is used for local dev, how many services are needed? How much memory/CPU does the full stack consume? Is the docker-compose file maintainable?
- **Process management**: How many terminal windows/processes does a developer need to run the project? Is there a single command that starts everything? Or does it require running the API, frontend, worker, database, and cache separately?
- **File watching reliability**: Does the file watcher correctly pick up all relevant changes? Are there file types or directories that require manual restarts?

**Evidence bar**: Identify the dev server and its configuration. Count the number of processes needed to run locally. Look for restart scripts, workaround documentation, or "if hot reload stops working" troubleshooting steps. Show the dev startup command chain.

---

### 5. Debugging Ergonomics

When something goes wrong, how quickly can a developer understand why?

- **Source map quality**: In development, do errors point to the original source or to compiled/bundled output? Can a developer set a breakpoint in their actual code?
- **Error message helpfulness**: When the application throws an error, does the message explain what went wrong and suggest a fix? Or does it produce a generic "Something went wrong" or an inscrutable error code?
- **Logging usefulness**: Is there meaningful logging during development? Can log levels be adjusted? Is the signal-to-noise ratio reasonable, or do logs flood with framework noise?
- **Debugger attachment**: Can a developer attach a debugger (VS Code, Chrome DevTools, etc.) to the running application? Is the configuration documented or pre-configured (launch.json, etc.)?
- **State inspection**: For stateful applications, can a developer easily inspect current state? Are there dev tools (React DevTools, Redux DevTools, etc.) configured or documented?
- **Stack trace readability**: Do stack traces show relevant application code, or are they dominated by framework internals, node_modules, and async wrappers?
- **Error boundary helpfulness**: When a component or module fails, does the error boundary provide useful information? Or does it swallow context and show a generic fallback?
- **Environment-specific debugging**: Are there dev-only debugging aids (debug panels, query parameter flags, verbose modes) that help during development?

**Evidence bar**: Show specific error messages and evaluate their helpfulness. Check for debugger configuration files. Look for logging configuration and patterns. Show stack trace examples from error handling code and assess readability.

---

### 6. Code Navigation & Discoverability

Can you find what you're looking for? A well-organized codebase reduces the time from "I need to change X" to "I found where X lives."

- **File organization clarity**: Does the folder structure communicate what things are and where to find them? Can a developer guess where a feature lives without searching?
- **Naming convention consistency**: Are files, folders, functions, and variables named consistently? Do naming patterns hold across the codebase, or does every module follow its own convention?
- **Import path complexity**: Are import paths clean and navigable? Are there path aliases configured? Do imports use deeply nested relative paths (`../../../utils/helpers/format`)?
- **Barrel file usage**: Are barrel files (index.ts re-exports) used? Do they help or harm navigation? Do they cause circular dependency issues? Do they defeat tree-shaking?
- **Module boundary clarity**: Is it clear where one module ends and another begins? Are there clear public APIs for modules, or can anything import anything?
- **Type definition discoverability**: Can a developer find the type definition for a data structure quickly? Are types co-located with their usage or scattered across distant files?
- **Search-friendliness**: Are things named in a way that makes them findable via text search? Are there unique, greppable identifiers for important concepts?
- **Colocation patterns**: Are related files (component, test, styles, types, stories) co-located or spread across parallel directory trees?

**Evidence bar**: Show the top-level directory structure. Count import depth for representative files. Identify naming convention inconsistencies with concrete examples. Show barrel file chains if they exist. Map the module structure and identify unclear boundaries.

---

### 7. CI/CD Pipeline Experience

The CI pipeline is part of the developer experience. Slow or flaky pipelines teach developers to merge and pray.

- **Pipeline speed**: Total time from push to green (or red). Which steps take the longest? Are there steps that could run in parallel but don't?
- **Failure message clarity**: When CI fails, does the developer know what broke and where? Or does it require reading through hundreds of lines of log output to find the actual error?
- **Local reproducibility**: Can a developer reproduce CI failures locally? Are there environment differences that cause "works on my machine" problems?
- **Flaky pipeline steps**: Are there CI steps that fail intermittently? Look for retry configurations, re-run buttons being used frequently, or comments about CI flakiness.
- **Pipeline configuration complexity**: How complex is the CI configuration? Can a developer understand and modify it? How many lines of CI config exist?
- **Deployment confidence**: Does the pipeline provide confidence that a merged PR is safe to deploy? Are there staging environments, preview deployments, or canary releases?
- **Rollback capability**: If a deployment goes wrong, how quickly can it be rolled back? Is the process documented?
- **PR feedback quality**: Does CI provide useful feedback on PRs? (lint results, test coverage changes, bundle size changes, preview deployments)

**Evidence bar**: Read the CI configuration files. Identify pipeline steps and their estimated durations. Look for retry configurations and flakiness signals. Check for environment-specific configuration that diverges from local development. Show specific CI config that is overly complex or unclear.

---

### 8. Dependency Management

Dependencies are inherited complexity. Every dependency is code you didn't write, don't fully control, and must maintain compatibility with.

- **Dependency count and depth**: Total direct dependencies. Total transitive dependencies. Are there dependencies that seem unnecessary for the project's scope?
- **Outdated dependencies**: How many dependencies are behind their latest version? How many are more than one major version behind? Are there dependencies pinned to old versions with no explanation?
- **Lockfile health**: Is the lockfile committed? Is it consistent with the manifest? Are there lockfile conflicts that developers deal with regularly?
- **Phantom dependencies**: Are there packages used in code but not declared as dependencies (relying on transitive installation)? These break unpredictably.
- **Peer dependency conflicts**: Are there unresolved peer dependency warnings during installation? Do they cause runtime issues?
- **Upgrade difficulty signals**: Are there dependencies that are difficult to upgrade? Look for pinned versions with comments, `overrides`/`resolutions` in package.json, or post-install patches.
- **Abandoned dependencies**: Are there dependencies that are unmaintained (no releases in 2+ years, archived repos, deprecated notices)?
- **Duplicate dependencies**: Are there multiple versions of the same package in the dependency tree? This inflates bundle size and can cause subtle bugs.

**Evidence bar**: Read package.json/requirements.txt/Cargo.toml and the lockfile. Count dependencies. Identify outdated packages by checking version constraints. Look for override/resolution entries. Check for deprecated or unmaintained packages. Show specific problematic dependencies with evidence.

---

### 9. Tooling & Configuration Overhead

Configuration files accumulate. Each one is a thing developers must understand, maintain, and occasionally debug.

- **Root-level config file count**: How many configuration files live at the project root? List every one and what it configures.
- **Config file complexity**: Are config files simple and well-commented, or are they hundreds of lines of deeply nested options that require documentation to understand?
- **Linter/formatter setup**: Are linters and formatters configured? Do they run automatically (on save, on commit)? Do they conflict with each other? Are there unused or redundant rules?
- **Editor integration**: Does the project work well with common editors? Are there `.vscode` or `.editorconfig` files? Do they actually match the project's formatting rules?
- **Required tooling inventory**: What tools must a developer have installed globally? (Node version manager, package manager, Docker, database CLI, cloud CLI, etc.) Is this list documented?
- **Toolchain version management**: Is there a mechanism for ensuring developers use the correct versions? (`.nvmrc`, `.tool-versions`, `volta` config, `engines` field, etc.)
- **Script ergonomics**: Are package.json scripts (or Makefile targets, etc.) well-named and discoverable? Can a developer find the right command without reading documentation? Is `npm run` output helpful?
- **Config drift**: Do config files contain settings that no longer apply? Dead rules, commented-out sections, or references to removed tools?

**Evidence bar**: List every config file at the project root with its purpose and line count. Identify tools required by configuration but not documented in setup. Show conflicts between config files (e.g., ESLint and Prettier disagreeing). Count total lines of configuration.

---

### 10. Documentation for Contributors

Not user-facing documentation — documentation that helps developers contribute effectively.

- **Architecture overview**: Is there a high-level explanation of how the system is structured? Can a new developer build a mental model without reading every file?
- **Contribution guidelines**: Is there a CONTRIBUTING.md or equivalent? Does it explain the workflow for submitting changes, running tests, and getting reviews?
- **Code commenting quality**: Are complex algorithms, non-obvious business rules, and "why" decisions documented in code comments? (Not "what" comments — those are noise.)
- **API/module documentation**: Are internal APIs and module interfaces documented? Can a developer use a module without reading its implementation?
- **Changelog maintenance**: Is there a changelog? Is it maintained? Does it help developers understand what changed and why?
- **PR template quality**: Is there a PR template? Does it guide developers to provide useful context? Or is it a bureaucratic checkbox exercise?
- **Decision records**: Are architectural decisions recorded? When a developer asks "why is it done this way?", is there an answer somewhere?
- **Troubleshooting guide**: Are common development issues and their solutions documented? Or does every developer rediscover the same workarounds?

**Evidence bar**: Read the README, CONTRIBUTING.md, and any docs/ directory. Evaluate whether the documentation matches the actual codebase. Check for staleness by comparing documented commands/paths against actual files. Look for ADRs or decision documentation. Check PR templates and issue templates.

---

### 11. Type Safety & Editor Support

Types are developer tooling. Good type coverage means better autocomplete, safer refactoring, and fewer "undefined is not a function" surprises.

- **Type strictness configuration**: Is strict mode enabled (TypeScript `strict`, mypy strict, etc.)? Which strict checks are disabled and why?
- **`any` usage prevalence**: How widespread is `any` (or equivalent type escape hatches)? Is it concentrated in specific areas or scattered throughout? Are there `@ts-ignore` / `@ts-expect-error` comments?
- **Type inference quality**: Does the type system provide useful inference, or do developers need to annotate everything manually? Are there areas where inference fails and produces `any` silently?
- **Autocomplete reliability**: Do editor autocomplete suggestions work correctly for the project's patterns? Are there patterns that break IDE intelligence (dynamic property access, complex generics, barrel files)?
- **Go-to-definition accuracy**: Can a developer jump to the definition of a function, type, or component and land in the right place? Or do barrel files, re-exports, or declaration files send them on a chase?
- **Refactoring safety**: Can a developer rename a symbol and trust that all references are updated? Are there stringly-typed patterns, dynamic keys, or convention-based references that rename would miss?
- **Generated types**: Are API response types, database schemas, or GraphQL types generated from a source of truth? Or are they manually maintained and prone to drift?
- **Third-party type quality**: Are there dependencies with missing or poor type definitions? Do `@types/*` packages match the installed library versions?

**Evidence bar**: Check tsconfig.json (or equivalent) for strictness settings. Search for `any` usage and `@ts-ignore` annotations with counts. Look for type generation scripts and their configuration. Identify patterns that break IDE features with concrete examples.

---

### 12. Error Recovery & Guardrails

What prevents developers from making common mistakes, and how hard is it to recover when they do?

- **Pre-commit hooks**: Are there pre-commit hooks that catch issues before they enter the codebase? Do they run quickly enough that developers don't bypass them?
- **Linting as guardrails**: Do lint rules catch actual mistakes (unused variables, missing await, incorrect types) or just enforce style preferences?
- **Migration safety**: For database-backed projects, are migrations safe? Are there protections against data-loss operations? Can a failed migration be rolled back?
- **Dangerous operation protections**: Are there guardrails against common destructive actions? (force-push protection, production environment safeguards, irreversible operation confirmations)
- **Git workflow guardrails**: Are there branch protection rules? Required reviews? CI checks that must pass before merge? Or can anyone push directly to main?
- **Local state recovery**: When local development state gets corrupted (bad migration, stale cache, broken node_modules), how hard is it to get back to a working state? Is there a "nuke and rebuild" command?
- **Secret management**: Are there protections against accidentally committing secrets? (.gitignore patterns, pre-commit secret scanners, example env files)
- **Dependency safety**: Are there automated checks for vulnerable dependencies? Do they run in CI? Do they block merges?

**Evidence bar**: Check for husky/lint-staged/pre-commit configuration. Read .gitignore for coverage. Check for branch protection signals in CI config. Look for "reset" or "clean" scripts. Identify migration files and their rollback capability. Show specific guardrails that are present or notably absent.

---

## Scoring

The report carries **two grades** and never blends them into one number:

| Grade | Question it answers | Driven by |
|---|---|---|
| **Engineering** | How well is this built? Would a strong team be glad to own it? | The category scorecard: positive mechanisms and root-cause patterns |
| **Live harm** | How often are developers blocked or misled right now? | Verified Critical/High findings that are live or reachable today, counted per instance |

Expect results like "Engineering B, Live harm D" for a well-structured toolchain with four steps that block people today. An averaged C describes neither.

### Calibration anchors (both grades)

| Grade | Score | What it looks like | In this audit |
|---|---|---|---|
| A | 9.0–10 | Reference quality. Other teams should copy it. Defects are rare and their classes are guarded. | Developers are productive and happy, minimal friction |
| B | 7.5–8.9 | Strong. Clear boundaries, one implementation per concept, core invariants tested. A few bugs at the edges. | Mostly smooth, some known rough edges |
| C | 6.0–7.4 | Sound, typical production work. It works, carries ordinary debt and a steady trickle of bugs. | Functional, but regular friction that slows people down |
| D | 4.0–5.9 | Weak. The structure keeps producing defects, or people regularly hit live ones. | Frequent obstacles, developers regularly blocked or frustrated |
| F | 0–3.9 | Failing. Broken core flows, data-loss or security exposure, or unsafe to change. | Actively hostile to developer productivity |

C is the grade for typical working production work, not an insult. Finding problems is guaranteed at any size; the grade says how the area compares with ordinary production work, not whether problems exist.

### Engineering score: the recipe for each category

1. **Start at 7.0**: sound production work with ordinary debt.
2. **Add +0.5 per verified positive mechanism** in this category (an invariant enforced in one place, a test or check on the risky path, a guard that makes a defect class impossible, a clean boundary). At most +2.5. Name each one.
3. **Subtract per root-cause pattern charged to this category**, not per instance. Group instances into patterns first; a pattern takes the severity of its worst Verified instance: Critical −2.0, High −1.0, Medium −0.5, Low 0. Probable-only patterns count half. At most −4.0 per category.
   The root cause is the mechanism that let the defect exist, not the place it surfaced. A rule copied instead of shared, then fixed in one copy only, is charged where the copying happened even when the symptom shows up elsewhere.
4. **Clamp to 0–10 and show the arithmetic** in the justification: `7.0 + 1.5 (3 mechanisms) − 1.0 (pattern, High) − 0.5 (pattern, Medium) = 7.0`.

Every category actually inspected gets a score; mark the rest `N/A`. The **Engineering score** is the weighted composite of the category scores (weights below, renormalized over non-N/A categories). It is the composite `/health-sweep` collects.

### Live-harm score

1. Count **instances** (not patterns) of Verified findings whose Harm is developer-facing (it blocks or misleads a developer or CI today: a setup step that fails, a red or flaky build that blocks merges, a test or doc that lies) and live or reachable today: Critical = 3, High = 1. Probable instances count half. Mediums, Lows and slow-burn friction that blocks nobody today do not count here.
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

Daily-impact categories are weighted heaviest. A developer hits the build, the test suite, and the dev loop every single day. Onboarding is weighted high because first impressions compound — a bad onboarding experience means every future contributor starts behind.

| Category | Weight |
|----------|--------|
| Local Development Loop | 15% |
| Build & Compilation | 14% |
| Onboarding & First-Run Experience | 12% |
| Test Suite Health | 12% |
| CI/CD Pipeline Experience | 9% |
| Debugging Ergonomics | 8% |
| Type Safety & Editor Support | 7% |
| Code Navigation & Discoverability | 6% |
| Dependency Management | 5% |
| Error Recovery & Guardrails | 5% |
| Tooling & Configuration Overhead | 4% |
| Documentation for Contributors | 3% |

Provide: the Engineering score and grade, the Live-harm score and grade, and a one-line verdict that names both.

### Sub-area breakdown

When the scope holds parts of visibly different quality, add a table: sub-area, Engineering grade, live Critical/High count, one-line reason. This is where "the core is excellent, the edges are not" belongs.

### Bar Chart Format

Render a text-only horizontal bar chart with 20 blocks per row:

```text
Local Development Loop          8.2 | ████████████████░░░░
Build & Compilation             6.5 | █████████████░░░░░░░
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
**Harm**: [Developer-facing: blocking now | intermittent | not yet hit] or [Slow-burn friction]
**Pattern**: [Name of the root-cause pattern this instance belongs to, if any]
**Affected Developers**: [All contributors / new contributors / CI pipeline / specific workflow]
**Location**: [File paths, config files, or commands]

**Evidence**:
[Specific commands, config excerpts, error messages, step counts, or timing
data that PROVE this is real friction. This is the most important section.]

**Impact**:
[How this slows developers down. Quantify in steps, seconds, or frequency.
"Every developer hits this when..." or "New contributors are blocked for
X minutes because..." or "This adds Y seconds to every save-compile cycle."]

**Recommendation**:
[Concrete, actionable fix. Not "consider improving" — instead, "add an
`.env.example` file with all required variables and their descriptions" or
"switch incremental builds to SWC by changing `tsconfig.json` line 14."]

**Estimated Effort**: [Small / Medium / Large]
```

---

## Output Format

```markdown
# Developer Experience Health Audit

## 1. Executive Summary
[Open with both grades in one line: "Engineering B (7.8) · Live harm D (5.0)".]
[2-3 paragraphs. Plain-language assessment for a tech lead or engineering
manager. How does it feel to work on this project? Where do developers
lose the most time? What would make the biggest difference in velocity
and satisfaction?]

## 2. Scope & Method
[What the user asked you to focus on, what was actually reviewed, which
workflows/configs/packages were inspected deeply vs broadly, what was
explicitly out of scope, and what could not be verified.]

## 3. Onboarding Walkthrough
[Step-by-step trace of what a new developer would experience cloning and
running this project for the first time. Every command, every wait, every
moment of confusion. Format as a numbered list with timing estimates and
friction annotations. This section is the narrative heart of the audit.]

## 4. Build & Test Timing
[Measured or estimated build and test times with context:
- Cold build time
- Incremental build time
- Dev server startup time
- Full test suite time
- Single test file time
- CI pipeline total time
Compare to reasonable benchmarks for the project's size and ecosystem.]

## 5. Configuration Inventory
[Every config file at the root level and in key directories, listed with:
- Filename
- Purpose
- Line count
- Verdict: necessary / redundant / overly complex / could be simplified
Total config line count and assessment of configuration burden.]

## 6. Dependency Health Summary
[Quantified dependency health:
- Total direct dependencies (prod + dev)
- Total transitive dependencies
- Outdated count (minor, major)
- Abandoned/unmaintained count
- Override/resolution count
- Duplicate package count
- Estimated total install size]

## 7. Scorecard
[Score table with each category's arithmetic and justification, the Engineering and Live-harm scores, and a sub-area breakdown when parts differ in quality]

## 8. Bar Chart
[Text bar chart: categories, then Engineering and Live harm rows]

## 9. Findings by Category
[Grouped by category, then by severity within each category (Critical → Low).
Use the finding template above.]

## 10. Daily Developer Friction Map
[A summary of friction points ordered by how often a developer encounters them:
- Every save (hot reload, type checking)
- Every commit (pre-commit hooks, formatting)
- Every PR (CI pipeline, review process)
- Every day (dev server startup, test runs)
- Every week (dependency updates, environment issues)
- Every onboarding (setup, documentation gaps)
Frame each friction point with its estimated time cost per occurrence.]

## 11. Prioritized Action Plan
[Top 10 actions ordered by (developer-time-saved × number-of-developers-affected ÷ effort).
For each:
- What to do (one sentence)
- Why it matters most right now (one sentence)
- Which findings it addresses (cross-reference by title)
- Estimated effort band (hours / days / weeks)
- Estimated daily time saved across the team]

## 12. Strengths & Bright Spots
[Mandatory. What the project does well for developer experience. Good tooling
choices, thoughtful configuration, clear documentation, fast builds, reliable
tests, smooth onboarding steps. Evidence-backed.]

## 13. What Was Not Flagged
[Issues considered but rejected for insufficient evidence or because they are
reasonable tradeoffs for this project's stage and context.]

## 14. Appendix: Evidence Notes
[Supporting data: full config file listings, dependency trees, command outputs,
file counts, import depth measurements, any raw data collected during the audit.]

## Final Verdict
[Engineering grade and score, Live-harm grade and score, one-line summary of developer experience health]
```

For focused audits, keep the scope visible near the top of the report and mark unrelated sections or categories as `N/A` rather than pretending they were evaluated.

---

## Anti-Patterns to Avoid

Do NOT:
- ❌ Report friction you can't demonstrate with specific files, commands, or configuration
- ❌ Flag tool choices as "wrong" just because you prefer a different tool — evaluate the actual DX impact
- ❌ Recommend rewriting the build system when incremental improvements would work
- ❌ Confuse "unfamiliar to me" with "poor developer experience"
- ❌ Pad the report with low-value findings to appear thorough
- ❌ Ignore the project's stage — a weekend prototype and a production monorepo have different standards
- ❌ Let a narrow focus prompt silently expand into a fake whole-project DX audit
- ❌ Score a category as low without multiple proven findings to justify it
- ❌ Review implementation logic or code quality — that is `/health-audit`
- ❌ Review user-facing UX — that is `/health-audit-ux`
- ❌ Treat the number of config files as inherently bad — evaluate whether each one earns its keep
- ❌ Assume all developers use your preferred editor or operating system

DO:
- ✅ Quantify friction in steps, seconds, commands, or frequency wherever possible
- ✅ Show your work — the reader should be able to reproduce every finding
- ✅ Calibrate severity to the project's size, stage, and contributor count
- ✅ Distinguish between "friction for new contributors" and "friction for daily contributors"
- ✅ Consider the project's ecosystem norms — 30 config files might be normal for a Next.js monorepo
- ✅ Cross-reference findings to identify root causes (e.g., slow builds may cause test skipping)
- ✅ Call out when something is well done — silence on a category implies you didn't check it
- ✅ Think like a developer who just wants to ship their feature and go home
- ✅ Compare to ecosystem benchmarks where reasonable (e.g., "typical Vite cold start is 300ms; this project takes 8s")
- ✅ Count the total "commands to running" and compare to the ideal (usually 3: clone, install, start)
- ✅ Note workarounds and tribal knowledge that indicate upstream friction
- ✅ If evidence is insufficient, say so plainly
- ✅ If the repository is large, state what was examined deeply vs broadly
- ✅ State the requested focus area, included workflows, excluded workflows, and verification limits plainly
