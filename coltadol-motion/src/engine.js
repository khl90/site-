/*
  Motion toolkit. No dependencies, no CSS transitions: every value on screen
  is a pure function of the film's clock, so any frame can be rendered on its
  own, in any order, on any worker — and always looks the same.
*/

const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x)
/** 0 → 1 as t goes from a to b. */
const prog = (t, a, b) => clamp((t - a) / (b - a))
const lerp = (a, b, x) => a + (b - a) * x
/** Rises over [a, a+i], holds, falls over [b, b+o]. */
const pulse = (t, a, i, b, o) => Math.min(E.outCubic(prog(t, a, a + i)), 1 - E.inCubic(prog(t, b, b + o)))

const E = {
  linear: (x) => x,
  inCubic: (x) => x * x * x,
  outCubic: (x) => 1 - Math.pow(1 - x, 3),
  inOutCubic: (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2),
  outQuart: (x) => 1 - Math.pow(1 - x, 4),
  inOutQuart: (x) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2),
  inOutQuint: (x) => (x < 0.5 ? 16 * x ** 5 : 1 - Math.pow(-2 * x + 2, 5) / 2),
  inExpo: (x) => (x <= 0 ? 0 : Math.pow(2, 10 * x - 10)),
  outExpo: (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x)),
  inOutExpo: (x) =>
    x <= 0 ? 0 : x >= 1 ? 1 : x < 0.5 ? Math.pow(2, 20 * x - 10) / 2 : (2 - Math.pow(2, -20 * x + 10)) / 2,
  outBack: (x, s = 1.70158) => 1 + (s + 1) * Math.pow(x - 1, 3) + s * Math.pow(x - 1, 2),
}

/** Keyframes [[t, v, ease?], ...]; the ease belongs to the segment arriving at that key. */
function kf(t, keys) {
  if (t <= keys[0][0]) return keys[0][1]
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1]
      const [t1, v1, ez = E.inOutCubic] = keys[i]
      return lerp(v0, v1, ez((t - t0) / (t1 - t0)))
    }
  }
  return keys[keys.length - 1][1]
}

/** Deterministic PRNG (mulberry32). */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let r = Math.imul(a ^ (a >>> 15), 1 | a)
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

const $ = (s, r = document) => r.querySelector(s)
const $$ = (s, r = document) => [...r.querySelectorAll(s)]

function h(tag, cls, html = "", parent = null) {
  const el = document.createElement(tag)
  if (cls) el.className = cls
  if (html) el.innerHTML = html
  if (parent) parent.append(el)
  return el
}

/** Cached style write: unchanged values cost nothing. */
function set(el, prop, value) {
  const c = el.__s || (el.__s = {})
  if (c[prop] === value) return
  c[prop] = value
  if (prop.startsWith("--")) el.style.setProperty(prop, value)
  else el.style[prop] = value
}
const show = (el, on) => set(el, "display", on ? "" : "none")
const f2 = (x) => x.toFixed(2)
const f3 = (x) => x.toFixed(3)

/* ------------------------------------------------------------ kinetic type */

/**
 * Splits `data-text` into masked lines → words → chars. `\n` breaks a line,
 * `*words*` are highlighted (green by default, `data-hl="lamp"` for amber).
 */
function splitText(el) {
  const hl = el.dataset.hl === "lamp" ? "hl-lamp" : "hl"
  let on = false
  el.innerHTML = el.dataset.text
    .split("\n")
    .map((line) => {
      const words = line.split(" ").map((word) => {
        let w = word
        if (w.startsWith("*")) {
          on = true
          w = w.slice(1)
        }
        const close = w.endsWith("*")
        if (close) w = w.slice(0, -1)
        const cls = on ? ` ${hl}` : ""
        const chars = [...w].map((c) => `<span class="ch${cls}">${c}</span>`).join("")
        if (close) on = false
        return `<span class="w">${chars}</span>`
      })
      return `<span class="ln"><span class="li">${words.join(" ")}</span></span>`
    })
    .join("")
  el.__chars = $$(".ch", el)
  el.__words = $$(".w", el)
}

/** Shrinks a split title until its widest line fits `maxW` px. */
function fitText(el, maxW) {
  let fs = parseFloat(getComputedStyle(el).fontSize)
  const widest = () => Math.max(...$$(".li", el).map((l) => l.getBoundingClientRect().width))
  for (let i = 0; i < 30 && widest() > maxW; i++) {
    fs *= 0.96
    el.style.fontSize = `${fs}px`
  }
}

/**
 * The landing hero's entrance (GSAP SplitText, expo.out, chars rising out
 * of a line mask with a slight rotation) — and an exit that lifts them away.
 */
