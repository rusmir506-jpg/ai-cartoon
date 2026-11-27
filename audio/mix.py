#!/usr/bin/env python3
"""Сведение звука серии: голос + тихий мрачный фон (на 19 дБ тише голоса) + эмбиенс + редкие эффекты.
Итог: громкость −14 LUFS, пик −1.5 dBTP, и сборка финального MP4.
Запуск: python3 audio/mix.py <номер серии 1|2|3> <папка CC0-звуков> <рабочая папка>"""
import json, re, subprocess, sys, pathlib

EP = int(sys.argv[1]); CC0 = pathlib.Path(sys.argv[2]); WORK = pathlib.Path(sys.argv[3]); WORK.mkdir(parents=True, exist_ok=True)
ROOT = pathlib.Path(__file__).resolve().parent.parent
EPD = ROOT / f'ep0{EP}'
VOICE_LUFS = -16.0
BED_LUFS = VOICE_LUFS - 19      # фон на 19 дБ тише голоса
AMB_LUFS = VOICE_LUFS - 22      # ветер/дождь/гул — ещё тише
SFX_LUFS = VOICE_LUFS - 12      # редкие эффекты, короткие и тихие (громкость короткого звука ощущается меньше)
BASE = -23.0                    # все CC0-файлы заранее приводятся к −23 LUFS

def run(*a): subprocess.run(a, check=True)
def dur(f): return float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(f)]))

# ---- время слов ----
WORDS = json.loads((EPD / 'words.json').read_text())
norm = lambda w: re.sub(r'[^а-яёa-z]', '', w.lower())
LINES = {}
for w in WORDS: LINES.setdefault(w['line'], []).append(w)
def W(line, stem, k=0, end=False):
    m = [w for w in LINES[line] if stem in norm(w['w'])]
    w = m[min(k, len(m) - 1)]
    return w['e'] if end else w['s']
LS = [LINES[i][0]['s'] - .12 if i else 0 for i in range(len(LINES))]
VIDEO = EPD / 'preview_step4.mp4'
TOTAL = dur(VIDEO)
LE = LS[1:] + [TOTAL]

# ---- подготовка CC0-файлов: −23 LUFS, стерео 44.1 кГц ----
N = WORK / 'norm'; N.mkdir(exist_ok=True)
def prep(key):
    out = N / f'{key}.wav'
    if not out.exists():
        run('ffmpeg', '-loglevel', 'error', '-y', '-i', str(CC0 / f'{key}.mp3'), '-af', f'loudnorm=I={BASE}:TP=-2:LRA=11,aresample=44100', '-ac', '2', str(out))
    return out

cues = []  # (key, start, length, lufs, fade_in, fade_out, loop)
def amb(key, t0, t1, lufs=AMB_LUFS, fi=.6, fo=.8): cues.append((key, max(0, t0), max(.1, t1 - t0), lufs, fi, fo, True))
def sfx(key, t, lufs=SFX_LUFS, length=None, fo=.15): cues.append((key, max(0, t), length, lufs, .01, fo, False))

# ---- партитура серий ----
if EP == 1:
    amb('river', 0, LE[1]); amb('rain', 0, LE[2], AMB_LUFS - 2); amb('wind', LS[2], LE[2] + .5)
    amb('hum', LS[3], LE[3]); amb('bubbles', LS[4], LE[4], AMB_LUFS + 2)
    amb('hum', LS[5], LE[12], AMB_LUFS - 2); amb('pump', LS[10], LE[12], AMB_LUFS - 3)
    amb('fire', W(13, 'огонь') - .1, LE[16], AMB_LUFS + 3)
    amb('river', LS[17], TOTAL - .5); amb('rain', LS[17], TOTAL - .5, AMB_LUFS - 2); amb('wind', LS[17], TOTAL - .5, AMB_LUFS - 3)
    sfx('bubbles', W(0, 'смотрит') - .2, length=1.5)
    sfx('beep', W(1, 'потерял'), length=.6)
    amb('steps', LS[2] + .2, W(2, 'дыру'), AMB_LUFS + 4, .2, .3); sfx('creak', W(2, 'дыру'), length=1.6)
    sfx('growl', W(6, 'шерст'), SFX_LUFS - 4)
    sfx('thud', W(7, 'спрыгн') + .3); sfx('growl', W(7, 'коготь') - .1)
    sfx('thud', W(8, 'ноготь'), SFX_LUFS - 6, length=.4)
    sfx('beep', W(9, 'открыл'), length=.5); sfx('door', W(9, 'открыл') + .3)
    sfx('lighter', W(13, 'щелч')); sfx('whoosh', W(13, 'огонь') - .1); sfx('roar', W(13, 'огонь') + .4, SFX_LUFS - 3, length=3)
    sfx('creak', W(14, 'отогнула'), length=2.5)
    for k, s in enumerate(['один', 'другим', 'замолк']): sfx('thud', W(15, s), SFX_LUFS - 4, length=.6)
    sfx('bubbles', W(17, 'спала') - .3, length=2)
    sfx('roar', W(18, 'поднимал'), SFX_LUFS - 2, length=4, fo=1.5); sfx('splash', W(18, 'больше'), SFX_LUFS - 1)
    amb('heartbeat', W(18, 'моста'), TOTAL - .3, AMB_LUFS + 4, .3, 1)
