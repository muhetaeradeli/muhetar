#!/bin/bash
# The film under your own music: MUSIC=my-music/background.mp3 tools/finish_music.sh
# With a narration track (out/voice.wav from node song.js, built from my-voice/ by tools/build_voice.py) the voice is
# mixed in at 80 % beside the music at 20 % (BED=-20.5 for 60/40); without one (VOICE=0) the film has music only.
# The music is levelled to −20.5 LUFS — the 40 % bed beside a narrator at about −17 LUFS — trimmed or padded to the
# film and faded at the end. Writes out/final/<N>-1080p.mp4: 1920×1080, two-pass ≈ 4.4 Mbit/s (≈ 350 MB, small
# enough for messengers). The picture is rendered at RES (default 1440) and scaled down, which keeps it sharper.
set -e
cd "$(dirname "$0")/.."
RES=${RES:-1440}; MUSIC=${MUSIC:-my-music/background.mp3}
N=${NAME:-Шексіздік-пен-мәңгілік}; O=out/final; mkdir -p $O
D=$(node -e "console.log(require('./score.js').DURATION)")
VOICE=${VOICE:-1}
# music level: −29 LUFS = 20 % beside the voice (−17 LUFS, 80 %); −20.5 = 40 % (60/40)
BED=${BED:--29}
ffmpeg -v error -y -i "$MUSIC" -af "loudnorm=I=$BED:TP=-2:LRA=11:linear=true,apad,atrim=0:$D,afade=t=in:d=0.4,afade=t=out:st=$((D - 4)):d=4" -ar 48000 -ac 2 -c:a pcm_s16le out/user-bed.wav
if [ "$RES" = "1080" ]; then SRC=out/video.mp4; else SRC=out/video-${RES}p.mp4; fi
k=$(echo "$RES / 1080" | bc -l); px() { printf '%.0f' "$(echo "$1 * $k" | bc -l)"; }
G="$(sed -e "s/crop=1920:818:0:131/crop=$(px 1920):$(px 818):0:$(px 131)/" -e "s/overlay=0:131/overlay=0:$(px 131)/" -e "s/sigma=26/sigma=$(px 26)/" tools/grade.filter)"
ffmpeg -v error -y -i "$SRC" -filter_complex "$G" -an -c:v libx264 -preset slow -crf 17 -tune film -pix_fmt yuv420p out/graded.mp4
ffmpeg -v error -y -i out/graded.mp4 -an -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -b:v 4400k -tune film -pix_fmt yuv420p -pass 1 -passlogfile out/x264 -f mp4 /dev/null
A=out/user-bed.wav
if [ "$VOICE" = "1" ] && [ -f out/voice.wav ]; then
  ffmpeg -v error -y -i out/voice.wav -i out/user-bed.wav -filter_complex "[0:a]aformat=channel_layouts=stereo[v];[v][1:a]amix=inputs=2:normalize=0:duration=longest,alimiter=limit=0.891:level=false" -ar 48000 -c:a pcm_s16le out/voice-music.wav
  A=out/voice-music.wav
fi
ffmpeg -v error -stats -y -i out/graded.mp4 -i $A -map 0:v -map 1:a -vf "scale=1920:-2:flags=lanczos" -c:v libx264 -preset slow -b:v 4400k -maxrate 8000k -bufsize 12000k -tune film -pix_fmt yuv420p -pass 2 -passlogfile out/x264 -c:a aac -b:a 256k -movflags +faststart -shortest "$O/$N-1080p.mp4"
cp out/user-bed.wav "$O/background-music.wav"
node engine/render.js srt >/dev/null && cp out/infinity-film.srt "$O/$N.srt"
ls -la $O