function rise(el, t, t0, o = {}) {
  const { dur = 1.0, stagger = 0.018, out = 1e9, outDur = 0.42, outStagger = 0.006 } = o
  const n = el.__chars.length
  const on = t >= t0 - 0.01 && t <= out + outDur + n * outStagger
  show(el, on)
  if (!on) return
  el.__chars.forEach((c, i) => {
    const a = E.outExpo(prog(t, t0 + i * stagger, t0 + i * stagger + dur))
    const b = E.inExpo(prog(t, out + i * outStagger, out + i * outStagger + outDur))
    const y = (1 - a) * 115 - b * 115
    set(c, "transform", `translate3d(0,${f2(y)}%,0) rotate(${f2((1 - a) * 6)}deg)`)
  })
}

/** Word by word, out of focus into focus (refs 1 and 4), and back out. */
function focusIn(el, t, t0, o = {}) {
  const { dur = 0.55, stagger = 0.07, out = 1e9, outDur = 0.35, blur = 18, dx = 26 } = o
  const on = t >= t0 - 0.01 && t <= out + outDur
  show(el, on)
  if (!on) return
  const b = E.inCubic(prog(t, out, out + outDur))
  el.__words.forEach((w, i) => {
    const a = E.outCubic(prog(t, t0 + i * stagger, t0 + i * stagger + dur))
    set(w, "opacity", f3(a * (1 - b)))
    set(w, "filter", a < 1 || b > 0 ? `blur(${f2((1 - a) * blur + b * blur * 0.6)}px)` : "none")
    set(w, "transform", `translate3d(${f2((1 - a) * dx)}px,${f2(-b * 24)}px,0)`)
  })
}

/** Plain in/out envelope for a block: {a: entrance, b: exit, on}. */
function env(t, t0, dur, out = 1e9, outDur = 0.35, ein = E.outExpo, eout = E.inCubic) {
  return { a: ein(prog(t, t0, t0 + dur)), b: eout(prog(t, out, out + outDur)), on: t >= t0 && t <= out + outDur }
}

/** Fades/slides a block with env(); returns the envelope. */
function block(el, t, t0, dur, out, outDur, { dy = 30, blur = 10 } = {}) {
  const e = env(t, t0, dur, out, outDur)
  show(el, e.on)
  if (!e.on) return e
  set(el, "opacity", f3(e.a * (1 - e.b)))
  set(el, "transform", `translate3d(0,${f2((1 - e.a) * dy - e.b * dy)}px,0)`)
  set(el, "filter", e.a < 1 || e.b > 0 ? `blur(${f2((1 - e.a + e.b) * blur)}px)` : "none")
  return e
}

/* ---------------------------------------------------------------- odometer */

/** keys: [[t, "HH:MM", extraSpins?], ...]; each digit rolls forward to its next value. */
function makeOdo(el, keys) {
  el.innerHTML = ""
  const strips = []
  for (let i = 0; i < 5; i++) {
    if (i === 2) {
      h("span", "colon", ":", el)
      continue
    }
    const col = h("span", "dcol", "", el)
    const strip = h("span", "dstrip", "", col)
    for (let k = 0; k < 60; k++) h("span", "", String(k % 10), strip)
    strips.push(strip)
  }
  const digits = (s) => s.replace(":", "").split("").map(Number)
  const pos = [digits(keys[0][1])]
  for (let k = 1; k < keys.length; k++) {
    const next = digits(keys[k][1])
    const spins = keys[k][2] || 0
    pos.push(next.map((d, j) => pos[k - 1][j] + ((d - (pos[k - 1][j] % 10) + 10) % 10) + spins * 10 * (j >= 2 ? 1 : 0)))
  }
  el.__odo = { strips, keys, pos }
}

function odoAt(el, t, dur = 0.7) {
  const { strips, keys, pos } = el.__odo
  strips.forEach((strip, j) => {
    let p = pos[0][j]
    for (let k = 1; k < keys.length; k++) {
      const start = keys[k][0] + (3 - j) * 0.05
      if (t >= start) p = lerp(pos[k - 1][j], pos[k][j], E.inOutQuart(prog(t, start, start + dur)))
    }
    set(strip, "transform", `translate3d(0,${(-p).toFixed(4)}em,0)`)
  })
}

/* ---------------------------------------------------------------- geometry */

let STAGE_SCALE = 1
/** Element rect in stage pixels, whatever the preview's zoom. */
function rectOf(el) {
  const s = $("#stage").getBoundingClientRect()
  const r = el.getBoundingClientRect()
  const k = 1 / STAGE_SCALE
  const x = (r.left - s.left) * k
  const y = (r.top - s.top) * k
  return { x, y, w: r.width * k, h: r.height * k, cx: x + (r.width * k) / 2, cy: y + (r.height * k) / 2 }
}

