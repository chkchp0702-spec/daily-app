"""🛍️ 상품 — 미래에셋증권이 지금 파는 채권·펀드·ELS 를 모아 archive/x/products.json 으로
   (10/16 사용자: "어플에 새로운 카테고리 … 상품 … 국채 미국채 브라질국채 / 펀드, 사모펀드 / ELS … 미래에셋증권에서 판매하는 이것들을 정리")

자료 (모두 로그인 없이 보이는 미래에셋증권 홈페이지 공개 화면):
  ① 장외채권(원화)   /hks/hks4036/r01.do                      — 국고채·공사채·회사채·신종자본증권 매수금리·세후수익률
  ② 미국채·호주국채  게시판 categoryId=1282 / 2078 최신 「판매정보 안내」 — 판매 종목·시세(수익률), 10년 금리·환율
  ③ 브라질국채      외화채권 안내(/hks/hks4054/v03.do) — 판매 목록 없이 「단순중개」(MAPS·영업점). 환율은 야후 (원/달러 ÷ 헤알/달러)
     만기별 종목·금리: 브라질 재무부 Tesouro Direto 공개 JSON(/o/rentabilidade/investir) + Tesouro Transparente CSV(1년 금리)
  ④b 사모펀드 전체   금융투자협회 전자공시 「기준가격등락률」(공모/사모=사모) XML 서비스 — 1,300여 개. 기준가 1·3·6·12개월 전과 비교해 등락 계산
     (분배금·결산은 반영 못 함 → 화면에 그 설명). 판매사(미래에셋 여부)는 비공개.
  ④ 펀드            /search/getTotalSearch.jsp (펀드검색과 같은 검색) — 공모펀드 전부·기간 수익률·순자산
     사모펀드: 진짜 사모(전문투자자용)는 공개 화면에 없음 → 공개 판매되는 「사모투자재간접형」(사모펀드에 투자하는 공모펀드) 순위
  ⑤ ELS/DLS/ELB     /hks/hks4022/a01.json (청약중 · 최근 청약완료)
숫자는 받은 그대로 — 지어내지 않음. 못 받은 칸은 errors 에 남기고 지난 값을 유지.
"""
import datetime, html, json, os, re, sys, time
import requests

B = "https://securities.miraeasset.com"
OUT = os.path.join("archive", "x", "products.json")
KST = datetime.timezone(datetime.timedelta(hours=9))
S = requests.Session()
S.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128 Safari/537.36",
                  "Accept-Language": "ko-KR,ko;q=0.9"})
ERR = []


def get(path):
    for k in range(3):
        try:
            r = S.get(B + path, timeout=60); r.raise_for_status(); return r
        except Exception as e:
            last = e; time.sleep(3 + 3 * k)
    raise last


def post(path, data, **kw):
    for k in range(3):
        try:
            r = S.post(B + path, data=data, timeout=90, **kw); r.raise_for_status(); return r
        except Exception as e:
            last = e; time.sleep(3 + 3 * k)
    raise last


