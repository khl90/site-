/*
  The film's one clock, in seconds. Scenes read their times from here and
  `scripts/render.mjs` exports CUES so the soundtrack hits the same frames.

  Story (the landing page's own metaphor, taken literally: every lit window
  is an enquiry — amber while someone waits, green once Coltadol answered):

    HOOK      23:47, one window lights up: a WhatsApp enquiry nobody answers.
    PROBLEM   Pull back — a whole city of them. They write at all hours, the
              needs scatter, some windows go dark: prospects forgotten.
    TURN      The logo's green dot lands. The city turns green, window by
              window: every enquiry answered.
    QUALIFY   Dive into one window: the conversation becomes a lead file.
    ORGANIZE  The file slots into the console with every other lead, sorted.
    RECOVERY  A silent prospect becomes a follow-up, sent by a person.
    MORNING   08:00, the director report: who to call, what to offer.
    END       Logo, promise, CTA.
*/

const FPS = 30
const DURATION = 28.0

const T = {
  // HOOK
  win: 0.0,
  bubble: 0.1,
  clock: 0.28,
  hookLine: 0.95,
  pull: 1.95,
  // PROBLEM
  l1: 2.5,
  l2: 3.85,
  scatter: 4.0,
  l3: 5.2,
  die: 5.3,
  collapse: 6.35,
  // TURN
  impact: 6.95,
  wave: 7.1,
  turnTitle: 7.55,
  turnSub: 8.05,
  dive: 9.35,
  // QUALIFY
  portal: 9.85,
  qTitle: 10.05,
  msgs: { b1: 10.35, a1t: 10.65, a1: 10.9, b2: 11.25, a2t: 11.55, a2: 11.75, b3: 12.1, a3t: 12.5, a3: 12.75 },
  pan: 12.2,
  land: 12.7,
  score: 13.25,
  hot: 13.8,
  qualified: 14.05,
  qOut: 14.6,
  // ORGANIZE
  console: 14.6,
  oTitle: 14.85,
  rows: 15.2,
  sort: 16.2,
  flag: 17.0,
  // RECOVERY
  rTitle: 17.5,
  rPanel: 17.6,
  rType: 18.2,
  rBtn: 19.1,
  tap: 19.55,
  rNote: 19.8,
  rOut: 20.5,
  // MORNING
  dawn: 20.5,
  clock2: 20.8,
  roll: 21.0,
  notif: 21.65,
  report: 22.1,
  match: 22.9,
  mOut: 23.75,
  // END
  lockup: 24.0,
  tagline: 24.6,
  pills: 25.1,
  cta: 25.5,
  url: 25.8,
  ctaTap: 26.45,
  end: DURATION,
}

/* Sound cues: kind + time (+ duration, + gain). Consumed by scripts/audio.mjs. */
const CUES = (() => {
  const c = []
  const add = (t, k, o = {}) => c.push({ t: +t.toFixed(3), k, ...o })
  add(T.win + 0.02, "ping")
  add(T.bubble + 0.05, "pop")
  add(T.clock, "tick")
  add(T.hookLine, "tick")
  add(T.pull - 0.05, "whooshLong", { d: 0.9 })
  // The city lights up: a ping for each of the first windows, then a wash.
  ;[2.3, 2.55, 2.8, 3.02, 3.22, 3.4, 3.56, 3.7, 3.83, 3.95, 4.06, 4.16, 4.26].forEach((t, i) => add(t, "ping", { g: 0.55 - i * 0.025, p: i % 3 }))
  add(T.l1, "thud")
  add(T.l2, "thud")
  add(T.scatter, "scatter")
  add(T.l3, "thud")
  add(T.die, "fizz", { d: 1.0 })
  add(T.collapse - 0.15, "riser", { d: T.impact - T.collapse + 0.1 })
  add(T.impact, "impact")
  add(T.wave + 0.05, "shimmer", { d: 1.3 })
  add(T.turnTitle, "swoosh")
  add(T.dive, "whooshLong", { d: 0.7 })
  ;["b1", "a1", "b2", "a2", "b3", "a3"].forEach((m) => add(T.msgs[m], m[0] === "b" ? "pop" : "popHi"))
  add(T.pan, "swoosh")
  for (let i = 0; i < 5; i++) add(T.land + 0.42 + i * 0.09, "click")
  add(T.score, "sweep", { d: 0.7 })
  add(T.hot, "chime")
  add(T.console, "whoosh")
  for (let i = 0; i < 6; i++) add(T.rows + i * 0.11 + 0.28, "click", { g: 0.6 })
  add(T.sort, "shuffle", { d: 0.7 })
  add(T.flag, "alert")
  add(T.rPanel, "whoosh")
  add(T.rType, "type", { d: 0.9 })
  add(T.tap, "tap")
  add(T.tap + 0.12, "chime")
  add(T.rOut, "whooshLong", { d: 0.8 })
  add(T.roll, "roll", { d: 1.0 })
  add(T.notif, "ping2")
  add(T.report, "whoosh")
  for (let i = 0; i < 4; i++) add(T.report + 0.35 + i * 0.1, "click", { g: 0.5 })
  add(T.match, "chime")
  add(T.mOut, "whooshLong", { d: 0.6 })
  add(T.lockup, "impact2")
  add(T.tagline, "swoosh")
  add(T.cta, "pop")
  add(T.ctaTap, "tap")
  add(T.ctaTap + 0.1, "chimeEnd")
  return c.sort((a, b) => a.t - b.t)
})()
