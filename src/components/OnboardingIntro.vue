<script setup lang="ts">
import { computed, ref } from 'vue';
import { MOTIVATORS } from '@/store';
import { t } from '@/i18n';
import { iconUrl } from '@/icons';
import ModeSelector, { Mode } from '@/components/ModeSelector.vue';

defineProps<{ mode: Mode }>();
const emit = defineEmits<{ (e: 'start', name: string): void; (e: 'update:mode', value: Mode): void }>();

const onModeChange = (value: Mode) => emit('update:mode', value);

const name = ref('');
const canStart = computed(() => name.value.trim().length > 0);

// Split the estimate sentence around {b} to wrap the "40-60 duels" part in <strong>.
const estimateParts = computed(() => t('onboarding.estimate').split('{b}'));

const start = () => {
  if (!canStart.value) return;
  emit('start', name.value.trim());
};

// A fanned deck of five motivator cards, dealt in and gently floating.
const DECK_IDS = [4, 2, 6, 5, 10]; // Statut, Curiosité, Honneur, Objectif, Relations
const deck = DECK_IDS.map((id, i) => {
  const m = MOTIVATORS.find((x) => x.id === id) as (typeof MOTIVATORS)[number];
  const off = i - (DECK_IDS.length - 1) / 2;
  return {
    id,
    color: m.color,
    srcImg: m.srcImg,
    name: m.name,
    rotate: off * 10,             // -20 -10 0 10 20
    shift: off * 59,              // -118 -59 0 59 118
    lift: Math.abs(off) ** 2 * 4, // 0 4 16, center card highest
    delay: i * 0.08,              // staggered deal-in + float
  };
});
</script>

<template>
  <div class="accueil">
    <div class="accueil-head">
      <h1 class="accueil-title">Moving Motivators</h1>
      <p class="accueil-subtitle">{{ t('header.subtitle.onboarding') }}</p>
    </div>

    <div class="accueil-card">
      <ModeSelector class="accueil-mode" :model-value="mode" @update:model-value="onModeChange" />

      <div class="deck" aria-hidden="true">
        <div
          v-for="card in deck"
          :key="card.id"
          class="deck-slot"
          :style="{ transform: `translateX(${card.shift}px) translateY(${card.lift}px) rotate(${card.rotate}deg)` }"
        >
          <div class="deck-card" :style="{ animationDelay: `${card.delay}s` }">
            <div class="deck-banner" :style="{ backgroundColor: card.color }" />
            <img class="deck-icon" :src="iconUrl(card.srcImg)" :alt="card.name">
          </div>
        </div>
      </div>

      <p class="accueil-lead">{{ t('onboarding.lead') }}</p>

      <p class="accueil-estimate">
        <span class="estimate-icon" aria-hidden="true">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8" /><path d="M12 13V9M9 1h6M18 5l1.5-1.5" /></svg>
        </span>
        <span class="estimate-text">{{ estimateParts[0] }}<strong>{{ t('onboarding.estimateBold') }}</strong>{{ estimateParts[1] }}</span>
      </p>

      <div class="accueil-form">
        <input
          v-model="name"
          class="accueil-input"
          type="text"
          :placeholder="t('onboarding.namePlaceholder')"
          maxlength="30"
          @keyup.enter="start"
        >
        <button class="accueil-cta" type="button" :disabled="!canStart" @click="start">
          {{ t('onboarding.cta') }}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Whole accueil is one vertically-centered column: title block + card. */
.accueil {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 34px;
  /* Horizontal gutter comes from .page-content, so only pad vertically here
     (avoids doubling the mobile side margin). */
  padding: 24px 0;
}

.accueil-head {
  text-align: center;
}

.accueil-title {
  margin: 0 0 8px;
  font-size: clamp(34px, 6vw, 50px);
  font-weight: 800;
  letter-spacing: -0.01em;
  line-height: 1;
  color: var(--c-ink);
}

.accueil-subtitle {
  margin: 0;
  font-size: 17px;
  color: var(--c-ink-3);
}

.accueil-card {
  background: var(--c-surface);
  border-radius: 26px;
  padding: 36px 40px 34px;
  max-width: 520px;
  width: 100%;
  box-shadow: 0 24px 60px rgba(30, 25, 20, 0.1);
}

.accueil-mode {
  margin: 0 0 20px;
}

/* Fanned deck of motivator cards, dealt in then gently floating. */
.deck {
  position: relative;
  /* Cards are absolutely positioned and fan out past 96px (translateY + rotation
     overhang), so the box must be tall enough to contain them — otherwise the
     margin-bottom below is eaten by the overflow and the pitch sits too close. */
  height: 128px;
  margin: 8px 0 44px;
}

.deck-slot {
  position: absolute;
  top: 0;
  left: 50%;
  margin-left: -39px;
  transform-origin: bottom center;
}

.deck-card {
  width: 78px;
  height: 96px;
  border-radius: 12px;
  background: var(--c-surface);
  box-shadow: 0 8px 18px rgba(30, 25, 20, 0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 6px;
  animation:
    deck-deal 0.45s ease backwards,
    deck-float 3.2s ease-in-out infinite;
}

.deck-banner {
  height: 14px;
  flex-shrink: 0;
  border-radius: 9px 9px 0 0;
}

.deck-icon {
  flex: 1;
  min-height: 0;
  width: 100%;
  object-fit: contain;
  padding: 6px 2px 2px;
}

@keyframes deck-deal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes deck-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@media (prefers-reduced-motion: reduce) {
  .deck-card {
    animation: deck-deal 0.45s ease backwards;
  }
}

.accueil-lead {
  margin: 0 0 14px;
  text-align: center;
  font-size: 16px;
  font-weight: 700;
  line-height: 1.5;
  color: var(--c-ink);
}

.accueil-estimate {
  margin: 0 0 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 14px;
  color: var(--c-ink-3);
}

.estimate-icon {
  display: inline-flex;
  color: var(--c-ink-faint);
}

.accueil-estimate strong {
  color: var(--c-ink-2);
  font-weight: 700;
}

.accueil-form {
  display: flex;
  gap: 12px;
}

.accueil-input {
  flex: 1;
  min-width: 0;
  border: 1.5px solid var(--c-border-soft);
  border-radius: 14px;
  padding: 14px 16px;
  font: inherit;
  font-size: 15px;
  color: var(--c-ink);
  background: var(--c-surface);
  outline: none;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.accueil-input::placeholder {
  color: var(--c-ink-faint);
}

.accueil-input:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px var(--c-focus-ring);
}

/* Filled accent pill (handoff): soft drop shadow, disabled goes muted beige. */
.accueil-cta {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  padding: 14px 22px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  background: var(--c-brand);
  color: var(--c-on-brand);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.accueil-cta:hover:not(:disabled) {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

.accueil-cta:disabled {
  background: var(--c-disabled-bg);
  color: var(--c-ink-faint);
  cursor: not-allowed;
  box-shadow: none;
}

/* Mobile only. */
@media (max-width: 480px) {
  .accueil-card {
    padding: 32px 22px;
  }

  /* The fanned deck spreads ±118px and its cards rotate, so at full size it
     overflows the narrow card and gets clipped on the right. Scale it down so
     the whole fan fits; the reserved box shrinks with it. */
  .deck {
    transform: scale(0.8);
    transform-origin: top center;
    height: 104px;
    margin-bottom: 24px;
  }

  .accueil-form {
    flex-direction: column;
  }

  .accueil-cta {
    justify-content: center;
    width: 100%;
  }
}
</style>
