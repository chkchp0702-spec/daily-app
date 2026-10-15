/* CH Investing — 🌐 시황 탭 A10-1~5 (10/15 사용자 「다 진행해」)
   A10-1 🔮 ✅ 오늘 할 일 3줄에 리포트 확률 띠 + 「지금 →」 칩 (재는 숫자가 있는 줄만 · 숫자는 안 지어냄)
   A10-2 ✂️ → 결론 줄은 안 접음 (tidy.js 에서 .mk-so 뺌) · 2줄까지 보이고 길면 눌러 펼침 — CSS 는 여기
   A10-3 🔢 숫자는 한 줄에 — 킥 표 값 · 오늘의 숫자 둘째 줄 칩 · 실시간 시장판 타일 이름 줄임 + 넘치면 글자 줄임
   A10-4 🗓 날짜 칩 밑줄 = 그날 🇰🇷 코스피 | 🇺🇸 S&P 등락 색 · 휴장 칩 흐리게 · 같은 날 WK·주간 회고 칩 하나로 · 길게 누르면 그날 한 줄
   A10-5 ⏰ 시황도 시간대 순서 — 아침 🌙 밤사이 · 한국 장중 실시간 시장판 · 저녁 ✅ 할 일 · 밤·주말 실시간 시장판을 맨 위 「지금 볼 것」 자리로
           (⚙️ 보기 설정 「🌐 시황 순서」 → 고정이면 끔) */
