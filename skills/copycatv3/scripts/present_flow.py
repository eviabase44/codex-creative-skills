#!/usr/bin/env python3
"""Read-only Present Flow evidence bridge. Never evaluates AE or certifies a render."""
import argparse
import hashlib
import json
import math
from pathlib import Path
import sys

SKILL_ROOT = Path(__file__).resolve().parents[1]
PACK = SKILL_ROOT / 'assets/present-flow-approved-kit'
FAMILIES = {
    'A': (6971, 6986, 7135, 6819, 6866),
    'B': (7180, 7210, 6897),
    'C': (638, 707, 7240, 7272, 82),
    'D': (7052,),
}
FAMILY_NAMES = {'A': 'progressive text reveal', 'B': 'phased title assembly',
                'C': 'authored word offsets', 'D': 'independent elliptical collage'}
LIMITS = {
    707: ('quarantined', 'Eight disabled Position expressions call missing offsetAuthored.'),
    6897: ('needs_native_inspection', 'Opening 2 general-property extraction is partial.'),
}


def read(relative, root=PACK):
    return json.loads((root / relative).read_text(encoding='utf-8-sig'))


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def inside(root, relative):
    path = (root / relative).resolve()
    if not path.is_relative_to(root.resolve()):
        raise ValueError('Reference path escapes the reference pack')
    return path


def load(root=PACK):
    return read('approved/extracted/project.json', root), read('approved/extracted/expression-index.json', root)


def family(comp_id):
    return next((name for name, ids in FAMILIES.items() if comp_id in ids), None)


def status(comp_id):
    return LIMITS.get(comp_id, ('reference_available', 'Authored evidence only; renderer validation pending.'))


def choose(data, comp_id, production=False):
    comp = next((c for c in data['comps'] if c['id'] == comp_id), None)
    if not comp or not comp['approved'] or not family(comp_id) or 'SH20' in comp['name']:
        raise ValueError(f'{comp_id} is not in the approved reference selection')
    if production and comp_id in LIMITS:
        raise ValueError(f'{comp_id}: {status(comp_id)[0]} — {status(comp_id)[1]} Use inspect for diagnosis.')
    return comp


def closure(data, comp):
    by_id = {c['id']: c for c in data['comps']}
    found = {}

    def visit(c):
        if c['id'] in found:
            return
        found[c['id']] = c
        for layer in c['layers']:
            if layer.get('sourceId') in by_id:
                visit(by_id[layer['sourceId']])
    visit(comp)
    return list(found.values())


def controls(comp):
    result = []
    for layer in comp['layers']:
        for effect in layer.get('controls', []):
            for parameter in effect['parameters']:
                active_expression = bool(parameter.get('expressionEnabled') and parameter.get('expression'))
                evaluation = ('expression' if active_expression else
                              'keyframed' if parameter.get('keys') else 'constant')
                result.append({
                    'layer_index': layer['index'], 'layer_name': layer['name'],
                    'control': effect['name'], 'parameter': parameter['name'],
                    'role': 'derived_readout' if effect['name'].startswith('[OUT]') else 'inspect_family_contract',
                    'evaluation_mode': evaluation, 'effect_enabled': effect.get('enabled'),
                    'underlying_start_value': parameter.get('value'),
                    'keys': parameter.get('keys', []),
                    'expression_enabled': bool(parameter.get('expressionEnabled')),
                    'expression': parameter.get('expression', ''),
                    'interpolation': 'not serialized; obtain native AE evaluation before porting',
                })
    return result


def brief(comp, root=PACK):
    guides = sorted((root / 'docs/rigs').glob(f"{comp['id']}-*.md"))
    state, reason = status(comp['id'])
    return {'id': comp['id'], 'name': comp['name'], 'family': family(comp['id']),
            'family_name': FAMILY_NAMES[family(comp['id'])], 'native_fps': comp['fps'],
            'duration_seconds': comp['duration'], 'dimensions': [comp['width'], comp['height']],
            'selection_status': state, 'status_reason': reason,
            'guide': str(guides[0].relative_to(root)) if guides else None}


def contract(data, index, comp_id, root=PACK, production=True):
    comp = choose(data, comp_id, production)
    comps = closure(data, comp)
    ids = {c['id'] for c in comps}
    sources = {l.get('sourceId') for c in comps for l in c['layers']}
    manifest = read('integration-manifest.json', root)
    return {
        'schema_version': 1, 'reference': brief(comp, root),
        'provenance': {'source_archive_sha256': manifest['source_archive_sha256'],
                       'snapshot_date': manifest['snapshot_date'],
                       'project_json_sha256': digest(root / 'approved/extracted/project.json'),
                       'authoritative_aep': 'approved/project/Approved-packaged.aep',
                       'aep_sha256': manifest['files']['approved/project/Approved-packaged.aep']},
        'validation': {'package_integrity': 'run verify', 'native_evaluation': 'not_run',
                       'codex_port': 'unverified_port', 'user_approval_of_new_output': 'pending'},
        'warnings': ['Underlying start values are not evaluated expression outputs.',
                     'No key interpolation, AE expression execution or visual validation is performed.',
                     'Keep native timing units; delivery FPS does not redefine frame-valued controls.'],
        'controls': controls(comp),
        'expression_bindings': [e for e in index if e['compId'] in ids],
        'media': [m for m in read('approved/extracted/media-manifest.json', root) if m['id'] in sources],
        'known_issues': [i for i in read('approved/extracted/issues.json', root)
                         if i['comp'] in {c['name'] for c in comps}],
        'composition_snapshots': comps,
    }


