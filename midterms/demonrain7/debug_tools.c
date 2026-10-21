/* SPDX-License-Identifier: GPL-2.0-or-later
 * Explicit developer-only controls. Ordinary agent processes reject them.
 */
#include "catacomb.h"
#include "debug_tools.h"
#include <ctype.h>
#include <errno.h>
#include <stdlib.h>

int DebugEnabled = 0, DebugFreezeEnemies = 0, DebugFreezeShots = 0, DebugNoClip = 0;
extern void drawside(void);

static int enemy(int c) { return (c >= goblin && c <= turbogre) || c == gune || c == guns; }
static int projectile(int c) { return c == shot || c == bigshot || c == rock; }
static int editable_class(int c) { return (c >= player && c <= turbogre) || projectile(c); }

int DebugFrozen(int c)
{
    return DebugEnabled && ((DebugFreezeEnemies && enemy(c)) || (DebugFreezeShots && projectile(c)));
}

/* Repaint an edited state without taking a simulation tick or consuming RNG. */
static void repaint(void)
{
    int i;
    objtype saved = obj;
    memcpy(view, background, sizeof(view));
    for (i = numobj; i >= 0; --i) {
        if (o[i].class <= nothing || o[i].class >= lastclass) continue;
        memcpy(&obj, &o[i], sizeof(activeobj));
        memcpy(&obj.think, &objdef[obj.class], sizeof(objdeftype));
        if ((int)obj.x + obj.size > 86 || (int)obj.y + obj.size > 86) continue;
        drawobj();
        memcpy(&o[i], &obj, sizeof(activeobj));
    }
    obj = saved;
    originx = o[0].x - 11;
    originy = o[0].y - 11;
    drawside();
    clearold();
    refresh();
}

static void state(void)
{
    int i, x, y, comma = 0;
    printf("{\"debug\":true,\"level\":%d,\"player\":{\"hp\":%d,\"keys\":%d,\"potions\":%d,\"bolts\":%d,\"nukes\":%d,\"power\":%d,\"burst\":%d,\"score\":%ld,\"god\":%d,\"x\":%d,\"y\":%d,\"direction\":%d,\"delay\":%d},",
           level, o[0].hp, items[1], items[2], items[3], items[5], shotpower,
           boltsleft, (long)score, GODMODE ? 1 : 0, o[0].x-11, o[0].y-11, o[0].dir, o[0].delay);
    printf("\"flags\":{\"freeze_enemies\":%d,\"freeze_shots\":%d,\"noclip\":%d},\"classes\":[", DebugFreezeEnemies, DebugFreezeShots, DebugNoClip);
    for (i = 1; i < lastclass; ++i) {
        if (!editable_class(i)) continue;
        printf("%s{\"id\":%d,\"speed\":%d,\"hp\":%d,\"damage\":%d,\"points\":%d}",
               comma++ ? "," : "", i, objdef[i].speed, objdef[i].hitpoints, objdef[i].damage, objdef[i].points);
    }
    printf("],\"objects\":["); comma = 0;
    for (i = 1; i <= numobj; ++i) {
        if (o[i].class == nothing) continue;
        printf("%s{\"id\":%d,\"class\":%d,\"hp\":%d,\"x\":%d,\"y\":%d,\"direction\":%d,\"active\":%d,\"delay\":%d}",
               comma++ ? "," : "", i, o[i].class, o[i].hp, o[i].x-11, o[i].y-11, o[i].dir, o[i].active ? 1 : 0, o[i].delay);
    }
    printf("],\"map\":[");
    for (y = 0; y < 64; ++y) {
        printf("%s[", y ? "," : "");
        for (x = 0; x < 64; ++x) printf("%s%d", x ? "," : "", background[y+11][x+11]);
        printf("]");
    }
    puts("]}"); fflush(stdout);
}

static void error(const char *message)
{
    printf("{\"error\":\"%s\"}\n", message); fflush(stdout);
}

static int inside(long x, long y, int size)
{
    return x >= 1 && y >= 1 && x + size <= 63 && y + size <= 63;
}

static int floor_space(long x, long y, int size)
{
    int dx, dy;
    if (!inside(x, y, size)) return 0;
    for (dy = 0; dy < size; ++dy)
        for (dx = 0; dx < size; ++dx)
            if (background[y+11+dy][x+11+dx] != blankfloor) return 0;
    return 1;
}

static int tile_allowed(long tile)
{
    return tile == 128 || (tile >= 129 && tile <= 145) || (tile >= 162 && tile <= 167);
}

