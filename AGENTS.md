# Student starter

This is the Python starter for AI in Practice: Game Design and Development,
COMS E6998 section 014, Fall 2026. The teacher repo's syllabus sets the course
requirements. Any language and engine is allowed for course projects; this
Python/Pyxel example is optional. Cloudflare is the taught publishing/AI-worker
path; other platforms require instructor permission. This original demonstration is not an Infocom adaptation.

- Preserve user work. Keep changes small enough for the student to explain.
- Game code owns state. Models receive observations and return validated
  proposals or narration; they do not directly change inventory or progress.
- Run `python -m unittest discover -s tests -v` for deterministic tests.
  Run `python -m course_game.setup_check --offline --headless` for local
  diagnostics; offline success is partial Setup Verification.
- A live call requires an explicit provider choice and configured credentials.
  The reference supports vertex, anthropic and openai; only Vertex needs
  Google project/location and authentication. One live provider suffices.
  Runtime model choice and development-assistant choice are independent.
  Do not spend cloud credits during routine code review. Never silently
  substitute a fixture for a live evaluation.
- Asana owns tasks, dependencies, acceptance criteria, weekly PPP and gate
  decisions. Link tasks to GitHub PRs and CI. GitHub owns code and releases;
  no duplicate GitHub Issues/Projects backlog is required.
- The student always acts as Executive Producer and Creative Director,
  retaining accountability for GDF Owner roles. By course end, agents cover
  every game-development role with executable configuration and evidence. An agent cannot approve a gate,
  merge a PR or change course deadlines on the student's behalf.
- The midterm reconstructs a classic and includes an agent that plays it.
  Infocom is a sample set; other classic titles and genres are encouraged.
  Keep development tools separate from the player's observation/action
  interface (`course_game/player_interface.py`). The starter narrator is
  not a player; the episode runner and baseline come in Sessions 4 and 5.
- To change a rule, legal action, observation or outcome, follow
  `.claude/skills/rule-change/SKILL.md`: map row in
  `docs/rule-source-map.md`, failing test first, then the engine. Hand the
  summary to the independent reviewer (`.claude/agents/rules-reviewer.md`);
  never review or approve your own change.
- Never put secrets or personal playtester data in code, prompts, task text,
  recordings or reports. Model settings and artifact references belong in
  `agent-config.json`; runtime model identifiers belong in evaluation reports.
