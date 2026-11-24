import { CharacterId } from '../types/game';

export type OstTrackId =
  | 'title'
  | 'daily_life'
  | 'body_discovery'
  | 'investigation'
  | 'alibi_puzzle'
  | 'trial_debate'
  | 'trial_scrum'
  | 'trial_climax'
  | 'epilogue';

export interface SceneOstInfo {
  id: OstTrackId;
  trackName: string;
  subtitle: string;
  bpm: number;
  notes: number[];
  bass: number[];
  arp: number[];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
  arpWave: OscillatorType;
  hasDrums: boolean;
  filterHz: number;
  leadGain: number;
  bassGain: number;
  arpGain: number;
}

export const SCENE_OST_MAP: Record<OstTrackId, SceneOstInfo> = {
  title: {
    id: 'title',
    trackName: 'Beautiful Saber 11° (Tema Principal)',
    subtitle: 'Obertura sintética V3 · 124 BPM',
    bpm: 124,
    notes: [
      392.0, 0, 493.88, 587.33, 659.25, 0, 587.33, 493.88,
      440.0, 0, 523.25, 659.25, 783.99, 659.25, 587.33, 493.88,
    ],
    bass: [98.0, 98.0, 123.47, 123.47, 110.0, 110.0, 130.81, 146.83],
    arp: [196.0, 246.94, 293.66, 392.0, 220.0, 261.63, 329.63, 440.0],
    leadWave: 'triangle',
    bassWave: 'sawtooth',
    arpWave: 'sine',
    hasDrums: true,
    filterHz: 2200,
    leadGain: 0.032,
    bassGain: 0.035,
    arpGain: 0.02,
  },
  daily_life: {
    id: 'daily_life',
    trackName: 'Maíz & Desesperación (Vida Diaria)',
    subtitle: 'Groove escolar optimista · 112 BPM',
    bpm: 112,
    notes: [
      523.25, 659.25, 0, 587.33, 523.25, 0, 440.0, 493.88,
      523.25, 659.25, 783.99, 0, 659.25, 587.33, 523.25, 0,
    ],
    bass: [130.81, 0, 164.81, 196.0, 110.0, 0, 146.83, 196.0],
    arp: [261.63, 329.63, 392.0, 493.88, 220.0, 261.63, 329.63, 392.0],
    leadWave: 'sine',
    bassWave: 'triangle',
    arpWave: 'sine',
    hasDrums: true,
    filterHz: 2600,
    leadGain: 0.034,
    bassGain: 0.038,
    arpGain: 0.018,
  },
  body_discovery: {
    id: 'body_discovery',
    trackName: '¡Ding-Dong! Desesperación Oscura',
    subtitle: 'Tensión y alarma en el ICFES · 94 BPM',
    bpm: 94,
    notes: [
      311.13, 0, 0, 293.66, 0, 0, 277.18, 0,
      311.13, 0, 466.16, 0, 440.0, 0, 311.13, 0,
    ],
    bass: [77.78, 77.78, 73.42, 73.42, 69.3, 69.3, 73.42, 77.78],
    arp: [155.56, 233.08, 220.0, 155.56, 146.83, 220.0, 207.65, 146.83],
    leadWave: 'sine',
    bassWave: 'sawtooth',
    arpWave: 'triangle',
    hasDrums: false,
    filterHz: 1400,
    leadGain: 0.036,
    bassGain: 0.034,
    arpGain: 0.022,
  },
  investigation: {
    id: 'investigation',
    trackName: 'Box 15: Expediente ICFES',
    subtitle: 'Tema de investigación nocturna · 110 BPM',
    bpm: 110,
    notes: [
      440.0, 0, 523.25, 0, 493.88, 440.0, 392.0, 0,
      349.23, 0, 440.0, 0, 392.0, 329.63, 293.66, 0,
    ],
    bass: [110.0, 110.0, 130.81, 110.0, 98.0, 98.0, 123.47, 98.0],
    arp: [220.0, 261.63, 329.63, 261.63, 196.0, 246.94, 293.66, 246.94],
    leadWave: 'triangle',
    bassWave: 'triangle',
    arpWave: 'sine',
    hasDrums: true,
    filterHz: 1850,
    leadGain: 0.03,
    bassGain: 0.038,
    arpGain: 0.02,
  },
  alibi_puzzle: {
    id: 'alibi_puzzle',
    trackName: 'Alibi Sync · Pulso Lógico',
    subtitle: 'Secuencia rápida de captura · 128 BPM',
    bpm: 128,
    notes: [
      523.25, 0, 659.25, 587.33, 0, 523.25, 659.25, 783.99,
      659.25, 0, 587.33, 523.25, 440.0, 493.88, 523.25, 0,
    ],
    bass: [130.81, 130.81, 146.83, 146.83, 110.0, 110.0, 123.47, 130.81],
    arp: [261.63, 392.0, 523.25, 392.0, 220.0, 329.63, 440.0, 329.63],
    leadWave: 'square',
    bassWave: 'triangle',
    arpWave: 'sine',
    hasDrums: true,
    filterHz: 2100,
    leadGain: 0.025,
    bassGain: 0.038,
    arpGain: 0.022,
  },
  trial_debate: {
    id: 'trial_debate',
    trackName: 'Class Trial: Resurrección Solar',
    subtitle: 'Debate de alta tensión · 138 BPM',
    bpm: 138,
    notes: [
      329.63, 392.0, 493.88, 329.63, 523.25, 493.88, 392.0, 329.63,
      293.66, 349.23, 440.0, 293.66, 493.88, 440.0, 392.0, 329.63,
    ],
    bass: [82.41, 82.41, 98.0, 82.41, 73.42, 73.42, 87.31, 98.0],
    arp: [164.81, 246.94, 329.63, 246.94, 146.83, 220.0, 293.66, 220.0],
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
    arpWave: 'triangle',
    hasDrums: true,
    filterHz: 2000,
    leadGain: 0.024,
    bassGain: 0.034,
    arpGain: 0.02,
  },
  trial_scrum: {
    id: 'trial_scrum',
    trackName: 'Debate Scrum: Bando vs Bando',
    subtitle: 'Tema épico V3 de confrontación · 146 BPM',
    bpm: 146,
    notes: [
      440.0, 523.25, 659.25, 783.99, 659.25, 587.33, 523.25, 440.0,
      493.88, 587.33, 659.25, 880.0, 783.99, 659.25, 587.33, 493.88,
    ],
    bass: [110.0, 110.0, 130.81, 146.83, 123.47, 123.47, 146.83, 164.81],
    arp: [220.0, 329.63, 440.0, 659.25, 246.94, 349.23, 493.88, 659.25],
    leadWave: 'square',
    bassWave: 'sawtooth',
    arpWave: 'triangle',
    hasDrums: true,
    filterHz: 2500,
    leadGain: 0.028,
    bassGain: 0.036,
    arpGain: 0.024,
  },
  trial_climax: {
    id: 'trial_climax',
    trackName: 'Armamento & Clímax Final',
    subtitle: 'La verdad absoluta se abre paso · 144 BPM',
    bpm: 144,
    notes: [
      523.25, 659.25, 783.99, 659.25, 880.0, 783.99, 659.25, 587.33,
      523.25, 587.33, 659.25, 783.99, 1046.5, 987.77, 880.0, 783.99,
    ],
    bass: [130.81, 130.81, 164.81, 164.81, 146.83, 146.83, 196.0, 196.0],
    arp: [261.63, 392.0, 523.25, 659.25, 293.66, 440.0, 587.33, 783.99],
    leadWave: 'sawtooth',
    bassWave: 'square',
    arpWave: 'sine',
    hasDrums: true,
    filterHz: 2400,
    leadGain: 0.028,
    bassGain: 0.035,
    arpGain: 0.024,
  },
  epilogue: {
    id: 'epilogue',
    trackName: 'Amanecer en Bogotá (Esperanza)',
    subtitle: 'Tema cálido del Epílogo · 102 BPM',
    bpm: 102,
    notes: [
      523.25, 0, 587.33, 659.25, 783.99, 0, 659.25, 587.33,
      523.25, 0, 440.0, 523.25, 587.33, 0, 523.25, 0,
    ],
    bass: [130.81, 130.81, 164.81, 164.81, 110.0, 110.0, 146.83, 196.0],
    arp: [261.63, 329.63, 392.0, 523.25, 220.0, 261.63, 329.63, 440.0],
    leadWave: 'sine',
    bassWave: 'triangle',
    arpWave: 'sine',
    hasDrums: false,
    filterHz: 2600,
    leadGain: 0.036,
    bassGain: 0.036,
    arpGain: 0.022,
  },
};

