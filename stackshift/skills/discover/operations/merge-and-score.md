# Merge and Score

How to merge discovery results from all sources and assign confidence scores.

---

## Overview

After running signal scans, GitHub search, and local filesystem scans, merge all results into a single deduplicated list with confidence scores and a dependency graph.

---

## Input Sources

1. **Starting repo signals** — Names discovered from scanning the starting repo
2. **User-provided repos** — Repos explicitly listed by the user (CONFIRMED)
3. **User-provided repo signals** — Signals from scanning user-provided repos
4. **GitHub search results** — Repos found via GitHub org search
5. **Local filesystem matches** — Repos found on the local filesystem

---

## Step 1: Normalize Names

Before merging, normalize all discovered names to a canonical form:

```
Normalization rules:
1. Lowercase: "Auth-Service" → "auth-service"
2. Replace underscores with hyphens: "auth_service" → "auth-service"
3. Remove common prefixes: "ws-", "svc-", "service-" → keep the rest
4. Remove common suffixes: "-service", "-api", "-lib" → keep for identity but group
5. Trim whitespace
```

**Important:** Keep the original name for display, but use the normalized form for deduplication.

**Grouping rule:** `auth-service` and `auth-api` might be different repos. Only merge if:
- Same normalized base name AND same location (path or GitHub URL)
- OR user explicitly says they're the same

---

## Step 2: Deduplicate

Group entries by repo identity:

```
Identity key = normalized_name + location_hash

Example:
  "auth-service" found via:
    - docker-compose signal → no location yet
    - env var signal → no location yet
    - GitHub search → github.com/myorg/auth-service
    - Local scan → ~/git/auth-service

  These all merge into ONE entry:
    name: auth-service
    location: ~/git/auth-service (prefer local path)
    github_url: github.com/myorg/auth-service
    signals: [docker-compose, env-var, github-search, local-scan]
```

**Location priority:**
1. Local filesystem path (if found)
2. GitHub URL (if found via search)
3. "unknown" (signal only, no location confirmed)

---

## Step 3: Score Confidence

Each repo gets a confidence level based on how it was discovered:

### CONFIRMED (highest)
Assign CONFIRMED when:
- User explicitly listed the repo
- Found in workspace config (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`)
- It's the starting repo itself

### HIGH
Assign HIGH when:
- 3+ independent signal categories point to it
- 2 independent signals + local filesystem match
- 2 independent signals + GitHub exact name match
- Cross-referenced from 2+ repos (signals from starting repo AND a user-provided repo)

### MEDIUM
Assign MEDIUM when:
- 1-2 signal categories point to it
- Single strong signal (scoped npm package, docker-compose depends_on)
- GitHub code search match (not just name match)

### LOW
Assign LOW when:
- GitHub name pattern match only
- GitHub topic/description match only
- Single weak signal (naming convention inference)
- No local path and no code reference

### Scoring Formula

```
score = 0

# Signal-based scoring
for each unique signal category:
  if category in [docker-compose, workspace-config, import-path]:
    score += 3  # strong signals
  elif category in [env-var, npm-package, api-call]:
    score += 2  # medium signals
  elif category in [ci-cd, message-queue, infrastructure, database]:
    score += 1  # weak signals

# Source-based scoring
if found_on_local_filesystem: score += 2
if github_exact_name_match: score += 2
if github_code_search_hit: score += 1
if user_listed: score = 100  # auto-CONFIRMED

# Cross-reference bonus
if referenced_by_multiple_repos: score += 3

# Map score to confidence
if score >= 100: CONFIRMED
elif score >= 6: HIGH
elif score >= 3: MEDIUM
else: LOW
```

---

## Step 4: Build Dependency Graph

Create a directed graph showing which repos depend on which:

### Edge Types

| Edge Type | Direction | Example |
|-----------|-----------|---------|
| `depends_on` | A → B | A's docker-compose depends_on B |
| `imports` | A → B | A imports @org/B in package.json |
| `calls` | A → B | A makes API calls to B |
| `publishes_to` | A → queue | A publishes to a message queue |
| `consumes_from` | A ← queue | A consumes from a message queue |
| `shares_db` | A ↔ B | A and B use the same database |
| `triggers` | A → B | A's CI triggers B's workflow |

### Building Edges

```
For each signal:
  if signal.direction == "outbound":
    add_edge(signal.source_repo, signal.target_name, signal.category)
  elif signal.direction == "inbound":
    add_edge(signal.target_name, signal.source_repo, signal.category)
  elif signal.direction == "shared":
    add_bidirectional_edge(signal.source_repo, signal.target_name, signal.category)
```

### Graph Representation

Store as adjacency list:

```json
{
  "nodes": [
    {"name": "user-service", "confidence": "CONFIRMED", "type": "service"},
    {"name": "auth-service", "confidence": "HIGH", "type": "service"},
    {"name": "shared-utils", "confidence": "HIGH", "type": "library"},
    {"name": "postgres", "confidence": "HIGH", "type": "infrastructure"}
  ],
  "edges": [
    {"from": "user-service", "to": "auth-service", "type": "calls", "signal": "api-call"},
    {"from": "user-service", "to": "shared-utils", "type": "imports", "signal": "npm-package"},
    {"from": "user-service", "to": "postgres", "type": "shares_db", "signal": "database"},
    {"from": "auth-service", "to": "shared-utils", "type": "imports", "signal": "npm-package"}
  ]
}
```

---

## Step 5: Classify Repo Types

Categorize each discovered repo:

| Type | Criteria |
|------|----------|
| **service** | Has its own server/entry point, runs independently |
| **library** | Imported by other repos, doesn't run independently |
| **infrastructure** | Database, cache, queue, proxy (standard images) |
| **config** | Shared configuration (eslint-config, tsconfig-base) |
| **tool** | Dev tooling, CLI tools, scripts |
| **unknown** | Can't determine from signals alone |

---

## Step 6: Generate Summary

Produce a structured summary for the presentation step:

```
Ecosystem Discovery Summary
════════════════════════════

Starting repo: user-service
Org: myorg
Total discovered: 12

By Confidence:
  CONFIRMED: 3 (user-service, shared-utils, auth-service)
  HIGH: 4 (inventory-api, notification-hub, billing-api, order-service)
  MEDIUM: 3 (admin-dashboard, reporting-service, config-repo)
  LOW: 2 (legacy-gateway, monitoring-stack)

By Type:
  Services: 7
  Libraries: 2
  Infrastructure: 2
  Config: 1

Dependency Graph Edges: 15
  calls: 5
  imports: 4
  shares_db: 3
  publishes_to: 2
  triggers: 1

Most Connected: user-service (8 connections)
Least Connected: monitoring-stack (1 connection)
```

Pass this summary and the full data to the `present-ecosystem-map.md` step.
