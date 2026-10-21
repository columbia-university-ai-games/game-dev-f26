/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef CATACOMB_AGENT_BRIDGE_H
#define CATACOMB_AGENT_BRIDGE_H
#include "pcrlib.h"
extern int AgentEnabled;
extern int AgentSingleLevel;
extern int AgentHeadless;
int AgentOptions(int argc, char **argv);
int AgentCheckData(void);
void AgentRun(void);
ControlStruct AgentControl(void);
int SaveObservationBMP(const char *path);
int GameTick(void);
void playsetup(void);
#endif
