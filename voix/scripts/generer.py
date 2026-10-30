"""Génère chaque phrase de VOIX-OFF.md avec VoiceStudio (VoxCPM2), même voix pour toutes :
on clone l'extrait de référence (ref-design.wav), créé sur description."""
import json, re, subprocess, sys, time, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
OUT = ROOT / "voix"
REF = OUT / "ref-design.wav"
REF_TEXT = "Bonjour. Coltadol répond à chaque demande WhatsApp de votre agence, de jour comme de nuit, dans la langue du prospect."
FILMS = {"23 h 47": "coltadol-23h47", "C'est juste un chatbot": "coltadol-chatbot", "POV : 8 h": "coltadol-8h", "Une nuit": "coltadol-lancement"}

md = (ROOT / "VOIX-OFF.md").read_text()
jobs = []
for sec in md.split("\n## ")[1:]:
    film = next(v for k, v in FILMS.items() if k in sec.splitlines()[0])
    for i, m in enumerate(re.finditer(r"^\| ([\d,]+) s \| ([\d,]+) s \| (.+?) \|$", sec, re.M)):
        jobs.append((film, i + 1, float(m[1].replace(",", ".")), float(m[2].replace(",", ".")), m[3]))

manifest = []
for film, n, start, end, text in jobs:
    d = OUT / film
    d.mkdir(parents=True, exist_ok=True)
    wav = d / f"l{n:02d}.wav"
    if not wav.exists():
        t0 = time.time()
        r = subprocess.run(["curl", "-s", "-o", str(wav), "-w", "%{http_code}", "-X", "POST", "http://localhost:3900/generate",
                            "-F", f"text={text}", "-F", "language=fr", "-F", f"ref_audio=@{REF}", "-F", f"ref_text={REF_TEXT}",
                            "-F", "seed=47", "-F", "engine=voxcpm2"], capture_output=True, text=True)
        if r.stdout != "200":
            print("ECHEC", film, n, r.stdout, wav.read_text()[:300] if wav.exists() else "", flush=True)
            wav.unlink(missing_ok=True)
            continue
        print(f"{film} l{n:02d} {time.time()-t0:.0f}s", flush=True)
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    manifest.append({"film": film, "n": n, "start": start, "end": end, "window": round(end - start, 2), "dur": round(dur, 2), "text": text, "file": str(wav.relative_to(ROOT))})
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
print("FINI", len(manifest), "/", len(jobs))