(function(){
  function X(name, ttl){ var s = Math.floor(Date.now() / (ttl || 120000)); return getJSON("archive/x/" + name + "?" + s, {ttl: ttl || 120000}).catch(function(){ return null; }); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function kst(){ var d = new Date(Date.now() + 9 * 3600000); return {h: d.getUTCHours(), m: d.getUTCMinutes(), t: d.getUTCHours() * 60 + d.getUTCMinutes(), dow: d.getUTCDay(), ymd: d.toISOString().slice(0, 10)}; }
  function addDay(ymd, n){ var d = new Date(ymd + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function uiMkt(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); return u.mkt || "time"; } catch(x) { return "time"; } }
  function curId(){ var b = document.querySelector("#dates .date.on"); return b ? b.dataset.id : ""; }
  function isLatest(){ var b = document.querySelector("#dates .date"); var on = document.querySelector("#dates .date.on"); return !!(b && on && b === on); }
  function fmtN(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.round(Math.abs(v)).toLocaleString(); }
  function pct(v){ return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(1) + "%"; }

  /* ---------- CSS ---------- */
  var css = document.createElement("style");
  css.textContent =
    /* A10-1 */
    ".xtodo .xtd .a101{display:flex;flex-wrap:wrap;gap:6px;align-items:center;margin-top:6px}" +
    ".a101-p{display:inline-flex;align-items:center;gap:6px;font-size:12px;color:var(--sub)}" +
    ".a101-p i{position:relative;display:inline-block;width:64px;height:6px;border-radius:3px;background:color-mix(in srgb,var(--line) 70%,transparent);overflow:hidden}" +
    ".a101-p i em{position:absolute;left:0;top:0;bottom:0;border-radius:3px;background:var(--acc,#7c9cff)}" +
    ".a101-p b{font-weight:700;color:var(--text);font-variant-numeric:tabular-nums}" +
    ".a101-c{display:inline-block;font-size:12px;line-height:1.35;padding:3px 9px;border-radius:999px;background:var(--panel2);color:var(--sub);white-space:nowrap}" +
    ".a101-c b{color:var(--text);font-variant-numeric:tabular-nums}.a101-c.ok{background:rgba(77,212,122,.14)}.a101-c.no{background:rgba(255,107,107,.13)}" +
    ".a101-c .up{color:#ff6b6b}.a101-c .dn{color:#5aa9ff}" +
    /* A10-2 */
    ".mk-so{border-left:3px solid color-mix(in srgb,var(--acc,#7c9cff) 70%,transparent);padding-left:9px;font-size:15px;color:var(--text);display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;cursor:pointer}" +
    ".mk-so.a102-open{display:block;-webkit-line-clamp:unset}" +
    /* A10-3 */
    ".mk-rows div span{min-width:0}.mk-rows div b{flex:none;white-space:nowrap;text-align:right}" +
    ".kpis2 .kp>span.a103{display:flex;flex-wrap:wrap;gap:4px;margin-top:2px}" +
    ".kpis2 .kp>span.a103>span.a103c{display:inline-block;white-space:nowrap;font-size:11.5px;padding:1px 7px;border-radius:999px;background:color-mix(in srgb,var(--line) 55%,transparent)}" +
    "#live .kv small{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}#live .kv b{display:block;white-space:nowrap}" +
    /* A10-4 */
    "#dates .date{position:relative;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}" +
    "#dates .date.a104:after{content:'';position:absolute;left:10px;right:10px;bottom:4px;height:3px;border-radius:2px;background:linear-gradient(90deg,var(--kr) 0 48%,transparent 48% 52%,var(--us) 52% 100%)}" +
    "#dates .date.on{border-width:2px}" +
    "#dates .date.a104-hol{opacity:.55;transform:scale(.92)}#dates .date.a104-hid{display:none}" +
    "#dates .date .a104-rv{margin-left:4px;font-size:12px;padding:0 5px;border-radius:6px;background:color-mix(in srgb,var(--line) 60%,transparent)}" +
    ".a104-lg{font-size:11.5px;color:var(--dim);margin:-8px 0 10px}" +
    ".a104-tip{position:fixed;z-index:60;max-width:300px;padding:10px 12px;border-radius:12px;background:var(--panel);border:1px solid var(--line);box-shadow:0 8px 24px rgba(0,0,0,.35);font-size:13.5px;line-height:1.5;color:var(--text)}" +
    ".a104-tip small{display:block;color:var(--dim);font-size:11.5px;margin-bottom:3px}" +
    /* A10-5 */
    "#mknow{margin:0 0 4px}#mknow .mknow-h{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--sub);margin:2px 2px 6px}" +
    "#mknow .mknow-h b{color:var(--text);font-weight:700}#mknow .mknow-h button{margin-left:auto;border:0;background:none;color:var(--dim);font:inherit;font-size:11.5px;cursor:pointer}";
  document.head.appendChild(css);

  /* ---------- A10-1 할 일 확률 띠 + 지금 칩 ---------- */
  function liveChip(text, todayK, FH, LU, FL){
    var md = text.match(/(\d{1,2})\/(\d{1,2})/); if (!md) return "";
    var fdate = todayK.ymd.slice(0, 4) + "-" + ("0" + md[1]).slice(-2) + "-" + ("0" + md[2]).slice(-2);
    // ① 외국인 코스피 순매수 — 네이버 일별(장중 잠정) foreign_hist.json 그날 값
    if (/외국인/.test(text) && /순매수/.test(text)){
      if (fdate !== todayK.ymd) return "";
      if (todayK.dow === 0 || todayK.dow === 6) return "";
      if (todayK.t < 9 * 60) return '<span class="a101-c">🇰🇷 장 열리면 보여요 (09:00~)</span>';
      var v = FH && FH[fdate]; if (v == null) return '<span class="a101-c">외국인 자료 기다리는 중</span>';
      var closed = todayK.t >= 15 * 60 + 40, ok = v > 0;
      return '<span class="a101-c ' + (ok ? "ok" : "no") + '">' + (closed ? "마감 → " : "지금 → ") + '외국인 <b class="' + (v > 0 ? "up" : "dn") + '">' + fmtN(v) + '억</b> ' + (closed ? "(잠정)" : "(장중 잠정)") + ' · ' + (ok ? "✓쪽" : "✗쪽") + '</span>';
    }
    // ② XLE 가 S&P 보다 강함 — 미국 그날 장(밤 10:30~) 시작 뒤에만
    if (/XLE/.test(text) && /S&P/.test(text) && /강/.test(text)){
      var fx = FL && FL.px && FL.px.XLE, ix = LU && (LU.index || []).filter(function(x){ return /S&P/.test(x.name); })[0];
      var inSess = FL && fx && ((FL.date === fdate && String(fx.at) >= "22:30") || (FL.date === addDay(fdate, 1) && String(fx.at) <= "07:00"));
      if (inSess && ix && LU.sess === fdate && fx.r != null && ix.chg != null){
        var ok2 = fx.r > ix.chg, after = FL.date === addDay(fdate, 1) && String(fx.at) >= "05:00";
        return '<span class="a101-c ' + (ok2 ? "ok" : "no") + '">' + (after ? "마감 → " : "지금 → ") + 'XLE <b class="' + (fx.r >= 0 ? "up" : "dn") + '">' + pct(fx.r) + '</b> vs S&P <b class="' + (ix.chg >= 0 ? "up" : "dn") + '">' + pct(ix.chg) + '</b> · ' + (ok2 ? "✓쪽" : "✗쪽") + ' <small>' + esc(fx.at) + '</small></span>';
      }
      if (fdate === todayK.ymd || (fdate === addDay(todayK.ymd, -1) && todayK.t < 5 * 60)) return '<span class="a101-c">🇺🇸 장 열리면 보여요 (밤 10:30~)</span>';
      return "";
    }
    return "";   // 재는 숫자가 정해지지 않은 줄 → 칩 없음
  }
  var A101_BUSY = false;
  function decorateTodo(){
    var box = document.querySelector(".xtodo"); if (!box || box.dataset.a101 || A101_BUSY) return;
    var id = curId(); if (!id) return;
    A101_BUSY = true;
    Promise.all([getJSON(file("market", id, "data.json")).catch(function(){ return null; }), X("foreign_hist.json", 300000), X("live_us.json", 60000), X("focus_live.json", 60000)]).then(function(r){
      A101_BUSY = false;
      box = document.querySelector(".xtodo"); if (!box || box.dataset.a101) return;
      box.dataset.a101 = "1";
      var d = r[0] || {}, P = d.forecasts_p || [], latest = isLatest(), K = kst();
      [].forEach.call(box.querySelectorAll(".xtd"), function(row, i){
        var body = row.querySelector(":scope > div"); if (!body) return;
        var p = P[i], h = "";
        if (p != null && p >= 0 && p <= 1) h += '<span class="a101-p" title="리포트가 아침에 매긴 확률"><i><em style="width:' + Math.round(p * 100) + '%"></em></i><b>' + Math.round(p * 100) + '%</b></span>';
        if (latest) h += liveChip(body.textContent, K, r[1], r[2], r[3]);
        if (h){ var w = document.createElement("div"); w.className = "a101"; w.innerHTML = h; body.appendChild(w); }
      });
      if (latest && P.length){ var n = document.createElement("div"); n.className = "mut"; n.style.cssText = "font-size:11.5px;margin-top:6px";
        n.textContent = "막대 = 리포트가 아침에 매긴 확률 · 「지금 →」 = 장중 숫자로 본 방향(판정은 마감 합계로)"; box.appendChild(n); }
      placeNow();
    }, function(){ A101_BUSY = false; });
  }

  /* ---------- A10-2 → 결론 줄 누르면 펼침 ---------- */
  document.addEventListener("click", function(ev){
    var s = ev.target.closest && ev.target.closest(".mk-so"); if (!s || ev.target.closest("a,button")) return;
    s.classList.toggle("a102-open");
  });

  /* ---------- A10-3 숫자 한 줄 ---------- */
  var SHORT = [[/^코스피 외국인 순매수.*|^외국인 순매수$/, "외국인"], [/^미 10년 금리$/, "美 10년"], [/^SK하이닉스$/, "하이닉스"], [/^달러\/원$/, "달러/원"], [/^달러지수$/, "달러지수"]];
  function fixNumbers(){
    [].forEach.call(document.querySelectorAll(".kpis2 .kp > span:not(.a103):not(.kp-now)"), function(s){
      var t = s.textContent.trim(); if (t.indexOf(" · ") < 0){ s.classList.add("a103"); return; }
      var parts = t.split(/\s·\s/);
      s.classList.add("a103"); s.innerHTML = parts.map(function(x){ return '<span class="a103c">' + esc(x) + '</span>'; }).join("");
    });
    [].forEach.call(document.querySelectorAll("#live .kv"), function(kv){
      var sm = kv.querySelector("small");
      if (sm && !sm.dataset.a103){
        sm.dataset.a103 = "1";
        [].forEach.call(sm.childNodes, function(n){ if (n.nodeType !== 3) return; var t = n.textContent.trim();
          SHORT.forEach(function(p){ if (p[0].test(t)){ sm.title = t; n.textContent = p[1]; } }); });
      }
      var b = kv.querySelector("b"); if (!b || b.dataset.a103 === b.textContent) return;
      b.dataset.a103 = b.textContent; b.style.fontSize = "";
      var fs = parseFloat(getComputedStyle(b).fontSize) || 14, n = 0;
      while (b.scrollWidth > b.clientWidth + 1 && fs > 11 && n++ < 8){ fs -= 1; b.style.fontSize = fs + "px"; }
    });
  }

  /* ---------- A10-4 날짜 칩 ---------- */
  var PERF = null;
  function decorateDates(){
    var box = document.getElementById("dates"); if (!box || box.dataset.a104 || window.cur !== "market") return;
    box.dataset.a104 = "1";
    var bs = [].slice.call(box.querySelectorAll(".date"));
    var ids = {}; bs.forEach(function(b){ ids[b.dataset.id] = b; });
    bs.forEach(function(b){
      var id = b.dataset.id || "", d = id.slice(0, 10), tag = id.slice(11);
      if (tag === "HOL") b.classList.add("a104-hol");
      if (tag === "WEEK" && ids[d + "_WK"]){             // 같은 날 「WK」 칩 하나로 — 📝 누르면 주간 회고
        b.classList.add("a104-hid");
        var wk = ids[d + "_WK"], rv = document.createElement("span"); rv.className = "a104-rv"; rv.textContent = "📝 회고"; rv.title = "주간 회고 열기";
        rv.onclick = function(ev){ ev.stopPropagation(); b.click(); };
        wk.appendChild(rv);
      }
    });
    if (!box.nextElementSibling || !box.nextElementSibling.classList.contains("a104-lg")){
      var lg = document.createElement("div"); lg.className = "a104-lg";
      lg.textContent = "밑줄 왼쪽 🇰🇷 코스피 · 오른쪽 🇺🇸 S&P (빨강↑ 파랑↓) · 길게 누르면 한 줄";
      box.parentNode.insertBefore(lg, box.nextSibling);
    }
    (PERF ? Promise.resolve(PERF) : X("market_perf.json", 600000)).then(function(m){
      if (!m || !m.dates) return; PERF = m;
      var col = function(c){ if (c == null || isNaN(c)) return "transparent"; if (Math.abs(c) < 0.05) return "color-mix(in srgb,var(--dim) 60%,transparent)";
        var a = Math.min(1, 0.3 + Math.abs(c) / 3).toFixed(2); return c > 0 ? "rgba(255,107,107," + a + ")" : "rgba(90,169,255," + a + ")"; };
      var chg = function(arr, i){ return i > 0 && arr && arr[i] != null && arr[i - 1] ? (arr[i] / arr[i - 1] - 1) * 100 : null; };
      bs.forEach(function(b){
        var d = (b.dataset.id || "").slice(0, 10), md = d.slice(5).replace("-", "/"), i = m.dates.indexOf(md); if (i < 1) return;
        var k = chg(m.kospi, i), s = chg(m.sp500, i);
        b.style.setProperty("--kr", col(k)); b.style.setProperty("--us", col(s)); b.classList.add("a104");
        b.title = "그날 코스피 " + (k == null ? "–" : pct(k)) + " · S&P " + (s == null ? "–" : pct(s)) + " (리포트 성적표 기준)";
      });
    });
    // 길게 누르면 그날 한 줄
    bs.forEach(function(b){
      var T = null, fired = false;
      var close = function(){ var o = document.querySelector(".a104-tip"); if (o) o.remove(); };
      b.addEventListener("pointerdown", function(){ fired = false; clearTimeout(T); T = setTimeout(function(){
        fired = true; close();
        var id = b.dataset.id, tip = document.createElement("div"); tip.className = "a104-tip";
        var r = b.getBoundingClientRect(); tip.style.left = Math.max(8, Math.min(window.innerWidth - 308, r.left)) + "px"; tip.style.top = (r.bottom + 6) + "px";
        tip.innerHTML = "<small>" + esc(b.title || id) + "</small>불러오는 중…"; document.body.appendChild(tip);
        getJSON(file("market", id, "data.json")).then(function(d){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>" + esc(String(d.one_liner || "한 줄 없음").replace(/<[^>]+>/g, "")); })
          .catch(function(){ tip.innerHTML = "<small>" + esc(b.title || id) + "</small>이 날은 한 줄 요약이 없어요"; });
        setTimeout(function(){ document.addEventListener("pointerdown", function off(){ close(); document.removeEventListener("pointerdown", off, true); }, true); }, 50);
      }, 550); });
      ["pointerup", "pointerleave", "pointercancel"].forEach(function(evn){ b.addEventListener(evn, function(){ clearTimeout(T); }); });
      b.addEventListener("click", function(ev){ if (fired){ ev.stopImmediatePropagation(); ev.preventDefault(); fired = false; } }, true);
      b.addEventListener("contextmenu", function(ev){ ev.preventDefault(); });
    });
  }

  /* ---------- A10-5 지금 볼 것 ---------- */
  function slot(){
    var K = kst(), wk = K.dow >= 1 && K.dow <= 5;
    if (K.dow === 6 && K.t < 6 * 60) return {k: "us", lab: "🇺🇸 미국 장 (밤)"};
    if (!wk) return {k: "us", lab: "주말 — 🇺🇸 마지막 장"};
    if (K.t < 6 * 60) return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
    if (K.t < 9 * 60) return {k: "am", lab: "🌅 아침 — 밤사이 움직임"};
    if (K.t < 15 * 60 + 30) return {k: "kr", lab: "🌞 한국 장중 — 실시간 시장판"};
    if (K.t < 22 * 60 + 30) return {k: "eve", lab: "🌆 저녁 — 오늘 할 일 결과"};
    return {k: "us", lab: "🌙 밤 — 🇺🇸 미국 장중"};
  }
  function findCard(re){ var c = null; [].some.call(document.querySelectorAll("#body section.card, #body details.card"), function(x){
    var h = x.querySelector(":scope > h3, :scope > summary, :scope > .mk-lab"); if (h && re.test(h.textContent)){ c = x; return true; } }); return c; }
  function placeNow(){
    if (window.cur !== "market" || uiMkt() === "fixed" || !isLatest()) return;
    var body = document.getElementById("body"), mh = document.getElementById("mhead"); if (!body || !mh || !mh.firstChild) return;
    var S = slot(), el = null;
    if (S.k === "kr" || S.k === "us") el = document.getElementById("live");
    else if (S.k === "eve") el = document.querySelector(".xtodo");
    else if (S.k === "am"){
      el = findCard(/밤사이 가장 크게/);
      if (el && el.classList.contains("xs-hid")){
        el.classList.remove("xs-hid"); el.dataset.xs = "keep";
        [].forEach.call(document.querySelectorAll("#xs-more .xs-row"), function(r){ if (/밤사이 가장 크게/.test(r.textContent)) r.remove(); });
        var n = document.querySelectorAll("#xs-more .xs-row").length, xn = document.getElementById("xs-n"); if (xn) xn.textContent = n + "개 · 누르면 열려요";
      }
    }
    if (!el || !el.innerHTML.trim()) return;
    var box = document.getElementById("mknow");
    if (box && box.contains(el)) return;
    if (!box){
      box = document.createElement("div"); box.id = "mknow";
      box.innerHTML = '<div class="mknow-h">⏰ 지금 볼 것 · <b></b><button type="button">고정 순서로</button></div>';
      box.querySelector("button").onclick = function(){ try { var u = JSON.parse(localStorage.getItem("ui") || "{}"); u.mkt = "fixed"; localStorage.setItem("ui", JSON.stringify(u)); } catch(x) {}
        if (window.chToast) chToast("시황 순서를 고정했어요 · ⚙️ 에서 다시 켤 수 있어요"); go("market", curId()); };
    }
    box.querySelector("b").textContent = S.lab;
    if (mh.nextSibling !== box) mh.parentNode.insertBefore(box, mh.nextSibling);
    box.appendChild(el);
  }

  /* ---------- 붙이기 ---------- */
  var T = null;
  function run(){ T = null; if (window.cur !== "market") return; decorateDates(); decorateTodo(); fixNumbers(); placeNow(); }
  function kick(){ if (!T) T = setTimeout(run, 250); }
  function start(){
    var main = document.getElementById("main"); if (!main){ setTimeout(start, 300); return; }
    new MutationObserver(kick).observe(main, {childList: true, subtree: true});
    kick();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
