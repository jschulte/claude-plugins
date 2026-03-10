---
name: spec-coverage-map
description: Generate a visual spec-to-code coverage map showing which code files are covered by which specs. Creates ASCII diagrams, reverse indexes, and coverage statistics. Use after implementation or during cleanup to validate spec coverage.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

# Spec-to-Code Coverage Map

Generate a coverage map showing the relationship between specs and implementation files.

**Output:** `docs/spec-coverage-map.md` (overwrite if it already exists -- the file is regenerated from scratch each run)

**Dependencies:** This skill expects specs produced by `/stackshift.create-specs` or `/speckit.analyze` with file references in sections named "Files", "File Structure", "Implementation Status", "Components Implemented", or "Technical Details". If those sections are absent, fall back to regex extraction of backtick-wrapped paths.

**Cross-skill references:** `/stackshift.create-specs`, `/speckit.clarify`, `/speckit.analyze`

---

## Process

### Step 1: Discover All Specs

Check BOTH directories unconditionally and merge results. Do NOT use `||` fallback.

```bash
# Collect from both locations
SPECS_SPECIFY=$(find ".specify/memory/specifications" -name "*.md" -type f 2>/dev/null)
SPECS_DIR=$(find "specs" -name "*.md" -type f 2>/dev/null)

# Merge results and deduplicate
ALL_SPECS=$(echo "$SPECS_SPECIFY"$'\n'"$SPECS_DIR" | sort -u | sed '/^$/d')
SPEC_COUNT=$(echo "$ALL_SPECS" | wc -l)
echo "Found $SPEC_COUNT specs"
```

If zero specs found after checking all locations, emit the error from the Error Handling section and stop.

### Step 2: Extract File References from Each Spec

For each spec, extract file paths using these patterns:
- Backtick-wrapped paths: `` `path/to/file.ext` ``
- Bold paths: **File:** path/to/file.ext
- Paths in "Files", "Implementation Status", "Components Implemented", or "Technical Details" sections
- File extensions: .ts, .tsx, .js, .jsx, .py, .go, .tf, .yml, etc.

For full extraction pattern details, see `operations/implementation-details.md`.

**Per-spec guard:** If a spec contains no extractable file paths, include it in the coverage map with an empty file list and a warning marker (`[NO FILE REFERENCES]`). Note it in the Gap Analysis section as "Spec with no file references."

#### CHECKPOINT: Validate Step 2 Output

After extracting file references from all specs:

1. For each extracted path, verify it exists in the codebase using Glob or Bash. Mark non-existent files with an X indicator.
2. Count total specs processed vs. total specs discovered. They MUST match.
3. If more than 50% of specs have zero file references, emit the "specs have no file references" error and stop.

Proceed to Step 3 only after validation passes.

### Step 3: Categorize Files

Group extracted files by type:
- **Backend**: api/, src/handlers/, src/services/, lib/
- **Frontend**: site/, pages/, components/, app/
- **Infrastructure**: infrastructure/, terraform/, .github/workflows/
- **Database**: prisma/, migrations/, schema/
- **Scripts**: scripts/, bin/
- **Config**: package.json, tsconfig.json, etc.
- **Tests**: *.test.ts, *.spec.ts, __tests__/

### Step 4: Generate ASCII Box Diagrams

For each spec, create a box diagram:

```
┌─────────────────────────────────┐
│  001-feature-name               │ Status: COMPLETE
├─────────────────────────────────┤
│ Backend:                        │
│  ├─ api/src/handlers/foo.js     │
│  └─ api/src/services/bar.js     │
│ Frontend:                       │
│  └─ site/src/pages/Foo.tsx      │
│ Infrastructure:                 │
│  └─ .github/workflows/deploy.yml│
└─────────────────────────────────┘
```

Use unicode box-drawing characters: `┌ ─ ┐ │ ├ ─ ┤ └ ─ ┘`

