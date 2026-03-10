# Edge Cases

Handling instructions for non-standard scenarios during logic extraction.

---

## Single Repo

When the entire logic lives in one repo:
- Phase 2 discovery may find nothing. This is expected.
- Flow trace stays within one system boundary.
- Generate a Mermaid flowchart instead of a sequence diagram.
- Still produce all 6 artifacts from the traced logic.

---

## Logic Touches 10+ Repos

When the flow spans many systems:
- Focus the trace on the critical path (main success scenario).
- Document alternative paths as separate FLOW-* entries.
- Batch Phase 1 recon into groups of 5 for parallel processing.
- **YOLO mode:** Auto-focus on the 5 repos with highest relevance scores. Tag the rest as `[SECONDARY - not deep-traced]`.
- **Guided/Interactive mode:** Ask the user: "This flow touches {N} repos. Trace all, or focus on the {top 5} most critical?"

---

## Dead Ends

When a traced reference leads to a repo with no relevant code:
- Mark as `[DEAD END - no relevant logic found in {repo}]`.
- Exclude from confirmed repo set.
- Note in extraction-manifest.md for completeness.

---

## Circular References

When system A calls system B which calls system A:
- Detect the cycle.
- Document it once, noting the loop condition.
- Trace each direction once (A to B and B to A as separate trace steps).

---

## No Code Access for a Discovered Repo

When a discovered repo cannot be cloned or accessed:
- Document what is known from consumer-side code (the caller's perspective).
- Mark the boundary as `[NO CODE ACCESS - traced from consumer only]`.
- Data contracts at that boundary are `[INFERRED]`.

---

## Clone Failure

When `git clone` fails (auth, network, repo not found):
- Mark the repo as `[CLONE FAILED - {reason}]`.
- Trace from consumer-side only (same as "No Code Access" above).
- **YOLO mode:** Log the failure, continue with remaining repos.
- **Guided/Interactive mode:** Report the failure and ask whether to skip or retry.

---

## Subagent Failure

When a Phase 1 Task agent fails or times out:
- Log the failure: "Task agent for {repo} failed: {reason}."
- Continue with results from remaining agents.
- If fewer than half of starting points produce results, warn the user before proceeding to Phase 2.
- **YOLO mode:** Proceed with available results. Tag gaps as `[AGENT FAILED - incomplete recon]`.
- **Guided/Interactive mode:** Report which agents failed and ask whether to retry or proceed.

---

## Empty or Vague Extraction Prompt

If the extraction prompt is too broad to filter code exploration (e.g., "everything" or "all the logic"):
- Ask the user to narrow scope before proceeding.
- Suggest specific flows based on repo structure if possible.

---

## No Starting Points Provided

If the user provides zero starting points:
- Ask for at least one repo, directory, or file.
- Do not proceed to Phase 1 without at least one starting point.

---

## No Relevant Code Found

When all starting points yield TANGENTIAL relevance:
- **YOLO mode:** Log the finding. Generate extraction-manifest.md documenting what was searched and why nothing matched. Stop execution.
- **Guided/Interactive mode:** Report that no relevant code was found and ask the user to refine the extraction prompt or provide different starting points.

---

## Stale State File

When `.stackshift-state.json` already contains a `logic-extract` entry with `status: "in_progress"`:
- Check the `phase` and `last_updated` fields.
- **If less than 24 hours old:** Ask the user: "A previous extraction is in progress (Phase {N}, started {time}). Resume or restart?"
- **If older than 24 hours:** Treat as stale. Ask the user: "A previous extraction appears abandoned (started {time}). Clear and restart?"
- On restart, overwrite the state entry.
