#!/usr/bin/env node
/*
  The soundtrack, synthesised from the film's own cues (src/timeline.js), so
  every ping, whoosh and click lands on its frame. No samples, no
  dependencies: oscillators, noise, filters and a small stereo reverb.

    node scripts/audio.mjs          → out/soundtrack.wav (48 kHz, 16-bit stereo)

  Music: a tense drone with a ticking clock while enquiries go unanswered;
  a riser, a hit when the green dot lands; then a 120 BPM groove
  (F – C – G – Am) under the product, softer at dawn, and a final chord on
  the logo.
*/
import { readFileSync, writeFileSync, mkdirSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"
import vm from "node:vm"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const ctx = {}
vm.createContext(ctx)
vm.runInContext(readFileSync(resolve(ROOT, "src/timeline.js"), "utf8") + "\nthis.__ = { T, CUES, DURATION }", ctx)
const { T, CUES, DURATION } = ctx.__

const SR = 48000
const N = Math.ceil((DURATION + 0.5) * SR)
const dryL = new Float32Array(N)
const dryR = new Float32Array(N)
const wetL = new Float32Array(N) // reverb send
const wetR = new Float32Array(N)
const music = { L: new Float32Array(N), R: new Float32Array(N) } // ducked by the kick
const kickEnv = new Float32Array(N)

/* ------------------------------------------------------------------ tools */

let seed = 12345
const rnd = () => {
  seed = (seed * 1664525 + 1013904223) >>> 0
  return seed / 4294967296
}
const noise = () => rnd() * 2 - 1
const TAU = Math.PI * 2
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12)

/** Writes a mono voice: fn(i, tLocal) → sample. */
function voice(t0, dur, fn, { gain = 1, pan = 0, rev = 0.2, bus = "dry" } = {}) {
  const i0 = Math.round(t0 * SR)
  const n = Math.round(dur * SR)
  const gl = gain * Math.cos(((pan + 1) * Math.PI) / 4)
  const gr = gain * Math.sin(((pan + 1) * Math.PI) / 4)
  const L = bus === "music" ? music.L : dryL
  const R = bus === "music" ? music.R : dryR
  for (let i = 0; i < n; i++) {
    const j = i0 + i
    if (j < 0 || j >= N) continue
    const s = fn(i, i / SR)
    L[j] += s * gl
    R[j] += s * gr
    wetL[j] += s * gl * rev
    wetR[j] += s * gr * rev
  }
}

/** State-variable filter, one per voice. */
function svf() {
  let lp = 0
  let bp = 0
  return (x, f, q = 0.7) => {
    const g = 2 * Math.sin((Math.PI * Math.min(f, SR / 6)) / SR)
    const hp = x - lp - bp / q
    bp += g * hp
    lp += g * bp
    return { lp, bp, hp }
  }
}
const env = (t, a, d) => (t < a ? t / a : Math.exp(-(t - a) / d))

/* -------------------------------------------------------------------- SFX */

