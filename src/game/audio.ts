/**
 * High-performance Web Audio API Procedural Synthesizer
 * Zero external asset dependencies - Instant low-latency playback
 */

class AudioManager {
  private ctx: AudioContext | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private masterGain: GainNode | null = null;
  private isMusicPlaying = false;
  private musicTimer: number | null = null;
  private tempo = 124; // BPM
  private currentStep = 0;
  private consecutiveCoinCount = 0;
  private lastCoinTime = 0;

  private musicVolume = 0.5;
  private sfxVolume = 0.8;
  private soundEnabled = true;

  constructor() {
    // Initialized lazily on first user interaction
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.soundEnabled ? 1 : 0, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.musicVolume, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.sfxVolume, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setSettings(musicVol: number, sfxVol: number, enabled: boolean) {
    this.musicVolume = Math.max(0, Math.min(1, musicVol));
    this.sfxVolume = Math.max(0, Math.min(1, sfxVol));
    this.soundEnabled = enabled;

    if (this.ctx && this.musicGain && this.sfxGain && this.masterGain) {
      const now = this.ctx.currentTime;
      this.musicGain.gain.setTargetAtTime(this.musicVolume, now, 0.05);
      this.sfxGain.gain.setTargetAtTime(this.sfxVolume, now, 0.05);
      this.masterGain.gain.setTargetAtTime(this.soundEnabled ? 1 : 0, now, 0.05);
    }
  }

  public setTempo(speedFactor: number) {
    // scale from 124 BPM to ~155 BPM as running speed increases
    this.tempo = Math.min(160, 120 + speedFactor * 18);
  }

  // ---- MUSIC SYNTHESIS (Tribal / Adventure Jungle Runner Groove) ----
  public startMusic() {
    this.initCtx();
    if (this.isMusicPlaying) return;
    this.isMusicPlaying = true;
    this.currentStep = 0;
    this.scheduleMusicStep();
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicTimer !== null) {
      clearTimeout(this.musicTimer);
      this.musicTimer = null;
    }
  }

  private scheduleMusicStep() {
    if (!this.isMusicPlaying || !this.ctx || !this.musicGain) return;

    const stepInterval = (60 / this.tempo) / 4; // 16th notes
    const time = this.ctx.currentTime;

    // Bassline / Kick & Percussion Pattern in D Dorian / Ancient Jungle Scale
    const stepInBar = this.currentStep % 16;
    const bar = Math.floor(this.currentStep / 16) % 4;

    // 1. Tribal Kick / Low Log Drum on 0, 4, 8, 10, 14
    if ([0, 4, 8, 10, 14].includes(stepInBar)) {
      this.playDrumKick(time, stepInBar === 0 ? 0.9 : 0.6);
    }

    // 2. Wooden Slit Drum / Tom on 2, 6, 11, 13
    if ([2, 6, 11, 13].includes(stepInBar)) {
      const freq = stepInBar === 6 ? 190 : (stepInBar === 11 ? 240 : 160);
      this.playLogTom(time, freq, 0.5);
    }

    // 3. Shaker / Vine Hi-hat on every odd 16th note
    if (stepInBar % 2 === 1) {
      this.playShaker(time, stepInBar % 4 === 1 ? 0.25 : 0.15);
    }

    // 4. Bass synth (D, F, G, A root variations)
    if ([0, 3, 6, 8, 11, 14].includes(stepInBar)) {
      const bassNotes = [
        [73.42, 73.42, 87.31, 98.00], // D2, D2, F2, G2
        [73.42, 65.41, 73.42, 87.31], // D2, C2, D2, F2
        [98.00, 87.31, 73.42, 65.41], // G2, F2, D2, C2
        [110.00, 98.00, 87.31, 73.42] // A2, G2, F2, D2
      ];
      const noteIdx = Math.floor(stepInBar / 4);
      const note = bassNotes[bar][noteIdx] || 73.42;
      this.playBassNote(time, note, stepInterval * 2.5);
    }

    // 5. Melodic Pan-Flute / Jungle Pluck on selected steps
    if (bar >= 1 && [0, 4, 7, 10, 12].includes(stepInBar)) {
      const melodyScales = [
        [293.66, 349.23, 392.00, 440.00, 523.25], // D4, F4, G4, A4, C5
        [349.23, 392.00, 440.00, 523.25, 587.33], // F4, G4, A4, C5, D5
        [440.00, 392.00, 349.23, 293.66, 261.63],
        [523.25, 587.33, 440.00, 392.00, 293.66]
      ];
      const pitchArr = melodyScales[bar];
      const pitch = pitchArr[stepInBar % pitchArr.length];
      this.playFluteNote(time, pitch, stepInterval * 1.8);
    }

    this.currentStep++;
    this.musicTimer = window.setTimeout(() => {
      this.scheduleMusicStep();
    }, stepInterval * 1000);
  }

