# Write Output

Instructions for assembling and writing the two output files to `_portable-transplant/`.

---

## targeted-epics.md

Write to `_portable-transplant/targeted-epics.md`. Overwrite if the file exists.

### Structure

Assemble in this order:

1. **YAML frontmatter** with these required fields:
   - `source_project` -- name from portable extract's epics.md frontmatter
   - `target_project` -- name from target PRD
   - `transplant_date` -- current date (YYYY-MM-DD)
   - `transplant_mode` -- "yolo", "guided", or "interactive"
   - `source_portable_extract` -- absolute path to `_portable-extract/`
   - `target_bmad_docs` -- absolute paths to target PRD and Architecture
   - `persona_mapping` -- mapping of abstract roles to target personas
   - `domain_translations` -- count of translated terms
   - `data_contract_mappings` -- count of mapped contracts

2. **Introduction** -- one-paragraph summary: what this file is, source and target names, date generated.

3. **Imported Persona Context** -- for each mapped persona:
   - Target persona name (mapped from [Abstract])
   - Role description in target context
   - Original source roles

4. **Epics and Stories** -- all translated epics with:
   - Epic name in target domain language
   - Priority (P0/P1/P2), business goal, source epic reference
   - Each story with target persona, translated language, mapped data contracts
   - BR-* IDs preserved unchanged
   - `[REVIEW]` markers on uncertain mappings
   - `[TARGET OVERRIDE]` markers on adapted business rules
   - `[NEW]` markers on target-specific additions

5. **Cross-Reference Table** -- stories, business rules, and data contracts mapped source-to-target with adaptation notes.

### Example Frontmatter

```yaml
---
source_project: "ws-payment-calculator"
target_project: "homequest-app"
transplant_date: "2025-01-15"
transplant_mode: "guided"
source_portable_extract: "/path/to/_portable-extract/"
target_bmad_docs: "/path/to/target/prd.md, architecture.md"
persona_mapping:
  "[User]": "Homebuyer"
  "[Admin]": "Property Manager"
  "[System]": ["MLS Data Feed", "Mortgage API"]
domain_translations: 12
data_contract_mappings: 6
---
```

---

## transplant-report.md

Write to `_portable-transplant/transplant-report.md`. Overwrite if the file exists.

### Structure

Assemble in this order with these required fields:

1. **YAML frontmatter:**
   - `transplant_date` -- current date (YYYY-MM-DD)
   - `source_project` -- name from portable extract
   - `target_project` -- name from target PRD
   - `transplant_mode` -- mode used
   - `persona_count` -- number of personas mapped
   - `term_count` -- number of domain terms translated
   - `contract_count` -- number of data contracts mapped
   - `epic_count` -- number of epics generated
   - `story_count` -- number of stories generated
   - `review_items` -- number of items flagged for review

2. **Summary Statistics** -- counts for personas mapped, terms translated, contracts matched, stories generated, items excluded, items needing review.

3. **Persona Mapping Detail** -- table with columns: Abstract, Target, Confidence (High/Medium/Low), Notes.

4. **Domain Language Translations** -- table with columns: Source Term, Target Term, Confidence, Context.

5. **Data Contract Mapping** -- per contract: field-level mapping table with columns: Portable Field, Target Field, Status (Mapped/Direct/Excluded/Gap).

6. **Business Rule Adaptations** -- table with columns: Rule ID, Adaptation, Notes. Include `[TARGET OVERRIDE]` entries.

7. **Excluded Content** -- list of stories, terms, or fields excluded with documented reasons.

8. **Items Requiring Review** -- numbered list of flagged items with context.

9. **Next Steps** -- concrete instructions for what the user should do after transplant.
