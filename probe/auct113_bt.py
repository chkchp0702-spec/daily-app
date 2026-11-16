"""#113 미 국채 입찰 부진(응찰률 낮음 · 낙찰금리 「꼬리」) → 미국·아시아 다음 날·5일 — 확률 보강 11/16 16시 (Actions)
자료: fiscaldata.treasury.gov auctions_query (Note·Bond, 물가연동·변동금리 뺌) · 결과는 입찰일 13:00(뉴욕) 공개 → 미국 입찰일 종가 전에 앎.
지표(입찰일마다): ① 응찰률 상대 = bid_to_cover ÷ 같은 만기 직전 6번 평균 − 1 (그날 여러 건이면 가장 나쁜 값)
                ② 꼬리 근사 = high_yield − 전날 종가 금리(5년 ^FVX · 10년 ^TNX · 30년 ^TYX, 7년은 FVX·TNX 평균)
백분위 = 직전 120번 입찰일 안 순위(과거만). 부진 = 응찰률 ≤10% / 꼬리 ≥90% · 강함 = 반대.
칸(앞/뒤 · 다음 날·5일 차이 %p) + 걸어가며 브라이어(사전 100) 앞/뒤·최근5년 · 기존(S&P 5일·MOVE 5일 꼬리) 칸 위 + 교차 로지스틱."""
import json, sys, os, time
import numpy as np, pandas as pd, requests
sys.path.insert(0, os.getcwd()); sys.path.insert(0, os.path.join(os.getcwd(), "probe"))
import prob, prob_x
from night_bt_lib import wf, score, logit_fit

U = "https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/od/auctions_query"
rows, pg = [], 1
while True:
    r = requests.get(U, params={"fields": "auction_date,security_type,security_term,original_security_term,bid_to_cover_ratio,high_yield,inflation_index_security,floating_rate",
                                "filter": "security_type:in:(Note,Bond)", "page[size]": 10000, "page[number]": pg}, timeout=60)
    print("fiscaldata", pg, r.status_code); r.raise_for_status(); j = r.json()
    rows += j["data"]
    if pg >= j["meta"]["total-pages"]: break
    pg += 1
A = pd.DataFrame(rows)
A = A[(A["inflation_index_security"] != "Yes") & (A["floating_rate"] != "Yes")].copy()
for c in ("bid_to_cover_ratio", "high_yield"): A[c] = pd.to_numeric(A[c], errors="coerce")
A["date"] = pd.to_datetime(A["auction_date"]); A = A.dropna(subset=["bid_to_cover_ratio"]).sort_values("date")
A["term"] = A["original_security_term"].fillna(A["security_term"]).str.extract(r"(\d+)-Year")[0].astype(float)
A = A[A["term"].isin([2, 3, 5, 7, 10, 20, 30])]
A["btc_rel"] = A.groupby("term")["bid_to_cover_ratio"].transform(lambda s: s / s.shift(1).rolling(6, min_periods=4).mean() - 1)
print("auctions", len(A), A["date"].min().date(), A["date"].max().date(), A["term"].value_counts().to_dict())

syms = sorted({c["ix"] for c in prob.MK.values()} | {"^GSPC", "^MOVE", "^FVX", "^TNX", "^TYX"})
H = prob.load_hist(syms)
def cs(s):
    x = H[s]["Close"].dropna(); return x[x > 0]
sp, mv = cs("^GSPC"), cs("^MOVE")
Y = {5: cs("^FVX"), 10: cs("^TNX"), 30: cs("^TYX")}
Y[7] = (Y[5] + Y[10]).dropna() / 2
def prev_y(t, term):
    s = Y.get(term)
    if s is None: return np.nan
    s = s[s.index < t]
    return float(s.iloc[-1]) if len(s) and (t - s.index[-1]).days < 6 else np.nan
A["tail"] = [r.high_yield - prev_y(r.date, r.term) if pd.notna(r.high_yield) else np.nan for r in A.itertuples()]
A.loc[A["tail"].abs() > 1, "tail"] = np.nan
D = A.groupby("date").agg(btc=("btc_rel", "min"), tail=("tail", "max"))
def prank(s, w=120):
    s = s.dropna(); return s.rolling(w, min_periods=40).apply(lambda x: (x[:-1] < x[-1]).mean() + 0.5 * (x[:-1] == x[-1]).mean(), raw=True)
D["rb"] = prank(D["btc"]); D["rt"] = prank(D["tail"])
print("auction days", len(D), "tail n", int(D["tail"].notna().sum()), "last", D.tail(3).round(3).to_dict("index"))

