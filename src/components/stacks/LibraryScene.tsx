import scene from "@/assets/library-scene.png";
import { DustMotes } from "./DustMotes";

// Lamp positions in % of the painting (480×272 pixel art).
const LAMPS: { x: number; y: number; size?: number; delay: number }[] = [
  { x: 13.4, y: 14.8, delay: 0 },
  { x: 29.4, y: 30.5, size: 6, delay: 0.7 },
  { x: 35.4, y: 36.8, size: 5, delay: 1.9 },
  { x: 64.6, y: 36.8, size: 5, delay: 1.1 },
  { x: 70.5, y: 30.5, size: 6, delay: 2.4 },
  { x: 88, y: 17.4, delay: 0.4 },
  { x: 49.5, y: 6.5, size: 16, delay: 1.5 },
  { x: 87.5, y: 74, size: 14, delay: 2.9 },
  { x: 31.5, y: 52, size: 5, delay: 0.9 },
  { x: 67, y: 52, size: 5, delay: 2.1 },
];

export function LibraryScene() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="scene">
        <img
          src={scene}
          alt=""
          width={480}
          height={272}
          className="absolute inset-0 h-full w-full pixelated"
        />
        <div className="moon-shaft" />
        {LAMPS.map((l) => (
          <span
            key={`${l.x}-${l.y}`}
            className="lamp-glow"
            style={{
              left: `${l.x}%`,
              top: `${l.y}%`,
              width: l.size ? `${l.size}%` : undefined,
              animationDelay: `${l.delay}s`,
            }}
          />
        ))}
      </div>
      <div className="scene-vignette absolute inset-0" />
      <DustMotes />
    </div>
  );
}
