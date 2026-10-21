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

#ifndef __CATDEFS_H__
#define __CATDEFS_H__

#include <assert.h>
#include <stdio.h>
#include <stdint.h>

#ifdef _MSC_VER
#include <fcntl.h>
// Since Microsoft can't be bothered to update their C compiler
#define inline __inline
#endif

#define CATALOG

enum {false,true};
typedef uint16_t boolean;

typedef uint8_t byte;
typedef int8_t sbyte;
typedef uint16_t word;
typedef int16_t sword;
typedef uint32_t dword;
typedef int32_t sdword;
typedef uint64_t qword;
typedef int64_t sqword;
typedef struct { word ofs; word seg; } farptr;
static inline dword flatptr(farptr ptr) { return (ptr.seg<<4) + ptr.ofs; }

// Compatibility stuff
#ifndef O_BINARY
#define O_BINARY 0
#endif
#ifndef _WIN32
static inline char *itoa(int value, char* str, int base)
{
	if(base == 16)
		sprintf(str, "%X", value);
	else
		sprintf(str, "%d", value);
	return str;
}
static inline char *ltoa(int value, char* str, int base) { return itoa(value, str, base); }
#endif

#define NUMDEMOS 1

#define maxpics 2047
#define NUMTILES 24*24   /*number of tiles displayed on screen*/
#define numlevels 30
#define maxobj 200           /*maximum possible active objects*/
#define solidwall 129
#define blankfloor 128
#define leftoff 11
#define topoff 11
#define tile2s 256          /*tile number where the 2*2 pictures start*/
#define tile3s tile2s+67*4
#define tile4s tile3s+35*9
#define tile5s tile4s+19*16
#define lasttile tile5s+19*25

typedef enum {north,east,south,west,northeast,southeast,southwest,
	      northwest,nodir} dirtype;

typedef enum {playercmd,gargcmd,dragoncmd,ramstraight,ramdiag,straight,idle,
    fade,explode,gunthinke,gunthinks} thinktype;

typedef enum {benign,monster,pshot,mshot,nukeshot} tagtype;

typedef enum {nothing,player,goblin,skeleton,ogre,gargoyle,dragon,turbogre,
    wallhit,shot,bigshot,rock,dead1,dead2,dead3,dead4,dead5,dead6,teleporter,
    torch,secretgate,gune,guns,lastclass} classtype;

typedef enum {ingame,intitle,inscores} statetype;


#pragma pack(1)
typedef struct {
  boolean active;	/*if false, the object has not seen the player yet*/
  word /* classtype */  class;
  byte  x,y,		/*location of upper left corner in world*/
    stage,		/*animation frame being drawn*/
    delay;		/*number of frames to pause without doing anything*/
  word /* dirtype */  dir;		/*direction facing*/
  sbyte hp;		/*hit points*/
  byte oldx,oldy;	/*position where it was last drawn*/
  sword oldtile;		/*origin tile when last drawn*/
  byte filler[1];	/*pad to 16 bytes*/
   } activeobj;

typedef struct {
    byte think;			/*some of these sizes are for the*/
    byte contact;			/*convenience of the assembly routines*/
    byte solid;
    word firstchar;
    byte size;
    byte stages;
    byte dirmask;
    word speed;
    byte hitpoints;
    byte damage;
    word points;
    byte filler[2];
  } objdeftype;

typedef struct {	/*holds a copy of activeobj, and its class info*/
  boolean  active;	/*if false, the object has not seen the player yet*/
  word  class;
  byte  x,y,		/*location of upper left corner in world*/
    stage,		/*animation frame being drawn*/
    delay;		/*number of frames to pause without doing anything*/
  word  dir;		/*direction facing*/
  sbyte hp;		/*hit points*/
  byte oldx,oldy;		/*position where it was last drawn*/
  sword oldtile;		/*origin tile when last drawn*/
  byte filler[1];	/*pad to 16 bytes*/

  byte think;
  byte contact;
  byte solid;
  word  firstchar;
  byte  size;
  byte  stages;
  byte  dirmask;
  word  speed;
  byte  hitpoints;
  byte  damage;
  word  points;
  byte filler2[2];	/*pad to 32 bytes*/
  } objtype;
#pragma pack()

#endif
