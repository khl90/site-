#!/usr/bin/env node
/*
  Contact sheet of stills, for checking the film without watching it:

    node scripts/sheet.mjs out/sheet.png 0.3,1.2,2.4,...   (any count, 4 per row)
*/
import { execFileSync } from "node:child_process"
import { readdirSync, rmSync } from "node:fs"
import { resolve, dirname } from "node:path"
import { fileURLToPath } from "node:url"

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const [outFile, times] = process.argv.slice(2)
rmSync(resolve(ROOT, "out/stills"), { recursive: true, force: true })
execFileSync("node", [resolve(ROOT, "scripts/render.mjs"), "--stills", times], { stdio: "inherit" })
const files = readdirSync(resolve(ROOT, "out/stills"))
  .filter((f) => f.endsWith(".png"))
  .sort()
  .map((f) => resolve(ROOT, "out/stills", f))
const cols = 4
const rows = Math.ceil(files.length / cols)
const inputs = files.flatMap((f) => ["-i", f])
const label = (i) => `[${i}]scale=405:720,drawtext=text='${files[i].match(/t([\d.]+)\.png/)[1]} s':x=10:y=10:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v${i}]`
let graph = files.map((_, i) => label(i)).join(";")
const pad = rows * cols - files.length
for (let i = 0; i < pad; i++) graph += `;color=black:s=405x720:d=1[p${i}]`
const cells = [...files.map((_, i) => `[v${i}]`), ...Array.from({ length: pad }, (_, i) => `[p${i}]`)]
graph += `;${cells.join("")}xstack=inputs=${cells.length}:layout=${cells.map((_, i) => `${(i % cols) * 405}_${Math.floor(i / cols) * 720}`).join("|")}`
execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...inputs, "-filter_complex", graph, "-frames:v", "1", resolve(ROOT, outFile)], { stdio: "inherit" })
console.log(resolve(ROOT, outFile))
