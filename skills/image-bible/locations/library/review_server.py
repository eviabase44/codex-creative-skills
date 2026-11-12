#!/usr/bin/env python3
"""Local reference review; decisions are shared with the Image Bible skill."""
import argparse
import json
import os
from pathlib import Path
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlsplit
from datetime import datetime, timezone
from threading import Lock

ROOT = Path(__file__).resolve().parent
LOCK = Lock()
STATE = ROOT / 'review-state.json'

def read_state():
    return json.loads(STATE.read_text()) if STATE.exists() else {'schemaVersion': 1, 'decisions': {}}

def atomic_json(path, value):
    tmp = path.with_suffix(path.suffix + '.tmp')
    tmp.write_text(json.dumps(value, ensure_ascii=False, indent=2) + '\n')
    os.replace(tmp, path)

def save_decision(key, status, note):
    manifest = json.loads((ROOT / 'manifest.json').read_text())
    if key not in {r['imageKey'] for r in manifest['references']}:
        raise ValueError('Unknown reference')
    if status not in ('unreviewed', 'keep', 'reject'):
        raise ValueError('Invalid review status')
    with LOCK:
        state = read_state()
        state['decisions'][key] = {'status': status, 'note': str(note)[:1000], 'updatedAt': datetime.now(timezone.utc).isoformat()}
        atomic_json(STATE, state)
    return state

class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        self.send_header('X-Content-Type-Options', 'nosniff')
        super().end_headers()

    def json_response(self, value, code=200):
        data = json.dumps(value).encode()
        self.send_response(code)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Content-Length', str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):
        if urlsplit(self.path).path == '/api/info':
            return self.json_response({'collectionId': 'image-bible-locations-2026-10-29'})
        if urlsplit(self.path).path == '/api/state':
            return self.json_response(read_state())
        return super().do_GET()

    def do_POST(self):
        if self.path != '/api/decision':
            return self.json_response({'error': 'Not found'}, 404)
        origin = self.headers.get('Origin')
        if origin and origin != 'http://' + self.headers.get('Host', ''):
            return self.json_response({'error': 'Invalid origin'}, 403)
        if self.headers.get('Content-Type') != 'application/json':
            return self.json_response({'error': 'JSON required'}, 415)
        try:
            length = int(self.headers.get('Content-Length', '0'))
            if length < 1 or length > 12000:
                raise ValueError('Invalid body length')
            data = json.loads(self.rfile.read(length))
            return self.json_response(save_decision(data['imageKey'], data['status'], data.get('note', '')))
        except (ValueError, KeyError) as error:
            return self.json_response({'error': str(error)}, 400)
        except OSError as error:
            return self.json_response({'error': 'Could not save to disk: ' + str(error)}, 500)

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--port', type=int, default=8766)
    args = parser.parse_args()
    server = ThreadingHTTPServer(('127.0.0.1', args.port), Handler)
    url = f'http://127.0.0.1:{server.server_port}/'
    atomic_json(ROOT / 'server-url.json', {'url': url})
    print(f'Location Bible review: {url}', flush=True)
    server.serve_forever()