elif EP == 2:
    amb('river', 0, LE[3]); amb('rain', 0, LE[4], AMB_LUFS - 2); amb('wind', 0, LE[4], AMB_LUFS - 3)
    sfx('roar', .4, SFX_LUFS - 5, length=4, fo=1.5); sfx('growl', W(1, 'принюх'), SFX_LUFS - 6)
    amb('fire', LS[2], LE[2], AMB_LUFS - 2)
    amb('steps', LS[3] + .2, W(3, 'пацан'), AMB_LUFS + 4, .1, .3)
    sfx('beep', W(4, 'открыл'), length=.5); sfx('door', W(4, 'дверь'))
    amb('hum', LS[5], LE[10], AMB_LUFS - 2); sfx('lighter', W(5, 'зажигалка'))
    sfx('creak', W(6, 'прикипел'), SFX_LUFS - 4, length=1.5); sfx('valve', W(6, 'повернулся') - .1, length=2.5)
    for k in range(5): sfx('thud', W(8, 'шаги') + k * .55, SFX_LUFS - 7, length=.5)
    sfx('growl', W(8, 'шерсти'), SFX_LUFS - 6)
    for d in (0, .3, .6): sfx('thud', W(10, 'открыл') + d, SFX_LUFS - 5, length=.4)
    amb('pump', W(10, 'открыл'), LE[10], AMB_LUFS + 2, .3, .5)
    amb('river', LS[11], LE[11]); sfx('roar', W(11, 'дёрнулся') - .1, SFX_LUFS - 2, length=3, fo=1); sfx('splash', W(11, 'оседать'), SFX_LUFS - 2)
    amb('bubbles', W(11, 'оседать') + .4, LE[11], AMB_LUFS)
    amb('hum', LS[12], LE[15], AMB_LUFS - 4); amb('sprinkler', LS[12], LE[12], AMB_LUFS - 2)
    sfx('thud', W(14, 'легла') + .2, SFX_LUFS - 4)
    sfx('vibrate', W(16, 'завибрир'))
    amb('heartbeat', LS[17], TOTAL - .3, AMB_LUFS + 4, .5, 1)
elif EP == 3:
    amb('rain', 0, LE[0], AMB_LUFS - 4); amb('wind', 0, LE[2])
    amb('steps', LS[2] + .2, LE[3], AMB_LUFS + 2, .2, .3); amb('hum', LS[3], LE[13], AMB_LUFS - 2)
    sfx('beep', W(4, 'открыл'), length=.5); sfx('door', W(4, 'открыл') + .3)
    sfx('buzz', W(5, 'орлов'), SFX_LUFS - 6, length=1.5)
    amb('bubbles', LS[6], LE[12], AMB_LUFS - 2)
    sfx('creak', W(9, 'отдёрнул'), SFX_LUFS - 6, length=1.2)
    amb('heartbeat', LS[10], LE[11], AMB_LUFS + 2, .5, .8)
    sfx('lighter', W(14, 'щелчок'))
    amb('alarm', W(14, 'сирена'), LE[16], AMB_LUFS + 5, .05, .6); amb('sprinkler', W(14, 'сирена') + .3, LE[16], AMB_LUFS)
    for d in (0, .12, .24): sfx('door', W(14, 'замки') + d, SFX_LUFS - 4, length=.5)
    sfx('thud', W(15, 'отодвинула') + .2, SFX_LUFS - 3)
    amb('wind', LS[17], TOTAL - .3)
    sfx('growl', W(18, 'них'), SFX_LUFS - 8, length=2, fo=1)
    amb('heartbeat', W(18, 'зелён') - .3, TOTAL - .3, AMB_LUFS + 4, .3, 1)

