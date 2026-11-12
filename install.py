#!/usr/bin/env python3
"""Install the selected local skill folders without overwriting existing skills."""
import argparse
import os
from pathlib import Path
import shutil
import sys

ROOT = Path(__file__).resolve().parent
SKILLS = ('image-bible', 'image-copycat', 'copycatv3')


def install(names, destination, dry_run=False):
    destination = Path(destination).expanduser().resolve()
    sources = [(ROOT / 'skills' / name, destination / name) for name in names]
    for source, target in sources:
        if not (source / 'SKILL.md').is_file():
            raise ValueError(f'Missing skill entrypoint: {source}')
        if target.exists() or target.is_symlink():
            raise ValueError(f'Already exists: {target}. Back it up and move it explicitly before reinstalling.')
        if any(p.is_symlink() for p in source.rglob('*')):
            raise ValueError(f'Unexpected symbolic link in skill: {source}')
        if destination == source or destination.is_relative_to(source):
            raise ValueError('The install destination cannot be inside a source skill.')
    for source, target in sources:
        print(f'{"Would install" if dry_run else "Installing"} {source.name} -> {target}')
    if dry_run:
        return
    destination.mkdir(parents=True, exist_ok=True)
    created = []
    try:
        for source, target in sources:
            # Exclusive creation protects an installation appearing after preflight.
            target.mkdir()
            created.append(target)
            shutil.copytree(source, target, dirs_exist_ok=True,
                            ignore=shutil.ignore_patterns('__pycache__', '*.pyc', '.DS_Store',
                                                         '*.log', 'server-url.json'))
    except BaseException:
        # Roll back only directories created by this invocation.
        for target in reversed(created):
            shutil.rmtree(target)
        raise
    print('Installed. Use the skills on your next Codex turn.')


def main():
    if sys.version_info < (3, 10):
        raise SystemExit('Python 3.10 or later is required.')
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--skill', choices=SKILLS, action='append',
                        help='Install only this skill; repeat to select more than one.')
    parser.add_argument('--dest', type=Path,
                        default=Path(os.environ.get('CODEX_HOME') or Path.home() / '.codex') / 'skills',
                        help='Skills destination; default: $CODEX_HOME/skills or ~/.codex/skills.')
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    try:
        install(tuple(dict.fromkeys(args.skill or SKILLS)), args.dest, args.dry_run)
    except (OSError, ValueError) as exc:
        print(f'Install failed: {exc}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    sys.exit(main())
