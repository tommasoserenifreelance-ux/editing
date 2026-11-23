#!/bin/sh
# Storia dell'ozono — one command: voice → events → picture → mix → master
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
LIB=${LIB:-/root/lemo-opuscar}
export LIB
cd "$LIB"
.venv/bin/python core/tts/tts.py "$HERE/voice/lines.json" "$HERE/voice/out"
node core/render/events.mjs "$HERE"
node core/render/video.mjs "$HERE" --fps 24 --workers 4 --out "$HERE/out/video.mp4"
.venv/bin/python "$HERE/mix.py"
sh core/render/mux.sh "$HERE/out/video.mp4" "$HERE/out/mix.wav" "$HERE/storia-ozono.mp4" 24 0
