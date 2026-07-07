<script setup lang="ts">
import { computed, ref } from 'vue';
import { Motivator } from '@/store';
import MotivatorCard from './MotivatorCard.vue';
import { t, placeLabel } from '@/i18n';

const props = defineProps<{ items: Motivator[]; name?: string }>();
defineEmits<{ (e: 'close'): void }>();

// Title with the name highlighted; split around {name} so word order works in
// both "Le classement de X" (fr) and "X's ranking" (en).
const titleParts = computed(() => t('reveal.title').split('{name}'));

// Relative "strength" bar per card: shows the gaps between motivations at a
// glance (a runaway #1 vs a tightly-packed top) instead of a raw ELO number.
const eloMin = computed(() => Math.min(...props.items.map((i) => i.elo)));
const eloMax = computed(() => Math.max(...props.items.map((i) => i.elo)));
const barWidth = (elo: number): number => {
  if (eloMax.value === eloMin.value) return 100;
  return Math.round(14 + ((elo - eloMin.value) / (eloMax.value - eloMin.value)) * 86);
};

const TOTAL = 10;
// Displayed left to right as 4th...10th; revealed right to left (10th first).
const FRIEZE_RANKS = [4, 5, 6, 7, 8, 9, 10];

const revealedCount = ref(0);

const nextRank = computed(() => TOTAL - revealedCount.value);
const allRevealed = computed(() => revealedCount.value >= TOTAL);

const nextRankLabel = computed(() => placeLabel(nextRank.value));

const isRevealed = (rank: number) => rank >= TOTAL + 1 - revealedCount.value;

const rank1Revealed = computed(() => isRevealed(1));
const rank2Revealed = computed(() => isRevealed(2));
const rank3Revealed = computed(() => isRevealed(3));

const revealNext = () => {
  if (!allRevealed.value) {
    revealedCount.value++;
  }
};
</script>

<template>
  <div class="reveal-page">
    <header class="reveal-header">
      <h2 v-if="name">{{ titleParts[0] }}<span class="reveal-name">{{ name }}</span>{{ titleParts[1] }}</h2>
      <h2 v-else>{{ t('reveal.titleNoName') }}</h2>
      <button class="reveal-close" type="button" @click="$emit('close')">{{ t('reveal.close') }}</button>
    </header>

    <!-- Podium on top: 2nd, 1st, 3rd. Revealed last (from the bottom up). -->
    <div class="podium-wrapper">

      <div class="podium">
        <div class="podium-slot" style="animation-delay: 0s">
          <div class="mini-card-wrap">
            <div class="mini-card-content" :class="{ revealed: rank2Revealed }">
              <MotivatorCard :item="items[1]" />
              <div v-if="rank2Revealed" class="mini-card-bar">
                <div class="mini-card-bar-fill" :style="{ width: barWidth(items[1].elo) + '%', backgroundColor: items[1].color }" />
              </div>
              <Transition name="mask-fade">
                <div v-if="!rank2Revealed" class="reveal-mask">?</div>
              </Transition>
            </div>
          </div>
          <div class="podium-block podium-block--2" :class="{ revealed: rank2Revealed }">2</div>
        </div>

        <div class="podium-slot" style="animation-delay: 0.07s">
          <span v-if="rank1Revealed" class="podium-crown">👑</span>
          <div class="mini-card-wrap">
            <div class="mini-card-content" :class="{ revealed: rank1Revealed }">
              <MotivatorCard :item="items[0]" />
              <div v-if="rank1Revealed" class="mini-card-bar">
                <div class="mini-card-bar-fill" :style="{ width: barWidth(items[0].elo) + '%', backgroundColor: items[0].color }" />
              </div>
              <Transition name="mask-fade">
                <div v-if="!rank1Revealed" class="reveal-mask">?</div>
              </Transition>
            </div>
          </div>
          <div class="podium-block podium-block--1" :class="{ revealed: rank1Revealed }">1</div>
        </div>

        <div class="podium-slot" style="animation-delay: 0.14s">
          <div class="mini-card-wrap">
            <div class="mini-card-content" :class="{ revealed: rank3Revealed }">
              <MotivatorCard :item="items[2]" />
              <div v-if="rank3Revealed" class="mini-card-bar">
                <div class="mini-card-bar-fill" :style="{ width: barWidth(items[2].elo) + '%', backgroundColor: items[2].color }" />
              </div>
              <Transition name="mask-fade">
                <div v-if="!rank3Revealed" class="reveal-mask">?</div>
              </Transition>
            </div>
          </div>
          <div class="podium-block podium-block--3" :class="{ revealed: rank3Revealed }">3</div>
        </div>
      </div>
    </div>

    <!-- Frieze below: 4th to 10th, revealed first (10th first, bottom-up). -->
    <ol class="frieze">
      <li
        v-for="(rank, i) in FRIEZE_RANKS"
        :key="rank"
        class="frieze-slot"
        :style="{ animationDelay: (0.21 + i * 0.07) + 's' }"
      >
        <div class="mini-card-wrap">
          <div class="frieze-rank-header">{{ rank }}</div>
          <div class="mini-card-content" :class="{ revealed: isRevealed(rank) }">
            <MotivatorCard :item="items[rank - 1]" />
            <div v-if="isRevealed(rank)" class="mini-card-bar">
              <div class="mini-card-bar-fill" :style="{ width: barWidth(items[rank - 1].elo) + '%', backgroundColor: items[rank - 1].color }" />
            </div>
            <Transition name="mask-fade">
              <div v-if="!isRevealed(rank)" class="reveal-mask">?</div>
            </Transition>
          </div>
        </div>
      </li>
    </ol>

    <button v-if="!allRevealed" class="reveal-next" type="button" @click="revealNext">
      {{ t('reveal.next', { label: nextRankLabel }) }}
    </button>
    <p v-else class="reveal-done">{{ t('reveal.done') }}</p>
  </div>