NEVER reproduce example data from reference files. Derive all file names and structure from the actual codebase.

### Step 5: Create Reverse Index

Build a table showing which spec(s) cover each file:

```markdown
| File | Covered By | Count | Risk |
|------|------------|-------|------|
| path/to/file.ts | 001-name, 003-name | 2 | MEDIUM |
```

Risk levels:
- 1 spec = LOW (single spec, normal coverage)
- 2-3 specs = MEDIUM (shared across features)
- 4+ specs = HIGH (critical shared utility)

#### CHECKPOINT: Validate Step 5 Output

1. Total unique files in the reverse index MUST equal total unique files across all spec boxes from Step 4.
2. Every file in the reverse index MUST appear in at least one spec box, and vice versa.
3. If counts do not match, re-examine Steps 2-4 for dropped or duplicated entries before proceeding.

### Step 6: Calculate Coverage Statistics

Build a table with coverage per category and an overall total:

```markdown
| Category | Total Files | Covered | Coverage % |
|----------|-------------|---------|------------|
| Backend | [N] | [N] | [N]% |
| ...      | ...         | ...     | ...        |
| **TOTAL** | **[N]** | **[N]** | **[N]%** |
```

Generate a heat map bar per category (20 blocks, filled proportional to percentage):
```
Category      [████████████████░░░░] 80%
```

See `operations/implementation-details.md` for calculation formulas.

### Step 7: Identify Gaps

List all code files NOT covered by any spec, grouped by category.

For each gap file, annotate with a likely reason (deprecated, dev-only, utility, WIP).

Generate actionable recommendations:
- Remove deprecated files
- Create specs for utilities containing business logic
- Document dev-only tools in a utilities spec

### Step 8: Highlight Shared Files

List files referenced by 3+ specs in a table with risk levels.

For high-risk files (4+ specs):
- Flag that changes affect multiple features
- Flag that comprehensive testing is required
- Recommend splitting if too coupled

Steps 5-8 are independent and may be generated in any order. All depend on the file-to-spec mapping established in Steps 1-4.

---

## Output Assembly

Assemble all sections into `docs/spec-coverage-map.md` following the template in `operations/implementation-details.md`.

For a complete example of the expected output structure, see `operations/example-output.md`. Use it as a structural guide only -- derive all data from the actual codebase.

---

## Success Criteria

Verify the following are present in the generated output:

- `docs/spec-coverage-map.md` file created
- ASCII box diagram for every discovered spec
- Reverse index table (files to specs) with risk levels
- Coverage statistics by category with heat map
- Gap analysis with actionable recommendations
- Shared files risk assessment
- Overall coverage percentage calculated

---

## Error Handling

**If no specs found:**
```
No specs found in .specify/memory/specifications/ or specs/.
Cannot generate coverage map without specs.
Run /stackshift.create-specs to generate specs first.
```

**If a spec has no file references (per-spec):**
Include the spec in the map with an empty file list and `[NO FILE REFERENCES]` marker. Note it in Gap Analysis.

**If ALL specs have no file references:**
```
Specs do not contain file references.
Cannot generate coverage map.

Likely causes:
1. Specs were created but implementation has not started
2. Specs need "Files" or "Implementation Status" sections
3. Using old spec format -- update specs
```

**If coverage is very low (< 50%):**
```
Coverage is only [N]%.

This indicates:
- Many files not documented in specs
- Specs may be incomplete

Run /speckit.analyze to validate alignment.
```

**If file path validation fails (Step 2 checkpoint):**
Mark non-existent files with X in the coverage map. Include a "Stale References" subsection listing paths that appear in specs but do not exist in the codebase.

---

## Integration Points

After Gear 6 (Implement) completion or during cleanup/documentation phases, generate the coverage map and report the summary (total coverage, gap count, high-risk shared files).

Parse specs in sorted order (001, 002, etc.) for consistent output. Use relative paths from project root. Include a timestamp in the output header.
