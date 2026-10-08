"""Shared bits for editor-rescue: where each editor keeps hot-exit state."""
import os
import platform
import re
import subprocess
from pathlib import Path

# kind: "sublime" = JSON session file; "vscode" = Backups/ dir + windowsState.
# mac/linux: directory names under the platform's app-support root.
# proc_mac: substring of the process command line; proc_linux: argv[0] basename.
EDITORS = [
    dict(key="sublime-text", label="Sublime Text", kind="sublime",
         mac=["Sublime Text", "Sublime Text 3"], linux=["sublime-text", "sublime-text-3"],
         proc_mac="Sublime Text.app/", proc_linux="sublime_text"),
    dict(key="vscode", label="VS Code", kind="vscode",
         mac=["Code"], linux=["Code"],
         proc_mac="Visual Studio Code.app/", proc_linux="code"),
    dict(key="vscode-insiders", label="VS Code Insiders", kind="vscode",
         mac=["Code - Insiders"], linux=["Code - Insiders"],
         proc_mac="Visual Studio Code - Insiders.app/", proc_linux="code-insiders"),
    dict(key="cursor", label="Cursor", kind="vscode",
         mac=["Cursor"], linux=["Cursor"], proc_mac="Cursor.app/", proc_linux="cursor"),
    dict(key="vscodium", label="VSCodium", kind="vscode",
         mac=["VSCodium"], linux=["VSCodium"], proc_mac="VSCodium.app/", proc_linux="codium"),
    dict(key="windsurf", label="Windsurf", kind="vscode",
         mac=["Windsurf"], linux=["Windsurf"], proc_mac="Windsurf.app/", proc_linux="windsurf"),
]

# Folders that sync to someone else's servers. Rescued buffers routinely hold
# pasted credentials, so the output must not land in one of these by default.
SYNCED_DIRS = ["Documents", "Desktop", "Library/Mobile Documents", "Library/CloudStorage",
               "Dropbox", "Google Drive", "OneDrive", "iCloud Drive"]

NOISE = re.compile(
    r"(^\s*(✓|×|❯|FAIL|PASS|⏺|⎿|│|╭|╰|at |npm (error|warn)|stderr \||stdout \||\[\d+/\d+\]"
    r"|RUN v|Test Files|Tests |Duration|data\.|.*: Reading\.\.\.|\d+:\d+\s+(warning|error))"
    r"|node_modules|Claude Code v|OpenAI Codex|Skip to content|^Searching \d+ files)", re.M)

SECRET = re.compile(
    r"(sk-[A-Za-z0-9_-]{20,}|sk_live_[A-Za-z0-9]{10,}|rk_live_|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}"
    r"|github_pat_|xox[bpa]-|-----BEGIN [A-Z ]*PRIVATE KEY|password\s*[:=]\s*\S+"
    r"|postgres(ql)?://[^\s:]+:[^\s@]+@|mongodb(\+srv)?://[^\s:]+:[^\s@]+@)", re.I)


def home():
    # Overridable so tests can point the scripts at a fake home directory.
    return Path(os.environ.get("EDITOR_RESCUE_HOME") or Path.home())


def system():
    return os.environ.get("EDITOR_RESCUE_PLATFORM") or platform.system()


def support_root():
    if system() == "Darwin":
        return home() / "Library" / "Application Support"
    if system() == "Linux":
        return home() / ".config"
    raise SystemExit("editor-rescue supports macOS and Linux only.")


def state_dir(editor):
    """Return the editor's app-support directory if it exists on this machine."""
    names = editor["mac"] if system() == "Darwin" else editor["linux"]
    for n in names:
        p = support_root() / n
        if p.is_dir():
            return p
    return None


def running_editors():
    """Labels of editors that currently have a process running."""
    if os.environ.get("EDITOR_RESCUE_PS") is not None:  # test hook
        cmds = os.environ["EDITOR_RESCUE_PS"].splitlines()
    else:
        cmds = subprocess.run(["ps", "-axo", "command"], capture_output=True, text=True).stdout.splitlines()
    out = []
    for e in EDITORS:
        if system() == "Darwin":
            hit = any(e["proc_mac"] in c for c in cmds)
        else:
            hit = any(os.path.basename(c.split(" ", 1)[0]) == e["proc_linux"] for c in cmds if c)
        if hit:
            out.append(e["label"])
    return out


def synced_location(path):
    p = Path(path).expanduser().resolve()
    for d in SYNCED_DIRS:
        root = (home() / d).resolve()
        if p == root or root in p.parents:
            return str(root)
    return None
