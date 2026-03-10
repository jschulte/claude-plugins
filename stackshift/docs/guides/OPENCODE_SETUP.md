# StackShift for OpenCode

Complete setup guide for using StackShift with OpenCode CLI.

---

## Quick Start

```bash
# 1. Clone StackShift
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git ~/stackshift
cd ~/stackshift

# 2. Install commands to OpenCode
./scripts/install-opencode-commands.sh

# 3. (Optional) Install specialist agents
./scripts/install-opencode-agents.sh

# 4. Start using StackShift!
cd ~/your-project
opencode

# In OpenCode, use the commands:
/stackshift.start
/speckit.implement my-feature
@stackshift-technical-writer generate specs
```

---

## What Gets Installed

### Slash Commands (17 commands)

**StackShift Commands (8)** - Core reverse engineering workflow:

| Command | Description |
|---------|-------------|
| `/stackshift.start` | Begin 6-gear reverse engineering workflow |
| `/stackshift.batch` | Process multiple repos in parallel |
| `/stackshift.modernize` | Upgrade dependencies (Brownfield mode) |
| `/stackshift.coverage` | Generate spec-to-code coverage map |
| `/stackshift.setup` | Install StackShift commands to project |
| `/stackshift.version` | Show installed version |
| `/stackshift.review` | Comprehensive code review |
| `/stackshift.validate` | Validate implementation against specs |

**Spec Kit Commands (9)** - GitHub Spec Kit integration:

| Command | Description |
|---------|-------------|
| `/speckit.implement` | Execute implementation plan from tasks.md |
| `/speckit.plan` | Create implementation plan for a feature |
| `/speckit.tasks` | Generate actionable task list from plan |
| `/speckit.analyze` | Analyze spec/plan/tasks consistency |
| `/speckit.specify` | Create/update feature specification |
| `/speckit.clarify` | Resolve underspecified areas |
| `/speckit.constitution` | Create/update project constitution |
| `/speckit.checklist` | Generate custom checklist for feature |
| `/speckit.taskstoissues` | Convert tasks to GitHub issues |

**Installation location:** `~/.config/opencode/command/`

### Optional: StackShift Agents (4 specialists)

StackShift includes 4 specialized subagents you can invoke with `@mention`:

```bash
# Install all agents
~/stackshift/scripts/install-opencode-agents.sh
```

**Agents:**
- `@stackshift-technical-writer` - Generates specs, plans, and documentation
- `@stackshift-code-analyzer` - Deep codebase analysis and extraction
- `@cms-web-widget-analyzer` - CMS widget analysis (Cox Automotive)
- `@feature-brainstorm` - Feature ideation and design

**Installation location:** `~/.config/opencode/agent/`

**Usage:**
```
@stackshift-technical-writer generate specifications from docs/reverse-engineering/
@stackshift-code-analyzer analyze this codebase
@cms-web-widget-analyzer analyze this CMS widget
@feature-brainstorm help design user authentication
```

---

## Installation Methods

### Method 1: Automatic Install (Recommended)

```bash
cd ~/stackshift
./scripts/install-opencode-commands.sh
```

This script:
- ✅ Creates `~/.config/opencode/command/` directory
- ✅ Converts GitHub Spec Kit commands to OpenCode format
- ✅ Installs all 9 speckit commands
- ✅ Reports what was installed

### Method 2: Manual Install

If you want more control:

```bash
# Create directory
mkdir -p ~/.config/opencode/command

# Copy commands manually
cp ~/stackshift/commands/speckit-*.md ~/.config/opencode/command/

# Add OpenCode frontmatter to each file
# (see "Command Format" section below)
```

### Method 3: Symlink (Like agent-commands)

For easier updates:

```bash
# Install commands
for cmd in ~/stackshift/commands/speckit-*.md; do
  name=$(basename "$cmd")
  ln -sf "$cmd" ~/.config/opencode/command/"$name"
done

# Verify
ls -la ~/.config/opencode/command/speckit-*
```

**Note:** You'll need to add OpenCode frontmatter to the source files for this method.

---

## Command Format

OpenCode commands require YAML frontmatter:

```markdown
---
name: speckit-implement
slug: speckit-implement
description: Execute the implementation plan
---
# Command content here
```

The install script handles this conversion automatically.

---

## Using StackShift in OpenCode

### Basic Workflow

```bash
# Start OpenCode in your project
cd ~/your-project
opencode

# Use StackShift commands
/speckit.specify user-authentication

/speckit.plan user-authentication

/speckit.tasks user-authentication

/speckit.implement user-authentication
```

