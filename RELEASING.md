# Release Process

This repository uses GitHub Releases with automated version synchronization.

## How to Release a New Version

### 1. Create a GitHub Release

1. Go to https://github.com/jschulte/claude-plugins/releases/new
2. Click "Choose a tag" and create a new tag with format `vX.Y.Z` (e.g., `v1.3.0`)
3. Set the release title (e.g., "StackShift v1.3.0")
4. Write release notes describing the changes
5. Click "Publish release"

### 2. Automated Sync

The GitHub Actions workflow will automatically:
- Extract the version from the tag (`v1.3.0` → `1.3.0`)
- Update `stackshift/.claude-plugin/plugin.json`
- Update `.claude-plugin/marketplace.json`
- Update `README.md`
- Commit and push the changes to `main`

### 3. Verify

After the workflow completes (~1 minute):
- Pull the latest changes: `git pull`
- Verify all version files are synchronized

## Version Files

These files contain version information and are kept in sync:

| File | Location | Format |
|------|----------|--------|
| Plugin metadata | `stackshift/.claude-plugin/plugin.json` | `"version": "1.2.0"` |
| Registry metadata | `.claude-plugin/marketplace.json` | `"version": "1.2.0"` |
| Documentation | `README.md` | `StackShift (v1.2.0)` |

## Existing Tags

- `v1.1.0` - Initial versioned release
- `v1.1.1` - Slash commands update
- `v1.2.0` - Brownfield Upgrade mode

## Workflow File

The automation is defined in `.github/workflows/sync-version.yml`

## Manual Version Update (Emergency)

If you need to manually update versions:

```bash
# Update all files to version 1.3.0
VERSION="1.3.0"

# Update plugin.json
jq --arg v "$VERSION" '.version = $v' stackshift/.claude-plugin/plugin.json > tmp.json
mv tmp.json stackshift/.claude-plugin/plugin.json

# Update marketplace.json
jq --arg v "$VERSION" '(.plugins[] | select(.name == "stackshift") | .version) = $v' \
  .claude-plugin/marketplace.json > tmp.json
mv tmp.json .claude-plugin/marketplace.json

# Update README.md
sed -i '' "s/StackShift (v[0-9.]*)/StackShift (v$VERSION)/" README.md

# Commit and tag
git add .
git commit -m "chore: update version to $VERSION"
git tag "v$VERSION" -m "Release v$VERSION"
git push && git push --tags
```
