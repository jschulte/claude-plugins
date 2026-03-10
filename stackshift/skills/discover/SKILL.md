---
name: discover
description: Ecosystem discovery from a single starting repo. Scans for integration signals (npm packages, docker compose, env vars, API calls, CI/CD triggers, workspace configs, message queues, infrastructure refs), searches GitHub for related repos, scans the local filesystem, then presents an ecosystem map with confidence scoring and a Mermaid dependency graph. Hands off confirmed repos to /stackshift.batch or /stackshift.reimagine.
allowed-tools:
  - Bash
  - Read
  - Write
  - Glob
  - Grep
---

# Ecosystem Discovery

**Estimated Time:** 10-30 minutes (depending on ecosystem size and GitHub search)
**Prerequisites:** A starting repo with real code (not empty scaffolding)
**Output:** `ecosystem-map.md` in the starting repo's `.stackshift/` directory, `.stackshift-batch-session.json` in the starting repo directory for handoff

All path variables MUST be double-quoted in shell commands. This skill is single-session with no resume capability -- if interrupted, re-run from Step 1.

---

## When to Use This Skill

Activate when:
- The user has one repo and wants to find everything it connects to
- A large-scale reverse-engineering project needs repo enumeration
- The user wants to map an entire platform before running batch analysis
- The dependency graph between multiple repos/services is unknown

**Trigger Phrases:**
- "Discover the ecosystem for this repo"
- "What other repos does this project depend on?"
- "Map all the related services"
- "Find all the repos in this platform"
- "What's connected to this service?"

---

## Process

### Step 1: Pre-flight

Verify the starting repo exists and detect basic characteristics:

```bash
# Verify we're in a repo with code
if [ ! -d ".git" ] && [ ! -f "package.json" ] && [ ! -f "go.mod" ] && [ ! -f "requirements.txt" ]; then
  echo "WARNING: This doesn't look like a code repository"
fi

# Detect if monorepo
MONOREPO="false"
if [ -f "pnpm-workspace.yaml" ] || [ -f "turbo.json" ] || [ -f "nx.json" ] || [ -f "lerna.json" ]; then
  MONOREPO="true"
fi

# Get repo name
REPO_NAME=$(basename "$(pwd)")

# Auto-discover GitHub org from git remote
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
GITHUB_ORG=""
if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/ ]]; then
  GITHUB_ORG="${BASH_REMATCH[1]}"
  echo "Auto-detected GitHub org: $GITHUB_ORG"
elif [[ "$REMOTE_URL" =~ gitlab\.com[:/]([^/]+)/ ]]; then
  GITHUB_ORG="${BASH_REMATCH[1]}"
  echo "Auto-detected GitLab group: $GITHUB_ORG"
fi
```

**Monorepo handling:** If workspace config is detected:
1. Resolve all workspace globs to actual package directories
2. Mark every discovered package as **CONFIRMED**
3. Still scan each package for outbound signals to find external dependencies
4. The Mermaid graph shows intra-monorepo dependencies

### Step 2: User Input

Show the auto-detected org and ask for confirmation:

```
I auto-detected the GitHub org from your git remote: {GITHUB_ORG}

Is this correct? (Y/n, or enter a different org)
```

If no org was detected:
```
I couldn't detect a GitHub org from the git remote.
What GitHub org should I search? (optional, press enter to skip)
```

Ask about known repos:
```
Do you know of any related repos? (optional)

List paths or org/repo names, one per line:
- ~/git/auth-service
- ~/git/shared-libs
- myorg/inventory-api
- (or press enter to skip)
```

Mark user-provided repos as **CONFIRMED** confidence.

### Step 3: Scan Starting Repo

Run all 10 signal categories on the starting repo. Follow `scan-integration-signals.md` for detailed instructions.