export interface ExecutionOstInfo {
  trackName: string;
  subtitle: string;
  bpm: number;
  notes: number[];
  bass: number[];
  leadWave: OscillatorType;
  bassWave: OscillatorType;
}

export const EXECUTION_OST_MAP: Record<string, ExecutionOstInfo> = {
  sebastian: {
    trackName: 'Tejo del Juicio Finale (OST Cap. 1)',
    subtitle: 'Marcha chiptune boyacense a 144 BPM',
    bpm: 144,
    notes: [440, 523.25, 659.25, 587.33, 523.25, 440, 392, 440, 523.25, 659.25, 783.99, 659.25],
    bass: [110, 110, 130.81, 130.81, 98, 98, 110, 110],
    leadWave: 'square',
    bassWave: 'sawtooth',
  },
  santiago: {
    trackName: 'Carnaval Químico 8-Bit (OST Cap. 2)',
    subtitle: 'Marimba sintética y arpegio efervescente a 138 BPM',
    bpm: 138,
    notes: [587.33, 698.46, 880, 698.46, 659.25, 587.33, 523.25, 587.33, 783.99, 880, 987.77, 880],
    bass: [146.83, 174.61, 130.81, 146.83],
    leadWave: 'triangle',
    bassWave: 'square',
  },
  andres: {
    trackName: 'Error 404: Compilación Fatal (OST Cap. 3)',
    subtitle: 'Chiptune industrial oscuro a 152 BPM',
    bpm: 152,
    notes: [329.63, 349.23, 493.88, 329.63, 659.25, 587.33, 493.88, 392, 329.63, 311.13, 293.66, 329.63],
    bass: [82.41, 82.41, 98, 92.5, 82.41, 82.41, 73.42, 82.41],
    leadWave: 'sawtooth',
    bassWave: 'sawtooth',
  },
  juanpablo: {
    trackName: 'Péndulo de Cero (OST Cap. 4)',
    subtitle: 'Vals mecánico de relojería en 3/4 a 128 BPM',
    bpm: 128,
    notes: [440, 523.25, 659.25, 440, 523.25, 659.25, 415.3, 493.88, 659.25, 415.3, 493.88, 659.25],
    bass: [110, 164.81, 164.81, 103.83, 164.81, 164.81],
    leadWave: 'triangle',
    bassWave: 'triangle',
  },
  camila: {
    trackName: 'Réquiem de la Selva (OST Cap. 5)',
    subtitle: 'Caja musical trágica y arpa botánica a 108 BPM',
    bpm: 108,
    notes: [659.25, 587.33, 523.25, 493.88, 440, 523.25, 493.88, 440, 392, 440, 523.25, 493.88],
    bass: [110, 87.31, 98, 82.41],
    leadWave: 'sine',
    bassWave: 'triangle',
  },
  sofia: {
    trackName: 'Última Hora Mortal (OST Cap. 6)',
    subtitle: 'Jazz-rock frenético de sala de prensa a 148 BPM',
    bpm: 148,
    notes: [493.88, 587.33, 659.25, 739.99, 659.25, 587.33, 493.88, 440, 493.88, 659.25, 783.99, 739.99],
    bass: [123.47, 146.83, 164.81, 146.83],
    leadWave: 'square',
    bassWave: 'sawtooth',
  },
  mateo: {
    trackName: '¡Error 500: Prensa Saber 11°! (OST Cap. 5)',
    subtitle: 'Salsa-synth frenética y escape subterráneo a 146 BPM',
    bpm: 146,
    notes: [523.25, 587.33, 659.25, 783.99, 659.25, 587.33, 523.25, 493.88, 523.25, 659.25, 880, 783.99],
    bass: [130.81, 146.83, 164.81, 123.47],
    leadWave: 'square',
    bassWave: 'sawtooth',
  },
  laura: {
    trackName: 'Adiós, Desesperación 000 (OST Cap. 7)',
    subtitle: 'Clímax orquestal V3: de la caída al amanecer en Bogotá',
    bpm: 134,
    notes: [392, 440, 523.25, 659.25, 587.33, 523.25, 659.25, 783.99, 880, 783.99, 659.25, 1046.5],
    bass: [98, 110, 130.81, 146.83],
    leadWave: 'sawtooth',
    bassWave: 'square',
  },
};

