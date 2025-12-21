# Claude Code Plugins by jschulte

**My collection of Claude Code plugins for developer productivity**

---

## Available Plugins

### 🚗 StackShift (v1.9.0)

**Reverse engineering toolkit that transforms applications into spec-driven projects**

- **Repository:** https://github.com/jschulte/stackshift
- **Features:**
  - 6-gear reverse engineering process
  - Dual workflow: Greenfield (rebuild in new stack) or Brownfield (manage existing)
  - Cruise control automatic mode
  - Works with Claude Code, Web, VSCode/Copilot
  - GitHub Spec Kit integration

**Start in reverse (engineering), shift through 6 gears, cruise into spec-driven development!** 🚗💨

---

### 🧪 Distillery (v1.0.0)

**AI-powered continuous learning system that improves code quality over time**

- **Repository:** https://github.com/jschulte/distillery
- **Features:**
  - Automatic pattern extraction from completed work
  - Self-updating playbooks that improve over time
  - Prevents repeated mistakes across iterations
  - 6 core playbooks: architecture, testing, error handling, performance, process, security
  - Compound learning effect - each iteration makes the next easier

**Distill experience into expertise!** 🧪✨

---

## Installation

### Add This Marketplace

```bash
# In Claude Code
> /plugin marketplace add jschulte/claude-plugins
```

### Install Plugins

```bash
# Install StackShift
> /plugin install stackshift

# Install Distillery
> /plugin install distillery

# Restart Claude Code
```

---

## Using the Plugins

### StackShift
```bash
/stackshift:start    # Begin reverse engineering
/stackshift:init     # Initialize in project
```

### Distillery
```bash
/distillery:init            # Initialize in project
/distillery:extract         # Extract patterns after completing work
/distillery:get-playbook    # Load a playbook before starting work
/distillery:status          # View playbooks and statistics
```

---

## Coming Soon

More developer tools and productivity plugins!

- **StackSync** (v1.1) - Synchronize specs between legacy and greenfield apps during platform migrations
- **Distillery Integrations** - Marketplace of curated playbooks for different tech stacks
- **Future tools** - Stay tuned!

---

## Support

If you find these tools helpful:

- ⭐ **Star the repos** on GitHub
- 🐛 **Report issues** to help improve the tools
- ☕ **[Support development](https://github.com/sponsors/jschulte)** to keep building!

---

## Links

- **GitHub:** https://github.com/jschulte
- **StackShift Repo:** https://github.com/jschulte/stackshift
- **Distillery Repo:** https://github.com/jschulte/distillery
- **Support:** https://github.com/sponsors/jschulte

---

**Built with Claude Code** | **Open Source** | **MIT Licensed**
