#!/usr/bin/env python3
"""Turn triage results into an organized notes folder at the root of OUT."""
import argparse
import json
import os
import re
import shutil
import sys
from collections import defaultdict
from pathlib import Path

VERDICTS = ("keep", "maybe", "toss")


def slug(s):
    return re.sub(r"[^a-zA-Z0-9]+", "-", (s or "").lower()).strip("-")[:60] or "untitled"


def load(out):
    manifest = json.loads((out / "_work" / "manifest.json").read_text())
    labels = {e["key"]: e["label"] for e in manifest["editors"]}
    by_raw = {b["raw"]: dict(b, source=labels.get(b["editor"], b["editor"])) for b in manifest["buffers"]}
    for f in sorted((out / "_work" / "results").glob("*.json")):
        try:
            results = json.loads(f.read_text())
        except json.JSONDecodeError as e:
            sys.exit(f"{f.name} is not valid JSON ({e}); fix or re-run that batch.")
        for r in results:
            b = by_raw.get(r.get("path"))
            if b is None:
                print(f"  ! {f.name}: unknown path {r.get('path')}", file=sys.stderr)
                continue
            if r.get("verdict") not in VERDICTS:
                print(f"  ! {f.name}: bad verdict {r.get('verdict')!r} for {r['path']}", file=sys.stderr)
                continue
            b.update({k: r.get(k) for k in ("verdict", "category", "title", "summary", "tidbits", "date_hint")})
            b["secret"] = bool(r.get("secret")) or b["secret_hint"]
    for b in by_raw.values():
        b.setdefault("secret", b["secret_hint"])
        if b["auto"]:
            b.update(verdict="toss", title=f"({b['auto']})", category="auto",
                     summary="terminal/test output" if b["auto"] == "noise" else "empty buffer")
    return manifest, list(by_raw.values())


def write_note(out, b, used):
    cat = slug(b.get("category") or "misc")
    name = base = slug(b.get("title") or b["id"])
    n = 2
    while (b["verdict"], cat, name) in used:
        name, n = f"{base}-{n}", n + 1
    used.add((b["verdict"], cat, name))
    ext = Path(b["origin"]).suffix if b["kind"] == "dirty" and Path(b["origin"]).suffix else ".md"
    dest = out / b["verdict"] / cat / (name + ext)
    dest.parent.mkdir(parents=True, exist_ok=True)
    origin = f" | unsaved edit of {b['origin']}" if b["kind"] == "dirty" else ""
    header = f"<!-- rescued from {b['source']}{origin} | {Path(b['raw']).name} -->\n\n" if ext == ".md" else ""
    dest.write_text(header + Path(b["raw"]).read_text(errors="replace"))
    if b["secret"]:
        dest.chmod(0o600)
    b["dest"] = str(dest.relative_to(out))


