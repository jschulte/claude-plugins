# GitHub Ecosystem Search

How to search a GitHub organization for repos related to discovered signal names.

---

## Overview

After scanning the starting repo for integration signals, use the GitHub API to find related repos in the same org. This step is **optional** — it requires the user to provide a GitHub org name.

---

## Prerequisites

- `gh` CLI installed and authenticated
- GitHub org name available (auto-detected from `git remote get-url origin` or user-provided)
- Signal scan produced a list of service/package names to search for

## Auto-Detecting the GitHub Org

The org is extracted from the git remote URL before this step runs:

```bash
REMOTE_URL=$(git remote get-url origin 2>/dev/null || echo "")
GITHUB_ORG=""

# GitHub SSH: git@github.com:myorg/repo.git
# GitHub HTTPS: https://github.com/myorg/repo.git
if [[ "$REMOTE_URL" =~ github\.com[:/]([^/]+)/ ]]; then
  GITHUB_ORG="${BASH_REMATCH[1]}"
fi

# Also handle GitLab, Bitbucket, etc.
if [[ -z "$GITHUB_ORG" ]] && [[ "$REMOTE_URL" =~ gitlab\.com[:/]([^/]+)/ ]]; then
  GITHUB_ORG="${BASH_REMATCH[1]}"
fi

if [[ -z "$GITHUB_ORG" ]]; then
  echo "Could not auto-detect org. Ask user or skip GitHub search."
fi
```

If the org is a personal account (not an organization), GitHub search still works — it searches that user's repos.

---

## Search Strategy

### Step 1: List Org Repos

First, get a broad picture of all repos in the org:

```bash
# List all repos in the org (paginated, up to 100)
gh api "orgs/{org}/repos?per_page=100&sort=updated&direction=desc" \
  --jq '.[] | "\(.name)\t\(.description // "no description")\t\(.updated_at)"' \
  | head -100
```

**Why list first:** Repo names alone can match signal names. If we found `auth-service` as a signal, and `auth-service` is a repo in the org, that's a strong match.

### Step 2: Name Matching

Compare discovered signal names against org repo names:

```bash
# For each discovered name, check if a repo with that name exists
for name in "${DISCOVERED_NAMES[@]}"; do
  gh api "repos/{org}/${name}" --jq '.full_name' 2>/dev/null && echo "MATCH: $name"
done
```

**Fuzzy matching patterns:**
- Exact match: `auth-service` → `auth-service`
- Prefix match: `auth` → `auth-service`, `auth-api`, `auth-lib`
- Suffix match: `service-auth` → `auth-service` (reversed convention)
- Hyphen/underscore variants: `auth-service` → `auth_service`

### Step 3: Code Search

Search for code references across the org that mention the starting repo or its packages:

```bash
# Search for imports of packages from the starting repo
gh api "search/code?q=org:{org}+{package_name}+in:file" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"' \
  | head -20

# Search for references to the starting repo's API or service name
gh api "search/code?q=org:{org}+{service_name}+in:file+extension:yml+extension:yaml+extension:json" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"' \
  | head -20

# Search for env var references
gh api "search/code?q=org:{org}+{SERVICE_NAME}_URL+in:file" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"' \
  | head -20
```

**Rate limit awareness:**
- GitHub code search API: 10 requests per minute for authenticated users
- Add 6-second delays between search requests
- Batch searches by combining terms: `q=org:myorg+auth-service+OR+user-service`

### Step 4: Topic/Description Search

Search repo topics and descriptions for matching terms:

```bash
# Search repos by topic
gh api "search/repositories?q=org:{org}+topic:{topic}" \
  --jq '.items[] | "\(.name)\t\(.description // "")"' \
  | head -20

# Search repos by description keywords
gh api "search/repositories?q=org:{org}+{keyword}+in:description" \
  --jq '.items[] | "\(.name)\t\(.description // "")"' \
  | head -20
```

### Step 5: Dependency Graph (if available)

If the org has GitHub dependency graph enabled:

```bash
# Check if dependency graph shows dependents
gh api "repos/{org}/{starting_repo}/dependents" 2>/dev/null \
  --jq '.[] | "\(.name)\t\(.relationship)"' \
  | head -20
```

---

## Search Queries by Signal Type

### For Scoped npm Packages

```bash
# Find repos that depend on @org/package-name
gh api "search/code?q=org:{org}+%22{package_name}%22+filename:package.json" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"'
```

### For Docker Compose Services

```bash
# Find repos with docker-compose files mentioning the service
gh api "search/code?q=org:{org}+{service_name}+filename:docker-compose" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"'
```

### For Environment Variables

```bash
# Find repos with similar env var patterns
gh api "search/code?q=org:{org}+{SERVICE_NAME}_URL+filename:.env" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"'
```

### For Shared Infrastructure

```bash
# Find repos with Terraform referencing the same resources
gh api "search/code?q=org:{org}+{resource_name}+extension:tf" \
  --jq '.items[] | "\(.repository.full_name)\t\(.path)"'
```

---

## Scoring GitHub Results

Each GitHub-discovered repo gets scored:

| Match Type | Score | Confidence |
|-----------|-------|------------|
| Exact repo name match + code reference | +3 | HIGH |
| Exact repo name match (name only) | +2 | MEDIUM |
| Code search hit (references starting repo) | +2 | MEDIUM |
| Code search hit (references same packages) | +1 | MEDIUM |
| Topic/description match | +1 | LOW |
| Name pattern match (fuzzy) | +1 | LOW |

**Total score → confidence:**
- Score >= 4: HIGH
- Score 2-3: MEDIUM
- Score 1: LOW

---

## Output Format

```
GitHub Search Results for org: myorg
════════════════════════════════════

Direct Matches:
  auth-service (exact name match + 3 code refs) → HIGH
  shared-utils (exact name match + package.json refs) → HIGH

Code References:
  billing-api (references user-service in docker-compose) → MEDIUM
  notification-hub (imports @myorg/shared-utils) → MEDIUM

Pattern Matches:
  admin-dashboard (similar naming convention) → LOW
  reporting-service (topic: microservices) → LOW

Total: 6 repos discovered via GitHub search
```

---

## Rate Limit Handling

```bash
# Check remaining rate limit before searching
RATE_LIMIT=$(gh api rate_limit --jq '.resources.search.remaining')
echo "Search API calls remaining: $RATE_LIMIT"

if [ "$RATE_LIMIT" -lt 5 ]; then
  RESET_TIME=$(gh api rate_limit --jq '.resources.search.reset')
  echo "Rate limited. Resets at: $(date -r $RESET_TIME)"
  echo "Skipping GitHub search — use local scan results only"
fi
```

**Best practices:**
- Check rate limit before starting
- Use `sleep 6` between search API calls
- Combine search terms with `OR` to reduce API calls
- Cache results — don't re-search the same terms
- Fall back gracefully if rate limited (local scan still works)

---

## MCP GitHub Tools (Alternative)

If MCP GitHub tools are available, prefer them over `gh api`:

```
# Use mcp__github__search_code for code search
# Use mcp__github__search_repositories for repo search
# Use mcp__github__list_issues for finding cross-repo references
```

These tools handle authentication and rate limiting automatically.
