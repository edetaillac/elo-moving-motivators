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
import LangSwitch from '@/components/LangSwitch.vue';
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
  wasRestored,
  reset,
} = useMotivatorGame({ defaultMode, onUnlock: () => { showCelebration.value = true; } });

// A restored game skips onboarding: reveal the header right away, on the first
// render, rather than waiting for an onboarding leave transition that never runs.
if (wasRestored) headerReady.value = true;

const isManager = computed(() => mode.value === 'manager');
// Onboarding is simply "the game hasn't started": single source of truth is the
// model's `started`, no separate flag to keep in sync.
const showOnboarding = computed(() => !started.value);

const itemById = (id: number) => state.items.find((m) => m.id === id) as Motivator;

// The duel screen is up: the game has started and we're not on a results screen.
// Gates the topbar actions, progress bar and footer.
const showArena = computed(() => headerReady.value && !showExport.value && !showReveal.value);

// Dynamic background: two soft radial halos in the colors of the pair currently
// in play, over the neutral warm base — refreshed each duel. Neutral elsewhere.
const hexToRgb = (hex: string): string => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
// Same YIQ readability check the card banner uses: dark text on a light accent
// (yellow, light pink…), keeps the winner toast legible.
const isLightHex = (hex: string): boolean => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
};
const pageStyle = computed(() => {
  // Ceremonial screens (accueil, ranking reveal, manager export) get the warm
  // gold halo from the top of the screen, over the neutral base.
  if (showOnboarding.value || showReveal.value || showExport.value) {
    return {
      background: 'radial-gradient(ellipse 70% 45% at 50% 0%, rgba(214,163,44,0.10), transparent 70%), var(--c-bg)',
    };
  }
  if (!showArena.value) return { background: 'var(--c-bg)' };
  const l = hexToRgb(selectedItems.value[0]?.color ?? '#c4732e');
  const r = hexToRgb(selectedItems.value[1]?.color ?? '#c4732e');
  return {
    background:
      `radial-gradient(circle at 22% 62%, rgba(${l},0.16), transparent 42%),` +
      `radial-gradient(circle at 78% 62%, rgba(${r},0.16), transparent 42%),` +
      'var(--c-bg)',
  };
});

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
  if (resolveTimer) clearTimeout(resolveTimer);
  pickedSide.value = null;
  reset();
  showCelebration.value = false;
  showExport.value = false;
  showReveal.value = false;
  showHistory.value = false;
  confirmReset.value = false;
  headerReady.value = false;
};

// Duel resolution (handoff): on a pick, the chosen card pops with a check badge,
// the other recedes and the winner toast shows, held for a beat before the pair
// swaps. `pickedSide` holds the winning card's index during that dwell.
const RESOLVE_MS = 650;
const pickedSide = ref<0 | 1 | null>(null);
let resolveTimer: ReturnType<typeof setTimeout> | null = null;

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const commitPick = (winnerIdx: 0 | 1) => {
  const won = selectedItems.value[winnerIdx];
  const lost = selectedItems.value[winnerIdx === 0 ? 1 : 0];
  // Clear the dwell state before the pair swaps. The leaving (keyed-out) duel is
  // frozen with its winner still highlighted, the entering pair comes in clean.
  pickedSide.value = null;
  chooseFavorite(won, lost);
};

