/* CH Investing — 🧹 차분하게 (10/21 사용자 「앱이 너무 복잡하고 산만하다는 지적 — 다 진행해」)
   ② 결론 → 근거 2층: 시황·나침반·포트·시장확률 탭은 맨 위 결론 카드만 펼치고, 나머지 카드는 제목 한 줄로 접음(누르면 펼침 · 휴대폰에 기억)
   ③ 이모지 줄이기: 카드 제목은 이모지 1개까지 · 본문의 꾸밈 이모지는 뺌(🟢🔴·나라 국기·신호 출처 🐋☕📈 같은 뜻 있는 표시는 그대로) · 📖 용어 풀이
   ④ 정직 계산 칩(검증 숫자)은 📊 성적표에서만 — 다른 탭에선 숨김
   ⑤ 숫자·날짜 한 규칙: 등락(부호 있는 %)은 소수 1자리 · 금리·수익률은 2자리까지 · 올해 날짜는 10/19 식
   다른 화면 코드는 건드리지 않고, 그려진 뒤 살펴보고 덧입힘. 숫자는 표기만 바꾸고 값은 그대로. */
(function(){
  var D = document.documentElement;
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }

  /* ---------- 지금 탭 표시 (④ CSS 용) ---------- */
  var _dt = window.drawTabs;
  window.drawTabs = function(){ var r = _dt ? _dt.apply(this, arguments) : undefined; try { D.setAttribute("data-tab", window.cur || ""); } catch(x) {} return r; };

  /* ---------- ② 결론 → 근거 ---------- */
  // 탭별 「결론」 카드(제목에 이 말) — 이것만 펼쳐 둠. 나머지 맨 위 단계 카드는 제목 한 줄
  var KEEP = {
    market: /오늘 할 일|아침판/,
    sector: /국면 신호판|장중 나침반/,
    port:   /부터 성적/,
    prob:   /오를 확률/,
    whale:  /TOP 10/,          // ⑥ 신호 탭: 오늘 볼 것 하나만 펼치고 나머지 상세는 한 단계 아래로
    cup:    /돌파 임박/,
    gap:    /오늘 갭 지도/
  };
  var OPEN = {}; try { OPEN = JSON.parse(ls("czopen") || "{}") || {}; } catch(x) {}
  function keepOpen(){ ls("czopen", JSON.stringify(OPEN)); }
  var EMO = /(?:\p{Extended_Pictographic}|\p{Regional_Indicator})[️‍\p{Extended_Pictographic}\p{Regional_Indicator}\p{Emoji_Modifier}]*/gu;
  function titleOf(c){
    var h = c.querySelector(":scope > h3, :scope > .hm-h b, :scope > .sc-h b, :scope > summary, :scope > .sec");
    var t = (h ? h.textContent : String(c.innerText || "").split("\n").filter(function(x){ return x.trim(); })[0] || "").replace(/ⓘ/g, "").replace(/\s+/g, " ").trim();
    if (!t || /^[\d+\-−.,%\s]+$/.test(t)) return "";      // 숫자만 있는 타일은 제목 아님
    return t.length > 38 ? t.slice(0, 36) + "…" : t;
  }
  var EXTRA = {port: ", #pohero, #podz"};   // 포트 탭은 카드 모양이 아닌 큰 덩어리도 접음
  function topCards(root, tab){
    return [].filter.call(root.querySelectorAll(".card" + (EXTRA[tab] || "")), function(c){
      if (c.tagName === "DETAILS" || c.classList.contains("xs-more") || c.classList.contains("hero")) return false;
      var p = c.parentElement && c.parentElement.closest(".card, .fold, #sheet, #xs-more, .xs-list, #pohero, #podz"); return !p;
    });
  }
  function fold(){
    var tab = window.cur, re = KEEP[tab], main = document.getElementById("main"); if (!re || !main) return;
    var cards = topCards(main, tab), seen = false;
    cards.forEach(function(c){
      if (c.dataset.cz === "done" || c.classList.contains("xs-hid")) return;
      var t = titleOf(c);
      if (!seen && re.test(t)){ seen = true; c.dataset.cz = "done"; return; }
      if (re.test(t)){ c.dataset.cz = "done"; return; }
      if (!t){ c.dataset.cz = "done"; return; }
      if (c.offsetHeight < 140) return;                                     // 아직 짧은(그리는 중일 수 있는) 카드는 다음에 다시 봄
      c.dataset.cz = "done"; var key = tab + ":" + t.replace(EMO, "").slice(0, 24);
      var hd = document.createElement("div"); hd.className = "cz-h"; hd.innerHTML = '<span></span><i>펼치기 ▾</i>'; hd.firstChild.textContent = t;
      var ft = document.createElement("button"); ft.className = "cz-f"; ft.textContent = "접기 ▴";
      c.insertBefore(hd, c.firstChild); c.appendChild(ft); c.classList.add("cz");
      if (!OPEN[key]) c.classList.add("cz-on");
      hd.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); c.classList.remove("cz-on"); OPEN[key] = 1; keepOpen(); }, true);
      ft.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); c.classList.add("cz-on"); delete OPEN[key]; keepOpen(); var y = c.getBoundingClientRect().top; if (y < 0) window.scrollBy(0, y - 70); }, true);
    });
  }
  // 제목 줄(.sec) + 바로 다음 덩어리 모양(시황 「오늘의 숫자」 타일 묶음 등) — 덩어리만 접고 제목 줄에 펼치기
  function secFold(){
    var tab = window.cur; if (!KEEP[tab]) return;
    [].forEach.call(document.querySelectorAll("#main .sec"), function(sc){
      var nx = sc.nextElementSibling; if (sc.dataset.cz || !nx || !/kpis/.test(nx.className)) return;
      sc.dataset.cz = "1"; var key = tab + ":sec:" + sc.textContent.replace(EMO, "").trim().slice(0, 20);
      var tg = document.createElement("i"); tg.className = "cz-st"; sc.appendChild(tg);
      var set = function(o){ nx.style.display = o ? "" : "none"; tg.textContent = o ? "접기 ▴" : "펼치기 ▾"; };
      set(!!OPEN[key]); sc.style.cursor = "pointer";
      sc.addEventListener("click", function(ev){ ev.preventDefault(); ev.stopPropagation(); var o = nx.style.display === "none"; set(o); if (o) OPEN[key] = 1; else delete OPEN[key]; keepOpen(); }, true);
    });
  }
  // 접힌 카드 안 아무 데나 눌러도 펼침(카드 이동 대신)
  document.addEventListener("click", function(ev){
    var c = ev.target.closest && ev.target.closest(".cz.cz-on"); if (!c) return;
    ev.preventDefault(); ev.stopPropagation(); var h = c.querySelector(".cz-h"); if (h) h.click();
  }, true);
  // 알림·링크로 접힌 카드 안을 찾아가면 펼쳐서 보여 줌
  var _goTo = window.goTo;
  if (_goTo) window.goTo = function(tab, anchor){
    var r = _goTo.apply(this, arguments);
    if (anchor){ var t0 = Date.now(); (function f(){ var el = document.getElementById(anchor); if (el){ var c = el.closest(".cz.cz-on"); if (c) c.classList.remove("cz-on"); return; } if (Date.now() - t0 < 6000) setTimeout(f, 200); })(); }
    return r;
  };

  /* ---------- ③ 이모지 줄이기 ---------- */
  // 꾸밈으로만 쓰인 것 — 본문에서 뺌. 뜻이 있는 표시(🟢🔴🟡⚪ · ✅❌ · ⚠️ · ★ · 국기 · 신호 출처 🐋☕📈🤫 · 포트 표시 💼⚡🎯🙋)는 그대로
  var DECOR = /(?:🔥|🧊|💡|👀|📌|🧭|🌙|☀️?|🌞|🌅|🌆|🗺️?|🏁|🧮|🧪|📊|📅|🗓️?|🔔|💬|📤|🧾|🧵|🪄|🗳️?|🔮|🎞️?|🕰️?|🎛️?|📋|🔁|🧩|🌏|🌍|🌐|🔗|🏷️?|🏔️?|📜|💱|🌡️?|🕐|🔄|⏳|⏱️?|⏰|📏|🔢|✂️?|🧹|🆕|💭|🗣️?|📖|📘|📢|📣|🎲|🧠|🚀|💧|🪙|🏆|🎉|👆|👉|🙌|✨|📉|🛑|⛔|🚨|💸|🤝|💪|🧑‍💼|🕸️?|⚔️?|🌉|🕳️?|🌱|🛍️?|📦|🏦|📰|🔎|🔍|🐣|🍀|🌈|🎈|📍|🧲|⚖️?|📝|🗂️?|📂|👻|🧱|🪪|🛰️?|😱|💰|🩹|🦴|🔒|🔓|🔑)\s?/gu;
  var SKIPSEL = "script,style,svg,input,textarea,select,button,.seg2,.tabs,#bnav,header,.hm-i,.pl-ic,.sc-h .hm-i,.cz-h,.hm-more,[data-noemo],.chip,.hm-chip,.sgx-t,.pd-v,.date,.dates";
  function thinTitles(root){
    [].forEach.call(root.querySelectorAll("h3, .hm-h b, .sec, summary"), function(h){
      if (h.dataset.emo) return; h.dataset.emo = "1";
      var n = 0;
      walk(h, function(tn){ var v = tn.nodeValue, out = v.replace(EMO, function(m){ n++; return n > 1 ? "" : m; }); if (out !== v) tn.nodeValue = out.replace(/\s{2,}/g, " "); });
    });
  }
  function walk(root, fn){
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {acceptNode: function(n){ var p = n.parentElement; return !p || p.closest(SKIPSEL) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }});
    var a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(fn);
  }

  /* ---------- ⑤ 숫자·날짜 ---------- */
  var Y = String(new Date(Date.now() + 9 * 3600e3).getUTCFullYear());
  function fmtText(v, decor){
    var o = v;
    if (decor) o = o.replace(DECOR, "");
    // 등락(부호 있는 %) → 소수 1자리 (0.0 이 되면 2자리 그대로)
    o = o.replace(/([+\-−])(\d{1,3}(?:,\d{3})*|\d+)\.(\d{2,})%(?!p)/g, function(m, s, a, b){ var x = (+(a.replace(/,/g, "") + "." + b)).toFixed(1); return x === "0.0" ? m : s + x + "%"; });
    // 금리·수익률(부호 없음)·%p → 2자리까지 (표면금리는 그대로)
    o = o.replace(/(표면\s*)?(\d+)\.(\d{3,})(%p?)/g, function(m, pre, a, b, u){ return pre ? m : (+(a + "." + b)).toFixed(2) + u; });
    // 올해 날짜 2026-10-19 → 10/19 · 10-19 → 10/19
    o = o.replace(new RegExp("(^|[^\\d-])" + Y + "-(\\d{2})-(\\d{2})(?![\\d])", "g"), function(m, p, mo, d){ return p + mo + "/" + d; });
    o = o.replace(/(^|[\s(·])(0[1-9]|1[0-2])-([0-2]\d|3[01])(?=[\s)·,]|$)(?![%시일개년월주배건종p])/g, function(m, p, mo, d){ return p + mo + "/" + d; });
    return o;
  }
  function normalize(root){
    var tab = window.cur || "", prod = /^(bond|fund|els|onepager)$/.test(tab);
    walk(root, function(tn){
      var p = tn.parentElement; if (!p || p.closest("[data-num]") && p.closest(".hm-big")) return;   // 홈 숫자 차오름 중인 칸은 그 코드가 맡음
      var v = tn.nodeValue; if (!v || v.length < 2) return;
      if (!v.replace(EMO, "").trim()) return;                    // 이모지만 있는 칸 = 아이콘 자리 → 그대로
      var decor = !p.closest("h3, .hm-h b, .sec, summary");      // 제목은 thinTitles 가 맡음
      var o = prod ? (decor ? v.replace(DECOR, "") : v) : fmtText(v, decor);
      if (o !== v) tn.nodeValue = o;
    });
  }

  /* ---------- 한 번에 돌리기 (그려질 때마다 · 잠깐 모아서) ---------- */
  var T = null, busy = false;
  function pass(){
    T = null; if (busy || ls("calm") === "off") return; busy = true;
    try { var m = document.getElementById("main"); if (m){ thinTitles(m); normalize(m); fold(); secFold(); } var sh = document.getElementById("sheet"); if (sh){ thinTitles(sh); normalize(sh); } }
    catch(x){ if (window.console) console.warn("calm", x); }
    busy = false;
  }
  function soon(){ if (!T) T = setTimeout(pass, 260); }
  function start(){
    var mo = new MutationObserver(function(){ if (!busy) soon(); });
    mo.observe(document.body, {childList: true, subtree: true, characterData: true});
    soon();
  }
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", start) : start();

  /* ---------- 📖 용어 풀이 ---------- */
  var G = [
    ["기본 포트", "시황리포트 자산배분표대로 담은 포트. 주식 칸은 S&P500 반 + 나스닥 반이 뼈대."],
    ["공격(킥) 포트", "기본 포트에 성과가 확인된 신호(고래·컵·갭) 종목을 10~20% 섞어 시장을 이기려는 포트."],
    ["집중 포트", "오르는 장이라고 볼 때만 S&P·나스닥 뼈대 + 공격(킥) 종목에 몰아서 담는 포트."],
    ["내 포트", "내가 직접 정한 비중으로 굴린 셈 치는 포트."],
    ["고래", "기관·유명 투자자 40곳. 분기마다 공시(13F)하는 보유 종목 변화를 따라감."],
    ["컵", "컵앤핸들 차트 — 바닥을 둥글게 다진 뒤 손잡이를 지나 전 고점을 뚫으려는 모양."],
    ["갭", "전날 종가보다 크게 뛰어 시작해 차트에 빈칸(갭)이 생긴 종목."],
    ["나침반", "5개 시장(한·미·일·중·홍)의 오른 종목 수·지수·섹터 흐름을 한 화면에."],
    ["국면", "지금 시장이 상승장·조정·하락장 중 어디쯤인지. 🟢 상승장 / 🔴 아님."],
    ["두뇌", "매시간 뉴스·블로그·텔레그램을 읽고 시장 판단과 논지(이렇게 될 것)를 고치는 자동 분석."],
    ["시장확률", "여러 방법을 합쳐 계산한 「다음 장 오를 확률」. 매일 종가로 채점하고, 검증되기 전엔 약하게만 말함."],
    ["200일선", "최근 200거래일 평균 가격. 지수가 그 위면 상승 추세로 보고 현금을 줄임."],
    ["정직 계산", "다음 날 가격에 사고 수수료·세금·환전 비용까지 뺀 성적. 📊 성적표에서 봄."],
    ["예고 채점", "아침 시황리포트가 낸 예고(예: 코스피 5,400 위 마감)를 다음 날 맞았는지 채점."]
  ];
  function gloss(){
    var old = document.getElementById("gloss"); if (old){ old.remove(); return; }
    var d = document.createElement("div"); d.id = "gloss";
    d.innerHTML = '<div class="gl-in"><div class="gl-t"><b>📖 용어 풀이</b><button aria-label="닫기">✕</button></div>' + G.map(function(x){ return '<div class="gl-r"><b>' + x[0] + '</b><span>' + x[1] + '</span></div>'; }).join("") + '</div>';
    d.onclick = function(ev){ if (ev.target === d || ev.target.closest("button")) d.remove(); };
    document.body.appendChild(d);
  }
  window.chGloss = gloss;
  document.addEventListener("click", function(ev){ var t = ev.target.closest && ev.target.closest("[data-gloss]"); if (!t) return; ev.preventDefault(); ev.stopPropagation(); var s = document.getElementById("uiset"); if (s) s.remove(); gloss(); }, true);

  /* ---------- 모양 ---------- */
  var st = document.createElement("style");
  st.textContent = [
    // ② 접힌 카드
    ".card.cz{position:relative}.cz-h{display:none}.cz-f{display:block;margin:10px auto 0;background:none;border:0;color:var(--sub);font-size:12px;padding:4px 10px;cursor:pointer}",
    ".cz.cz-on{padding:12px 14px!important;cursor:pointer;background:var(--panel);border:1px solid var(--line);border-radius:16px;margin-bottom:12px}.cz.cz-on>*{display:none!important}.cz.cz-on>.cz-h{display:flex!important}",
    ".cz-h{align-items:center;gap:8px;font-weight:700;font-size:14.5px;line-height:1.35}.cz-h span{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.cz-h i{flex:none;font-style:normal;font-weight:400;font-size:12px;color:var(--sub)}",
    // 포트 탭 묶음(.fold)이 다른 「.fold」 단추 모양을 물려받아 상자 안 상자로 보이던 것 정리
    ".cz-st{float:right;font-style:normal;font-weight:400;font-size:12px;color:var(--sub);margin-left:8px}",
    "#pobody>.fold{padding:0;border:0;background:none;margin:0 0 8px}#pobody>.fold.open{margin-bottom:14px}#pobody>.fold:not(.open) .fold-h{margin:0}",
    // ④ 정직 칩은 성적표에서만
    "html:not([data-tab=score]) .hon-chip,html:not([data-tab=score]) .hon-tag,html:not([data-tab=score]) .hon-line{display:none!important}",
    // 홈 아래 바로가기 줄
    ".hm-more{display:flex;flex-wrap:wrap;gap:8px;margin:4px 2px 18px}.hm-more a{flex:1 1 auto;text-align:center;font-size:12.5px;padding:9px 10px;border-radius:12px;background:var(--panel);border:1px solid var(--line);color:var(--sub);text-decoration:none;cursor:pointer;white-space:nowrap}",
    // 🗂 신호 › 더 보기
    ".sm-t{padding:9px 0;border-top:1px dashed var(--line)}.sm-t:first-of-type{border-top:0}.sm-tb{display:flex;gap:10px;align-items:flex-start}.sm-tb b{flex:1;font-size:14px;line-height:1.45}.sm-t small{display:block;font-size:12px;color:var(--sub);line-height:1.45;margin-top:3px}",
    ".sm-c{flex:none;width:64px;text-align:right}.sm-c i{display:block;height:5px;border-radius:3px;background:#7c9cff;margin:6px 0 2px auto;max-width:64px}.sm-c em{font-style:normal;font-size:12px;color:var(--sub)}",
    ".sm-go{display:flex;align-items:center;gap:10px;padding:11px 2px;border-top:1px solid var(--line);cursor:pointer}.sm-go:first-of-type{border-top:0}.sm-go>span{font-size:20px;width:30px;text-align:center}.sm-go div{flex:1}.sm-go b{display:block;font-size:14.5px}.sm-go small{font-size:12px;color:var(--sub)}.sm-go i{font-style:normal;color:var(--sub)}",
    // 📖 용어 풀이
    "#gloss{position:fixed;inset:0;z-index:300;background:rgba(0,0,0,.45);display:flex;align-items:flex-end;justify-content:center}",
    ".gl-in{width:100%;max-width:560px;max-height:82vh;overflow:auto;background:var(--panel);border-radius:18px 18px 0 0;padding:14px 16px calc(18px + env(safe-area-inset-bottom))}",
    ".gl-t{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;font-size:16px}.gl-t button{background:none;border:0;color:var(--sub);font-size:18px;padding:4px 8px}",
    ".gl-r{padding:9px 0;border-top:1px solid var(--line);font-size:13.5px;line-height:1.5}.gl-r b{display:block;margin-bottom:1px}.gl-r span{color:var(--sub)}"
  ].join("");
  document.head.appendChild(st);
})();
