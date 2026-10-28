import os, sys, traceback
out=[]
def log(*a): s=" ".join(str(x) for x in a); print(s); out.append(s); sys.stdout.flush()
log("KRX_ID 있음:", bool(os.environ.get("KRX_ID")), "KRX_PW 있음:", bool(os.environ.get("KRX_PW")))
try:
    import pykrx; log("pykrx", getattr(pykrx, "__version__", "?"))
    from pykrx import stock
    df = stock.get_market_trading_value_by_date("20261001", "20261027", "005930", detail=True)
    log("삼성전자 투자자 상세 rows", len(df)); log(df.tail(3).to_string())
    df2 = stock.get_market_net_purchases_of_equities("20261027", "20261027", "KOSPI", "연기금")
    log("연기금 순매수 종목 rows", len(df2)); log(df2.head(5).to_string())
    df3 = stock.get_market_trading_value_by_date("20160104", "20160131", "005930", detail=True)
    log("2016 rows", len(df3))
except Exception as e:
    log("오류", type(e).__name__, str(e)[:300]); log(traceback.format_exc()[-1500:])
open("out/krx_probe.txt","w").write("\n".join(out))
