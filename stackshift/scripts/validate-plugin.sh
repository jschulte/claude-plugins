#!/usr/bin/env bash
# validate-plugin.sh — Structural validation for StackShift plugin
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ERRORS=0

fail() { echo "  FAIL: $1"; ((ERRORS++)) || true; }
pass() { echo "  PASS: $1"; }

echo "=== StackShift Plugin Validation ==="
echo ""

# --- 1. JSON validity ---
echo "Checking JSON files..."
for f in .claude-plugin/plugin.json .claude-plugin/marketplace.json; do
  if [ -f "$REPO_ROOT/$f" ]; then
    if jq empty "$REPO_ROOT/$f" 2>/dev/null; then
      pass "$f is valid JSON"
    else
      fail "$f is invalid JSON"
    fi
  else
    fail "$f not found"
  fi
done

# --- 2. Skills structure ---
echo ""
echo "Checking skills..."
SKILLS_DIR="$REPO_ROOT/skills"
if [ -d "$SKILLS_DIR" ]; then
  for skill_dir in "$SKILLS_DIR"/*/; do
    skill_name="$(basename "$skill_dir")"
    if [ -f "$skill_dir/SKILL.md" ]; then
      pass "skills/$skill_name/SKILL.md exists"
    else
      fail "skills/$skill_name/SKILL.md missing"
    fi
  done
else
  fail "skills/ directory not found"
fi

# --- 3. Agents structure ---
echo ""
echo "Checking agents..."
AGENTS_DIR="$REPO_ROOT/agents"
if [ -d "$AGENTS_DIR" ]; then
  for agent_dir in "$AGENTS_DIR"/*/; do
    agent_name="$(basename "$agent_dir")"
    if [ -f "$agent_dir/AGENT.md" ]; then
      pass "agents/$agent_name/AGENT.md exists"
    else
      fail "agents/$agent_name/AGENT.md missing"
    fi
  done
else
  fail "agents/ directory not found"
fi

# --- 4. Version consistency ---
echo ""
echo "Checking version consistency..."
ROOT_VERSION=$(jq -r '.version' "$REPO_ROOT/package.json" 2>/dev/null || echo "MISSING")
PLUGIN_VERSION=$(jq -r '.version' "$REPO_ROOT/.claude-plugin/plugin.json" 2>/dev/null || echo "MISSING")
MARKETPLACE_VERSION=$(jq -r '.plugins[0].version' "$REPO_ROOT/.claude-plugin/marketplace.json" 2>/dev/null || echo "MISSING")
AST_VERSION=$(jq -r '.version' "$REPO_ROOT/scripts/ast-analysis/package.json" 2>/dev/null || echo "MISSING")

echo "  package.json:              $ROOT_VERSION"
echo "  plugin.json:               $PLUGIN_VERSION"
echo "  marketplace.json:          $MARKETPLACE_VERSION"
echo "  ast-analysis/package.json: $AST_VERSION"

if [ "$ROOT_VERSION" = "$PLUGIN_VERSION" ] && [ "$PLUGIN_VERSION" = "$MARKETPLACE_VERSION" ]; then
  pass "Root, plugin, and marketplace versions match ($ROOT_VERSION)"
else
  fail "Version mismatch: package.json=$ROOT_VERSION plugin.json=$PLUGIN_VERSION marketplace.json=$MARKETPLACE_VERSION"
fi

if [ "$AST_VERSION" = "$ROOT_VERSION" ]; then
  pass "ast-analysis version matches ($AST_VERSION)"
else
  fail "ast-analysis version mismatch: $AST_VERSION != $ROOT_VERSION"
fi

# --- Summary ---
echo ""
if [ "$ERRORS" -eq 0 ]; then
  echo "=== All checks passed ==="
  exit 0
else
  echo "=== $ERRORS check(s) failed ==="
  exit 1
fi
