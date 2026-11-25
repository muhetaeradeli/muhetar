#!/bin/bash
# The film without narration, under your own music (a narrator is added later):
#   MUSIC=my-music/background.mp3 tools/finish_music.sh
# The music is levelled to −20.8 LUFS — the 40 % bed beside a narrator at about −17 LUFS — trimmed or padded to the
# film and faded at the end. Writes out/final/<N>-1440p.mp4 (full quality), <N>-1080p.mp4 and <N>-1440p-кіші.mp4
# (a smaller 1440p copy for messengers).
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
ffmpeg -v error -y -i out/graded.mp4 -i out/user-bed.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$O/$N-${RES}p.mp4"
ffmpeg -v error -y -i "$O/$N-${RES}p.mp4" -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -crf 19 -tune film -pix_fmt yuv420p -c:a copy -movflags +faststart "$O/$N-1080p.mp4"
ffmpeg -v error -y -i "$O/$N-${RES}p.mp4" -c:v libx264 -preset slow -b:v 4300k -maxrate 7000k -bufsize 10000k -tune film -pix_fmt yuv420p -c:a copy -movflags +faststart "$O/$N-${RES}p-кіші.mp4"
cp out/user-bed.wav "$O/background-music.wav"
node engine/render.js srt >/dev/null && cp out/infinity-film.srt "$O/$N.srt"
ls -la $O
