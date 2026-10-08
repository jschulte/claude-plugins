#!/usr/bin/env python3
"""Make editors open empty by moving their hot-exit state into OUT/_backup.

Dry run unless --yes. Nothing is deleted: session files and Backups/ are
moved aside, and storage.json is rewritten only after a copy exists.
"""
import argparse
import datetime
import json
import shutil
import sys
from pathlib import Path

from rescuelib import EDITORS, running_editors


def newest_mtime(paths):
    times = [p.stat().st_mtime for root in paths if root.exists()
             for p in ([root] + list(root.rglob("*")) if root.is_dir() else [root])]
    return max(times, default=0)


def main():
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("out")
    ap.add_argument("--yes", action="store_true", help="actually do it")
    a = ap.parse_args()
    out = Path(a.out).expanduser()
    manifest = json.loads((out / "_work" / "manifest.json").read_text())
    created = datetime.datetime.fromisoformat(manifest["created"]).timestamp()
    by_key = {e["key"]: e for e in EDITORS}
    running = running_editors()
    failed = False

    for e in manifest["editors"]:
        src, backup = Path(e["state_dir"]), out / "_backup" / e["key"]
        aside = backup / "moved-aside"
        if e["kind"] == "sublime":
            targets = list((src / "Local").glob("*.sublime_session"))
        else:
            targets = [p for p in [src / "Backups"] if p.exists()]
        storage = src / "User" / "globalStorage" / "storage.json"
        clear_windows = False
        if e["kind"] == "vscode" and storage.is_file():
            clear_windows = "windowsState" in json.loads(storage.read_text() or "{}")

        if by_key[e["key"]]["label"] in running:
            print(f"SKIP {e['label']}: still running. Quit it (Cmd-Q, not just close windows) and re-run.")
            failed = True
            continue
        if not backup.is_dir():
            print(f"SKIP {e['label']}: no backup at {backup}.")
            failed = True
            continue
        # The editor ran after extract: moving state now could lose new typing.
        if newest_mtime(targets) > created + 1:
            print(f"SKIP {e['label']}: state changed after extract ran. Re-run extract.py into a new "
                  "--out so nothing typed since then is lost.")
            failed = True
            continue
        if not targets and not clear_windows:
            print(f"ok   {e['label']}: already clean")
            continue

        for t in targets:
            print(f"{'move' if a.yes else 'would move'} {t} -> {aside / t.name}")
        if clear_windows:
            print(f"{'clear' if a.yes else 'would clear'} reopen-window list in {storage}")
        if not a.yes:
            continue
        aside.mkdir(parents=True, exist_ok=True)
        for t in targets:
            shutil.move(str(t), str(aside / t.name))
        if clear_windows:
            shutil.copy2(storage, aside / "storage.json")
            data = json.loads(storage.read_text())
            data.pop("windowsState", None)
            storage.write_text(json.dumps(data, indent=4))

    if not a.yes:
        print("\nDry run. Re-run with --yes to apply.")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
