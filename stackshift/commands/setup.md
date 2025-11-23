---
description: Install StackShift and Spec Kit slash commands to this project for team use. Run this if you joined a project after StackShift analysis was completed.
---

# StackShift Setup - Install Slash Commands

**Use this if:**
- You cloned a project that uses StackShift
- Slash commands aren't showing up (/speckit.*, /stackshift.*)
- You want to add features but don't have the commands

---

## Step 1: Install Commands

```bash
# Create commands directory
mkdir -p .claude/commands

# Copy from StackShift plugin
cp ~/.claude/plugins/stackshift/.claude/commands/speckit.*.md .claude/commands/
cp ~/.claude/plugins/stackshift/.claude/commands/stackshift.*.md .claude/commands/

# Verify
ls .claude/commands/
```

**You should see:**
- ✅ speckit.analyze.md
- ✅ speckit.clarify.md
- ✅ speckit.implement.md
- ✅ speckit.plan.md
- ✅ speckit.specify.md
- ✅ speckit.tasks.md
- ✅ stackshift.modernize.md
- ✅ stackshift.setup.md

---

## Step 2: Update .gitignore

**Ensure .gitignore allows .claude/commands/ to be committed:**

```bash
# Check if .gitignore exists
if [ ! -f .gitignore ]; then
  echo "Creating .gitignore..."
  touch .gitignore
fi

# Add rules to allow slash commands
cat >> .gitignore <<'EOF'

# Claude Code - Allow slash commands (team needs these!)
!.claude/
!.claude/commands/
!.claude/commands/*.md

# Ignore user-specific Claude settings
.claude/settings.json
.claude/mcp-settings.json
.claude/.storage/
EOF

echo "✅ .gitignore updated"
```

---

## Step 3: Commit to Git

```bash
git add .claude/commands/
git add .gitignore

git commit -m "chore: add StackShift slash commands for team

Adds /speckit.* and /stackshift.* slash commands.

Commands installed:
- /speckit.specify - Create feature specifications
- /speckit.plan - Create technical implementation plans
- /speckit.tasks - Generate task breakdowns
- /speckit.implement - Execute implementation
- /speckit.clarify - Resolve specification ambiguities
- /speckit.analyze - Validate specs match code
- /stackshift.modernize - Upgrade dependencies
- /stackshift.setup - Install commands (this command)

These enable spec-driven development for the entire team.
All team members will have commands after cloning.
"
```

---

## Done!

✅ Commands installed to project
✅ .gitignore updated to allow commands
✅ Commands committed to git
✅ Team members will have commands when they clone

**Type `/spec` and you should see all commands autocomplete!**

---

## For Project Leads

**After running StackShift on a project, always:**

1. ✅ Run `/stackshift.setup` (or manual Step 1-3 above)
2. ✅ Commit .claude/commands/ to git
3. ✅ Push to remote

**This ensures everyone on your team has access to slash commands without individual setup.**

---

## Troubleshooting

**"Commands still not showing up"**
→ Restart Claude Code after installing

**"Git says .claude/ is ignored"**
→ Check .gitignore has `!.claude/commands/` rule

**"Don't have StackShift plugin installed"**
→ Install: `/plugin marketplace add jschulte/claude-plugins` then `/plugin install stackshift`

**"StackShift plugin not in ~/.claude/plugins/"**
→ Commands might be in different location, manually copy from project that has them
