"""Génère chaque phrase de VOIX-OFF.md avec VoiceStudio (VoxCPM2), même voix pour toutes :
on clone l'extrait de référence (ref-design.wav), créé sur description."""
import json, os, re, subprocess, sys, time, pathlib, urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[2]
# Par défaut la voix créée sur description ; VOIX_OUT/VOIX_REF/VOIX_REF_TEXT pour une autre voix (ex. voix-perso)
OUT = ROOT / os.environ.get("VOIX_OUT", "voix")
REF = ROOT / os.environ.get("VOIX_REF", "voix/ref-design.wav")
REF_TEXT = os.environ.get("VOIX_REF_TEXT", "Bonjour. Coltadol répond à chaque demande WhatsApp de votre agence, de jour comme de nuit, dans la langue du prospect.")
FILMS = {"23 h 47": "coltadol-23h47", "C'est juste un chatbot": "coltadol-chatbot", "POV : 8 h": "coltadol-8h", "Une nuit": "coltadol-lancement", "Deux agences": "coltadol-deux-agences"}
VS = pathlib.Path(os.environ.get("VOICESTUDIO_DIR", "/home/user/debpalash/voicestudio"))


def backend_ok():
    try:
        return b'"ok"' in urllib.request.urlopen("http://localhost:3900/health", timeout=5).read()
    except Exception:
        return False


def ensure_backend():
    # le serveur VoiceStudio peut s'arrêter entre deux phrases : on le relance et on attend qu'il soit prêt
    if backend_ok():
        return
    print("relance de VoiceStudio", flush=True)
    subprocess.Popen(["bun", "run", "dev:api"], cwd=VS, stdout=open(OUT / "voicestudio.log", "a"), stderr=subprocess.STDOUT, start_new_session=True)
    for _ in range(90):
        time.sleep(4)
        if backend_ok():
            subprocess.run(["curl", "-s", "-X", "POST", "http://localhost:3900/engines/select", "-H", "Content-Type: application/json", "-d", '{"family":"tts","backend_id":"voxcpm2"}'], capture_output=True)
            return
    sys.exit("VoiceStudio ne redémarre pas")

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
    for attempt in range(3):
        if wav.exists():
            break
        ensure_backend()
        t0 = time.time()
        r = subprocess.run(["curl", "-s", "-o", str(wav), "-w", "%{http_code}", "-X", "POST", "http://localhost:3900/generate",
                            "-F", f"text={text}", "-F", "language=fr", "-F", f"ref_audio=@{REF}", "-F", f"ref_text={REF_TEXT}",
                            "-F", "seed=47", "-F", "engine=voxcpm2"], capture_output=True, text=True)
        if r.stdout != "200":
            print("ECHEC", film, n, r.stdout, flush=True)
            wav.unlink(missing_ok=True)
            continue
        print(f"{film} l{n:02d} {time.time()-t0:.0f}s", flush=True)
    if not wav.exists():
        continue
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(wav)], capture_output=True, text=True).stdout)
    manifest.append({"film": film, "n": n, "start": start, "end": end, "window": round(end - start, 2), "dur": round(dur, 2), "text": text, "file": str(wav.relative_to(ROOT))})
    (OUT / "manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=1))
print("FINI", len(manifest), "/", len(jobs))
