#!/usr/bin/env bash

# Change categorizer module
# Categorizes code changes to determine if spec updates are required

# Categorize code changes to determine spec update requirements
categorizer_analyze() {
  local file="$1"
  local diff="$2"
  local config="${3:-{}}"

  # Check if test file
  if [[ "$file" =~ \.(test|spec)\.(ts|js|tsx|jsx|py|go|rs)$ ]] || [[ "$file" =~ /__tests__/ ]] || [[ "$file" =~ /tests?/ ]]; then
    jq -n '{
      type: "test_only",
      requiresSpecUpdate: false,
      confidence: "high",
      evidence: {
        exportChanges: false,
        signatureChanges: false,
        newFiles: false,
        testFilesOnly: true,
        commentsOnly: false
      }
    }'
    return
  fi

  # Check if documentation file (but not spec.md)
  if [[ "$file" =~ \.md$ ]] && [[ ! "$file" =~ spec\.md$ ]]; then
    jq -n '{
      type: "documentation",
      requiresSpecUpdate: false,
      confidence: "high",
      evidence: {
        exportChanges: false,
        signatureChanges: false,
        newFiles: false,
        testFilesOnly: false,
        commentsOnly: false
      }
    }'
    return
  fi

  # Check for export changes (API surface changes)
  if echo "$diff" | grep -qE '^[+-]\s*export\s+(function|class|interface|type|const|let|var|default|async|abstract)'; then
    jq -n '{
      type: "api_change",
      requiresSpecUpdate: true,
      confidence: "high",
      evidence: {
        exportChanges: true,
        signatureChanges: true,
        newFiles: false,
        testFilesOnly: false,
        commentsOnly: false
      },
      matchedRule: "Export changes detected"
    }'
    return
  fi

  # Check for new file in features/ directory
  if [[ "$file" =~ /features/ ]]; then
    # Check if this is a new file (added lines but no removed lines in diff header)
    if echo "$diff" | head -5 | grep -q "new file mode"; then
      jq -n '{
        type: "feature_addition",
        requiresSpecUpdate: true,
        confidence: "medium",
        evidence: {
          exportChanges: false,
          signatureChanges: false,
          newFiles: true,
          testFilesOnly: false,
          commentsOnly: false
        },
        matchedRule: "New file in features directory"
      }'
      return
    fi

    # Existing feature file modified
    jq -n '{
      type: "feature_modification",
      requiresSpecUpdate: true,
      confidence: "medium",
      evidence: {
        exportChanges: false,
        signatureChanges: false,
        newFiles: false,
        testFilesOnly: false,
        commentsOnly: false
      },
      matchedRule: "Feature file modified"
    }'
    return
  fi

  # Check if only comments changed
  local non_comment_lines=$(echo "$diff" | grep -E '^[+-]' | grep -vE '^\+\s*//' | grep -vE '^\+\s*/\*' | grep -vE '^\+\s*\*' | grep -vE '^\+\s*#' | wc -l | tr -d ' ')
  if [ "$non_comment_lines" -eq 0 ]; then
    jq -n '{
      type: "comments_only",
      requiresSpecUpdate: false,
      confidence: "medium",
      evidence: {
        exportChanges: false,
        signatureChanges: false,
        newFiles: false,
        testFilesOnly: false,
        commentsOnly: true
      }
    }'
    return
  fi

  # Check custom rules from config
  if [ "$config" != "{}" ]; then
    local rules=$(echo "$config" | jq -c '.rules[]?' 2>/dev/null)
    while IFS= read -r rule; do
      [ -z "$rule" ] && continue

      local rule_enabled=$(echo "$rule" | jq -r '.enabled // true')
      [ "$rule_enabled" != "true" ] && continue

      local file_pattern=$(echo "$rule" | jq -r '.filePattern')
      local change_pattern=$(echo "$rule" | jq -r '.changePattern // ""')
      local requires_update=$(echo "$rule" | jq -r '.requiresSpecUpdate')
      local rule_name=$(echo "$rule" | jq -r '.name')

      # Check file pattern match (simplified glob matching)
      local pattern_regex="${file_pattern//\*\*/.*}"
      pattern_regex="${pattern_regex//\*/[^/]*}"
      pattern_regex="^${pattern_regex}$"

      if [[ "$file" =~ $pattern_regex ]]; then
        # Check change pattern if specified
        if [ -n "$change_pattern" ] && [ "$change_pattern" != "null" ]; then
          if echo "$diff" | grep -qE "$change_pattern"; then
            jq -n \
              --arg ruleName "$rule_name" \
              --argjson requiresUpdate "$requires_update" \
              '{
                type: "rule_matched",
                requiresSpecUpdate: $requiresUpdate,
                confidence: "high",
                evidence: {
                  exportChanges: false,
                  signatureChanges: false,
                  newFiles: false,
                  testFilesOnly: false,
                  commentsOnly: false
                },
                matchedRule: $ruleName
              }'
            return
          fi
        else
          # Pattern matched, no change pattern required
          jq -n \
            --arg ruleName "$rule_name" \
            --argjson requiresUpdate "$requires_update" \
            '{
              type: "rule_matched",
              requiresSpecUpdate: $requiresUpdate,
              confidence: "high",
              evidence: {
                exportChanges: false,
                signatureChanges: false,
                newFiles: false,
                testFilesOnly: false,
                commentsOnly: false
              },
              matchedRule: $ruleName
            }'
          return
        fi
      fi
    done <<< "$rules"
  fi

  # Default: internal refactor (no spec update needed)
  jq -n '{
    type: "internal_refactor",
    requiresSpecUpdate: false,
    confidence: "medium",
    evidence: {
      exportChanges: false,
      signatureChanges: false,
      newFiles: false,
      testFilesOnly: false,
      commentsOnly: false
    }
  }'
}
