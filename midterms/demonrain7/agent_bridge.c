/* SPDX-License-Identifier: GPL-2.0-or-later
 * Native adapter. Game mechanics stay in the upstream simulation functions.
 */
#include "catacomb.h"
#include "agent_bridge.h"
#include "agent_protocol.h"
#include "debug_tools.h"
#include <errno.h>
#include <stdlib.h>

int AgentEnabled = 0;
int AgentSingleLevel = 0;
int AgentHeadless = 0;
static int requested_level = 1;
static unsigned long max_ticks = 10000;
static unsigned long elapsed_ticks;
static const char *frame_file = "agent-frame.bmp";
static AgentAction action = {8, 0, 0, 0, 0, 0, 1};
static SDL_sem *command_ready, *command_consumed;
static char input_line[AGENT_COMMAND_BYTES];
static int input_eof, input_overlong;

static int option_integer(const char *value, long maximum, long *out)
{
    char *end;
    long n;
    errno = 0;
    n = strtol(value, &end, 10);
    if (errno || !*value || *end || n < 1 || n > maximum) return 0;
    *out = n;
    return 1;
}

int AgentOptions(int argc, char **argv)
{
    int i;
    long n;
    for (i = 1; i < argc; ++i) {
        if (!strcmp(argv[i], "--agent")) {
            AgentEnabled = AgentSingleLevel = 1;
        } else if (!strcmp(argv[i], "--headless")) {
            AgentHeadless = 1;
        } else if (!strcmp(argv[i], "--debug-tools")) {
            DebugEnabled = 1;
        } else if (!strcmp(argv[i], "--single-level")) {
            AgentSingleLevel = 1;
        } else if (!strcmp(argv[i], "--level")) {
            if (++i >= argc || !option_integer(argv[i], numlevels, &n)) return 0;
            requested_level = (int)n;
        } else if (!strcmp(argv[i], "--max-ticks")) {
            if (++i >= argc || !option_integer(argv[i], 1000000, &n)) return 0;
            max_ticks = (unsigned long)n;
        } else if (!strcmp(argv[i], "--frame-file")) {
            if (++i >= argc || !*argv[i]) return 0;
            frame_file = argv[i];
        }
    }
    return (!AgentHeadless && !DebugEnabled) || AgentEnabled;
}

int AgentCheckData(void)
{
    const char *required[] = {"SOUNDS.CA2", "EGACHARS.CA2", "EGAPICS.CA2"};
    char level_file[40];
    int i, ok = 1;
    FILE *file;
    if (!AgentSingleLevel) return 1;
    for (i = 0; i < 3; ++i) {
        file = fopen(required[i], "rb");
        if (file) fclose(file);
        else { fprintf(stderr, "Missing game data: %s\n", required[i]); ok = 0; }
    }
    snprintf(level_file, sizeof(level_file), "LEVEL%d.CA2", requested_level);
    file = fopen(level_file, "rb");
    if (file) fclose(file);
    else { fprintf(stderr, "Missing game data: %s\n", level_file); ok = 0; }
    if (!ok) fprintf(stderr, "Run from your legally obtained Catacomb II data directory. See MIDTERM_README.md.\n");
    return ok;
}

ControlStruct AgentControl(void)
{
    ControlStruct result;
    /* Local keyboard events must not supply cheats, menus or extra actions. */
    memset(keydown, 0, sizeof(keydown));
    result.dir = (dirtype)action.direction;
    result.button1 = (boolean)action.fire;
    result.button2 = (boolean)action.strafe;
    keydown[SDL_SCANCODE_P] = (boolean)action.potion;
    keydown[SDL_SCANCODE_B] = (boolean)action.bolt;
    keydown[SDL_SCANCODE_N] = (boolean)action.nuke;
    action.potion = action.bolt = action.nuke = 0;
    return result;
}

