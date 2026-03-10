# Installation

## From the DDC Marketplace (recommended)

In Claude Code:

```
/plugin marketplace add git@ghe.coxautoinc.com:DDC-WebPlatform/ddc-webplatform-marketplace.git
/plugin install stackshift
```

Restart Claude Code after installing.

**Updating:**
```
/plugin marketplace update ddc-webplatform
/plugin update stackshift
```

## From Source (for development/testing)

```bash
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git
cd stackshift
mkdir -p ~/.claude/plugins/local
ln -s $(pwd) ~/.claude/plugins/local/stackshift
```

Restart Claude Code after linking.

**Verify it loaded:**
```
/plugin list
```

Should show `stackshift` as installed.

## In the Browser (no install)

1. Go to [Claude Code Web](https://claude.ai/code)
2. Connect to your GitHub account
3. Select your repo
4. Copy the contents of `web/WEB_BOOTSTRAP.md` and paste it in
5. Follow the prompts

## Troubleshooting

**Plugin not showing up?**
Check the symlink exists: `ls -la ~/.claude/plugins/local/`

**Skills not activating?**
Restart Claude Code completely (not just a new conversation), then try saying "Analyze this codebase".

**Need to start fresh?**
Delete `.stackshift-state.json` from your project directory to reset configuration.
