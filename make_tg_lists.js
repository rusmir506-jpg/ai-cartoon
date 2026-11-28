// Telegram album: two list slides (4:5) with the lifehacks in the dark InVoyage style.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const F = 'file://' + path.resolve(__dirname, 'assets/fonts') + '/';
const BG = 'file://' + path.resolve(__dirname, 'library/2026-11-28/batch3_03.jpg');
const CYR = 'U+0301,U+0400-045F,U+0490-0491,U+04B0-04B1,U+2116';
const face = (fam, file, w, style = 'normal') => ['cyrillic', 'latin'].map(s =>
  `@font-face{font-family:'${fam}';font-weight:${w};font-style:${style};src:url('${F}${file}-${s}-${w}-${style}.woff2') format('woff2');` +
  (s === 'cyrillic' ? `unicode-range:${CYR};` : '') + '}').join('');
const CSS = `${face('CG', 'cormorant-garamond', 500)}${face('CG', 'cormorant-garamond', 500, 'italic')}${face('CG', 'cormorant-garamond', 600)}${face('MT', 'montserrat', 400)}${face('MT', 'montserrat', 500)}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1350px;overflow:hidden;background:#0c1116;color:#F6F1E7}
.bg{position:absolute;inset:0;background:linear-gradient(180deg,rgba(12,20,26,.74),rgba(10,16,22,.93)),url(${BG}) 38% 40%/cover}
.head{position:absolute;left:84px;right:84px;top:84px;display:flex;justify-content:space-between;align-items:baseline}
.head .k{font:500 26px/1 MT;letter-spacing:.34em;text-transform:uppercase;color:#C9A55C}
.head .w{font:italic 500 44px/1 CG;color:#F6F1E7}
.rows{position:absolute;left:84px;right:84px;top:190px}
.row{display:flex;gap:40px;padding:34px 0;border-top:1px solid rgba(201,165,92,.4);align-items:flex-start;height:200px}
.row:last-child{border-bottom:1px solid rgba(201,165,92,.4)}
.n{font:italic 600 76px/1 CG;color:#C9A55C;width:110px;flex:none;margin-top:-4px}
.t{font:500 36px/1.15 MT;letter-spacing:.06em;text-transform:uppercase}
.s{font:400 27px/1.38 MT;color:rgba(246,241,231,.78);margin-top:14px}
`;
const L = [
  ['01', 'Копии документов', 'Фото паспорта, билетов и брони храните в облаке и пошлите себе на почту.'],
  ['02', 'Дата отмены', 'Запишите дату, до которой бронь отменяется без штрафа, и поставьте напоминание.'],
  ['03', 'Соседние даты', 'Перелёт на день раньше или позже иногда стоит дешевле. Сравните несколько дат.'],
  ['04', 'Офлайн-карты', 'Скачайте карты и словарь заранее: они работают без интернета.'],
  ['05', 'Ручная кладь', 'Положите в ручную кладь вещи на сутки: если багаж задержится, это выручит.'],
  ['06', 'Страховка', 'Оформите страховку заранее и сохраните номер полиса в телефоне.'],
  ['07', 'Две карты', 'Возьмите две банковские карты разных банков и храните их отдельно.'],
  ['08', 'Метка в багаже', 'Положите в чемодан трекер или бирку с контактами: так проще найти багаж.'],
  ['09', 'Повербанк', 'Повербанк возите только в ручной клади и заряжайте перед вылетом.'],
  ['10', 'Чек-лист', 'Составьте список вещей заранее и вычёркивайте по мере сборов.'],
];
const page = (items, label) => `<meta charset="utf-8"><style>${CSS}</style><div class="bg"></div>
<div class="head"><div class="k">${label}</div><div class="w">InVoyage</div></div><div class="rows">` +
  items.map(r => `<div class="row"><div class="n">${r[0]}</div><div><div class="t">${r[1]}</div><div class="s">${r[2]}</div></div></div>`).join('') + '</div>';
(async () => {
  const OUT = path.resolve(__dirname, 'out/telegram_lifehacks'); fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 1080, height: 1350 } });
  const tmp = path.join(OUT, '_p.html');
  for (const [name, items, label] of [['tg_2', L.slice(0, 5), 'Лайфхаки 1–5'], ['tg_3', L.slice(5), 'Лайфхаки 6–10']]) {
    fs.writeFileSync(tmp, page(items, label));
    await p.goto('file://' + tmp); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(200);
    await p.screenshot({ path: `${OUT}/${name}.png` });
  }
  fs.unlinkSync(tmp); await b.close();
})();
