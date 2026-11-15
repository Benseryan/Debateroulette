import { useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CatalogMachine } from "@/components/stacks/CatalogMachine";
import { LibraryScene } from "@/components/stacks/LibraryScene";
import { sfx } from "@/lib/sound";


const MACHINE_W = 660;

function useMachineScale(ref: React.RefObject<HTMLDivElement | null>) {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const h = ref.current?.offsetHeight ?? 520;
      const sceneH = Math.max(vh, (vw * 272) / 480);
      const bottom = sceneH * 0.075;
      const top = vw < 640 ? 150 : 112;
      const byHeight = (vh - bottom - top) / h;
      const byWidth = (vw - (vw < 640 ? 16 : 48)) / (vw < 640 ? 560 : MACHINE_W);
      setScale(Math.max(0.45, Math.min(byHeight, byWidth, 1.25)));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [ref]);
  return scale;
}

export default function App() {
  const [soundOn, setSoundOn] = useState(false);
  const machineRef = useRef<HTMLDivElement>(null);
  const scale = useMachineScale(machineRef);

  return (
    <main className="relative h-dvh min-h-[560px] w-full overflow-hidden bg-espresso">
      <LibraryScene />

      <header className="absolute inset-x-0 top-0 z-10 flex flex-col items-center pt-16 sm:pt-7">
        <h1 className="text-pixel-shadow font-display text-[22px] font-bold leading-none tracking-[0.07em] text-gold-light sm:text-[38px]">
          DEBATE ROULETTE
        </h1>
        <p className="mt-2 font-term text-[20px] leading-none text-parchment/80 sm:text-[22px]">
          · one rabbit hole at a time ·
        </p>
      </header>

      <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-5 sm:top-5">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="icon-button" aria-label="How it works">
              ?
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="pixel-panel w-[260px] border-4 p-3 shadow-none"
          >
            <p className="font-display text-[11px] tracking-wider text-ink-red">HOW IT WORKS</p>
            <p className="mt-2 font-term text-[20px] leading-[1.1] text-ink">
              Pull a topic. Spend 10 minutes exploring it. See where it takes you.
            </p>
            <p className="mt-2 font-term text-[17px] leading-tight text-ink/60">
              Press SPACE or ENTER to pull. Pick a drawer to narrow the subject.
            </p>
          </PopoverContent>
        </Popover>
        <button
          type="button"
          className="icon-button"
          aria-pressed={soundOn}
          aria-label={soundOn ? "Turn sound off" : "Turn sound on"}
          onClick={() => {
            const next = !soundOn;
            setSoundOn(next);
            if (next) {
              sfx.unlock();
              sfx.tick();
            }
          }}
        >
          <SpeakerIcon on={soundOn} />
        </button>
      </div>

      <div
        className="absolute left-1/2 z-10"
        style={{
          bottom: "calc(var(--scene-h) * 0.075)",
          transform: `translateX(-50%) scale(${scale})`,
          transformOrigin: "bottom center",
        }}
      >
        <div ref={machineRef}>
          <CatalogMachine soundOn={soundOn} />
        </div>
      </div>
    </main>
  );
}

function SpeakerIcon({ on }: { on: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 10 10"
      shapeRendering="crispEdges"
      aria-hidden
      fill="currentColor"
    >
      <rect x="1" y="4" width="2" height="2" />
      <rect x="3" y="3" width="1" height="4" />
      <rect x="4" y="2" width="1" height="6" />
      {on ? (
        <>
          <rect x="6" y="4" width="1" height="2" />
          <rect x="7" y="3" width="1" height="1" />
          <rect x="7" y="6" width="1" height="1" />
          <rect x="8" y="2" width="1" height="6" opacity="0.7" />
        </>
      ) : (
        <>
          <rect x="6" y="3" width="1" height="1" />
          <rect x="8" y="3" width="1" height="1" />
          <rect x="7" y="4" width="1" height="2" />
          <rect x="6" y="6" width="1" height="1" />
          <rect x="8" y="6" width="1" height="1" />
        </>
      )}
    </svg>
  );
}
