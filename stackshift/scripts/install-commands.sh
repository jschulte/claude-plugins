#!/bin/bash

# StackShift Slash Commands Installer
# Installs StackShift slash commands to current project for Claude Code use
#
# ⚠️ IMPORTANT: Slash commands only work in Claude Code, not VSCode/Copilot!
# For VSCode/Copilot users, use web/WEB_BOOTSTRAP.md instead.

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACKSHIFT_ROOT="$(dirname "$SCRIPT_DIR")"
COMMANDS_SOURCE="$STACKSHIFT_ROOT/commands"

# Get target directory (default: current working directory)
TARGET_DIR="${1:-.}"
TARGET_COMMANDS_DIR="$TARGET_DIR/.claude/commands"

echo "🚗 StackShift Slash Commands Installer"
echo ""
echo "Source: $COMMANDS_SOURCE"
echo "Target: $TARGET_COMMANDS_DIR"
echo ""

# Check if source exists
if [ ! -d "$COMMANDS_SOURCE" ]; then
  echo "❌ Error: StackShift commands directory not found at $COMMANDS_SOURCE"
  echo ""
  echo "Make sure you're running this script from the StackShift repository:"
  echo "  cd /path/to/stackshift"
  echo "  ./scripts/install-commands.sh"
  exit 1
fi

# Create target directory
mkdir -p "$TARGET_COMMANDS_DIR"
echo "✅ Created directory: $TARGET_COMMANDS_DIR"

# Copy all command files
echo ""
echo "📋 Copying slash commands..."
cp "$COMMANDS_SOURCE"/*.md "$TARGET_COMMANDS_DIR/"

# Count installed commands
STACKSHIFT_COUNT=$(ls "$TARGET_COMMANDS_DIR"/stackshift.*.md 2>/dev/null | wc -l | tr -d ' ')
SPECKIT_COUNT=$(ls "$TARGET_COMMANDS_DIR"/speckit.*.md 2>/dev/null | wc -l | tr -d ' ')
TOTAL_COUNT=$((STACKSHIFT_COUNT + SPECKIT_COUNT))

echo "  Installed $STACKSHIFT_COUNT StackShift commands"
echo "  Installed $SPECKIT_COUNT Spec Kit commands"
echo "  Total: $TOTAL_COUNT commands"
echo ""

# List installed commands
echo "📝 Installed commands:"
echo ""
echo "StackShift:"
for cmd in "$TARGET_COMMANDS_DIR"/stackshift.*.md; do
  if [ -f "$cmd" ]; then
    basename "$cmd" .md | sed 's/^/  \//'
  fi
done

echo ""
echo "Spec Kit:"
for cmd in "$TARGET_COMMANDS_DIR"/speckit.*.md; do
  if [ -f "$cmd" ]; then
    basename "$cmd" .md | sed 's/^/  \//'
  fi
done

echo ""
echo "✅ Installation complete!"
echo ""
echo "Next steps:"
echo "  1. Commit commands to your repo:"
echo "     git add .claude/commands/"
echo "     git commit -m \"Add StackShift slash commands\""
echo ""
echo "  2. (Optional) Update .gitignore to track commands:"
echo "     echo '!.claude/commands/*.md' >> .gitignore"
echo ""
echo "  3. Start using StackShift:"
echo "     /stackshift.start"
echo ""
echo "Your team will get these commands when they clone! 🎉"
echo ""
echo "⚠️  Note: Slash commands only work in Claude Code."
echo "   For VSCode/Copilot, use web/WEB_BOOTSTRAP.md instead."
