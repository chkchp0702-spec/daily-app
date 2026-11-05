"""#69 VKOSPI(코스피200 변동성) 다른 길 — investing.com 과거 자료 API · KRX OTP — 확률 보강 11/5 09시 (Actions)
수준(1년 백분위)·5일 변화 꼬리 → 한국(·일·홍) 다음 날·5일 · 걸어가며 사전 100 브라이어 앞/뒤·최근5년 · VIX 수준·S&P 5일 꼬리 칸 위 + 교차 로지스틱."""
import json, sys, os, re
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd())
import prob, prob_x

UA = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
ids = []
for u, kw in (("https://api.investing.com/api/search/v2/search?q=VKOSPI", {}),
              ("https://api.investing.com/api/search/v2/search?q=KOSPI%20Volatility", {}),
              ("https://www.investing.com/indices/kospi-volatility", {}),
              ("https://www.investing.com/indices/kospi-volatility-historical-data", {}),
              ("https://kr.investing.com/indices/kospi-volatility", {})):
    try:
        r = requests.get(u, headers={**UA, "domain-id": "www"}, timeout=25)
        t = r.text; print("SRC", u, r.status_code, len(t), t[:160].replace("\n", " "))
        if u.startswith("https://api") and r.ok:
            for q in r.json().get("quotes", []):
                print("  Q", q.get("id"), q.get("name"), q.get("symbol"), q.get("exchange"), q.get("type"))
                if "KOSPI" in (str(q.get("name")) + str(q.get("symbol"))).upper() and "VOL" in (str(q.get("name")) + str(q.get("symbol"))).upper():
                    ids.append(int(q["id"]))
        elif r.ok:
            for m in re.findall(r'"instrument":\{"id":(\d+)', t)[:3] + re.findall(r'data-pair-id="(\d+)"', t)[:3] + re.findall(r'"pairId":(\d+)', t)[:3]:
                print("  ID", m); ids.append(int(m))
    except Exception as e: print("SRC", u, "err", str(e)[:100])
ids = list(dict.fromkeys(ids)); print("IDS", ids)

cand = {}
for pid in ids[:4]:
    parts = []
    for a, b in (("2003-01-01", "2012-12-31"), ("2013-01-01", "2020-12-31"), ("2021-01-01", "2026-11-05")):
        try:
            r = requests.get(f"https://api.investing.com/api/financialdata/historical/{pid}?start-date={a}&end-date={b}&time-frame=Daily&add-missing-rows=false", headers={**UA, "domain-id": "www"}, timeout=30)
            js = r.json().get("data", []) if r.ok else []
            s_ = pd.Series({pd.Timestamp(x["rowDateTimestamp"][:10]): float(str(x["last_closeRaw"]).replace(",", "")) for x in js}, dtype=float)
            print("SRC inv", pid, a, r.status_code, len(s_), (round(float(s_.iloc[-1]), 2) if len(s_) else "")); parts.append(s_)
        except Exception as e: print("SRC inv", pid, a, "err", str(e)[:80])
    if parts:
        s_ = pd.concat(parts).sort_index(); cand[f"inv{pid}"] = s_[~s_.index.duplicated()]
# KRX OTP (로그인 없이 되는지)
try:
    hk = {**UA, "Referer": "http://data.krx.co.kr/contents/MDC/MDI/mdiLoader/index.cmd?menuId=MDC0201010105"}
    r = requests.post("http://data.krx.co.kr/comm/fileDn/GenerateOTP/generate.cmd", headers=hk, timeout=20,
                      data={"locale": "ko_KR", "tboxindIdx_finder_drvetcidx0_0": "코스피 200 변동성지수", "indIdx": "1", "indIdx2": "300",
                            "codeNmindIdx_finder_drvetcidx0_0": "코스피 200 변동성지수", "strtDd": "20240101", "endDd": "20241231",
                            "share": "2", "money": "3", "csvxls_isNo": "false", "name": "fileDown", "url": "dbms/MDC/STAT/standard/MDCSTAT01201"})
    print("SRC krx otp", r.status_code, r.text[:80])
    if r.ok and len(r.text) > 20 and "LOGOUT" not in r.text:
        r2 = requests.post("http://data.krx.co.kr/comm/fileDn/download_csv/download.cmd", headers=hk, data={"code": r.text}, timeout=20)
        print("SRC krx dl", r2.status_code, len(r2.content), r2.content[:120].decode("euc-kr", "ignore"))
except Exception as e: print("SRC krx err", str(e)[:100])

if not cand or max(len(v) for v in cand.values()) < 1000:
    print("NO DATA"); sys.exit(0)
