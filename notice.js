/* 📢 11/25 안내 공지 — 사용자 「어플 처음에 안내 공지를 띄우자」
   계산 저장소(market-strategy-report)가 11/24 저녁부터 GitHub 에 막혀, 시황·두뇌·계기판·포트 등 분석 자료가 11/24 저녁 기준으로 멈춤.
   하는 일: 앱을 열 때(탭/창 하나에 한 번) 가운데 안내 창 + 닫은 뒤에도 맨 위에 얇은 띠 한 줄.
   저절로 사라짐: 막힌 저장소의 자료(raw)를 다시 읽을 수 있으면 = 풀린 것 → 창·띠 모두 안 띄움.
   끄기: index.html 에서 notice.js 줄을 빼면 끝 (정상화되면 뺄 것) */
(function(){
  var D = document;
  var MSG_T = "📢 안내";
  var MSG_B = "현재 자료 서버(GitHub) 문제로 <b>시황·두뇌·계기판·포트 등 분석 자료 대부분이 11월 24일 저녁 기준으로 멈춰</b> 있음.<br><br>" +
              "이용에 착오 없으시길 바람.<br><br>" +
              "<b>이 공지가 사라지면 해결된 것</b>으로 보시면 됨.";
  var PROBE = "https://raw.githubusercontent.com/chkchp0702-spec/market-strategy-report/main/market/kick.json?";

  function ss(k, v){ try { if (v === undefined) return sessionStorage.getItem(k); sessionStorage.setItem(k, v); } catch(x){ return null; } }

  function bar(){
    if (D.getElementById("ntc-bar")) return;
    var b = D.createElement("div");
    b.id = "ntc-bar";
    b.style.cssText = "position:sticky;top:0;z-index:9998;background:#fff4d6;color:#6b4a00;border-bottom:1px solid #f0d58a;font-size:13px;line-height:1.4;padding:7px 12px;text-align:center;cursor:pointer";
    b.innerHTML = "⚠ 분석 자료 대부분 <b>11/24 저녁 기준</b> (자료 서버 문제) · 눌러서 보기";
    b.onclick = pop;
    D.body.insertBefore(b, D.body.firstChild);
  }

  function pop(){
    if (D.getElementById("ntc-pop")) return;
    var w = D.createElement("div");
    w.id = "ntc-pop";
    w.style.cssText = "position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;padding:20px";
    w.innerHTML = '<div style="background:#fff;color:#222;max-width:360px;width:100%;border-radius:16px;padding:22px 20px 16px;box-shadow:0 10px 30px rgba(0,0,0,.25);font-size:15px;line-height:1.6">' +
      '<div style="font-size:18px;font-weight:700;margin-bottom:10px">' + MSG_T + '</div>' +
      '<div>' + MSG_B + '</div>' +
      '<button id="ntc-ok" style="margin-top:16px;width:100%;padding:12px;border:0;border-radius:10px;background:#2b6cff;color:#fff;font-size:16px;font-weight:600">확인</button></div>';
    D.body.appendChild(w);
    function close(){ ss("ntc1125", "1"); if (w.parentNode) w.parentNode.removeChild(w); }
    D.getElementById("ntc-ok").onclick = close;
    w.addEventListener("click", function(ev){ if (ev.target === w) close(); });
  }

  function show(){ bar(); if (ss("ntc1125") !== "1") pop(); }

  function go(){
    var done = false;
    /* 막힌 저장소를 다시 읽을 수 있으면 공지 안 띄움. 5초 안에 답이 없으면 막힌 것으로 보고 띄움 */
    var t = setTimeout(function(){ if (!done){ done = true; show(); } }, 5000);
    fetch(PROBE + Math.floor(Date.now() / 300000), {cache: "no-store"}).then(function(r){
      if (done) return; done = true; clearTimeout(t);
      if (!r.ok) show();
    }).catch(function(){ if (!done){ done = true; clearTimeout(t); show(); } });
  }

  if (D.readyState === "loading") D.addEventListener("DOMContentLoaded", go); else go();
})();
