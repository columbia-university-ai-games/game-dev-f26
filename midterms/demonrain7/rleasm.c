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

#include "pcrlib.h"

void RLEExpand(char *source, char *dest, long origlen)
{
	const char * const end = dest + origlen;
	while(dest < end)
	{
		byte val = *(byte*)source++;
		if(val & 0x80)
		{
			byte len = (val&0x7F)+1;
			memcpy(dest, source, len);
			source += len;
			dest += len;
		}
		else
		{
			byte len = val+3;
			memset(dest, *(byte*)source++, len);
			dest += len;
		}
	}
}
