// useMotivatorGame.ts
// The game engine: owns the duel/ranking state and the actions that drive it,
// on top of the pairing algorithm (pairing.ts) and persistence (persistence.ts).
// The view stays a thin UI-phase orchestrator.
import { computed, ref } from 'vue';
import { state, Motivator, Mode } from '@/store';
import { updateElo } from '@/elo';
import { pairKey, pickPair, totalPairs } from '@/pairing';
import { loadGame, saveGame, clearGame, SaveData } from '@/persistence';

// The ranking unlocks after a full round robin: every unique pair judged once.
// With 10 motivators that's 45 duels (C(10,2)) — each motivator has then faced
// every other one exactly once and the ELO ranking is complete. The pairing
// never repeats a pair before all 45 are seen, so the duel count maps 1:1 to
// pairs judged, and the progress bar is a plain, monotonic duels / total.

export interface Match {
  winnerId: number;
  loserId: number;
}

export interface UseMotivatorGameOptions {
  // Mode to fall back to on a fresh game / reset (derived from the URL by the view).
  defaultMode: Mode;
  // Fired once, the moment the ranking unlocks during play (not on restore).
  onUnlock?: () => void;
}

export function useMotivatorGame(opts: UseMotivatorGameOptions) {
  // Session (persisted).
  const playerName = ref('');
  const mode = ref<Mode>(opts.defaultMode);
  const started = ref(false);

  // Duel/ranking model.
  const playedPairs = ref<Set<string>>(new Set());
  const selectedItems = ref<Motivator[]>(pickPair(state.items, playedPairs.value));
  // Blocks new picks while the card transition is still running; released by the
  // view via settleDuel() on the transition's @after-enter.
  const isAnimating = ref(false);
  // Store ids, not live Motivator refs: an item's elo keeps mutating after the
  // duel, and ids serialize cleanly for persistence.
  const matchHistory = ref<Match[]>([]);
  const matchCount = ref(0);
  const rankingUnlocked = ref(false);

  // Total duels for a full round robin (45 for 10 motivators).
  const TOTAL_DUELS = totalPairs(state.items.length);

  const rankedItems = computed(() => [...state.items].sort((a, b) => b.elo - a.elo));
  const progress = computed(() => Math.min(1, matchCount.value / TOTAL_DUELS));
  const progressPercent = computed(() => Math.round(progress.value * 100));

  function snapshot(): SaveData {
    return {
      v: 1,
      playerName: playerName.value,
      mode: mode.value,
      started: started.value,
      matchCount: matchCount.value,
      elos: Object.fromEntries(state.items.map((i) => [i.id, i.elo])),
      shown: Object.fromEntries(state.items.map((i) => [i.id, i.shownCount])),
      playedPairs: [...playedPairs.value],
      rankingUnlocked: rankingUnlocked.value,
      history: matchHistory.value,
    };
  }
  const save = () => saveGame(snapshot());

  const startGame = (name: string) => {
    playerName.value = name;
    started.value = true;
    save();
  };

  const chooseFavorite = (winner: Motivator, loser: Motivator) => {
    if (isAnimating.value) return;
    isAnimating.value = true;

    const [newWinnerElo, newLoserElo] = updateElo(winner.elo, loser.elo);
    winner.elo = newWinnerElo;
    loser.elo = newLoserElo;

    matchHistory.value.unshift({ winnerId: winner.id, loserId: loser.id });
    matchCount.value++;
    winner.shownCount++;
    loser.shownCount++;

    // Remember this pair so it isn't re-proposed until the cycle resets.
    playedPairs.value.add(pairKey(winner, loser));

    // Unlock once the full round robin is done: every pair judged exactly once.
    if (!rankingUnlocked.value && matchCount.value >= TOTAL_DUELS) {
      rankingUnlocked.value = true;
      opts.onUnlock?.();
    }

    selectedItems.value = pickPair(state.items, playedPairs.value);
    save();
  };

  // New duel cards have finished entering: accept the next pick.
  const settleDuel = () => {
    isAnimating.value = false;
  };

  // Load a saved game. Returns true if one was restored, false for a fresh start.
  const restore = (): boolean => {
    const p = loadGame();
    if (!p) return false;
    state.items.forEach((i) => {
      if (typeof p.elos?.[i.id] === 'number') i.elo = p.elos[i.id];
      if (typeof p.shown?.[i.id] === 'number') i.shownCount = p.shown[i.id];
    });
    playerName.value = p.playerName ?? '';
    // An in-progress game has locked its mode in, so it wins over the URL param.
    if (p.mode === 'manager' || p.mode === 'solo') mode.value = p.mode;
    matchCount.value = p.matchCount ?? 0;
    playedPairs.value = new Set(Array.isArray(p.playedPairs) ? p.playedPairs : []);
    rankingUnlocked.value = !!p.rankingUnlocked;
    matchHistory.value = Array.isArray(p.history) ? p.history : [];
    started.value = true;
    selectedItems.value = pickPair(state.items, playedPairs.value);
    return true;
  };

  // Wipe the saved game and reset the model back to a fresh start.
  const reset = () => {
    clearGame();
    state.items.forEach((i) => {
      i.elo = 1000;
      i.shownCount = 0;
    });
    playedPairs.value = new Set();
    matchHistory.value = [];
    matchCount.value = 0;
    rankingUnlocked.value = false;
    playerName.value = '';
    mode.value = opts.defaultMode;
    started.value = false;
    selectedItems.value = pickPair(state.items, playedPairs.value);
  };

  // Load any saved game synchronously, during setup, so `started` is already
  // correct on the very first render — no flash of the onboarding screen before
  // onMounted swaps it for the arena.
  const wasRestored = restore();

  return {
    playerName,
    mode,
    started,
    selectedItems,
    isAnimating,
    matchHistory,
    matchCount,
    rankingUnlocked,
    rankedItems,
    progressPercent,
    startGame,
    chooseFavorite,
    settleDuel,
    wasRestored,
    reset,
  };
}
