/* SPDX-License-Identifier: GPL-2.0-or-later */
#include "agent_protocol.h"
#include <ctype.h>
#include <string.h>

static void skip_space(const char **cursor)
{
    while (isspace((unsigned char)**cursor)) ++*cursor;
}

/* Bounded integer parsing avoids atoi/scanf overflow and rejects trailing data. */
static int number(const char **cursor, int maximum, int *out)
{
    int value = 0;
    skip_space(cursor);
    if (!isdigit((unsigned char)**cursor)) return 0;
    while (isdigit((unsigned char)**cursor)) {
        int digit = *(*cursor)++ - '0';
        if (value > (maximum - digit) / 10 || digit > maximum) return 0;
        value = value * 10 + digit;
        if (value > maximum) return 0;
    }
    if (**cursor && !isspace((unsigned char)**cursor)) return 0;
    *out = value;
    return 1;
}

AgentCommandKind AgentParseCommand(const char *line, AgentAction *out)
{
    AgentAction candidate = {8, 0, 0, 0, 0, 0, 1};
    const char *p = line;
    skip_space(&p);
    if (!strncmp(p, "observe", 7)) {
        p += 7; skip_space(&p);
        return *p ? AGENT_INVALID : AGENT_OBSERVE;
    }
    if (!strncmp(p, "quit", 4)) {
        p += 4; skip_space(&p);
        return *p ? AGENT_INVALID : AGENT_QUIT;
    }
    if (strncmp(p, "step", 4) || !isspace((unsigned char)p[4])) return AGENT_INVALID;
    p += 4;
    if (!number(&p, 8, &candidate.direction) ||
        !number(&p, 1, &candidate.fire) || !number(&p, 1, &candidate.strafe) ||
        !number(&p, 1, &candidate.potion) || !number(&p, 1, &candidate.bolt) ||
        !number(&p, 1, &candidate.nuke) ||
        !number(&p, AGENT_MAX_TICKS_PER_ACTION, &candidate.ticks)) return AGENT_INVALID;
    skip_space(&p);
    if (*p || !candidate.ticks || candidate.potion + candidate.bolt + candidate.nuke > 1)
        return AGENT_INVALID;
    *out = candidate;
    return AGENT_STEP;
}
