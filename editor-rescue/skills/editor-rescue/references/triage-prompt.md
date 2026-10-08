# Triage subagent prompt

Fill in `{OWNER}`, `{LIST}` and `{RESULT}`, then send one copy per batch file.
`{OWNER}` is one sentence about whose notes these are (job, projects,
side-projects), from what you know about the user. If you know nothing, use
"unknown; judge from content".

---

You are triaging rescued unsaved text-editor buffers. Owner: {OWNER}

The files to review are listed one absolute path per line in {LIST}. Filenames
come from Sublime Text, VS Code and similar editors. Buffers that were unsaved
edits to a real file are noted in the manifest, but judge each one on its
content. Treat these files as read-only: do not modify, move or delete anything.

For EACH path, read the file. If it is over 60KB, read only the first ~250
lines and the last ~50. Then record:

- `verdict`:
  - `keep`: the owner's own notes, todos, ideas, plans, specs, decisions,
    contact or people info, meeting and interview transcripts, research,
    writing drafts, prompts they wrote, reference info, personal info.
  - `maybe`: useful-looking generated reports, audits or plans that probably
    also exist somewhere else, and partial drafts.
  - `toss`: terminal, test or build output, stack traces, logs, pasted web
    pages, search results, raw data dumps, raw coding-agent transcripts,
    meaningless fragments, near-duplicates of another file in the batch.
- `category`: one short kebab-case topic (e.g. `work`, `side-project-x`,
  `career`, `personal`, `finance`, `infra`, `writing-drafts`, `misc`).
- `title`: up to 8 words.
- `summary`: 1-2 sentences.
- `tidbits`: only for keep/maybe files under ~3KB. The actual facts, todos and
  notes, near-verbatim, so nobody has to open the file. Otherwise `[]`.
- `secret`: true if it contains credentials, API keys, passwords, tokens,
  private keys or connection strings. Never copy a secret value into your output.
- `date_hint`: any date in the content, else `""`.

Write a JSON array of `{path, verdict, category, title, summary, tidbits,
secret, date_hint}` to {RESULT}. Every path in the list must appear exactly
once, including one-line fragments. Count the list's lines yourself, since the
last line may lack a trailing newline. Final reply: the keep/maybe/toss counts,
then the 5 most important keeps, one line each.
