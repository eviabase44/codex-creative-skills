#!/usr/bin/env python3
"""Read live review decisions when selecting location references."""
import argparse
import json
import os
from pathlib import Path

LIBRARY = Path(__file__).resolve().parents[1] / 'library'
if not LIBRARY.exists():
    LIBRARY = Path(__file__).resolve().parents[3]

def select(manifest, state, group=None, kept_only=False, include_flagged=False, limit=8):
    decisions = state.get('decisions', {})
    rows = []
    seen = set()
    for row in manifest['references']:
        # The whole library is kept unless rejected; old unreviewed entries also count as kept.
        status = 'reject' if decisions.get(row['imageKey'], {}).get('status') == 'reject' else 'keep'
        if status == 'reject' or (group and row['group'] != group):
            continue
        if row['imageKey'] in seen:
            continue
        seen.add(row['imageKey'])
        rows.append({**row, 'reviewStatus': status})
    rows.sort(key=lambda row: (not row.get('isSeed', False), row['id']))
    return rows[:limit]

def import_decisions(path, manifest, state_path):
    incoming = json.loads(Path(path).read_text())
    if incoming.get('collection') not in (None, manifest['collectionId']):
        raise ValueError('Decision file belongs to another collection')
    decisions = incoming.get('decisions')
    if not isinstance(decisions, dict):
        raise ValueError('Missing decisions object')
    keys = {r['imageKey'] for r in manifest['references']}
    for key, value in decisions.items():
        if key not in keys or not isinstance(value, dict) or value.get('status') not in ('keep', 'reject', 'unreviewed'):
            raise ValueError('Unknown image or invalid review status')
        if not isinstance(value.get('note', ''), str):
            raise ValueError('Notes must be text')
    state = json.loads(state_path.read_text())
    state['defaultStatus'] = 'keep'
    for key, value in decisions.items():
        current = state['decisions'].get(key, {})
        # A stale export must not undo a more recent decision made in the live gallery.
        if current.get('updatedAt', '') > value.get('updatedAt', ''):
            continue
        state['decisions'][key] = {**value, 'status': 'reject' if value['status'] == 'reject' else 'keep'}
    temporary = state_path.with_suffix('.tmp')
    temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2) + '\n')
    os.replace(temporary, state_path)
    return len(decisions)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--group')
    parser.add_argument('--limit', type=int, default=8)
    parser.add_argument('--kept-only', action='store_true', help='Compatible alias; all non-rejected images are kept')
    parser.add_argument('--include-flagged', action='store_true', help='Compatible alias; flags are advisory and already included')
    parser.add_argument('--import-decisions')
    parser.add_argument('--library', type=Path, default=LIBRARY)
    args = parser.parse_args()
    manifest = json.loads((args.library / 'manifest.json').read_text())
    state_path = args.library / 'review-state.json'
    if args.import_decisions:
        print(json.dumps({'importedDecisions': import_decisions(args.import_decisions, manifest, state_path)}))
    else:
        state = json.loads(state_path.read_text())
        rows = select(manifest, state, args.group, args.kept_only, args.include_flagged, args.limit)
        for row in rows:
            row['absolutePath'] = str(args.library / row['localPath'])
        print(json.dumps({'collectionSavedCount':manifest['savedCount'], 'references':rows}, ensure_ascii=False, indent=2))
