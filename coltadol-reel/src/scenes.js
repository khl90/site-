/*
  The seven scenes. `buildScenes()` runs once (DOM, measurements);
  `renderScenes(t)` sets every style from t alone.
*/

const S = {}

/* ------------------------------------------------------------------ data */

const NOTIFS = [
  { from: "+33 6 •• •• 41 18", text: "Bonjour, le T3 près du parc est toujours disponible ?" },
  { from: "+33 7 •• •• 23 06", text: "Je peux visiter samedi matin ?" },
  { from: "Sarah M.", text: "Vous avez un T4 à louer à Villeurbanne ?" },
  { from: "+33 6 •• •• 87 30", text: "Le prix est-il négociable ?" },
]

const SWARM = [
  "Le T3 près du parc est toujours disponible ?",
  "Je peux visiter samedi matin ?",
  "Une location meublée, c'est possible ?",
  "Le prix est-il négociable ?",
  "Vous avez quelque chose avec jardin sous 400 000 ?",
  "Vous avez une villa F4 à louer ?",
  "Toujours dispo le T2 ?",
  "On cherche plutôt à Villeurbanne",
  "Vous pouvez me rappeler ?",
  "Il y a un parking ?",
  "C'est pour acheter, on a un budget",
  "Visite possible ce week-end ?",
  "Plutôt 3 chambres si possible",
  "Bonjour, quel est le loyer ?",
  "Il est encore en vente ?",
  "On doit déménager avant décembre",
]
const MISSING = ["budget ?", "ville ?", "achat ou location ?", "type de bien ?", "chambres ?"]

const THREAD = [
  { id: "b1", from: "buyer", time: "23:47", html: 'Bonjour, le <span class="kw" data-kw="type">T3</span> près du parc est toujours disponible ?' },
  { id: "a1", from: "agent", time: "23:47", html: "Bonjour ! Oui, il est toujours disponible. Vous cherchez à acheter ou à louer ?" },
  { id: "b2", from: "buyer", time: "23:48", html: 'À <span class="kw" data-kw="intent">acheter</span>. On doit déménager <span class="kw" data-kw="urgency">avant fin novembre</span>, notre bail se termine.' },
  { id: "a2", from: "agent", time: "23:48", html: "C'est noté. Quel budget envisagez-vous ?" },
  { id: "b3", from: "buyer", time: "23:49", html: 'Autour de <span class="kw" data-kw="budget">320 000 €, jusqu\'à 350 000 €</span> s\'il y a un balcon.' },
  { id: "a3", from: "agent", time: "23:49", html: 'C\'est noté : achat d\'un T3 à <span class="kw" data-kw="city">Lyon 6e</span>, budget de 320 000 à 350 000 €. Un conseiller va vous contacter rapidement.' },
]

// field id → label, value, the keyword it is extracted from, and when.
const FIELDS = [
  { id: "type", label: "Type de bien", value: "T3", kw: "type", k: "type_de_bien", miss: "type" },
  { id: "city", label: "Ville", value: "Lyon 6e", kw: "city", k: "ville", miss: "city" },
  { id: "rooms", label: "Chambres", value: "2", kw: "type", k: "chambres" },
  { id: "intent", label: "Projet", value: "Achat", kw: "intent", k: "projet", miss: "intent" },
  { id: "urgency", label: "Urgence", value: "Haute", kw: "urgency", k: "urgence" },
  { id: "budget", label: "Budget", value: "320–350 k€", kw: "budget", k: "budget", miss: "budget" },
]

const PROWS = [
  { who: "+33 6 •• •• 41 18", what: "Achat · T3 · Lyon 6e", score: 92, hot: true },
  { who: "Sarah M.", what: "Location · T4 · Villeurbanne", score: 74, hot: true },
  { who: "+33 7 •• •• 09 52", what: "Achat · maison · Écully", score: 61, hot: false },
]

const SUGGESTION =
  "Bonjour Karim, désolé pour l'attente ! Le T4 à Villeurbanne qui vous intéressait est toujours disponible. Demain à 18 h, ça vous irait pour un appel avec un conseiller ?"

const CHECK = '<svg class="check" viewBox="0 0 24 24" fill="none" stroke="#5ce6a5" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
const CHAT_ICON =
  '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>'

/* ================================================================ BUILD */