**Signal categories:**
1. Scoped npm packages (`@org/*` in package.json)
2. Docker Compose services (`docker-compose*.yml`)
3. Environment variables (`.env*`, config files)
4. API client calls (source code URLs, gRPC protos)
5. Shared databases (connection strings, schema refs)
6. CI/CD triggers (`.github/workflows/*.yml`)
7. Workspace configs (`pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json`)
8. Message queues/events (SQS, SNS, Kafka topic names)
9. Infrastructure refs (`terraform/`, `cloudformation/`, `k8s/`)
10. Import paths / go.mod / requirements.txt (language-specific deps)

**CHECKPOINT -- Report to user before continuing:**
```
Signal scan complete. Found {N} candidate names across {M} signal categories.
Top signals: {list top 3-5 discovered names with their categories}
Proceeding to scan user repos and search GitHub...
```

If zero signals found, skip to the "Standalone Repo" edge case (see `present-ecosystem-map.md` Error Cases).

### Step 4: Scan User-Provided Repos

For each repo the user listed:
1. Verify it exists (local path or clone from GitHub). If the path does not exist, warn the user and skip that repo.
2. Run the same 10 signal categories
3. Cross-reference signals with the starting repo to build connections

### Step 5: GitHub Search (if org provided)

Follow `github-ecosystem-search.md` for detailed instructions.

Search the GitHub org for repos matching discovered signal names:
- Package names (`@org/shared-utils` -> search for `shared-utils` repo)
- Service names from Docker Compose or env vars
- Repository naming patterns (same prefix, similar conventions)

**Error recovery:** If a GitHub API call fails with a transient error (5xx, network timeout), retry up to 2 times with 10-second backoff. If all retries fail, skip GitHub search and note it in the ecosystem map. If rate-limited, skip GitHub search entirely and rely on local results.

**CHECKPOINT -- Report to user before continuing:**
```
GitHub search complete. Found {N} matching repos ({X} exact name matches, {Y} code references).
Proceeding to local filesystem scan and merge...
```

If GitHub search was skipped, report:
```
GitHub search skipped ({reason}). Proceeding with local scan and signal analysis only.
```

### Step 6: Local Filesystem Scan

Search common development directories for matching repos:

```bash
# Common locations to check
SEARCH_DIRS=(
  "$(dirname "$(pwd)")"      # Sibling directories
  "$HOME/git"
  "$HOME/code"
  "$HOME/src"
  "$HOME/projects"
  "$HOME/repos"
  "$HOME/dev"
  "$HOME/workspace"
)

# For each discovered package/service name, look for matching directories
for name in "${DISCOVERED_NAMES[@]}"; do
  for dir in "${SEARCH_DIRS[@]}"; do
    if [ -d "$dir/$name" ]; then
      echo "FOUND: $dir/$name"
    fi
  done
done
```

### Step 7: Merge & Deduplicate

Follow `merge-and-score.md` for detailed instructions on deduplication, confidence scoring formula, and dependency graph construction.

Combine all discovery sources, deduplicate by repo identity, score confidence, and build the dependency graph.

### Step 8: Present Ecosystem Map

Follow `present-ecosystem-map.md` for detailed instructions.

Generate `ecosystem-map.md` in `.stackshift/` directory. Display the map to the user with a summary:
```
Found X repos (Y confirmed, Z high confidence, W medium, V low)
```

### Step 9: User Confirmation

Ask the user to review and adjust:

```
Does this ecosystem map look right?

Options:
A) Looks good -- proceed to handoff
B) Add repos -- I'll add more to the list
C) Remove repos -- Take some off the list
D) Rescan -- Run discovery again with adjustments
```

If the user adds repos, mark as CONFIRMED and re-merge. If the user removes repos, update the map and graph. If the user requests a rescan, return to Step 3 with adjustments.

### Step 10: Handoff

Create `.stackshift-batch-session.json` in the starting repo directory:

```json
{
  "sessionId": "discover-{timestamp}",
  "startedAt": "{iso_date}",
  "batchRootDirectory": "{starting_repo_path}",
  "totalRepos": "{length of discoveredRepos array}",
  "batchSize": 5,
  "answers": {},
  "processedRepos": [],
  "discoveredRepos": [
    {
      "name": "{repo_name}",
      "path": "{local_path}",
      "confidence": "CONFIRMED|HIGH|MEDIUM|LOW",
      "signals": ["{signal1}", "{signal2}"]
    }
  ]
}
```

