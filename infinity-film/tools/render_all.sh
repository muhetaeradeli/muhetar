#!/bin/bash
# Renders the whole film in N resumable parts, then joins them into out/video[-<RES>p].mp4.
# If the machine stops mid-way, run it again: finished parts are kept, only the unfinished one is redone.
#   RES=1440 N=12 tools/render_all.sh        (RES=1080 renders the plain 1920×1080 frame)
set -e
cd "$(dirname "$0")/.."
N=${N:-12}; RES=${RES:-1440}; W=${W:-3}
R=(); [ "$RES" != "1080" ] && R=(--res "$RES")
for i in $(seq 0 $((N - 1))); do node engine/render.js part "$i" "$N" "$W" "${R[@]}"; done
node engine/render.js join "$N" "${R[@]}"
echo RENDER_DONE
