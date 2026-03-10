#!/usr/bin/env bash

# Spec mapper module
# Maps code files to specification files using explicit config and heuristics

# Source git analyzer for timestamp functions
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/git-analyzer.sh"

# Find specs related to a code file
mapper_find_specs() {
  local file="$1"
  local config="$2"
  local specs_json="[]"

  # 1. Check explicit mappings first
  local explicit_specs=$(mapper_check_explicit "$file" "$config")
  if [ "$explicit_specs" != "[]" ] && [ -n "$explicit_specs" ]; then
    specs_json="$explicit_specs"
  else
    # 2. Fall back to heuristic matching
    specs_json=$(mapper_heuristic_match "$file")
  fi

  echo "$specs_json"
}

# Check explicit file-to-spec mappings in configuration
mapper_check_explicit() {
  local file="$1"
  local config="$2"
  local specs_json="[]"

  # Get file mappings from config
  local mappings=$(echo "$config" | jq -r '.fileMappings // {}' 2>/dev/null)

  if [ -z "$mappings" ] || [ "$mappings" = "{}" ]; then
    echo "[]"
    return
  fi

  # Check each mapping pattern
  while IFS= read -r pattern; do
    [ -z "$pattern" ] && continue

    # Simple pattern matching (can be enhanced)
    # For now, do exact match or simple glob
    if [[ "$file" == $pattern ]]; then
      # Get spec paths for this pattern
      local spec_paths=$(echo "$mappings" | jq -r --arg p "$pattern" '.[$p][]?' 2>/dev/null)

      while IFS= read -r spec_path; do
        [ -z "$spec_path" ] && continue

        if [ -f "$spec_path" ]; then
          local abs_spec_path="$(cd "$(dirname "$spec_path")" && pwd)/$(basename "$spec_path")"
          local spec_time=$(git_get_last_commit_time "$spec_path")

          local spec_json=$(jq -n \
            --arg specPath "$spec_path" \
            --arg absPath "$abs_spec_path" \
            --arg source "explicit" \
            --arg specTime "$spec_time" \
            '{
              specPath: $specPath,
              absoluteSpecPath: $absPath,
              mappingSource: $source,
              confidence: 1.0,
              specLastModified: $specTime
            }')
          specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
        fi
      done <<< "$spec_paths"
    fi
  done <<< "$(echo "$mappings" | jq -r 'keys[]?' 2>/dev/null)"

  echo "$specs_json"
}

# Heuristic matching: extract feature name and find matching specs
mapper_heuristic_match() {
  local file="$1"
  local specs_json="[]"
  local feature_name=""

  # Extract potential feature names from path
  # Pattern 1: src/features/auth/login.ts → "auth"
  if [[ "$file" =~ /features/([^/]+)/ ]]; then
    feature_name="${BASH_REMATCH[1]}"
  # Pattern 2: src/tools/analyze.ts → "analyze"
  elif [[ "$file" =~ /tools/([^/]+)\. ]]; then
    feature_name="${BASH_REMATCH[1]}"
  fi

  # Search for specs containing this feature name
  if [ -n "$feature_name" ]; then
    # Search in common spec directories
    local spec_dirs=("specs" "production-readiness-specs" ".specify/specs")

    for spec_dir in "${spec_dirs[@]}"; do
      if [ -d "$spec_dir" ]; then
        while IFS= read -r spec_file; do
          if [ -f "$spec_file" ]; then
            local abs_spec_path="$(cd "$(dirname "$spec_file")" && pwd)/$(basename "$spec_file")"
            local spec_time=$(git_get_last_commit_time "$spec_file")

            local spec_json=$(jq -n \
              --arg specPath "$spec_file" \
              --arg absPath "$abs_spec_path" \
              --arg source "heuristic" \
              --arg specTime "$spec_time" \
              '{
                specPath: $specPath,
                absoluteSpecPath: $absPath,
                mappingSource: $source,
                confidence: 0.8,
                specLastModified: $specTime
              }')
            specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
          fi
        done < <(find "$spec_dir" -type f -name "spec.md" -path "*$feature_name*" 2>/dev/null)
      fi
    done
  fi

  # Fallback: if no feature-specific match, check all specs but with lower confidence
  if [ "$specs_json" = "[]" ]; then
    local count=0
    for spec_dir in "specs" "production-readiness-specs"; do
      if [ -d "$spec_dir" ]; then
        while IFS= read -r spec_file; do
          if [ -f "$spec_file" ] && [ $count -lt 3 ]; then
            local abs_spec_path="$(cd "$(dirname "$spec_file")" && pwd)/$(basename "$spec_file")"
            local spec_time=$(git_get_last_commit_time "$spec_file")

            local spec_json=$(jq -n \
              --arg specPath "$spec_file" \
              --arg absPath "$abs_spec_path" \
              --arg source "heuristic" \
              --arg specTime "$spec_time" \
              '{
                specPath: $specPath,
                absoluteSpecPath: $absPath,
                mappingSource: $source,
                confidence: 0.5,
                specLastModified: $specTime
              }')
            specs_json=$(echo "$specs_json" | jq --argjson spec "$spec_json" '. + [$spec]')
            count=$((count + 1))
          fi
        done < <(find "$spec_dir" -type f -name "spec.md" 2>/dev/null | head -3)
      fi
    done
  fi

  echo "$specs_json"
}
