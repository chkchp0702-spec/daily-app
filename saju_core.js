/* CH Investing — 🔮 사주 계산 엔진 (10/28)
   API·서버 없이 휴대폰 안에서 전부 계산함: 만세력(절기·음력) · 8글자 · 숨은 글자 · 십성 · 12운성 · 합충형 · 신살 · 신강약 · 용신 · 대운 · 연·월·일 운 · 별자리(태양·달·상승궁)
   태양·달·삭(초하루)·절기는 천문 계산식(Meeus)으로 직접 구함. 1900~2100년.
   saju-report 저장소(예전 리포트 계산기)의 엔진을 옮기고 보강: 상승궁·12운성·태극귀인·백호·일록·천간합충·원진·방합, 서머타임·표준시(8:30) 보정, 자시 날짜 바꿈 */
(function(G){
  "use strict";
  var GAN = "甲乙丙丁戊己庚辛壬癸".split(""), JI = "子丑寅卯辰巳午未申酉戌亥".split("");
  var GAN_EL = {甲:"목",乙:"목",丙:"화",丁:"화",戊:"토",己:"토",庚:"금",辛:"금",壬:"수",癸:"수"};
  var JI_EL = {寅:"목",卯:"목",巳:"화",午:"화",辰:"토",戌:"토",丑:"토",未:"토",申:"금",酉:"금",亥:"수",子:"수"};
  var YANG = {甲:1,乙:0,丙:1,丁:0,戊:1,己:0,庚:1,辛:0,壬:1,癸:0};
  var JI_YANG = {子:1,丑:0,寅:1,卯:0,辰:1,巳:0,午:1,未:0,申:1,酉:0,戌:1,亥:0};
  // 숨은 글자(지장간) — 여기·중기·정기 순, 겹치는 것은 하나로. 마지막이 정기(대표)
  var JZ = {子:["壬","癸"],丑:["癸","辛","己"],寅:["戊","丙","甲"],卯:["甲","乙"],辰:["乙","癸","戊"],巳:["戊","庚","丙"],
            午:["丙","己","丁"],未:["丁","乙","己"],申:["戊","壬","庚"],酉:["庚","辛"],戌:["辛","丁","戊"],亥:["戊","甲","壬"]};
  var EL = ["목","화","토","금","수"];
  var SAENG = {목:"화",화:"토",토:"금",금:"수",수:"목"}, GEUK = {목:"토",토:"수",수:"화",화:"금",금:"목"};
  function genBy(e){ for (var k in SAENG) if (SAENG[k] === e) return k; }   // e 를 낳는 것
  function ctlBy(e){ for (var k in GEUK) if (GEUK[k] === e) return k; }     // e 를 누르는 것
  var SS_GROUP = {비견:"비겁",겁재:"비겁",식신:"식상",상관:"식상",편재:"재성",정재:"재성",편관:"관성",정관:"관성",편인:"인성",정인:"인성"};

  function elOf(ch){ return GAN_EL[ch] || JI_EL[ch]; }
  function sipsinEl(dg, te, sameYY){
    var de = GAN_EL[dg];
    if (te === de) return sameYY ? "비견" : "겁재";
    if (SAENG[de] === te) return sameYY ? "식신" : "상관";
    if (GEUK[de] === te) return sameYY ? "편재" : "정재";
    if (GEUK[te] === de) return sameYY ? "편관" : "정관";
    if (SAENG[te] === de) return sameYY ? "편인" : "정인";
    return "?";
  }
  function sipsin(dg, ch){
    if (GAN_EL[ch]) return sipsinEl(dg, GAN_EL[ch], YANG[dg] === YANG[ch]);
    var rep = JZ[ch][JZ[ch].length - 1];                         // 땅 글자는 정기의 음양으로
    return sipsinEl(dg, JI_EL[ch], YANG[dg] === YANG[rep]);
  }
  function groupOfEl(dg, e){ var de = GAN_EL[dg];
    return e === de ? "비겁" : SAENG[de] === e ? "식상" : GEUK[de] === e ? "재성" : GEUK[e] === de ? "관성" : "인성"; }
  function elOfGroup(dg, g){ var de = GAN_EL[dg];
    return {비겁: de, 식상: SAENG[de], 재성: GEUK[de], 관성: ctlBy(de), 인성: genBy(de)}[g]; }

  /* ───────── 천문 (Meeus) ───────── */
  var RAD = Math.PI / 180;
  function jdUT(y, m, d, h){   // 양력 → 율리우스일 (h = UT 시간, 소수)
    if (m <= 2){ y -= 1; m += 12; }
    var A = Math.floor(y / 100), B = 2 - A + Math.floor(A / 4);
    return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + h / 24 + B - 1524.5;
  }
  function jdToDate(jd){
    var z = Math.floor(jd + 0.5), f = jd + 0.5 - z, a = Math.floor((z - 1867216.25) / 36524.25);
    var A = z + 1 + a - Math.floor(a / 4), B = A + 1524, C = Math.floor((B - 122.1) / 365.25), D = Math.floor(365.25 * C), E = Math.floor((B - D) / 30.6001);
    var day = B - D - Math.floor(30.6001 * E) + f, mo = E < 14 ? E - 1 : E - 13;
    return {y: mo > 2 ? C - 4716 : C - 4715, m: mo, d: day};
  }
  function norm(x){ return ((x % 360) + 360) % 360; }
  function sunLon(jd){       // 겉보기 황경(도)
    var T = (jd - 2451545) / 36525, M = 357.5291092 + 35999.0502909 * T - 0.0001537 * T * T, L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
    var C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(M * RAD) + (0.019993 - 0.000101 * T) * Math.sin(2 * M * RAD) + 0.000289 * Math.sin(3 * M * RAD);
    var Om = 125.04 - 1934.136 * T;
    return norm(L0 + C - 0.00569 - 0.00478 * Math.sin(Om * RAD));
  }
  var MOON_T = [[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],
    [2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],
    [0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],
    [2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236]];
  function moonLon(jd){
    var T = (jd - 2451545) / 36525;
    var Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T, D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T;
    var M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T, Mp = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T;
    var F = 93.272095 + 483202.0175233 * T - 0.0036539 * T * T, E = 1 - 0.002516 * T - 0.0000074 * T * T;
    var A1 = 119.75 + 131.849 * T, A2 = 53.09 + 479264.29 * T, s = 0;
    MOON_T.forEach(function(t){ var e = Math.abs(t[1]) === 1 ? E : Math.abs(t[1]) === 2 ? E * E : 1;
      s += t[4] * e * Math.sin((t[0] * D + t[1] * M + t[2] * Mp + t[3] * F) * RAD); });
    s += 3958 * Math.sin(A1 * RAD) + 1962 * Math.sin((Lp - F) * RAD) + 318 * Math.sin(A2 * RAD);
    var Om = 125.04452 - 1934.136261 * T;
    return norm(Lp + s / 1e6 - 0.00478 * Math.sin(Om * RAD));
  }
  function ascMc(jd, lat, lon){
    var T = (jd - 2451545) / 36525;
    var gmst = norm(280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000);
    var ramc = norm(gmst + lon) * RAD, eps = (23.4392911 - 0.0130042 * T) * RAD, phi = lat * RAD;
    var asc = norm(Math.atan2(Math.cos(ramc), -(Math.sin(ramc) * Math.cos(eps) + Math.tan(phi) * Math.sin(eps))) / RAD);
    var mc = norm(Math.atan2(Math.sin(ramc), Math.cos(ramc) * Math.cos(eps)) / RAD);
    return {asc: asc, mc: mc};
  }
  // 태양 황경이 lon 이 되는 순간(JD, UT) — 근처 날짜에서 출발
  function termJD(year, lon){
    var base = {315:[2,4],330:[2,19],345:[3,6],0:[3,21],15:[4,5],30:[4,20],45:[5,5],60:[5,21],75:[6,6],90:[6,21],105:[7,7],120:[7,23],
                135:[8,7],150:[8,23],165:[9,8],180:[9,23],195:[10,8],210:[10,23],225:[11,7],240:[11,22],255:[12,7],270:[12,22],285:[1,6],300:[1,20]}[lon];
    var g = jdUT(year, base[0], base[1], 0);
    for (var i = 0; i < 50; i++){ var df = ((sunLon(g) - lon + 540) % 360) - 180; g -= df * 365.2422 / 360; if (Math.abs(df) < 1e-7) break; }
    return g;
  }
  // 절월 경계 12개 (입춘 315 = 寅월 시작)
  var MSEQ = [["寅",315],["卯",345],["辰",15],["巳",45],["午",75],["未",105],["申",135],["酉",165],["戌",195],["亥",225],["子",255],["丑",285]];
  var TERM_NAME = {315:"입춘",345:"경칩",15:"청명",45:"입하",75:"망종",105:"소서",135:"입추",165:"백로",195:"한로",225:"입동",255:"대설",285:"소한"};
  var TCACHE = {};
  function termsAround(y){   // y-1 ~ y+1 절월 경계 (시간순)
    if (TCACHE[y]) return TCACHE[y];
    var all = [];
    [y - 1, y, y + 1].forEach(function(yy){ MSEQ.forEach(function(p){ all.push({br: p[0], lon: p[1], jd: termJD(p[1] >= 285 ? yy - 1 : yy, p[1])}); }); });
    all.sort(function(a, b){ return a.jd - b.jd; });
    return (TCACHE[y] = all);
  }
  function monthAt(jd){   // 그 순간이 든 절월 {br, start, end}
    var y = Math.round(jdToDate(jd).y), L = termsAround(y);
    for (var i = 0; i < L.length - 1; i++) if (L[i].jd <= jd && jd < L[i + 1].jd) return {br: L[i].br, lon: L[i].lon, start: L[i].jd, end: L[i + 1].jd};
    return null;
  }
  function sajuYearAt(jd){ var y = Math.round(jdToDate(jd).y); return jd < termJD(y, 315) ? y - 1 : y; }
  function yearPillar(sy){ var i = ((sy - 1984) % 60 + 60) % 60; return GAN[i % 10] + JI[i % 12]; }
  function monthPillar(yg, br){
    var st = {甲:"丙",己:"丙",乙:"戊",庚:"戊",丙:"庚",辛:"庚",丁:"壬",壬:"壬",戊:"甲",癸:"甲"}[yg], ord = "寅卯辰巳午未申酉戌亥子丑";
    return GAN[(GAN.indexOf(st) + ord.indexOf(br)) % 10] + br;
  }
  function dayNum(y, m, d){ return Math.round(jdUT(y, m, d, 0) + 0.5); }       // 정수 날짜 번호
  function dateOfNum(n){ var t = jdToDate(n - 0.5); return {y: t.y, m: t.m, d: Math.round(t.d)}; }
  function dayPillarN(n){ var i = ((n - dayNum(2000, 1, 1) + 54) % 60 + 60) % 60; return GAN[i % 10] + JI[i % 12]; }   // 2000-01-01 = 戊午
  function dayPillar(y, m, d){ return dayPillarN(dayNum(y, m, d)); }
  function hourPillar(dg, hb){
    var st = {甲:"甲",己:"甲",乙:"丙",庚:"丙",丙:"戊",辛:"戊",丁:"庚",壬:"庚",戊:"壬",癸:"壬"}[dg];
    return GAN[(GAN.indexOf(st) + JI.indexOf(hb)) % 10] + hb;
  }
  function pillarIdx(p){ for (var i = 0; i < 60; i++) if (GAN[i % 10] === p[0] && JI[i % 12] === p[1]) return i; return -1; }
  function pillarAt(i){ i = ((i % 60) + 60) % 60; return GAN[i % 10] + JI[i % 12]; }

  /* ───────── 음력 (삭 · 중기) ───────── */
  function newMoonJDE(k){
    var T = k / 1236.85, r = RAD;
    var jde = 2451550.09766 + 29.530588861 * k + 0.00015437 * T * T - 0.00000015 * T * T * T + 0.00000000073 * T * T * T * T;
    var E = 1 - 0.002516 * T - 0.0000074 * T * T, M = 2.5534 + 29.1053567 * k - 0.0000014 * T * T, Mp = 201.5643 + 385.81693528 * k + 0.0107582 * T * T;
    var F = 160.7108 + 390.67050284 * k - 0.0016118 * T * T, O = 124.7746 - 1.56375588 * k + 0.0020672 * T * T;
    var c = -0.4072 * Math.sin(r * Mp) + 0.17241 * E * Math.sin(r * M) + 0.01608 * Math.sin(r * 2 * Mp) + 0.01039 * Math.sin(r * 2 * F)
      + 0.00739 * E * Math.sin(r * (Mp - M)) - 0.00514 * E * Math.sin(r * (Mp + M)) + 0.00208 * E * E * Math.sin(r * 2 * M) - 0.00111 * Math.sin(r * (Mp - 2 * F))
      - 0.00057 * Math.sin(r * (Mp + 2 * F)) + 0.00056 * E * Math.sin(r * (2 * Mp + M)) - 0.00042 * Math.sin(r * 3 * Mp) + 0.00042 * E * Math.sin(r * (M + 2 * F))
      + 0.00038 * E * Math.sin(r * (M - 2 * F)) - 0.00024 * E * Math.sin(r * (2 * Mp - M)) - 0.00017 * Math.sin(r * O) - 0.00007 * Math.sin(r * (Mp + 2 * M));
    return jde + c;
  }
  function kstDay(jd){ return Math.floor(jd + 9 / 24 + 0.5); }   // 한국 날짜 번호 (음력은 1912년 이후 한국 기준시로 계산)
  var LSEG = {};
  function lunarSeg(Y){   // Y년 동지가 든 달(11월) ~ 다음 동지 달 직전
    if (LSEG[Y]) return LSEG[Y];
    var k0 = Math.floor((Y - 2000 + 0.83) * 12.3685) - 2, nm = [];
    for (var k = k0; k <= k0 + 17; k++) nm.push(kstDay(newMoonJDE(k)));
    var months = []; for (var i = 0; i < nm.length - 1; i++) months.push({start: nm[i], end: nm[i + 1] - 1});
    var jg = []; [Y, Y + 1].forEach(function(yy){ [300, 330, 0, 30, 60, 90, 120, 150, 180, 210, 240, 270].forEach(function(l){ jg.push(kstDay(termJD(yy, l))); }); });
    var d1 = kstDay(termJD(Y, 270)), d2 = kstDay(termJD(Y + 1, 270));
    var i1 = months.findIndex(function(m){ return m.start <= d1 && d1 <= m.end; }), i2 = months.findIndex(function(m){ return m.start <= d2 && d2 <= m.end; });
    var n = i2 - i1, out = [], leapDone = false, ly = Y;
    for (var j = 0; j < n; j++){
      var mo = months[i1 + j], hasJ = jg.some(function(g){ return g >= mo.start && g <= mo.end; }), num, leap = false;
      if (n === 13 && !hasJ && j > 0 && !leapDone){ num = out[out.length - 1].num; leap = true; leapDone = true; }
      else { num = j === 0 ? 11 : out[out.length - 1].num + 1; if (num > 12){ num -= 12; } if (num === 1 && !leap) ly = Y + 1; }
      out.push({ly: ly, num: num, leap: leap, start: mo.start, end: mo.end});
    }
    return (LSEG[Y] = out);
  }
  function lunarToSolar(ly, lm, ld, leap){
    var seg = lunarSeg(lm >= 11 ? ly : ly - 1), hit = seg.filter(function(x){ return x.ly === ly && x.num === lm && x.leap === !!leap; })[0];
    if (!hit) throw new Error("음력 " + ly + "년 " + (leap ? "윤" : "") + lm + "월이 없음");
    var len = hit.end - hit.start + 1; if (ld < 1 || ld > len) throw new Error("음력 " + lm + "월은 " + len + "일까지임");
    return dateOfNum(hit.start + ld - 1);
  }
  function solarToLunar(y, m, d){
    var n = dayNum(y, m, d), segs = [lunarSeg(y - 1), lunarSeg(y)];
    for (var s = 0; s < 2; s++) for (var i = 0; i < segs[s].length; i++){ var x = segs[s][i]; if (x.start <= n && n <= x.end) return {y: x.ly, m: x.num, d: n - x.start + 1, leap: x.leap}; }
    return null;
  }
  function leapMonthOf(ly){ var L = lunarSeg(ly - 1).concat(lunarSeg(ly)).filter(function(x){ return x.ly === ly && x.leap; }); return L.length ? L[0].num : 0; }

  /* ───────── 한국 표준시 · 서머타임 ───────── */
  var DST = [[1948,6,1,9,13],[1949,4,3,9,11],[1950,4,1,9,10],[1951,5,6,9,9],[1955,5,5,9,9],[1956,5,20,9,30],[1957,5,5,9,22],[1958,5,4,9,21],
             [1959,5,3,9,20],[1960,5,1,9,18],[1987,5,10,10,11],[1988,5,8,10,9]];
  function tzOf(y, m, d){   // 그날 시계가 쓰던 UTC 차이(시간) · 서머타임 여부
    var n = dayNum(y, m, d), base = (n >= dayNum(1954, 3, 21) && n < dayNum(1961, 8, 10)) ? 8.5 : 9, dst = false;
    DST.forEach(function(r){ if (r[0] === y && n >= dayNum(y, r[1], r[2]) && n < dayNum(y, r[3], r[4])) dst = true; });
    return {off: base + (dst ? 1 : 0), base: base, dst: dst};
  }
  var CITY = {서울:[37.57,126.98],부산:[35.18,129.08],대구:[35.87,128.6],인천:[37.46,126.71],광주:[35.16,126.85],대전:[36.35,127.38],울산:[35.54,129.31],
    수원:[37.26,127.03],성남:[37.42,127.13],고양:[37.66,126.83],춘천:[37.88,127.73],원주:[37.34,127.92],강릉:[37.75,128.88],청주:[36.64,127.49],천안:[36.81,127.15],
    전주:[35.82,127.15],목포:[34.81,126.39],여수:[34.76,127.66],포항:[36.02,129.34],경주:[35.86,129.22],안동:[36.57,128.73],창원:[35.23,128.68],진주:[35.18,128.11],제주:[33.5,126.53]};

  /* ───────── 관계 ───────── */
  var CHUNG = ["子午","卯酉","寅申","巳亥","辰戌","丑未"], HAP6 = {子丑:"토",寅亥:"목",卯戌:"화",辰酉:"금",巳申:"수",午未:"화"};
  var BANHAP = {亥卯:"목",卯未:"목",亥未:"목",寅午:"화",午戌:"화",寅戌:"화",申子:"수",子辰:"수",申辰:"수",巳酉:"금",酉丑:"금",巳丑:"금"};
  var SAMHAP = {목:"亥卯未",화:"寅午戌",수:"申子辰",금:"巳酉丑"}, BANGHAP = {목:"寅卯辰",화:"巳午未",금:"申酉戌",수:"亥子丑"};
  var HYUNG = ["寅巳","巳申","寅申","丑戌","戌未","丑未","子卯"], SELFH = "辰午酉亥", HAE = ["子未","丑午","寅巳","卯辰","申亥","酉戌"], WONJIN = ["子未","丑午","寅酉","卯申","辰亥","巳戌"];
  var GHAP = {甲己:"토",乙庚:"금",丙辛:"수",丁壬:"목",戊癸:"화"}, GCHUNG = ["甲庚","乙辛","丙壬","丁癸"];
  function has2(list, a, b){ return list.indexOf(a + b) >= 0 || list.indexOf(b + a) >= 0; }
  function key2(obj, a, b){ return obj[a + b] || obj[b + a]; }
  // 두 땅 글자 사이 관계들 (여러 개일 수 있음)
  function jiPair(a, b){
    var r = [];
    if (has2(CHUNG, a, b)) r.push({t: "충"});
    if (key2(HAP6, a, b)) r.push({t: "합", el: key2(HAP6, a, b)});
    if (key2(BANHAP, a, b)) r.push({t: "반합", el: key2(BANHAP, a, b)});
    if (has2(HYUNG, a, b) || (a === b && SELFH.indexOf(a) >= 0)) r.push({t: "형"});
    if (has2(HAE, a, b)) r.push({t: "해"});
    if (has2(WONJIN, a, b)) r.push({t: "원진"});
    return r;
  }
  function ganPair(a, b){
    var r = [];
    if (key2(GHAP, a, b)) r.push({t: "합", el: key2(GHAP, a, b)});
    if (has2(GCHUNG, a, b)) r.push({t: "충"});
    return r;
  }
  function trioDone(brs){   // 삼합·방합 완성
    var out = [];
    Object.keys(SAMHAP).forEach(function(e){ if (SAMHAP[e].split("").every(function(x){ return brs.indexOf(x) >= 0; })) out.push({t: "삼합", el: e, s: SAMHAP[e]}); });
    Object.keys(BANGHAP).forEach(function(e){ if (BANGHAP[e].split("").every(function(x){ return brs.indexOf(x) >= 0; })) out.push({t: "방합", el: e, s: BANGHAP[e]}); });
    return out;
  }

  /* ───────── 신살 ───────── */
  var CHEONEUL = {甲:"丑未",戊:"丑未",庚:"丑未",乙:"子申",己:"子申",丙:"亥酉",丁:"亥酉",辛:"午寅",壬:"卯巳",癸:"卯巳"};
  var TAEGEUK = {甲:"子午",乙:"子午",丙:"卯酉",丁:"卯酉",戊:"辰戌丑未",己:"辰戌丑未",庚:"寅亥",辛:"寅亥",壬:"巳申",癸:"巳申"};
  var MUNCHANG = {甲:"巳",乙:"午",丙:"申",丁:"酉",戊:"申",己:"酉",庚:"亥",辛:"子",壬:"寅",癸:"卯"};
  var ROK = {甲:"寅",乙:"卯",丙:"巳",丁:"午",戊:"巳",己:"午",庚:"申",辛:"酉",壬:"亥",癸:"子"};
  var YANGIN = {甲:"卯",丙:"午",戊:"午",庚:"酉",壬:"子"};
  var BAEKHO = ["甲辰","乙未","丙戌","丁丑","戊辰","壬戌","癸丑"], GOEGANG = ["庚辰","庚戌","壬辰","壬戌","戊戌"];
  function grp3(b){ return "申子辰".indexOf(b) >= 0 ? 0 : "寅午戌".indexOf(b) >= 0 ? 1 : "巳酉丑".indexOf(b) >= 0 ? 2 : 3; }
  var DOHWA = ["酉","卯","午","子"], YEOKMA = ["寅","申","亥","巳"], HWAGAE = ["辰","戌","丑","未"];
  function gongmang(p){ var i = pillarIdx(p), s = Math.floor(i / 10) * 10; return [JI[(s + 10) % 12], JI[(s + 11) % 12]]; }

  /* ───────── 12운성 ───────── */
  var UNSEONG = ["장생","목욕","관대","건록","제왕","쇠","병","사","묘","절","태","양"];
  var JANGSAENG = {甲:"亥",丙:"寅",戊:"寅",庚:"巳",壬:"申",乙:"午",丁:"酉",己:"酉",辛:"子",癸:"卯"};
  function unseong(g, b){ var s = JI.indexOf(JANGSAENG[g]), t = JI.indexOf(b), k = YANG[g] ? (t - s + 12) % 12 : (s - t + 12) % 12; return UNSEONG[k]; }

  /* ───────── 본 계산 ───────── */
  var POS = ["h", "d", "m", "y"], POSKO = {h: "시", d: "일", m: "월", y: "년"};
  var STRW = {yg: 10, mg: 12, hg: 10, yb: 10, mb: 30, db: 18, hb: 10};   // 힘 점수(합 100) — 월지 > 일지 > 천간
  function calc(inp){
    var sex = inp.sex === "M" ? "M" : "F", y = +inp.y, m = +inp.m, d = +inp.d, lunar = null;
    if (!(y >= 1900 && y <= 2100)) throw new Error("1900~2100년만 계산할 수 있음");
    if (inp.cal === "L"){ var s = lunarToSolar(y, m, d, inp.leap); lunar = {y: y, m: m, d: d, leap: !!inp.leap}; y = s.y; m = s.m; d = s.d; }
    if (!lunar) lunar = solarToLunar(y, m, d);
    var noHour = inp.hh == null || inp.hh === "" || +inp.hh < 0, hh = noHour ? 12 : +inp.hh, mi = noHour ? 0 : (+inp.mi || 0);
    var city = CITY[inp.city] ? inp.city : "서울", ll = CITY[city], tz = tzOf(y, m, d);
    var ut = hh + mi / 60 - tz.off, jd = jdUT(y, m, d, ut);                 // 태어난 순간 (UT)
    var lmtMin = Math.round((hh * 60 + mi) - tz.off * 60 + ll[1] * 4);       // 그 자리의 실제 해시각(평균태양시)
    var dn = dayNum(y, m, d), lm = lmtMin;
    while (lm < 0){ lm += 1440; dn -= 1; } while (lm >= 1440){ lm -= 1440; dn += 1; }
    var hb = JI[Math.floor(((lm + 60) % 1440) / 120)], ziNext = !noHour && lm >= 1380;   // 자시(23시~)부터 다음 날
    var dp = dayPillarN(noHour ? dayNum(y, m, d) : dn + (ziNext ? 1 : 0));
    var sy = sajuYearAt(jd), yp = yearPillar(sy), ma = monthAt(jd), mp = monthPillar(yp[0], ma.br);
    var P = {h: noHour ? null : hourPillar(dp[0], hb), d: dp, m: mp, y: yp}, dg = dp[0];
    var posList = POS.filter(function(k){ return P[k]; });

    // 글자 목록
    var chars = [];
    posList.forEach(function(k){
      chars.push({pos: k, kind: "g", ch: P[k][0], el: GAN_EL[P[k][0]], ss: k === "d" ? "일간" : sipsin(dg, P[k][0])});
      chars.push({pos: k, kind: "b", ch: P[k][1], el: JI_EL[P[k][1]], ss: sipsin(dg, P[k][1])});
    });
    var el = {목: 0, 화: 0, 토: 0, 금: 0, 수: 0}, elH = {목: 0, 화: 0, 토: 0, 금: 0, 수: 0}, grp = {비겁: 0, 식상: 0, 재성: 0, 관성: 0, 인성: 0};
    chars.forEach(function(c){ el[c.el]++; elH[c.el]++; grp[c.ss === "일간" ? "비겁" : SS_GROUP[c.ss]]++; });
    var hidden = posList.map(function(k){ var b = P[k][1]; return {pos: k, br: b, g: JZ[b].map(function(x){ elH[GAN_EL[x]]++; return {ch: x, el: GAN_EL[x], ss: sipsin(dg, x)}; })}; });
    var ss10 = {}; chars.forEach(function(c){ if (c.ss !== "일간") ss10[c.ss] = (ss10[c.ss] || 0) + 1; });

    // 12운성
    var us = {}; posList.forEach(function(k){ us[k] = unseong(dg, P[k][1]); });

    // 관계 (땅 글자끼리 · 하늘 글자끼리)
    var rel = [];
    for (var i = 0; i < posList.length; i++) for (var j = i + 1; j < posList.length; j++){
      var a = posList[i], b = posList[j];
      jiPair(P[a][1], P[b][1]).forEach(function(r){ rel.push({lv: "b", t: r.t, el: r.el, a: a, b: b, s: P[a][1] + P[b][1]}); });
      ganPair(P[a][0], P[b][0]).forEach(function(r){ rel.push({lv: "g", t: r.t, el: r.el, a: a, b: b, s: P[a][0] + P[b][0]}); });
    }
    var brs = posList.map(function(k){ return P[k][1]; });
    var trios = trioDone(brs);
    // 상관견관: 상관 글자와 정관 글자가 함께 하늘에 (또는 식상이 관을 양쪽에서)
    var gans = posList.map(function(k){ return {k: k, ch: P[k][0], ss: k === "d" ? "일간" : sipsin(dg, P[k][0])}; });
    var sgg = gans.some(function(x){ return x.ss === "상관"; }) && gans.some(function(x){ return x.ss === "정관"; });

    // 신살
    var sin = [], add = function(name, k, ch, note){ sin.push({n: name, pos: k, ch: ch, note: note || ""}); };
    posList.forEach(function(k){
      var b = P[k][1];
      if (CHEONEUL[dg].indexOf(b) >= 0) add("천을귀인", k, b);
      if (TAEGEUK[dg].indexOf(b) >= 0) add("태극귀인", k, b);
      if (MUNCHANG[dg] === b) add("문창귀인", k, b);
      if (ROK[dg] === b) add(k === "d" ? "일록" : "건록", k, b);
      if (YANGIN[dg] === b) add("양인", k, b);
      if (BAEKHO.indexOf(P[k]) >= 0) add("백호", k, P[k]);
      if (GOEGANG.indexOf(P[k]) >= 0 && (k === "d" || k === "h")) add("괴강", k, P[k]);
      [["y", P.y[1]], ["d", P.d[1]]].forEach(function(bs){
        if (bs[0] === k) return;
        var gi = grp3(bs[1]);
        if (DOHWA[gi] === b && !sin.some(function(s){ return s.n === "도화" && s.pos === k; })) add("도화", k, b);
        if (YEOKMA[gi] === b && !sin.some(function(s){ return s.n === "역마" && s.pos === k; })) add("역마", k, b);
        if (HWAGAE[gi] === b && !sin.some(function(s){ return s.n === "화개" && s.pos === k; })) add("화개", k, b);
      });
      // 년지 자신이 화개 자리(辰戌丑未)이고 그 해가 같은 무리면 (예: 辰년 辰)
      if (k === "y" && HWAGAE[grp3(b)] === b && !sin.some(function(s){ return s.n === "화개" && s.pos === k; })) add("화개", k, b);
    });
    var gm = gongmang(P.d);
    posList.forEach(function(k){ if (k !== "d" && gm.indexOf(P[k][1]) >= 0) add("공망", k, P[k][1]); });

    // 힘(신강약)
    var sup = 0, tot = 0, HW = {2: [0.25, 0.75], 3: [0.08, 0.12, 0.8]};
    var isSup = function(e){ var gq = groupOfEl(dg, e); return gq === "비겁" || gq === "인성"; };
    posList.forEach(function(k){ ["g", "b"].forEach(function(kind){ if (k === "d" && kind === "g") return;
      var w = STRW[k + kind]; tot += w;
      if (kind === "g"){ if (isSup(GAN_EL[P[k][0]])) sup += w; return; }
      var hs = JZ[P[k][1]], hw = HW[hs.length]; hs.forEach(function(x, i){ if (isSup(GAN_EL[x])) sup += w * hw[i]; }); }); });
    var power = Math.round(sup / tot * 100);
    var lvl = power < 28 ? "많이 약함" : power < 40 ? "약함" : power <= 52 ? "균형에 가까운 살짝 약함" : power <= 62 ? "균형에 가까운 살짝 강함" : power <= 74 ? "강함" : "많이 강함";
    var strong = power > 52;

    // 용신 — 계절(조후) 먼저, 이미 채워져 있으면 힘의 균형(억부)
    var season = {子: "화", 丑: "화", 亥: "화", 巳: "수", 午: "수", 未: "수"}[P.m[1]] || null, yong, how;
    if (season && el[season] === 0 && elH[season] <= 1){ yong = season; how = "조후"; }
    else if (!strong){ yong = grp.재성 >= Math.max(grp.식상, grp.관성) ? elOfGroup(dg, "비겁") : elOfGroup(dg, "인성"); how = "억부"; }
    else {
      var inH = grp.인성, biH = grp.비겁 - 1;
      if (inH > biH) yong = elOfGroup(dg, "재성"); else if (grp.관성 > 0) yong = elOfGroup(dg, "관성"); else yong = elOfGroup(dg, "식상");
      how = "억부";
    }
    var hui = genBy(yong), gi = ctlBy(yong), gu = genBy(gi), han = SAENG[yong];
    var role = {}; role[yong] = "용신"; role[hui] = "희신"; role[gi] = "기신"; role[gu] = "구신"; role[han] = "한신";
    var ES = {}; ES[yong] = 2; ES[hui] = 1; ES[han] = 0; ES[gu] = -1; ES[gi] = -2;
    if (season && how !== "조후" && el[season] > 0){ ES[season] = Math.max(ES[season], 0); }   // 계절에 필요한 기운은 이미 있어도 나쁘게 보지 않음

    // 격국
    var mbSS = sipsin(dg, P.m[1]), gyeok;
    if (SS_GROUP[mbSS] === "비겁"){ gyeok = (ROK[dg] === P.m[1]) ? "건록격" : (YANGIN[dg] === P.m[1] ? "양인격" : "월겁격"); }
    else gyeok = mbSS + "격";

    // 대운
    var fwd = (sex === "M") === (YANG[yp[0]] === 1), days = fwd ? (ma.end - jd) : (jd - ma.start);
    var startAge = Math.max(1, Math.round(days / 3)), daeun = [], mi0 = pillarIdx(mp);
    for (var kk = 1; kk <= 10; kk++){
      var p = pillarAt(fwd ? mi0 + kk : mi0 - kk), a0 = startAge + (kk - 1) * 10;
      daeun.push({p: p, age: [a0, a0 + 9], yr: [y + a0, y + a0 + 9]});
    }

    // 별자리
    var sun = sunLon(jd), moon = moonLon(jd), am = ascMc(jd, ll[0], ll[1]);
    var ZD = ["양자리","황소자리","쌍둥이자리","게자리","사자자리","처녀자리","천칭자리","전갈자리","사수자리","염소자리","물병자리","물고기자리"];
    var zz = function(l){ return {lon: l, sign: ZD[Math.floor(l / 30)], i: Math.floor(l / 30), deg: Math.round((l % 30) * 10) / 10}; };
    var phaseA = norm(moon - sun);
    var phase = phaseA < 22.5 ? "삭(새 달)" : phaseA < 67.5 ? "초승달" : phaseA < 112.5 ? "상현달(차오르는 반달)" : phaseA < 157.5 ? "차오르는 볼록달" : phaseA < 202.5 ? "보름달" : phaseA < 247.5 ? "기우는 볼록달" : phaseA < 292.5 ? "하현달(기우는 반달)" : phaseA < 337.5 ? "그믐달" : "삭(새 달)";
    var astro = {sun: zz(sun), moon: zz(moon), asc: noHour ? null : zz(am.asc), mc: noHour ? null : zz(am.mc), phase: phase, phaseA: phaseA};

    var R = {inp: inp, name: inp.name || "", sex: sex, solar: {y: y, m: m, d: d, hh: hh, mi: mi}, lunar: lunar, noHour: noHour, city: city, tz: tz,
      lmt: {h: Math.floor(lm / 60), m: lm % 60, corr: Math.round(ll[1] * 4 - tz.base * 60)}, ziNext: ziNext,
      jd: jd, P: P, pos: posList, dg: dg, dEl: GAN_EL[dg], chars: chars, el: el, elH: elH, grp: grp, ss10: ss10, hidden: hidden, us: us,
      rel: rel, trios: trios, sgg: sgg, sin: sin, gongmang: gm, power: power, powerLvl: lvl, strong: strong,
      yong: yong, hui: hui, gi: gi, gu: gu, han: han, season: season, how: how, role: role, ES: ES, gyeok: gyeok, monthSS: mbSS,
      daeun: {fwd: fwd, start: startAge, list: daeun, days: Math.round(days * 10) / 10}, astro: astro, sajuYear: sy,
      term: {name: TERM_NAME[ma.lon], start: ma.start}};
    return R;
  }

  /* ───────── 운 채점 (대운·연·월·일 공통) ───────── */
  // ctx: 원국 땅 글자에 더해 함께 볼 글자들(대운 등) [{p, tag}]
  function luckScore(R, p, ctx){
    var g = p[0], b = p[1], es = function(e){ return R.ES[e] || 0; }, tags = [];
    var all = R.pos.map(function(k){ return R.P[k][1]; }).concat((ctx || []).map(function(c){ return c.p[1]; }));
    var before = trioDone(all).map(function(x){ return x.t + x.el; }), bb = es(JI_EL[b]), tri = null;
    trioDone(all.concat([b])).forEach(function(x){ if (before.indexOf(x.t + x.el) < 0 && x.s.indexOf(b) >= 0){ tags.push({t: x.t, el: x.el, s: x.s, v: es(x.el)}); if (!tri || es(x.el) > es(tri.el)) tri = x; } });
    if (tri) bb = Math.max(bb, es(tri.el)) + (es(tri.el) > 0 ? 0.8 : 0);   // 삼합·방합이 완성되면 그 글자는 합쳐진 기운으로 바뀜
    var s = es(GAN_EL[g]) + bb;
    var natal = R.pos.map(function(k){ return {k: k, b: R.P[k][1], g: R.P[k][0]}; });
    natal.forEach(function(n){
      jiPair(b, n.b).forEach(function(r){
        var w = n.k === "d" ? 1 : n.k === "m" ? 0.6 : 0.35;
        if (r.t === "충"){ s -= 1.0 * w; tags.push({t: "충", k: n.k, s: b + n.b, w: w}); }
        else if (r.t === "형"){ s -= 0.4 * w; tags.push({t: "형", k: n.k, s: b + n.b}); }
        else if (r.t === "원진" && n.k === "d"){ s -= 0.2; tags.push({t: "원진", k: n.k, s: b + n.b}); }
        else if (r.t === "합" || r.t === "반합"){ var v = es(r.el); s += (v > 0 ? 0.6 * v * w : -0.15 * w) + (n.k === "d" ? 0.2 : 0); tags.push({t: r.t, k: n.k, s: b + n.b, el: r.el, v: v}); }
        else if (r.t === "해" && n.k === "d"){ s -= 0.15; tags.push({t: "해", k: n.k, s: b + n.b}); }
      });
    });
    ganPair(g, R.dg).forEach(function(r){ if (r.t === "합"){ s += 0.3; tags.push({t: "간합", s: g + R.dg, el: r.el}); } else { s -= 0.5; tags.push({t: "간충", s: g + R.dg}); } });
    (ctx || []).forEach(function(c){ jiPair(b, c.p[1]).forEach(function(r){ if ((r.t === "합" || r.t === "반합") && es(r.el) > 0){ s += 0.4 * es(r.el); tags.push({t: r.t, k: c.tag, s: b + c.p[1], el: r.el, v: es(r.el)}); } }); });
    if (CHEONEUL[R.dg].indexOf(b) >= 0){ s += 0.7; tags.push({t: "귀인", s: b}); }
    if (R.gongmang.indexOf(b) >= 0) tags.push({t: "공망", s: b});
    var stars = Math.max(1, Math.min(5, Math.round((3 + 0.48 * s) * 2) / 2));
    var grade = stars >= 4.5 ? "아주 좋음" : stars >= 3.5 ? "좋음" : stars >= 2.5 ? "보통" : stars >= 1.5 ? "주의" : "조심";
    return {p: p, s: Math.round(s * 100) / 100, stars: stars, grade: grade, tags: tags, gEl: GAN_EL[g], bEl: JI_EL[b], gSS: sipsin(R.dg, g), bSS: sipsin(R.dg, b)};
  }
  function ageOn(R, y){ return y - R.solar.y; }   // 만 나이(그해 생일 지난 뒤)
  function daeunAt(R, y){ var a = ageOn(R, y); for (var i = 0; i < R.daeun.list.length; i++){ var x = R.daeun.list[i]; if (x.age[0] <= a && a <= x.age[1]) return x; } return a < R.daeun.start ? null : R.daeun.list[R.daeun.list.length - 1]; }
  function daeunLuck(R){ return R.daeun.list.map(function(x){ var L = luckScore(R, x.p, []); L.age = x.age; L.yr = x.yr; return L; }); }
  function yearLuck(R, y){ var du = daeunAt(R, y), L = luckScore(R, yearPillar(y), du ? [{p: du.p, tag: "대운"}] : []); L.year = y; L.du = du && du.p; return L; }
  // 월운: from(정수 날짜 번호) 이후 n개 절월
  function monthLuck(R, y, m, n, d){
    var out = [], jd = jdUT(y, m, d || 1, 3);
    var L = termsAround(y).concat(termsAround(y + 1)).filter(function(t, i, a){ return a.findIndex(function(u){ return Math.abs(u.jd - t.jd) < 1; }) === i; }).sort(function(a, b){ return a.jd - b.jd; });
    var st = 0; for (var i = 0; i < L.length; i++) if (L[i].jd <= jd) st = i;
    for (var k = st; k < L.length - 1 && out.length < n; k++){
      var t = L[k], sy = sajuYearAt(t.jd + 1), mp = monthPillar(yearPillar(sy)[0], t.br), du = daeunAt(R, sy);
      var ctx = [{p: yearPillar(sy), tag: "올해"}]; if (du) ctx.push({p: du.p, tag: "대운"});
      var x = luckScore(R, mp, ctx), a = jdToDate(t.jd + 9 / 24), b = jdToDate(L[k + 1].jd + 9 / 24 - 1);
      x.from = {m: a.m, d: Math.floor(a.d)}; x.to = {m: b.m, d: Math.floor(b.d)}; x.term = TERM_NAME[t.lon]; out.push(x);
    }
    return out;
  }
  function todayKST(off){ var t = new Date(Date.now() + 9 * 3600e3 + (off || 0) * 86400e3); return {y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), w: t.getUTCDay()}; }
  // 하루 운: 일진 + (그날의 월·연·대운을 배경으로)
  function dayLuck(R, y, m, d){
    var jd = jdUT(y, m, d, 3), sy = sajuYearAt(jd), ma = monthAt(jd), yp = yearPillar(sy), mp = monthPillar(yp[0], ma.br), dp = dayPillar(y, m, d), du = daeunAt(R, sy);
    var ctx = [{p: mp, tag: "이번 달"}, {p: yp, tag: "올해"}]; if (du) ctx.push({p: du.p, tag: "대운"});
    var L = luckScore(R, dp, ctx), Mo = luckScore(R, mp, [{p: yp, tag: "올해"}]);
    var sc = Math.round(Math.max(18, Math.min(95, 60 + L.s * 6.5 + Mo.s * 1.5)));
    L.score = sc; L.month = mp; L.year = yp; L.date = {y: y, m: m, d: d}; L.monthL = Mo;
    return L;
  }

  G.SJ = {hourPillar: hourPillar, moonLon: moonLon, sunLon: sunLon, calc: calc, luckScore: luckScore, daeunLuck: daeunLuck, yearLuck: yearLuck, monthLuck: monthLuck, dayLuck: dayLuck, daeunAt: daeunAt,
    todayKST: todayKST, dayPillar: dayPillar, yearPillar: yearPillar, monthPillar: monthPillar, monthAt: monthAt, sajuYearAt: sajuYearAt, jdUT: jdUT,
    lunarToSolar: lunarToSolar, solarToLunar: solarToLunar, leapMonthOf: leapMonthOf, sipsin: sipsin, unseong: unseong, jiPair: jiPair,
    GAN: GAN, JI: JI, GAN_EL: GAN_EL, JI_EL: JI_EL, YANG: YANG, JZ: JZ, SS_GROUP: SS_GROUP, SAENG: SAENG, GEUK: GEUK, CITY: CITY, POSKO: POSKO, EL: EL,
    groupOfEl: groupOfEl, elOfGroup: elOfGroup, genBy: genBy, ctlBy: ctlBy, CHEONEUL: CHEONEUL, gongmang: gongmang};
})(typeof window !== "undefined" ? window : globalThis);
