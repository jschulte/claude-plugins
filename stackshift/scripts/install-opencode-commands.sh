#!/bin/bash

# StackShift OpenCode Commands Installer
# Installs StackShift speckit commands for OpenCode

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACKSHIFT_ROOT="$(dirname "$SCRIPT_DIR")"
COMMANDS_SOURCE="$STACKSHIFT_ROOT/commands"
OPENCODE_DIR="$HOME/.config/opencode/command"

echo "🚗 StackShift OpenCode Installer"
echo ""
echo "Source: $COMMANDS_SOURCE"
echo "Target: $OPENCODE_DIR"
echo ""

# Check if source exists
if [ ! -d "$COMMANDS_SOURCE" ]; then
  echo "❌ Error: StackShift commands directory not found at $COMMANDS_SOURCE"
  exit 1
fi

# Create target directory
mkdir -p "$OPENCODE_DIR"
echo "✅ Created directory: $OPENCODE_DIR"

# Function to convert GitHub Spec Kit command to OpenCode format
convert_command() {
  local source_file="$1"
  local target_file="$2"
  local command_name=$(basename "$target_file" .md)

  # Extract description from YAML frontmatter if it exists
  local description=$(grep "^description:" "$source_file" | head -1 | sed 's/description: //')

  if [ -z "$description" ]; then
    description="StackShift Spec Kit command"
  fi

  # Create OpenCode format with frontmatter
  {
    echo "---"
    echo "name: $command_name"
    echo "slug: $command_name"
    echo "description: $description"
    echo "---"
    # Remove YAML frontmatter from source and add content
    sed '/^---$/,/^---$/d' "$source_file"
  } > "$target_file"
}

echo ""
echo "📋 Converting and installing commands..."

# Process all StackShift plugin commands
STACKSHIFT_COUNT=0
SPECKIT_COUNT=0

for cmd in "$COMMANDS_SOURCE"/*.md; do
  if [ -f "$cmd" ]; then
    cmd_basename=$(basename "$cmd")

    # Determine if it's a speckit or stackshift command
    if [[ "$cmd_basename" == speckit-*.md ]]; then
      SPECKIT_COUNT=$((SPECKIT_COUNT + 1))
      # Keep speckit- prefix for compatibility
      target_name="$cmd_basename"
    elif [[ "$cmd_basename" == stackshift.*.md ]]; then
      STACKSHIFT_COUNT=$((STACKSHIFT_COUNT + 1))
      # Keep stackshift. prefix
      target_name="$cmd_basename"
    else
      STACKSHIFT_COUNT=$((STACKSHIFT_COUNT + 1))
      # Add stackshift. prefix for non-prefixed StackShift commands
      target_name="stackshift.$(basename "$cmd")"
    fi

    target="$OPENCODE_DIR/$target_name"
    convert_command "$cmd" "$target"
    echo "  ✓ Installed $target_name"
  fi
done

echo ""
echo "  Installed $STACKSHIFT_COUNT StackShift commands"
echo "  Installed $SPECKIT_COUNT Spec Kit commands"
TOTAL_COUNT=$((STACKSHIFT_COUNT + SPECKIT_COUNT))
echo "  Total: $TOTAL_COUNT commands"
echo ""

# List installed commands by category
echo "📝 Available commands:"
echo ""
echo "StackShift commands:"
for cmd in "$OPENCODE_DIR"/stackshift.*.md; do
  if [ -f "$cmd" ]; then
    cmd_name=$(basename "$cmd" .md)
    echo "  /$cmd_name"
  fi
done

echo ""
echo "Spec Kit commands:"
for cmd in "$OPENCODE_DIR"/speckit-*.md; do
  if [ -f "$cmd" ]; then
    cmd_name=$(basename "$cmd" .md | sed 's/-/./')
    echo "  /$cmd_name"
  fi
done

echo ""
echo "✅ Installation complete!"
echo ""
echo "Usage in OpenCode:"
echo "  /stackshift.start              # Begin StackShift workflow"
echo "  /stackshift.batch              # Process multiple repos"
echo "  /stackshift.modernize          # Upgrade dependencies"
echo "  /speckit.implement <feature>   # Implement from spec"
echo "  /speckit.plan                  # Create implementation plan"
echo "  ... and more!"
echo ""
echo "📚 See https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift for full documentation"
echo ""
