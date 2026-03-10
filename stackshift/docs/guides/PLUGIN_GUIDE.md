# Plugin Guide

## How Skills Work

StackShift skills auto-activate based on what you say. You don't need to memorize commands - just describe what you want:

```
"Analyze this codebase"           -> analyze skill activates
"Reverse engineer this app"       -> reverse-engineer skill activates
"Create specifications"           -> create-specs skill activates
"What's missing from this app?"   -> gap-analysis skill activates
```

You can also use slash commands explicitly: `/stackshift.analyze`, `/stackshift.reverse-engineer`, etc.

## State Tracking

StackShift saves progress to `.stackshift-state.json` in your project root. This tracks:
- Your path choice (Greenfield/Brownfield)
- Current gear
- Configuration answers

If you get interrupted, say "resume StackShift" and it picks up where you left off.

## Cruise Control vs Manual

**Manual mode** pauses after each gear so you can review output before continuing. Good for your first run or when you want to inspect intermediate results.

**Cruise Control** (`/stackshift.cruise-control`) runs all 6 gears without stopping. Good for batch processing or when you trust the defaults.

In cruise control, you can configure:
- **Clarifications strategy**: defer (save for later), prompt (ask during run), or skip
- **Implementation scope**: none (specs only), P0, P0+P1, or all

## Available Skills

See the [command reference in README.md](../../README.md#commands-reference) for the full list.

## Slash Commands vs Skills

**Skills** auto-activate from natural language. They're the same capabilities wrapped in a conversational interface.

**Slash commands** (`/stackshift.analyze`, `/speckit.specify`, etc.) are explicit invocations. Use these when you know exactly what you want.

Both do the same thing - pick whichever feels more natural.
