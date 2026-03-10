#!/bin/bash

# StackShift OpenCode Agents Installer
# Installs StackShift specialist agents for OpenCode as subagents

set -e

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
STACKSHIFT_ROOT="$(dirname "$SCRIPT_DIR")"
AGENTS_SOURCE="$STACKSHIFT_ROOT/agents"
OPENCODE_DIR="$HOME/.config/opencode/agent"

echo "🚗 StackShift OpenCode Agents Installer"
echo ""
echo "Source: $AGENTS_SOURCE"
echo "Target: $OPENCODE_DIR"
echo ""

# Check if source exists
if [ ! -d "$AGENTS_SOURCE" ]; then
  echo "❌ Error: StackShift agents directory not found at $AGENTS_SOURCE"
  exit 1
fi

# Create target directory
mkdir -p "$OPENCODE_DIR"
echo "✅ Created directory: $OPENCODE_DIR"

# Function to convert Claude Code agent to OpenCode format
convert_agent() {
  local agent_dir="$1"
  local agent_name=$(basename "$agent_dir")
  local agent_file="$agent_dir/AGENT.md"
  local target_file="$OPENCODE_DIR/$agent_name.md"

  if [ ! -f "$agent_file" ]; then
    echo "  ⚠️  Skipping $agent_name - no AGENT.md found"
    return
  fi

  # Check if AGENT.md already has frontmatter
  local has_frontmatter=$(head -1 "$agent_file" | grep -c "^---$" || true)
  local description=""
  local content_file="$agent_file"

  if [ "$has_frontmatter" -eq 1 ]; then
    # Extract description from existing frontmatter
    description=$(sed -n '/^---$/,/^---$/p' "$agent_file" | grep "^description:" | sed 's/description: *//')
    # Create temp file with frontmatter stripped (skip from first --- to second ---)
    content_file=$(mktemp)
    awk '/^---$/{if(++n==2){p=1;next}}p' "$agent_file" > "$content_file"
  else
    # Extract description from body (after "**Purpose:**")
    description=$(grep -A 1 "^\*\*Purpose:\*\*" "$agent_file" | tail -1 | sed 's/^[[:space:]]*//')

    if [ -z "$description" ]; then
      # Fallback: try to get from Type or first paragraph
      description=$(grep "^\*\*Type:\*\*" "$agent_file" | sed 's/\*\*Type:\*\* //' || echo "StackShift specialist agent")
    fi
  fi

  # Create OpenCode format matching working manual agents exactly
  {
    echo "---"
    echo "description: $description"
    echo "mode: subagent"
    echo "model: anthropic/claude-sonnet-4-20250514"
    echo "temperature: 0.3"
    echo "tools:"
    echo "  read: true"
    echo "  write: true"
    echo "  edit: true"
    echo "  grep: true"
    echo "  glob: true"
    echo "  bash: false"
    echo "permission:"
    echo "  bash: deny"
    echo "---"
    # Add the content (with frontmatter stripped if needed)
    cat "$content_file"
  } > "$target_file"

  # Clean up temp file if created
  if [ "$has_frontmatter" -eq 1 ]; then
    rm -f "$content_file"
  fi

  echo "  ✓ Installed $agent_name"
}

echo ""
echo "📋 Converting and installing agents..."
echo ""

# Process all agent directories
AGENT_COUNT=0
for agent_dir in "$AGENTS_SOURCE"/*; do
  if [ -d "$agent_dir" ] && [ "$(basename "$agent_dir")" != "README.md" ]; then
    convert_agent "$agent_dir"
    AGENT_COUNT=$((AGENT_COUNT + 1))
  fi
done

echo ""
echo "  Installed $AGENT_COUNT specialist agents"
echo ""

# List installed agents
echo "📝 Available agents:"
echo ""
for agent in "$OPENCODE_DIR"/*.md; do
  if [ -f "$agent" ]; then
    agent_name=$(basename "$agent" .md)
    echo "  @$agent_name"
  fi
done

echo ""
echo "✅ Installation complete!"
echo ""
echo "Usage in OpenCode:"
echo "  @stackshift-technical-writer generate specifications"
echo "  @stackshift-code-analyzer analyze this codebase"
echo "  @cms-web-widget-analyzer analyze this CMS widget"
echo "  @feature-brainstorm help me brainstorm this feature"
echo ""
echo "💡 Tip: Agents are invoked with @mention in OpenCode"
echo ""
echo "📚 See https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift for full documentation"
echo ""