`totalRepos` MUST equal the length of the `discoveredRepos` array (all confidence levels included).

Present next steps as model actions:

```
What would you like to do with these {X} repos?

A) Run /stackshift.batch on all repos
B) Run /stackshift.reimagine
C) Export ecosystem map only
D) Analyze a specific subset
```

**On user choice:**
- **A)** Verify `.stackshift-batch-session.json` exists in the starting repo directory. Instruct user to run `/stackshift.batch`.
- **B)** Note that reimagine needs reverse-engineering docs. Suggest running batch first (Gears 1-2 minimum), or proceed if docs exist.
- **C)** Confirm map is saved to `.stackshift/ecosystem-map.md`. Session file preserved for later.
- **D)** Let user pick repos, update batch session with selected subset, then proceed as A.

---

## 10 Signal Categories

| # | Signal Category | Where to Look | Example |
|---|----------------|--------------|---------|
| 1 | Scoped npm packages | `package.json` dependencies | `@myorg/shared-utils` |
| 2 | Docker Compose services | `docker-compose*.yml` | `depends_on: [user-api, redis]` |
| 3 | Environment variables | `.env*`, config files | `USER_SERVICE_URL`, `INVENTORY_API_HOST` |
| 4 | API client calls | Source code imports/URLs | `fetch('/api/v2/users')`, gRPC protos |
| 5 | Shared databases | Connection strings, schema refs | Same DB name in multiple configs |
| 6 | CI/CD triggers | `.github/workflows/*.yml` | `paths:`, `repository_dispatch`, cross-repo triggers |
| 7 | Workspace configs | `pnpm-workspace.yaml`, `turbo.json`, `nx.json`, `lerna.json` | Monorepo package lists |
| 8 | Message queues/events | Source code, config | `SQS queue names`, `SNS topics`, `Kafka topics` |
| 9 | Infrastructure refs | `terraform/`, `cloudformation/`, `k8s/` | Shared VPCs, service meshes, ALBs |
| 10 | Import paths / go.mod / requirements.txt | Language-specific dependency files | `replace github.com/myorg/shared => ../shared` |

For confidence scoring criteria and formulas, see `merge-and-score.md`.

---

## Edge Cases

### Monorepo as Starting Point
When workspace config is detected:
- All packages resolved from workspace globs are **CONFIRMED** automatically
- Still scan each package for outbound signals (external deps, APIs, databases)
- The ecosystem map shows both intra-monorepo and external dependencies
- The Mermaid graph uses `subgraph` to group monorepo packages together
- Handoff to batch can process each package as a separate "repo"

### Standalone Repo (No Signals Found)
When signal scanning finds zero references to other repos, present options per `present-ecosystem-map.md` Error Cases. Do not treat this as a failure.

### No GitHub Org Detected
Skip GitHub search entirely (Step 5 is skipped). Rely on local filesystem scan and signal analysis only. Report: "GitHub search skipped (no org detected). Results based on local scan only."

### GitHub Search Rate Limited or Auth Failed
Fall back to local scan + signal analysis. Note in the ecosystem map: "GitHub search was skipped (rate limited / not authenticated)". For transient errors (5xx, network timeout), retry up to 2 times with 10-second backoff before falling back.

### Large Ecosystem (20+ Repos)
- Mermaid graph: show only CONFIRMED + HIGH repos in the main diagram
- Group repos by domain using `subgraph` if clear clusters exist
- Offer to filter: "Found {N} repos. Analyze all, or filter to HIGH+ confidence?"
- Batch handoff should suggest a conservative batch size (3 at a time)

### Only LOW Confidence Repos
When all discovered repos (beyond the starting point) are LOW confidence, present review options per `present-ecosystem-map.md` Error Cases.

### Mixed Local/Remote Repos
- Prefer local paths when available (faster to scan)
- Note GitHub-only repos as "remote only" in the ecosystem map
- Ask user: "Some repos are only on GitHub. Clone them locally for analysis?"
