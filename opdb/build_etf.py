"""
ETF 리포트 만들기 (미국: 나스닥 목록 + 야후 / 한국: 네이버증권 + 와이즈리포트)
  python opdb/build_etf.py --list --dest opdata                 → opdata/etf_list.json
  python opdb/build_etf.py --shard 3 --of 20 --etfs etf_list.json --names names_ko.json --out out
결과: out/x/<심볼>.json (원본), out/s/<심볼>.html (리포트, CSS 없이), out/etfmeta_<shard>.json
"""
import argparse, datetime as dt, json, os, re, signal, sys, time, urllib.parse, urllib.request

sys.path.insert(0, os.path.join("_src", "stock-onepager"))
sys.path.insert(0, os.path.dirname(__file__))
from common import fname, fnv  # noqa: E402

UA_M = {"User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148",
        "Accept": "application/json, text/plain, */*", "Referer": "https://m.stock.naver.com/"}
UA_D = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
        "Accept": "application/json, text/plain, */*"}
START = time.time()
BUDGET = 5 * 3600


def get(url, hdr=UA_M, raw=False, timeout=25):
    req = urllib.request.Request(url, headers=hdr)
    with urllib.request.urlopen(req, timeout=timeout) as r:
        b = r.read()
    try:
        t = b.decode("utf-8")
    except UnicodeDecodeError:
        t = b.decode("euc-kr", "replace")
    return t if raw else json.loads(t)


# ── 목록 ─────────────────────────────────────────────────────

