/* SPDX-License-Identifier: GPL-2.0-or-later */
#ifndef CATACOMB_DEBUG_TOOLS_H
#define CATACOMB_DEBUG_TOOLS_H
extern int DebugEnabled, DebugFreezeEnemies, DebugFreezeShots, DebugNoClip;
int DebugHandle(const char *line);
int DebugFrozen(int class_id);
#endif
