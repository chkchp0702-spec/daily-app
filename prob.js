/* CH Investing — 🎲 시장확률: 내일·일주일 뒤 오를 확률 (5개 시장, 10가지 방법 결합) · archive/x/prob.json (prob.yml 매시간)
   10/14 사용자 「다 합쳐서 확률로 만들어서 나침반 옆에 '시장확률' — 누르면 설명 나오고, 어떤 방법들인지 나오고 접고 · 다섯 개 시장 다」 */
(function(){
  var e = V.e, cls = V.cls;
  var ORDER = ["KR", "US", "JP", "CN", "HK"], SEL = null, OPEN = {};
  try { OPEN = JSON.parse(localStorage.getItem("probopen") || "{}"); } catch(x) {}
  function P(name){ return getJSON("archive/x/" + name + "?" + Math.floor(Date.now() / 120000), {ttl: 120000}); }
  function pc(p){ return p == null ? "–" : Math.round(p * 100) + "%"; }
  function sg(v, d){ return v == null ? "–" : (v > 0 ? "+" : "") + Number(v).toFixed(d == null ? 1 : d) + "%"; }
  function tcls(p){ return p == null ? "" : p >= 0.57 ? "up" : p <= 0.43 ? "dn" : ""; }
  // 10/15 사용자 「시장을 선택하면 자꾸 맨 밑으로 가」 — 다시 그린 뒤 접기·머리 줄이 시간차로 높이를 바꿈 → 0.8초 동안 누른 자리를 화면 같은 높이에 붙잡음(손대면 멈춤)
  function holdAt(sel, y){
    var stop = false, t0 = Date.now(), quit = function(){ stop = true; };
    window.addEventListener("touchstart", quit, {once: true, passive: true}); window.addEventListener("wheel", quit, {once: true, passive: true});
    (function f(){ if (stop) return; var n = document.querySelector(sel); if (n){ var d = n.getBoundingClientRect().top - y; if (Math.abs(d) > 1) window.scrollTo({top: window.scrollY + d, behavior: "instant"}); }
      if (Date.now() - t0 < 800) requestAnimationFrame(f); })();
  }
  function md(d){ return d ? d.slice(5).replace("-", "/") : ""; }
  // 📅 10/15 사용자: 오늘 열리는 장이면 「오늘」 — 예측 날이 한국 날짜로 오늘이면 오늘, 다음 날이면 내일, 더 뒤(주말 끼임)면 요일
  function kd(off){ var t = new Date(Date.now() + 9 * 3600e3 + (off || 0) * 864e5); return t.toISOString().slice(0, 10); }
  function dlab(d){ if (!d) return "다음 장"; if (d <= kd(0)) return "오늘(" + md(d) + ")"; if (d === kd(1)) return "내일(" + md(d) + ")";
    return "다음 장 " + ["일", "월", "화", "수", "목", "금", "토"][new Date(d + "T00:00:00Z").getUTCDay()] + "(" + md(d) + ")"; }
  // 확률 막대: 가운데 50, 왼쪽(파랑) 내릴 쪽 · 오른쪽(빨강) 오를 쪽
  function pbar(p, big){
    if (p == null) return '<div class="prb' + (big ? " big" : "") + '"><i class="pm" style="left:50%"></i></div>';
    var x = Math.min(95, Math.max(5, p * 100));
    return '<div class="prb' + (big ? " big" : "") + '"><i class="pf ' + (p >= 0.5 ? "u" : "d") + '" style="left:' + Math.min(50, x) + '%;width:' + Math.abs(x - 50) + '%"></i><i class="pm" style="left:' + x + '%"></i></div>';
  }

  // ⏱ 10/19 사용자 「이거 한국시각 뭐니… 일일이 못 하니」 — 기준 시각을 오늘/날짜로 분명히, 늦어지면 스스로 「늦어짐」 표시
  function stamp(D){
    var age = D.at ? (Date.now() - D.at) / 60000 : null, day = D.date && D.date !== kd(0) ? md(D.date) + " " : "";
    var s = "한국시각 " + day + e(D.t) + " 기준 · 매시간" + (D.lvT ? " · 열린 시장은 ⚡ " + e(D.lvT) + " 지금 등락으로 다시 계산" : "");
    if (age != null && age > 75) s += ' · <b class="dn">⏳ ' + Math.round(age / 60 * 10) / 10 + '시간째 안 바뀜 — 지킴이가 다시 돌려요</b>';
    return s;
  }
  var NEXT = {KR: "16:20", JP: "16:20", CN: "16:20", HK: "17:40", US: "다음 날 06:40"};
  function secStamp(mk, S){
    var wd = ["일", "월", "화", "수", "목", "금", "토"][new Date(S.last + "T00:00:00Z").getUTCDay()];
    var s = e(md(S.last)) + "(" + wd + ") 마감 기준";
    var wk = new Date(Date.now() + 9 * 3600e3).getUTCDay(); wk = wk > 0 && wk < 6;
    if (S.last < kd(0) && mk !== "US" && wk) s += " · 오늘 장은 마감 뒤 " + NEXT[mk] + " 반영";
    else if (mk === "US" && wk) s += " · 미국 마감 뒤 06:40 반영";
    return s;
  }

  // ⚡ 10/19: 열린 시장은 장중 나침반(10분마다)의 지금 등락으로 오늘 확률(p1)을 다시 계산 (problive.js) — 🎲 계산(매시간) 사이의 반전을 따라감
  function liveFix(D){
    if (!window.probLive || !D || !D.markets) return D;
    var ks = Object.keys(D.markets).filter(function(k){ return D.markets[k].open_now && D.markets[k].ic; });
    return Promise.all(ks.map(function(k){ return P("live_" + k.toLowerCase() + ".json").catch(function(){ return null; }); })).then(function(R){
      ks.forEach(function(k, i){ var lv = probLive(D.markets[k], R[i], D); if (!lv) return;
        var m = D.markets[k], old = m.p1;
        m.p1 = lv.p1; m.intra_chg = lv.chg; m.e1 = m.pb1 != null ? Math.round((lv.p1 - m.pb1) * 1000) / 10 : m.e1;
        m.lv = lv; D.lvT = lv.t;
        (m.methods || []).forEach(function(x){ if (x.k === "intra"){ x.ev = "⚡ " + lv.t + " 지금 " + m.ixn + " " + (lv.chg > 0 ? "+" : "") + lv.chg.toFixed(2) + "% · 장 남은 시간 " + Math.round(lv.rem * 100) + "% · 남은 흔들림 " + Math.round(lv.vr * 100) + "% · 하루 흔들림 " + (lv.sig * 100).toFixed(1) + "% → 다시 계산 " + Math.round(lv.p1 * 100) + "% (🎲 " + D.t + " 계산은 " + Math.round(old * 100) + "%)"; } });
      });
      return D;
    });
  }
  // 🔒 10/19 사용자 「확률이 개판」 → 실전 성적이 동전보다 확실히 낫기 전(20건↑·55%↑)엔 경고를 크게
  function warn(D){
    var d = D.score && D.score.all && D.score.all.d1 || {};
    if ((d.n || 0) >= 20 && (d.hit || 0) >= 55) return "";
    return '<div style="margin:8px 0 2px;padding:8px 10px;border-radius:10px;background:color-mix(in srgb,#ffb84d 22%,var(--panel));border:1px solid rgba(255,184,77,.6);font-size:13.5px;line-height:1.45">⚠️ <b>아직 동전보다 못함</b> — 실전 채점 다음 날 방향 ' + (d.n ? Math.round(d.hit / 100 * d.n) + '/' + d.n + ' 맞음 (' + Math.round(d.hit) + '%)' : '채점 전') + '. 아래 적중률(57~65%)은 과거 되짚기 성적이고 실전은 아직 못 따라와요 — 이 숫자로 사고팔지 마세요.</div>';
  }
  function ep(v){ return v == null ? "–" : (v > 0 ? "+" : v < 0 ? "−" : "±") + Math.abs(v).toFixed(1) + "%p"; }
  // 10/15 사용자 「확률에 마이너스가 말이 되니?」 — 큰 숫자는 확률 그대로(31%), 평소와의 차이는 말로(「평소 54%보다 23%p 낮음」)
  function gapTx(v, pb){ if (v == null) return ""; var a = Math.abs(v).toFixed(Math.abs(v) >= 10 ? 0 : 1); if (Math.abs(v) < 0.5) return "평소" + (pb != null ? "(" + pc(pb) + ")" : "") + "와 비슷"; return (pb != null ? "평소 " + pc(pb) + "보다 " : "평소보다 ") + a + "%p " + (v > 0 ? "높음 ▲" : "낮음 ▼"); }
  // 10/31 사용자 A5: 칸마다 「▼28%p」 대신 말로 — 평소보다 높음/낮음/평소쯤
  function arw(v){ return v == null ? "" : Math.abs(v) < 3 ? "평소쯤" : Math.abs(v) < 10 ? (v > 0 ? "평소보다 ↑" : "평소보다 ↓") : (v > 0 ? "평소보다 크게 ↑" : "평소보다 크게 ↓"); }
  function ecls(v){ return v == null ? "" : v >= 1 ? "up" : v <= -1 ? "dn" : ""; }
  var STR = {"강": "🔥 강한 신호", "보통": "👀 보통 신호", "약": "💤 약한 신호"};
  // 확대 막대: 40~60% 구간만 그려 작은 차이도 보이게 (평소 = 점선)
  function zbar(p, pb){
    // 10/15: 닻(간밤 미국·선물·장중)으로 40~60% 밖까지 가면 막대도 10~90% 로 넓힘
    var wide = p < 0.4 || p > 0.6, lo = wide ? 0.1 : 0.4, sp = wide ? 0.8 : 0.2;
    var z = function(v){ return Math.min(100, Math.max(0, (v - lo) / sp * 100)); };
    var x = z(p), b = z(pb);
    return '<div class="zb"><i class="zf ' + (p >= pb ? "u" : "d") + '" style="left:' + Math.min(x, b) + '%;width:' + Math.abs(x - b) + '%"></i><i class="zn" style="left:' + b + '%"></i><i class="pm" style="left:' + x + '%"></i></div><div class="zl"><span>' + (wide ? "10%" : "40%") + '</span><span>평소 ' + pc(pb) + '</span><span>' + (wide ? "90%" : "60%") + '</span></div>';
  }
  function votes(v){
    if (!v) return "";
    var dots = new Array(v.up + 1).join('<i class="u"></i>') + new Array(v.flat + 1).join('<i></i>') + new Array(v.down + 1).join('<i class="d"></i>');
    return '<div class="pv"><span class="pvd">' + dots + '</span><small>방법 ' + (v.up + v.down + v.flat) + '개 중 <b class="up">' + v.up + ' 오를 쪽</b> · <b class="dn">' + v.down + ' 내릴 쪽</b> · ' + v.flat + ' 평소</small></div>';
  }
  function tailCard(m){
    if (!m.tail) return "";
    var mx = Math.max.apply(null, m.tail.map(function(t){ return Math.max(t.now, t.norm); }).concat([0.05]));
    return '<div class="sub2">📏 큰 움직임 확률 <span class="mut">지금 변동성 ' + m.sig_now + '% vs 평소 ' + m.sig_norm + '% (하루 1σ)</span></div>' + m.tail.map(function(t){
      var r = t.norm ? t.now / t.norm : 1, up = /오름/.test(t.k);
      return '<div class="pt"><div class="row"><span>' + e(t.k) + '</span><b class="' + (up ? "up" : "dn") + '">' + pc(t.now) + '</b></div>' +
        '<div class="ptb"><i class="' + (up ? "u" : "d") + '" style="width:' + (t.now / mx * 100).toFixed(0) + '%"></i><i class="ptn" style="left:' + (t.norm / mx * 100).toFixed(0) + '%"></i></div>' +
        '<small class="mut">평소 ' + pc(t.norm) + ' · <b class="' + (r >= 1.15 ? (up ? "up" : "dn") : "") + '">' + (r >= 1.05 ? "평소의 " + r.toFixed(1) + "배" : r <= 0.95 ? "평소보다 적음 (" + r.toFixed(1) + "배)" : "평소와 비슷") + '</b></small></div>'; }).join("");
  }
  function strip(D){
    return '<div class="pr5">' + ORDER.filter(function(k){ return D.markets[k]; }).map(function(k){ var m = D.markets[k];
      return '<button class="pr5c' + (k === SEL ? " on" : "") + '" data-m="' + k + '"><b>' + m.flag + ' ' + e(m.name) + '</b>' +
        '<span class="pr5p ' + ecls(m.e1) + '">' + Math.round(m.p1 * 100) + '<small>%</small></span>' + (m.pb1 != null ? zbar(m.p1, m.pb1).split('<div class="zl">')[0] : pbar(m.p1)) + '<small class="' + ecls(m.e1) + '">' + (Math.abs(m.e1) < 3 ? "평소쯤" : m.e1 > 0 ? "평소↑" : "평소↓") + '</small></button>'; }).join("") + '</div>';
  }
  // 10/14 사용자 「각 시장 밑에 오르고 내릴 섹터 확률도, 그 안에 종목들 확률도」 → archive/x/prob_sec.json (prob_sec.yml)
  var SECX = null, SOPEN = {}, SALL = {}, REGM = null;
  // 🌡️ 10/28 사용자 「미국 지수 차트를 보면 극공포가 맞아? 바꿔야 하지 않을까」 → 우리 점수는 「지난 1년 안 순위」라 말을 상대 표현으로.
  //   CNN·크립토 공포·탐욕은 원래 이름(극공포 등) 그대로. 숫자·구간·연구 표 계산은 안 바꿈.
  function OL(x){ return x < 20 ? "1년 중 가장 움츠림" : x < 40 ? "평소보다 조심" : x < 60 ? "보통" : x < 80 ? "평소보다 들뜸" : "1년 중 가장 들뜸"; }
  function OS(x){ return x < 20 ? "가장 움츠림" : x < 40 ? "조심" : x < 60 ? "보통" : x < 80 ? "들뜸" : "가장 들뜸"; }
  function OK(k){ return String(k || "").replace(/^극공포/, "1년 중 가장 움츠림").replace(/^공포/, "평소보다 조심").replace(/^중립/, "보통").replace(/^극탐욕/, "1년 중 가장 들뜸").replace(/^탐욕/, "평소보다 들뜸"); }
  function lg(p){ p = Math.min(0.9999, Math.max(0.0001, p)); return Math.log(p / (1 - p)); }
  function sgm(x){ return 1 / (1 + Math.exp(-x)); }
  // 😱 심리 지표 카드 — 우리 공포·탐욕 게이지 · 항목 · 연구 표(구간별 다음 5일 상승 확률)
  function rtable(tb, now, ours){
    if (!tb || !tb.length) return "";
    return '<table class="pr-tb"><tr><th>구간</th><th>날수</th><th>내일↑</th><th>5일↑</th><th>5일 중앙값</th></tr>' + tb.map(function(r){
      return '<tr' + (r.now ? ' class="now"' : '') + '><td>' + (r.now ? '👉 ' : '') + e(ours ? OK(r.k) : r.k) + '</td><td>' + (r.n || 0).toLocaleString() + '</td><td class="' + tcls(r.p1) + '">' + pc(r.p1) + '</td><td class="' + tcls(r.p5) + '">' + pc(r.p5) + '</td><td class="' + cls(r.m5) + '">' + (r.m5 != null ? sg(r.m5, 2) : "–") + '</td></tr>'; }).join("") + '</table>';
  }
  function sentiCard(m, D){
    var R = m.research || {}, S = R.senti;
    if (!S || S.now == null) return "";
    var v = S.now, lab = OL(v), col = v < 20 ? "#2f6fd0" : v < 40 ? "#5b8fd8" : v < 60 ? "#6b7385" : v < 80 ? "#d98a7a" : "#e05555";
    var B = SECX && SECX.markets && SECX.markets[m.mk] && SECX.markets[m.mk].breadth, op = OPEN["_s" + m.mk];
    // 10/15 사용자 「공포탐욕이 왜 미국만 나와? 다른 시장도 다 나오게」 → 맨 위에 5개 시장 공포·탐욕 한 줄 (누르면 그 시장)
    var fl = OS;
    var fc = function(x){ return x < 20 ? "#2f6fd0" : x < 40 ? "#5b8fd8" : x < 60 ? "#6b7385" : x < 80 ? "#d98a7a" : "#e05555"; };
    var strip5 = '<div class="sg5">' + ORDER.filter(function(k){ return D.markets[k] && D.markets[k].research && D.markets[k].research.senti && D.markets[k].research.senti.now != null; }).map(function(k){
        var mm = D.markets[k], x = Math.round(mm.research.senti.now);
        return '<button class="sg5c' + (k === m.mk ? " on" : "") + '" data-m="' + k + '"><small>' + mm.flag + ' ' + e(mm.name) + '</small><b style="color:' + fc(x) + '">' + x + '</b><em style="color:' + fc(x) + '">' + fl(x) + '</em>' +
          '<i class="sg5b"><i style="left:' + x + '%"></i></i></button>'; }).join("") + '</div>';
    var h = '<section class="card"><h3>🌡️ 시장 심리 온도 <span class="mut">지난 1년과 비교 · 매시간</span></h3>' + strip5 +
      '<div class="sub2" style="margin-top:4px">' + m.flag + ' ' + e(m.name) + ' 자세히</div>' +
      '<div class="sg-w"><div class="sg-n" style="color:' + col + '">' + Math.round(v) + '</div><div style="flex:1"><b style="color:' + col + '">' + lab + '</b>' +
      '<div class="sg-b"><i style="left:' + v + '%"></i></div><div class="zl"><span>움츠림</span><span>보통</span><span>들뜸</span></div></div></div>' +
      (function(){ var w = S.how || {}, fl = function(x){ return x < 20 ? "극공포" : x < 40 ? "공포" : x < 60 ? "중립" : x < 80 ? "탐욕" : "극탐욕"; }, t = [];   // 10/15 계산 풀이 + CNN 원본
        var rg = REGM && REGM[m.mk], up = rg && /상승|우위/.test(rg.label || "");
        if (up && v < 40) t.push('💡 ' + m.flag + ' 지수 흐름은 <b>' + e(rg.label) + '</b>인데 심리는 ' + (v < 20 ? '지난 1년 중 가장 식어 있어요' : '평소보다 조심스러워요') + ' — 무섭다기보다 <b>쉬어 가는 중</b>이라는 뜻이에요');
        else if (rg && /하락|약세/.test(rg.label || "") && v >= 60) t.push('💡 ' + m.flag + ' 지수 흐름은 <b>' + e(rg.label) + '</b>인데 심리는 평소보다 들떠 있어요 — 반등 기대가 앞선 상태예요');
        t.push('<span class="mut">이 점수는 「지금이 무서운가」가 아니라 <b>지난 1년 안에서 몇 번째로 들떠 있나</b>예요. 강하게 오른 해엔 잠깐 쉬어도 낮게 나와요.</span>');
        if (w.avg != null) t.push(m.mk === "US" ? '아래 ' + (S.parts || []).length + '개 항목 평균 <b>' + w.avg + '</b>점 → 지난 1년 중 몇 % 자리인지로 바꾸면 <b>' + Math.round(v) + '</b>점'
          : '🇺🇸 미국 심리 <b>' + w.us + '</b> · ' + m.flag + ' ' + e(m.name) + ' 자체 <b>' + w.loc + '</b> → 미국 1/3 · 자기 시장 2/3로 섞어 지난 1년 중 몇 % 자리인지로 바꾸면 <b>' + Math.round(v) + '</b>점');
        if (w.asof) t.push('<span class="mut">항목 기준일 ' + md(w.asof) + ' 마감 — 모든 항목 자료가 다 들어온 마지막 날</span>');
        if (m.open_now && m.intra_chg != null && Math.abs(m.intra_chg) >= 1.5) t.push('⚠️ 오늘 장중 ' + (m.intra_chg > 0 ? '+' : '') + m.intra_chg.toFixed(1) + '%는 아직 안 들어갔어요 — 마감 뒤 다시 계산하면 ' + (m.intra_chg < 0 ? '움츠림 쪽으로' : '들뜸 쪽으로') + ' 움직여요');
        if (w.cnn != null) t.push('📰 CNN 공식 공포·탐욕(미국) <b>' + w.cnn + '</b> (' + fl(w.cnn) + ' · ' + md(w.cnn_d) + ')');
        return t.length ? '<div class="sg-how">' + t.join('<br>') + '</div>' : ''; })() +
      '<div class="sg-ps">' + (S.parts || []).map(function(p){ var loc = /^자기 |코스닥\/코스피|\(반대 · 자국|엔 약세/.test(p.k); return '<div><small>' + (m.mk === "US" ? "🇺🇸 " : loc ? m.flag + " " : "🇺🇸 ") + e(p.k.replace(/^자기 지수/, (m.ixn || "") )) + '</small><span class="xbar" style="flex:1"><i style="width:' + p.v + '%;background:' + (p.v >= 60 ? "var(--up)" : p.v <= 40 ? "var(--down)" : "#6b7385") + '"></i></span><b>' + p.v + '</b></div>'; }).join("") + '</div>' +
      '<div class="sub2">📚 연구: 심리 구간별 그 뒤 성적 <span class="mut">' + e(m.ixn) + ' · ' + e(S.since || "") + '~</span></div>' + rtable(S.table, null, true) +
      '<button class="fold pr-f' + (op ? " open" : "") + '" data-f="_s' + m.mk + '">🔬 다른 심리·폭 지표 연구 표 <i class="fchev">▾</i></button><div style="' + (op ? "" : "display:none") + '">' +
      (R.vterm ? '<div class="sub2">🌡️ VIX ÷ VIX3M 구간별</div>' + rtable(R.vterm) : '') +
      (R.cnn ? '<div class="sub2">📰 CNN 공포·탐욕 구간별</div>' + rtable(R.cnn) : '') +
      (R.crypto ? '<div class="sub2">🪙 크립토 공포·탐욕 구간별 (2018~)</div>' + rtable(R.crypto) : '') +
      (B && B.table ? '<div class="sub2">📊 50일선 위 종목 비율 구간별 (최근 2년 · 지금 ' + B.pct50 + '%' + (B.thrust ? ' · ⚡ 쯔바이크 신호' : '') + ')</div>' + rtable(B.table) : '') + '</div>' +
      '<p class="note">' + e(D.senti_how || "") + ' 항목 막대 = 1년 중 백분위(높을수록 탐욕).</p></section>';
    return h;
  }
  function secCard(mk, M0){
    var S = SECX && SECX.markets && SECX.markets[mk];
    if (!S) return '<section class="card"><h3>🧭 섹터·종목 확률</h3><p class="note" style="margin:0">아직 계산 전이에요 — 하루 4번(장 마감 뒤) 새로 계산해요.</p></section>';
    // 섹터·종목 확률 = 위 시장 카드의 일주일 확률(M0.p5) + 그 섹터·종목만의 기울기(d5) → 시장 카드와 같은 「평소」(M0.pb5) 기준
    var b5 = M0 && M0.pb5 != null ? M0.pb5 : S.base.y5, mp5 = M0 && M0.p5 != null ? M0.p5 : S.base.y5, br = S.base.yr5, all = SALL[mk], secs = S.sectors || [];
    var ab = function(x){ return x.d5 != null ? sgm(lg(mp5) + x.d5) : x.p5; };
    var show = all || secs.length <= 9 ? secs : secs.slice(0, 5).concat([null]).concat(secs.slice(-3));
    var row = function(x){
      if (!x) return '<div class="ps-gap">⋯</div>';
      var a5 = ab(x), e5 = (a5 - b5) * 100, er = (x.pr5 - br) * 100, op = SOPEN[mk + x.k];
      return '<div class="ps-r' + (op ? " open" : "") + '" data-sk="' + e(x.k) + '"><div class="ps-h"><span class="hm-i">' + x.icon + '</span><b>' + e(x.name) + '</b><small class="mut">' + x.n + '종목</small>' +
        '<span class="ps-v"><b class="' + ecls(e5) + '">' + pc(a5) + '</b><small class="' + ecls(e5) + '">' + arw(e5) + '</small></span><i class="fchev">▾</i></div>' +
        '<div class="ps-bar">' + zbar(a5, b5).split('<div class="zl">')[0] + '</div>' +
        '<small class="ps-sub">시장보다 나을 확률 <b class="' + ecls(er) + '">' + pc(x.pr5) + '</b> (평소 ' + pc(br) + ') · 지난 5일 ' + sg(x.r5) + (x.mom ? ' · 🔁 ' + e(x.mom) : '') + '</small>' +
        (op ? '<div class="ps-st">' + x.st.map(function(t, i){ var te = (ab(t) - b5) * 100, tr = (t.pr5 - br) * 100;
          return '<a class="ps-t" href="javascript:openOP(\'' + e(t.s).replace(/'/g, "") + '\')"><span class="ps-tn"><b>' + e(t.n) + '</b><em class="tk">' + e(V.cd ? V.cd(t.s) : t.s) + '</em></span>' +
            '<span class="ps-tv"><b class="' + ecls(te) + '">' + pc(ab(t)) + '</b><small><span class="' + ecls(te) + '">' + arw(te) + '</span> · 시장보다 나을 <span class="' + ecls(tr) + '">' + pc(t.pr5) + '</span></small></span></a>'; }).join("") + '</div>' : '') + '</div>';
    };
    var RL = {"믿을 만": ["✅", "s3"], "약함": ["👀", "s2"], "동전 수준": ["💤", "s1"]}[S.rel] || ["", ""];
    return '<section class="card"><h3>🧭 섹터·종목 확률 <span class="mut">일주일 · 평소보다 · ' + secStamp(mk, S) + '</span></h3>' +
      (S.rel ? '<div class="pr-sg"><span class="pr-bd ' + RL[1] + '">' + RL[0] + ' 모델 ' + e(S.rel) + '</span><small class="mut">검증 AUC ' + S.auc.y5 + (S.rel === "믿을 만" ? '' : ' — 확률을 평소 쪽으로 눌러 보여 줘요(순위는 그대로)') + '</small></div>' : '') +
      show.map(row).join("") +
      (secs.length > 9 ? '<button class="fold ps-all" data-mk="' + mk + '">' + (all ? "줄이기 ▴" : "섹터 " + secs.length + "개 모두 보기 ▾") + '</button>' : '') +
      '<p class="note">큰 숫자 = 그 섹터(종목)가 일주일 뒤 오를 확률이 평소(' + pc(b5) + ')보다 얼마나 높고 낮은지 — 위 시장 확률(' + pc(mp5) + ')에 그 섹터·종목만의 기울기를 더한 값. 섹터를 누르면 종목 — 「시장보다」 높은 순. ' + S.n + '종목 · 검증 AUC 일주일 ' + (S.auc.y5 != null ? S.auc.y5 : "–") + ' · 시장 대비 ' + (S.auc.yr5 != null ? S.auc.yr5 : "–") + ' (0.5 = 동전, 0.55 넘으면 쓸 만)</p></section>';
  }
  function mcard(m, D){
    var open = OPEN[m.mk];
    var h = '<section class="card pr-c"><h3>' + m.flag + ' ' + e(m.name) + ' <span class="mut">' + e(m.ixn) + ' ' + V.fmt(m.last) + ' <b class="' + cls(m.chg) + '">' + sg(m.chg, 2) + '</b> · ' + md(m.base_date) + (m.open_now ? ' 장중' : ' 마감') + ' 기준' + (m.filled ? ' <span title="야후 일봉이 늦어 장중 나침반의 마감 값으로 채움">📅</span>' : '') + '</span></h3>' +
      (m.strength ? '<div class="pr-sg"><span class="pr-bd s' + ({"강": 3, "보통": 2, "약": 1}[m.strength]) + '">' + STR[m.strength] + '</span>' + votes(m.votes) + '</div>' : '') +
      (function(){ var c = (m.comb || {}).p1 || {}, a = c.anchor && (m.methods || []).filter(function(x){ return x.k === c.anchor; })[0]; if (!a) return '';   // 🧭 10/15 닻
        return '<div class="pr-anc">' + a.ic + ' <b>닻 ' + pc(c.p_anchor) + '</b> — ' + e(a.ev) + (c.dev ? ' · 나머지 방법 ' + (c.dev > 0 ? '+' : '') + (c.dev * 25).toFixed(1) + '%p 남짓' : '') + '</div>'; })() +
      '<div class="pr-two"><div><small>' + dlab(m.next_day) + ' · 오를 확률</small><b class="' + ecls(m.e1) + '">' + pc(m.p1) + '</b><em><span class="pr-gp ' + ecls(m.e1) + '">' + gapTx(m.e1, m.pb1) + '</span> · 68% 폭 ' + sg(m.band1[0]) + ' ~ ' + sg(m.band1[1]) + '</em>' + (m.pb1 != null ? zbar(m.p1, m.pb1) : pbar(m.p1, 1)) + '</div>' +
      '<div><small>일주일(5일) · 오를 확률</small><b class="' + ecls(m.e5) + '">' + pc(m.p5) + '</b><em><span class="pr-gp ' + ecls(m.e5) + '">' + gapTx(m.e5, m.pb5) + '</span> · 68% 폭 ' + sg(m.band5[0]) + ' ~ ' + sg(m.band5[1]) + '</em>' + (m.pb5 != null ? zbar(m.p5, m.pb5) : pbar(m.p5, 1)) + '</div></div>' +
      tailCard(m) +
      (m.mk === "KR" && window.twinKR ? '<div id="twinkr"></div>' : '') +   // 🧲 10/21 A10/21-2 닮은 날 — 한국은 상태 한 줄 자리에 (twin.js)
      (m.mk === "KR" && window.twinKR ? '' : '<p class="note pr-st">' + e(m.state) + (m.widen > 1 ? ' · 📣 이벤트로 폭 ×' + m.widen : '') + (m.open_now ? ' · 장중이라 오늘 봉이 아직 움직여요 — 마감 뒤 확률이 기록·채점돼요' : '') + '</p>');
    // 방법들 (접기)
    // 10/14 밤: 방법을 묶음(가격·심리·자금·선행·폭·일정·판단·모델)으로 · 평소 대비 기울기 · 믿음(표본 크기)
    var GO = ["가격", "심리", "자금", "선행", "폭·수급", "일정", "판단", "모델"], GI = {"가격": "📈", "심리": "😱", "자금": "💵", "선행": "🛰️", "폭·수급": "📊", "일정": "🗓️", "판단": "🧠", "모델": "🤖"};
    var mrow = function(x){
      var has = x.p1 != null && x.w, dv = has ? (x.p1 - m.pb1) * 100 : null;
      return '<div class="pr-m' + (has ? "" : " off") + '"><div class="pr-mh"><span class="hm-i">' + x.ic + '</span><b>' + e(x.name) + '</b>' +
        (has ? '<span class="pr-mp"><span class="' + ecls(dv) + '">' + pc(x.p1) + '</span><small><span class="' + ecls(dv) + '">' + arw(dv) + '</span> · 주 ' + pc(x.p5) + '</small></span>' : '<span class="pr-mp mut">기울기 없음</span>') + '</div>' +
        (has ? zbar(x.p1, m.pb1).split('<div class="zl">')[0] : '') + '<small class="pr-ev">' + e(x.ev) + '</small>' +
        (has && x.eb != null ? '<small class="pr-eb">믿음 ' + Math.round(x.eb * 100) + '%' + (x.n ? ' (표본 ' + x.n.toLocaleString() + '일)' : '') + ' · 가중치 ×' + (x.w_eff != null ? x.w_eff : x.w) + '</small>' : '') + '</div>';
    };
    var grp = {};
    (m.methods || []).forEach(function(x){ (grp[x.grp || "기타"] = grp[x.grp || "기타"] || []).push(x); });
    var rows = GO.concat(Object.keys(grp).filter(function(k){ return GO.indexOf(k) < 0; })).filter(function(k){ return grp[k]; }).map(function(k){
      var xs = grp[k], act = xs.filter(function(x){ return x.p1 != null && x.w; }), up = act.filter(function(x){ return x.p1 > m.pb1 + 0.005; }).length, dn = act.filter(function(x){ return x.p1 < m.pb1 - 0.005; }).length;
      return '<div class="pr-g"><b>' + (GI[k] || "•") + ' ' + e(k) + '</b><small class="mut">' + act.length + '개 · <span class="up">↑' + up + '</span> <span class="dn">↓' + dn + '</span></small></div>' + xs.map(mrow).join("");
    }).join("");
    var CB = m.comb && m.comb.p1;
    h += '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="' + m.mk + '">🧩 왜 이 숫자인가 — 방법 ' + (m.methods || []).length + '가지 <i class="fchev">▾</i></button>' +
      '<div class="pr-ms" style="' + (open ? "" : "display:none") + '">' +
      (CB ? '<div class="pr-cb">⚖️ 근거 <b>' + CB.m + '</b>개 → 서로 겹치는 정도를 빼면 독립 근거 <b>' + CB.meff + '</b>개 몫 → <b class="' + ecls(m.e1) + '">' + gapTx(m.e1, m.pb1) + '</b></div>' : '') +
      rows + '<p class="note">큰 숫자 = 그 방법만 보면 평소보다 몇 %p. 「믿음」= 표본이 많을수록 높음 (n ÷ (n+150)) — 표본이 적은 극단 통계가 혼자 흔들지 못하게. 결합은 아래 📖 설명의 ⚖️ 칸.</p></div>';
    // 채점 (시장별)
    var S = D.score && D.score[m.mk];
    if (S && (S.d1.n || S.d5.n)){
      h += '<div class="sub2">🎯 이 시장 채점 <span class="mut">마감 뒤 실제 결과로</span></div><div class="x4">' +
        '<div><small>내일 예측</small><b>' + (S.d1.n ? S.d1.hit + '%' : '–') + '</b><small class="mut">' + S.d1.n + '건 · 브라이어 ' + (S.d1.brier != null ? S.d1.brier : '–') + '</small></div>' +
        '<div><small>일주일 예측</small><b>' + (S.d5.n ? S.d5.hit + '%' : '–') + '</b><small class="mut">' + S.d5.n + '건 · 브라이어 ' + (S.d5.brier != null ? S.d5.brier : '–') + '</small></div></div>' +
        (S.recent && S.recent.length ? '<div class="pr-rc">' + S.recent.slice().reverse().map(function(r){
          return '<span>' + md(r.d) + ' <b class="' + tcls(r.p1) + '">' + pc(r.p1) + '</b> → ' + (r.r1 != null ? '<b class="' + cls(r.r1) + '">' + sg(r.r1) + '</b>' : '<i class="mut">대기</i>') +
            ' · 주 <b class="' + tcls(r.p5) + '">' + pc(r.p5) + '</b> → ' + (r.r5 != null ? '<b class="' + cls(r.r5) + '">' + sg(r.r5) + '</b>' : '<i class="mut">대기</i>') + '</span>'; }).join("") + '</div>' : '');
    } else h += '<p class="note">🎯 채점은 마감 뒤 첫 기록부터 쌓여요 — 내일 예측은 다음 날, 일주일 예측은 5거래일 뒤 실제 결과와 맞춰 봐요.</p>';
    return h + '</section>';
  }
  function howCard(D){
    var open = OPEN._how, last = null;
    return '<button class="fold pr-f' + (open ? " open" : "") + '" data-f="_how">📖 시장확률이란 — 어떻게 계산하나 (' + (D.how || []).length + '가지) <i class="fchev">▾</i></button>' +
      '<section class="card pr-how" style="' + (open ? "" : "display:none") + '"><p class="note" style="margin:0 0 10px">' + e(D.note || "") + '</p>' +
      '<p class="note" style="margin:0 0 6px"><b>공통 원리</b> — 모든 지표는 같은 방식으로 확률이 돼요: 「지금과 같은 구간이었던 과거 날들의 다음 날·5일 뒤 상승 비율」. 지어낸 가중치가 아니라 이 앱이 매시간 과거 자료로 다시 세는 숫자예요.</p>' +
      (D.how || []).map(function(x, i){ var g = x.length > 2 ? x[0] : "", t = x.length > 2 ? x[1] : x[0], d = x.length > 2 ? x[2] : x[1];
        var hd = g && g !== last ? '<div class="pr-g"><b>' + e(g) + '</b></div>' : ''; last = g;
        return hd + '<div class="pr-hw"><span class="rk">' + (i + 1) + '</span><div><b>' + e(t) + '</b><small>' + e(d) + '</small></div></div>'; }).join("") +
      '<p class="note">브라이어 점수 = (확률 − 결과)² 의 평균. 0 이면 완벽, 0.25 면 늘 50% 라고 한 것과 같음. 「오를 쪽」이라 한 날들이 실제로 그만큼 올랐는지(보정표)는 아래 채점에서.</p></section>';
  }
  function allScore(D){
    var A = D.score && D.score.all; if (!A || !(A.d1.n || A.d5.n)) return '';
    var bk = function(s){ return (s.buckets || []).map(function(b){ return '<span>' + e(b.k) + ' <small>' + b.n + '건</small> 말한 ' + b.pred + '% → 실제 ' + b.real + '%</span>'; }).join(""); };
    return '<section class="card"><h3>🎯 전체 채점 <span class="mut">5개 시장 합산</span></h3><div class="x4">' +
      '<div><small>내일 적중</small><b>' + (A.d1.n ? A.d1.hit + '%' : '–') + '</b><small class="mut">' + A.d1.n + '건</small></div><div><small>내일 브라이어</small><b>' + (A.d1.brier != null ? A.d1.brier : '–') + '</b><small class="mut">0.25 = 동전</small></div>' +
      '<div><small>일주일 적중</small><b>' + (A.d5.n ? A.d5.hit + '%' : '–') + '</b><small class="mut">' + A.d5.n + '건</small></div><div><small>일주일 브라이어</small><b>' + (A.d5.brier != null ? A.d5.brier : '–') + '</b><small class="mut"></small></div></div>' +
      (A.d1.buckets && A.d1.buckets.length ? '<div class="sub2">보정표 (내일)</div><div class="pr-rc">' + bk(A.d1) + '</div>' : '') + '</section>';
  }
  function draw(D){ window.__probD = D;   // 📨 시장확률 한 장이 화면과 같은 값(장중 덧입힌 값)을 쓰게
    var b = document.getElementById("prbody"); if (!b) return;
    var ks = ORDER.filter(function(k){ return D.markets[k]; });
    if (!ks.length){ b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률 자료가 아직 없어요.</div>'; return; }
    if (!SEL || !D.markets[SEL]) SEL = ks[0];
    var h = '<section class="card"><h3>🎲 다음 장 · 오를 확률 <span class="mut">' + stamp(D) + '</span></h3>' + strip(D) + warn(D) +
      '<p class="note">큰 숫자 = 다음 장에서 그 시장이 어제보다 오를 확률. ▲▼ = 「평소」(2000년 이후 오른 날 비율)보다 얼마나 높고 낮은지. 🧭 10/15부터 <b>이미 아는 정보를 닻</b>으로 써요 — 아시아는 간밤 미국 장, 미국은 선물 갭, 장이 열려 있으면 지금 등락과 남은 시간. 2012년 이후 걸어가며 검증한 적중률: 한국 62% · 일본 65% · 홍콩 60% · 중국 57% · 미국 64% (예전 52~54%). 60% 넘거나 40% 밑인 날은 67~79% 맞았어요.</p></section>';
    h += mcard(D.markets[SEL], D) + sentiCard(D.markets[SEL], D) + secCard(SEL, D.markets[SEL]) + allScore(D) + howCard(D);
    b.innerHTML = h;
    if (SEL === "KR" && window.twinKR) try { twinKR(document.getElementById("twinkr"), D.markets.KR); } catch(x) {}   // 🧲 A10/21-2
    [].forEach.call(b.querySelectorAll(".pr5c[data-m]"), function(x){ x.onclick = function(){ SEL = x.dataset.m; draw(D); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    [].forEach.call(b.querySelectorAll(".sg5c[data-m]"), function(x){ x.onclick = function(){ var y = x.getBoundingClientRect().top; SEL = x.dataset.m; draw(D);   // 공포·탐욕 띠: 그 자리 그대로 시장만 바꿈
      holdAt('.sg5c[data-m="' + SEL + '"]', y); }; });
    [].forEach.call(b.querySelectorAll(".ps-r .ps-h"), function(x){ x.onclick = function(){ var k = SEL + x.parentNode.dataset.sk; SOPEN[k] = !SOPEN[k]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".ps-all"), function(x){ x.onclick = function(){ SALL[x.dataset.mk] = !SALL[x.dataset.mk]; var y = window.scrollY; draw(D); window.scrollTo(0, y); }; });
    [].forEach.call(b.querySelectorAll(".pr-f[data-f]"), function(x){ x.onclick = function(){ var k = x.dataset.f, nx = x.nextElementSibling; OPEN[k] = !OPEN[k]; x.classList.toggle("open", OPEN[k]); if (nx) nx.style.display = OPEN[k] ? "" : "none"; try { localStorage.setItem("probopen", JSON.stringify(OPEN)); } catch(z) {} }; });
  }
  window.probView = function(){ return '<div id="prbody"><div class="loading">확률 계산 자료 불러오는 중…</div></div>'; };
  window.probInit = function(){
    P("prob_sec.json").then(function(j){ SECX = j; }).catch(function(){}).then(function(){ return P("regime_mk.json").then(function(j){ var ms = j && j.markets; REGM = {};
      (ms ? (ms.length ? ms : Object.keys(ms).map(function(k){ return ms[k]; })) : []).forEach(function(x){ if (x && x.mk) REGM[x.mk] = x; }); }).catch(function(){}); }).then(function(){ return P("prob.json"); }).then(liveFix).then(draw).catch(function(){ var b = document.getElementById("prbody"); if (b) b.innerHTML = '<div class="empty"><div class="big">🎲</div>시장확률이 아직 안 올라왔어요.<br>다음 시간 계산 때 채워져요.</div>'; });
  };
  (function(){ var st = document.createElement("style"); st.textContent =
    ".pr5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}" +
    ".pr5c{display:flex;flex-direction:column;gap:3px;align-items:stretch;text-align:left;border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 5px;font:inherit;cursor:pointer;min-width:0}" +
    ".pr5c.on{outline:2px solid var(--acc,#7c9cff)}.pr5c b{font-size:12.5px;white-space:nowrap}.pr5c small{font-size:12.5px;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}" +
    ".pr5p{font-size:16px;font-weight:800;white-space:nowrap}.pr5p small{font-size:12.5px;font-weight:600;margin-left:1px}.pr5p.up{color:var(--up)}.pr5p.dn{color:var(--down)}" +
    ".prb{position:relative;height:6px;border-radius:3px;background:rgba(124,156,255,.22);overflow:visible;margin:3px 0}.prb.big{height:10px;margin:8px 0 2px}" +
    ".prb:before{content:'';position:absolute;left:50%;top:-2px;bottom:-2px;width:1px;background:var(--sub);opacity:.6}" +
    ".prb .pf{position:absolute;top:0;height:100%;border-radius:3px}.prb .pf.u{background:var(--up)}.prb .pf.d{background:var(--down)}" +
    ".prb .pm{position:absolute;top:50%;width:10px;height:10px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.prb.big .pm{width:14px;height:14px}" +
    ".pr-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.pr-two>div{background:var(--panel2,rgba(255,255,255,.03));border-radius:12px;padding:10px}.pr-two small{display:block;font-size:12.5px;color:var(--sub)}" +
    ".pr-two b{display:block;font-size:30px;font-weight:800;line-height:1.15;margin:2px 0}.pr-two b.up{color:var(--up)}.pr-two b.dn{color:var(--down)}.pr-two em{display:block;font-style:normal;font-size:12.5px;color:var(--sub)}" +
    ".pr-st{margin-top:10px}.pr-f{margin:12px 0 0;display:flex;justify-content:space-between;align-items:center;cursor:pointer}.pr-f .fchev{transition:transform .15s;font-style:normal}.pr-f.open .fchev{transform:rotate(180deg)}" +
    ".pr-ms{margin-top:8px}.pr-m{padding:9px 2px;border-bottom:1px solid var(--line)}.pr-m:last-of-type{border:0}.pr-m.off{opacity:.6}" +
    ".pr-mh{display:flex;align-items:center;gap:7px;font-size:13.5px}.pr-mh .hm-i{font-size:16px}.pr-mp{margin-left:auto;font-weight:800;font-size:14px}.pr-mp small{font-weight:500;color:var(--sub);margin-left:5px}.pr-mp .up{color:var(--up)}.pr-mp .dn{color:var(--down)}.pr-w{font-size:12.5px}" +
    ".pr-ev{display:block;font-size:12.5px;color:var(--sub);line-height:1.5;margin-top:3px;word-break:keep-all}" +
    ".pr-rc{display:flex;flex-direction:column;gap:4px;font-size:12.5px;margin-top:6px}.pr-rc span{padding:5px 8px;border-radius:8px;background:var(--panel2,rgba(255,255,255,.03))}.pr-rc .up{color:var(--up)}.pr-rc .dn{color:var(--down)}" +
    ".zb{position:relative;height:10px;border-radius:5px;background:rgba(124,156,255,.18);margin:8px 0 2px}.pr5c .zb{height:6px;margin:3px 0}" +
    ".zb .zf{position:absolute;top:0;height:100%;border-radius:5px}.zb .zf.u{background:var(--up)}.zb .zf.d{background:var(--down)}" +
    ".zb .zn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--sub)}" +
    ".zb .pm{position:absolute;top:50%;width:12px;height:12px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}.pr5c .zb .pm{width:9px;height:9px}" +
    ".zl{display:flex;justify-content:space-between;font-size:12.5px;color:var(--sub)}" +
    ".sg-how{font-size:12.5px;line-height:1.55;color:var(--sub);background:var(--panel2,#2a3142);border-radius:10px;padding:7px 10px;margin:-4px 0 12px}.sg-how b{color:var(--text)}" +
    ".pr-gp{font-weight:800}.pr-gp.up{color:var(--up)}.pr-gp.dn{color:var(--down)}" +
    ".pr-anc{font-size:12.5px;line-height:1.5;margin:-2px 0 10px;padding:7px 10px;border-radius:10px;background:var(--panel2,#2a3142);color:var(--sub)}.pr-anc b{color:var(--tx,inherit)}" +
    ".pr-sg{display:flex;align-items:center;gap:10px;margin:0 0 10px;flex-wrap:wrap}.pr-bd{font-size:12.5px;font-weight:700;padding:4px 10px;border-radius:999px;background:var(--panel2,#2a3142)}" +
    ".pr-bd.s3{background:color-mix(in srgb,var(--up) 22%,transparent)}.pr-bd.s2{background:color-mix(in srgb,#ffb84d 22%,transparent)}" +
    ".pv{display:flex;flex-direction:column;gap:2px}.pvd{display:flex;gap:3px}.pvd i{width:10px;height:10px;border-radius:50%;background:#6b7385}.pvd i.u{background:var(--up)}.pvd i.d{background:var(--down)}.pv small{font-size:12.5px;color:var(--sub)}" +
    ".pt{padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pt:last-child{border:0}.pt .row{display:flex;justify-content:space-between}" +
    ".ptb{position:relative;height:8px;border-radius:4px;background:rgba(124,156,255,.15);margin:5px 0 3px}.ptb i.u,.ptb i.d{display:block;height:100%;border-radius:4px}.ptb i.u{background:var(--up)}.ptb i.d{background:var(--down)}" +
    ".ptb .ptn{position:absolute;top:-3px;bottom:-3px;width:0;border-left:2px dashed var(--text)}.pt small{font-size:12.5px}" +
    ".ps-r{padding:9px 0;border-bottom:1px solid var(--line)}.ps-r:last-of-type{border:0}.ps-h{display:flex;align-items:center;gap:7px;cursor:pointer;font-size:13.5px}.ps-h .hm-i{font-size:16px}" +
    ".ps-v{margin-left:auto;text-align:right;line-height:1.15}.ps-v b{display:block;font-size:15px}.ps-v small{font-size:12.5px;color:var(--sub)}.ps-v .up{color:var(--up)}.ps-v .dn{color:var(--down)}" +
    ".ps-r .fchev{font-style:normal;color:var(--sub);transition:transform .15s}.ps-r.open .fchev{transform:rotate(180deg)}.ps-bar .zb{height:6px;margin:5px 0 3px}.ps-sub{font-size:12.5px;color:var(--sub)}.ps-sub .up{color:var(--up)}.ps-sub .dn{color:var(--down)}" +
    ".ps-gap{text-align:center;color:var(--sub);padding:2px 0;letter-spacing:4px}.ps-all{margin-top:8px}" +
    ".ps-st{margin:8px 0 2px;border-radius:10px;background:var(--panel2,rgba(255,255,255,.03));padding:2px 8px}.ps-t{display:flex;align-items:center;gap:8px;padding:8px 0;border-bottom:1px solid var(--line);color:var(--text);text-decoration:none}.ps-t:last-child{border:0}" +
    ".ps-tn{flex:1;min-width:0;overflow:hidden}.ps-tn b{font-size:13px;white-space:nowrap}.ps-tn .tk{margin-left:5px;font-style:normal;font-size:12.5px;color:var(--sub)}.ps-tv{text-align:right;line-height:1.2}.ps-tv b{font-size:13.5px}.ps-tv small{display:block;font-size:12.5px;color:var(--sub)}.ps-tv .up{color:var(--up)}.ps-tv .dn{color:var(--down)}" +
    ".pr-g{display:flex;align-items:center;gap:8px;margin:12px 0 2px;padding-bottom:4px;border-bottom:1px solid var(--line);font-size:13px}.pr-g small{margin-left:auto}.pr-g .up{color:var(--up)}.pr-g .dn{color:var(--down)}" +
    ".pr-eb{display:block;font-size:12.5px;color:var(--sub);opacity:.8;margin-top:2px}.pr-m .zb{height:6px;margin:5px 0 3px}" +
    ".pr-cb{font-size:13px;padding:9px 10px;border-radius:10px;background:var(--panel2,rgba(255,255,255,.04));margin:4px 0 4px}.pr-cb .up{color:var(--up)}.pr-cb .dn{color:var(--down)}" +
    ".sg5{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;margin:2px 0 8px}.sg5c{border:1px solid var(--line);background:var(--panel2,var(--panel));color:var(--text);border-radius:10px;padding:6px 4px 7px;font:inherit;cursor:pointer;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:0}" +
    ".sg5c.on{outline:2px solid var(--acc,#7c9cff)}.sg5c small{font-size:12.5px;white-space:nowrap;color:var(--sub)}.sg5c b{font-size:20px;font-weight:800;line-height:1.1}.sg5c em{font-style:normal;font-size:12.5px;font-weight:700}" +
    ".sg5b{position:relative;display:block;width:86%;height:5px;border-radius:3px;margin-top:4px;background:linear-gradient(90deg,#2f6fd0,#6b7385 50%,#e05555)}.sg5b i{position:absolute;top:-2px;width:3px;height:9px;border-radius:2px;background:var(--text);transform:translateX(-50%)}" +
    ".sg-w{display:flex;align-items:center;gap:14px}.sg-n{font-size:40px;font-weight:800;line-height:1}.sg-b{position:relative;height:10px;border-radius:5px;margin:8px 0 2px;background:linear-gradient(90deg,#2f6fd0,#5b8fd8,#6b7385,#d98a7a,#e05555)}" +
    ".sg-b i{position:absolute;top:50%;width:14px;height:14px;border-radius:50%;background:var(--text);border:2px solid var(--panel);transform:translate(-50%,-50%)}" +
    ".sg-ps{display:flex;flex-direction:column;gap:4px;margin:12px 0 4px}.sg-ps>div{display:flex;align-items:center;gap:8px;font-size:12.5px}.sg-ps small{flex:0 0 46%;color:var(--sub);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sg-ps b{flex:0 0 26px;text-align:right}" +
    ".pr-tb{width:100%;border-collapse:collapse;font-size:12.5px;margin:4px 0}.pr-tb th{color:var(--sub);font-weight:500;text-align:right;padding:4px 3px;border-bottom:1px solid var(--line)}.pr-tb th:first-child,.pr-tb td:first-child{text-align:left}" +
    ".pr-tb td{text-align:right;padding:5px 3px;border-bottom:1px solid var(--line)}.pr-tb tr.now td{background:color-mix(in srgb,var(--acc,#7c9cff) 14%,transparent);font-weight:700}.pr-tb .up{color:var(--up)}.pr-tb .dn{color:var(--down)}" +
    ".pr-how{margin-top:8px}.pr-hw{display:flex;gap:8px;align-items:flex-start;padding:7px 0;border-bottom:1px solid var(--line);font-size:13px}.pr-hw:last-of-type{border:0}.pr-hw small{display:block;color:var(--sub);font-size:12.5px;line-height:1.5;margin-top:2px;word-break:keep-all}";
    document.head.appendChild(st); })();
})();
