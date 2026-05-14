"use client";

// Tiny synthesized Web Audio sound bank — no asset files needed.
// Subtle, premium, satisfying.

let ctx: AudioContext | null = null;
let enabled = true;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

export function setSoundEnabled(v: boolean) {
  enabled = v;
}

interface BlipOpts {
  freq: number;
  freqEnd?: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number;
}

function blip({ freq, freqEnd, duration = 0.18, type = "sine", gain = 0.08, delay = 0 }: BlipOpts) {
  const c = getCtx();
  if (!c || !enabled) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (freqEnd != null) osc.frequency.exponentialRampToValueAtTime(Math.max(20, freqEnd), t0 + duration);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.02);
}

export const sfx = {
  xp() {
    blip({ freq: 880, freqEnd: 1320, duration: 0.14, type: "triangle", gain: 0.05 });
  },
  questComplete() {
    blip({ freq: 660, freqEnd: 990, duration: 0.12, type: "triangle", gain: 0.07 });
    blip({ freq: 990, freqEnd: 1480, duration: 0.18, type: "triangle", gain: 0.05, delay: 0.08 });
  },
  combo() {
    blip({ freq: 740, freqEnd: 1100, duration: 0.1, type: "square", gain: 0.04 });
    blip({ freq: 1100, freqEnd: 1480, duration: 0.12, type: "square", gain: 0.04, delay: 0.06 });
  },
  achievement() {
    blip({ freq: 523, duration: 0.15, type: "triangle", gain: 0.07 });
    blip({ freq: 659, duration: 0.15, type: "triangle", gain: 0.07, delay: 0.1 });
    blip({ freq: 880, duration: 0.25, type: "triangle", gain: 0.08, delay: 0.2 });
  },
  legendary() {
    blip({ freq: 440, freqEnd: 880, duration: 0.4, type: "sawtooth", gain: 0.06 });
    blip({ freq: 660, duration: 0.2, type: "triangle", gain: 0.06, delay: 0.18 });
    blip({ freq: 1320, duration: 0.45, type: "triangle", gain: 0.08, delay: 0.3 });
  },
  levelUp() {
    blip({ freq: 392, duration: 0.2, type: "triangle", gain: 0.07 });
    blip({ freq: 587, duration: 0.2, type: "triangle", gain: 0.07, delay: 0.12 });
    blip({ freq: 784, duration: 0.3, type: "triangle", gain: 0.09, delay: 0.24 });
    blip({ freq: 1175, duration: 0.5, type: "triangle", gain: 0.07, delay: 0.4 });
  },
  streak() {
    blip({ freq: 660, freqEnd: 990, duration: 0.18, type: "sine", gain: 0.06 });
  },
  reward() {
    blip({ freq: 880, duration: 0.12, type: "triangle", gain: 0.06 });
    blip({ freq: 1320, duration: 0.16, type: "triangle", gain: 0.06, delay: 0.08 });
  },
  tap() {
    blip({ freq: 1200, duration: 0.04, type: "sine", gain: 0.025 });
  },
};
