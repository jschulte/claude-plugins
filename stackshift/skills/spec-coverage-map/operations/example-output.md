# Example Coverage Map Output

Reference example for the generated `docs/spec-coverage-map.md`. Use this as a structural guide only. NEVER reproduce these specific file names, percentages, or recommendations -- derive all data from the actual codebase.

---

```markdown
# Spec-to-Code Coverage Map

Generated: 2025-11-19T17:45:00Z
Total Specs: 12
Total Files Covered: 99
Overall Coverage: 91%

---

## Coverage by Spec

┌─────────────────────────────────────────────┐
│  001-vehicle-details-display                │ Status: COMPLETE
├─────────────────────────────────────────────┤
│ Backend (3 files):                          │
│  ├─ api/handlers/vehicle-details.ts         │
│  ├─ api/services/vehicle-data.ts            │
│  └─ lib/validators/vin.ts                   │
│ Frontend (2 files):                         │
│  ├─ site/pages/VehicleDetails.tsx           │
│  └─ site/components/VehicleCard.tsx         │
│ Tests (2 files):                            │
│  ├─ api/handlers/vehicle-details.test.ts    │
│  └─ site/pages/VehicleDetails.test.tsx      │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│  002-inventory-search                       │ Status: COMPLETE
├─────────────────────────────────────────────┤
│ Backend (4 files):                          │
│  ├─ api/handlers/search.ts                  │
│  ├─ api/services/elasticsearch.ts           │
│  ├─ lib/query-builder.ts                    │
│  └─ lib/filters/vehicle-filters.ts          │
│ Frontend (3 files):                         │
│  ├─ site/pages/Search.tsx                   │
│  ├─ site/components/SearchBar.tsx           │
│  └─ site/components/FilterPanel.tsx         │
└─────────────────────────────────────────────┘

... [remaining specs]

---

## Files -> Specs Reverse Index

| File | Covered By Specs | Count | Risk |
|------|------------------|-------|------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 | HIGH |
| lib/api/client.ts | 002, 005, 006, 008 | 4 | HIGH |
| api/handlers/vehicle-details.ts | 001 | 1 | LOW |
| site/pages/Home.tsx | 003 | 1 | LOW |
| lib/types/vehicle.ts | 001, 002, 011 | 3 | MEDIUM |

... [all files]

---

## Coverage Statistics

| Category | Total Files | Covered | Uncovered | Coverage % |
|----------|-------------|---------|-----------|------------|
| Backend | 45 | 42 | 3 | 93% |
| Frontend | 38 | 35 | 3 | 92% |
| Infrastructure | 12 | 10 | 2 | 83% |
| Database | 8 | 8 | 0 | 100% |
| Scripts | 6 | 4 | 2 | 67% |
| **TOTAL** | **109** | **99** | **10** | **91%** |

### Coverage Heat Map

Backend       [██████████████████░░] 93%
Frontend      [██████████████████░░] 92%
Infrastructure [████████████████░░░░] 83%
Database      [████████████████████] 100%
Scripts       [█████████████░░░░░░░] 67%

---

## Coverage Gaps (10 files)

Files not covered by any specification:

**Backend (3 files):**
- api/handlers/legacy-foo.js - Deprecated?
- api/utils/debug.ts - Dev utility?
- api/middleware/cors.ts - Shared infrastructure?

**Frontend (3 files):**
- site/components/DevTools.tsx - Dev-only component
- site/pages/404.tsx - Error page (needs spec?)
- site/utils/logger.ts - Utility (shared)

**Infrastructure (2 files):**
- .github/workflows/experimental.yml - WIP?
- infrastructure/terraform/dev-only.tf - Dev env?

**Scripts (2 files):**
- scripts/experimental/test.sh - WIP
- scripts/deprecated/old-deploy.sh - Remove?

### Recommendations:

1. **Remove deprecated files** (3 files identified)
2. **Create utility spec** for shared utils (cors, logger)
3. **Document dev tools** in separate spec
4. **Review experimental** workflows/scripts

---

## Shared Files (Referenced by 3+ Specs)

| File | Referenced By | Count | Risk Level |
|------|---------------|-------|------------|
| lib/utils/pricing.ts | 001, 003, 004, 007, 009 | 5 | HIGH |
| lib/api/client.ts | 002, 005, 006, 008 | 4 | HIGH |
| lib/types/vehicle.ts | 001, 002, 011 | 3 | MEDIUM |
| lib/validators/input.ts | 001, 002, 005 | 3 | MEDIUM |

### Risk Assessment:

**High-risk files** (4+ specs):
- Changes affect multiple features
- Require comprehensive testing
- Need 95%+ test coverage
- Split if too coupled

**Medium-risk files** (2-3 specs):
- Changes affect few features
- Standard testing required
- Monitor for increased coupling

---

## Summary

- 91% coverage - Excellent
- 10 gap files - Need review
- 2 high-risk shared files - Monitor closely
- 12 specs covering 99 files

### Action Items:

1. Review 10 gap files and either create specs, remove if deprecated, or document as infrastructure/utilities
2. Add extra test coverage for high-risk shared files
3. Refactor pricing.ts (5 specs depend on it)

---

**Next Steps:**

Run `/speckit.clarify` to resolve any [NEEDS CLARIFICATION] markers in specs identified during coverage analysis.
```
