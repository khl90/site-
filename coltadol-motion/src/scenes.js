/*
  The scenes. `build()` runs once (DOM, measurements); `renderScenes(t)`
  sets every style from t alone. Copy, figures and UI come from the landing
  page (`lib/landing-i18n/fr.ts`) and the console; nothing here is a feature
  the product does not have.
*/

const S = {}

/* ------------------------------------------------------------------ data */

const SWARM_TEXT = [
  "Je peux visiter samedi matin ?",
  "Le prix est-il négociable ?",
  "Une location meublée, c'est possible ?",
  "Quelque chose avec jardin sous 400 000 ?",
  "Toujours dispo, le T2 ?",
  "Vous avez une villa F4 à louer ?",
  "Il y a un parking ?",
  "On cherche plutôt à Villeurbanne.",
  "C'est pour acheter, on a un budget.",
  "Vous pouvez me rappeler demain ?",
  "Visite possible ce week-end ?",
  "Plutôt 3 chambres si possible.",
  "Le loyer, c'est charges comprises ?",
  "Il est encore en vente ?",
  "On doit déménager avant décembre.",
  "L'appartement près du parc est libre ?",
]
const MISSING = ["budget ?", "ville ?", "achat ou location ?", "type de bien ?", "chambres ?", "quand ?", "budget ?", "quartier ?"]

const THREAD = [
  { id: "b1", from: "buyer", time: "23:47", html: 'Bonjour, le <span class="kw" data-kw="type">T3</span> à <span class="kw" data-kw="city">Lyon 6e</span> est toujours disponible ?' },
  { id: "a1", from: "agent", time: "23:47", html: "Bonjour ! Oui, il est disponible. Vous cherchez à acheter ou à louer ?" },
  { id: "b2", from: "buyer", time: "23:48", html: 'À <span class="kw" data-kw="intent">acheter</span>, avant <span class="kw" data-kw="urgency">fin novembre</span> : notre bail se termine.' },
  { id: "a2", from: "agent", time: "23:48", html: "C'est noté. Quel budget envisagez-vous ?" },
  { id: "b3", from: "buyer", time: "23:49", html: 'Entre <span class="kw" data-kw="budget">320 000 et 350 000 €</span>.' },
  { id: "a3", from: "agent", time: "23:49", html: "Merci ! Un conseiller vous contacte rapidement." },
]
// When each keyword is understood.
const KW_AT = { type: T.msgs.b1 + 0.35, city: T.msgs.b1 + 0.5, intent: T.msgs.b2 + 0.3, urgency: T.msgs.b2 + 0.45, budget: T.msgs.b3 + 0.3 }

// Lead file fields, in grid order (the landing's dossier).
const FIELDS = [
  { id: "intent", label: "Projet", value: "Achat" },
  { id: "type", label: "Type de bien", value: "T3" },
  { id: "city", label: "Ville", value: "Lyon 6e" },
  { id: "rooms", label: "Chambres", value: "2" },
  { id: "budget", label: "Budget", value: "320–350 k€" },
  { id: "urgency", label: "Urgence", value: "Haute" },
]
// The data that flies from the conversation into the file.
const CHIPS = [
  { kw: "type", k: "type", v: "T3", fills: ["type", "rooms"], slot: { x: 865, y: 690 } },
  { kw: "city", k: "ville", v: "Lyon 6e", fills: ["city"], slot: { x: 895, y: 800 } },
  { kw: "intent", k: "projet", v: "achat", fills: ["intent"], slot: { x: 870, y: 960 } },
  { kw: "urgency", k: "urgence", v: "haute", fills: ["urgency"], slot: { x: 900, y: 1070 } },
  { kw: "budget", k: "budget", v: "320–350 k€", fills: ["budget"], slot: { x: 860, y: 1250 } },
]
const MISSING_FIELDS = [
  { f: "type", text: "type de bien" },
  { f: "city", text: "ville" },
  { f: "intent", text: "achat ou location" },
  { f: "budget", text: "budget" },
]

// The console's lead list. `slot` is where each arrives; then they sort by score.
const LEADS = [
  { who: "+33 6 •• •• 41 18", what: "Achat · T3 · Lyon 6e", score: 92, prio: "high", slot: 1, card: true },
  { who: "Karim B.", what: "Achat · T4 · Villeurbanne", score: 78, prio: "high", slot: 3, karim: true },
  { who: "Sarah M.", what: "Location · T4 · Villeurbanne", score: 74, prio: "high", slot: 5 },
  { who: "Léa D.", what: "Location · T2 · Lyon 3e", score: 64, prio: "medium", slot: 0 },
  { who: "+33 7 •• •• 09 52", what: "Achat · maison · Écully", score: 61, prio: "medium", slot: 4 },
  { who: "Marc T.", what: "Location · studio · Lyon 1er", score: 38, prio: "low", slot: 2 },
]
const PRIO_LABEL = { high: "Chaud", medium: "Tiède", low: "Froid" }
const SUGGESTION = "Bonjour Karim, désolé pour l'attente ! Le T4 à Villeurbanne est toujours disponible. Un appel demain à 18 h ?"

const CHECK = '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="#5ce6a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
const RING_C = 2 * Math.PI * 52

/* ================================================================= BUILD */

