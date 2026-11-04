/* 🩺 화면 전수 점검 (11/04 사용자 「그걸 내가 일일이 알아봐야 하니? 니가 다 점검하라고」)
   모든 탭 × 폰 3가지(375·390·430) × 밝게/어둡게 를 열어서
   ① JS 오류 ② 가로로 밀림(맨 위·맨 아래) ③ 떨림(3초 동안 DOM 변경 폭주 · <head> 스타일 재배치) ④ 잘린 글(넘침 숨김인데 글이 더 긴 칸)
   ⑤ 13px 미만 글자 ⑥ 화면 안 단추를 차례로 눌러 오류·밀림 ⑦ 📅 날짜 단추 · 📨 보내기 · 📍 지도 칸 · 길게 누르기 · 첫 방문 3장
   사용: node tools/wow_check.js [탭,탭,…] [--quick]   (앱을 http://localhost:8765 에 띄워 두고)  결과: /tmp/wow_check.json + 요약 출력 */
const { chromium, devices } = require('playwright');
const TABS = (process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2].split(',') : ['home','market','sector','prob','port','score','whale','cup','gap','screen','sigmore','bond','fund','els','prop','luck','saju','tarot','lotto','feed']);
const QUICK = process.argv.includes('--quick');
const SIZES = QUICK ? [['iPhone 13', 390]] : [['iPhone 13 Mini', 375], ['iPhone 13', 390], ['iPhone 14 Pro Max', 430]];
const THEMES = QUICK ? ['light'] : ['light', 'dark'];
const BASE = 'http://localhost:8765/index.html#';
const R = [];
function rec(o){ R.push(o); }

const PROBE = () => {
  const w = innerWidth, out = {overflow: document.documentElement.scrollWidth - w, clipped: [], tiny: [], wide: []};
  const skip = el => el.closest('svg,header,#bnav,#backbtn,#opbtn,canvas,script,style,#gdq,#wowob,#kidsplash');
  document.querySelectorAll('#main *, #sheet *').forEach(el => {
    if (skip(el)) return; const cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') return;
    const r = el.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return;
    const txt = (el.childNodes.length && [...el.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim().length > 1));
    if (txt){
      const fs = parseFloat(cs.fontSize); if (fs < 13 && !el.closest('.h2-tm,.h2-sp,.t3-sv,[class*=chart],[class*=viz],.ix-,.pd-bar')) out.tiny.push(el.tagName + '.' + String(el.className).slice(0, 24) + ' ' + fs + 'px「' + el.textContent.trim().slice(0, 14) + '」');
    }
    const oh = cs.overflowY === 'hidden' || cs.overflow === 'hidden', ox = cs.overflowX === 'hidden' || cs.overflow === 'hidden';
    if (txt && oh && el.scrollHeight > el.clientHeight + 6 && cs.webkitLineClamp === 'none' && !el.closest('[data-clp],.clp,.h2-d,.h2-w,.h2-tm,.sv-body,.hm-fold,.fold-b,[data-fold],.tz-sky')) out.clipped.push(el.tagName + '.' + String(el.className).slice(0, 24) + ' h' + el.clientHeight + '/' + el.scrollHeight + '「' + el.textContent.trim().slice(0, 16) + '」');
    if (txt && ox && cs.whiteSpace === 'nowrap' && cs.textOverflow !== 'ellipsis' && el.scrollWidth > el.clientWidth + 6) out.clipped.push(el.tagName + '.' + String(el.className).slice(0, 24) + ' w' + el.clientWidth + '/' + el.scrollWidth + '「' + el.textContent.trim().slice(0, 16) + '」');
    // 화면 밖으로 삐져나간 칸 (가로 스크롤 상자 안은 제외)
    if (r.right > w + 3 && r.width > 40 && cs.position !== 'fixed'){ let p = el.parentElement, inScroll = false; while (p && p !== document.body){ const pc = getComputedStyle(p); if (/(auto|scroll)/.test(pc.overflowX) || /(auto|scroll)/.test(pc.overflow)){ inScroll = true; break; } p = p.parentElement; } if (!inScroll) out.wide.push(el.tagName + '.' + String(el.className).slice(0, 24) + ' +' + Math.round(r.right - w)); }
  });
  out.clipped = [...new Set(out.clipped)].slice(0, 8); out.tiny = [...new Set(out.tiny)].slice(0, 8); out.wide = [...new Set(out.wide)].slice(0, 8);
  return out;
};

async function settle(p, ms){ await p.waitForTimeout(ms || 3500); try { await p.click('text=닫기', {timeout: 400}); } catch(e) {} }

