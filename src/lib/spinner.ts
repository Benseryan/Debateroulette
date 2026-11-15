import { TOPICS, type CategoryId, type Topic } from "./topics";

export type CategoryFilter = CategoryId | "all";

export function topicPool(filter: CategoryFilter, topics: Topic[] = TOPICS): Topic[] {
  return filter === "all" ? topics : topics.filter((t) => t.category === filter);
}

/**
 * Pick a random topic from the chosen drawer, skipping anything pulled recently.
 * If every topic in the drawer was pulled recently, only the most recent one is avoided.
 */
export function pickTopic(
  filter: CategoryFilter,
  recent: string[],
  rng: () => number = Math.random,
  topics: Topic[] = TOPICS,
): Topic {
  const pool = topicPool(filter, topics);
  const recentSet = new Set(recent);
  let candidates = pool.filter((t) => !recentSet.has(t.label));
  if (candidates.length === 0) {
    const last = recent[recent.length - 1];
    candidates = pool.filter((t) => t.label !== last);
    if (candidates.length === 0) candidates = pool;
  }
  return candidates[Math.floor(rng() * candidates.length)]!;
}

/** Labels that flash past on the reel, ending on the final topic. */
export function buildReel(
  final: Topic,
  filter: CategoryFilter,
  ticks: number,
  rng: () => number = Math.random,
): string[] {
  const pool = topicPool(filter);
  const source = pool.length > 6 ? pool : TOPICS;
  const labels: string[] = [];
  for (let i = 0; i < ticks - 1; i++) {
    let next = source[Math.floor(rng() * source.length)]!.label;
    let guard = 0;
    while ((next === labels[labels.length - 1] || next === final.label) && guard++ < 10) {
      next = source[Math.floor(rng() * source.length)]!.label;
    }
    labels.push(next);
  }
  labels.push(final.label);
  return labels;
}

/**
 * Delay (ms) before each reel tick: a quick spin-up, a short blur at full speed,
 * then a natural slow-down into the final card.
 */
export function spinDelays(): number[] {
  const spinUp = [90, 75, 62, 52, 45];
  const cruise = Array.from({ length: 8 }, () => 42);
  const slowDown: number[] = [];
  let d = 52;
  while (d < 300) {
    slowDown.push(Math.round(d));
    d *= 1.26;
  }
  return [...spinUp, ...cruise, ...slowDown];
}

export const RECENT_LIMIT = 60;
