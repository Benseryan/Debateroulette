import { useEffect, useRef } from "react";

/** Floating dust drawn on a low-res canvas, scaled up so every mote is a real pixel. */
export function DustMotes() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const g = canvas.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const SCALE = 4;
    let w = 0;
    let h = 0;
    const resize = () => {
      w = Math.ceil(window.innerWidth / SCALE);
      h = Math.ceil(window.innerHeight / SCALE);
      canvas.width = w;
      canvas.height = h;
    };
    resize();
    window.addEventListener("resize", resize);

    const colors = ["255,214,140", "255,236,190", "240,180,100"];
    const motes = Array.from({ length: 55 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.04,
      vy: -0.01 - Math.random() * 0.03,
      phase: Math.random() * Math.PI * 2,
      big: Math.random() < 0.15,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let raf = 0;
    let t = 0;
    const draw = () => {
      t += 1;
      g.clearRect(0, 0, w, h);
      for (const m of motes) {
        if (!reduce) {
          m.x += m.vx + Math.sin((t + m.phase * 100) / 160) * 0.03;
          m.y += m.vy;
          if (m.y < -2) {
            m.y = h + 2;
            m.x = Math.random() * w;
          }
          if (m.x < -2) m.x = w + 2;
          if (m.x > w + 2) m.x = -2;
        }
        const alpha = 0.25 + 0.35 * (0.5 + 0.5 * Math.sin(t / 40 + m.phase));
        g.fillStyle = `rgba(${m.color},${alpha.toFixed(2)})`;
        g.fillRect(Math.round(m.x), Math.round(m.y), m.big ? 2 : 1, 1);
      }
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none absolute inset-0 h-full w-full pixelated"
    />
  );
}
