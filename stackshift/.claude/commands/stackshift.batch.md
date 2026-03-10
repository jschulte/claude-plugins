---
description: Batch process multiple repos with StackShift analysis running in parallel. Analyzes 5 repos at a time, tracks progress, and aggregates results. Perfect for analyzing monorepo services or multiple related projects.
---

# StackShift Batch Processing

**Analyze multiple repositories in parallel**

Run StackShift on 10, 50, or 100+ repos simultaneously with progress tracking and result aggregation.

---

## Quick Start

**Analyze all services in a monorepo:**

```bash
# From monorepo services directory
cd ~/git/my-monorepo/services

# Let me analyze all service-* directories in batches of 5
```

I'll:
1. ✅ Find all service-* directories
2. ✅ Filter to valid repos (has package.json)
3. ✅ Process in batches of 5 (configurable)
4. ✅ Track progress in `batch-results/`
5. ✅ Aggregate results when complete

---

## What I'll Do

### Step 1: Discovery

**First, check for a pre-populated batch session from `/stackshift.discover`:**

```bash
# Check if a discover-created batch session exists
if [ -f .stackshift-batch-session.json ]; then
  # Check if it has discoveredRepos (created by /stackshift.discover)
  DISCOVERED=$(cat .stackshift-batch-session.json | jq -r '.discoveredRepos // empty')
  if [ -n "$DISCOVERED" ]; then
    echo "=== Using ecosystem map from /stackshift.discover ==="
    REPO_COUNT=$(cat .stackshift-batch-session.json | jq '.discoveredRepos | length')
    echo "Found $REPO_COUNT pre-discovered repos"

    # Extract repo paths from discoveredRepos
    cat .stackshift-batch-session.json | jq -r '.discoveredRepos[] | "\(.name)\t\(.path)\t\(.confidence)"'

    # Use these paths as the repo list — skip manual discovery
    # Filter by confidence if desired (e.g., only CONFIRMED + HIGH)
  fi
fi
```

**If no discover session exists, fall back to directory scanning:**

```bash
echo "=== Discovering repositories in ~/git/my-monorepo/services ==="

# Find all service directories
find ~/git/my-monorepo/services -maxdepth 1 -type d -name "service-*" | sort > /tmp/services-to-analyze.txt

# Count
SERVICE_COUNT=$(wc -l < /tmp/services-to-analyze.txt)
echo "Found $SERVICE_COUNT services"

# Show first 10
head -10 /tmp/services-to-analyze.txt
```

**Tip:** Run `/stackshift.discover` first to auto-find all related repos, then `/stackshift.batch` will pick up the discovered repo list automatically.

### Step 2: Batch Configuration

**IMPORTANT:** I'll ask ALL configuration questions upfront, ONCE. Your answers will be saved to a batch session file and automatically applied to ALL repos in all batches. You won't need to answer these questions again during this batch run!

I'll ask you:

**Question 1: How many to process?**
- A) All services ($WIDGET_COUNT total)
- B) First 10 (test run)
- C) First 25 (small batch)
- D) Custom number

**Question 2: Parallel batch size?**
- A) 3 at a time (conservative)
- B) 5 at a time (recommended)
- C) 10 at a time (aggressive, may slow down)
- D) Sequential (1 at a time, safest)

**Question 3: What route?**
- A) Auto-detect (auto-detect (monorepo for service-*), ask for others)
- B) Force monorepo-service for all
- C) Force greenfield for all
- D) Force brownfield for all

**Question 4: Implementation framework?**
- A) GitHub Spec Kit (default) - Feature specs in .specify/, /speckit.* commands
- B) BMAD Auto-Pilot - Auto-generate BMAD artifacts from reverse-eng docs
- C) BMAD Method - Hands off to BMAD's collaborative agents
- D) Architecture Only - Generate architecture.md with constraints
- E) Portable Extraction - Tech-agnostic epics + component spec for reuse

**Question 5: Also generate portable extraction?** _(If framework != portable-extract)_
- A) No (default) - Just the framework output
- B) Yes - Also generate `_portable-extract/` alongside normal output
   Good for: extracting reusable specs while also managing the codebase

**Question 6: Brownfield mode?** _(If route = brownfield)_
- A) Standard - Just create specs for current state
- B) Upgrade - Create specs + upgrade all dependencies

**Question 7: Transmission?**
- A) Manual - Review each gear before proceeding
- B) Cruise Control - Shift through all gears automatically

