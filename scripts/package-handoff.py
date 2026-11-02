#!/usr/bin/env python3
"""Create a narrowly scoped, reproducible source archive without account data."""

from __future__ import annotations

import hashlib
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "generated-artifacts" / "sozo-handoff"
ARCHIVE = OUT / "SOZO-Wellness-Website-Handoff.zip"
ROOT_FILES = (
    ".gitignore", ".replitignore", ".replit", ".npmrc",
    "package.json", "pnpm-lock.yaml", "pnpm-workspace.yaml",
    "tsconfig.json", "tsconfig.base.json", "replit.md",
    "README.md", "HANDOFF-CHECKLIST.md", "HANDOFF-VERIFICATION.md",
)
TREES = ("artifacts/sozo-wellness", "artifacts/api-server", "lib", "scripts")
EXCLUDED_PARTS = {
    "node_modules", "dist", ".git", ".cache", ".local", ".config", ".agents",
    ".conversation", "coverage", "__pycache__", "generated-artifacts",
    "attached_assets", "outputs", "mockup-sandbox",
}
EXCLUDED_SUFFIXES = {
    ".tsbuildinfo", ".log", ".pyc", ".pem", ".key", ".p12", ".pfx",
    ".db", ".sqlite", ".sqlite3", ".dump", ".sql", ".zip",
}
TEXT_SUFFIXES = {
    ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".yaml", ".yml",
    ".toml", ".md", ".html", ".css", ".sh", ".py", ".txt", ".xml",
}


def allowed(path: Path) -> bool:
    relative = path.relative_to(ROOT)
    return (
        not any(part in EXCLUDED_PARTS for part in relative.parts)
        and not path.name.startswith(".env")
        and path.name not in {".DS_Store", "Thumbs.db", ".netrc", ".pgpass"}
        and path.suffix.lower() not in EXCLUDED_SUFFIXES
    )


def collect() -> dict[str, bytes]:
    files: dict[str, bytes] = {}
    for filename in ROOT_FILES:
        path = ROOT / filename
        if not path.is_file() or path.is_symlink():
            raise RuntimeError(f"Missing or unsafe required file: {filename}")
        files[filename] = path.read_bytes()
    for tree in TREES:
        base = ROOT / tree
        if not base.is_dir():
            raise RuntimeError(f"Missing required directory: {tree}")
        # Prune excluded directories before reading or following anything.
        for directory, subdirs, filenames in base.walk(follow_symlinks=False):
            subdirs[:] = [
                name for name in subdirs
                if allowed(directory / name) and not (directory / name).is_symlink()
            ]
            for name in filenames:
                path = directory / name
                if not allowed(path):
                    continue
                if path.is_symlink():
                    raise RuntimeError(f"Unexpected source symlink: {path.relative_to(ROOT)}")
                files[path.relative_to(ROOT).as_posix()] = path.read_bytes()
    return files


def check_package(files: dict[str, bytes]) -> None:
    required = (
        "artifacts/sozo-wellness/.replit-artifact/artifact.toml",
        "artifacts/api-server/.replit-artifact/artifact.toml",
        "artifacts/sozo-wellness/src/App.tsx",
        "artifacts/sozo-wellness/public/sitemap.xml",
        "artifacts/api-server/src/routes/assessment-requests.ts",
        "lib/db/src/schema/assessment-requests.ts",
    )
    for name in required:
        if name not in files:
            raise RuntimeError(f"Package is incomplete: {name}")

    # Reject recognizable embedded credentials; never print their values.
    credential_patterns = (
        re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
        re.compile(r"\b(?:postgres(?:ql)?|mysql)://[^:\s/]+:[^@\s]+@"),
        re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
        re.compile(r"\bgh[pousr]_[A-Za-z0-9]{30,}\b"),
        re.compile(r"\bsk_live_[A-Za-z0-9]{20,}\b"),
        re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    )
    missing_assets = set()
    for name, data in files.items():
        path = Path(name)
        if path.suffix not in TEXT_SUFFIXES and not name.startswith("."):
            continue
        text = data.decode("utf-8")
        if any(pattern.search(text) for pattern in credential_patterns):
            raise RuntimeError(f"Possible embedded credential; review privately: {name}")
        if name.startswith("artifacts/sozo-wellness/src/"):
            if re.search(r"""(?:from\s*|import\s*\()\s*['"]@assets/""", text):
                raise RuntimeError(f"Source depends on excluded upload alias: {name}")
            for asset in re.findall(r"""['"`](/images/[^'"`\s${}]+)['"`]""", text):
                if "artifacts/sozo-wellness/public" + asset not in files:
                    missing_assets.add(asset)
    if missing_assets:
        raise RuntimeError("Missing local assets: " + ", ".join(sorted(missing_assets)))


def main() -> None:
    files = collect()
    check_package(files)
    entries = [
        {"path": name, "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        for name, data in sorted(files.items())
    ]
    manifest = {
        "project": "SOZO Wellness Center",
        "createdAt": datetime.now(timezone.utc).isoformat(),
        "purpose": "One-time source handoff for import into SOZO's Replit account.",
        "includesDatabaseRows": False,
        "includesEnvironmentSecrets": False,
        "fileCountExcludingManifest": len(entries),
        "files": entries,
    }
    files["PACKAGE-CONTENTS.json"] = (
        json.dumps(manifest, indent=2) + "\n"
    ).encode("utf-8")
    OUT.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(ARCHIVE, "w", compression=zipfile.ZIP_DEFLATED, compresslevel=6) as zf:
        for name, data in sorted(files.items()):
            info = zipfile.ZipInfo(name, date_time=(2026, 10, 30, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = (0o100755 if name.endswith((".sh", ".py")) else 0o100644) << 16
            zf.writestr(info, data)
    with zipfile.ZipFile(ARCHIVE) as zf:
        bad = zf.testzip()
        if bad:
            raise RuntimeError(f"Archive integrity failure: {bad}")
        if any(name.startswith("/") or ".." in Path(name).parts for name in zf.namelist()):
            raise RuntimeError("Unsafe archive paths")
    if ARCHIVE.stat().st_size >= 200_000_000:
        raise RuntimeError("Archive exceeds Replit's documented ZIP import size limit")
    digest = hashlib.sha256(ARCHIVE.read_bytes()).hexdigest()
    (OUT / "SHA256SUMS.txt").write_text(f"{digest}  {ARCHIVE.name}\n")
    print(json.dumps({
        "archive": ARCHIVE.relative_to(ROOT).as_posix(),
        "files": len(files),
        "bytes": ARCHIVE.stat().st_size,
        "sha256": digest,
        "status": "archive integrity, required files, local image references and credential-pattern checks passed",
    }, indent=2))


if __name__ == "__main__":
    try:
        main()
    except (RuntimeError, UnicodeError) as error:
        print(str(error), file=sys.stderr)
        sys.exit(1)
