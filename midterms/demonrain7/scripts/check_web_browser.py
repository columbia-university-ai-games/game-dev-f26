"""Headless browser smoke checks. URL is read from stdin, never saved in artifacts."""
import json
from pathlib import Path
import sys
from playwright.sync_api import expect, sync_playwright

url = sys.stdin.readline().strip()
root = Path(__file__).resolve().parents[1]
out = root / "runs/web-browser-check"
out.mkdir(parents=True, exist_ok=True)
report = {"checks": [], "errors": []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1120}, device_scale_factor=1)
    page = context.new_page()
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    page.goto(url, wait_until="networkidle")
    expect(page.locator("#start-button")).to_be_enabled()
    assert "#access" not in page.url
    report["checks"].append("Access key accepted and removed from address bar")
    page.screenshot(path=str(out / "desktop-entry.png"), full_page=True)
    page.get_by_role("button", name="Enter level 1").click()
    expect(page.locator("#tick-count")).not_to_have_text("0 ticks")
    page.locator("#game-frame").wait_for(state="visible")
    page.keyboard.down("ArrowDown")
    page.wait_for_timeout(900)
    page.keyboard.up("ArrowDown")
    page.keyboard.down("j")
    page.wait_for_timeout(900)
    page.keyboard.up("j")
    page.wait_for_timeout(300)
    page.locator("#pause-button").click()
    page.wait_for_timeout(500)
    before = page.locator("#tick-count").inner_text()
    page.wait_for_timeout(500)
    assert page.locator("#tick-count").inner_text() == before
    assert page.locator("#game-status").inner_text() == "Paused"
    report["checks"].append("Keyboard movement and charge/release send actions; pause stops simulation")
    page.screenshot(path=str(out / "desktop-game.png"), full_page=True)
    page.locator("#pause-button").click()
    page.wait_for_timeout(300)
    page.keyboard.down("ArrowRight")
    page.evaluate("window.dispatchEvent(new Event('blur'))")
    page.keyboard.up("ArrowRight")
    page.wait_for_timeout(400)
    assert page.locator("#game-status").inner_text() == "Paused"
    report["checks"].append("Losing focus pauses and releases held controls")
    page.on("dialog", lambda dialog: dialog.accept())
    page.locator("#restart-button").click()
    expect(page.locator("#game-status")).to_have_text("Playing")
    page.locator("#pause-button").click()
    report["checks"].append("Restart closes the old game and loads a fresh level")
    # Explicitly close before the mobile run; no real desktop interaction occurs.
    page.goto("about:blank")
    page.wait_for_timeout(300)
    mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    phone = mobile.new_page()
    phone.on("pageerror", lambda error: report["errors"].append(str(error)))
    phone.goto(url, wait_until="networkidle")
    phone.get_by_role("button", name="Enter level 1").click()
    phone.locator("#game-frame").wait_for(state="visible")
    button = phone.locator('[data-hold="south"]')
    box = button.bounding_box()
    touch = phone.context.new_cdp_session(phone)
    touch.send("Input.dispatchTouchEvent", {"type": "touchStart", "touchPoints": [{"x": box["x"] + box["width"] / 2, "y": box["y"] + box["height"] / 2}]})
    phone.wait_for_timeout(500)
    touch.send("Input.dispatchTouchEvent", {"type": "touchEnd", "touchPoints": []})
    phone.locator("#pause-button").click()
    phone.wait_for_timeout(300)
    assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth")
    phone.screenshot(path=str(out / "mobile-game.png"), full_page=True)
    report["checks"].append("Mobile layout has no horizontal overflow")
    phone.goto("about:blank")
    phone.wait_for_timeout(300)
    mobile.close()
    context.close()
    browser.close()

(out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps(report, ensure_ascii=False, indent=2))
if report["errors"]:
    raise SystemExit(1)
