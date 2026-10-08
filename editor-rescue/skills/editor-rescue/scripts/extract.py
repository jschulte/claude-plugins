#!/usr/bin/env python3
"""Back up every editor's hot-exit state and dump unsaved buffers for triage.

Read-only against the editors: state is copied into OUT/_backup first and
parsed from the copy. Nothing in the editors' own directories is modified.
"""
import argparse
import datetime
import hashlib
import json
import math
import shutil
import sys
import urllib.parse
from pathlib import Path

from rescuelib import EDITORS, NOISE, SECRET, running_editors, state_dir, synced_location

CAP = 80_000  # bytes of one buffer that count toward a batch (agents skim big files)


def sublime_buffers(backup):
    sessions = sorted(backup.glob("*.sublime_session"), key=lambda p: -p.stat().st_mtime)
    for s in sessions:
        try:
            data = json.loads(s.read_text(errors="replace"))
        except json.JSONDecodeError as e:
            print(f"  ! could not parse {s.name}: {e}", file=sys.stderr)
            continue
        for wi, w in enumerate(data.get("windows", [])):
            for bi, b in enumerate(w.get("buffers", [])):
                if "contents" not in b:
                    continue  # clean file-backed buffer: the file on disk is the copy
                f = b.get("file")
                yield dict(id=f"w{wi:02d}b{bi:03d}", kind="dirty" if f else "untitled",
                           origin=f or (b.get("settings", {}).get("name") or "").strip(),
                           body=b["contents"])


def vscode_buffers(backup):
    root = backup / "Backups"
    for p in sorted(root.glob("*/*/*")):
        if not p.is_file() or p.name == ".DS_Store":
            continue
        raw = p.read_bytes()
        nl = raw.find(b"\n")
        header, body = (raw, b"") if nl < 0 else (raw[:nl], raw[nl + 1:])
        resource = urllib.parse.unquote(header.decode("utf-8", "replace").split(" ", 1)[0])
        scheme = p.parent.name
        yield dict(id=f"{p.parent.parent.name[-6:]}-{p.name[:10]}",
                   kind="untitled" if scheme == "untitled" else "dirty",
                   origin=resource, body=body.decode("utf-8", "replace"))


def backup_editor(editor, src, dest):
    dest.mkdir(parents=True)
    if editor["kind"] == "sublime":
        for s in (src / "Local").glob("*.sublime_session"):
            shutil.copy2(s, dest / s.name)
    else:
        if (src / "Backups").is_dir():
            shutil.copytree(src / "Backups", dest / "Backups", symlinks=True)
        storage = src / "User" / "globalStorage" / "storage.json"
        if storage.is_file():
            shutil.copy2(storage, dest / "storage.json")


def disk_status(origin):
    if not origin.startswith("/") and not origin.startswith("file://"):
        return None
    path = Path(urllib.parse.unquote(origin.replace("file://", "", 1)))
    return path, ("missing" if not path.is_file() else None)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--out", default=f"~/editor-rescue-{datetime.date.today().isoformat()}")
    ap.add_argument("--editors", help="comma-separated keys to limit to (default: all found)")
    ap.add_argument("--allow-synced", action="store_true",
                    help="permit an output dir inside iCloud/Dropbox/etc.")
    ap.add_argument("--batch-kb", type=int, default=400, help="target triage batch size")
    a = ap.parse_args()

    out = Path(a.out).expanduser()
    synced = synced_location(out)
    if synced and not a.allow_synced:
        sys.exit(f"Refusing: {out} is inside {synced}, which syncs off this machine and the "
                 "buffers likely contain credentials. Pick another --out or pass --allow-synced.")
    if out.exists() and any(out.iterdir()):
        sys.exit(f"Refusing: {out} already exists and is not empty.")
    out.mkdir(parents=True, exist_ok=True)
    out.chmod(0o700)

    wanted = set(a.editors.split(",")) if a.editors else None
    running = running_editors()
    seen, buffers, editors_found = {}, [], []
    for e in EDITORS:
        if wanted and e["key"] not in wanted:
            continue
        src = state_dir(e)
        if not src:
            continue
        backup = out / "_backup" / e["key"]
        backup_editor(e, src, backup)
        editors_found.append(dict(key=e["key"], label=e["label"], kind=e["kind"], state_dir=str(src),
                                  running=e["label"] in running))
        gen = sublime_buffers(backup) if e["kind"] == "sublime" else vscode_buffers(backup)
        for b in gen:
            body = b.pop("body")
            h = hashlib.sha256(body.encode()).hexdigest()[:12]
            b.update(editor=e["key"], hash=h, bytes=len(body.encode()))
            if h in seen:
                seen[h]["copies"] += 1
                continue
            lines = [ln for ln in body.splitlines() if ln.strip()]
            b["auto"] = "empty" if not lines else (
                "noise" if len(NOISE.findall(body)) / len(lines) > 0.25 else None)
            b["secret_hint"] = bool(SECRET.search(body))
            b["copies"] = 1
            ds = disk_status(b["origin"]) if b["kind"] == "dirty" else None
            if ds:
                path, status = ds
                if status is None:
                    status = "same" if path.read_text(errors="replace") == body else "differs"
                b["disk"] = status
            raw = out / "_work" / "raw" / e["key"] / f"{b['id']}_{h}.txt"
            raw.parent.mkdir(parents=True, exist_ok=True)
            raw.write_text(body)
            b["raw"] = str(raw)
            seen[h] = b
            buffers.append(b)

    review = sorted((b for b in buffers if not b["auto"]), key=lambda b: -b["bytes"])
    total = sum(min(b["bytes"], CAP) for b in review)
    n = max(1, math.ceil(total / (a.batch_kb * 1000))) if review else 0
    sizes, batches = [0] * n, [[] for _ in range(n)]
    for b in review:
        i = sizes.index(min(sizes))
        batches[i].append(b["raw"])
        sizes[i] += min(b["bytes"], CAP)
    bdir = out / "_work" / "batches"
    bdir.mkdir(parents=True, exist_ok=True)
    for i, paths in enumerate(batches):
        (bdir / f"batch_{i:02d}.list").write_text("\n".join(paths) + "\n")
    (out / "_work" / "results").mkdir(exist_ok=True)

    manifest = dict(created=datetime.datetime.now().isoformat(timespec="seconds"), out=str(out),
                    editors=editors_found, buffers=buffers, batches=n)
    (out / "_work" / "manifest.json").write_text(json.dumps(manifest, indent=1))

    for e in editors_found:
        mine = [b for b in buffers if b["editor"] == e["key"]]
        flag = "  (RUNNING: content may be stale; quit it before reset)" if e["running"] else ""
        print(f"{e['label']}: {sum(b['copies'] for b in mine)} buffers, {len(mine)} unique{flag}")
    if not editors_found:
        print("No supported editor state found.")
    auto = [b for b in buffers if b["auto"]]
    print(f"unique={len(buffers)} auto-tossed={len(auto)} to-review={len(review)} batches={n} "
          f"secret-hints={sum(b['secret_hint'] for b in buffers)}")
    print(f"out={out}")


if __name__ == "__main__":
    main()
