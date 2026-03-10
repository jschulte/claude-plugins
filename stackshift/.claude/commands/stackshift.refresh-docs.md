---
description: Incrementally update reverse-engineering docs based on git changes since last generation
---

# Refresh Docs

**IMPORTANT**: This incrementally updates reverse-engineering docs — no full regeneration needed.

## Prerequisites

- Reverse-engineering docs must already exist in `docs/reverse-engineering/`
- `.stackshift-docs-meta.json` metadata file must exist (created by Gear 2)
- Must be in a git repository with the pinned commit still reachable

## What This Does

1. Reads the pinned commit hash from `.stackshift-docs-meta.json`
2. Diffs against HEAD to find all changed files
3. Maps changed files to affected docs
4. Surgically updates only the affected sections
5. Updates metadata with new commit hash and refresh history

## Execute

Use the Skill tool with skill="reverse-engineer" is NOT correct for this.

Instead, read and follow the instructions in `skills/refresh-docs/SKILL.md` directly. The skill contains the full incremental update process.

**Key points:**
- Only updates docs affected by changes (unchanged docs preserved)
- Uses Edit tool for surgical updates, not full rewrites
- Tracks refresh history in metadata
- Auto-detects when full refresh is recommended (>60% files changed)

## Output

- Updated docs in `docs/reverse-engineering/` (only affected ones)
- Updated `.stackshift-docs-meta.json` with new commit hash
- Summary of what was added/modified/removed per doc
