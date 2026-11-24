import { CharacterId } from '../types/game';

interface VoiceProfile {
  pitch: number;
  rate: number;
  baseFreq: number;
  formantFreq: number;
  cadenceMs: number;
  preferFemale: boolean;
  label: string;
}

export const VOICE_PROFILES: Record<CharacterId, VoiceProfile> = {
  monokuma: {
    pitch: 1.55,
    rate: 1.18,
    baseFreq: 520,
    formantFreq: 1350,
    cadenceMs: 75,
    preferFemale: false,
    label: 'Chillido Bicolor V3',
  },
  mateo: {
    pitch: 1.05,
    rate: 1.05,
    baseFreq: 165,
    formantFreq: 720,
    cadenceMs: 85,
    preferFemale: false,
    label: 'Tenor Paisa Analítico',
  },
  valentina: {
    pitch: 1.18,
    rate: 1.06,
    baseFreq: 255,
    formantFreq: 1080,
    cadenceMs: 80,
    preferFemale: true,
    label: 'Soprano Rola Firme',
  },
  sebastian: {
    pitch: 0.92,
    rate: 1.12,
    baseFreq: 135,
    formantFreq: 620,
    cadenceMs: 78,
    preferFemale: false,
    label: 'Barítono Boyacense',
  },
  camila: {
    pitch: 1.24,
    rate: 1.08,
    baseFreq: 270,
    formantFreq: 1120,
    cadenceMs: 80,
    preferFemale: true,
    label: 'Voz Caleña Melódica',
  },
  andres: {
    pitch: 0.98,
    rate: 1.14,
    baseFreq: 150,
    formantFreq: 680,
    cadenceMs: 70,
    preferFemale: false,
    label: 'Tenor Seco Santandereano',
  },
  lucia: {
    pitch: 1.2,
    rate: 1.02,
    baseFreq: 260,
    formantFreq: 1050,
    cadenceMs: 90,
    preferFemale: true,
    label: 'Mezzo Vallenata',
  },
  santiago: {
    pitch: 0.96,
    rate: 1.04,
    baseFreq: 145,
    formantFreq: 660,
    cadenceMs: 88,
    preferFemale: false,
    label: 'Voz Costeña Relajada',
  },
  sofia: {
    pitch: 1.22,
    rate: 1.15,
    baseFreq: 265,
    formantFreq: 1150,
    cadenceMs: 72,
    preferFemale: true,
    label: 'Voz Periodística Ágil',
  },
  juanpablo: {
    pitch: 0.88,
    rate: 0.98,
    baseFreq: 128,
    formantFreq: 590,
    cadenceMs: 95,
    preferFemale: false,
    label: 'Barítono Metódico',
  },
  isabela: {
    pitch: 1.14,
    rate: 0.98,
    baseFreq: 235,
    formantFreq: 980,
    cadenceMs: 92,
    preferFemale: true,
    label: 'Alto Cálida de Popayán',
  },
  nicolas: {
    pitch: 1.32,
    rate: 1.16,
    baseFreq: 215,
    formantFreq: 960,
    cadenceMs: 70,
    preferFemale: false,
    label: 'Tenor Teatral Camaleónico',
  },
  mariana: {
    pitch: 1.28,
    rate: 1.18,
    baseFreq: 285,
    formantFreq: 1180,
    cadenceMs: 68,
    preferFemale: true,
    label: 'Soprano Hiperactiva',
  },
  esteban: {
    pitch: 0.84,
    rate: 0.94,
    baseFreq: 118,
    formantFreq: 540,
    cadenceMs: 98,
    preferFemale: false,
    label: 'Bajo Solemne Cartagenero',
  },
  paula: {
    pitch: 1.25,
    rate: 0.96,
    baseFreq: 275,
    formantFreq: 1100,
    cadenceMs: 92,
    preferFemale: true,
    label: 'Voz Suave Artística',
  },
  diego: {
    pitch: 0.82,
    rate: 0.96,
    baseFreq: 112,
    formantFreq: 520,
    cadenceMs: 94,
    preferFemale: false,
    label: 'Bajo Grave Protector',
  },
  laura: {
    pitch: 1.04,
    rate: 0.95,
    baseFreq: 220,
    formantFreq: 910,
    cadenceMs: 95,
    preferFemale: true,
    label: 'Alto Fría Criptográfica',
  },
  narrador: {
    pitch: 1.0,
    rate: 1.02,
    baseFreq: 155,
    formantFreq: 700,
    cadenceMs: 85,
    preferFemale: false,
    label: 'Narrador',
  },
};

export function estimateSpeechDurationMs(text: string, rate = 1.0): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const chars = text.trim().length;
  const byWords = (words / (2.5 * Math.max(0.7, rate))) * 1000;
  const byChars = (chars * 54) / Math.max(0.7, rate);
  return Math.max(1900, Math.min(8200, Math.round(Math.max(byWords, byChars) + 450)));
}

class VoiceActingEngine {
  private enabled = true;
  private muted = false;
  private ctx: AudioContext | null = null;
  private speakToken = 0;
  private fallbackTimer: number | null = null;
  private activeUtter: SpeechSynthesisUtterance | null = null;

  setMuted(m: boolean) {
    this.muted = m;
    if (m) this.stop();
  }

  setEnabled(e: boolean) {
    this.enabled = e;
    if (!e) this.stop();
  }

  isEnabled() {
    return this.enabled && !this.muted;
  }

  private clearFallbackTimer() {
    if (this.fallbackTimer !== null && typeof window !== 'undefined') {
      window.clearTimeout(this.fallbackTimer);
      this.fallbackTimer = null;
    }
  }