function build() {
  // Scenes are laid out (but not shown) while they are measured.
  $$(".scene").forEach((s) => {
    s.style.display = "block"
    s.style.visibility = "hidden"
  })
  $$(".split, .split-words").forEach(splitText)
  ;["#p-l1", "#p-l2", "#p-l3", "#turn-title", "#e-title"].forEach((s) => fitText($(s), 990))
  ;["#q-title", "#o-title", "#r-title", "#m-title"].forEach((s) => fitText($(s), 952))

  /* HOOK */
  makeOdo($("#clock1"), [
    [-1, "22:58"],
    [T.clock, "23:47"],
  ])
  S.b0 = $("#bubble0")
  S.b0h = S.b0.offsetHeight

  /* PROBLEM: bubbles come out of windows that light up in view. */
  S.swarm = CITY.anchors(10, T.pull + 0.3, T.die - 0.5).map((a, i) => {
    const el = h("div", "sb", `${SWARM_TEXT[i % SWARM_TEXT.length]}<p class="meta"><span class="dot lamp"></span>en attente</p>`, $("#swarm"))
    return { ...a, el, h: el.offsetHeight, rot: (((i * 7919) % 13) - 6) * 0.9, side: i % 2 ? 1 : -1 }
  })
  S.misses = S.swarm.slice(0, 8).map((b, i) => ({ b, el: h("span", "miss", MISSING[i], $("#swarm")), t0: T.scatter + i * 0.07, ang: -Math.PI / 2 + (i - 3.5) * 0.7 }))
  S.misses.forEach((m) => (m.w = m.el.offsetWidth))

  /* TURN */
  $("#mark-big").innerHTML = markSVG(320)
  S.mRing = $("#mark-big .m-ring")
  S.mRingLen = S.mRing.getTotalLength()
  S.mRing.setAttribute("stroke-dasharray", S.mRingLen)

  /* QUALIFY */
  S.msgs = THREAD.map((m) => {
    let typing = null
    if (m.from === "agent") typing = h("div", "msg agent", '<div class="row"><span class="typing"><i></i><i></i><i></i></span></div>', $("#thread"))
    const el = h("div", `msg ${m.from}`, `<div class="row"><p>${m.html}<span class="time">${m.time}${m.from === "agent" ? " ✓✓" : ""}</span></p></div>`, $("#thread"))
    return { ...m, el, typing, h: el.offsetHeight, th: typing ? typing.offsetHeight : 0 }
  })
  S.kw = Object.fromEntries($$(".kw").map((k) => [k.dataset.kw, k]))
  S.fields = Object.fromEntries(
    FIELDS.map((f) => {
      const el = h("div", "field", `<dt>${f.label}</dt><dd><span class="empty">—</span><span class="val">${CHECK}<span>${f.value}</span></span></dd>`, $("#fields"))
      return [f.id, { ...f, el, empty: $(".empty", el), val: $(".val", el) }]
    })
  )
  $("#missing").innerHTML = MISSING_FIELDS.map((m) => `<span class="miss" data-f="${m.f}">${m.text}</span>`).join("") + '<span id="none-missing" class="hl">✓ Rien ne manque</span>'
  S.chips = CHIPS.map((c, i) => {
    const el = h("div", "chip", `<span class="k">${c.k}</span><span>${c.v}</span>`, $("#qchips"))
    return { ...c, el, i, w: el.offsetWidth, h: el.offsetHeight, born: KW_AT[c.kw] + 0.08, land: T.land + i * 0.09 }
  })
  // Which chip fills which field, and when.
  S.fillAt = {}
  S.chips.forEach((c) => c.fills.forEach((f, j) => (S.fillAt[f] = c.land + 0.45 + j * 0.12)))
  $("#ring-arc").setAttribute("stroke-dasharray", RING_C)

  /* ORGANIZE */
  $("#k-logo").innerHTML = lockupSVG("klk")
  const order = [...LEADS].sort((a, b) => b.score - a.score)
  S.leads = LEADS.map((l, i) => {
    const el = h(
      "div",
      "lrow",
      `<div class="sring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgb(143 152 198 / 0.16)" stroke-width="11"/><circle class="arc" cx="60" cy="60" r="52" fill="none" stroke="${l.prio === "high" ? "#ffb347" : l.prio === "medium" ? "#5ce6a5" : "#8f98c6"}" stroke-width="11" stroke-linecap="round" stroke-dasharray="${RING_C}" stroke-dashoffset="${RING_C}" transform="rotate(-90 60 60)"/></svg><b>0</b></div>
      <div class="grow"><p class="who">${l.who}</p><p class="what">${l.what}</p>${l.karim ? '<p class="what flag-line lamp">Sans réponse depuis 24 h</p>' : ""}</div>
      <span class="pill prio ${l.prio}">${PRIO_LABEL[l.prio]}</span>`,
      $("#rows")
    )
    return {
      ...l,
      el,
      arc: $(".arc", el),
      num: $(".sring b", el),
      what: $(".what", el),
      flag: $(".flag-line", el),
      rank: order.indexOf(l),
      // A lit window somewhere in the frame, where this lead comes from.
      from: { x: [140, 960, 220, 900, 520, 300][i], y: [280, 420, 1700, 1600, 200, 1780][i] },
      t0: l.card ? T.qOut + 0.5 : T.rows + [0, 0.32, 0.1, 0.44, 0.22, 0.54][i],
    }
  })
  $("#rl-text").textContent = SUGGESTION

  /* MORNING */
  makeOdo($("#clock2"), [
    [-1, "23:47"],
    [T.roll, "08:00", 1],
  ])
  $("#notif-icon").innerHTML = markSVG(70)
  S.metrics = $$("#report [data-n]")
  $("#prio").innerHTML = [LEADS[0], LEADS[2]]
    .map((l) => `<div class="prio-row"><span class="sc ${l.prio === "high" ? "hot" : "warm"}">${l.score}</span><div><p class="who">${l.who}</p><p class="what">${l.what}</p></div><span class="pill prio high" style="margin-left:auto">${PRIO_LABEL[l.prio]}</span></div>`)
    .join("")
  S.prioRows = $$("#prio .prio-row")
  $("#match-arc").setAttribute("stroke-dasharray", RING_C)

  /* END */
  $("#lockup").innerHTML = lockupSVG("lk")
  S.lkRing = $("#lockup .m-ring")
  S.lkLen = S.lkRing.getTotalLength()
  S.lkRing.setAttribute("stroke-dasharray", S.lkLen)

  $$(".scene").forEach((s) => {
    s.style.display = "none"
    s.style.visibility = ""
  })

  // The lead file's flight into the list: measured once, from the states
  // the film is in just before and just after it.
  renderScenes(T.qOut - 0.001)
  S.cardRect = rectOf($("#card"))
  const fly = $("#card").cloneNode(true)
  fly.removeAttribute("id")
  $$("[id]", fly).forEach((n) => n.removeAttribute("id"))
  fly.style.cssText += ";left:0;top:0;margin:0;transform-origin:0 0;"
  $("#flyer").append(fly)
  S.fly = fly
  // The row itself is still hidden then: aim at its slot in the list.
  renderScenes(T.qOut + 0.62)
  const rr = rectOf($("#rows"))
  const k = rr.h / 600
  const slot = LEADS[0].slot
  S.row0Rect = { x: rr.x, w: rr.w, y: rr.y + slot * 102 * k, h: 92 * k, cy: rr.y + (slot * 102 + 46) * k }
  renderScenes(0)
}

/* ================================================================ RENDER */

function sceneOn(id, t, a, b) {
  const on = t >= a && t < b
  show($(id), on)
  return on
}

function renderScenes(t) {
  hook(t)
  problem(t)
  turn(t)
  portal(t)
  qualify(t)
  flyer(t)
  desk(t)
  morning(t)
  end(t)
  backdrop(t)
}

/* --------------------------------------------------------------- backdrop */

function backdrop(t) {
  // The city steps back (darker, out of focus) while the console is on.
  const veil = kf(t, [
    [0, 0],
    [T.portal, 0],
    [T.portal + 0.35, 0.66],
    [T.rOut, 0.66],
    [T.dawn + 0.7, 0.12],
    [T.mOut, 0.2],
    [T.lockup + 0.5, 0.58],
  ])
  set($("#veil"), "opacity", f3(veil))
  // A dark pool behind the big centred titles.
  const sc = Math.max(
    pulse(t, T.l1 - 0.1, 0.4, T.collapse, 0.3),
    pulse(t, T.turnTitle - 0.1, 0.4, T.dive, 0.3),
    pulse(t, T.tagline - 0.2, 0.6, 99, 1)
  )
  set($("#scrim"), "opacity", f3(sc))
  set($("#scrim"), "--scrim-y", t < T.impact ? "47%" : t < T.portal ? "62%" : "56%")
  set($("#scrim"), "--scrim-h", t < T.impact ? "15%" : t < T.portal ? "22%" : "30%")
  const cap = pulse(t, T.portal + 0.5, 0.4, T.mOut - 0.3, 0.3)
  show($("#caption"), cap > 0)
  set($("#caption"), "opacity", f3(cap))
}

