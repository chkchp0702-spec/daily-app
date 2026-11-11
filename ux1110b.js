/* 🫧 11/10 버블 경보판 — 「주식보다 채권이 먼저 운다」 (사용자: 전병서 11/11 「AI 버블, 지금 몇 시인가」를 올리며 「네 두뇌에 생각을 더해 · 이 글부터 바로 반영」)
   🏠 오늘 홈 🐻 하락장 계기판 바로 아래 카드 한 장:
   ─ 머리: 🔴·🟠·🟢 개수 띠 + 결론 한 줄(신용 경보 켜짐이면 「출구 설계: 현금 도는 기업·전력/데이터·외상 없는 삽 장수」)
   ─ 📅 분수령 날짜(엔비디아 실적 · FOMC) D-day
   ─ 펼치면: 신용 / 바늘 / 완충 묶음별 칸 — 자동(야후 종가) · 손(두뇌가 출처와 함께 갱신) 꼬리표
   계산은 만드는 쪽(market-strategy-report src/bubble_gate.py → market/bubble.json) — 이 파일은 그리기만 */
/* 🕰 11/11 버블 시계(A11/11-1 · 사용자 「둘 다 진행」) — 머리 띠 자리에 시계 하나: 전병서 순서 4단계(💳 신용 → 📈 금리·규제·유가 → 🧊 주식 속살·현금 도피 → 🛟 완충 꺼짐)
   칸 점수 🔴1·🟠½·🟢0 · 단계마다 3시간 · 앞 단계가 ¾ 넘게 울어야 다음 단계로 · 테두리 11칸(누르면 그 칸 근거) · 어제 마지막 시각 → 지금(bubble_log) · 계산은 결과 보기 전 등록 */