function buildScenes() {
  // Scenes are laid out (not shown) while they are measured.
  $$(".scene").forEach((s) => {
    s.style.display = "block"
    s.style.visibility = "hidden"
  })
  $$(".split").forEach(split)

  /* S1 */
  makeOdo($("#clock1"), T.notifs.map((t, i) => [i === 0 ? -1 : t, T.notifTimes[i]]))
  S.notifs = NOTIFS.map((n, i) => {
    const el = document.createElement("div")
    el.className = "notif"
    el.style.top = "860px"
    el.innerHTML = `<div class="n-icon">${CHAT_ICON}</div><div class="n-body">
      <div class="n-head"><span>WhatsApp</span><span>${T.notifTimes[i]}</span></div>
      <div class="n-from">${n.from}</div><div class="n-text">${n.text}</div>
      <div class="n-state"><span class="dot" style="background:var(--lamp);box-shadow:0 0 14px var(--lamp)"></span>en attente</div></div>`
    $("#notifs").append(el)
    return el
  })

  /* S2 */
  const R = rng(41)
  S.swarm = []
  const items = [...SWARM.map((s) => ({ s, miss: false })), ...MISSING.map((s) => ({ s, miss: true }))]
  items.forEach((it, i) => {
    const el = document.createElement("div")
    el.className = it.miss ? "miss" : "bub"
    const hh = 22 + Math.floor(R() * 4)
    const time = `${String(hh % 24).padStart(2, "0")}:${String(Math.floor(R() * 60)).padStart(2, "0")}`
    el.innerHTML = it.miss ? it.s : `${it.s}<div class="meta">${time}<span class="dot"></span></div>`
    $("#swarm").append(el)
    const ang = (i / items.length) * Math.PI * 2 + R() * 0.5
    const rad = 330 + R() * 260
    S.swarm.push({
      el,
      miss: it.miss,
      x: Math.cos(ang) * rad * 0.85,
      y: Math.sin(ang) * rad * 1.45,
      z0: -3300 + ((i * 0.618) % 1) * 3000,
      rot: (R() - 0.5) * 16,
      fall: R(),
    })
  })

  /* S3 */
  S.ringLen = $("#mark-ring").getTotalLength()

  /* S4 */
  S.msgs = THREAD.map((m) => {
    const wrap = document.createElement("div")
    wrap.className = `msg ${m.from}`
    wrap.innerHTML = `<div class="row"><p>${m.html}<span class="time">${m.time}${m.from === "agent" ? " ✓✓" : ""}</span></p></div>`
    $("#thread").append(wrap)
    let typing = null
    if (m.from === "agent") {
      typing = document.createElement("div")
      typing.className = "msg agent"
      typing.innerHTML = `<div class="row"><span class="typing"><i></i><i></i><i></i></span></div>`
      $("#thread").insertBefore(typing, wrap)
    }
    return { ...m, el: wrap, typing }
  })
  S.msgs.forEach((m) => {
    m.h = m.el.offsetHeight
    if (m.typing) m.th = m.typing.offsetHeight
  })
  S.kw = Object.fromEntries($$(".kw").map((k) => [k.dataset.kw, k]))

  S.fields = FIELDS.map((f) => {
    const el = document.createElement("div")
    el.className = "field"
    el.innerHTML = `<dt>${f.label}</dt><dd><span class="empty">—</span><span class="val">${CHECK}<span>${f.value}</span></span></dd>`
    $("#fields").append(el)
    const chip = document.createElement("div")
    chip.className = "chip"
    chip.innerHTML = `<span class="k">${f.k}</span><span class="v">${f.value}</span>`
    $("#chips").append(chip)
    return { ...f, el, empty: $(".empty", el), val: $(".val", el), chip, cw: 0, ch: 0 }
  })
  S.fields.forEach((f) => {
    f.cw = f.chip.offsetWidth
    f.ch = f.chip.offsetHeight
  })
  S.ringC = 2 * Math.PI * 52
  $("#ring-arc").setAttribute("stroke-dasharray", S.ringC)
  $("#match-arc").setAttribute("stroke-dasharray", S.ringC)

  /* S5 */
  $("#s-text").textContent = SUGGESTION
  S.suggestH = $("#suggest").offsetHeight
  $("#s-text").textContent = ""

  /* S6 */
  makeOdo($("#clock2"), [
    [-1, "01:32"],
    [T.clock2Roll, "08:00", 2],
  ])
  S.prows = PROWS.map((p) => {
    const el = document.createElement("div")
    el.className = "prow"
    el.innerHTML = `<div class="sring"><svg viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="rgb(143 152 198 / 0.14)" stroke-width="10"/><circle cx="60" cy="60" r="52" fill="none" stroke="${p.hot ? "#ffb347" : "#8f98c6"}" stroke-width="10" stroke-linecap="round" stroke-dasharray="${S.ringC}" class="arc"/></svg><b class="display">0</b></div>
      <div style="flex:1;min-width:0"><p class="who">${p.who}</p><p class="what">${p.what}</p></div>
      ${p.hot ? '<span class="pill prio high">Chaud</span>' : '<span class="pill prio medium">Tiède</span>'}`
    $("#prows").append(el)
    return { ...p, el, arc: $(".arc", el), num: $("b", el) }
  })
  S.metrics = $$("[data-count]")

  /* S7 + bug */
  lockupSVG($("#lockup"), { clipId: "wm7" })
  lockupSVG($("#bug"), { clipId: "wmb" })
  $("#bug").querySelector("#wmb-r").setAttribute("width", "90")
  S.lkRing = $("#lockup .lk-ring")
  S.lkLen = S.lkRing.getTotalLength()
  S.lkRing.setAttribute("stroke-dasharray", S.lkLen)

  $$(".scene").forEach((s) => {
    s.style.display = "none"
    s.style.visibility = ""
  })
}

/* =============================================================== RENDER */

function scene(id, t, a, b) {
  // display, not visibility: a child set to visible would show through.
  const on = t >= a && t < b
  set($(id), "display", on ? "block" : "none")
  return on
}

function renderScenes(t) {
  FX.begin(t)
  s1(t)
  s2(t)
  s3(t)
  s4(t)
  s5(t)
  s6(t)
  s7(t)
  bug(t)
  caption(t)
}

/* ------------------------------------------------------------- S1 HOOK */