/* ------------------------------------------------------------------ HOOK */

function hook(t) {
  if (!sceneOn("#hook", t, -1, T.pull + 0.9)) return
  const away = E.inOutCubic(prog(t, T.pull, T.pull + 0.7))

  // 22:58 rolls to 23:47.
  const c = $("#clock1")
  const ci = E.outExpo(prog(t, T.clock - 0.25, T.clock + 0.55))
  set(c, "opacity", f3(ci * (1 - away)))
  set(c, "transform", `translate3d(0,${f2((1 - ci) * 70 - away * 60)}px,0) scale(${f3(lerp(1.18, 1, ci) * lerp(1, 0.7, away))})`)
  set(c, "filter", ci < 1 || away > 0 ? `blur(${f2((1 - ci) * 22 + away * 14)}px)` : "none")
  odoAt(c, t, 0.75)

  focusIn($("#hook-line"), t, T.hookLine, { out: T.pull + 0.05, outDur: 0.35, stagger: 0.09 })

  // The enquiry comes out of the lit window… and goes back into it.
  const b = S.b0
  const pop = E.outBack(prog(t, T.bubble, T.bubble + 0.45), 1.4)
  const float = Math.sin(t * 2.2) * 6
  let x = 150
  let y = 960 - S.b0h / 2 + float
  let sx = lerp(0.16, 1, pop)
  let sy = sx
  let o = clamp(prog(t, T.bubble, T.bubble + 0.12))
  const back = E.inOutCubic(prog(t, T.pull, T.pull + 0.55))
  if (back > 0) {
    const r = CITY.w0Rect(t)
    if (r) {
      x = lerp(150, r.x, back)
      y = lerp(y, r.y, back)
      sx = lerp(1, r.w / 780, back)
      sy = lerp(1, r.h / S.b0h, back)
      o *= 1 - E.inCubic(prog(back, 0.55, 1))
    }
  }
  show(b, o > 0.01)
  set(b, "opacity", f3(o))
  set(b, "transformOrigin", back > 0 ? "0 0" : "50% 60%")
  set(b, "left", back > 0 ? "0px" : "150px")
  set(b, "top", back > 0 ? "0px" : `${f2(960 - S.b0h / 2)}px`)
  set(b, "transform", back > 0 ? `translate3d(${f2(x)}px,${f2(y)}px,0) scale(${f3(sx)},${f3(sy)})` : `translate3d(0,${f2(float + (1 - pop) * 40)}px,0) scale(${f3(sx)})`)
  set(b, "filter", back > 0.3 ? `blur(${f2((back - 0.3) * 10)}px)` : "none")
  // "en attente" ticks like a clock nobody watches.
  $("#b0-wait").textContent = t < T.hookLine + 0.3 ? "en attente" : "en attente · personne ne répond"

  // The window's light, through the bubble, and the ping rippling out of it.
  if (t < T.pull + 0.3) {
    const k = pulse(t, T.win, 0.06, T.pull, 0.3)
    FX.flare(540, 960, 520 + 30 * Math.sin(t * 3), "255,179,71", 0.32 * k)
    FX.flare(540, 960, 160, "255,214,150", 0.5 * k * (1 - prog(t, 0, 0.3)) + 0.12 * k)
    for (const d of [0, 0.16]) {
      const q = prog(t, T.win + d, T.win + d + 0.8)
      if (q > 0 && q < 1) FX.ring(540, 960, 90 + E.outCubic(q) * 520, 3, "255,179,71", 0.6 * (1 - q))
    }
  }
}

/* --------------------------------------------------------------- PROBLEM */

function problem(t) {
  if (!sceneOn("#problem", t, T.pull, T.impact + 0.05)) return
  CITY.useCam(CITY.camAt(t))
  const forget = E.inOutCubic(prog(t, T.die, T.die + 0.9))
  const scatter = E.outCubic(prog(t, T.scatter, T.scatter + 1.1))
  const col = E.inExpo(prog(t, T.collapse, T.impact))

  for (const b of S.swarm) {
    const age = t - b.t
    if (age < 0 || col >= 1) {
      show(b.el, false)
      continue
    }
    // Out of the window and towards the lens, drifting apart.
    const lift = 1700 * E.outCubic(clamp(age / 2.6)) + age * 260
    const fall = b.dies ? forget * 520 : 0
    const p = CITY.proj(b.w.x + b.side * age * 70 + b.side * scatter * 300, b.w.y + 140 + lift * 0.18 - fall, b.w.z - 220 - lift)
    if (!p) {
      show(b.el, false)
      continue
    }
    const pop = E.outBack(prog(age, 0, 0.38), 1.6)
    let s = ((520 * p.k) / 560) * pop
    let x = p.x
    let y = p.y
    x = lerp(x, 540, col)
    y = lerp(y, 960, col)
    s *= 1 - col * 0.85
    let o = clamp(age / 0.12) * clamp((p.z - 260) / 300) * (1 - col)
    o *= b.dies ? 1 - forget : 1 - forget * 0.45
    if (o < 0.01 || s < 0.02) {
      show(b.el, false)
      continue
    }
    show(b.el, true)
    const blur = Math.min(10, Math.abs(p.z - 1000) / 260) + (b.dies ? forget * 6 : 0)
    set(b.el, "opacity", f3(o))
    set(b.el, "transform", `translate3d(${f2(x - 280 * s)}px,${f2(y - (b.h / 2) * s)}px,0) scale(${f3(s)}) rotate(${f2(b.rot * (1 + scatter * 1.5) * (1 - col))}deg)`)
    set(b.el, "filter", `blur(${f2(blur)}px) grayscale(${f2(forget * (b.dies ? 1 : 0.6))})`)
    set(b.el, "zIndex", String(Math.round(10000 - p.z)))
    b.sx = x
    b.sy = y
  }

  // The needs come apart: what nobody asked yet drifts off.
  for (const m of S.misses) {
    const a = E.outCubic(prog(t, m.t0, m.t0 + 1.2))
    const o = pulse(t, m.t0, 0.2, T.die + 0.2, 0.5) * (1 - col)
    if (o < 0.01 || m.b.sx === undefined) {
      show(m.el, false)
      continue
    }
    show(m.el, true)
    const r = 120 + 260 * a
    const x = lerp(clamp(m.b.sx + Math.cos(m.ang) * r, 30 + m.w / 2, 1050 - m.w / 2), 540, col)
    const y = lerp(clamp(m.b.sy + Math.sin(m.ang) * r * 0.8 - 40, 300, 1560), 960, col)
    set(m.el, "opacity", f3(o))
    set(m.el, "transform", `translate3d(${f2(x - m.w / 2)}px,${f2(y)}px,0) rotate(${f2((m.ang + Math.PI / 2) * 8)}deg) scale(${f3(lerp(0.6, 1, E.outBack(prog(t, m.t0, m.t0 + 0.4))))})`)
    set(m.el, "zIndex", "20000")
  }

  rise($("#p-l1"), t, T.l1, { out: T.l2 - 0.18 })
  rise($("#p-l2"), t, T.l2, { out: T.l3 - 0.18 })
  rise($("#p-l3"), t, T.l3, { out: T.collapse - 0.05 })
  // "s'oublient." goes out like the windows do.
  $$("#p-l3 .hl-lamp").forEach((c, i) => {
    const s = t - (T.die + 0.35 + i * 0.05)
    const flick = s < 0 ? 1 : s < 0.4 ? [1, 0.3, 0.9, 0.2, 0.7, 0.35, 0.5, 0.35][Math.floor(s * 20)] : 0.35
    set(c, "opacity", f3(flick))
  })

  FX.converge(540, 960, prog(t, T.collapse - 0.1, T.impact), "255,179,71")
}