const SFX = {
  ping(t0, { g = 0.6, p = 0 } = {}) {
    const f = [1318.5, 1174.7, 1480][p] || 1318.5
    voice(t0, 0.7, (i, t) => (Math.sin(TAU * f * t) * 0.7 + Math.sin(TAU * f * 1.5 * t) * 0.3) * env(t, 0.004, 0.16), { gain: 0.22 * g, pan: [-0.3, 0.3, 0][p] || 0, rev: 0.35 })
  },
  ping2(t0) {
    ;[1046.5, 1318.5, 1568].forEach((f, k) => voice(t0 + k * 0.07, 1.2, (i, t) => Math.sin(TAU * f * t + 0.6 * Math.sin(TAU * f * 2 * t) * Math.exp(-t / 0.2)) * env(t, 0.004, 0.3), { gain: 0.13, pan: -0.2 + k * 0.2, rev: 0.4 }))
  },
  pop(t0, { g = 1 } = {}) {
    let ph = 0
    voice(t0, 0.16, (i, t) => {
      ph += (TAU * (320 + 700 * Math.min(1, t / 0.05))) / SR
      return Math.sin(ph) * env(t, 0.003, 0.045)
    }, { gain: 0.22 * g, rev: 0.15 })
  },
  popHi(t0) {
    let ph = 0
    voice(t0, 0.16, (i, t) => {
      ph += (TAU * (520 + 1100 * Math.min(1, t / 0.05))) / SR
      return Math.sin(ph) * env(t, 0.003, 0.04)
    }, { gain: 0.18, pan: 0.25, rev: 0.15 })
  },
  tick(t0) {
    const f = svf()
    voice(t0, 0.05, (i, t) => (f(noise(), 4500, 2).bp * 0.8 + Math.sin(TAU * 2400 * t) * 0.4) * env(t, 0.001, 0.008), { gain: 0.3, rev: 0.1 })
  },
  click(t0, { g = 1 } = {}) {
    const f = svf()
    voice(t0, 0.06, (i, t) => (Math.sin(TAU * 1700 * t) * 0.6 + f(noise(), 6000, 1).bp * 0.5) * env(t, 0.001, 0.012), { gain: 0.2 * g, pan: rnd() * 0.6 - 0.3, rev: 0.1 })
  },
  whoosh(t0, { d = 0.5, g = 1 } = {}) {
    const f = svf()
    voice(t0 - d * 0.6, d * 1.4, (i, t) => {
      const x = t / (d * 1.4)
      const a = Math.sin(Math.PI * Math.pow(x, 0.8)) ** 2
      return f(noise(), 300 + 2800 * x, 1.4).bp * a
    }, { gain: 0.35 * g, rev: 0.25 })
  },
  whooshLong(t0, { d = 0.8 } = {}) {
    SFX.whoosh(t0 + d * 0.3, { d, g: 1.2 })
  },
  swoosh(t0) {
    const f = svf()
    voice(t0 - 0.12, 0.35, (i, t) => {
      const x = t / 0.35
      return f(noise(), 1200 + 5000 * x, 2).bp * Math.sin(Math.PI * x) ** 2
    }, { gain: 0.22, pan: 0.2, rev: 0.3 })
  },
  thud(t0) {
    let ph = 0
    voice(t0, 0.6, (i, t) => {
      ph += (TAU * (40 + 50 * Math.exp(-t / 0.05))) / SR
      return Math.sin(ph) * env(t, 0.003, 0.18)
    }, { gain: 0.75, rev: 0.12 })
    SFX.tick(t0)
  },
  scatter(t0) {
    for (let k = 0; k < 10; k++) {
      const t = t0 + rnd() * 0.8
      const f = svf()
      const fr = 2000 + rnd() * 3000
      voice(t, 0.08, (i, tt) => f(noise(), fr, 4).bp * env(tt, 0.001, 0.02), { gain: 0.2, pan: rnd() * 1.6 - 0.8, rev: 0.4 })
    }
  },
  fizz(t0, { d = 1 } = {}) {
    // Neon flickering out.
    const f = svf()
    let gate = 0
    voice(t0, d, (i, t) => {
      if (i % 480 === 0) gate = rnd() < 0.45 * (1 - t / d) ? 1 : 0
      return f(noise(), 3500, 0.8).bp * gate * (1 - t / d) + Math.sin(TAU * 120 * t) * gate * 0.15
    }, { gain: 0.16, rev: 0.3 })
  },
  riser(t0, { d = 0.8 } = {}) {
    const f = svf()
    let ph = 0
    voice(t0, d, (i, t) => {
      const x = t / d
      ph += (TAU * (180 + 900 * x * x)) / SR
      return (f(noise(), 500 + 6000 * x * x, 1.2).bp * 0.8 + Math.sin(ph) * 0.3) * x * x
    }, { gain: 0.5, rev: 0.3 })
  },
  impact(t0) {
    let ph = 0
    voice(t0, 2.2, (i, t) => {
      ph += (TAU * (30 + 70 * Math.exp(-t / 0.09))) / SR
      return Math.sin(ph) * env(t, 0.002, 0.6)
    }, { gain: 1.0, rev: 0.2 })
    const f = svf()
    voice(t0, 1.0, (i, t) => f(noise(), 1800 * Math.exp(-t / 0.3) + 200, 0.7).lp * env(t, 0.001, 0.15), { gain: 0.6, rev: 0.6 })
    // The answer: a clear, high tone.
    ;[1568, 2093].forEach((fr, k) => voice(t0 + 0.02 + k * 0.05, 2.5, (i, t) => Math.sin(TAU * fr * t) * env(t, 0.005, 0.8), { gain: 0.1, pan: k ? 0.3 : -0.3, rev: 0.7 }))
  },
  shimmer(t0, { d = 1.3 } = {}) {
    const notes = [72, 76, 79, 84, 88, 91, 96]
    notes.forEach((m, k) => voice(t0 + (k / notes.length) * d * 0.8, 1.6, (i, t) => Math.sin(TAU * mtof(m) * t) * env(t, 0.01, 0.4), { gain: 0.07, pan: -0.6 + (k / notes.length) * 1.2, rev: 0.8 }))
  },
  sweep(t0, { d = 0.7 } = {}) {
    let ph = 0
    voice(t0, d + 0.2, (i, t) => {
      const x = Math.min(1, t / d)
      ph += (TAU * (500 + 900 * x)) / SR
      return Math.sin(ph) * (t < d ? 0.4 + 0.6 * x : Math.exp(-(t - d) / 0.05)) * 0.5
    }, { gain: 0.08, rev: 0.3 })
  },
  chime(t0) {
    ;[[783.99, 0], [1046.5, 0.08]].forEach(([fr, dt]) =>
      voice(t0 + dt, 1.4, (i, t) => Math.sin(TAU * fr * t + 1.2 * Math.sin(TAU * fr * 3.5 * t) * Math.exp(-t / 0.08)) * env(t, 0.003, 0.35), { gain: 0.14, pan: dt ? 0.2 : -0.2, rev: 0.45 })
    )
  },
  chimeEnd(t0) {
    ;[[1046.5, 0], [1318.5, 0.07], [1568, 0.14], [2093, 0.21]].forEach(([fr, dt], k) =>
      voice(t0 + dt, 2.5, (i, t) => Math.sin(TAU * fr * t + 0.8 * Math.sin(TAU * fr * 2 * t) * Math.exp(-t / 0.1)) * env(t, 0.003, 0.7), { gain: 0.11, pan: -0.3 + k * 0.2, rev: 0.6 })
    )
  },
  shuffle(t0, { d = 0.7 } = {}) {
    for (let k = 0; k < 7; k++) SFX.click(t0 + (k / 7) * d + rnd() * 0.03, { g: 0.55 })
    SFX.whoosh(t0 + d * 0.5, { d: d, g: 0.4 })
  },
  alert(t0) {
    ;[[880, 0], [698.5, 0.13]].forEach(([fr, dt]) => voice(t0 + dt, 0.5, (i, t) => Math.sin(TAU * fr * t) * env(t, 0.004, 0.11), { gain: 0.14, rev: 0.3 }))
  },
  type(t0, { d = 0.9 } = {}) {
    const n = Math.round(d * 24)
    for (let k = 0; k < n; k++) SFX.click(t0 + k / 24 + rnd() * 0.01, { g: 0.32 })
  },
  tap(t0) {
    let ph = 0
    voice(t0, 0.2, (i, t) => {
      ph += (TAU * (180 + 220 * Math.exp(-t / 0.02))) / SR
      return Math.sin(ph) * env(t, 0.002, 0.05)
    }, { gain: 0.4, rev: 0.1 })
    SFX.click(t0, { g: 1.2 })
  },
  roll(t0, { d = 1 } = {}) {
    // Odometer: fast ticks that slow down.
    let t = 0
    while (t < d) {
      SFX.tick(t0 + t)
      t += 0.025 + 0.12 * Math.pow(t / d, 2)
    }
  },
  impact2(t0) {
    SFX.impact(t0)
  },
}

