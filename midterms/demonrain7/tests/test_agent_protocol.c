/* SPDX-License-Identifier: GPL-2.0-or-later */
#include "agent_protocol.h"
#include <stdio.h>
#include <stdlib.h>

#define CHECK(test) do { if (!(test)) { fprintf(stderr, "Failed at line %d: %s\n", __LINE__, #test); exit(1); } } while(0)
int main(void)
{
    AgentAction a = {0};
    const char *bad[] = {
        "", "observe hidden-map", "quit now", "teleport 1 2", "reset", "godmode",
        "step 9 0 0 0 0 0 1", "step -1 0 0 0 0 0 1", "step 0 2 0 0 0 0 1",
        "step 0 0 0 0 0 0 0", "step 0 0 0 0 0 0 33", "step 0 0 0 0 0 0 1 extra",
        "step 0 0 0 0 0 0", "step 0 0 0 1 1 0 1", "step0 0 0 0 0 0 1",
        "step 0 0 0 0 0 0 999999999999999999999999999999999999",
        "step 0 0 0 0 0 0 1.0", "step 0 0 0 0 0 0 1\nquit",
        "step 0 0 0 0 0 0 +1", "step 0 0 0 0 0 0 0x10"
    };
    unsigned i;
    CHECK(AgentParseCommand("observe\n", &a) == AGENT_OBSERVE);
    CHECK(AgentParseCommand(" quit \r\n", &a) == AGENT_QUIT);
    CHECK(AgentParseCommand("step 4 1 1 0 0 1 32\n", &a) == AGENT_STEP);
    CHECK(a.direction == 4 && a.fire == 1 && a.strafe == 1 && a.nuke == 1 && a.ticks == 32);
    CHECK(AgentParseCommand("step 8 0 0 1 0 0 1", &a) == AGENT_STEP);
    for (i = 0; i < sizeof(bad)/sizeof(bad[0]); ++i) {
        a.direction = 7;
        CHECK(AgentParseCommand(bad[i], &a) == AGENT_INVALID);
        CHECK(a.direction == 7); /* Reject atomically; never partially apply. */
    }
    puts("Agent protocol checks passed (allowed controls, strict bounds, atomic rejection).");
    return 0;
}
