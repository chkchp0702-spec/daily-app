"""#4 검증: 한국 닻(간밤 S&P)에 ① EWY(미국 상장 한국 ETF)의 코스피 마감 뒤 초과 등락 ② 밤사이 원달러를 더하면 나아지나."""
import json
import numpy as np, pandas as pd, yfinance as yf
E9 = [-0.02, -0.01, -0.005, -0.002, 0.002, 0.005, 0.01, 0.02]
def dl(s, **k):
    x = yf.download(s, auto_adjust=False, progress=False, **k)
    if isinstance(x.columns, pd.MultiIndex): x.columns = x.columns.get_level_values(0)
    return x
def d1(s):
    c = dl(s, period="max", interval="1d")["Close"].dropna(); c.index = pd.to_datetime(c.index).tz_localize(None).normalize()
    return c[~c.index.duplicated(keep="last")]
def brier(p, y): return float(np.mean((np.asarray(p) - np.asarray(y)) ** 2))
def bucket_rate(tr_x, tr_y, te_x, base):
    tb = np.digitize(tr_x, E9); out = []
    for b in np.digitize(te_x, E9):
        m = tb == b; out.append((float(tr_y[m].sum()) + 20 * base) / (int(m.sum()) + 20))
    return np.array(out)
def logit_fit(X, y, l2=1.0, it=50):
    X = np.c_[np.ones(len(X)), X]; w = np.zeros(X.shape[1])
    for _ in range(it):
        p = 1 / (1 + np.exp(-X @ w)); g = X.T @ (p - y) + l2 * np.r_[0, w[1:]]
        H = (X.T * (p * (1 - p))) @ X + l2 * np.diag(np.r_[0, np.ones(len(w) - 1)])
        w -= np.linalg.solve(H, g)
    return w
def lp(w, X): return 1 / (1 + np.exp(-(np.c_[np.ones(len(X)), X] @ w)))
def lg(p): p = np.clip(p, 1e-4, 1 - 1e-4); return np.log(p / (1 - p))
OUT={}
sp=d1("^GSPC"); spr=sp.pct_change()
for mk,(ix,etf) in {"KR":("^KS11","EWY"),"JP":("^N225","EWJ"),"HK":("^HSI","EWH"),"CN":("000001.SS","FXI")}.items():
  try:
    ks=d1(ix); ew=d1(etf); ksr=ks.pct_change(); ewr=ew.pct_change(); kd=list(ks.index); rows=[]
    for t in spr.index[spr.index >= "2012-01-01"]:
        if pd.isna(spr.get(t)) or pd.isna(ewr.get(t)): continue
        nx = ks.index[ks.index > t]
        if not len(nx): continue
        D = nx[0]; i = kd.index(D)
        if i < 2 or kd[i - 1] > t: continue
        P = kd[i - 1]
        rows.append((D, float(spr[t]), float(ewr[t]) - float(ksr[P]), int(ks[D] > ks[P])))
    R = pd.DataFrame(rows, columns=["D","us","ewyx","y"]).drop_duplicates("D").dropna()
    mid = R["D"].iloc[len(R)//2]; A,B = R[R["D"]<mid], R[R["D"]>=mid]; O={"n":len(R),"split":str(mid.date())}
    for nm,T in {"A":A,"B":B}.items():
        up,dn=T[T["ewyx"]>0.005],T[T["ewyx"]<-0.005]; O[nm]=[len(up),round(float(up["y"].mean()),3),len(dn),round(float(dn["y"].mean()),3),round(float(T["y"].mean()),3)]
    for nm,(tr,te) in {"앞→뒤":(A,B),"뒤→앞":(B,A)}.items():
        y=te["y"].values; base=float(tr["y"].mean()); p0=bucket_rate(tr["us"].values,tr["y"].values,te["us"].values,base)
        r={"칸":round(brier(p0,y),4)}
        for b in [0.1,0.16,0.25,0.35]:
            q=1/(1+np.exp(-(lg(p0)+np.clip(b*te["ewyx"].values*100,-0.3,0.3)))); r[str(b)]=round(brier(q,y),4)
        # 최근 2년만
        rec=te[te["D"]>=te["D"].max()-pd.Timedelta(days=730)]
        if len(rec)>100 and nm=="앞→뒤":
            p0r=bucket_rate(tr["us"].values,tr["y"].values,rec["us"].values,base); yr=rec["y"].values
            r["최근2년"]={"n":len(rec),"칸":round(brier(p0r,yr),4),"0.16":round(brier(1/(1+np.exp(-(lg(p0r)+np.clip(0.16*rec["ewyx"].values*100,-0.3,0.3)))),yr),4)}
        O[nm]=r
    OUT[mk]=O
  except Exception as e: OUT[mk]={"err":repr(e)[:200]}
print("ETF_BT "+json.dumps(OUT,ensure_ascii=False))