/* ------------------------------------------------------------------ music */

function kick(t0, g = 1) {
  let ph = 0
  voice(t0, 0.45, (i, t) => {
    ph += (TAU * (46 + 90 * Math.exp(-t / 0.035))) / SR
    return Math.sin(ph) * env(t, 0.002, 0.13) + (t < 0.004 ? noise() * 0.3 : 0)
  }, { gain: 0.62 * g, rev: 0.03 })
  const i0 = Math.round(t0 * SR)
  for (let i = 0; i < 0.3 * SR; i++) if (i0 + i < N) kickEnv[i0 + i] = Math.max(kickEnv[i0 + i], Math.exp(-i / SR / 0.09))
}
function hat(t0, g = 1, open = false) {
  const f = svf()
  voice(t0, open ? 0.25 : 0.06, (i, t) => f(noise(), 9000, 0.9).hp * env(t, 0.001, open ? 0.07 : 0.018), { gain: 0.09 * g, pan: 0.25, rev: 0.08 })
}
function clap(t0, g = 1) {
  const f = svf()
  voice(t0, 0.3, (i, t) => {
    const burst = t < 0.03 ? (Math.floor(t / 0.01) % 2 === 0 ? 1 : 0.4) : 1
    return f(noise(), 1500, 1.1).bp * burst * env(t, 0.001, 0.08)
  }, { gain: 0.28 * g, pan: -0.1, rev: 0.35 })
}
function bass(t0, dur, m, g = 1) {
  const f = svf()
  let ph = 0
  const fr = mtof(m)
  voice(t0, dur, (i, t) => {
    ph = (ph + fr / SR) % 1
    const saw = 2 * ph - 1
    const a = Math.min(1, t / 0.01) * (t > dur - 0.05 ? (dur - t) / 0.05 : 1)
    return (f(saw, 400 + 300 * Math.exp(-t / 0.15), 0.9).lp * 0.8 + Math.sin(TAU * fr * t) * 0.5) * a
  }, { gain: 0.32 * g, rev: 0.05, bus: "music" })
}
function pad(t0, dur, notes, g = 1, bright = 0) {
  notes.forEach((m, k) => {
    for (const det of [-0.08, 0.08]) {
      const f = svf()
      let ph = rnd()
      const fr = mtof(m + det)
      voice(t0, dur + 0.6, (i, t) => {
        ph = (ph + fr / SR) % 1
        const a = Math.min(1, t / 0.35) * (t > dur ? Math.exp(-(t - dur) / 0.25) : 1)
        return f(2 * ph - 1, 900 + bright * 2200 + 300 * Math.sin(t * 2), 0.8).lp * a
      }, { gain: 0.045 * g, pan: det > 0 ? 0.5 : -0.5, rev: 0.45, bus: "music" })
    }
  })
}
function pluck(t0, m, g = 1) {
  const fr = mtof(m)
  voice(t0, 0.5, (i, t) => (Math.sin(TAU * fr * t) + 0.35 * Math.sin(TAU * fr * 2 * t) * Math.exp(-t / 0.05)) * env(t, 0.002, 0.12), { gain: 0.06 * g, pan: rnd() * 0.8 - 0.4, rev: 0.4, bus: "music" })
}