elif EP == 4:
    amb('river', 0, LE[3], AMB_LUFS - 3); amb('wind', 0, LE[0], AMB_LUFS - 4)
    sfx('heartbeat', W(0, 'имени') - .3, AMB_LUFS + 2, length=3, fo=1)
    amb('river', LS[4], LE[4], AMB_LUFS - 2); amb('steps', W(4, 'повела'), LE[4], AMB_LUFS + 2, .2, .3)
    amb('hum', LS[5], LE[5], AMB_LUFS - 4)
    amb('river', LS[6], TOTAL - .5, AMB_LUFS - 2)
    sfx('creak', W(6, 'заскрип'), SFX_LUFS - 3, length=2.5, fo=.8); sfx('bubbles', W(6, 'открывались'), SFX_LUFS - 6, length=2)
    sfx('lighter', W(7, 'щёлкнул')); sfx('growl', W(7, 'пугал'), SFX_LUFS - 7, length=2, fo=.8)
    amb('steps', LS[8] + .2, W(8, 'встала') + .3, AMB_LUFS, .1, .3); sfx('growl', W(8, 'рекой'), SFX_LUFS - 5)
    amb('lullaby', W(9, 'запела'), LE[12], AMB_LUFS + 3, 1.0, 1.5)
    sfx('thud', W(10, 'легла') + .3, SFX_LUFS - 6)
    sfx('splash', W(13, 'вылила') + .5, SFX_LUFS - 8, length=1.2)
    sfx('bubbles', LS[15], SFX_LUFS - 6, length=3, fo=1)
    amb('engine', LS[16], LE[16], AMB_LUFS + 1, .8, .4); sfx('cardoor', W(17, 'вышел') - .2, SFX_LUFS - 3)
    amb('heartbeat', W(17, 'улыбнулся') - .3, TOTAL - .3, AMB_LUFS + 4, .3, 1)

# ---- голос: −16 LUFS ----
voice = WORK / f'voice{EP}.wav'
run('ffmpeg', '-loglevel', 'error', '-y', '-i', str(EPD / 'voice_harry.mp3'), '-af', f'loudnorm=I={VOICE_LUFS}:TP=-2:LRA=11,aresample=44100', '-ac', '2', str(voice))

# ---- граф ffmpeg ----
inputs = ['-i', str(voice), '-stream_loop', '-1', '-i', str(prep('bed'))]
chains = [f'[1:a]atrim=0:{TOTAL},asetpts=N/SR/TB,volume={BED_LUFS - BASE}dB,afade=t=in:d=1.5,afade=t=out:st={TOTAL - 2.5}:d=2.5[bed]']
labels = ['[0:a]', '[bed]']
for i, (key, t, length, lufs, fi, fo, loop) in enumerate(cues):
    f = prep(key); n = len(inputs) // 2 if False else None
    if loop: inputs += ['-stream_loop', '-1']
    inputs += ['-i', str(f)]
    idx = sum(1 for x in inputs if x == '-i') - 1
    L = length if length else dur(f)
    L = min(L, TOTAL - t)
    chains.append(f'[{idx}:a]atrim=0:{L:.3f},asetpts=N/SR/TB,volume={lufs - BASE:.1f}dB,afade=t=in:d={fi},afade=t=out:st={max(0, L - fo):.3f}:d={fo},adelay={int(t * 1000)}|{int(t * 1000)}[c{i}]')
    labels.append(f'[c{i}]')
chains.append(f'{"".join(labels)}amix=inputs={len(labels)}:normalize=0:duration=first,apad,atrim=0:{TOTAL}[mix]')
pre = WORK / f'premix{EP}.wav'
run('ffmpeg', '-loglevel', 'error', '-y', *inputs, '-filter_complex', ';'.join(chains), '-map', '[mix]', '-ar', '44100', str(pre))

# ---- громкость −14 LUFS (два прохода loudnorm) ----
st = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(pre), '-af', 'loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
m = json.loads(st[st.rindex('{'):st.rindex('}') + 1])
fin = WORK / f'final{EP}.wav'
run('ffmpeg', '-loglevel', 'error', '-y', '-i', str(pre), '-af',
    f"loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true,aresample=44100", str(fin))
names = {1: 'Завод', 2: 'Мост', 3: 'Кафедра', 4: 'Колыбельная'}
out = EPD / f'ГИГАНТСКИЕ_МУТАНТЫ_серия_{EP}_{names[EP]}.mp4'
run('ffmpeg', '-loglevel', 'error', '-y', '-i', str(VIDEO), '-i', str(fin), '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-t', f'{TOTAL}', '-movflags', '+faststart', str(out))
chk = subprocess.run(['ffmpeg', '-hide_banner', '-i', str(out), '-af', 'loudnorm=print_format=json', '-f', 'null', '-'], capture_output=True, text=True).stderr
c = json.loads(chk[chk.rindex('{'):chk.rindex('}') + 1])
print(f'серия {EP}: {out.name}  {TOTAL:.1f} с  громкость {c["input_i"]} LUFS  пик {c["input_tp"]} dBTP  эффектов: {len(cues)}')
