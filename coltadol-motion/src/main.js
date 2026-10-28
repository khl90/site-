/*
  Entry point. `?render` → frame-accurate mode driven by scripts/render.mjs
  through window.renderAt(t, frame). Otherwise → a realtime preview with a
  scrubber (open src/index.html in a browser).
*/

let RENDER = false

function renderAt(t, frame = Math.round(t * FPS)) {
  FX.begin(t)
  CITY.draw(t)
  renderScenes(t)
  // In the render, FFmpeg adds the grain (cheaper, and it dithers the
  // gradients for H.264); the preview draws its own.
  if (!RENDER) GRAIN.draw(frame)
}

async function boot() {
  await document.fonts.ready
  await Promise.all([
    document.fonts.load('800 100px "Bricolage"'),
    document.fonts.load('700 100px "Bricolage"'),
    document.fonts.load('500 40px "DM Sans"'),
    document.fonts.load('500 40px "Plex Mono"'),
  ])
  build()
  Object.assign(window, { renderAt, CUES, DURATION, FPS, T })

  if (new URLSearchParams(location.search).has("render")) {
    RENDER = true
    document.body.classList.add("render")
    renderAt(0)
    window.READY = true
    return
  }

  const fit = () => {
    STAGE_SCALE = Math.min(innerWidth / 1080, (innerHeight - 48) / 1920)
    const st = $("#stage")
    st.style.transform = `scale(${STAGE_SCALE})`
    st.style.left = `${(innerWidth - 1080 * STAGE_SCALE) / 2}px`
  }
  fit()
  addEventListener("resize", fit)
  const scrub = $("#scrub")
  scrub.max = DURATION
  let playing = true
  let t0 = performance.now()
  let t = Number(new URLSearchParams(location.search).get("t")) || 0
  t0 -= t * 1000
  $("#play").onclick = () => {
    playing = !playing
    t0 = performance.now() - t * 1000
  }
  scrub.oninput = () => {
    t = Number(scrub.value)
    t0 = performance.now() - t * 1000
    renderAt(t)
  }
  const loop = (now) => {
    if (playing) {
      t = ((now - t0) / 1000) % DURATION
      scrub.value = t
      renderAt(t)
    }
    $("#clock").textContent = `${t.toFixed(2)} s`
    requestAnimationFrame(loop)
  }
  requestAnimationFrame(loop)
  window.READY = true
}

boot()
