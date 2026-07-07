<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { state, Motivator } from '@/store';
import { updateElo } from '@/elo';
import MotivatorCard from '@/components/MotivatorCard.vue';
import OnboardingIntro from '@/components/OnboardingIntro.vue';
import ModeSelector, { Mode } from '@/components/ModeSelector.vue';
import UnlockCelebration from '@/components/UnlockCelebration.vue';
import ExportResults from '@/components/ExportResults.vue';
import ResultsReveal from '@/components/ResultsReveal.vue';
import { t, mName } from '@/i18n';

// Mode is chosen on the onboarding screen via the capsule, pre-selected from
// the ?mode=manager param on a shared link (default = solo), then frozen once
// the game starts (the capsule only lives on onboarding). isManager stays a
// computed so every downstream consumer is unchanged.
const route = useRoute();
const mode = ref<Mode>(route.query.mode === 'manager' ? 'manager' : 'solo');
const isManager = computed(() => mode.value === 'manager');

const showOnboarding = ref(true);
const showCelebration = ref(false);
const showExport = ref(false);
const showReveal = ref(false);
const playerName = ref('');
// Held back until the onboarding card has actually finished leaving, so the game
// header (duel count + progress) doesn't briefly coexist with the onboarding
// card during the phase switch. Flipped by the phase transition's @after-leave,
// not a guessed timeout that has to match the CSS duration.
const headerReady = ref(false);

const SAVE_KEY = 'mm.save.v1';

const startGame = (name: string) => {
  playerName.value = name;
  showOnboarding.value = false;
  saveGame();
};

// A phase finished leaving. Reveal the header only once we've landed OUT of
// onboarding (game started / continued), never when a reset sends us back to
// onboarding, otherwise the duel header shows over the onboarding card.
const onPhaseAfterLeave = () => {
  if (!showOnboarding.value) headerReady.value = true;
};

