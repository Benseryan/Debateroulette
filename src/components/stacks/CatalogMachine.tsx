import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CATEGORIES, categoryLabel, type Topic } from "@/lib/topics";
import { buildReel, pickTopic, spinDelays, RECENT_LIMIT, type CategoryFilter } from "@/lib/spinner";
import { sfx } from "@/lib/sound";
import { PixelGear } from "./PixelGear";

type Phase = "idle" | "spinning" | "revealed";
const FILTERS: CategoryFilter[] = ["all", ...CATEGORIES.map((c) => c.id)];
const RECENT_KEY = "stacks.recent";
const COUNT_KEY = "stacks.count";

// Card text area is ~340px wide; Pixelify Sans bold is ~0.62em per character.
function topicSize(label: string) {
  const byLength = label.length <= 10 ? 54 : label.length <= 15 ? 44 : label.length <= 20 ? 36 : 32;
  const longestWord = Math.max(...label.split(" ").map((w) => w.length));
  return Math.min(byLength, Math.floor(340 / (longestWord * 0.62)));
}

function reelSize(label: string) {
  return Math.min(34, Math.floor(340 / (Math.max(label.length, 1) * 0.62)));
}

function drawerCode(filter: CategoryFilter) {
  return filter === "all" ? "ALL" : (CATEGORIES.find((c) => c.id === filter)?.drawer ?? "ALL");
}

type Sparkle = { id: number; x: number; y: number; dx: number; dy: number; delay: number };

