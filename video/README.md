# Олег Тиньков — анимированная документальная история (9:16)

Вертикальное видео 1080×1920, 30 fps, ~2:00, H.264 + AAC. Тёмная неоновая motion graphics в стиле
финансового расследования: глобус с маршрутами, счётчики, графики, UI-карточки, документы и штампы,
субтитры-караоке пословно.

* Готовый ролик: `out/tinkov_documentary.mp4`
* Раскадровка с таймкодами: [`STORYBOARD.md`](STORYBOARD.md)
* Сценарий и проверка фактов: [`SCRIPT.md`](SCRIPT.md)

## Конвейер

```
script/voiceover.json ──tts.py──▶ public/audio/vo/*.mp3 + script/align/*.json (посимвольные таймкоды ElevenLabs)
                      ──build_timeline.py──▶ src/data/timeline.json (слова с таймкодами, темп ×1.05, паузы)
src/data/shots.json (шоты привязаны к словам диктора) ──▶ Remotion-сцены (src/scenes/*)
                      ──sound.py──▶ музыка + SFX по тем же меткам, дакинг под голос, −14 LUFS → public/audio/master.wav
remotion render ──▶ MP4
```

## Команды

```bash
npm install
python3 script/tts.py [id ...]       # озвучка (ElevenLabs, голос Brian, eleven_multilingual_v2)
python3 script/build_timeline.py     # таймлайн слов
python3 script/shots.py              # печать раскадровки (проверка привязки шотов)
python3 script/sound.py              # музыка/SFX/сведение (нужны numpy, scipy)
npm run studio                       # Remotion Studio — правка сцен в браузере
npm run render                       # финальный рендер в out/tinkov.mp4
```

## Как редактировать

* **Текст/озвучка** — `script/voiceover.json`, затем `tts.py <id>` → `build_timeline.py` → `sound.py`. Все шоты и
  эффекты сами сдвинутся, потому что привязаны к словам, а не к секундам.
* **Монтаж** — `src/data/shots.json`: `cue` — слово, на котором начинается шот (`n` — номер вхождения),
  `scene` — компонент, `chapter` — титр главы, `sfx` — пары `[тип, слово]`.
* **Сцены** — `src/scenes/hook.tsx`, `ch1.tsx` … `ch6.tsx`. Внутри сцены `cue("слово")` возвращает кадр,
  на котором диктор произносит это слово, поэтому анимации синхронны с речью.
* **Общие элементы** — `src/components/` (фон, HUD, глобус на d3-geo, субтитры, примитивы анимации, иконки).
* **Палитра/шрифты** — `src/theme.ts` (Unbounded / Inter / JetBrains Mono, с кириллицей, из @fontsource).
* Стемы для внешнего монтажа: `public/audio/stem_vo.wav`, `stem_music.wav`, `stem_sfx.wav`.
