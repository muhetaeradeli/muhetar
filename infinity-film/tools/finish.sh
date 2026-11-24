#!/bin/bash
# The finished files, from out/video.mp4 (node engine/render.js video) and the soundtrack (node song.js):
#   out/final/Шексіздік-пен-мәңгілік.mp4          graded picture + voice 60 % / music 40 %   (1080p)
#   out/final/Шексіздік-пен-мәңгілік-дауыс.mp4    graded picture + voice only (add your own music) (1080p)
#   out/final/Шексіздік-пен-мәңгілік-720p.mp4     the full mix, small, for phones and messengers
#   out/final/voice.wav, bed.wav, music.wav       the voice, the music bed and the mix (voice + bed = mix)
#   out/final/Шексіздік-пен-мәңгілік.srt          the subtitles
# The colour grade (tools/grade.filter) touches only the picture, not the letterbox or the subtitles:
# a gentle film curve, cool shadows, warm highlights, a little more colour and a soft glow on the highlights.
set -e
cd "$(dirname "$0")/.."
N="Шексіздік-пен-мәңгілік"; O=out/final; mkdir -p $O
G="$(cat tools/grade.filter)"
ffmpeg -v error -stats -y -i out/video.mp4 -filter_complex "$G" -an -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p out/graded.mp4
ffmpeg -v error -y -i out/graded.mp4 -i out/music.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$O/$N.mp4"
ffmpeg -v error -y -i out/graded.mp4 -i out/voice.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 256k -movflags +faststart -shortest "$O/$N-дауыс.mp4"
ffmpeg -v error -y -i "$O/$N.mp4" -vf "scale=1280:-2,hqdn3d=1.5:1.5:4:4" -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart "$O/$N-720p.mp4"
cp out/voice.wav out/bed.wav out/music.wav $O/
node engine/render.js srt >/dev/null && cp out/infinity-film.srt "$O/$N.srt"
ls -la $O
