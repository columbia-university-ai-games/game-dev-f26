# Source lineage and reuse

The engine is adapted from [Blzut3/CatacombSDL at
473d13629a2350e2498dd4a158e5bd0b36184160](https://github.com/Blzut3/CatacombSDL/tree/473d13629a2350e2498dd4a158e5bd0b36184160).
Original source notices and the project's [COPYING](../COPYING) are retained.
This folder's game code is GPL-2.0-or-later according to its source notices;
the course root's license does not replace those terms. The upstream README
attribution is retained at the end of this project's README.

Reused: original C rules, object definitions, rendering, sound and input
routines, plus the SDL port. The student did not write these from scratch.
The [native change patch](evidence/upstream-native-changes.patch), relative to
the pinned public revision, makes inherited-versus-added code inspectable
without access to the historical private development repository.

Added for the course: agent protocol/bridge, headless stepped lifecycle,
single-level boundaries, developer tools isolated from normal sessions,
Python PNG/process adapter, browser transport, visual baseline, model host,
evaluation accounting, prepared-start adapter, tests, prompts and documentation.
Corrected existing-platform issues: Windows binary resource loading, startup
argument parsing and the warp-number parser's missing termination. The rule
map distinguishes original rules from deliberately chosen adapter behavior.

The October 21 situation checkpoint changes the Python evaluator and delivery
support; it does not alter C gameplay, maps, original assets or the baseline
and model prompt. Native prepared starts use only ordinary action prefixes.

The original `.CA2` art, sound and level data are separate from the code license.
They are not included in Git, archives or this PR; see
[ASSET_PROVENANCE.md](ASSET_PROVENANCE.md). Local possession and public download
availability do not establish redistribution permission. No third-party
credentials or private browser access links belong in the submitted evidence.

Development milestones predate the course-folder import. The declaration commit
`b68a641` and historical `docs/evidence/` records preserve that sequence; the
course checkpoint record identifies the actual exported source revision.
