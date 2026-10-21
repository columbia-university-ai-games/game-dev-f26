"""Screenshot-only frontier exploration and combat baseline.

Palette thresholds were calibrated on visible opening screenshots. No resource,
map, source, debug, coordinate or acceptance-route file is read by this policy.
SPDX-License-Identifier: GPL-2.0-or-later
"""
from collections import Counter, deque
from dataclasses import dataclass
from io import BytesIO
import random

from PIL import Image
from catacomb_env import Action

MOVES = {"north": (0, -1), "east": (1, 0), "south": (0, 1), "west": (-1, 0)}


@dataclass
class View:
    walkable: list
    health: float
    charge: float
    threats: int


def perceive(png):
    with Image.open(BytesIO(png)) as original:
        if original.size != (320, 200):
            raise ValueError("Expected the public 320x200 frame")
        image = original.convert("RGB")
    pixels = image.load()
    walkable = []
    threats = 0
    for y in range(24):
        row = []
        for x in range(24):
            colors = Counter(pixels[x * 8 + dx, y * 8 + dy] for dy in range(8) for dx in range(8))
            floor = colors[(0, 170, 0)] + colors[(85, 255, 85)]
            row.append(floor >= 8 and colors[(255, 85, 255)] < 32)
            # Red creature pixels in the local neighborhood; exclude the HUD.
            if 7 <= x <= 16 and 7 <= y <= 16:
                threats += colors[(170, 0, 0)] + colors[(255, 85, 85)]
        walkable.append(row)
    # The player's own sprite must not become an obstacle in its occupancy grid.
    for y in (11, 12):
        for x in (11, 12):
            walkable[y][x] = True
    health = sum(pixels[x, 131] == (255, 85, 255) for x in range(202, 304)) / 102
    charge = sum(pixels[x, 107] != (0, 0, 0) for x in range(202, 304)) / 102
    return View(walkable, health, charge, threats)


class VisualBaseline:
    def __init__(self, seed=101):
        self.rng = random.Random(seed)
        self.known = {}
        self.visits = Counter()
        self.position = (0, 0)
        self.previous = None
        self.last_action = None
        self.stuck = 0
        self.turn = 0
        self.potion_cooldown = 0
        self.nuke_cooldown = 0

    def _motion(self, current):
        if self.previous is None or self.last_action.direction not in MOVES:
            return (0, 0)
        dx, dy = MOVES[self.last_action.direction]
        candidates = []
        for distance in range(self.last_action.ticks // 2 + 1):
            sx, sy = dx * distance, dy * distance
            mismatch = comparisons = 0
            for y in range(2, 22):
                for x in range(2, 22):
                    if 8 <= x <= 15 and 8 <= y <= 15:
                        continue
                    ox, oy = x + sx, y + sy
                    if not (0 <= ox < 24 and 0 <= oy < 24):
                        continue
                    mismatch += self.previous[oy][ox] != current[y][x]
                    comparisons += 1
            candidates.append((mismatch / max(1, comparisons), distance, sx, sy))
        # Ambiguous all-floor views conservatively prefer no inferred movement.
        _, _, sx, sy = min(candidates)
        return sx, sy

    def _direction(self, view):
        grid = view.walkable
        dx, dy = self._motion(grid)
        self.position = (self.position[0] + dx, self.position[1] + dy)
        self.stuck = self.stuck + 1 if self.previous is not None and (dx, dy) == (0, 0) else 0
        px, py = self.position
        self.visits[self.position] += 1
        for y in range(24):
            for x in range(24):
                self.known[(px + x - 11, py + y - 11)] = grid[y][x]
        queue = deque([(11, 11, None, 0)])
        seen = {(11, 11)}
        candidates = []
        ordering = list(MOVES)
        self.rng.shuffle(ordering)
        while queue:
            x, y, first, distance = queue.popleft()
            if first:
                world = (px + x - 11, py + y - 11)
                frontier = any((world[0] + a, world[1] + b) not in self.known
                               for a, b in ((0, 3), (3, 0), (0, -3), (-3, 0)))
                score = 40 * frontier - 8 * self.visits[world] - distance * 0.2
                if self.stuck > 1 and first == self.last_action.direction:
                    score -= 20
                candidates.append((score, self.rng.random(), first))
            for direction in ordering:
                a, b = MOVES[direction]
                nx, ny = x + a, y + b
                if (nx, ny) in seen or not (0 <= nx < 23 and 0 <= ny < 23):
                    continue
                if not all(grid[ny + oy][nx + ox] for oy in (0, 1) for ox in (0, 1)):
                    continue
                seen.add((nx, ny))
                queue.append((nx, ny, first or direction, distance + 1))
        self.previous = grid
        return max(candidates)[2] if candidates else self.rng.choice(ordering)

    def decide(self, observation):
        view = perceive(observation.png)
        direction = self._direction(view)
        self.turn += 1
        self.potion_cooldown = max(0, self.potion_cooldown - 1)
        self.nuke_cooldown = max(0, self.nuke_cooldown - 1)
        potion = view.health < 0.45 and not self.potion_cooldown
        nuke = view.threats >= 20 and not self.nuke_cooldown and not potion
        if potion:
            self.potion_cooldown = 8
        if nuke:
            self.nuke_cooldown = 12
        action = Action(direction=direction, fire=(view.charge < 0.9 and self.turn % 5 != 0),
                        potion=bool(potion), nuke=bool(nuke), ticks=8)
        self.last_action = action
        return action, "Explore visible passages; release charged shots and react to visible health/threats."