export function CatalogMachine({ soundOn }: { soundOn: boolean }) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const [reel, setReel] = useState<{ current: string; prev: string; key: number; tick: number }>({
    current: "",
    prev: "",
    key: 0,
    tick: 60,
  });
  const [result, setResult] = useState<Topic | null>(null);
  const [count, setCount] = useState(0);
  const [frame, setFrame] = useState(0);
  const [pressed, setPressed] = useState(false);
  const [lever, setLever] = useState(false);
  const [clunk, setClunk] = useState(0);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);

  const recentRef = useRef<string[]>([]);
  const timers = useRef<number[]>([]);
  const phaseRef = useRef<Phase>("idle");
  const soundRef = useRef(soundOn);
  soundRef.current = soundOn;
  phaseRef.current = phase;

  useEffect(() => {
    try {
      recentRef.current = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
      setCount(Number(localStorage.getItem(COUNT_KEY) ?? 0) || 0);
    } catch {
      recentRef.current = [];
    }
    return () => timers.current.forEach((t) => window.clearTimeout(t));
  }, []);

  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const finish = useCallback((topic: Topic) => {
    setResult(topic);
    setPhase("revealed");
    setClunk((c) => c + 1);
    setCount((c) => {
      const next = c + 1;
      localStorage.setItem(COUNT_KEY, String(next));
      return next;
    });
    recentRef.current = [...recentRef.current, topic.label].slice(-RECENT_LIMIT);
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentRef.current));
    if (soundRef.current) {
      sfx.clunk();
      sfx.chime();
    }
    setSparkles(
      Array.from({ length: 16 }, (_, i) => {
        const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 70 + Math.random() * 60;
        return {
          id: Date.now() + i,
          x: 50 + Math.cos(angle) * 38,
          y: 50 + Math.sin(angle) * 30,
          dx: Math.round((Math.cos(angle) * dist) / 4) * 4,
          dy: Math.round((Math.sin(angle) * dist * 0.6) / 4) * 4,
          delay: Math.random() * 120,
        };
      }),
    );
  }, []);

  const pull = useCallback(() => {
    if (phaseRef.current === "spinning") return;
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    const topic = pickTopic(filter, recentRef.current);
    setPressed(true);
    setLever(true);
    later(() => setPressed(false), 140);
    later(() => setLever(false), 420);
    setSparkles([]);
    if (soundRef.current) sfx.lever();

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setPhase("spinning");
      later(() => finish(topic), 250);
      return;
    }

    const delays = spinDelays();
    const labels = buildReel(topic, filter, delays.length);
    setPhase("spinning");
    phaseRef.current = "spinning";
    let elapsed = 0;
    let prev = result?.label ?? "???";
    labels.forEach((label, i) => {
      elapsed += delays[i]!;
      const prevLabel = prev;
      const isLast = i === labels.length - 1;
      later(() => {
        if (isLast) {
          finish(topic);
          return;
        }
        setReel((r) => ({
          current: label,
          prev: prevLabel,
          key: r.key + 1,
          tick: delays[i + 1] ?? 120,
        }));
        setFrame((f) => f + 1);
        if (soundRef.current) sfx.tick();
      }, elapsed);
      prev = label;
    });
  }, [filter, finish, result]);

  // Space / Enter pull a topic from anywhere on the page (native buttons handle their own keys).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== " " && e.key !== "Enter") return;
      if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return;
      const el = e.target as HTMLElement | null;
      if (
        el?.closest("button, a, input, select, textarea, [role='dialog'], [contenteditable='true']")
      )
        return;
      e.preventDefault();
      pull();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pull]);

  const spinning = phase === "spinning";
  const shift = (dir: 1 | -1) => {
    const i = FILTERS.indexOf(filter);
    setFilter(FILTERS[(i + dir + FILTERS.length) % FILTERS.length]!);
  };
  const cardCategory =
    result && phase === "revealed" ? categoryLabel(result.category) : categoryLabel(filter);

  return (
    <div className="machine select-none">
      {/* Crown */}
      <div className="machine-crown flex items-center justify-between gap-3 px-5 pb-3 pt-4">
        <span
          className={`bulb ${spinning ? (frame % 2 ? "is-on" : "") : phase === "revealed" ? "is-on" : ""}`}
        />
        <div className="brass-plate flex flex-1 items-center justify-between px-3 py-1.5">
          <span className="text-[12px] tracking-[0.18em]">CARD CATALOGUE</span>
          <span
            className="font-term text-[20px] leading-none"
            aria-label={`${count} topics pulled`}
          >
            Nº {String(count).padStart(4, "0")}
          </span>
        </div>
        <span
          className={`bulb ${spinning ? (frame % 2 ? "" : "is-on") : phase === "revealed" ? "is-on" : ""}`}
        />
      </div>

      <div key={clunk} className={`machine-body px-5 pb-5 pt-5 ${clunk ? "anim-clunk" : ""}`}>
        {/* Reel window */}
        <div className="flex items-center gap-3">
          <div className="hidden flex-col items-center gap-2 sm:flex">
            <PixelGear frame={frame} size={44} />
            <PixelGear frame={frame + 1} size={30} />
          </div>

          <div className="brass-frame relative min-w-0 flex-1 p-2">
            <span className="rivet absolute left-1.5 top-1.5" />
            <span className="rivet absolute right-1.5 top-1.5" />
            <span className="rivet absolute bottom-1.5 left-1.5" />
            <span className="rivet absolute bottom-1.5 right-1.5" />
            <div className="reel-glass mx-2 my-2 p-2">
              <div
                key={phase === "revealed" ? `card-${clunk}` : "card"}
                className={`index-card h-[184px] ${spinning ? "is-spinning" : ""} ${phase === "revealed" ? "anim-land" : ""}`}
                aria-live="polite"
              >
                <div className="flex h-[34px] items-center justify-between px-3">
                  <span className="font-display text-[11px] tracking-wider text-ink-red">
                    {cardCategory.toUpperCase()}
                  </span>
                  <span className="card-hole" />
                  <span className="font-term text-[18px] text-ink/70">
                    {phase === "revealed" ? `Nº ${String(count).padStart(4, "0")}` : "Nº ????"}
                  </span>
                </div>

                <div className="relative flex h-[118px] items-center justify-center overflow-hidden px-4 text-center">
                  {phase === "idle" && (
                    <div className="flex flex-col items-center gap-1">
                      <span className="anim-blink font-pixel text-[56px] font-bold leading-none text-ink">
                        ???
                      </span>
                      <span className="font-display text-[12px] tracking-wider text-ink/80">
                        WHAT WILL YOU LEARN TODAY?
                      </span>
                    </div>
                  )}

                  {spinning && (
                    <div className="h-[56px] w-full overflow-hidden">
                      <div
                        key={reel.key}
                        className="anim-reel flex flex-col"
                        style={{ ["--tick" as string]: `${reel.tick}ms` }}
                      >
                        {[reel.current, reel.prev].map((label, i) => (
                          <span
                            key={i}
                            className="flex h-[56px] items-center justify-center whitespace-nowrap font-pixel font-bold uppercase leading-none text-ink/85"
                            style={{ fontSize: reelSize(label) }}
                          >
                            {label || "···"}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {phase === "revealed" && result && (
                    <>
                      <h2
                        className="text-ink-shadow font-pixel font-bold uppercase leading-[1.02] text-ink [text-wrap:balance]"
                        style={{ fontSize: topicSize(result.label) }}
                        aria-label={result.label}
                      >
                        {(() => {
                          let n = 0;
                          return result.label.split(" ").map((word, w) => (
                            <Fragment key={w}>
                              {w > 0 && " "}
                              <span aria-hidden className="inline-block whitespace-nowrap">
                                {word.split("").map((ch) => {
                                  const i = n++;
                                  return (
                                    <span
                                      key={i}
                                      className="anim-letter"
                                      style={{ animationDelay: `${120 + i * 22}ms` }}
                                    >
                                      {ch}
                                    </span>
                                  );
                                })}
                              </span>
                            </Fragment>
                          ));
                        })()}
                      </h2>
                      <span
                        className="stamp anim-stamp absolute bottom-1 right-3 text-[10px]"
                        style={{ animationDelay: `${260 + result.label.length * 22}ms` }}
                      >
                        PULLED
                      </span>
                    </>
                  )}
                </div>

                <div className="flex h-[24px] items-center justify-center gap-5 text-[18px] leading-none">
                  {phase === "revealed" && result ? (
                    <span className="anim-fade flex gap-5" style={{ animationDelay: "500ms" }}>
                      <a
                        className="pixel-link"
                        href={`https://en.wikipedia.org/wiki/Special:Search?search=${encodeURIComponent(result.label)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        wikipedia →
                      </a>
                      <a
                        className="pixel-link"
                        href={`https://www.google.com/search?q=${encodeURIComponent(result.label)}`}
                        target="_blank"
                        rel="noreferrer"
                      >
                        search →
                      </a>
                    </span>
                  ) : (
                    <span className="font-term text-ink/50">
                      {spinning ? "shuffling the stacks…" : "· ten minutes ·"}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {sparkles.map((s) => (
              <span
                key={s.id}
                aria-hidden
                className="sparkle"
                style={{
                  left: `${s.x}%`,
                  top: `${s.y}%`,
                  animationDelay: `${s.delay}ms`,
                  ["--dx" as string]: `${s.dx}px`,
                  ["--dy" as string]: `${s.dy}px`,
                }}
              />
            ))}
          </div>

          <div className="hidden flex-col items-center gap-2 sm:flex">
            <PixelGear frame={frame + 1} size={30} />
            <PixelGear frame={frame} size={44} />
          </div>
        </div>

        {/* Subject dial */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <button
            type="button"
            className="dial-arrow"
            aria-label="Previous subject"
            onClick={() => shift(-1)}
            disabled={spinning}
          >
            <span className="font-display text-[12px]">◀</span>
          </button>
          <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                disabled={spinning}
                className="brass-plate flex min-w-[260px] items-center justify-center gap-2 px-3 py-1 text-[12px] tracking-wider"
                aria-label={`Subject: ${categoryLabel(filter)}. Choose a subject`}
              >
                <span className="text-ink/60">DRAWER {drawerCode(filter)} ·</span>
                <span>{categoryLabel(filter).toUpperCase()}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="pixel-panel w-[340px] border-4 p-3 shadow-none"
              sideOffset={10}
            >
              <p className="mb-2 font-display text-[11px] tracking-wider text-ink/70">
                CHOOSE A DRAWER
              </p>
              <div className="flex flex-wrap gap-1.5">
                {FILTERS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    className="chip"
                    aria-pressed={f === filter}
                    onClick={() => {
                      setFilter(f);
                      setPickerOpen(false);
                    }}
                  >
                    {categoryLabel(f).toUpperCase()}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          <button
            type="button"
            className="dial-arrow"
            aria-label="Next subject"
            onClick={() => shift(1)}
            disabled={spinning}
          >
            <span className="font-display text-[12px]">▶</span>
          </button>
        </div>

        {/* The button */}
        <div className="mt-4">
          <button
            type="button"
            className="pull-button"
            onClick={() => {
              if (soundOn) sfx.unlock();
              pull();
            }}
            disabled={spinning}
            data-pressed={pressed || spinning}
          >
            <span className="pull-button__face">
              <span aria-hidden className="text-gold">
                ▼
              </span>
              {spinning ? "PULLING…" : phase === "revealed" ? "PULL ANOTHER" : "PULL A TOPIC"}
              <span aria-hidden className="text-gold">
                ▼
              </span>
            </span>
          </button>
        </div>

        {/* Drawers */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          {["A — H", "I — P", "Q — Z"].map((label, i) => (
            <div
              key={label}
              className={`drawer flex h-[52px] flex-col items-center justify-center gap-1.5 ${
                spinning && i === 1 ? "is-rattling" : ""
              } ${phase === "revealed" && i === 1 ? "is-open" : ""}`}
            >
              <span className="brass-plate px-2 py-0 font-term text-[14px] leading-tight">
                {label}
              </span>
              <span className="drawer-pull" />
            </div>
          ))}
        </div>
      </div>

      {/* Feet */}
      <div className="flex justify-between px-6">
        <span className="h-3 w-10 border-4 border-t-0 border-border bg-mahogany" />
        <span className="h-3 w-10 border-4 border-t-0 border-border bg-mahogany" />
      </div>

      {/* Lever */}
      <button
        type="button"
        onClick={pull}
        disabled={spinning}
        aria-label="Pull the lever"
        className="absolute -right-[46px] top-[120px] hidden flex-col items-center sm:flex"
      >
        <span className="lever-slot relative h-[180px]">
          <span
            className={`lever-knob absolute -left-[12px] -top-[12px] ${lever ? "is-down" : ""}`}
          />
        </span>
        <span className="brass-plate mt-1 h-3 w-8" />
      </button>
    </div>
  );
}
