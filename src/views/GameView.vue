<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { state, Motivator } from '@/store';
import { updateElo } from '@/elo';
import MotivatorCard from '@/components/MotivatorCard.vue';
import OnboardingIntro from '@/components/OnboardingIntro.vue';
import UnlockCelebration from '@/components/UnlockCelebration.vue';
import ExportResults from '@/components/ExportResults.vue';
import ResultsReveal from '@/components/ResultsReveal.vue';

// Manager mode is opted into via ?mode=manager on the link the manager shares.
// Default (no param) = solo: the player reveals their own ranking.
const route = useRoute();
const isManager = computed(() => route.query.mode === 'manager');

const showOnboarding = ref(true);
const showCelebration = ref(false);
const showExport = ref(false);
const showReveal = ref(false);
const playerName = ref('');

const startGame = (name: string) => {
  playerName.value = name;
  showOnboarding.value = false;
};

const pickTwoDistinctItems = (): Motivator[] => {
  const pickFunction = Math.random() < 0.6 ? weightedRandomItem : randomItem; // 3/5 chance for weighted

  const firstItem = pickFunction();
  let secondItem = pickFunction();

  while (secondItem === firstItem) {
    secondItem = pickFunction();
  }

  return [firstItem, secondItem];
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
// Blocks new picks while the card transition (fade-scale, 180ms) is still running.
// Firing chooseFavorite again before it settles can leave the transition's
// enter classes stuck, making the cards invisible.
const isAnimating = ref(false);
const matchHistory = ref<{ winner: string; loser: string }[]>([]);
const matchCount = ref(0);
const showHistory = ref(false);

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
  isAnimating.value = true;
  setTimeout(() => {
    isAnimating.value = false;
  }, 200);

  const [newWinnerElo, newLoserElo] = updateElo(winner.elo, loser.elo);
  winner.elo = newWinnerElo;
  loser.elo = newLoserElo;

  // Update match history and count
  matchHistory.value.unshift({ winner: winner.name, loser: loser.name });
  matchCount.value++;

  // Increment shown count for both winner and loser
  winner.shownCount++;
  loser.shownCount++;

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
};

onMounted(() => {
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
      <p v-if="showOnboarding">Découvre ce qui te motive vraiment parmi 10 leviers de motivation.</p>
      <p v-else>Choisis la carte qui te motive le plus à chaque duel.</p>

      <div v-if="!showOnboarding && !showExport && !showReveal" class="header-progress">
        <button v-if="rankingUnlocked" class="reveal-trigger" type="button" @click="openResult">
          {{ isManager ? 'Récupérer mon code 🎁' : 'Voir mon classement ✨' }}
        </button>
        <!-- Single merged indicator: duels played + progress toward unlocking the ranking. -->
        <div v-else class="progress-pill" :title="`Continue à jouer : ton classement se débloque (${reliabilityPercent} %)`">
          <span class="progress-pill-count">⚔️ {{ matchCount }} duel{{ matchCount === 1 ? '' : 's' }}</span>
          <div class="progress-pill-track">
            <div class="progress-pill-fill" :style="{ width: reliabilityPercent + '%' }" />
          </div>
          <span class="progress-pill-goal">🔒 progression {{ reliabilityPercent }}%</span>
        </div>
      </div>
    </header>

    <div class="page-content">
      <Transition name="phase" mode="out-in">
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
          <Transition name="fade-scale" mode="out-in">
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
          <p class="hint">Clique une carte, ou utilise les flèches ← →</p>
        </main>
      </Transition>
    </div>

    <footer v-if="!showOnboarding && !showExport && !showReveal" class="page-footer">
      <button class="history-toggle" type="button" @click="showHistory = !showHistory">
        Historique {{ showHistory ? '▾' : '▸' }}
      </button>
      <ul v-if="showHistory" class="history-list">
        <li v-for="(match, index) in matchHistory" :key="index" class="history-row">
          <span class="history-winner">🏆 {{ match.winner }}</span>
          <span class="history-loser">{{ match.loser }}</span>
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
  margin: 0 0 6px;
  font-size: 30px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.page-header p {
  margin: 0;
  font-size: 14px;
  color: #667085;
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
  justify-content: center;
  margin-top: 14px;
}

/* Merged indicator: duels played + progress bar toward unlocking the ranking. */
.progress-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 7px 14px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.progress-pill-count {
  font-size: 12px;
  font-weight: 800;
  color: #1a1c29;
  white-space: nowrap;
}

.progress-pill-track {
  width: 84px;
  height: 7px;
  border-radius: 999px;
  background: #e6e8f0;
  overflow: hidden;
}

.progress-pill-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #818cf8, #6366f1);
  transition: width 0.4s ease;
}

.progress-pill-goal {
  font-size: 12px;
  font-weight: 700;
  color: #667085;
  white-space: nowrap;
}

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.reveal-trigger {
  border: none;
  background: #6366f1;
  box-shadow: 0 4px 0 #4338ca;
  border-radius: 10px;
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 800;
  color: #ffffff;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.reveal-trigger:hover {
  transform: translateY(-1px);
}

.reveal-trigger:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #4338ca;
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
  box-shadow: 0 0 0 5px #f0f1f8, 0 0 0 6px rgba(99, 102, 241, 0.25), 0 8px 16px rgba(20, 21, 31, 0.25);
  color: #ffffff;
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
  color: #98a2b3;
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
  border-top: 1px solid rgba(15, 23, 42, 0.06);
  text-align: center;
}

.history-toggle {
  background: none;
  border: none;
  font: inherit;
  font-size: 11px;
  font-weight: 600;
  color: #b0b5c2;
  cursor: pointer;
  padding: 4px 10px;
  transition: color 0.15s ease;
}

.history-toggle:hover {
  color: #6366f1;
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
  background: #f9fafc;
}

.history-winner {
  font-weight: 600;
}

.history-loser {
  color: #98a2b3;
  text-decoration: line-through;
}

@media (max-width: 720px) {
  .fight-container {
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .vs-badge {
    width: 44px;
    height: 44px;
    font-size: 13px;
    margin: -2px 0;
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