// Night: a low drone and a clock.
{
  const f = svf()
  let ph = 0
  voice(0, T.impact, (i, t) => {
    ph = (ph + 55 / SR) % 1
    const x = t / T.impact
    const a = Math.min(1, t / 0.4) * (0.6 + 0.4 * x) * (t > T.impact - 0.25 ? (T.impact - t) / 0.25 : 1)
    return (f(2 * ph - 1, 220 + 600 * x, 1.5).lp * 0.6 + Math.sin(TAU * 55 * t) * 0.5 + Math.sin(TAU * 82.4 * t) * 0.15) * a
  }, { gain: 0.22, rev: 0.3, bus: "music" })
  for (let t = 0.5; t < T.collapse; t += 0.5) SFX.tick(t)
}

// The answer: 120 BPM from the impact. F – C – G – Am, two seconds a chord.
const BEAT = 0.5
const CHORDS = [
  { root: 41, notes: [65, 69, 72, 76] }, // Fmaj7
  { root: 36, notes: [64, 67, 72, 74] }, // Cadd9
  { root: 43, notes: [62, 67, 71, 74] }, // G
  { root: 45, notes: [64, 69, 72, 76] }, // Am7
]
const grooveEnd = T.lockup - 0.05
for (let bar = 0, t = T.impact; t < grooveEnd - 0.01; bar++, t += 4 * BEAT) {
  const ch = CHORDS[bar % 4]
  const dawn = t >= T.dawn - 0.01
  const len = Math.min(4 * BEAT, grooveEnd - t)
  pad(t, len, ch.notes, bar === 0 ? 1.3 : 1, dawn ? 0.6 : 0.15)
  for (let b = 0; b < 4; b++) {
    const tb = t + b * BEAT
    if (tb >= grooveEnd) break
    const intro = tb < T.impact + 2 * BEAT // first beats: let the hit ring
    if (!dawn || b % 2 === 0) kick(tb, intro ? 0.6 : 1)
    if (!intro && (b === 1 || b === 3) && !dawn) clap(tb)
    if (!intro) {
      hat(tb + BEAT / 2, 1, b === 3)
      hat(tb + BEAT / 4, 0.4)
      hat(tb + (3 * BEAT) / 4, 0.4)
    }
    bass(tb, BEAT * 0.9, ch.root + (b === 3 ? 12 : 0), intro ? 0.7 : 1)
    bass(tb + BEAT / 2, BEAT * 0.4, ch.root, 0.6)
    // A quiet arpeggio of the chord, 16ths.
    for (let s = 0; s < 4; s++) if (!intro) pluck(tb + (s * BEAT) / 4, ch.notes[(b * 4 + s) % 4] + 12, dawn ? 1.4 : 0.8)
  }
}
// Into the end card: a lift, then the final chord.
SFX.riser(T.mOut - 0.4, { d: T.lockup - T.mOut + 0.4 })
pad(T.lockup, T.end - T.lockup - 0.6, [60, 64, 67, 71, 74], 1.6, 0.8)
bass(T.lockup, T.end - T.lockup - 0.4, 36, 0.9)
kick(T.lockup, 1)
for (let t = T.lockup + 4 * BEAT; t < T.end - 1.2; t += 2 * BEAT) kick(t, 0.45)

