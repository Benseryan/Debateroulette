// Tiny chiptune sound effects via Web Audio. Only used when the visitor turns sound on.
let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, at = 0) {
  const a = audio();
  if (!a) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const gain = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  gain.gain.setValueAtTime(vol, t);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(a.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

export const sfx = {
  tick() {
    tone(1100 + Math.random() * 200, 0.025, "square", 0.025);
  },
  lever() {
    tone(180, 0.08, "square", 0.05);
    tone(120, 0.1, "triangle", 0.08, 0.05);
  },
  clunk() {
    tone(90, 0.16, "triangle", 0.18);
    tone(60, 0.2, "square", 0.04, 0.02);
  },
  chime() {
    tone(784, 0.12, "square", 0.04, 0.08);
    tone(1175, 0.22, "square", 0.035, 0.18);
  },
  unlock() {
    audio();
  },
};