/* ------------------------------------------------------------------ TURN */

// The mark is 320 px; its dot sits at (26.2, 15) of 32 → (262, 150) px.
const MARK_DOT = { x: 262, y: 150 }
const MARK_END = { x: 540 - 160, y: 610 }

function turn(t) {
  if (!sceneOn("#turn", t, T.impact - 0.2, T.portal)) return
  const m = $("#mark-big")
  const settle = E.inOutQuint(prog(t, T.impact + 0.45, T.impact + 1.05))
  const dive = E.inExpo(prog(t, T.dive, T.dive + 0.42))
  const x0 = 540 - MARK_DOT.x
  const y0 = 960 - MARK_DOT.y
  const x = lerp(x0, MARK_END.x, settle)
  const y = lerp(y0, MARK_END.y, settle)
  const s = lerp(1, 2.6, dive)
  // Scale about the mark's centre on the way out.
  set(m, "transform", `translate3d(${f2(x - 160 * (s - 1))}px,${f2(y - 160 * (s - 1))}px,0) scale(${f3(s)})`)
  set(m, "opacity", f3(1 - dive))
  set(m, "filter", dive > 0 ? `blur(${f2(dive * 16)}px)` : "none")

  const dot = E.outBack(prog(t, T.impact - 0.08, T.impact + 0.16), 2.2)
  $("#mark-big .m-dot").setAttribute("r", f3(Math.max(0.001, 3.8 * dot)))
  const draw = E.outExpo(prog(t, T.impact + 0.05, T.impact + 0.75))
  S.mRing.setAttribute("stroke-dashoffset", f2(S.mRingLen * (1 - draw)))
  const tail = E.outBack(prog(t, T.impact + 0.35, T.impact + 0.65), 2)
  const tailEl = $("#mark-big .m-tail")
  set(tailEl, "transform", `scale(${f3(tail)})`)
  set(tailEl, "transformOrigin", "7px 22px")

  // The answer's light.
  const dt = t - T.impact
  const dotX = x + MARK_DOT.x
  const dotY = y + MARK_DOT.y
  if (dt > -0.12 && t < T.dive + 0.3) {
    const pre = dt < 0 ? prog(t, T.impact - 0.12, T.impact) : 1
    FX.flare(dotX, dotY, 90 + 760 * E.outExpo(clamp(dt / 0.9)), "92,230,165", pre * (dt < 0 ? 0.5 : Math.max(0.22, 1 - dt / 0.7)) * (1 - dive))
    FX.flare(dotX, dotY, 160, "236,255,246", (dt < 0 ? pre : Math.max(0, 1 - dt / 0.3)) * 0.95)
    if (dt > 0) {
      FX.ring(540, 960, 40 + 1500 * E.outCubic(clamp(dt / 1.2)), 10 * (1 - clamp(dt / 1.2)) + 1, "92,230,165", 0.85 * (1 - clamp(dt / 1.2)))
      FX.ring(540, 960, 20 + 1000 * E.outCubic(clamp((dt - 0.1) / 1.1)), 3, "238,240,250", 0.45 * (1 - clamp((dt - 0.1) / 1.1)) * (dt > 0.1 ? 1 : 0))
      FX.burst(FX.SPARKS.impact, 540, 960, dt)
    }
  }

  rise($("#turn-title"), t, T.turnTitle, { out: T.dive - 0.1, outDur: 0.35 })
  focusIn($("#turn-sub"), t, T.turnSub, { out: T.dive - 0.15, outDur: 0.3 })
  FX.zoomLines(Math.sin(prog(t, T.dive, T.portal + 0.15) * Math.PI) * prog(t, T.dive, T.dive + 0.2))
}

/* ---------------------------------------------------------------- PORTAL */

const PHONE = { x: 80, y: 560, w: 640, h: 880 }

function portal(t) {
  const el = $("#portal")
  const on = t >= T.dive + 0.32 && t < T.portal + 0.28
  show(el, on)
  if (!on) return
  let r
  let radius = 6
  let col = [92, 230, 165]
  if (t < T.portal) {
    r = CITY.w0Rect(t)
    if (!r) return show(el, false)
    // The window's own light, so the hand-off is invisible.
    set(el, "opacity", f3(prog(t, T.dive + 0.32, T.dive + 0.42)))
  } else {
    const p = E.outQuart(prog(t, T.portal, T.portal + 0.55))
    r = { x: lerp(0, PHONE.x, p), y: lerp(0, PHONE.y, p), w: lerp(1080, PHONE.w, p), h: lerp(1920, PHONE.h, p) }
    radius = lerp(0, 52, p)
    const c = E.outCubic(prog(t, T.portal, T.portal + 0.2))
    col = col.map((v, i) => Math.round(lerp(v, [17, 26, 66][i], c)))
    set(el, "opacity", f3(1 - prog(t, T.portal + 0.12, T.portal + 0.28)))
  }
  set(el, "left", `${f2(r.x)}px`)
  set(el, "top", `${f2(r.y)}px`)
  set(el, "width", `${f2(r.w)}px`)
  set(el, "height", `${f2(r.h)}px`)
  set(el, "borderRadius", `${f2(radius)}px`)
  set(el, "background", `rgb(${col.join(",")})`)
  if (t < T.portal + 0.2) FX.flare(r.x + r.w / 2, r.y + r.h / 2, Math.max(r.w, r.h) * 1.1, "92,230,165", 0.5 * (1 - prog(t, T.portal, T.portal + 0.2)))
}