**Question 8: Clarifications strategy?** _(If transmission = cruise control AND framework = speckit)_
- A) Defer - Mark them, continue around them
- B) Prompt - Stop and ask questions
- C) Skip - Only implement fully-specified features

**Question 9: Implementation scope?** _(If transmission = cruise control AND framework = speckit)_
- A) None - Stop after specs are ready
- B) P0 only - Critical features only
- C) P0 + P1 - Critical + high-value features
- D) All - Every feature

**Question 10: Spec output location?** _(If route = greenfield)_
- A) Current repository (default)
- B) New application repository
- C) Separate documentation repository
- D) Custom location

**Question 9: Target stack?** _(If greenfield + implementation scope != none)_
- Examples:
  - Next.js 15 + TypeScript + Prisma + PostgreSQL
  - Python/FastAPI + SQLAlchemy + PostgreSQL
  - Your choice: [specify]

**Question 10: Build location?** _(If greenfield + implementation scope != none)_
- A) Subfolder (recommended) - e.g., greenfield/, v2/
- B) Separate directory - e.g., ~/git/my-new-app
- C) Replace in place (destructive)

**Then I'll:**
1. ✅ Save all answers to `.stackshift-batch-session.json` (in current directory)
2. ✅ Show batch session summary
3. ✅ Start processing batches with auto-applied configuration
4. ✅ Clear batch session when complete (or keep if you want)

**Why directory-scoped?**
- Multiple batch sessions can run simultaneously in different directories
- Each batch (monorepo services, etc.) has its own isolated configuration
- No conflicts between parallel batch runs
- Session file is co-located with the repos being processed

### Step 3: Create Batch Session & Spawn Agents

**First: Create batch session with all answers**

```bash
# After collecting all configuration answers, create batch session
# Stored in current directory for isolation from other batch runs
cat > .stackshift-batch-session.json <<EOF
{
  "sessionId": "batch-$(date +%s)",
  "startedAt": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "batchRootDirectory": "$(pwd)",
  "totalRepos": ${TOTAL_REPOS},
  "batchSize": ${BATCH_SIZE},
  "answers": {
    "route": "${ROUTE}",
    "implementation_framework": "${FRAMEWORK}",
    "also_portable_extract": ${ALSO_PORTABLE},
    "transmission": "${TRANSMISSION}",
    "spec_output_location": "${SPEC_OUTPUT}",
    "target_stack": "${TARGET_STACK}",
    "build_location": "${BUILD_LOCATION}",
    "clarifications_strategy": "${CLARIFICATIONS}",
    "implementation_scope": "${SCOPE}"
  },
  "processedRepos": []
}
EOF

echo "✅ Batch session created: $(pwd)/.stackshift-batch-session.json"
echo "📦 Configuration will be auto-applied to all ${TOTAL_REPOS} repos"
```

