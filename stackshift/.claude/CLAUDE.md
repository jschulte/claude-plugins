# StackShift Development Guide

Internal documentation for maintaining and releasing StackShift.

---

## Repository Structure

```
stackshift/
├── .claude-plugin/plugin.json    ← Version number (bump for releases)
├── commands/*.md                  ← Slash commands (11 files)
├── skills/*.md                    ← Auto-activating skills (9 files)
├── agents/*.md                    ← Specialized agents (5 files)
├── scripts/install-commands.sh   ← Installer for slash commands
├── web/WEB_BOOTSTRAP.md          ← Universal bootstrap for non-Claude-Code users
└── docs/guides/                   ← User documentation
```

**Related Repositories:**
- `ddc-webplatform-marketplace` - Marketplace that distributes StackShift to users
- `mcp-tools` - MCP server integration (separate workflow, not covered here)

---

## Release Process

### When to Release

**Bump patch (x.y.Z):** Bug fixes, documentation updates, small corrections
**Bump minor (x.Y.0):** New features, significant improvements, new capabilities
**Bump major (X.0.0):** Breaking changes, major architectural changes

### Step-by-Step Release

#### 1. Bump Version in plugin.json

```bash
cd ~/git/ai/stackshift

# Edit .claude-plugin/plugin.json
# Change "version": "1.4.0" to "1.5.0" (or appropriate version)
```

#### 2. Commit Version Bump

```bash
git add .claude-plugin/plugin.json
git commit -m "chore: Bump version to 1.5.0

New features in this release:
- [List major features]
- [List improvements]
- [List bug fixes]

See release notes for complete details.
"
git push origin main
```

#### 3. Create Git Tag

```bash
git tag -a v1.5.0 -m "Release v1.5.0

New Features:
- [Feature 1]
- [Feature 2]

Improvements:
- [Improvement 1]
- [Improvement 2]

Bug Fixes:
- [Fix 1]
- [Fix 2]

Documentation:
- [Doc update 1]

Breaking Changes:
- None (or list them)
"

git push origin v1.5.0
```

This automatically triggers the Release workflow which:
- Runs tests and builds
- Creates GitHub Release
- Packages plugin as tarball
- Publishes release notes

#### 4. Update Marketplace

```bash
cd ~/git/ddc-webplatform-marketplace

# Pull latest
git pull origin main

# Edit marketplace.json version
# Change "version": "1.4.0" to "1.5.0"

# Sync latest StackShift files
rm -rf stackshift
cp -r ~/git/ai/stackshift stackshift
rm -rf stackshift/.git stackshift/node_modules

# Commit and push
git add -A
git commit -m "Update StackShift to v1.5.0

Synced latest StackShift plugin files to marketplace.

New in v1.5.0:
- [Feature list]

See StackShift release notes for full details:
ghe.coxautoinc.com/DDC-WebPlatform/stackshift/releases/tag/v1.5.0
"
git push origin main
```

#### 5. Verify Release

```bash
# Check GitHub release was created
GH_HOST=ghe.coxautoinc.com gh release view v1.5.0

# Check CI passed
GH_HOST=ghe.coxautoinc.com gh run list --limit 1
```

#### 6. Notify Users

Users can update with:
```bash
/plugin update stackshift
# Restart Claude Code
```

---

## Common Release Scenarios

### Bug Fix Release (1.5.0 → 1.5.1)

```bash
# Fix the bug, commit changes
git add <files>
git commit -m "fix: [description]"
git push origin main

# Bump patch version
# Edit .claude-plugin/plugin.json: "1.5.0" → "1.5.1"
git add .claude-plugin/plugin.json
git commit -m "chore: Bump version to 1.5.1"
git push origin main

# Tag and release
git tag -a v1.5.1 -m "Release v1.5.1 - Bug fixes"
git push origin v1.5.1

# Update marketplace
cd ~/git/ddc-webplatform-marketplace
# Update version in marketplace.json
# Sync files, commit, push
```

### Feature Release (1.5.0 → 1.6.0)

