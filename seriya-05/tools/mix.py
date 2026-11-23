#!/usr/bin/env python3
"""Сводит голос + фон + эффекты и доводит громкость до −14 LUFS.
Фон на 19 LU тише голоса. Запуск из папки серии: python3 tools/mix.py"""
import subprocess, json, re

def lufs(path):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-i", path, "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(re.findall(r"I:\s+(-?[\d.]+) LUFS", out)[-1])

V, B, F = "audio/golos-final.wav", "audio/zvuk/fon.wav", "audio/zvuk/effekty.wav"
lv, lb, lf = lufs(V), lufs(B), lufs(F)
gb = (lv - 19) - lb            # фон: на 19 LU тише голоса
gf = (lv - 11) - lf            # эффекты: тихие, но различимые
print(f"голос {lv} LUFS | фон {lb} -> {gb:+.1f} дБ | эффекты {lf} -> {gf:+.1f} дБ")
graph = (f"[0:a]aresample=48000,pan=stereo|c0=c0|c1=c0,apad=whole_dur=72[v];"
         f"[1:a]volume={gb}dB[b];[2:a]volume={gf}dB[f];[v][b][f]amix=inputs=3:normalize=0:duration=longest,atrim=0:72[m]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", V, "-i", B, "-i", F, "-filter_complex", graph, "-map", "[m]", "audio/zvuk/_premix.wav"], check=True)
# двухпроходная нормализация громкости
ln = "loudnorm=I=-14:TP=-1.5:LRA=11"
out = subprocess.run(["ffmpeg", "-hide_banner", "-i", "audio/zvuk/_premix.wav", "-af", ln + ":print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(out[out.rindex("{"):])
ln2 = ln + f":measured_I={m['input_i']}:measured_TP={m['input_tp']}:measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/zvuk/_premix.wav", "-af", ln2, "-ar", "48000", "audio/miks.wav"], check=True)
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", "audio/miks.wav", "-b:a", "192k", "audio/miks.mp3"], check=True)
print("итог:", lufs("audio/miks.wav"), "LUFS")
