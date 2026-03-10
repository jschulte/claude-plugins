# Batch Session Auto-Configuration

When a batch session exists, skip the questionnaire and use pre-configured answers from the parent session.

---

## Detection

Before showing any questions, check for a batch session file by walking up directories:

1. Start at current working directory.
2. Check if `.stackshift-batch-session.json` exists in this directory. If yes, use it.
3. Check if `.git` directory exists here. If yes and no batch session file found, stop searching (no batch session).
4. Move to parent directory and repeat from step 2.
5. If filesystem root is reached, stop searching (no batch session).

---

## If Batch Session Found

1. Read the `.stackshift-batch-session.json` file.
2. Log to user: "Using batch session configuration from: [path to file]"
3. Display the loaded answers: route, spec_output_location, transmission, etc.
4. Skip the entire questionnaire.
5. Save the loaded answers to local `.stackshift-state.json` as usual.
6. Proceed directly to analysis phases.

If reading the batch session file fails (corrupted JSON, permission error), log the error and fall back to the normal questionnaire.

---

## Batch Session Schema

```json
{
  "sessionId": "batch-1234567890",
  "startedAt": "2025-01-15T10:00:00.000Z",
  "batchRootDirectory": "/Users/you/git/osiris",
  "totalRepos": 12,
  "batchSize": 3,
  "answers": {
    "detection_type": "osiris",
    "route": "greenfield",
    "brownfield_mode": null,
    "transmission": "cruise-control",
    "implementation_framework": "widget-migrate",
    "clarifications_strategy": "defer",
    "implementation_scope": "p0_p1",
    "spec_output_location": "~/git/specs",
    "target_stack": null,
    "build_location": null,
    "build_location_type": null
  },
  "processedRepos": ["ws-vehicle-details", "ws-hours"]
}
```

Fields in `answers`:
- `detection_type`: generic, monorepo-service, nx-app, turborepo-package, lerna-package, osiris, v9-velocity, v9-viewmodel
- `route`: greenfield or brownfield
- `brownfield_mode`: standard or upgrade (null if greenfield)
- `transmission`: manual or cruise-control
- `implementation_framework`: speckit, bmad-autopilot, bmad, architect-only, portable-extract, widget-migrate
- `clarifications_strategy`: defer, prompt, or skip
- `implementation_scope`: none, p0, p0_p1, or all
- `spec_output_location`: path or null (defaults to current directory)
- `target_stack`: string or null
- `build_location`: path or null (defaults to greenfield/ subfolder)
- `build_location_type`: subfolder, separate, replace, or null

---

## Example Directory Structure

```
~/git/osiris/
  .stackshift-batch-session.json   <-- Batch session here
  ws-vehicle-details/
    [agent working here finds parent session]
  ws-hours/
    [agent working here finds parent session]
  ws-contact/
    [agent working here finds parent session]
```

---

## If No Batch Session

Continue with the normal questionnaire defined in [questionnaire.md](questionnaire.md).