class OstSequencer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterFilter: BiquadFilterNode | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private timer: number | null = null;
  private step = 0;
  private activeMode: 'none' | 'scene' | 'execution' = 'none';
  private currentSceneTrack: OstTrackId | null = null;
  private desiredSceneTrack: OstTrackId | null = null;
  private ducked = false;
  public muted = false;

  private getCtx(): AudioContext | null {
    if (this.muted || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterFilter = this.ctx.createBiquadFilter();
        this.masterFilter.type = 'lowpass';
        this.masterFilter.frequency.value = 2400;

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = this.ducked ? 0.55 : 1.0;

        this.masterFilter.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);

        // Reusable short white-noise buffer for drums
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.05);
        this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = this.noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Call inside any user gesture so browsers unlock Web Audio immediately */
  unlockFromGesture() {
    const ctx = this.getCtx();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume().then(() => {
        if (this.desiredSceneTrack && this.activeMode === 'none' && !this.muted) {
          this.playSceneTrack(this.desiredSceneTrack);
        }
      }).catch(() => {});
    } else if (this.desiredSceneTrack && this.activeMode === 'none' && !this.muted) {
      this.playSceneTrack(this.desiredSceneTrack);
    }
  }

  setDucked(isDucked: boolean) {
    this.ducked = isDucked;
    if (this.ctx && this.masterGain) {
      this.masterGain.gain.setTargetAtTime(
        isDucked ? 0.52 : 1.0,
        this.ctx.currentTime,
        0.08
      );
    }
  }

  setMuted(m: boolean) {
    this.muted = m;
    if (m) {
      this.stopTimerOnly();
    } else if (this.desiredSceneTrack && this.activeMode !== 'execution') {
      this.playSceneTrack(this.desiredSceneTrack);
    }
  }

  getCurrentTrackLabel(): string | null {
    if (this.activeMode === 'scene' && this.currentSceneTrack) {
      return SCENE_OST_MAP[this.currentSceneTrack].trackName;
    }
    return null;
  }

  private stopTimerOnly() {
    if (this.timer !== null && typeof window !== 'undefined') {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.step = 0;
  }

  stop() {
    this.stopTimerOnly();
    this.activeMode = 'none';
    this.currentSceneTrack = null;
  }

  /** Starts or smoothly switches background OST track without restarting if identical */
  playSceneTrack(trackId: OstTrackId) {
    this.desiredSceneTrack = trackId;
    if (this.muted || typeof window === 'undefined') return;
    if (
      this.activeMode === 'scene' &&
      this.currentSceneTrack === trackId &&
      this.timer !== null
    ) {
      return;
    }

    const ctx = this.getCtx();
    if (!ctx || !this.masterFilter) return;

    this.stopTimerOnly();
    this.activeMode = 'scene';
    this.currentSceneTrack = trackId;

    const info = SCENE_OST_MAP[trackId];
    const stepMs = Math.round((60 / info.bpm / 2) * 1000);
    this.masterFilter.frequency.setTargetAtTime(info.filterHz, ctx.currentTime, 0.12);

    const tick = () => {
      if (this.muted || this.activeMode !== 'scene') return;
      const activeCtx = this.getCtx();
      if (!activeCtx || activeCtx.state !== 'running' || !this.masterFilter) return;

      const now = activeCtx.currentTime;
      const stepDur = stepMs / 1000;
      const leadFreq = info.notes[this.step % info.notes.length];
      const bassFreq = info.bass[Math.floor(this.step / 2) % info.bass.length];
      const arpFreq = info.arp[this.step % info.arp.length];

      // Melodic Lead
      if (leadFreq > 0) {
        const leadOsc = activeCtx.createOscillator();
        const leadGain = activeCtx.createGain();
        leadOsc.type = info.leadWave;
        leadOsc.frequency.setValueAtTime(leadFreq, now);
        leadGain.gain.setValueAtTime(0.001, now);
        leadGain.gain.linearRampToValueAtTime(info.leadGain, now + 0.018);
        leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepDur * 1.45);
        leadOsc.connect(leadGain);
        leadGain.connect(this.masterFilter);
        leadOsc.start(now);
        leadOsc.stop(now + stepDur * 1.5);
      }

      // Harmonic Arpeggio / Pad
      if (arpFreq > 0) {
        const arpOsc = activeCtx.createOscillator();
        const arpGain = activeCtx.createGain();
        arpOsc.type = info.arpWave;
        arpOsc.frequency.setValueAtTime(arpFreq, now);
        arpGain.gain.setValueAtTime(0.001, now);
        arpGain.gain.linearRampToValueAtTime(info.arpGain, now + 0.01);
        arpGain.gain.exponentialRampToValueAtTime(0.001, now + stepDur * 0.95);
        arpOsc.connect(arpGain);
        arpGain.connect(this.masterFilter);
        arpOsc.start(now);
        arpOsc.stop(now + stepDur);
      }

      // Bassline every 2 eighth-notes
      if (this.step % 2 === 0 && bassFreq > 0) {
        const bassOsc = activeCtx.createOscillator();
        const bassGain = activeCtx.createGain();
        bassOsc.type = info.bassWave;
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.001, now);
        bassGain.gain.linearRampToValueAtTime(info.bassGain, now + 0.015);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDur * 1.85);
        bassOsc.connect(bassGain);
        bassGain.connect(this.masterFilter);
        bassOsc.start(now);
        bassOsc.stop(now + stepDur * 1.9);
      }

      // Crisp Kick & Hi-Hat Groove
      if (info.hasDrums && this.noiseBuffer) {
        if (this.step % 4 === 0) {
          const kickOsc = activeCtx.createOscillator();
          const kickGain = activeCtx.createGain();
          kickOsc.type = 'sine';
          kickOsc.frequency.setValueAtTime(115, now);
          kickOsc.frequency.exponentialRampToValueAtTime(42, now + 0.09);
          kickGain.gain.setValueAtTime(0.05, now);
          kickGain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
          kickOsc.connect(kickGain);
          kickGain.connect(this.masterFilter);
          kickOsc.start(now);
          kickOsc.stop(now + 0.11);
        } else {
          const noise = activeCtx.createBufferSource();
          noise.buffer = this.noiseBuffer;
          const hp = activeCtx.createBiquadFilter();
          hp.type = 'highpass';
          hp.frequency.setValueAtTime(this.step % 4 === 2 ? 2200 : 5400, now);
          const nGain = activeCtx.createGain();
          nGain.gain.setValueAtTime(this.step % 4 === 2 ? 0.022 : 0.01, now);
          nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.038);
          noise.connect(hp);
          hp.connect(nGain);
          nGain.connect(this.masterFilter);
          noise.start(now);
        }
      }

      this.step++;
    };

    tick();
    this.timer = window.setInterval(tick, stepMs);
  }

  /** Plays the iconic Monokuma 8-bit Execution Intro Fanfare ("Reach for the Stars" vibe) */
  playExecutionIntro() {
    const ctx = this.getCtx();
    if (!ctx) return;
    const notes = [523.25, 659.25, 783.99, 659.25, 880, 987.77, 1046.5];
    const now = ctx.currentTime;
    notes.forEach((freq, idx) => {
      const start = now + idx * 0.13;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.055, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.125);
    });
  }

  playExecutionOst(culpritId: CharacterId) {
    this.stopTimerOnly();
    this.activeMode = 'execution';
    this.currentSceneTrack = null;
    if (this.muted) return;
    const info =
      EXECUTION_OST_MAP[culpritId] || EXECUTION_OST_MAP.sebastian;
    const stepMs = Math.round((60 / info.bpm / 2) * 1000);

    this.playExecutionIntro();

    this.timer = window.setInterval(() => {
      if (this.muted || this.activeMode !== 'execution') return;
      const ctx = this.getCtx();
      if (!ctx) return;

      const now = ctx.currentTime;
      const leadFreq = info.notes[this.step % info.notes.length];
      const bassFreq = info.bass[this.step % info.bass.length];

      // Lead voice
      const leadOsc = ctx.createOscillator();
      const leadGain = ctx.createGain();
      leadOsc.type = info.leadWave;
      leadOsc.frequency.setValueAtTime(leadFreq, now);
      leadGain.gain.setValueAtTime(0.042, now);
      leadGain.gain.exponentialRampToValueAtTime(0.001, now + stepMs / 1000);
      leadOsc.connect(leadGain);
      leadGain.connect(ctx.destination);
      leadOsc.start(now);
      leadOsc.stop(now + stepMs / 1000);

      // Bass / Rhythm pulse
      if (this.step % 2 === 0) {
        const bassOsc = ctx.createOscillator();
        const bassGain = ctx.createGain();
        bassOsc.type = info.bassWave;
        bassOsc.frequency.setValueAtTime(bassFreq, now);
        bassGain.gain.setValueAtTime(0.05, now);
        bassGain.gain.exponentialRampToValueAtTime(0.001, now + (stepMs * 1.8) / 1000);
        bassOsc.connect(bassGain);
        bassGain.connect(ctx.destination);
        bassOsc.start(now);
        bassOsc.stop(now + (stepMs * 1.8) / 1000);
      }

      // Percussive hi-hat/snare noise burst on offbeats
      if (this.noiseBuffer) {
        const noise = ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(this.step % 4 === 2 ? 1800 : 5200, now);
        const nGain = ctx.createGain();
        nGain.gain.setValueAtTime(this.step % 4 === 2 ? 0.04 : 0.018, now);
        nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        noise.connect(filter);
        filter.connect(nGain);
        nGain.connect(ctx.destination);
        noise.start(now);
      }

      this.step++;
    }, stepMs);
  }
}

export const ost = new OstSequencer();