function s1(t) {
  if (!scene("#s1", t, -1, T.s1Out + 0.7)) return
  // Leaving: everything rushes past the camera into the swarm.
  const out = E.inExpo(prog(t, T.s1Out - 0.15, T.s1Out + 0.45))
  const push = lerp(1, 1.05, prog(t, 0, T.s1Out))
  set($("#s1"), "transform", `translateZ(${out * 900}px) scale(${push})`)
  set($("#s1"), "opacity", 1 - out)

  revealChars($("#s1-k1"), t, -0.15, { out: T.k2 - 0.2, stagger: 0.012 })
  revealChars($("#s1-k2"), t, T.k2, { stagger: 0.014 })

  const c = $("#clock1")
  const ci = E.outExpo(prog(t, -0.35, 0.6))
  set(c, "transform", `translateY(${(1 - ci) * 60}px) scale(${lerp(1.25, 1, ci)})`)
  set(c, "opacity", ci)
  set(c, "filter", `blur(${(1 - ci) * 18}px)`)
  odoAt(c, t)

  // Notifications stack from the top; older ones step back.
  const n = S.notifs.length
  S.notifs.forEach((el, i) => {
    const t0 = T.notifs[i]
    if (t < t0 - 0.01) return show(el, false)
    show(el, true)
    const a = E.outExpo(prog(t, t0, t0 + 0.55))
    // How many newer notifications have arrived above this one (eased).
    let depth = 0
    for (let j = i + 1; j < n; j++) depth += E.outExpo(prog(t, T.notifs[j], T.notifs[j] + 0.5))
    const y = (1 - a) * -260 + depth * 74
    const s = lerp(0.92, 1, a) * Math.pow(0.93, depth)
    const fade = clamp(1 - Math.max(0, depth - 2) * 1.2)
    set(el, "transform", `translate3d(0,${y.toFixed(1)}px,${(-depth * 60).toFixed(1)}px) scale(${s.toFixed(4)})`)
    set(el, "opacity", (a * fade * Math.pow(0.78, depth)).toFixed(3))
    set(el, "zIndex", String(10 + i))
  })
}

/* ------------------------------------------------------------ S2 SWARM */

function s2(t) {
  if (!scene("#s2", t, T.s2, T.impact + 0.05)) return
  const sinceStart = t - T.s2
  const collapse = E.inExpo(prog(t, T.collapse, T.impact))
  const forget = E.inOutCubic(prog(t, T.l3, T.l3 + 0.7))

  S.swarm.forEach((b) => {
    let z = b.z0 + sinceStart * 720
    let x = b.x
    let y = b.y + forget * b.fall * 260
    // Collapse toward the vanishing point.
    x *= 1 - collapse
    y *= 1 - collapse
    z = lerp(z, -2600, collapse)
    const near = clamp((z - 150) / 450)
    const far = clamp((-z - 2600) / 800)
    const intro = E.outCubic(prog(t, T.s2, T.s2 + 0.4))
    const op = intro * (1 - near) * (1 - far) * (1 - collapse * 0.9) * (b.miss && t < T.l2 ? 0.25 : 1)
    if (op <= 0.01) return show(b.el, false)
    show(b.el, true)
    const blur = Math.min(9, Math.abs(z + 650) / 260)
    set(b.el, "transform", `translate(-50%,-50%) translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,${z.toFixed(1)}px) rotate(${(b.rot * (1 - collapse)).toFixed(2)}deg)`)
    set(b.el, "opacity", op.toFixed(3))
    set(b.el, "filter", `blur(${blur.toFixed(1)}px) grayscale(${(forget * 0.85).toFixed(2)}) brightness(${(1 - forget * 0.45).toFixed(2)})`)
  })

  revealChars($("#s2-l1"), t, T.l1, { out: T.l2 - 0.2, stagger: 0.016 })
  revealChars($("#s2-l2"), t, T.l2, { out: T.l3 - 0.2, stagger: 0.016 })
  revealChars($("#s2-l3"), t, T.l3, { out: T.collapse + 0.05, stagger: 0.016 })
  // "s'oublient" fades as it is said.
  if (t > T.l3) $$("#s2-l3 .hl").forEach((c) => set(c, "opacity", (1 - 0.6 * forget).toFixed(3)))

  FX.suck(540, 960, t, T.collapse, T.impact)
}

/* ----------------------------------------------------------- S3 REVEAL */

const MARK = 300
// Where the dot sits on screen at the impact (stage centre)…
const DOT0 = { x: 540, y: 960 }
// …and where the mark settles above the title.
const MARK_FINAL = { x: 540 - MARK / 2, y: 560 }

function markPos(t) {
  const left0 = DOT0.x - (26.2 / 32) * MARK
  const top0 = DOT0.y - (15 / 32) * MARK
  const p = E.inOutQuint(prog(t, T.impact + 0.5, T.impact + 1.05))
  return { x: lerp(left0, MARK_FINAL.x, p), y: lerp(top0, MARK_FINAL.y, p) }
}