/* -------------------------------------------------------------- the cues */

for (const c of CUES) {
  const fn = SFX[c.k]
  if (fn) fn(c.t, c)
  else console.warn("no sound for", c.k)
}

/* ------------------------------------------------------------------ mix */

// Duck the music under the kick.
for (let i = 0; i < N; i++) {
  const d = 1 - 0.55 * kickEnv[i]
  dryL[i] += music.L[i] * d
  dryR[i] += music.R[i] * d
  wetL[i] += 0 // (music already sent its share to the reverb)
}

// A small Freeverb-style room on the send.
function reverb(input, combs, aps, damp = 0.35, fb = 0.8) {
  const out = new Float32Array(N)
  for (const len of combs) {
    const buf = new Float32Array(len)
    let k = 0
    let lp = 0
    for (let i = 0; i < N; i++) {
      const y = buf[k]
      lp = y * (1 - damp) + lp * damp
      buf[k] = input[i] + lp * fb
      out[i] += y
      k = (k + 1) % len
    }
  }
  for (const len of aps) {
    const buf = new Float32Array(len)
    let k = 0
    for (let i = 0; i < N; i++) {
      const b = buf[k]
      const x = out[i]
      buf[k] = x + b * 0.5
      out[i] = b - x * 0.5
      k = (k + 1) % len
    }
  }
  return out
}
const s = SR / 44100
const rl = reverb(wetL, [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617].map((x) => Math.round(x * s)), [556, 441, 341, 225].map((x) => Math.round(x * s)))
const rr = reverb(wetR, [1139, 1211, 1300, 1379, 1445, 1514, 1580, 1640].map((x) => Math.round(x * s)), [579, 464, 364, 248].map((x) => Math.round(x * s)))

const outL = new Float32Array(N)
const outR = new Float32Array(N)
let peak = 0
const fadeStart = T.end - 1.1
for (let i = 0; i < N; i++) {
  const t = i / SR
  const fade = t < 0.02 ? t / 0.02 : t > fadeStart ? Math.max(0, 1 - (t - fadeStart) / 1.1) : 1
  outL[i] = Math.tanh((dryL[i] + rl[i] * 0.06) * 1.1) * fade
  outR[i] = Math.tanh((dryR[i] + rr[i] * 0.06) * 1.1) * fade
  peak = Math.max(peak, Math.abs(outL[i]), Math.abs(outR[i]))
}
const norm = 0.89 / peak

const n = Math.round(DURATION * SR)
const wav = Buffer.alloc(44 + n * 4)
wav.write("RIFF", 0)
wav.writeUInt32LE(36 + n * 4, 4)
wav.write("WAVEfmt ", 8)
wav.writeUInt32LE(16, 16)
wav.writeUInt16LE(1, 20)
wav.writeUInt16LE(2, 22)
wav.writeUInt32LE(SR, 24)
wav.writeUInt32LE(SR * 4, 28)
wav.writeUInt16LE(4, 32)
wav.writeUInt16LE(16, 34)
wav.write("data", 36)
wav.writeUInt32LE(n * 4, 40)
for (let i = 0; i < n; i++) {
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outL[i] * norm)) * 32767), 44 + i * 4)
  wav.writeInt16LE(Math.round(Math.max(-1, Math.min(1, outR[i] * norm)) * 32767), 46 + i * 4)
}
mkdirSync(resolve(ROOT, "out"), { recursive: true })
writeFileSync(resolve(ROOT, "out/soundtrack.wav"), wav)
console.log(`out/soundtrack.wav · ${DURATION} s · peak normalised from ${peak.toFixed(2)}`)