def build_list(dest):
    out = []
    try:
        d = get("https://api.nasdaq.com/api/screener/etf?download=true", UA_D, timeout=60)
        rows = d["data"]["data"]["rows"]
        for r in rows:
            s = (r.get("symbol") or "").strip().replace(".", "-")
            if s:
                out.append([s, (r.get("companyName") or s).strip(), "US"])
        print("미국 ETF", len(rows), flush=True)
    except Exception as e:
        print("나스닥 목록 실패", e, flush=True)
    try:
        d = get("https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0", UA_D)
        rows = d["result"]["etfItemList"]
        for r in rows:
            out.append([r["itemcode"] + ".KS", r["itemname"], "KR"])
        print("한국 ETF", len(rows), flush=True)
    except Exception as e:
        print("네이버 목록 실패", e, flush=True)
    path = os.path.join(dest, "etf_list.json")
    old = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else []
    if len(out) >= len(old) * 0.8:
        json.dump(out, open(path, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("ETF 목록", len(out), "(이전", len(old), ")")


# ── 가격 (묶음으로 한 번에) ───────────────────────────────────

def prices(syms):
    import yfinance as yf
    import pandas as pd
    res = {}
    for i in range(0, len(syms), 150):
        part = syms[i:i + 150]
        try:
            df = yf.download(part, period="1y", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
        except Exception as e:
            print("가격 실패", e, flush=True)
            continue
        for s in part:
            try:
                c = (df[s]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            except Exception:
                continue
            if len(c) < 2:
                continue
            last = float(c.iloc[-1])

            def back(days):
                t = c.index[-1] - pd.Timedelta(days=days)
                b = c[c.index <= t]
                return round((last / float(b.iloc[-1]) - 1) * 100, 2) if len(b) and (c.index[0] <= t) else None
            ytd = c[c.index.year == c.index[-1].year]
            prev_year = c[c.index.year < c.index[-1].year]
            w = c.resample("W-FRI").last().dropna()
            res[s] = {
                "price": round(last, 4), "w52_lo": round(float(c.min()), 4), "w52_hi": round(float(c.max()), 4),
                "price_history": [[d.strftime("%Y-%m-%d"), round(float(v), 4)] for d, v in w.items()][-53:],
                "ret": {"1개월": back(30), "3개월": back(91), "6개월": back(182),
                        "올해": round((last / float(prev_year.iloc[-1]) - 1) * 100, 2) if len(prev_year) else None,
                        "1년": back(360)},
            }
    return res


# ── 한국 ETF ──────────────────────────────────────────────────

def isin_code(c):
    c = str(c or "").strip()
    if re.fullmatch(r"KR7\d{6}\d{3}", c) or re.fullmatch(r"KR7\w{9}", c):
        return c[3:9]
    return c if re.fullmatch(r"\d{6}|[0-9A-Z]{6}", c) else ""


def kr_etf(sym, name):
    code = sym.split(".")[0]
    a = get(f"https://m.stock.naver.com/api/stock/{code}/etfAnalysis")
    x = {"name": a.get("itemName") or name, "issuer": re.sub(r"\(ETF\)", "", a.get("issuerName") or "").strip(),
         "index": a.get("etfBaseIndex") or "", "cur": "KRW", "mkt": "KR"}
    desc = a.get("etfSummary") or ""
    x["desc"] = re.sub(r"([다요])\.(?=\S)", r"\1. ", desc)
    if a.get("listedDate") and len(a["listedDate"]) == 8:
        x["listed"] = f'{a["listedDate"][:4]}.{a["listedDate"][4:6]}.{a["listedDate"][6:]}'
    x["fee"] = a.get("totalFee")
    try:
        x["aum"] = float(a.get("marketValueRaw") or 0) or None
    except ValueError:
        x["aum"] = None
    dv = a.get("dividend") or {}
    x["div_yield"] = dv.get("dividendYieldTtm")
    lab = {"M1": "1개월", "M3": "3개월", "M6": "6개월", "YTD": "올해", "Y1": "1년", "Y3": "3년(연)"}
    x["returns"] = {lab[r["periodTypeCode"]]: r.get("value") for r in (a.get("returnPerformanceList") or []) if r.get("periodTypeCode") in lab}
    x["sectors"] = [{"k": s["detailTypeCode"], "w": s["weight"]} for s in (a.get("sectorPortfolioList") or []) if s.get("weight")]
    x["assets"] = [{"k": s["detailTypeCode"], "w": s["weight"]} for s in (a.get("assetPortfolioList") or []) if s.get("weight")]
    x["countries"] = [{"k": s["detailTypeCode"], "w": s["weight"]} for s in (a.get("countryPortfolioList") or []) if s.get("weight")]
    hs = []
    for h in a.get("etfTop10MajorConstituentAssets") or []:
        try:
            w = float(str(h.get("etfWeight", "")).replace("%", "").replace(",", ""))
        except ValueError:
            w = None
        try:
            sh = float(str(h.get("stockCount", "")).replace(",", ""))
        except ValueError:
            sh = None
        hs.append({"code": isin_code(h.get("itemCode")), "name": h.get("itemName") or "", "w": w, "sh": sh})
    # 와이즈리포트: 전체 구성 종목 (CU당)
    t = ""
    for k in range(3):
        try:
            t = get(f"https://navercomp.wisereport.co.kr/v2/ETF/index.aspx?cmp_cd={code}", UA_D, raw=True)
            if "CU_data" in t:
                break
        except Exception:
            pass
        time.sleep(4 * (k + 1))
    try:
        m = re.search(r"var\s+CU_data\s*=\s*(\{.*?\});", t, re.S)
        if m:
            grid = json.loads(m.group(1)).get("grid_data") or []
            full = []
            for g in grid:
                nm = (g.get("STK_NM_KOR") or g.get("STK_NM") or "").strip()
                w = g.get("ETF_WEIGHT")
                cd = ""
                for k in ("STK_CD", "CMP_CD", "ISU_CD", "STK_CODE", "ITEM_CD"):
                    if g.get(k):
                        cd = isin_code(g[k])
                        if cd:
                            break
                sh = g.get("AGMT_STK_CNT")
                if nm and w is not None:
                    full.append({"code": cd, "name": nm, "w": float(w)})
                elif nm and sh:                       # 해외 종목 ETF: 비중 없이 주식 수만 → 나중에 추정
                    full.append({"code": cd, "name": nm, "w": None, "sh": float(sh)})
            full.sort(key=lambda h: -(h["w"] if h["w"] is not None else -1))
            if len(full) >= len(hs):
                # 코드가 비면 네이버 상위 10에서 이름으로 채우기
                byname = {h["name"]: h["code"] for h in hs}
                for h in full:
                    if not h["code"]:
                        h["code"] = byname.get(h["name"], "")
                x["n_hold"] = len(full)
                hs = full
    except Exception as e:
        print("  wise 실패", sym, e, flush=True)
    x["holdings"] = hs if any(h.get("w") is None for h in hs) else hs[:40]   # 추정할 것은 다 넘김(추정 뒤 40개로 자름)
    return x


# ── 주식 수만 공개한 ETF: 비중 추정 (주식 수 × 최근 가격 × 환율) ─────────
_SYM, _PX, _FXR = {}, {}, {}
CUR_BY_SUF = {"": "USD", "L": "GBp", "T": "JPY", "HK": "HKD", "TW": "TWD", "TWO": "TWD", "KS": "KRW", "KQ": "KRW",
              "DE": "EUR", "F": "EUR", "PA": "EUR", "AS": "EUR", "MI": "EUR", "MC": "EUR", "HE": "EUR", "BR": "EUR", "VI": "EUR", "LS": "EUR", "IR": "EUR",
              "SW": "CHF", "TO": "CAD", "V": "CAD", "AX": "AUD", "TA": "ILA", "ST": "SEK", "CO": "DKK", "OL": "NOK",
              "SS": "CNY", "SZ": "CNY", "SI": "SGD", "NS": "INR", "BO": "INR", "SA": "BRL", "MX": "MXN", "JO": "ZAc", "NZ": "NZD", "KL": "MYR", "BK": "THB", "JK": "IDR"}
BAD_EX = {"VIE", "PNK", "OTC", "OQB", "OQX", "OEM", "OBB", "OGM", "NEO", "CXE", "BUE", "MUN", "STU", "DUS", "HAM", "BER", "FRA", "EBS", "IOB"}
CASH = re.compile(r"현금|예금|증거금|CASH|DEPOSIT|미수|미지급|원화|KRW|USD$", re.I)
SKIP = re.compile(r"선물|FUT|스왑|SWAP|\b[FC] \d{6}|옵션", re.I)


def _suf(sym):
    return sym.rsplit(".", 1)[1] if "." in sym and not sym.startswith("^") else ""


def _clean(n):
    n = re.sub(r"\s*-\s*(CL|CLASS)\s*[A-Z]\b|\b(CL|CLASS)\s+[A-Z]\b|\s*-\s*[A-Z]\s*$|-NY\b|\bEquity\b|\bADR\b|\bADS\b|-SP\b|\bSPON\w*|\bREG\b|\bSHS\b|\bSHARES\b|\bORD\b|/[A-Z]{2}\b|\(.*?\)", " ", n, flags=re.I)
    return re.sub(r"\s+", " ", n).strip()


def resolve(name, code=""):
    """종목 이름 → 야후 심볼 (한국 6자리는 .KS/.KQ, 한글 이름은 네이버 자동완성, 나머지는 야후 검색)"""
    key = code or name
    if key in _SYM:
        return _SYM[key]
    sym = None
    try:
        if code and re.fullmatch(r"\d{6}|[0-9A-Z]{6}", code) and code[0].isdigit():
            sym = code + ".KS"
        elif re.search(r"[가-힣]", name):
            d = get("https://ac.stock.naver.com/ac?q=" + urllib.parse.quote(name) + "&target=stock", UA_D, timeout=10)
            for it in d.get("items") or []:
                if it.get("nationCode") == "KOR" and it.get("code"):
                    sym = it["code"] + (".KQ" if it.get("typeCode") == "KOSDAQ" else ".KS")
                    break
        else:
            bare = re.sub(r"\b(LTD|LIMITED|CORP(ORATION)?|INC|PLC|CO|COMPANY|HOLDINGS?|GROUP|SA|AG|NV|SE|KK|OF INDIA|THE|SVCS|TECH)\b\.?", " ", _clean(name), flags=re.I)
            bare = re.sub(r"\s+", " ", re.sub(r"[^A-Za-z0-9& ]", " ", bare)).strip()
            for q in dict.fromkeys([name, _clean(name), bare, " ".join([w for w in bare.split() if w != "&"][:2])]):
                if not q:
                    continue
                d = {}
                for k in range(3):                    # 야후가 잠깐 막으면(429) 쉬었다 다시
                    try:
                        d = get("https://query2.finance.yahoo.com/v1/finance/search?quotesCount=8&newsCount=0&q=" + urllib.parse.quote(q), UA_D, timeout=10)
                        break
                    except TimeoutError:
                        raise
                    except Exception as e:
                        print("  야후 검색 재시도", q[:30], str(e)[:40], flush=True)
                        time.sleep(3 * (k + 1))
                qs = [z for z in d.get("quotes") or [] if z.get("quoteType") == "EQUITY" and z.get("exchange") not in BAD_EX
                      and _suf(z.get("symbol", "")) in CUR_BY_SUF]
                # 유럽 교차상장(빈 .VI · 밀라노 1XXX.MI · 독일 지방거래소)은 빼고 야후 순서대로.
                # 이름에 ADR/-NY 가 있으면 미국 상장(ADR) 우선 — 반대로 본국 주식을 ADR 가격으로 계산하면 비중이 몇 배 틀어짐
                qs = [z for z in qs if not z["symbol"].endswith(".VI") and not re.match(r"\d\w*\.MI$", z["symbol"])]
                if qs:
                    if re.search(r"\bADR\b|-NY\b|\bADS\b", name, re.I):
                        us = [z for z in qs if "." not in z["symbol"]]
                        qs = us or qs
                    sym = qs[0]["symbol"]
                    break
                time.sleep(0.3)
    except TimeoutError:
        raise
    except Exception as e:
        print("  심볼 못 찾음", name, repr(e)[:80], flush=True)
    _SYM[key] = sym
    return sym


def _last_prices(syms):
    import yfinance as yf
    import pandas as pd
    need = [s for s in dict.fromkeys(syms) if s and s not in _PX]
    if not need:
        return
    try:
        df = yf.download(need, period="10d", interval="1d", group_by="ticker", auto_adjust=False, threads=True, progress=False)
    except Exception as e:
        print("  가격 실패", e, flush=True)
        df = None
    for s in need:
        v = None
        try:
            c = (df[s]["Close"] if isinstance(df.columns, pd.MultiIndex) else df["Close"]).dropna()
            v = float(c.iloc[-1]) if len(c) else None
        except TimeoutError:
            raise
        except Exception:
            pass
        _PX[s] = v


def fx_krw(cur):
    """통화 1단위 = 원 (GBp·ILA·ZAc 는 1/100)"""
    base, div = {"GBp": ("GBP", 100), "ILA": ("ILS", 100), "ZAc": ("ZAR", 100)}.get(cur, (cur, 1))
    if base == "KRW":
        return 1.0
    if base not in _FXR:
        s = base + "KRW=X"
        _last_prices([s])
        _FXR[base] = _PX.get(s)
    r = _FXR.get(base)
    return r / div if r else None


def est_weights(x):
    hs = x.get("holdings") or []
    if not hs or not any(h.get("w") is None and h.get("sh") for h in hs) or any(h.get("w") for h in hs):
        x["holdings"] = hs[:40]
        return x
    rows = []
    for h in hs:
        nm = h["name"]
        if SKIP.search(nm):
            continue
        if CASH.search(nm):
            cur = "USD" if re.search(r"USD|달러", nm, re.I) else "KRW"
            rows.append((h, None, cur))
            continue
        rows.append((h, resolve(nm, h.get("code", "")), None))
    syms = [s for _, s, _ in rows if s]
    _last_prices(syms + [s.replace(".KS", ".KQ") for s in syms if s.endswith(".KS")])
    val, miss = {}, []
    for h, s, cur in rows:
        if cur:                                   # 현금: 주식 수 칸 = 금액
            f = fx_krw(cur)
            if f:
                val[id(h)] = h["sh"] * f
            continue
        p = _PX.get(s) if s else None
        if s and p is None and s.endswith(".KS"):
            s = s[:-3] + ".KQ"; p = _PX.get(s)
        f = fx_krw(CUR_BY_SUF.get(_suf(s), "USD")) if s else None
        if p and f:
            val[id(h)] = h["sh"] * p * f
            h["ysym"] = s
        else:
            miss.append(h["name"])
    stocks = [h for h, s, cur in rows if not cur]
    got = sum(1 for h in stocks if id(h) in val)
    if not stocks or got < max(3, 0.85 * len(stocks)):
        print(f"  비중 추정 포기 {x.get('sym')} {got}/{len(stocks)} 못 찾음 {miss[:5]}", flush=True)
        x["holdings"] = hs[:40]
        return x
    tot = sum(val.values())
    out = []
    for h in hs:
        if id(h) in val:
            h2 = dict(h, w=round(val[id(h)] / tot * 100, 2), est=1)
            out.append(h2)
    out.sort(key=lambda h: -h["w"])
    x["holdings"], x["w_est"] = out[:40], {"miss": miss[:10], "got": got, "of": len(stocks)}
    x["n_hold"] = x.get("n_hold") or len(hs)
    print(f"  비중 추정 {x.get('sym')} {got}/{len(stocks)} 1위 {out[0]['name']} {out[0]['w']}%", flush=True)
    return x


# ── 미국 ETF ──────────────────────────────────────────────────

_TR = {}


def tr(t):
    from onepager.data import translate_ko
    if not t:
        return ""
    if t not in _TR:
        try:
            _TR[t] = translate_ko(t[:1500]) or t
        except Exception:
            _TR[t] = t
    return _TR[t]


def sa_holdings(sym, names_ko):
    """stockanalysis.com 구성종목 표 (채권·레버리지·원자재 ETF 처럼 야후에 없는 것)"""
    try:
        t = get(f"https://stockanalysis.com/etf/{sym.lower()}/holdings/", UA_D, raw=True, timeout=30)
    except Exception:
        return []
    m = re.search(r"<table.*?</table>", t, re.S)
    if not m:
        return []
    out = []
    for row in re.findall(r"<tr.*?</tr>", m.group(0), re.S)[1:]:
        cells = [re.sub(r"\s+", " ", re.sub(r"<[^>]+>", " ", c)).strip() for c in re.findall(r"<td.*?</td>", row, re.S)]
        if len(cells) < 4:
            continue
        tk, nm, w = cells[1], cells[2], cells[3]
        try:
            w = float(w.replace("%", "").replace(",", ""))
        except ValueError:
            continue
        tk = "" if tk in ("n/a", "-", "") else tk.replace(".", "-")
        out.append({"code": tk, "name": names_ko.get(tk) or nm, "w": round(w, 2)})
        if len(out) >= 25:
            break
    time.sleep(0.6)
    return out


def us_etf(sym, name, names_ko):
    import yfinance as yf
    t = yf.Ticker(sym)
    info = {}
    try:
        info = t.info or {}
    except Exception:
        pass
    x = {"name": names_ko.get(sym) or info.get("longName") or name, "name_en": info.get("longName") or name,
         "cur": info.get("currency") or "USD", "mkt": "US", "issuer": info.get("fundFamily") or ""}
    fd = t.funds_data
    desc = ""
    try:
        desc = fd.description or ""
    except Exception:
        pass
    desc = desc or info.get("longBusinessSummary") or ""
    x["desc"] = tr(desc)
    m = re.search(r"(?:track|replicate|correspond to)[^.]*?(?:the\s+)?([A-Z][\w&.\- ]{3,60}?Index)", desc)
    x["index"] = m.group(1).strip() if m else ""
    cat = info.get("category") or ""
    try:
        cat = cat or fd.fund_overview.get("categoryName") or ""
    except Exception:
        pass
    x["category"] = tr(cat) if cat else ""
    er = info.get("netExpenseRatio")
    if er is None:
        try:
            er = fd.fund_operations.loc["Annual Report Expense Ratio", sym] * 100
        except Exception:
            er = None
    x["fee"] = round(float(er), 3) if er is not None else None
    x["aum"] = info.get("totalAssets")
    y = info.get("yield") or info.get("dividendYield")
    x["div_yield"] = round(y * 100, 2) if (y and y < 1) else y
    inc = info.get("fundInceptionDate")
    if inc:
        try:
            x["listed"] = dt.datetime.utcfromtimestamp(inc).strftime("%Y.%m.%d")
        except Exception:
            pass
    x["r3y"] = info.get("threeYearAverageReturn")
    hs = []
    try:
        th = fd.top_holdings
        for s, row in th.iterrows():
            nm = names_ko.get(s) or row.get("Name") or s
            hs.append({"code": str(s), "name": str(nm), "w": round(float(row.get("Holding Percent") or 0) * 100, 2)})
    except Exception:
        pass
    if not hs:
        hs = sa_holdings(sym, names_ko)
        if hs:
            x["hold_src"] = "stockanalysis.com"
    x["holdings"] = hs
    try:
        x["sectors"] = [{"k": k, "w": round(v * 100, 2)} for k, v in (fd.sector_weightings or {}).items() if v]
    except Exception:
        x["sectors"] = []
    try:
        x["assets"] = [{"k": k, "w": round(v * 100, 2)} for k, v in (fd.asset_classes or {}).items() if v]
    except Exception:
        x["assets"] = []
    return x


def _alarm(*_):
    raise TimeoutError()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--list", action="store_true")
    ap.add_argument("--dest", default="opdata")
    ap.add_argument("--shard", type=int, default=0)
    ap.add_argument("--of", type=int, default=1)
    ap.add_argument("--etfs", default="etf_list.json")
    ap.add_argument("--names", default="names_ko.json")
    ap.add_argument("--fx", default="fx.json")
    ap.add_argument("--out", default="out")
    ap.add_argument("--max", type=int, default=0)
    ap.add_argument("--kr-redo", default="", help="x/ 폴더: 전체 구성종목(n_hold) 없는 한국 ETF만 다시")
    ap.add_argument("--us-redo", default="", help="x/ 폴더: 비중 있는 구성종목이 없는 미국 ETF만 다시")
    ap.add_argument("--sleep", type=float, default=0.4)
    a = ap.parse_args()
    if a.list:
        return build_list(a.dest)
    from onepager.etf import render_etf
    from onepager.render import CSS
    etfs = [r for r in json.load(open(a.etfs, encoding="utf-8")) if fnv(r[0]) % a.of == a.shard]
    if a.kr_redo:
        def need(sym):
            f = os.path.join(a.kr_redo, fname(sym) + ".json")
            return not os.path.exists(f) or not json.load(open(f, encoding="utf-8")).get("n_hold")
        etfs = [r for r in etfs if r[2] == "KR" and need(r[0])]
    if a.us_redo:
        def need_us(sym):
            f = os.path.join(a.us_redo, fname(sym) + ".json")
            if not os.path.exists(f):
                return True
            return not any(h.get("w") for h in (json.load(open(f, encoding="utf-8")).get("holdings") or []))
        etfs = [r for r in etfs if r[2] == "US" and need_us(r[0])]
    if a.max:
        etfs = etfs[: a.max]
    names = json.load(open(a.names, encoding="utf-8")) if os.path.exists(a.names) else {}
    fx = json.load(open(a.fx)) if os.path.exists(a.fx) else None
    print(f"shard {a.shard}: ETF {len(etfs)}개", flush=True)
    px = prices([r[0] for r in etfs])
    print("가격", len(px), flush=True)
    for d in ("s", "x"):
        os.makedirs(os.path.join(a.out, d), exist_ok=True)
    meta, ok, bad = {}, 0, 0
    signal.signal(signal.SIGALRM, _alarm)
    today = dt.date.today().isoformat()
    for i, (sym, name, mkt) in enumerate(etfs):
        if time.time() - START > BUDGET:
            break
        try:
            signal.alarm(90)
            x = kr_etf(sym, name) if mkt == "KR" else us_etf(sym, name, names)
            signal.alarm(0)
            if mkt == "KR":
                x["sym"] = sym
                signal.alarm(240)
                try:
                    x = est_weights(x)
                except Exception as e:                # 추정이 실패해도 리포트는 주식 수로 그대로
                    print("  비중 추정 실패", sym, repr(e)[:120], flush=True)
                    x["holdings"] = (x.get("holdings") or [])[:40]
                signal.alarm(0)
            p = px.get(sym) or {}
            x.update({k: p[k] for k in ("price", "w52_lo", "w52_hi", "price_history") if k in p})
            rets = dict(p.get("ret") or {})
            if mkt == "KR" and x.get("returns"):
                rets.update({k: v for k, v in x["returns"].items() if v is not None})
            if x.get("r3y") is not None:
                rets["3년(연)"] = round(x["r3y"] * 100, 2)
            order = ["1개월", "3개월", "6개월", "올해", "1년", "3년(연)"]
            x["returns"] = {k: rets[k] for k in order if rets.get(k) is not None}
            x["sym"], x["as_of"] = sym, today
            html = render_etf(x, fx).replace("<style></style>", "<style></style>")
            with open(os.path.join(a.out, "s", fname(sym) + ".html"), "w", encoding="utf-8") as f:
                f.write(html)
            with open(os.path.join(a.out, "x", fname(sym) + ".json"), "w", encoding="utf-8") as f:
                json.dump(x, f, ensure_ascii=False, separators=(",", ":"))
            meta[sym] = [x["name"], mkt, today, x.get("name_en") or name]
            ok += 1
            time.sleep(a.sleep if mkt == "KR" else 0.2)
        except Exception as e:
            signal.alarm(0)
            bad += 1
            if bad < 8:
                print("실패", sym, repr(e)[:200], flush=True)
            if "Too Many" in str(e) or "429" in str(e):
                time.sleep(60)
        if i % 50 == 0:
            print(f"  {i}/{len(etfs)} 성공 {ok} 실패 {bad} ({time.time() - START:.0f}s)", flush=True)
    json.dump(meta, open(os.path.join(a.out, f"etfmeta_{a.shard}.json"), "w", encoding="utf-8"), ensure_ascii=False)
    print("끝", ok, bad, flush=True)
    _ = CSS


if __name__ == "__main__":
    main()
