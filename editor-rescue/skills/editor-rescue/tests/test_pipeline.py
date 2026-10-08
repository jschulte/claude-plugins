import json
import os
import time

from conftest import run


def extract(home):
    out = home / "rescue"
    r = run("extract.py", "--out", str(out))
    assert r.returncode == 0, r.stderr
    return out, json.loads((out / "_work" / "manifest.json").read_text())


def fake_triage(out, verdict="keep", skip=0):
    paths = [p for f in sorted((out / "_work" / "batches").glob("*.list"))
             for p in f.read_text().split("\n") if p]
    results = [dict(path=p, verdict=verdict, category="misc", title=f"note {i}", summary="s",
                    tidbits=["t"], secret=False, date_hint="") for i, p in enumerate(paths[skip:])]
    (out / "_work" / "results" / "batch_00.json").write_text(json.dumps(results))


def test_extract_dedupes_and_prefilters(fakehome):
    out, m = extract(fakehome)
    bodies = {b["auto"] for b in m["buffers"]}
    assert len(m["buffers"]) == 6  # duplicate across both editors collapses; clean buffer skipped
    assert {"empty", "noise", None} == bodies
    dup = next(b for b in m["buffers"] if b["copies"] == 3)
    assert dup["editor"] == "sublime-text"
    assert any(b["secret_hint"] for b in m["buffers"])
    dirty = next(b for b in m["buffers"] if b["kind"] == "dirty")
    assert dirty["disk"] == "differs"
    assert oct((out).stat().st_mode)[-3:] == "700"


def test_extract_refuses_synced_and_nonempty(fakehome):
    r = run("extract.py", "--out", str(fakehome / "Documents" / "x"))
    assert r.returncode != 0 and "syncs off this machine" in r.stderr
    extract(fakehome)
    r = run("extract.py", "--out", str(fakehome / "rescue"))
    assert r.returncode != 0 and "not empty" in r.stderr


def test_assemble_writes_notes_and_flags_gaps(fakehome):
    out, _ = extract(fakehome)
    fake_triage(out, skip=1)
    r = run("assemble.py", str(out))
    assert r.returncode == 0, r.stderr
    assert "unreviewed=1" in r.stdout and "UNREVIEWED" in r.stdout
    readme = (out / "README.md").read_text()
    assert "## Keep" in readme and "Unreviewed" in readme
    secrets = (out / "SECRETS-REVIEW.md").read_text()
    assert "AKIA" not in secrets  # pattern hint flagged, value never copied
    assert "secrets=1" in r.stdout
    assert "differs" in (out / "DIRTY-FILES.md").read_text()
    assert (out / "keep" / "misc").is_dir()


def test_reset_dry_run_then_apply(fakehome):
    out, _ = extract(fakehome)
    support = fakehome / "Library" / "Application Support"
    session = support / "Sublime Text" / "Local" / "Auto Save Session.sublime_session"
    r = run("reset.py", str(out))
    assert r.returncode == 0 and "Dry run" in r.stdout and session.exists()
    r = run("reset.py", str(out), "--yes")
    assert r.returncode == 0, r.stdout
    assert not session.exists() and not (support / "Code" / "Backups").exists()
    assert (out / "_backup" / "sublime-text" / "moved-aside" / session.name).exists()
    storage = json.loads((support / "Code" / "User" / "globalStorage" / "storage.json").read_text())
    assert "windowsState" not in storage and storage["theme"] == "x"
    assert "already clean" in run("reset.py", str(out), "--yes").stdout


def test_reset_refuses_running_or_changed(fakehome):
    out, _ = extract(fakehome)
    r = run("reset.py", str(out), "--yes",
            env={"EDITOR_RESCUE_PS": "/Applications/Sublime Text.app/Contents/MacOS/sublime_text"})
    assert r.returncode == 1 and "still running" in r.stdout
    session = fakehome / "Library/Application Support/Sublime Text/Local/Auto Save Session.sublime_session"
    assert session.exists()
    future = time.time() + 60
    os.utime(session, (future, future))
    r = run("reset.py", str(out), "--yes")
    assert r.returncode == 1 and "changed after extract" in r.stdout and session.exists()