function s3(t) {
  if (!scene("#s3", t, T.impact - 0.2, T.s4 + 0.5)) return
  const mark = $("#mark")
  const pos = markPos(t)

  // Exit: the mark flies into the brand bug's place, top-left.
  const ex = E.inOutQuint(prog(t, T.s3Out, T.s3Out + 0.55))
  const bugMark = { x: 64 - 2 * (50 / 30), y: 232 + 1.24 * (50 / 30) }
  const bugScale = (0.86 * 50) / 30 / (MARK / 32)
  const x = lerp(pos.x, bugMark.x, ex)
  const y = lerp(pos.y, bugMark.y, ex)
  const sc = lerp(1, bugScale, ex)
  set(mark, "transform", `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) scale(${sc.toFixed(4)})`)
  set(mark, "transformOrigin", "0 0")
  show(mark, t < T.s3Out + 0.56)

  const dotR = 3.8 * E.outBack(prog(t, T.impact - 0.12, T.impact + 0.18))
  $("#mark-dot").setAttribute("r", Math.max(0.001, dotR).toFixed(3))
  const draw = E.outExpo(prog(t, T.impact + 0.08, T.impact + 0.75))
  const ring = $("#mark-ring")
  ring.setAttribute("stroke-dasharray", S.ringLen)
  ring.setAttribute("stroke-dashoffset", (S.ringLen * (1 - draw)).toFixed(2))
  const tail = E.outBack(prog(t, T.impact + 0.4, T.impact + 0.7))
  set($("#mark-tail"), "transform", `scale(${tail})`)
  set($("#mark-tail"), "transformOrigin", "7px 22px")

  // Light: the answer arrives.
  const dotScreen = { x: x + (26.2 / 32) * MARK * sc, y: y + (15 / 32) * MARK * sc }
  const dt = t - T.impact
  if (dt > -0.15) {
    const pre = dt < 0 ? prog(t, T.impact - 0.15, T.impact) : 1
    FX.flare(dotScreen.x, dotScreen.y, 80 + 640 * E.outExpo(clamp(dt / 0.9)), "92,230,165", pre * (dt < 0 ? 0.6 : Math.max(0.28, 1 - dt / 0.8)) * (1 - ex))
    FX.flare(dotScreen.x, dotScreen.y, 120, "238,250,244", (dt < 0 ? pre : Math.max(0, 1 - dt / 0.35)) * 0.9)
    FX.ring(DOT0.x, DOT0.y, 40 + 1400 * E.outCubic(clamp(dt / 1.1)), 8 * (1 - clamp(dt / 1.1)) + 1, "92,230,165", 0.8 * (1 - clamp(dt / 1.1)))
    FX.ring(DOT0.x, DOT0.y, 20 + 900 * E.outCubic(clamp((dt - 0.12) / 1.1)), 3, "238,240,250", 0.4 * (1 - clamp((dt - 0.12) / 1.1)) * (dt > 0.12 ? 1 : 0))
    FX.burst(FX.SPARKS.impact, DOT0.x, DOT0.y, dt)
  }

  revealChars($("#s3-title"), t, T.s3Title, { out: T.s3Out, stagger: 0.016 })
  const sub = env(t, T.s3Title + 0.35, 0.8, T.s3Out, 0.35)
  show($("#s3-sub"), sub.v)
  set($("#s3-sub"), "opacity", (sub.a * (1 - sub.b)).toFixed(3))
  set($("#s3-sub"), "transform", `translateY(${((1 - sub.a) * 30 - sub.b * 40).toFixed(1)}px)`)

  const log = env(t, T.s3Title + 0.55, 0.7, T.s3Out, 0.35)
  const logEl = $("#s3-log")
  show(logEl, log.v)
  set(logEl, "opacity", (log.a * (1 - log.b)).toFixed(3))
  set(logEl, "left", `${540 - logEl.offsetWidth / 2}px`)
  set(logEl, "transform", `translateY(${((1 - log.a) * 30).toFixed(1)}px)`)
  const turned = prog(t, T.s3Title + 0.95, T.s3Title + 1.15)
  set($("#s3-log-dot"), "background", turned < 0.5 ? "#ffb347" : "#5ce6a5")
  set($("#s3-log-dot"), "boxShadow", `0 0 ${10 + 20 * Math.sin(turned * Math.PI)}px ${turned < 0.5 ? "#ffb347" : "#5ce6a5"}`)
}

/* ----------------------------------------------------- persistent bits */

function bug(t) {
  const el = $("#bug")
  const v = t > T.s3Out + 0.5 && t < T.s6Out + 0.3
  show(el, v)
  if (!v) return
  const out = prog(t, T.s6Out - 0.1, T.s6Out + 0.3)
  set(el, "opacity", (1 - out).toFixed(3))
  const wm = E.outExpo(prog(t, T.s3Out + 0.5, T.s3Out + 1.1))
  $("#wmb-r").setAttribute("width", (80 * wm).toFixed(2))
}

function caption(t) {
  // The landing page captions every staged conversation as an example; so does the film.
  const el = $("#caption")
  const v = (t > T.s4 + 0.4 && t < T.s6Out) || t > T.cta + 0.4
  show(el, v)
  const a = t > T.cta ? prog(t, T.cta + 0.4, T.cta + 1) : prog(t, T.s4 + 0.4, T.s4 + 0.9) * (1 - prog(t, T.s6Out - 0.3, T.s6Out))
  set(el, "opacity", a.toFixed(3))
}

/* ---------------------------------------------------------- S4 QUALIFY */

