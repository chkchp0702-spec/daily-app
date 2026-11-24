"""11/24 10시 🌊 흔들림 보강 — CPI 발표일만 다시(11/23 evvol_bt 에서 BLS 403 으로 빠진 cpi·ev 후보, 같은 판정) · 원본: 11/23 16시 이벤트 날(FOMC 결정·CPI 발표) 5개 시장 × 3목표 × 저녁/아침판
  결과 보기 전에 정한 후보 3개(지금 화면 특성 = 기본 + hl5·gap·opt 위에 하나씩):
    fomc  내일 움직임 안에 FOMC 결정이 들어감 — 미국: 내일이 결정일(14:00 ET) · 아시아: 미국 날짜 t ≤ 결정일 < 다음 아시아 거래일
    cpi   내일 움직임 안에 미국 CPI 발표가 들어감(08:30 ET) — 시점 규칙 위와 같음
    ev    둘 중 하나
    5일 목표는 「다음 5거래일 움직임 안에 들어감」(0/1)
  일정은 미리 공개되는 것이라 앞날 정보 아님. FOMC = 연준 fomchistorical/fomccalendars · CPI = BLS 발표 보관 목록(파일 이름의 날짜).
  붙이는 조건(전과 같음): 한 판에서 앞·뒤·최근3년 실력 모두 기본보다↑ + 최근3년 > 0 + 세 칸 모두 +0.3 이상 + 다른 판 앞·뒤 안 나빠짐"""
