#!/usr/bin/env python3
"""Install pinned external skills locally without republishing their contents."""
import argparse
import json
import shutil
import subprocess
import tempfile
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]


def install(root: Path) -> None:
    lock = json.loads((REPO / 'skills.lock.json').read_text())
    if lock['version'] != 1:
        raise ValueError('Unsupported skills lock version')
    for entry in lock['skills']:
        destination = root / entry['destination']
        source_path = Path(entry['path'])
        if source_path.is_absolute() or '..' in source_path.parts:
            raise ValueError('Invalid source path')
        if not destination.resolve().is_relative_to(root.resolve()):
            raise ValueError('Destination must stay inside project')
        marker = destination / '.shotcraft-source.json'
        if destination.exists():
            if marker.is_file() and json.loads(marker.read_text()) == entry and (destination / 'SKILL.md').is_file():
                print(f"Already installed: {entry['name']} @ {entry['revision']}")
                continue
            raise FileExistsError(f'Refusing to overwrite existing skill: {destination}')
        with tempfile.TemporaryDirectory(prefix='shotcraft-skills-') as temporary:
            checkout = Path(temporary) / 'source'
            subprocess.run(['git', 'init', '--quiet', str(checkout)], check=True)
            subprocess.run(['git', '-C', str(checkout), 'fetch', '--quiet', '--depth=1', entry['repository'], entry['revision']], check=True)
            revision = subprocess.check_output(['git', '-C', str(checkout), 'rev-parse', 'FETCH_HEAD'], text=True).strip()
            if revision != entry['revision']:
                raise ValueError('Resolved revision differs from skills lock')
            subprocess.run(['git', '-C', str(checkout), 'checkout', '--quiet', 'FETCH_HEAD', '--', entry['path']], check=True)
            source = checkout / source_path
            if not (source / 'SKILL.md').is_file():
                raise ValueError('Source is not a skill')
            destination.parent.mkdir(parents=True, exist_ok=True)
            # Prepare in the target filesystem so the final rename is atomic.
            with tempfile.TemporaryDirectory(prefix='.skill-install-', dir=destination.parent) as staging:
                staged = Path(staging) / entry['name']
                shutil.copytree(source, staged)
                (staged / '.shotcraft-source.json').write_text(json.dumps(entry, indent=2) + '\n')
                staged.rename(destination)
        print(f"Installed: {entry['name']} @ {revision}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--project-root', type=Path, default=REPO, help='Target checkout; useful for isolated installation checks')
    args = parser.parse_args()
    install(args.project_root.resolve())
