#!/usr/bin/env python3
"""Local source discovery, immutable test preparation and evidence verification.

Does not generate media, judge visual fidelity or call any external service.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
CHECKS = ('copy_exact', 'layout_preserved', 'type_preserved', 'texture_preserved',
          'assets_correct', 'platform_fit', 'old_content_removed')


def read_json(path):
    return json.loads(Path(path).read_text(encoding='utf-8'))


def write_json(path, value):
    Path(path).write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


def sha_file(path):
    digest = hashlib.sha256()
    with Path(path).open('rb') as stream:
        for block in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(block)
    return digest.hexdigest()


def sha_text(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def canonical_sha(value):
    return sha_text(json.dumps(value, sort_keys=True, ensure_ascii=False, separators=(',', ':')))


def validate_payload(p):
    if p.get('schema_version') != 1:
        raise ValueError('schema_version must be 1')
    for key in ('event_id', 'topic', 'platform', 'placement', 'post_media_caption'):
        if not isinstance(p.get(key), str) or not p[key].strip():
            raise ValueError(f'{key} must be a nonempty string')
    if p.get('mode') not in ('dry_run', 'production'):
        raise ValueError('mode must be dry_run or production')
    if p.get('kind') not in ('image', 'video'):
        raise ValueError('kind must be image or video')
    for key in ('width', 'height'):
        if type(p.get(key)) is not int or not 1 <= p[key] <= 16384:
            raise ValueError(f'{key} must be an integer in 1..16384')
    copy = p.get('on_image_copy')
    if not isinstance(copy, list) or not copy or any(not isinstance(s, str) or not s.strip() for s in copy):
        raise ValueError('on_image_copy must contain nonempty strings')
    for key in ('first_reply', 'attribution'):
        if key in p and not isinstance(p[key], str):
            raise ValueError(f'{key} must be a string')
    if p.get('mode') == 'production' and p.get('simulated'):
        raise ValueError('A simulated trigger cannot be a production job')
    return p


def shortlist(query, limit):
    words = set(re.findall(r'[a-z0-9]+', query.lower())) - {'the', 'and', 'with', 'a', 'an', 'of', 'for'}
    candidates = []
    for video in read_json(ROOT / 'references/video-index.json')['videos']:
        for shot in video['shots']:
            haystack = json.dumps(shot, ensure_ascii=False).lower()
            score = sum(1 for word in words if re.search(r'\b' + re.escape(word) + r'\b', haystack))
            if score:
                candidates.append({
                    'score': score, 'video': video['id'], 'title': video['title'],
                    'shot': shot['n'], 'frames': [shot['in_f'], shot['out_f']],
                    'seconds': [round(shot['in_f']/video['fps'], 3), round((shot['out_f']+1)/video['fps'], 3)],
                    'type': shot.get('type'), 'description': shot.get('description', ''),
                    'source_url': video['url'], 'requires_visual_inspection': True,
                })
    candidates.sort(key=lambda x: (-x['score'], x['video'], x['shot']))
    return candidates[:limit]


def source_path(video):
    override = os.environ.get('BASE44_SOURCE_DIR')
    if override:
        return Path(override).expanduser() / Path(video['source']).name
    path = Path(video['source'])
    return path if path.is_absolute() else ROOT / path


def prepare(payload_path, video_id, frame, out):
    payload = validate_payload(read_json(payload_path))
    if payload['kind'] != 'image':
        raise ValueError('This extraction helper prepares static images. Use the motion branch for video.')
    index = read_json(ROOT / 'references/video-index.json')
    video = next((v for v in index['videos'] if v['id'] == video_id), None)
    if not video:
        raise ValueError(f'Unknown video ID: {video_id}')
    if type(frame) is not int or not 0 <= frame < video['frames']:
        raise ValueError('Frame must be zero-based and within the source frame count')
    source = source_path(video)
    if not source.is_file():
        raise ValueError(f'Original source unavailable: {source}. Resolve it or set BASE44_SOURCE_DIR.')
    source_hash = sha_file(source)
    if source_hash != video['sha256']:
        raise ValueError('Original source hash differs from the indexed source; review and re-index deliberately')
    payload_hash = canonical_sha(payload)
    key = canonical_sha({'event_id': payload['event_id'], 'input': payload_hash,
                         'source': source_hash, 'frame': frame})
    out = Path(out).resolve()
    if out.exists() and any(out.iterdir()):
        existing = out / 'job.json'
        if existing.is_file() and read_json(existing).get('job_key') == key:
            old = read_json(existing)
            if canonical_sha(read_json(out/'input.json')) != payload_hash:
                raise ValueError('Existing input snapshot changed; use a new revision directory')
            if sha_file(out/'reference.png') != old['reference_sha256']:
                raise ValueError('Existing reference changed; use a new revision directory')
            if (out/'caption.txt').read_bytes() != payload['post_media_caption'].encode('utf-8'):
                raise ValueError('Existing caption changed; restore it before retrying')
            return {'status': 'existing_job', 'job_key': key, 'directory': str(out)}
        raise ValueError('Output directory is nonempty or belongs to a different job; choose a new revision directory')
    out.mkdir(parents=True, exist_ok=True)
    reference = out / 'reference.png'
    subprocess.run(['ffmpeg', '-v', 'error', '-i', str(source), '-vf', f'select=eq(n\\,{frame})',
                    '-frames:v', '1', '-fps_mode', 'passthrough', str(reference)], check=True)
    shot = next(s for s in video['shots'] if s['in_f'] <= frame <= s['out_f'])
    job = {
        'job_key': key, 'event_id': payload['event_id'], 'input_sha256': payload_hash,
        'caption_sha256': sha_text(payload['post_media_caption']),
        'reference_sha256': sha_file(reference), 'source_sha256': source_hash,
        'source_path': str(source), 'source_url': video['url'], 'video_id': video_id,
        'frame': frame, 'time_seconds': frame/video['fps'], 'fps': video['fps'],
        'shot': shot, 'source_dimensions': video['dimensions'],
        'target': {k: payload[k] for k in ('platform', 'placement', 'kind', 'width', 'height')},
        'state': 'source_extracted_requires_edit_and_visual_review',
    }
    write_json(out/'input.json', payload)
    write_json(out/'job.json', job)
    (out/'caption.txt').write_bytes(payload['post_media_caption'].encode('utf-8'))
    for name in ('first_reply', 'attribution'):
        (out/f'{name}.txt').write_bytes(payload.get(name, '').encode('utf-8'))
    return {'status': 'prepared', 'job_key': key, 'directory': str(out)}


def png_size(path):
    with Path(path).open('rb') as stream:
        header = stream.read(24)
    if header[:8] != b'\x89PNG\r\n\x1a\n' or header[12:16] != b'IHDR':
        raise ValueError('Static verifier currently requires a PNG output')
    return struct.unpack('>II', header[16:24])


def verify(directory):
    out = Path(directory).resolve()
    p, j, r = [read_json(out/name) for name in ('input.json', 'job.json', 'result.json')]
    validate_payload(p)
    errors = []
    def check(condition, message):
        if not condition:
            errors.append(message)
    check(p['kind'] == 'image', 'Static verifier cannot certify motion fidelity')
    check(canonical_sha(p) == j['input_sha256'], 'Input snapshot has changed')
    caption_hash = sha_text(p['post_media_caption'])
    check(sha_file(out/'caption.txt') == caption_hash == j['caption_sha256'] == r.get('caption_sha256'), 'Caption changed')
    for name in ('first_reply', 'attribution'):
        check((out/f'{name}.txt').read_bytes() == p.get(name, '').encode('utf-8'), f'{name} changed')
    check(r.get('job_key') == j['job_key'], 'Result belongs to another job')
    check(sha_file(out/'reference.png') == j['reference_sha256'] == r.get('reference_sha256'), 'Reference has changed')
    check(r.get('status') == 'ready_for_review', f"Not ready: status is {r.get('status')}")
    output = r.get('output', {})
    asset = (out / output.get('path', '')).resolve()
    check(asset.is_relative_to(out) and asset.is_file(), 'Output must be an existing file inside the job directory')
    if asset.is_relative_to(out) and asset.is_file():
        digest = sha_file(asset)
        check(digest == output.get('sha256') == r.get('review', {}).get('output_sha256'), 'Output or review hash is stale')
        width, height = png_size(asset)
        check((width, height) == (p['width'], p['height']) == (output.get('width'), output.get('height')), 'Output dimensions differ from the requested placement')
    for name in CHECKS:
        check(r.get('review', {}).get('checks', {}).get(name) is True, f'Visual check missing/failed: {name}')
    check(bool(r.get('review', {}).get('observations', '').strip()), 'Visual observations missing')
    check(bool(r.get('selection')) and bool(r.get('replacements')), 'Selection or replacement evidence missing')
    comparison = (out / r.get('comparison', '')).resolve()
    check(comparison.is_relative_to(out) and comparison.is_file(), 'Comparison artifact missing')
    return {'ready_for_review': not errors, 'errors': errors,
            'scope': 'File integrity and recorded review only; visual quality is not machine-certified.'}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest='command', required=True)
    search = commands.add_parser('shortlist')
    search.add_argument('--query', required=True)
    search.add_argument('--limit', type=int, default=6)
    prep = commands.add_parser('prepare')
    prep.add_argument('--payload', required=True)
    prep.add_argument('--video', required=True)
    prep.add_argument('--frame', type=int, required=True)
    prep.add_argument('--out', required=True)
    commands.add_parser('verify').add_argument('directory')
    args = parser.parse_args()
    try:
        if args.command == 'shortlist':
            result = shortlist(args.query, max(1, min(args.limit, 30)))
        elif args.command == 'prepare':
            result = prepare(args.payload, args.video, args.frame, args.out)
        else:
            result = verify(args.directory)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        return 1 if args.command == 'verify' and not result['ready_for_review'] else 0
    except (OSError, ValueError, KeyError, StopIteration, subprocess.CalledProcessError) as error:
        print(json.dumps({'status': 'blocked', 'reason': str(error)}), file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
