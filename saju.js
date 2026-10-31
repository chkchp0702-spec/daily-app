/* CH Investing — 🔮 오늘의 운세 · 📜 사주 리포트 (10/28 사용자: 「어플에 사주리포트랑 오늘의 운세 카테고리 · API나 돈 안 들게 · 오늘의 운세는 좀 쉽게」)
   ① 계산은 휴대폰 안(saju_core.js) — 서버·API 없음, 생일은 이 휴대폰에만 저장(localStorage "sj_people")
   ② 문장은 미리 써 둔 창고(saju_txt.js)에서 조합
   ③ 리포트는 예전 「나를 읽는 리포트」 모양 그대로(밝은 종이) · 📄 PDF 저장(pdfx.js 화면 그대로)
   ④ 더 깊은 글이 필요하면 「Claude 심화판 문구 복사」 → Claude 채팅에 붙여 넣기 (API 비용 없음) */
(function(){
  var S = function(){ return window.SJ; }, T = function(){ return window.SJT; };
  function e(s){ return String(s == null ? "" : s).replace(/[&<>"]/g, function(c){ return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;"}[c]; }); }
  function ls(k, v){ try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || "null"); localStorage.setItem(k, JSON.stringify(v)); } catch(x) { return null; } }
  function hash(s){ var h = 0; s = String(s); for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function pick(arr, seed){ return arr[hash(seed) % arr.length]; }
  var WD = ["일", "월", "화", "수", "목", "금", "토"];

  /* ───────── 사람 목록 (이 휴대폰에만) ───────── */
  function people(){ return ls("sj_people") || []; }
  function savePeople(L){ ls("sj_people", L); }
  function selId(){ var L = people(), id = ls("sj_sel"); return L.some(function(p){ return p.id === id; }) ? id : (L[0] && L[0].id); }
  function sel(){ var id = selId(); return people().filter(function(p){ return p.id === id; })[0] || null; }
  var RC = {};
  function calcOf(p){
    var k = JSON.stringify([p.sex, p.cal, p.y, p.m, p.d, p.leap, p.hh, p.mi, p.city, p.name]);
    if (!RC[k]) RC[k] = S().calc({name: p.name, sex: p.sex, cal: p.cal, y: p.y, m: p.m, d: p.d, leap: p.leap, hh: p.hh, mi: p.mi, city: p.city});
    return RC[k];
  }
  function ready(){ return !!(window.SJ && window.SJT); }

  /* ───────── 스타일 ───────── */
  function css(){
    if (document.getElementById("sj-css")) return;
    var st = document.createElement("style"); st.id = "sj-css";
    st.textContent = [
      ".sj-ppl{display:flex;gap:7px;overflow-x:auto;padding:2px 0 12px;scrollbar-width:none}.sj-ppl::-webkit-scrollbar{display:none}",
      ".sj-ppl button{flex:none;border:1px solid var(--line);background:var(--panel);color:var(--sub);border-radius:20px;padding:7px 13px;font:inherit;font-size:13.5px;font-weight:600;cursor:pointer}",
      ".sj-ppl button.on{background:color-mix(in srgb,var(--c) 24%,var(--panel));color:var(--text);border-color:color-mix(in srgb,var(--c) 60%,var(--line))}",
      ".sj-ppl button.add{border-style:dashed}",
      ".sj-form .row{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px}.sj-form .row3{grid-template-columns:1.2fr 1fr 1fr}",
      ".sj-form label{display:block;font-size:12px;color:var(--sub);margin:0 0 4px;font-weight:600}",
      ".sj-form input,.sj-form select{width:100%;box-sizing:border-box;padding:11px 10px;border-radius:11px;border:1px solid var(--line);background:var(--panel2);color:var(--text);font:inherit;font-size:15px}",
      ".sj-seg{display:flex;border:1px solid var(--line);border-radius:11px;overflow:hidden}.sj-seg button{flex:1;padding:10px 4px;border:0;background:var(--panel2);color:var(--sub);font:inherit;font-size:14px;cursor:pointer}",
      ".sj-seg button.on{background:var(--c);color:#111;font-weight:800}",
      ".sj-btn{display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:12px 14px;border-radius:12px;border:0;background:var(--c);color:#111;font:inherit;font-weight:800;font-size:15px;cursor:pointer}",
      ".sj-btn.g{background:var(--panel2);color:var(--text);border:1px solid var(--line);font-weight:600}",
      ".sj-btns{display:flex;gap:8px;flex-wrap:wrap}.sj-btns .sj-btn{flex:1}",
      ".sj-note{font-size:12.5px;color:var(--dim);line-height:1.6;margin:8px 0 0}",
      ".sj-err{color:#ff8a80;font-size:13px;margin-top:8px}",
      /* 오늘의 운세 */
      ".lk-top{display:flex;align-items:center;gap:14px}.lk-ring{flex:none}.lk-h{font-size:19px;font-weight:800;line-height:1.4;letter-spacing:-.3px;margin:2px 0 6px}",
      ".lk-d{font-size:12.5px;color:var(--sub)}.lk-g{display:inline-block;font-size:12px;font-weight:800;padding:2px 9px;border-radius:20px;margin-right:6px}",
      ".lk-areas{display:grid;gap:10px}.lk-a{display:grid;grid-template-columns:30px 1fr;gap:8px;align-items:start}",
      ".lk-a .qi{font-size:20px;line-height:1.2}.lk-a b{font-size:14px}.lk-a .bar{height:6px;border-radius:4px;background:var(--panel2);margin:5px 0 4px;overflow:hidden}",
      ".lk-a .bar i{display:block;height:100%;border-radius:4px}.lk-a p{margin:0;font-size:13.5px;color:var(--sub);line-height:1.5}",
      ".lk-lucky{display:grid;grid-template-columns:1fr 1fr;gap:8px}.lk-lucky div{background:var(--panel2);border-radius:12px;padding:10px 11px}",
      ".lk-lucky small{display:block;color:var(--dim);font-size:11.5px;margin-bottom:2px}.lk-lucky b{font-size:15px}.lk-dot{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:6px;vertical-align:-1px;border:1px solid rgba(128,128,128,.4)}",
      ".lk-tip{display:flex;gap:8px;align-items:flex-start;font-size:14px;line-height:1.5;margin:6px 0}",
      ".lk-week{display:grid;grid-template-columns:repeat(7,1fr);gap:6px;align-items:end;height:118px}",
      ".lk-week button{display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;background:none;border:0;color:var(--sub);font:inherit;font-size:11.5px;cursor:pointer;padding:0;gap:3px}",
      ".lk-week button i{display:block;width:70%;border-radius:6px 6px 3px 3px;min-height:8px}.lk-week button.on{color:var(--text);font-weight:800}.lk-week button.on i{outline:2px solid var(--text);outline-offset:1px}",
      ".lk-all{display:grid;gap:6px}.lk-all button{display:flex;align-items:center;gap:10px;background:var(--panel2);border:0;border-radius:12px;padding:10px 12px;color:var(--text);font:inherit;cursor:pointer;text-align:left}",
      ".lk-all button .s{margin-left:auto;font-weight:800;font-size:16px}",
      /* 사주 리포트 — 밝은 종이 (앱 테마와 상관없이) */
      ".sjr{--ink:#1f2433;--sub2:#5d667a;--ln:#e3e7ef;--nv:#1e2742;background:#eef1f6;color:var(--ink);border-radius:18px;padding:12px 10px 16px;font-size:14.5px;line-height:1.68;-webkit-font-smoothing:antialiased}",
      ".qsjp{--ink:#1f2433;--sub2:#5d667a;--ln:#e3e7ef;--nv:#1e2742;color:var(--ink);font-size:14.5px;line-height:1.68;background:#fff;border:1px solid var(--ln);border-radius:16px;padding:18px 15px 16px;margin-bottom:12px;box-shadow:0 1px 3px rgba(20,30,60,.05);overflow:hidden}",
      ".qph{display:flex;gap:11px;align-items:center;margin:0 0 14px;padding-bottom:11px;border-bottom:2px solid #eef1f6}",
      ".qph .qn{flex:none;width:34px;height:34px;border-radius:10px;background:var(--nv);color:#fff;font-weight:800;font-size:16px;display:grid;place-items:center}",
      ".qph h2{margin:0;font-size:19px;letter-spacing:-.4px;color:var(--ink)}.qph p{margin:1px 0 0;font-size:12px;color:#7a8396}",
      ".qsjp h4{margin:16px 0 8px;font-size:15.5px;color:var(--ink);letter-spacing:-.2px}.qsjp h4:first-child{margin-top:0}",
      ".qsjp p{margin:6px 0}.qsjp ul{margin:6px 0;padding-left:18px}.qsjp li{margin:4px 0}.qsjp b{color:#111827}",
      ".qbox{background:#f5f7fb;border:1px solid var(--ln);border-radius:12px;padding:12px 13px;margin:10px 0;font-size:13.8px}",
      ".qbox.qgr{background:linear-gradient(135deg,#eef8f1,#eaf0fb);border-color:#cfe3d6}.qbox.qor{background:#fff5ee;border-color:#f6cfb5}",
      ".qbox.qlft{border-left:4px solid #e9b949}",
      ".qbox h5{margin:0 0 5px;font-size:14.5px;color:var(--ink)}",
      ".qsjp table{width:100%;border-collapse:separate;border-spacing:0;font-size:13px;border:1px solid var(--ln);border-radius:12px;overflow:hidden;margin:8px 0}",
      ".qsjp th{background:var(--nv);color:#fff;text-align:left;padding:8px 9px;font-weight:700;font-size:12.5px}.qsjp td{padding:8px 9px;border-top:1px solid var(--ln);vertical-align:top;color:#2a3142}",
      ".qsjp td,.qsjp th{word-break:keep-all;overflow-wrap:anywhere}.qsjp th{white-space:nowrap}.qsjp td.qk{width:27%}.qsjp td.qn{width:7%;white-space:nowrap}",
      ".qsjp tr:nth-child(even) td{background:#fafbfd}.qsjp td.qk{font-weight:700}",
      ".qst{color:#e9a400;letter-spacing:-1px;white-space:nowrap}.qst i{color:#d6dbe4;font-style:normal}",
      ".qpills{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}",
      ".qpil{background:#f8f9fc;border:1px solid var(--ln);border-radius:13px;padding:9px 6px 8px;text-align:center}.qpil.qme{background:#fffbea;border:2px solid #e9b949}",
      ".qpil .qt{font-size:13px;font-weight:800}.qpil .qr{font-size:10.5px;color:#7a8396;margin-bottom:6px}",
      ".qch{border-radius:10px;color:#fff;font-size:28px;font-weight:800;line-height:1.2;margin:4px 0;padding:5px 2px 4px;font-family:'Noto Serif KR','Nanum Myeongjo',serif}",
      ".qch small{display:block;font-size:9.5px;font-weight:700;font-family:-apple-system,'Pretendard',sans-serif;line-height:1.25;margin-top:2px;opacity:.95;letter-spacing:-.3px}",
      ".qpil .qu{font-size:10.5px;color:#7a8396;margin-top:4px}",
      ".qgrid2{display:grid;grid-template-columns:1fr 1fr;gap:8px}.qgrid2>.qbox{margin:0}",
      "@media(max-width:420px){.qgrid2.qst1{grid-template-columns:1fr}}",
      ".qsins{display:grid;grid-template-columns:1fr 1fr;gap:8px}.qsin{border:1px solid var(--ln);border-radius:12px;padding:10px 11px;background:#fafbfd}",
      ".qsin b{display:block;font-size:14px}.qsin .qw{font-size:11.5px;color:#7a8396}.qsin p{font-size:12.6px;margin:4px 0 0;line-height:1.5}",
      ".qeltag{display:inline-block;white-space:nowrap;color:#fff;font-weight:800;font-size:12px;padding:1px 8px;border-radius:20px}",
      ".qcover{background:linear-gradient(180deg,#1b2340 0%,#2a3866 70%,#3c4d86 100%);color:#fff;border:0;text-align:center;padding:26px 14px 18px;position:relative}",
      ".qcover .qeb{color:#f3c86b;letter-spacing:7px;font-size:12px;font-weight:700}.qcover h1{font-size:30px;margin:8px 0 6px;letter-spacing:-1px;font-family:'Noto Serif KR',serif;color:#fff}",
      ".qcover .qnm{font-size:21px;font-weight:800;color:#fff}.qcover .qbd{font-size:12.5px;color:#cfd6ea;margin:4px 0 14px}",
      ".qcover .qpills .qpil{background:rgba(255,255,255,.1);border-color:rgba(255,255,255,.22)}.qcover .qpil .qr{color:#d6dcef}.qcover .qpil.qme{background:rgba(255,232,150,.14);border-color:#f3c86b}",
      ".qcover .qone{background:rgba(255,255,255,.1);border-left:4px solid #f3c86b;border-radius:12px;text-align:left;padding:12px 13px;margin-top:14px;font-size:13.6px;line-height:1.7;color:#eef1fa}",
      ".qcover .qone b{color:#ffd77a}.qcover .qft{font-size:11.5px;color:#aab4d0;margin-top:12px;line-height:1.6}",
      ".qsjp svg text{font-family:inherit}",
      ".qcont{padding-top:14px}",
      ".qyr{display:grid;grid-template-columns:repeat(5,1fr);gap:6px;margin:6px 0 10px}.qyr div{border-radius:10px;padding:7px 2px;text-align:center;font-size:11.5px;line-height:1.35;border:1px solid var(--ln)}",
      ".qyr b{display:block;font-size:13px}.qmos{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:7px}",
      ".qmo{border:1px solid var(--ln);border-radius:12px;padding:9px 10px;font-size:12.4px;line-height:1.5;background:#fafbfd}.qmo .qh{display:flex;justify-content:space-between;font-weight:800;font-size:13px}",
      ".qjobs{display:grid;grid-template-columns:1fr 1fr;gap:8px}.qjob{border:1px solid var(--ln);border-radius:12px;padding:10px;text-align:center;background:#fafbfd}.qjob .qi{font-size:24px}.qjob b{display:block}.qjob small{display:block;color:#6b7488;font-size:11.8px;line-height:1.45}",
      ".qquote{text-align:center;font-family:'Noto Serif KR',serif;font-size:17px;font-weight:700;margin:14px 0;color:#1e2742;line-height:1.6}",
      ".qtools{display:flex;gap:7px;flex-wrap:wrap;margin:0 0 12px}.qtools button{flex:1;min-width:120px;border:1px solid #cfd6e4;background:#fff;color:#1e2742;border-radius:12px;padding:10px 8px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer}",
      ".qtools button small{display:block;font-weight:500;font-size:11px;color:#6b7488}",
      ".sjr .pdfbar{margin:0 0 12px}",
      /* 우와 업그레이드 */
      ".lk-mw{display:flex;align-items:center;gap:10px;margin:10px 0 4px;padding:12px 14px;border-radius:16px;background:var(--panel2);border:1px solid var(--line);cursor:pointer}.lk-mw .lk-mwi{font-size:22px}.lk-mw div{flex:1;min-width:0}.lk-mw small{display:block;font-size:12px;color:var(--sub)}.lk-mw b{display:block;font-size:14.5px;line-height:1.4}.lk-mw i{font-style:normal;color:var(--sub);font-size:18px}" +
      ".lk-hero{position:relative;overflow:hidden;border-radius:24px;padding:18px 18px 16px;color:#fff;margin-bottom:12px;box-shadow:0 10px 28px rgba(40,20,90,.22)}",
      ".lk-hero .tw{position:absolute;border-radius:50%;background:#fff;animation:sjtw 2.6s ease-in-out infinite}@keyframes sjtw{0%,100%{opacity:.15;transform:scale(.7)}50%{opacity:.95;transform:scale(1.15)}}",
      ".lk-hero .ani{position:absolute;right:-6px;top:-10px;font-size:120px;opacity:.22;transform:rotate(12deg);line-height:1;pointer-events:none}",
      ".lk-hero .sc{font-size:64px;font-weight:900;line-height:1;letter-spacing:-2px;text-shadow:0 2px 12px rgba(0,0,0,.18)}.lk-hero .sc small{font-size:18px;font-weight:700;opacity:.8;margin-left:3px;letter-spacing:0}",
      ".lk-hero .gd{display:inline-block;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35);border-radius:20px;padding:3px 11px;font-size:12.5px;font-weight:800;margin-bottom:8px;backdrop-filter:blur(4px)}",
      ".lk-hero .hd{font-size:20px;font-weight:800;line-height:1.38;letter-spacing:-.4px;margin:10px 0 8px}.lk-hero .sub{font-size:12.5px;opacity:.92}",
      ".lk-hero .meter{height:8px;background:rgba(255,255,255,.25);border-radius:6px;overflow:hidden;margin:10px 0 2px}.lk-hero .meter i{display:block;height:100%;background:#fff;border-radius:6px;animation:sjgrow 1.3s cubic-bezier(.2,.8,.2,1) both}@keyframes sjgrow{from{width:0}}",
      ".lk-hero .chips{display:flex;gap:6px;flex-wrap:wrap;margin-top:10px}.lk-hero .chips span{background:rgba(255,255,255,.18);border-radius:14px;padding:3px 9px;font-size:11.5px;font-weight:700}",
      ".lk-pop{animation:sjpop .6s cubic-bezier(.2,1.4,.4,1) both}@keyframes sjpop{from{opacity:0;transform:translateY(12px) scale(.96)}}",
      ".lk-flipw{perspective:1000px;margin-bottom:12px}.lk-flip{position:relative;height:216px;transition:transform .9s cubic-bezier(.3,1.3,.5,1);transform-style:preserve-3d;cursor:pointer}.lk-flip.on{transform:rotateY(180deg)}",
      ".lk-face{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden;border-radius:22px;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:16px;text-align:center;color:#fff;overflow:hidden}",
      ".lk-front{background:radial-gradient(circle at 30% 20%,#3b2d7a,#14112b 70%);border:2px solid #c9a7ff55}.lk-front .q{font-size:54px;animation:sjfloat 2.4s ease-in-out infinite}@keyframes sjfloat{50%{transform:translateY(-8px)}}",
      ".lk-front b{font-size:17px;margin-top:8px}.lk-front small{opacity:.75;margin-top:4px}.lk-back{transform:rotateY(180deg)}.lk-back .ic{font-size:50px}.lk-back b{font-size:20px;margin:4px 0 2px}.lk-back .k{font-size:12px;opacity:.9;letter-spacing:2px}.lk-back p{margin:8px 0 0;font-size:14px;line-height:1.55}",
      ".lk-el{display:grid;gap:8px}.lk-el .r{display:grid;grid-template-columns:52px 1fr 34px;gap:8px;align-items:center;font-size:13px}.lk-el .bb{height:14px;background:var(--panel2);border-radius:8px;overflow:hidden;display:flex}",
      ".lk-el .bb i{display:block;height:100%}.lk-el .bb i.add{background-image:repeating-linear-gradient(45deg,rgba(255,255,255,.55) 0 4px,transparent 4px 8px);animation:sjgrow 1.2s both}",
      ".lk-cal{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;width:100%}.lk-cal .w{font-size:11px;color:var(--dim);text-align:center}.lk-cal button{width:100%!important;min-width:0!important;min-height:0!important;height:auto!important;aspect-ratio:1/1.05;padding:0!important;margin:0!important;border:0;border-radius:9px;font:inherit;font-size:12px!important;font-weight:800;color:#fff;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1.15;box-sizing:border-box;overflow:hidden}",
      ".lk-cal button small{font-size:9.5px!important;font-weight:600;opacity:.92}.lk-cal button.td{outline:2.5px solid var(--text);outline-offset:1px}.lk-cal button.sel{transform:scale(1.08);box-shadow:0 4px 12px rgba(0,0,0,.3)}.lk-cal .x{visibility:hidden}",
      ".lk-share{display:flex;gap:8px;margin:0 0 12px}.lk-share button{flex:1;border:0;border-radius:14px;padding:13px 10px;font:inherit;font-weight:800;font-size:14.5px;cursor:pointer;color:#fff;background:linear-gradient(135deg,#fee500,#f7c600);color:#3a1d1d}",
      ".lk-share button.b2{background:var(--panel2);color:var(--text);border:1px solid var(--line)}",
      ".qsum{display:grid;grid-template-columns:150px 1fr;gap:12px;align-items:center}@media(max-width:400px){.qsum{grid-template-columns:1fr}}",
      ".qkw{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 8px}.qkw span{border-radius:20px;padding:4px 11px;font-size:12.5px;font-weight:800;color:#fff}",
      ".qbig{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.qbig div{border:1px solid var(--ln);border-radius:12px;padding:9px 6px;text-align:center;background:#fafbfd}.qbig b{display:block;font-size:17px}.qbig small{font-size:11px;color:#6b7488}",
      ".qm12{display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin:8px 0}.qm12 div{border-radius:11px;padding:7px 4px;text-align:center;font-size:11.5px;line-height:1.35;color:#fff}.qm12 b{display:block;font-size:13.5px}",
      ".qcp{display:grid;grid-template-columns:76px 1fr;gap:12px;align-items:center;border:1px solid var(--ln);border-radius:14px;padding:12px;margin:8px 0;background:#fafbfd}.qcp ul{margin:4px 0 0;padding-left:16px;font-size:12.8px}"
    ].join("\n");
    document.head.appendChild(st);
  }

  /* ───────── 사람 고르기 · 입력 ───────── */
  function pplBar(){
    var L = people(), id = selId();
    return '<div class="sj-ppl" id="sjPpl">' + L.map(function(p){ return '<button data-id="' + e(p.id) + '" class="' + (p.id === id ? "on" : "") + '">' + (p.rel === "나" ? "🙂 " : p.rel === "고객" ? "💼 " : p.rel === "가족" ? "🏠 " : "") + e(p.name) + '</button>'; }).join("") +
      '<button class="add" data-add="1">＋ 사람 추가</button>' + (L.length ? '<button data-edit="1">✏️ 고치기</button>' : "") + '</div>';
  }
  function bindPpl(root, again){
    var b = root.querySelector("#sjPpl"); if (!b) return;
    [].forEach.call(b.querySelectorAll("button"), function(x){ x.onclick = function(){
      if (x.dataset.add) return formOpen(root, null, again);
      if (x.dataset.edit) return formOpen(root, sel(), again);
      ls("sj_sel", x.dataset.id); again(); }; });
  }
  function opts(a, b, v, f){ var s = ""; for (var i = a; i <= b; i++) s += '<option value="' + i + '"' + (+v === i ? " selected" : "") + '>' + (f ? f(i) : i) + '</option>'; return s; }
  function formOpen(root, p, again){
    var nw = !p;
    p = p || {id: "p" + Date.now().toString(36), name: people().length ? "" : "나", rel: people().length ? "고객" : "나", sex: "F", cal: "S", y: 1980, m: 1, d: 1, leap: false, hh: -1, mi: 0, city: "서울"};
    var host = root.querySelector("#sjBody"), seg = function(name, list, v){ return '<div class="sj-seg" data-seg="' + name + '">' + list.map(function(x){ return '<button type="button" data-v="' + x[0] + '" class="' + (String(v) === String(x[0]) ? "on" : "") + '">' + x[1] + '</button>'; }).join("") + '</div>'; };
    host.innerHTML = '<div class="card sj-form"><h3>' + (nw ? "＋ 사람 추가" : "✏️ " + e(p.name) + " 고치기") + '</h3>' +
      '<div class="row"><div><label>이름(별명)</label><input id="sfN" maxlength="12" value="' + e(p.name) + '" placeholder="예: 나, 엄마, 김OO 고객"></div><div><label>관계</label>' + seg("rel", [["나", "나"], ["가족", "가족"], ["고객", "고객"], ["지인", "지인"]], p.rel) + '</div></div>' +
      '<div class="row"><div><label>성별</label>' + seg("sex", [["F", "여자"], ["M", "남자"]], p.sex) + '</div><div><label>달력</label>' + seg("cal", [["S", "양력"], ["L", "음력"]], p.cal) + '</div></div>' +
      '<div class="row row3"><div><label>태어난 해</label><select id="sfY">' + opts(1920, 2026, p.y) + '</select></div><div><label>월</label><select id="sfM">' + opts(1, 12, p.m) + '</select></div><div><label>일</label><select id="sfD">' + opts(1, 31, p.d) + '</select></div></div>' +
      '<div id="sfLeapW" style="display:none;margin:-2px 0 10px"><label style="display:flex;gap:8px;align-items:center;font-size:13.5px;color:var(--text)"><input type="checkbox" id="sfLeap" style="width:auto"' + (p.leap ? " checked" : "") + '> <span id="sfLeapT">윤달 생일</span></label></div>' +
      '<div class="row"><div><label>태어난 시간</label><select id="sfH"><option value="-1">모름</option>' + opts(0, 23, p.hh, function(i){ return i + "시"; }) + '</select></div><div><label>분</label><select id="sfMi">' + opts(0, 59, p.mi, function(i){ return i + "분"; }) + '</select></div></div>' +
      '<div class="row"><div><label>태어난 곳 — 시·도</label><select id="sfR">' + S().REGION.map(function(r){ return '<option' + (r[0] === (S().CITY_RG[p.city] || "서울특별시") ? " selected" : "") + '>' + r[0] + '</option>'; }).join("") + '</select></div>' +
      '<div><label>시·군</label><select id="sfC"></select></div></div><p class="sj-note" style="margin:-4px 0 10px">해외 출생이거나 모르면 「해외 · 모름」 — 서울 기준으로 계산하고 상승궁만 조금 달라져요. 목록에 없는 작은 곳은 가장 가까운 시·군을 고르세요.</p>' +
      '<div class="sj-btns"><button class="sj-btn" id="sfOk">저장하고 보기</button><button class="sj-btn g" id="sfNo">취소</button>' + (nw ? "" : '<button class="sj-btn g" id="sfDel">🗑 지우기</button>') + '</div>' +
      '<div class="sj-err" id="sfErr"></div><p class="sj-note">🔒 생일 정보는 이 휴대폰에만 저장돼요. 서버로 보내지 않아요.<br>시간을 모르면 「모름」 — 시주 없이 나머지는 그대로 계산돼요.</p></div>';
    var st = {rel: p.rel, sex: p.sex, cal: p.cal};
    var fillC = function(){ var rg = host.querySelector("#sfR").value, R0 = S().REGION.filter(function(r){ return r[0] === rg; })[0], L = Object.keys(R0 ? R0[1] : {});
      host.querySelector("#sfC").innerHTML = L.map(function(c){ return '<option' + (c === p.city ? " selected" : "") + '>' + c + '</option>'; }).join(""); };
    fillC(); host.querySelector("#sfR").onchange = fillC;
    [].forEach.call(host.querySelectorAll("[data-seg]"), function(g){ [].forEach.call(g.children, function(b){ b.onclick = function(){ st[g.dataset.seg] = b.dataset.v;
      [].forEach.call(g.children, function(x){ x.classList.toggle("on", x === b); }); leapHint(); }; }); });
    function leapHint(){ var w = host.querySelector("#sfLeapW"); if (st.cal !== "L"){ w.style.display = "none"; return; }
      var lm = 0; try { lm = S().leapMonthOf(+host.querySelector("#sfY").value); } catch(x) {}
      w.style.display = lm ? "block" : "none"; host.querySelector("#sfLeapT").textContent = lm ? "윤" + lm + "월 생일이면 체크" : ""; }
    host.querySelector("#sfY").onchange = leapHint; leapHint();
    host.querySelector("#sfNo").onclick = function(){ again(); };
    if (!nw) host.querySelector("#sfDel").onclick = function(){ if (!confirm(p.name + " 님 정보를 지울까요?")) return; savePeople(people().filter(function(x){ return x.id !== p.id; })); ls("sj_sel", null); again(); };
    host.querySelector("#sfOk").onclick = function(){
      var q = {id: p.id, name: host.querySelector("#sfN").value.trim() || "이름 없음", rel: st.rel, sex: st.sex, cal: st.cal, y: +host.querySelector("#sfY").value, m: +host.querySelector("#sfM").value, d: +host.querySelector("#sfD").value,
               leap: st.cal === "L" && host.querySelector("#sfLeap").checked && host.querySelector("#sfLeapW").style.display !== "none", hh: +host.querySelector("#sfH").value, mi: +host.querySelector("#sfMi").value, city: host.querySelector("#sfC").value};
      try { calcOf(q); } catch(x) { host.querySelector("#sfErr").textContent = "⚠ " + (x.message || x); return; }
      var L = people(), i = L.findIndex(function(x){ return x.id === q.id; }); if (i >= 0) L[i] = q; else L.push(q);
      if (q.rel === "나") L.sort(function(a, b){ return (b.rel === "나") - (a.rel === "나"); });
      savePeople(L); ls("sj_sel", q.id); again();
    };
    try { host.scrollIntoView({block: "start"}); } catch(x) {}
  }
  function emptyCard(kind){
    return '<div class="card" style="text-align:center;padding:26px 18px"><div style="font-size:46px">' + (kind === "luck" ? "🔮" : "📜") + '</div>' +
      '<h3 style="justify-content:center;font-size:17px;color:var(--text)">' + (kind === "luck" ? "생일을 넣으면 매일 운세가 나와요" : "생일을 넣으면 사주 리포트가 바로 나와요") + '</h3>' +
      '<p class="sj-note" style="font-size:13.5px">' + (kind === "luck" ? "오늘의 점수 · 일 · 돈 · 사람 · 몸 · 행운의 색까지<br>휴대폰 안에서 바로 계산해요 (인터넷 비용·API 없음)" : "8글자 · 다섯 기운 · 10년 대운 · 올해 운 · 별자리까지<br>예전 「나를 읽는 리포트」 모양 그대로 · PDF로 저장") + '</p>' +
      '<button class="sj-btn" data-add2="1" style="margin-top:12px;width:100%">＋ 생일 넣기</button></div>';
  }
  function frame(kind, inner){ return pplBar() + '<div id="sjBody">' + inner + '</div>'; }

  /* ───────── 그림 (SVG) ───────── */
  function ring(v, col, sz){
    sz = sz || 104; var r = sz / 2 - 9, c = 2 * Math.PI * r, f = c * Math.max(0, Math.min(100, v)) / 100;
    return '<svg class="lk-ring" width="' + sz + '" height="' + sz + '" viewBox="0 0 ' + sz + ' ' + sz + '"><circle cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" fill="none" stroke="var(--panel2)" stroke-width="10"/>' +
      '<circle cx="' + sz / 2 + '" cy="' + sz / 2 + '" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="10" stroke-linecap="round" stroke-dasharray="' + f.toFixed(1) + ' ' + c.toFixed(1) + '" transform="rotate(-90 ' + sz / 2 + ' ' + sz / 2 + ')"/>' +
      '<text x="50%" y="49%" text-anchor="middle" dominant-baseline="central" font-size="' + Math.round(sz * 0.3) + '" font-weight="800" fill="var(--text)">' + v + '</text>' +
      '<text x="50%" y="71%" text-anchor="middle" font-size="11" fill="var(--dim)">/ 100</text></svg>';
  }
  function scoreCol(s){ return s >= 85 ? "#38c172" : s >= 72 ? "#7cc46a" : s >= 58 ? "#e9b949" : s >= 44 ? "#f08a4b" : "#e5533d"; }
  function radar(vals, labs){
    var W = 300, H = 270, cx = 150, cy = 138, R = 92, n = vals.length, pt = function(i, r){ var a = -Math.PI / 2 + i * 2 * Math.PI / n; return [cx + r * Math.cos(a), cy + r * Math.sin(a)]; };
    var g = "";
    for (var k = 1; k <= 5; k++){ g += '<polygon points="' + vals.map(function(_, i){ return pt(i, R * k / 5).join(","); }).join(" ") + '" fill="none" stroke="#dfe3ea" stroke-width="1"/>'; }
    vals.forEach(function(_, i){ var p = pt(i, R); g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + p[0] + '" y2="' + p[1] + '" stroke="#e6e9ef"/>'; });
    g += '<polygon points="' + vals.map(function(v, i){ return pt(i, R * v / 5).join(","); }).join(" ") + '" fill="#2e9e5b" fill-opacity=".28" stroke="#2e9e5b" stroke-width="2"/>';
    vals.forEach(function(v, i){ var p = pt(i, R * v / 5), q = pt(i, R + 20); g += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="4.5" fill="#24924f"/><text x="' + q[0] + '" y="' + (q[1] + 4) + '" text-anchor="middle" font-size="13" font-weight="700" fill="#1f2433">' + labs[i] + '</text>'; });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;max-width:320px;display:block;margin:0 auto">' + g + '</svg><div style="text-align:center;font-size:11.5px;color:#7a8396">6가지 영역 한눈에 (5점 만점)</div>';
  }
  function elBars(R){
    var t = T(), E = S().EL, max = Math.max.apply(null, E.map(function(k){ return R.elH[k]; })) || 1, W = 340, H = 210, base = 168, top = 34, g = "";
    E.forEach(function(k, i){
      var x = 22 + i * 64, h1 = (base - top) * R.el[k] / max, h2 = (base - top) * R.elH[k] / max;
      g += '<rect x="' + x + '" y="' + (base - h1) + '" width="22" height="' + h1 + '" rx="4" fill="' + t.EL_COL[k] + '"/>';
      g += '<rect x="' + (x + 26) + '" y="' + (base - h2) + '" width="22" height="' + h2 + '" rx="4" fill="' + t.EL_SOFT[k] + '"/>';
      g += '<text x="' + (x + 11) + '" y="' + (base - h1 - 6) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + t.EL_COL[k] + '">' + R.el[k] + '</text>';
      g += '<text x="' + (x + 37) + '" y="' + (base - h2 - 6) + '" text-anchor="middle" font-size="13" font-weight="800" fill="' + t.EL_COL[k] + '">' + R.elH[k] + '</text>';
      g += '<text x="' + (x + 24) + '" y="' + (base + 22) + '" text-anchor="middle" font-size="14" font-weight="800" fill="#1f2433">' + t.EL_HJ[k] + ' ' + t.EL_KO[k] + '</text>';
    });
    g += '<line x1="12" y1="' + base + '" x2="' + (W - 12) + '" y2="' + base + '" stroke="#cfd5df"/>';
    g += '<rect x="168" y="6" width="11" height="11" rx="2" fill="#555"/><text x="183" y="16" font-size="11.5" fill="#444">겉 8글자</text><rect x="245" y="6" width="11" height="11" rx="2" fill="#c5c9d1"/><text x="260" y="16" font-size="11.5" fill="#444">숨은 글자 포함</text>';
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;display:block">' + g + '</svg>';
  }
  function cycle(R){
    var t = T(), E = ["목", "화", "토", "금", "수"], cx = 150, cy = 128, r = 92, P = {}, g = "", d = R.dg;
    E.forEach(function(k, i){ var a = -Math.PI / 2 + i * 2 * Math.PI / 5; P[k] = [cx + r * Math.cos(a), cy + r * Math.sin(a)]; });
    var arrow = function(a, b, col, dash){ var dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, s = [a[0] + ux * 30, a[1] + uy * 30], f = [b[0] - ux * 32, b[1] - uy * 32];
      return '<line x1="' + s[0] + '" y1="' + s[1] + '" x2="' + f[0] + '" y2="' + f[1] + '" stroke="' + col + '" stroke-width="' + (dash ? 1.3 : 2.2) + '"' + (dash ? ' stroke-dasharray="4 4"' : "") + ' marker-end="url(#ah' + (dash ? "d" : "s") + ')"/>'; };
    g += '<defs><marker id="ahs" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#98a2b3"/></marker><marker id="ahd" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8z" fill="#e8a0a0"/></marker></defs>';
    E.forEach(function(k){ g += arrow(P[k], P[S().SAENG[k]], "#98a2b3", false); g += arrow(P[k], P[S().GEUK[k]], "#e8a0a0", true); });
    E.forEach(function(k){ var gr = S().groupOfEl(d, k);
      g += '<circle cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="27" fill="' + t.EL_COL[k] + '"/><text x="' + P[k][0] + '" y="' + (P[k][1] - 2) + '" text-anchor="middle" font-size="17" font-weight="800" fill="#fff">' + t.EL_HJ[k] + '</text>' +
           '<text x="' + P[k][0] + '" y="' + (P[k][1] + 14) + '" text-anchor="middle" font-size="9.5" fill="#fff">' + (gr === "비겁" ? "나" : t.grpShort(gr, R.sex).replace("·", "")) + ' · ' + R.el[k] + '</text>'; });
    g += '<text x="' + cx + '" y="' + (cy + 2) + '" text-anchor="middle" font-size="10" fill="#7a8396">회색 실선 = 낳아줌</text><text x="' + cx + '" y="' + (cy + 15) + '" text-anchor="middle" font-size="10" fill="#d77">분홍 점선 = 눌러줌</text>';
    return '<svg viewBox="0 0 300 250" style="width:100%;max-width:320px;display:block;margin:0 auto">' + g + '</svg>';
  }
  function relMap(R){
    var ks = ["h", "d", "m", "y"].filter(function(k){ return R.P[k]; }), t = T(), W = 340, x0 = 50, step = (W - 100) / Math.max(1, ks.length - 1), y = 120, X = {}, g = "", up = 0, dn = 0;
    ks.forEach(function(k, i){ X[k] = x0 + i * step; });
    var col = {충: "#e5533d", 형: "#d18b1f", 합: "#2e9e5b", 반합: "#2c5aa0", 해: "#98a2b3", 원진: "#a77bd6"};
    R.rel.filter(function(r){ return r.lv === "b"; }).forEach(function(r, i){
      var a = X[r.a], b = X[r.b], above = (i % 2 === 0), lvl = above ? ++up : ++dn, hgt = 26 + lvl * 20, yy = above ? y - 30 - hgt : y + 30 + hgt;
      g += '<path d="M' + a + ',' + (above ? y - 30 : y + 30) + ' Q' + ((a + b) / 2) + ',' + (above ? y - 30 - hgt * 2 : y + 30 + hgt * 2) + ' ' + b + ',' + (above ? y - 30 : y + 30) + '" fill="none" stroke="' + (col[r.t] || "#999") + '" stroke-width="2.2"' + (r.t === "해" || r.t === "원진" ? ' stroke-dasharray="5 4"' : "") + '/>';
      g += '<text x="' + ((a + b) / 2) + '" y="' + (above ? yy - 2 : yy + 12) + '" text-anchor="middle" font-size="11.5" font-weight="700" fill="' + (col[r.t] || "#999") + '">' + r.s + ' ' + r.t + (r.el ? "(" + t.EL_KO[r.el] + ")" : "") + '</text>';
    });
    ks.forEach(function(k){ var ch = R.P[k][1];
      g += '<circle cx="' + X[k] + '" cy="' + y + '" r="27" fill="' + t.EL_COL[S().JI_EL[ch]] + '"/><text x="' + X[k] + '" y="' + (y + 9) + '" text-anchor="middle" font-size="25" font-weight="800" fill="#fff">' + ch + '</text>' +
           '<text x="' + X[k] + '" y="' + (y + 44) + '" text-anchor="middle" font-size="11" fill="#7a8396">' + t.POSJ[k] + '</text>'; });
    var H = 240 + Math.max(0, Math.max(up, dn) - 2) * 40;
    return '<svg viewBox="0 ' + (-Math.max(0, up - 2) * 40) + ' ' + W + ' ' + H + '" style="width:100%;display:block">' + g + '</svg>';
  }
  function daeunChart(L, cur){
    var W = 340, H = 200, l = 18, r = W - 14, top = 26, bot = 140, n = L.length, xs = function(i){ return l + 12 + i * (r - l - 24) / (n - 1); }, ys = function(s){ return bot - (s - 1) / 4 * (bot - top); };
    var g = '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none"/>';
    [1, 3, 5].forEach(function(s){ g += '<line x1="' + l + '" x2="' + r + '" y1="' + ys(s) + '" y2="' + ys(s) + '" stroke="#e3e7ef" stroke-dasharray="3 4"/><text x="' + (l - 2) + '" y="' + (ys(s) - 4) + '" font-size="9.5" fill="#9aa3b5">' + (s === 5 ? "최고" : s === 3 ? "보통" : "힘듦") + '</text>'; });
    if (cur >= 0) g += '<rect x="' + (xs(cur) - 17) + '" y="' + (top - 16) + '" width="34" height="' + (bot - top + 22) + '" rx="8" fill="#ffe9a8" fill-opacity=".55"/><text x="' + xs(cur) + '" y="' + (top - 4) + '" text-anchor="middle" font-size="11" font-weight="800" fill="#c58a00">지금</text>';
    g += '<path d="M' + L.map(function(x, i){ return xs(i) + "," + ys(x.stars); }).join(" L") + ' L' + xs(n - 1) + ',' + bot + ' L' + xs(0) + ',' + bot + 'z" fill="#2e9e5b" fill-opacity=".1"/>';
    g += '<polyline points="' + L.map(function(x, i){ return xs(i) + "," + ys(x.stars); }).join(" ") + '" fill="none" stroke="#2e9e5b" stroke-width="3" stroke-linejoin="round"/>';
    L.forEach(function(x, i){ g += '<circle cx="' + xs(i) + '" cy="' + ys(x.stars) + '" r="' + (i === cur ? 7 : 5) + '" fill="#fff" stroke="' + (i === cur ? "#e5533d" : "#2e9e5b") + '" stroke-width="3"/>' +
      '<text x="' + xs(i) + '" y="' + (bot + 20) + '" text-anchor="middle" font-size="13" font-weight="800" fill="#1f2433">' + x.p + '</text><text x="' + xs(i) + '" y="' + (bot + 35) + '" text-anchor="middle" font-size="9.5" fill="#7a8396">' + x.age[0] + '~' + x.age[1] + '</text>'; });
    return '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;display:block">' + g + '</svg>';
  }
  function gauge(p){
    var W = 320, g = "", lab = ["많이 약함", "약함", "균형", "강함", "많이 강함"], cols = ["#c9d6ee", "#a9c1ea", "#9ad0b0", "#f2c48a", "#ee9c86"];
    lab.forEach(function(s, i){ g += '<rect x="' + (10 + i * 60) + '" y="22" width="58" height="14" rx="3" fill="' + cols[i] + '"/><text x="' + (39 + i * 60) + '" y="54" text-anchor="middle" font-size="10.5" fill="#5d667a">' + s + '</text>'; });
    var x = 10 + Math.max(0, Math.min(100, p)) / 100 * 298;
    g += '<path d="M' + (x - 7) + ',6 L' + (x + 7) + ',6 L' + x + ',19z" fill="#1e2742"/><text x="' + x + '" y="4" text-anchor="middle" font-size="0">.</text>';
    return '<svg viewBox="0 0 ' + W + ' 62" style="width:100%;display:block">' + g + '</svg>';
  }
  function grpBars(R){
    var t = T(), G = ["식상", "재성", "관성", "인성", "비겁"], max = Math.max.apply(null, G.map(function(k){ return R.grp[k]; })) || 1, g = "";
    G.forEach(function(k, i){ var w = 150 * R.grp[k] / max, el = S().elOfGroup(R.dg, k);
      g += '<text x="0" y="' + (16 + i * 26) + '" font-size="12" font-weight="700" fill="#1f2433">' + t.grpShort(k, R.sex) + '</text><rect x="64" y="' + (5 + i * 26) + '" width="' + Math.max(4, w) + '" height="15" rx="4" fill="' + t.EL_COL[el] + '"/><text x="' + (70 + Math.max(4, w)) + '" y="' + (17 + i * 26) + '" font-size="12" font-weight="800" fill="' + t.EL_COL[el] + '">' + R.grp[k] + '</text>'; });
    return '<svg viewBox="0 0 240 132" style="width:100%;max-width:260px;display:block">' + g + '</svg>';
  }
  function wheel(R){
    var t = T(), A = R.astro, cx = 165, cy = 165, r1 = 150, r2 = 118, g = "", fill = {불: "#fbe1dc", 흙: "#f6ebd3", 공기: "#e8eef7", 물: "#dfe7f3"};
    var asc = A.asc ? A.asc.lon : 0, ang = function(lon){ return Math.PI - (lon - asc) * Math.PI / 180; };   // 상승궁이 왼쪽(9시)
    for (var i = 0; i < 12; i++){
      var a0 = ang(i * 30), a1 = ang(i * 30 + 30), p = function(a, r){ return [cx + r * Math.cos(a), cy - r * Math.sin(a)]; };
      var A0 = p(a0, r1), A1 = p(a1, r1), B0 = p(a0, r2), B1 = p(a1, r2), sg = t.ZFULL[i];
      g += '<path d="M' + B0 + ' L' + A0 + ' A' + r1 + ',' + r1 + ' 0 0 0 ' + A1 + ' L' + B1 + ' A' + r2 + ',' + r2 + ' 0 0 1 ' + B0 + 'z" fill="' + fill[t.ZEL[sg]] + '" stroke="#fff" stroke-width="2"/>';
      var m = p(ang(i * 30 + 15), (r1 + r2) / 2);
      g += '<text x="' + m[0] + '" y="' + (m[1] - 2) + '" text-anchor="middle" font-size="14" fill="#56607a">' + t.ZSYM[i] + '</text><text x="' + m[0] + '" y="' + (m[1] + 11) + '" text-anchor="middle" font-size="8.5" fill="#56607a">' + t.ZSHORT[i] + '</text>';
    }
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r2 + '" fill="#f7f8fb" stroke="#dfe3ea"/><circle cx="' + cx + '" cy="' + cy + '" r="70" fill="none" stroke="#e3e7ef" stroke-dasharray="3 4"/>';
    if (A.asc) g += '<line x1="' + (cx - r1 - 6) + '" y1="' + cy + '" x2="' + (cx + r1 + 6) + '" y2="' + cy + '" stroke="#1f2433" stroke-dasharray="6 5" stroke-width="1.5"/><text x="' + (cx - r1 + 2) + '" y="' + (cy - 6) + '" font-size="11" font-weight="800" fill="#1f2433">ASC</text>';
    [["sun", "☉", "#e8a200", "태양"], ["moon", "☽", "#6b7cc0", "달"]].forEach(function(q, k){
      var a = ang(A[q[0]].lon), rr = k ? 62 : 88, x = cx + rr * Math.cos(a), y = cy - rr * Math.sin(a);
      g += '<line x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '" stroke="' + q[2] + '" stroke-width="2"/><circle cx="' + x + '" cy="' + y + '" r="15" fill="' + q[2] + '"/><text x="' + x + '" y="' + (y + 6) + '" text-anchor="middle" font-size="17" fill="#fff">' + q[1] + '</text>' +
           '<text x="' + x + '" y="' + (y - 20) + '" text-anchor="middle" font-size="10.5" font-weight="700" fill="' + q[2] + '">' + q[3] + '</text>'; });
    g += '<circle cx="' + cx + '" cy="' + cy + '" r="4" fill="#1f2433"/>';
    return '<svg viewBox="0 0 330 330" style="width:100%;max-width:300px;display:block;margin:0 auto">' + g + '</svg>';
  }
  function stars(v){ var f = Math.floor(v), h = v - f >= 0.5, s = ""; for (var i = 0; i < 5; i++) s += i < f ? "★" : (i === f && h ? "½" : "<i>★</i>"); return '<span class="qst">' + s + '</span>'; }
  function elTag(k){ return '<span class="qeltag" style="background:' + T().EL_COL[k] + '">' + T().EL_HJ[k] + ' ' + T().EL_KO[k] + '</span>'; }

  /* ───────── 오늘의 운세 ───────── */
  var LK = {off: 0};
  function luckData(R, off){
    var t = T(), s = S(), dd = s.todayKST(off), L = s.dayLuck(R, dd.y, dd.m, dd.d), sc = L.score, G = s.SS_GROUP;
    var gG = G[L.gSS], bG = G[L.bSS], seed = (R.name || "") + dd.y + dd.m + dd.d;
    var head = null; t.HEAD.forEach(function(h){ if (!head && sc >= h[0]) head = pick(h[1], seed); });
    var es = function(el){ return R.ES[el] || 0; }, gE = L.gEl, bE = L.bEl;
    var jit = function(k){ return hash(seed + k) % 7 - 3; };
    var area = function(targets, extra){ var v = 22 + sc * 0.62 + jit(targets.join("")); [[gG, gE], [bG, bE]].forEach(function(x){ if (targets.indexOf(x[0]) >= 0) v += es(x[1]) >= 1 ? 12 : es(x[1]) === 0 ? 4 : -9; }); return Math.max(12, Math.min(98, Math.round(v + (extra || 0)))); };
    var dCh = L.tags.some(function(x){ return x.t === "충" && x.k === "d"; }), dHap = L.tags.some(function(x){ return (x.t === "합" || x.t === "반합") && x.k === "d"; }), hy = L.tags.some(function(x){ return x.t === "형"; });
    var invV = Math.max(12, Math.min(98, Math.round(22 + sc * 0.62 + jit("inv") + [[gG, gE], [bG, bE]].reduce(function(v, x){ return v + (x[0] === "재성" ? (es(x[1]) >= 0 ? 10 : -6) : x[0] === "식상" ? (es(x[1]) >= 0 ? 5 : -3) : x[0] === "비겁" ? -5 : 0) + (es(x[1]) >= 1 ? 4 : es(x[1]) < 0 ? -4 : 0); }, 0) - (dCh ? 10 : 0) - (hy ? 4 : 0))));
    var invD = t.INV_DAY[gG] || t.INV_DAY.재성;
    var areas = [
      ["📈", "투자", invV, invD.t + " — " + invD.ok],
      ["💼", "일", area(["관성", "식상"]), (t.AREA[gG] || {}).일],
      ["💰", "돈", area(["재성"], gG === "비겁" ? -4 : 0), (t.AREA[gG === "재성" || bG !== "재성" ? gG : bG] || {}).돈],
      ["🤝", "사람", area(["비겁", "인성"], (dHap ? 8 : 0) - (dCh ? 10 : 0)), (t.AREA[bG] || {}).사람],
      ["💕", "연애 · 가족", area(["식상", "재성", "관성"], (dHap ? 8 : 0) - (dCh ? 12 : 0)), (t.AREA2[bG] || {}).연애],
      ["📚", "공부 · 자기계발", area(["인성", "식상"]), (t.AREA2[gG] || {}).공부],
      ["🚗", "이동 · 외출", Math.max(12, Math.min(98, Math.round(22 + sc * 0.62 + jit("move") + (L.tags.some(function(x){ return x.t === "충"; }) ? -10 : 4)))), (t.AREA2[bG] || {}).이동],
      ["💪", "몸 · 컨디션", Math.max(12, Math.min(98, Math.round(22 + sc * 0.62 + jit("body") + es(bE) * 4 - (dCh ? 12 : 0) - (hy ? 5 : 0)))), (t.AREA[bG] || {}).몸]
    ];
    var tips = [];
    L.tags.forEach(function(x){ var k = x.t === "충" ? "충" + (x.k === "d" || x.k === "m" || x.k === "y" || x.k === "h" ? x.k : "") : (x.t === "합" || x.t === "반합") && x.k === "d" ? "합d" : x.t;
      if (t.TIP[k] && tips.indexOf(t.TIP[k]) < 0) tips.push(t.TIP[k]); });
    if (!tips.length) tips.push(sc >= 58 ? "평소 하던 대로 하면 충분해요" : "오늘은 큰 결정보다 정리하는 날");
    var luckyEl = es(bE) >= 1 ? bE : es(gE) >= 1 ? gE : (hash(seed) % 2 ? R.yong : R.hui);
    var col = t.COLW[luckyEl][hash(seed + "c") % 2], nums = t.NUMW[luckyEl];
    var good = s.JI.filter(function(b){ var pr = s.jiPair(b, L.p[1]); return (s.CHEONEUL[R.dg].indexOf(b) >= 0 || pr.some(function(q){ return (q.t === "합" || q.t === "반합") && es(q.el) >= 0; })) && !pr.some(function(q){ return q.t === "충"; }); })
      .filter(function(b){ return "卯辰巳午未申酉戌亥".indexOf(b) >= 0; }).slice(0, 2);
    // ① 총평: 오늘 들어오는 기운(하늘 글자 기준) + 나에게 맞는지
    var dEs = Math.round((es(gE) + es(bE)) / 2), en = t.DAYEN[gG] || ["", ""];
    var story = [en[0] + " " + en[1], t.ESNOTE[String(Math.max(-2, Math.min(2, dEs)))]];
    if (dHap) story.push("오늘 글자가 내 자리(" + R.P.d[1] + ")와 손을 잡아서 사람 운이 따라와요.");
    if (dCh) story.push("오늘 글자가 내 자리(" + R.P.d[1] + ")와 부딪혀서 마음이 흔들리기 쉬워요. 오늘은 반 박자 천천히!");
    var tri = L.tags.filter(function(x){ return (x.t === "삼합" || x.t === "방합") && x.v > 0; })[0];
    if (tri) story.push("흩어져 있던 " + t.EL_KO[tri.el] + " 기운이 한데 모이는 날이라 힘이 커져요.");
    if (L.tags.some(function(x){ return x.t === "귀인"; })) story.push("도와주는 귀인 글자가 들어오는 날이에요. 부탁할 일이 있으면 오늘!");
    // ② 시간대별
    var dayP = L.p, periods = t.PERIOD.map(function(P){
      var v = P.br.map(function(b){ var hp = s.hourPillar(dayP[0], b), x = s.luckScore(R, hp, [{p: dayP, tag: "오늘"}]); return x.s; });
      var avg = v.reduce(function(a, b){ return a + b; }, 0) / v.length, scv = Math.max(15, Math.min(97, Math.round(sc * 0.5 + 30 + avg * 7)));
      return {P: P, sc: scv}; });
    var bestP = periods.slice().sort(function(a, b){ return b.sc - a.sc; })[0];
    // ③ 띠
    var ani = function(b){ return t.JI_ANI[b] + "띠"; }, okB = [], noB = [];
    s.JI.forEach(function(b){ var pr = s.jiPair(b, dayP[1]); if (pr.some(function(q){ return q.t === "합" || q.t === "반합"; })) okB.push(b); if (pr.some(function(q){ return q.t === "충"; })) noB.push(b); });
    // ④ 할 일 · 피할 일
    var dos = (t.DO[gG] || []).slice(0, 2).concat((t.DO[R.yong === "목" ? "비겁" : s.groupOfEl(R.dg, R.yong)] || []).slice(0, 1)).filter(function(v, i, a){ return a.indexOf(v) === i; });
    var donts = []; L.tags.forEach(function(x){ if (t.DONT[x.t] && donts.indexOf(t.DONT[x.t]) < 0) donts.push(t.DONT[x.t]); });
    if (donts.length < 2) donts.push(t.DONT[bG] || t.DONT[gG]);
    // ⑤ 오늘의 별자리 (오늘 낮 12시 달 자리 ↔ 태어난 태양)
    var jd = s.jdUT(dd.y, dd.m, dd.d, 3), mz = t.ZFULL[Math.floor(s.moonLon(jd) / 30)], me = R.astro.sun.sign, e1 = t.ZEL[mz], e2 = t.ZEL[me];
    var pairOK = {불: "공기", 공기: "불", 흙: "물", 물: "흙"}, zrel = e1 === e2 ? "같음" : pairOK[e1] === e2 ? "맞음" : "다름";
    // ⑥ 한마디 · 이번 달 · 올해 · 내일
    var word = pick(t.WORD[sc >= 72 ? "hi" : sc >= 50 ? "mid" : "lo"], seed + "w");
    var ml = s.monthLuck(R, dd.y, dd.m, 1, dd.d)[0], yl = s.yearLuck(R, dd.y);
    var itemEl = luckyEl;
    var style = null; t.INV_STYLE.forEach(function(x){ if (!style && invV >= x[0]) style = x[1]; });
    var invTips = []; L.tags.forEach(function(x){ var k = (x.t === "합" || x.t === "반합") && x.k === "d" ? "합d" : x.t; if (t.INV_TAG[k] && invTips.indexOf(t.INV_TAG[k]) < 0) invTips.push(t.INV_TAG[k]); });
    var invTimes = t.INV_TIME.map(function(q){ var v = q.br.split("").map(function(b){ return s.luckScore(R, s.hourPillar(L.p[0], b), [{p: L.p, tag: "오늘"}]).s; }); return {q: q, v: v.reduce(function(a, b){ return a + b; }, 0) / v.length}; });
    var invBest = invTimes.slice().sort(function(a, b){ return b.v - a.v; })[0], invWorst = invTimes.slice().sort(function(a, b){ return a.v - b.v; })[0];
    var secEls = [R.yong, (es(bE) >= 1 ? bE : es(gE) >= 1 ? gE : R.hui)].filter(function(v, i, a){ return a.indexOf(v) === i; });
    var inv = {v: invV, style: style, d: invD, tips: invTips.slice(0, 2), best: invBest, worst: invWorst, secs: secEls, avoidSec: R.gi, word: pick(t.INV_WORD, seed + "iw")};
    return {dd: dd, L: L, sc: sc, head: head, areas: areas, tips: tips.slice(0, 3), col: col, num: nums[hash(seed + "n") % 2], dir: t.DIRW[luckyEl], good: good, gG: gG, bG: bG,
      story: story, periods: periods, bestP: bestP, okB: okB.map(ani), noB: noB.map(ani), dos: dos, donts: donts.slice(0, 2), item: t.ITEM[itemEl], avoidCol: t.COLW[R.gi][0], avoidDir: t.DIRW[R.gi],
      mz: mz, zrel: zrel, word: word, ml: ml, yl: yl, inv: inv};
  }
  function renderLuck(){
    var root = document.getElementById("sjL"); if (!root) return;
    css();
    if (!ready()){ root.innerHTML = '<div class="loading">불러오는 중…</div>'; setTimeout(renderLuck, 300); return; }
    var p = sel();
    if (!p){ root.innerHTML = frame("luck", emptyCard("luck")); bindPpl(root, renderLuck); root.querySelector("[data-add2]").onclick = function(){ formOpen(root, null, renderLuck); }; return; }
    var R; try { R = calcOf(p); } catch(x) { root.innerHTML = frame("luck", '<div class="card">계산하지 못했어요: ' + e(x.message || x) + '</div>'); bindPpl(root, renderLuck); return; }
    var t = T(), D = luckData(R, LK.off), dd = D.dd, c = scoreCol(D.sc);
    var dayStr = (LK.off === 0 ? "오늘 · " : LK.off === 1 ? "내일 · " : "") + dd.m + "월 " + dd.d + "일 (" + WD[dd.w] + ")";
    var gr = t.GRAD(D.sc), cardEl = D.L.bEl, CD = t.CARD[cardEl], flipKey = "sj_flip_" + p.id + "_" + dd.y + dd.m + dd.d, flipped = !!ls(flipKey);
    var h = '<div class="lk-hero lk-pop" style="background:linear-gradient(140deg,' + gr[0] + ',' + gr[1] + ')">' + twinkles(14, dayStr) + '<div class="ani">' + (t.ANI_EMO[D.L.p[1]] || "✨") + '</div>' +
      '<div class="sub">' + dayStr + ' · ' + e(p.name) + ' 님</div><div style="display:flex;align-items:flex-end;gap:12px;margin-top:6px"><div class="sc" id="lkSc">0<small>점</small></div><div style="padding-bottom:6px"><span class="gd">' + t.GRADE(D.sc) + '</span></div></div>' +
      '<div class="meter"><i style="width:' + D.sc + '%"></i></div><div class="hd">' + e(D.head) + '</div>' +
      '<div class="chips"><span>' + (t.ANI_EMO[D.L.p[1]] || "") + ' ' + t.DAYNAME(D.L.p) + ' 날 · ' + t.read(D.L.p) + '일</span><span>' + EMO_EL[D.L.gEl] + ' ' + t.EL_KO[D.L.gEl] + ' · ' + EMO_EL[D.L.bEl] + ' ' + t.EL_KO[D.L.bEl] + '</span><span>🍀 ' + D.col + ' · ' + D.num + '</span></div></div>';
    h += '<div class="lk-flipw lk-pop" style="animation-delay:.1s"><div class="lk-flip' + (flipped ? " on" : "") + '" id="lkFlip"><div class="lk-face lk-front">' + twinkles(10, "f" + dayStr) + '<div class="q">🔮</div><b>오늘의 카드 뽑기</b><small>눌러서 카드를 뒤집어 보세요</small></div>' +
      '<div class="lk-face lk-back" style="background:linear-gradient(150deg,' + CD.c1 + ',' + CD.c2 + ')">' + twinkles(8, "b" + dayStr) + '<div class="ic">' + CD.ic + '</div><b>' + CD.n + '</b><div class="k">' + CD.k + '</div><p>' + CD.m + '</p><p style="font-size:12px;opacity:.85;margin-top:6px">「' + e(D.word) + '」</p></div></div></div>';
    var IV = D.inv, ivc = scoreCol(IV.v), rr = 34, cc = 2 * Math.PI * rr;
    h += '<div class="card lk-pop" style="border:1.5px solid ' + IV.style.c + '66;background:linear-gradient(160deg,' + IV.style.c + '1f,var(--panel) 55%)"><h3>📈 오늘의 투자운 <small style="font-weight:500;color:var(--dim)">재미로 보는 투자 기운</small></h3>' +
      '<div style="display:flex;gap:14px;align-items:center"><svg viewBox="0 0 84 84" style="width:84px;flex:none"><circle cx="42" cy="42" r="' + rr + '" fill="none" stroke="var(--panel2)" stroke-width="8"/><circle cx="42" cy="42" r="' + rr + '" fill="none" stroke="' + ivc + '" stroke-width="8" stroke-linecap="round" stroke-dasharray="' + (cc * IV.v / 100).toFixed(1) + ' ' + cc.toFixed(1) + '" transform="rotate(-90 42 42)"/><text x="42" y="48" text-anchor="middle" font-size="22" font-weight="900" fill="var(--text)">' + IV.v + '</text></svg>' +
      '<div style="min-width:0"><div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap"><span class="lk-g" style="background:' + IV.style.c + ';color:#111;font-size:13px">' + IV.style.ic + ' 오늘은 「' + IV.style.n + '」 모드</span></div><div style="font-size:16px;font-weight:800;margin:6px 0 2px">' + e(IV.d.t) + '</div><div style="font-size:13.5px;color:var(--sub);line-height:1.5">' + e(IV.d.m) + '</div></div></div>' +
      '<div style="display:flex;gap:4px;margin:12px 0 4px">' + t.INV_STYLE.slice().reverse().map(function(x){ var on = x[1].n === IV.style.n; return '<div style="flex:1;text-align:center;padding:6px 2px;border-radius:10px;font-size:12px;font-weight:800;background:' + (on ? x[1].c : "var(--panel2)") + ';color:' + (on ? "#111" : "var(--dim)") + '">' + x[1].ic + ' ' + x[1].n + '</div>'; }).join("") + '</div>' +
      '<div class="lk-lucky" style="margin-top:10px"><div><small>매매 타이밍</small><b style="font-size:13.5px">👍 ' + IV.best.q.n + '<br><span style="font-weight:600;color:var(--sub)">' + IV.best.q.t + '</span></b></div>' +
      '<div><small>쉬어 갈 때</small><b style="font-size:13.5px">🐢 ' + IV.worst.q.n + '<br><span style="font-weight:600;color:var(--sub)">' + IV.worst.q.t + '</span></b></div>' +
      '<div style="grid-column:1/-1"><small>오늘 기운과 어울리는 업종 (오행)</small><b style="font-size:13.5px">' + IV.secs.map(function(k){ return t.INV_SECTOR[k][0] + ' ' + t.INV_SECTOR[k][1]; }).join("<br>") + '</b><small style="margin-top:3px">한 박자 쉬어 볼 쪽 — ' + t.INV_SECTOR[IV.avoidSec][0] + ' ' + t.INV_SECTOR[IV.avoidSec][1] + '</small></div></div>' +
      '<div style="margin-top:10px"><div class="lk-tip"><span>✅</span><span>' + e(IV.d.ok) + '</span></div><div class="lk-tip"><span>🚫</span><span>' + e(IV.d.no) + '</span></div>' + IV.tips.map(function(x){ return '<div class="lk-tip"><span>⚠️</span><span>' + e(x) + '</span></div>'; }).join("") + '</div>' +
      '<div style="text-align:center;font-weight:800;font-size:15px;margin:10px 0 4px">💬 「' + e(IV.word) + '」</div>' +
      '<div class="lk-mw" id="lkMkt" role="button"><span class="lk-mwi">🌐</span><div><small>오늘 진짜 시장 날씨</small><b id="lkMktT">불러오는 중…</b></div><i>›</i></div>' +
      '<p class="sj-note">⚠️ 사주로 본 재미 운세예요. 업종은 오행에 맞춘 놀이일 뿐 추천이 아니고, 실제 투자 판단은 시황 · 포트 · 상품 정보를 보고 하세요.</p></div>';
    h += '<div class="card"><h3>오늘의 이야기</h3>' + D.story.map(function(x){ return '<p style="margin:0 0 8px;font-size:14.5px;line-height:1.65">' + e(x) + '</p>'; }).join("") +
      '<div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:4px"><span class="lk-g" style="background:var(--panel2);color:var(--sub)">오늘 글자 ' + D.L.p + '</span><span class="lk-g" style="background:var(--panel2);color:var(--sub)">' + t.EL_KO[D.L.gEl] + ' · ' + t.EL_KO[D.L.bEl] + ' 기운</span><span class="lk-g" style="background:var(--panel2);color:var(--sub)">내게 ' + t.grpShort(D.gG, R.sex) + ' 글자</span></div></div>';
    var addEl = {}; addEl[D.L.gEl] = (addEl[D.L.gEl] || 0) + 1; addEl[D.L.bEl] = (addEl[D.L.bEl] || 0) + 1;
    var mxE = Math.max.apply(null, S().EL.map(function(k){ return R.elH[k] + (addEl[k] || 0); }));
    h += '<div class="card"><h3>오늘 내 몸의 다섯 기운 <small style="font-weight:500;color:var(--dim)">빗금 = 오늘 더해진 기운</small></h3><div class="lk-el">' + S().EL.map(function(k){ var b = R.elH[k], a = addEl[k] || 0, role = R.role[k];
      return '<div class="r"><span>' + EMO_EL[k] + ' ' + t.EL_KO[k] + '</span><div class="bb"><i style="width:' + (b / mxE * 100) + '%;background:' + t.EL_COL[k] + '"></i>' + (a ? '<i class="add" style="width:' + (a / mxE * 100) + '%;background-color:' + t.EL_COL[k] + '"></i>' : "") + '</div><small style="color:' + (role === "용신" || role === "희신" ? "#38c172" : role === "기신" || role === "구신" ? "#f08a4b" : "var(--dim)") + ';font-weight:800">' + (role === "용신" ? "필요" : role === "희신" ? "도움" : role === "기신" ? "조심" : role === "구신" ? "부담" : "보통") + '</small></div>'; }).join("") +
      '</div><p class="sj-note">' + (function(){ var g = Object.keys(addEl).filter(function(k){ return (R.ES[k] || 0) > 0; }), b = Object.keys(addEl).filter(function(k){ return (R.ES[k] || 0) < 0; });
        return (g.length ? "오늘은 내게 필요한 " + g.map(function(k){ return t.EL_KO[k]; }).join("·") + " 기운이 채워져요 👍 " : "") + (b.length ? b.map(function(k){ return t.EL_KO[k]; }).join("·") + " 기운은 조금 부담 — 무리하지 않기." : g.length ? "" : "무난한 기운이 들어오는 날이에요."); })() + '</p></div>';
    h += '<div class="card"><h3>오늘 여덟 가지</h3><div class="lk-areas">' + D.areas.map(function(a){ var cc = scoreCol(a[2]);
      return '<div class="lk-a"><span class="qi">' + a[0] + '</span><div><b>' + a[1] + '</b> <small style="color:' + cc + ';font-weight:800">' + a[2] + '점</small><div class="bar"><i style="width:' + a[2] + '%;background:' + cc + '"></i></div><p>' + e(a[3] || "") + '</p></div></div>'; }).join("") + '</div></div>';
    h += '<div class="card"><h3>시간대별 흐름 <small style="font-weight:500;color:var(--dim)">가장 좋은 때: ' + D.bestP.P.n + '</small></h3><div style="display:grid;gap:8px">' + D.periods.map(function(q){ var cc = scoreCol(q.sc), ok = q.sc >= 58;
      return '<div style="display:grid;grid-template-columns:28px 64px 1fr;gap:8px;align-items:center"><span style="font-size:19px">' + q.P.ic + '</span><div><b style="font-size:14px">' + q.P.n + '</b><br><small style="color:var(--dim)">' + q.P.t + '</small></div>' +
        '<div><div class="lk-a" style="display:block"><div class="bar" style="margin:0 0 4px"><i style="width:' + q.sc + '%;background:' + cc + '"></i></div></div><small style="color:var(--sub);font-size:13px">' + (ok ? "👍 " + q.P.good : "🐢 " + q.P.bad) + '</small></div></div>'; }).join("") + '</div></div>';
    h += '<div class="card"><h3>오늘의 행운</h3><div class="lk-lucky">' +
      '<div><small>행운의 색</small><b><span class="lk-dot" style="background:' + (t.COLHEX[D.col] || "#888") + '"></span>' + D.col + '</b></div>' +
      '<div><small>행운의 숫자</small><b>' + D.num + '</b></div><div><small>좋은 방향</small><b>' + D.dir + '</b></div>' +
      '<div><small>좋은 시간</small><b style="font-size:13.5px">' + (D.good.length ? D.good.map(function(b){ return t.HOUR[b]; }).join("<br>") : D.bestP.P.n + " " + D.bestP.P.t) + '</b></div>' +
      '<div><small>행운 아이템</small><b style="font-size:13.5px">' + D.item.item + '</b></div><div><small>행운 음식</small><b style="font-size:13.5px">' + D.item.food + '</b></div>' +
      '<div><small>가면 좋은 곳</small><b style="font-size:13.5px">' + D.item.place + '</b></div><div><small>잘 맞는 띠</small><b style="font-size:13.5px">' + (D.okB.join(" · ") || "모두 무난") + '</b></div></div></div>';
    h += '<div class="card"><h3>오늘 할 일 · 피할 일</h3>' + D.dos.map(function(x){ return '<div class="lk-tip"><span>✅</span><span>' + e(x) + '</span></div>'; }).join("") +
      D.donts.map(function(x){ return '<div class="lk-tip"><span>🚫</span><span>' + e(x) + '</span></div>'; }).join("") +
      D.tips.map(function(x){ return '<div class="lk-tip"><span>' + (/조심|확인|거리|갈팡|바빠|바뀔|신경/.test(x) ? "⚠️" : "💡") + '</span><span>' + e(x) + '</span></div>'; }).join("") +
      '<p class="sj-note" style="margin-top:8px">피하면 좋은 것 — ' + D.avoidCol + ' 옷 · ' + D.avoidDir + ' 방향 큰 일' + (D.noB.length ? ' · 오늘 부딪히기 쉬운 띠: ' + D.noB.join(" · ") : "") + '</p></div>';
    h += '<div class="card"><h3>오늘의 별자리</h3><p style="margin:0 0 6px;font-size:14.5px">오늘 달은 <b>' + D.mz + '</b>(' + t.ZEL[D.mz] + ' · ' + t.ZMOODT[t.ZEL[D.mz]] + ')에 있고, 나는 <b>' + R.astro.sun.sign + '</b> 태양이에요.</p><p style="margin:0;font-size:14px;color:var(--sub)">' + t.ZTODAY[D.zrel] + '</p></div>';
    h += '<div class="card" style="text-align:center"><h3 style="justify-content:center">오늘의 한마디</h3><div style="font-size:17px;font-weight:700;line-height:1.55;padding:2px 8px 4px">「' + e(D.word) + '」</div></div>';
    // 이번 주
    var wk = []; for (var i = 0; i < 7; i++){ var q = luckData(R, i); wk.push(q); }
    h += '<div class="card"><h3>이번 주 흐름 <small style="font-weight:500;color:var(--dim)">막대를 누르면 그날 운세</small></h3><div class="lk-week">' + wk.map(function(q, i){
      return '<button data-off="' + i + '" class="' + (i === LK.off ? "on" : "") + '"><small style="font-weight:800;color:' + scoreCol(q.sc) + '">' + q.sc + '</small><i style="height:' + Math.max(8, (q.sc - 10) * 0.9) + 'px;background:' + scoreCol(q.sc) + '"></i>' + (i === 0 ? "오늘" : WD[q.dd.w]) + '</button>'; }).join("") + '</div>' +
      (LK.off < 6 ? '<p class="sj-note" style="margin-top:10px">🔭 ' + (LK.off === 0 ? "내일" : "다음 날") + ' 미리 보기 — <b style="color:' + scoreCol(wk[LK.off + 1].sc) + '">' + wk[LK.off + 1].sc + '점</b> · ' + e(wk[LK.off + 1].head) + '</p>' : "") + '</div>' +
      (function(){ var td = S().todayKST(0), sd = S().todayKST(LK.off), first = new Date(Date.UTC(sd.y, sd.m - 1, 1)), days = new Date(Date.UTC(sd.y, sd.m, 0)).getUTCDate(), lead = first.getUTCDay(), base = Date.UTC(td.y, td.m - 1, td.d), cells = "";
        for (var i = 0; i < lead; i++) cells += '<button class="x"></button>';
        for (var d = 1; d <= days; d++){ var x = S().dayLuck(R, sd.y, sd.m, d), off = Math.round((Date.UTC(sd.y, sd.m - 1, d) - base) / 86400e3);
          cells += '<button data-off="' + off + '" class="' + (off === 0 ? "td " : "") + (off === LK.off ? "sel" : "") + '" style="background:' + scoreCol(x.score) + '">' + d + '<small>' + x.score + '</small></button>'; }
        return '<div class="card"><h3>' + sd.m + '월 운세 달력 <small style="font-weight:500;color:var(--dim)">날짜를 누르면 그날 운세</small></h3><div class="lk-cal">' + WD.map(function(w){ return '<div class="w">' + w + '</div>'; }).join("") + cells + '</div>' +
          '<div style="display:flex;flex-wrap:wrap;gap:6px 12px;justify-content:center;margin-top:14px;font-size:11.5px;color:var(--dim);position:relative;clear:both">' + [[90, "아주 좋음"], [75, "좋음"], [60, "보통"], [48, "조심"], [30, "쉬기"]].map(function(q){ return '<span><i style="display:inline-block;width:9px;height:9px;border-radius:3px;background:' + scoreCol(q[0]) + ';margin-right:3px"></i>' + q[1] + '</span>'; }).join("") + '</div></div>'; })() +
      '<div class="card"><h3>더 길게 보면</h3><div class="lk-lucky"><div><small>이번 달 (' + D.ml.from.m + '/' + D.ml.from.d + '~' + D.ml.to.m + '/' + D.ml.to.d + ' · ' + D.ml.p + ')</small><b>' + D.ml.grade + '</b><small style="margin-top:3px;color:var(--sub)">' + e((t.tagText(D.ml.tags[0] || {}, R) || t.EL_KO[D.ml.gEl] + " · " + t.EL_KO[D.ml.bEl] + " 기운의 달")) + '</small></div>' +
      '<div><small>올해 (' + D.yl.year + ' · ' + D.yl.p + ')</small><b>' + D.yl.grade + '</b><small style="margin-top:3px;color:var(--sub)">' + e((t.tagText(D.yl.tags[0] || {}, R) || t.EL_KO[D.yl.gEl] + " · " + t.EL_KO[D.yl.bEl] + " 기운의 해")) + '</small></div></div><p class="sj-note">자세한 흐름은 📜 사주 리포트에서 볼 수 있어요.</p></div>';
    var L = people(); if (L.length > 1){
      h += '<div class="card"><h3>모두의 오늘</h3><div class="lk-all">' + L.map(function(x){ var r, sc = "–"; try { r = calcOf(x); sc = luckData(r, LK.off).sc; } catch(z) {}
        return '<button data-id="' + e(x.id) + '"><span>' + (x.rel === "고객" ? "💼" : x.rel === "가족" ? "🏠" : x.rel === "나" ? "🙂" : "👤") + '</span><span>' + e(x.name) + '</span><span class="s" style="color:' + scoreCol(+sc || 0) + '">' + sc + '</span></button>'; }).join("") + '</div></div>';
    }
    h += '<div class="lk-share"><button id="lkShare">💬 오늘 운세 보내기</button><button class="b2" id="lkCopy">📋 글로 복사</button></div>';
    h += '<div class="sj-btns" style="margin:4px 0 10px"><button class="sj-btn g" id="lkRep">📜 ' + e(p.name) + ' 님 사주 리포트 보기</button></div>' +
      '<p class="sj-note">🔮 오늘의 운세는 그날의 기운(일진)과 태어난 사주를 비교해 휴대폰 안에서 계산한 거예요. 재미로 보는 참고이고, 투자 · 건강 판단의 근거가 아니에요.</p>';
    root.innerHTML = frame("luck", h);
    bindPpl(root, renderLuck);
    [].forEach.call(root.querySelectorAll("[data-off]"), function(b){ b.onclick = function(){ LK.off = +b.dataset.off; renderLuck(); }; });
    [].forEach.call(root.querySelectorAll(".lk-all [data-id]"), function(b){ b.onclick = function(){ ls("sj_sel", b.dataset.id); renderLuck(); window.scrollTo({top: 0, behavior: "smooth"}); }; });
    var rp = root.querySelector("#lkRep"); if (rp) rp.onclick = function(){ if (window.go) go("saju"); };
    countUp(root.querySelector("#lkSc"), D.sc);
    var mk = root.querySelector("#lkMkt"); if (mk){ mk.onclick = function(){ if (window.go) go("home"); };   // 🔮→🏠 10/31 C5 운세 보러 온 사람을 시장으로
      if (window.mktWeather) mktWeather().then(function(w){ var t = root.querySelector("#lkMktT"); if (t && w) t.textContent = w.ic + " " + w.w + " — " + w.line; }).catch(function(){}); }
    var fl = root.querySelector("#lkFlip"); if (fl) fl.onclick = function(){ fl.classList.toggle("on"); ls(flipKey, fl.classList.contains("on") ? 1 : 0); try { if (navigator.vibrate) navigator.vibrate(12); } catch(x) {} };
    var txt = "🔮 " + p.name + " 님의 " + dd.m + "월 " + dd.d + "일 운세\n" + D.sc + "점 · " + t.GRADE(D.sc) + "\n" + D.head + "\n\n" + D.areas.map(function(a){ return a[0] + " " + a[1] + " " + a[2] + "점 — " + (a[3] || ""); }).join("\n") +
      "\n\n📈 투자운 " + D.inv.v + "점 · " + D.inv.style.ic + " " + D.inv.style.n + " 모드 — " + D.inv.d.m + "\n💬 「" + D.inv.word + "」" + "\n\n🍀 행운의 색 " + D.col + " · 숫자 " + D.num + " · 방향 " + D.dir + "\n" + CD.ic + " 오늘의 카드: " + CD.n + " — " + CD.m + "\n💬 「" + D.word + "」\n\n(재미로 보는 운세 · CH Investing)";
    var sh = root.querySelector("#lkShare"); if (sh) sh.onclick = function(){ if (navigator.share){ navigator.share({title: "오늘의 운세", text: txt}).catch(function(){}); } else copyText(txt, sh); };
    var cp = root.querySelector("#lkCopy"); if (cp) cp.onclick = function(){ copyText(txt, cp); };
  }
  /* 🔮 10/31 C5 홈에 「오늘 투자운 N점」 칩 — 생일이 이 휴대폰에 저장된 사람만 (계산은 휴대폰 안에서) */
  window.luckToday = function(){
    try { var p = sel(); if (!p || !ready()) return null; var D = luckData(calcOf(p), 0); return {name: p.name, sc: D.sc, inv: D.inv && D.inv.v, word: D.inv && D.inv.word}; } catch(x) { return null; }
  };
  window.luckView = function(){ return '<div id="sjL" class="no-clp tidy-x ez-no" data-noemo="1"><div class="loading">불러오는 중…</div></div>'; };
  window.luckInit = function(){ LK.off = 0; renderLuck(); };

  /* ───────── 사주 리포트 — 글 만들기 ───────── */
  var STEMIMG = {甲: "큰 나무", 乙: "꽃", 丙: "해", 丁: "촛불", 戊: "산", 己: "밭", 庚: "바위", 辛: "보석", 壬: "강", 癸: "비"};
  var STEMVERB = {甲: "선", 乙: "핀", 丙: "뜬", 丁: "켜진", 戊: "솟은", 己: "펼쳐진", 庚: "놓인", 辛: "빛나는", 壬: "흐르는", 癸: "내리는"};
  var SEASONW = {寅: "이른 봄", 卯: "한봄", 辰: "늦봄", 巳: "초여름", 午: "한여름", 未: "늦여름", 申: "초가을", 酉: "한가을", 戌: "늦가을", 亥: "초겨울", 子: "한겨울", 丑: "늦겨울"};
  function josa(w, a, b){ var c = w.charCodeAt(w.length - 1) - 44032; return (c >= 0 && c <= 11171 && c % 28) ? a : b; }
  var NUMKO = ["", "하나", "두", "세", "네", "다섯"];
  function oneLine(R){
    var t = T(), dg = R.dg, ig = t.ILGAN[dg], cnt = {};
    R.pos.forEach(function(k){ if (k !== "d") cnt[R.P[k][0]] = (cnt[R.P[k][0]] || 0) + 1; });
    var rep = Object.keys(cnt).sort(function(a, b){ return cnt[b] - cnt[a]; })[0], img = STEMIMG[rep], n = cnt[rep];
    var where = {丙: "위에", 丁: "곁에", 癸: "위로", 壬: "곁에", 甲: "곁에", 乙: "곁에", 戊: "뒤에", 己: "아래", 庚: "곁에", 辛: "곁에"}[rep];
    var verb = {丙: "떠 있는", 丁: "켜진", 癸: "내리는", 壬: "흐르는", 甲: "서 있는", 乙: "피어 있는", 戊: "솟은", 己: "펼쳐진", 庚: "놓인", 辛: "빛나는"}[rep];
    return "「" + SEASONW[R.P.m[1]] + "에 " + STEMVERB[dg] + " " + ig.short + ", 그 " + where + " " + img + josa(img, "이", "가") + " " + (n > 1 ? NUMKO[n] + " 개 " : "") + verb + " 그림」";
  }
  function seasonLine(R){
    var t = T(), sn = R.season;
    if (!sn) return "온화한 계절에 태어나 온도보다는 「힘의 균형」이 중요한 사주입니다.";
    var cold = sn === "화";
    if (R.el[sn] > 0) return (cold ? "추운" : "더운") + " 계절에 태어났지만 " + (cold ? "따뜻한 " : "시원한 ") + t.EL_KO[sn] + "(" + t.EL_HJ[sn] + ") 기운이 " + R.el[sn] + "개 있어 " + (cold ? "꽃이 얼지 않고 피어나는" : "열기를 식혀 주는") + " 사주입니다.";
    return (cold ? "추운" : "더운") + " 계절에 태어났는데 " + t.EL_KO[sn] + "(" + t.EL_HJ[sn] + ") 기운이 모자라, " + (cold ? "따뜻함(햇볕·사람의 온기)" : "시원함(쉼·물)") + "이 가장 필요한 사주입니다.";
  }
  function missing(R){ return S().EL.filter(function(k){ return !R.el[k]; }); }
  function sixScores(R){
    var g = R.grp, sinN = function(n){ return R.sin.filter(function(s){ return s.n === n; }).length; }, gm = R.sin.filter(function(s){ return s.n === "공망"; }).map(function(s){ return s.ch; });
    var gui = R.sin.filter(function(s){ return /귀인/.test(s.n); }), guiGm = gui.some(function(s){ return gm.indexOf(s.ch) >= 0; });
    var miss = missing(R).length, maxEl = Math.max.apply(null, S().EL.map(function(k){ return R.el[k]; }));
    var clamp = function(v){ return Math.max(1, Math.min(5, Math.round(v * 2) / 2)); };
    var expr = clamp(1.5 + g.식상 * 1.2 + (R.astro.moon && T().ZEL[R.astro.moon.sign] === "불" ? 0.3 : 0));
    var bal = clamp(5 - miss * 1.2 - Math.max(0, maxEl - 3) * 0.8);
    var inb = clamp(2 + Math.min(2, gui.length * 0.8) + (g.인성 ? 0.8 : 0) - (guiGm ? 0.8 : 0));
    var spouseEl = R.sex === "M" ? "재성" : "관성", sp = g[spouseEl];
    var dayCh = R.rel.some(function(r){ return r.lv === "b" && r.t === "충" && (r.a === "d" || r.b === "d"); }), dayHap = R.rel.some(function(r){ return (r.t === "합") && (r.a === "d" || r.b === "d"); });
    var money = clamp(1.8 + Math.min(2, g.재성 * 0.8) + (g.식상 && g.재성 ? 0.8 : 0) - (!R.strong && g.재성 >= 3 ? 0.6 : 0) + (R.strong && g.재성 ? 0.4 : 0));
    var spouse = clamp(2.6 + (sp === 1 || sp === 2 ? 0.9 : sp ? 0.2 : -0.6) + (dayHap ? 0.7 : 0) - (dayCh ? 0.8 : 0) - (R.sex === "F" && R.sgg ? 0.5 : 0));
    var shock = R.rel.filter(function(r){ return r.t === "충"; }).length + R.rel.filter(function(r){ return r.t === "형"; }).length * 0.6 + R.rel.filter(function(r){ return r.t === "원진" || r.t === "해"; }).length * 0.3;
    var stab = clamp(4.6 - shock * 0.7 + (R.sin.some(function(s){ return /록/.test(s.n); }) ? 0.3 : 0));
    return {표현력: expr, 인복: inb, 재물: money, 안정: stab, 배우자: spouse, 균형: bal, dayHap: dayHap, dayCh: dayCh, gui: gui, guiGm: guiGm};
  }
  function curDaeunIdx(R){ var a = S().todayKST().y - R.solar.y; for (var i = 0; i < R.daeun.list.length; i++){ var x = R.daeun.list[i]; if (x.age[0] <= a && a <= x.age[1]) return i; } return -1; }
  function fourSentences(R, SC, DL){
    var t = T(), out = [], g = R.grp, miss = missing(R);
    out.push(miss.length ? ["다섯 기운 중 " + miss.map(function(k){ return t.EL_KO[k]; }).join("·") + josa(t.EL_KO[miss[miss.length - 1]], "이", "가") + " 비어 있습니다.", "빈 기운은 생활(색·사람·습관)로 채우면 균형이 잡힙니다.", "#2e9e5b"]
      : ["다섯 기운이 모두 있습니다.", S().EL.map(function(k){ return t.EL_KO[k] + R.el[k]; }).join("·") + " — 빠진 게 없는 「고른 사주」입니다. 흔치 않은 복입니다.", "#2e9e5b"]);
    var top = ["식상", "재성", "관성", "인성", "비겁"].sort(function(a, b){ return g[b] - g[a]; })[0];
    var topTxt = {식상: ["표현의 사주입니다.", "말·가르침·손재주로 드러낼 때 빛납니다." + (g.재성 ? " 이게 돈으로도 이어집니다." : "")], 재성: ["현실 감각의 사주입니다.", "돈과 일의 흐름을 잘 읽습니다. 체력 안에서 벌면 오래 갑니다."],
      관성: ["책임의 사주입니다.", "조직·자리에서 인정받는 힘이 있습니다. 압박은 나눠서 집니다."], 인성: ["배움의 사주입니다.", "공부·자격·윗사람의 도움이 길을 엽니다."], 비겁: ["자립의 사주입니다.", "내 힘으로 서고, 동료와 함께할 때 커집니다."]}[top];
    out.push([topTxt[0], topTxt[1], "#e5533d"]);
    var gh = R.rel.filter(function(r){ return r.lv === "g" && r.t === "합" && (r.a === "d" || r.b === "d"); })[0];
    if (gh){ var other = gh.a === "d" ? gh.b : gh.a, oss = S().sipsin(R.dg, R.P[other][0]);
      out.push([(S().SS_GROUP[oss] === (R.sex === "M" ? "재성" : "관성") ? (R.sex === "M" ? "아내" : "남편") + " 글자와 내가 「합」으로 묶였습니다." : t.POSS[other] + "의 " + R.P[other][0] + josa(R.P[other][0], "과", "와") + " 내가 「합」으로 묶였습니다."),
        t.POSM[other] + " 자리의 " + R.P[other][0] + josa(R.P[other][0], "과", "와") + " " + gh.s + "합 — 인연의 끈이 강한 배치입니다.", "#8a96a8"]);
    } else if (SC.dayCh){ var c = R.rel.filter(function(r){ return r.lv === "b" && r.t === "충" && (r.a === "d" || r.b === "d"); })[0];
      out.push(["내 자리(" + R.P.d[1] + ")가 부딪힘을 품고 있습니다.", c.s + "충 — 변화가 많은 대신 움직이며 길을 엽니다.", "#8a96a8"]);
    } else out.push(["간판은 「" + R.gyeok + "」입니다.", (t.GYEOK[R.gyeok] || ["", ""])[1], "#8a96a8"]);
    var ci = curDaeunIdx(R), cd = DL[ci];
    if (cd) out.push(["지금(" + cd.age[0] + "~" + cd.age[1] + "세)" + (cd.stars >= 4 ? "이 꽃 피는 10년입니다." : cd.stars >= 3 ? "은 무난히 다지는 10년입니다." : "은 뿌리를 다지는 10년입니다."),
      cd.p + " 대운 — " + t.EL_KO[cd.gEl] + "(" + t.esWord(R.ES[cd.gEl] || 0) + ")·" + t.EL_KO[cd.bEl] + "(" + t.esWord(R.ES[cd.bEl] || 0) + ") 기운이 옵니다.", "#d49a2a"]);
    else out.push(["첫 대운은 " + R.daeun.start + "세에 시작합니다.", "그 전까지는 타고난 원국의 힘으로 자랍니다.", "#d49a2a"]);
    return out;
  }
  function moneyPart(R, DL, YL){
    var t = T(), g = R.grp, rows = [], rx = [];
    var jae = R.chars.filter(function(c){ return S().SS_GROUP[c.ss] === "재성"; }), jeong = jae.filter(function(c){ return c.ss === "정재"; }).length, pyeon = jae.length - jeong;
    rows.push(["돈 글자 " + g.재성 + "개" + (g.재성 ? " (" + (jeong ? "정재" + (pyeon ? "·" : "") : "") + (pyeon ? "편재" : "") + ")" : ""),
      !g.재성 ? "겉으로 드러난 돈 글자가 없습니다. 돈을 좇기보다 실력·자리를 키우면 돈이 따라오는 구조입니다." : jeong >= pyeon ? "꾸준히 모으는 돈입니다. 한 방보다 월급·고정수입·적금·부동산이 맞습니다." : "크게 움직이는 돈입니다. 사업·영업·투자 감각이 있지만 들고 나는 폭도 큽니다."]);
    var hidJ = R.hidden.reduce(function(n, h){ return n + h.g.filter(function(x){ return S().SS_GROUP[x.ss] === "재성"; }).length; }, 0);
    if (hidJ) rows[0][1] += " 숨은 글자에도 돈 글자가 " + hidJ + "개 더 있어 생각보다 돈 그릇이 큽니다.";
    if (g.식상 && g.재성){ rows.push(["표현 → 돈 통로", "표현 글자가 돈 글자를 낳습니다. 명리에서 식상생재 — 「말·기술·가르침이 돈이 된다」고 합니다. 상담 · 강의 · 판매 · 서비스 · 손기술이 돈이 됩니다."]); rx.push(["「말과 기술」로 벌 것", "표현 글자가 돈 글자를 낳는 구조. 내가 아는 것을 알려주고 파는 방식."]); }
    var stores = R.pos.filter(function(k){ return "辰戌丑未".indexOf(R.P[k][1]) >= 0 && S().groupOfEl(R.dg, S().JI_EL[R.P[k][1]]) === "재성"; });
    var stCh = R.rel.some(function(r){ return r.lv === "b" && r.t === "충" && "辰戌丑未".indexOf(r.s[0]) >= 0 && "辰戌丑未".indexOf(r.s[1]) >= 0; });
    if (stores.length){ rows.push(["돈 창고 " + stores.length + "개 (" + stores.map(function(k){ return R.P[k][1]; }).join("·") + ")", stores.map(function(k){ return R.P[k][1]; }).join("·") + "은 「창고 글자」입니다." + (stCh ? " 창고끼리 충이라 문이 열리며 들어오고 나가는 규모가 큽니다. 목돈이 생기면 바로 「묶어두는」 것이 중요합니다." : " 모으는 힘이 있습니다.")]);
      if (stCh) rx.push(["목돈은 바로 묶기", "창고 충 — 열려 있으면 샙니다. 적금 · 연금 · 실물 자산으로 「문을 닫아두기」."]); }
    if (!R.strong && g.재성 >= 2){ rows.push(["힘 조절", "나는 살짝 약한데 돈 글자가 " + g.재성 + "개. 명리에서 「재가 많으면 몸이 지친다」고 봅니다. 돈 욕심보다 체력이 먼저입니다."]); }
    if (R.strong && g.재성) rows.push(["힘이 받쳐 줌", "내 힘이 넉넉해 돈을 다룰 체력이 있습니다. 직접 굴리고 키우는 돈과 맞습니다."]);
    var yongRx = {비겁: ["좋은 동료와 함께", "가장 필요한 게 내 편(나무처럼 나와 같은 기운). 믿을 만한 1~2명과 나누면 오히려 커집니다."], 인성: ["공부·자격이 돈이 됨", "가장 필요한 게 도움 글자. 배움·자격·윗사람의 추천이 수입으로 이어집니다."],
      식상: ["재주를 꺼내 쓰기", "가장 필요한 게 표현 글자. 숨은 재주를 상품으로 만드는 것이 재물운입니다."], 재성: ["직접 굴리는 돈", "가장 필요한 게 돈 글자. 계획을 세워 꾸준히 굴리면 커집니다."], 관성: ["자리에서 오는 돈", "가장 필요한 게 자리 글자. 조직·직함·신용이 곧 재물입니다."]}[S().groupOfEl(R.dg, R.yong)];
    rx.push(yongRx);
    var bad = YL.filter(function(y){ return y.stars <= 1.5; }).map(function(y){ return y.year; }).slice(0, 2);
    if (bad.length) rx.push([bad.join("년 · ") + "년은 지키기", "필요한 기운과 어긋나는 해. 큰 투자 · 보증 · 무리한 확장은 쉬어가세요."]);
    return {rows: rows, rx: rx.slice(0, 4)};
  }
  function loveKid(R, DL, YL){
    var t = T(), M = R.sex === "M", spG = M ? "재성" : "관성", kidG = M ? "관성" : "식상", sp = R.chars.filter(function(c){ return S().SS_GROUP[c.ss] === spG && c.ss !== "일간"; });
    var spEl = S().elOfGroup(R.dg, spG), kidEl = S().elOfGroup(R.dg, kidG), spWord = M ? "아내" : "남편";
    var good = [], warn = [];
    if (!sp.length) good.push(spWord + " 글자가 겉에 드러나 있지 않습니다. 인연은 늦게 · 뜻밖에 오는 편이고, 오는 운(대운·해)에 맞춰 열립니다.");
    else if (sp.length === 1) good.push(spWord + " 글자(" + sp[0].ch + ")가 " + t.POSS[sp[0].pos] + " 자리에 딱 하나 — 인연이 흩어지지 않고 한 사람에게 모이는 형태입니다.");
    else good.push(spWord + " 글자가 " + sp.length + "개 — 인연의 기회가 많고, 고르는 눈이 중요합니다.");
    var gh = R.rel.filter(function(r){ return r.lv === "g" && r.t === "합" && (r.a === "d" || r.b === "d"); })[0];
    if (gh){ var ot = gh.a === "d" ? gh.b : gh.a; if (S().SS_GROUP[S().sipsin(R.dg, R.P[ot][0])] === spG) good.push("나와 " + gh.s + "합 — 서로 끌리는 힘이 강하고, 정이 깊은 배치입니다."); }
    good.push(spEl === "금" ? "쇠(" + t.EL_HJ[spEl] + ") — 원칙 있고 책임감 강한 사람이 인연입니다." : spEl === "목" ? "나무 — 곧고 성장하는 사람이 인연입니다." : spEl === "화" ? "불 — 밝고 표현이 큰 사람이 인연입니다." : spEl === "토" ? "흙 — 듬직하고 믿음직한 사람이 인연입니다." : "물 — 지혜롭고 유연한 사람이 인연입니다.");
    if (!M && R.sgg) warn.push("표현 글자(상관)가 남편 글자(정관)를 누르는 모양입니다. 「내 말이 맞는데 왜 몰라줘?」가 다툼의 씨앗이 되기 쉽습니다.");
    if (M && R.grp.비겁 >= 3) warn.push("내 편 글자가 많아 아내 글자를 나눠 갖는 모양입니다. 돈 · 시간을 아내와 먼저 상의하는 습관이 약입니다.");
    var dRel = R.rel.filter(function(r){ return r.lv === "b" && (r.a === "d" || r.b === "d") && (r.t === "충" || r.t === "형" || r.t === "원진"); });
    dRel.forEach(function(r){ warn.push("내 자리(" + R.P.d[1] + ")가 " + r.s + r.t + " — " + (r.t === "충" ? "부딪힘이 있어 서로의 공간을 존중하는 것이 중요합니다." : r.t === "형" ? "가까운 사람에게 말이 거칠어지기 쉬운 배치입니다." : "괜한 서운함이 쌓이기 쉬워 표현을 자주 하는 게 좋습니다.")); });
    warn.push("처방: 「3초 쉬고 말하기」, 「고마워」를 먼저. 말의 온도만 낮추면 인연의 힘이 훨씬 커집니다.");
    // 시기
    var times = [];
    DL.slice(0, 8).forEach(function(x, i){ if (S().SS_GROUP[x.bSS] === spG || S().SS_GROUP[x.gSS] === spG) times.push([x.age[0] + "~" + x.age[1] + "세 " + x.p + " 대운", spWord + " 글자가 들어오는 10년 — 인연 · 결혼의 계기가 되기 쉬운 시기입니다."]); });
    YL.forEach(function(y){ if (S().SS_GROUP[y.bSS] === spG || S().SS_GROUP[y.gSS] === spG) times.push([y.year + " " + y.p, spWord + " 글자가 오는 해. 함께 새로 시작하기 좋습니다(여행 · 집 · 공동 목표)."]); });
    YL.forEach(function(y){ if (y.tags.some(function(q){ return q.t === "충" && q.k === "d"; })) times.push([y.year + " " + y.p, "내 자리를 충. 부부 모두 건강 · 감정 관리의 해."]); });
    // 자녀
    var kids = R.chars.filter(function(c){ return S().SS_GROUP[c.ss] === kidG; }).length, kidH = R.hidden.reduce(function(n, h){ return n + h.g.filter(function(x){ return S().SS_GROUP[x.ss] === kidG; }).length; }, 0);
    var kl = [];
    kl.push(kids ? "자녀 글자가 " + kids + "개" + (kidH ? "(숨은 글자 " + kidH + "개 더)" : "") + " — 자녀와의 인연이 뚜렷합니다. " + (kidEl === "화" ? "해처럼 밝고 표현력 큰 자녀와 인연입니다." : kidEl === "목" ? "곧게 자라는 성실한 자녀와 인연입니다." : kidEl === "토" ? "듬직하고 믿음직한 자녀와 인연입니다." : kidEl === "금" ? "야무지고 원칙 있는 자녀와 인연입니다." : "영리하고 생각 깊은 자녀와 인연입니다.")
      : "자녀 글자가 겉에 드러나 있지 않습니다. 자녀 인연은 늦거나 적은 편이지만, 숨은 글자" + (kidH ? "(" + kidH + "개)" : "") + "로 이어집니다.");
    if (R.P.h){
      var hs = R.sin.filter(function(s){ return s.pos === "h"; }).map(function(s){ return s.n; });
      kl.push("자녀 자리(시주)가 " + R.P.h + (hs.length ? " (" + hs.join("·") + ")" : "") + " — " + (hs.indexOf("백호") >= 0 ? "기가 세고 활동적인 자녀. 잔소리보다 「믿고 맡기기」가 통합니다." : "자녀 · 말년의 모습이 " + T().EL_KO[S().GAN_EL[R.P.h[0]]] + "·" + T().EL_KO[S().JI_EL[R.P.h[1]]] + " 기운입니다."));
      var hd = R.rel.filter(function(r){ return r.lv === "b" && ((r.a === "h" && r.b === "d") || (r.a === "d" && r.b === "h")); });
      hd.forEach(function(r){ kl.push("내 자리와 자녀 자리가 " + r.s + r.t + " — " + (r.t === "합" || r.t === "반합" ? "말년에 자녀와 가까이 지내는 모양입니다." : r.t === "충" ? "자녀와 떨어져 지내는 시기가 한 번쯤 있습니다." : "생각 차이를 인정하면 오히려 편해집니다.")); });
    }
    return {good: good, warn: warn, times: times.slice(0, 5), kids: kl, spWord: spWord, spEl: spEl};
  }
  function echo(R){
    var t = T(), A = R.astro, out = [], fire = [A.moon, A.asc].filter(function(x){ return x && t.ZEL[x.sign] === "불"; }).length + (t.ZEL[A.sun.sign] === "불" ? 1 : 0);
    var earth = [A.sun, A.moon, A.asc].filter(function(x){ return x && t.ZEL[x.sign] === "흙"; }).length, water = [A.sun, A.moon, A.asc].filter(function(x){ return x && t.ZEL[x.sign] === "물"; }).length;
    var cdI = curDaeunIdx(R), DL = S().daeunLuck(R), peak = DL.reduce(function(b, x, i){ return x.stars > DL[b].stars ? i : b; }, 0);
    if (R.grp.식상 >= 2 && fire >= 1) out.push(["표현 · 밝음", "표현 글자 " + R.grp.식상 + "개", "불 별자리 " + fire + "개", "밖으로 드러내고 표현하는 사람"]);
    if (DL[peak] && DL[peak].age[0] >= 40 && (A.sun.sign === "염소자리" || A.sun.sign === "황소자리" || earth >= 1)) out.push(["늦게 피는 꽃", "가장 좋은 대운 " + DL[peak].age[0] + "세부터", A.sun.sign + " 등 흙 별자리", "늦게 피어 오래 가는 사람"]);
    if ((R.grp.재성 + R.grp.관성) >= 3 && earth >= 1) out.push(["책임 · 현실", "돈 · 자리 글자 " + (R.grp.재성 + R.grp.관성) + "개", "흙 별자리 " + earth + "개", "현실적이고 책임감 있게 산다"]);
    if (R.grp.인성 >= 2 && water >= 1) out.push(["직관 · 깊이", "도움 글자 " + R.grp.인성 + "개", "물 별자리 " + water + "개", "속이 깊고 직관이 좋은 사람"]);
    if ((R.sgg || R.grp.식상 >= 2) && A.moon && (t.ZEL[A.moon.sign] === "불" || A.moon.sign === "쌍둥이자리")) out.push(["말이 앞섬", R.sgg ? "상관(표현)이 자리 글자를 누름" : "표현 글자 " + R.grp.식상 + "개", A.moon.sign + " 달 — 급하고 직설적", "옳은 말도 타이밍과 온도가 중요"]);
    if (!out.length) out.push(["타고난 결", R.dg + " " + t.ILGAN[R.dg].short + " · " + R.gyeok, A.sun.sign + " 태양", t.ILGAN[R.dg].desc.split(".")[0]]);
    var ang = Math.abs(((A.moon.lon - A.sun.lon) % 360 + 540) % 360 - 180), sq = Math.abs(ang - 90) < 10, op = Math.abs(ang - 180) < 10, cj = ang < 10;
    var mind = sq ? ["머리와 마음의 박자가 다름", "태양(" + A.sun.sign.replace("자리", "") + ")과 달(" + A.moon.sign.replace("자리", "") + ")이 90도 관계라 속으로 갈등이 잦습니다. 「계획은 " + A.sun.sign.replace("자리", "") + "처럼, 시작은 " + A.moon.sign.replace("자리", "") + "처럼」 — 둘 다 쓰면 강점이 됩니다."]
      : op ? ["밖과 안이 마주 봄", "태양과 달이 정반대 자리 — 겉과 속의 차이를 잘 다루면 균형 감각이 뛰어납니다."] : cj ? ["겉과 속이 같음", "태양과 달이 같은 자리 — 생각과 마음이 한 방향이라 추진력이 큽니다."]
      : ["머리와 마음", "태양(" + A.sun.sign.replace("자리", "") + ")은 겉으로 보이는 나, 달(" + A.moon.sign.replace("자리", "") + ")은 속마음 — 둘의 결을 함께 보면 나를 더 잘 이해할 수 있습니다."];
    return {rows: out, mind: mind, fire: fire};
  }


  /* ───────── 우와 업그레이드: 공통 그림 ───────── */
  var EMO_EL = {목: "🌳", 화: "🔥", 토: "⛰️", 금: "💎", 수: "💧"};
  function countUp(el, to){ if (!el) return; var t0 = null, d = 1100; (function f(ts){ if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / d), v = Math.round(to * (1 - Math.pow(1 - k, 3))); el.firstChild.nodeValue = v; if (k < 1) requestAnimationFrame(f); })(performance.now()); requestAnimationFrame(function(ts){}); }
  function twinkles(n, seed){ var h = ""; for (var i = 0; i < n; i++){ var a = hash(seed + i), x = a % 100, y = (a >> 7) % 100, sz = 2 + (a >> 3) % 3, dl = ((a >> 5) % 26) / 10; h += '<i class="tw" style="left:' + x + '%;top:' + y + '%;width:' + sz + 'px;height:' + sz + 'px;animation-delay:' + dl + 's"></i>'; } return h; }
  function donut(R, sz){
    var t = T(), E = S().EL, tot = E.reduce(function(a, k){ return a + R.elH[k]; }, 0) || 1, r = 52, c = 2 * Math.PI * r, off = 0, g = "";
    E.forEach(function(k){ var f = c * R.elH[k] / tot; g += '<circle cx="70" cy="70" r="' + r + '" fill="none" stroke="' + t.EL_COL[k] + '" stroke-width="22" stroke-dasharray="' + f.toFixed(2) + ' ' + (c - f).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 70 70)"/>'; off += f; });
    var yg = R.yong;
    g += '<text x="70" y="62" text-anchor="middle" font-size="11" fill="#7a8396">가장 필요</text><text x="70" y="88" text-anchor="middle" font-size="19" font-weight="800" fill="' + t.EL_COL[yg] + '">' + t.EL_HJ[yg] + ' ' + t.EL_KO[yg] + '</text>';
    return '<svg viewBox="0 0 140 140" style="width:' + (sz || 140) + 'px;display:block;margin:0 auto">' + g + '</svg><div style="display:flex;flex-wrap:wrap;gap:4px 8px;justify-content:center;font-size:11px;color:#5d667a;margin-top:4px">' +
      E.map(function(k){ return '<span><i style="display:inline-block;width:8px;height:8px;border-radius:2px;background:' + t.EL_COL[k] + ';margin-right:3px"></i>' + t.EL_KO[k] + ' ' + R.elH[k] + '</span>'; }).join("") + '</div>';
  }
  function coverArt(R){
    var g = '<defs><radialGradient id="sjmg" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#ffd98a" stop-opacity=".95"/><stop offset=".45" stop-color="#ffcf7a" stop-opacity=".35"/><stop offset="1" stop-color="#ffcf7a" stop-opacity="0"/></radialGradient></defs>';
    for (var i = 0; i < 26; i++){ var a = hash("st" + i + R.dg), x = 10 + a % 330, y = 6 + (a >> 6) % 150, r = 0.8 + (a >> 3) % 3 * 0.6; g += '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" fill="#fff" opacity="' + (0.4 + (a % 5) / 10) + '"><animate attributeName="opacity" values=".2;1;.2" dur="' + (2 + a % 3) + 's" begin="' + (a % 20) / 10 + 's" repeatCount="indefinite"/></circle>'; }
    g += '<circle cx="62" cy="58" r="58" fill="url(#sjmg)"/><circle cx="62" cy="58" r="24" fill="#ffd37a"/>';
    var el = R.dEl, col = {목: "#ff8fb1", 화: "#ffb35c", 토: "#f6d36b", 금: "#e9eef8", 수: "#8fc4ff"}[el];
    g += '<path d="M140,170 C190,120 250,110 340,70" stroke="#7a5a3a" stroke-width="6" fill="none" stroke-linecap="round"/><path d="M230,108 C240,90 262,86 280,92" stroke="#7a5a3a" stroke-width="3.5" fill="none" stroke-linecap="round"/>';
    [[200, 118, 9], [262, 96, 11], [300, 80, 8], [235, 104, 6], [172, 142, 7]].forEach(function(f){ for (var k = 0; k < 5; k++){ var an = k * 72 * Math.PI / 180; g += '<circle cx="' + (f[0] + Math.cos(an) * f[2] * 0.62) + '" cy="' + (f[1] + Math.sin(an) * f[2] * 0.62) + '" r="' + f[2] * 0.55 + '" fill="' + col + '"/>'; } g += '<circle cx="' + f[0] + '" cy="' + f[1] + '" r="' + f[2] * 0.32 + '" fill="#ffdd55"/>'; });
    return '<svg viewBox="0 0 350 170" style="width:100%;display:block;margin:2px 0 6px">' + g + '</svg>';
  }
  function lifeCurve(R){
    var s = S(), pts = [], y0 = R.solar.y, now = s.todayKST().y, ag = now - y0;
    for (var a = 0; a <= 89; a++){ var L = s.yearLuck(R, y0 + a); pts.push({a: a, v: L.stars, y: y0 + a, p: L.p}); }
    var sm = pts.map(function(x, i){ var w = pts.slice(Math.max(0, i - 4), i + 5); return w.reduce(function(q, z){ return q + z.v; }, 0) / w.length; });
    var W = 340, H = 190, l = 14, r = W - 10, top = 22, bot = 140, xs = function(a){ return l + a * (r - l) / 89; }, ys = function(v){ return bot - (v - 1) / 4 * (bot - top); };
    var g = '<defs><linearGradient id="sjlc" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7b5cff" stop-opacity=".45"/><stop offset="1" stop-color="#7b5cff" stop-opacity="0"/></linearGradient></defs>';
    R.daeun.list.forEach(function(d, i){ if (d.age[0] > 89) return; var x0 = xs(Math.max(0, d.age[0])), x1 = xs(Math.min(89, d.age[1] + 1)); g += '<rect x="' + x0 + '" y="' + top + '" width="' + (x1 - x0) + '" height="' + (bot - top) + '" fill="' + (i % 2 ? "#f3f5fa" : "#fff") + '"/><text x="' + (x0 + x1) / 2 + '" y="' + (bot + 14) + '" text-anchor="middle" font-size="9" fill="#9aa3b5">' + d.p + '</text>'; });
    var path = sm.map(function(v, i){ return (i ? "L" : "M") + xs(i).toFixed(1) + "," + ys(v).toFixed(1); }).join(" ");
    g += '<path d="' + path + ' L' + xs(89) + ',' + bot + ' L' + xs(0) + ',' + bot + 'z" fill="url(#sjlc)"/><path d="' + path + '" fill="none" stroke="#6a4cff" stroke-width="2.6" stroke-linejoin="round"/>';
    var peaks = sm.map(function(v, i){ return {i: i, v: v}; }).filter(function(x){ return x.i >= 18 && x.i < 88 && x.v >= sm[x.i - 1] && x.v >= sm[x.i + 1]; }).sort(function(a, b){ return b.v - a.v; });
    var pk = []; peaks.forEach(function(x){ if (pk.length < 3 && pk.every(function(q){ return Math.abs(q.i - x.i) > 10; })) pk.push(x); });
    pk.forEach(function(x){ g += '<circle cx="' + xs(x.i) + '" cy="' + ys(x.v) + '" r="4.5" fill="#ff6fb5" stroke="#fff" stroke-width="1.5"/><text x="' + xs(x.i) + '" y="' + (ys(x.v) - 9) + '" text-anchor="middle" font-size="10.5" font-weight="800" fill="#d4357f">' + x.i + '세 ★</text>'; });
    if (ag >= 0 && ag <= 89) g += '<line x1="' + xs(ag) + '" x2="' + xs(ag) + '" y1="' + (top - 4) + '" y2="' + bot + '" stroke="#e9a400" stroke-width="2" stroke-dasharray="4 3"/><circle cx="' + xs(ag) + '" cy="' + ys(sm[ag]) + '" r="6" fill="#e9a400" stroke="#fff" stroke-width="2"><animate attributeName="r" values="5;8;5" dur="1.6s" repeatCount="indefinite"/></circle><text x="' + xs(ag) + '" y="' + (top - 7) + '" text-anchor="middle" font-size="10.5" font-weight="800" fill="#c58a00">지금 ' + ag + '세</text>';
    [0, 20, 40, 60, 80].forEach(function(a){ g += '<text x="' + xs(a) + '" y="' + (bot + 28) + '" text-anchor="middle" font-size="10" fill="#7a8396">' + a + '세</text>'; });
    return {svg: '<svg viewBox="0 0 ' + W + ' ' + H + '" style="width:100%;display:block">' + g + '</svg>', peaks: pk.map(function(x){ return x.i; }).sort(function(a, b){ return a - b; })};
  }
  function heatCol(st){ return st >= 4.5 ? "#169466" : st >= 3.5 ? "#4cb882" : st >= 2.5 ? "#c9a227" : st >= 1.5 ? "#e8834a" : "#d9493a"; }
  /* 💞 궁합 — 두 사람 */
  function compat(A, B){
    var s = S(), t = T(), sc = 60, why = [];
    var gh = s.jiPair ? null : null, ga = A.dg, gb = B.dg, ea = s.GAN_EL[ga], eb = s.GAN_EL[gb];
    var GH = {甲己: 1, 乙庚: 1, 丙辛: 1, 丁壬: 1, 戊癸: 1}, k = [ga, gb].sort().join("");
    if (GH[k] || GH[[gb, ga].join("")] || GH[[ga, gb].join("")]){ sc += 18; why.push(["💘", "두 사람의 「나」 글자(" + ga + "·" + gb + ")가 하늘에서 합 — 서로 끌리는 힘이 아주 큽니다."]); }
    else if (s.SAENG[ea] === eb || s.SAENG[eb] === ea){ sc += 10; why.push(["🌱", t.EL_KO[ea] + josa(t.EL_KO[ea], "과", "와") + " " + t.EL_KO[eb] + josa(t.EL_KO[eb], "은", "는") + " 서로 키워 주는 사이 — " + (s.SAENG[ea] === eb ? A.name + " 님이 " + B.name + " 님을" : B.name + " 님이 " + A.name + " 님을") + " 자연스럽게 밀어 줍니다."]); }
    else if (ea === eb){ sc += 5; why.push(["🤝", "같은 " + t.EL_KO[ea] + " 기운 — 친구처럼 편하지만, 고집이 부딪히면 둘 다 안 물러섭니다."]); }
    else { sc -= 6; why.push(["⚡", t.EL_KO[ea] + josa(t.EL_KO[ea], "과", "와") + " " + t.EL_KO[eb] + josa(t.EL_KO[eb], "은", "는") + " 한쪽이 다른 쪽을 누르는 사이 — 역할을 나누면 오히려 좋은 팀이 됩니다."]); }
    s.jiPair(A.P.d[1], B.P.d[1]).forEach(function(q){
      if (q.t === "합" || q.t === "반합"){ sc += 13; why.push(["🔗", "배우자 자리(" + A.P.d[1] + "·" + B.P.d[1] + ")가 " + q.t + " — 함께 있으면 편안하고 정이 깊어집니다."]); }
      else if (q.t === "충"){ sc -= 14; why.push(["💥", "배우자 자리(" + A.P.d[1] + "·" + B.P.d[1] + ")가 충 — 생활 방식이 달라 부딪힐 수 있어요. 각자의 공간이 약입니다."]); }
      else if (q.t === "형" || q.t === "원진"){ sc -= 7; why.push(["🌧️", "배우자 자리가 " + q.t + " — 가까울수록 말투를 부드럽게."]); }
    });
    var fillA = B.elH[A.yong] >= 3, fillB = A.elH[B.yong] >= 3;
    if (fillA && fillB){ sc += 14; why.push(["🧩", "서로에게 필요한 기운을 갖고 있어요 — " + A.name + " 님에겐 " + t.EL_KO[A.yong] + ", " + B.name + " 님에겐 " + t.EL_KO[B.yong] + ". 퍼즐처럼 맞는 사이!"]); }
    else if (fillA || fillB){ sc += 7; why.push(["🎁", (fillA ? B.name + " 님이 " + A.name + " 님에게 필요한 " + t.EL_KO[A.yong] : A.name + " 님이 " + B.name + " 님에게 필요한 " + t.EL_KO[B.yong]) + " 기운을 채워 줍니다."]); }
    s.jiPair(A.P.y[1], B.P.y[1]).forEach(function(q){ if (q.t === "합" || q.t === "반합"){ sc += 5; why.push(["🐾", t.JI_ANI[A.P.y[1]] + "띠 · " + t.JI_ANI[B.P.y[1]] + "띠는 잘 맞는 띠."]); } else if (q.t === "충"){ sc -= 5; why.push(["🐾", t.JI_ANI[A.P.y[1]] + "띠 · " + t.JI_ANI[B.P.y[1]] + "띠는 서로 다른 띠 — 다름을 재미로."]); } });
    var z1 = t.ZEL[A.astro.sun.sign], z2 = t.ZEL[B.astro.sun.sign], zok = {불: "공기", 공기: "불", 흙: "물", 물: "흙"};
    if (z1 === z2 || zok[z1] === z2){ sc += 5; why.push(["✨", A.astro.sun.sign + " × " + B.astro.sun.sign + " — 별자리도 잘 어울려요."]); }
    sc = Math.max(25, Math.min(98, sc));
    return {sc: sc, why: why.slice(0, 4), word: sc >= 85 ? "천생연분" : sc >= 72 ? "아주 잘 맞음" : sc >= 60 ? "잘 맞음" : sc >= 48 ? "노력하면 좋음" : "서로 배우는 사이"};
  }

  /* ───────── 사주 리포트 — 화면 ───────── */
  function pillarBox(R, k, dark){
    var t = T(), p = R.P[k], role = function(ch, gan){ if (k === "d" && gan) return ["나 자신", "일간"]; var ss = S().sipsin(R.dg, ch); return [t.grpShort(S().SS_GROUP[ss], R.sex), ss]; };
    if (!p) return '<div class="qpil"><div class="qt">시주</div><div class="qr">자녀 · 말년</div><div class="qch" style="background:#c9ced8">?</div><div class="qch" style="background:#c9ced8">?</div><div class="qu">시간 모름</div></div>';
    var a = role(p[0], true), b = role(p[1], false);
    return '<div class="qpil' + (k === "d" ? " qme" : "") + '"><div class="qt">' + t.POSP[k] + '</div><div class="qr">' + t.POSROLE[k] + '</div>' +
      '<div class="qch" style="background:' + t.EL_COL[S().GAN_EL[p[0]]] + '">' + p[0] + '<small>' + a[0] + ' · ' + a[1] + '</small></div>' +
      '<div class="qch" style="background:' + t.EL_COL[S().JI_EL[p[1]]] + '">' + p[1] + '<small>' + b[0] + ' · ' + b[1] + '</small></div>' +
      '<div class="qu">12운성 · ' + R.us[k] + '</div></div>';
  }
  function pg(n, title, sub, body){ return '<section class="qsjp"><div class="qph"><div class="qn"' + (String(n).length > 2 ? ' style="width:auto;padding:0 9px;font-size:13px"' : "") + '>' + n + '</div><div><h2>' + title + '</h2>' + (sub ? '<p>' + sub + '</p>' : "") + '</div></div>' + body + '</section>'; }
  function report(R){
    var t = T(), s = S(), nm = R.name || "", ig = t.ILGAN[R.dg], SC = sixScores(R), DL = s.daeunLuck(R), now = s.todayKST(), age = now.y - R.solar.y - ((now.m < R.solar.m || (now.m === R.solar.m && now.d < R.solar.d)) ? 1 : 0);
    var YL = []; for (var y = now.y; y < now.y + 10; y++) YL.push(s.yearLuck(R, y));
    var ci = curDaeunIdx(R), h = "";
    var hh = R.noHour ? "시간 모름" : (R.solar.hh < 12 ? "오전 " : "오후 ") + ((R.solar.hh % 12) || 12) + "시" + (R.solar.mi ? " " + R.solar.mi + "분" : "") + "생";
    var lun = R.lunar ? "음력 " + R.lunar.y + "년 " + (R.lunar.leap ? "윤" : "") + R.lunar.m + "월 " + R.lunar.d + "일" : "";
    // 표지
    h += '<section class="qsjp qcover">' + coverArt(R) + '<div class="qeb">사 주 · 별 자 리</div><h1>나를 읽는 리포트</h1><div class="qnm">' + e(nm) + ' 님</div>' +
      '<div class="qbd">양력 ' + R.solar.y + '년 ' + R.solar.m + '월 ' + R.solar.d + '일 ' + hh + ' · ' + (R.sex === "M" ? "남성" : "여성") + (lun ? ' · ' + lun : "") + '</div>' +
      '<div class="qpills">' + ["h", "d", "m", "y"].map(function(k){ return pillarBox(R, k, true); }).join("") + '</div>' +
      '<div class="qone"><b>한 줄로 —</b> ' + oneLine(R) + '입니다.<br>' + seasonLine(R) + '<br>' + (missing(R).length ? "다섯 기운 중 <b>" + missing(R).map(function(k){ return t.EL_KO[k]; }).join("·") + "</b>" + josa(t.EL_KO[missing(R).slice(-1)[0]], "이", "가") + " 비어 있고" : "다섯 기운(나무·불·흙·쇠·물)이 <b>하나도 빠짐없이</b> 모두 들어 있고") +
      ', 별자리는 <b>' + R.astro.sun.sign + ' 태양 · ' + R.astro.moon.sign + ' 달' + (R.astro.asc ? ' · ' + R.astro.asc.sign + ' 상승' : '') + '</b>입니다.</div>' +
      '<div class="qft">태양궁 ' + R.astro.sun.sign + ' ' + R.astro.sun.deg + '도 · 달 ' + R.astro.moon.sign + ' ' + R.astro.moon.deg + '도' + (R.astro.asc ? ' · 상승궁 ' + R.astro.asc.sign + ' ' + R.astro.asc.deg + '도(' + R.city + ' 출생 기준)' : '') +
      '<br>분석 기준일 ' + now.y + '년 ' + now.m + '월 ' + now.d + '일 (만 ' + age + '세) · 쉽게 풀어 쓴 버전 · CH Investing 앱에서 계산</div></section>';
    // 0 한 장 요약 (인포그래픽)
    var LC = lifeCurve(R), kw = [];
    (t.KW_GAN[R.dg] || []).forEach(function(w){ kw.push([w, t.EL_COL[R.dEl]]); });
    var topG = ["식상", "재성", "관성", "인성", "비겁"].sort(function(a, b){ return R.grp[b] - R.grp[a]; })[0];
    (t.KW_GRP[topG] || []).forEach(function(w){ kw.push([w, t.EL_COL[s.elOfGroup(R.dg, topG)]]); });
    kw.push([t.KW_Z[t.ZEL[R.astro.sun.sign]] + " (" + R.astro.sun.sign.replace("자리", "") + ")", "#6a4cff"]);
    if (R.sin.some(function(x){ return /귀인/.test(x.n); })) kw.push(["귀인운", "#d4357f"]);
    var bestYear = YL.slice().sort(function(a, b){ return b.stars - a.stars || a.year - b.year; })[0];
    h += pg("✦", "나를 한 장으로", "바쁠 땐 이 한 장만 보세요.",
      '<div class="qsum"><div>' + donut(R, 150) + '</div><div><div style="font-size:12px;color:#7a8396">나를 나타내는 말</div><div class="qkw">' + kw.slice(0, 8).map(function(k){ return '<span style="background:' + k[1] + '">' + k[0] + '</span>'; }).join("") + '</div>' +
      '<div style="font-size:15px;font-weight:800;line-height:1.5">' + oneLine(R).replace(/[「」]/g, "") + '</div></div></div>' +
      '<div class="qbig"><div><small>나는</small><b style="color:' + t.EL_COL[R.dEl] + '">' + R.dg + ' ' + ig.short + '</b><small>' + t.read(R.P.d) + '일주</small></div><div><small>간판</small><b>' + R.gyeok.replace("격", "") + '</b><small>' + R.gyeok + '</small></div><div><small>힘</small><b>' + R.power + '점</b><small>' + R.powerLvl.replace("균형에 가까운 ", "") + '</small></div>' +
      '<div><small>지금 대운</small><b>' + (ci >= 0 ? DL[ci].p : "-") + '</b><small>' + (ci >= 0 ? DL[ci].grade : "") + '</small></div><div><small>10년 중 최고 해</small><b>' + bestYear.year + '</b><small>' + bestYear.p + '</small></div><div><small>인생 꽃철</small><b>' + (LC.peaks[0] != null ? LC.peaks.slice(0, 2).join("·") + "세" : "-") + '</b><small>평생 곡선 봉우리</small></div></div>' +
      '<h4 style="margin-top:14px">◆ 평생 운 곡선 <small style="font-weight:500;color:#7a8396">0~89세 · 해마다 계산 · ★ 봉우리 · 노란 점이 지금</small></h4>' + LC.svg);
    // 1 한눈에
    var radarV = [SC.표현력, SC.인복, SC.재물, SC.안정, SC.배우자, SC.균형], four = fourSentences(R, SC, DL);
    var one = {표현력: R.grp.식상 ? "표현 글자 " + R.grp.식상 + "개. 말하고 가르치고 만드는 힘" + (R.grp.식상 >= 2 ? "이 큽니다." : "이 있습니다.") : "표현 글자가 숨어 있어 실력으로 보여 주는 편입니다.",
      균형: missing(R).length ? missing(R).map(function(k){ return t.EL_KO[k]; }).join("·") + " 기운이 비어 있습니다. 생활로 채우면 됩니다." : "다섯 기운 모두 있음. 극단으로 치우치지 않습니다.",
      인복: SC.gui.length ? "귀인 글자(" + SC.gui.map(function(x){ return x.ch; }).filter(function(v, i, a){ return a.indexOf(v) === i; }).join("·") + ")가 있습니다." + (SC.guiGm ? " 단 「비어 있는」 자리라 한 칸 뺍니다." : "") : (R.grp.인성 ? "도움 글자가 있어 배움 · 윗사람 덕이 있습니다." : "스스로 길을 내는 편. 도움은 만든 인맥에서 옵니다."),
      재물: "돈 글자 " + R.grp.재성 + "개" + (R.grp.식상 && R.grp.재성 ? " + 「표현이 돈이 되는」 통로" : "") + ". " + (!R.strong && R.grp.재성 >= 2 ? "힘 조절이 관건." : R.strong ? "다룰 힘이 있습니다." : "꾸준함이 열쇠."),
      배우자: (SC.dayHap ? "내 자리와 합. " : "") + (R.sex === "F" && R.sgg ? "단 표현이 남편 글자를 누르니 「말의 온도」 조심." : SC.dayCh ? "내 자리에 부딪힘이 있어 서로의 공간이 중요." : "인연의 글자가 안정적입니다."),
      안정성: (function(){ var c = R.rel.filter(function(r){ return r.t === "충"; }).length, f = R.rel.filter(function(r){ return r.t === "형"; }).length, hp = R.rel.filter(function(r){ return r.t === "합" || r.t === "반합"; }).length; return "부딪힘 " + c + " · 긁힘 " + f + " · 끌림 " + hp + " — " + (c + f >= 2 ? "인생에 사건이 많은 편입니다." : c + f === 1 ? "적당한 변화가 있는 편입니다." : "잔잔하고 안정적인 편입니다."); })()};
    h += pg(1, "한눈에 보기", "이 페이지만 읽어도 전체 내용의 80%를 알 수 있습니다.",
      '<div class="qbox"><h5>이 리포트에서 쓰는 말 — 한 줄 안내</h5><b>가장 필요한 것(용신)</b> · <b>그다음 필요한 것(희신)</b> · <b>조심할 것(기신)</b> — 사주에서 모자라거나 넘치는 기운을 이렇게 부릅니다.<br><b>내 편(비겁)</b> · <b>표현 글자(식상)</b> · <b>돈 글자(재성)</b> · <b>' + (R.sex === "M" ? "자리 글자" : "자리·남편 글자") + '(관성)</b> · <b>도움 글자(인성)</b> — 여덟 글자가 나에게 하는 역할입니다. 한자는 괄호로만 적었습니다.</div>' +
      '<h4>나는 어떤 사람일까? <small style="color:#7a8396;font-weight:500">(' + t.read(R.P.d) + '일주)</small></h4><p>나는 <b>' + R.dg + s.GAN_EL[R.dg] + ' — ' + ig.img + '</b>입니다. ' + ig.desc + '</p><ul>' + ig.tr.map(function(x){ return '<li><b>' + x[0] + '</b> ' + x[1] + '</li>'; }).join("") + '</ul>' +
      radar(radarV, ["표현력", "인복", "재물", "안정", "배우자", "균형"]) +
      '<h4>가장 중요한 네 문장</h4><div class="qgrid2 qst1">' + four.map(function(f, i){ return '<div class="qbox" style="border-left:4px solid ' + f[2] + '"><b>' + "①②③④"[i] + ' ' + f[0] + '</b> ' + f[1] + '</div>'; }).join("") + '</div>' +
      '<table><tr><th>항목</th><th>점수</th><th>한 줄 설명</th></tr>' + [["표현 · 말재주", SC.표현력, one.표현력], ["균형", SC.균형, one.균형], ["인복 · 귀인", SC.인복, one.인복], ["재물 구조", SC.재물, one.재물], ["배우자 인연", SC.배우자, one.배우자], ["안정성", SC.안정, one.안정성]].map(function(r){ return '<tr><td class="qk">' + r[0] + '</td><td>' + stars(r[1]) + '</td><td>' + r[2] + '</td></tr>'; }).join("") + '</table>');
    // 2 8글자
    var hidRows = R.hidden.slice().sort(function(a, b){ return "hdmy".indexOf(a.pos) - "hdmy".indexOf(b.pos); }).map(function(x){
      var words = x.g.map(function(q){ return q.ch + s.GAN_EL[q.ch] + "(" + t.grpShort(s.SS_GROUP[q.ss], R.sex) + ")"; }).join(" + ");
      var allSame = x.g.every(function(q){ return s.SS_GROUP[q.ss] === s.SS_GROUP[x.g[0].ss]; });
      return '<tr><td class="qk">' + x.br + ' ' + t.POSJ[x.pos] + '</td><td style="white-space:nowrap">' + x.g.map(function(q){ return q.ch; }).join("·") + '</td><td>' + (allSame ? "전부 " + t.EL_KO[x.g[0].el] + " — " + t.grpShort(s.SS_GROUP[x.g[0].ss], R.sex) + " 글자. " : words + ". ") + "「" + t.POSROLE[x.pos] + "」 자리입니다." + '</td></tr>'; }).join("");
    var dss = s.sipsin(R.dg, R.P.d[1]);
    h += pg(2, "내 사주 8글자", "여덟 글자와, 그 속에 숨은 글자까지 모두 열어봅니다.",
      '<p>태어난 해·달·날·시간을 두 글자씩, 모두 여덟 글자로 바꾼 것입니다. 위 글자는 「하늘」, 아래 글자는 「땅」이라 부릅니다. 색은 오행입니다.</p><div class="qpills">' + ["h", "d", "m", "y"].map(function(k){ return pillarBox(R, k); }).join("") + '</div>' +
      '<div class="qbox qgr"><h5>◆ ' + t.read(R.P.d) + '일주 — 「' + t.SCENE[R.P.d[1]] + '에 ' + ig.verb + ' ' + ig.short + '」</h5>태어난 날의 위 글자가 ' + R.dg + s.GAN_EL[R.dg] + '(' + ig.short + '), 아래 글자가 ' + R.P.d[1] + '(' + t.JI_ANI[R.P.d[1]] + ')입니다. ' + t.DAYSEAT[dss] + ' 내 자리의 12운성은 <b>' + R.us.d + '</b> — ' + t.US[R.us.d] + '.</div>' +
      '<h4>◆ 숨은 글자 — 땅 글자 속에 들어 있는 것들</h4><table><tr><th>땅 글자</th><th>속에 든 글자</th><th>읽어보면</th></tr>' + hidRows + '</table>' +
      '<div class="qgrid2 qst1"><div class="qbox"><h5>숨은 글자까지 세면</h5>' + s.EL.map(function(k){ return t.EL_KO[k] + " " + R.el[k] + " → <b>" + R.elH[k] + "</b>"; }).join(" · ") + '<br>' + (function(){ var up = s.EL.slice().sort(function(a, b){ return (R.elH[b] - R.el[b]) - (R.elH[a] - R.el[a]); }).slice(0, 2); var w2 = up.map(function(k){ return t.EL_KO[k]; }); return "속을 열면 <b>" + w2[0] + josa(w2[0], "과", "와") + " " + w2[1] + "</b>" + josa(w2[1], "이", "가") + " 넉넉해집니다."; })() + '</div>' +
      '<div class="qbox"><h5>12운성이란?</h5>나(' + R.dg + ')가 각 자리에서 얼마나 힘이 있는지를 「사람의 일생」에 비유한 것입니다. ' + R.pos.map(function(k){ return t.POSS[k] + "(" + R.P[k][1] + ") <b>" + R.us[k] + "</b>"; }).join(" · ") + '.</div></div>');
    // 2b 관계도
    var relB = R.rel.filter(function(r){ return r.lv === "b"; }), relG = R.rel.filter(function(r){ return r.lv === "g"; });
    h += pg(2, "내 사주 8글자 (관계도)", "글자들이 서로 어떻게 당기고 부딪치는지 봅니다.",
      '<p>땅 글자 네 개는 서로 당기기도(합), 부딪치기도(충), 긁기도(형) 합니다. 이 사주는 관계선이 <b>' + relB.length + '개</b>' + (relB.length >= 4 ? "나 되는 「사건이 많은」 사주입니다. 지루할 틈이 없는 인생이라는 뜻입니다." : relB.length ? " 있습니다." : "도 없는 잔잔한 사주입니다.") + '</p>' +
      (relB.length ? relMap(R) + '<table><tr><th>관계</th><th>어디와 어디</th><th>쉽게 말하면</th></tr>' + relB.map(function(r){ return '<tr><td class="qk">' + r.t + ' ' + r.s + '</td><td style="white-space:nowrap">' + t.POSS[r.a] + ' ↔ ' + t.POSS[r.b] + '</td><td>' + t.relText(r) + '</td></tr>'; }).join("") + '</table>' : "") +
      (relG.length || R.sgg ? '<h4>◆ 하늘 글자끼리의 관계</h4><div class="qgrid2 qst1">' + relG.map(function(r){ return '<div class="qbox"><h5>' + r.s + r.t + ' — ' + t.POSS[r.a] + '와 ' + t.POSS[r.b] + '</h5>' + t.relText(r) + '</div>'; }).join("") +
        (R.sgg ? '<div class="qbox qor"><h5>상관견관 — 표현 글자가 자리 글자를 침</h5>말이 옳아도 말투 때문에 윗사람' + (R.sex === "F" ? "·배우자" : "") + '와 부딪히기 쉬운 형태. 처방은 딱 하나 — <b>「옳은 말도 부드럽게」</b>입니다.</div>' : "") + '</div>' : ""));
    // 3 간판
    var gy = t.GYEOK[R.gyeok] || [R.gyeok, "", ""], sup = R.power;
    h += pg(3, "사주의 간판", "이 사주가 어떤 방식으로 사는지 봅니다.",
      '<div class="qgrid2 qst1"><div><h4>사주의 간판 — ' + R.gyeok + '</h4><p>태어난 달의 땅 글자 ' + R.P.m[1] + '(' + t.EL_KO[s.JI_EL[R.P.m[1]]] + ')가 이 사주의 간판입니다. 나에게 <b>' + R.monthSS + '</b> — ' + (t.SS10[R.monthSS] || "") + '.</p><ul><li>' + gy[1] + '</li><li>' + gy[2] + '</li></ul></div>' +
      '<div><h4>나의 힘은? — 「' + R.powerLvl + '」</h4>' + gauge(sup) + '<p style="font-size:12.5px">나를 돕는 글자(내 편·도움) → 약 <b>' + sup + '점</b> · 내 힘을 쓰게 하는 글자 → 약 <b>' + (100 - sup) + '점</b><br>→ ' + (R.strong ? "힘이 넉넉해, 쓸 곳(표현·돈·자리)을 만들어야 빛나는 사주입니다." : "힘이 모자라진 않지만, 쓸 곳이 더 많은 사주입니다.") + '</p></div></div>' +
      '<h4>여덟 글자의 역할</h4><div class="qgrid2 qst1">' + grpBars(R) + '<ul style="font-size:13px">' + ["식상", "재성", "관성", "인성", "비겁"].map(function(k){ var L = R.chars.filter(function(c){ return c.ss !== "일간" && s.SS_GROUP[c.ss] === k; }).map(function(c){ return c.ch; });
        return '<li><b>' + t.grpShort(k, R.sex) + '(' + k + ') ' + R.grp[k] + '</b>' + (L.length ? " — " + L.join("·") : "") + '. ' + t.GRP_MEAN[k] + '</li>'; }).join("") + '</ul></div>' +
      (R.season ? '<div class="qbox"><h5>' + (R.how === "조후" ? "왜 " + t.EL_KO[R.season] + "(" + t.EL_HJ[R.season] + ")이 가장 필요할까?" : "왜 " + t.EL_KO[R.season] + "(" + t.EL_HJ[R.season] + ")은 「필요한 것」이 아닐까?") + '</h5>' +
        (R.season === "화" ? "한겨울에 태어난 사주에게 햇볕은 꼭 필요합니다. " : "한여름에 태어난 사주에게 물(쉼·시원함)은 꼭 필요합니다. ") + '명리에서는 이를 조후(調候) — 온도 맞추기라 부릅니다. ' +
        (R.how === "조후" ? "이 사주는 그 기운이 모자라 <b>" + t.EL_KO[R.season] + josa(t.EL_KO[R.season], "이", "가") + " 가장 필요한 것</b>이 됩니다." : "그런데 이 사주는 " + t.EL_KO[R.season] + josa(t.EL_KO[R.season], "이", "가") + " 이미 " + R.el[R.season] + "개 있어 온도 문제는 해결되어 있습니다. 그래서 이제는 「힘의 균형(억부)」을 봐서 답을 찾습니다.") + '</div>' : ""));
    // 4 가장 필요한 것
    var roleRow = function(lbl, k, txt){ return '<tr><td class="qk">' + lbl + '</td><td>' + elTag(k) + '</td><td>' + txt + '</td></tr>'; }, yg = s.groupOfEl(R.dg, R.yong), hg = s.groupOfEl(R.dg, R.hui);
    h += pg(4, "가장 필요한 것", "부족한 기운과 넘치는 기운을 가려냅니다.",
      '<div style="display:flex;align-items:center;justify-content:center;gap:8px;flex-wrap:wrap;margin:6px 0 10px">' +
        [[R.hui, "희신", t.grpShort(hg, R.sex)], [R.yong, "용신", t.grpShort(yg, R.sex)], [R.han, "다음", t.grpShort(s.groupOfEl(R.dg, R.han), R.sex)]].map(function(x, i){
          return (i ? '<span style="color:#98a2b3;font-size:20px">→</span>' : "") + '<div style="text-align:center;border:' + (i === 1 ? "3px solid #e9b949" : "1px solid #e3e7ef") + ';border-radius:14px;padding:8px 12px;background:#fff"><div style="font-size:11px;color:#7a8396">' + x[1] + '</div><div style="font-size:30px;font-weight:800;color:' + t.EL_COL[x[0]] + '">' + t.EL_HJ[x[0]] + '</div><div style="font-size:12px;font-weight:700">' + t.EL_KO[x[0]] + ' · ' + x[2] + '</div></div>'; }).join("") + '</div>' +
      '<div class="qbox qgr"><h5>이 사주의 길은 「' + (R.how === "조후" ? "온도를 맞추는 것" : R.strong ? "넘치는 힘을 쓸 곳을 만드는 것" : "뿌리를 키우고, 그다음 꽃을 피우는 것") + '」</h5>' +
        (R.how === "조후" ? "태어난 계절의 온도가 한쪽으로 치우쳐, " + t.EL_KO[R.yong] + " 기운이 들어올 때 모든 것이 풀립니다." :
          R.strong ? "내 힘이 넉넉합니다. 그래서 가장 필요한 것은 " + t.EL_KO[R.yong] + "(" + t.grpShort(yg, R.sex) + "), 그다음은 " + t.EL_KO[R.hui] + "(" + t.grpShort(hg, R.sex) + ")입니다. 힘을 밖으로 쓸 때 빛납니다." :
          "밖으로 쓸 곳은 많은데 나(" + t.EL_KO[R.dEl] + ")는 상대적으로 작습니다. 그래서 가장 필요한 것은 " + t.EL_KO[R.yong] + "(" + t.grpShort(yg, R.sex) + "), 그다음은 " + t.EL_KO[R.yong] + josa(t.EL_KO[R.yong], "을", "를") + " 키우는 " + t.EL_KO[R.hui] + "(" + t.grpShort(hg, R.sex) + ")입니다.") + '</div>' +
      '<table><tr><th>구분</th><th>오행</th><th>뜻</th></tr>' + roleRow("가장 필요<br>(용신)", R.yong, t.ELIFE[R.yong].fill.split(",").slice(0, 3).join(" ·") + ".") + roleRow("그다음 필요<br>(희신)", R.hui, t.ELIFE[R.hui].fill.split(",").slice(0, 3).join(" ·") + ".") +
        roleRow("적당히<br>(한신)", R.han, "있으면 좋고 넘치면 기운이 빠집니다.") + roleRow("조심<br>(구신)", R.gu, t.ELIFE[R.gu].cut + ".") + roleRow("가장 조심<br>(기신)", R.gi, t.ELIFE[R.gi].cut + ".") + '</table>' +
      '<div class="qbox"><h5>생활 속 「' + t.EL_KO[R.yong] + '」와 「' + t.EL_KO[R.hui] + '」 채우기</h5><b>' + t.EL_KO[R.yong] + ' 채우기</b> — ' + t.ELIFE[R.yong].fill + '.<br><b>' + t.EL_KO[R.hui] + ' 채우기</b> — ' + t.ELIFE[R.hui].fill + '.<br><b>' + t.EL_KO[R.gi] + ' 줄이기</b> — ' + t.ELIFE[R.gi].cut + '.</div>');
    // 5 특별한 표시
    var sinByCh = {}; R.sin.forEach(function(x){ (sinByCh[x.pos] = sinByCh[x.pos] || []).push(x.n); });
    var crowd = Object.keys(sinByCh).filter(function(k){ return sinByCh[k].length >= 3; })[0];
    var allS = ["천을귀인", "태극귀인", "문창귀인", "도화", "공망", "일록", "건록", "양인", "백호", "괴강", "화개", "역마"];
    var cards = R.sin.map(function(x){ var d = t.SIN[x.n]; return '<div class="qsin"><b>' + x.n + '</b><span class="qw">' + x.ch + ' · ' + t.POSJ[x.pos] + '</span><p>' + d[1] + '</p></div>'; });
    var none = ["역마", "괴강", "양인"].filter(function(n){ return !R.sin.some(function(x){ return x.n === n; }); });
    if (none.length) cards.push('<div class="qsin"><b>' + none.join(" · ") + '</b><span class="qw">없음</span><p>' + (none.indexOf("역마") >= 0 ? "멀리 떠도는 기운이 적습니다. 한곳에 뿌리내리는 형입니다." : "극단으로 치닫는 기운이 적습니다.") + '</p></div>');
    h += pg(5, "특별한 표시들", "귀인·도화·공망·백호 — 여덟 글자에 붙은 특별한 표시를 봅니다.",
      '<p>사주에는 「살(殺)」「귀인(貴人)」이라 부르는 특별한 표시가 있습니다. 좋은 것도, 조심할 것도 있습니다.' + (crowd ? ' 이 사주는 ' + t.POSS[crowd] + '(' + R.P[crowd][1] + ') 한 글자에 표시가 ' + NUMKO[sinByCh[crowd].length] + '나 모여 있는 것이 특징입니다.' : "") + '</p><div class="qsins">' + cards.join("") + '</div>' +
      (R.sin.some(function(x){ return x.n === "공망" && R.sin.some(function(y){ return /귀인|도화/.test(y.n) && y.ch === x.ch; }); }) ? '<div class="qbox qlft"><h5>◆ 좋은 표시가 「비어 있는」 자리에</h5>도움은 옵니다. 다만 「내가 기대한 사람」보다 「뜻밖의 사람」에게서 옵니다. 공망이 채워지는 해(같은 글자가 오는 해)에 빈 자리가 채워집니다. 명리에서는 「공망된 귀인은 정신적인 쪽으로 발휘된다」고 봅니다 — 영감 · 직관 · 사람 보는 눈으로 옵니다.</div>' : ""));
    // 6 다섯 기운
    h += pg(6, "다섯 기운", "나무 · 불 · 흙 · 쇠 · 물의 분포를 봅니다.",
      '<h4>다섯 기운의 개수 <small style="font-weight:500;color:#7a8396">— 진한 막대는 겉 8글자, 연한 막대는 숨은 글자까지</small></h4>' + elBars(R) +
      '<div class="qgrid2 qst1"><div>' + cycle(R) + '</div><div>' + (missing(R).length ? '<div class="qbox qor"><h5>비어 있는 기운: ' + missing(R).map(function(k){ return t.EL_KO[k]; }).join(" · ") + '</h5>빈 기운이 맡은 영역(' + missing(R).map(function(k){ return t.GRP_MEAN[s.groupOfEl(R.dg, k)].split(" · ")[0]; }).join(" · ") + ')은 노력과 생활 습관으로 채웁니다. 대운 · 해에서 그 기운이 올 때 크게 채워집니다.</div>'
        : '<div class="qbox qgr"><h5>★ 다섯 기운이 모두 있는 「오행 구족(具足)」 사주</h5>명리에서는 이를 한쪽으로 치우치지 않는 균형의 복으로 봅니다. 대신 한 가지에 몰빵하기보다 여러 가지를 고르게 챙기는 삶이 잘 맞습니다.</div><div class="qbox"><h5>순환이 끊기지 않습니다</h5>木 → 火 → 土 → 金 → 水 → 다시 木. 기운이 한 바퀴 돌아 나에게 돌아오는 구조입니다.</div>') + '</div></div>' +
      '<table><tr><th>오행</th><th>이 사주에서의 역할</th><th>개수</th><th>한 줄</th></tr>' + s.EL.map(function(k){ var gq = s.groupOfEl(R.dg, k);
        return '<tr><td>' + elTag(k) + '</td><td>' + (gq === "비겁" ? "나 · " : "") + t.GRP_MEAN[gq] + '</td><td>' + R.el[k] + ' → ' + R.elH[k] + '</td><td>' + (k === R.yong ? "가장 필요한 기운." : k === R.hui ? "그다음 필요한 기운." : k === R.gi ? "가장 조심할 기운." : R.el[k] >= 3 ? "많은 편 — 넘치지 않게." : !R.el[k] ? "비어 있음." : "적당함.") + '</td></tr>'; }).join("") + '</table>');
    // 7 재물
    var MP = moneyPart(R, DL, YL);
    h += pg(7, "재물운", "돈이 어디서 오고 어디로 새는지 봅니다.",
      '<table><tr><th>요소</th><th>판정</th></tr>' + MP.rows.map(function(r){ return '<tr><td class="qk">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("") + '</table>' +
      '<table><tr><th>No</th><th>재물 처방</th><th>이유</th></tr>' + MP.rx.map(function(r, i){ return '<tr><td class="qn">' + (i + 1) + '</td><td class="qk">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("") + '</table>');
    // 8 대운
    h += pg(8, "인생 흐름 — 10년 대운", "인생 전체를 10년 단위로 봅니다.",
      '<p>대운은 <b>10년마다 바뀌는 큰 계절</b>입니다. 이 사주는 약 <b>' + R.daeun.start + '세</b>에 첫 대운이 시작되고, ' + (R.daeun.fwd ? "앞으로" : "거꾸로") + ' 흐릅니다(' + (R.sex === "M" ? "남성" : "여성") + '·' + (s.YANG[R.P.y[0]] ? "양" : "음") + '의 해 출생).<br><small>기준 — 가장 필요 ' + elTag(R.yong) + ' · 그다음 ' + elTag(R.hui) + ' · 적당히 ' + elTag(R.han) + ' · 조심 ' + elTag(R.gu) + ' · 가장 조심 ' + elTag(R.gi) + '</small></p>' +
      daeunChart(DL.slice(0, 8), ci < 8 ? ci : -1) +
      '<table><tr><th>나이</th><th>대운 · 평가</th><th>설명</th></tr>' + DL.slice(0, 8).map(function(x, i){ var tg = x.tags.map(function(q){ return t.tagText(q, R); }).filter(Boolean).slice(0, 2);
        return '<tr><td class="qk" style="width:18%">' + x.age[0] + '~' + x.age[1] + (i === ci ? '<br><span class="qeltag" style="background:#e9a400">지금</span>' : "") + '</td><td style="white-space:nowrap"><b>' + x.p + '</b><br>' + stars(x.stars) + '</td><td>' + (i === ci ? "<b>★ 지금 대운입니다.</b> " : "") +
          x.gSS.replace(/.*/, function(){ return t.EL_KO[x.gEl] + "(" + t.grpShort(s.SS_GROUP[x.gSS], R.sex) + ")"; }) + "·" + t.EL_KO[x.bEl] + "(" + t.grpShort(s.SS_GROUP[x.bSS], R.sex) + ") 기운. " + (tg.length ? tg.join(" · ") + "." : "") + '</td></tr>'; }).join("") + '</table>' +
      (function(){ var best = DL.slice(0, 8).reduce(function(b, x, i, a){ return x.stars > a[b].stars ? i : b; }, 0), worst = DL.slice(0, 8).reduce(function(b, x, i, a){ return x.stars < a[b].stars ? i : b; }, 0);
        return '<div class="qbox qgr"><h5>이 그래프의 결론</h5>① 가장 힘든 구간은 <b>' + DL[worst].age[0] + '~' + DL[worst].age[1] + '세(' + DL[worst].p + ')</b>입니다. 그 시절이 힘들었다면 성격 탓이 아니라 <b>계절 탓</b>입니다.<br>② 가장 좋은 구간은 <b>' + DL[best].age[0] + '~' + DL[best].age[1] + '세(' + DL[best].p + ')</b>입니다.' +
          (ci >= 0 ? '<br>③ 지금은 ' + DL[ci].age[0] + '~' + DL[ci].age[1] + '세(' + DL[ci].p + ') — ' + DL[ci].grade + ' 구간입니다.' : "") + '</div>'; })());
    // 9 연도별
    h += pg(9, "인생 흐름 — 연도별", "앞으로 10년을 계산했습니다.",
      '<div class="qyr">' + YL.map(function(y){ var c = y.stars >= 4.5 ? "#d9f2e2" : y.stars >= 3.5 ? "#eaf6ee" : y.stars >= 2.5 ? "#f5f7fb" : y.stars >= 1.5 ? "#fdf0e6" : "#fde3de";
        return '<div style="background:' + c + '"><b>' + y.year + '</b>' + y.p + '<br>' + (y.stars >= 4.5 ? "★" : "") + y.grade + '</div>'; }).join("") + '</div>' +
      '<table><tr><th>연도</th><th>간지 · 평가</th><th>내용</th></tr>' + YL.map(function(y){ var tg = y.tags.map(function(q){ return t.tagText(q, R); }).filter(Boolean).slice(0, 2);
        return '<tr><td class="qk" style="width:15%">' + y.year + '</td><td style="white-space:nowrap"><b>' + y.p + '</b><br>' + stars(y.stars) + '</td><td>' + t.EL_KO[y.gEl] + "(" + t.esWord(R.ES[y.gEl] || 0) + ")·" + t.EL_KO[y.bEl] + "(" + t.esWord(R.ES[y.bEl] || 0) + "). " + tg.join(" · ") + '</td></tr>'; }).join("") + '</table>' +
      (function(){ var b = YL.slice().sort(function(a, c){ return c.stars - a.stars || a.year - c.year; })[0], w = YL.slice().sort(function(a, c){ return a.stars - c.stars || a.year - c.year; })[0];
        return '<div class="qbox qgr"><h5>정리하면</h5>' + YL[0].year + '년은 「' + YL[0].grade + '」 → 가장 조심할 해는 <b>' + w.year + '년(' + w.p + ')</b> — 지키는 해 → 가장 좋은 해는 <b>' + b.year + '년(' + b.p + ')</b> — 새 출발 · 큰 결정에 좋습니다.</div>'; })());
    // 10 올해
    var ML = s.monthLuck(R, now.y, now.m, 5, now.d), Y0 = YL[0], Y1 = YL[1];
    var good0 = Y0.tags.filter(function(q){ return /합|삼합|방합|귀인|간합/.test(q.t) && (q.v == null || q.v >= 0); }), bad0 = Y0.tags.filter(function(q){ return /충|형|원진|간충/.test(q.t); });
    h += pg(10, "올해의 운 — " + now.y + "년 자세히", "지금 이 순간의 흐름을 월 단위로 봅니다.",
      '<p>분석 기준일은 ' + now.y + '년 ' + now.m + '월 ' + now.d + '일입니다. 지금은 ' + Y0.p + '년' + (ci >= 0 ? '이고, 대운은 ' + DL[ci].p + '(' + DL[ci].age[0] + '~' + DL[ci].age[1] + '세) 안에 있습니다.' : '입니다.') + '</p>' +
      '<div class="qgrid2 qst1"><div class="qbox qgr"><h5>' + now.y + ' ' + Y0.p + '년 — 좋은 점</h5><ul style="margin:0">' + ((R.ES[Y0.gEl] || 0) >= 0 ? '<li>' + t.EL_KO[Y0.gEl] + '(' + t.grpShort(s.SS_GROUP[Y0.gSS], R.sex) + ') 기운이 ' + t.esWord(R.ES[Y0.gEl] || 0) + ' 쪽입니다.</li>' : "") + good0.map(function(q){ return '<li>' + t.tagText(q, R) + '</li>'; }).join("") + (!good0.length && (R.ES[Y0.gEl] || 0) < 0 ? '<li>큰 기회보다 다지는 해입니다.</li>' : "") + '</ul></div>' +
      '<div class="qbox qor"><h5>' + now.y + ' ' + Y0.p + '년 — 조심할 점</h5><ul style="margin:0">' + ((R.ES[Y0.bEl] || 0) < 0 ? '<li>' + t.EL_KO[Y0.bEl] + ' 기운이 ' + t.esWord(R.ES[Y0.bEl]) + ' 쪽 — 에너지를 쓰기만 하고 채우지 못하기 쉬움 → 수면 · 휴식 우선.</li>' : "") + bad0.map(function(q){ return '<li>' + t.tagText(q, R) + '</li>'; }).join("") + (!bad0.length && (R.ES[Y0.bEl] || 0) >= 0 ? '<li>크게 부딪히는 글자가 없는 해입니다.</li>' : "") + '</ul></div></div>' +
      (function(){ var M12 = s.monthLuck(R, now.y, 2, 12, 6); return '<h4>◆ ' + now.y + '년 열두 달 한눈에 <small style="font-weight:500;color:#7a8396">(입춘 기준 절기 달)</small></h4><div class="qm12">' + M12.map(function(m){ var on = (now.m === m.from.m && now.d >= m.from.d) || (now.m === m.to.m && now.d <= m.to.d);
        return '<div style="background:' + heatCol(m.stars) + (on ? ';outline:3px solid #1e2742;outline-offset:1px' : "") + '"><b>' + m.from.m + '월' + (on ? " ●" : "") + '</b>' + m.p + '<br>' + m.grade + '</div>'; }).join("") + '</div>'; })() +
      '<h4>◆ 앞으로 다섯 달</h4><div class="qmos">' + ML.map(function(m, i){ var tg = m.tags.map(function(q){ return t.tagText(q, R); }).filter(Boolean)[0] || (t.EL_KO[m.gEl] + "·" + t.EL_KO[m.bEl] + " 기운의 달.");
        return '<div class="qmo"' + (i === 0 ? ' style="border:2px solid #e9b949"' : "") + '><div class="qh"><span>' + m.from.m + '/' + m.from.d + '~' + m.to.m + '/' + m.to.d + '</span><span>' + m.p + '</span></div><div style="color:' + (m.stars >= 3.5 ? "#2e9e5b" : m.stars >= 2.5 ? "#9a7a14" : "#d0452f") + ';font-weight:800">' + (i === 0 ? "지금 · " : "") + m.grade + '</div>' + tg + '</div>'; }).join("") + '</div>' +
      '<table><tr><th>' + Y1.year + ' ' + Y1.p + '년</th><th>미리 보기</th></tr><tr><td class="qk">흐름</td><td>' + stars(Y1.stars) + ' ' + Y1.grade + '. ' + t.EL_KO[Y1.gEl] + '(' + t.esWord(R.ES[Y1.gEl] || 0) + ')·' + t.EL_KO[Y1.bEl] + '(' + t.esWord(R.ES[Y1.bEl] || 0) + ')</td></tr>' +
        '<tr><td class="qk">눈여겨볼 것</td><td>' + (Y1.tags.map(function(q){ return t.tagText(q, R); }).filter(Boolean).join(" · ") || "크게 부딪히는 글자 없음") + '</td></tr></table>' +
      '<div class="qbox qlft"><h5>올해 이것만 기억하세요</h5>' + (function(){ var bm = ML.filter(function(m){ return m.stars <= 2; })[0], gm = ML.filter(function(m){ return m.stars >= 4; })[0], L = [];
        if (bm) L.push(bm.from.m + "월(" + bm.p + ")은 무리하지 않기"); if (gm) L.push(gm.from.m + "월(" + gm.p + ")에 새 일 시작"); L.push(R.sgg || R.grp.식상 >= 2 ? "말은 3초 쉬고" : "결정은 하루 묵혔다가"); L.push(R.yong === "수" || R.hui === "수" ? "잠은 밤 11시 전에" : t.EL_KO[R.yong] + " 기운 채우기(" + t.ELIFE[R.yong].fill.split(",")[0] + ")");
        return L.map(function(x, i){ return "①②③④"[i] + " " + x; }).join(" · "); })() + '</div>');
    // 11 배우자·자녀
    var LV = loveKid(R, DL, YL);
    h += pg(11, "배우자 · 연애 · 자녀", (R.sex === "M" ? "남성 사주에서 아내는 돈 글자(재성), 자녀는 자리 글자(관성)로 봅니다." : "여성 사주에서 남편은 자리 글자(관성), 자녀는 표현 글자(식상)로 봅니다."),
      '<p style="font-size:13px;color:#5d667a">이 장은 특정한 사람을 정하는 것이 아니라, 관계를 돌아보는 거울로 읽어주세요.</p>' +
      '<div class="qgrid2 qst1"><div class="qbox qgr"><h5>' + LV.spWord + ' 글자 — ' + t.EL_KO[LV.spEl] + '(' + t.EL_HJ[LV.spEl] + ')</h5><ul style="margin:0">' + LV.good.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></div>' +
      '<div class="qbox qor"><h5>조심할 것</h5><ul style="margin:0">' + LV.warn.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul></div></div>' +
      (LV.times.length ? '<h4>◆ 인연의 시기</h4><table><tr><th>시기</th><th>흐름</th></tr>' + LV.times.map(function(r){ return '<tr><td class="qk">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("") + '</table>' : "") +
      '<div class="qgrid2 qst1"><div class="qbox"><h5>잘 맞는 사람</h5>● <b>' + t.EL_KO[R.yong] + '(' + t.EL_HJ[R.yong] + ')의 사람</b> — ' + t.ELIFE[R.yong].ppl + '.<br>● <b>' + t.EL_KO[R.hui] + '(' + t.EL_HJ[R.hui] + ')의 사람</b> — ' + t.ELIFE[R.hui].ppl + '.</div>' +
      '<div class="qbox"><h5>연애 · 매력</h5>' + (R.sin.some(function(x){ return x.n === "도화"; }) ? "도화(" + R.sin.filter(function(x){ return x.n === "도화"; })[0].ch + ")가 있어 사람들 속에서 매력이 드러납니다. " : "은은한 매력 — 오래 볼수록 좋은 사람입니다. ") + t.read(R.P.d) + "일주 특유의 분위기" + (R.astro.asc ? ", " + R.astro.asc.sign + " 상승의 첫인상(" + t.ZASC[R.astro.asc.sign].replace("처음 만나면 ", "").replace(/\..*/, "") + ")" : "") + '이 더해집니다.</div></div>' +
      '<h4>◆ 자녀복</h4><ul>' + LV.kids.map(function(x){ return '<li>' + x + '</li>'; }).join("") + '</ul>');
    // 12 별자리
    var EC = echo(R), A = R.astro;
    h += pg(12, "별자리로 보는 나", "서양 점성술 — 태양 · 달 · 상승궁을 봅니다.",
      '<p>사주와는 <b>전혀 다른 체계</b>인 서양 점성술로도 봅니다. 두 체계가 같은 말을 하는 곳이 많아 흥미롭습니다.' + (A.asc ? ' (상승궁은 ' + R.city + ' 출생 기준으로 계산했습니다.)' : ' (태어난 시간을 몰라 상승궁은 빼고 봅니다.)') + '</p>' +
      '<div class="qgrid2 qst1"><div>' + wheel(R) + '<div style="text-align:center;font-size:11.5px;color:#7a8396">태어난 순간의 하늘' + (A.asc ? " — 왼쪽 점선이 상승궁(ASC)" : "") + '</div></div><div><table><tr><th>항목</th><th>별자리</th><th>뜻</th></tr>' +
      [["태양", "겉으로 보이는 나", A.sun, t.ZSUN], ["달", "속마음", A.moon, t.ZMOON]].concat(A.asc ? [["상승궁", "첫인상", A.asc, t.ZASC]] : []).map(function(r){ return '<tr><td class="qk">' + r[0] + '<br><small style="font-weight:400;color:#7a8396">' + r[1] + '</small></td><td style="white-space:nowrap"><b>' + r[2].sign + '</b><br>' + r[2].deg + '도<br><small>' + t.ZEL[r[2].sign] + ' · ' + t.ZMOD[r[2].sign] + '</small></td><td>' + r[3][r[2].sign] + '</td></tr>'; }).join("") +
      '</table><p style="font-size:12.5px">달의 모양: 태어날 때 <b>' + A.phase + '</b></p></div></div>' +
      '<h4>◆ 사주와 별자리가 같은 말을 하는 부분</h4><table><tr><th>주제</th><th>사주</th><th>별자리</th></tr>' + EC.rows.map(function(r){ return '<tr><td class="qk">' + r[0] + '</td><td>' + r[1] + '</td><td>' + r[2] + '</td></tr>'; }).join("") + '</table>' +
      '<div class="qgrid2 qst1">' + (EC.rows[0] ? '<div class="qbox qgr"><h5>★ 두 체계가 똑같이 말하는 것</h5>' + EC.rows.map(function(r){ return "「" + r[3] + "」"; }).join(", ") + '.</div>' : "") + '<div class="qbox"><h5>' + EC.mind[0] + '</h5>' + EC.mind[1] + '</div></div>');
    // 13 생활
    var tops = ["식상", "재성", "관성", "인성", "비겁"].sort(function(a, b){ return R.grp[b] - R.grp[a]; }), jobs = [t.JOBS[tops[0]], t.JOB_EL[R.dEl], t.JOBS[tops[1]], t.JOB_EL[R.yong]].filter(function(x, i, a){ return a.indexOf(x) === i; });
    if (jobs.length < 4) jobs.push(t.JOBS[tops[2]]);
    h += pg(13, "생활에서 쓰는 사주", "일 · 색 · 방향 · 건강 — 생활에서 참고할 것들입니다.",
      '<h4>◆ 맞는 일 · 잘하는 일</h4><div class="qjobs">' + jobs.slice(0, 4).map(function(j){ return '<div class="qjob"><div class="qi">' + j[0] + '</div><b>' + j[1] + '</b><small>' + j[2] + '</small></div>'; }).join("") + '</div>' +
      '<p style="font-size:13px">' + (R.grp.관성 ? "조직 안의 자리도 나쁘지 않습니다. " : "조직보다 내 이름을 건 일이 편합니다. ") + "다만 「나만의 방식」을 인정받을 수 있는 곳이 오래 갑니다." + (ci >= 0 && DL[ci].stars >= 4 ? " 지금 " + DL[ci].p + " 대운은 독립 · 새 출발에도 좋은 시기입니다." : "") + '</p>' +
      '<table><tr><th>항목</th><th>추천</th></tr><tr><td class="qk">색</td><td>1순위 — ' + t.ELIFE[R.yong].col + '(' + t.EL_KO[R.yong] + '), 2순위 — ' + t.ELIFE[R.hui].col + '(' + t.EL_KO[R.hui] + '). ' + t.ELIFE[R.gi].col + '(' + t.EL_KO[R.gi] + ')은 과하지 않게.</td></tr>' +
      '<tr><td class="qk">방향 · 공간</td><td>' + t.ELIFE[R.yong].dir + '(' + t.EL_KO[R.yong] + ') · ' + t.ELIFE[R.hui].dir + '(' + t.EL_KO[R.hui] + '). ' + t.ELIFE[R.yong].place + ' · ' + t.ELIFE[R.hui].place + '이 보약입니다.</td></tr>' +
      '<tr><td class="qk">숫자 · 계절</td><td>' + t.EL_KO[R.yong] + '의 숫자 ' + t.ELIFE[R.yong].num + ', ' + t.EL_KO[R.hui] + '의 숫자 ' + t.ELIFE[R.hui].num + '. 계절은 ' + t.ELIFE[R.yong].season + josa(t.ELIFE[R.yong].season, "이", "가") + ' 가장 편하고, ' + t.ELIFE[R.gi].season + '에 쉽게 지칩니다.</td></tr>' +
      '<tr><td class="qk">사람</td><td>' + t.ELIFE[R.yong].ppl + '와 ' + t.ELIFE[R.hui].ppl + '.</td></tr></table>' +
      '<div class="qgrid2 qst1"><div class="qbox"><h5>몸 — 신경 쓸 곳</h5>● ' + ig.body + ' — ' + R.dg + ' 일간의 기본 약한 곳.<br>● ' + t.ELIFE[R.gi].body + ' — 조심할 기운(' + t.EL_KO[R.gi] + ')과 연결.' + (R.season ? '<br>● ' + (R.season === "화" ? "손발 냉증 · 순환 — 추운 계절 출생." : "열 · 갈증 · 수면 — 더운 계절 출생.") : "") +
        (YL.filter(function(y){ return y.stars <= 1.5; }).length ? '<br>● ' + YL.filter(function(y){ return y.stars <= 1.5; }).map(function(y){ return y.year; }).join(" · ") + "년 — 조심의 해, 정기 검진 권장." : "") + '</div>' +
      '<div class="qbox"><h5>보약이 되는 습관</h5>● ' + t.ELIFE[R.yong].fill.split(",").slice(0, 2).join(" · ") + '<br>● ' + t.ELIFE[R.hui].fill.split(",").slice(0, 2).join(" · ") + '<br>● 일찍 자기 · 물 자주 마시기</div></div><p style="font-size:12px;color:#7a8396">건강은 반드시 병원 진단이 우선입니다.</p>');
    // 💞 궁합 (저장된 다른 사람들과)
    var others = people().filter(function(x){ return x.id !== selId(); }).map(function(x){ try { return calcOf(x); } catch(z) { return null; } }).filter(Boolean);
    if (others.length){
      var CP = others.map(function(o){ var c = compat(R, o); c.o = o; return c; }).sort(function(a, b){ return b.sc - a.sc; }).slice(0, 6);
      h += pg("💞", "궁합 — 함께 저장한 사람들과", "앱에 저장된 사람과의 궁합을 계산했습니다. 관계를 돌아보는 재미로 읽어 주세요.",
        CP.map(function(c){ var col = c.sc >= 85 ? "#d4357f" : c.sc >= 72 ? "#169466" : c.sc >= 60 ? "#4cb882" : c.sc >= 48 ? "#c9a227" : "#e8834a", r = 30, cc = 2 * Math.PI * r, f = cc * c.sc / 100;
          return '<div class="qcp"><svg viewBox="0 0 76 76" style="width:76px"><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="#e8ebf2" stroke-width="7"/><circle cx="38" cy="38" r="' + r + '" fill="none" stroke="' + col + '" stroke-width="7" stroke-linecap="round" stroke-dasharray="' + f.toFixed(1) + ' ' + cc.toFixed(1) + '" transform="rotate(-90 38 38)"/><text x="38" y="44" text-anchor="middle" font-size="19" font-weight="800" fill="' + col + '">' + c.sc + '</text></svg>' +
            '<div><b style="font-size:15px">' + e(nm) + ' × ' + e(c.o.name) + '</b> <span class="qeltag" style="background:' + col + '">' + c.word + '</span><ul>' + c.why.map(function(w){ return '<li>' + w[0] + ' ' + w[1] + '</li>'; }).join("") + '</ul></div></div>'; }).join(""));
    }
    // 14 정리
    var bestY = YL.slice().sort(function(a, b){ return b.stars - a.stars || a.year - b.year; })[0], worstY = YL.slice().sort(function(a, b){ return a.stars - b.stars || a.year - b.year; })[0];
    var tips = [["뿌리부터 챙기기", "가장 필요한 건 " + t.EL_KO[R.yong] + "(" + t.grpShort(s.groupOfEl(R.dg, R.yong), R.sex) + "). " + t.ELIFE[R.yong].fill.split(",")[0] + "부터."],
      [R.sgg || R.grp.식상 >= 2 ? "「3초 쉬고 말하기」" : "「하루 묵혀 결정하기」", R.sgg || R.grp.식상 >= 2 ? "표현 글자가 강해 말이 마음보다 빠릅니다. 옳은 말도 부드럽게." : "생각이 깊은 만큼 결정은 한 박자 늦게 하면 실수가 줄어듭니다."]];
    MP.rx.slice(0, 2).forEach(function(r){ tips.push(r); });
    tips.push([bestY.year + " 손잡고 · " + worstY.year + " 지키기", "앞으로 10년 중 가장 좋은 해와 가장 조심할 해. 이 순서를 기억하세요."]);
    h += pg(14, "정리", "두 체계를 합친 결론입니다.",
      '<div class="qquote">' + oneLine(R).replace(/[「」]/g, "") + '.<br><small style="font-size:14px;font-weight:500">' + (ci >= 0 ? "지금 " + DL[ci].age[0] + "~" + DL[ci].age[1] + "세는 「" + DL[ci].grade + "」 구간이고, " : "") + "가장 필요한 " + t.EL_KO[R.yong] + " 기운을 채우면 더 오래 핍니다.</small></div>" +
      '<h4>◆ ' + e(nm) + ' 님을 위한 5가지 팁</h4><table><tr><th>No</th><th>실천</th><th>이유</th></tr>' + tips.slice(0, 5).map(function(r, i){ return '<tr><td class="qn">' + (i + 1) + '</td><td class="qk">' + r[0] + '</td><td>' + r[1] + '</td></tr>'; }).join("") + '</table>' +
      '<div class="qbox qgr"><b>좋은 점</b> — ' + (missing(R).length ? "" : "다섯 기운이 모두 있고, ") + t.grpShort(tops[0], R.sex) + ' 글자가 강해 ' + t.GRP_MEAN[tops[0]].split(" · ").slice(0, 2).join("·") + '의 힘이 있습니다.' + (SC.gui.length ? " 귀인 글자도 있습니다." : "") + '<br><b>과제</b> — ' + ig.weak + '.' + (R.strong ? " 넘치는 힘을 쓸 곳을 만드는 것." : " 쓸 곳이 많아 쉽게 지칩니다.") + '<br><b>길</b> — ' + t.EL_KO[R.yong] + '(' + t.ELIFE[R.yong].fill.split(",")[0] + ')을 키우고 ' + t.EL_KO[R.hui] + '(' + t.ELIFE[R.hui].fill.split(",")[0] + ')을 더하면 길이 열립니다.</div>');
    // 부록
    h += pg("부록", "계산 근거와 안내", "어떻게 계산했는지 투명하게 밝힙니다.",
      '<table><tr><th>항목</th><th>내용</th></tr>' +
      '<tr><td class="qk">출생 정보</td><td>양력 ' + R.solar.y + '년 ' + R.solar.m + '월 ' + R.solar.d + '일 ' + (R.noHour ? "시간 모름" : ("0" + R.solar.hh).slice(-2) + ":" + ("0" + R.solar.mi).slice(-2)) + ' · ' + lun + ' · ' + (R.sex === "M" ? "남성" : "여성") + ' · ' + R.city + (R.tz.dst ? ' · <b>서머타임 기간(1시간 뺌)</b>' : "") + (R.tz.base === 8.5 ? ' · 당시 표준시 UTC+8:30' : "") + '</td></tr>' +
      '<tr><td class="qk">년주 ' + R.P.y + '</td><td>입춘 기준으로 해가 바뀝니다. 사주 연도 ' + R.sajuYear + '년.</td></tr>' +
      '<tr><td class="qk">월주 ' + R.P.m + '</td><td>' + (R.term.name || "") + ' 이후의 ' + R.P.m[1] + '월(절기 기준). 태양 황경을 천문 계산식으로 구함.</td></tr>' +
      '<tr><td class="qk">일주 ' + R.P.d + '</td><td>2000-01-01 = 戊午를 기준으로 날짜를 셈.' + (R.ziNext ? " 자시(23시 이후)라 다음 날로 넘김." : "") + '</td></tr>' +
      (R.P.h ? '<tr><td class="qk">시주 ' + R.P.h + '</td><td>' + R.city + ' 경도 보정(' + R.lmt.corr + '분) 적용 → 실제 해시각 ' + ("0" + R.lmt.h).slice(-2) + ':' + ("0" + R.lmt.m).slice(-2) + ' = ' + R.P.h[1] + '시.</td></tr>' : '<tr><td class="qk">시주</td><td>시간을 몰라 빼고 계산(나머지 6글자로 판단).</td></tr>') +
      '<tr><td class="qk">대운</td><td>' + (R.sex === "M" ? "남성" : "여성") + ' · ' + (s.YANG[R.P.y[0]] ? "양" : "음") + '년 출생 → ' + (R.daeun.fwd ? "순행" : "역행") + '. 가까운 절기까지 약 ' + R.daeun.days + '일 ÷ 3 → 대운수 약 ' + R.daeun.start + '.</td></tr>' +
      '<tr><td class="qk">격국 · 용신</td><td>월지 ' + R.P.m[1] + ' = ' + R.monthSS + ' → ' + R.gyeok + '. 힘 ' + R.power + '점(' + R.powerLvl + '). ' + (R.how === "조후" ? "계절(조후) 기준" : "힘의 균형(억부) 기준") + ' → 용신 ' + t.EL_KO[R.yong] + ', 희신 ' + t.EL_KO[R.hui] + ', 기신 ' + t.EL_KO[R.gi] + ', 구신 ' + t.EL_KO[R.gu] + '.</td></tr>' +
      '<tr><td class="qk">신살</td><td>' + (R.sin.map(function(x){ return x.n + "(" + x.ch + ")"; }).join(" · ") || "없음") + ' · 공망 ' + R.gongmang.join("") + '</td></tr>' +
      '<tr><td class="qk">관계</td><td>' + (R.rel.map(function(r){ return r.s + " " + r.t; }).join(" · ") || "없음") + (R.sgg ? " · 상관견관" : "") + '</td></tr>' +
      '<tr><td class="qk">별자리</td><td>천문 계산식(Meeus)으로 산출: 태양 ' + A.sun.sign + ' ' + A.sun.deg + '° · 달 ' + A.moon.sign + ' ' + A.moon.deg + '°' + (A.asc ? ' · 상승궁 ' + A.asc.sign + ' ' + A.asc.deg + '° · MC ' + A.mc.sign + ' ' + A.mc.deg + '° (' + R.city + ' 기준, 오차 ±1°)' : "") + '</td></tr></table>' +
      (R.P.h ? (function(){ var lm = R.lmt.h * 60 + R.lmt.m, idx = Math.floor(((lm + 60) % 1440) / 120), st = (idx * 120 - 60 + 1440) % 1440, en = (st + 120) % 1440, toClock = function(x){ var c = (x - R.lmt.corr + 1440) % 1440; return Math.floor(c / 60) + "시 " + ("0" + c % 60).slice(-2) + "분"; };
        var near = Math.min((lm - st + 1440) % 1440, (en - lm + 1440) % 1440);
        return near <= 30 ? '<div class="qbox qor"><h5>⚠ 태어난 시간이 경계에 가깝습니다</h5>' + R.P.h[1] + '시는 시계로 약 ' + toClock(st) + ' ~ ' + toClock(en) + '입니다. 실제 출생 시각이 몇십 분만 달라도 시주가 바뀔 수 있습니다. 일주 · 월주 · 년주와 대운 흐름은 그대로이므로 큰 줄기는 같습니다.</div>' : ""; })() : "") +
      '<p style="font-size:11.5px;color:#7a8396;line-height:1.6">안내 · 이 리포트는 전통 명리학 및 서양 점성술 이론에 따른 해석이며, 과학적으로 검증된 예측이 아닙니다. 재물 · 투자 판단이나 건강 · 진로 · 결혼의 결론을 이 내용으로 대신하지 마세요. 배우자 · 자녀 서술은 특정 인물을 규정하는 것이 아니라 관계를 돌아보는 참고입니다. 「주의」로 표시된 시기도 불운이 일어난다는 뜻이 아니라, 명리 이론상 필요한 기운과 어긋난다는 의미입니다. 중요한 결정은 전문가 조언과 본인 판단이 우선입니다. · 작성일 ' + now.y + '년 ' + now.m + '월 ' + now.d + '일 · CH Investing 앱이 휴대폰 안에서 계산함</p>');
    return h;
  }
  /* Claude 채팅용 심화판 문구 (API 비용 없음 — 사용자가 Claude 앱에 붙여 넣음) */
  function prompt(R){
    var t = T(), s = S(), DL = s.daeunLuck(R), now = s.todayKST(), YL = []; for (var y = now.y; y < now.y + 10; y++) YL.push(s.yearLuck(R, y));
    var L = [];
    L.push("아래 계산값으로 「사주·별자리 — 나를 읽는 리포트」 종합 심화판 PDF를 만들어 줘.");
    L.push("형식: 예전에 만든 리포트와 같게 — 표지(남색, 8글자 카드, 한 줄 요약) · 1 한눈에 보기(레이더·네 문장·별점표) · 2 8글자/숨은 글자/12운성 · 관계도 · 3 간판(격국·신강약) · 4 가장 필요한 것(용신) · 5 특별한 표시(신살) · 6 다섯 기운 · 7 재물운 · 8 10년 대운 그래프 · 9 연도별 10년 · 10 올해 월별 · 11 배우자·자녀 · 12 별자리 · 13 생활(일·색·방향·건강) · 14 정리 · 부록(계산 근거·면책). 중학생도 이해할 쉬운 말, 「~입니다」체, 한자는 괄호로만, 차트 많이.");
    L.push("");
    L.push("[인적] " + (R.name || "") + " · " + (R.sex === "M" ? "남" : "여") + " · 양력 " + R.solar.y + "-" + R.solar.m + "-" + R.solar.d + " " + (R.noHour ? "시간 모름" : R.solar.hh + ":" + ("0" + R.solar.mi).slice(-2)) + " · " + (R.lunar ? "음력 " + R.lunar.y + "-" + (R.lunar.leap ? "윤" : "") + R.lunar.m + "-" + R.lunar.d : "") + " · " + R.city + (R.tz.dst ? " · 서머타임" : ""));
    L.push("[8글자] 시 " + (R.P.h || "?") + " · 일 " + R.P.d + " · 월 " + R.P.m + " · 년 " + R.P.y + " (경도 보정 " + R.lmt.corr + "분, 실제 해시각 " + R.lmt.h + ":" + ("0" + R.lmt.m).slice(-2) + ")");
    L.push("[십성] " + R.chars.filter(function(c){ return c.ss !== "일간"; }).map(function(c){ return t.POSS[c.pos] + (c.kind === "g" ? "간" : "지") + " " + c.ch + "=" + c.ss; }).join(", "));
    L.push("[숨은 글자] " + R.hidden.map(function(x){ return x.br + ":" + x.g.map(function(q){ return q.ch + "(" + q.ss + ")"; }).join(""); }).join(" · "));
    L.push("[오행] 겉 " + s.EL.map(function(k){ return k + R.el[k]; }).join(" ") + " / 숨은 포함 " + s.EL.map(function(k){ return k + R.elH[k]; }).join(" "));
    L.push("[12운성] " + R.pos.map(function(k){ return t.POSS[k] + " " + R.us[k]; }).join(", "));
    L.push("[관계] " + (R.rel.map(function(r){ return r.s + r.t + (r.el ? "(" + r.el + ")" : "") + "[" + t.POSS[r.a] + "-" + t.POSS[r.b] + "]"; }).join(", ") || "없음") + (R.sgg ? ", 상관견관" : ""));
    L.push("[신살] " + (R.sin.map(function(x){ return x.n + " " + x.ch + "(" + t.POSJ[x.pos] + ")"; }).join(", ") || "없음") + " · 공망 " + R.gongmang.join(""));
    L.push("[격국·힘·용신] " + R.gyeok + " · 힘 " + R.power + "점(" + R.powerLvl + ") · " + R.how + " · 용신 " + R.yong + " / 희신 " + R.hui + " / 한신 " + R.han + " / 구신 " + R.gu + " / 기신 " + R.gi);
    L.push("[대운] 대운수 " + R.daeun.start + " " + (R.daeun.fwd ? "순행" : "역행") + " · " + DL.slice(0, 9).map(function(x){ return x.age[0] + "~" + x.age[1] + " " + x.p + " ★" + x.stars; }).join(" | "));
    L.push("[연운] " + YL.map(function(y){ return y.year + " " + y.p + " ★" + y.stars; }).join(" | "));
    L.push("[별자리] 태양 " + R.astro.sun.sign + " " + R.astro.sun.deg + "° · 달 " + R.astro.moon.sign + " " + R.astro.moon.deg + "°" + (R.astro.asc ? " · 상승 " + R.astro.asc.sign + " " + R.astro.asc.deg + "° · MC " + R.astro.mc.sign + " " + R.astro.mc.deg + "°" : "") + " · " + R.astro.phase);
    L.push("[기준일] " + now.y + "-" + now.m + "-" + now.d);
    return L.join("\n");
  }
  function copyText(txt, btn){
    var done = function(){ if (btn){ var o = btn.innerHTML; btn.innerHTML = "✅ 복사됐어요<small>Claude 채팅에 붙여 넣기</small>"; setTimeout(function(){ btn.innerHTML = o; }, 2500); } };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, fb); else fb();
    function fb(){ var ta = document.createElement("textarea"); ta.value = txt; ta.style.cssText = "position:fixed;left:-9999px"; document.body.appendChild(ta); ta.select(); try { document.execCommand("copy"); done(); } catch(x) {} ta.remove(); }
  }
  /* PDF용: 한 쪽보다 긴 장은 「이어지는 카드」로 나눔 (쪽 경계에서 글이 잘리지 않게) — 표는 줄 단위로 나눔 */
  function pdfRoot(){
    var src = document.getElementById("sjRep"), W = src.getBoundingClientRect().width || 370, LIM = Math.round(W * 1.78);
    var host = document.createElement("div"); host.className = "sjr no-clp tidy-x"; host.style.cssText = "position:absolute;left:-30000px;top:0;width:" + W + "px";
    document.body.appendChild(host);
    [].forEach.call(src.children, function(sec){
      var c = sec.cloneNode(true); host.appendChild(c);
      if (c.offsetHeight <= LIM) return;
      var kids = [].slice.call(c.children), cur = c; c.innerHTML = "";
      var fresh = function(){ var nx = sec.cloneNode(false); nx.classList.add("qcont"); host.appendChild(nx); return nx; };
      kids.forEach(function(k){
        cur.appendChild(k);
        if (cur.offsetHeight <= LIM) return;
        if (k.tagName === "TABLE" && k.rows.length > 2){        // 표: 들어가는 만큼만 남기고 나머지 줄은 다음 카드로 (머리줄 다시)
          var rows = [].slice.call(k.rows), head = rows[0], rest = [];
          while (cur.offsetHeight > LIM && k.rows.length > 2){ var r = k.rows[k.rows.length - 1]; rest.unshift(r); r.parentNode.removeChild(r); }
          while (rest.length){
            cur = fresh(); var t2 = k.cloneNode(false), tb = document.createElement("tbody"); t2.appendChild(tb); tb.appendChild(head.cloneNode(true)); cur.appendChild(t2);
            while (rest.length){ tb.appendChild(rest[0]); if (cur.offsetHeight > LIM && tb.rows.length > 2){ tb.removeChild(rest[0]); break; } rest.shift(); }
          }
          return;
        }
        if (cur.children.length > 1){ cur.removeChild(k); cur = fresh(); cur.appendChild(k); }
      });
    });
    return host;
  }
  function renderSaju(){
    var root = document.getElementById("sjS"); if (!root) return;
    css();
    if (!ready()){ root.innerHTML = '<div class="loading">불러오는 중…</div>'; setTimeout(renderSaju, 300); return; }
    var p = sel();
    if (!p){ root.innerHTML = frame("saju", emptyCard("saju")); bindPpl(root, renderSaju); root.querySelector("[data-add2]").onclick = function(){ formOpen(root, null, renderSaju); }; return; }
    var R; try { R = calcOf(p); } catch(x) { root.innerHTML = frame("saju", '<div class="card">계산하지 못했어요: ' + e(x.message || x) + '</div>'); bindPpl(root, renderSaju); return; }
    var body; try { body = report(R); } catch(x) { try { console.error(x); } catch(z) {} body = '<section class="qsjp">리포트를 만들다 멈췄어요: ' + e(x.message || x) + '</section>'; }
    root.innerHTML = frame("saju", '<div class="sjr-tools sjr" style="padding:10px;margin-bottom:10px"><div class="qtools" style="margin:0">' +
      '<button id="sjPdf">📄 PDF로 저장<small>리포트 그대로 · 공유 가능</small></button><button id="sjCp">✨ Claude 심화판 문구<small>복사 → Claude 채팅에 붙여 넣기</small></button></div><div id="sjPdfBar"></div></div>' +
      '<div class="sjr no-clp tidy-x ez-no" id="sjRep">' + body + '</div><p class="sj-note">📜 계산은 모두 이 휴대폰 안에서 했어요(인터넷 · API 비용 없음). 더 길고 깊은 글이 필요하면 「Claude 심화판 문구」를 복사해 Claude 채팅에 붙여 넣으면 예전 리포트처럼 써 줘요.</p>');
    bindPpl(root, renderSaju);
    root.querySelector("#sjCp").onclick = function(){ copyText(prompt(R), this); };
    root.querySelector("#sjPdf").onclick = function(){
      var bar = root.querySelector("#sjPdfBar"); if (bar.firstChild) return;
      var name = "사주리포트_" + (R.name || "이름") + "_" + R.solar.y + ("0" + R.solar.m).slice(-2) + ("0" + R.solar.d).slice(-2);
      if (typeof pdfButton !== "function" || typeof loadScript !== "function"){ alert("PDF 도구를 불러오지 못했어요. 앱을 새로 고친 뒤 다시 해 주세요."); return; }
      var b = pdfButton(function(){ return loadScript(document, H2P).then(function(){ var host = pdfRoot(); return window.screenPdf(window, host, name, "#eef1f6", function(i, n){ var x = bar.querySelector(".pdfb"); if (x) x.innerHTML = "⏳ PDF 만드는 중… " + i + " / " + n + "<small>한 장씩 찍는 중이에요</small>"; }).finally(function(){ host.remove(); }); }); }, name);
      bar.appendChild(b); var bt = b.querySelector("button"); if (bt) bt.click();
    };
  }
  window.sajuView = function(){ return '<div id="sjS"><div class="loading">불러오는 중…</div></div>'; };
  window.sajuInit = function(){ renderSaju(); };
  window.sajuPdfRoot = function(){ return pdfRoot(); };
  window.sajuPrompt = function(){ var p = sel(); return p ? prompt(calcOf(p)) : ""; };   // 확인용
})();