function qbez(p0, p1, p2, x) {
  const u = 1 - x
  return { x: u * u * p0.x + 2 * u * x * p1.x + x * x * p2.x, y: u * u * p0.y + 2 * u * x * p1.y + x * x * p2.y }
}

/** The brand geometry, verbatim from `components/coltadol-mark.tsx`. */
const BRAND = {
  RING: "M23.55 7.71a10.5 10.5 0 1 0 0 14.58",
  TAIL: "M6.9 20.25 4.5 28l6.25-3.9Z",
  WORDMARK:
    "M6.62 20.35Q4.79 20.35 3.59 19.68Q2.38 19 1.71 17.72Q1.03 16.44 0.75 14.59Q0.47 12.74 0.47 10.35Q0.47 8.18 0.72 6.32Q0.97 4.47 1.62 3.12Q2.26 1.76 3.47 1.01Q4.68 0.26 6.56 0.26Q8.35 0.26 9.49 0.91Q10.62 1.56 11.18 2.65Q11.74 3.74 11.82 5.12Q11.91 6.5 11.65 7.97L7.41 8.44Q7.59 6.97 7.53 5.91Q7.47 4.85 7.18 4.29Q6.88 3.74 6.35 3.74Q5.97 3.74 5.72 4.07Q5.47 4.41 5.32 5.13Q5.18 5.85 5.1 7.01Q5.03 8.18 5.03 9.82Q5.03 12.47 5.18 14.03Q5.32 15.59 5.65 16.25Q5.97 16.91 6.47 16.91Q7.15 16.91 7.43 16.04Q7.71 15.18 7.72 13.81Q7.74 12.44 7.56 10.97L11.91 11.53Q12.26 13.76 12.09 15.43Q11.91 17.09 11.22 18.18Q10.53 19.26 9.37 19.81Q8.21 20.35 6.62 20.35ZM18.35 20.35Q16.38 20.35 15.18 19.41Q13.97 18.47 13.43 16.68Q12.88 14.88 12.88 12.29Q12.88 9.41 13.5 7.6Q14.12 5.79 15.35 4.96Q16.59 4.12 18.41 4.12Q20.41 4.12 21.63 4.96Q22.85 5.79 23.41 7.56Q23.97 9.32 23.97 12.18Q23.97 15.03 23.35 16.84Q22.74 18.65 21.5 19.5Q20.26 20.35 18.35 20.35ZM18.41 17.09Q18.79 17.09 19 16.65Q19.21 16.21 19.29 15.21Q19.38 14.21 19.38 12.53Q19.38 10.62 19.29 9.5Q19.21 8.38 19 7.9Q18.79 7.41 18.41 7.41Q18.03 7.41 17.82 7.9Q17.62 8.38 17.54 9.51Q17.47 10.65 17.47 12.59Q17.47 15.09 17.66 16.09Q17.85 17.09 18.41 17.09ZM24.94 20V0H29.41V20ZM35.74 20.24Q33.44 20.24 32.16 18.85Q30.88 17.47 30.88 14.62V7.97H30.03V4.97H30.41Q31.35 4.97 31.68 4.49Q32 4 32.12 3L32.29 1.56H35.29V4.47H37.32V8.06H35.29V13.68Q35.29 14.79 35.63 15.35Q35.97 15.91 36.53 15.91Q36.76 15.91 36.96 15.82Q37.15 15.74 37.32 15.56V20Q36.94 20.12 36.56 20.18Q36.18 20.24 35.74 20.24ZM41.15 20.35Q40.21 20.35 39.49 19.91Q38.76 19.47 38.35 18.65Q37.94 17.82 37.94 16.68Q37.94 15.35 38.41 14.47Q38.88 13.59 39.62 13.01Q40.35 12.44 41.16 12.1Q41.97 11.76 42.62 11.53Q43.35 11.26 43.75 10.97Q44.15 10.68 44.29 10.28Q44.44 9.88 44.44 9.29Q44.44 8.47 44.21 8.06Q43.97 7.65 43.53 7.65Q43.12 7.65 42.88 8.01Q42.65 8.38 42.59 9.13Q42.53 9.88 42.65 11.03L38.24 10.56Q38.15 9 38.47 7.79Q38.79 6.59 39.49 5.76Q40.18 4.94 41.24 4.53Q42.29 4.12 43.71 4.12Q45.41 4.12 46.57 4.81Q47.74 5.5 48.32 6.93Q48.91 8.35 48.91 10.62V14.35Q48.91 15.29 48.91 16.24Q48.91 17.18 48.91 18.12Q48.91 19.06 48.91 20H44.97Q44.97 19 44.97 18.01Q44.97 17.03 44.97 16.03H44.74Q44.62 17.44 44.15 18.41Q43.68 19.38 42.91 19.87Q42.15 20.35 41.15 20.35ZM43.21 16.71Q43.5 16.71 43.72 16.53Q43.94 16.35 44.09 16.03Q44.24 15.71 44.31 15.32Q44.38 14.94 44.38 14.56V12.47L45 12Q44.76 12.35 44.47 12.6Q44.18 12.85 43.87 13.04Q43.56 13.24 43.28 13.44Q43 13.65 42.79 13.88Q42.59 14.12 42.46 14.47Q42.32 14.82 42.32 15.32Q42.32 16.12 42.6 16.41Q42.88 16.71 43.21 16.71ZM54 20.35Q52.65 20.35 51.72 19.38Q50.79 18.41 50.32 16.59Q49.85 14.76 49.85 12.26Q49.85 9.47 50.38 7.68Q50.91 5.88 51.78 5.03Q52.65 4.18 53.71 4.18Q54.65 4.18 55.28 4.79Q55.91 5.41 56.31 6.57Q56.71 7.74 56.91 9.38H57.21Q57.03 8.38 56.9 7.44Q56.76 6.5 56.68 5.66Q56.59 4.82 56.59 4.12V0H61.12V12.71V20H57.24V15.56H57Q56.85 17.38 56.46 18.44Q56.06 19.5 55.44 19.93Q54.82 20.35 54 20.35ZM55.41 16.94Q55.71 16.94 55.93 16.62Q56.15 16.29 56.29 15.75Q56.44 15.21 56.51 14.53Q56.59 13.85 56.59 13.15V12.53Q56.59 11.76 56.53 11.09Q56.47 10.41 56.37 9.85Q56.26 9.29 56.12 8.9Q55.97 8.5 55.79 8.29Q55.62 8.09 55.38 8.09Q55.09 8.09 54.88 8.54Q54.68 9 54.57 9.99Q54.47 10.97 54.47 12.53Q54.47 13.91 54.56 14.91Q54.65 15.91 54.85 16.43Q55.06 16.94 55.41 16.94ZM67.56 20.35Q65.59 20.35 64.38 19.41Q63.18 18.47 62.63 16.68Q62.09 14.88 62.09 12.29Q62.09 9.41 62.71 7.6Q63.32 5.79 64.56 4.96Q65.79 4.12 67.62 4.12Q69.62 4.12 70.84 4.96Q72.06 5.79 72.62 7.56Q73.18 9.32 73.18 12.18Q73.18 15.03 72.56 16.84Q71.94 18.65 70.71 19.5Q69.47 20.35 67.56 20.35ZM67.62 17.09Q68 17.09 68.21 16.65Q68.41 16.21 68.5 15.21Q68.59 14.21 68.59 12.53Q68.59 10.62 68.5 9.5Q68.41 8.38 68.21 7.9Q68 7.41 67.62 7.41Q67.24 7.41 67.03 7.9Q66.82 8.38 66.75 9.51Q66.68 10.65 66.68 12.59Q66.68 15.09 66.87 16.09Q67.06 17.09 67.62 17.09ZM74.15 20V0H78.62V20Z",
}

