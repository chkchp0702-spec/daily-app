"""#28 금/은 비율(GC=F÷SI=F) 5일 급변 꼬리 → 5개 시장 다음 날·5일 — 확률 보강 일지 10/29 16시 (Actions)
금=안전자산, 은=경기 금속 성격 → 비율 급등 = 위험 회피. 5일·20일 로그 변화 1년 백분위 ≥90%·≤10% 한쪽씩 칸.
미국 날짜 값 → 다음 아시아 장(prob_x.align). 걸어가며 사전 100 브라이어 앞/뒤·최근5년.
겹침: 이미 붙인 🟤 구리/금 5일 꼬리·달러지수 5일 꼬리·S&P 5일 꼬리 칸 위에 더해도 좋아지는지."""
import json, sys, os
import numpy as np, pandas as pd
sys.path.insert(0, os.getcwd())
import prob, prob_x

syms = sorted({c["ix"] for c in prob.MK.values()} | {"GC=F", "SI=F", "HG=F", "DX-Y.NYB", "^GSPC"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
gc, si, hg, dx, sp = cs("GC=F"), cs("SI=F"), cs("HG=F"), cs("DX-Y.NYB"), cs("^GSPC")
b = pd.concat([gc, si], axis=1, keys=["g", "s"]).dropna()
gsr = np.log(b["g"] / b["s"])
c2 = pd.concat([hg, gc], axis=1, keys=["h", "g"]).dropna(); cug = np.log(c2["h"] / c2["g"])
print("금/은", gsr.index[0].date(), gsr.index[-1].date(), len(gsr), round(float(np.exp(gsr.iloc[-1])), 1))


def wf(d, lab, ycol, h, prior=100):
    y = d[ycol]
    known = y.shift(h); base = known.expanding().mean(); p = base.copy()
    for L in [x for x in lab.dropna().unique()]:
        f = (lab == L); fm = f.shift(h, fill_value=False)
        k = known.where(fm).fillna(0).cumsum(); n = (known.notna() & fm).astype(float).cumsum()
        p = p.where(~f, (k + prior * base) / (n + prior))
    return p, base


def score(d, ycol, ps, start="2006-01-01"):
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


out = {}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2001-01-01"].copy()
    A = (lambda s: prob_x.align(prob_x.rank252(s), d.index)) if mk != "US" else (lambda s: prob_x.rank252(s).reindex(d.index).ffill())
    rd = A(np.log(dx).diff(5)); rs = A(np.log(sp).diff(5)); rc = A(cug.diff(5))
    oth = lab(rc, "ch", "cl") + "|" + lab(rd, "dh", "dl") + "|" + lab(rs, "sh", "sl")
    R = {}
    for fn, w in (("5일", 5), ("20일", 20)):
        rg = A(gsr.diff(w))
        mid = d.index[len(d) // 2]
        cells = {}
        for nm, f in (("≥90(금 강세·위험회피)", (rg >= 0.9).fillna(False)), ("≤10(은 강세·위험선호)", (rg <= 0.1).fillna(False))):
            cells[nm] = {}
            for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid)):
                c_ = prob.cond(d[msk], f[msk], nm)
                cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
        fh = (rg >= 0.9).fillna(False); fl = (rg <= 0.1).fillna(False)
        ov = {"급등일": int(fh.sum()), "급등&구리/금≤10": int((fh & (rc <= 0.1)).sum()), "급등&S&P≤10": int((fh & (rs <= 0.1)).sum()),
              "급락일": int(fl.sum()), "급락&구리/금≥90": int((fl & (rc >= 0.9)).sum()), "급락&S&P≥90": int((fl & (rs >= 0.9)).sum())}
        gh, gl, gb = one(rg, rg >= 0.9, "gh"), one(rg, rg <= 0.1, "gl"), lab(rg, "gh", "gl")
        r = {"mid": str(mid.date()), "cur_rank": None if pd.isna(rg.iloc[-1]) else round(float(rg.iloc[-1]), 3), "칸(n,y1차,y5차)": cells, "겹침": ov}
        for ycol, h in (("y1", 1), ("y5", 5)):
            P = {"평소": wf(d, gb, ycol, h)[1], "급등": wf(d, gh, ycol, h)[0], "급락": wf(d, gl, ycol, h)[0], "양쪽": wf(d, gb, ycol, h)[0],
                 "기존(구리금·달러·S&P)": wf(d, oth, ycol, h)[0], "기존+급등": wf(d, oth + "|" + gh, ycol, h)[0],
                 "기존+급락": wf(d, oth + "|" + gl, ycol, h)[0], "기존+양쪽": wf(d, oth + "|" + gb, ycol, h)[0]}
            r[ycol] = score(d, ycol, P)
        R[fn] = r
        print(mk, fn, json.dumps(r, ensure_ascii=False))
    out[mk] = R
json.dump(out, open("probe/gsr_bt.json", "w"), ensure_ascii=False, indent=1)
