/* CH Investing — 10/14 14시 아이디어 보고 A14 (사용자: "3,4,5 진행")
   A14-3 🖼 📤 공유를 글자 대신 「그림 카드」로 — chShare(제목, 글, 주소) 한 곳을 감싸서 홈·포트·스토리·카드 ⓘ 공유가 모두 같이 바뀜.
         누르면 아래에서 미리보기 창: 「🖼 그림으로 보내기」(사진 공유) · 「✉️ 글로 보내기」(지금까지 방식) · 닫기. 숫자는 화면 글 그대로(새 계산 없음).
   A14-4 📲 사파리(홈 화면 앱 아님)로 열면 홈 맨 위 얇은 띠 「홈 화면에 추가」 · 갤럭시 크롬은 설치 가능할 때만 바로 「설치」 · ✕ 누르면 7일 숨김
   A14-5 는 push.js(알림 화면 시간표 4묶음) */
(function(){
  function ls(k, v){ try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch(x) {} return null; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]; }); }
  function toast(m){ var d = document.createElement("div"); d.className = "ch-toast"; d.textContent = m; document.body.appendChild(d); setTimeout(function(){ d.remove(); }, 2600); }
  function dark(){ return document.documentElement.getAttribute("data-ui") !== "light"; }

  /* ---------- A14-3 그림 카드 ---------- */
  var W = 1080, H = 1350, PAD = 84;
  var NUM = /^(.{1,16}?)\s*([+\-−]\d[\d,]*(?:\.\d+)?%)(p?)\s*(\(.*\))?$/;
  function parse(title, text){
    var lines = String(text || "").split("\n").map(function(l){ return l.trim(); }).filter(Boolean);
    var disc = "※ 투자 참고용 · 매수 추천 아님";
    lines = lines.filter(function(l){ return !/^※/.test(l); });
    var head = lines.shift() || title || "CH Investing", stats = [], rest = [];
    lines.forEach(function(l){
      var segs = l.split(/\s+·\s+/), got = [], left = [];
      segs.forEach(function(s){ var m = s.match(NUM); if (m && !m[3] && !/[ ]{2}/.test(m[1])) got.push({lab: m[1].replace(/[:：]$/, ""), v: m[2], note: (m[4] || "").replace(/^\(|\)$/g, "")}); else left.push(s); });
      stats = stats.concat(got);
      if (left.length) rest.push(left.join(" · "));
    });
    if (stats.length < 2){ stats = []; rest = lines.slice(); }   // 숫자 줄이 1개뿐이면 글 카드로
    return {head: head, stats: stats.slice(0, 6), rest: rest.slice(0, 9), disc: disc};
  }
  function wrap(cx, s, maxW, maxL){
    var out = [], cur = "";
    Array.from(s).forEach(function(ch){ if (cx.measureText(cur + ch).width > maxW && cur){ out.push(cur); cur = ch.trim() ? ch : ""; } else cur += ch; });
    if (cur) out.push(cur);
    if (out.length > maxL){ out = out.slice(0, maxL); out[maxL - 1] = out[maxL - 1].replace(/.{1}$/, "…"); }
    return out;
  }
  function draw(P){
    var D = dark(), C = {bg1: D ? "#0b0f17" : "#f5f6fa", bg2: D ? "#1a2238" : "#e3e9f8", panel: D ? "#121826" : "#ffffff", line: D ? "#232c40" : "#e2e6ef",
      text: D ? "#e8ecf4" : "#141824", sub: D ? "#8a94a8" : "#5b6476", up: "#e66767", down: "#3987e5", acc: D ? "#ffd166" : "#b07a00"};
    var cv = document.createElement("canvas"); cv.width = W; cv.height = H; var cx = cv.getContext("2d");
    var F = '-apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo","Noto Sans KR","Malgun Gothic",sans-serif';
    var g = cx.createLinearGradient(0, 0, W, H); g.addColorStop(0, C.bg2); g.addColorStop(0.55, C.bg1); g.addColorStop(1, C.bg1);
    cx.fillStyle = g; cx.fillRect(0, 0, W, H);
    // 머리: 상표 + 날짜
    cx.textBaseline = "alphabetic"; cx.fillStyle = C.acc; cx.font = "800 44px " + F; cx.fillText("CH Investing", PAD, 128);
    var now = new Date(Date.now() + 9 * 3600e3), dl = (now.getUTCMonth() + 1) + "/" + now.getUTCDate() + " " + ("0" + now.getUTCHours()).slice(-2) + ":" + ("0" + now.getUTCMinutes()).slice(-2);
    cx.fillStyle = C.sub; cx.font = "500 32px " + F; cx.textAlign = "right"; cx.fillText(dl, W - PAD, 128); cx.textAlign = "left";
    // 제목
    cx.fillStyle = C.text; cx.font = "800 60px " + F;
    var y = 236; wrap(cx, P.head, W - PAD * 2, 2).forEach(function(l){ cx.fillText(l, PAD, y); y += 76; });
    y += 14;
    if (P.stats.length){
      var mx = Math.max.apply(null, P.stats.map(function(s){ return Math.abs(parseFloat(s.v.replace("−", "-").replace(/,/g, ""))) || 0; }).concat([0.01]));
      var rowH = Math.max(112, Math.min(176, Math.floor((H - 230 - y - (P.rest.length ? 56 * Math.min(3, P.rest.length) : 0)) / P.stats.length)));
      P.stats.forEach(function(s){
        var v = parseFloat(s.v.replace("−", "-").replace(/,/g, "")) || 0, base = /S&P|코스피|코스닥|MSCI|시장/.test(s.lab);
        cx.fillStyle = C.panel; roundRect(cx, PAD, y, W - PAD * 2, rowH - 18, 26); cx.fill();
        cx.fillStyle = C.text; cx.font = "700 " + Math.min(44, rowH * 0.3) + "px " + F; cx.fillText(s.lab, PAD + 34, y + (s.note ? rowH * 0.36 : rowH * 0.48));
        if (s.note){ cx.fillStyle = C.sub; cx.font = "500 " + Math.min(28, rowH * 0.2) + "px " + F; cx.fillText(wrap(cx, s.note, W * 0.42, 1)[0], PAD + 34, y + rowH * 0.36 + Math.min(42, rowH * 0.26)); }
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); cx.font = "900 " + Math.min(70, rowH * 0.5) + "px " + F; cx.textAlign = "right";
        cx.fillText(s.v, W - PAD - 34, y + rowH * 0.5); cx.textAlign = "left";
        var bw = (W - PAD * 2 - 68) * Math.min(1, Math.abs(v) / mx), by = y + rowH - 46;
        cx.fillStyle = C.line; roundRect(cx, PAD + 34, by, W - PAD * 2 - 68, 10, 5); cx.fill();
        cx.fillStyle = base ? C.sub : (v >= 0 ? C.up : C.down); roundRect(cx, PAD + 34, by, Math.max(10, bw), 10, 5); cx.fill();
        y += rowH;
      });
      y += 8;
    }
    cx.fillStyle = P.stats.length ? C.sub : C.text; cx.font = "500 " + (P.stats.length ? 34 : 44) + "px " + F;
    var lh = P.stats.length ? 48 : 70;
    if (!P.stats.length){ var nl = 0; P.rest.forEach(function(l){ nl += wrap(cx, l, W - PAD * 2, 2).length; }); y = Math.max(y + 20, Math.round((y + H - 170) / 2 - (nl * lh + P.rest.length * 8) / 2)); }
    P.rest.forEach(function(l){ wrap(cx, l, W - PAD * 2, 2).forEach(function(w){ if (y < H - 200){ cx.fillText(w, PAD, y + 34); y += lh; } }); y += 8; });
    // 바닥: 주소 + 안내
    cx.strokeStyle = C.line; cx.lineWidth = 2; cx.beginPath(); cx.moveTo(PAD, H - 150); cx.lineTo(W - PAD, H - 150); cx.stroke();
    cx.fillStyle = C.text; cx.font = "700 32px " + F; cx.fillText("📱 chkchp0702-spec.github.io/daily-app", PAD, H - 92);
    cx.fillStyle = C.sub; cx.font = "500 28px " + F; cx.fillText(P.disc, PAD, H - 48);
    return cv;
  }
  function roundRect(cx, x, y, w, h, r){ cx.beginPath(); cx.moveTo(x + r, y); cx.arcTo(x + w, y, x + w, y + h, r); cx.arcTo(x + w, y + h, x, y + h, r); cx.arcTo(x, y + h, x, y, r); cx.arcTo(x, y, x + w, y, r); cx.closePath(); }
  function blobOf(cv){ var u = cv.toDataURL("image/png"), b = atob(u.split(",")[1]), a = new Uint8Array(b.length); for (var i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return new Blob([a], {type: "image/png"}); }

  var TXT = window.chShare;   // nav2.js 의 글자 공유(공유창 → 안 되면 복사)
  function sheet(title, text, hash){
    var old = document.getElementById("shimg"); if (old) old.remove();
    var cv; try { cv = draw(parse(title, text)); } catch(e) { return TXT && TXT(title, text, hash); }
    var url = cv.toDataURL("image/png"), now = new Date(Date.now() + 9 * 3600e3);
    var fn = "CH_Investing_" + ("0" + (now.getUTCMonth() + 1)).slice(-2) + ("0" + now.getUTCDate()).slice(-2) + ".png", file = null, canFile = false;
    try { file = new File([blobOf(cv)], fn, {type: "image/png"}); canFile = !!(navigator.canShare && navigator.canShare({files: [file]})); } catch(e) {}
    var d = document.createElement("div"); d.id = "shimg";
    d.innerHTML = '<div class="shi-bk"></div><div class="shi-box"><div class="shi-h"><b>📤 공유</b><button class="shi-x" aria-label="닫기">✕</button></div>' +
      '<img alt="공유 그림 미리보기" src="' + url + '"><div class="shi-bt"><button class="shi-img">🖼 ' + (canFile ? "그림으로 보내기" : "그림 저장") + '</button><button class="shi-txt">✉️ 글로 보내기</button></div>' +
      '<small>' + (canFile ? "카톡·문자·인스타 어디서나 같은 모양으로 보여요." : "이 브라우저는 그림 바로 보내기가 안 돼요 — 그림을 길게 눌러 저장한 뒤 보내 주세요.") + '</small></div>';
    document.body.appendChild(d);
    var close = function(){ d.remove(); };
    d.querySelector(".shi-bk").onclick = close; d.querySelector(".shi-x").onclick = close;
    d.querySelector(".shi-txt").onclick = function(){ close(); if (TXT) TXT(title, text, hash); };
    d.querySelector(".shi-img").onclick = function(){
      if (canFile){ navigator.share({files: [file], title: title || "CH Investing"}).then(close).catch(function(e){ if (e && e.name !== "AbortError") toast("그림 보내기가 안 됐어요 — 길게 눌러 저장해 주세요"); }); return; }
      var a = document.createElement("a"); a.href = url; a.download = fn; document.body.appendChild(a); a.click(); a.remove(); toast("그림을 저장했어요");
    };
  }
  if (TXT) window.chShare = sheet;

  /* ---------- A14-4 홈 화면에 추가 띠 ---------- */
  var ua = navigator.userAgent || "", ios = /iP(hone|ad|od)/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  var inApp = /KAKAOTALK|NAVER|Instagram|FBAN|FBAV|Line\//i.test(ua);
  var standalone = function(){ return (window.matchMedia && matchMedia("(display-mode: standalone)").matches) || navigator.standalone === true; };
  var DP = null, HIDE = "a2hsHide";
  window.addEventListener("beforeinstallprompt", function(e){ e.preventDefault(); DP = e; if (window.cur === "home") band(); });
  window.addEventListener("appinstalled", function(){ DP = null; var b = document.getElementById("a2hs"); if (b) b.remove(); });
  function hidden(){ var t = +ls(HIDE) || 0; return Date.now() - t < 7 * 86400e3; }
  function band(){
    if (standalone() || hidden() || window.cur !== "home") return;
    if (!(ios || DP)) return;   // 아이폰 사파리·카톡 안 · 또는 크롬이 「설치 가능」이라고 알려 준 때만
    var main = document.getElementById("main"); if (!main || document.getElementById("a2hs")) return;
    var b = document.createElement("div"); b.id = "a2hs";
    var msg = ios ? (inApp ? "카톡 안에서 열렸어요 — <b>Safari로 열기</b> 뒤 홈 화면에 추가하면 알림도 와요" : "<b>홈 화면에 추가</b>하면 알림도 오고 앱처럼 바로 열려요")
                  : "<b>앱으로 설치</b>하면 알림도 오고 바로 열려요";
    b.innerHTML = '<span class="a2-i">📲</span><span class="a2-t">' + msg + '</span>' +
      (DP && !ios ? '<button class="a2-go a2-inst">설치</button>' : '<a class="a2-go" href="install.html">방법 ▸</a>') + '<button class="a2-x" aria-label="7일 동안 숨기기">✕</button>';
    main.insertBefore(b, main.firstChild);
    b.querySelector(".a2-x").onclick = function(){ ls(HIDE, String(Date.now())); b.remove(); };
    var ib = b.querySelector(".a2-inst"); if (ib) ib.onclick = function(){ if (!DP) return; DP.prompt(); DP.userChoice.then(function(r){ if (r && r.outcome === "accepted") b.remove(); DP = null; }).catch(function(){}); };
  }
  var HI = window.homeInit;
  if (HI) window.homeInit = function(){ var r = HI.apply(this, arguments); try { band(); } catch(e) {} return r; };
  setTimeout(function(){ try { band(); } catch(e) {} }, 600);

  var st = document.createElement("style");
  st.textContent = [
    "#shimg{position:fixed;inset:0;z-index:90;display:flex;align-items:flex-end;justify-content:center}",
    ".shi-bk{position:absolute;inset:0;background:rgba(0,0,0,.55)}",
    ".shi-box{position:relative;width:100%;max-width:520px;background:var(--panel);border:1px solid var(--line);border-radius:22px 22px 0 0;padding:14px 16px calc(env(safe-area-inset-bottom) + 16px);display:flex;flex-direction:column;gap:10px;max-height:92vh}",
    ".shi-h{display:flex;align-items:center;justify-content:space-between}.shi-h b{font-size:16px}",
    ".shi-x{border:1px solid var(--line);background:var(--panel2);color:var(--text);border-radius:999px;width:32px;height:32px;font-size:15px;cursor:pointer}",
    "#shimg img{display:block;width:auto;max-width:100%;max-height:56vh;margin:0 auto;border-radius:14px;border:1px solid var(--line);-webkit-touch-callout:default}",
    ".shi-bt{display:grid;grid-template-columns:1.3fr 1fr;gap:8px}.shi-bt button{font:inherit;font-size:15px;font-weight:800;padding:13px 8px;border-radius:14px;border:1px solid var(--line);background:var(--panel2);color:var(--text);cursor:pointer}",
    ".shi-bt .shi-img{background:var(--acc);border-color:var(--acc);color:var(--bg)}",
    ".shi-box small{color:var(--sub);font-size:12px;text-align:center}",
    "#a2hs{display:flex;align-items:center;gap:8px;background:var(--panel2);border:1px solid var(--line);border-radius:14px;padding:8px 8px 8px 12px;margin:0 0 10px;font-size:13px;line-height:1.4}",
    "#a2hs .a2-i{font-size:18px}#a2hs .a2-t{flex:1;min-width:0;color:var(--sub)}#a2hs .a2-t b{color:var(--text)}",
    "#a2hs .a2-go{flex:none;font:inherit;font-size:12.5px;font-weight:800;border:0;border-radius:999px;padding:6px 11px;background:var(--acc);color:var(--bg);text-decoration:none;cursor:pointer;white-space:nowrap}",
    "#a2hs .a2-x{flex:none;border:0;background:transparent;color:var(--sub);font-size:15px;width:28px;height:28px;cursor:pointer}"
  ].join("\n");
  document.head.appendChild(st);
})();
