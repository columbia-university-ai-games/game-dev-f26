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

#include <stdlib.h>
#include <time.h>
#include <SDL.h>

#include "pcrlib.h"

SPKRtable *SoundData; //two word pointer to SPKR file, PARA aligned
soundtype soundmode = spkr; //0=nosound, 1=SPKR, 2= adlib...

static byte SndPriority; //current sound's priority

int xormask = 0; //to invert characters
int _dontplay = 0; //set to 1 to avoid all interrupt and timer stuff

static SDL_mutex *AudioMutex;
static SDL_AudioSpec AudioSpec;
static SDL_AudioDeviceID AudioDev;

/*
=============================================================================

                     PC SPEAKER EMULATOR -- by K1n9_Duk3

-----------------------------------------------------------------------------

This emulator was designed to be FAST! The sampled audio data created by this
code might not be 100% true to the output of a real PC Speaker, but it is 
close enough.

The emulator generates a square wave:
     _____       _____       _____       _____       _____       _____
  __|     |     |     |     |     |     |     |     |     |     |     |___
          |_____|     |_____|     |_____|     |_____|     |_____|

=============================================================================
*/

static short	pcVolume = 5000;	// for 16-bit mixing (8-bit should use 20)
static unsigned	pcPhaseTick = 0;
static unsigned	pcPhaseLength;
static boolean	pcActive = false;
static unsigned	pcSamplesPerTick;
static unsigned	pcNumReadySamples = 0;
static word		pcLastSample = 0;
static unsigned	pcLengthLeft;
static word*	pcSound;

#define PC_BASE_TIMER 1193181

// Note: The inline functions do not lock or unlock 'AudioMutex'. Make sure
// that the code calling these functions locks/unlocks the mutex before/after
// calling these functions!

static inline void _SDL_turnOnPCSpeaker(word pcSample)
{
	pcPhaseLength = (pcSample*AudioSpec.freq)/(2*PC_BASE_TIMER);
#ifdef PC_VIBRATO
	//if(pcVolume<0) pcVolume = -pcVolume;
	pcPhaseTick = 0;
#endif
	pcActive = true;
}

static inline void _SDL_turnOffPCSpeaker()
{
	pcActive = false;
	pcPhaseTick = 0;	// Only required in case PC_VIBRATO is not defined
}

static inline void _SDL_PCService()
{
	if(pcSound)
	{
		if(*pcSound!=pcLastSample)
		{
			pcLastSample=*pcSound;
			if(pcLastSample)
				_SDL_turnOnPCSpeaker(pcLastSample);	// don't multiply by 60, just pass the byte value
			else
				_SDL_turnOffPCSpeaker();
		}
		pcSound++;
		pcLengthLeft--;
		if(!pcLengthLeft)
		{
			pcSound=0;
			SndPriority=0;
			_SDL_turnOffPCSpeaker();
		}
	}
}

///////////////////////////////////////////////////////////////////////////
//
//      SDL_PCPlaySound() - Plays the specified sound on the PC speaker
//
///////////////////////////////////////////////////////////////////////////
static void
_SDL_PCPlaySound(int sound)
{
	SDL_LockMutex(AudioMutex);

	pcPhaseTick = 0;
	pcLastSample = 0;	// Must be a value that cannot be played, so the PC Speaker is forced to reset (-1 wraps to 255 so it cannot be used here)
    pcLengthLeft = (SoundData->sounds[sound].start-SoundData->sounds[sound-1].start)>>1;
    pcSound = (word*)(((byte*)SoundData)+SoundData->sounds[sound-1].start);

	SndPriority = SoundData->sounds[sound-1].priority;
	pcSamplesPerTick = AudioSpec.freq / ((PC_BASE_TIMER*SoundData->sounds[sound-1].samplerate)>>16);

	SDL_UnlockMutex(AudioMutex);
}

///////////////////////////////////////////////////////////////////////////
//
//      SDL_PCStopSound() - Stops the current sound playing on the PC Speaker
//
///////////////////////////////////////////////////////////////////////////
static void
_SDL_PCStopSound(void)
{
	SDL_LockMutex(AudioMutex);

    pcSound = 0;
	_SDL_turnOffPCSpeaker();

	SDL_UnlockMutex(AudioMutex);
}

///////////////////////////////////////////////////////////////////////////
//
//      SDL_ShutPC() - Turns off the pc speaker
//
///////////////////////////////////////////////////////////////////////////
static void
_SDL_ShutPC(void)
{
    _SDL_PCStopSound();
}

