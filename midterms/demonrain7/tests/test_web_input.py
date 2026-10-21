"""Browser input regressions with a deliberately blocked action response.

All game API calls are intercepted: these tests never control a real user's game.
Requires Playwright and a local web server (CATACOMB_WEB_URL, default port 8765).
"""
import asyncio
import json
import os
import unittest
from urllib.parse import urlsplit

from playwright.async_api import async_playwright

# A tiny valid PNG is sufficient; this suite checks delivery, not game rules.
PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jFJkAAAAASUVORK5CYII="
URL = os.environ.get("CATACOMB_WEB_URL", "http://127.0.0.1:8765")


class WebInputTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        self.playwright = await async_playwright().start()
        self.browser = await self.playwright.chromium.launch(headless=True)
        self.context = await self.browser.new_context()
        self.page = await self.context.new_page()
        self.actions = []
        self.ticks = 1
        self.sequence = 0
        self.first_request = asyncio.Event()
        self.release = asyncio.Event()
        self.errors = []
        self.page.on("pageerror", lambda error: self.errors.append(str(error)))
        await self.page.route("**/api/**", self.api)
        await self.page.goto(URL + "/#access=input-regression-test-not-a-real-access-key")
        await self.page.locator("#start-button").click()
        await asyncio.wait_for(self.first_request.wait(), timeout=5)

    async def asyncTearDown(self):
        self.release.set()
        await self.context.close()
        await self.browser.close()
        await self.playwright.stop()

    def snapshot(self):
        return {"sequence": self.sequence, "status": "running", "ticks": self.ticks,
                "width": 320, "height": 200, "png": PNG}

    async def api(self, route):
        path = urlsplit(route.request.url).path
        body = {}
        if path == "/api/info":
            body = {"game": "test fixture"}
        elif path == "/api/start":
            body = {"session": "isolated-browser-fixture", **self.snapshot()}
        elif path == "/api/action":
            payload = route.request.post_data_json
            self.actions.append(payload["action"])
            if len(self.actions) == 1:
                self.first_request.set()
                await self.release.wait()
            self.ticks += payload["action"]["ticks"]
            self.sequence = payload["sequence"]
            body = self.snapshot()
        elif path == "/api/observation":
            body = self.snapshot()
        elif path == "/api/close":
            body = {"closed": True}
        await route.fulfill(status=200, content_type="application/json", body=json.dumps(body))

    async def wait_until(self, predicate, seconds=4):
        deadline = asyncio.get_running_loop().time() + seconds
        while not predicate() and asyncio.get_running_loop().time() < deadline:
            await asyncio.sleep(0.02)
        self.assertTrue(predicate(), self.actions)
        self.assertFalse(self.errors)

    async def test_quick_wasd_taps_survive_an_in_flight_request(self):
        for key in ("w", "a", "s", "d"):
            await self.page.keyboard.press(key, delay=15)
        self.assertEqual(len(self.actions), 1, "Only one request may be in flight")
        self.release.set()
        await self.wait_until(lambda: len([a for a in self.actions if a["direction"] != "none"]) >= 4)
        moves = [a["direction"] for a in self.actions if a["direction"] != "none"]
        self.assertEqual(moves[:4], ["north", "west", "south", "east"])

    async def test_two_short_fire_taps_preserve_both_releases(self):
        await self.page.keyboard.press("j", delay=15)
        await self.page.keyboard.press("j", delay=15)
        self.release.set()
        await self.wait_until(lambda: len(self.actions) >= 5)
        self.assertEqual([a["fire"] for a in self.actions[1:5]], [True, False, True, False])

    async def test_released_direction_does_not_stick(self):
        await self.page.keyboard.press("s", delay=15)
        self.release.set()
        await self.wait_until(lambda: len(self.actions) >= 5)
        self.assertEqual(sum(a["direction"] == "south" for a in self.actions), 1)
        self.assertEqual(self.actions[-1]["direction"], "none")

    async def test_holding_continues_and_release_stops(self):
        await self.page.keyboard.down("s")
        self.release.set()
        await self.wait_until(lambda: sum(a["direction"] == "south" for a in self.actions) >= 3)
        await self.page.keyboard.up("s")
        count = len(self.actions)
        await self.wait_until(lambda: len(self.actions) >= count + 3)
        self.assertEqual([a["direction"] for a in self.actions[-2:]], ["none", "none"])

    async def test_blur_clears_unsent_taps(self):
        await self.page.keyboard.press("s", delay=15)
        await self.page.evaluate("window.dispatchEvent(new Event('blur'))")
        self.release.set()
        await asyncio.sleep(0.15)
        await self.page.locator("#pause-button").click()
        await self.wait_until(lambda: len(self.actions) >= 3)
        self.assertTrue(all(a["direction"] == "none" for a in self.actions), self.actions)

    async def test_screen_button_tap_is_buffered(self):
        await self.page.locator('[data-hold="south"]').click(delay=15)
        self.release.set()
        await self.wait_until(lambda: any(a["direction"] == "south" for a in self.actions))


if __name__ == "__main__":
    unittest.main(verbosity=2)
