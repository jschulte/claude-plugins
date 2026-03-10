---
name: refresh-docs
description: Detects code changes since reverse-engineering docs were last generated and surgically updates only the affected documentation files. Triggered by "refresh the docs", "update reverse-engineering docs", or "sync docs with latest code".
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Task
---

# Refresh Docs

Incrementally update reverse-engineering docs from git changes. No full regeneration needed.

**Estimated Time:** 2-15 minutes (depends on change volume)
**Prerequisites:** Reverse-engineering docs exist with `.stackshift-docs-meta.json`
**Output:** Updated docs in `docs/reverse-engineering/` with refreshed commit hash

---

## Arguments

| Argument | Values | Default | Description |
|----------|--------|---------|-------------|
| mode | `smart`, `full` | `smart` | `smart` = incremental update of affected docs only. `full` = regenerate all 11 docs via `/stackshift.reverse-engineer`. |

Auto-detect `full`: if >60% of source files changed, major version bumps in package.json/go.mod, new top-level directories added, or framework migration detected, recommend `full` mode to the user.

---

## When to Activate

Activate when the user says any of:
- "Update the reverse-engineering docs"
- "Refresh the docs"
- "Sync docs with latest code"
- "What changed since docs were generated?"
- "Are the docs out of date?"

Also activate when: reverse-engineering docs exist, code has changed since they were generated, and the user wants to keep docs current without full regeneration.

---

## Process

### Step 1: Read Metadata and Validate Git State

Log: "Step 1: Reading metadata and validating git state..."

```bash
META_FILE="docs/reverse-engineering/.stackshift-docs-meta.json"

if [ ! -f "$META_FILE" ]; then
  echo "ERROR: No metadata file found. Run /stackshift.reverse-engineer first."
  exit 1
fi

PINNED_HASH=$(cat "$META_FILE" | jq -r '.commit_hash')
CURRENT_HASH=$(git rev-parse HEAD 2>/dev/null)

if [ $? -ne 0 ]; then
  echo "ERROR: git rev-parse failed. Verify this is a valid git repository."
  exit 1
fi

PINNED_DATE=$(cat "$META_FILE" | jq -r '.commit_date')

echo "Docs pinned to: $PINNED_HASH ($PINNED_DATE)"
echo "Current HEAD:   $CURRENT_HASH"

if [ "$PINNED_HASH" = "$CURRENT_HASH" ]; then
  echo "Docs are up to date. Nothing to refresh."
  exit 0
fi

# Verify pinned commit exists
COMMIT_COUNT=$(git rev-list --count "$PINNED_HASH".."$CURRENT_HASH" 2>/dev/null || echo "unknown")
if [ "$COMMIT_COUNT" = "unknown" ]; then
  echo "ERROR: Pinned commit $PINNED_HASH not found. It may have been rebased or force-pushed."
  echo "Falling back to full refresh via /stackshift.reverse-engineer."
  exit 1
fi

echo "Commits since last generation: $COMMIT_COUNT"
```

If any git command fails (non-zero exit), report the error to the user. Common causes: shallow clone (suggest `git fetch --unshallow`), corrupted repo (suggest `git fsck`), or missing commit (suggest full refresh).

Log: "Step 1 complete: $COMMIT_COUNT commits to analyze."

### Step 2: Get Changed Files and Commit Summary

Log: "Step 2: Gathering changed files..."

```bash
# Get list of changed files with change type
git diff --name-status "$PINNED_HASH"..HEAD 2>/dev/null
if [ $? -ne 0 ]; then
  echo "ERROR: git diff failed. Check repository integrity."
  exit 1
fi

# Get commit log summary (for context)
git log --oneline "$PINNED_HASH"..HEAD

# Get a statistical summary
git diff --stat "$PINNED_HASH"..HEAD
```

Present the change summary to the user:
```
Docs generated at commit abc1234 (2025-12-15)
Current HEAD: def4567 (2026-02-12)
42 commits, 156 files changed:
  src/api/        - 12 files (endpoints, middleware)
  src/models/     - 3 files (schema changes)
  tests/          - 15 new test files
Estimated refresh time: ~5 minutes
```

If mode is `full` (user-requested or auto-detected), skip to the Full Refresh section below.

