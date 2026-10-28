/* 🗣 쉬운 말 (10/28 사용자 「여전히 어렵고 복잡하다는 말을 많이 들어」 → 「쉬운 말로 바꾸는 건 하고」 → 「쉬운 말 전체로」)
   만든 사람 말(킥·고래·국면·나침반·두뇌·뼈대·정직 계산·매집·표본·손익비…)을 처음 보는 사람도 아는 말로.
   적용: ① 앱 화면 글자·풍선 도움말 ② 그림으로 그리는 장(오늘 한 장·고객 한 장 캔버스) ③ 휴대폰 푸시 알림(sw.js 가 이 파일을 불러 씀) ④ 조이 말풍선·용어 풀이.
   조사(이/가·은/는·을/를·과/와·으로/로·이에요/예요)는 바뀐 말 받침에 맞춰 고침. 낱말 앞뒤가 다른 한글이면 안 바꿈(킥오프 등).
   끄기(원복): localStorage easy = "off" (화면·그림) · 코드째 원복은 index.html 의 easy.js 줄과 sw.js 의 importScripts 줄 빼기.
   조이 영상 찾기(guide.js vidFor)는 제목 그대로 → easyBack(바꾼 글→원래 글) → easyBackTerms(낱말 되돌림) 순서. */
(function(G){
  var R = [
    // [원래 말(정규식), 쉬운 말, 앞 경계 검사, 바로 뒤에 오면 안 바꾸는 것]
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
    ["변동성 맞춤", "흔들림 조절"], ["변동성", "출렁임", 1],
    ["횡보", "제자리", 1],
    ["아웃퍼폼", "시장보다 나음"], ["언더퍼폼", "시장보다 못함"], ["익스포저", "비중", 1], ["모멘텀", "오름세", 1],
    ["거르기", "종목 찾기", 1],
    ["조용한 매집", "조용히 사 모으기"], ["매집", "사 모으기", 1],
    ["표본", "사례", 1],
    ["손익비", "번 돈÷잃은 돈", 1],
    ["적중률", "맞힌 비율", 1],
    ["최대 낙폭", "가장 크게 빠진 폭"], ["낙폭", "하락폭", 1],
    ["코어", "기본", 1],
    ["컵앤핸들", "컵 모양 차트"], ["핸들", "손잡이", 1], ["피벗", "돌파 기준점", 1],
    ["알파", "시장보다 더 번 몫", 1],
    ["헤지", "손실 막기", 1],
    ["샤프", "위험 대비 수익", 1],
    ["컵", "컵 차트", 1, " ?차트| ?모양|앤"],
    ["갭", "갭 상승", 1, " ?상승|\\)"]
  ];
  var EXACT = {"☕ 컵": "☕ 컵 차트", "📈 갭": "📈 갭 상승"};
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
  var RX = R.map(function(r){ return {re: new RegExp((r[2] ? "(^|[^가-힣A-Za-z])" : "()") + r[0] + (r[3] ? "(?!" + r[3] + ")" : "") + PART + "(?![가-힣])", "g"), to: r[1]}; });
  var TEST = new RegExp(R.map(function(r){ return r[0]; }).join("|"));
  function conv(v){
    if (v == null) return v; var s = String(v), t = s.trim();
    if (EXACT[t]) return s.replace(t, EXACT[t]);
    if (!TEST.test(s)) return s;
    RX.forEach(function(x){ s = s.replace(x.re, function(m, pre, p){ return pre + fix(x.to, p); }); });
    return s;
  }
  var TERMB = [["큰손", "고래"], ["장 분위기판", "국면 신호판"], ["장 분위기", "국면"], ["시장 흐름", "나침반"], ["오를 확률", "시장확률"], ["자동 분석 전망", "두뇌 논지"], ["자동 분석", "두뇌"], ["기본 틀", "뼈대"], ["비용 뺀", "정직"],
    ["예측", "예고"], ["제자리", "횡보"], ["공격 포트", "킥 포트"], ["종목 찾기", "거르기"], ["컵 차트", "컵"], ["갭 상승", "갭"], ["조용히 사 모으기", "조용한 매집"], ["사 모으기", "매집"], ["흔들림 조절", "변동성 맞춤"], ["출렁임", "변동성"], ["맞힌 비율", "적중률"], ["사례", "표본"], ["하락폭", "낙폭"]];
  G.easyText = conv;
  G.easyBackTerms = function(str){ var o = String(str || ""); TERMB.forEach(function(t){ o = o.split(t[0]).join(t[1]); }); return o; };   // 낱말 단위 되돌리기(영상 못 찾았을 때만)

  if (typeof document === "undefined") return;                          // ↓ 여기부터는 앱 화면(서비스 워커는 위 conv 만 씀)
  try { if (localStorage.getItem("easy") === "off"){ G.easyText = function(v){ return v; }; return; } } catch(x) {}

  // ② 그림으로 그리는 장(캔버스) — 재는 글자와 그리는 글자가 같아야 줄바꿈이 맞음
  try {
    var P = CanvasRenderingContext2D.prototype;
    ["fillText", "strokeText", "measureText"].forEach(function(k){ var f = P[k]; if (!f || f._ez) return;
      var g = function(t){ var a = [].slice.call(arguments); a[0] = conv(t); return f.apply(this, a); }; g._ez = 1; P[k] = g; });
  } catch(x) {}

  var BACK = new Map();
  G.easyBack = function(str){
    if (!str) return str; var o = String(str);
    BACK.forEach(function(orig, easy){ if (o.indexOf(easy) >= 0) o = o.split(easy).join(orig); });
    return o;
  };
  var SKIP = "script,style,svg,textarea,input,select,code,pre,[contenteditable],.ez-no";
  function doNode(n){
    var v = n.nodeValue; if (!v) return;
    var p = n.parentElement; if (!p || p.closest(SKIP)) return;
    var o = conv(v);
    if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (e1 && e1 !== o1 && BACK.size < 4000) BACK.set(e1, o1); n.nodeValue = o; }
  }
  function walk(root){
    if (!root) return;
    if (root.nodeType === 3) return doNode(root);
    if (root.nodeType !== 1 || (root.closest && root.closest(SKIP))) return;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT), a = [], x; while ((x = w.nextNode())) a.push(x); a.forEach(doNode);
  }
  // 풍선 도움말(data-tip)·누르면 뜨는 제목(title)·입력 칸 안내(placeholder)
  var ATTR = ["data-tip", "title", "placeholder"];
  function doAttr(el){ if (!el || el.nodeType !== 1 || (el.closest && el.closest("svg"))) return; ATTR.forEach(function(a){ var v = el.getAttribute(a); if (v){ var o = conv(v); if (o !== v){ var e1 = o.trim(), o1 = v.trim(); if (BACK.size < 4000) BACK.set(e1, o1); el.setAttribute(a, o); } } }); }
  function walkAttr(root){ if (!root || root.nodeType !== 1) return; doAttr(root); [].forEach.call(root.querySelectorAll("[data-tip],[title],[placeholder]"), doAttr); }
  var q = [], sch = false;
  function flush(){ sch = false; var a = q; q = []; a.forEach(function(n){ walk(n); walkAttr(n); }); }
  new MutationObserver(function(ms){
    ms.forEach(function(m){ if (m.type === "childList") [].forEach.call(m.addedNodes, function(n){ q.push(n); }); else q.push(m.target); });
    if (!sch && q.length){ sch = true; (window.requestAnimationFrame || setTimeout)(flush); }
  }).observe(document.documentElement, {childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTR});
  walk(document.body); walkAttr(document.body);
})(typeof window !== "undefined" ? window : self);
