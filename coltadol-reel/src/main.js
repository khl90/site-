/*
  Entry point. `?render` → frame-accurate mode driven by scripts/render.mjs
  (window.renderAt). Otherwise → a realtime preview with a scrubber.
*/

let FRAME = 0

function renderAt(t, frame = Math.round(t * FPS)) {
  FRAME = frame
  BG.draw(t)
  renderScenes(t)
  GRAIN.draw(frame)
}

async function boot() {
  await document.fonts.ready
  await Promise.all([...document.fonts].map((f) => f.load().catch(() => {})))
  buildScenes()
  window.renderAt = renderAt
  window.CUES = CUES
  window.DURATION = DURATION
  window.FPS = FPS

  if (new URLSearchParams(location.search).has("render")) {
    document.body.classList.add("render")
    renderAt(0)
    window.READY = true
    return
  }

  // Preview: fit the stage to the window, play in realtime, scrub.
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
  let t = 0
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
