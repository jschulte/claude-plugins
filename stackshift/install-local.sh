#!/bin/bash
# StackShift - Quick install script for local testing

echo "🚗 Installing StackShift locally..."
echo ""

# Create local plugin directory if it doesn't exist
mkdir -p ~/.claude/plugins/local

# Create symlink to current directory
ln -sf "$(pwd)" ~/.claude/plugins/local/stackshift

echo "✅ StackShift linked to ~/.claude/plugins/local/stackshift"
echo ""
echo "Next steps:"
echo "1. Restart Claude Code (completely quit and reopen)"
echo "2. Navigate to a project: cd /path/to/your/project"
echo "3. Say: 'Analyze this codebase'"
echo "4. Choose your route: Greenfield or Brownfield"
echo "5. Shift through the gears! 🚗"
