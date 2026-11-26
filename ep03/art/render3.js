// node render.js outdir [times...]  — без times рендерит все кадры (параллельно)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const [out, ...ts] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch();
  const mk = async () => { const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
    p.on('pageerror', e => console.error('PAGE ERROR', e.message)); p.on('console', m => m.type() === 'error' && console.error(m.text()));
    await p.goto('file://' + path.resolve(process.env.PAGE || 'anim.html')); return p; };
  if (ts.length) { const p = await mk(); for (const t of ts) { await p.evaluate(t => show(t), +t); await p.screenshot({ path: `${out}/t_${(+t).toFixed(2)}.jpg`, type: 'jpeg', quality: 85 }); } await b.close(); return; }
  const p0 = await mk(); const END = await p0.evaluate(() => INFO.END); const N = Math.ceil(END * 30);
  const workers = +(process.env.WORKERS || 4); const pages = [p0]; for (let i = 1; i < workers; i++) pages.push(await mk());
  let next = +(process.env.FROM || 0), done = 0; const t0 = Date.now();
  await Promise.all(pages.map(async p => { while (true) { const f = next++; if (f >= N) break;
    await p.evaluate(t => show(t), f / 30);
    await p.screenshot({ path: `${out}/f_${String(f).padStart(5, '0')}.jpg`, type: 'jpeg', quality: 93 });
    if (++done % 300 === 0) console.log(done, '/', N, ((Date.now() - t0) / 1000).toFixed(0) + 's'); } }));
  console.log('frames', N); await b.close();
})();
