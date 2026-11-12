#!/usr/bin/env python3
import json
import subprocess
import sys
import time
import urllib.request
import webbrowser
from pathlib import Path

root = Path(__file__).resolve().parent
url_file = root / 'server-url.json'

def running_url():
    try:
        url = json.loads(url_file.read_text())['url']
        with urllib.request.urlopen(url + 'api/info', timeout=1) as response:
            if json.load(response).get('collectionId') == 'image-bible-locations-2026-10-29':
                return url
    except (OSError, ValueError, KeyError):
        return None

url = running_url()
if not url:
    with (root / 'server.log').open('a') as log:
        subprocess.Popen([sys.executable, str(root / 'review_server.py'), '--port', '0'], stdin=subprocess.DEVNULL, stdout=log, stderr=log, start_new_session=True)
    for _ in range(40):
        time.sleep(.1)
        url = running_url()
        if url:
            break
if not url:
    raise SystemExit('The review server could not start. See server.log in this folder.')
print(url)
if '--open' in sys.argv:
    webbrowser.open(url)
