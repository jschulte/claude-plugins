# Integration

Pipeline position and cross-skill data contracts for logic-extract.

---

## Pipeline Position

```
Discover -> logic-extract -> portable-transplant / BMAD
```

- **Discover** answers: "What systems exist?"
- **Logic Extract** answers: "How does this specific flow work across systems?"
- **Portable Transplant** / **BMAD** answers: "How do we build this in the new system?"

---

## Upstream: Discover

**Artifacts consumed (optional):**
- If `.stackshift/ecosystem-map.md` exists in a starting-point repo, read the "Confirmed Repos" table to pre-populate Phase 2 discovery targets.
- Repo locations from the ecosystem map help resolve system names the user mentions without paths.

**This integration is informational.** The ecosystem map is not parsed automatically; it accelerates manual identification of starting points.

---

## Upstream: Reverse Engineer

**Artifacts consumed (optional):**
- If reverse-engineering docs exist for a starting-point repo, use them to accelerate Phase 1 recon.
- `integration-points.md`, `data-architecture.md`, `functional-specification.md` are premium inputs that reduce code scanning effort.

---

## Downstream: Portable Transplant

**Artifacts produced:**
- `_logic-extract/epics.md` and `_logic-extract/component-spec.md`

**Compatibility note:** The `portable-transplant` skill reads from `_portable-extract/`, not `_logic-extract/`. To feed logic-extract output into portable-transplant, copy `component-spec.md` and `epics.md` to `_portable-extract/`. Both skills use the same ID conventions (BR/DC/EC/ERR/FLOW).

---

## Downstream: BMAD

**Artifacts produced:**
- `epics.md` maps directly to BMAD epics and stories.
- `component-spec.md` feeds into BMAD architecture decisions.
- Data-flow dependency ordering informs sprint sequencing.

---

## Success Criteria

- Extraction prompt clearly defines scope of the trace.
- All confirmed repos have targeted recon summaries (focused on prompt, not exhaustive).
- Flow trace follows data from entry point to final output with no gaps.
- Every decision point in the flow has all branches documented.
- Mermaid diagram accurately shows cross-system data movement (max 20 participants; group related systems into composites if more).
- All business rules have BR-* IDs and are tech-agnostic.
- All data contracts have DC-* IDs with abstract shapes.
- Edge cases (EC-*) and error states (ERR-*) are cataloged.
- Epics are ordered by data-flow dependency (upstream first).
- Every story references specific BR/DC/FLOW IDs.
- No tech-specific names in specification output (no framework names, no service names, no API endpoints).
- State file updated with phase progress and artifact list.
