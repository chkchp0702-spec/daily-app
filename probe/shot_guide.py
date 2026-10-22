"""🧒 꼬마 안내원 화면 확인용 스크린샷 (10/22) — 휴대폰 크기로 첫 방문 인사 카드 · 시장 탭 설명 카드를 찍어 probe/shots/ 에 남김"""
import os, time
from playwright.sync_api import sync_playwright
APP = "https://chkchp0702-spec.github.io/daily-app/"
os.makedirs("probe/shots", exist_ok=True)
errs = []
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="dark")
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(APP + "?t=" + str(int(time.time())), wait_until="networkidle", timeout=90000)
    pg.wait_for_timeout(6000)
    pg.screenshot(path="probe/shots/guide_intro.png")
    pg.click("#gdq .gd-x")
    pg.evaluate("go('market')")
    pg.wait_for_timeout(2500)
    pg.screenshot(path="probe/shots/guide_btn.png", clip={"x": 0, "y": 0, "width": 390, "height": 140})
    pg.click("#gdbtn")
    pg.wait_for_timeout(5000)
    pg.screenshot(path="probe/shots/guide_market.png")
    b.close()
open("probe/shots/errors.txt", "w").write("\n".join(errs) or "오류 없음")
print("errors:", errs)
