<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { state, Motivator } from '@/store';
import MotivatorCard from '@/components/MotivatorCard.vue';
import OnboardingIntro from '@/components/OnboardingIntro.vue';
import { Mode } from '@/components/ModeSelector.vue';
import UnlockCelebration from '@/components/UnlockCelebration.vue';
import ExportResults from '@/components/ExportResults.vue';
import ResultsReveal from '@/components/ResultsReveal.vue';
import { t, mName } from '@/i18n';
import { useMotivatorGame } from '@/composables/useMotivatorGame';

// Pure UI phase state, owned by the view. The game model, pairing and
// persistence live in the composable.
const showCelebration = ref(false);
const showExport = ref(false);
const showReveal = ref(false);
const showHistory = ref(false);
const confirmReset = ref(false);
// Held back until the onboarding card has actually finished leaving, so the game
// header doesn't briefly coexist with the onboarding card during the phase
// switch. Flipped by the phase transition's @after-leave.
const headerReady = ref(false);

// Mode is pre-selected from the ?mode=manager param on a shared link (default
// solo); the game locks it in once started.
const route = useRoute();
const defaultMode: Mode = route.query.mode === 'manager' ? 'manager' : 'solo';

const {
  playerName,
  mode,
  started,
  selectedItems,
  isAnimating,
  matchHistory,
  matchCount,
  rankingUnlocked,
  rankedItems,
  reliabilityPercent,
  startGame,
  chooseFavorite,
  settleDuel,
  restore,
  reset,
} = useMotivatorGame({ defaultMode, onUnlock: () => { showCelebration.value = true; } });

const isManager = computed(() => mode.value === 'manager');
// Onboarding is simply "the game hasn't started": single source of truth is the
// model's `started`, no separate flag to keep in sync.
const showOnboarding = computed(() => !started.value);

const itemById = (id: number) => state.items.find((m) => m.id === id) as Motivator;

// A phase finished leaving. Reveal the header only once we've landed OUT of
// onboarding, never when a reset sends us back to it, otherwise the duel header
// would show over the onboarding card.
const onPhaseAfterLeave = () => {
  if (!showOnboarding.value) headerReady.value = true;
};

// New duel cards have finished entering: accept the next pick.
const onDuelSettled = () => settleDuel();

// Wipe the game and return to onboarding, clearing the view's UI phase too.
const resetGame = () => {
  reset();
  showCelebration.value = false;
  showExport.value = false;
  showReveal.value = false;
  showHistory.value = false;
  confirmReset.value = false;
  headerReady.value = false;
};

// Choice confirmation: the picked card pops and the other recedes for a short
// beat before the pair swaps. Kept fast (it's paid 40-60 times) and skipped
// under reduced motion. `confirmingSide` holds the winning card's index.
const confirmingSide = ref<0 | 1 | null>(null);

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const commitPick = (winnerIdx: 0 | 1) => {
  const winner = selectedItems.value[winnerIdx];
  const loser = selectedItems.value[winnerIdx === 0 ? 1 : 0];
  chooseFavorite(winner, loser);
};

const onPick = (winnerIdx: 0 | 1) => {
  // Ignore input during the confirm beat or the card swap.
  if (confirmingSide.value !== null || isAnimating.value) return;
  if (prefersReducedMotion()) {
    commitPick(winnerIdx);
    return;
  }
  confirmingSide.value = winnerIdx;
};

// The confirm animation on the picked card ended: commit the duel and swap.
const onConfirmEnd = () => {
  if (confirmingSide.value === null) return;
  const winnerIdx = confirmingSide.value;
  confirmingSide.value = null;
  commitPick(winnerIdx);
};

const handleKeyDown = (e: KeyboardEvent) => {
  if (showOnboarding.value || showExport.value || showReveal.value || showCelebration.value) return;

  if (e.code === 'ArrowLeft') {
    onPick(0);
  } else if (e.code === 'ArrowRight') {
    onPick(1);
  }
};

onMounted(() => {
  // Restored game: skip onboarding and show the header right away, no wait for an
  // onboarding leave transition that never happens.
  if (restore()) headerReady.value = true;
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
});

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
        <OnboardingIntro v-if="showOnboarding" key="onboarding" v-model:mode="mode" @start="startGame" />
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
                :class="{ 'card-won': confirmingSide === 0, 'card-lost': confirmingSide === 1 }"
                @choose="onPick(0)"
                @animationend="onConfirmEnd"
              />
              <div class="vs-badge">VS</div>
              <MotivatorCard
                :item="selectedItems[1]"
                :class="{ 'card-won': confirmingSide === 1, 'card-lost': confirmingSide === 0 }"
                @choose="onPick(1)"
                @animationend="onConfirmEnd"
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

/* Choice confirmation: a short beat on the chosen pair before it swaps out.
   The picked card pops and lifts, the other recedes (fade + shrink + desaturate),
   so the choice reads before the next duel. Skipped under reduced motion (the
   view commits the pick immediately instead, so animationend isn't relied on). */
.arena .fight-container .card-won {
  z-index: 1;
  animation: card-won 0.15s ease-out forwards;
}

.arena .fight-container .card-lost {
  animation: card-lost 0.15s ease-out forwards;
}

@keyframes card-won {
  0% { transform: translateY(0) scale(1); }
  60% { transform: translateY(-6px) scale(1.05); }
  100% { transform: translateY(-3px) scale(1.04); }
}

@keyframes card-lost {
  0% { opacity: 1; transform: scale(1); filter: saturate(1); }
  100% { opacity: 0.45; transform: scale(0.93); filter: saturate(0.4); }
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
