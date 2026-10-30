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
    total = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(src)], capture_output=True, text=True).stdout)
    cursor = 0.0
    for k, m in enumerate(lines):
        inputs += ["-i", str(ROOT / m["file"])]
        # une phrase peut déborder de sa fenêtre jusqu'à la phrase suivante ; si elle la chevaucherait,
        # elle est accélérée (au plus ×1,2, sans changer la hauteur), puis la suivante attend qu'elle finisse
        start = max(m["start"], cursor)
        nxt = lines[k + 1]["start"] if k + 1 < len(lines) else total - 0.3
        tempo = min(1.2, max(1.0, m["dur"] / max(0.1, nxt - 0.15 - start)))
        cursor = start + m["dur"] / tempo + 0.15
        print(f"  {film} l{m['n']:02d} à {start:.2f} s, ×{tempo:.2f}, fin {cursor - 0.15:.2f} s")
        ms = int(start * 1000)
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
