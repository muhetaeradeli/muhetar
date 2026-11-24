#!/bin/bash
# The finished files, from the rendered picture (tools/render_all.sh) and the soundtrack (node song.js):
#   out/final/<N>.mp4            graded picture + voice 60 % / music 40 %   (RES, default 2560×1440)
#   out/final/<N>-1080p.mp4      the same, 1920×1080, for any projector or laptop
#   out/final/<N>-дауыссыз.mp4   graded picture + music only: for a narrator who reads live over the film
#   out/final/<N>-дауыс.mp4      graded picture + voice only (add your own music)
#   out/final/voice.wav, bed.wav, music.wav   the voice, the music bed and the mix (voice + bed = mix)
#   out/final/<N>.srt            the subtitles
# The colour grade (tools/grade.filter, written for a 1080 frame and scaled here) touches only the picture,
# not the letterbox or the subtitles: a gentle film curve, cool shadows, warm highlights, a soft glow.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-1440}
N=${NAME:-Шексіздік-пен-мәңгілік}; O=out/final; mkdir -p $O
if [ "$RES" = "1080" ]; then SRC=out/video.mp4; else SRC=out/video-${RES}p.mp4; fi
k=$(echo "$RES / 1080" | bc -l)
px() { printf '%.0f' "$(echo "$1 * $k" | bc -l)"; }
G="$(sed -e "s/crop=1920:818:0:131/crop=$(px 1920):$(px 818):0:$(px 131)/" -e "s/overlay=0:131/overlay=0:$(px 131)/" -e "s/sigma=26/sigma=$(px 26)/" tools/grade.filter)"
ffmpeg -v error -stats -y -i "$SRC" -filter_complex "$G" -an -c:v libx264 -preset slow -crf 17 -tune film -pix_fmt yuv420p out/graded.mp4
mux() { ffmpeg -v error -y -i out/graded.mp4 -i "$1" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$2"; }
mux out/music.wav "$O/$N.mp4"
mux out/bed.wav "$O/$N-дауыссыз.mp4"
mux out/voice.wav "$O/$N-дауыс.mp4"
[ "$RES" != "1080" ] && ffmpeg -v error -y -i "$O/$N.mp4" -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p -c:a copy -movflags +faststart "$O/$N-1080p.mp4"
cp out/voice.wav out/bed.wav out/music.wav $O/
node engine/render.js srt >/dev/null && cp out/infinity-film.srt "$O/$N.srt"
ls -la $O
