#!/usr/bin/env bash

# Git analysis utilities for spec synchronization
# Extracts git context, changed files, diffs, and commit timestamps

# Get git repository context information
git_get_context() {
  local repo_root=$(git rev-parse --show-toplevel 2>/dev/null || echo "")
  local current_branch=$(git branch --show-current 2>/dev/null || echo "")
  local remote_branch=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "origin/main")
  local base_commit=$(git merge-base HEAD "$remote_branch" 2>/dev/null || echo "HEAD")
  local head_commit=$(git rev-parse HEAD 2>/dev/null || echo "")
  local commit_count=$(git rev-list --count "$base_commit".."$head_commit" 2>/dev/null || echo "0")

  # Get diff summary
  local files_changed=$(git diff --name-only "$base_commit" HEAD 2>/dev/null | wc -l | tr -d ' ')
  local insertions=$(git diff --numstat "$base_commit" HEAD 2>/dev/null | awk '{sum+=$1} END {print sum+0}')
  local deletions=$(git diff --numstat "$base_commit" HEAD 2>/dev/null | awk '{sum+=$2} END {print sum+0}')

  jq -n \
    --arg repoRoot "$repo_root" \
    --arg currentBranch "$current_branch" \
    --arg remoteBranch "$remote_branch" \
    --arg baseCommit "$base_commit" \
    --arg headCommit "$head_commit" \
    --arg commitCount "$commit_count" \
    --arg filesChanged "$files_changed" \
    --arg insertions "$insertions" \
    --arg deletions "$deletions" \
    '{
      repoRoot: $repoRoot,
      currentBranch: $currentBranch,
      remoteBranch: $remoteBranch,
      baseCommit: $baseCommit,
      headCommit: $headCommit,
      commitCount: ($commitCount | tonumber),
      diffSummary: {
        filesChanged: ($filesChanged | tonumber),
        insertions: ($insertions | tonumber),
        deletions: ($deletions | tonumber)
      }
    }'
}

# Get list of changed files with metadata
git_get_changed_files() {
  local context=$(git_get_context)
  local base_commit=$(echo "$context" | jq -r '.baseCommit')
  local repo_root=$(echo "$context" | jq -r '.repoRoot')
  local files_json="[]"

  # Get changed files from git
  while IFS=$'\t' read -r status file; do
    [ -z "$status" ] && continue

    # Determine change type
    local change_type
    case "${status:0:1}" in
      A) change_type="added" ;;
      M) change_type="modified" ;;
      D) change_type="deleted" ;;
      R) change_type="renamed" ;;
      *) change_type="unknown" ;;
    esac

    # Get stats if file exists and is not deleted
    local additions=0
    local deletions=0
    if [ "$change_type" != "deleted" ] && [ -f "$file" ]; then
      local stats=$(git diff --numstat "$base_commit" HEAD -- "$file" 2>/dev/null | head -1)
      if [ -n "$stats" ]; then
        additions=$(echo "$stats" | awk '{print $1}' | grep -E '^[0-9]+$' || echo "0")
        deletions=$(echo "$stats" | awk '{print $2}' | grep -E '^[0-9]+$' || echo "0")
      fi
    fi

    # Build file JSON
    local file_json=$(jq -n \
      --arg path "$file" \
      --arg absPath "$repo_root/$file" \
      --arg changeType "$change_type" \
      --arg additions "$additions" \
      --arg deletions "$deletions" \
      '{
        path: $path,
        absolutePath: $absPath,
        changeType: $changeType,
        stats: {
          additions: ($additions | tonumber),
          deletions: ($deletions | tonumber)
        }
      }')

    files_json=$(echo "$files_json" | jq --argjson file "$file_json" '. + [$file]')
  done < <(git diff --name-status "$base_commit" HEAD 2>/dev/null)

  echo "$files_json"
}

# Get diff for a specific file
git_get_file_diff() {
  local file="$1"
  local context=$(git_get_context)
  local base_commit=$(echo "$context" | jq -r '.baseCommit')

  git diff "$base_commit" HEAD -- "$file" 2>/dev/null || echo ""
}

# Get last commit time for a file (ISO 8601 format)
git_get_last_commit_time() {
  local file="$1"

  # Try to get commit time, fall back to file modification time if no commits
  local commit_time=$(git log -1 --format="%aI" -- "$file" 2>/dev/null)

  if [ -z "$commit_time" ]; then
    # File not in git history, use file modification time
    if [ -f "$file" ]; then
      # Get file modification time in ISO 8601 format
      commit_time=$(date -r "$file" -Iseconds 2>/dev/null || echo "1970-01-01T00:00:00Z")
    else
      commit_time="1970-01-01T00:00:00Z"
    fi
  fi

  echo "$commit_time"
}

# Check if there are any changes to push
git_has_changes() {
  local context=$(git_get_context)
  local base_commit=$(echo "$context" | jq -r '.baseCommit')
  local head_commit=$(echo "$context" | jq -r '.headCommit')

  [ "$base_commit" != "$head_commit" ]
}
