"""🧭 세부 섹터 (10/11 사용자: "나침반에 나오는 모든 섹터들을 좀 더 세분화 … 다 반영까지")
  큰 섹터 11개(야후 기준)를 업종(industry)으로 나눠 30개 「세부 섹터」로 — 나침반(compass.py)·장중 나침반(live.py·live_world.py)이 같이 쓴다.
  key 는 영어 짧은 이름(앱 색·클릭 연결용), p = 큰 섹터(색 계열), 업종 표에 없으면 큰 섹터 이름 그대로 「기타」로.
"""
SUB = [
    # key, 아이콘, 이름, 큰 섹터, 업종들(한글 industry_ko 또는 영어 industry 일부)
    ("semi", "🔲", "반도체", "Technology", ["반도체", "반도체 장비·소재", "Semiconductor"]),
    ("soft", "💾", "소프트웨어·IT서비스", "Technology", ["응용 소프트웨어", "인프라 소프트웨어", "IT 서비스", "Software", "Information Technology Services"]),
    ("hw", "🔌", "전자부품·하드웨어", "Technology", ["전자부품", "컴퓨터 하드웨어", "통신장비", "과학·계측기기", "가전·전자기기", "전자제품 및 컴퓨터 유통",
                                              "Electronic Components", "Computer Hardware", "Communication Equipment", "Scientific", "Consumer Electronics", "Electronics & Computer Distribution"]),
    ("bio", "🧬", "바이오", "Healthcare", ["바이오", "Biotechnology"]),
    ("pharma", "💊", "제약", "Healthcare", ["제약 (스페셜티·제네릭)", "제약 (대형)", "제약 소매업체", "Drug Manufacturers", "Pharmaceutical Retailers"]),
    ("medtech", "🩺", "의료기기·서비스", "Healthcare", ["의료기기", "의료 기구·소모품", "의료기관", "진단·연구", "건강 정보 서비스", "의료 유통", "건강보험",
                                                "Medical", "Diagnostics", "Health Information", "Healthcare Plans"]),
    ("defense", "🛡️", "방산·항공우주", "Industrials", ["항공우주·방산", "Aerospace"]),
    ("power_eq", "⚡", "전력장비", "Industrials", ["전기장비·부품", "Electrical Equipment"]),
    ("machine", "⚙️", "기계·중장비", "Industrials", ["산업기계", "농기계·중장비", "공구", "금속 제조", "환경설비", "Specialty Industrial Machinery",
                                             "Farm & Heavy", "Tools", "Metal Fabrication", "Pollution"]),
    ("build", "🏗️", "건설·건자재", "Industrials", ["건설·엔지니어링", "건축 제품 및 장비", "건축자재", "주거용 건축", "Engineering & Construction",
                                              "Building Products", "Building Materials", "Residential Construction"]),
    ("transport", "🚢", "운송·물류", "Industrials", ["물류", "해운", "철도", "항공사", "육상운송", "공항 및 항공 서비스", "인프라 운영", "Integrated Freight",
                                             "Marine Shipping", "Railroads", "Airlines", "Trucking", "Airports", "Infrastructure Operations"]),
    ("biz", "🏢", "산업 서비스·지주", "Industrials", ["전문 비즈니스 서비스", "지주·복합기업", "폐기물 처리", "인력·채용 서비스", "보안 서비스", "컨설팅",
                                                "임대 및 임대 서비스", "산업재 유통", "비즈니스 장비 및 용품", "비즈니스 장비 및 소모품", "교육",
                                                "Specialty Business", "Conglomerates", "Waste", "Staffing", "Security", "Consulting", "Rental",
                                                "Industrial Distribution", "Business Equipment", "Education"]),
    ("bank", "🏦", "은행", "Financial Services", ["지역은행", "대형은행", "모기지 금융", "Banks", "Mortgage Finance"]),
    ("broker", "📈", "증권·자산운용·카드", "Financial Services", ["자산운용", "증권·자본시장", "금융정보·거래소", "금융 대기업", "신용·결제",
                                                         "Asset Management", "Capital Markets", "Financial Data", "Financial Conglomerates", "Credit Services"]),
    ("insure", "☂️", "보험", "Financial Services", ["손해보험", "생명보험", "보험 중개인", "종합보험", "보험 - 전문 분야", "보험 - 재보험", "Insurance"]),
    ("auto", "🚗", "자동차·부품", "Consumer Cyclical", ["자동차 부품", "자동차", "자동차 판매", "레저용 차량", "Auto", "Recreational Vehicles"]),
    ("retail", "🛍️", "유통·온라인·생활", "Consumer Cyclical", ["전문 소매", "온라인 유통", "백화점", "의류 유통", "주택 개조 소매", "가구·가전", "포장",
                                                       "식료품점", "할인점", "Specialty Retail", "Internet Retail", "Department Stores", "Apparel Retail",
                                                       "Home Improvement", "Furnishings", "Packaging", "Grocery", "Discount"]),
    ("fashion", "👜", "의류·명품", "Consumer Cyclical", ["의류 제조", "섬유제조", "신발·잡화", "명품", "Apparel Manufacturing", "Textile", "Footwear", "Luxury"]),
    ("leisure", "✈️", "여행·레저·외식", "Consumer Cyclical", ["외식", "레저", "숙박", "여행 서비스", "리조트·카지노", "게임·도박", "개인 서비스",
                                                    "Restaurants", "Leisure", "Lodging", "Travel", "Resorts", "Gambling", "Personal Services"]),
    ("internet", "🌐", "인터넷·게임", "Communication Services", ["인터넷 콘텐츠·정보", "게임·멀티미디어", "Internet Content", "Electronic Gaming"]),
    ("media", "🎬", "미디어·엔터", "Communication Services", ["광고", "엔터테인먼트", "출판", "방송", "Advertising", "Entertainment", "Publishing", "Broadcasting"]),
    ("telecom", "📡", "통신", "Communication Services", ["통신 서비스", "Telecom"]),
    ("util", "💡", "전력·가스(유틸리티)", "Utilities", ["전력", "가스", "유틸리티 - 규제된 물", "유틸리티 - 독립 전력 생산자", "유틸리티 - 다양화", "Utilities - Regulated",
                                                    "Utilities - Independent", "Utilities - Diversified"]),
    ("renew", "☀️", "신재생·태양광", "Utilities", ["신재생 에너지", "태양광", "Renewable", "Solar"]),
    ("chem", "⚗️", "화학·소재", "Basic Materials", ["특수화학", "화학", "농업자재", "제지", "목재 및 목재 생산", "Specialty Chemicals", "Chemicals",
                                                "Agricultural Inputs", "Paper", "Lumber"]),
    ("steel", "🔩", "철강·비철금속", "Basic Materials", ["철강", "산업금속·광업", "알루미늄", "구리", "원료탄", "Steel", "Other Industrial Metals", "Aluminum",
                                                 "Copper", "Coking Coal"]),
    ("gold", "🥇", "금·귀금속", "Basic Materials", ["금광", "은광", "기타 귀금속 및 광업", "Gold", "Silver", "Other Precious"]),
    ("food", "🍜", "음식료·생활용품", "Consumer Defensive", ["가공식품", "생활용품", "농산물", "식품유통", "주류", "음료", "제과", "맥주", "담배",
                                                     "Packaged Foods", "Household", "Farm Products", "Food Distribution", "Beverages", "Confectioners", "Tobacco"]),
    ("energy", "🛢️", "에너지(석유·가스)", "Energy", ["석유·가스 탐사생산", "유전 장비·서비스", "정유", "석유·가스 수송", "열탄", "종합 석유", "우라늄", "석유 및 가스 시추",
                                                 "Oil & Gas", "Thermal Coal", "Uranium"]),
    ("realty", "🏘️", "부동산·리츠", "Real Estate", ["부동산", "REIT", "리츠", "Real Estate"]),
]
PARENT_KO = {"Technology": "IT·기술", "Healthcare": "헬스케어", "Industrials": "산업재", "Financial Services": "금융", "Consumer Cyclical": "경기소비재",
             "Communication Services": "통신·미디어", "Utilities": "유틸리티", "Basic Materials": "소재", "Consumer Defensive": "필수소비재",
             "Energy": "에너지", "Real Estate": "부동산"}
SKIP = ("스팩", "SPAC", "Shell Companies")
_EXACT = {}
for _k, _ic, _nm, _p, _inds in SUB:
    for _i in _inds:
        _EXACT[_i] = (_k, _ic, _nm, _p)
META = {k: {"icon": ic, "name": nm, "p": p} for k, ic, nm, p, _ in SUB}


def sub_of(sector, industry):
    """(큰 섹터, 업종) → (key, 아이콘, 이름, 큰 섹터) · 스팩·빈 섹터는 None"""
    ind = (industry or "").strip()
    if not sector or any(s in ind for s in SKIP):
        return None
    if ind in _EXACT and _EXACT[ind][3] == sector:
        return _EXACT[ind]
    for k, ic, nm, p, inds in SUB:                 # 영어 업종 이름 일부 일치 (예: "Drug Manufacturers - General")
        if p == sector and any(w and w in ind for w in inds):
            return (k, ic, nm, p)
    if ind in _EXACT:                              # 큰 섹터가 달라도 업종이 분명하면 업종을 따름
        return _EXACT[ind]
    pk = PARENT_KO.get(sector)
    if not pk:
        return None
    return ("other_" + sector.split()[0].lower(), "▫️", pk + " 기타", sector)
