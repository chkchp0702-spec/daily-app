import requests, os, json, re, time
OUT = "probe/mirae/out"; os.makedirs(OUT, exist_ok=True)
S = requests.Session(); S.headers.update({"User-Agent": "Mozilla/5.0 Chrome/128"})
S.get("https://dis.kofia.or.kr/", timeout=30)
r = S.get("https://dis.kofia.or.kr/wq/fundann/inc/DISFundSaleStdPrcRate.xml", timeout=60); open(f"{OUT}/DISFundSaleStdPrcRate.xml", "w").write(r.text)
H = {"Content-Type": "text/xml", "Accept": "text/xml", "Referer": "https://dis.kofia.or.kr/websquare/index.jsp"}
def q(svc, fn, dto, fields):
    body = f'<?xml version="1.0" encoding="utf-8"?><message><proframeHeader><pfmAppName>FS-DIS2</pfmAppName><pfmSvcName>{svc}</pfmSvcName><pfmFnName>{fn}</pfmFnName></proframeHeader><systemHeader></systemHeader><{dto}>' + "".join(f"<{k}>{v}</{k}>" for k, v in fields.items()) + f'</{dto}></message>'
    return S.post("https://dis.kofia.or.kr/proframeWeb/XMLSERVICES/", data=body.encode("utf-8"), headers=H, timeout=180)
r = q("DISComOutputMetaSO", "selectMetaInfo", "DISComMetaDataDTO", {"serviceId": "SDIS01004003000"}); open(f"{OUT}/meta_rate.xml", "w").write(r.text)
r = q("DISComOutputMetaSO", "selectMetaInfo", "DISComMetaDataDTO", {"serviceId": "SDIS01013007000"}); open(f"{OUT}/meta_salerate.xml", "w").write(r.text)
# 판매사 목록
r = q("DISMngCompInqSO", "select", "DISMngCompInqListDTO", {"option": "S", "standardDt": "20261015"}); open(f"{OUT}/salecomp.xml", "w").write(r.text)
