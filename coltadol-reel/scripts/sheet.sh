#!/usr/bin/env bash
# Contact sheet of stills: scripts/sheet.sh out/sheet.png t1,t2,... (8 times)
set -e
cd "$(dirname "$0")/.."
OUTF=$1; TIMES=$2
rm -rf out/stills && node scripts/render.mjs --stills "$TIMES" >/dev/null
FILES=$(ls out/stills/t*.png)
ARGS=""; F=""; i=0
for f in $FILES; do ARGS="$ARGS -i $f"; F="$F[$i]scale=405:720[v$i];"; i=$((i+1)); done
ffmpeg -hide_banner -loglevel error -y $ARGS -filter_complex "$F[v0][v1][v2][v3]hstack=4[a];[v4][v5][v6][v7]hstack=4[b];[a][b]vstack" "$OUTF"
echo "$OUTF"
