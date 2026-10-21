/* SPDX-License-Identifier: GPL-2.0-or-later
 * Calls the real upstream rules. Blank in-memory tiles replace artwork ONLY
 * in this test executable; this is not a substitute game or a playtest.
 */
#include "catacomb.h"
#include "agent_bridge.h"
#include <stdlib.h>

extern boolean walkthrough(void);
extern boolean takekey(void);
extern void tagobject(void);
extern void levelcleared(void);
extern void takepotion(void);
extern void castbolt(void);
extern void castnuke(void);
extern void playshoot(void);
extern void playbigshoot(void);
extern void playercmdthink(void);
extern char *demoptr;
extern int US_CheckParm(char *parm, char **strings);
static byte blank_characters[65536];
#define CHECK(test) do { if (!(test)) { fprintf(stderr, "Failed at line %d: %s\n", __LINE__, #test); exit(1); } } while(0)

static void fixture(void)
{
    int x, y;
    memset(items, 0, sizeof(items));
    memset(o, 0, sizeof(o));
    memset(&obj, 0, sizeof(obj));
    memset(&altobj, 0, sizeof(altobj));
    memset(screenseg, 0, sizeof(screenseg));
    for (y = 0; y < 87; ++y)
        for (x = 0; x < 86; ++x) background[y][x] = view[y][x] = blankfloor;
    obj.class = player;
    obj.size = 2;
    obj.x = obj.y = 30;
    obj.dir = east;
    numobj = 0;
    boltsleft = shotpower = 0;
    chkx = chky = 20;
    GODMODE = false;
    playdone = leveldone = false;
    gamexit = quited;
}

static int equal_files(const char *left, const char *right)
{
    int a, b;
    FILE *f = fopen(left, "rb"), *g = fopen(right, "rb");
    CHECK(f && g);
    do { a = fgetc(f); b = fgetc(g); } while (a == b && a != EOF);
    fclose(f); fclose(g);
    return a == b;
}

