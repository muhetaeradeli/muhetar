#!/bin/bash
# The film without narration, under your own music (a narrator is added later):
#   MUSIC=my-music/background.mp3 tools/finish_music.sh
# The music is levelled to −20.8 LUFS — the 40 % bed beside a narrator at about −17 LUFS — trimmed or padded to the
# film and faded at the end. Writes out/final/<N>-1080p.mp4: 1920×1080, two-pass ≈ 4.4 Mbit/s (≈ 350 MB, small
# enough for messengers). The picture is rendered at RES (default 1440) and scaled down, which keeps it sharper.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-1440}; MUSIC=${MUSIC:-my-music/background.mp3}
N=${NAME:-Шексіздік-пен-мәңгілік}; O=out/final; mkdir -p $O
D=$(node -e "console.log(require('./score.js').DURATION)")
ffmpeg -v error -y -i "$MUSIC" -af "loudnorm=I=-20.8:TP=-2:LRA=11:linear=true,apad,atrim=0:$D,afade=t=in:d=0.4,afade=t=out:st=$((D - 4)):d=4" -ar 48000 -ac 2 -c:a pcm_s16le out/user-bed.wav
if [ "$RES" = "1080" ]; then SRC=out/video.mp4; else SRC=out/video-${RES}p.mp4; fi
k=$(echo "$RES / 1080" | bc -l); px() { printf '%.0f' "$(echo "$1 * $k" | bc -l)"; }
G="$(sed -e "s/crop=1920:818:0:131/crop=$(px 1920):$(px 818):0:$(px 131)/" -e "s/overlay=0:131/overlay=0:$(px 131)/" -e "s/sigma=26/sigma=$(px 26)/" tools/grade.filter)"
ffmpeg -v error -y -i "$SRC" -filter_complex "$G" -an -c:v libx264 -preset slow -crf 17 -tune film -pix_fmt yuv420p out/graded.mp4
ffmpeg -v error -y -i out/graded.mp4 -an -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -b:v 4400k -tune film -pix_fmt yuv420p -pass 1 -passlogfile out/x264 -f mp4 /dev/null
ffmpeg -v error -stats -y -i out/graded.mp4 -i out/user-bed.wav -map 0:v -map 1:a -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -b:v 4400k -maxrate 8000k -bufsize 12000k -tune film -pix_fmt yuv420p -pass 2 -passlogfile out/x264 -c:a aac -b:a 256k -movflags +faststart -shortest "$O/$N-1080p.mp4"
cp out/user-bed.wav "$O/background-music.wav"
node engine/render.js srt >/dev/null && cp out/infinity-film.srt "$O/$N.srt"
ls -la $O