const onPick = (winnerIdx: 0 | 1) => {
  // Ignore input during the resolution dwell or the card swap.
  if (pickedSide.value !== null || isAnimating.value) return;
  if (prefersReducedMotion()) {
    commitPick(winnerIdx);
    return;
  }
  pickedSide.value = winnerIdx;
  resolveTimer = setTimeout(() => commitPick(winnerIdx), RESOLVE_MS);
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
  window.addEventListener('keydown', handleKeyDown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyDown);
  if (resolveTimer) clearTimeout(resolveTimer);
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
  <div class="page" :style="pageStyle">
    <!-- Onboarding is a full-screen centered accueil (title + card live in
         OnboardingIntro), so the topbar only shows on the duel/results screens. -->
    <header v-if="!showOnboarding" class="topbar">
      <div class="wordmark">Moving Motivators</div>
      <div v-if="showArena" class="topbar-actions">
        <button v-if="!confirmReset" class="ghost-btn" type="button" @click="confirmReset = true">
          {{ t('footer.restart') }}
        </button>
        <div v-else class="reset-confirm">
          <span class="reset-confirm-label">{{ t('footer.restartConfirm') }}</span>
          <button class="reset-yes" type="button" @click="resetGame">{{ t('footer.restartYes') }}</button>
          <button class="reset-no" type="button" @click="confirmReset = false">{{ t('footer.restartCancel') }}</button>
        </div>
      </div>
    </header>

    <!-- Progress toward unlocking the ranking (reliability-based), in the clean
         thin bar from the handoff: duel index left, unlock status right. -->
    <div v-if="showArena" class="progress">
      <div class="progress-labels">
        <span class="progress-duel">{{ t('progress.duel', { n: matchCount + 1 }) }}</span>
        <span class="progress-status">{{ rankingUnlocked ? t('header.unlocked') : t('progress.toUnlock', { p: reliabilityPercent }) }}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" :style="{ width: (rankingUnlocked ? 100 : reliabilityPercent) + '%' }" />
      </div>
    </div>

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
          <div class="arena-head">
            <h1 class="arena-title">{{ t('arena.title') }}</h1>
            <p class="arena-subtitle">{{ t('arena.subtitle') }}</p>
          </div>

          <Transition name="fade-scale" mode="out-in" @after-enter="onDuelSettled">
            <div class="fight-container" :key="matchCount">
              <MotivatorCard
                :item="selectedItems[0]"
                :won="pickedSide === 0"
                :lost="pickedSide === 1"
                @choose="onPick(0)"
              />
              <div class="vs-badge" :class="{ 'vs-badge--hidden': pickedSide !== null }">VS</div>
              <MotivatorCard
                :item="selectedItems[1]"
                :won="pickedSide === 1"
                :lost="pickedSide === 0"
                @choose="onPick(1)"
              />
            </div>
          </Transition>

          <!-- Reserved-height slot; mirrors the duel row (two equal cells + the VS
               spacer) so the toast lands centered under the winning card. -->
          <div class="toast-slot">
            <div class="toast-cell">
              <Transition name="toast">
                <span
                  v-if="pickedSide === 0"
                  class="toast"
                  :class="{ 'toast--dark-text': isLightHex(selectedItems[0].color) }"
                  :style="{ '--accent': selectedItems[0].color }"
                >
                  {{ t('arena.wins', { name: mName(selectedItems[0]) }) }}
                </span>
              </Transition>
            </div>
            <div class="toast-vs-spacer" aria-hidden="true" />
            <div class="toast-cell">
              <Transition name="toast">
                <span
                  v-if="pickedSide === 1"
                  class="toast"
                  :class="{ 'toast--dark-text': isLightHex(selectedItems[1].color) }"
                  :style="{ '--accent': selectedItems[1].color }"
                >
                  {{ t('arena.wins', { name: mName(selectedItems[1]) }) }}
                </span>
              </Transition>
            </div>
          </div>

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
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </button>
        </main>
      </Transition>
    </div>

    <footer v-if="showArena" class="page-footer">
      <button class="footer-link" type="button" @click="showHistory = !showHistory">
        {{ t('footer.history') }} {{ showHistory ? '▾' : '▸' }}
      </button>
      <ul v-if="showHistory" class="history-list">
        <li v-for="(match, index) in matchHistory" :key="index" class="history-row">
          <span class="history-winner">{{ mName(itemById(match.winnerId)) }}</span>
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

    <!-- Language switch only on onboarding: the player picks it before starting,
         it would just sit over the duel and results otherwise. -->
    <LangSwitch v-if="showOnboarding" />
  </div>
</template>

<style>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
}

/* Top bar: left-aligned wordmark + a right-aligned action on the duel/results
   screens; a centered hero on onboarding. */
.topbar {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px 32px;
}

.wordmark {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 20px;
  letter-spacing: -0.02em;
  color: var(--c-ink);
}

.page-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  /* Horizontal gutter so the arena / reveal / export never touch the screen
     edges on mobile (invisible on desktop, content is centered + capped). */
  padding: 24px 20px;
}