/** The bare symbol: C in limewash, the answer dot in signal green. */
function markSVG(size, cls = "") {
  return `<svg class="${cls}" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none">
    <path class="m-ring" d="${BRAND.RING}" stroke="#eef0fa" stroke-width="4" stroke-linecap="round"/>
    <path class="m-tail" d="${BRAND.TAIL}" fill="#eef0fa" stroke="#eef0fa" stroke-width="1.6" stroke-linejoin="round"/>
    <circle class="m-dot" cx="26.2" cy="15" r="3.8" fill="#5ce6a5"/></svg>`
}

/** The horizontal lockup (mark + outlined wordmark), with a clip to wipe the name in. */
function lockupSVG(id) {
  return `<svg id="${id}" viewBox="2 0 112.2 30" fill="none">
    <defs><clipPath id="${id}-clip"><rect class="lk-clip" x="34" y="0" width="82" height="30"/></clipPath></defs>
    <g transform="translate(0 1.24) scale(0.86)">
      <path class="m-ring" d="${BRAND.RING}" stroke="#eef0fa" stroke-width="4" stroke-linecap="round"/>
      <path class="m-tail" d="${BRAND.TAIL}" fill="#eef0fa" stroke="#eef0fa" stroke-width="1.6" stroke-linejoin="round"/>
      <circle class="m-dot" cx="26.2" cy="15" r="3.8" fill="#5ce6a5"/>
    </g>
    <g clip-path="url(#${id}-clip)"><path transform="translate(34 5)" fill="#eef0fa" d="${BRAND.WORDMARK}"/></g></svg>`
}