best = max(cand, key=lambda k: len(cand[k])); vk = cand[best]; vk = vk[vk > 0]
print("VKOSPI use", best, vk.index[0].date(), vk.index[-1].date(), len(vk), round(float(vk.iloc[-1]), 2))

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^VIX", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
vix, sp = cs("^VIX"), cs("^GSPC")
# 같은 날 상관
j = pd.concat([np.log(vk).diff(), np.log(vix).diff()], axis=1).dropna(); print("corr dlog VKOSPI vs VIX same day", round(float(j.corr().iloc[0, 1]), 3))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start):
    y = d[ycol]; ev = y.notna() & (d.index >= start)
    for p in ps.values(): ev &= p.notna()
    mid = d.index[ev][len(d.index[ev]) // 2]
    r = {"mid": str(mid.date())}
    for nm, msk in (("앞", ev & (d.index < mid)), ("뒤", ev & (d.index >= mid)), ("최근5년", ev & (d.index >= d.index[-1] - pd.Timedelta(days=1826)))):
        r[nm] = {k: round(float(((p[msk] - y[msk]) ** 2).mean()), 5) for k, p in ps.items()}
    return r


def lab(r, hi, lo):
    return pd.Series(np.where(r >= 0.9, hi, np.where(r <= 0.1, lo, "-")), index=r.index, dtype=object).where(r.notna())
def one(r, cond_, nm):
    return pd.Series(np.where(cond_, nm, "-"), index=r.index, dtype=object).where(r.notna())


def logit_fit(X, y, l2=1.0, it=100):
    w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) / len(y) + l2 * np.r_[0, w[1:]] / len(y)
        Hs = (X * (p * (1 - p))[:, None]).T @ X / len(y) + np.eye(X.shape[1]) * l2 / len(y)
        w -= np.linalg.solve(Hs, g)
    return w


out = {}
for mk in ("KR", "JP", "HK"):
    cfg = prob.MK[mk]
    d = prob.feats(H[cfg["ix"]]); d = d[(d.index >= vk.index[0] + pd.Timedelta(days=400)) & (d.index <= vk.index[-1] + pd.Timedelta(days=5))].copy()
    if mk == "KR":
        A = lambda s: prob_x.rank252(s).reindex(d.index).ffill(limit=3)   # 같은 달력: 한국 t 마감값 → t+1 예측
    else:
        A = lambda s: prob_x.align(prob_x.rank252(s), d.index)
    Au = lambda s: prob_x.align(prob_x.rank252(s), d.index)
    rv = Au(vix); rs = Au(np.log(sp).diff(5))
    oth = lab(rv, "vh", "vl") + "|" + lab(rs, "sh", "sl")
    R = {}
    for fn, ser in (("수준", vk), ("5일변화", np.log(vk).diff(5)), ("VKOSPI−VIX백분위", None)):
        if ser is None:
            rg = prob_x.rank252(A(vk) - rv)  # 한국 공포가 미국 공포보다 큰 정도의 1년 백분위
        else:
            rg = A(ser)
        mid = d.index[len(d) // 2]; cells = {}
        for nm, f in (("≥90", (rg >= 0.9).fillna(False)), ("≤10", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"높음일": int(fh.sum()), "높음&VIX≥90": int((fh & (rv >= 0.9)).sum()), "높음&S&P≤10": int((fh & (rs <= 0.1)).sum()),
              "낮음일": int(fl.sum()), "낮음&VIX≤10": int((fl & (rv <= 0.1)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "높음": wf(d, gh, ycol, h)[0], "낮음": wf(d, gl, ycol, h)[0],
                 "기존(VIX·S&P)": wf(d, oth, ycol, h)[0], "기존+높음": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+낮음": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P, str(d.index[0].date()))
        D = pd.DataFrame({"c": 1.0, "vh": rv >= .9, "vl": rv <= .1, "sh": rs >= .9, "sl": rs <= .1, "gh": rg >= .9, "gl": rg <= .1}, index=d.index).astype(float)
        ok = rv.notna() & rs.notna() & rg.notna()
        X = {}
        for ycol in ("y1", "y5"):
            m = ok & d[ycol].notna(); idx = d.index[m]; md = idx[len(idx) // 2]
            y = d.loc[m, ycol].values.astype(float); Xa = D[m].values; a, b = idx < md, idx >= md
            xr = {}
            for nm, tr, te in (("앞→뒤", a, b), ("뒤→앞", b, a)):
                s = {}
                for k, cols in (("기존", [0, 1, 2, 3, 4]), ("+높음", [0, 1, 2, 3, 4, 5]), ("+낮음", [0, 1, 2, 3, 4, 6])):
                    w = logit_fit(Xa[tr][:, cols], y[tr]); p = 1 / (1 + np.exp(-Xa[te][:, cols] @ w))
                    s[k] = round(float(((p - y[te]) ** 2).mean()), 5)
                    if k != "기존": s[k + "계수"] = round(float(w[-1]), 3)
                xr[nm] = s
            X[ycol] = xr
        r["교차"] = X
        R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/vkospi_bt.json", "w"), ensure_ascii=False, indent=1)