function s4(t) {
  if (!scene("#s4", t, T.s4, T.s4Out + 0.55)) {
    S.fields.forEach((f) => show(f.chip, false))
    return
  }
  // Whip-pan out (upwards) into S5.
  const whip = E.inExpo(prog(t, T.s4Out - 0.1, T.s4Out + 0.35))
  set($("#s4"), "transform", `translateY(${(-whip * 1700).toFixed(1)}px)`)
  set($("#s4"), "filter", whip > 0.01 ? `blur(${(whip * 14).toFixed(1)}px)` : "none")
  FX.speed(t, T.s4Out - 0.15, T.s4Out + 0.55)

  const k = env(t, T.s4, 0.7)
  set($("#s4-k"), "opacity", k.a)
  set($("#s4-k"), "transform", `translateX(${(1 - k.a) * -40}px)`)
  revealChars($("#s4-title"), t, T.s4 + 0.05, { stagger: 0.011 })

  /* The phone: enters tilted, then steps back as the dossier comes forward. */
  const pin = E.outExpo(prog(t, T.phoneIn, T.phoneIn + 0.9))
  const back = E.inOutCubic(prog(t, T.dossierIn - 0.15, T.dossierIn + 0.6))
  const phone = $("#phone")
  set(
    phone,
    "transform",
    `translate3d(${lerp(0, -60, back)}px,${lerp(520, 0, pin) + lerp(0, -40, back)}px,${lerp(-500, 0, pin) + lerp(0, -650, back)}px) rotateX(${lerp(18, 5, pin)}deg) rotateY(${lerp(-22, -9, pin) + back * 16}deg)`
  )
  set(phone, "opacity", (pin * lerp(1, 0.32, back)).toFixed(3))
  set(phone, "filter", back > 0.01 ? `blur(${(back * 4).toFixed(1)}px)` : "none")

  // Messages: height grows from 0 so the thread scrolls like a real one.
  S.msgs.forEach((m) => {
    const t0 = T.msgs[m.id]
    if (m.typing) {
      const tt = T.msgs[m.id + "t"]
      const on = t >= tt && t < t0
      const ta = E.outCubic(prog(t, tt, tt + 0.15)) * (1 - E.inCubic(prog(t, t0 - 0.08, t0)))
      set(m.typing, "height", `${(m.th * ta).toFixed(1)}px`)
      set(m.typing, "opacity", ta.toFixed(3))
      show(m.typing, on)
      $$("i", m.typing).forEach((d, i) => set(d, "transform", `translateY(${(-6 * Math.max(0, Math.sin(t * 12 - i * 0.9))).toFixed(1)}px)`))
    }
    const a = E.outExpo(prog(t, t0, t0 + 0.45))
    set(m.el, "height", `${(m.h * a).toFixed(1)}px`)
    set(m.el, "opacity", a.toFixed(3))
    show(m.el, a > 0)
    const p = $("p", m.el)
    set(p, "transform", `translateY(${((1 - a) * 30).toFixed(1)}px) scale(${lerp(0.9, 1, a).toFixed(3)})`)
    set(p, "transformOrigin", m.from === "agent" ? "100% 100%" : "0 100%")
  })

  // Keywords light up as they are understood.
  const kwAt = { type: T.msgs.b1 + 0.3, intent: T.msgs.b2 + 0.3, urgency: T.msgs.b2 + 0.45, budget: T.msgs.b3 + 0.3, city: T.msgs.a3 + 0.3 }
  for (const [id, at] of Object.entries(kwAt)) {
    const p = E.outCubic(prog(t, at, at + 0.3))
    set(S.kw[id], "backgroundSize", `${(p * 100).toFixed(1)}% 4px`)
    set(S.kw[id], "color", p > 0.3 ? "#5ce6a5" : "")
    set(S.kw[id], "fontWeight", p > 0.3 ? "700" : "")
  }

  /* The dossier */
  const din = E.outExpo(prog(t, T.dossierIn, T.dossierIn + 0.9))
  const dos = $("#dossier")
  show(dos, t >= T.dossierIn)
  set(dos, "transform", `translate3d(0,${lerp(900, 0, din).toFixed(1)}px,${lerp(300, 0, din).toFixed(1)}px) rotateX(${lerp(-24, 0, din).toFixed(2)}deg)`)
  set(dos, "opacity", clamp(din * 1.6).toFixed(3))

  /* Chips: born on their keyword, wait beside the phone, land in their field. */
  const needLayout = t >= T.msgs.b1 && t < T.chipsLand + 1.2
  const slots = [
    { x: 790, y: 700 },
    { x: 800, y: 1250 },
    { x: 830, y: 800 },
    { x: 790, y: 950 },
    { x: 770, y: 1060 },
    { x: 760, y: 1160 },
  ]
  S.fields.forEach((f, i) => {
    const born = kwAt[f.kw] + (f.id === "rooms" ? 0.22 : 0.05)
    const land0 = T.chipsLand + i * 0.09
    const landed = E.inOutCubic(prog(t, land0, land0 + 0.5))
    const v = needLayout && t >= born && landed < 1
    show(f.chip, v)
    // Field fill.
    const fill = prog(t, land0 + 0.42, land0 + 0.6)
    set(f.empty, "opacity", (1 - fill).toFixed(3))
    set(f.val, "opacity", fill.toFixed(3))
    set(f.val, "transform", `translateY(${((1 - E.outBack(fill)) * 14).toFixed(1)}px)`)
    const flash = Math.max(0, 1 - Math.abs(t - (land0 + 0.5)) / 0.25)
    set(f.el, "borderColor", flash > 0 ? `rgba(92,230,165,${(0.16 + flash * 0.7).toFixed(3)})` : "")
    set(f.el, "boxShadow", flash > 0 ? `0 0 ${Math.round(40 * flash)}px rgba(92,230,165,${(0.45 * flash).toFixed(3)})` : "")
    if (!v) return

    const kw = rectIn(S.kw[f.kw])
    const birth = E.outExpo(prog(t, born, born + 0.55))
    const src = { x: kw.cx, y: kw.cy }
    const slot = { x: slots[i].x + f.cw / 2, y: slots[i].y + f.ch / 2 }
    const ctrl1 = { x: lerp(src.x, slot.x, 0.5), y: Math.min(src.y, slot.y) - 220 }
    let p = qbez(src, ctrl1, slot, birth)
    const trailPts = []
    for (let s = 6; s >= 0; s--) trailPts.push(qbez(src, ctrl1, slot, E.outExpo(prog(t - s * 0.022, born, born + 0.55))))
    // Bob gently while waiting.
    p = { x: p.x, y: p.y + Math.sin(t * 2.4 + i) * 6 * birth }
    if (landed > 0) {
      const fr = rectIn(f.val)
      const dst = { x: fr.x + fr.w / 2, y: fr.cy }
      const ctrl2 = { x: lerp(p.x, dst.x, 0.5) + 120, y: Math.min(p.y, dst.y) - 160 }
      const p2 = qbez(p, ctrl2, dst, landed)
      trailPts.length = 0
      for (let s = 6; s >= 0; s--) trailPts.push(qbez(p, ctrl2, dst, E.inOutCubic(prog(t - s * 0.02, land0, land0 + 0.5))))
      p = p2
    }
    FX.trail(trailPts, "92,230,165")
    const sc = lerp(0.4, 1, birth) * lerp(1, 0.75, landed)
    set(f.chip, "transform", `translate(${(p.x - f.cw / 2).toFixed(1)}px,${(p.y - f.ch / 2).toFixed(1)}px) scale(${sc.toFixed(3)})`)
    set(f.chip, "opacity", (clamp(birth * 2) * (1 - E.inCubic(prog(landed, 0.75, 1)))).toFixed(3))
    if (landed > 0.9) FX.flare(p.x, p.y, 120, "92,230,165", (landed - 0.9) * 6)
  })

  // Missing info empties, then "nothing missing".
  $$("#missing .mp").forEach((mp) => {
    const f = S.fields.find((x) => x.miss === mp.dataset.m)
    const land0 = T.chipsLand + S.fields.indexOf(f) * 0.09 + 0.45
    const g = E.inCubic(prog(t, land0, land0 + 0.2))
    set(mp, "opacity", (1 - g).toFixed(3))
    set(mp, "transform", `scale(${lerp(1, 0.6, g).toFixed(3)})`)
  })
  const none = prog(t, T.chipsLand + 0.85, T.chipsLand + 1.1)
  show($("#none-missing"), none > 0)
  set($("#none-missing"), "opacity", none.toFixed(3))

  // The score.
  const sp = E.outCubic(prog(t, T.score, T.score + 0.75))
  const score = Math.round(92 * sp)
  $("#ring-num").textContent = score
  $("#ring-arc").setAttribute("stroke-dashoffset", (S.ringC * (1 - 0.92 * sp)).toFixed(2))
  const hot = E.outBack(prog(t, T.qualified, T.qualified + 0.35))
  set($("#hot"), "transform", `scale(${hot.toFixed(3)})`)
  set($("#hot"), "opacity", clamp(hot * 2).toFixed(3))
  const ok = t >= T.qualified
  show($("#st-new"), !ok)
  show($("#st-ok"), ok)
  if (t > T.qualified && t < T.qualified + 0.8) {
    const r = rectIn($("#ring"))
    const q = prog(t, T.qualified, T.qualified + 0.8)
    FX.ring(r.cx, r.cy, 125 + q * 160, 4, "92,230,165", 0.7 * (1 - q))
  }
}