/* --------------------------------------------------------------- QUALIFY */

function qsetTransform(t) {
  const pan = E.inOutCubic(prog(t, T.pan, T.pan + 0.8))
  const settle = E.inOutCubic(prog(t, T.pan + 0.8, T.qOut - 0.05))
  const ry = lerp(0, -12, pan) * (1 - settle) + Math.sin(pan * Math.PI) * -6
  const tz = Math.sin(pan * Math.PI) * -260
  return `translate3d(${f2(-905 * pan)}px,0,${f2(tz)}px) rotateY(${f2(ry)}deg)`
}

function qualify(t) {
  if (!sceneOn("#qualify", t, T.portal, T.qOut + 0.75)) return

  block($("#q-kicker"), t, T.qTitle, 0.6, T.qOut - 0.3, 0.3, { dy: 20 })
  rise($("#q-title"), t, T.qTitle + 0.05, { stagger: 0.012, out: T.qOut - 0.3, outStagger: 0.004 })

  const qset = $("#qset")
  set(qset, "transform", qsetTransform(t))
  set(qset, "transformOrigin", "1460px 1000px")
  const phoneIn = prog(t, T.portal + 0.05, T.portal + 0.2)
  set($("#phone"), "opacity", f3(phoneIn))

  /* The conversation: each message grows the thread from the bottom. */
  for (const m of S.msgs) {
    const t0 = T.msgs[m.id]
    if (m.typing) {
      const tt = T.msgs[m.id + "t"]
      const ta = E.outCubic(prog(t, tt, tt + 0.12)) * (1 - E.inCubic(prog(t, t0 - 0.06, t0)))
      show(m.typing, ta > 0.001)
      set(m.typing, "height", `${f2(m.th * ta)}px`)
      set(m.typing, "opacity", f3(ta))
      $$("i", m.typing).forEach((d, i) => set(d, "transform", `translateY(${f2(-7 * Math.max(0, Math.sin(t * 13 - i * 0.9)))}px)`))
    }
    const a = E.outExpo(prog(t, t0, t0 + 0.4))
    show(m.el, a > 0.001)
    set(m.el, "height", `${f2(m.h * a)}px`)
    const p = $("p", m.el)
    set(p, "transform", `translate3d(0,${f2((1 - a) * 30)}px,0) scale(${f3(lerp(0.86, 1, a))})`)
    set(p, "transformOrigin", m.from === "agent" ? "100% 100%" : "0 100%")
    set(p, "opacity", f3(clamp(a * 1.5)))
  }
  for (const [id, at] of Object.entries(KW_AT)) {
    const p = E.outCubic(prog(t, at, at + 0.3))
    set(S.kw[id], "backgroundSize", `${f2(p * 100)}% 100%`)
    set(S.kw[id], "color", p > 0.3 ? "#5ce6a5" : "")
    set(S.kw[id], "fontWeight", p > 0.3 ? "700" : "")
  }

  /* The lead file. */
  const card = $("#card")
  const cin = E.outExpo(prog(t, T.portal + 0.5, T.portal + 1.1))
  set(card, "opacity", f3(cin * (t < T.qOut ? 1 : 0)))
  for (const f of Object.values(S.fields)) {
    const at = S.fillAt[f.id]
    const fill = prog(t, at, at + 0.16)
    set(f.empty, "opacity", f3(1 - fill))
    set(f.val, "opacity", f3(fill))
    set(f.val, "transform", `translateY(${f2((1 - E.outBack(fill)) * 14)}px)`)
    const flash = Math.max(0, 1 - Math.abs(t - at - 0.08) / 0.3)
    set(f.el, "borderColor", flash > 0 ? `rgba(92,230,165,${f3(0.16 + flash * 0.75)})` : "")
    set(f.el, "boxShadow", flash > 0 ? `0 0 ${Math.round(46 * flash)}px rgba(92,230,165,${f3(0.5 * flash)})` : "none")
  }
  $$("#missing .miss").forEach((el) => {
    const at = S.fillAt[el.dataset.f]
    const g = E.inCubic(prog(t, at, at + 0.2))
    show(el, g < 1)
    set(el, "opacity", f3(1 - g))
    set(el, "transform", `scale(${f3(lerp(1, 0.5, g))})`)
  })
  const none = prog(t, S.fillAt.budget + 0.15, S.fillAt.budget + 0.4)
  show($("#none-missing"), none > 0)
  set($("#none-missing"), "opacity", f3(none))

  const sp = E.outCubic(prog(t, T.score, T.score + 0.7))
  const score = Math.round(92 * sp)
  $("#ring-num").textContent = score
  $("#ring-arc").setAttribute("stroke-dashoffset", f2(RING_C * (1 - 0.92 * sp)))
  const hotRing = prog(t, T.score + 0.3, T.score + 0.45) // score passes 70
  $("#ring-arc").setAttribute("stroke", hotRing > 0.5 ? "#ffb347" : "#5ce6a5")
  const hot = E.outBack(prog(t, T.hot, T.hot + 0.35), 2)
  set($("#hot"), "transform", `scale(${f3(hot)})`)
  set($("#hot"), "opacity", f3(clamp(hot * 2)))
  const ok = t >= T.qualified
  set($("#st-new"), "opacity", ok ? "0" : "1")
  set($("#st-ok"), "opacity", ok ? "1" : "0")
  set($("#mode-a"), "opacity", ok ? "0" : "1")
  set($("#mode-b"), "opacity", ok ? "1" : "0")
  if (t > T.qualified && t < T.qualified + 0.7 && t < T.qOut) {
    const r = rectOf($("#ring"))
    const q = prog(t, T.qualified, T.qualified + 0.7)
    FX.ring(r.cx, r.cy, r.w * 0.5 + q * 170, 4, "255,179,71", 0.75 * (1 - q))
  }

  /* Data chips: born on their keyword, carried along, landed in their field. */
  for (const c of S.chips) {
    const landed = E.inOutCubic(prog(t, c.land, c.land + 0.48))
    const v = t >= c.born && landed < 1 && t < T.qOut
    show(c.el, v)
    if (!v) continue
    const kw = rectOf(S.kw[c.kw])
    const birth = E.outExpo(prog(t, c.born, c.born + 0.6))
    const src = { x: kw.cx, y: kw.cy }
    const slot = { x: c.slot.x, y: c.slot.y }
    const ctl = { x: lerp(src.x, slot.x, 0.5), y: Math.min(src.y, slot.y) - 180 }
    let p = qbez(src, ctl, slot, birth)
    p.y += Math.sin(t * 2.6 + c.i) * 7 * birth
    const pts = []
    for (let s = 7; s >= 0; s--) pts.push(qbez(src, ctl, slot, E.outExpo(prog(t - s * 0.02, c.born, c.born + 0.6))))
    if (landed > 0) {
      const dst = rectOf(S.fields[c.fills[0]].val)
      const d = { x: dst.x + Math.min(dst.w, 180) / 2 + 30, y: dst.cy }
      const ctl2 = { x: lerp(p.x, d.x, 0.5) + 60, y: Math.min(p.y, d.y) - 140 }
      const from = { ...p }
      p = qbez(from, ctl2, d, landed)
      pts.length = 0
      for (let s = 7; s >= 0; s--) pts.push(qbez(from, ctl2, d, E.inOutCubic(prog(t - s * 0.018, c.land, c.land + 0.48))))
    }
    FX.trail(pts, "92,230,165", 9)
    const sc = lerp(0.35, 1, birth) * lerp(1, 0.7, landed)
    set(c.el, "transform", `translate3d(${f2(p.x - c.w / 2)}px,${f2(p.y - c.h / 2)}px,0) scale(${f3(sc)})`)
    set(c.el, "opacity", f3(clamp(birth * 2) * (1 - E.inCubic(prog(landed, 0.7, 1)))))
    if (landed > 0.85) FX.flare(p.x, p.y, 140, "92,230,165", (landed - 0.85) * 5)
  }

  // The phone steps back as the file leaves.
  const out = E.inCubic(prog(t, T.qOut, T.qOut + 0.5))
  set($("#phone"), "filter", out > 0 ? `blur(${f2(out * 10)}px)` : "none")
  set(qset, "opacity", f3(1 - out))
}