///////////////////////////////////////////////////////////////////////////
//
//      SDL_PCSpeakerEmulator() - Emulates the pc speaker
//      (replaces SDL_IMFMusicPlayer if no AdLib emulator is present)
//
///////////////////////////////////////////////////////////////////////////
static void UpdateSPKR(void * udata, Uint8 *stream, int len)
{
	if(soundmode != spkr)
	{
		memset(stream, 0, len);
		return;
	}

    int sampleslen = len>>1;
    Sint16 *stream16 = (Sint16 *) (void *) stream;    // expect correct alignment
	
	SDL_LockMutex(AudioMutex);

	do
    {
        if(pcNumReadySamples)
        {
			if(pcActive)
				while(pcNumReadySamples && sampleslen)
				{
					pcNumReadySamples--;
					sampleslen--;

					*stream16++ = pcVolume;

					if(pcPhaseTick++ >= pcPhaseLength)
					{
						pcVolume = -pcVolume;
						pcPhaseTick = 0;
					}
				}
			else
				while(pcNumReadySamples && sampleslen)
				{
					pcNumReadySamples--;
					sampleslen--;

					*stream16++ = 0;
					//stream16 += 2;	// No need to set it to 0. SDL should have done that already.
				}

			if(!sampleslen)
				break;	// We need to unlock the mutex, so we cannot just return!
        }

		_SDL_PCService();

        pcNumReadySamples = pcSamplesPerTick;
    }
    while(pcNumReadySamples);

	SDL_UnlockMutex(AudioMutex);
}

/*
=============================================================================
======================== End of PC Speaker emulator ========================
=============================================================================
*/

//========
//
// StartupSound
//
//========

void StartupSound()
{
	SDL_AudioSpec desired;
	SDL_zero(desired);
	desired.freq = 48000;
	desired.format = AUDIO_S16;
	desired.channels = 1;
	desired.samples = 4096;
	desired.callback = UpdateSPKR;

	if((AudioMutex = SDL_CreateMutex()) == NULL ||
		SDL_InitSubSystem(SDL_INIT_AUDIO) < 0 ||
		(AudioDev = SDL_OpenAudioDevice(NULL, 0, &desired, &AudioSpec, 0)) == 0)
	{
		fprintf(stderr, "Audio initialization failed: %s\n", SDL_GetError());
		soundmode = off;
		_dontplay = 1;
		return;
	}

	// Typical value for init since samplerate is usually 8
	pcSamplesPerTick = AudioSpec.freq / 145;
	soundmode = spkr;
	SDL_PauseAudioDevice(AudioDev, 0);
}

//========
//
// ShutdownSound
//
//========

void ShutdownSound()
{
	if(_dontplay)
		return;

	_SDL_ShutPC();
	SDL_CloseAudio();
}

//===========
//
// PlaySound (soundnum)
//
// If the sound's priority is >= the current priority, SoundPtr, SndPriority,
// and the timer speed are changed
//
//===========

void PlaySound(int sound)
{
	if(_dontplay)
		return;

	if(SoundData->sounds[sound-1].priority >= SndPriority)
		_SDL_PCPlaySound(sound);
}

//===========
//
// StopSound
//
//===========

void StopSound()
{
	if(_dontplay)
		return;

	_SDL_PCStopSound();
}

//===========
//
// PauseSound
//
//===========

static struct
{
	byte SndPriority;
	unsigned pcSamplesPerTick;
	unsigned pcLengthLeft;
	word* pcSound;
} SavedSound;

void PauseSound()
{
	if(_dontplay)
		return;

	SDL_LockMutex(AudioMutex);

	SavedSound.SndPriority = SndPriority;
	SavedSound.pcSamplesPerTick = pcSamplesPerTick;
	SavedSound.pcLengthLeft = pcLengthLeft;
	SavedSound.pcSound = pcSound;

	SndPriority = 0;
	pcLengthLeft = 0;
	pcSound = NULL;
	_SDL_turnOffPCSpeaker();

	SDL_UnlockMutex(AudioMutex);
}

//===========
//
// ContinueSound
//
//===========

void ContinueSound()
{
	if(_dontplay)
		return;

	pcPhaseTick = 0;
	pcLastSample = 0;
	SndPriority = SavedSound.SndPriority;
	pcSamplesPerTick = SavedSound.pcSamplesPerTick;
	pcLengthLeft = SavedSound.pcLengthLeft;
	pcSound = SavedSound.pcSound;
}

