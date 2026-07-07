// pairing.ts
// Duel pairing: pick two distinct motivators, biased toward the least-shown, and
// never re-propose a pair until every unique pair has been seen this cycle.
// Pure logic, no Vue, so it reads and tests on its own.
import { Motivator } from './store';

export const pairKey = (a: Motivator, b: Motivator): string =>
  a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;

export const totalPairs = (n: number): number => (n * (n - 1)) / 2;

function randomItem(items: Motivator[]): Motivator {
  return items[Math.floor(Math.random() * items.length)];
}

// Weighted by inverse exposure (1 / (shownCount + 1)): rarely-shown motivators
// come up more often, so each one gets enough duels to rank reliably.
function weightedRandomItem(items: Motivator[]): Motivator {
  const totalWeight = items.reduce((acc, item) => acc + (1 / (item.shownCount + 1)), 0);
  let r = Math.random() * totalWeight;
  for (const item of items) {
    const w = 1 / (item.shownCount + 1);
    if (r < w) return item;
    r -= w;
  }
  // Fallback if float drift misses the last bucket.
  return items[items.length - 1];
}

// Returns a fresh [a, b] pair not yet played this cycle. Mutates `played`:
// clears it when every unique pair has been seen, starting a new cycle.
export function pickPair(items: Motivator[], played: Set<string>): Motivator[] {
  // Every unique pair seen → start a new cycle.
  if (played.size >= totalPairs(items.length)) {
    played.clear();
  }

  const pick = Math.random() < 0.6 ? weightedRandomItem : randomItem; // 3/5 weighted

  // Try weighted/random picks first, rejecting pairs already played this cycle.
  for (let attempt = 0; attempt < 40; attempt++) {
    const first = pick(items);
    let second = pick(items);
    while (second === first) second = pick(items);
    if (!played.has(pairKey(first, second))) return [first, second];
  }

  // Fallback when few pairs remain: pick uniformly among the unplayed ones.
  const remaining: Motivator[][] = [];
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      if (!played.has(pairKey(items[i], items[j]))) remaining.push([items[i], items[j]]);
    }
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}