// Pairs already played this cycle, keyed by sorted ids. Prevents re-proposing a
// duel until every unique pair has been seen; then a fresh cycle starts.
const playedPairs = ref<Set<string>>(new Set());
const TOTAL_PAIRS = (state.items.length * (state.items.length - 1)) / 2;
const pairKey = (a: Motivator, b: Motivator): string =>
  a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`;

const pickTwoDistinctItems = (): Motivator[] => {
  // Every unique pair seen → start a new cycle.
  if (playedPairs.value.size >= TOTAL_PAIRS) {
    playedPairs.value.clear();
  }

  const pickFunction = Math.random() < 0.6 ? weightedRandomItem : randomItem; // 3/5 chance for weighted

  // Try weighted/random picks first, rejecting pairs already played this cycle.
  for (let attempt = 0; attempt < 40; attempt++) {
    const firstItem = pickFunction();
    let secondItem = pickFunction();
    while (secondItem === firstItem) {
      secondItem = pickFunction();
    }
    if (!playedPairs.value.has(pairKey(firstItem, secondItem))) {
      return [firstItem, secondItem];
    }
  }

  // Fallback when few pairs remain: pick uniformly among the unplayed ones.
  const remaining: Motivator[][] = [];
  for (let i = 0; i < state.items.length; i++) {
    for (let j = i + 1; j < state.items.length; j++) {
      if (!playedPairs.value.has(pairKey(state.items[i], state.items[j]))) {
        remaining.push([state.items[i], state.items[j]]);
      }
    }
  }
  return remaining[Math.floor(Math.random() * remaining.length)];
}

function randomItem(): Motivator {
  const randomIndex = Math.floor(Math.random() * state.items.length);
  return state.items[randomIndex];
}

function weightedRandomItem(): Motivator {
  // Calculate the total weight (i.e., sum of 'shownCount's)
  const totalWeight = state.items.reduce((acc, item) => acc + (1 / (item.shownCount + 1)), 0);

  // Generate a random number between 0 and the total weight
  let randomNum = Math.random() * totalWeight;

  // Find which item this random number corresponds to
  for (const item of state.items) {
    const itemWeight = 1 / (item.shownCount + 1);
    if (randomNum < itemWeight) {
      return item;
    }
    randomNum -= itemWeight;
  }

  // Fallback to return the last item if for some reason the loop doesn't catch it
  return state.items[state.items.length - 1];
}

const selectedItems = ref<Motivator[]>(pickTwoDistinctItems());
// Blocks new picks while the card transition (fade-scale) is still running.
// Firing chooseFavorite again before it settles can leave the transition's
// enter classes stuck, making the cards invisible. Released by the transition's
// own @after-enter (see onDuelSettled), not a timeout guessed to match the CSS.
const isAnimating = ref(false);
// Store ids, not live Motivator refs: the elo of a referenced item keeps
// mutating after the duel, and ids serialize cleanly for persistence.
const matchHistory = ref<{ winnerId: number; loserId: number }[]>([]);
const matchCount = ref(0);
const showHistory = ref(false);
const confirmReset = ref(false);

const itemById = (id: number) => state.items.find((m) => m.id === id) as Motivator;

// Ranking reliability: hidden until every item has enough duels behind it
// AND the top of the ranking has stopped moving around.
const MIN_SHOWN_PER_ITEM = 5;
const STABILITY_WINDOW = 10;
const TOP_N_FOR_STABILITY = 3;

const stableStreak = ref(0);
const rankingUnlocked = ref(false);

const rankedItems = computed(() =>
  [...state.items].sort((a, b) => b.elo - a.elo)
);

let previousTopGroup: number[] = [];

const minShownCount = computed(() =>
  Math.min(...state.items.map((item) => item.shownCount))
);

const exposureScore = computed(() =>
  Math.min(1, minShownCount.value / MIN_SHOWN_PER_ITEM)
);

const stabilityScore = computed(() =>
  Math.min(1, stableStreak.value / STABILITY_WINDOW)
);

const reliability = computed(() =>
  Math.min(exposureScore.value, stabilityScore.value)
);

const reliabilityPercent = computed(() => Math.round(reliability.value * 100));

const chooseFavorite = (winner: Motivator, loser: Motivator) => {
  if (isAnimating.value) return;
  // Locked here, released in onDuelSettled when the card transition has fully
  // entered. The bumped matchCount below rekeys the <Transition>, so it always
  // runs a leave+enter and @after-enter always fires to clear the lock.
  isAnimating.value = true;

  const [newWinnerElo, newLoserElo] = updateElo(winner.elo, loser.elo);
  winner.elo = newWinnerElo;
  loser.elo = newLoserElo;

  // Update match history and count
  matchHistory.value.unshift({ winnerId: winner.id, loserId: loser.id });
  matchCount.value++;

  // Increment shown count for both winner and loser
  winner.shownCount++;
  loser.shownCount++;

  // Remember this pair so it isn't re-proposed until the cycle resets.
  playedPairs.value.add(pairKey(winner, loser));

  // Track how long the same trio has held the top spots, regardless of their
  // internal order (near-tied items can keep swapping 1st/2nd without that
  // counting as instability).
  const topGroup = rankedItems.value.slice(0, TOP_N_FOR_STABILITY).map((item) => item.id);
  const isSameGroup =
    topGroup.length === previousTopGroup.length &&
    topGroup.every((id) => previousTopGroup.includes(id));
  stableStreak.value = isSameGroup ? stableStreak.value + 1 : 0;
  previousTopGroup = topGroup;

  if (!rankingUnlocked.value && reliability.value >= 1) {
    rankingUnlocked.value = true;
    showCelebration.value = true;
  }

  selectedItems.value = pickTwoDistinctItems();
  saveGame();
};

// New duel cards have finished entering: accept the next pick.
const onDuelSettled = () => { isAnimating.value = false; };

// Persist the in-progress game so a refresh doesn't wipe 40-60 duels of work.
function saveGame() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      v: 1,
      playerName: playerName.value,
      mode: mode.value,
      started: !showOnboarding.value,
      matchCount: matchCount.value,
      elos: Object.fromEntries(state.items.map((i) => [i.id, i.elo])),
      shown: Object.fromEntries(state.items.map((i) => [i.id, i.shownCount])),
      playedPairs: [...playedPairs.value],
      stableStreak: stableStreak.value,
      previousTopGroup,
      rankingUnlocked: rankingUnlocked.value,
      history: matchHistory.value,
    }));
  } catch {
    // localStorage full or blocked: a lost save isn't worth crashing over.
  }
}

// Restore a saved game on load. Returns silently (fresh game) if none/corrupt.
function restoreGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const p = JSON.parse(raw);
    if (!p || p.v !== 1 || !p.started) return;
    state.items.forEach((i) => {
      if (typeof p.elos?.[i.id] === 'number') i.elo = p.elos[i.id];
      if (typeof p.shown?.[i.id] === 'number') i.shownCount = p.shown[i.id];
    });
    playerName.value = p.playerName ?? '';
    // Restore the chosen mode: an in-progress game has already locked it in,
    // so it takes precedence over the URL param.
    if (p.mode === 'manager' || p.mode === 'solo') mode.value = p.mode;
    matchCount.value = p.matchCount ?? 0;
    playedPairs.value = new Set(Array.isArray(p.playedPairs) ? p.playedPairs : []);
    stableStreak.value = p.stableStreak ?? 0;
    previousTopGroup = Array.isArray(p.previousTopGroup) ? p.previousTopGroup : [];
    rankingUnlocked.value = !!p.rankingUnlocked;
    matchHistory.value = Array.isArray(p.history) ? p.history : [];
    showOnboarding.value = false;
    headerReady.value = true;
    selectedItems.value = pickTwoDistinctItems();
  } catch {
    // Corrupt save: fall back to a fresh game (onboarding stays visible).
  }
}

// Wipe the saved game and start over from onboarding.
function resetGame() {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* ignore */ }
  state.items.forEach((i) => { i.elo = 1000; i.shownCount = 0; });
  playedPairs.value = new Set();
  matchHistory.value = [];
  matchCount.value = 0;
  stableStreak.value = 0;
  previousTopGroup = [];
  rankingUnlocked.value = false;
  showCelebration.value = false;
  showExport.value = false;
  showReveal.value = false;
  showHistory.value = false;
  confirmReset.value = false;
  playerName.value = '';
  // Back to onboarding: re-default the mode from the URL so the capsule reflects
  // how the game was opened.
  mode.value = route.query.mode === 'manager' ? 'manager' : 'solo';
  headerReady.value = false;
  showOnboarding.value = true;
  selectedItems.value = pickTwoDistinctItems();
}

onMounted(() => {
  restoreGame();
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

const handleKeyDown = (e: KeyboardEvent) => {
  if (showOnboarding.value || showExport.value || showReveal.value || showCelebration.value) return;

  if (e.code === 'ArrowLeft') {
    chooseFavorite(selectedItems.value[0], selectedItems.value[1]);
  } else if (e.code === 'ArrowRight') {
    chooseFavorite(selectedItems.value[1], selectedItems.value[0]);
  }
};

// Solo: reveal the ranking here. Manager: export a code to send instead.
const openResult = () => {
  if (isManager.value) {
    showExport.value = true;
  } else {
    showReveal.value = true;
  }
};

const onCelebrationAction = () => {
  showCelebration.value = false;
  openResult();
};
</script>

<template>
  <div class="page">
    <header class="page-header">
      <h1>Moving Motivators</h1>
      <p v-if="showOnboarding">{{ t('header.subtitle.onboarding') }}</p>
      <!-- The duel tagline only makes sense while dueling: drop it on the
           results/export screens, which carry their own title. -->
      <p v-else-if="!showReveal && !showExport">{{ t('header.subtitle.duel') }}</p>

      <!-- Mode picker: onboarding only, same spot the progress pill takes over. -->
      <ModeSelector v-if="showOnboarding" v-model="mode" />

      <div v-if="headerReady && !showExport && !showReveal" class="header-progress">
        <!-- Header stays pure status: duels played + progress, then a "unlocked"
             state once the ranking opens. The action to see the ranking lives at
             the bottom of the arena, where the flow ends. -->
        <div class="progress-pill">
          <span class="progress-pill-count">⚔️ {{ t('header.duels', { n: matchCount, s: matchCount === 1 ? '' : 's' }) }}</span>
          <template v-if="!rankingUnlocked">
            <div class="progress-pill-track">
              <div class="progress-pill-fill" :style="{ width: reliabilityPercent + '%' }" />
            </div>
            <span class="progress-pill-goal">{{ t('header.progress', { p: reliabilityPercent }) }}</span>
          </template>
          <span v-else class="progress-pill-done">{{ t('header.unlocked') }}</span>
        </div>

        <!-- Restart, stacked under the duel count: findable, and stacks cleanly on mobile.
             Labelled, not icon-only, so it's not mistaken for "reload / next duel". -->
        <button
          v-if="!confirmReset"
          class="reset-btn"
          type="button"
          @click="confirmReset = true"
        >
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M21 12a9 9 0 1 1-2.64-6.36" />
            <path d="M21 3v5h-5" />
          </svg>
          <span>{{ t('footer.restart') }}</span>
        </button>
        <div v-else class="reset-confirm">
          <span class="reset-confirm-label">{{ t('footer.restartConfirm') }}</span>
          <button class="reset-yes" type="button" @click="resetGame">{{ t('footer.restartYes') }}</button>
          <button class="reset-no" type="button" @click="confirmReset = false">{{ t('footer.restartCancel') }}</button>
        </div>
      </div>
    </header>

    <div class="page-content">
      <Transition name="phase" mode="out-in" @after-leave="onPhaseAfterLeave">
        <OnboardingIntro v-if="showOnboarding" key="onboarding" @start="startGame" />
        <ExportResults
          v-else-if="showExport"
          key="export"
          :name="playerName"
          :items="rankedItems"
          @close="showExport = false"
        />
        <ResultsReveal
          v-else-if="showReveal"
          key="reveal"
          :items="rankedItems"
          :name="playerName"
          @close="showReveal = false"
        />

        <!-- Item Display -->
        <main v-else key="arena" class="arena">
          <Transition name="fade-scale" mode="out-in" @after-enter="onDuelSettled">
            <div class="fight-container" :key="matchCount">
              <MotivatorCard
                :item="selectedItems[0]"
                @choose="chooseFavorite(selectedItems[0], selectedItems[1])"
              />
              <div class="vs-badge">VS</div>
              <MotivatorCard
                :item="selectedItems[1]"
                @choose="chooseFavorite(selectedItems[1], selectedItems[0])"
              />
            </div>
          </Transition>
          <p class="hint">{{ t('arena.hint') }}</p>
          <!-- Ranking CTA at the end of the flow, once unlocked: the natural
               place to leave the duel loop, not up in the status header. -->
          <button
            v-if="rankingUnlocked"
            class="reveal-trigger arena-reveal"
            type="button"
            @click="openResult"
          >
            {{ isManager ? t('header.getCode') : t('header.seeRanking') }}
          </button>
        </main>
      </Transition>
    </div>

    <footer v-if="headerReady && !showExport && !showReveal" class="page-footer">
      <button class="footer-link" type="button" @click="showHistory = !showHistory">
        {{ t('footer.history') }} {{ showHistory ? '▾' : '▸' }}
      </button>
      <ul v-if="showHistory" class="history-list">
        <li v-for="(match, index) in matchHistory" :key="index" class="history-row">
          <span class="history-winner">🏆 {{ mName(itemById(match.winnerId)) }}</span>
          <span class="history-loser">{{ mName(itemById(match.loserId)) }}</span>
        </li>
      </ul>
    </footer>

    <Transition name="celebration-pop">
      <UnlockCelebration
        v-if="showCelebration"
        :name="playerName"
        :manager="isManager"
        @action="onCelebrationAction"
        @close="showCelebration = false"
      />
    </Transition>
  </div>
</template>

<style>
.page {
  max-width: 1300px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 40px 24px 32px;
  display: flex;
  flex-direction: column;
}

.page-header {
  flex-shrink: 0;
  text-align: center;
  margin-bottom: 24px;
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 24px 0;
}

.page-header h1 {
  margin: 0 0 10px;
  /* Display type: scales with the viewport, leans on the font's optical sizing.
     Big + heavy title vs a small, quiet subtitle = deliberate weight/size jump. */
  font-size: clamp(34px, 5.5vw, 48px);
  font-weight: 800;
  letter-spacing: -0.045em;
  line-height: 0.98;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: var(--c-ink-3);
}

/* Arena */
.arena {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.header-progress {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
}

/* Restart control under the duel count. Labelled (icon + text) so it reads as
   "start over", not "reload / next duel". Kept discreet. */
.reset-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 999px;
  border: 1px solid var(--c-border-soft);
  background: var(--c-glass);
  color: var(--c-ink-3);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.reset-btn svg {
  flex-shrink: 0;
}

.reset-btn:hover {
  color: var(--c-brand);
  border-color: rgba(180, 85, 47, 0.4);
}

.reset-confirm {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 6px 4px 12px;
  border-radius: 999px;
  background: var(--c-glass);
  border: 1px solid var(--c-border-soft);
}

.reset-confirm-label {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-2);
}

.reset-yes,
.reset-no {
  border: none;
  border-radius: 999px;
  font: inherit;
  font-size: 12px;
  font-weight: 800;
  padding: 4px 12px;
  cursor: pointer;
  transition: background-color 0.15s ease, color 0.15s ease;
}

.reset-yes {
  background: var(--c-brand);
  color: var(--c-on-brand);
}

.reset-yes:hover {
  background: var(--c-brand-deep);
}

.reset-no {
  background: var(--c-surface-3);
  color: var(--c-ink-muted);
}

.reset-no:hover {
  color: var(--c-ink);
}

/* Merged indicator: duels played + progress bar toward unlocking the ranking. */
.progress-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  border-radius: 999px;
  background: var(--c-glass);
  border: 1px solid var(--c-border-faint);
}

.progress-pill-count {
  font-size: 12px;
  font-weight: 800;
  color: var(--c-ink);
  white-space: nowrap;
}

.progress-pill-track {
  width: 84px;
  height: 7px;
  border-radius: 999px;
  background: var(--c-border);
  overflow: hidden;
}

.progress-pill-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--c-brand-soft), var(--c-brand));
  transition: width 0.4s ease;
}

.progress-pill-goal {
  font-size: 12px;
  font-weight: 700;
  color: var(--c-ink-muted);
  white-space: nowrap;
}

/* Unlocked state in the status pill: no more progress bar, just the good news. */
.progress-pill-done {
  font-size: 12px;
  font-weight: 800;
  color: var(--c-brand);
  white-space: nowrap;
}

/* Ranking CTA sitting at the bottom of the arena. A touch bigger than its old
   header incarnation since it's now the standout action of the screen. */
.arena-reveal {
  margin-top: 4px;
  padding: 12px 24px;
  font-size: 14px;
}

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.reveal-trigger {
  border: none;
  background: var(--c-brand);
  box-shadow: 0 4px 0 var(--c-brand-deep);
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  color: var(--c-on-brand);
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.reveal-trigger:hover {
  transform: translateY(-1px);
}

.reveal-trigger:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--c-brand-deep);
}

.fight-container {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 40px;
  position: relative;
}

.vs-badge {
  align-self: center;
  flex-shrink: 0;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: linear-gradient(155deg, #2a2d3e, #14151f);
  box-shadow: 0 0 0 5px var(--c-bg), 0 0 0 6px rgba(180, 85, 47, 0.25), 0 8px 16px rgba(20, 21, 31, 0.25);
  color: var(--c-on-brand);
  font-size: 15px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hint {
  margin: 20px 0 0;
  text-align: center;
  font-size: 12px;
  color: var(--c-ink-3);
}

.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-scale-enter-from,
.fade-scale-leave-to {
  opacity: 0;
  transform: scale(0.97);
}

/* Phase switch (onboarding ↔ duel ↔ export): slide + fade */
.phase-enter-active {
  transition: opacity 0.35s ease, transform 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.phase-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.phase-enter-from {
  opacity: 0;
  transform: translateY(24px) scale(0.98);
}

.phase-leave-to {
  opacity: 0;
  transform: translateY(-16px) scale(0.98);
}

/* Celebration popin: backdrop fades, the card bounces in (its own keyframe) */
.celebration-pop-enter-active {
  transition: opacity 0.3s ease;
}

.celebration-pop-leave-active {
  transition: opacity 0.25s ease;
}

.celebration-pop-enter-from,
.celebration-pop-leave-to {
  opacity: 0;
}

/* Footer: history, collapsed by default and kept deliberately discreet */
.page-footer {
  margin-top: 56px;
  padding-top: 16px;
  border-top: 1px solid var(--c-border-faint);
  text-align: center;
}

.footer-link {
  background: none;
  border: none;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  color: var(--c-ink-3);
  cursor: pointer;
  padding: 4px 10px;
  transition: color 0.15s ease;
}

.footer-link:hover {
  color: var(--c-brand);
}

.history-list {
  list-style: none;
  margin: 10px auto 0;
  padding: 0;
  max-width: 480px;
  max-height: 220px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
}

.history-row {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--c-surface-2);
}

.history-winner {
  font-weight: 600;
}

.history-loser {
  color: var(--c-ink-3);
  text-decoration: line-through;
}

@media (max-width: 720px) {
  .fight-container {
    flex-direction: column;
    align-items: center;
    gap: 18px;
  }

  /* Stacked cards: force equal full width, else each card sizes to its own
     text and the two duel cards come out different widths. */
  .arena .fight-container .card {
    width: 100%;
    max-width: 440px;
  }

  .vs-badge {
    width: 44px;
    height: 44px;
    font-size: 13px;
    margin: 0;
  }

  /* Compact duel cards so both options + VS fit on one phone screen —
     the core "compare at a glance and choose" must not require scrolling.
     GameView's <style> is global (not scoped), so target the card classes
     directly; .arena prefix raises specificity above MotivatorCard's own rules. */
  .arena .fight-container .card-banner {
    padding: 10px 14px;
    font-size: 15px;
  }

  .arena .fight-container .card-body {
    gap: 8px;
    padding: 12px 16px 16px;
  }

  .arena .fight-container .card-image {
    max-width: 150px;
    margin: 0 auto;
  }

  .arena .fight-container .card-description {
    font-size: 12px;
    line-height: 1.4;
  }
}
</style>