int DebugHandle(const char *line)
{
    const char *p;
    char op[24];
    long a[16];
    int n = 0, length = 0, i, changed = 1;
    if (strncmp(line, "debug ", 6)) return 0;
    if (!DebugEnabled) { error("debug_disabled"); return 1; }
    p = line + 6;
    while (*p && !isspace((unsigned char)*p) && length < 23) op[length++] = *p++;
    op[length] = 0;
    while (*p) {
        char *end;
        while (isspace((unsigned char)*p)) ++p;
        if (!*p) break;
        if (n == 16 || !isdigit((unsigned char)*p)) goto invalid;
        errno = 0; a[n] = strtol(p, &end, 10);
        if (errno || a[n] < 0 || a[n] > 9999999 || (*end && !isspace((unsigned char)*end))) goto invalid;
        ++n; p = end;
    }
    if (!strcmp(op, "state") && n == 0) changed = 0;
    else if (!strcmp(op, "player") && n == 13) {
        if (a[0] > 127 || a[1] > 9999 || a[2] > 9999 || a[3] > 9999 || a[4] > 9999 ||
            a[5] > 13 || a[6] > 99 || a[7] > 9999999 || a[8] > 1 || a[9] > 62 || a[10] > 62 || a[11] > 3 || a[12] > 255) goto invalid;
        /* Teleport only into clear floor unless the operator enabled noclip. */
        if ((a[9] != o[0].x-11 || a[10] != o[0].y-11) && !DebugNoClip && !floor_space(a[9],a[10],2)) { error("destination_is_not_clear_floor"); return 1; }
        o[0].class = player; o[0].active = true; o[0].stage = 0;
        o[0].hp = (sbyte)a[0]; items[1]=(sword)a[1]; items[2]=(sword)a[2]; items[3]=(sword)a[3]; items[5]=(sword)a[4];
        shotpower=(int)a[5]; boltsleft=(int)a[6]; score=(sdword)a[7]; GODMODE=(boolean)a[8];
        o[0].x=(byte)(a[9]+11); o[0].y=(byte)(a[10]+11); o[0].dir=(word)a[11]; o[0].delay=(byte)a[12];
        if (!o[0].hp) { playdone=true; gamexit=killed; }
        else if (playdone && gamexit == killed) { playdone=false; gamexit=quited; }
    } else if (!strcmp(op,"flags") && n == 3) {
        if (a[0]>1 || a[1]>1 || a[2]>1) goto invalid;
        DebugFreezeEnemies=(int)a[0]; DebugFreezeShots=(int)a[1]; DebugNoClip=(int)a[2];
    } else if (!strcmp(op,"class") && n == 6) {
        int c=(int)a[0];
        if (!editable_class(c) || a[1]>256 || a[2]>127 || a[3]>127 || a[4]>65535 || a[5]>1) goto invalid;
        objdef[c].speed=(word)a[1]; objdef[c].hitpoints=(byte)a[2]; objdef[c].damage=(byte)a[3]; objdef[c].points=(word)a[4];
        if (a[5]) for (i=1; i<=numobj; ++i) if (o[i].class==c) o[i].hp=(sbyte)a[2];
    } else if (!strcmp(op,"spawn") && n == 4) {
        int slot=0, c=(int)a[0];
        if (c < goblin || c > turbogre || a[3]>3) goto invalid;
        if (!floor_space(a[1],a[2],objdef[c].size)) { error("spawn_requires_clear_floor"); return 1; }
        for (i=1;i<=numobj;++i) if (o[i].class==nothing) { slot=i; break; }
        if (!slot) { if (numobj>=maxobj) { error("object_limit"); return 1; } slot=++numobj; }
        memset(&o[slot],0,sizeof(activeobj));
        o[slot].class=(word)c; o[slot].active=true; o[slot].x=(byte)(a[1]+11); o[slot].y=(byte)(a[2]+11);
        o[slot].dir=(word)a[3]; o[slot].hp=(sbyte)objdef[c].hitpoints; o[slot].oldtile=-1;
    } else if (!strcmp(op,"object") && n == 7) {
        int id=(int)a[0], size;
        if (id<1 || id>numobj || o[id].class==nothing || a[1]>127 || a[4]>3 || a[5]>1 || a[6]>255) goto invalid;
        size=objdef[o[id].class].size;
        if (!inside(a[2],a[3],size)) goto invalid;
        o[id].hp=(sbyte)a[1]; o[id].x=(byte)(a[2]+11); o[id].y=(byte)(a[3]+11); o[id].dir=(word)a[4]; o[id].active=(boolean)a[5]; o[id].delay=(byte)a[6];
    } else if (!strcmp(op,"remove") && n == 1) {
        if (a[0]<1 || a[0]>numobj || o[a[0]].class==nothing) goto invalid;
        o[a[0]].class=nothing;
    } else if (!strcmp(op,"clear") && n == 1) {
        if (a[0]>2) goto invalid;
        for(i=1;i<=numobj;++i) if ((a[0]!=1 && enemy(o[i].class)) || (a[0]!=0 && projectile(o[i].class))) o[i].class=nothing;
    } else if (!strcmp(op,"tile") && n == 3) {
        if (a[0]<1 || a[0]>62 || a[1]<1 || a[1]>62 || !tile_allowed(a[2])) goto invalid;
        background[a[1]+11][a[0]+11]=(int)a[2];
    } else if (!strcmp(op,"defaults") && n == 0) {
        initobjects(); DebugFreezeEnemies=DebugFreezeShots=DebugNoClip=0; GODMODE=false;
    } else goto invalid;
    if (changed) repaint();
    state(); return 1;
invalid:
    error("invalid_debug_command"); return 1;
}
