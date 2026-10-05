"""
매시간 가볍게 도는 감시 (watch.yml)
  1) 앱 관심종목 동기화 (ntfy → users.json)
  2) 가격 도달 알림: 사용자가 적은 목표가·손절가에 닿으면 그 사람 주제로 푸시
  3) 갭 첫 30분 확인: 한국 장 시작(09:30~10:59) · 미국 장 시작(한국 22:30~00:59) 뒤 갭을 지켰는지
  python watch.py
"""
import datetime as dt
import json
import os
import re
import sys
import time
import traceback
import urllib.request

import extras as X
import plus

plus.X = X
KST = X.KST


def nv_price(code):
    """네이버 실시간 (한국)"""
    url = f"https://polling.finance.naver.com/api/realtime/domestic/stock/{code}"
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)", "Referer": "https://m.stock.naver.com/"})
    with urllib.request.urlopen(req, timeout=10) as r:
        j = json.loads(r.read().decode("utf-8"))
    d = (j.get("datas") or [{}])[0]
    num = lambda k: float(str(d.get(k) or "0").replace(",", "") or 0) or None
    return {"now": num("closePrice"), "open": num("openPrice"), "high": num("highPrice"), "low": num("lowPrice"),
            "chg": float(str(d.get("fluctuationsRatio") or "0").replace(",", "") or 0), "status": d.get("marketStatus")}


def yf_last(syms):
    """야후 5분봉 마지막 값 (해외)"""
    out = {}
    if not syms:
        return out
    import yfinance as yf
    import pandas as pd
    try:
        df = yf.download(syms, period="2d", interval="5m", prepost=True, group_by="ticker", progress=False, threads=True)
    except Exception as e:
        print("야후 실패", e)
        return out
    for s in syms:
        try:
            c = (df[s] if isinstance(df.columns, pd.MultiIndex) else df)["Close"].dropna()
            if len(c):
                out[s] = float(c.iloc[-1])
        except Exception:
            pass
    return out


def prices(syms):
    out = {}
    kr = [s for s in syms if re.fullmatch(r"\d{6}(\.K[SQ])?", s)]
    for s in kr:
        try:
            out[s] = nv_price(s[:6])["now"]
            time.sleep(0.15)
        except Exception:
            pass
    out.update(yf_last([s for s in syms if s not in kr]))
    return out


def price_alerts(U):
    syms = sorted({it[0] for u in U.values() for it in u.get("wl") or [] if (len(it) > 3 and it[3]) or (len(it) > 4 and it[4])})
    if not syms:
        return
    px = prices(syms)
    st_p = os.path.join(X.OUT, "watch_state.json")
    st = X.jl(st_p, {}) or {}
    now = dt.datetime.now(KST)
    for uid, u in U.items():
        for s, nm, buy, tgt, stop in [(it + [None] * 5)[:5] for it in u.get("wl") or []]:
            p = px.get(s)
            if not p:
                continue
            for kind, lvl, hit, ic in (("목표가", tgt, p >= (tgt or 9e18), "🎯"), ("손절가", stop, p <= (stop or -1), "🛑")):
                if not lvl:
                    continue
                key = f"{uid}:{s}:{kind}:{lvl}"
                if hit and key not in st:
                    r = f" · 매수가 대비 {(p / buy - 1) * 100:+.1f}%" if buy else ""
                    X.push("u", f"{ic} {nm[:16]} {kind} 도달", f"지금 {p:,.2f} (설정 {lvl:,.2f}){r}", "onepager", "px:" + key + ":" + now.strftime("%Y%m%d%H"),
                           tags="dart" if kind == "목표가" else "stop_sign", syms=[[s, p]], quiet=tuple(u.get("quiet") or X.QUIET),
                           full_topic=plus.user_topic(uid), log=False)
                    st[key] = now.strftime("%Y-%m-%d")
                elif not hit and key in st and abs(p / lvl - 1) > 0.02:
                    st.pop(key, None)          # 다시 2% 넘게 멀어지면 다음 도달 때 또 알림
    json.dump(st, open(st_p, "w", encoding="utf-8"), separators=(",", ":"))
    print("가격 알림 확인", len(syms))


