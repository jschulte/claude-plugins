# Install Slash Commands

Copy StackShift slash commands into the project so they are discoverable by Claude Code.

---

## Copy Commands

```bash
mkdir -p .claude/commands

cp ~/.claude/plugins/stackshift/.claude/commands/speckit.*.md .claude/commands/
cp ~/.claude/plugins/stackshift/.claude/commands/stackshift.modernize.md .claude/commands/
```

If the copy fails (plugin not installed at expected path), log the error and continue with analysis. Commands can be installed later.

Verify installation:

```bash
ls .claude/commands/speckit.*.md
```

Expected files:
- speckit.analyze.md
- speckit.clarify.md
- speckit.implement.md
- speckit.plan.md
- speckit.specify.md
- speckit.tasks.md
- stackshift.modernize.md

---

## Update .gitignore

Add to `.gitignore` (create if missing):

```
# Allow .claude directory structure
!.claude/
!.claude/commands/

# Track slash commands (team needs these)
!.claude/commands/*.md

# Ignore user-specific settings
.claude/settings.json
.claude/mcp-settings.json
```

---

## Commit to Git

Commands must be committed so teammates have access after cloning.

```bash
git add .claude/commands/
git commit -m "chore: add StackShift and Spec Kit slash commands

Adds /speckit.* and /stackshift.* slash commands for team use.

Commands added:
- /speckit.specify - Create feature specifications
- /speckit.plan - Create technical plans
- /speckit.tasks - Generate task lists
- /speckit.implement - Execute implementation
- /speckit.clarify - Resolve ambiguities
- /speckit.analyze - Validate specs match code
- /stackshift.modernize - Upgrade dependencies

These commands enable spec-driven development workflow.
All team members will have access after cloning.
"
```

If git commit fails (dirty tree, no git repo), log the failure and continue. The commands are already in place for this session.