/* --------------------------------------------------------- S5 RECOVERY */

function s5(t) {
  if (!scene("#s5", t, T.s5 - 0.2, T.s5Out + 0.6)) return
  const whipIn = E.outExpo(prog(t, T.s5 - 0.15, T.s5 + 0.55))
  const exit = E.inOutCubic(prog(t, T.s5Out - 0.1, T.s5Out + 0.5))
  set($("#s5"), "transform", `translateY(${((1 - whipIn) * 1500).toFixed(1)}px) translateZ(${(-exit * 700).toFixed(1)}px)`)
  set($("#s5"), "filter", whipIn < 0.99 ? `blur(${((1 - whipIn) * 14).toFixed(1)}px)` : "none")
  set($("#s5"), "opacity", (1 - exit).toFixed(3))

  set($("#s5-k"), "opacity", whipIn)
  revealChars($("#s5-title"), t, T.s5 + 0.12, { stagger: 0.011 })

  const q = env(t, T.s5 + 0.2, 0.8)
  set($("#queue"), "opacity", q.a.toFixed(3))
  set($("#queue"), "transform", `translateY(${((1 - q.a) * 80).toFixed(1)}px)`)

  /* Karim: going cold, then caught. */
  const karim = $("#it-karim")
  const kin = E.outExpo(prog(t, T.karimIn, T.karimIn + 0.6))
  const caught = E.outCubic(prog(t, T.scan + 0.25, T.scan + 0.6))
  set(karim, "opacity", (kin * lerp(0.55, 1, caught)).toFixed(3))
  set(karim, "transform", `translateX(${((1 - kin) * -80).toFixed(1)}px)`)
  set(karim, "filter", caught < 1 ? `grayscale(${(1 - caught).toFixed(2)})` : "none")
  set(karim, "borderColor", caught > 0 ? `rgba(92,230,165,${(0.16 + 0.4 * caught).toFixed(3)})` : "")
  set(karim, "boxShadow", caught > 0 ? `0 0 60px -10px rgba(92,230,165,${(0.35 * caught).toFixed(3)})` : "")
  const hours = Math.round(lerp(24, 26, E.inOutCubic(prog(t, T.karimIn + 0.2, T.scan))))
  $("#karim-h").textContent = hours
  $("#karim-when").textContent = `il y a ${hours} h`
  const prio = E.outBack(prog(t, T.scan + 0.45, T.scan + 0.8))
  set($("#karim-prio"), "transform", `scale(${prio.toFixed(3)})`)
  set($("#karim-prio"), "opacity", clamp(prio * 2).toFixed(3))
  // The silence tag gives way to the written reason.
  const sw = E.inOutCubic(prog(t, T.scan + 0.45, T.scan + 0.8))
  const sil = $("#karim-silence")
  set(sil, "display", sw >= 1 ? "none" : "inline-flex")
  set(sil, "opacity", (1 - sw).toFixed(3))
  const reason = $("#karim-reason")
  set(reason, "display", sw > 0 ? "block" : "none")
  set(reason, "opacity", sw.toFixed(3))
  if (t > T.scan && t < T.scan + 0.6) FX.scan(rectIn(karim), prog(t, T.scan, T.scan + 0.55))

  /* Suggested message: opens, types, gets sent by a person. */
  const sg = E.outExpo(prog(t, T.suggest, T.suggest + 0.6))
  const sug = $("#suggest")
  set(sug, "height", `${(S.suggestH * sg).toFixed(1)}px`)
  set(sug, "marginTop", `${(22 * sg).toFixed(1)}px`)
  set(sug, "padding", sg > 0 ? "28px 30px" : "0 30px")
  set(sug, "borderWidth", sg > 0 ? "2px" : "0")
  set(sug, "opacity", sg.toFixed(3))
  const typed = Math.round(SUGGESTION.length * prog(t, T.suggest + 0.15, T.suggest + 1.15))
  const caretOn = t < T.tap && Math.floor(t * 4) % 2 === 0
  $("#s-text").innerHTML = SUGGESTION.slice(0, typed) + (caretOn || typed < SUGGESTION.length ? '<span class="caret"></span>' : "")
  const sendIn = E.outExpo(prog(t, T.suggest + 1.0, T.suggest + 1.4))
  set($("#send"), "opacity", sendIn.toFixed(3))
  set($("#send"), "transform", `translateY(${((1 - sendIn) * 20).toFixed(1)}px)`)
  const tap = $("#tap")
  const tp = prog(t, T.tap - 0.25, T.tap + 0.35)
  show(tap, tp > 0 && tp < 1)
  const tapR = rectIn($("#send"))
  set(tap, "left", `${(tapR.w * 0.62).toFixed(0)}px`)
  set(tap, "top", `${(tapR.h / 2 - 60).toFixed(0)}px`)
  const press = t < T.tap ? E.outCubic(prog(t, T.tap - 0.25, T.tap)) : 1
  const ripple = prog(t, T.tap, T.tap + 0.35)
  set(tap, "transform", `scale(${(lerp(1.4, 0.8, press) + ripple * 1.6).toFixed(3)})`)
  set(tap, "opacity", (press * (1 - ripple)).toFixed(3))
  const sent = t >= T.tap + 0.12
  show($("#send-a"), !sent)
  show($("#send-b"), sent)
  set($("#send"), "transform", `translateY(${((1 - sendIn) * 20).toFixed(1)}px) scale(${(1 - 0.04 * Math.sin(prog(t, T.tap - 0.05, T.tap + 0.2) * Math.PI)).toFixed(3)})`)

  /* Léa */
  const lea = $("#it-lea")
  const lin = E.outExpo(prog(t, T.leaIn, T.leaIn + 0.6))
  set(lea, "opacity", (lin * lerp(1, 0.45, sg)).toFixed(3))
  set(lea, "transform", `translateX(${((1 - lin) * -80).toFixed(1)}px)`)

  const note = env(t, T.tap + 0.25, 0.6)
  set($("#s5-note"), "opacity", note.a.toFixed(3))
  set($("#s5-note"), "transform", `translateY(${((1 - note.a) * 20).toFixed(1)}px)`)
}

