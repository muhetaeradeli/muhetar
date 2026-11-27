// Render each slide to PNG, then join them into a silent 1080p MP4 with ffmpeg.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const out = path.join(__dirname, 'frames');
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.goto('file://' + path.join(__dirname, 'slides.html'));
  const slides = await page.$$('.slide');
  let list = '', t = 0, timeline = '';
  for (let i = 0; i < slides.length; i++) {
    const f = path.join(out, `s${String(i + 1).padStart(2, '0')}.png`);
    await slides[i].screenshot({ path: f });
    const d = Number(await slides[i].getAttribute('data-dur'));
    list += `file '${f}'\nduration ${d}\n`;
    timeline += `${i + 1}\t${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}\t${d}s\n`;
    t += d;
    if (i === slides.length - 1) list += `file '${f}'\n`;
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'list.txt'), list);
  console.log(timeline + `total ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`);
  execSync(`ffmpeg -y -loglevel error -f concat -safe 0 -i ${out}/list.txt -vf fps=30,format=yuv420p -c:v libx264 -crf 20 ${__dirname}/lesson_video_silent.mp4`);
})();
