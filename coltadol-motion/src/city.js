/*
  The city at night (canvas #city): rows of towers in real perspective, seen
  through one camera that the whole film shares.

  Every window is an enquiry — the landing page's facade, made 3D:
    0 dark · 1 amber, someone is waiting · 2 green, Coltadol answered ·
    3 dying, an enquiry nobody followed up (flickers out).

  World units: x right, y up (ground at 0), z away from the camera.
*/

const CITY = (() => {
  const cv = $("#city")
  const main = cv.getContext("2d")
  let ctx = main
  // Depth of field is drawn small, blurred small and scaled up: the same
  // look as a full-size blur at a fraction of the cost.
  const small = [document.createElement("canvas"), document.createElement("canvas")]
  const smallCtx = small.map((c) => c.getContext("2d"))
  const R = rng(7)
  const F = 1100 // focal length, px

  const AMBER = [255, 179, 71]
  const GREEN = [92, 230, 165]

  /* ------------------------------------------------------------- the camera */
  // The first enquiry's window: the hook starts on it, the dive ends in it.
  const W0 = { x: 0, y: 980, z: 4000 }

  function camAt(t) {
    const d = kf(t, [
      [0, 360],
      [T.pull, 318, E.linear],
      [T.pull + 0.95, 2900, E.inOutQuart],
      [T.collapse, 2250, E.linear],
      [T.impact, 1500, E.inExpo],
      [T.impact + 0.9, 2750, E.outExpo],
      [T.dive, 2550, E.linear],
      [T.portal, 26, (x) => x ** 4], // through the window: it fills the frame…
      [T.portal + 0.02, 3400, E.linear], // …and the cut hides behind it
      [T.dawn, 3000, E.linear],
      [T.dawn + 1.6, 4300, E.inOutCubic],
      [T.mOut, 4500, E.linear],
      [T.lockup, 3600, E.outCubic],
      [T.end, 3200, E.linear],
    ])
    // The dive zooms exponentially: constant perceived speed, accelerating.
    const dd = t > T.dive && t < T.portal ? 2550 * Math.pow(26 / 2550, E.inCubic(prog(t, T.dive, T.portal))) : d
    const x = kf(t, [
      [0, 0],
      [T.pull, 0],
      [T.pull + 0.95, -160],
      [T.collapse, 260, E.linear],
      [T.impact, 0],
      [T.dive, 60, E.linear],
      [T.portal, 0],
      [T.portal + 0.02, -500, E.linear],
      [T.dawn, 600, E.linear],
      [T.mOut, 300],
      [T.end, -100, E.linear],
    ])
    const y = kf(t, [
      [0, W0.y],
      [T.pull, W0.y],
      [T.pull + 0.95, 1050],
      [T.collapse, 1150, E.linear],
      [T.impact, 1100],
      [T.impact + 0.9, 1150, E.outExpo],
      [T.dive, 1120, E.linear],
      [T.portal, W0.y],
      [T.portal + 0.02, 1700, E.linear],
      [T.dawn, 1500, E.linear],
      [T.dawn + 1.6, 1900],
      [T.mOut, 1950],
      [T.lockup, 1350, E.outCubic],
      [T.end, 1250, E.linear],
    ])
    const yaw = kf(t, [
      [0, 0],
      [T.pull, 0],
      [T.pull + 0.95, -0.12],
      [T.collapse, 0.09, E.linear],
      [T.impact, 0],
      [T.dive, -0.03, E.linear],
      [T.portal, 0],
      [T.portal + 0.02, 0.1, E.linear],
      [T.dawn, -0.12, E.linear],
      [T.mOut, -0.05],
      [T.end, 0.04, E.linear],
    ])
    const roll = kf(t, [
      [0, 0],
      [T.pull, 0.012],
      [T.pull + 0.95, 0.035],
      [T.collapse, -0.02, E.linear],
      [T.impact, 0],
      [T.dive, 0.01, E.linear],
      [T.portal, -0.05, E.inCubic],
      [T.portal + 0.02, 0.0],
      [T.end, 0],
    ])
    const pitch = kf(t, [
      [0, 0],
      [T.pull + 0.95, 0.07],
      [T.collapse, 0.04, E.linear],
      [T.impact + 0.9, 0.08, E.outExpo],
      [T.dive, 0.05, E.linear],
      [T.portal, 0],
      [T.portal + 0.02, -0.04],
      [T.dawn + 1.6, -0.06],
      [T.lockup, -0.02],
    ])
    // A hand-held breath, never zero.
    const br = Math.sin(t * 1.7) * 0.0025 + Math.sin(t * 0.9 + 1) * 0.002
    return { x, y, z: W0.z - dd, yaw: yaw + br, pitch: pitch + br * 0.6, roll }
  }

  let C = camAt(0)
  let K = { cy: 1, sy: 0, cp: 1, sp: 0, cr: 1, sr: 0 }
  function useCam(c) {
    C = c
    K = { cy: Math.cos(c.yaw), sy: Math.sin(c.yaw), cp: Math.cos(c.pitch), sp: Math.sin(c.pitch), cr: Math.cos(c.roll), sr: Math.sin(c.roll) }
  }
  /** World → screen with the current camera. Returns null behind the lens. */
  function proj(X, Y, Z) {
    const dx = X - C.x
    const dy = Y - C.y
    const dz = Z - C.z
    const x1 = dx * K.cy - dz * K.sy
    const z1 = dx * K.sy + dz * K.cy
    const y1 = dy * K.cp - z1 * K.sp
    const z2 = dy * K.sp + z1 * K.cp
    if (z2 < 20) return null
    const k = F / z2
    const sx = x1 * k
    const sy = -y1 * k
    return { x: 540 + sx * K.cr - sy * K.sr, y: 960 + sx * K.sr + sy * K.cr, k, z: z2 }
  }

  /* ----------------------------------------------------------- the skyline */
  const WIN = { w: 46, h: 66, gx: 78, gy: 108 }
  const towers = []
  const addTower = (x0, x1, h, z, d, row) => towers.push({ x0, x1, h, z, d, row, wins: [], beacon: h > 3000 && R() < 0.5 })
  // The featured tower, its window W0 on the facade's centre column.
  addTower(-312, 312, 3400, W0.z, 520, 2)
  const ROWS = [
    { z: 2500, clear: 950, hMin: 420, hMax: 1300 },
    { z: 3200, clear: 760, hMin: 700, hMax: 2000 },
    { z: 4000, clear: 0, hMin: 1400, hMax: 3600 },
    { z: 4900, clear: 0, hMin: 1600, hMax: 4000 },
    { z: 6000, clear: 0, hMin: 1800, hMax: 4400 },
    { z: 7400, clear: 0, hMin: 2000, hMax: 4600 },
    { z: 9200, clear: 0, hMin: 2200, hMax: 4800 },
  ]
  ROWS.forEach((row, ri) => {
    const X = row.z * 0.66 + 900
    let x = -X + R() * 200
    while (x < X) {
      const w = 300 + R() * 420
      const x0 = x
      const x1 = x + w
      x = x1 + 50 + R() * 230
      if (row.clear && Math.max(Math.abs(x0), Math.abs(x1)) < row.clear + w && !(x1 < -row.clear || x0 > row.clear)) continue
      if (ri === 2 && x1 > -420 && x0 < 420) continue // featured tower's slot
      // Lower in the middle of the near rows so the copy keeps a clear column.
      const mid = ri < 2 ? 1 - 0.35 * Math.exp(-Math.pow((x0 + x1) / 2 / 1400, 2)) : 1
      addTower(x0, x1, (row.hMin + R() * (row.hMax - row.hMin)) * mid, row.z + (ri > 1 ? R() * 260 : 0), 300 + R() * 500, ri)
    }
  })

  // Windows on each front face.
  const wins = []
  for (const tw of towers) {
    const cols = Math.floor((tw.x1 - tw.x0 - 70) / WIN.gx)
    const rows = Math.floor((tw.h - 220) / WIN.gy)
    const ox = (tw.x0 + tw.x1) / 2 - ((cols - 1) * WIN.gx) / 2
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++) {
        const w = { x: ox + c * WIN.gx, y: 150 + r * WIN.gy + WIN.h / 2, z: tw.z, row: tw.row, ev: [], seed: R(), tw }
        tw.wins.push(w)
        wins.push(w)
      }
  }
  // W0 itself: the window on the centre column nearest y = 980.
  const w0 = towers[0].wins.reduce((best, w) => (Math.abs(w.x) + Math.abs(w.y - W0.y) < Math.abs(best.x) + Math.abs(best.y - W0.y) ? w : best))
  W0.x = w0.x
  W0.y = w0.y

  /* ---------------------------------------------------- the night's events */
  const S = rng(23)
  const dist0 = (w) => Math.hypot(w.x - W0.x, w.y - W0.y, (w.z - W0.z) * 0.8)
  for (const w of wins) {
    if (w === w0) {
      w.ev.push([T.win, 1], [T.wave, 2])
      continue
    }
    const d = dist0(w)
    let everLit = false
    // The pull-back reveals the city lighting up around the first enquiry.
    const pLit = w.row <= 2 ? 0.5 : w.row >= 5 ? 0.3 : 0.42
    if (S() < pLit) {
      const tl = Math.min(T.die - 0.1, T.pull + 0.35 + d / 7000 + Math.pow(S(), 0.8) * 2.6)
      w.ev.push([tl, 1])
      everLit = true
      if (S() < 0.55) w.ev.push([T.die + S() * 1.0, 3])
    }
    if (everLit || S() < 0.3) w.ev.push([T.wave + 0.05 + d / 8000 + S() * 0.12, 2])
    // Life goes on behind the UI: new enquiries, answered within half a second.
    if (S() < 0.05) {
      const a = T.portal + 0.5 + S() * (T.mOut - T.portal - 1)
      w.ev.push([a, 1], [a + 0.45 + S() * 0.3, 2])
    }
    // At the end the whole skyline is answered.
    if (!everLit && S() < 0.6) w.ev.push([T.lockup + 0.1 + d / 9000 + S() * 0.2, 2])
    w.ev.sort((a, b) => a[0] - b[0])
  }

  /** {cur, prev, since} of a window at t. */
  function stateOf(w, t) {
    let prev = 0
    let cur = 0
    let since = 1e9
    for (const [et, s] of w.ev) {
      if (et > t) break
      prev = cur
      cur = s
      since = t - et
    }
    return { cur, prev, since }
  }

  /* ------------------------------------------------------------ the stars */
  const stars = Array.from({ length: 220 }, () => ({ x: R() * 1600 - 260, y: R() * 1300, r: 0.6 + R() * 1.8, ph: R() * 6.28, sp: 0.5 + R() * 2 }))

  /* ------------------------------------------------------------- sprites */
  function glow(rgb) {
    const c = document.createElement("canvas")
    c.width = c.height = 64
    const g = c.getContext("2d")
    const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grd.addColorStop(0, `rgba(${rgb},0.85)`)
    grd.addColorStop(0.3, `rgba(${rgb},0.28)`)
    grd.addColorStop(1, `rgba(${rgb},0)`)
    g.fillStyle = grd
    g.fillRect(0, 0, 64, 64)
    return c
  }
  const SPR = { 1: glow(AMBER.join(",")), 2: glow(GREEN.join(",")), red: glow("255,80,80"), white: glow("238,240,250") }

  const mix = (a, b, x) => a.map((v, i) => Math.round(lerp(v, b[i], x)))
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`
  const hex = (s) => [1, 3, 5].map((i) => parseInt(s.slice(i, i + 2), 16))

  /* -------------------------------------------------------------- looks */
  /** 0 = blue hour, 1 = sunrise. */
  const dawnAt = (t) =>
    kf(t, [
      [0, 0],
      [T.dawn, 0],
      [T.dawn + 1.4, 1, E.inOutCubic],
      [T.mOut, 1],
      [T.lockup + 0.4, 0.12, E.inOutCubic],
    ])
  /** Overall light of the city (the collapse goes to black). */
  const lightAt = (t) =>
    kf(t, [
      [0, 1],
      [T.collapse, 1],
      [T.impact - 0.05, 0.05, E.inCubic],
      [T.impact + 0.3, 1, E.outCubic],
      [T.wave + 1.1, 1],
      [T.wave + 1.7, 0.72],
      [T.dive, 0.72],
      [T.dive + 0.3, 1],
    ])

  /* --------------------------------------------------------------- draw */
  function quad(p) {
    ctx.moveTo(p[0].x, p[0].y)
    ctx.lineTo(p[1].x, p[1].y)
    ctx.lineTo(p[2].x, p[2].y)
    ctx.lineTo(p[3].x, p[3].y)
    ctx.closePath()
  }

  /** Lens blur on the city, px: shallow focus on the first window, soft behind the UI. */
  const blurAt = (t) =>
    kf(t, [
      [0, 4],
      [T.pull, 4],
      [T.pull + 0.6, 0],
      [T.portal, 0],
      [T.portal + 0.35, 9],
      [T.rOut, 9],
      [T.dawn + 0.7, 1.5],
      [T.mOut, 1.5],
      [T.lockup + 0.5, 2.5],
    ])

  function draw(t) {
    const b = blurAt(t)
    if (b < 1.2) {
      ctx = main
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      paint(t)
      return
    }
    const k = b < 3 ? 0.5 : 0.25
    for (const c of small) {
      if (c.width !== 1080 * k) {
        c.width = 1080 * k
        c.height = 1920 * k
      }
    }
    ctx = smallCtx[0]
    ctx.setTransform(k, 0, 0, k, 0, 0)
    paint(t)
    const bc = smallCtx[1]
    bc.clearRect(0, 0, small[1].width, small[1].height)
    bc.filter = `blur(${f2(b * k)}px)`
    bc.drawImage(small[0], 0, 0)
    bc.filter = "none"
    ctx = main
    main.setTransform(1, 0, 0, 1, 0, 0)
    main.imageSmoothingEnabled = true
    main.imageSmoothingQuality = "high"
    main.drawImage(small[1], 0, 0, 1080, 1920)
  }

  function paint(t) {
    useCam(camAt(t))
    const D = dawnAt(t)
    const L = lightAt(t)

    // Sky, anchored to the horizon so it moves with the camera.
    const hz = proj(C.x + Math.sin(C.yaw) * 1e5, C.y, C.z + Math.cos(C.yaw) * 1e5)
    const hy = hz ? hz.y : 1200
    const sky = ctx.createLinearGradient(0, hy - 1900, 0, hy + 200)
    sky.addColorStop(0, rgb(mix(hex("#03061a"), hex("#1c2a6e"), D)))
    sky.addColorStop(0.55, rgb(mix(hex("#0a1030"), hex("#55508f"), D)))
    sky.addColorStop(0.9, rgb(mix(hex("#1a2462"), hex("#e48a6a"), D)))
    sky.addColorStop(1, rgb(mix(hex("#24317a"), hex("#ffc27a"), D)))
    ctx.fillStyle = sky
    ctx.fillRect(0, 0, 1080, 1920)
    // The light left at the horizon (the hero's amber), and the sunrise.
    const sun = ctx.createRadialGradient(700, hy + 60, 0, 700, hy + 60, 760)
    sun.addColorStop(0, `rgba(255,179,71,${0.16 + 0.5 * D})`)
    sun.addColorStop(0.45, `rgba(255,140,90,${0.05 + 0.18 * D})`)
    sun.addColorStop(1, "rgba(255,179,71,0)")
    ctx.fillStyle = sun
    ctx.fillRect(0, 0, 1080, 1920)

    const sx = -C.yaw * F
    for (const s of stars) {
      const a = (0.3 + 0.5 * (0.5 + 0.5 * Math.sin(s.ph + t * s.sp))) * (1 - D) * L
      if (a < 0.02) continue
      const y = s.y - (hy - 1200) * 0.4
      if (y > hy - 40) continue
      ctx.fillStyle = `rgba(238,240,250,${f3(a)})`
      ctx.fillRect(((s.x + sx * 0.2) % 1600 + 1600) % 1600 - 260, y, s.r, s.r)
    }

    // The ground between the towers.
    const gr = ctx.createLinearGradient(0, hy, 0, 1920)
    gr.addColorStop(0, rgb(mix(hex("#121a4c"), hex("#4a3c72"), D)))
    gr.addColorStop(0.25, rgb(mix(hex("#0a1034"), hex("#221d48"), D)))
    gr.addColorStop(1, rgb(mix(hex("#04061a"), hex("#0d0c26"), D)))
    ctx.fillStyle = gr
    ctx.fillRect(0, hy, 1080, 1920 - hy)

    const near = hex("#0a0f30")
    const fogCol = mix(hex("#1f2b6c"), hex("#8a6f96"), D)
    const order = [...towers].sort((a, b) => b.z - a.z || Math.abs((b.x0 + b.x1) / 2 - C.x) - Math.abs((a.x0 + a.x1) / 2 - C.x))
    for (const tw of order) {
      if (tw.z < C.z + 30) continue
      // Atmospheric perspective: the farther, the closer to the horizon's colour.
      const fog = clamp((tw.z - C.z - 900) / 9500) * 0.85
      drawTower(tw, t, D, L, mix(mix(near, hex("#2a2c5c"), D * 0.45), fogCol, fog), fog)
    }
    // Mist at street level: the towers' feet dissolve into it.
    const base = proj(C.x + Math.sin(C.yaw) * 3200, 0, C.z + Math.cos(C.yaw) * 3200)
    if (base) {
      const m = ctx.createLinearGradient(0, base.y - 420, 0, base.y + 260)
      const mc = mix(hex("#141d55"), hex("#6a557e"), D)
      m.addColorStop(0, rgb(mc, 0))
      m.addColorStop(0.62, rgb(mc, 0.55 * L))
      m.addColorStop(1, rgb(mix(hex("#070a24"), hex("#1a1638"), D), 0.9))
      ctx.fillStyle = m
      ctx.fillRect(0, base.y - 420, 1080, 1920)
    }
    // Keeps the copy legible where it crosses the skyline.
    const top = ctx.createLinearGradient(0, 0, 0, 1920)
    top.addColorStop(0, "rgba(3,5,20,0.5)")
    top.addColorStop(0.25, "rgba(3,5,20,0)")
    top.addColorStop(0.8, "rgba(6,9,30,0)")
    top.addColorStop(1, "rgba(6,9,30,0.55)")
    ctx.fillStyle = top
    ctx.fillRect(0, 0, 1080, 1920)
    if (L < 1) {
      ctx.fillStyle = `rgba(2,3,12,${f3(1 - L)})`
      ctx.fillRect(0, 0, 1080, 1920)
    }
  }

  function drawTower(tw, t, D, L, body, fog) {
    const front = [proj(tw.x0, 0, tw.z), proj(tw.x1, 0, tw.z), proj(tw.x1, tw.h, tw.z), proj(tw.x0, tw.h, tw.z)]
    if (front.some((p) => !p)) return
    const minX = Math.min(...front.map((p) => p.x))
    const maxX = Math.max(...front.map((p) => p.x))
    if (maxX < -300 || minX > 1380) return

    // Side face, towards the camera.
    const sideX = C.x < tw.x0 ? tw.x0 : C.x > tw.x1 ? tw.x1 : null
    if (sideX !== null) {
      const side = [proj(sideX, 0, tw.z), proj(sideX, tw.h, tw.z), proj(sideX, tw.h, tw.z + tw.d), proj(sideX, 0, tw.z + tw.d)]
      if (side.every(Boolean)) {
        ctx.beginPath()
        quad(side)
        ctx.fillStyle = rgb(body.map((v) => v * 0.72))
        ctx.fill()
      }
    }
    // Roof, when the camera is above it.
    if (C.y > tw.h) {
      const roof = [proj(tw.x0, tw.h, tw.z), proj(tw.x1, tw.h, tw.z), proj(tw.x1, tw.h, tw.z + tw.d), proj(tw.x0, tw.h, tw.z + tw.d)]
      if (roof.every(Boolean)) {
        ctx.beginPath()
        quad(roof)
        ctx.fillStyle = rgb(body.map((v, i) => v * 0.9 + [6, 8, 18][i]))
        ctx.fill()
      }
    }
    // Front face: a touch lighter at the top, where the sky catches it.
    const g = ctx.createLinearGradient(0, front[3].y, 0, front[0].y)
    g.addColorStop(0, rgb(body.map((v, i) => v + [10, 12, 26][i] + D * 30)))
    g.addColorStop(0.35, rgb(body))
    g.addColorStop(1, rgb(body.map((v) => v * 0.8)))
    ctx.beginPath()
    quad(front)
    ctx.fillStyle = g
    ctx.fill()
    // Roof line.
    ctx.strokeStyle = `rgba(143,152,198,${f3(0.16 + D * 0.15)})`
    ctx.lineWidth = Math.max(1, front[3].k * 3)
    ctx.beginPath()
    ctx.moveTo(front[3].x, front[3].y)
    ctx.lineTo(front[2].x, front[2].y)
    ctx.stroke()
    if (tw.beacon) {
      const b = proj((tw.x0 + tw.x1) / 2, tw.h + 30, tw.z)
      const on = 0.5 + 0.5 * Math.sin(t * 3.2 + tw.x0)
      if (b && on > 0.4) {
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = (on - 0.4) * L * (1 - D * 0.6)
        const s = Math.max(10, b.k * 160)
        ctx.drawImage(SPR.red, b.x - s / 2, b.y - s / 2, s, s)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
      }
    }

    // Windows.
    const k = front[0].k
    const showDark = k > 0.12
    const dark = []
    const lit = []
    for (const w of tw.wins) {
      const st = stateOf(w, t)
      if (st.cur === 0 && st.prev === 0) {
        if (showDark) dark.push(w)
        continue
      }
      lit.push([w, st])
    }
    if (dark.length) {
      ctx.beginPath()
      for (const w of dark) {
        const p = winQuad(w)
        if (p) quad(p)
      }
      ctx.fillStyle = `rgba(${Math.round(lerp(4, 40, D))},${Math.round(lerp(7, 44, D))},${Math.round(lerp(26, 84, D))},${f3(0.7 * (1 - fog) * Math.max(L, 0.2))})`
      ctx.fill()
    }
    const lightK = L * (1 - D * 0.65) * (1 - fog * 0.55)
    for (const [w, st] of lit) {
      const p = winQuad(w)
      if (!p) continue
      const layers = windowLight(w, st, t)
      for (const [col, a, flash] of layers) {
        const alpha = a * lightK
        if (alpha < 0.01) continue
        const c = col === 2 ? GREEN : AMBER
        ctx.beginPath()
        quad(p)
        ctx.fillStyle = rgb(c.map((v) => Math.round(lerp(v, 255, flash * 0.75))), f3(Math.min(1, alpha)))
        ctx.fill()
        const cx = (p[0].x + p[2].x) / 2
        const cy = (p[0].y + p[2].y) / 2
        const s = Math.max(8, Math.abs(p[2].y - p[0].y) * 3.4) * (1 + flash * 0.8)
        ctx.globalCompositeOperation = "lighter"
        ctx.globalAlpha = Math.min(1, alpha * (0.5 + flash))
        ctx.drawImage(SPR[col], cx - s / 2, cy - s / 2, s, s)
        ctx.globalAlpha = 1
        ctx.globalCompositeOperation = "source-over"
      }
    }
  }

  function winQuad(w) {
    const a = proj(w.x - WIN.w / 2, w.y - WIN.h / 2, w.z)
    const b = proj(w.x + WIN.w / 2, w.y - WIN.h / 2, w.z)
    const c = proj(w.x + WIN.w / 2, w.y + WIN.h / 2, w.z)
    const d = proj(w.x - WIN.w / 2, w.y + WIN.h / 2, w.z)
    if (!a || !b || !c || !d) return null
    if (Math.max(a.x, c.x) < -10 || Math.min(a.x, c.x) > 1090 || Math.max(a.y, c.y) < -10 || Math.min(a.y, c.y) > 1930) return null
    return [a, b, c, d]
  }

  /** [[colour 1|2, alpha, flash], ...] — the cross-fade between two states. */
  function windowLight(w, st, t) {
    const p = E.outCubic(clamp(st.since / 0.18))
    const out = []
    const lamp = (s) => (s === 1 ? 0.88 + 0.12 * Math.sin(t * 7 + w.seed * 50) : 1)
    if (st.cur === 3) {
      // Dying: a few stutters, then out.
      const s = st.since
      const flick = s < 0.5 ? [1, 0.2, 0.9, 0, 0.6, 0.1, 0.3, 0, 0.15, 0][Math.floor(s * 20)] : 0
      out.push([1, flick * 0.9, 0])
      return out
    }
    if (st.prev && st.prev !== 3 && p < 1) out.push([st.prev, (1 - p) * lamp(st.prev), 0])
    if (st.cur) {
      const flash = st.cur === 2 && st.since < 0.3 ? 1 - st.since / 0.3 : 0
      out.push([st.cur, p * lamp(st.cur), flash])
    }
    return out
  }

  /** Screen rect of the first enquiry's window at t (for the portal). */
  function w0Rect(t) {
    useCam(camAt(t))
    const p = winQuad(w0) || [proj(w0.x - 23, w0.y - 33, w0.z), null, proj(w0.x + 23, w0.y + 33, w0.z)]
    if (!p[0] || !p[2]) return null
    const x0 = Math.min(p[0].x, p[2].x)
    const y0 = Math.min(p[0].y, p[2].y)
    return { x: x0, y: y0, w: Math.abs(p[2].x - p[0].x), h: Math.abs(p[2].y - p[0].y) }
  }

  /**
   * Windows that light up in view during the problem, for the message
   * bubbles to come out of: their first amber time and where they sit.
   */
  function anchors(n, from, to) {
    const out = []
    for (const w of wins) {
      if (w === w0) continue
      const lit = w.ev.find((e) => e[1] === 1)
      if (!lit || lit[0] < from || lit[0] > to) continue
      useCam(camAt(lit[0]))
      const p = proj(w.x, w.y, w.z)
      if (!p || p.x < 160 || p.x > 920 || p.y < 420 || p.y > 1480) continue
      out.push({ w, t: lit[0], dies: w.ev.some((e) => e[1] === 3) })
    }
    out.sort((a, b) => a.t - b.t)
    // Spread over time: keep every k-th.
    const step = Math.max(1, Math.floor(out.length / n))
    return out.filter((_, i) => i % step === 0).slice(0, n)
  }

  return { draw, camAt, useCam, proj, w0, W0, w0Rect, anchors, dawnAt, F }
})()
