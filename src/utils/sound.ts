class SoundEngine {
  private ctx: AudioContext | null = null;
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
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.08,
    slideTo?: number
  ) {
    const ctx = this.getCtx();
    if (!ctx) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo) {
      osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
    }
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  click() {
    this.playTone(620, 0.06, 'triangle', 0.05, 420);
  }

  shoot() {
    this.playTone(980, 0.14, 'sawtooth', 0.08, 220);
  }

  blueCapture() {
    this.playTone(540, 0.09, 'sine', 0.09, 1080);
    setTimeout(() => this.playTone(1080, 0.14, 'triangle', 0.08, 1320), 65);
  }

  contradictBreak() {
    this.playTone(220, 0.12, 'sawtooth', 0.11, 880);
    setTimeout(() => this.playTone(880, 0.22, 'square', 0.09, 1320), 80);
  }

  consentAgree() {
    this.playTone(523.25, 0.1, 'sine', 0.09);
    setTimeout(() => this.playTone(659.25, 0.1, 'sine', 0.09), 70);
    setTimeout(() => this.playTone(783.99, 0.18, 'sine', 0.1), 140);
  }

  error() {
    this.playTone(190, 0.18, 'sawtooth', 0.08, 120);
  }

  slash() {
    this.playTone(1200, 0.1, 'sawtooth', 0.08, 300);
  }

  gavel() {
    this.playTone(130, 0.22, 'triangle', 0.14, 55);
  }

  puhuhu() {
    this.playTone(460, 0.07, 'square', 0.05, 620);
    setTimeout(() => this.playTone(460, 0.07, 'square', 0.05, 640), 95);
    setTimeout(() => this.playTone(500, 0.09, 'square', 0.05, 700), 190);
  }
}

export const sfx = new SoundEngine();