</template>

<style scoped>
.reveal-page {
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 28px;
}

.reveal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.reveal-header h2 {
  margin: 0;
  font-size: 20px;
}

.reveal-name {
  color: var(--c-brand);
}

.reveal-close {
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-ink-muted);
  cursor: pointer;
}

.reveal-close:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

/* Frieze */
.frieze {
  list-style: none;
  margin: 40px 0 0;
  padding: 0;
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 12px;
}

.frieze-slot {
  width: 152px;
  animation: reveal-appear 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
}

/* Staggered entrance so the ranking grid assembles progressively on open. */
@keyframes reveal-appear {
  from { opacity: 0; transform: translateY(14px) scale(0.92); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

@media (prefers-reduced-motion: reduce) {
  .frieze-slot,
  .podium-slot {
    animation: none;
  }

  /* Cards still appear on reveal, just without the pop scale animation. */
  .mini-card-content.revealed :deep(.card) {
    animation: none;
  }
}

.frieze-rank-header {
  flex-shrink: 0;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: var(--c-ink-3);
  margin-bottom: 6px;
}

/* Shared: mini card + its exact-size "?" mask, used in the frieze and podium. */
.mini-card-wrap {
  display: flex;
  flex-direction: column;
  margin-bottom: 12px;
  pointer-events: none;
}

.mini-card-content {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.mini-card-content :deep(.card) {
  flex: 1;
  min-height: 0;
  cursor: default;
}

/* When a card is unmasked, it pops in (scale + fade) as the "?" fades out. */
.mini-card-content.revealed :deep(.card) {
  animation: card-pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes card-pop {
  from { opacity: 0; transform: scale(0.6); }
  60% { opacity: 1; }
  to { opacity: 1; transform: scale(1); }
}

/* Reveal cards are narrow: shrink the banner so long names never clip,
   and tighten the body so the description reads cleanly. */
.mini-card-content :deep(.card-banner) {
  padding: 12px 10px;
  font-size: 14px;
  letter-spacing: 0.01em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mini-card-content :deep(.card-body) {
  flex: 1;
  min-height: 0;
  gap: 10px;
  padding: 14px 14px 16px;
  justify-content: flex-start;
  overflow: hidden;
}

.mini-card-content :deep(.card-description) {
  font-size: 12px;
  line-height: 1.45;
  color: var(--c-ink-3);
}

.frieze-slot .mini-card-wrap {
  height: 300px;
}

.podium-slot .mini-card-wrap {
  height: 320px;
}

.mini-card-bar {
  flex-shrink: 0;
  margin-top: 8px;
  height: 6px;
  border-radius: 999px;
  background: var(--c-surface-3);
  overflow: hidden;
}

.mini-card-bar-fill {
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s cubic-bezier(0.34, 1.2, 0.64, 1);
}

.reveal-mask {
  position: absolute;
  inset: 0;
  z-index: 1;
  background: var(--c-surface);
  border: 2px dashed var(--c-dashed);
  border-radius: 16px;
  color: var(--c-dashed);
  font-size: 26px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mask-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.mask-fade-leave-to {
  opacity: 0;
  transform: scale(1.08);
}

/* Podium */
.podium-wrapper {
  position: relative;
}

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 24px;
  min-height: 240px;
  padding: 32px 0 0;
}

.podium-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 190px;
  animation: reveal-appear 0.4s cubic-bezier(0.34, 1.4, 0.64, 1) backwards;
}

.podium-crown {
  font-size: 26px;
  line-height: 1;
  margin-bottom: 6px;
}

.podium-block {
  width: 100%;
  height: 24px;
  border-radius: 10px 10px 0 0;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 6px;
  font-size: 20px;
  font-weight: 800;
  background: var(--c-surface-3);
  color: var(--c-ink-faint);
  transition: height 0.5s cubic-bezier(0.34, 1.2, 0.64, 1), background-color 0.3s ease, color 0.3s ease;
}

.podium-block--1.revealed {
  height: 80px;
  background: #fde68a;
  color: #92400e;
  box-shadow: 0 0 0 3px rgba(253, 230, 138, 0.5), 0 12px 24px rgba(253, 230, 138, 0.45);
}
.podium-block--2.revealed { height: 58px; background: #e2e8f0; color: #475569; }
.podium-block--3.revealed { height: 40px; background: #fbcfa0; color: #9a3412; }

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.reveal-next {
  display: block;
  /* Sticky so the reveal action stays reachable on short viewports, where it
     otherwise sat below the fold and made the page look frozen on open. */
  position: sticky;
  bottom: 16px;
  z-index: 2;
  margin: 28px auto 0;
  background: var(--c-brand);
  box-shadow: 0 4px 0 var(--c-brand-deep);
  color: var(--c-on-brand);
  border: none;
  border-radius: 10px;
  padding: 14px 28px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.reveal-next:hover {
  transform: translateY(-1px);
}

.reveal-next:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--c-brand-deep);
}

.reveal-done {
  text-align: center;
  margin: 28px 0 0;
  font-size: 15px;
  font-weight: 700;
}

.fade-scale-enter-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-scale-enter-from {
  opacity: 0;
  transform: scale(0.96);
}

/* Mobile only — desktop layout above is untouched.
   Podium (3 fixed 190px slots) would overflow a phone, so slots flex to share
   the row and cards become compact (icon + name + elo, no description). */
@media (max-width: 640px) {
  .podium {
    gap: 8px;
    min-height: 0;
    padding-top: 24px;
  }

  .podium-slot {
    width: auto;
    flex: 1 1 0;
    min-width: 0;
  }

  .podium-crown {
    font-size: 20px;
  }

  .frieze {
    gap: 8px;
    margin-top: 28px;
  }

  .frieze-slot {
    width: 30%;
    min-width: 90px;
  }

  .frieze-rank-header {
    font-size: 12px;
  }

  .frieze-slot .mini-card-wrap,
  .podium-slot .mini-card-wrap {
    height: 176px;
  }

  .mini-card-content :deep(.card-banner) {
    font-size: 11px;
    padding: 8px 4px;
  }

  .mini-card-content :deep(.card-description) {
    display: none;
  }

  .mini-card-bar {
    margin-top: 6px;
    height: 5px;
  }
}
</style>
