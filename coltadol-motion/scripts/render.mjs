#!/usr/bin/env node
/*
  Renders src/index.html frame by frame in headless Chromium and encodes it.

    node scripts/render.mjs                   # the film → out/coltadol-silent.mp4
    node scripts/render.mjs --stills 0.5,8    # PNG stills → out/stills/
    node scripts/render.mjs --from 9 --to 15  # a section (seconds), for checking
    node scripts/render.mjs --mb 4 --shutter 0.5 --workers 3
    node scripts/render.mjs --encode-only     # re-encode out/master.mkv, no render

  Motion blur is real: each frame is the average of `--mb` sub-frames spread
  over `--shutter` of the frame interval (0.5 = a 180° shutter), mixed by
  FFmpeg's tmix. Workers render contiguous ranges into lossless segments,
  joined into out/master.mkv (kept, so the delivery encode can be redone
  without rendering), then encoded once: H.264 High, yuv420p, BT.709, with
  a fine film grain and a bitrate cap that suits the social platforms.
*/
import { createRequire } from "node:module"
import { spawn } from "node:child_process"
import { mkdirSync, writeFileSync, rmSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"
import os from "node:os"

const require = createRequire(import.meta.url)
const { chromium } = require("playwright")

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OUT = resolve(ROOT, "out")
const PAGE = pathToFileURL(resolve(ROOT, "src/index.html")).href + "?render"

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const WORKERS = Number(opt("workers", Math.max(1, Math.min(3, os.cpus().length - 1))))
const MB = Number(opt("mb", 4))
const SHUTTER = Number(opt("shutter", 0.5))
const STILLS = opt("stills", null)
const NAME = opt("out", "coltadol-silent")
const GRAIN = Number(opt("grain", 3)) // temporal luma noise, 0 = none
const ENCODE_ONLY = args.includes("--encode-only")

/** master.mkv → the delivery MP4. */
async function encode(fps) {
  const final = resolve(OUT, `${NAME}.mp4`)
  const enc = ffmpeg([
    "-i", resolve(OUT, "master.mkv"),
    "-vf", `scale=out_color_matrix=bt709:out_range=tv,format=yuv420p${GRAIN ? `,noise=c0s=${GRAIN}:c0f=t` : ""}`,
    "-c:v", "libx264", "-preset", "slow", "-crf", "18", "-maxrate", "14M", "-bufsize", "28M",
    "-profile:v", "high", "-level", "4.2", "-g", String(fps * 2),
    "-colorspace", "bt709", "-color_primaries", "bt709", "-color_trc", "bt709", "-color_range", "tv",
    "-r", String(fps), "-movflags", "+faststart", final,
  ])
  enc.stdin.end()
  await enc.done
  return final
}

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  page.on("pageerror", (e) => console.error("[page]", e.message))
  page.on("console", (m) => m.type() === "error" && console.error("[console]", m.text()))
  await page.goto(PAGE)
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 })
  const cdp = await page.context().newCDPSession(page)
  const shot = async () => Buffer.from((await cdp.send("Page.captureScreenshot", { format: "png", optimizeForSpeed: true })).data, "base64")
  return { page, shot }
}

function ffmpeg(argv) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: ["pipe", "inherit", "inherit"] })
  const done = new Promise((ok, ko) => p.on("close", (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg exited ${c}`)))))
  return { stdin: p.stdin, done }
}
const write = (stream, buf) => new Promise((ok) => (stream.write(buf) ? ok() : stream.once("drain", ok)))

async function main() {
  mkdirSync(OUT, { recursive: true })
  if (ENCODE_ONLY) {
    console.log("done →", await encode(30))
    return
  }
  const browser = await chromium.launch({ args: ["--font-render-hinting=none", "--disable-gpu-vsync"] })
  const probe = await openPage(browser)
  const { duration, fps, cues } = await probe.page.evaluate(() => ({ duration: window.DURATION, fps: window.FPS, cues: window.CUES }))
  writeFileSync(resolve(OUT, "cues.json"), JSON.stringify({ duration, fps, cues }, null, 1))

  if (STILLS) {
    mkdirSync(resolve(OUT, "stills"), { recursive: true })
    for (const s of STILLS.split(",").map(Number)) {
      await probe.page.evaluate(([t, f]) => window.renderAt(t, f), [s, Math.round(s * fps)])
      const file = resolve(OUT, "stills", `t${s.toFixed(2).padStart(5, "0")}.png`)
      writeFileSync(file, await probe.shot())
      console.log("still", file)
    }
    await browser.close()
    return
  }
  await probe.page.close()

  const f0 = Math.round(Number(opt("from", 0)) * fps)
  const f1 = Math.round(Number(opt("to", duration)) * fps)
  const total = f1 - f0
  const per = Math.ceil(total / WORKERS)
  const segDir = resolve(OUT, "segments")
  rmSync(segDir, { recursive: true, force: true })
  mkdirSync(segDir, { recursive: true })
  const started = Date.now()
  let done = 0
  const mix = `tmix=frames=${MB}:weights='${Array(MB).fill(1).join(" ")}',select='eq(mod(n\\,${MB})\\,${MB - 1})',setpts=N/(${fps}*TB)`

  await Promise.all(
    Array.from({ length: WORKERS }, async (_, w) => {
      const from = f0 + w * per
      const to = Math.min(f1, from + per)
      if (from >= to) return
      const { page, shot } = await openPage(browser)
      const enc = ffmpeg(["-f", "image2pipe", "-framerate", String(fps * MB), "-c:v", "png", "-i", "-", "-vf", mix, "-r", String(fps), "-c:v", "libx264rgb", "-preset", "ultrafast", "-qp", "0", resolve(segDir, `seg${w}.mkv`)])
      for (let f = from; f < to; f++) {
        for (let k = 0; k < MB; k++) {
          const off = MB > 1 ? ((k + 0.5) / MB - 0.5) * SHUTTER : 0
          await page.evaluate(([t, f]) => window.renderAt(t, f), [(f + off) / fps, f])
          await write(enc.stdin, await shot())
        }
        if (++done % 30 === 0) console.log(`${done}/${total} frames · ${((Date.now() - started) / 1000).toFixed(0)} s`)
      }
      enc.stdin.end()
      await enc.done
      await page.close()
    })
  )
  await browser.close()

  const list = Array.from({ length: WORKERS }, (_, w) => resolve(segDir, `seg${w}.mkv`))
    .filter((_, w) => f0 + w * per < f1)
    .map((f) => `file '${f}'`)
    .join("\n")
  writeFileSync(resolve(segDir, "list.txt"), list)
  const join = ffmpeg(["-f", "concat", "-safe", "0", "-i", resolve(segDir, "list.txt"), "-c", "copy", resolve(OUT, "master.mkv")])
  join.stdin.end()
  await join.done
  rmSync(segDir, { recursive: true, force: true })
  const final = await encode(fps)
  console.log(`done → ${final} (${total} frames × ${MB} sub-frames in ${((Date.now() - started) / 1000).toFixed(0)} s)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
