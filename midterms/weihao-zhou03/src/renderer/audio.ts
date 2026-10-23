import type { PublicObservation } from '../core/types.ts';

/** Synthesized locally. Only public events select cues; audio never advances rules. */
export class SeaAudio {
  private context: AudioContext | null = null;
  enabled = false;
  async toggle(): Promise<boolean> {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.context ??= new AudioContext();
      await this.context.resume();
      this.tone(410, .14, .07);
    }
    return this.enabled;
  }
  private tone(frequency: number, duration: number, volume: number, pan = 0, type: OscillatorType = 'sine') {
    if (!this.enabled || !this.context) return;
    const now = this.context.currentTime;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    const panner = this.context.createStereoPanner();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, now);
    oscillator.frequency.exponentialRampToValueAtTime(frequency * .73, now + duration);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, now + duration);
    panner.pan.value = Math.max(-.6, Math.min(.6, pan));
    oscillator.connect(gain).connect(panner).connect(this.context.destination);
    oscillator.start(now); oscillator.stop(now + duration + .03);
  }
  play(observation: PublicObservation) {
    for (const event of observation.events) {
      // Position has exactly the precision made available in the public event.
      const pan = event.position ? (event.position.x - observation.boat.position.x) / 70 : 0;
      if (event.kind === 'sonar') this.tone((event.intensity ?? 0) > 5 ? 590 : 810, .8, .07, pan);
      else if (event.kind === 'windup') { this.tone(140, .4, .065, pan, 'triangle'); setTimeout(() => this.tone(190, .35, .05, pan, 'triangle'), 270); }
      else if (event.kind === 'damage') this.tone(65, .45, .1, pan, 'triangle');
      else if (event.kind === 'caught') { this.tone(540, .18, .07); setTimeout(() => this.tone(810, .35, .06), 130); }
      else if (event.kind === 'beacon_sound') {
        if (event.text.includes('低鸣')) this.tone(120, .75, .04, pan, 'triangle');
        else { this.tone(510, .3, .04, pan); setTimeout(() => this.tone(680, .24, .03, pan), 200); }
      }
      else if (event.kind === 'deploy') this.tone(330, .2, .035, pan);
      else if (event.kind === 'hooked' || event.kind === 'reel') this.tone(180, .2, .04, pan, 'triangle');
    }
  }
}
