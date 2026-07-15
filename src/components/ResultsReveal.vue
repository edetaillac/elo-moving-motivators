<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { Motivator } from '@/store';
import { iconUrl } from '@/icons';
import { t, placeLabel, mName, mDesc } from '@/i18n';

const props = withDefaults(defineProps<{ items: Motivator[]; name?: string; showClose?: boolean }>(), {
  showClose: true,
});
defineEmits<{ (e: 'close'): void }>();

const TOTAL = 10;

// Placeholder board that fills in one rank at a time, from 10th up to 1st.
const shown = ref(0);

// Opening the reveal is a phase switch: move focus to its heading so it doesn't
// drop to <body> and the screen reader announces the new context.
const headingRef = ref<HTMLElement | null>(null);

// Title with the name highlighted; split around {name} so word order works in
// both "Le classement de X" (fr) and "X's ranking" (en).
const titleParts = computed(() => t('reveal.title').split('{name}'));

// A rank R is revealed once we've shown at least (11 - R) slots: rank 10 first,
// rank 1 last.
const isRevealed = (rank: number) => shown.value >= TOTAL + 1 - rank;

const showNext = computed(() => shown.value < TOTAL);
// The rank about to be revealed by the next click (10, 9, … 1).
const nextRankLabel = computed(() => placeLabel(TOTAL - shown.value));

// Visual podium order: 2nd · 1st · 3rd, tallest in the middle.
const podiumSlots = computed(() => [
  { item: props.items[1], rank: 2, winner: false, width: 190, ph: 264, pedestal: 62 },
  { item: props.items[0], rank: 1, winner: true, width: 212, ph: 300, pedestal: 88 },
  { item: props.items[2], rank: 3, winner: false, width: 190, ph: 264, pedestal: 44 },
]);

// Ranks 4→10, revealed before the podium.
const restRows = computed(() =>
  props.items.slice(3).map((item, i) => ({ item, rank: i + 4 })),
);

// Same YIQ readability check the cards use: dark banner text on light accents.
const isLightHex = (hex: string): boolean => {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
};

const next = () => {
  if (shown.value < TOTAL) shown.value++;
};

const onKey = (e: KeyboardEvent) => {
  // Don't hijack Enter/Space/arrows from a focused control — otherwise pressing
  // Enter on "Fermer" would advance the reveal instead of closing it.
  const target = e.target as HTMLElement | null;
  if (target?.closest('button, a, input, textarea, select')) return;
  if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight' || e.key === 'ArrowUp') {
    e.preventDefault();
    next();
  }
};

onMounted(() => {
  window.addEventListener('keydown', onKey);
  headingRef.value?.focus();
});
onUnmounted(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="reveal" :class="{ 'reveal--crowned': isRevealed(1) }" :style="{ '--winner': items[0]?.color }">
    <div class="reveal-inner">
      <header class="reveal-header">
        <h2 v-if="name" ref="headingRef" tabindex="-1">{{ titleParts[0] }}<span class="reveal-name">{{ name }}</span>{{ titleParts[1] }}</h2>
        <h2 v-else ref="headingRef" tabindex="-1">{{ t('reveal.titleNoName') }}</h2>
        <button v-if="showClose" class="reveal-close" type="button" @click="$emit('close')">{{ t('reveal.close') }}</button>
      </header>

      <!-- Board -->
      <div class="podium">
          <div
            v-for="slot in podiumSlots"
            :key="slot.rank"
            class="podium-slot"
            :style="{ width: slot.width + 'px', '--accent': slot.item.color }"
          >
            <!-- Placeholder -->
            <template v-if="!isRevealed(slot.rank)">
              <div class="podium-rank-ph">{{ slot.rank }}</div>
              <div class="pcard-ph" :style="{ minHeight: slot.ph + 'px' }">?</div>
            </template>
            <!-- Revealed -->
            <template v-else>
              <div v-if="slot.winner" class="crown" aria-hidden="true">
                <svg width="54" height="36" viewBox="0 0 24 16" fill="#e3b13a" stroke="#dcab42" stroke-width=".5" stroke-linejoin="round"><path d="M1.4 13.5L.4 4.2l5.4 4L12 1.2l6.2 7 5.4-4-1 9.3z" /><circle cx="12" cy="1.2" r="1.3" fill="#e3b13a" /></svg>
                <span class="crown-sparkle" aria-hidden="true">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff6db"><path d="M12 1.5l2.4 7.1 7.1 2.4-7.1 2.4L12 22.5l-2.4-7.1L2.5 11l7.1-2.4z" /></svg>
                </span>
              </div>
              <div class="pcard" :class="{ 'pcard--winner': slot.winner }">
                <div class="pcard-banner" :class="{ 'pcard-banner--dark': isLightHex(slot.item.color) }">{{ mName(slot.item) }}</div>
                <div class="pcard-body">
                  <div class="pcard-icon"><img :src="iconUrl(slot.item.srcImg)" :alt="mName(slot.item)"></div>
                  <p class="pcard-desc">{{ mDesc(slot.item) }}</p>
                </div>
              </div>
              <div class="pedestal" :class="{ 'pedestal--dark': isLightHex(slot.item.color) }" :style="{ height: slot.pedestal + 'px' }">{{ slot.rank }}</div>
            </template>
          </div>
        </div>

        <ol class="rows">
          <li v-for="row in restRows" :key="row.rank" class="row-item" :style="{ '--accent': row.item.color }">
            <!-- Placeholder -->
            <div v-if="!isRevealed(row.rank)" class="row-ph">
              <span class="row-rank">{{ row.rank }}</span>
              <span class="row-q">?</span>
            </div>
            <!-- Revealed -->
            <div v-else class="row">
              <span class="row-rank">{{ row.rank }}</span>
              <div class="row-icon"><img :src="iconUrl(row.item.srcImg)" :alt="mName(row.item)"></div>
              <div class="row-text">
                <div class="row-name">{{ mName(row.item) }}</div>
                <p class="row-desc">{{ mDesc(row.item) }}</p>
              </div>
            </div>
          </li>
        </ol>
    </div>

    <!-- Floating reveal button -->
    <div v-if="showNext" class="next-bar">
      <button class="next-btn" type="button" @click="next">
        {{ t('reveal.next', { label: nextRankLabel }) }}
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
      </button>
    </div>
  </div>
</template>

<style scoped>
.reveal {
  position: relative;
  padding: 8px 0 104px;
}

/* Subtle halo in the #1 motivator's color, echoing the duel screen's colored
   glow. Blooms in only once the winner (rank 1) is revealed, so it never hints
   at the result early. */
.reveal::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 560px;
  background: radial-gradient(ellipse 64% 100% at 50% 0%, color-mix(in srgb, var(--winner, transparent) 32%, transparent), transparent 72%);
  opacity: 0;
  pointer-events: none;
  z-index: 0;
}

