"""11/19 14시 🌊 흔들림 보강 — 달력·이벤트성 근거(지금까지 안 해본 것) 5개 시장 × 3목표 × 저녁/아침판
  후보(지금 화면 특성 = 기본 + hl5(HL_TG) 위에 하나씩):
    opx   내일이 그 나라 지수 옵션·선물 만기일(한국 둘째 목 · 일본 둘째 금 · 중국 넷째 수 · 홍콩 월말 전 거래일 · 미국 셋째 금)
          5일 목표는 「다음 5거래일 안에 만기 있음」
    me    내일이 월말 마지막 거래일 또는 월초 첫 거래일 (5일 목표: 다음 5거래일 안에 달 바뀜)
    gap   내일 거래일까지 달력 일수(로그) — 연휴 앞뒤
    dvix1 VIX 하루 변화(아시아 저녁판은 하루 전 값) — 5일 변화(dvix)는 이미 있음
  거래일 달력은 미리 알려진 것이므로 「내일」 표시는 앞날 정보가 아님(지수 날짜로 근사).
  붙이는 조건: 한 판에서 앞·뒤·최근3년 실력이 모두 기본보다 높고 + 다른 판에서 앞·뒤가 나빠지지 않을 때"""
import json, os, sys
sys.path.insert(0, os.getcwd())
import numpy as np, pandas as pd
import yfinance as yf
import prob, prob_vol

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^VIX"})
H = {}
for s in syms:
    x = yf.download(s, start="2000-01-01", interval="1d", auto_adjust=False, progress=False)
    if isinstance(x.columns, pd.MultiIndex):
        x.columns = x.columns.get_level_values(0)
    x.index = pd.to_datetime(x.index).tz_localize(None)
    x = x[["Open", "High", "Low", "Close"]].dropna(subset=["Close"])
    H[s] = x[~x.index.duplicated(keep="last")]
    print("자료", s, len(H[s]), str(H[s].index[0].date()), flush=True)


def nth_wd(idx, wd, n):
    """그 달 n번째 wd요일(달력) 이후 첫 거래일 = 만기일(휴일이면 다음 거래일로 근사)"""
    out = set()
    for ym in sorted({(t.year, t.month) for t in idx}):
        d0 = pd.Timestamp(ym[0], ym[1], 1)
        first = d0 + pd.Timedelta(days=(wd - d0.weekday()) % 7)
        tgt = first + pd.Timedelta(days=7 * (n - 1))
        cand = idx[idx >= tgt]
        if len(cand) and cand[0].month == ym[1]:
            out.add(cand[0])
    return out


def hk_exp(idx):
    s = pd.Series(idx, index=idx)
    g = s.groupby([idx.year, idx.month])
    return {v.iloc[-2] for _, v in g if len(v) >= 2}


EXP = {"KR": lambda i: nth_wd(i, 3, 2), "JP": lambda i: nth_wd(i, 4, 2), "CN": lambda i: nth_wd(i, 2, 4),
       "HK": hk_exp, "US": lambda i: nth_wd(i, 4, 3)}

spx = H["^GSPC"]["Close"]; vix = H["^VIX"]["Close"]
out = {}
summary = []
for mk, cfg in prob.MK.items():
    px = H[cfg["ix"]]; c = px["Close"]; idx = c.index
    asia = mk != "US"
    ext = pd.DataFrame(index=idx)
    hl = np.log((px["High"] / px["Low"]).where(px["High"] > px["Low"]))
    ext["hl5"] = np.log(hl.rolling(5, min_periods=3).mean() * 100 + 0.05)
    ex = pd.Series(idx.isin(list(EXP[mk](idx))).astype(float), index=idx)
    nx = pd.Series(idx, index=idx).shift(-1)
    mon = pd.Series(idx.month, index=idx)
    last_m = (mon != mon.shift(-1)).astype(float)          # 그 달 마지막 거래일
    first_m = (mon != mon.shift(1)).astype(float)
    tm = ((last_m.shift(-1) == 1) | (first_m.shift(-1) == 1)).astype(float)
    F1 = {"opx": ex.shift(-1), "me": tm,
          "gap": np.log((nx - pd.Series(idx, index=idx)).dt.days.astype(float))}
    F5 = {"opx": sum(ex.shift(-k) for k in range(1, 6)).clip(0, 1), "me": sum(last_m.shift(-k) for k in range(0, 5)).clip(0, 1),
          "gap": np.log(sum(((pd.Series(idx, index=idx).shift(-k) - pd.Series(idx, index=idx).shift(-k + 1)).dt.days > 3).astype(float) for k in range(1, 6)) + 1)}
    R = {}
    modes = ("저녁판", "아침판") if asia else ("미국",)
    for mn in modes:
        if mn == "저녁판":
            d = prob_vol.frame(c, None, vix.shift(1), True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
            v_ = prob_vol._align(vix.shift(1), idx)
        elif mn == "아침판":
            d = prob_vol.frame(c, spx, vix, True); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix", "usa", "usr"]
            v_ = prob_vol._align(vix, idx)
        else:
            d = prob_vol.frame(c, None, vix, False); base0 = ["lrv5", "lrv20", "ar1", "r5", "lvix", "dvix"]
            v_ = vix.reindex(idx).ffill()
        d["hl5"] = ext["hl5"]
        d["dvix1"] = (np.log(v_) - np.log(v_.shift(1))).clip(-0.5, 0.5)
        for tg in prob_vol.TG:
            FF = F5 if tg == "dn5" else F1
            for k, s in FF.items():
                d[k + "_" + tg] = s
            base = base0 + (["hl5"] if tg in prob_vol.HL_TG.get(mk, ()) else [])
            cands = [("+" + k, base + [k + "_" + tg]) for k in FF] + [("+dvix1", base + ["dvix1"])]
            need = sorted({x for _, fl in cands for x in fl})
            dd = d.dropna(subset=need)
            res = {}
            P, B = prob_vol.walk(dd, base, tg); res["기본"] = prob_vol.judge(dd, P, B, tg)
            for nm, f in cands:
                try:
                    P, B = prob_vol.walk(dd, f, tg); res[nm] = prob_vol.judge(dd, P, B, tg)
                except Exception as e:
                    res[nm] = {"err": str(e)[:100]}
            b = res["기본"]
            for nm, j in res.items():
                if not j or "err" in j:
                    print(mk, mn, tg, nm, j, flush=True); continue
                better = nm != "기본" and all(j[s]["skill"] > b[s]["skill"] for s in ("앞", "뒤", "최근3년"))
                line = f"{mk} {mn} {tg} {nm:7s} 앞 {j['앞']['skill']} 뒤 {j['뒤']['skill']} 최근3년 {j['최근3년']['skill']} 전체 {j['전체']['skill']} auc {j['auc']} n {j['n']} {'✅' if better else ''}"
                print(line, flush=True)
                if better:
                    summary.append(line)
            R[f"{mn}_{tg}"] = {k: ({s: v[s] for s in ("앞", "뒤", "최근3년", "전체", "auc", "ok", "n")} if v and "err" not in v else v) for k, v in res.items()}
    out[mk] = R
json.dump(out, open("probe/calvol_bt.json", "w"), ensure_ascii=False)
print("==== 세 칸 모두 오른 것")
for s in summary:
    print(s)
print("끝")
