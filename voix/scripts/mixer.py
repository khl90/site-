"""Pose les voix générées sur chaque vidéo : chaque phrase à son temps, les effets baissés
sous la voix (sidechain), le tout normalisé à −14 LUFS. Écrit export/<film>-voix.mp4."""
import json, subprocess, pathlib, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
VIDEOS = {
    "coltadol-23h47": "coltadol-23h47/export/coltadol-23h47.mp4",
    "coltadol-chatbot": "coltadol-chatbot/export/coltadol-chatbot.mp4",
    "coltadol-8h": "coltadol-8h/export/coltadol-8h.mp4",
    "coltadol-lancement": "coltadol-lancement/export/coltadol-lancement-16x9.mp4",
}
man = json.loads((ROOT / "voix/manifest.json").read_text())
only = sys.argv[1:]
for film, video in VIDEOS.items():
    if only and film not in only:
        continue
    lines = [m for m in man if m["film"] == film]
    if not lines:
        continue
    src = ROOT / video
    out = src.with_name(src.stem + "-voix.mp4")
    inputs = ["-i", str(src)]
    chains = []
    for k, m in enumerate(lines):
        inputs += ["-i", str(ROOT / m["file"])]
        # une phrase plus longue que sa fenêtre est accélérée (au plus ×1,15, sans changer la hauteur)
        tempo = min(1.15, max(1.0, m["dur"] / max(0.1, m["window"])))
        ms = int(m["start"] * 1000)
        chains.append(f"[{k+1}:a]aresample=48000,aformat=channel_layouts=stereo,atempo={tempo:.3f},adelay={ms}|{ms}[v{k}]")
    n = len(lines)
    graph = ";".join(chains)
    graph += ";" + "".join(f"[v{k}]" for k in range(n)) + f"amix=inputs={n}:normalize=0,asplit=2[voix][sc]"
    graph += ";[0:a]aresample=48000,volume=0.8[fx];[fx][sc]sidechaincompress=threshold=0.03:ratio=6:attack=20:release=300[fxd]"
    graph += ";[voix][fxd]amix=inputs=2:normalize=0,loudnorm=I=-14:TP=-1.5:LRA=11,aresample=48000[a]"
    cmd = ["ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", graph, "-map", "0:v", "-map", "[a]",
           "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", "-shortest", str(out)]
    subprocess.run(cmd, check=True)
    print("ok", out.relative_to(ROOT))
