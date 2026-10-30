"""🩺 깊은 건강검진 (10/29 사용자: 「건강검진 똑바로 해 — 내가 일일이 찾아서 수정 요구하지 않게. 이 화면이 맞는지, 다 잘 작동되는지, 내용이 맞는지 다 점검해」)
health.py 가 부른다. 탭마다:
  ① 내용 검사(LINT): 빈칸·undefined·NaN·null·[object]·−0.00% · 영어 내부 이름(nh52·cust·snake_case) 그대로 노출 · 「,,」「· ·」「()」 같은 글 깨짐
     · 깨진 사진 · 빈 카드 · 같은 카드 두 번 · 너무 작은 글씨(9px 아래) · 화면 밖으로 나간 글 · 누르면 갈 곳(data-goto)이 없는 탭
  ② 숫자 맞추기(FACTS): 화면 숫자 ↔ 원래 자료(home.json·port.json·kick.json·live_kr.json) — 포트 수익·S&P·「14곳 중 n곳」·거래일·기준일·코스피 마감
  ③ 버튼 다 눌러 보기(SWEEP): 모든 버튼을 눌러 JS 오류·화면 튐(150px↑)·눌러도 아무 변화 없는 버튼
  ④ 화면 사진(SHOTS): 탭마다 첫 두 화면을 사진으로 → 자가 업그레이드가 눈으로 본다 (health-shots 브랜치)
"""
from __future__ import annotations
import re

BAD_WORDS = r"못 불러왔|아직 안 올라왔|자료 준비 중|undefined|NaN|\[object|Infinity|Invalid Date|\{\{|\$\{|(?<![\w.])null(?![\w.])|(?<![\w.])None(?![\w.])|[−-]0\.00%|[−-]0\.0%(?!p)"
GLITCH = r",\s*,|·\s*·|\(\s*\)|,\s*$|%%|\+\s*[−-]\d|[−-]\s*\+\d"

LINT_JS = r"""(a) => {
  const KNOWN = new Set(a.ids), main = document.getElementById('main'); if (!main) return {err: 'main 없음'};
  const W = document.documentElement.clientWidth, txt = main.innerText || '', out = {bad: [], ids: [], glitch: [], img: [], empty: [], dup: [], tiny: [], off: [], goto: [], anchors: []};
  const vis = el => { const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false; const s = getComputedStyle(el); return s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity !== 0; };
  (txt.match(new RegExp(a.bad, 'g')) || []).slice(0, 6).forEach(m => out.bad.push(m));
  // 영어 내부 이름 — 알려진 신호 이름(nh52·cust·earn…) 또는 snake_case 가 한글 화면에 그대로 (피드·검색 결과의 영어 기사 제목은 안 셈)
  if (!a.en) txt.split('\n').forEach(l => {
    (l.match(/(?:^|[\s(·🏔📊🩹🧭🔌🕵🎰🐸🔗🤝📰🪂☕📈🤫🐋🎯])([a-z][a-z0-9]*(?:_[a-z0-9]+)*)(?=$|[\s)·,:])/g) || []).forEach(m => {
      const w = m.replace(/^[^a-z]+/, ''); if ((KNOWN.has(w) || /_/.test(w)) && out.ids.length < 6) out.ids.push(w + ' ← 「' + l.trim().slice(0, 30) + '」');
    });
  });
  txt.split('\n').forEach(l => { const s = l.trim(); if (s && new RegExp(a.glitch).test(s) && out.glitch.length < 6) out.glitch.push(s.slice(0, 50)); });
  main.querySelectorAll('img').forEach(i => { if (vis(i) && i.complete && !i.naturalWidth && out.img.length < 4) out.img.push((i.getAttribute('src') || '').slice(-50)); });
  const heads = {};
  main.querySelectorAll('.card').forEach(c => {
    if (!vis(c)) return; const t = (c.innerText || '').trim();
    if (t.length < 6 && !c.querySelector('img,svg,canvas,iframe,video') && out.empty.length < 4) out.empty.push((c.id || c.className || '').toString().slice(0, 40));
    const h = t.split('\n')[0].slice(0, 30); if (h.length > 3) heads[h] = (heads[h] || 0) + 1;
  });
  Object.keys(heads).forEach(h => { if (heads[h] > 1 && out.dup.length < 4) out.dup.push(h + ' ×' + heads[h]); });
  main.querySelectorAll('*').forEach(el => {
    if (el.children.length || !vis(el)) return; const t = (el.innerText || '').trim(); if (!t) return;
    const fs = parseFloat(getComputedStyle(el).fontSize); if (fs < 9 && out.tiny.length < 4) out.tiny.push(t.slice(0, 16) + ' ' + fs + 'px');
    const r = el.getBoundingClientRect();
    if (r.right > W + 2 && out.off.length < 4) {
      for (let q = el.parentElement; q && q !== main; q = q.parentElement) { const ox = getComputedStyle(q).overflowX; if (ox !== 'visible') return; }
      out.off.push(t.slice(0, 20) + ' (오른쪽 ' + Math.round(r.right) + 'px)');
    }
  });
  main.querySelectorAll('[data-goto]').forEach(el => { const g = el.getAttribute('data-goto') || ''; const k = g.split('~')[0]; if (!k || a.tabs.indexOf(k) < 0) { if (out.goto.length < 4) out.goto.push(g || '(빈 값)'); } else out.anchors.push(g); });
  out.ids_here = [].map.call(main.querySelectorAll('[id]'), e => e.id);
  out.len = txt.length; out.cards = main.querySelectorAll('.card').length;
  return out;
}"""


