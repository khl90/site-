#!/usr/bin/env node
/*
  Final deliverables from the silent render and the soundtrack, written to
  out/ and copied to export/ (the versioned deliverables):

    coltadol-reel.mp4        picture + sound (AAC 192 k, −14 LUFS: the level
                             Instagram, TikTok and YouTube normalise to)
    coltadol-silent.mp4      picture only, to post with a trending sound
    coltadol-poster.jpg      the end card, for a cover / thumbnail
    coltadol-storyboard.jpg  12 frames of the film on one sheet
*/
import { execFileSync, spawnSync } from "node:child_process"
import { copyFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const out = (f) => resolve(ROOT, "out", f)
const ff = (...a) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" })

/** Integrated loudness (LUFS) and true peak (dBFS), from FFmpeg's EBU R128 summary. */
function measure(file) {
  const log = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr.toString()
  const summary = log.slice(log.lastIndexOf("Summary:"))
  return { I: Number(summary.match(/I:\s+(-?[\d.]+) LUFS/)[1]), peak: Number(summary.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]) }
}

// −14 LUFS: a static gain, then a limiter so peaks stay under −1.5 dBFS.
const before = measure(out("soundtrack.wav"))
const gain = -14 - before.I
ff(
  "-i", out("coltadol-silent.mp4"), "-i", out("soundtrack.wav"),
  "-map", "0:v", "-map", "1:a", "-c:v", "copy",
  "-af", `volume=${gain.toFixed(2)}dB,alimiter=limit=0.8:attack=1:release=50:level=disabled`, "-ar", "48000", "-c:a", "aac", "-b:a", "192k",
  "-shortest", "-movflags", "+faststart", out("coltadol-reel.mp4")
)
const after = measure(out("coltadol-reel.mp4"))
console.log(`audio: ${before.I} LUFS → ${after.I} LUFS, true peak ${after.peak} dBFS`)
ff("-ss", "27.4", "-i", out("coltadol-silent.mp4"), "-frames:v", "1", "-q:v", "2", out("coltadol-poster.jpg"))
const times = [1.7, 3.7, 5.0, 7.6, 9.0, 12.0, 14.3, 17.2, 20.0, 23.3, 25.4, 27.6]
ff(
  ...times.flatMap((t) => ["-ss", String(t), "-i", out("coltadol-silent.mp4")]),
  "-filter_complex",
  times.map((_, i) => `[${i}:v]trim=end_frame=1,scale=360:640[v${i}]`).join(";") + ";" + times.map((_, i) => `[v${i}]`).join("") + `xstack=inputs=${times.length}:layout=${times.map((_, i) => `${(i % 6) * 360}_${Math.floor(i / 6) * 640}`).join("|")}`,
  "-frames:v", "1", "-q:v", "3", out("coltadol-storyboard.jpg")
)
mkdirSync(resolve(ROOT, "export"), { recursive: true })
for (const f of ["coltadol-reel.mp4", "coltadol-silent.mp4", "coltadol-poster.jpg", "coltadol-storyboard.jpg"]) copyFileSync(out(f), resolve(ROOT, "export", f))
console.log("done → export/coltadol-reel.mp4, coltadol-silent.mp4, coltadol-poster.jpg, coltadol-storyboard.jpg")
