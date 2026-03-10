# Update Spec File

Instructions for updating a spec file after a clarification marker is resolved.

---

## Locate the Marker

1. Read the target spec file from `specs/{filename}.md`.
2. Find the line containing the specific `[NEEDS CLARIFICATION]` marker text.
3. Identify the nearest heading above the marker. This is the feature section to update.

If the marker is not found in the file, report to the user: "Marker not found in specs/{filename}.md. It may have already been resolved." Skip this marker.

---

## Replace the Marker

Remove the `[NEEDS CLARIFICATION]` marker line and any placeholder text immediately below it (lines that describe what is unknown, typically starting with phrases like "What", "How", "Whether", "TBD").

Replace with structured content using this template:

```markdown
### Overview
{Summary paragraph describing the feature/behavior based on the user's answer. 2-4 sentences.}

### Acceptance Criteria
- [ ] {Criterion 1 - specific, testable requirement}
- [ ] {Criterion 2}
- [ ] {Criterion 3}
{Add more criteria as needed. Each must be independently verifiable.}
```

Add additional subsections only when the user's answer warrants them:

```markdown
### UI Requirements
{Include only if the answer specified UI behavior, layout, or interaction details.}

### API Requirements
{Include only if the answer specified endpoints, request/response formats, or integrations.}

### Business Rules
{Include only if the answer specified validation logic, constraints, or conditional behavior.}
```

---

## Preserve Existing Content

Do not remove or modify any content outside the marker's section. Specifically:
- Preserve the feature heading and any metadata lines (Status, Priority).
- Preserve content in other sections of the same file.
- Preserve any previously resolved sections above or below the marker.

If the feature section already has partial content (e.g., some acceptance criteria already exist), merge the new content with the existing content rather than replacing it.

---

## Update Priority Label

If the feature section contains a `Priority:` line, leave it unchanged unless the user explicitly requested a priority change during Q&A.

If the feature section has no `Priority:` line, add one below the Status line using the priority determined during Phase 1:

```markdown
Priority: P{N}
```

---

## Remove Heading Marker

If the feature heading itself contains `[NEEDS CLARIFICATION]`, remove only the marker from the heading:

**Before:** `## Analytics Dashboard [NEEDS CLARIFICATION]`
**After:** `## Analytics Dashboard`

---

## Verification

After writing the file, re-read it and confirm:
1. The `[NEEDS CLARIFICATION]` text no longer appears in the updated section.
2. The new Overview and Acceptance Criteria subsections are present.
3. The file parses as valid markdown (no broken headings or unclosed code blocks).
4. No content from other sections was lost.

If verification fails on any check, report the specific failure to the user and attempt the write again.
