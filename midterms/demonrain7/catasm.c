/* The Catacomb Source Code
 * Copyright (C) 1993-2014 Flat Rock Software
 * Copyright (C) 2014 Braden "Blzut3" Obrzut
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

#include "catacomb.h"
#include "pcrlib.h"
#include "agent_bridge.h"

//========================================================================

//=========================================
//
// DRAWOBJ
// Draws the object to TILES in the proper
// direction and state.
//
//=========================================

byte squares[] = {0,1,4,9,16,25,36,49,64};
word table86[] = {
	0,  86, 172, 258, 344, 430, 516, 602, 688, 774, 860, 946,1032,1118,
	1204,1290,1376,1462,1548,1634,1720,1806,1892,1978,2064,2150,2236,2322,
	2408,2494,2580,2666,2752,2838,2924,3010,3096,3182,3268,3354,3440,3526,
	3612,3698,3784,3870,3956,4042,4128,4214,4300,4386,4472,4558,4644,4730,
	4816,4902,4988,5074,5160,5246,5332,5418,5504,5590,5676,5762,5848,5934,
	6020,6106,6192,6278,6364,6450,6536,6622,6708,6794,6880,6966,7052,7138,
	7224,7310,7396
};

void drawobj()
{
	int tilenum = obj.firstchar + squares[obj.size] * ((obj.dir&obj.dirmask)*obj.stages + obj.stage);
	obj.oldtile = tilenum;
	obj.oldy = obj.y;
	obj.oldx = obj.x;

	const byte objpri = priority[tilenum]; //entire object has same priority
	unsigned ofs = table86[obj.oldy] + obj.oldx; //View is 86*86

	unsigned x, y;
	y = obj.size;
	while(y-- > 0)
	{
		x = obj.size;
		while(x-- > 0)
		{
			//check tiles priority level
			//don't draw if lower than what's there
			if(priority[*((int*)view+ofs)] <= objpri)
				*((int*)view+ofs) = tilenum;
			++tilenum;
			++ofs;
		}
		//position destination at start of next line
		ofs += 86-obj.size;
	}
}

//=======================================================================

//=======================================
//
// ERASEOBJ
// Erases the current object by copying
// the background onto the view where the
// object is standing
//
//=======================================

void eraseobj()
{
	// only erase chars that match what was drawn by the last drawobj
	int tilenum = obj.oldtile;
	unsigned ofs = table86[obj.oldy] + obj.oldx; //View is 86*86

	unsigned x, y;
	y = obj.size;
	while(y-- > 0)
	{
		x = obj.size;
		while(x-- > 0)
		{
			//don't erase if its not part of the shape
			if(*((int*)view+ofs) == tilenum)
				*((int*)view+ofs) = *((int*)background+ofs); //erase it
			++tilenum;
			++ofs;
		}
		//position destination at start of next line
		ofs += 86-obj.size;
	}
}

//========================================================================

//====================
//
// DoAll
// The main play loop
//
//====================

int GameTick(void)
{
	assert(numobj > 0);

		objecton = numobj;
		do
		{
			memcpy(&obj, &o[objecton], sizeof(activeobj));
			if(obj.class != nothing)
			{
				memcpy(&obj.think, &objdef[obj.class], sizeof(objdeftype));
				if(obj.active)
					doactive();
				else
					doinactive();
			}

			if(leveldone || playdone)
				return 0;
		}
		while(--objecton >= 0);

		refresh();
		++frameon;

	return !leveldone && !playdone;
}

void doall()
{
	while (GameTick()) {}
}

//=======================================================================

static void drawcgachartile(byte *dest, int tile)
{
	byte *src = (byte*)pics + (tile<<4);
	unsigned r;
	for(r = 0;r < 8;++r, src += 2)
	{
		*dest++ = (src[0]>>6)&3;
		*dest++ = (src[0]>>4)&3;
		*dest++ = (src[0]>>2)&3;
		*dest++ = (src[0]>>0)&3;
		*dest++ = (src[1]>>6)&3;
		*dest++ = (src[1]>>4)&3;
		*dest++ = (src[1]>>2)&3;
		*dest = (src[1]>>0)&3;

		dest += screenpitch-7;
	}
}

//=========
//
// CGAREFRESH redraws the tiles that have changed in the tiled screen area
//
//=========

void cgarefresh()
{
	unsigned ofs = originy*86 + originx;

	int tile;
	unsigned i = 0;
	unsigned endofrow = ofs + 24;
	byte *vbuf = screenseg;
	do
	{
		tile = *((int*)view+ofs);
		if(tile != oldtiles[i])
		{
			oldtiles[i] = tile;
			drawcgachartile(vbuf, tile);
		}
		++i;
		++ofs;
		vbuf += 8;

		if(ofs == endofrow)
		{
			if(i == 24*24)
				break;
			ofs += 86-24;
			endofrow += 86;
			vbuf += screenpitch*8 - (24*8);
		}
	}
	while(1);

	UpdateScreen();
}

//=======================================================================

static void drawegachartile(byte *dest, int tile)
{
	byte *src = (byte*)pics + (tile<<5);
	unsigned r;
	for(r = 0;r < 8;++r, ++src)
	{
		const byte chan[4] = {
			src[0],
			src[8],
			src[16],
			src[24]
		};

		*dest++ = EGA(chan,7);
		*dest++ = EGA(chan,6);
		*dest++ = EGA(chan,5);
		*dest++ = EGA(chan,4);
		*dest++ = EGA(chan,3);
		*dest++ = EGA(chan,2);
		*dest++ = EGA(chan,1);
		*dest = EGA(chan,0);

		dest += screenpitch-7;
	}
}

//=========
//
// EGAREFRESH redraws the tiles that have changed in the tiled screen area
//
//=========

void egarefresh()
{
	unsigned ofs = originy*86 + originx;

	int tile;
	unsigned i = 0;
	unsigned endofrow = ofs + 24;
	byte *vbuf = screenseg;
	do
	{
		tile = *((int*)view+ofs);
		if(tile != oldtiles[i])
		{
			oldtiles[i] = tile;
			drawegachartile(vbuf, tile);
		}
		++i;
		++ofs;
		vbuf += 8;

		if(ofs == endofrow)
		{
			if(i == 24*24)
				break;
			ofs += 86-24;
			endofrow += 86;
			vbuf += screenpitch*8 - (24*8);
		}
	}
	while(1);

	UpdateScreen();
}

void drawchartile(int x, int y, int tile)
{
	switch(grmode)
	{
		default:
		case EGAgr:
			drawegachartile(screenseg + (y<<3)*screenpitch + (x<<3), tile);
			break;
		case CGAgr:
			drawcgachartile(screenseg + (y<<3)*screenpitch + (x<<3), tile);
			break;
	}
}
