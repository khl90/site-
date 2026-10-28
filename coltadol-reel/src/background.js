/*
  The city behind everything (canvas #bg), the light on top of it (#fx,
  screen-blended) and film grain (#grain).

  Every enquiry is a lit window: amber while someone waits, green once
  Coltadol has answered — the landing page's own metaphor, kept literal so
  the background tells the story even when the UI is in front of it.
*/

const BG = (() => {
  const cv = $("#bg")
  const ctx = cv.getContext("2d")
  const R = rng(11)

  const AMBER = [255, 179, 71]
  const GREEN = [92, 230, 165]

  /* ------------------------------------------------------------ stars */
  const stars = Array.from({ length: 170 }, () => ({
    x: R() * 1080,
    y: R() * 1500,
    r: 0.6 + R() * 1.7,
    ph: R() * Math.PI * 2,
    sp: 0.6 + R() * 2.2,
  }))

  /* --------------------------------------------------------- the city */
  // Two layers of towers; y is relative to the ground line (negative = up).
  const towers = []
  for (const layer of [0, 1]) {
    let x = -220
    while (x < 1300) {
      const w = layer === 0 ? 90 + R() * 120 : 120 + R() * 170
      const hMax = layer === 0 ? 700 : 980
      const hMin = layer === 0 ? 260 : 340
      // Shorter in the middle so the copy keeps a clear column.
      const mid = 1 - 0.45 * Math.exp(-Math.pow((x + w / 2 - 540) / 260, 2))
      const h = (hMin + R() * (hMax - hMin)) * mid
      towers.push({ layer, x, w, h, crown: R() })
      x += w + (layer === 0 ? 6 + R() * 30 : -10 + R() * 26)
    }
  }
  towers.sort((a, b) => a.layer - b.layer)

  const windows = []
  for (const tw of towers) {
    const gx = tw.layer === 0 ? 20 : 26
    const gy = tw.layer === 0 ? 28 : 34
    const ww = tw.layer === 0 ? 8 : 12
    const wh = tw.layer === 0 ? 12 : 18
    const cols = Math.floor((tw.w - 24) / gx)
    const rows = Math.floor((tw.h - 46) / gy)
    const ox = tw.x + (tw.w - (cols - 1) * gx - ww) / 2
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        if (R() > (tw.layer === 0 ? 0.5 : 0.6)) continue
        windows.push({ layer: tw.layer, x: ox + c * gx, y: -tw.h + 30 + r * gy, w: ww, h: wh, ev: [], seed: R() })
      }
  }

  // Events: [t, state] with state 0 off, 1 amber (waiting), 2 green (answered).
  const near = windows.filter((w) => w.layer === 1)
  // The four notifications of the hook each light a window you can see.
  const featured = near.filter((w) => w.y > -560 && w.y < -260 && Math.abs(w.x - 540) > 140 && Math.abs(w.x - 540) < 470)
  T.notifs.forEach((t, i) => featured[Math.floor((i + 0.5) * (featured.length / 4))].ev.push([t, 1]))
  for (const w of windows) {
    const isFeatured = w.ev.length > 0
    if (!isFeatured && w.seed < 0.42) {
      w.ev.push([0.3 + 6.0 * Math.sqrt(R()), 1])
      if (R() < 0.45) w.ev.push([T.l3 + R() * 0.9, 0])
    }
    const lit = isFeatured || w.seed < 0.42 || R() < 0.62
    if (lit) {
      const d = Math.hypot(w.x - 540, w.y + 900)
      w.ev.push([T.impact + 0.06 + d / 1300 + R() * 0.12, 2])
      if (R() < 0.12) {
        const a = 9.5 + R() * 12.5
        w.ev.push([a, 1], [a + 0.6 + R() * 0.8, 2])
      }
    }
    const d = Math.hypot(w.x - 540, w.y + 700)
    w.ev.push([T.lockup + 0.05 + d / 1600 + R() * 0.1, 2])
    w.ev.sort((a, b) => a[0] - b[0])
  }

  function windowState(w, t) {
    let prev = 0
    let cur = 0
    let since = 1e9
    for (const [et, s] of w.ev) {
      if (et > t) break
      prev = cur
      cur = s
      since = t - et
    }
    return { prev, cur, p: E.outCubic(clamp(since / 0.22)), since }
  }

  /* ------------------------------------------------------------ sprites */
  function glowSprite(rgb) {
    const c = document.createElement("canvas")
    c.width = c.height = 64
    const g = c.getContext("2d")
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, `rgba(${rgb},0.9)`)
    grd.addColorStop(0.35, `rgba(${rgb},0.25)`)
    grd.addColorStop(1, `rgba(${rgb},0)`)
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    return c
  }
  const SPR = { 1: glowSprite(AMBER.join(",")), 2: glowSprite(GREEN.join(",")) }

  const mixHex = (a, b, x) => {
    const pa = [1, 3, 5].map((i) => parseInt(a.slice(i, i + 2), 16))
    const pb = [1, 3, 5].map((i) => parseInt(b.slice(i, i + 2), 16))
    return `rgb(${pa.map((v, i) => Math.round(lerp(v, pb[i], x))).join(",")})`
  }

  /* ------------------------------------------------------------- camera */
  const cam = (t) => ({
    ground: kf(t, [
      [0, 1900],
      [2.8, 1900],
      [3.5, 2380, E.inOutCubic],
      [6.6, 2380],
      [7.3, 1960, E.outCubic],
      [9.0, 1960],
      [9.8, 2120],
      [19.1, 2160],
      [20.3, 2040],
      [23.1, 2060],
      [24.0, 1930, E.outCubic],
      [27, 1910, E.linear],
    ]),
    zoom: kf(t, [
      [0, 1.0],
      [2.8, 1.05, E.linear],
      [3.5, 1.12],
      [6.6, 1.12],
      [7.3, 1.0, E.outCubic],
      [23.1, 1.0],
      [24.0, 1.04],
      [27, 1.0, E.linear],
    ]),
    drift: Math.sin(t * 0.35) * 18 + t * 2,
    dim: kf(t, [
      [0, 1],
      [9.0, 1],
      [9.8, 0.55],
      [23.0, 0.55],
      [23.8, 1],
    ]),
  })

  const dawn = (t) =>
    kf(t, [
      [0, 0],
      [19.2, 0],
      [20.4, 1, E.inOutCubic],
      [22.9, 1],
      [23.9, 0, E.inOutCubic],
    ])

  function draw(t) {
    const D = dawn(t)
    const c = cam(t)

    // Sky: the blue hour, warming at dawn.
    const sky = ctx.createLinearGradient(0, 0, 0, 1920)
    sky.addColorStop(0, mixHex("#04071a", "#121a4c", D))
    sky.addColorStop(0.45, mixHex("#0a1030", "#283276", D))
    sky.addColorStop(1, mixHex("#1a2462", "#7a5a86", D))
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 1080, 1920)

    // Horizon: amber left in the sky (night) → sunrise (dawn).
    const hz = ctx.createRadialGradient(650, 1950, 0, 650, 1950, 1300)
    hz.addColorStop(0, `rgba(255,179,71,${0.12 + 0.42 * D})`)
    hz.addColorStop(0.5, `rgba(255,140,90,${0.04 + 0.16 * D})`)
    hz.addColorStop(1, "rgba(255,179,71,0)")
    ctx.fillStyle = hz
    ctx.fillRect(0, 0, 1080, 1920)
    const blue = ctx.createRadialGradient(620, 2100, 0, 620, 2100, 1500)
    blue.addColorStop(0, `rgba(43,58,138,${0.55 * (1 - D * 0.5)})`)
    blue.addColorStop(1, "rgba(43,58,138,0)")
    ctx.fillStyle = blue
    ctx.fillRect(0, 0, 1080, 1920)

    // Stars fade with the morning.
    for (const s of stars) {
      const a = (0.25 + 0.55 * (0.5 + 0.5 * Math.sin(s.ph + t * s.sp))) * (1 - D) * 0.8
      ctx.fillStyle = `rgba(238,240,250,${a})`
      ctx.fillRect(s.x, s.y - c.drift * 0.1, s.r, s.r)
    }

    // The city.
    ctx.save()
    ctx.translate(540, c.ground)
    ctx.scale(c.zoom, c.zoom)
    ctx.translate(-540 + Math.sin(t * 0.2) * 10, 0)
    for (const tw of towers) {
      const par = tw.layer === 0 ? 0.6 : 1
      ctx.fillStyle = tw.layer === 0 ? mixHex("#111a46", "#2a2e66", D) : mixHex("#0a0f2c", "#1a1d48", D)
      ctx.fillRect(tw.x, -tw.h * par - (1 - par) * 120, tw.w, tw.h * par + 2000)
      ctx.fillStyle = `rgba(143,152,198,${tw.layer === 0 ? 0.08 : 0.14})`
      ctx.fillRect(tw.x, -tw.h * par - (1 - par) * 120, tw.w, 2)
    }
    const k = c.dim * (1 - 0.55 * D)
    for (const w of windows) {
      const par = w.layer === 0 ? 0.6 : 1
      const y = w.y * par - (1 - par) * 120
      const s = windowState(w, t)
      const base = w.layer === 0 ? 0.35 : 0.5
      ctx.fillStyle = `rgba(30,40,96,${base})`
      ctx.fillRect(w.x, y, w.w, w.h)
      for (const [st, a] of [
        [s.prev, 1 - s.p],
        [s.cur, s.p],
      ]) {
        if (!st || a <= 0.01) continue
        const col = st === 1 ? AMBER : GREEN
        const flick = st === 1 ? 0.85 + 0.15 * Math.sin(t * 9 + w.seed * 40) : 1
        const alpha = a * k * flick * (w.layer === 0 ? 0.7 : 1)
        // A flash of white the instant a window is answered.
        const flash = st === 2 && s.since < 0.25 && a === s.p ? 1 - s.since / 0.25 : 0
        ctx.fillStyle = `rgba(${col.map((v) => Math.round(lerp(v, 255, flash * 0.7))).join(",")},${alpha})`
        ctx.fillRect(w.x, y, w.w, w.h)
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = alpha * (0.45 + flash * 0.8)
        const g = (w.layer === 0 ? 40 : 58) * (1 + flash)
        ctx.drawImage(SPR[st], w.x + w.w / 2 - g / 2, y + w.h / 2 - g / 2, g, g)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
      }
    }
    ctx.restore()

    // Keeps the copy legible where it crosses the towers (as on the hero).
    const fade = ctx.createLinearGradient(0, 0, 0, 1920)
    fade.addColorStop(0, "rgba(4,7,26,0.55)")
    fade.addColorStop(0.3, "rgba(4,7,26,0)")
    fade.addColorStop(0.85, "rgba(11,17,48,0)")
    fade.addColorStop(1, "rgba(11,17,48,0.6)")
    ctx.fillStyle = fade
    ctx.fillRect(0, 0, 1080, 1920)
  }

  return { draw, cam }
})()

