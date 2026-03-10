---
name: bmad-synthesize
description: Generate 4 BMAD planning artifacts (PRD, Architecture, Epics, UX Design) from Gear 2 reverse-engineering docs. Three modes: YOLO (automatic), Guided (targeted questions), Interactive (section-by-section review).
allowed-tools:
  - Read
  - Write
  - Bash
  - Glob
  - Grep
---

# BMAD Synthesize

Generate BMAD planning artifacts from reverse-engineering documentation.

**Time:** 10-30 minutes (mode-dependent)
**Prerequisites:** Gear 2 complete with 9-11 docs in `docs/reverse-engineering/`
**Output:** 4 artifacts in `_bmad-output/planning-artifacts/`

---

## Modes

### Mode A: YOLO (Fully Automatic)

**Time:** ~10 minutes | **User input:** None

- Map all 11 docs to BMAD artifacts automatically.
- For `[NEEDS USER INPUT]` markers, infer from available context and mark with `[AUTO-INFERRED - review recommended]`.
- Treat `[INFERRED]` markers as accepted.
- Generate all 4 artifacts sequentially.

### Mode B: Guided (Recommended)

**Time:** ~15-20 minutes | **User input:** 5-10 targeted questions

- Auto-populate all sections the docs can answer with high confidence.
- Present targeted questions only for sections containing `[NEEDS USER INPUT]` markers, sections shorter than 3 lines, or sections containing `[INFERRED]` markers.
- Generate all 4 artifacts with user answers incorporated.

### Mode C: Interactive

**Time:** ~25-30 minutes | **User input:** Full conversation

- Pre-load all docs as context.
- Walk through each artifact section by section, showing draft content and asking for approval or changes.
- Write each artifact immediately after approval (not all at end).

---

## Marker Format

Markers follow these exact formats (case-sensitive, square brackets required):
- `[INFERRED]` - Content inferred by upstream analysis
- `[NEEDS USER INPUT]` - Content that requires human clarification
- `[AUTO-INFERRED - review recommended]` - Content inferred by this skill during synthesis
- `[UNAVAILABLE - requires <doc-name>]` - Section cannot be populated due to missing source doc

If no markers are found in a document, treat all content as high-confidence.

---

## Step 0: Verify Prerequisites

Run this bash script to check that Gear 2 docs exist:

```bash
DOCS_DIR="docs/reverse-engineering"
REQUIRED_DOCS=("functional-specification.md" "integration-points.md" "configuration-reference.md" "data-architecture.md" "operations-guide.md" "technical-debt-analysis.md" "observability-requirements.md" "visual-design-system.md" "test-documentation.md" "business-context.md" "decision-rationale.md")

MISSING=0
MISSING_LIST=""
for doc in "${REQUIRED_DOCS[@]}"; do
  if [ ! -f "$DOCS_DIR/$doc" ]; then
    MISSING_LIST="$MISSING_LIST $doc"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -gt 0 ]; then
  echo "MISSING ($MISSING):$MISSING_LIST"
else
  echo "All 11 reverse-engineering docs found."
fi
```

**If all 11 docs found:** Proceed to Step 1.

**If 0-8 docs found:** Stop. Tell user to run `/stackshift.reverse-engineer` first.

**If exactly 9 docs found (missing business-context.md and decision-rationale.md):** This is a legacy run. Read `operations/legacy-9doc-mode.md` for the reduced-coverage rules. Present the user with the warning and options from that file. If user chooses to proceed, apply the UNAVAILABLE/DEGRADED rules throughout all subsequent steps.

Log: `"Step 0 complete: [N]/11 docs found."`

---

## Step 1: Load and Validate Docs

Read all available docs from `docs/reverse-engineering/` using the Read tool (parallel reads recommended).

For each doc, verify it contains at least one expected section heading (any `##` heading). Track results:

- **Loaded OK:** Doc parsed, contains structured content.
- **Empty/Unparseable:** Doc exists but contains no `##` headings or is under 10 lines.
- **Missing:** Doc not found (already caught in Step 0).

If any doc is empty or unparseable, report to the user:

```
WARNING: The following docs exist but appear empty or malformed:
  - [doc-name]: [reason - e.g., "no section headings found", "only 3 lines"]

Options:
A) Proceed without these docs (affected sections marked [UNAVAILABLE])
B) Abort and fix the docs first
```

If user chooses A, treat empty/unparseable docs the same as missing docs for mapping purposes.

From all successfully loaded docs, extract:
- All FRs, NFRs, user stories, personas
- All data models, API contracts, integration points
- All ADRs, technology selections, design principles
- All business context, goals, constraints
- All `[INFERRED]` and `[NEEDS USER INPUT]` markers (exact string match, case-sensitive)

Log: `"Step 1 complete: [N] docs loaded, [M] with issues."`

---

## Step 2: Choose Mode

Present this prompt to the user:

```
How should BMAD artifacts be generated?

A) YOLO - Fully automatic, no questions asked (~10 min)
B) Guided - Auto-fill + 5-10 targeted questions (~15-20 min) [Recommended]
C) Interactive - Section-by-section review (~25-30 min)
```

If the user's response does not clearly indicate A, B, or C, ask again. If the user explicitly asks you to choose, default to B (Guided).

**Exception:** In batch mode (invoked by `/stackshift.batch`), skip this step and use YOLO mode automatically.

Log: `"Step 2 complete: Mode [A|B|C] selected."`

---

## Step 3: Generate Artifacts

Read `operations/doc-mapping.md` for the complete source-to-artifact mapping tables. Read `operations/output-templates.md` for the output structure of each artifact.

Generate artifacts in this order (sequential, not parallel -- each artifact may reference content from previously generated artifacts):