def lint_probs(tab, L):
    p = []
    lab = "#" + tab
    if L.get("err"): return [f"{lab} {L['err']}"]
    if L["bad"]: p.append(f"{lab} 화면에 「{'」「'.join(sorted(set(L['bad']))[:3])}」")
    if L["ids"]: p.append(f"{lab} 영어 내부 이름 그대로: " + " · ".join(L["ids"][:3]))
    if L["glitch"]: p.append(f"{lab} 글 깨짐: " + " · ".join("「" + x + "」" for x in L["glitch"][:3]))
    if L["img"]: p.append(f"{lab} 깨진 사진 {len(L['img'])}개: " + ", ".join(L["img"][:2]))
    if L["empty"]: p.append(f"{lab} 빈 카드 {len(L['empty'])}개: " + ", ".join(L["empty"][:2]))
    if L["dup"]: p.append(f"{lab} 같은 카드 두 번: " + ", ".join(L["dup"][:2]))
    if L["tiny"]: p.append(f"{lab} 글씨 너무 작음(9px↓): " + ", ".join(L["tiny"][:2]))
    if L["off"]: p.append(f"{lab} 글이 화면 밖: " + ", ".join(L["off"][:2]))
    if L["goto"]: p.append(f"{lab} 누르면 갈 탭이 없음(data-goto): " + ", ".join(L["goto"][:3]))
    if L.get("len", 0) < 60 and tab not in ("idea", "alarm"): p.append(f"{lab} 화면이 거의 비었음 ({L.get('len')}자)")
    return p


def anchor_probs(lints):
    """다른 탭의 카드로 가는 단추(data-goto="port~pokick")의 「~ 뒤 칸」이 그 탭에 실제로 있나"""
    p, seen = [], set()
    for tab, L in lints.items():
        for g in L.get("anchors", []):
            if "~" not in g or g in seen: continue
            seen.add(g); k, a = g.split("~", 1)
            if k in lints and a not in lints[k].get("ids_here", []):
                p.append(f"#{tab} 단추 → #{k} 「{a}」 칸이 없음 (눌러도 그 칸으로 안 감)")
    return p[:6]


# ───────── ② 숫자 맞추기 ─────────
def _n(s):
    return float(s.replace("−", "-").replace(",", "").replace("+", ""))


def _r1(x):
    # 🩺 10/30: 소수 한 자리로 미리 반올림하면 −2.25 가 파이썬 −2.2 ↔ 화면(JS toFixed) −2.3 으로 갈려 「숫자 틀림」 가짜 경보
    # → 원래 값 그대로 두고 chk 허용 0.051(화면 반올림 최대 0.05)로 비교
    return round(float(x), 4)