/* Ghost restart button (handoff): quiet pill on the neutral background. */
.ghost-btn {
  border: 1.5px solid var(--c-border-soft);
  background: var(--c-glass);
  color: var(--c-ink-2);
  font: inherit;
  font-weight: 600;
  font-size: 13px;
  padding: 8px 16px;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.ghost-btn:hover {
  color: var(--c-brand);
  border-color: color-mix(in srgb, var(--c-brand) 40%, transparent);
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
  font-size: 13px;
  font-weight: 700;
  color: var(--c-ink-2);
}

.reset-yes,
.reset-no {
  border: none;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  padding: 5px 14px;
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

/* Progress toward unlocking the ranking, thin bar (handoff). */
.progress {
  max-width: 360px;
  width: 100%;
  margin: 8px auto 0;
  padding: 0 24px;
}

.progress-labels {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-duel {
  font-size: 13px;
  font-weight: 700;
  color: var(--c-ink);
}

.progress-status {
  font-size: 13px;
  font-weight: 500;
  color: var(--c-ink-3);
}

.progress-track {
  height: 6px;
  border-radius: 999px;
  background: rgba(44, 38, 34, 0.09);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 999px;
  background: var(--c-brand);
  transition: width 0.5s ease;
}

/* Arena: title + duel row + toast + hint, centered, generous rhythm. */
.arena {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 28px;
}

.arena-head {
  text-align: center;
  max-width: 520px;
}

.arena-title {
  margin: 0 0 4px;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700;
  font-size: 26px;
  letter-spacing: -0.02em;
  color: var(--c-ink);
}

.arena-subtitle {
  margin: 0;
  font-size: 15px;
  color: var(--c-ink-3);
}

/* Ranking CTA at the bottom of the arena, once unlocked. Soft-shadow accent
   pill, consistent with the accueil / manager / reveal CTAs. */
.arena-reveal {
  margin-top: 4px;
}

.reveal-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  padding: 13px 24px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  background: var(--c-brand);
  color: var(--c-on-brand);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.reveal-trigger:hover {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

.fight-container {
  width: 100%;
  max-width: 780px;
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 40px;
  position: relative;
}

/* VS badge overlapping the two cards, fades out while a duel resolves. */
.vs-badge {
  align-self: center;
  flex: none;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  background: var(--c-ink);
  color: #fff;
  font-weight: 800;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.22);
  border: 3px solid var(--c-bg);
  margin: 0 -14px;
  z-index: 2;
  transition: opacity 0.3s ease;
}

.vs-badge--hidden {
  opacity: 0;
}

/* Reserved height so the winner toast doesn't shift the layout. Mirrors the duel
   row (two flex:1 cells + the VS-width spacer) so the toast sits centered under
   whichever card won. */
.toast-slot {
  width: 100%;
  max-width: 780px;
  height: 20px;
  display: flex;
  align-items: center;
  gap: 40px;
}

.toast-cell {
  flex: 1;
  display: flex;
  justify-content: center;
}

.toast-vs-spacer {
  flex: none;
  width: 58px;
  margin: 0 -14px;
}

.toast {
  background: var(--accent);
  color: #fff;
  font-weight: 700;
  font-size: 13px;
  padding: 7px 16px;
  border-radius: 999px;
  box-shadow: 0 6px 16px color-mix(in srgb, var(--accent) 35%, transparent);
}

.toast--dark-text {
  color: #2c2622;
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(6px) scale(0.96);
}

.hint {
  margin: 0;
  text-align: center;
  font-size: 13px;
  color: var(--c-ink-faint);
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

  /* Cards stack, so just center the toast rather than under a column cell. */
  .toast-slot {
    gap: 0;
    justify-content: center;
  }

  .toast-cell {
    flex: 0 1 auto;
  }

  .toast-vs-spacer {
    display: none;
  }

  /* Compact duel cards so both options + VS fit on one phone screen —
     the core "compare at a glance and choose" must not require scrolling.
     GameView's <style> is global (not scoped), so target the card classes
     directly; .arena prefix raises specificity above MotivatorCard's own rules. */
  .arena .fight-container .card-body {
    gap: 12px;
    padding: 18px 16px 20px;
  }

  .arena .fight-container .card-icon {
    width: 76px;
    height: 76px;
  }

  .arena .fight-container .card-icon img {
    width: 50px;
    height: 50px;
  }

  .arena .fight-container .card-description {
    font-size: 13px;
    line-height: 1.45;
  }
}
</style>