/* ================================================================== FX */

const FX = (() => {
  const cv = $("#fx")
  const ctx = cv.getContext("2d")
  const R = rng(29)

  const motes = Array.from({ length: 46 }, () => ({
    x: R() * 1080,
    y: R() * 1920,
    r: 2 + R() * 7,
    sp: 8 + R() * 26,
    ph: R() * 6.28,
    a: 0.05 + R() * 0.12,
  }))

  const sparks = (seed, n) => {
    const r = rng(seed)
    return Array.from({ length: n }, () => ({
      ang: r() * Math.PI * 2,
      v: 500 + r() * 1700,
      life: 0.6 + r() * 0.9,
      w: 1.5 + r() * 2.5,
      hue: r() < 0.82 ? "92,230,165" : "238,240,250",
    }))
  }
  const SPARKS = { impact: sparks(5, 120), lockup: sparks(9, 90) }
  const STREAKS = Array.from({ length: 70 }, () => ({ ang: R() * Math.PI * 2, r0: 500 + R() * 900, len: 60 + R() * 200, delay: R() * 0.3 }))
  const SPEED = Array.from({ length: 40 }, () => ({ x: R() * 1080, len: 200 + R() * 700, w: 1 + R() * 3, ph: R() }))

  function flare(x, y, r, rgb, a) {
    if (a <= 0.002 || r <= 1) return
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${rgb},${a})`)
    g.addColorStop(0.25, `rgba(${rgb},${a * 0.35})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  function ring(x, y, r, w, rgb, a) {
    if (a <= 0.002) return
    ctx.strokeStyle = `rgba(${rgb},${a})`
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  function burst(list, x, y, dt) {
    if (dt < 0) return
    for (const s of list) {
      if (dt > s.life) continue
      const k = 3.2
      const dist = (s.v * (1 - Math.exp(-k * dt))) / k
      const dist2 = (s.v * (1 - Math.exp(-k * Math.max(0, dt - 0.035)))) / k
      const a = 1 - dt / s.life
      ctx.strokeStyle = `rgba(${s.hue},${a})`
      ctx.lineWidth = s.w
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(s.ang) * dist2, y + Math.sin(s.ang) * dist2 + dt * dt * 120)
      ctx.lineTo(x + Math.cos(s.ang) * dist, y + Math.sin(s.ang) * dist + dt * dt * 120)
      ctx.stroke()
    }
  }

  /** Everything converges on the point the answer will come from. */
  function suck(x, y, t, t0, t1) {
    const p = prog(t, t0, t1)
    if (p <= 0 || p >= 1) return
    for (const s of STREAKS) {
      const q = E.inExpo(clamp((p - s.delay) / (1 - s.delay)))
      if (q <= 0) continue
      const r = s.r0 * (1 - q)
      const a = Math.sin(q * Math.PI) * 0.7
      ctx.strokeStyle = `rgba(255,179,71,${a * 0.6})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(s.ang) * r, y + Math.sin(s.ang) * r)
      ctx.lineTo(x + Math.cos(s.ang) * (r + s.len * (1 - q)), y + Math.sin(s.ang) * (r + s.len * (1 - q)))
      ctx.stroke()
    }
  }

  /** Vertical speed lines for a whip-pan. */
  function speed(t, t0, t1, dir = -1) {
    const p = prog(t, t0, t1)
    if (p <= 0 || p >= 1) return
    const a = Math.sin(p * Math.PI)
    for (const s of SPEED) {
      const y = ((s.ph + p * 1.8 * -dir) % 1) * 2400 - 300
      const g = ctx.createLinearGradient(0, y, 0, y + s.len)
      g.addColorStop(0, "rgba(238,240,250,0)")
      g.addColorStop(0.5, `rgba(238,240,250,${a * 0.22})`)
      g.addColorStop(1, "rgba(238,240,250,0)")
      ctx.fillStyle = g
      ctx.fillRect(s.x, y, s.w, s.len)
    }
  }

  /** A soft beam that sweeps down across a rect: the system noticing. */
  function scan(r, p) {
    if (p <= 0 || p >= 1) return
    const y = r.y + p * r.h
    const g = ctx.createLinearGradient(0, y - 120, 0, y + 30)
    g.addColorStop(0, "rgba(92,230,165,0)")
    g.addColorStop(0.8, `rgba(92,230,165,${0.35 * Math.sin(p * Math.PI)})`)
    g.addColorStop(1, "rgba(92,230,165,0)")
    ctx.fillStyle = g
    ctx.fillRect(r.x - 20, y - 120, r.w + 40, 150)
    ctx.fillStyle = `rgba(190,255,225,${0.9 * Math.sin(p * Math.PI)})`
    ctx.fillRect(r.x - 20, y, r.w + 40, 3)
  }

  /** A light trail along a list of points. */
  function trail(pts, rgb) {
    for (let i = 1; i < pts.length; i++) {
      const a = (i / pts.length) * 0.75
      ctx.strokeStyle = `rgba(${rgb},${a})`
      ctx.lineWidth = 2 + (i / pts.length) * 10
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
      ctx.lineTo(pts[i].x, pts[i].y)
      ctx.stroke()
    }
  }

  function begin(t) {
    ctx.clearRect(0, 0, 1080, 1920)
    for (const m of motes) {
      const y = (((m.y - t * m.sp) % 1920) + 1920) % 1920
      const x = m.x + Math.sin(t * 0.6 + m.ph) * 20
      flare(x, y, m.r * 3, "143,152,198", m.a)
    }
  }

  return { begin, flare, ring, burst, suck, speed, scan, trail, SPARKS, ctx }
})()

/* =============================================================== GRAIN */

const GRAIN = (() => {
  const cv = $("#grain")
  const ctx = cv.getContext("2d")
  const R = rng(3)
  const tiles = Array.from({ length: 4 }, () => {
    const c = document.createElement("canvas")
    c.width = c.height = 256
    const g = c.getContext("2d")
    const img = g.createImageData(256, 256)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (R() - 0.5) * 70
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
    return c
  })
  function draw(frame) {
    const tile = tiles[frame % 4]
    const r = rng(frame + 1)
    const ox = -Math.floor(r() * 256)
    const oy = -Math.floor(r() * 256)
    for (let y = oy; y < 1920; y += 256) for (let x = ox; x < 1080; x += 256) ctx.drawImage(tile, x, y)
  }
  return { draw }
})()
