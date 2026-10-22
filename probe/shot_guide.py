"""🧒 꼬마 안내원 화면 확인 (10/22) — 휴대폰 크기 · 앱 곳곳의 ⓘ 가 꼬마 얼굴로 바뀌고 누르면 꼬마 말풍선이 뜨는지"""
import os, time
from playwright.sync_api import sync_playwright
APP = "https://chkchp0702-spec.github.io/daily-app/"
os.makedirs("probe/shots", exist_ok=True)
errs, log = [], []
def tryclick(pg, sel, name):
  try:
    el = pg.query_selector(sel)
    if not el:
        log.append(f"{name}: 없음 ({sel})"); return False
    if not el.is_visible():
        log.append(f"{name}: 안 보임"); return False
    el.scroll_into_view_if_needed(); pg.wait_for_timeout(300)
    el.click(); pg.wait_for_timeout(1800)
    ok = pg.query_selector("#gdq") is not None
    log.append(f"{name}: {'꼬마 뜸' if ok else '안 뜸'}")
    pg.screenshot(path=f"probe/shots/g_{name}.png")
    if ok: pg.evaluate("window.gdSay && document.getElementById('gdq') && document.getElementById('gdq').remove()")
    return ok
  except Exception as e:
    log.append(f"{name}: 오류 {str(e)[:160]}"); return False
with sync_playwright() as p:
    b = p.chromium.launch()
    pg = b.new_page(viewport={"width": 390, "height": 844}, device_scale_factor=2, color_scheme="light")
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(APP + "?t=" + str(int(time.time())), wait_until="domcontentloaded", timeout=90000)
    pg.wait_for_timeout(900)
    pg.screenshot(path="probe/shots/g_splash.png")
    pg.wait_for_timeout(1800)
    log.append("2.7초 뒤 인사 화면 %s" % ("남아 있음" if pg.query_selector("#kidsplash") else "사라짐"))
    pg.wait_for_timeout(4000)
    pg.evaluate("document.getElementById('gdq') && document.getElementById('gdq').remove()")
    pg.evaluate("go('sector')"); pg.wait_for_timeout(5000)
    log.append("sector 얼굴 수 %d" % pg.eval_on_selector_all(".gd-i", "x => x.length"))
    tryclick(pg, ".nt-b", "sector_note")
    tryclick(pg, "h3.tt-h", "sector_card")
    pg.evaluate("go('port')"); pg.wait_for_timeout(6000)
    log.append("port 얼굴 수 %d" % pg.eval_on_selector_all(".gd-i", "x => x.length"))
    tryclick(pg, ".td-n", "port_note")
    tryclick(pg, ".tt-i", "port_fold")
    tryclick(pg, "[data-tip]:not(svg *)", "port_tip")
    pg.evaluate("go('whale')"); pg.wait_for_timeout(5000)
    tryclick(pg, "h3.tt-h", "whale_card")
    b.close()
open("probe/shots/errors.txt", "w").write("\n".join(log + ["오류: " + (" | ".join(errs) or "없음")]))
print(log, errs)
