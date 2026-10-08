# Editor Rescue

A Claude Code skill for when Sublime Text or VS Code reopens with hundreds of unsaved
"untitled" tabs and takes gigabytes of RAM to do it.

1. Backs up the editors' hot-exit state (Sublime sessions, VS Code `Backups/`).
2. Dumps every unique buffer and drops empty buffers and terminal/test noise.
3. Fans out subagents to sort the rest into keep / maybe / toss by topic.
4. Writes `README.md`, `LOOSE-NOTES.md`, `SECRETS-REVIEW.md`, `DIRTY-FILES.md` and `TOSSED.md`.
5. After you approve, moves the state aside so each editor opens empty. Nothing is deleted.

```
/plugin marketplace add jschulte/claude-plugins
/plugin install editor-rescue@jschulte
```

Then quit your editors and say "rescue my unsaved editor tabs". Works on macOS and
Linux with the Python 3 standard library only. Tests: `uvx pytest skills/editor-rescue/tests`.
