#!/bin/bash

# Widget Extraction Runner
# Processes a single widget through the StackShift pipeline and extracts portable artifacts

set -e

WIDGET_NAME="$1"
WIDGET_PATH="$2"
WIDGET_TYPE="$3"
OUTPUT_DIR="$4"

if [ -z "$WIDGET_NAME" ] || [ -z "$WIDGET_PATH" ] || [ -z "$WIDGET_TYPE" ] || [ -z "$OUTPUT_DIR" ]; then
    echo "Usage: $0 <widget_name> <widget_path> <widget_type> <output_dir>"
    exit 1
fi

echo "=================================================="
echo "Processing: $WIDGET_NAME ($WIDGET_TYPE)"
echo "Path: $WIDGET_PATH"
echo "Output: $OUTPUT_DIR"
echo "=================================================="

# Expand tilde in path
WIDGET_PATH="${WIDGET_PATH/#\~/$HOME}"

# Navigate to widget directory
cd "$WIDGET_PATH"

# Create temporary migration directory
MIGRATION_DIR="_widget-migrate"
rm -rf "$MIGRATION_DIR"
mkdir -p "$MIGRATION_DIR"

echo "✓ Ready to extract business logic"
echo ""
echo "Next: Run widget analysis with MCP tools..."

# The actual widget analysis will be done by Claude Code
# This script just sets up the environment

exit 0
