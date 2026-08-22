// Web Audio API ambient audio generator for Pomodoro Focus

class FocusAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentMode: "rain" | "whiteNoise" | "binaural" | "lofiHum" | "off" = "off";
  private gainNode: GainNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  public play(mode: "rain" | "whiteNoise" | "binaural" | "lofiHum", volume = 0.2) {
    this.stop();
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.currentMode = mode;
    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
    this.gainNode.connect(this.ctx.destination);

    if (mode === "whiteNoise") {
      this.playWhiteNoise();
    } else if (mode === "rain") {
      this.playRain();
    } else if (mode === "binaural") {
      this.playBinauralAlpha();
    } else if (mode === "lofiHum") {
      this.playLofiWarmDrone();
    }
  }

  private playWhiteNoise() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    // Pink / Low-pass filter for cozy gentle focus sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(this.gainNode);
    whiteNoise.start();

    this.activeNodes.push(whiteNoise, filter);
  }

  private playRain() {
    if (!this.ctx || !this.gainNode) return;
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + 0.02 * white) / 1.02; // Brown noise algorithm for deep rain
      lastOut = output[i];
      output[i] *= 3.5;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(450, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    brownNoise.connect(filter);
    filter.connect(this.gainNode);
    brownNoise.start();

    this.activeNodes.push(brownNoise, filter);
  }

  private playBinauralAlpha() {
    if (!this.ctx || !this.gainNode) return;
    // 210Hz left, 220Hz right -> 10Hz Alpha Waves for deep mental concentration
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = "sine";
    osc2.type = "sine";
    osc1.frequency.setValueAtTime(210, this.ctx.currentTime);
    osc2.frequency.setValueAtTime(220, this.ctx.currentTime);

    const pan1 = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;
    const pan2 = this.ctx.createStereoPanner ? this.ctx.createStereoPanner() : null;

    if (pan1 && pan2) {
      pan1.pan.setValueAtTime(-1, this.ctx.currentTime);
      pan2.pan.setValueAtTime(1, this.ctx.currentTime);
      osc1.connect(pan1);
      pan1.connect(this.gainNode);
      osc2.connect(pan2);
      pan2.connect(this.gainNode);
    } else {
      osc1.connect(this.gainNode);
      osc2.connect(this.gainNode);
    }

    osc1.start();
    osc2.start();
    this.activeNodes.push(osc1, osc2);
  }

  private playLofiWarmDrone() {
    if (!this.ctx || !this.gainNode) return;
    const fundamental = 110; // A2 note
    const harmonics = [1, 2, 3, 5];

    harmonics.forEach((h, idx) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const hGain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(fundamental * h, this.ctx.currentTime);
      hGain.gain.setValueAtTime(0.3 / (idx + 1), this.ctx.currentTime);

      osc.connect(hGain);
      hGain.connect(this.gainNode);
      osc.start();
      this.activeNodes.push(osc, hGain);
    });
  }

  public setVolume(volume: number) {
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public stop() {
    this.activeNodes.forEach((node) => {
      if (typeof node !== "number" && (node as any).stop) {
        try {
          (node as any).stop();
        } catch {
          // ignore
        }
      }
      if (typeof node !== "number" && (node as any).disconnect) {
        try {
          (node as any).disconnect();
        } catch {
          // ignore
        }
      }
    });
    this.activeNodes = [];
    this.isPlaying = false;
    this.currentMode = "off";
  }

  public start(type: "rain" | "whiteNoise" | "binaural" | "brown" | "lofiHum", volume = 0.3) {
    const soundMode = type === "brown" ? "rain" : type;
    this.play(soundMode as any, volume);
  }

  public playBeepNotification() {
    this.initContext();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(440, this.ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.3);
    } catch {
      // ignore
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      currentMode: this.currentMode,
    };
  }
}

export const focusSynth = new FocusAudioSynthesizer();
export const ambientSoundEngine = focusSynth;