1. **prd.md** - References: functional-specification, business-context, technical-debt-analysis, integration-points
2. **architecture.md** - References: data-architecture, integration-points, operations-guide, decision-rationale, configuration-reference, observability-requirements
3. **epics.md** - References: functional-specification FRs (grouped by domain), business-context personas, technical-debt-analysis migration matrix. Also references prd.md FR groupings.
4. **ux-design-specification.md** - References: visual-design-system, business-context personas, functional-specification user stories

### Validation Checkpoint (after each artifact)

After generating each artifact, verify it contains all expected sections from the mapping table. If any section is empty or contains only placeholder text, flag it. Log progress:

`"Generated [artifact name] - [N] sections populated, [M] inferred, [K] unavailable."`

### Mode-Specific Behavior

#### YOLO Mode

For each artifact in order:
1. Read the source sections identified in `operations/doc-mapping.md`.
2. For each mapping entry, read the source section and write its content into the corresponding BMAD artifact section, restructuring as needed to match the BMAD format.
3. For `[NEEDS USER INPUT]` markers, infer from surrounding context and mark with `[AUTO-INFERRED - review recommended]`.
4. For Mermaid diagrams in architecture.md, generate from integration-points.md data flow descriptions.
5. Run validation checkpoint.

#### Guided Mode

1. Read all docs and identify sections containing `[NEEDS USER INPUT]` markers, `[INFERRED]` markers, or sections shorter than 3 lines.
2. Auto-populate all high-confidence sections (no markers, 3+ lines of content).
3. Present 5-10 targeted questions covering the ambiguous items. Example questions:
   - "The codebase suggests [X] as the primary user persona. Is this accurate?"
   - "Business goals appear to center on [X]. What are the top 3 success metrics?"
   - "FRs group naturally into [N] domains: [list]. Does this epic structure make sense?"
4. Replace any `[NEEDS USER INPUT]` or `[AUTO-INFERRED]` markers in the generated content with the user's answers.
5. Generate all 4 artifacts with answers incorporated.
6. Run validation checkpoint after each artifact.

#### Interactive Mode

1. Create a one-page context brief summarizing all loaded docs.
2. Walk through prd.md section by section: show draft content, ask "Approve as-is, or modify?", incorporate changes.
3. Write prd.md immediately after all sections are approved.
4. Repeat for architecture.md, epics.md, ux-design-specification.md -- writing each immediately after approval.
5. If user rejects a section, ask for specific changes and revise. If user rejects all sections of an artifact, ask whether to skip the artifact entirely or start it over.
6. Run validation checkpoint after each artifact is written.

**Interactive mode interruption handling:** Write each artifact immediately after approval (not all at end). If the session is interrupted, previously written artifacts are preserved. On resumption, check for existing artifacts in `_bmad-output/planning-artifacts/` and offer to continue from where the user left off.

---

## Step 4: Write Output

Create `_bmad-output/planning-artifacts/` directory if it does not exist. If the directory already exists, warn the user:

```
Directory _bmad-output/planning-artifacts/ already exists.
Overwrite existing artifacts? (Y/N)
```

If user says N, abort. If YOLO mode, overwrite without asking.

Write all 4 artifacts using the templates from `operations/output-templates.md`. Include YAML frontmatter in every artifact with these fields:
- `workflowType` - one of: prd, architecture, epics, ux-design
- `project_name` - from state file or repo name
- `date` - current date (ISO 8601)
- `synthesize_mode` - one of: yolo, guided, interactive
- `inputDocuments` - list of all source docs that provided content
- `coverage_score` - integer 0-100, percentage of sections filled from docs (not inferred)

**Note:** In Interactive mode, artifacts are written during Step 3 as sections are approved. Step 4 only applies to YOLO and Guided modes.

Log: `"Step 4 complete: [N] artifacts written to _bmad-output/planning-artifacts/."`

---

## Step 5: Generate Synthesis Report

Output a report using the template from `operations/output-templates.md` (Synthesis Report Template section). Include:
- Mode used
- Docs loaded count and any with errors
- Per-artifact coverage percentages
- Items requiring review (count of `[AUTO-INFERRED]` markers per artifact)
- Output path

If legacy 9-doc mode was used, append the legacy addendum from `operations/legacy-9doc-mode.md`.

Log: `"Step 5 complete: Synthesis report generated."`

---

## Batch Mode

When invoked by `/stackshift.batch`:
- Use YOLO mode automatically (skip Step 2).
- Overwrite existing artifacts without prompting.
- Artifacts are written to `_bmad-output/planning-artifacts/` within each repo's working directory.
- Guided and Interactive modes are not available in batch mode.

---

## Error Recovery Summary

| Failure | Recovery |
|---|---|
| Doc missing (Step 0) | If 9 legacy docs, offer legacy mode. If <9, abort. |
| Doc empty/unparseable (Step 1) | Warn user, offer to proceed without or abort. |
| Invalid mode selection (Step 2) | Re-prompt. Default to Guided if user asks you to choose. |
| Section mapping produces empty content (Step 3) | Flag in validation checkpoint, mark `[UNAVAILABLE]`. |
| Output directory exists (Step 4) | Prompt to overwrite (or auto-overwrite in YOLO/batch). |
| Interactive session interrupted (Step 3) | Previously written artifacts preserved. Offer resume on next run. |
| Ambiguous user answer in Guided mode | Ask a clarifying follow-up. Do not guess. |

---

## Technical Notes

- Read all docs using the Read tool with parallel reads for Step 1.
- Generate Mermaid diagrams in architecture.md from integration-points.md data flow descriptions.
- Number ADRs sequentially from decision-rationale.md, preserving original order.