  private playDrumKick(time: number, vol = 0.8) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, time);
    osc.frequency.exponentialRampToValueAtTime(32, time + 0.12);

    gain.gain.setValueAtTime(vol * 0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.18);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.2);
  }

  private playLogTom(time: number, freq: number, vol = 0.5) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.45, time + 0.14);

    gain.gain.setValueAtTime(vol * 0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

    osc.connect(gain);
    gain.connect(this.musicGain);
    osc.start(time);
    osc.stop(time + 0.16);
  }

  private playShaker(time: number, vol = 0.2) {
    if (!this.ctx || !this.musicGain) return;
    // Synthesize noise burst for shaker
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol * 0.4, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.045);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    noise.start(time);
    noise.stop(time + 0.05);
  }

  private playBassNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(420, time);
    filter.frequency.exponentialRampToValueAtTime(140, time + duration);

    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  private playFluteNote(time: number, freq: number, duration: number) {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);
    // Subtle vibrato
    osc.frequency.setValueAtTime(freq, time);
    osc.frequency.linearRampToValueAtTime(freq * 1.01, time + duration * 0.6);
    osc.frequency.linearRampToValueAtTime(freq, time + duration);

    gain.gain.setValueAtTime(0.01, time);
    gain.gain.linearRampToValueAtTime(0.2, time + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(time);
    osc.stop(time + duration);
  }

  // ---- SOUND EFFECTS ----

  public playJump() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(560, now + 0.22);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playSlide() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    // Stone gravel friction noise
    const duration = 0.35;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(400, now + duration);
    filter.Q.value = 3.0;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.linearRampToValueAtTime(0.01, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + duration);
  }

  public playLaneSwitch(dir = 0) {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      if (dir < 0) {
        // Left swerve: crisp descending whoosh
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(170, now + 0.13);
      } else if (dir > 0) {
        // Right swerve: crisp ascending whoosh
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(390, now + 0.13);
      } else {
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.12);
      }

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      if (typeof this.ctx.createStereoPanner === 'function') {
        const panner = this.ctx.createStereoPanner();
        panner.pan.setValueAtTime(dir < 0 ? -0.55 : (dir > 0 ? 0.55 : 0), now);
        osc.connect(gain);
        gain.connect(panner);
        panner.connect(this.sfxGain);
      } else {
        osc.connect(gain);
        gain.connect(this.sfxGain);
      }

      osc.start(now);
      osc.stop(now + 0.15);
    } catch {
      // Audio safeguard
    }
  }

  public playCoin() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;

    // Pitch escalation on rapid coin streak
    if (now - this.lastCoinTime < 0.8) {
      this.consecutiveCoinCount = Math.min(12, this.consecutiveCoinCount + 1);
    } else {
      this.consecutiveCoinCount = 0;
    }
    this.lastCoinTime = now;

    const baseFreq = 880; // A5
    const semitones = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24];
    const pitchOffset = semitones[this.consecutiveCoinCount % semitones.length];
    const freq = baseFreq * Math.pow(2, pitchOffset / 12);

    // Two harmonic sine oscillators
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, now);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(freq * 2, now);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.24);
    osc2.stop(now + 0.24);
  }

  public playRelic() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    // Major chord arpeggio
    const chord = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    chord.forEach((note, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = now + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.38);
    });
  }

  public playPowerUp() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    // Rising futuristic power arpeggio
    const notes = [440, 554.37, 659.25, 880, 1108.73];
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + idx * 0.05;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public playShieldHit() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(60, now + 0.3);

    gain.gain.setValueAtTime(0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.32);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  public playCrash() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;

    // 1. Low boom
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.52);

    // 2. Crunchy noise burst
    const dur = 0.4;
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.5, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + dur);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + dur);
  }

  public playGameOver() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    const chord = [392.00, 369.99, 329.63, 293.66]; // Descending melancholy
    chord.forEach((freq, i) => {
      if (!this.ctx || !this.sfxGain) return;
      const t = now + i * 0.16;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.3, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playClick() {
    this.initCtx();
    if (!this.ctx || !this.sfxGain || !this.soundEnabled) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.04);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const audio = new AudioManager();