import json, os, re, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd, requests
import yfinance as yf
import prob, prob_vol

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml", "Accept-Language": "en-US,en;q=0.9"}
MON = {m: i for i, m in enumerate(["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], 1)}
MON.update({m[:3]: i for m, i in list(MON.items())})

# ---- FOMC (probe/fomc_bt.py 와 같은 읽기)
FD = set(pd.Timestamp(x) for x in prob.FOMC_2026)
for y in range(2004, 2021):
    try:
        t = requests.get(f"https://www.federalreserve.gov/monetarypolicy/fomchistorical{y}.htm", headers=UA, timeout=30).text
    except Exception as e:
        print("fomc hist", y, e); continue
    t = re.sub(r"<[^>]+>", " ", t); k = 0
    for m in re.finditer(r"([A-Z][a-z]+)\s+(\d{1,2})(?:\s*-\s*(?:([A-Z][a-z]+)\s+)?(\d{1,2}))?\s+Meeting\s*-\s*(\d{4})", t):
        m1, d1, m2, d2, yy = m.groups()
        if m1 not in MON: continue
        FD.add(pd.Timestamp(int(yy), MON.get(m2 or m1), int(d2 or d1))); k += 1
    print("fomc hist", y, k, flush=True)
try:
    t = requests.get("https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm", headers=UA, timeout=30).text
    for blk in re.split(r'<div class="panel panel-default', t)[1:]:
        yy = re.search(r"(\d{4}) FOMC Meetings", blk)
        if not yy: continue
        yy = int(yy.group(1))
        for row in re.finditer(r'fomc-meeting__month[^>]*>\s*<strong>([^<]+)</strong>.*?fomc-meeting__date[^>]*>([^<]+)<', blk, re.S):
            mo, da = row.group(1).strip(), row.group(2).strip()
            if "unscheduled" in da.lower() or "notation" in da.lower(): continue
            mo2 = mo.split("/")[-1][:3]; dd = re.findall(r"\d{1,2}", da)
            if mo2 in MON and dd:
                FD.add(pd.Timestamp(yy, MON[mo2], int(dd[-1])))
except Exception as e:
    print("fomc cal", e)
FOMC = sorted(x for x in FD if x.year >= 2004)
print("FOMC", len(FOMC), pd.Series([x.year for x in FOMC]).value_counts().sort_index().to_dict(), flush=True)

# ---- CPI 발표일 (11/24: BLS 403 → 다른 길) — ALFRED 「고치지 않는 원계열」 CPIAUCNS 의 vintage 날짜 = 발표일
CD = set(); SRC = []
def _add_vint(txt, tag):
    k = 0
    for m in re.finditer(r"(?<!\d)((?:19|20)\d\d)-(\d\d)-(\d\d)(?!\d)", txt):
        t_ = pd.Timestamp(int(m.group(1)), int(m.group(2)), int(m.group(3)))
        if 2000 <= t_.year <= 2027 and 8 <= t_.day <= 22 and t_.weekday() < 5:
            CD.add(t_); k += 1
    SRC.append((tag, k)); print("cpi src", tag, k, flush=True)
TRY = [("alfred_html", "https://alfred.stlouisfed.org/series?seid=CPIAUCNS"),
       ("alfred_dl", "https://alfred.stlouisfed.org/series/downloaddata?seid=CPIAUCNS"),
       ("alfred_vint", "https://alfred.stlouisfed.org/graph/api/series/?id=CPIAUCNS"),
       ("bls_arch", "https://www.bls.gov/bls/news-release/cpi.htm")]
for tag, url in TRY:
    try:
        r = requests.get(url, headers=UA, timeout=40)
        print("cpi", tag, r.status_code, len(r.text), r.text[:200].replace("\n", " "), flush=True)
        if r.status_code == 200:
            if tag == "bls_arch":
                for m in re.finditer(r"cpi_(\d{2})(\d{2})(\d{4})\.htm", r.text):
                    CD.add(pd.Timestamp(int(m.group(3)), int(m.group(1)), int(m.group(2))))
                SRC.append((tag, len(CD)))
            else:
                _add_vint(r.text, tag)
    except Exception as e:
        print("cpi err", tag, e, flush=True)
    if len([x for x in CD if 2006 <= x.year <= 2020]) >= 150: break
# 한 달에 하나만(그달 가장 이른 날 — 같은 달 정정 vintage 제거)
_m = {}
for x in sorted(CD):
    _m.setdefault((x.year, x.month), x)
CPI = sorted(x for x in _m.values() if x.year >= 2004)
print("CPI", len(CPI), pd.Series([x.year for x in CPI]).value_counts().sort_index().to_dict() if CPI else {}, CPI[-6:], flush=True)
HAVE_CPI = len([x for x in CPI if 2006 <= x.year <= 2020]) >= 150
if not HAVE_CPI:
    print("CPI 발표일 못 받음 — 끝", SRC); json.dump({"have_cpi": False, "src": SRC}, open("probe/cpivol_bt.json", "w")); sys.exit(0)

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX", "^VIX9D", "^SKEW"})
H = {}
for s in syms:
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()), flush=True)


def evflag(idx, dates, us):
    """그날 t 의 「내일 움직임(t→다음 거래일)」 안에 이벤트가 들어가면 1"""
    ds = pd.DatetimeIndex(sorted(dates))
    i = pd.Series(idx, index=idx)
    nx = i.shift(-1)
    if us:
        f1 = nx.isin(ds)                                  # 내일이 발표일(장중·장 전 발표)
    else:
        # 미국 날짜 t ≤ 이벤트 < 다음 아시아 거래일 → 아시아 내일 장이 반응
        pos = np.searchsorted(ds.values, idx.values, side="left")
        nxt_ev = pd.Series([ds[p] if p < len(ds) else pd.NaT for p in pos], index=idx)
        f1 = (nxt_ev < nx)
    f1 = f1.astype(float).where(nx.notna())
    f5 = sum(f1.shift(-k) for k in range(0, 5)).clip(0, 1)
    return f1, f5


spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
out = {"fomc_n": len(FOMC), "cpi_n": len(CPI), "have_cpi": HAVE_CPI}
summary = []
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index; bd = idx[-1]
    asia = mk != "US"
    hl5 = prob_vol._hl5(px, idx)
    gap = None
    if mk in prob_vol.GAP_TG:
        i_ = pd.Series(idx, index=idx); gap = np.log((i_.shift(-1) - i_).dt.days.astype(float))
    ev = {}
    fo1, fo5 = evflag(idx, FOMC, not asia)
    if HAVE_CPI:
        cp1, cp5 = evflag(idx, CPI, not asia); ev["cpi"] = (cp1, cp5)
        ev["ev"] = ((fo1 + cp1).clip(0, 1), (fo5 + cp5).clip(0, 1))
    R = {}
    modes = ("저녁판", "아침판") if asia else ("미국",)
    for mn in modes:
        morning = mn == "아침판"
        if mn == "저녁판":
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        elif morning:
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
        else:
            d = prob_vol.frame(c, None, vix, False); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
        if hl5 is not None: d["hl5"] = hl5
        if gap is not None: d["gap"] = gap
        for tg_, kind in prob_vol.OPT_TG.get(mk, {}).items():
            o_ = prob_vol._opt(H, kind, idx, bd, asia, morning)
            if o_ is not None: d["opt_" + kind] = o_
        for tg in prob_vol.TG:
            base = base0 + (["hl5"] if hl5 is not None and tg in prob_vol.HL_TG.get(mk, ()) else []) \
                + (["gap"] if gap is not None and tg in prob_vol.GAP_TG.get(mk, ()) else []) \
                + (["opt_" + prob_vol.OPT_TG[mk][tg]] if tg in prob_vol.OPT_TG.get(mk, {}) and ("opt_" + prob_vol.OPT_TG[mk][tg]) in d else [])
            for k, (s1, s5) in ev.items():
                d[k + "_" + tg] = s5 if tg == "dn5" else s1
            cands = [("+" + k, base + [k + "_" + tg]) for k in ev]
            need = sorted({x for _, fl in cands for x in fl} | set(base))
            dd = d.dropna(subset=need)
            res = {}
            P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
            for nm, f in cands:
                try:
                    P, B = prob_vol.walk(dd, f, tg); res[nm] = prob_vol.judge(dd, P, B, tg)
                except Exception as e:
                    res[nm] = {"err": str(e)[:100]}
            b = res["기본"]
            ev_rate = {k: round(float(dd[k + "_" + tg].mean()) * 100, 1) for k in ev}
            for nm, j in res.items():
                if not j or "err" in j:
                    print(mk, mn, tg, nm, j, flush=True); continue
                better = nm != "기본" and all(j[s]["skill"] > b[s]["skill"] for s in ("앞", "뒤", "최근3년")) and j["최근3년"]["skill"] > 0
                big = better and all(j[s]["skill"] - b[s]["skill"] >= 0.3 for s in ("앞", "뒤", "최근3년"))
                line = f"{mk} {mn} {tg} {nm:6s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} {'✅' if better else ''}{'+0.3' if big else ''}"
                print(line, flush=True)
                if better:
                    summary.append(line + f" (기본 {b['앞']['skill']}/{b['뒤']['skill']}/{b['최근3년']['skill']})")
            # 이벤트 날만 실제 비율 vs 평소(참고)
            for k in ev:
                f_ = dd[k + "_" + tg] == 1
                y_ = dd[tg]
                print(f"   {mk} {mn} {tg} {k} 날 {int(f_.sum())}일 실제 {y_[f_].mean()*100:.1f}% vs 나머지 {y_[~f_].mean()*100:.1f}%", flush=True)
            R[f"{mn}_{tg}"] = {"ev_rate": ev_rate, **{k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n")} if v and "err" not in v else v) for k, v in res.items()}}
    out[mk] = R
json.dump(out, open("probe/cpivol_bt.json", "w"), ensure_ascii=False)
print("==== 세 칸 모두 오른 것(최근3년>0)")
for s in summary:
    print(s)
print("끝")
