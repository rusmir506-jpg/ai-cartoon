"""Generate voiceover segments with ElevenLabs (char-level timestamps for sync)."""
import json, base64, sys, urllib.request, os
VOICE = "nPczCjzI2devNBz1zQrb"  # Brian - deep, resonant
segs = json.load(open("script/voiceover.json"))
only = set(sys.argv[1:])
for i, s in enumerate(segs):
    if only and s["id"] not in only: continue
    body = {
        "text": s["text"], "model_id": "eleven_multilingual_v2",
        "voice_settings": {"stability": 0.55, "similarity_boost": 0.8, "style": 0.25, "use_speaker_boost": True, "speed": 1.0},
        "previous_text": segs[i-1]["text"] if i else None,
        "next_text": segs[i+1]["text"] if i+1 < len(segs) else None,
    }
    req = urllib.request.Request(
        f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE}/with-timestamps?output_format=mp3_44100_128",
        data=json.dumps(body).encode(), headers={"xi-api-key": "dummy", "Content-Type": "application/json"})
    r = json.load(urllib.request.urlopen(req))
    open(f"public/audio/vo/{s['id']}.mp3", "wb").write(base64.b64decode(r["audio_base64"]))
    json.dump(r["alignment"], open(f"script/align/{s['id']}.json", "w"), ensure_ascii=False)
    print(s["id"], "ok", r["alignment"]["character_end_times_seconds"][-1])