//========
//
// WaitendSound
// Just waits around until the current sound stops playing
//
//========

void WaitEndSound()
{
	if(_dontplay)
		return;

	UpdateScreen();
	while(pcSound)
		WaitVBL();
}

static word rndindex;
static byte rndtable[256] = {
	  0,   8, 109, 220, 222, 241, 149, 107,  75, 248, 254, 140,  16,  66,
	 74,  21, 211,  47,  80, 242, 154,  27, 205, 128, 161,  89,  77,  36,
	 95, 110,  85,  48, 212, 140, 211, 249,  22,  79, 200,  50,  28, 188,
	 52, 140, 202, 120,  68, 145,  62,  70, 184, 190,  91, 197, 152, 224,
	149, 104,  25, 178, 252, 182, 202, 182, 141, 197,   4,  81, 181, 242,
	145,  42,  39, 227, 156, 198, 225, 193, 219,  93, 122, 175, 249,   0,
	175, 143,  70, 239,  46, 246, 163,  53, 163, 109, 168, 135,   2, 235,
	 25,  92,  20, 145, 138,  77,  69, 166,  78, 176, 173, 212, 166, 113,
	 94, 161,  41,  50, 239,  49, 111, 164,  70,  60,   2,  37, 171,  75,
	136, 156,  11,  56,  42, 146, 138, 229,  73, 146,  77,  61,  98, 196,
	135, 106,  63, 197, 195,  86,  96, 203, 113, 101, 170, 247, 181, 113,
	 80, 250, 108,   7, 255, 237, 129, 226,  79, 107, 112, 166, 103, 241,
	 24, 223, 239, 120, 198,  58,  60,  82, 128,   3, 184,  66, 143, 224,
	145, 224,  81, 206, 163,  45,  63,  90, 168, 114,  59,  33, 159,  95,
	 28, 139, 123,  98, 125, 196,  15,  70, 194, 253,  54,  14, 109, 226,
	 71,  17, 161,  93, 186,  87, 244, 138,  20,  52, 123, 251,  26,  36,
	 17,  46,  52, 231, 232,  76,  31, 221,  84,  37, 216, 165, 212, 106,
	197, 242,  98,  43,  39, 175, 254, 145, 190,  84, 118, 222, 187, 136,
	120, 163, 236, 249
};
//
// Random # Generator vars
//
static word indexi; // Rnd#Generator
static word indexj;
static word LastRnd;
static word RndArray[17];

static word baseRndArray[] = { 1,1,2,3,5,8,13,21,54,75,129,204,323,527,850,1377,2227 };

//=================================================
//
// Init RND generator
// if randomize is false, the counter is set to 0
//
// 11-Sep-90	LR	FIX initialization to use TIME!
//=================================================

void initrnd(boolean randomize)
{
	memcpy(RndArray, baseRndArray, sizeof(baseRndArray));

	LastRnd = 0;
	indexi = 17;
	indexj = 5;

	if(randomize)
	{
		time_t now = time(NULL);
		RndArray[16] = now&0xFFFF;
		RndArray[4] = (now&0xFFFF)^((now>>16)&0xFFFF);
	}
	rnd(0xFFFF); // warm up generator!
}

//=================================================
//
// Return a random # between 0-?
// Exit : AX = 0-max value
//
// 11-Sep-90 LR -modify to save registers!
//=================================================

int rnd(word maxval)
{
	word mask, shift;
	int val;

	if(maxval == 0)
		return 0;

	mask = 0xFFFF;

	shift = maxval;
	while(!(shift & 0x8000))
	{
		shift <<= 1;
		mask >>= 1;
	}

	val = RndArray[indexi-1] + RndArray[indexj-1] + 1;
	RndArray[indexi-1] = val;
	val += LastRnd;
	LastRnd = val;
	if(--indexi == 0)
		indexi = 17;
	if(--indexj == 0)
		indexj = 17;

	val &= mask;
	if(val > maxval)
		val >>= 1;

	return val;
}

//=================================================
//
// Init table based RND generator
// if randomize is false, the counter is set to 0
//
//=================================================

void initrndt(boolean randomize)
{
	rndindex = randomize ? time(NULL)&0xFF : 0;
}

//=================================================
//
// Return a random # between 0-255
// Exit : AX = value
//
//=================================================

int rndt()
{
	rndindex = (rndindex+1)&0xFF;
	return rndtable[rndindex];
}