async function checkTab(b, dev, w, theme, tab){
  const ctx = await b.newContext({ ...devices[dev], deviceScaleFactor: 1, serviceWorkers: 'block' });
  await ctx.addInitScript((t) => { try { localStorage.setItem('wow_ob', '1'); localStorage.setItem('gd_intro', '1'); localStorage.setItem('ui', JSON.stringify({theme: t, fs: 'auto'})); } catch(e) {} }, theme);
  await ctx.route(/\.(mp4|webm)(\?|$)/, r => r.abort());
  const p = await ctx.newPage(); const errs = [], cons = [];
  p.on('pageerror', e => errs.push(String(e.message).slice(0, 160)));
  p.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|net::|ERR_/.test(m.text())) cons.push(m.text().slice(0, 160)); });
  const out = {dev, w, theme, tab, errs, cons};
  try {
    await p.goto(BASE + tab, {waitUntil: 'domcontentloaded', timeout: 30000}); await settle(p, 4500);
    // ③ 떨림: 3초 동안 DOM 변경 수 · head 스타일 재배치
    out.storm = await p.evaluate(() => new Promise(ok => { let n = 0, h = 0; const mo = new MutationObserver(ms => { n += ms.length; }); mo.observe(document.body, {childList: true, subtree: true, characterData: true, attributes: true}); const mh = new MutationObserver(ms => { h += ms.length; }); mh.observe(document.head, {childList: true}); setTimeout(() => { mo.disconnect(); mh.disconnect(); ok({body: n, head: h}); }, 3000); }));
    out.top = await p.evaluate(PROBE);
    await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await p.waitForTimeout(800);
    out.bottom = await p.evaluate(PROBE);
    out.back = await p.evaluate(() => { const b = document.getElementById('backbtn'); return b ? getComputedStyle(b).display : 'none'; });
    out.opInHead = await p.evaluate(() => { const b = document.getElementById('opbtn'); return !b || !!b.closest('header'); });
    await p.evaluate(() => window.scrollTo(0, 0));
    // ⑥ 단추 차례로 누르기
    if ((w === 390 && theme === 'light') || (QUICK && tab === 'home')){
      const n = await p.evaluate(() => { const a = [...document.querySelectorAll('#main button, #main summary, #main [data-goto], #main [data-op], #main .fold')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !/공유|복사|저장|보내기|PDF|PPT|다운|지우기|삭제|초기화|알림|전송|제출|로그|설치|링크/.test(e.textContent); }); a.forEach((e, i) => e.setAttribute('data-wc', i)); return a.length; });
      out.clicks = 0; out.clickErr = [];
      for (let i = 0; i < Math.min(n, QUICK ? 15 : 45); i++){
        const before = errs.length;
        try { const el = await p.$('[data-wc="' + i + '"]'); if (!el) continue; const box = await el.boundingBox(); if (!box) continue;
          await el.scrollIntoViewIfNeeded(); await el.click({timeout: 1500, force: true}); await p.waitForTimeout(350); out.clicks++;
          const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth); if (ov > 2) out.clickErr.push('가로 밀림 ' + ov + 'px 뒤: ' + (await el.evaluate(e => e.textContent.trim().slice(0, 20))));
          if (errs.length > before) out.clickErr.push('오류 뒤: ' + (await el.evaluate(e => e.textContent.trim().slice(0, 20))) + ' → ' + errs[errs.length - 1]);
          // 시트·대화 열렸으면 닫기
          await p.evaluate(() => { const q = document.getElementById('gdq'); if (q) q.remove(); const s = document.getElementById('sheet'); if (s && window.closeSheet) closeSheet(); const sv = document.getElementById('h2sv'); if (sv) sv.remove(); document.documentElement.classList.remove('h2-lock'); const us = document.getElementById('uiset'); if (us) us.remove(); });
          if (!(await p.evaluate(() => location.hash)).includes(tab)){ await p.goto(BASE + tab, {waitUntil: 'domcontentloaded'}); await settle(p, 2500); await p.evaluate(() => { const a = [...document.querySelectorAll('#main button, #main summary, #main [data-goto], #main [data-op], #main .fold')].filter(e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && !/공유|복사|저장|보내기|PDF|PPT|다운|지우기|삭제|초기화|알림|전송|제출|로그|설치|링크/.test(e.textContent); }); a.forEach((e, i) => e.setAttribute('data-wc', i)); }); }
        } catch(e) { out.clickErr.push('못 누름 ' + i + ': ' + String(e.message).split('\n')[0].slice(0, 80)); }
      }
    }
    // ⑦ 새 기능들
    out.feat = await p.evaluate(async () => {
      const f = {};
      const db = document.querySelector('.wow-dbtn'); if (db){ db.click(); await new Promise(r => setTimeout(r, 200)); f.dateList = !!document.querySelector('.wow-dl.on'); document.body.click(); }
      const cell = document.querySelector('.h2-tm[data-k]'); if (cell){ cell.click(); await new Promise(r => setTimeout(r, 200)); f.mapPick = !!document.querySelector('#h2pick .h2-pr, #h2pick .note'); }
      const num = document.querySelector('#main .card b'); if (num && window.gdSay){ const r = num.getBoundingClientRect(); const ev = new PointerEvent('pointerdown', {bubbles: true, clientX: r.x + 2, clientY: r.y + 2, pointerType: 'touch'}); num.dispatchEvent(ev); await new Promise(r => setTimeout(r, 700)); f.longPress = !!document.getElementById('gdq'); const q = document.getElementById('gdq'); if (q) q.remove(); }
      return f;
    });
  } catch(e) { out.fatal = String(e.message).split('\n')[0].slice(0, 160); }
  await ctx.close(); rec(out);
  const flags = [];
  if (out.errs.length) flags.push('JS오류 ' + out.errs.length); if (out.cons.length) flags.push('콘솔오류 ' + out.cons.length);
  if (out.top && out.top.overflow > 2) flags.push('가로밀림(위) ' + out.top.overflow); if (out.bottom && out.bottom.overflow > 2) flags.push('가로밀림(아래) ' + out.bottom.overflow);
  if (out.storm && (out.storm.body > 400 || out.storm.head > 8)) flags.push('떨림의심 body' + out.storm.body + ' head' + out.storm.head);
  if (out.top && out.top.clipped.length) flags.push('잘린글 ' + out.top.clipped.length); if (out.bottom && out.bottom.clipped.length) flags.push('잘린글(아래) ' + out.bottom.clipped.length);
  if (out.top && out.top.wide.length) flags.push('삐져나감 ' + out.top.wide.length); if (out.bottom && out.bottom.wide.length) flags.push('삐져나감(아래) ' + out.bottom.wide.length);
  if (out.top && out.top.tiny.length) flags.push('작은글자 ' + out.top.tiny.length);
  if (out.clickErr && out.clickErr.length) flags.push('누르기 ' + out.clickErr.length);
  if (out.back !== 'none' && ['home','market','sector','prob','port','score','whale','cup','gap','screen','sigmore','bond','fund','els','prop','luck','saju','tarot','lotto','feed'].includes(tab)) flags.push('뒤로 보임');
  if (!out.opInHead) flags.push('보내기 위치');
  if (out.fatal) flags.push('열기 실패 ' + out.fatal);
  const line = (flags.length ? '❌' : '✅') + ' ' + w + ' ' + theme + ' ' + tab + (flags.length ? ' — ' + flags.join(' · ') : ''); console.log(line); require('fs').appendFileSync('/tmp/wow_check.log', line + '\n');
}

