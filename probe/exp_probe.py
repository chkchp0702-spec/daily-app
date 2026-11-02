# 🎲 #54 한국 열흘 수출 자료 주소 찾기 (임시)
import requests, re
H={"User-Agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36"}
U=[
 "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2891&bbsId=1362",
 "https://www.customs.go.kr/kcs/na/ntt/selectNttList.do?mi=2891&bbsId=1362&searchCnd=1&searchWrd=%EC%88%98%EC%B6%9C%EC%9E%85+%ED%98%84%ED%99%A9",
 "https://unipass.customs.go.kr/ets/index.do",
 "https://tradedata.go.kr/cts/index.do",
 "https://ecos.bok.or.kr/api/StatisticTableList/sample/json/kr/1/10/",
 "https://ecos.bok.or.kr/api/StatisticSearch/sample/json/kr/1/10/901Y011/M/202401/202610",
 "https://api.db.nomics.world/v22/series/IMF/DOT/M.KR.TXG_FOB_USD.W00?observations=1",
 "https://api.db.nomics.world/v22/series/OECD/MEI/KOR.XTEXVA01.CXMLSA.M?observations=1",
 "https://fred.stlouisfed.org/graph/fredgraph.csv?id=XTEXVA01KRM667S",
 "https://stat.kita.net/stat/kts/sum/SumImpExpTotalList.screen",
 "https://www.index.go.kr/unity/potal/main/EachDtlPageDetail.do?idx_cd=1066",
 "https://kosis.kr/statHtml/statHtml.do?orgId=134&tblId=DT_134001_001",
]
for u in U:
    try:
        r=requests.get(u,headers=H,timeout=25)
        t=r.text
        print("==",r.status_code,len(t),u)
        s=re.sub(r"<[^>]+>"," ",t); s=re.sub(r"\s+"," ",s)
        # 수출 관련 문장
        hits=re.findall(r".{0,60}(?:수출|export|EXPORT|observations).{0,80}",s)[:6]
        print(s[:300] if not hits else "\n".join(hits))
    except Exception as e:
        print("== ERR",u,repr(e)[:150])
