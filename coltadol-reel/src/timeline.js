/*
  The film's one clock. Every scene reads its times from here, and the
  render script exports CUES so the soundtrack lands on the same frames.

  Story: 23:47, the agency is closed, enquiries pile up (amber = waiting)
  → they scatter and get forgotten → the green dot of the logo answers
  → one conversation becomes a qualified lead → a silent prospect comes
  back as a follow-up → 08:00, the director report says who to call
  → end card.
*/

const DURATION = 27.0
const FPS = 30

const T = {
  // S1 — hook
  s1: 0,
  notifs: [0.12, 0.9, 1.52, 2.1],
  notifTimes: ["23:47", "23:58", "00:41", "01:32"],
  k2: 1.5,
  s1Out: 2.85,
  // S2 — the swarm
  s2: 2.85,
  l1: 3.15,
  l2: 4.35,
  l3: 5.55,
  collapse: 6.45,
  // S3 — the answer
  impact: 7.0,
  s3Title: 7.55,
  s3Out: 8.95,
  // S4 — qualification
  s4: 9.1,
  phoneIn: 9.2,
  msgs: { b1: 9.75, a1t: 10.05, a1: 10.35, b2: 10.85, a2t: 11.15, a2: 11.4, b3: 11.85, a3t: 12.15, a3: 12.4 },
  dossierIn: 12.95,
  chipsLand: 13.45,
  score: 14.05,
  qualified: 14.6,
  s4Out: 15.25,
  // S5 — recovery
  s5: 15.25,
  karimIn: 15.65,
  scan: 16.35,
  leaIn: 16.9,
  suggest: 17.3,
  tap: 18.55,
  s5Out: 19.1,
  // S6 — morning
  s6: 19.1,
  clock2Roll: 19.45,
  notif2: 20.15,
  report: 20.75,
  match: 22.15,
  s6Out: 23.05,
  // S7 — end card
  s7: 23.05,
  lockup: 23.45,
  s7Title: 24.15,
  cta: 24.85,
  end: DURATION,
}

/** Sound cues, exported for `scripts/soundtrack.py`. */
const CUES = [
  ...T.notifs.map((t) => ({ t, k: "ping" })),
  ...T.notifs.slice(1).map((t) => ({ t: t + 0.02, k: "tick" })),
  { t: T.s1Out, k: "whoosh" },
  { t: T.l1, k: "thud" },
  { t: T.l2, k: "thud" },
  { t: T.l3, k: "thud" },
  { t: T.l3 + 0.1, k: "riser", d: T.impact - T.l3 - 0.1 },
  { t: T.impact, k: "impact" },
  { t: T.s3Title, k: "shimmer" },
  { t: T.s3Out + 0.1, k: "whoosh" },
  ...["b1", "a1", "b2", "a2", "b3", "a3"].map((m) => ({ t: T.msgs[m], k: m[0] === "b" ? "pop" : "popHi" })),
  { t: T.dossierIn, k: "whoosh" },
  ...[0, 1, 2, 3, 4, 5].map((i) => ({ t: T.chipsLand + 0.06 + i * 0.09, k: "click" })),
  { t: T.score, k: "sweep", d: 0.7 },
  { t: T.qualified, k: "chime" },
  { t: T.s4Out, k: "whoosh" },
  { t: T.scan, k: "scan" },
  { t: T.leaIn, k: "pop" },
  { t: T.suggest + 0.15, k: "type", d: 1.0 },
  { t: T.tap, k: "tap" },
  { t: T.tap + 0.18, k: "chime" },
  { t: T.s5Out, k: "whoosh" },
  { t: T.clock2Roll, k: "roll", d: 0.8 },
  { t: T.notif2, k: "ping2" },
  { t: T.report, k: "whoosh" },
  { t: T.match, k: "chime" },
  { t: T.s6Out, k: "whoosh" },
  { t: T.lockup, k: "impact2" },
  { t: T.cta, k: "chime" },
]