/* ----------------------------------------------------------------- FLYER */

/** The lead file's flight into its row of the console (outside any scene). */
function flyer(t) {
  const fly = S.fly
  const fp = prog(t, T.qOut, T.qOut + 0.6)
  show($("#flyer"), fp > 0 && fp < 1)
  if (!fly || fp <= 0 || fp >= 1) return
  const e = E.inOutQuart(fp)
  const a = S.cardRect
  const b = S.row0Rect
  const s = lerp(1, b.w / a.w, e)
  const sy = lerp(1, (b.h / a.h) * 1.6, e)
  const x = lerp(a.x, b.x, e)
  const y = lerp(a.y, b.cy - (a.h * sy) / 2, e)
  set(fly, "transform", `translate3d(${f2(x)}px,${f2(y)}px,0) scale(${f3(s)},${f3(sy)})`)
  set(fly, "opacity", f3(1 - E.inCubic(prog(fp, 0.6, 1))))
  set(fly, "filter", `blur(${f2(Math.sin(fp * Math.PI) * 6)}px)`)
  FX.flare(x + (a.w * s) / 2, y + (a.h * sy) / 2, 300, "92,230,165", 0.25 * Math.sin(fp * Math.PI))
}

/* ---------------------------------------------------- ORGANIZE + RECOVERY */

function consoleTransform(t) {
  const cin = E.outExpo(prog(t, T.console, T.console + 0.95))
  const drift = prog(t, T.console + 0.95, T.rOut)
  const back = E.inOutCubic(prog(t, T.rPanel, T.rPanel + 0.6))
  const ex = E.inExpo(prog(t, T.rOut - 0.05, T.rOut + 0.5))
  const rx = lerp(30, 11, cin) - 5 * drift
  const rz = lerp(-7, -1.5, cin) + 1.5 * drift
  const ty = lerp(480, 0, cin) - 900 * ex
  const tz = lerp(-520, 0, cin) - 170 * back - 700 * ex
  const fade = 1 - E.inCubic(prog(t, T.rOut - 0.1, T.rOut + 0.25))
  return { tf: `translate3d(0,${f2(ty)}px,${f2(tz)}px) rotateX(${f2(rx)}deg) rotateZ(${f2(rz)}deg)`, o: cin * (1 - 0.45 * back) * fade, back, ex }
}

