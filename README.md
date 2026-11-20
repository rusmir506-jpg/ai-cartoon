# ai-cartoon

## InVoyage × Alila Seminyak — 27 s vertical reel

- `build.py` — assembles the reel from `footage/` (see `footage/README.md`), captions, brand ending and audio.
- `make_overlays.js` — renders caption layers and the InVoyage end card (`overlays/`).
- `make_music.py` — synthesises the lounge bed, bar-aligned to the picture cuts (`audio/music.wav`).
- `audio/vo*.mp3` — Russian female voice-over lines (ElevenLabs).

```
python3 build.py          # out/invoyage_alila_seminyak.mp4 (1080x1920, 30 fps, 27.000 s)
python3 build.py --4k     # 2160x3840
python3 build.py --no-vo  # music only
```

### Next hotel of the week
`hotels/<name>/config.json` holds captions and voice-over lines. Then:
```
node make_overlays.js hotels/<name>/config.json
python3 gen_vo.py hotels/<name>/config.json
# put real footage in hotels/<name>/footage/ (see its README.md)
python3 build.py --hotel <name>
```
