#!/bin/bash
# StackShift Web Batch Preparation Script
#
# Prepares a branch with pre-configured StackShift setup for Claude Code Web
# Perfect for batch processing multiple projects efficiently

set -e

PROJECT_NAME=$1
ROUTE=$2  # greenfield or brownfield
MODE=${3:-cruise}  # cruise or manual
SCOPE=${4:-p0_p1}  # none, p0, p0_p1, all

if [ -z "$PROJECT_NAME" ] || [ -z "$ROUTE" ]; then
  echo "Usage: ./prepare-web-batch.sh <project-name> <route> [mode] [scope]"
  echo ""
  echo "Examples:"
  echo "  ./prepare-web-batch.sh my-app brownfield cruise p0_p1"
  echo "  ./prepare-web-batch.sh legacy-app greenfield cruise all"
  echo ""
  echo "Arguments:"
  echo "  project-name  - Name of the project to analyze"
  echo "  route         - greenfield or brownfield"
  echo "  mode          - cruise or manual (default: cruise)"
  echo "  scope         - none, p0, p0_p1, all (default: p0_p1)"
  exit 1
fi

# Validate project name (alphanumeric, hyphens, underscores only)
if [[ ! "$PROJECT_NAME" =~ ^[a-zA-Z0-9_-]+$ ]]; then
  echo "Error: project-name must contain only letters, numbers, hyphens, and underscores"
  exit 1
fi

# Validate route
if [[ "$ROUTE" != "greenfield" ]] && [[ "$ROUTE" != "brownfield" ]]; then
  echo "Error: route must be 'greenfield' or 'brownfield'"
  exit 1
fi

BRANCH_NAME="stackshift-web/${PROJECT_NAME}-$(date +%Y%m%d-%H%M%S)"

echo "🚗 Preparing StackShift Web batch for: $PROJECT_NAME"
echo "   Route: $ROUTE"
echo "   Mode: $MODE"
echo "   Scope: $SCOPE"
echo "   Branch: $BRANCH_NAME"
echo ""

# Create branch
echo "1. Creating branch..."
git checkout -b "$BRANCH_NAME"

# Create .specify/ structure
echo "2. Creating .specify/ structure..."
mkdir -p .specify/memory/specifications
mkdir -p .specify/memory/plans
mkdir -p .specify/templates
mkdir -p .specify/scripts

# Copy Spec Kit templates
echo "3. Copying Spec Kit templates..."
if [ -d "../stackshift/plugin/speckit-templates" ]; then
  cp ../stackshift/plugin/speckit-templates/*.md .specify/templates/ 2>/dev/null || true
fi

# Create greenfield directory if greenfield route
if [ "$ROUTE" = "greenfield" ]; then
  echo "4a. Creating greenfield directory structure..."
  mkdir -p greenfield
  cat > greenfield/README.md <<'GREENFIELD_README'
# Greenfield Rebuild

This directory contains the NEW implementation built from business logic
extracted from the legacy application.

## Original Application

See parent directory for:
- Legacy code (original implementation)
- Business logic documentation (docs/reverse-engineering/)
- Tech-agnostic specifications (.specify/)

## This Application

Built from specifications using: ${TARGET_STACK}

**Status:** Being built by StackShift Gear 6

**Implementation approach:**
- Read specs from ../.specify/memory/specifications/
- Implement each feature in chosen tech stack
- Follow implementation plans from ../.specify/memory/plans/
- Test against acceptance criteria from specs

## Structure

[Will be created by StackShift during Gear 6]

## Next Steps

StackShift will initialize this directory with the new tech stack and
implement features from the specifications.
GREENFIELD_README
fi

# Create pre-configured state
echo "4. Creating pre-configured state..."
cat > .stackshift-state.json <<EOF
{
  "version": "1.0.0",
  "created": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "updated": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")",
  "path": "$ROUTE",
  "auto_mode": $([ "$MODE" = "cruise" ] && echo "true" || echo "false"),
  "currentStep": "analyze",
  "completedSteps": [],
  "metadata": {
    "projectName": "$PROJECT_NAME",
    "projectPath": "$(pwd)",
    "pathDescription": "$([ "$ROUTE" = "greenfield" ] && echo "Build new app from business logic (tech-agnostic)" || echo "Manage existing app with Spec Kit (tech-prescriptive)")",
    "preparedFor": "web",
    "preparedAt": "$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")"
  },
  "config": {
    "route": "$ROUTE",
    "mode": "$MODE",
    "clarifications_strategy": "defer",
    "implementation_scope": "$SCOPE",
    "target_stack": null,
    "greenfield_location": "greenfield/"
  },
  "stepDetails": {}
}
EOF

# Create README for web user
echo "5. Creating instructions..."
cat > STACKSHIFT_WEB_INSTRUCTIONS.md <<'EOF'
# StackShift Pre-Configured for Claude Code Web

This branch is pre-configured for StackShift analysis!

## Configuration

Check `.stackshift-state.json` for your configuration:
- Route: greenfield or brownfield
- Mode: manual or cruise control
- Implementation scope: what to build

## How to Use in Claude Code Web

### Option 1: Automatic (Cruise Control)

Just say:

```
Resume StackShift cruise control from the beginning
```

Claude will read `.stackshift-state.json` and shift through all 6 gears automatically!

### Option 2: Manual

Say:

```
Start StackShift analysis in manual mode
```

Then proceed gear by gear:
- Gear 1: Analyze
- Gear 2: Reverse engineer
- Gear 3: Create specifications
- Gear 4: Gap analysis
- Gear 5: Complete specification
- Gear 6: Implement

## What's Pre-Configured

- ✅ .stackshift-state.json with your configuration
- ✅ .specify/templates/ for slash commands (if Spec Kit CLI unavailable)
- ✅ Directory structure ready

## After Completion

Download these files:
- .specify/ (specifications)
- docs/ (documentation)
- .stackshift-state.json (state)

Then merge back to main or extract what you need!

## Progress

Check your progress at any time:

```
Show me the contents of .stackshift-state.json
```

---

Ready to shift through the gears! 🚗
EOF

# Commit
echo "6. Committing..."
if [ "$ROUTE" = "greenfield" ]; then
  git add .stackshift-state.json .specify/ STACKSHIFT_WEB_INSTRUCTIONS.md greenfield/
else
  git add .stackshift-state.json .specify/ STACKSHIFT_WEB_INSTRUCTIONS.md
fi
git commit -m "chore: prepare StackShift web batch for $PROJECT_NAME

Pre-configured for Claude Code Web:
- Route: $ROUTE
- Mode: $MODE
- Scope: $SCOPE

Ready for analysis in browser!"

# Push
echo "7. Pushing to GitHub..."
git push -u origin "$BRANCH_NAME"

echo ""
echo "✅ Branch ready for Claude Code Web!"
echo ""
echo "✅ Next steps:"
echo ""
echo "1. Go to: https://claude.ai/code"
echo "2. Connect to your GitHub repo"
echo "3. Select branch: $BRANCH_NAME"
echo "4. Say: 'Resume StackShift cruise control from the beginning'"
echo "5. StackShift will shift through all 6 gears and commit changes to this branch"
echo ""
echo "After completion:"
echo "  git fetch origin"
echo "  git checkout $BRANCH_NAME"
echo "  git log  # See StackShift's commits"
echo "  # Review and merge to main"
echo ""
echo "Branch: $BRANCH_NAME"
echo "GitHub URL: https://github.com/jschulte/$(basename $(pwd))/tree/$BRANCH_NAME"
