// 把 index.html 渲染成 PNG：node render.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const TYPES = { '.html': 'text/html', '.js': 'text/javascript' };
const server = http.createServer((req, res) => {
  const file = path.join(__dirname, decodeURIComponent(req.url.split('?')[0]));
  if (!file.startsWith(__dirname) || !fs.existsSync(file)) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

server.listen(0, async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 2000, height: 1400 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('page error:', e.message));
  await page.goto(`http://localhost:${server.address().port}/index.html`);
  await page.waitForFunction('window.__done === true', null, { timeout: 60000 });
  const out = path.join(__dirname, '1-3格-基础图形.png');
  await (await page.$('#sheet')).screenshot({ path: out });
  console.log('saved', out);
  await browser.close();
  server.close();
});