### With Arguments

Commands accept arguments via `$ARGUMENTS`:

```bash
# Implement with feature name
/speckit.implement 001-user-authentication

# Plan with specific context
/speckit.plan shopping-cart

# Analyze specific feature
/speckit.analyze checkout-flow
```

### Natural Language (Alternative)

OpenCode also supports natural language:

```
"Create an implementation plan for the user authentication feature"
"Generate tasks for the shopping cart spec"
"Implement the checkout flow from the specification"
```

Both slash commands and natural language work!

---

## Project Setup

### Initialize GitHub Spec Kit Structure

Before using speckit commands, set up the Spec Kit directory:

```bash
cd ~/your-project

# Create directory structure
mkdir -p .specify/memory
mkdir -p .specify/specs

# Create constitution
cat > .specify/memory/constitution.md << 'EOF'
# Project Constitution

## Purpose & Values
[Your project principles]

## Technical Decisions
[Your architecture choices]

## Development Standards
[Your coding standards]
EOF
```

### Create Your First Spec

```bash
# In OpenCode
/speckit.specify user-authentication

# Or use the full workflow
opencode
> "I want to create a specification for user authentication with login, registration, and password reset"
```

---

## Comparison: OpenCode vs Claude Code

| Feature | OpenCode | Claude Code |
|---------|----------|-------------|
| **Slash Commands** | ✅ Yes | ✅ Yes |
| **Command Location** | `~/.config/opencode/command/` | `.claude/commands/` |
| **Agent Support** | ✅ Yes (subagents) | ✅ Yes (Task tool) |
| **Natural Language** | ✅ Yes | ✅ Yes |
| **Installation** | Script or manual | Plugin or script |
| **Updates** | Re-run script | `git pull` + reinstall |

Both work great with StackShift!

---

## Advanced: Installing StackShift Agents

For specialized StackShift agents:

```bash
# Manual install
mkdir -p ~/.config/opencode/agent

# Copy agent file
cp ~/stackshift/opencode/agents/stackshift-technical-writer.md \
   ~/.config/opencode/agent/

# Use in OpenCode with @mention
opencode
> "@stackshift-technical-writer generate specifications for all features"
```

Agents are optional - commands work fine without them!

---

## Troubleshooting

### Commands Don't Show Up

Check installation:
```bash
ls -la ~/.config/opencode/command/speckit-*
```

Should show 9 files. If not, re-run the install script.

### Commands Fail with "Script not found"

The GitHub Spec Kit commands reference bash scripts that may not exist in your project. This is expected - OpenCode will work around missing scripts.

### Want to Customize Commands?

Edit the source files in `~/stackshift/commands/` then:
```bash
cd ~/stackshift
./scripts/install-opencode-commands.sh
```

---

## Updating StackShift

```bash
cd ~/stackshift
git pull origin main
./scripts/install-opencode-commands.sh
```

Your custom commands are overwritten - keep customizations separate!

---

## Integration with agent-commands

If you use the `agent-commands` repository:

```bash
# Option 1: Add StackShift commands to agent-commands
cd ~/git/agent-commands/agent-prompts
cp ~/stackshift/opencode/commands/*.md ./

# Then run the agent-commands linker
cd ~/git/agent-commands
npm run link

# Option 2: Keep separate (recommended)
# agent-commands for custom commands
# StackShift for speckit commands
```

Both repos can coexist peacefully in `~/.config/opencode/command/`!

---

## Examples

### Full Feature Implementation

```bash
# 1. Start in your project
cd ~/my-app
opencode

# 2. Create specification
/speckit.specify user-dashboard

# 3. Create implementation plan
/speckit.plan user-dashboard

# 4. Generate tasks
/speckit.tasks user-dashboard

# 5. Implement
/speckit.implement user-dashboard

# 6. Validate
/speckit.analyze user-dashboard
```

### Quick Fixes

```bash
# Clarify unclear requirements
/speckit.clarify user-dashboard

# Update constitution
/speckit.constitution

# Create checklist
/speckit.checklist security
```

---

## Resources

- **StackShift Docs**: https://ghe.coxautoinc.com/DDC-WebPlatform/stackshift
- **GitHub Spec Kit**: https://github.com/github/spec-kit
- **OpenCode Docs**: https://opencode.ai/docs
- **agent-commands**: Your `~/git/agent-commands/` repo

---

## Summary

**For most users:**
```bash
cd ~/stackshift
./scripts/install-opencode-commands.sh
```

Then use `/speckit.*` commands in OpenCode! 🚗✨

**Questions?** Check the main StackShift README or open an issue.