def facts(texts, src, now):
    """texts: {tab: innerText} · src: {'home':…, 'port':…, 'kick':…, 'live_kr':…} → (확인한 것, 문제)"""
    ok, p = [], []

    def chk(name, shown, truth, tol=0.051):
        if shown is None: return
        if truth is None: return
        if abs(shown - truth) > tol: p.append(f"숫자 틀림: {name} 화면 {shown:+g} ↔ 자료 {truth:+g}")
        else: ok.append(name)

    H = (src.get("home") or {}).get("port") or {}
    P = src.get("port") or {}
    K = (src.get("kick") or {}).get("stat") or {}
    st = P.get("stat") or {}
    t = texts.get("home") or ""
    if t and H:
        m = re.search(r"내 포트\n[^\n]*\n[^\n]*\n기본\n([+−-]?\d+\.\d)%\n공격\n([+−-]?\d+\.\d)%", t)
        if m:
            chk("🏠 기본 포트", _n(m.group(1)), _r1(H.get("base")))
            chk("🏠 공격 포트", _n(m.group(2)), _r1(H.get("kick")))
        else:
            p.append("🏠 홈 「내 포트 기본·공격」 숫자를 못 찾음 (화면 모양이 바뀌었으면 검사도 맞춰야 함)")
        m = re.search(r"S&P500 ([+−-]?\d+\.\d)% · 시장 (\d+)곳 중 (\d+)곳 앞섬", t)
        if m:
            chk("🏠 S&P500", _n(m.group(1)), _r1(H.get("spy")))
            chk("🏠 시장 n곳 중", float(m.group(2)), float(H.get("n_bench") or 0), 0.1)
            chk("🏠 앞선 곳 수", float(m.group(3)), float(H.get("beat_base") or 0), 0.1)
        m = re.search(r"(\d{2})/(\d{2}) 미국 종가", t)
        if m and H.get("asof"): chk("🏠 기준일(미국 종가)", float(m.group(1) + m.group(2)), float(H["asof"][5:7] + H["asof"][8:10]), 0.1)
        m = re.search(r"(\d+)일 중 (\d+)일 이김", t)
        if m and st: chk("🏠 S&P와 하루 승부 이긴 날", float(m.group(2)), float(st.get("win") or 0), 0.1)
    t = texts.get("port") or ""
    if t and st:
        m = re.search(r"💼 기본 포트\n([+−-]?\d+\.\d\d)%", t)
        chk("💼 기본 포트", _n(m.group(1)) if m else None, st.get("ret"), 0.006)
        if not m: p.append("💼 포트 「기본 포트」 숫자를 못 찾음")
        m = re.search(r"⚡ 공격 포트\n([+−-]?\d+\.\d\d)%", t)
        chk("💼 공격 포트", _n(m.group(1)) if m else None, K.get("kick"), 0.006)
        m = re.search(r"~ (\d{2})/(\d{2}) · (\d+)거래일", t)
        if m:
            chk("💼 거래일 수", float(m.group(3)), float(st.get("days") or 0), 0.1)
            if P.get("asof"): chk("💼 기준일", float(m.group(1) + m.group(2)), float(P["asof"][5:7] + P["asof"][8:10]), 0.1)
        m = re.search(r"🇺🇸 S&P500\n([+−-]?\d+\.\d)%", t)
        chk("💼 S&P500", _n(m.group(1)) if m else None, _r1(st.get("spy")) if st.get("spy") is not None else None)
    t = texts.get("score") or ""
    m = re.search(r"공격 ([+−-]?\d+\.\d)% vs 기본 ([+−-]?\d+\.\d)% · S&P ([+−-]?\d+\.\d)%", t)
    if m and st:
        chk("📊 성적표 공격", _n(m.group(1)), _r1(K.get("kick")) if K.get("kick") is not None else None)
        chk("📊 성적표 기본", _n(m.group(2)), _r1(st.get("ret")))
        chk("📊 성적표 S&P", _n(m.group(3)), _r1(st.get("spy")))
    # 코스피: 장 끝난 뒤엔 홈의 「오늘 코스피」 숫자가 모두 실제 마감과 같아야 함 (10/29: 「오늘 한 장」이 어제 +6.6% 를 오늘 −1.2% 옆에 씀)
    L = src.get("live_kr") or {}
    ks = next((x for x in L.get("index") or [] if x.get("name") == "코스피"), None)
    today = now.strftime("%Y-%m-%d")
    t = texts.get("home") or ""
    pats = [r"코스피 [\d,]{4,}\(([+−-]\d+\.\d)%\)", r"코스피 마감 ([+−-]\d+\.\d)%", r"코스피 마감\n([+−-]\d+\.\d)%", r"코스피 ([+−-]\d+\.\d)%(?! *[pP])", r"🇰🇷 코스피\n([+−-]\d+\.\d)%"]
    seen = []
    for pat in pats:
        for m in re.finditer(pat, t):
            pre = t[max(0, m.start() - 8):m.start()]
            if re.search(r"이틀|사흘|한 달|주간|1주|5일|20일|어제", pre): continue
            seen.append(_n(m.group(1)))
    if seen:
        if ks and L.get("date") == today and now.weekday() < 5 and (now.hour, now.minute) >= (15, 40):
            wrong = sorted({x for x in seen if abs(x - _r1(ks.get("chg"))) > 0.051})
            if wrong: p.append(f"숫자 틀림: 🏠 홈 「코스피」 {', '.join(f'{x:+g}%' for x in wrong)} ↔ 오늘 마감 {_r1(ks.get('chg')):+g}% (지난 숫자가 오늘처럼 보임)")
            else: ok.append("🏠 코스피 마감")
        elif max(seen) - min(seen) > 0.15:
            p.append(f"숫자 엇갈림: 🏠 홈 「코스피」가 한 화면에 {sorted(set(seen))}")
    return ok, p


