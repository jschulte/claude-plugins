---
description: Ecosystem discovery - start with one repo, find all related repos, services, and libraries. Scans for integration signals, searches GitHub, and presents an ecosystem map for batch processing.
---

# Ecosystem Discovery

**IMPORTANT**: This command discovers the entire ecosystem surrounding a single starting repo.

## Step 1: Discover Ecosystem

Use the Skill tool with skill="discover".

**The skill will**:
- Scan the starting repo for 10 categories of integration signals
- Ask for known related repos and GitHub org (optional)
- Search GitHub for related repos in the same org
- Scan the local filesystem for matching repos
- Merge results and assign confidence scores (CONFIRMED, HIGH, MEDIUM, LOW)
- Generate an ecosystem map with Mermaid dependency graph
- Present the map for user confirmation

## Step 2: Confirm and Handoff

After reviewing the ecosystem map:
- Adjust the repo list (add/remove/change confidence)
- Choose next step:
  - `/stackshift.batch` — Analyze all discovered repos in parallel
  - `/stackshift.reimagine` — Synthesize repos into a reimagined system
  - Export map only — Save for later

## When to Use

- Starting a large reverse-engineering project
- Don't know all the repos in the platform
- Want to map dependencies before batch analysis
- Need to understand the full ecosystem before making decisions