enum { VBL_TIME = 1000/70 };
SDL_sem *vblsem;
SDL_TimerID vbltimer;
static Uint32 VBLCallback(Uint32 interval, void *usr)
{
	SDL_SemPost(vblsem);
	return VBL_TIME;
}

static void ShutdownEmulatedVBL(void)
{
	SDL_RemoveTimer(vbltimer);
	SDL_DestroySemaphore(vblsem);
}

void SetupEmulatedVBL()
{
	vblsem = SDL_CreateSemaphore(0);

	vbltimer = SDL_AddTimer(VBL_TIME, VBLCallback, NULL);
	atexit(ShutdownEmulatedVBL);
}

void WaitVBL()
{
	do
	{
		SDL_SemWait(vblsem);
	}
	while(SDL_SemValue(vblsem));
}

void drawchar(int x, int y, int charnum)
{
	byte *vbuf = screenseg + (y<<3)*screenpitch + (x<<3);
	byte *src;
	unsigned i;

	switch(grmode)
	{
	default:
	case EGAgr:
		src = (byte*)charptr + charnum*8;
		for (i = 0;i < 8;++i, ++src)
		{
			const byte chan[4] = {
				src[egaplaneofs[0]],
				src[egaplaneofs[1]],
				src[egaplaneofs[2]],
				src[egaplaneofs[3]]
			};

			*vbuf++ = EGA(chan,7);
			*vbuf++ = EGA(chan,6);
			*vbuf++ = EGA(chan,5);
			*vbuf++ = EGA(chan,4);
			*vbuf++ = EGA(chan,3);
			*vbuf++ = EGA(chan,2);
			*vbuf++ = EGA(chan,1);
			*vbuf = EGA(chan,0);

			vbuf += screenpitch-7;
		}
		break;
	case CGAgr:
		src = (byte*)charptr + charnum*16;
		for (i = 0;i < 8;++i, src += 2)
		{
			*vbuf++ = (src[0]>>6)&3;
			*vbuf++ = (src[0]>>4)&3;
			*vbuf++ = (src[0]>>2)&3;
			*vbuf++ = (src[0]>>0)&3;
			*vbuf++ = (src[1]>>6)&3;
			*vbuf++ = (src[1]>>4)&3;
			*vbuf++ = (src[1]>>2)&3;
			*vbuf = (src[1]>>0)&3;

			vbuf += screenpitch-7;
		}
		break;
	case VGAgr:
		src = (byte*)charptr + charnum*64;
		// [BL] More or less guessing here since we don't have VGA files to
		// test against.
		for (i = 0;i < 8;++i, src += 8, vbuf += screenpitch-7)
			*(qword*)vbuf = *(qword*)src;
		break;
	}
}

void drawpic(int x, int y, int picnum)
{
	byte *vbuf = screenseg + y*screenpitch + x;
	byte *src;
	unsigned i;

	unsigned picwidth = pictable[picnum].width;
	unsigned picheight = pictable[picnum].height;
	src = (byte*)picptr + pictable[picnum].shapeptr;

	switch(grmode)
	{
		default:
		case EGAgr:
			do
			{
				i = picwidth;
				do
				{
					const byte chan[4] = {
						src[egaplaneofs[0]],
						src[egaplaneofs[1]],
						src[egaplaneofs[2]],
						src[egaplaneofs[3]]
					};
					++src;

					*vbuf++ = EGA(chan,7);
					*vbuf++ = EGA(chan,6);
					*vbuf++ = EGA(chan,5);
					*vbuf++ = EGA(chan,4);
					*vbuf++ = EGA(chan,3);
					*vbuf++ = EGA(chan,2);
					*vbuf++ = EGA(chan,1);
					*vbuf++ = EGA(chan,0);
				}
				while(--i);
				vbuf += screenpitch-(picwidth<<3);
			}
			while(--picheight);
			break;
		case CGAgr:
			do
			{
				i = picwidth;
				do
				{
					*vbuf++ = (src[0]>>6)&3;
					*vbuf++ = (src[0]>>4)&3;
					*vbuf++ = (src[0]>>2)&3;
					*vbuf++ = (src[0]>>0)&3;
					++src;
				}
				while(--i);
				vbuf += screenpitch-(picwidth<<2);
			}
			while(--picheight);
			break;
		case VGAgr:
			// [BL] My best guess.
			do
			{
				i = picwidth;
				do
				{
					*vbuf++ = *src++;
				}
				while(--i);
				vbuf += screenpitch-picwidth;
			}
			while(--picheight);
			break;
	}
}
