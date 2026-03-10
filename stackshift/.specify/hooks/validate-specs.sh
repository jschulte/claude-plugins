#!/usr/bin/env bash
set -e

# Main entry point for spec validation hook
# Validates that code changes have corresponding spec updates before git push

# Load modules
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/modules/config.sh"
source "$SCRIPT_DIR/modules/validator.sh"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Main validation function
main() {
  # Check for emergency bypass
  if [ "${SKIP_SPEC_SYNC:-0}" = "1" ]; then
    echo -e "${YELLOW}⚠️  Spec sync validation skipped (SKIP_SPEC_SYNC=1)${NC}"
    exit 0
  fi

  # Parse input (from Claude Code hook or direct invocation)
  local input="${1:-}"
  local command=""

  if [ -n "$input" ]; then
    # Try to parse JSON input
    command=$(echo "$input" | jq -r '.command // ""' 2>/dev/null || echo "")
  fi

  # Only validate git push commands (if input was provided)
  if [ -n "$input" ] && [[ ! "$command" =~ ^git\ push ]]; then
    exit 0
  fi

  # Show validation header
  echo ""
  echo -e "${BLUE}🔍 Validating spec synchronization...${NC}"
  echo ""

  # Load configuration
  local config=$(config_load)
  local mode=$(echo "$config" | jq -r '.mode // "lenient"')

  # Check if validation is disabled
  if [ "$mode" = "off" ]; then
    echo -e "${YELLOW}ℹ️  Spec sync validation is disabled (mode: off)${NC}"
    exit 0
  fi

  # Check if there are any changes to validate
  if ! git_has_changes; then
    echo -e "${GREEN}✅ No changes to validate${NC}"
    exit 0
  fi

  # Run validation
  local results=$(validator_run "$config")

  # Count results by status
  local total=$(echo "$results" | jq 'length')
  local failures=$(echo "$results" | jq '[.[] | select(.status == "fail")] | length')
  local warnings=$(echo "$results" | jq '[.[] | select(.status == "warning")] | length')
  local passed=$(echo "$results" | jq '[.[] | select(.status == "pass")] | length')

  # Show results summary
  if [ "$failures" -gt 0 ]; then
    echo -e "${RED}❌ Spec validation failed${NC}"
    echo ""
    echo -e "${RED}📁 Changed files with outdated specs:${NC}"
    echo ""

    # Show each failure
    while IFS= read -r result; do
      local file=$(echo "$result" | jq -r '.filePath')
      local failure_reason=$(echo "$result" | jq -r '.failureReason // "Unknown"')

      echo -e "  ${RED}•${NC} ${file}"
      echo -e "    ${YELLOW}Reason:${NC} $failure_reason"

      # Show spec details
      local spec_results=$(echo "$result" | jq -c '.specResults[]?' 2>/dev/null)
      while IFS= read -r spec_result; do
        [ -z "$spec_result" ] && continue

        local spec_path=$(echo "$spec_result" | jq -r '.specPath')
        local spec_status=$(echo "$spec_result" | jq -r '.status')
        local spec_time=$(echo "$spec_result" | jq -r '.lastSpecUpdate // "N/A"')
        local code_time=$(echo "$spec_result" | jq -r '.lastCodeUpdate // "N/A"')

        echo -e "    ${BLUE}→${NC} ${spec_path} (${spec_status})"
        if [ "$spec_status" = "outdated" ]; then
          echo -e "      Last spec update: ${spec_time}"
          echo -e "      Last code update: ${code_time}"
        fi
      done <<< "$spec_results"

      echo ""
    done < <(echo "$results" | jq -c '.[] | select(.status == "fail")')

    # Show fix instructions
    echo -e "${YELLOW}💡 To fix:${NC}"
    echo "  1. Update the spec files listed above"
    echo "  2. Commit the spec changes"
    echo "  3. Push again"
    echo ""
    echo -e "${YELLOW}🚨 Or bypass this check (not recommended):${NC}"
    echo "  SKIP_SPEC_SYNC=1 git push"
    echo ""

    # Show summary
    echo -e "${BLUE}Summary:${NC} $passed passed, $failures failed, $warnings warnings (of $total files checked)"
    echo ""

    # Exit based on mode
    if [ "$mode" = "strict" ]; then
      exit 1
    else
      echo -e "${YELLOW}⚠️  Allowing push in lenient mode${NC}"
      exit 0
    fi

  elif [ "$warnings" -gt 0 ]; then
    # Warnings but no failures
    echo -e "${YELLOW}⚠️  Spec validation passed with warnings${NC}"
    echo ""

    while IFS= read -r result; do
      local file=$(echo "$result" | jq -r '.filePath')
      local reason=$(echo "$result" | jq -r '.reason // "Unknown"')
      echo -e "  ${YELLOW}•${NC} ${file}: $reason"
    done < <(echo "$results" | jq -c '.[] | select(.status == "warning")')

    echo ""
    echo -e "${BLUE}Summary:${NC} $passed passed, $failures failed, $warnings warnings (of $total files checked)"
    echo ""
    exit 0

  else
    # All passed
    echo -e "${GREEN}✅ Spec validation passed${NC}"
    echo ""

    if [ "$total" -gt 0 ]; then
      echo "All $total changed file(s) have up-to-date specs."
    else
      echo "No files requiring spec validation found."
    fi

    echo ""
    exit 0
  fi
}

# Run main function
main "$@"