/* ---------------------------------------------------------- S6 MORNING */

function s6(t) {
  if (!scene("#s6", t, T.s6, T.s6Out + 0.7)) return
  const exit = E.inExpo(prog(t, T.s6Out - 0.05, T.s6Out + 0.55))
  set($("#s6"), "transform", `translateZ(${(-exit * 2200).toFixed(1)}px)`)
  set($("#s6"), "opacity", (1 - exit).toFixed(3))

  /* 01:32 → 08:00, then the clock becomes the kicker. */
  revealChars($("#s6-k0"), t, T.s6 + 0.05, { out: T.notif2 - 0.25, stagger: 0.014 })
  const c = $("#clock2")
  const cin = E.outExpo(prog(t, T.s6, T.s6 + 0.6))
  const cout = E.inOutCubic(prog(t, T.notif2 - 0.25, T.notif2 + 0.3))
  show(c, cout < 1)
  set(c, "opacity", (cin * (1 - cout)).toFixed(3))
  set(c, "transform", `translateY(${(lerp(40, 0, cin) - cout * 330).toFixed(1)}px) scale(${lerp(1, 0.16, cout).toFixed(3)})`)
  set(c, "filter", cin < 1 ? `blur(${((1 - cin) * 14).toFixed(1)}px)` : "none")
  odoAt(c, t, 0.5)
  if (t > T.clock2Roll + 0.8 && t < T.notif2) {
    const q = prog(t, T.clock2Roll + 0.8, T.clock2Roll + 1.2)
    FX.flare(540, 830, 520, "255,179,71", 0.3 * Math.sin(q * Math.PI))
  }

  const k = env(t, T.notif2 + 0.05, 0.6)
  set($("#s6-k"), "opacity", k.a.toFixed(3))
  set($("#s6-k"), "transform", `translateX(${((1 - k.a) * -40).toFixed(1)}px)`)
  revealChars($("#s6-title"), t, T.notif2 + 0.1, { stagger: 0.016 })

  /* The report arrives on WhatsApp — green this time — and opens. */
  const n = $("#report-notif")
  const nin = E.outExpo(prog(t, T.notif2, T.notif2 + 0.55))
  const nout = E.inOutCubic(prog(t, T.report - 0.05, T.report + 0.35))
  show(n, t >= T.notif2 && nout < 1)
  set(n, "transform", `translateY(${((1 - nin) * -400 - nout * 380).toFixed(1)}px) scale(${lerp(1, 0.9, nout).toFixed(3)})`)
  set(n, "opacity", (nin * (1 - nout)).toFixed(3))
  set(n, "borderColor", "rgba(92,230,165,0.35)")

  const rin = E.outExpo(prog(t, T.report, T.report + 0.8))
  const rep = $("#report")
  show(rep, t >= T.report)
  set(rep, "transform", `translateY(${((1 - rin) * 260).toFixed(1)}px) scale(${lerp(0.92, 1, rin).toFixed(3)})`)
  set(rep, "opacity", clamp(rin * 1.5).toFixed(3))

  S.metrics.forEach((m, i) => {
    const t0 = T.report + 0.3 + i * 0.1
    const p = E.outCubic(prog(t, t0, t0 + 0.7))
    m.textContent = Math.round(Number(m.dataset.count) * p)
    const tile = m.parentElement
    set(tile, "opacity", clamp(p * 3).toFixed(3))
    set(tile, "transform", `translateY(${((1 - E.outExpo(prog(t, t0, t0 + 0.5))) * 30).toFixed(1)}px)`)
  })
  S.prows.forEach((r, i) => {
    const t0 = T.report + 0.75 + i * 0.13
    const p = E.outExpo(prog(t, t0, t0 + 0.6))
    set(r.el, "opacity", p.toFixed(3))
    set(r.el, "transform", `translateX(${((1 - p) * 120).toFixed(1)}px)`)
    const sp = E.outCubic(prog(t, t0 + 0.1, t0 + 0.8))
    r.num.textContent = Math.round(r.score * sp)
    r.arc.setAttribute("stroke-dashoffset", (S.ringC * (1 - (r.score / 100) * sp)).toFixed(2))
  })

  const m = $("#match")
  const mi = E.outBack(prog(t, T.match, T.match + 0.5))
  show(m, t >= T.match)
  set(m, "transform", `translate3d(${((1 - mi) * 120).toFixed(1)}px,${((1 - mi) * 80).toFixed(1)}px,${((1 - mi) * -300 + 60).toFixed(1)}px) rotate(${((1 - mi) * 6 - 1.5).toFixed(2)}deg)`)
  set(m, "opacity", clamp(mi * 2).toFixed(3))
  const mp = E.outCubic(prog(t, T.match + 0.15, T.match + 0.75))
  $("#match-num").textContent = Math.round(100 * mp)
  $("#match-arc").setAttribute("stroke-dashoffset", (S.ringC * (1 - mp)).toFixed(2))
}