static const char *episode_status(void)
{
    if (playdone && gamexit == killed) return "dead";
    if (leveldone) return "cleared";
    if (playdone) return "stopped";
    if (elapsed_ticks >= max_ticks) return "truncated";
    return "running";
}

static void observation(void)
{
    if (!SaveObservationBMP(frame_file)) {
        puts("{\"error\":\"frame_write_failed\"}");
        fflush(stdout);
        fprintf(stderr, "Cannot write observation: %s\n", SDL_GetError());
        exit(3);
    }
    /* No coordinates, object list, map, RNG, solution or debug state here. */
    printf("{\"protocol\":1,\"status\":\"%s\",\"ticks\":%lu,\"width\":320,\"height\":200}\n",
           episode_status(), elapsed_ticks);
    fflush(stdout);
}

static int SDLCALL read_commands(void *unused)
{
    (void)unused;
    for (;;) {
        int ch, length = 0;
        input_overlong = 0;
        while ((ch = getchar()) != EOF && ch != '\n') {
            if (ch == 0 || length >= (int)sizeof(input_line) - 1)
                input_overlong = 1;
            else input_line[length++] = (char)ch;
        }
        input_line[length] = 0;
        if (ch == EOF && !length && !input_overlong) {
            input_eof = 1;
            SDL_SemPost(command_ready);
            return 0;
        }
        SDL_SemPost(command_ready);
        SDL_SemWait(command_consumed);
    }
}

void AgentRun(void)
{
    SDL_Thread *reader;
    char command[AGENT_COMMAND_BYTES];
    int overlong, i;
    AgentCommandKind kind;
    AgentAction next;

    /* Start every episode with upstream initial inventory, including spells. */
    level = 0;
    playsetup();
    level = requested_level;
    indemo = notdemo;
    gamestate = ingame;
    GODMODE = false;
    initrndt(false);
    initrnd(false);
    if (!AgentEnabled) {
        playloop();
        _quit("");
    }

    clearold();
    loadlevel();
    leveldone = playdone = false;
    gamexit = quited;
    frameon = 0;
    boltsleft = shotpower = 0;
    elapsed_ticks = 0;
    initrndt(false);
    printshotpower();
    /* The original loop draws objects during its first tick. The initial
       observation is after one neutral tick, recorded in the episode clock. */
    GameTick();
    elapsed_ticks = 1;
    refresh();

    command_ready = SDL_CreateSemaphore(0);
    command_consumed = SDL_CreateSemaphore(0);
    if (!command_ready || !command_consumed) { fprintf(stderr, "Cannot create command queue\n"); exit(3); }
    reader = SDL_CreateThread(read_commands, "agent-stdin", NULL);
    if (!reader) { fprintf(stderr, "Cannot create command reader\n"); exit(3); }
    SDL_DetachThread(reader);
    observation();
    for (;;) {
        while (SDL_SemTryWait(command_ready) == SDL_MUTEX_TIMEDOUT) {
            ProcessEvents();
            SDL_Delay(10);
        }
        if (input_eof) break;
        memcpy(command, input_line, sizeof(command));
        overlong = input_overlong;
        SDL_SemPost(command_consumed);
        if (!overlong && DebugHandle(command)) continue;
        kind = overlong ? AGENT_INVALID : AgentParseCommand(command, &next);
        if (kind == AGENT_QUIT) break;
        if (kind == AGENT_INVALID) {
            puts("{\"error\":\"invalid_command\"}"); fflush(stdout); continue;
        }
        if (kind == AGENT_STEP) {
            if (strcmp(episode_status(), "running")) {
                puts("{\"error\":\"episode_finished\"}"); fflush(stdout); continue;
            }
            action = next;
            for (i = 0; i < next.ticks; ++i) {
                GameTick();
                ++elapsed_ticks;
                if (strcmp(episode_status(), "running")) break;
            }
            /* Complete the visual update even after an early terminal tick. */
            refresh();
        }
        observation();
    }
    _quit("");
}