/* Bloom in when the winner (rank 1) is revealed, then breathe gently. */
.reveal--crowned::before {
  animation: halo-in 0.9s ease forwards, halo-breathe 6s ease-in-out 0.9s infinite;
}

@keyframes halo-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes halo-breathe {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.62; }
}

.reveal-inner {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 0 8px;
}

.reveal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 36px;
}

.reveal-header h2 {
  margin: 0;
  font-size: clamp(22px, 3.2vw, 30px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-ink);
}

/* Focused programmatically on open, no visible ring needed. */
.reveal-header h2:focus {
  outline: none;
}

.reveal-name {
  color: var(--c-brand);
}

/* Ghost close button, matching the duel screen's Recommencer. */
.reveal-close {
  flex: none;
  border: 1.5px solid var(--c-border-soft);
  background: var(--c-glass);
  color: var(--c-ink-2);
  font: inherit;
  font-weight: 600;
  font-size: 14px;
  padding: 9px 18px;
  border-radius: 999px;
  cursor: pointer;
  transition: color 0.15s ease, border-color 0.15s ease;
}

.reveal-close:hover {
  color: var(--c-brand);
  border-color: color-mix(in srgb, var(--c-brand) 40%, transparent);
}

/* Podium: 2 · 1 · 3, bottom-aligned. */
.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 18px;
  flex-wrap: wrap;
  padding-top: 8px;
  margin-bottom: 44px;
}

.podium-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.podium-rank-ph {
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700;
  font-size: 14px;
  color: #b3a89e;
  margin-bottom: 8px;
}

.pcard-ph {
  width: 100%;
  border: 2px dashed rgba(44, 38, 34, 0.18);
  border-radius: 20px;
  background: var(--c-surface);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 36px;
  color: #d9cfc4;
  box-shadow: 0 8px 24px rgba(30, 25, 20, 0.04);
}

/* Revealed podium card: banner + tinted body + white icon circle, sitting flush
   on its colored pedestal. */
.pcard {
  width: 100%;
  display: flex;
  flex-direction: column;
  border-radius: 20px 20px 0 0;
  background: color-mix(in srgb, var(--accent) 12%, var(--c-surface));
  overflow: hidden;
  text-align: center;
  box-shadow: 0 14px 34px color-mix(in srgb, var(--accent) 16%, transparent);
  animation: pop 0.55s both;
}

/* Winner reads as #1 through size, crown, the tallest pedestal and a deeper
   accent shadow — no hard outline (it framed the tinted body and looked cheap). */
.pcard--winner {
  box-shadow: 0 20px 44px color-mix(in srgb, var(--accent) 34%, transparent);
}

.pcard-banner {
  padding: 12px 14px;
  background: var(--accent);
  color: #fff;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 13px;
}

.pcard-banner--dark {
  color: #2c2622;
}

.pcard--winner .pcard-banner {
  padding: 14px;
  font-size: 14px;
}

.pcard-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 20px 18px 22px;
}

.pcard--winner .pcard-body {
  gap: 16px;
  padding: 24px 20px 26px;
}

.pcard-icon {
  width: 66px;
  height: 66px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 2px 10px rgba(30, 25, 20, 0.08);
}

.pcard--winner .pcard-icon {
  width: 76px;
  height: 76px;
}

