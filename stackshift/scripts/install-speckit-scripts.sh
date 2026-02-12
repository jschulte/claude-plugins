#!/bin/bash

# Install GitHub Spec Kit Scripts
# Copies the prerequisite scripts needed for /speckit.* commands

set -e

# Get target directory (default: current working directory)
TARGET_DIR="${1:-.}"
SCRIPTS_DIR="$TARGET_DIR/.specify/scripts"

echo "📋 GitHub Spec Kit Scripts Installer"
echo ""
echo "Target: $SCRIPTS_DIR"
echo ""

# Create scripts directory structure
mkdir -p "$SCRIPTS_DIR/bash"
mkdir -p "$SCRIPTS_DIR/powershell"
echo "✅ Created scripts directories"
echo ""

# Download scripts from GitHub Spec Kit repo
BASE_URL="https://raw.githubusercontent.com/github/spec-kit/main/scripts"

echo "📥 Downloading prerequisite scripts from GitHub Spec Kit..."
echo ""

# Bash scripts
echo "Bash scripts:"
curl -sSL "$BASE_URL/bash/check-prerequisites.sh" -o "$SCRIPTS_DIR/bash/check-prerequisites.sh"
echo "  ✓ check-prerequisites.sh"

curl -sSL "$BASE_URL/bash/setup-plan.sh" -o "$SCRIPTS_DIR/bash/setup-plan.sh"
echo "  ✓ setup-plan.sh"

curl -sSL "$BASE_URL/bash/create-new-feature.sh" -o "$SCRIPTS_DIR/bash/create-new-feature.sh"
echo "  ✓ create-new-feature.sh"

curl -sSL "$BASE_URL/bash/update-agent-context.sh" -o "$SCRIPTS_DIR/bash/update-agent-context.sh"
echo "  ✓ update-agent-context.sh"

curl -sSL "$BASE_URL/bash/common.sh" -o "$SCRIPTS_DIR/bash/common.sh"
echo "  ✓ common.sh"

# Make bash scripts executable
chmod +x "$SCRIPTS_DIR/bash"/*.sh

echo ""
echo "PowerShell scripts:"
# PowerShell scripts (if they exist)
curl -sSL "$BASE_URL/powershell/check-prerequisites.ps1" -o "$SCRIPTS_DIR/powershell/check-prerequisites.ps1" 2>/dev/null && echo "  ✓ check-prerequisites.ps1" || echo "  ⚠️  PowerShell scripts not available"

echo ""
echo "✅ Installation complete!"
echo ""
echo "Installed scripts:"
ls -1 "$SCRIPTS_DIR/bash/" | sed 's/^/  /'
echo ""
echo "These scripts are required by /speckit.* slash commands:"
echo "  - /speckit.analyze"
echo "  - /speckit.implement"
echo "  - /speckit.plan"
echo "  - /speckit.tasks"
echo ""
echo "💡 Tip: StackShift's Gear 3 should call this automatically!"
echo ""