  stop() {
    this.speakToken++;
    this.clearFallbackTimer();
    this.activeUtter = null;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        // ignore
      }
    }
  }

  private getCtx(): AudioContext | null {
    if (this.muted || !this.enabled || typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Plays a Danganronpa-style character vocal formant burst (guaranteed instant feedback) */
  playVocalBurst(characterId: CharacterId, syllables = 3) {
    if (!this.isEnabled() || characterId === 'narrador') return;
    const ctx = this.getCtx();
    if (!ctx) return;

    const profile = VOICE_PROFILES[characterId];
    const now = ctx.currentTime;

    for (let i = 0; i < syllables; i++) {
      const start = now + i * (profile.cadenceMs / 1000);
      const dur = 0.065;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = characterId === 'monokuma' ? 'square' : 'sawtooth';
      const jitter = i % 2 === 0 ? 1.08 : 0.94;
      osc.frequency.setValueAtTime(profile.baseFreq * jitter, start);
      if (characterId === 'monokuma') {
        osc.frequency.exponentialRampToValueAtTime(profile.baseFreq * 1.35, start + dur);
      }

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(profile.formantFreq, start);
      filter.Q.setValueAtTime(3.2, start);

      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.04, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + dur + 0.01);
    }
  }

  /**
   * Speaks full Spanish dialogue line using tuned Web Speech API + character vocal burst.
   * Fires `onEnd` once the full utterance finishes (or after estimated reading time when
   * speechSynthesis is muted/unavailable). Returns a cancel function for this utterance.
   */
  speak(
    characterId: CharacterId,
    text: string,
    opts?: { interrupt?: boolean; burstOnly?: boolean; onEnd?: () => void }
  ): () => void {
    const cleanText = text.replace(/[«»“”"]/g, '').trim();
    const profile = VOICE_PROFILES[characterId];
    const estimatedMs = estimateSpeechDurationMs(cleanText, profile.rate);

    if (opts?.interrupt !== false) {
      this.speakToken++;
      this.clearFallbackTimer();
    }
    const token = this.speakToken;

    let finished = false;
    const finishOnce = () => {
      if (finished || token !== this.speakToken) return;
      finished = true;
      this.clearFallbackTimer();
      this.activeUtter = null;
      opts?.onEnd?.();
    };

    if (!cleanText) {
      if (opts?.onEnd && typeof window !== 'undefined') {
        const t = window.setTimeout(finishOnce, 250);
        return () => {
          finished = true;
          window.clearTimeout(t);
        };
      }
      return () => {};
    }

    if (!this.isEnabled()) {
      // Even when muted, honor onEnd after natural reading duration for synchronized scenes
      if (opts?.onEnd && typeof window !== 'undefined') {
        this.fallbackTimer = window.setTimeout(finishOnce, estimatedMs);
      }
      return () => {
        finished = true;
        this.clearFallbackTimer();
      };
    }

    // Play instant Danganronpa vocal timbre burst
    this.playVocalBurst(characterId, characterId === 'monokuma' ? 4 : 3);

    if (opts?.burstOnly) {
      if (opts?.onEnd && typeof window !== 'undefined') {
        this.fallbackTimer = window.setTimeout(finishOnce, estimatedMs);
      }
      return () => {
        finished = true;
        this.clearFallbackTimer();
      };
    }

    if (typeof window !== 'undefined') {
      if ('speechSynthesis' in window) {
        try {
          if (opts?.interrupt !== false) {
            window.speechSynthesis.cancel();
          }
          const utter = new SpeechSynthesisUtterance(cleanText);
          utter.lang = 'es-CO';
          utter.pitch = profile.pitch;
          utter.rate = profile.rate;
          utter.volume = 0.88;

          const voices = window.speechSynthesis.getVoices();
          if (voices.length > 0) {
            const spanishVoices = voices.filter((v) =>
              v.lang.toLowerCase().startsWith('es')
            );
            const pool = spanishVoices.length > 0 ? spanishVoices : voices;
            const preferred =
              pool.find((v) =>
                profile.preferFemale
                  ? /female|mujer|paulina|monica|helena|sabina|laura|camila|sofia/i.test(
                      v.name
                    )
                  : /male|hombre|jorge|diego|pablo|carlos|raul|juan/i.test(v.name)
              ) || pool[0];
            if (preferred) {
              utter.voice = preferred;
            }
          }

          // Prevent garbage collection of utterance before onend fires in Chrome
          this.activeUtter = utter;
          utter.onend = () => finishOnce();
          utter.onerror = () => {
            // If speech error occurs, wait remaining reading estimate instead of cutting short
            this.clearFallbackTimer();
            this.fallbackTimer = window.setTimeout(
              finishOnce,
              Math.min(3500, estimatedMs)
            );
          };

          // Upper-bound safety timeout in case browser speechSynthesis stalls without firing onend
          this.fallbackTimer = window.setTimeout(finishOnce, estimatedMs + 1600);
          window.speechSynthesis.speak(utter);
        } catch {
          this.fallbackTimer = window.setTimeout(finishOnce, estimatedMs);
        }
      } else {
        this.fallbackTimer = globalThis.setTimeout(finishOnce, estimatedMs) as unknown as number;
      }
    }

    return () => {
      finished = true;
      if (token === this.speakToken) {
        this.clearFallbackTimer();
        this.activeUtter = null;
      }
    };
  }
}

export const voiceEngine = new VoiceActingEngine();