.pcard-icon img {
  width: 44px;
  height: 44px;
  object-fit: contain;
}

.pcard--winner .pcard-icon img {
  width: 50px;
  height: 50px;
}

.pcard-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.45;
  color: var(--c-ink-2);
}

.pcard--winner .pcard-desc {
  font-size: 13.5px;
}

.pedestal {
  width: 100%;
  background: var(--accent);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 24px;
  border-radius: 0 0 10px 10px;
  animation: pop 0.55s both;
}

/* Dark rank number on light pedestals (yellow, light pink…) for contrast. */
.pedestal--dark {
  color: #2c2622;
}

.crown {
  position: relative;
  margin-bottom: -8px;
  z-index: 2;
  /* Softer contour: a gentle layered golden glow instead of one hard shadow. */
  filter: drop-shadow(0 2px 3px rgba(196, 146, 42, 0.3)) drop-shadow(0 0 6px rgba(227, 177, 58, 0.55));
  animation: crownIn 0.6s 0.15s both;
}

/* Subtle twinkling sparkle at the crown's top-right. */
.crown-sparkle {
  position: absolute;
  top: -5px;
  right: -7px;
  display: block;
  filter: drop-shadow(0 0 3px rgba(255, 241, 194, 0.9));
  animation: sparkle-twinkle 2.6s ease-in-out infinite;
}

@keyframes sparkle-twinkle {
  0%, 100% { opacity: 0.2; transform: scale(0.75) rotate(-8deg); }
  50% { opacity: 1; transform: scale(1.1) rotate(10deg); }
}

/* Ranks 4 → 10 */
.rows {
  list-style: none;
  margin: 0 auto;
  padding: 0;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.row-ph {
  display: flex;
  align-items: center;
  gap: 16px;
  border: 2px dashed rgba(44, 38, 34, 0.18);
  border-radius: 16px;
  padding: 14px 20px;
  background: var(--c-surface);
  box-shadow: 0 4px 14px rgba(30, 25, 20, 0.03);
}

.row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: var(--c-surface);
  border-radius: 16px;
  padding: 14px 20px;
  box-shadow: 0 4px 14px rgba(30, 25, 20, 0.05);
  animation: pop 0.5s both;
}

.row-rank {
  flex: none;
  width: 26px;
  text-align: center;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 700;
  font-size: 20px;
  color: #c2b8ae;
}

.row-q {
  flex: 1;
  font-family: 'Bricolage Grotesque', sans-serif;
  font-weight: 800;
  font-size: 22px;
  color: #d9cfc4;
}

.row-icon {
  width: 46px;
  height: 46px;
  flex: none;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: color-mix(in srgb, var(--accent) 12%, transparent);
}

.row-icon img {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.row-text {
  flex: 1;
  min-width: 0;
}

.row-name {
  font-weight: 800;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  /* Darkened accent: keeps the color identity but passes AA on white — the raw
     accent (e.g. Statut yellow) is far below 4.5:1 as text. */
  color: color-mix(in srgb, var(--accent) 55%, #2c2622);
  margin-bottom: 2px;
}

.row-desc {
  margin: 0;
  font-size: 13.5px;
  line-height: 1.45;
  color: var(--c-ink-2);
}

/* Floating reveal button, fixed to the viewport bottom center. */
.next-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 28px;
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 20;
}

.next-btn {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  border: none;
  background: var(--c-brand);
  color: var(--c-on-brand);
  font: inherit;
  font-weight: 700;
  font-size: 15px;
  padding: 14px 28px;
  border-radius: 999px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(196, 115, 46, 0.4);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.next-btn:hover {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

@keyframes pop {
  0% { opacity: 0; transform: translateY(20px) scale(0.96); }
  60% { transform: translateY(-4px) scale(1.01); }
  100% { opacity: 1; transform: none; }
}

@keyframes crownIn {
  0% { opacity: 0; transform: translateY(8px) rotate(-12deg); }
  100% { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) {
  .pcard,
  .pedestal,
  .row,
  .crown,
  .crown-sparkle {
    animation: none;
  }

  .reveal--crowned::before {
    animation: none;
    opacity: 1;
  }

  .crown-sparkle {
    opacity: 0.85;
  }
}

/* Mobile: podium shares the row, rows stay readable. */
@media (max-width: 640px) {
  .podium {
    gap: 8px;
  }

  .podium-slot {
    width: auto !important;
    flex: 1 1 0;
    min-width: 0;
  }

  .pcard-ph {
    min-height: 200px !important;
    font-size: 28px;
  }

  .pcard-banner,
  .pcard--winner .pcard-banner {
    font-size: 11px;
    padding: 10px 6px;
    letter-spacing: 0.04em;
  }

  .pcard-desc {
    display: none;
  }

  .pcard-icon,
  .pcard--winner .pcard-icon {
    width: 52px;
    height: 52px;
  }

  .pcard-icon img,
  .pcard--winner .pcard-icon img {
    width: 34px;
    height: 34px;
  }

  .row-desc {
    display: none;
  }
}
</style>