def strip(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()


def num(s):
    try:
        return float(str(s).replace(",", "").replace("%", "").strip())
    except Exception:
        return None


# ───────── ① 장외채권 ─────────
def bond_kind(n):
    if re.search(r"국고채|국민주택|재정증권|물가채", n): return "국채"
    if re.search(r"통안|한국은행", n): return "통안채"
    if re.search(r"조건부|신종|후순위|영구", n): return "신종·후순위"
    if re.search(r"공사|공단|공채|도시철도|지방채|은행채권|산업금융|중소기업은행|수출입|주택금융|예금보험|철도|수자원|토지주택|전력|가스", n): return "공사채·지방채"
    return "회사채"


def krw_bonds():
    t = get("/hks/hks4036/r01.do").text
    body = t[t.find('id="list"'):]
    rows = []
    for m in re.finditer(r'<tr class="[^"]*">(.*?)</tr>\s*<tr>(.*?)</tr>', body, re.S):
        a, b = m.group(1), m.group(2)
        td1 = re.findall(r"<td[^>]*>(.*?)</td>", a, re.S)
        td2 = re.findall(r"<td[^>]*>(.*?)</td>", b, re.S)
        if len(td1) < 6 or len(td2) < 3:
            continue
        nm_m = re.search(r'itemCode=([A-Z0-9]+)">([^<]+)</a>', td1[0])
        if not nm_m:
            continue
        risk = strip(re.search(r"<em>(.*?)</em>", td1[0]).group(1)) if "<em>" in td1[0] else ""
        name = strip(nm_m.group(2))
        rows.append({"code": nm_m.group(1), "name": name, "kind": bond_kind(name), "risk": risk,
                     "yrs": int(num(strip(td1[1])) or 0), "days": int(num(strip(td1[2])) or 0),
                     "issue": strip(td1[3]).replace(".", "-"), "buy": num(strip(td1[4])), "bank": num(strip(td1[5])), "after": num(strip(td1[6])) if len(td1) > 6 else None,
                     "mat": strip(td2[0]).replace(".", "-"), "px": num(strip(td2[1])), "pre": num(strip(td2[2]))})
    if not rows:
        raise RuntimeError("장외채권 표를 못 읽음")
    return rows


# ───────── ② 미국채·호주국채 ─────────
def board_sale(cat):
    t = get(f"/bbs/board/message/list.do?categoryId={cat}").text
    m = re.search(r"view\('(\d+)','(\d+)'\)[^>]*>\s*([^<]*판매정보[^<]*)", t)
    if not m:
        raise RuntimeError(f"게시판 {cat} 판매정보 글 없음")
    mid, no, title = m.group(1), m.group(2), strip(m.group(3))
    v = get(f"/bbs/board/message/view.do?messageId={mid}&messageNumber={no}&messageCategoryId=0&categoryId={cat}").text
    tx = strip(v)
    d = re.search(r"\((\d{4})/(\d{2})/(\d{2})\)", title)
    out = {"title": title, "date": f"{d.group(1)}-{d.group(2)}-{d.group(3)}" if d else None,
           "url": f"{B}/bbs/board/message/view.do?messageId={mid}&messageNumber={no}&messageCategoryId=0&categoryId={cat}", "items": []}
    k = re.search(r"국채 수익률\(10년\)\s*환율정보\s*전일\s*당일\s*전일\s*당일\s*([\d.]+)%?\s*([\d.]+)%?\s*([\d,.]+)\s*([\d,.]+)", tx)
    if k:
        out.update({"y10_prev": num(k.group(1)), "y10": num(k.group(2)), "fx_prev": num(k.group(3)), "fx": num(k.group(4))})
    rows = re.findall(r"<tr[^>]*>(.*?)</tr>", v, re.S)
    for r_ in rows:
        c = [strip(x) for x in re.findall(r"<t[dh][^>]*>(.*?)</t[dh]>", r_, re.S)]
        if len(c) >= 8 and re.search(r"국채$", c[0]) and re.match(r"\d{4}-\d{2}-\d{2}", c[5] or ""):
            out["items"].append({"kind": c[0], "name": c[1], "country": c[2], "cur": c[3], "issue": c[4], "mat": c[5],
                                 "cpn": num(c[6]), "ytm": num(c[7])})
    if not out["items"]:
        raise RuntimeError(f"게시판 {cat} 판매 종목 표를 못 읽음")
    return out


def bond_notices():
    t = get("/bbs/board/message/list.do?categoryId=1860").text
    out = []
    for m in re.finditer(r"view\('(\d+)','(\d+)'\)[^>]*>\s*([^<]{3,160})", t):
        title = strip(m.group(3))
        dm = re.findall(r"(\d{4}-\d{2}-\d{2})", t[max(0, m.start() - 400):m.start()])
        dm = dm[-1] if dm else None
        out.append({"title": title, "date": dm,
                    "url": f"{B}/bbs/board/message/view.do?messageId={m.group(1)}&messageNumber={m.group(2)}&messageCategoryId=0&categoryId=1860"})
    return out[:15]


def fx_hist(sym):
    """야후 환율 1년 (브라질 헤알 등) — [[날짜, 값]]"""
    try:
        import yfinance as yf
        h = yf.download(sym, period="1y", interval="1d", progress=False, auto_adjust=False)
        c = h["Close"].dropna()
        if hasattr(c, "columns"):
            c = c.iloc[:, 0]
        return [[d.strftime("%Y-%m-%d"), round(float(v), 4)] for d, v in c.items()]
    except Exception as e:
        ERR.append(f"{sym} 환율: {e}")
        return []


# ───────── ④ 펀드 ─────────
F_KEEP = {"FDN": "n", "ADMICN": "co", "ZRN_BTYPN": "t", "ZRN_STYPN": "st", "PD_RSK_CLSS": "rk", "HAN_CLAS_NM": "cls",
          "WK1_BNFR": "w1", "M1_BNFR": "m1", "M3_BNFR": "m3", "M6_BNFR": "m6", "M12_BNFR": "y1", "M36_BNFR": "y3", "M60_BNFR": "y5",
          "TFEE": "fee", "SLE_FEE": "sfee", "BSSP_ADPTD": "d", "ESTD": "est", "DUP_DOC_CNT": "nc", "N_BY_YN": "buy", "DMS_FO_DV_CD": "area"}


def funds():
    r = post("/search/getTotalSearch.jsp", {"query": "", "sort": "M3_BNFR", "sort_opt": "DESC", "startCount": "0", "listCount": "3000", "HIGH_RSK_YN": ""})
    t = r.text; t = t[t.index("{"):]
    docs = [d["Field"] for d in json.loads(t)["SearchQueryResult"]["Collection"][0]["DocumentSet"]["Document"]]
    out = []
    for d in docs:
        x = {"c": d.get("DOCID")}
        for k, v in F_KEEP.items():
            val = d.get(k)
            if k.endswith("BNFR") or k in ("TFEE", "SLE_FEE"):
                val = num(val)
                if val is not None and val <= -999:
                    val = None
            x[v] = val
        x["aum"] = round(num(d.get("NASST_SUM")) / 1e8, 1) if num(d.get("NASST_SUM")) else None    # 억원
        x["rk"] = int(x["rk"]) - 10 if x.get("rk") and str(x["rk"]).isdigit() and int(x["rk"]) > 10 else None   # 11→1등급(매우높은위험) … 16→6등급
        x["pv"] = "사모투자재간접" in (x["n"] or "")
        x["est"] = (x.get("est") or "")[:8]
        out.append(x)
    if len(out) < 200:
        raise RuntimeError(f"펀드가 너무 적음 {len(out)}")
    return out


# ───────── ⑤ ELS/DLS/ELB ─────────
TCD = {"1": "ELS", "2": "DLS", "3": "ELB", "4": "DLB"}
UA = {"K2001": "KOSPI200", "NII@NI225": "Nikkei225", "HSI@HSCE": "HSCEI", "SPI@SPX": "S&P500", "STX@SX5E": "EuroStoxx50"}


def els(prgs):
    rows, nk = [], ""
    for _ in range(8):
        r = post("/hks/hks4022/a01.json", {"omkt_drvs_tcd": "0", "dlbr_term_yn": "0", "itm_nm": "", "prgs_scd": prgs, "qry_sort_tp": "0", "qry_sort_sqn": "0", "next_key": nk},
                 headers={"X-Requested-With": "XMLHttpRequest", "Referer": B + "/hks/hks4023/n01_1.do"})
        j = r.json(); rows += j.get("grid01") or []
        if j.get("continueYn") != "1" or len(rows) >= 120:
            break
        nk = (j.get("cts") or [{}])[0].get("next_key", "")
    dt = lambda s: f"{s[:4]}-{s[4:6]}-{s[6:8]}" if s and len(s) == 8 else None
    out = []
    for g in rows:
        out.append({"isin": g.get("itm_no"), "n": g.get("itm_nm"), "t": TCD.get(g.get("omkt_drvs_tcd"), g.get("omkt_drvs_tcd")),
                    "kind": g.get("omkt_drvs_pcd_nm"), "desc": g.get("omkt_drv_desc_cn"), "ua": g.get("uast_cn"),
                    "cpn": num(g.get("omkt_drv_frcs_ern_r")), "loss": num(g.get("max_abl_los_r")), "ki": num(g.get("lwrk_bar_rt")) or None,
                    "pp": num(g.get("pca_grte_r")), "mat": g.get("omkt_drv_exrt_cycl_cn"), "cyc": g.get("omkt_drv_rpy_cycl_cn"),
                    "s": dt(g.get("apy_strt_dt")), "e": dt(g.get("apy_end_dt")), "dl_e": dt(g.get("dlbr_obj_apy_end_dt")) if g.get("dlbr_istu_obj_itm_yn") == "Y" else None,
                    "hi": g.get("hlv_fn_ivst_pd_yn") == "1", "monthly": g.get("munt_cpn_pd_yn") == "1",
                    "amt": round((num(g.get("apy_a")) or 0) / 1e8, 2), "lim": round((num(g.get("ofr_lmt_a")) or 0) / 1e8, 1), "cr": num(g.get("cpt_r")),
                    "risk": g.get("omkt_drvs_risk_gcd"), "cur": g.get("curr_cd"), "online": g.get("onln_apy_abl_yn") == "1",
                    "st": g.get("prgs_stat_nm"), "days": num(g.get("rmnd_dys"))})
    return out


def indiv():
    """개인투자용국채 (미래에셋증권 단독 판매대행) — 이번 달 청약 조건. 공개 json 이 없으면 오류로 남김"""
    out = {}
    for path, data in (("/hks/hks4046/a01.json", {"next_term_tcd": "", "next_bd_intp_tcd": "", "next_itm_no": ""}),
                       ("/hks/hks4046/a06.json", {"pbff_pcd": "08", "apy_fin_tcd": "12"})):
        r = post(path, data, headers={"X-Requested-With": "XMLHttpRequest", "Referer": B + "/hks/hks4046/v01.do"})
        try:
            out[path.split("/")[-1]] = r.json()
        except Exception:
            out[path.split("/")[-1]] = r.text[:500]
    return out


# ───────── ③ 브라질국채 (브라질 재무부 Tesouro Direto — 공개 JSON·CSV) ─────────
TD_KIND = {"Tesouro Prefixado com Juros Semestrais": ("NTN-F", "이표채(6개월마다 이자)"), "Tesouro Prefixado": ("LTN", "할인채(만기에 한 번)"),
           "Tesouro IPCA+ com Juros Semestrais": ("NTN-B", "물가채(IPCA+ · 6개월 이자)"), "Tesouro IPCA+": ("NTN-B Principal", "물가채(IPCA+ · 만기 한 번)"),
           "Tesouro Selic": ("LFT", "변동금리(Selic 연동)")}


def tesouro():
    r = get_url("https://www.tesourodireto.com.br/o/rentabilidade/investir")
    j = r.json()
    out = []
    for grp, lst in j.items():
        for b in lst or []:
            nm = b.get("treasuryBondName") or ""
            base = next((k for k in sorted(TD_KIND, key=len, reverse=True) if nm.startswith(k)), None)
            if not base:
                continue
            rate = b.get("investmentProfitabilityIndexerName") or ""
            m = re.search(r"([\d.,]+)\s*%", rate)
            out.append({"n": nm, "code": TD_KIND[base][0], "kind": TD_KIND[base][1], "base": base, "mat": (b.get("maturityDate") or "")[:10],
                        "rate": rate, "r": float(m.group(1).replace(".", "").replace(",", ".")) if m else None,
                        "px": b.get("unitaryInvestmentValue"), "min": b.get("investmentBondMinimumValue"), "isin": b.get("isinCode"),
                        "asof": (b.get("lastMarketPricingDate") or "")[:16].replace("T", " "), "semi": "Juros Semestrais" in nm})
    if not out:
        raise RuntimeError("Tesouro 목록 비어 있음")
    out.sort(key=lambda x: x["mat"])
    return out


def tesouro_hist():
    """1년 금리 흐름 — Tesouro Transparente CSV (최신이 위, 400일 안까지만 읽음)"""
    import csv, io
    r = S.get("https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80c9-2d9e30b405c1/download/PrecoTaxaTesouroDireto.csv", timeout=180, stream=True)
    r.raise_for_status()
    lim = (datetime.date.today() - datetime.timedelta(days=400))
    want = {"Tesouro Prefixado", "Tesouro Prefixado com Juros Semestrais", "Tesouro IPCA+ com Juros Semestrais"}
    out = {}
    buf = ""
    for chunk in r.iter_content(65536, decode_unicode=False):
        buf += chunk.decode("utf-8", "ignore")
        lines = buf.split("\n"); buf = lines.pop()
        stop = False
        for ln in lines:
            c = ln.strip().split(";")
            if len(c) < 5 or c[0] == "Tipo Titulo":
                continue
            try:
                d = datetime.datetime.strptime(c[2], "%d/%m/%Y").date()
            except Exception:
                continue
            if d < lim:
                stop = True; break
            if c[0] in want:
                key = c[0] + "|" + c[1][-4:]
                out.setdefault(key, {})[d.isoformat()] = float(c[3].replace(",", "."))
        if stop:
            break
    # 만기별로 가장 긴 것 하나씩만 (차트 3개): 할인채 · 이표채 · 물가채
    pick = {}
    for key, ser in out.items():
        typ, yr = key.split("|")
        if len(ser) < 100:
            continue
        if typ not in pick or yr > pick[typ][0]:
            pick[typ] = (yr, ser)
    return {TD_KIND[t][0] + " " + yr: [[d, v] for d, v in sorted(ser.items())] for t, (yr, ser) in pick.items()}


def get_url(u):
    for k in range(3):
        try:
            r = S.get(u, timeout=60); r.raise_for_status(); return r
        except Exception as e:
            last = e; time.sleep(3 + 3 * k)
    raise last


# ───────── ④b 사모펀드 전체 (금융투자협회 전자공시 — 기준가격등락률, 공모/사모 구분 = 사모) ─────────
KOFIA = "https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/"


def kofia_q(d):
    body = ('<?xml version="1.0" encoding="utf-8"?><message><proframeHeader><pfmAppName>FS-DIS2</pfmAppName><pfmSvcName>DISFundStdPrcRateSO</pfmSvcName>'
            '<pfmFnName>select</pfmFnName></proframeHeader><systemHeader></systemHeader><DISCondFuncDTO>'
            f'<tmpV30>{d}</tmpV30><tmpV3></tmpV3><tmpV4></tmpV4><tmpV5></tmpV5><tmpV7>2</tmpV7><tmpV11></tmpV11><tmpV12></tmpV12><tmpV50></tmpV50><tmpV51></tmpV51>'
            '</DISCondFuncDTO></message>')
    r = S.post(KOFIA, data=body.encode("utf-8"), headers={"Content-Type": "text/xml", "Accept": "text/xml", "Referer": "https://dis.kofia.or.kr/websquare/index.jsp"}, timeout=180)
    r.raise_for_status()
    t = r.text
    g = lambda rec, k: (re.search(rf"<{k}>(.*?)</{k}>", rec) or [None, ""])[1]
    out = {}
    for rec in re.findall(r"<selectMeta>(.*?)</selectMeta>", t, re.S):
        c = g(rec, "tmpV13")
        if not c:
            continue
        out[c] = {"co": html.unescape(g(rec, "tmpV1")), "n": html.unescape(g(rec, "tmpV2")), "t": g(rec, "tmpV3"), "est": g(rec, "tmpV4"),
                  "amt": num(g(rec, "tmpV5")), "nav": num(g(rec, "tmpV6")), "d1": num(g(rec, "tmpV8")), "w1": num(g(rec, "tmpV10")), "m0": num(g(rec, "tmpV12"))}
    return out


def kofia_date(d0):
    """그 날짜(또는 그 전 영업일) 중 자료가 있는 날"""
    for k in range(7):
        d = d0 - datetime.timedelta(days=k)
        if d.weekday() >= 5:
            continue
        rows = kofia_q(d.strftime("%Y%m%d"))
        if len(rows) > 100:
            return d, rows
    raise RuntimeError(f"금투협 사모 자료 없음 {d0}")


def private_funds():
    S.get("https://dis.kofia.or.kr/", timeout=30)
    today = datetime.datetime.now(KST).date()
    d0, now = kofia_date(today)
    snaps = {}
    for key, back in (("m1", 31), ("m3", 92), ("m6", 183), ("y1", 365)):
        try:
            d, rows = kofia_date(d0 - datetime.timedelta(days=back))
            snaps[key] = (d.isoformat(), rows)
        except Exception as e:
            ERR.append(f"사모 {key}: {e}")
    out = []
    for c, x in now.items():
        row = {"c": c, "co": x["co"], "n": x["n"], "t": x["t"], "est": x["est"], "amt": round((x["amt"] or 0) / 100, 1), "nav": x["nav"], "d1": x["d1"], "w1": x["w1"], "m0": x["m0"]}
        for key, (d, rows) in snaps.items():
            p = rows.get(c)
            row[key] = round((x["nav"] / p["nav"] - 1) * 100, 2) if p and p["nav"] and x["nav"] and p["nav"] > 0 and x["nav"] > 0 else None
        row["tr"] = bool(re.search(r"2종|3종|손익차등", x["n"]))     # 손익차등형 후순위(2종)은 레버리지 — 순위에서 따로
        out.append(row)
    return {"asof": d0.isoformat(), "dates": {k: v[0] for k, v in snaps.items()}, "n": len(out), "items": out}


def main():
    old = {}
    try:
        old = json.load(open(OUT, encoding="utf-8"))
    except Exception:
        pass
    P = {"updated": datetime.datetime.now(KST).strftime("%Y-%m-%d %H:%M"), "src": B, "errors": []}
    try:
        S.get(B + "/", timeout=30)
    except Exception as e:
        ERR.append(f"첫 화면: {e}")

    def run(key, fn, *a):
        try:
            P[key] = fn(*a)
            print("✓", key, len(P[key]) if isinstance(P[key], list) else len(P[key].get("items", [])))
        except Exception as e:
            ERR.append(f"{key}: {str(e)[:200]}")
            P[key] = old.get(key)
            print("✗", key, e)
    run("krw", krw_bonds)
    run("ust", board_sale, "1282")
    run("aud", board_sale, "2078")
    run("notice", bond_notices)
    run("funds", funds)
    run("els", els, "01")
    run("els_done", els, "02")
    run("td", tesouro)
    run("td_hist", tesouro_hist)
    run("pv", private_funds)
    if isinstance(P.get("els_done"), list):
        P["els_done"] = P["els_done"][:60]
    # 헤알/원 = (원/달러) ÷ (헤알/달러) — 야후 BRLKRW=X 는 하루치만 줘서 두 환율로 계산
    P["ust_hist"] = {"y10": fx_hist("^TNX"), "usdkrw": fx_hist("KRW=X")}
    if not P["ust_hist"]["y10"] and old.get("ust_hist"):
        P["ust_hist"] = old["ust_hist"]
    ub, uk = dict(fx_hist("BRL=X")), dict(P["ust_hist"]["usdkrw"])
    P["brl"] = {"fx": [[d, round(uk[d] / ub[d], 2)] for d in sorted(set(ub) & set(uk)) if ub[d]], "usdbrl": [[d, ub[d]] for d in sorted(ub)]}
    if not P["brl"]["fx"] and old.get("brl"):
        P["brl"] = old["brl"]
    P["errors"] = ERR
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    json.dump(P, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    print("errors:", ERR)


if __name__ == "__main__":
    if len(sys.argv) > 1:
        OUT = sys.argv[1]
    main()