Log: "Step 2 complete: [N] files changed across [M] directories."

### Step 3: Map Changes to Affected Docs

Log: "Step 3: Mapping changed files to docs..."

Categorize each changed file by which documentation file(s) it affects:

| Changed File Pattern | Affected Doc(s) |
|---|---|
| `src/api/**`, `routes/**`, `controllers/**` | functional-specification.md, integration-points.md, data-architecture.md |
| `src/models/**`, `schema/**`, `prisma/**`, `migrations/**` | data-architecture.md |
| `src/services/**`, `src/lib/**`, `src/utils/**` | functional-specification.md |
| `package.json`, `go.mod`, `requirements.txt` | decision-rationale.md, configuration-reference.md |
| `.env*`, `config/**`, `*.config.*` | configuration-reference.md |
| `docker*`, `terraform/**`, `k8s/**`, `.github/**` | operations-guide.md |
| `tests/**`, `__tests__/**`, `*.test.*`, `*.spec.*` | test-documentation.md |
| `src/components/**`, `src/pages/**`, `styles/**` | visual-design-system.md |
| `README*`, `CHANGELOG*`, `docs/**` | business-context.md |
| Infrastructure/monitoring files | observability-requirements.md |
| Any tech stack changes | decision-rationale.md |
| External service integrations | integration-points.md |

Skip files that do not map to any doc (e.g., `.gitignore` changes).

Output a refresh plan showing which docs need updates and which are unchanged.

Log: "Step 3 complete: [N] docs need updates, [M] docs unchanged."

### Step 4: Analyze Changes and Update Docs

Log: "Step 4: Updating docs..."

For each affected doc, launch a separate Task agent with `subagent_type=Explore` (or `stackshift:stackshift-code-analyzer:AGENT`). Each agent receives the doc path and its mapped changed files. Agents may run in parallel.

Each agent must:

1. Read the current doc to understand its structure
2. Read the changed files that map to this doc
3. Read the git diff for those files: `git diff "$PINNED_HASH"..HEAD -- "$file"`
4. Determine updates needed:
   - New sections to add (e.g., new API endpoint = new FR)
   - Existing sections to modify (e.g., schema change = update data model)
   - Sections to remove (e.g., deleted feature = remove FR)
   - No change needed (e.g., refactor that does not change behavior)

Update strategy per change type:

| Change Type | Action |
|---|---|
| **New file** (Added) | Add new section/entry to the relevant doc |
| **Modified file** | Read diff, update affected sections, preserve unchanged content |
| **Deleted file** | Mark related sections as removed or deprecated |
| **Renamed file** | Update file paths in the doc |
| **New dependency** | Add to decision-rationale.md and/or integration-points.md |
| **Config change** | Update configuration-reference.md |
| **New test** | Update test-documentation.md coverage |

Surgical updates only -- rewriting entire docs risks losing manually-added content and wastes tokens. Use the Edit tool to modify specific sections.

Always quote file paths in git commands to handle spaces and special characters.

Track the result of each doc update: record which docs succeeded and which failed.

Log after each doc: "Updated [doc-name] ([N] sections changed)" or "FAILED to update [doc-name]: [reason]"

### Step 4b: Verify Updates

Before proceeding, verify that all targeted docs were successfully updated:

1. For each doc that was updated, read the modified sections and confirm the changes match the diff analysis.
2. If any doc update failed or a doc was inadvertently overwritten, restore it from git (`git checkout HEAD -- "path/to/doc"`) and retry with the Edit tool.
3. Build two lists: `successful_docs` (docs that were correctly updated) and `failed_docs` (docs that could not be updated).

If any docs remain in `failed_docs` after retry, keep the old commit hash for those docs in the metadata (Step 5) and note the failures in the summary (Step 7).

Log: "Step 4b complete: [N] docs verified, [M] failures."

### Step 5: Update Metadata

Step 5 must complete before Step 6 (Step 6 uses values computed here).

Log: "Step 5: Updating metadata..."

```bash
NEW_HASH=$(git rev-parse HEAD)
NEW_DATE=$(git log -1 --format=%ci)
REFRESHED_AT=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
```

