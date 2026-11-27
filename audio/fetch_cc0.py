#!/usr/bin/env python3
"""Ищет на Freesound звуки ТОЛЬКО с лицензией CC0, проверяет лицензию на странице звука
и скачивает превью (mp3 128 кбит/с). Пишет audio/sources.json.
Запуск: python3 -I audio/fetch_cc0.py <папка_для_скачивания>"""
import json, re, sys, time, urllib.parse, urllib.request, pathlib

OUT = pathlib.Path(sys.argv[1]); OUT.mkdir(parents=True, exist_ok=True)
UA = {'User-Agent': 'Mozilla/5.0 (cartoon-project sound fetcher)'}
# ключ: (запрос, мин. длительность, макс. длительность)
WANT = {
    'bed':       ('dark ambient drone', 60, 900),
    'wind':      ('wind howling', 20, 600),
    'rain':      ('rain heavy', 20, 600),
    'river':     ('river water flowing', 15, 600),
    'steps':     ('footsteps concrete', 3, 60),
    'creak':     ('metal creak', 1, 20),
    'door':      ('heavy metal door', 1, 15),
    'fire':      ('fire crackling', 10, 300),
    'whoosh':    ('fire whoosh ignite', .5, 8),
    'lighter':   ('lighter flick', .3, 6),
    'growl':     ('monster growl', 1, 15),
    'roar':      ('deep monster roar', 2, 20),
    'splash':    ('big splash water', 1, 15),
    'hum':       ('fluorescent light hum', 5, 300),
    'buzz':      ('electric buzz flicker', .5, 15),
    'beep':      ('access granted beep', .2, 4),
    'valve':     ('valve wheel squeak', 1, 20),
    'vibrate':   ('phone vibrate', .5, 10),
    'alarm':     ('fire alarm bell', 3, 60),
    'sprinkler': ('water spray hiss', 3, 60),
    'pump':      ('machine hum industrial', 5, 300),
    'bubbles':   ('underwater bubbles', 3, 120),
    'heartbeat': ('heartbeat slow', 3, 60),
    'scratch':   ('claw scratch', .3, 8),
    'thud':      ('body fall thud', .3, 6),
    'lullaby':   ('music box lullaby', 8, 120),
    'engine':    ('car engine idle', 3, 60),
    'cardoor':   ('car door close', .3, 4),
}

def get(url):
    for i in range(4):
        try:
            return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30).read()
        except Exception as e:
            time.sleep(2 ** i)
    raise RuntimeError('не скачалось: ' + url)

SRC = pathlib.Path(__file__).with_name('sources.json')
sources = json.loads(SRC.read_text()) if SRC.exists() else {}
# переопределения: key="запрос" — искать заново только эти
over = dict(a.split('=', 1) for a in sys.argv[2:])
todo = {k: ((over[k],) + WANT[k][1:]) for k in over} if over else WANT
BAD = re.compile(r'robot|car ?crash|hair|denied|bottle|thunder|forest|bird', re.I)
for key, (q, dmin, dmax) in todo.items():
    url = 'https://freesound.org/search/?' + urllib.parse.urlencode({'q': q, 'f': 'license:"Creative Commons 0"', 's': 'Downloads (most first)'})
    html = get(url).decode('utf-8', 'replace')
    links = list(dict.fromkeys(re.findall(r'href="(/people/[^/"]+/sounds/\d+/)"', html)))
    pick = None
    for link in links[:12]:
        page = get('https://freesound.org' + link).decode('utf-8', 'replace')
        if 'creativecommons.org/publicdomain/zero/1.0' not in page:
            continue  # не CC0 — пропускаем
        dur = re.search(r'data-duration="([\d.]+)"', page)
        dur = float(dur.group(1)) if dur else 0
        if not (dmin <= dur <= dmax) or BAD.search(page[page.find('og:title'):page.find('og:title') + 200]):
            continue
        mp3 = re.search(r'https://cdn\.freesound\.org/previews/[^"]+-hq\.mp3', page)
        title = re.search(r'og:title" content="([^"]*)"', page)
        if not mp3:
            continue
        pick = {'key': key, 'query': q, 'title': title.group(1) if title else '', 'page': 'https://freesound.org' + link,
                'file': mp3.group(0), 'duration': round(dur, 2), 'license': 'CC0 1.0 (https://creativecommons.org/publicdomain/zero/1.0/)'}
        break
    if not pick:
        print('НЕ НАЙДЕНО:', key, q); continue
    (OUT / f'{key}.mp3').write_bytes(get(pick['file']))
    sources[key] = pick
    print(f"{key:10} {pick['duration']:7.1f}s  {pick['title']}  {pick['page']}")
    time.sleep(1)

SRC.write_text(json.dumps(sources, ensure_ascii=False, indent=1))
