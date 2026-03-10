# Generate Migration Report

Generate `migration-report.md` summarizing the full widget migration pipeline results.

---

## Template

```markdown
---
widget: "<widget identifier>"
widget_type: "<v9-velocity|v9-viewmodel|osiris>"
migration_date: "<date>"
mode: "<yolo|guided|interactive>"
target_stack: "React Router 7 + Iris + TypeScript"
---

# Widget Migration Report

## Source Widget
- **Type:** <widget type>
- **ID:** <widget ID>
- **Category:** <category if V9>
- **Location:** <source path>

## Extraction Summary

| Metric | Count |
|--------|-------|
| Files analyzed | <N> |
| Templates/components | <N> |
| Java/Groovy classes | <N> |
| Total lines of code | <N> |
| Component nesting depth | <N> |
| Conditional branches | <N> |

## Preference Catalog
- **Total preferences:** <N>
- **Mapped to React props:** <N>
- **Mapped to hooks:** <N>
- **Mapped to context:** <N>
- **Mapped to design tokens:** <N>
- **Deprecated (intentionally dropped):** <N>
- **Coverage:** 100%

## Iris Component Mapping
- **Legacy components:** <N>
- **Direct Iris mappings:** <N>
- **Composed Iris mappings:** <N>
- **Custom components needed:** <N>
- **Coverage:** 100%

## Portable Specs
- **Business rules extracted:** <N>
- **Data contracts:** <N>
- **Edge cases:** <N>
- **Error states:** <N>

## Targeted Epics
- **Stories (implementation-ready):** <N>
- **Source-platform terms remaining:** 0
- **Stories referencing PREF-* IDs:** <N>/<N>
- **Stories referencing COMP-* IDs:** <N>/<N>
- **Stories referencing BR-* IDs:** <N>/<N>

## Complexity Assessment
- **Overall complexity:** VERY HIGH / HIGH / MEDIUM / LOW
- **Key risks:**
  - [Risk 1]
  - [Risk 2]

## Gaps and Items Needing Review
- [Item 1 - description and recommendation]

## BMAD Integration
- **Specs written to:** docs/specs/widgets/{widget-name}/
- **Ready for:** `/bmad-bmm-create-story` to generate implementation stories
- **Reference from Dev Notes:** Widget specs at docs/specs/widgets/{widget-name}/

## Next Steps
1. Review specs in docs/specs/widgets/{widget-name}/
2. Run `/bmad-bmm-create-story` for the relevant Epic 3 story
3. The create-story workflow will reference these widget specs in Dev Notes
4. Run `/bmad-bmm-dev-story` to implement
```

## Populating the Report

1. Pull extraction metrics from Step 1 agent output
2. Pull preference counts from Step 2 preference catalog
3. Pull component counts from Step 3 Iris mapping
4. Pull business rule/data contract counts from Step 4 portable specs
5. Pull story counts and cross-reference rates from Step 5 targeted epics
6. Assess complexity based on: preference count, component depth, business rule count, custom components needed
