---
description: Show installed StackShift version and check for updates
---

# StackShift Version Check

**Current Installation:**

```bash
# Show installed version
cat ~/.claude/plugins/cache/stackshift/.claude-plugin/plugin.json | jq -r '.version' || echo "StackShift not installed"
```

**Latest Release:**

Check latest version at: https://github.com/jschulte/stackshift/releases/latest

---

## Installation Info

**Repository:** github.com/jschulte/stackshift

**Installed From:**
```bash
# Check installation directory
ls -la ~/.claude/plugins/cache/stackshift
```

---

## Update Instructions

### If Installed from Marketplace

**Important:** Update the marketplace FIRST, then update the plugin!

```bash
# Step 1: Update marketplace
/plugin marketplace update jschulte

# Step 2: Update StackShift
/plugin update stackshift

# Step 3: Restart Claude Code
```

### If Installed Locally

```bash
cd ~/git/stackshift
git pull origin main
./install-local.sh
```

### Force Reinstall

```bash
# Remove old installation
/plugin uninstall stackshift

# Reinstall from marketplace
/plugin marketplace add jschulte/claude-plugins
/plugin install stackshift

# Or install locally
git clone https://github.com/jschulte/stackshift.git
cd stackshift
./install-local.sh
```

---

## Version History

- **v1.3.0** (2025-11-18) - Batch session persistence, directory-scoped sessions
- **v1.2.0** (2025-11-17) - Brownfield upgrade mode, Multi-framework support
- **v1.1.1** (2025-11-16) - Monorepo detection improvements
- **v1.1.0** (2025-11-15) - Added monorepo detection
- **v1.0.0** (2025-11-14) - Initial release

---

## What's New in Latest Version

### v1.3.0 Features

🎯 **Cross-batch answer persistence** - Answer configuration questions once, automatically apply to all repos across all batches

📁 **Directory-scoped sessions** - Multiple simultaneous batch runs in different directories without conflicts

🔍 **Auto-discovery** - Agents automatically find parent batch configuration

⚡ **Time savings** - Save 58 minutes on 90-repo batches!

**Full changelog:** https://github.com/jschulte/stackshift/releases/tag/v1.3.0
