#!/usr/bin/env node
/*
  The voice-over version: export/coltadol-reel-voix.mp4.

    node scripts/voiceover.mjs

  The ten lines in assets/voice/ were synthesised locally and for free with
  Piper (open source) and its French voice "siwis" (CC-BY 4.0), then checked
  with a speech-to-text pass so every word, the brand included, is heard as
  written. Each line is placed on the shot it speaks over (times from
  src/timeline.js); the music and sound design duck under the voice, and the
  mix is brought to −14 LUFS with a limiter.
*/
import { execFileSync, spawnSync } from "node:child_process"
import { readFileSync, mkdirSync, copyFileSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ctx = {}
vm.createContext(ctx)
vm.runInContext(readFileSync(resolve(ROOT, "src/timeline.js"), "utf8") + "\nthis.__ = { T }", ctx)
const { T } = ctx.__

// [start (s), file, text] — each line lands on its shot.
const LINES = [
  [0.15, "vo01", "Vingt-trois heures quarante-sept. Agence fermée."],
  [T.l1 + 0.2, "vo02", "Ils écrivent à toute heure."],
  [T.l2 + 0.25, "vo03", "Leurs besoins s'éparpillent."],
  [T.l3 + 0.2, "vo04", "Et des prospects s'oublient."],
  [T.turnTitle, "vo05", "Coltadol répond. À chaque demande."],
  [T.msgs.b1 - 0.05, "vo06", "Chaque conversation devient un prospect qualifié."],
  [T.console + 0.3, "vo07", "Tous vos prospects, classés et suivis."],
  [T.rPanel + 0.05, "vo08", "Les silences deviennent des relances. Rien ne part sans vous."],
  [T.roll + 0.3, "vo09", "Chaque matin, vous savez qui appeler."],
  [T.lockup + 0.2, "vo10", "Coltadol. Votre responsable commercial IA."],
]

const out = (f) => resolve(ROOT, "out", f)
const ff = (...a) => execFileSync("ffmpeg", ["-nostdin", "-hide_banner", "-loglevel", "error", "-y", ...a], { stdio: "inherit" })
function loudness(file) {
  const log = spawnSync("ffmpeg", ["-nostdin", "-hide_banner", "-nostats", "-i", file, "-af", "ebur128=peak=true", "-f", "null", "-"]).stderr.toString()
  const s = log.slice(log.lastIndexOf("Summary:"))
  return { I: Number(s.match(/I:\s+(-?[\d.]+) LUFS/)[1]), peak: Number(s.match(/Peak:\s+(-?[\d.]+) dBFS/)[1]) }
}

// 1. The voice track: lines on their marks, cleaned up and evened out.
const inputs = LINES.flatMap(([, f]) => ["-i", resolve(ROOT, "assets/voice", `${f}.wav`)])
const delays = LINES.map(([t], i) => `[${i}]adelay=${Math.round(t * 1000)}:all=1[d${i}]`).join(";")
const voiceChain = "highpass=f=90,equalizer=f=250:t=q:w=1:g=-2,equalizer=f=3200:t=q:w=1.2:g=2.5,acompressor=threshold=-22dB:ratio=3:attack=4:release=90:makeup=3dB,aecho=0.85:0.6:28|52:0.08|0.05"
ff(...inputs, "-filter_complex", `${delays};${LINES.map((_, i) => `[d${i}]`).join("")}amix=inputs=${LINES.length}:normalize=0,${voiceChain},apad=whole_dur=${T.end},atrim=0:${T.end}`, "-ar", "48000", "-ac", "1", out("voice.wav"))

// 2. Voice level: speech at −15 LUFS, so it sits a few dB over the bed.
const v = loudness(out("voice.wav"))
const voiceGain = -15 - v.I

// 3. Mix: the bed ducks under the voice, then the whole is brought to −14 LUFS.
const graph = [
  `[1]volume=${voiceGain.toFixed(2)}dB,aformat=channel_layouts=stereo,asplit[vo][sc]`,
  `[0]volume=-2dB[bed0]`,
  `[bed0][sc]sidechaincompress=threshold=0.02:ratio=6:attack=20:release=420:knee=4[bed]`,
  `[bed][vo]amix=inputs=2:normalize=0[mix]`,
].join(";")
ff("-i", out("soundtrack.wav"), "-i", out("voice.wav"), "-filter_complex", graph, "-map", "[mix]", "-ar", "48000", out("mix-voix.wav"))
const m = loudness(out("mix-voix.wav"))
ff(
  "-i", out("coltadol-silent.mp4"), "-i", out("mix-voix.wav"),
  "-map", "0:v", "-map", "1:a", "-c:v", "copy",
  "-af", `volume=${(-14 - m.I).toFixed(2)}dB,alimiter=limit=0.8:attack=1:release=50:level=disabled`,
  "-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-shortest", "-movflags", "+faststart", out("coltadol-reel-voix.mp4")
)
const f = loudness(out("coltadol-reel-voix.mp4"))
mkdirSync(resolve(ROOT, "export"), { recursive: true })
copyFileSync(out("coltadol-reel-voix.mp4"), resolve(ROOT, "export/coltadol-reel-voix.mp4"))
console.log(`voice ${v.I} LUFS (+${voiceGain.toFixed(1)} dB) · mix ${m.I} → ${f.I} LUFS, true peak ${f.peak} dBFS`)
console.log("done → export/coltadol-reel-voix.mp4")