def gap_open():
    now = dt.datetime.now(KST)
    hm = now.hour * 100 + now.minute
    kr_win = now.weekday() < 5 and 930 <= hm < 1100
    us_win = (now.weekday() < 5 and hm >= 2230) or (1 <= now.weekday() <= 5 and hm < 100)
    if not (kr_win or us_win):
        return
    gap, day = plus.latest_json("gap", "cards.json", {})
    rows = [r for r in (gap or {}).get("top", []) if r.get("new") or r.get("fresh") or (r.get("after") or 99) <= 5][:40]
    path = os.path.join(X.OUT, "gap_open.json")
    G = X.jl(path, {}) or {}
    items = []
    if kr_win:
        for r in rows:
            if r.get("mkt") != "KR":
                continue
            try:
                q = nv_price(str(r["code"])[:6])
            except Exception:
                continue
            if q.get("status") and q["status"] != "OPEN":
                print("한국 장이 열리지 않음 (휴장)", q["status"])
                items = []
                break
            bh = r.get("boxhi")
            items.append({"code": r["code"], "name": r.get("name"), "now": q["now"], "chg": q["chg"], "low": q["low"], "open": q["open"],
                          "boxhi": bh, "hold": bool(bh and q["low"] and q["low"] > bh), "above_open": bool(q["open"] and q["now"] and q["now"] >= q["open"])})
            time.sleep(0.15)
        key = "kr"
    else:
        import yfinance as yf
        import pandas as pd
        us = [r for r in rows if r.get("mkt") == "US"]
        if us:
            try:
                df = yf.download([r["code"] for r in us], period="1d", interval="5m", group_by="ticker", progress=False, threads=True)
            except Exception as e:
                print("미국 갭 실패", e)
                df = None
            for r in us:
                try:
                    sub = (df[r["code"]] if isinstance(df.columns, pd.MultiIndex) else df).dropna()
                    if not len(sub):
                        continue
                    et = sub.index.tz_convert("America/New_York")
                    now_et = dt.datetime.now(dt.timezone.utc).astimezone(et[0].tzinfo)
                    if et[0].date() != now_et.date() or (now_et - et[0]).total_seconds() < 1800:
                        continue                       # 오늘 정규장 시작 30분이 아직 안 지남
                    o, lo, c = float(sub["Open"].iloc[0]), float(sub["Low"].min()), float(sub["Close"].iloc[-1])
                    bh = r.get("boxhi")
                    items.append({"code": r["code"], "name": r.get("name"), "now": c, "open": o, "low": lo, "chg": None, "boxhi": bh,
                                  "hold": bool(bh and lo > bh), "above_open": c >= o})
                except Exception:
                    continue
        key = "us"
    if not items:
        return
    G[key] = {"t": now.strftime("%Y-%m-%d %H:%M"), "day": day, "items": items}
    json.dump(G, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    hold = [x for x in items if x["hold"]]
    weak = [x for x in items if not x["hold"]]
    X.push("gap", f"📈 {'한국' if key == 'kr' else '미국'} 갭 첫 30분: 지킴 {len(hold)} · 무너짐 {len(weak)}",
           ("지킴: " + ", ".join(x["name"][:10] for x in hold[:6]) if hold else "지킨 종목 없음") + (" / 무너짐: " + ", ".join(x["name"][:10] for x in weak[:4]) if weak else ""),
           "gap", f"gapopen:{key}:{now.strftime('%Y-%m-%d')}", syms=[[x["code"], x["now"]] for x in items[:8]])
    print("갭 첫 30분", key, len(items))


if __name__ == "__main__":
    U = {}
    try:
        U = plus.sync_users() or {}
    except Exception:
        traceback.print_exc()
    for fn, a in ((price_alerts, (U,)), (gap_open, ())):
        try:
            fn(*a)
        except Exception:
            traceback.print_exc()
    print("watch ok")