(function(){
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function md(s){ s = String(s || ""); return s.length >= 10 ? (+s.slice(5, 7)) + "/" + (+s.slice(8, 10)) : s; }
  function dday(d){
    var t = Date.parse(String(d).slice(0, 10) + "T00:00:00+09:00"), n = Date.parse(new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10) + "T00:00:00+09:00");
    var k = Math.round((t - n) / 864e5); return k === 0 ? "오늘" : k > 0 ? "D-" + k : "";
  }
  var GN = {"신용": "💳 신용 — 채권이 먼저 우는 곳", "바늘": "📌 바늘 — 풍선 곁에 모인 것", "완충": "🛟 완충 — 버텨 주는 것"};
  var SC = {"🔴": "r", "🟠": "o", "🟢": "g"};

  // 🕰 버블 시계 — 순서는 전병서 「지금 몇 시인가」 틀(주식보다 신용이 먼저 운다)
  var CQ = [
    {t: "💳 신용", k: ["fcf", "bonds", "cds", "credit"]},
    {t: "📈 금리·규제·유가", k: ["rate", "policy", "geo"]},
    {t: "🧊 주식 속살·현금 도피", k: ["breadth", "flow"]},
    {t: "🛟 완충 꺼짐", k: ["buffer", "recession"]}
  ];
  var PT = {"🔴": 1, "🟠": 0.5, "🟢": 0};
  function clockOf(st){   // st = {key: "🔴"...} → {h, label, q:[{t, comp, r, o, n}]}
    var h = 0, stop = false, q = CQ.map(function(Q){
      var ks = Q.k.filter(function(k){ return st[k] != null; }), sum = 0, r = 0, o = 0;
      ks.forEach(function(k){ sum += PT[st[k]] || 0; if (st[k] === "🔴") r++; if (st[k] === "🟠") o++; });
      return {t: Q.t, comp: ks.length ? sum / ks.length : 0, r: r, o: o, n: ks.length};
    });
    q.forEach(function(x){ if (stop) return; h += 3 * x.comp; if (x.comp < 0.75) stop = true; });
    var hh = Math.round(h * 2) / 2, w = Math.floor(hh), half = hh - w >= 0.5;
    var label = hh <= 0 ? "12시 · 조용" : hh >= 12 ? "12시 · 다 울었음" : "약 " + w + "시" + (half ? " 반" : "");
    if (hh > 0 && hh < 1) label = "약 12시 반";
    return {h: h, hh: hh, label: label, q: q};
  }
  function stOf(B){ var st = {}; (B.items || []).forEach(function(x){ if (x.key) st[x.key] = x.state; }); return st; }
  window.__bubClock = function(B){ try { return B && B.items ? clockOf(stOf(B)) : null; } catch(x) { return null; } };
  function word(x){ return !x.n ? "자료 없음" : x.comp >= 0.999 ? "다 울었음" : x.comp >= 0.75 ? "거의 다 울었음" : x.comp > 0 ? (x.r ? "🔴 " + x.r : "") + (x.o ? (x.r ? " · " : "") + "🟠 " + x.o : "") + " / " + x.n + "칸" : "조용"; }
  function pt(a, r){ var t = a * Math.PI / 180; return (60 + r * Math.sin(t)).toFixed(1) + " " + (60 - r * Math.cos(t)).toFixed(1); }
  function clockSVG(B, C){
    var byK = {}; (B.items || []).forEach(function(x){ if (x.key) byK[x.key] = x; });
    var arcs = "", R = 47;
    CQ.forEach(function(Q, qi){
      var a0 = qi * 90, n = Q.k.length, step = 90 / n;
      Q.k.forEach(function(k, i){
        var x = byK[k], s0 = a0 + i * step + 2.2, s1 = a0 + (i + 1) * step - 2.2;
        arcs += '<path class="bck ' + (x ? (SC[x.state] || "n") : "n") + '" data-bbk="' + k + '" d="M' + pt(s0, R) + ' A' + R + ' ' + R + ' 0 0 1 ' + pt(s1, R) + '"><title>' + e(x ? x.name + " " + x.state : k) + '</title></path>';
      });
    });
    var nums = [[0, "12"], [90, "3"], [180, "6"], [270, "9"]].map(function(z){ var p = pt(z[0], 33).split(" "); return '<text x="' + p[0] + '" y="' + (+p[1] + 4) + '">' + z[1] + '</text>'; }).join("");
    var ang = C.hh / 12 * 360, tip = pt(ang, 38).split(" ");
    return '<svg class="bck-svg" viewBox="0 0 120 120" role="img" aria-label="버블 시계 ' + e(C.label) + '"><circle cx="60" cy="60" r="56" class="bck-face"/>' + arcs + nums +
      '<line x1="60" y1="60" x2="' + tip[0] + '" y2="' + tip[1] + '" class="bck-hand"/><circle cx="60" cy="60" r="4.5" class="bck-hub"/></svg>';
  }
  function dur(h){ var m = Math.round(h * 60); return m >= 60 ? (m / 60) + '시간' : m + '분'; }
  function chgLine(B, C){   // 어제 마지막 기록 → 지금
    var RAW = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/bubble_log.json?t=" + Math.floor(Date.now() / 6e5);
    fetch(RAW).then(function(r){ return r.ok ? r.json() : null; }).then(function(L){
      var el = document.getElementById("bck-chg"); if (!el || !L || !L.length) return;
      var today = String(B.at || "").slice(0, 10), prev = null;
      for (var i = L.length - 1; i >= 0; i--) if (String(L[i].at || "").slice(0, 10) < today){ prev = L[i]; break; }
      if (!prev){ el.textContent = "어제 기록 없음 — 오늘부터 바늘 흐름을 적어요"; return; }
      var P = clockOf(prev.states || {}), d = C.hh - P.hh;
      el.innerHTML = e(md(prev.at)) + ' 마지막 <b>' + e(P.label.replace(/^약 /, "")) + '</b> → 지금 <b>' + e(C.label.replace(/^약 /, "")) + '</b>' + (d > 0 ? ' <em class="up">▲' + dur(d) + '</em>' : d < 0 ? ' <em class="dn">▼' + dur(-d) + '</em>' : ' · 그대로');
    }).catch(function(){});
  }
  function clockBlock(B){
    var C = clockOf(stOf(B)); if (!C) return "";
    setTimeout(function(){ chgLine(B, C); }, 0);
    var rows = C.q.map(function(x, i){ return '<li class="' + (x.comp >= 0.75 ? "r" : x.comp > 0 ? "o" : "g") + '"><span>' + e(x.t) + '</span><b>' + e(word(x)) + '</b></li>'; }).join("");
    return '<div class="bck">' + clockSVG(B, C) + '<div class="bck-t"><div class="bck-k">🕰 버블 시계</div><div class="bck-big">지금 ' + e(C.label) + '</div><ol>' + rows + '</ol><div class="bck-chg" id="bck-chg">어제와 비교 중…</div></div></div>' +
      '<p class="bck-ru">순서: 전병서 「AI 버블, 지금 몇 시인가」 틀(채권·신용이 주식보다 먼저 울어요) · 속살·현금 도피 2칸은 「바늘」 묶음에서 떼어 3단계로 · 바늘 = 칸 점수(🔴 1 · 🟠 ½) × 단계마다 3시간 · 앞 단계가 ¾ 넘게 울어야 다음 단계로 넘어가요 · 테두리 칸을 누르면 그 칸 근거 · 생각의 틀 — 사라·팔라는 뜻 아님</p>';
  }

  window.__bubCard = function(B){
    if (!B || !B.items || !B.items.length) return "";
    var n = (B.red || 0) + (B.orange || 0) + (B.green || 0) || B.items.length;
    var bar = [["r", B.red], ["o", B.orange], ["g", B.green]].map(function(x){ return x[1] ? '<i class="bbx-b' + x[0] + '" style="flex:' + x[1] + '"></i>' : ""; }).join("");
    var cnt = '<span class="bbx-n"><b class="r">🔴 ' + (B.red || 0) + '</b><b class="o">🟠 ' + (B.orange || 0) + '</b><b class="g">🟢 ' + (B.green || 0) + '</b>' + (B.credit_on ? '<em>신용 경보 켜짐</em>' : '') + '</span>';
    var dates = (B.dates || []).slice(0, 3).map(function(d){ var dd = dday(d.d); return '<li><b>' + e(md(d.d)) + (dd ? ' <em>' + dd + '</em>' : '') + '</b><span>' + e(d.t) + '<small>' + e(d.why) + '</small></span></li>'; }).join("");
    var groups = {}; B.items.forEach(function(x){ (groups[x.grp || "바늘"] = groups[x.grp || "바늘"] || []).push(x); });
    var det = ["신용", "바늘", "완충"].filter(function(g){ return groups[g]; }).map(function(g){
      return '<div class="bbx-g"><div class="bbx-gh">' + e(GN[g] || g) + '</div><ul>' + groups[g].map(function(x){
        return '<li class="' + (SC[x.state] || "") + '" data-bbk="' + e(x.key || "") + '"><i>' + e(x.state) + '</i><div><b>' + e(x.name) + ' <small>기준: ' + e(x.th) + '</small></b><p>' + e(x.now) + '</p><small class="bbx-src">' +
          (x.auto ? '<em class="a">자동</em> 야후 종가 · ' + e(String(x.at || "").slice(5, 16).replace("-", "/")) : '<em>손</em> ' + e(x.src) + ' · ' + e(md(x.at))) + '</small></div></li>';
      }).join("") + '</ul></div>';
    }).join("");
    var fr = B.frame ? '<details class="bbx-f"><summary>이 틀은 어디서? — ' + e(B.frame.title) + '</summary><ul>' + (B.frame.lines || []).map(function(l){ return '<li>' + e(l) + '</li>'; }).join("") + '</ul></details>' : "";
    return '<section class="card bbx" id="bubble" data-cz="done">' +
      '<div class="bbx-h">🫧 버블 경보판 <small>' + e(md(B.at)) + ' ' + e(String(B.at || "").slice(11, 16)) + ' · 주식보다 채권이 먼저 울어요</small></div>' +
      clockBlock(B) + cnt +
      '<p class="bbx-lead' + (B.credit_on || B.red >= 3 ? " warn" : "") + '">' + e(B.lead) + '</p>' + (B.sub ? '<p class="bbx-sub">' + e(B.sub) + '</p>' : '') +
      (dates ? '<ul class="bbx-d">' + dates + '</ul>' : '') +
      '<details class="bbx-det"><summary>' + n + '칸 펼치기 · 무엇이 울고 있나</summary>' + det + fr +
      '<p class="note bbx-ru">자동 칸 기준 — 신용: 하이일드÷국채(HYG/IEF) 20일 −1.5%↓ 🔴 · −0.5%↓ 🟠 / 10년물 5% 위 5일 연속 🔴 · 4.75%↑ 🟠 / 브렌트 100$ 🔴 · 90$ 🟠 / 평균 종목(동일가중 S&P) 1년 고점 −15% 🔴 · −8% 🟠 / ' +
      '현금 도피 = 나스닥100 하루 −5%↓ + 방어주도 하락 + 신용 악화 🔴 · 방어주가 기술주보다 20일 +3%p = 업종 갈아타기 🟠. 생각의 틀이에요 — 포트 비중·현금 규칙은 이 판 혼자 바꾸지 않아요(현금은 🐻 계기판) · 매수·매도 추천 아님.</p></details></section>';
  };

  var css = document.createElement("style");
  css.textContent =
    ".bbx{padding:16px 16px 14px!important}.bbx-h{font-size:16px;font-weight:900;letter-spacing:-.3px}.bbx-h small{display:block;margin-top:2px;font-size:12px;font-weight:600;color:var(--sub)}" +
    ".bbx-bar{display:flex;gap:3px;height:8px;margin:12px 0 8px;border-radius:6px;overflow:hidden}.bbx-bar i{display:block;min-width:6px}.bbx-br{background:#e5484d}.bbx-bo{background:#f59e0b}.bbx-bg{background:#30a46c}" +
    ".bbx-n{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;font-size:13px}.bbx-n b{font-weight:800}.bbx-n em{font-style:normal;font-size:12px;font-weight:800;color:#e5484d;padding:2px 8px;border-radius:999px;background:rgba(229,72,77,.12)}" +
    ".bbx-lead{margin:10px 0 0;font-size:14px;font-weight:700;line-height:1.5;word-break:keep-all}.bbx-lead.warn{color:var(--text)}.bbx-sub{margin:4px 0 0;font-size:12px;line-height:1.45;color:var(--sub);word-break:keep-all}" +
    ".bbx-d{list-style:none;margin:12px 0 0;padding:10px 12px;border-radius:12px;background:var(--panel,rgba(127,127,127,.08))}.bbx-d li{display:flex;gap:10px;align-items:flex-start;font-size:13px;line-height:1.4}.bbx-d li+li{margin-top:8px}" +
    ".bbx-d li>b{flex:0 0 64px;font-weight:900}.bbx-d li>b em{display:block;font-style:normal;font-size:11px;color:#f59e0b}.bbx-d li>span{flex:1;min-width:0;font-weight:700;word-break:keep-all}.bbx-d small{display:block;font-weight:500;color:var(--sub);font-size:12px;margin-top:2px}" +
    ".bbx-det{margin-top:12px}.bbx-det>summary,.bbx-f>summary{cursor:pointer;font-size:13px;font-weight:800;color:var(--accent,#3987e5);list-style:none}.bbx-det>summary::-webkit-details-marker,.bbx-f>summary::-webkit-details-marker{display:none}" +
    ".bbx-g{margin-top:12px}.bbx-gh{font-size:12px;font-weight:800;color:var(--sub);margin-bottom:6px}.bbx-g ul{list-style:none;margin:0;padding:0}" +
    ".bbx-g li{display:flex;gap:8px;padding:9px 10px;border-radius:10px;background:var(--panel,rgba(127,127,127,.06))}.bbx-g li+li{margin-top:6px}.bbx-g li.r{box-shadow:inset 3px 0 0 #e5484d}.bbx-g li.o{box-shadow:inset 3px 0 0 #f59e0b}.bbx-g li.g{box-shadow:inset 3px 0 0 #30a46c}" +
    ".bbx-g li>i{font-style:normal;flex:0 0 auto}.bbx-g li>div{flex:1;min-width:0}.bbx-g li b{font-size:13px;font-weight:800}.bbx-g li b small{font-weight:600;color:var(--sub);font-size:11px;margin-left:4px}" +
    ".bbx-g li p{margin:3px 0 0;font-size:13px;line-height:1.45;word-break:keep-all;overflow-wrap:anywhere}.bbx-src{display:block;margin-top:3px;font-size:11px;color:var(--sub)}.bbx-src em{font-style:normal;font-weight:800;padding:0 5px;border-radius:5px;background:rgba(127,127,127,.18)}.bbx-src em.a{background:rgba(57,135,229,.18)}" +
    ".bbx-f{margin-top:12px}.bbx-f ul{margin:8px 0 0;padding-left:18px;font-size:13px;line-height:1.5;word-break:keep-all}.bbx-f li+li{margin-top:4px}.bbx-ru{margin-top:12px!important}";
  css.textContent +=
    ".bck{display:flex;gap:12px;align-items:center;margin:12px 0 8px}.bck-svg{flex:0 0 112px;width:112px;height:112px}" +
    ".bck-face{fill:var(--panel,rgba(127,127,127,.08));stroke:rgba(127,127,127,.25);stroke-width:1}.bck-svg text{font-size:10px;font-weight:800;fill:var(--sub);text-anchor:middle}" +
    ".bck-svg path.bck{fill:none;stroke-width:9;cursor:pointer}.bck-svg path.r{stroke:#e5484d}.bck-svg path.o{stroke:#f59e0b}.bck-svg path.g{stroke:#30a46c}.bck-svg path.n{stroke:rgba(127,127,127,.35)}" +
    ".bck-hand{stroke:var(--text,#111);stroke-width:3.2;stroke-linecap:round}.bck-hub{fill:var(--text,#111)}" +
    ".bck-t{flex:1;min-width:0}.bck-k{font-size:12px;font-weight:800;color:var(--sub)}.bck-big{font-size:21px;font-weight:900;letter-spacing:-.4px;margin:1px 0 6px}" +
    ".bck-t ol{list-style:none;margin:0;padding:0;font-size:12px;line-height:1.35}.bck-t ol li{display:flex;justify-content:space-between;gap:6px}.bck-t ol li+li{margin-top:2px}.bck-t ol li span{color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.bck-t ol li b{font-weight:800;white-space:nowrap}" +
    ".bck-t ol li.r b{color:#e5484d}.bck-t ol li.o b{color:#d97706}.bck-t ol li.g b{color:#30a46c}" +
    ".bck-chg{margin-top:6px;font-size:12px;color:var(--sub)}.bck-chg b{color:var(--text)}.bck-chg em{font-style:normal;font-weight:800}.bck-chg em.up{color:#e5484d}.bck-chg em.dn{color:#30a46c}" +
    ".bck-ru{margin:0 0 8px;font-size:11px;line-height:1.45;color:var(--sub);word-break:keep-all}.bbx-g li.bck-hl{outline:2px solid var(--accent,#3987e5);outline-offset:1px}";
  document.addEventListener("click", function(ev){
    var t = ev.target.closest && ev.target.closest(".bck-svg [data-bbk]"); if (!t) return;
    var card = t.closest(".bbx"); if (!card) return;
    var det = card.querySelector(".bbx-det"); if (det) det.open = true;
    var li = card.querySelector('.bbx-g li[data-bbk="' + t.getAttribute("data-bbk") + '"]'); if (!li) return;
    li.scrollIntoView({behavior: "smooth", block: "center"}); li.classList.add("bck-hl"); setTimeout(function(){ li.classList.remove("bck-hl"); }, 1800);
  }, true);
  document.head.appendChild(css);
  if (window.__h2apply) try { __h2apply(); } catch(x) {}
})();
