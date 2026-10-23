# Echo Fishery — original design specification v0.1

The student is Executive Producer / Creative Director. This document describes implemented design choices, not validated fun, user approval of a gate, or claims about commercial-game originality. Reference: the user-supplied `ECHO_FISHERY_CODEX_BRIEF.md` (2026-10-22). No commercial source or assets are used.

## Core loop and goal
Choose one bounded night (A coast/B reef/C pressure), locate fish through noisy sonar, place finite delayed sound sources, take a casting position, resolve a hooked fish through steady/strong/slack decisions, then bank cargo by explicitly returning to harbor. Two landed fish complete each mission; partial return scores delivered cargo, while sinking/expiry loses unbanked cargo. There is no empty-return success and no persistent economy.

## Space and time
100×70 continuous sea, harbor (12,54) radius5; public polygon reefs block swept boat/creature movement but do not block sound. Quiet/rush/evade move4/7/8 world units. Boat radius1.4; creatures use smaller navigation radii. Eight directions are input discretization, not a tile world. Every accepted action advances one tick. Pure reads and rejected actions are free in game time; the runner separately limits repeated invalid decisions/calls. Ended games reject actions. Human thinking/API/animation time never updates rules.

## Acoustic strategy
Weak/strong sonar ranges24/45 and strengths2.2/7. Scans snapshot the pre-reaction positions, with noisy position bounds; result arrives at the next observation. Old centers remain fixed; uncertainty grows0.7/tick and expires after9 ticks. Strong reveals species; weak only a fish-school clue. Active beacons are planted at the current boat position, start now or after2 ticks, last7 active ticks, with inventory3. Chime/drone strengths3/5. Fish preferences overlap: silver-bell favors chime and flees loud sound; reefback favors drone and tolerates loudness; glassfin flees lower noise. Strong detection can therefore disperse a prospective catch.

Predator hearing uses received strength / (1 + distance/12)^2 with sound-profile preference. Interest decays by0.72 each tick; a new signal must exceed both0.2 and1.35×remaining interest to switch. Fish also retain a sound target with0.72 decay and1.35 switching threshold (received-interest floor0.18, search-persistence floor0.08). The investigation target is the SOUND LOCATION; the boat's new location is not read to update that target. Near-distance sensing within8 is separately allowed. The predator follows a persistent patrol, investigates, searches, winds up, attacks and recovers. It does not teleport or consult mission progress. Exact preferences are design tuning, not real fish biology.

## Rod and fight
Cast checks the public 10-unit range/±45° cone and reef line; hidden occupancy does not affect whether the cast action is legal. Empty cast costs a tick. A nearby eligible fish bites deterministically; further fish movement and noise make old observations uncertain. Initial fight progress0/tension15/cue tired. The current cue resolves the submitted reel before the next cue is drawn from a seed/entity/tick-keyed source.

Steady adds20 progress and2/8/15 tension (tired/pulling/burst). Strong adds38 progress and14/25/40 tension, with louder sound. Slack loses5 progress and lowers tension28. Progress100 captures; tension100 breaks the line. Hooked fish struggle adds sound. Capture and even successful strong finishing still emits sound that tick. Waiting does not silently reel. A cut/evade abandons the current fish and moves8 atomically; existing cargo remains unbanked and vulnerable. No full-speed move while hooked.

## Danger and fairness
Within22, the public projection supplies an approximate wake bearing (near within12). This is an intentional, shared local sensor, not raw predator coordinates. Attack preparation within8 announces a fixed corridor, represented by a center segment and a ROUND-CAPPED radius (`Threat.width` is HALF-WIDTH). It resolves only after the next submitted action. The player may leave the announced corridor. The attack never homes after announcement. If still hooked when hit, the current fish is stolen instead of simultaneous hull damage; otherwise hull loses1. Recovery lasts2 ticks. Three hull points allow mistakes. Final return is processed before night expiry. Public terrain can create traps; ordinary warning/evade situations must be checked for a usable exit.

## Projection and equality
All runtime decisions use one core. Renderer/HUD/decision-relevant audio use only PublicObservation and public events. Progress/tension are the same numeric values for humans/models; attack corridor and public movement rules are also identical. Unseen creature meshes are never rendered. Ordinary water waves are cosmetic and do not reveal hidden positions. Local observation snapshots survive slow thinking; information lifetime uses ticks.

## Implemented scope and deferred validation
Three presets, one continuous bay, three fish behaviors, one predator, two beacon sounds, tutorial, settlement and restart are implementation targets. No multiplayer, QTE, engine physics, gear economy, generative content or reinforcement learning. A first playable build is not proof of fun. Human playtest, student acceptance and peer feedback remain explicitly pending until actually performed.

## Experiment
`eval/suite.json` was declared before first engine/prompt tuning. Development seeds101/202/303 are used for implementation; held-out711/823/947 must remain unused until version/config/prompt freeze. Baseline receives public history only and uses acoustic planning, reel/cut and safe return. Current-only and six-step-history model runs share the current instrument display. No memory benefit is assumed. Failed calls and fallbacks are counted and labeled. Live provider usage and unknown subscription cost are reported, never invented.