function desk(t) {
  if (!sceneOn("#desk", t, T.console, T.rOut + 0.6)) return
  const k = consoleTransform(t)
  const con = $("#console")
  set(con, "transform", k.tf)
  set(con, "opacity", f3(clamp(k.o * 1.4)))
  set(con, "filter", k.back > 0.01 || k.ex > 0.01 ? `blur(${f2(k.back * 2.5 + k.ex * 12)}px)` : "none")
  set(con, "--rim-a", `${f2((t * 150) % 360)}deg`)
  set(con, "--rim-o", f3(0.9 * pulse(t, T.console + 0.25, 0.4, T.sort + 0.9, 0.6)))

  block($("#o-kicker"), t, T.oTitle, 0.6, T.rTitle - 0.4, 0.25, { dy: 20 })
  rise($("#o-title"), t, T.oTitle + 0.05, { stagger: 0.012, out: T.rTitle - 0.4, outStagger: 0.004 })
  block($("#r-kicker"), t, T.rTitle, 0.6, T.rOut - 0.1, 0.3, { dy: 20 })
  rise($("#r-title"), t, T.rTitle + 0.1, { stagger: 0.012, out: T.rOut - 0.2, outStagger: 0.004 })

  /* Rows: each arrives as a light from the city, opens into a lead, then
     the list sorts itself by score. */
  for (const l of S.leads) {
    const p = prog(t, l.t0, l.t0 + 0.55)
    show(l.el, p > 0.35)
    const sort = E.inOutCubic(prog(t, T.sort + l.rank * 0.05, T.sort + 0.55 + l.rank * 0.05))
    const y = lerp(l.slot, l.rank, sort) * 102
    const lift = Math.sin(sort * Math.PI) * (l.rank < l.slot ? 1 : 0)
    const open = E.outExpo(prog(p, 0.35, 1))
    set(l.el, "transform", `translate3d(0,${f2(y)}px,${f2(lift * 40)}px) scale(${f3(lerp(0.3, 1, open) + lift * 0.02)},${f3(lerp(0.5, 1, open))})`)
    set(l.el, "transformOrigin", "0 50%")
    set(l.el, "opacity", f3(open))
    set(l.el, "zIndex", String(lift > 0 ? 5 : 1))
    if (p > 0 && p < 0.6 && !l.card) {
      // The light that becomes the row.
      const r = rectOf($("#rows"))
      const dst = { x: r.x + 50, y: r.y + l.slot * 102 + 46 }
      const q = E.inOutCubic(prog(p, 0, 0.55))
      const pts = []
      for (let s = 6; s >= 0; s--) {
        const qq = E.inOutCubic(clamp(prog(p, 0, 0.55) - s * 0.04))
        pts.push({ x: lerp(l.from.x, dst.x, qq), y: lerp(l.from.y, dst.y, qq) })
      }
      FX.trail(pts, "92,230,165", 12)
      FX.flare(lerp(l.from.x, dst.x, q), lerp(l.from.y, dst.y, q), 90, "92,230,165", 0.7)
    }
    const sp = E.outCubic(prog(t, l.t0 + 0.25, l.t0 + 0.95))
    l.num.textContent = Math.round(l.score * sp)
    l.arc.setAttribute("stroke-dashoffset", f2(RING_C * (1 - (l.score / 100) * sp)))
    if (l.card) {
      const fl = Math.max(0, 1 - Math.abs(t - (l.t0 + 0.12)) / 0.35)
      set(l.el, "borderColor", fl > 0 ? `rgba(92,230,165,${f3(0.16 + fl * 0.7)})` : "")
      set(l.el, "boxShadow", fl > 0 ? `0 0 ${Math.round(50 * fl)}px rgba(92,230,165,${f3(0.45 * fl)})` : "none")
    }
    if (l.karim) {
      // Spotted: no reply from the agency for 24 h.
      const f = E.outCubic(prog(t, T.flag + 0.25, T.flag + 0.5))
      show(l.what, f < 1)
      show(l.flag, f > 0)
      set(l.flag, "opacity", f3(f))
      const glow = pulse(t, T.flag + 0.2, 0.3, T.tap + 0.1, 0.4)
      set(l.el, "borderColor", glow > 0 ? `rgba(255,179,71,${f3(0.2 + 0.6 * glow)})` : "")
      set(l.el, "background", glow > 0 ? `rgba(255,179,71,${f3(0.08 * glow)})` : "")
      if (t > T.flag && t < T.flag + 0.55) FX.scan(rectOf(l.el), prog(t, T.flag, T.flag + 0.5))
    }
  }
  const badge = $("#k-badge")
  const bp = Math.max(0, 1 - Math.abs(t - T.flag - 0.35) / 0.25)
  set(badge, "transform", `scale(${f3(1 + bp * 0.45)})`)

  /* The follow-up: spotted, drafted, sent — by a person. */
  const rl = $("#relance")
  const ri = E.outExpo(prog(t, T.rPanel, T.rPanel + 0.75))
  const rex = E.inExpo(prog(t, T.rOut - 0.05, T.rOut + 0.45))
  show(rl, ri > 0 && rex < 1)
  set(rl, "transform", `translate3d(0,${f2((1 - ri) * 620 - rex * 700)}px,${f2(-rex * 500)}px) rotateX(${f2((1 - ri) * -28)}deg)`)
  set(rl, "opacity", f3(clamp(ri * 1.6) * (1 - E.inCubic(prog(t, T.rOut - 0.15, T.rOut + 0.15)))))
  const typed = Math.round(SUGGESTION.length * prog(t, T.rType, T.rType + 0.85))
  const caret = t < T.rBtn + 0.2 && (typed < SUGGESTION.length || Math.floor(t * 4) % 2 === 0)
  $("#rl-text").innerHTML = SUGGESTION.slice(0, typed) + (caret ? '<span class="caret"></span>' : "")
  const sb = E.outExpo(prog(t, T.rBtn - 0.2, T.rBtn + 0.25))
  const press = Math.sin(prog(t, T.tap - 0.05, T.tap + 0.18) * Math.PI)
  set($("#rl-send"), "opacity", f3(sb))
  set($("#rl-send"), "transform", `translateY(${f2((1 - sb) * 24)}px) scale(${f3(1 - 0.04 * press)})`)
  const sent = t >= T.tap + 0.1
  set($("#rl-send-a"), "opacity", sent ? "0" : "1")
  set($("#rl-send-b"), "opacity", sent ? "1" : "0")

  const tap = $("#tap")
  const tp = prog(t, T.tap - 0.3, T.tap + 0.35)
  show(tap, tp > 0 && tp < 1 && ri > 0)
  if (tp > 0 && tp < 1) {
    const r = rectOf($("#rl-send"))
    const pr = t < T.tap ? E.outCubic(prog(t, T.tap - 0.3, T.tap)) : 1
    const rip = prog(t, T.tap, T.tap + 0.35)
    set(tap, "left", `${f2(r.x + r.w * 0.68)}px`)
    set(tap, "top", `${f2(r.cy)}px`)
    set(tap, "transform", `scale(${f3(lerp(1.5, 0.8, pr) + rip * 1.4)})`)
    set(tap, "opacity", f3(pr * (1 - rip)))
    if (t > T.tap) FX.burst(FX.SPARKS.tap, r.x + r.w * 0.68, r.cy, t - T.tap)
  }
  block($("#r-note"), t, T.rNote, 0.6, T.rOut - 0.15, 0.3, { dy: 20 })
}

/* --------------------------------------------------------------- MORNING */

function morning(t) {
  if (!sceneOn("#morning", t, T.dawn, T.mOut + 0.55)) return
  // On the way out everything is pulled towards the end card's dot.
  const ex = E.inCubic(prog(t, T.mOut - 0.05, T.mOut + 0.3))

  /* 23:47 → 08:00, then the clock becomes the kicker. */
  const c = $("#clock2")
  const ci = E.outExpo(prog(t, T.clock2 - 0.1, T.clock2 + 0.6))
  const co = E.inOutCubic(prog(t, T.report - 0.15, T.report + 0.3))
  show(c, co < 1 && t >= T.clock2 - 0.1)
  set(c, "opacity", f3(ci * (1 - co)))
  set(c, "transform", `translate3d(${f2(-co * 380)}px,${f2(lerp(40, 0, ci) - co * 100)}px,0) scale(${f3(lerp(1, 0.14, co))})`)
  set(c, "filter", ci < 1 || co > 0 ? `blur(${f2((1 - ci) * 16 + co * 6)}px)` : "none")
  odoAt(c, t, 0.85)
  if (t > T.roll + 0.8 && t < T.report) FX.flare(540, 470, 620, "255,179,71", 0.28 * Math.sin(prog(t, T.roll + 0.8, T.report) * Math.PI))

  block($("#m-kicker"), t, T.report + 0.05, 0.6, T.mOut - 0.3, 0.3, { dy: 20 })
  rise($("#m-title"), t, T.report + 0.1, { stagger: 0.014, out: T.mOut - 0.3, outStagger: 0.004 })

  /* The report lands on WhatsApp at 8:00 and opens. */
  const n = $("#notif")
  const ni = E.outExpo(prog(t, T.notif, T.notif + 0.6))
  const no = E.inOutCubic(prog(t, T.report - 0.05, T.report + 0.35))
  show(n, ni > 0 && no < 1)
  set(n, "transform", `translate3d(0,${f2((1 - ni) * 260 + 220 - no * 220)}px,0) scale(${f3(lerp(1, 0.96, no))})`)
  set(n, "opacity", f3(clamp(ni * 1.5) * (1 - no)))

  const rp = $("#report")
  const ri = E.outExpo(prog(t, T.report, T.report + 0.8))
  show(rp, ri > 0)
  set(rp, "transform", `translate3d(${f2(ex * -200)}px,${f2((1 - ri) * 220 - ex * 160)}px,${f2(-ex * 600)}px) scale(${f3(lerp(0.94, 1, ri) * (1 - ex * 0.3))})`)
  set(rp, "filter", ex > 0 ? `blur(${f2(ex * 12)}px)` : "none")
  set(rp, "opacity", f3(clamp(ri * 1.5) * (1 - ex)))
  S.metrics.forEach((m, i) => {
    const t0 = T.report + 0.3 + i * 0.1
    const p = E.outCubic(prog(t, t0, t0 + 0.6))
    m.textContent = Math.round(Number(m.dataset.n) * p)
    const tile = m.parentElement
    set(tile, "opacity", f3(clamp(p * 3)))
    set(tile, "transform", `translateY(${f2((1 - E.outExpo(prog(t, t0, t0 + 0.5))) * 30)}px)`)
  })
  S.prioRows.forEach((r, i) => {
    const p = E.outExpo(prog(t, T.report + 0.65 + i * 0.12, T.report + 1.2 + i * 0.12))
    set(r, "opacity", f3(p))
    set(r, "transform", `translateX(${f2((1 - p) * 90)}px)`)
  })

  const m = $("#match")
  const mi = E.outBack(prog(t, T.match, T.match + 0.5), 1.6)
  show(m, t >= T.match)
  set(m, "transform", `translate3d(${f2((1 - mi) * 140 - ex * 120)}px,${f2((1 - mi) * 90 - ex * 600)}px,${f2(-ex * 600)}px) rotate(${f2((1 - mi) * 5 - 1.2)}deg)`)
  set(m, "filter", ex > 0 ? `blur(${f2(ex * 12)}px)` : "none")
  set(m, "opacity", f3(clamp(mi * 2) * (1 - ex)))
  const mp = E.outCubic(prog(t, T.match + 0.15, T.match + 0.75))
  $("#match-num").textContent = Math.round(100 * mp)
  $("#match-arc").setAttribute("stroke-dashoffset", f2(RING_C * (1 - mp)))

  if (t > T.mOut - 0.1) {
    const d = lkDot()
    FX.converge(d.x, d.y, prog(t, T.mOut - 0.1, T.lockup), "92,230,165")
  }
}