def sh22_held_time(time, element_id, native_fps=24, hold_frames=4, phase_frames=13, display_start=0):
    """Exact SH22 clock formula only. Call before sampling ALL drivers and wiggle."""
    if native_fps <= 0 or not all(math.isfinite(v) for v in (time, native_fps, hold_frames, phase_frames, display_start)):
        raise ValueError('Clock inputs must be finite and native FPS positive')
    step = max(1, math.floor(hold_frames + 0.5))  # AE/JS Math.round
    phase = (element_id * math.floor(phase_frames + 0.5)) % step
    frame = (time - display_start) * native_fps
    held = max(0, math.floor((frame + phase + 0.00001) / step) * step - phase)
    return display_start + held / native_fps


def sample_plan(comp, start=0, duration=None):
    duration = comp['duration'] - start if duration is None else duration
    if (not math.isfinite(start) or not math.isfinite(duration) or start < 0 or duration <= 0
            or start + duration > comp['duration'] + 1e-9):
        raise ValueError('Sample interval must be finite, positive and inside the source comp')
    # Extraction writes decimal seconds; tolerate only numeric serialization noise.
    count = math.ceil(duration * 12 - 1e-9)
    return {'kind': 'sample_schedule_only_not_evaluated_motion', 'comp_id': comp['id'],
            'native_fps': comp['fps'], 'delivery_fps': 12, 'source_start_seconds': start,
            'requested_duration_seconds': duration, 'frame_count': count,
            'encoded_duration_seconds': count / 12, 'end_quantization_seconds': count / 12 - duration,
            'frame_units': 'Native frames remain in native FPS. No retiming or interpolation.',
            'samples': [{'output_frame': i, 'output_seconds': i / 12,
                         'source_seconds': comp['displayStart'] + start + i / 12,
                         'native_frame': (start + i / 12) * comp['fps']} for i in range(count)]}


def verify(root=PACK, strict=False):
    manifest = read('integration-manifest.json', root)
    errors = []
    for relative, expected in manifest['files'].items():
        path = inside(root, relative)
        if not path.is_file() or digest(path) != expected:
            errors.append('Missing/changed file: ' + relative)
    data, index = load(root)
    approved = [c for c in data['comps'] if c['approved']]
    ids = {c['id'] for c in approved}
    expected_ids = {i for ids_ in FAMILIES.values() for i in ids_}
    if ids != expected_ids or any('SH20' in c['name'] for c in approved):
        errors.append('Approved catalog differs from this integration; inspect before adapting')
    for entry in index:
        path = inside(root, entry['file'])
        if not path.is_file() or digest(path) != entry['sha256']:
            errors.append('Expression hash mismatch: ' + entry['file'])
    media = read('approved/extracted/media-manifest.json', root)
    for entry in media:
        path = inside(root, entry['relativePath']) if entry.get('relativePath') else None
        if path is None or not path.is_file() or digest(path) != entry['sha256']:
            errors.append('Missing/changed media: ' + entry['name'])
    issues = read('approved/extracted/issues.json', root)
    return {'package_integrity': 'fail' if errors else 'pass', 'errors': errors,
            'approved_compositions': len(approved), 'total_compositions': len(data['comps']),
            'expression_bindings': len(index), 'unique_expressions': len({e['sha256'] for e in index}),
            'media_files': len(media), 'known_inspection_findings': len(issues),
            'quarantined_comps': [707], 'native_inspection_required': [6897],
            'strict_status': 'fail' if errors or issues else 'pass',
            'success': not errors and (not strict or not issues),
            'scope': 'Integrity only. Known issues remain. No AE render or Codex fidelity certification.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    check = sub.add_parser('verify'); check.add_argument('--strict', action='store_true')
    sub.add_parser('list')
    for name in ('inspect', 'contract', 'sample-plan'):
        p = sub.add_parser(name); p.add_argument('comp_id', type=int)
        p.add_argument('--output', type=Path)
        if name == 'sample-plan':
            p.add_argument('--start', type=float, default=0); p.add_argument('--duration', type=float)
    args = parser.parse_args()
    try:
        if args.command == 'verify':
            result = verify(strict=args.strict)
        else:
            integrity = verify()
            if not integrity['success']:
                raise ValueError('Reference integrity failed: ' + '; '.join(integrity['errors']))
            data, index = load()
            if args.command == 'list':
                result = [brief(c) for c in data['comps'] if c['approved']]
            elif args.command == 'sample-plan':
                result = sample_plan(choose(data, args.comp_id, True), args.start, args.duration)
            else:
                result = contract(data, index, args.comp_id, production=args.command == 'contract')
        rendered = json.dumps(result, ensure_ascii=False, indent=2) + '\n'
        output = getattr(args, 'output', None)
        if output:
            output = output.resolve()
            if output.is_relative_to(SKILL_ROOT):
                raise ValueError('Write task outputs outside the installed skill/reference library')
            output.parent.mkdir(parents=True, exist_ok=True)
            output.write_text(rendered)
            print(str(output))
        else:
            print(rendered, end='')
        return 1 if args.command == 'verify' and not result['success'] else 0
    except (ValueError, OSError, KeyError, json.JSONDecodeError) as exc:
        print(f'Present Flow: {exc}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
