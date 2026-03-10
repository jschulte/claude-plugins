# Implementation Details

Reference for file path extraction, ASCII generation, and coverage calculation logic.

---

## File Path Extraction Patterns

Look for these patterns in spec markdown:

```markdown
# In "Files" or "Implementation Status" sections:
- `api/handlers/foo.ts`
- **Backend:** `src/services/bar.js`
- File: `site/pages/Home.tsx`

# In code blocks:
// File: lib/utils/pricing.ts

# In lists:
## Backend Components
- Vehicle handler: `api/handlers/vehicle.ts`
- Pricing service: `api/services/pricing.ts`
```

**Extraction strategy:**
1. Parse markdown sections titled "Files", "Implementation Status", "Components"
2. Extract backtick-wrapped paths: `path/to/file.ext`
3. Extract bold paths: **File:** path/to/file.ext
4. Look for file extensions: .ts, .tsx, .js, .jsx, .py, .go, .tf, .yml, etc.
5. Validate paths exist in the codebase

---

## ASCII Box Generation

```
# Box characters
TOP="+-+"
SIDE="|"
DIVIDER="+-+"
BOTTOM="+-+"
BRANCH="|-"
LAST_BRANCH="`-"
```

Use unicode box-drawing characters (not ASCII approximations):
```
+-+-+  (top)
|     (sides)
+-+-+  (divider)
+-+-+  (bottom)
|- `-   (tree branches)
```

---

## Coverage Calculation

```
coverage_percent = round((covered_files / total_files) * 100)
```

Per-category:
```
backend_coverage = (covered_backend / total_backend) * 100
frontend_coverage = (covered_frontend / total_frontend) * 100
```

---

## Heat Map Visualization

Generate a 20-block bar per category:
```
filled_blocks = round(percentage / 5)
empty_blocks = 20 - filled_blocks
bar = "[" + filled_blocks + empty_blocks + "] " + percentage + "%"
```

Example output:
```
Backend       [██████████████████░░] 92%
```

---

## Output Template

```markdown
# Spec-to-Code Coverage Map

Generated: [TIMESTAMP]
Total Specs: [COUNT]
Total Files Covered: [COUNT]
Overall Coverage: [PERCENTAGE]%

---

## Coverage by Spec

[For each spec, ASCII box diagram with files]

---

## Files -> Specs Reverse Index

[Table of all files and which specs cover them]

---

## Coverage Statistics

[Stats table and heat map]

---

## Coverage Gaps

[List of files not covered by any spec]

---

## Shared Files

[Files referenced by multiple specs with risk assessment]

---

## Recommendations

- [Action items based on analysis]
- [Gaps to address]
- [Refactoring opportunities]
```