/* ------------------------------------------------------------ S7 OUTRO */

function s7(t) {
  if (!scene("#s7", t, T.s7, 99)) return
  const lk = $("#lockup")
  const lin = E.outExpo(prog(t, T.lockup - 0.1, T.lockup + 0.8))
  set(lk, "transform", `translateY(${((1 - lin) * 40).toFixed(1)}px) scale(${lerp(1.08, 1, lin).toFixed(3)})`)
  const draw = E.outExpo(prog(t, T.lockup, T.lockup + 0.7))
  S.lkRing.setAttribute("stroke-dashoffset", (S.lkLen * (1 - draw)).toFixed(2))
  const tail = E.outBack(prog(t, T.lockup + 0.25, T.lockup + 0.55))
  const tailEl = $("#lockup .lk-tail")
  set(tailEl, "transform", `scale(${tail.toFixed(3)})`)
  set(tailEl, "transformOrigin", "7px 22px")
  const dot = E.outBack(prog(t, T.lockup - 0.15, T.lockup + 0.15))
  $("#lockup .lk-dot").setAttribute("r", Math.max(0.001, 3.8 * dot).toFixed(3))
  $("#wm7-r").setAttribute("width", (82 * E.inOutCubic(prog(t, T.lockup + 0.35, T.lockup + 1.0))).toFixed(2))

  // The dot's light — the answer — breathing on the end card.
  const r = rectIn(lk)
  const k = r.w / 112.2
  const dx = r.x + (0 + 26.2 * 0.86 - 2) * k
  const dy = r.y + (1.24 + 15 * 0.86) * k
  const dt = t - T.lockup
  FX.flare(dx, dy, 60 + 380 * E.outExpo(clamp(dt / 0.8)), "92,230,165", dt < 0 ? 0 : 0.25 + 0.6 * Math.max(0, 1 - dt / 0.6) + 0.05 * Math.sin(t * 3))
  FX.ring(dx, dy, 20 + 1300 * E.outCubic(clamp(dt / 1.2)), 6 * (1 - clamp(dt / 1.2)) + 1, "92,230,165", dt > 0 ? 0.7 * (1 - clamp(dt / 1.2)) : 0)
  FX.burst(FX.SPARKS.lockup, dx, dy, dt)

  revealChars($("#s7-title"), t, T.s7Title, { stagger: 0.018 })

  const f = $$("#feats .feat")
  f.forEach((el, i) => {
    const p = E.outExpo(prog(t, T.s7Title + 0.5 + i * 0.09, T.s7Title + 1.1 + i * 0.09))
    set(el, "opacity", p.toFixed(3))
    set(el, "transform", `translateY(${((1 - p) * 30).toFixed(1)}px)`)
  })

  const c = $("#cta")
  const ci = E.outBack(prog(t, T.cta, T.cta + 0.5))
  set(c, "transform", `scale(${lerp(0.6, 1, ci).toFixed(3)})`)
  set(c, "opacity", clamp(ci * 2).toFixed(3))
  const sh = prog(t, T.cta + 0.8, T.cta + 1.5)
  set($("#shine"), "left", `${(-200 + sh * 1100).toFixed(0)}px`)
  if (t > T.cta) FX.flare(540, 1334, 520, "92,230,165", 0.12 + 0.05 * Math.sin(t * 2.5))

  const u = env(t, T.cta + 0.25, 0.7)
  set($("#url"), "opacity", u.a.toFixed(3))
  set($("#url"), "transform", `translateY(${((1 - u.a) * 20).toFixed(1)}px)`)
  const fi = env(t, T.cta + 0.4, 0.7)
  set($("#fine"), "opacity", fi.a.toFixed(3))
}
