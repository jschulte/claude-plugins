# Using StackShift Outside Claude Code

StackShift slash commands only work in Claude Code. For other tools (VSCode + Copilot, ChatGPT, Claude.ai, Gemini), use the web bootstrap prompt instead.

## How to Use

1. Clone or download StackShift:
   ```bash
   git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git ~/stackshift
   ```

2. Copy the contents of `web/WEB_BOOTSTRAP.md`

3. Paste it into your AI tool's chat (Copilot Chat, Claude.ai, etc.)

4. The AI will act as StackShift and walk you through the 6-gear process

This is functionally equivalent to the plugin - same questions, same output, same 11 reverse-engineering docs and spec generation. The only difference is you're pasting a prompt instead of having skills auto-activate.

## Updating

```bash
cd ~/stackshift
git pull origin main
cat web/WEB_BOOTSTRAP.md  # Copy the updated version
```