int main(void)
{
    const char *first = "test-observation-first.bmp";
    const char *second = "test-observation-second.bmp";
    SDL_Surface *image;
    char *video_options[] = {"windowed", "screen", NULL};
    CHECK(US_CheckParm("--WINDOWED", video_options) == 0);
    CHECK(US_CheckParm("1", video_options) == -1);
    CHECK(US_CheckParm("", video_options) == -1);
    CHECK(US_CheckParm("\xff", video_options) == -1);
    /* Real regression: Windows text mode truncates at Ctrl-Z and rewrites
       CRLF; the old permission-as-open-flag also created missing files. */
    const char binary[] = {'C', '\r', '\n', 0x1a, 0, (char)0xff, 'Z'};
    char loaded[sizeof(binary)] = {0};
    FILE *binary_file = fopen("test-binary-resource.tmp", "wb");
    CHECK(binary_file);
    CHECK(fwrite(binary, 1, sizeof(binary), binary_file) == sizeof(binary));
    fclose(binary_file);
    CHECK(LoadFile("test-binary-resource.tmp", loaded) == sizeof(binary));
    CHECK(!memcmp(binary, loaded, sizeof(binary)));
    remove("test-binary-resource.tmp");
    CHECK(LoadFile("test-binary-resource.tmp", loaded) == 0);
    binary_file = fopen("test-binary-resource.tmp", "rb");
    CHECK(!binary_file);
    _dontplay = 1;
    charptr = blank_characters;
    grmode = EGAgr;
    memset(egaplaneofs, 0, sizeof(egaplaneofs));

    fixture();
    chkspot = view[chky][chkx] = background[chky][chkx] = 164;
    CHECK(walkthrough());
    CHECK(items[1] == 1 && view[chky][chkx] == blankfloor && background[chky][chkx] == blankfloor);

    fixture();
    chkspot = view[chky][chkx] = background[chky][chkx] = 165;
    CHECK(!walkthrough());
    CHECK(items[1] == 0 && view[chky][chkx] == 165);
    items[1] = 2;
    view[chky + 1][chkx] = background[chky + 1][chkx] = 165;
    CHECK(walkthrough());
    CHECK(items[1] == 1 && view[chky][chkx] == blankfloor && view[chky + 1][chkx] == blankfloor);
    CHECK(background[chky][chkx] == blankfloor);

    fixture();
    chkspot = 129;
    CHECK(!walkthrough()); /* Solid wall blocks movement. */
    chkspot = 128;
    CHECK(walkthrough());

    fixture();
    items[2] = 1;
    obj.hp = o[0].hp = 3;
    takepotion();
    CHECK(items[2] == 0 && obj.hp == 13 && o[0].hp == 13);
    obj.hp = o[0].hp = 5;
    takepotion();
    CHECK(obj.hp == 5 && items[2] == 0);

    fixture();
    items[3] = 1;
    castbolt();
    CHECK(items[3] == 0 && boltsleft == 8);
    boltsleft = 0;
    castbolt();
    CHECK(boltsleft == 0 && items[3] == 0);
    items[5] = 1;
    castnuke();
    CHECK(items[5] == 0 && numobj == 12);
    for (int i = 1; i <= numobj; ++i) CHECK(o[i].class == bigshot);
    castnuke();
    CHECK(numobj == 12);

    fixture();
    chkspot = background[chky][chkx] = 136;
    CHECK(!walkthrough()); /* The player cannot walk through a breakable wall. */
    obj.contact = pshot;
    CHECK(!walkthrough()); /* A small shot breaks the wall and stops. */
    CHECK(background[chky][chkx] == blankfloor);
    chkspot = background[chky][chkx] = 145;
    obj.contact = nukeshot;
    CHECK(walkthrough()); /* A big shot continues and reveals the hidden key. */
    CHECK(background[chky][chkx] == 164);

    fixture();
    /* Feed the original demo-input decoder, without adding a test-only game
       control path. These calls exercise the actual player rule function. */
    {
        char input;
        indemo = demoplay;
        frameon = 1;
        input = (nodir << 2) | 1;
        demoptr = &input;
        playercmdthink();
        CHECK(shotpower == 1 && numobj == 0);
        shotpower = 13;
        input = nodir << 2;
        demoptr = &input;
        playercmdthink();
        CHECK(shotpower == 0 && numobj == 1 && o[1].class == bigshot);
        obj.stage = 0;
        obj.delay = 0;
        input = (north << 2) | 2;
        demoptr = &input;
        playercmdthink();
        CHECK(obj.y == 29 && obj.dir == east); /* Strafe preserves facing. */
        indemo = notdemo;
    }

    fixture();
    altobj.class = player;
    altobj.hp = 2;
    altobj.size = 2;
    obj.damage = 3;
    altnum = 0;
    tagobject();
    CHECK(playdone && gamexit == killed && o[0].hp == 0);

    fixture();
    level = 1;
    levelcleared();
    CHECK(leveldone && level == 2 && !playdone);
    fixture();
    level = 1;
    background[altobj.y + 2][altobj.x] = '1' + 161;
    background[altobj.y + 2][altobj.x + 1] = '2' + 161;
    levelcleared();
    CHECK(leveldone && level == 12);

    fixture();
    /* Equal visible pixels must remain equal despite hidden state changes. */
    screenseg[0] = 15;
    CHECK(SaveObservationBMP(first));
    background[80][80] = 165;
    o[1].x = 80; o[1].y = 80; o[1].class = dragon;
    originx = 8; originy = 9;
    CHECK(SaveObservationBMP(second));
    CHECK(equal_files(first, second));
    image = SDL_LoadBMP(first);
    CHECK(image && image->w == 320 && image->h == 200);
    SDL_FreeSurface(image);
    remove(first); remove(second);
    puts("Real rule checks passed: pickups, doors, collision, healing, spells, charge/release, strafe, breakable walls, death, exit, pixel-only observation.");
    return 0;
}
