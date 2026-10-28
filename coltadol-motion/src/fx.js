/*
  Light on top of everything (#fx, screen-blended) and film grain (#grain).
*/

const FX = (() => {
  const cv = $("#fx")
  const ctx = cv.getContext("2d")
  const R = rng(31)

  const motes = Array.from({ length: 40 }, () => ({ x: R() * 1080, y: R() * 1920, r: 2 + R() * 6, sp: 10 + R() * 30, ph: R() * 6.28, a: 0.04 + R() * 0.1 }))
  const sparks = (seed, n, vmin, vmax) => {
    const r = rng(seed)
    return Array.from({ length: n }, () => ({ ang: r() * Math.PI * 2, v: vmin + r() * (vmax - vmin), life: 0.5 + r() * 0.9, w: 1.4 + r() * 2.6, white: r() < 0.2 }))
  }
  const SPARKS = { impact: sparks(5, 140, 600, 2200), lockup: sparks(9, 80, 400, 1500), tap: sparks(13, 26, 300, 700) }
  const STREAKS = Array.from({ length: 90 }, () => ({ ang: R() * Math.PI * 2, r0: 450 + R() * 1100, len: 80 + R() * 260, delay: R() * 0.35, w: 1 + R() * 2.5 }))

  function flare(x, y, r, rgb, a) {
    if (a <= 0.003 || r <= 1) return
    const g = ctx.createRadialGradient(x, y, 0, x, y, r)
    g.addColorStop(0, `rgba(${rgb},${f3(Math.min(1, a))})`)
    g.addColorStop(0.22, `rgba(${rgb},${f3(Math.min(1, a) * 0.36)})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(x - r, y - r, r * 2, r * 2)
  }

  function ring(x, y, r, w, rgb, a) {
    if (a <= 0.003 || r <= 0) return
    ctx.strokeStyle = `rgba(${rgb},${f3(a)})`
    ctx.lineWidth = w
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.stroke()
  }

  /** Sparks thrown from (x, y), dt seconds after the hit; they drag and fall. */
  function burst(list, x, y, dt, rgb = "92,230,165") {
    if (dt < 0) return
    ctx.lineCap = "round"
    for (const s of list) {
      if (dt > s.life) continue
      const k = 3.4
      const d1 = (s.v * (1 - Math.exp(-k * dt))) / k
      const d0 = (s.v * (1 - Math.exp(-k * Math.max(0, dt - 0.04)))) / k
      const g = dt * dt * 140
      ctx.strokeStyle = `rgba(${s.white ? "238,240,250" : rgb},${f3(1 - dt / s.life)})`
      ctx.lineWidth = s.w
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(s.ang) * d0, y + Math.sin(s.ang) * d0 + g)
      ctx.lineTo(x + Math.cos(s.ang) * d1, y + Math.sin(s.ang) * d1 + g)
      ctx.stroke()
    }
  }

  /** Light streaks converging on (x, y): everything pulled to one point. */
  function converge(x, y, p, rgb) {
    if (p <= 0 || p >= 1) return
    for (const s of STREAKS) {
      const q = E.inExpo(clamp((p - s.delay) / (1 - s.delay)))
      if (q <= 0) continue
      const r = s.r0 * (1 - q)
      const a = Math.sin(q * Math.PI) * 0.75
      ctx.strokeStyle = `rgba(${rgb},${f3(a)})`
      ctx.lineWidth = s.w
      ctx.beginPath()
      ctx.moveTo(x + Math.cos(s.ang) * r, y + Math.sin(s.ang) * r)
      ctx.lineTo(x + Math.cos(s.ang) * (r + s.len * (1 - q * 0.6)), y + Math.sin(s.ang) * (r + s.len * (1 - q * 0.6)))
      ctx.stroke()
    }
  }

  /** Radial speed lines from the centre (a dive) — `a` is the strength. */
  function zoomLines(a) {
    if (a <= 0.01) return
    for (const s of STREAKS) {
      const r = 200 + ((s.r0 + a * 1600) % 1400)
      const len = s.len * (1 + a * 2)
      const g = ctx.createLinearGradient(540 + Math.cos(s.ang) * r, 960 + Math.sin(s.ang) * r, 540 + Math.cos(s.ang) * (r + len), 960 + Math.sin(s.ang) * (r + len))
      g.addColorStop(0, "rgba(238,240,250,0)")
      g.addColorStop(1, `rgba(238,240,250,${f3(a * 0.35)})`)
      ctx.strokeStyle = g
      ctx.lineWidth = s.w
      ctx.beginPath()
      ctx.moveTo(540 + Math.cos(s.ang) * r, 960 + Math.sin(s.ang) * r)
      ctx.lineTo(540 + Math.cos(s.ang) * (r + len), 960 + Math.sin(s.ang) * (r + len))
      ctx.stroke()
    }
  }

  /** A light trail through points (oldest first). */
  function trail(pts, rgb, w = 10) {
    ctx.lineCap = "round"
    for (let i = 1; i < pts.length; i++) {
      const k = i / pts.length
      ctx.strokeStyle = `rgba(${rgb},${f3(k * 0.7)})`
      ctx.lineWidth = 1.5 + k * w
      ctx.beginPath()
      ctx.moveTo(pts[i - 1].x, pts[i - 1].y)
      ctx.lineTo(pts[i].x, pts[i].y)
      ctx.stroke()
    }
  }

  /** A soft band of light sweeping down a rect: the system noticing. */
  function scan(r, p, rgb = "255,179,71") {
    if (p <= 0 || p >= 1) return
    const y = r.y + p * r.h
    const a = Math.sin(p * Math.PI)
    const g = ctx.createLinearGradient(0, y - 140, 0, y + 20)
    g.addColorStop(0, `rgba(${rgb},0)`)
    g.addColorStop(0.85, `rgba(${rgb},${f3(0.3 * a)})`)
    g.addColorStop(1, `rgba(${rgb},0)`)
    ctx.fillStyle = g
    ctx.fillRect(r.x, y - 140, r.w, 160)
    ctx.fillStyle = `rgba(255,236,200,${f3(0.8 * a)})`
    ctx.fillRect(r.x, y, r.w, 2.5)
  }

  function begin(t) {
    ctx.clearRect(0, 0, 1080, 1920)
    for (const m of motes) {
      const y = (((m.y - t * m.sp) % 1920) + 1920) % 1920
      flare(m.x + Math.sin(t * 0.5 + m.ph) * 24, y, m.r * 3, "143,152,198", m.a)
    }
  }

  return { begin, flare, ring, burst, converge, zoomLines, trail, scan, SPARKS, ctx }
})()

const GRAIN = (() => {
  const ctx = $("#grain").getContext("2d")
  const R = rng(3)
  const tiles = Array.from({ length: 6 }, () => {
    const c = document.createElement("canvas")
    c.width = c.height = 256
    const g = c.getContext("2d")
    const img = g.createImageData(256, 256)
    for (let i = 0; i < img.data.length; i += 4) {
      const v = 128 + (R() - 0.5) * 80
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v
      img.data[i + 3] = 255
    }
    g.putImageData(img, 0, 0)
    return c
  })
  /** Grain changes per frame, not per motion-blur sub-frame. */
  function draw(frame) {
    const r = rng(frame * 7 + 1)
    const ox = -Math.floor(r() * 256)
    const oy = -Math.floor(r() * 256)
    const tile = tiles[frame % tiles.length]
    for (let y = oy; y < 1920; y += 256) for (let x = ox; x < 1080; x += 256) ctx.drawImage(tile, x, y)
  }
  return { draw }
})()
