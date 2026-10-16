"""🛍️ 상품 — 미래에셋증권이 지금 파는 채권·펀드·ELS 를 모아 archive/x/products.json 으로
   (10/16 사용자: "어플에 새로운 카테고리 … 상품 … 국채 미국채 브라질국채 / 펀드, 사모펀드 / ELS … 미래에셋증권에서 판매하는 이것들을 정리")

자료 (모두 로그인 없이 보이는 미래에셋증권 홈페이지 공개 화면):
  ① 장외채권(원화)   /hks/hks4036/r01.do                      — 국고채·공사채·회사채·신종자본증권 매수금리·세후수익률
  ② 미국채·호주국채  게시판 categoryId=1282 / 2078 최신 「판매정보 안내」 — 판매 종목·시세(수익률), 10년 금리·환율
  ③ 브라질국채      외화채권 안내(/hks/hks4054/v03.do) — 판매 목록 없이 「단순중개」(MAPS·영업점). 환율은 야후 BRLKRW=X
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
    if isinstance(P.get("els_done"), list):
        P["els_done"] = P["els_done"][:60]
    # 헤알/원 = (원/달러) ÷ (헤알/달러) — 야후 BRLKRW=X 는 하루치만 줘서 두 환율로 계산
    ub, uk = dict(fx_hist("BRL=X")), dict(P["ust_hist"]["usdkrw"])
    P["ust_hist"] = {"y10": fx_hist("^TNX"), "usdkrw": [[d, v] for d, v in fx_hist("KRW=X")]}
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
