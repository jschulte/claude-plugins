#!/usr/bin/env bash

# Validator module
# Validates changed files against their related specifications

# Source required modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/config.sh"
source "$SCRIPT_DIR/git-analyzer.sh"
source "$SCRIPT_DIR/mapper.sh"
source "$SCRIPT_DIR/categorizer.sh"

# Validate a single file against its related specs
validator_check_file() {
  local file="$1"
  local config="$2"
  local start_time=$(date +%s%3N)

  # Get file diff for categorization
  local diff=$(git_get_file_diff "$file")

  # Categorize the change
  local category=$(categorizer_analyze "$file" "$diff" "$config")
  local requires_update=$(echo "$category" | jq -r '.requiresSpecUpdate')

  # If no update required, mark as pass
  if [ "$requires_update" = "false" ]; then
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    jq -n \
      --arg filePath "$file" \
      --arg duration "$duration" \
      '{
        filePath: $filePath,
        status: "pass",
        reason: "No spec update required for this change type",
        validationTime: ($duration | tonumber)
      }'
    return
  fi

  # Find related specs
  local specs=$(mapper_find_specs "$file" "$config")

  # If no specs found, that's a warning but not a failure
  if [ "$specs" = "[]" ] || [ -z "$specs" ]; then
    local end_time=$(date +%s%3N)
    local duration=$((end_time - start_time))

    jq -n \
      --arg filePath "$file" \
      --arg duration "$duration" \
      '{
        filePath: $filePath,
        status: "warning",
        reason: "No related specification found for this file",
        failureReason: "No specs mapped to this file",
        requiredAction: "Either add a spec mapping or create a specification",
        validationTime: ($duration | tonumber)
      }'
    return
  fi

  # Get file's last commit time
  local code_time=$(git_get_last_commit_time "$file")

  # Check each spec
  local spec_results="[]"
  local has_outdated=false

  while IFS= read -r spec; do
    local spec_path=$(echo "$spec" | jq -r '.specPath')
    local spec_time=$(echo "$spec" | jq -r '.specLastModified // "1970-01-01T00:00:00Z"')

    # If spec file doesn't exist, that's a failure
    if [ ! -f "$spec_path" ]; then
      has_outdated=true
      local spec_result=$(jq -n \
        --arg specPath "$spec_path" \
        '{
          specPath: $specPath,
          status: "missing",
          lastSpecUpdate: "N/A",
          lastCodeUpdate: "N/A",
          suggestedUpdate: "Create specification file"
        }')
      spec_results=$(echo "$spec_results" | jq --argjson r "$spec_result" '. + [$r]')
      continue
    fi

    # Compare timestamps (if spec_time is empty, use file modification time)
    if [ -z "$spec_time" ] || [ "$spec_time" = "null" ]; then
      spec_time=$(git_get_last_commit_time "$spec_path")
    fi

    # Check if code is newer than spec (spec is outdated)
    if [[ "$code_time" > "$spec_time" ]]; then
      has_outdated=true
      local spec_result=$(jq -n \
        --arg specPath "$spec_path" \
        --arg lastSpecUpdate "$spec_time" \
        --arg lastCodeUpdate "$code_time" \
        '{
          specPath: $specPath,
          status: "outdated",
          lastSpecUpdate: $lastSpecUpdate,
          lastCodeUpdate: $lastCodeUpdate,
          suggestedUpdate: "Update specification to reflect code changes",
          autoFixAvailable: true
        }')
      spec_results=$(echo "$spec_results" | jq --argjson r "$spec_result" '. + [$r]')
    else
      # Spec is up to date
      local spec_result=$(jq -n \
        --arg specPath "$spec_path" \
        --arg lastSpecUpdate "$spec_time" \
        --arg lastCodeUpdate "$code_time" \
        '{
          specPath: $specPath,
          status: "up_to_date",
          lastSpecUpdate: $lastSpecUpdate,
          lastCodeUpdate: $lastCodeUpdate
        }')
      spec_results=$(echo "$spec_results" | jq --argjson r "$spec_result" '. + [$r]')
    fi
  done < <(echo "$specs" | jq -c '.[]')

  # Generate final result
  local end_time=$(date +%s%3N)
  local duration=$((end_time - start_time))

  if [ "$has_outdated" = true ]; then
    jq -n \
      --arg filePath "$file" \
      --argjson specResults "$spec_results" \
      --arg duration "$duration" \
      '{
        filePath: $filePath,
        status: "fail",
        specResults: $specResults,
        failureReason: "One or more specifications are outdated",
        requiredAction: "Update the outdated specifications before pushing",
        validationTime: ($duration | tonumber)
      }'
  else
    jq -n \
      --arg filePath "$file" \
      --argjson specResults "$spec_results" \
      --arg duration "$duration" \
      '{
        filePath: $filePath,
        status: "pass",
        specResults: $specResults,
        validationTime: ($duration | tonumber)
      }'
  fi
}

# Run validation on all changed files
validator_run() {
  local config="$1"
  local changed_files=$(git_get_changed_files)
  local results="[]"

  # If no config provided, load default
  if [ -z "$config" ] || [ "$config" = "{}" ]; then
    config=$(config_load)
  fi

  # Process each changed file
  while IFS= read -r file_json; do
    local file=$(echo "$file_json" | jq -r '.path')

    # Skip ignored files
    if config_should_ignore "$file"; then
      continue
    fi

    # Validate file
    local result=$(validator_check_file "$file" "$config")
    results=$(echo "$results" | jq --argjson r "$result" '. + [$r]')
  done < <(echo "$changed_files" | jq -c '.[]')

  echo "$results"
}
