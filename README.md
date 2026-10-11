# Claude Code plugins by jschulte

```
/plugin marketplace add jschulte/claude-plugins
```

Four plugins, 18 skills. The marketplace lists the plugins; each one installs the
skills in its row.

| Plugin | Skills it installs |
|---|---|
| [`codebase-audit`](codebase-audit/) | `health-audit`, `health-sweep`, `health-audit-ux`, `health-audit-api`, `health-audit-data`, `health-audit-domain`, `health-audit-dx`, `health-audit-ops`, `health-audit-seo`, `arch-audit`, `finish-line` |
| [`pr-workflow`](pr-workflow/) | `deliver-me`, `productionize`, `pr-resolver`, `bulletproof`, `issue-burndown` |
| [`whats-left`](whats-left/) | `whats-left` |
| [`editor-rescue`](editor-rescue/) | `editor-rescue` |

```
/plugin install codebase-audit@jschulte
/plugin install pr-workflow@jschulte
/plugin install whats-left@jschulte
/plugin install editor-rescue@jschulte
```

Installed this way, a skill is called with its plugin name in front, such as
`/pr-workflow:deliver-me`.

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

## 🔎 Codebase Audit

Reviews of a whole codebase that report only what they can point to in the code.

```
/plugin install codebase-audit@jschulte
```

- **`health-audit`** scores 12 categories and gives two separate grades: how well the code is built, and how much it is hurting users right now
- **`health-sweep`** runs it alongside seven specialist lenses (UX, API, data and privacy, business logic, developer experience, ops, SEO) and merges the results into one ranked plan
- **`arch-audit`** finds the conventions your codebase has adopted, then lists every place they are broken, with file and line
- **`finish-line`** assesses the architecture and agrees a staged roadmap with you before any spec is written

Details: [`codebase-audit/`](codebase-audit/).

## 🚢 PR Workflow

Five skills for the life of a pull request on GitHub. Needs the `gh` CLI.

```
/plugin install pr-workflow@jschulte
```

- **`deliver-me`** takes one request to a verified PR without check-ins: it reuses what the codebase already has, attacks its own plan, reviews its own diff, and reports every decision it made for you
- **`productionize`** turns your draft PR into one a human can review: fixes, an honest description, verified claims
- **`pr-resolver`** checks every review comment against the code, fixes the real ones and explains the rest
- **`bulletproof`** gives a read-only verdict on whether a branch is safe to merge or release
- **`issue-burndown`** sorts a backlog into already-fixed, claimed and actionable, then lands one PR per shared root cause

Details: [`pr-workflow/`](pr-workflow/).

## 🧾 What's Left

Ask "what's left?" in a long session and get the full ledger, then say "yes please" to have it finished.

```
/plugin install whats-left@jschulte
```

- Sweeps the whole session, including asides and anything lost in a compaction
- Checks each "done" against git, PRs, CI and tests before believing it
- Lists every remaining step through the real finish line, with risky ones marked
- Leaves no "things to consider": each loose end is done, filed as an issue, or dropped

Details: [`whats-left/`](whats-left/).

MIT licensed.