```bash
# Develop feature, commit changes
git add <files>
git commit -m "feat: [description]"
git push origin main

# Bump minor version
# Edit .claude-plugin/plugin.json: "1.5.0" → "1.6.0"
git add .claude-plugin/plugin.json
git commit -m "chore: Bump version to 1.6.0"
git push origin main

# Tag with detailed release notes
git tag -a v1.6.0 -m "Release v1.6.0 - [Feature name]"
git push origin v1.6.0

# Update marketplace
cd ~/git/ddc-webplatform-marketplace
# Update version, sync files, commit, push
```

---

## Updating Documentation

### When Documentation Changes

If you update:
- `commands/*.md` - Slash command behavior
- `skills/*.md` - SKILL.md prompts
- `web/WEB_BOOTSTRAP.md` - Bootstrap prompt
- `docs/guides/*.md` - User guides

**Remember to sync to marketplace:**
```bash
cd ~/git/ddc-webplatform-marketplace
rm -rf stackshift
cp -r ~/git/ai/stackshift stackshift
rm -rf stackshift/.git stackshift/node_modules
git add stackshift/
git commit -m "Sync StackShift documentation updates"
git push origin main
```

Users get updates when they run:
```bash
/plugin marketplace update ddc-webplatform
/plugin update stackshift
```

---

## Testing Before Release

### Local Testing

Your local files at `~/git/ai/stackshift` are what Claude Code uses when you have the local symlink. Test changes immediately!

### Test Checklist

- [ ] All slash commands work (`/stackshift.start`, `/stackshift.batch`, etc.)
- [ ] WEB_BOOTSTRAP.md is up to date with plugin behavior
- [ ] VSCode guide is accurate
- [ ] CI passes (`GH_HOST=ghe.coxautoinc.com gh run list`)
- [ ] No broken links in documentation
- [ ] version in plugin.json matches tag

---

## Rollback Process

If a release has issues:

```bash
# Revert to previous version
git revert <bad-commit>
git push origin main

# Or hard reset (if not released yet)
git reset --hard <previous-good-commit>
git push --force origin main

# Delete bad tag (if created)
git tag -d v1.5.0
git push origin :refs/tags/v1.5.0

# Update marketplace to previous version
cd ~/git/ddc-webplatform-marketplace
# Revert version in marketplace.json
git commit -m "Rollback StackShift to v1.4.0"
git push origin main
```

---

## Version History

- **v1.5.0** (2025-11-19) - Batch sessions, VSCode support, documentation overhaul
- **v1.4.0** (2025-11-18) - Gear 3 thoroughness options, automated planning
- **v1.3.0** (2025-11-18) - Cross-batch persistence, directory-scoped sessions
- **v1.2.0** - CMS widget support, 6 routes
- **v1.1.0** - Osiris support
- **v1.0.0** - Initial release (Greenfield + Brownfield)

---

## Common Mistakes to Avoid

❌ **Don't forget to update marketplace** - Users won't get updates
❌ **Don't skip CI checks** - Broken releases waste user time
❌ **Don't use HTTPS URLs** - Use SSH for Cox GHE repos
❌ **Don't forget to sync WEB_BOOTSTRAP** - VSCode users need it updated
❌ **Don't promise slash commands work in VSCode** - They don't!

---

## Quick Reference

```bash
# Release v1.X.0
cd ~/git/ai/stackshift
# 1. Edit .claude-plugin/plugin.json version
git add .claude-plugin/plugin.json
git commit -m "chore: Bump version to 1.X.0"
git push origin main

# 2. Create tag
git tag -a v1.X.0 -m "Release notes here"
git push origin v1.X.0

# 3. Update marketplace
cd ~/git/ddc-webplatform-marketplace
# Edit marketplace.json version
rm -rf stackshift && cp -r ~/git/ai/stackshift stackshift && rm -rf stackshift/.git stackshift/node_modules
git add -A
git commit -m "Update StackShift to v1.X.0"
git push origin main

# 4. Done! ✅
```