/* ------------------------------------------------------------------- END */

/** Where the lockup's dot sits on screen (left 170, 740 px for 112.2 units). */
function lkDot() {
  const k = 740 / 112.2
  return { x: 170 + (26.2 * 0.86 - 2) * k, y: 560 + (1.24 + 15 * 0.86) * k }
}

function end(t) {
  if (!sceneOn("#end", t, T.mOut, 99)) return
  const lk = $("#lockup")
  const lin = E.outExpo(prog(t, T.lockup - 0.1, T.lockup + 0.9))
  set(lk, "transform", `translateY(${f2((1 - lin) * 30)}px) scale(${f3(lerp(1.07, 1, lin))})`)
  set(lk, "transformOrigin", "18% 50%")
  const dot = E.outBack(prog(t, T.lockup - 0.12, T.lockup + 0.14), 2.2)
  $("#lockup .m-dot").setAttribute("r", f3(Math.max(0.001, 3.8 * dot)))
  S.lkRing.setAttribute("stroke-dashoffset", f2(S.lkLen * (1 - E.outExpo(prog(t, T.lockup, T.lockup + 0.7)))))
  const tail = E.outBack(prog(t, T.lockup + 0.28, T.lockup + 0.58), 2)
  const tailEl = $("#lockup .m-tail")
  set(tailEl, "transform", `scale(${f3(tail)})`)
  set(tailEl, "transformOrigin", "7px 22px")
  $("#lockup .lk-clip").setAttribute("width", f2(82 * E.inOutCubic(prog(t, T.lockup + 0.3, T.lockup + 0.95))))

  const d = lkDot()
  const dt = t - T.lockup
  if (dt > -0.12) {
    FX.flare(d.x, d.y, 70 + 420 * E.outExpo(clamp(dt / 0.8)), "92,230,165", dt < 0 ? 0.3 : 0.22 + 0.6 * Math.max(0, 1 - dt / 0.6) + 0.06 * Math.sin(t * 3))
    FX.flare(d.x, d.y, 110, "236,255,246", Math.max(0, 1 - Math.abs(dt) / 0.3) * 0.8)
    if (dt > 0) {
      FX.ring(d.x, d.y, 20 + 1300 * E.outCubic(clamp(dt / 1.3)), 7 * (1 - clamp(dt / 1.3)) + 1, "92,230,165", 0.75 * (1 - clamp(dt / 1.3)))
      FX.burst(FX.SPARKS.lockup, d.x, d.y, dt)
    }
  }

  rise($("#e-title"), t, T.tagline, { stagger: 0.016 })
  $$("#pills .feat").forEach((el, i) => {
    const p = E.outExpo(prog(t, T.pills + i * 0.08, T.pills + 0.6 + i * 0.08))
    set(el, "opacity", f3(p))
    set(el, "transform", `translateY(${f2((1 - p) * 30)}px)`)
  })
  const c = $("#cta")
  const ci = E.outBack(prog(t, T.cta, T.cta + 0.5), 1.8)
  const press = Math.sin(prog(t, T.ctaTap - 0.05, T.ctaTap + 0.2) * Math.PI)
  set(c, "transform", `scale(${f3(lerp(0.6, 1, ci) - press * 0.04)})`)
  set(c, "opacity", f3(clamp(ci * 2)))
  const sh = prog(t, T.cta + 0.55, T.cta + 1.25) + prog(t, T.end - 1.6, T.end - 0.9)
  set($("#shine"), "left", `${f2(-200 + (sh % 1) * 1150)}px`)
  if (t > T.cta) FX.flare(540, 1338, 560, "92,230,165", 0.13 + 0.05 * Math.sin(t * 2.4))

  const u = env(t, T.url, 0.6)
  set($("#url"), "opacity", f3(u.a))
  set($("#url"), "transform", `translateY(${f2((1 - u.a) * 24)}px)`)
  set($("#url"), "filter", u.a < 1 ? `blur(${f2((1 - u.a) * 10)}px)` : "none")
  const fi = env(t, T.url + 0.25, 0.6)
  set($("#fine"), "opacity", f3(fi.a))

  // A visitor's tap on the button.
  const cur = $("#cursor")
  const cp = E.inOutCubic(prog(t, T.ctaTap - 0.7, T.ctaTap - 0.05))
  show(cur, t > T.ctaTap - 0.7)
  const cx = lerp(1000, 760, cp)
  const cy = lerp(1720, 1355, cp)
  set(cur, "transform", `translate3d(${f2(cx)}px,${f2(cy)}px,0) scale(${f3(1 - press * 0.15)})`)
  set(cur, "opacity", f3(clamp(prog(t, T.ctaTap - 0.7, T.ctaTap - 0.5))))
  if (t > T.ctaTap) {
    const q = prog(t, T.ctaTap, T.ctaTap + 0.6)
    FX.ring(cx + 8, cy + 6, 20 + q * 120, 4, "238,240,250", 0.8 * (1 - q))
  }
}
