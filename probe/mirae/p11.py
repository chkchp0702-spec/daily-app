import requests, os, json, re, time
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128", "Content-Type": "text/xml", "Accept": "text/xml", "Referer": "https://dis.kofia.or.kr/websquare/index.jsp"})
S.get("https://dis.kofia.or.kr/", timeout=30)
def q(svc, dto, fields):
    body = f'<?xml version="1.0" encoding="utf-8"?><message><proframeHeader><pfmAppName>FS-DIS2</pfmAppName><pfmSvcName>{svc}</pfmSvcName><pfmFnName>select</pfmFnName></proframeHeader><systemHeader></systemHeader><{dto}>' + "".join(f"<{k}>{v}</{k}>" for k, v in fields.items()) + f'</{dto}></message>'
    r = S.post("https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/", data=body.encode("utf-8"), timeout=180)
    return r
log = {}
for name, f in [("pv_all", {"tmpV30": "20261016", "tmpV3": "", "tmpV4": "", "tmpV5": "", "tmpV7": "2", "tmpV11": "", "tmpV12": "", "tmpV50": "", "tmpV51": ""}),
                ("pv_1015", {"tmpV30": "20261015", "tmpV3": "", "tmpV4": "", "tmpV5": "", "tmpV7": "2", "tmpV11": "", "tmpV12": "", "tmpV50": "", "tmpV51": ""}),
                ("pub_timefolio", {"tmpV30": "20261015", "tmpV3": "", "tmpV4": "", "tmpV5": "", "tmpV7": "", "tmpV11": "", "tmpV12": "타임폴리오", "tmpV50": "", "tmpV51": ""})]:
    t0 = time.time(); r = q("DISFundStdPrcRateSO", "DISCondFuncDTO", f)
    log[name] = [r.status_code, len(r.text), round(time.time() - t0, 1), re.search(r"dbio_total_count_>(\d+)", r.text).group(1) if "dbio_total_count_" in r.text else None]
    open(f"{OUT}/{name}.xml", "w").write(r.text)
json.dump(log, open(f"{OUT}/p11log.json", "w"), indent=1)
