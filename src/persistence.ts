// persistence.ts
// Save/restore an in-progress game in localStorage so a refresh doesn't wipe
// 40-60 duels of work. Pure serialization: no Vue, no reactive state.
import { Mode } from './store';

const SAVE_KEY = 'mm.save.v1';

export interface SaveData {
  v: 1;
  playerName: string;
  mode: Mode;
  started: boolean;
  matchCount: number;
  elos: Record<number, number>;
  shown: Record<number, number>;
  playedPairs: string[];
  rankingUnlocked: boolean;
  history: { winnerId: number; loserId: number }[];
}

export function saveGame(data: SaveData): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or blocked: a lost save isn't worth crashing over.
  }
}

// Returns the saved game, or null if there's none, it's corrupt, or it never
// actually started (still on onboarding).
export function loadGame(): SaveData | null {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!p || p.v !== 1 || !p.started) return null;
    return p as SaveData;
  } catch {
    return null;
  }
}

export function clearGame(): void {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {
    /* ignore */
  }
}
