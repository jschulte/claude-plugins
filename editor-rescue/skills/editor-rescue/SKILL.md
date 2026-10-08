---
name: editor-rescue
description: >
  Use when Sublime Text, VS Code, VS Code Insiders, Cursor, VSCodium or Windsurf
  reopens with dozens or hundreds of unsaved "untitled" tabs or windows. Typical
  asks: "my editor eats 30GB of RAM on launch", "too many open untitled files",
  "save my scratch notes and close everything", "hot exit hoarding". Covers
  rescuing the buffers into organized notes and resetting the editor to open
  empty. macOS and Linux. Triggers: "/editor-rescue", "rescue my Sublime notes",
  "clean up unsaved VS Code tabs".
---

# editor-rescue

Editors with hot exit keep every unsaved buffer forever. This skill backs up
that state, triages each unique buffer into keep, maybe or toss, writes
organized notes, and then moves the state aside so the editor opens empty.
Nothing is ever deleted.

Scripts are in this skill's `scripts/` directory and need only the Python 3
standard library. `OUT` defaults to `~/editor-rescue-<date>`.

## Procedure

1. **Have the user fully quit each editor** (Cmd-Q, not just closing windows).
   A running Sublime keeps rewriting its session, and `reset.py` refuses to run
   while an editor is open.
2. **Extract:** `python3 <skill-dir>/scripts/extract.py [--out DIR]`. This copies
   each editor's state into `OUT/_backup/`, dumps unique buffers to
   `OUT/_work/raw/`, auto-tosses empty buffers and terminal or test output, and
   writes triage batches to `OUT/_work/batches/`.
3. **Triage:** start one background subagent per batch, all in a single
   message, on a cheaper model (e.g. sonnet). Give each the prompt in
   `references/triage-prompt.md`, with `{LIST}` set to
   `OUT/_work/batches/batch_NN.list` and `{RESULT}` set to
   `OUT/_work/results/batch_NN.json`. If there is only one small batch (about
   20 files or fewer), triage it yourself with the same prompt.
4. **Assemble:** `python3 <skill-dir>/scripts/assemble.py OUT`. If it prints
   `UNREVIEWED` paths, read those files yourself (usually tiny fragments), write
   `OUT/_work/results/manual.json` in the same schema, and run assemble again
   until nothing is left unreviewed.
5. **Spot-check:** read `OUT/README.md`, plus a few files from `keep/` and
   entries in `TOSSED.md`.
6. **Report:** give the user the counts, the highlights, how many buffers held
   credentials, and the `DIRTY-FILES.md` entries whose only copy is the buffer.
   Tell them the raw secrets are still in `OUT/_work/raw/` and `OUT/_backup/`,
   so `OUT` stays private and gets deleted once they have rotated the keys.
7. **Reset, only after the user says yes to the report.** The original "close
   it all" request does not count as that yes. Run
   `python3 <skill-dir>/scripts/reset.py OUT` as a dry run and show its output.
   Then run it again with `--yes`. It moves Sublime sessions and VS Code-family
   `Backups/` into `OUT/_backup/<editor>/moved-aside/`, and clears the
   reopen-window list. Without that last step, VS Code reopens every empty
   window.
8. Suggest turning hot exit off so this doesn't happen again: Sublime
   `"hot_exit": "disabled"`, VS Code `"files.hotExit": "off"`.

## Handling the content

These buffers are the user's private scratch space. They routinely hold API
keys, passwords and personal material.

- Keep everything on this machine. Report in the terminal only, with no
  artifacts, docs or uploads.
- Refer to a secret by file and type. Leave the value out of chat and out of
  any file you write.
- `extract.py` refuses output paths inside iCloud, Dropbox, OneDrive or Google
  Drive. Pass `--allow-synced` only if the user asks for it by name.

## Common mistakes

| Mistake | Result |
|---|---|
| Closing windows instead of quitting | Sublime rewrites its session, and the extract goes stale |
| Running reset before the user has seen the notes | They lose the chance to catch a bad toss |
| Assuming the agents covered every file | Fragments get skipped. `assemble.py` lists them as unreviewed |
| Moving only `Backups/` in VS Code | It still reopens a pile of empty windows |
| Applying `DIRTY-FILES.md` edits blindly | Most are stale versions of files that have since moved on |