# ───────── ③ 버튼 다 눌러 보기 ─────────
SEL = "#main button, #main .fold, #main summary, #main [data-pf], #main [data-m], #main [data-f], #main [data-win], #main [data-bg], #main [data-cm], #main .chip[data-k], #main [data-goto]"
LIST_JS = """(sel)=>{var a=[].slice.call(document.querySelectorAll(sel)).filter(function(e){var r=e.getBoundingClientRect();return r.width>0&&r.height>0&&!e.closest('a[href^=http]')&&!/공유|복사|📤|PDF|PPT|크게 보기|새 창|보내기|내려받|다운/.test(e.innerText||'');});
  a.forEach(function(e,i){e.setAttribute('data-au',i)}); return a.length;}"""
EXPAND = re.compile(r"보기 ▾|더 보기|펼치기|전체 보기|열기|▾|▸|추가|고치기|편집|✏️")   # 펼침·입력 칸 열기(그 칸으로 옮겨 감)는 정상


def sweep(pg, url, tab, cap=45):
    """버튼마다 눌러 JS 오류·튐을 모은다. 다른 화면으로 가는 버튼은 돌아와서 계속."""
    errs, jumps, dead, n = [], [], [], 0
    pg.on("pageerror", lambda e: errs.append(str(e)[:120]))
    pg.goto(url, wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(3000)
    n = pg.evaluate(LIST_JS, SEL)
    for i in range(min(n, cap)):
        try:
            info = pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); if(!e||!e.isConnected) return null; e.scrollIntoView({{block:'center',behavior:'instant'}}); return 1}})()""")
            if not info: continue
            pg.wait_for_timeout(250)
            info = pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); if(!e||!e.isConnected) return null; var r=e.getBoundingClientRect(); return [Math.round(r.top),((e.innerText||e.getAttribute('aria-label')||'').trim().slice(0,22).replace(/\\s+/g,' ')), document.body.innerHTML.length, !!e.closest('[data-j]')]}})()""")
            if not info: continue
            h0 = pg.evaluate("location.hash + '|' + history.length"); ne = len(errs)   # 🩺 10/30 history.length: #onepager 종목 단추(opShow)는 해시 그대로 pushState 로 리포트를 엶 — 이동이지 튐 아님
            top0 = pg.evaluate("((document.getElementById('main')||{}).innerText||'').slice(0,80)")
            pg.evaluate(f"""document.querySelector('[data-au="{i}"]').click()""")
            pg.wait_for_timeout(450)
            if len(errs) > ne: errs[-1] = f"「{info[1]}」 누르면 → " + errs[-1]
            h1 = pg.evaluate("location.hash + '|' + history.length"); peek = pg.evaluate("!!document.getElementById('peek')")
            top1 = pg.evaluate("((document.getElementById('main')||{}).innerText||'').slice(0,80)")
            if h1 != h0 or peek or info[3] or top1 != top0:   # 다른 화면으로 감(종목 화면 열기 등) — 튐 아님, 돌아와서 계속
                pg.goto(url, wait_until="domcontentloaded", timeout=45000); pg.wait_for_timeout(2200); pg.evaluate(LIST_JS, SEL); continue
            aft = pg.evaluate(f"""(()=>{{var e=document.querySelector('[data-au="{i}"]'); if(!e||!e.isConnected) return [null, document.body.innerHTML.length]; return [Math.round(e.getBoundingClientRect().top), document.body.innerHTML.length]}})()""")
            if aft[0] is not None and abs(aft[0] - info[0]) > 150 and not EXPAND.search(info[1]):
                jumps.append(f"「{info[1]}」 {info[0]}→{aft[0]}px")
            if aft[0] is None: pg.evaluate(LIST_JS, SEL)
        except Exception:
            continue
    return {"tab": tab, "buttons": n, "errs": sorted(set(errs))[:5], "jumps": jumps[:5]}


def sweep_probs(r):
    p = []
    for e in r["errs"][:2]: p.append(f"#{r['tab']} 버튼 오류: {e[:110]}")
    if r["jumps"]: p.append(f"#{r['tab']} 누른 버튼이 튐: " + " · ".join(r["jumps"][:2]))
    return p
