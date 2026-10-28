#!/usr/bin/env node
/*
  Renders src/index.html frame by frame with headless Chromium and encodes
  the result with FFmpeg.

    node scripts/render.mjs                 # full film → out/coltadol-reel-silent.mp4
    node scripts/render.mjs --stills 0.4,8  # PNG stills → out/stills/
    node scripts/render.mjs --workers 4 --fps 30

  Each worker renders a contiguous range of frames into a lossless segment;
  the segments are concatenated and encoded once (H.264, yuv420p, CRF 16).
  It also writes out/cues.json for scripts/soundtrack.py.
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
const URL_ = pathToFileURL(resolve(ROOT, "src/index.html")).href + "?render"

const args = process.argv.slice(2)
const opt = (name, def) => {
  const i = args.indexOf(`--${name}`)
  return i >= 0 ? args[i + 1] : def
}
const WORKERS = Number(opt("workers", Math.max(1, Math.min(4, os.cpus().length))))
const STILLS = opt("stills", null)

async function openPage(browser) {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 })
  page.on("pageerror", (e) => console.error("[page]", e.message))
  await page.goto(URL_)
  await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 })
  return page
}

function ffmpeg(argv) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: ["pipe", "inherit", "inherit"] })
  const done = new Promise((ok, ko) => p.on("close", (c) => (c === 0 ? ok() : ko(new Error(`ffmpeg exited ${c}`)))))
  return { stdin: p.stdin, done }
}

const write = (stream, buf) => new Promise((ok) => (stream.write(buf) ? ok() : stream.once("drain", ok)))

async function main() {
  mkdirSync(OUT, { recursive: true })
  const browser = await chromium.launch({ args: ["--disable-gpu-vsync", "--font-render-hinting=none"] })
  const probe = await openPage(browser)
  const { duration, fps, cues } = await probe.evaluate(() => ({ duration: window.DURATION, fps: Number(new URLSearchParams(location.search).get("fps")) || window.FPS, cues: window.CUES }))
  const FPS_ = Number(opt("fps", fps))
  writeFileSync(resolve(OUT, "cues.json"), JSON.stringify({ duration, cues }, null, 2))

  if (STILLS) {
    mkdirSync(resolve(OUT, "stills"), { recursive: true })
    for (const s of STILLS.split(",").map(Number)) {
      await probe.evaluate(([t, f]) => window.renderAt(t, f), [s, Math.round(s * FPS_)])
      const file = resolve(OUT, "stills", `t${s.toFixed(2).padStart(5, "0")}.png`)
      await probe.screenshot({ path: file })
      console.log("still", file)
    }
    await browser.close()
    return
  }
  await probe.close()

  const total = Math.round(duration * FPS_)
  const per = Math.ceil(total / WORKERS)
  const segDir = resolve(OUT, "segments")
  rmSync(segDir, { recursive: true, force: true })
  mkdirSync(segDir, { recursive: true })
  const started = Date.now()
  let doneFrames = 0

  await Promise.all(
    Array.from({ length: WORKERS }, async (_, w) => {
      const from = w * per
      const to = Math.min(total, from + per)
      if (from >= to) return
      const page = await openPage(browser)
      const enc = ffmpeg(["-f", "image2pipe", "-framerate", String(FPS_), "-c:v", "png", "-i", "-", "-c:v", "libx264rgb", "-preset", "ultrafast", "-qp", "0", resolve(segDir, `seg${w}.mkv`)])
      for (let f = from; f < to; f++) {
        await page.evaluate(([t, f]) => window.renderAt(t, f), [f / FPS_, f])
        const buf = await page.screenshot({ type: "png" })
        await write(enc.stdin, buf)
        doneFrames++
        if (doneFrames % 60 === 0) console.log(`${doneFrames}/${total} frames · ${((Date.now() - started) / 1000).toFixed(0)} s`)
      }
      enc.stdin.end()
      await enc.done
      await page.close()
    })
  )
  await browser.close()

  const list = Array.from({ length: WORKERS }, (_, w) => `file '${resolve(segDir, `seg${w}.mkv`)}'`).join("\n")
  writeFileSync(resolve(segDir, "list.txt"), list)
  const final = resolve(OUT, "coltadol-reel-silent.mp4")
  const enc = ffmpeg([
    "-f", "concat", "-safe", "0", "-i", resolve(segDir, "list.txt"),
    "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
    "-profile:v", "high", "-movflags", "+faststart", "-r", String(FPS_), final,
  ])
  enc.stdin.end()
  await enc.done
  rmSync(segDir, { recursive: true, force: true })
  console.log(`done → ${final} (${total} frames in ${((Date.now() - started) / 1000).toFixed(0)} s)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
