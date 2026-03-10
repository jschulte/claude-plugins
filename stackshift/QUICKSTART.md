# Quick Start

## Install

**From marketplace:**
```
/plugin marketplace add git@ghe.coxautoinc.com:DDC-WebPlatform/ddc-webplatform-marketplace.git
/plugin install stackshift
```

**From source:**
```bash
git clone git@ghe.coxautoinc.com:DDC-WebPlatform/stackshift.git
cd stackshift
mkdir -p ~/.claude/plugins/local
ln -s $(pwd) ~/.claude/plugins/local/stackshift
```

Restart Claude Code after either method.

---

## Run It

Navigate to any project and say:

```
"Analyze this codebase"
```

StackShift will ask you:
1. **Greenfield or Brownfield?** - Greenfield extracts business logic only (for rebuilding). Brownfield documents everything (for managing existing code).
2. **Manual or Cruise Control?** - Manual pauses between each gear. Cruise Control runs all 6 gears automatically.

That's it. StackShift handles the rest.

---

## What You Get

After a full run, your repo will have:

```
docs/reverse-engineering/     # 11 comprehensive docs
  functional-specification.md
  data-architecture.md
  integration-points.md
  configuration-reference.md
  operations-guide.md
  technical-debt-analysis.md
  observability-requirements.md
  visual-design-system.md
  test-documentation.md
  business-context.md
  decision-rationale.md

.specify/memory/              # Feature specifications
  constitution.md
  F001-feature-name/
    spec.md
    plan.md
    tasks.md
```

---

## Common Next Steps

**Add a new feature to your now-specced project:**
```
/speckit.specify
/speckit.plan
/speckit.tasks
/speckit.implement
```

**Analyze multiple related repos:**
```
/stackshift.discover
/stackshift.batch
```

**Upgrade dependencies:**
```
/stackshift.modernize
```

---

See [README.md](README.md) for the full command reference.
