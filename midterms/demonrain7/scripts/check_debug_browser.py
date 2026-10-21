"""Exercise the developer panel in headless Chromium. Read the private URL from stdin."""
import json
from pathlib import Path
import sys
from playwright.sync_api import expect, sync_playwright

url = sys.stdin.readline().strip()
root = Path(__file__).resolve().parents[1]
out = root / "runs/debug-browser-check"
out.mkdir(parents=True, exist_ok=True)
report = {"checks": [], "errors": []}

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    context = browser.new_context(viewport={"width": 1440, "height": 1100}, accept_downloads=True)
    page = context.new_page()
    page.on("pageerror", lambda error: report["errors"].append(str(error)))
    page.on("dialog", lambda dialog: dialog.accept())

    def ready():
        expect(page.locator("#debug-fields")).to_have_js_property("disabled", False, timeout=20000)

    def apply(selector):
        with page.expect_response(lambda r: r.url.endswith("/api/debug") and r.request.method == "POST") as response:
            page.locator(selector).click()
        result = response.value.json()
        assert response.value.ok, result
        ready()
        return result["state"]

    def close_game(target):
        target.evaluate("async () => { if (session) { pause(); while (busy) await new Promise(r=>setTimeout(r,20)); await api('/api/close',{session}); session=null; } }")

    try:
        page.goto(url, wait_until="networkidle")
        expect(page.locator("#debug-button")).to_be_visible()
        page.locator("#debug-button").click()
        expect(page.locator("#debug-fields")).to_have_js_property("disabled", True)
        page.locator("#debug-enable").click()
        expect(page.locator("#dp-hp")).to_have_value("13", timeout=20000)
        ready()
        assert page.locator("#game-status").inner_text() == "Paused"
        initial = page.evaluate("api('/api/debug?session='+session)")["state"]
        ticks = page.locator("#tick-count").inner_text()

        for key, value in {"hp": 50, "keys": 7, "potions": 8, "bolts": 9, "nukes": 10, "score": 12345, "god": 1}.items():
            page.locator("#dp-" + key).fill(str(value))
        state = apply('#debug-player-form button[type="submit"]')
        assert (state["player"]["hp"], state["player"]["keys"], state["player"]["god"]) == (50, 7, 1)
        assert page.locator("#tick-count").inner_text() == ticks
        report["checks"].append("Player HP, inventory, score and invulnerability apply without advancing time")

        for key in ("enemies", "shots"):
            page.locator("#debug-freeze-" + key).check()
        page.locator("#debug-noclip").check()
        state = apply('#debug-flags-form button[type="submit"]')
        assert list(state["flags"].values()) == [1, 1, 1]
        page.locator("#debug-class").select_option("2")
        for key, value in {"speed": 200, "hp": 22, "damage": 9, "points": 333}.items():
            page.locator("#dc-" + key).fill(str(value))
        page.locator("#debug-apply-hp").check()
        state = apply('#debug-class-form button[type="submit"]')
        assert next(c for c in state["classes"] if c["id"] == 2)["damage"] == 9
        assert all(o["hp"] == 22 for o in state["objects"] if o["class"] == 2)
        report["checks"].append("Freeze/noclip flags and enemy class damage, speed, HP and points apply")

        for x, y in ((20, 20), (21, 20), (20, 21), (21, 21)):
            page.locator("#debug-tile-x").fill(str(x))
            page.locator("#debug-tile-y").fill(str(y))
            page.locator("#debug-tile-kind").select_option("128")
            state = apply('#debug-tile-form button[type="submit"]')
            assert state["map"][y][x] == 128
        before = {o["id"] for o in state["objects"]}
        page.locator("#debug-spawn-x").fill("20")
        page.locator("#debug-spawn-y").fill("20")
        state = apply('#debug-spawn-form button[type="submit"]')
        spawned = next(o for o in state["objects"] if o["id"] not in before)
        page.locator("#debug-object").select_option(str(spawned["id"]))
        page.locator("#do-hp").fill("17")
        state = apply("#debug-object-apply")
        assert next(o for o in state["objects"] if o["id"] == spawned["id"])["hp"] == 17
        state = apply("#debug-remove")
        assert spawned["id"] not in {o["id"] for o in state["objects"]}
        report["checks"].append("Tile editing, spawn, individual object editing and removal work in the native game")

        page.locator("#debug-map").scroll_into_view_if_needed()
        box = page.locator("#debug-map").bounding_box()
        page.mouse.click(box["x"] + box["width"] * 8.5 / 64, box["y"] + box["height"] * 8.5 / 64)
        expect(page.locator("#debug-tile-x")).to_have_value("8")
        state = apply("#debug-teleport")
        assert (state["player"]["x"], state["player"]["y"]) == (8, 8)
        page.locator("#debug-step-direction").select_option("north")
        page.locator("#debug-step").click()
        expect(page.locator("#debug-message")).to_contain_text("Advanced 4 ticks")
        ready()
        assert page.locator("#tick-count").inner_text() == "5 ticks"
        report["checks"].append("Map click selects coordinates; teleport and a four-tick step work while paused")

        with page.expect_download() as download:
            page.locator("#debug-export").click()
        download.value.save_as(str(out / "exported-parameters.json"))
        ready()
        preset = json.loads((out / "exported-parameters.json").read_text())
        assert preset["player"]["hp"] == 50
        preset["player"]["hp"] = 42
        page.locator("#debug-import-file").set_input_files({"name": "modified.json", "mimeType": "application/json", "buffer": json.dumps(preset).encode()})
        expect(page.locator("#debug-message")).to_contain_text("Preset imported", timeout=20000)
        expect(page.locator("#dp-hp")).to_have_value("42")
        state = apply("#debug-defaults")
        assert state["classes"] == initial["classes"] and state["flags"] == initial["flags"]
        assert state["player"]["god"] == 0
        report["checks"].append("Parameter export/import round-trips; defaults restore original class values and flags")
        page.locator("#debug-panel").screenshot(path=str(out / "desktop-debug.png"))

        page.locator("#debug-normal").click()
        expect(page.locator("#debug-mode-label")).to_have_text("Normal mode", timeout=20000)
        expect(page.locator("#debug-fields")).to_have_js_property("disabled", True)
        status = page.evaluate("async () => (await fetch('/api/debug?session='+session,{headers:{Authorization:'Bearer '+token}})).status")
        assert status == 403
        report["checks"].append("Returning to normal starts a fresh game, disables editing and rejects debug access with HTTP 403")
        close_game(page)

        page.locator("#debug-level").select_option("30")
        page.locator("#debug-enable").click()
        expect(page.locator("#level-heading")).to_contain_text("LEVEL 30", timeout=20000)
        ready()
        assert page.evaluate("api('/api/debug?session='+session)")["state"]["level"] == 30
        close_game(page)
        report["checks"].append("Level 30 loads from the original resources through the level selector")

        mobile = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        phone = mobile.new_page()
        phone.on("pageerror", lambda error: report["errors"].append(str(error)))
        phone.goto(url, wait_until="networkidle")
        phone.locator("#debug-button").click()
        phone.locator("#debug-enable").click()
        expect(phone.locator("#dp-hp")).to_have_value("13", timeout=20000)
        assert phone.evaluate("document.documentElement.scrollWidth <= innerWidth")
        phone.locator("#debug-panel").screenshot(path=str(out / "mobile-debug.png"))
        close_game(phone)
        mobile.close()
        report["checks"].append("390px mobile debug layout has no horizontal overflow")
    finally:
        if not page.is_closed():
            try:
                close_game(page)
            except Exception:
                pass
        context.close()
        browser.close()
        (out / "report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")

print(json.dumps(report, ensure_ascii=False, indent=2))
if report["errors"]:
    raise SystemExit(1)
