/* 🗣 쉬운 말 (10/28 사용자 「여전히 어렵고 복잡하다는 말을 많이 들어」 → 「쉬운 말로 바꾸는 건 하고」)
   만든 사람 말(킥·고래·국면·나침반·두뇌·뼈대·정직 계산…)을 처음 보는 사람도 아는 말로 — 화면 글자만 바꿈(자료·알림·영상 자막은 그대로).
   조사(이/가·은/는·을/를·과/와·으로/로·이에요/예요)는 바뀐 말 받침에 맞춰 고침.
   끄기(원복): localStorage easy = "off" · 코드째 원복은 index.html 의 easy.js 한 줄 빼기.
   조이 영상 찾기(guide.js vidFor)는 window.easyBack 으로 원래 제목을 씀 — 영상 그대로 맞음. */
(function(){
  try { if (localStorage.getItem("easy") === "off") return; } catch(x) {}
  var H = "[가-힣A-Za-z]";
  // [원래 말, 쉬운 말, 앞뒤 경계 검사 여부] — 긴 것부터
  var R = [
    ["공격\\(킥\\) 포트", "공격 포트"], ["킥 포트", "공격 포트"], ["공격\\(킥\\)", "공격"], ["킥 슬리브", "공격 몫"], ["슬리브", "몫"],
    ["킥", "공격", 1],
    ["시장확률", "오를 확률"],
    ["국면 신호판", "장 분위기판"], ["국면", "장 분위기", 1],
    ["나침반", "시장 흐름", 1],
    ["고래", "큰손", 1],
    ["두뇌 논지", "자동 분석 전망"], ["두뇌", "자동 분석", 1], ["논지", "전망", 1],
    ["정직 계산", "비용 뺀 계산"], ["정직 성적", "비용 뺀 성적"], ["정직 방식", "비용 뺀 방식"], ["정직 숫자", "비용 뺀 숫자"], ["정직", "비용 뺀", 1],
    ["예고 채점", "예측 채점"], ["예고", "예측", 1],
    ["뼈대", "기본 틀", 1],
    ["변동성 맞춤", "흔들림 조절"],
    ["횡보", "제자리", 1],
    ["아웃퍼폼", "시장보다 나음"], ["언더퍼폼", "시장보다 못함"], ["익스포저", "비중", 1], ["모멘텀", "오름세", 1],
    ["거르기", "종목 찾기", 1]
  ];
  var EXACT = {"☕ 컵": "☕ 컵 차트", "📈 갭": "📈 갭 상승", "컵": "컵 차트", "갭": "갭 상승"};   // 탭 이름처럼 그 말만 있는 칸
  var PART = "(이에요|예요|으로|로|이|가|은|는|을|를|과|와)?";
  function jong(w){ var c = w.charCodeAt(w.length - 1) - 0xAC00; if (c < 0 || c > 11171) return -1; return c % 28; }   // 0 = 받침 없음, 8 = ㄹ
  function fix(w, p){
    if (!p) return w; var j = jong(w); if (j < 0) return w + p; var has = j > 0;
    switch (p){
      case "이": case "가": return w + (has ? "이" : "가");
      case "은": case "는": return w + (has ? "은" : "는");
      case "을": case "를": return w + (has ? "을" : "를");
      case "과": case "와": return w + (has ? "과" : "와");
      case "으로": case "로": return w + (has && j !== 8 ? "으로" : "로");
      case "이에요": case "예요": return w + (has ? "이에요" : "예요");
    }
    return w + p;
  }
  var RX = R.map(function(r){ return {re: new RegExp((r[2] ? "(^|[^가-힣A-Za-z])" : "()") + r[0] + PART + "(?![가-힣])", "g"), to: r[1], b: !!r[2]}; });
  var TEST = new RegExp(R.map(function(r){ return r[0]; }).join("|"));
  function conv(v){
    var o = v;
    RX.forEach(function(x){ o = o.replace(x.re, function(m, pre, p){ return pre + fix(x.to, p); }); });
    return o;
  }
  var ORIG = new WeakMap();
  var SKIP = "script,style,svg,textarea,input,select,code,pre,[contenteditable],.ez-no";
  function doNode(n){
    var v = n.nodeValue; if (!v) return;
    var p = n.parentElement; if (!p || p.closest(SKIP)) return;
    var t = v.trim(), o = null;
    if (EXACT[t]) o = v.replace(t, EXACT[t]);
    else if (TEST.test(v)) o = conv(v);
    if (o != null && o !== v){ ORIG.set(n, v); var e1 = o.trim(), o1 = v.trim(); if (e1 && e1 !== o1 && BACK.size < 4000) BACK.set(e1, o1); n.nodeValue = o; }
  }
  function walk(root){
    if (!root) return;
    if (root.nodeType === 3) return doNode(root);
    if (root.nodeType !== 1 || (root.closest && root.closest(SKIP))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(doNode);
  }
  // 조이 영상 찾기용: 쉬운 말로 바뀐 글 → 원래 글 (영상 지도는 원래 제목으로 만들어짐)
  var BACK = new Map();
  window.easyBack = function(str){
    if (!str) return str; var o = String(str);
    BACK.forEach(function(orig, easy){ if (o.indexOf(easy) >= 0) o = o.split(easy).join(orig); });
    return o;
  };
  var TERMB = [["큰손", "고래"], ["장 분위기", "국면"], ["시장 흐름", "나침반"], ["오를 확률", "시장확률"], ["자동 분석 전망", "두뇌 논지"], ["자동 분석", "두뇌"], ["기본 틀", "뼈대"], ["비용 뺀", "정직"], ["예측", "예고"], ["제자리", "횡보"], ["공격 포트", "킥 포트"], ["종목 찾기", "거르기"], ["컵 차트", "컵"], ["갭 상승", "갭"]];
  window.easyBackTerms = function(str){ var o = String(str || ""); TERMB.forEach(function(t){ o = o.split(t[0]).join(t[1]); }); return o; };   // 낱말 단위 되돌리기(영상 못 찾았을 때만)
  window.easyText = conv;
  var q = [], sch = false;
  function flush(){ sch = false; var a = q; q = []; a.forEach(walk); }
  new MutationObserver(function(ms){
    ms.forEach(function(m){ if (m.type === "characterData") q.push(m.target); else [].forEach.call(m.addedNodes, function(n){ q.push(n); }); });
    if (!sch && q.length){ sch = true; (window.requestAnimationFrame || setTimeout)(flush); }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true});
  walk(document.body);
})();