Update `docs/reverse-engineering/.stackshift-docs-meta.json`:
- Set `commit_hash` to new HEAD
- Set `commit_date` to new date
- For each successfully updated doc, set its `last_updated` to now and `commit_hash` to new HEAD
- For unchanged docs, keep their original timestamps
- For failed docs, keep their original `commit_hash` (do not advance)
- Add an entry to the `refresh_history` array:

```json
{
  "commit_hash": "<NEW_HASH>",
  "commit_date": "<NEW_DATE>",
  "generated_at": "<original generation date>",
  "last_refreshed_at": "<REFRESHED_AT>",
  "doc_count": 11,
  "route": "brownfield",
  "refresh_history": [
    {
      "from_commit": "<OLD_HASH>",
      "to_commit": "<NEW_HASH>",
      "refreshed_at": "<REFRESHED_AT>",
      "commits_analyzed": 42,
      "files_changed": 156,
      "docs_updated": ["functional-specification.md", "data-architecture.md"],
      "docs_unchanged": ["visual-design-system.md", "..."],
      "docs_failed": []
    }
  ],
  "docs": {
    "functional-specification.md": { "generated_at": "<original>", "last_updated": "<REFRESHED_AT>", "commit_hash": "<NEW_HASH>" },
    "visual-design-system.md": { "generated_at": "<original>", "commit_hash": "<OLD_HASH>" }
  }
}
```

The `last_updated` field is optional and added by refresh-docs. Consumers that do not find it should treat the doc as never refreshed (only the original `generated_at` applies).

Log: "Step 5 complete: Metadata updated."

### Step 6: Update Doc Headers

Log: "Step 6: Updating doc headers..."

For each successfully updated doc, update the metadata header line:

```markdown
> **Generated by StackShift** | Commit: `<new-short-hash>` | Updated: `<REFRESHED_AT>` | Originally generated: `<original-date>`
```

Do not update headers for unchanged or failed docs.

Log: "Step 6 complete: [N] headers updated."

### Step 7: Present Summary

Log: "Step 7: Generating summary..."

Present a summary to the user showing:
- Commits analyzed (count, hash range)
- Files changed
- Each updated doc with what was added (+), modified (~), or removed (-)
- List of unchanged docs
- List of failed docs (if any), with reasons
- Suggestion to run `/stackshift.refresh-docs` again after future commits

---

## Full Refresh Mode

If mode is `full` (user-requested or auto-detected):

Auto-detect triggers:
- More than 60% of source files changed
- Major version bumps in package.json/go.mod
- New top-level directories added
- Framework migration detected (e.g., Express to Fastify)

When auto-detected, prompt the user:
```
Large change detected: 78% of source files modified.
A full refresh is recommended over incremental update.
A) Full refresh (regenerate all docs, ~30 min)
B) Incremental anyway (faster but may miss systemic changes)
```

For full refresh, delegate to `/stackshift.reverse-engineer` to regenerate all 11 docs from scratch.

---

## Edge Cases

### Docs exist but no metadata file
Offer two options:
1. Run `/stackshift.reverse-engineer` to regenerate with metadata
2. Create metadata file pinned to current HEAD (treats current docs as up-to-date)

### Pinned commit no longer exists
The commit was rebased or force-pushed away. Fall back to full refresh via `/stackshift.reverse-engineer`.

### No git repository
Cannot do incremental updates. Guide the user to full regeneration via `/stackshift.reverse-engineer`.

### Merge commits
When the diff spans merge commits, use `git diff` (not `git log -p`) to get the net effect rather than per-commit changes.

### Git command failures
If `git diff` or other git commands fail, report the error and suggest: `git fetch --unshallow` for shallow clones, `git fsck` for corruption, or full refresh if the pinned commit is unreachable.

---

## Technical Notes

- Use `git diff --name-status` for file-level change detection (fast).
- Use `git diff "$PINNED_HASH"..HEAD -- "$file"` for content-level analysis. Always quote paths.
- Launch separate Task agents per doc for parallel analysis.
- For large diffs (500+ files), batch the analysis into groups of 50 files.
- Preserve doc structure -- use Edit tool for surgical updates, not Write for full rewrites.
- Commit the metadata JSON to git so team members share the same pinned hash.