**Then: Spawn parallel agents (they'll auto-use batch session)**

```typescript
// Use Task tool to spawn parallel agents
const batch1 = [
  'service-user-api',
  'service-inventory',
  'service-contact',
  'service-search',
  'service-pricing'
];

// Spawn 5 agents in parallel
const agents = batch1.map(service => ({
  task: `Analyze ${service} service with StackShift`,
  description: `StackShift analysis: ${service}`,
  subagent_type: 'general-purpose',
  prompt: `
    cd ~/git/my-monorepo/services/${service}

    IMPORTANT: Batch session is active (will be auto-detected by walking up to parent)
    Parent directory has: .stackshift-batch-session.json
    All configuration will be auto-applied. DO NOT ask configuration questions.

    Run StackShift Gear 1: Analyze
    - Will auto-detect route (batch session: ${ROUTE})
    - Will use spec output location: ${SPEC_OUTPUT}
    - Analyze service + shared packages
    - Generate analysis-report.md

    Then run Gear 2: Reverse Engineer
    - Extract business logic
    - Document all shared package dependencies
    - Create comprehensive documentation

    Then run Gear 3: Create Specifications
    - Generate .specify/ structure
    - Create constitution
    - Generate feature specs

    Save all results to:
    ${SPEC_OUTPUT}/${service}/

    When complete, create completion marker:
    ${SPEC_OUTPUT}/${service}/.complete
  `
}));

// Launch all 5 in parallel
agents.forEach(agent => spawnAgent(agent));
```

### Step 4: Progress Tracking

```bash
# Create tracking directory
mkdir -p ~/git/stackshift-batch-results

# Monitor progress
while true; do
  COMPLETE=$(find ~/git/stackshift-batch-results -name ".complete" | wc -l)
  echo "Completed: $COMPLETE / $WIDGET_COUNT"

  # Check if batch done
  if [ $COMPLETE -ge 5 ]; then
    echo "✅ Batch 1 complete"
    break
  fi

  sleep 30
done

# Start next batch...
```

### Step 5: Result Aggregation

```bash
# After all batches complete
echo "=== Aggregating Results ==="

# Create master report
cat > ~/git/stackshift-batch-results/BATCH_SUMMARY.md <<EOF
# StackShift Batch Analysis Results

**Date:** $(date)
**Widgets Analyzed:** $WIDGET_COUNT
**Batches:** $(($WIDGET_COUNT / 5))
**Total Time:** [calculated]

## Completion Status

$(for service in $(cat /tmp/services-to-analyze.txt); do
  service_name=$(basename $service)
  if [ -f ~/git/stackshift-batch-results/$service_name/.complete ]; then
    echo "- ✅ $service_name - Complete"
  else
    echo "- ❌ $service_name - Failed or incomplete"
  fi
done)

## Results by Widget

$(for service in $(cat /tmp/services-to-analyze.txt); do
  service_name=$(basename $service)
  if [ -f ~/git/stackshift-batch-results/$service_name/.complete ]; then
    echo "### $service_name"
    echo ""
    echo "**Specs created:** $(find ~/git/stackshift-batch-results/$service_name/.specify/memory/specifications -name "*.md" 2>/dev/null | wc -l)"
    echo "**Modules analyzed:** $(cat ~/git/stackshift-batch-results/$service_name/.stackshift-state.json 2>/dev/null | jq -r '.metadata.modulesAnalyzed // 0')"
    echo ""
  fi
done)

## Next Steps

All specifications are ready for review:
- Review specs in each service's batch-results directory
- Merge specs to actual repos if satisfied
- Run Gears 4-6 as needed
EOF

cat ~/git/stackshift-batch-results/BATCH_SUMMARY.md
```

---

## Result Structure

```
~/git/stackshift-batch-results/
├── BATCH_SUMMARY.md                    # Master summary
├── batch-progress.json                 # Real-time tracking
│
├── service-user-api/
│   ├── .complete                       # Marker file
│   ├── .stackshift-state.json         # State
│   ├── analysis-report.md              # Gear 1 output
│   ├── docs/reverse-engineering/       # Gear 2 output
│   │   ├── functional-specification.md
│   │   ├── service-logic.md
│   │   ├── modules/
│   │   │   ├── shared-pricing-utils.md
│   │   │   └── shared-discount-utils.md
│   │   └── [7 more docs]
│   └── .specify/                       # Gear 3 output
│       └── memory/
│           ├── constitution.md
│           └── specifications/
│               ├── pricing-display.md
│               ├── incentive-logic.md
│               └── [more specs]
│
├── service-inventory/
│   └── [same structure]
│
└── [88 more services...]
```

---

## Monitoring Progress

**Real-time status:**

```bash
# I'll show you periodic updates
echo "=== Batch Progress ==="
echo "Batch 1 (5 services): 3/5 complete"
echo "  ✅ service-user-api - Complete (12 min)"
echo "  ✅ service-inventory - Complete (8 min)"
echo "  ✅ service-contact - Complete (15 min)"
echo "  🔄 service-search - Running (7 min elapsed)"
echo "  ⏳ service-pricing - Queued"
echo ""
echo "Estimated time remaining: 25 minutes"
```

---

## Error Handling

**If a service fails:**
```bash
# Retry failed services
failed_services=(service-search service-pricing)

for service in "${failed_services[@]}"; do
  echo "Retrying: $service"
  # Spawn new agent for retry
done
```

**Common failures:**
- Missing package.json
- Tests failing (can continue anyway)
- Module source not found (prompt for location)

---

## Use Cases

**1. Entire monorepo migration:**
```
Analyze all 90+ ws-* services for migration planning
↓
Result: Complete business logic extracted from entire platform
↓
Use specs to plan Next.js migration strategy
```

**2. Selective analysis:**
```
Analyze just the 10 high-priority services first
↓
Review results
↓
Then batch process remaining 80
```

**3. Module analysis:**
```
cd ~/git/my-monorepo/services
Analyze all shared packages (not services)
↓
Result: Shared module documentation
↓
Understand dependencies before service migration
```

---

## Configuration Options

I'll ask you to configure:

- **Repository list:** All in folder, or custom list?
- **Batch size:** How many parallel (3/5/10)?
- **Gears to run:** 1-3 only or full 1-6?
- **Route:** Auto-detect or force specific route?
- **Output location:** Central results dir or per-repo?
- **Error handling:** Stop on failure or continue?

---

## Comparison with thoth-cli

**thoth-cli (Upgrades):**
- Orchestrates 90+ service upgrades
- 3 phases: coverage → discovery → implementation
- Tracks in .upgrade-state.json
- Parallel processing (2-5 at a time)

**StackShift Batch (Analysis):**
- Orchestrates 90+ service analyses
- 6 gears: analyze → reverse-engineer → create-specs → gap → clarify → implement
- Tracks in .stackshift-state.json
- Parallel processing (3-10 at a time)
- Can output to central location

---

## Example Session

```
You: "I want to analyze all Osiris services in ~/git/my-monorepo/services"

Me: "Found 92 services! Let me configure batch processing..."

[Asks questions conversationally]
- Process all 92? ✅
- Batch size: 5
- Gears: 1-3 (just analyze and spec, no implementation)
- Output: Central results directory

Me: "Starting batch analysis..."

Batch 1 (5 services): service-user-api, service-inventory, service-contact, ws-inventory, service-pricing
[Spawns 5 parallel agents using Task tool]

[15 minutes later]
"Batch 1 complete! Starting batch 2..."

[3 hours later]
"✅ All 92 services analyzed!

Results: ~/git/stackshift-batch-results/
- 92 analysis reports
- 92 sets of specifications
- 890 total specs extracted
- Multiple shared packages documented

Next: Review specs and begin migration planning"
```

---

## Managing Batch Sessions

### View Current Batch Session

```bash
# Check if batch session exists in current directory and view configuration
if [ -f .stackshift-batch-session.json ]; then
  echo "📦 Active Batch Session in $(pwd)"
  cat .stackshift-batch-session.json | jq '.'
else
  echo "No active batch session in current directory"
fi
```

### View All Batch Sessions

```bash
# Find all active batch sessions
echo "🔍 Finding all active batch sessions..."
find ~/git -name ".stackshift-batch-session.json" -type f 2>/dev/null | while read session; do
  echo ""
  echo "📦 $(dirname $session)"
  cat "$session" | jq -r '"  Route: \(.answers.route) | Repos: \(.processedRepos | length)/\(.totalRepos)"'
done
```

### Clear Batch Session

**After batch completes:**
```bash
# I'll ask you:
# "Batch processing complete! Clear batch session? (Y/n)"

# If yes:
rm .stackshift-batch-session.json
echo "✅ Batch session cleared"

# If no:
echo "✅ Batch session kept (will be used for next batch run in this directory)"
```

**Manual clear (current directory):**
```bash
# Clear batch session in current directory
rm .stackshift-batch-session.json
```

**Manual clear (specific directory):**
```bash
# Clear batch session in specific directory
rm ~/git/my-monorepo/services/.stackshift-batch-session.json
```

**Why keep batch session?**
- Run another batch with same configuration
- Process more repos later in same directory
- Continue interrupted batch
- Consistent settings for related batches

**Why clear batch session?**
- Done with current migration
- Want different configuration for next batch
- Starting fresh analysis
- Free up directory for different batch type

---

## Batch Session Benefits

**Without batch session (old way):**
```
Batch 1: Answer 10 questions ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Batch 2: Answer 10 questions AGAIN ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Batch 3: Answer 10 questions AGAIN ⏱️ 2 min
  ↓ Process 3 repos (15 min)

Total: 30 questions answered, 6 min wasted
```

**With batch session (new way):**
```
Setup: Answer 10 questions ONCE ⏱️ 2 min
  ↓ Batch 1: Process 3 repos (15 min)
  ↓ Batch 2: Process 3 repos (15 min)
  ↓ Batch 3: Process 3 repos (15 min)

Total: 10 questions answered, 0 min wasted
Saved: 4 minutes per 9 repos processed
```

**For 90 repos in batches of 3:**
- Old way: 300 questions answered (60 min of clicking)
- New way: 10 questions answered (2 min of clicking)
- **Time saved: 58 minutes!** ⚡

---

**This batch processing system is perfect for:**
- Monorepo migration (90+ services)
- Multi-repo monorepo analysis
- Department-wide code audits
- Portfolio modernization projects