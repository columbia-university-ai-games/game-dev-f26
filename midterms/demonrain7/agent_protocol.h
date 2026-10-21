/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef CATACOMB_AGENT_PROTOCOL_H
#define CATACOMB_AGENT_PROTOCOL_H

enum { AGENT_MAX_TICKS_PER_ACTION = 32, AGENT_COMMAND_BYTES = 256 };
typedef enum { AGENT_INVALID, AGENT_OBSERVE, AGENT_STEP, AGENT_QUIT } AgentCommandKind;
typedef struct {
    int direction; /* Original dirtype: N,E,S,W,NE,SE,SW,NW,none = 0..8. */
    int fire, strafe;
    int potion, bolt, nuke; /* At most one consumable per action. */
    int ticks;
} AgentAction;
AgentCommandKind AgentParseCommand(const char *line, AgentAction *out);
#endif