out = {"auctions": len(A), "days": len(D), "last": {str(k.date()): {kk: (None if pd.isna(vv) else round(float(vv), 3)) for kk, vv in v.items()} for k, v in D.tail(5).iterrows()}}
for mk, cfg in prob.MK.items():
    d = prob.feats(H[cfg["ix"]]); d = d[d.index >= "2003-01-01"].copy(); d = d[d["c"].notna()]
    us = mk == "US"
    usd = sp.index[sp.index >= "2002-06-01"]
    def ev_lab(cond_, nm):
        s = pd.Series("-", index=usd, dtype=object)
        k = D.index[cond_.reindex(D.index).fillna(False).values]
        s.loc[s.index.isin(k)] = nm
        return s.reindex(d.index).fillna("-") if us else prob_x.align(s, d.index).fillna("-")
    Al = (lambda s: prob_x.rank252(s).reindex(d.index).ffill()) if us else (lambda s: prob_x.align(prob_x.rank252(s), d.index))
    rs = Al(np.log(sp).diff(5)); rm = Al(np.log(mv).diff(5))
    oth = pd.Series(np.where(rs >= 0.9, "sh", np.where(rs <= 0.1, "sl", "-")), index=d.index, dtype=object) + "|" + \
          pd.Series(np.where(rm >= 0.9, "mh", "-"), index=d.index, dtype=object)
    L = {"응찰부진": ev_lab(D["rb"] <= 0.1, "bw"), "응찰강함": ev_lab(D["rb"] >= 0.9, "bs"),
         "꼬리큼": ev_lab(D["rt"] >= 0.9, "tw"), "꼬리작음": ev_lab(D["rt"] <= 0.1, "ts"),
         "입찰일": ev_lab(D["btc"].notna(), "ad")}
    mid = d.index[len(d) // 2]
    cells = {}
    for nm, lb in L.items():
        f = lb != "-"; cells[nm] = {}
        for half, msk in (("앞", d.index < mid), ("뒤", d.index >= mid), ("최근5년", d.index >= d.index[-1] - pd.Timedelta(days=1826))):
            c_ = prob.cond(d[msk], f[msk], nm)
            cells[nm][half] = None if not c_ else [c_["n"], round((c_["p1"] - d.loc[msk, "y1"].mean()) * 100, 1), round(((c_["p5"] or 0) - d.loc[msk, "y5"].mean()) * 100, 1)]
    R = {"mid": str(mid.date()), "칸(n,y1차,y5차)": cells}
    for ycol, h in (("y1", 1), ("y5", 5)):
        P = {"평소": wf(d, oth, ycol, h)[1], "기존": wf(d, oth, ycol, h)[0]}
        for nm in ("응찰부진", "응찰강함", "꼬리큼", "꼬리작음"):
            P[nm] = wf(d, L[nm], ycol, h)[0]; P["기존+" + nm] = wf(d, oth + "|" + L[nm], ycol, h)[0]
        R[ycol] = score(d, ycol, P, start="2006-01-01")
        # 교차 로지스틱: 기존 지시변수 + 부진 지시변수 (앞→뒤, 뒤→앞)
        X0 = np.column_stack([np.ones(len(d)), (rs >= 0.9).astype(float), (rs <= 0.1).astype(float), (rm >= 0.9).astype(float)])
        xb = np.column_stack([(L[n] != "-").astype(float) for n in ("응찰부진", "꼬리큼")])
        y = d[ycol].values; ok = ~np.isnan(y) & ~np.isnan(X0).any(1) & (d.index >= "2006-01-01")
        cx = {}
        for nm, X in (("기존", X0), ("기존+부진", np.column_stack([X0, xb]))):
            a = ok & (d.index < mid); b = ok & (d.index >= mid)
            res = []
            for tr, te in ((a, b), (b, a)):
                w = logit_fit(X[tr], y[tr]); p = 1 / (1 + np.exp(-X[te] @ w))
                res.append(round(float(((p - y[te]) ** 2).mean()), 5))
            cx[nm] = res
            if nm == "기존+부진": cx["계수(응찰부진,꼬리큼) 앞학습"] = [round(float(v), 3) for v in logit_fit(X[a], y[a])[-2:]]
        R[ycol + "_교차"] = cx
    out[mk] = R
    print(mk, json.dumps(R, ensure_ascii=False))
json.dump(out, open("probe/auct113_bt.json", "w"), ensure_ascii=False, indent=1)
