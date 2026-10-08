import json
import os
import subprocess
import sys
from pathlib import Path

import pytest

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"


@pytest.fixture
def fakehome(tmp_path, monkeypatch):
    """A macOS-shaped home with Sublime and VS Code hot-exit state."""
    home = tmp_path / "home"
    support = home / "Library" / "Application Support"
    real = home / "notes.md"
    real.parent.mkdir(parents=True)
    real.write_text("on disk\n")

    session = {"windows": [{"buffers": [
        {"contents": "Call the dentist re: Tuesday\nbuy milk\n"},
        {"contents": "Call the dentist re: Tuesday\nbuy milk\n"},  # duplicate
        {"contents": "AWS key AKIAABCDEFGHIJKLMNOP\n"},
        {"contents": "\n\n"},
        {"contents": "\n".join(["✓ passes 3ms"] * 20)},  # test output
        {"file": str(real), "contents": "edited, unsaved\n"},
        {"file": str(home / "clean.txt")},  # clean buffer: no contents
    ]}]}
    local = support / "Sublime Text" / "Local"
    local.mkdir(parents=True)
    (local / "Auto Save Session.sublime_session").write_text(json.dumps(session))

    code = support / "Code"
    untitled = code / "Backups" / "1717087939190" / "untitled"
    untitled.mkdir(parents=True)
    (untitled / "abc123").write_text('untitled:Untitled-1 {"typeId":""}\nidea: a better grocery list\n')
    (untitled / "def456").write_text("untitled:Untitled-2\nCall the dentist re: Tuesday\nbuy milk\n")
    gs = code / "User" / "globalStorage"
    gs.mkdir(parents=True)
    (gs / "storage.json").write_text(json.dumps({"windowsState": {"openedWindows": [{}] * 5}, "theme": "x"}))

    monkeypatch.setenv("EDITOR_RESCUE_HOME", str(home))
    monkeypatch.setenv("EDITOR_RESCUE_PLATFORM", "Darwin")
    monkeypatch.setenv("EDITOR_RESCUE_PS", "")
    return home


def run(script, *args, env=None):
    return subprocess.run([sys.executable, str(SCRIPTS / script), *args], capture_output=True,
                          text=True, env={**os.environ, **(env or {})})