def entry(b):
    date = f" _{b['date_hint']}_" if b.get("date_hint") else ""
    lock = " 🔒" if b["secret"] else ""
    return f"- [{b.get('title') or b['id']}]({b['dest']}) · {b['source']}{date}{lock} — {b.get('summary') or ''}"


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("out")
    a = ap.parse_args()
    out = Path(a.out).expanduser()
    manifest, items = load(out)

    for d in ("keep", "maybe"):
        shutil.rmtree(out / d, ignore_errors=True)
    used, groups = set(), defaultdict(list)
    for b in items:
        if b.get("verdict") in ("keep", "maybe"):
            write_note(out, b, used)
            groups[(b["verdict"], slug(b.get("category") or "misc"))].append(b)

    unreviewed = [b for b in items if not b.get("verdict")]
    count = defaultdict(int)
    for b in items:
        count[b.get("verdict") or "unreviewed"] += 1
    copies = sum(b["copies"] for b in items)
    editors = ", ".join(e["label"] for e in manifest["editors"])

    idx = [f"# Rescued editor notes ({manifest['created'][:10]})", "",
           f"Unsaved buffers from {editors}: {copies} buffers, {len(items)} unique. "
           f"**{count['keep']} keep**, {count['maybe']} maybe, {count['toss']} toss"
           + (f", **{len(unreviewed)} unreviewed**" if unreviewed else "") + ".", "",
           "- `LOOSE-NOTES.md`: small tidbits pulled out inline",
           "- `SECRETS-REVIEW.md`: buffers that held credentials (rotate them)",
           "- `DIRTY-FILES.md`: unsaved edits to real files on disk",
           "- `TOSSED.md`: what was judged junk, in case triage was wrong",
           "- `_work/raw/`: every unique buffer verbatim; `_backup/`: the editors' original state", ""]
    for v in ("keep", "maybe"):
        idx.append(f"## {v.title()}\n")
        for key in sorted(k for k in groups if k[0] == v):
            idx.append(f"### {key[1]} ({len(groups[key])})\n")
            idx += [entry(b) for b in sorted(groups[key], key=lambda b: (b.get("title") or "").lower())]
            idx.append("")
    if unreviewed:
        idx.append("## Unreviewed (no triage result; re-run their batch)\n")
        idx += [f"- `{os.path.relpath(b['raw'], out)}` · {b['source']} · {b['bytes']} bytes" for b in unreviewed]
    (out / "README.md").write_text("\n".join(idx) + "\n")

    loose = ["# Loose notes", "", "Tidbits from small buffers, by topic. Each links to the full note.", ""]
    for key in sorted(groups):
        tb = [b for b in groups[key] if b.get("tidbits")]
        if tb:
            loose.append(f"## {key[1]}{' (maybe)' if key[0] == 'maybe' else ''}\n")
            for b in tb:
                loose += [f"**[{b['title']}]({b['dest']})**"] + [f"- {t}" for t in b["tidbits"]] + [""]
    (out / "LOOSE-NOTES.md").write_text("\n".join(loose) + "\n")

    sec = ["# Buffers that held credentials", "",
           "Values are not reproduced here. Anything that sat in plaintext editor state should be rotated.", ""]
    for b in sorted((b for b in items if b["secret"]), key=lambda b: b.get("verdict") or ""):
        where = b.get("dest") or os.path.relpath(b["raw"], out)
        sec.append(f"- **{b.get('title') or b['id']}** ({b['source']}, {b.get('verdict') or 'unreviewed'}) — "
                   f"{b.get('summary') or 'pattern match'} — `{where}`")
    (out / "SECRETS-REVIEW.md").write_text("\n".join(sec) + "\n")
    (out / "SECRETS-REVIEW.md").chmod(0o600)

    status = {"same": "same as disk, nothing lost", "missing": "file no longer exists; buffer is the only copy",
              "differs": "differs from the file on disk"}
    dirty = ["# Unsaved edits to real files", "",
             "Editors were holding these without saving. Most `differs` entries are stale edits the file has "
             "since moved past; diff before applying anything.", ""]
    for b in sorted((b for b in items if b["kind"] == "dirty"), key=lambda b: b["origin"]):
        dirty.append(f"- `{b['origin']}` ({b['source']}) — {status.get(b.get('disk'), 'not a local file')} — "
                     f"`{b.get('dest') or os.path.relpath(b['raw'], out)}`")
    (out / "DIRTY-FILES.md").write_text("\n".join(dirty) + "\n")

    tossed = ["# Tossed", ""]
    tossed += [f"- {b.get('title')} · {b['source']} · {b.get('summary') or ''} — `{os.path.relpath(b['raw'], out)}`"
               for b in sorted((b for b in items if b.get("verdict") == "toss"), key=lambda b: b["raw"])]
    (out / "TOSSED.md").write_text("\n".join(tossed) + "\n")

    print(" ".join(f"{k}={count[k]}" for k in ("keep", "maybe", "toss", "unreviewed")),
          f"secrets={sum(b['secret'] for b in items)} dirty={sum(b['kind'] == 'dirty' for b in items)}")
    if unreviewed:
        print("UNREVIEWED:\n" + "\n".join(b["raw"] for b in unreviewed))


if __name__ == "__main__":
    main()
