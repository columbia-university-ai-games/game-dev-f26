# Sources, assets and reuse terms

Game concept/reference: the user's original Echo Fishery brief (2026-10-22). Original design choices are labeled `design` in docs/RULES-SOURCE-MAP.md. Commercial games mentioned in that brief are inspiration context only; no code, maps, UI, sounds, logos or imagery were copied.

The boat, terrain, sea, sonar/wake effects and sound synthesis are created in this project using code/procedural geometry. There are no remote image/font/audio dependencies. System fonts remain supplied by the player's operating system and are not redistributed.

Dependencies (exact resolved versions in package-lock.json): Three.js and TypeScript (MIT/Apache-2.0 respectively), Vite (MIT), tsx (MIT), DefinitelyTyped type definitions (MIT). Their license files remain in the installed packages; the Three.js MIT notice is in THIRD-PARTY-NOTICES.txt. Source of Three.js: https://github.com/mrdoob/three.js . Tooling is installed with npm ci, not vendored.

Course starter remains unchanged outside the student's folder and specified workflow. No credential, OAuth file, local API configuration or identifiable peer-playtester data belongs in the submission.
