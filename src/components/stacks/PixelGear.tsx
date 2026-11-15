import { useMemo } from "react";

/** A genuinely pixelated brass gear. Two frames offset by half a tooth fake rotation. */
function gearCells(phase: number) {
  const size = 15;
  const c = (size - 1) / 2;
  const cells: { x: number; y: number; tone: "body" | "edge" | "hole" }[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - c;
      const dy = y - c;
      const r = Math.hypot(dx, dy);
      const a = Math.atan2(dy, dx);
      if (r < 1.6) continue;
      if (r < 2.6) cells.push({ x, y, tone: "hole" });
      else if (r < 5.0) cells.push({ x, y, tone: r > 4.2 ? "edge" : "body" });
      else if (r < 7.3 && Math.cos(8 * (a + phase)) > 0.25) cells.push({ x, y, tone: "edge" });
    }
  }
  return cells;
}

const FRAMES = [gearCells(0), gearCells(Math.PI / 16)];

export function PixelGear({ frame, size = 60 }: { frame: number; size?: number }) {
  const cells = FRAMES[frame % 2]!;
  const fills = useMemo(
    () => ({ body: "var(--gold)", edge: "var(--gold-dark)", hole: "var(--outline)" }),
    [],
  );
  return (
    <svg width={size} height={size} viewBox="0 0 15 15" shapeRendering="crispEdges" aria-hidden>
      {cells.map((cell) => (
        <rect
          key={`${cell.x}-${cell.y}`}
          x={cell.x}
          y={cell.y}
          width={1}
          height={1}
          fill={fills[cell.tone]}
        />
      ))}
    </svg>
  );
}