(async () => {
  const b = await chromium.launch({args: ['--disable-dev-shm-usage', '--no-sandbox', '--disable-gpu']});
  for (const [dev, w] of SIZES) for (const theme of THEMES) for (const tab of TABS) await checkTab(b, dev, w, theme, tab);
  // 첫 방문 3장
  const ctx = await b.newContext({ ...devices['iPhone 13'], deviceScaleFactor: 1, serviceWorkers: 'block' }); await ctx.route(/\.(mp4|webm)(\?|$)/, r => r.abort());
  const p = await ctx.newPage(); await p.goto(BASE + 'home', {waitUntil: 'domcontentloaded'}); await p.waitForTimeout(2500);
  const ob = {splash: await p.evaluate(() => !!document.getElementById('kidsplash')), ob1: await p.evaluate(() => !!document.getElementById('wowob'))};
  try { await p.click('#wowob [data-next]'); await p.click('#wowob [data-next]'); await p.click('#wowob [data-skip]'); } catch(e) { ob.err = e.message.slice(0, 80); }
  await p.waitForTimeout(3500); ob.closed = await p.evaluate(() => !document.getElementById('wowob') && !document.getElementById('gdq') && !document.getElementById('kidsplash'));
  console.log((ob.ob1 && ob.closed ? '✅' : '❌') + ' 첫 방문 ' + JSON.stringify(ob)); rec({first: ob}); await ctx.close();
  require('fs').writeFileSync('/tmp/wow_check.json', JSON.stringify(R, null, 1));
  await b.close();
})();
