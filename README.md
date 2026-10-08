# Claude Code plugins by jschulte

```
/plugin marketplace add jschulte/claude-plugins
```

## 🛟 Editor Rescue

Your editor reopens with 600 unsaved tabs and eats 30GB of RAM. Editor Rescue fixes that without losing anything.

```
/plugin install editor-rescue@jschulte
```

Then quit your editors and say "rescue my unsaved editor tabs".

- **Supports:** Sublime Text, VS Code, VS Code Insiders, Cursor, VSCodium and Windsurf, on macOS and Linux
- Backs up each editor's hot-exit state before touching anything
- Dedupes buffers and auto-tosses terminal and test-output dumps
- Parallel subagents sort the rest into keep / maybe / toss by topic
- Writes an indexed notes folder, plus a "loose notes" digest of the small tidbits
- Flags buffers holding pasted API keys or passwords, without ever echoing the values
- Reports unsaved edits to real files, including files that no longer exist
- Resets the editors to open empty. It does a dry run first, moves state aside and never deletes
- Refuses to write its output into iCloud, Dropbox or OneDrive-synced folders

Details: [`editor-rescue/`](editor-rescue/).

MIT licensed.
