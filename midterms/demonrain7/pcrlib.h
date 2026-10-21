/* The Catacomb Source Code
 * Copyright (C) 1993-2014 Flat Rock Software
 *
 * This program is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License along
 * with this program; if not, write to the Free Software Foundation, Inc.,
 * 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.
 */

#ifndef __PCRLIB_H__
#define __PCRLIB_H__

#include <fcntl.h>
#include <string.h>
#ifndef _WIN32
#include <strings.h>
#endif
#include <SDL.h>
#include <SDL_scancode.h>

#include "catdefs.h"

extern char ch,str[80];

static inline byte EGA(const byte chan[4], byte ofs)
{
	return
		(((chan[3]>>ofs)&1)<<3)|
		(((chan[2]>>ofs)&1)<<2)|
		(((chan[1]>>ofs)&1)<<1)|
		((chan[0]>>ofs)&1);
}

/*=========================================================================*/

/*
** Sound routines
** Tied into INT 8, with a speeded up timer!
*/

typedef enum {off,spkr,sdlib} soundtype;

#pragma pack(1)
typedef struct {word start;
		byte priority;
		byte samplerate;
		char name[12];} spksndtype;

typedef struct {char id[4];
		word filelength;
		word filler[5];
		spksndtype sounds[63];
		word freqdata[];} SPKRtable;
#pragma pack()


extern soundtype soundmode;
extern SPKRtable *SoundData;

extern int _dontplay;

void StartupSound (void);
void ShutdownSound (void);
void PlaySound (int sound);
void PauseSound (void);
void ContinueSound (void);
void StopSound (void);
void WaitEndSound (void);

/*=========================================================================*/

/*
** Control routines
** Ties into INT 9 to intercept all key presses, but passes on to BIOS
** The control panel handles all this stuff!
*/

typedef struct {dirtype dir;
		boolean button1,button2;} ControlStruct;

typedef enum {keyboard,mouse,joystick1,joystick2,demo} inputtype;

extern inputtype playermode[3];
extern boolean keydown[SDL_NUM_SCANCODES];
extern int JoyXlow[3], JoyXhigh[3], JoyYlow [3], JoyYhigh [3];	// 1&2 are used
extern int MouseSensitivity;
extern int key[8], keyB1, keyB2;

enum demoenum {notdemo,demoplay,recording};
extern enum demoenum indemo;
extern SDL_Window *window;
extern SDL_DisplayMode mode;

typedef struct
{
	union
	{
		SDL_GameController *controller;
		SDL_Joystick *joy;
	};
	int device;
	boolean isgamecontroller;
} joyinfo_t;
extern joyinfo_t joystick[3];

void SetupKBD ();
void ProcessEvents ();
int ScancodeToDOS(SDL_Scancode sc);
void CheckMouseMode ();

void ProbeJoysticks ();
void ReadJoystick (int joynum,int *xcount,int *ycount);

ControlStruct ControlKBD ();
ControlStruct ControlMouse ();
ControlStruct ControlJoystick (int joynum);
ControlStruct ControlPlayer (int player);

void LoadDemo (int demonum);
void SaveDemo (int demonum);

void RecordDemo ();

/*========================================================================*/

/*
** Miscellaneous library routines
*/

unsigned long LoadFile(char *filename,char *buffer);
void SaveFile(char *filename,char *buffer, long size);
void *bloadin (char *filename);
void *bloadinLZW (char *filename);
long RLEcompress (void *source, long length, void *dest);

void initrndt (boolean randomize);
void initrnd (boolean randomize);
int rndt (void);
int rnd (word);

void clearkeys (void);

long _Verify(char *filename);

void _printhexb(unsigned char value);
void _printhex(unsigned value);
void _printbin(unsigned value);

/*========================================================================*/

/*
** Graphic routines
*/

#define SCindex 0x3C4
#define SCmapmask 2
#define GCindex 0x3CE
#define GCmode 5
#define CRTCLINECOMPARE 0x18
#define CRTCOVERFLOW 0x7
#define CRTCMAXSCANLINE 0x9
#define CRTCSTARTL 0xd
#define CRTCSTARTH 0xc

typedef enum {text,CGAgr,EGAgr,VGAgr} grtype;

extern grtype grmode;

extern int sx,sy,leftedge,xormask;	// stuff for screen text output

void setscreenmode (grtype mode);
void UpdateScreen();
void WaitVBL (void);

/*=========================================================================*/

/*
** PC-Arcade graphic file format stuff
*/

#define NUMPICS 64
#define NUMSPRITES 10

#pragma pack(1)
typedef struct {
		 sword width;
		 sword height;
		 dword shapeptr;		// reletive to spriteptr
		 dword maskptr;
		 sword xl,yl,xh,yh;		// death box pixel offsets
		 char name[12];
	       } spritetype;

typedef struct {
		 sword width;
		 sword height;
		 dword shapeptr;
		 char name[8];
	       } pictype;
#pragma pack()

extern int numchars,numtiles,numpics,numsprites;

extern spritetype image, spritetable[NUMSPRITES];	// grfile headers
extern pictype pictable[NUMPICS];

extern void *charptr;		// 8*8 tileset
extern void *tileptr;		// 16*16 tileset
extern void *picptr;		// any size picture set
extern void *spriteptr;		// any size masked and hit rect sprites
extern dword egaplaneofs[4];

extern byte screenseg[320*200];	// loaded into ES in the draw routines
							// should be adjusted after grmode
							// switches, page flipping, and scrolls
enum { screenpitch = 320 };

void installgrfile (char *filename,int unpack,void *inmem);

void drawchar (int x, int y, int charnum);
void drawpic (int x, int y, int picnum);
void drawchartile (int x, int y, int tile);

/*=========================================================================*/

/*
** higher level graphic routines
*/

extern int screencenterx ,screencentery, _yshift;

void controlpanel (void);
int get (void);
int _input(char *string,int max);
unsigned _inputint(void);
void print (const char *str);
void printchartile (const char *str);
void _printc(char *string);
void _printhexb(unsigned char value);
void _printhex(unsigned value);
void printint (int val);
void printlong (long val);
void drawwindow (int xl, int yl, int xh, int yh);
void erasewindow (void);
void bar (int xl,int yl, int xh, int yh, int ch);
void centerwindow (int width, int height);
void expwin (int width, int height);
void expwinh (int width, int height);
void expwinv (int width, int height);

/*=========================================================================*/

/*
** necessary routiones
*/

void loadgrfiles (void);    	// call installgrfile + any other files
void repaintscreen (void);	// do any screen wierdness and redraw all

/*========================================================================*/

/*
** game level routines
*/

extern sdword score;
extern sword level;

typedef struct { int width;
		 int height;
		 int planes;
		 int screenx;
		 int screeny;
		 int screenw;
		 int screenh;
		 unsigned planesize;
	       } LevelDef;

extern int	_numlevels, _maxplayers;
extern boolean	_cgaok, _egaok, _vgaok;
extern char	*_extension;

#pragma pack(1)
struct scores {
	 sdword score;
	 sword level;
	 char initials[4];
	};
#pragma pack()

extern struct scores scoreswap, highscores[5];


void _loadctrls (void);
void _savectrls (void);
void _loadhighscores (void);
void _savehighscores (void);
void _showhighscores (void);
void _checkhighscore (void);

void _setupgame (void);
void _quit (char *);		// shuts everything down

int bioskey(int);

/*=========================================================================*/


unsigned int extern RLECompress
  (char *source, long sourcelen, char *dest);

void extern RLEExpand
  (char *source, char *dest, long origlen);



//NOLAN ADDED
extern boolean GODMODE;

#endif
