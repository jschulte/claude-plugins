#!/usr/bin/env bash
#
# check-prerequisites.sh - Validate feature directory and required documentation
#
# Usage:
#   ./check-prerequisites.sh [--json] [--require-tasks] [--include-tasks] [--paths-only]
#
# Options:
#   --json            Output as JSON format
#   --require-tasks   Fail if tasks.md doesn't exist
#   --include-tasks   Include tasks.md in available docs list
#   --paths-only      Only output paths, skip validation
#   --help            Show this help message

set -e

# Default options
JSON_OUTPUT=false
REQUIRE_TASKS=false
INCLUDE_TASKS=false
PATHS_ONLY=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json)
      JSON_OUTPUT=true
      shift
      ;;
    --require-tasks)
      REQUIRE_TASKS=true
      shift
      ;;
    --include-tasks)
      INCLUDE_TASKS=true
      shift
      ;;
    --paths-only)
      PATHS_ONLY=true
      shift
      ;;
    --help)
      grep '^#' "$0" | sed 's/^# \?//'
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      echo "Use --help for usage information" >&2
      exit 1
      ;;
  esac
done

# Get current git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Determine feature directory based on branch or current directory
if [[ "$CURRENT_BRANCH" =~ ^claude/plan-(.+)-[A-Za-z0-9]+$ ]]; then
  # Extract feature name from branch
  FEATURE_NAME="${BASH_REMATCH[1]}"

  # Look for feature directory in production-readiness-specs/
  if [ -d "production-readiness-specs/F002-${FEATURE_NAME}" ]; then
    FEATURE_DIR="$(pwd)/production-readiness-specs/F002-${FEATURE_NAME}"
  elif [ -d "production-readiness-specs/${FEATURE_NAME}" ]; then
    FEATURE_DIR="$(pwd)/production-readiness-specs/${FEATURE_NAME}"
  else
    # Fallback: look for any matching directory
    FEATURE_DIR=$(find production-readiness-specs -maxdepth 1 -type d -name "*${FEATURE_NAME}*" -print -quit 2>/dev/null || echo "")
  fi
else
  # No feature branch detected, use current directory if it looks like a feature dir
  if [ -f "spec.md" ] && [ -f "impl-plan.md" ]; then
    FEATURE_DIR="$(pwd)"
  else
    FEATURE_DIR=""
  fi
fi

# Paths-only mode: just output the directory and exit
if [ "$PATHS_ONLY" = true ]; then
  if [ -n "$FEATURE_DIR" ]; then
    echo "FEATURE_DIR=$FEATURE_DIR"
  fi
  exit 0
fi

# Validate feature directory exists
if [ -z "$FEATURE_DIR" ] || [ ! -d "$FEATURE_DIR" ]; then
  echo "ERROR: Feature directory not found" >&2
  echo "Branch: $CURRENT_BRANCH" >&2
  echo "Expected: production-readiness-specs/F002-*/ or production-readiness-specs/*/" >&2
  exit 1
fi

# Check for required files
PLAN_MD="$FEATURE_DIR/impl-plan.md"
SPEC_MD="$FEATURE_DIR/spec.md"
TASKS_MD="$FEATURE_DIR/tasks.md"

# Required files
if [ ! -f "$PLAN_MD" ]; then
  echo "ERROR: Required file not found: impl-plan.md" >&2
  echo "Feature directory: $FEATURE_DIR" >&2
  exit 1
fi

if [ ! -f "$SPEC_MD" ]; then
  echo "ERROR: Required file not found: spec.md" >&2
  echo "Feature directory: $FEATURE_DIR" >&2
  exit 1
fi

# Check tasks.md if required
if [ "$REQUIRE_TASKS" = true ] && [ ! -f "$TASKS_MD" ]; then
  echo "ERROR: Required file not found: tasks.md" >&2
  echo "Feature directory: $FEATURE_DIR" >&2
  echo "Run: /speckit.tasks to generate tasks.md" >&2
  exit 1
fi

# Build list of available optional docs
AVAILABLE_DOCS=()

# Always include required docs
AVAILABLE_DOCS+=("spec.md")
AVAILABLE_DOCS+=("impl-plan.md")

# Include tasks.md if it exists and --include-tasks is set
if [ "$INCLUDE_TASKS" = true ] && [ -f "$TASKS_MD" ]; then
  AVAILABLE_DOCS+=("tasks.md")
fi

# Check for optional docs
[ -f "$FEATURE_DIR/research.md" ] && AVAILABLE_DOCS+=("research.md")
[ -f "$FEATURE_DIR/data-model.md" ] && AVAILABLE_DOCS+=("data-model.md")
[ -f "$FEATURE_DIR/quickstart.md" ] && AVAILABLE_DOCS+=("quickstart.md")
[ -f "$FEATURE_DIR/agent-context.md" ] && AVAILABLE_DOCS+=("agent-context.md")
[ -d "$FEATURE_DIR/contracts" ] && AVAILABLE_DOCS+=("contracts/")

# Output results
if [ "$JSON_OUTPUT" = true ]; then
  # JSON output
  echo -n '{"FEATURE_DIR":"'
  echo -n "$FEATURE_DIR"
  echo -n '","AVAILABLE_DOCS":['

  first=true
  for doc in "${AVAILABLE_DOCS[@]}"; do
    if [ "$first" = true ]; then
      first=false
    else
      echo -n ","
    fi
    echo -n "\"$doc\""
  done

  echo ']}'
else
  # Human-readable output
  echo "Feature Directory: $FEATURE_DIR"
  echo ""
  echo "Available Documentation:"
  for doc in "${AVAILABLE_DOCS[@]}"; do
    echo "  ✓ $doc"
  done
fi

exit 0
