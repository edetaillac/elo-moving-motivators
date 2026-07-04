<script setup lang="ts">
import { computed, ref } from 'vue';
import { MOTIVATORS } from '@/store';
import { t } from '@/i18n';

const emit = defineEmits<{ (e: 'start', name: string): void }>();

const name = ref('');
const canStart = computed(() => name.value.trim().length > 0);

// Split the estimate sentence around {b} to wrap the "40-60 duels" part in <strong>.
const estimateParts = computed(() => t('onboarding.estimate').split('{b}'));

const start = () => {
  if (!canStart.value) return;
  emit('start', name.value.trim());
};

// A little fanned deck of motivator cards, dealt in and gently floating.
const DECK_IDS = [4, 2, 6, 5, 10]; // Statut, Curiosité, Honneur, Objectif, Relations
const deck = DECK_IDS.map((id, i) => {
  const m = MOTIVATORS.find((x) => x.id === id) as (typeof MOTIVATORS)[number];
  const mid = (DECK_IDS.length - 1) / 2;
  return {
    id,
    color: m.color,
    srcImg: m.srcImg,
    name: m.name,
    rotate: (i - mid) * 9,          // fan angle
    shift: (i - mid) * 46,          // horizontal spread
    lift: Math.abs(i - mid) * 8,    // center card sits highest
    delay: i * 0.09,                // staggered deal-in + float
  };
});
</script>

<template>
  <div class="onboarding">
    <div class="deck" aria-hidden="true">
      <div
        v-for="card in deck"
        :key="card.id"
        class="deck-slot"
        :style="{ transform: `translateX(${card.shift}px) translateY(${card.lift}px) rotate(${card.rotate}deg)` }"
      >
        <div class="deck-card" :style="{ animationDelay: `${card.delay}s` }">
          <div class="deck-banner" :style="{ backgroundColor: card.color }" />
          <img class="deck-icon" :src="require(`@/assets/icons/${card.srcImg}`)" :alt="card.name">
        </div>
      </div>
    </div>

    <p class="onboarding-lead">{{ t('onboarding.lead') }}</p>

    <p class="onboarding-estimate">
      ⏱️ {{ estimateParts[0] }}<strong>{{ t('onboarding.estimateBold') }}</strong>{{ estimateParts[1] }}
    </p>

    <div class="onboarding-form">
      <input
        v-model="name"
        class="onboarding-input"
        type="text"
        :placeholder="t('onboarding.namePlaceholder')"
        maxlength="30"
        @keyup.enter="start"
      >
      <button class="onboarding-cta" type="button" :disabled="!canStart" @click="start">
        {{ t('onboarding.cta') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.onboarding {
  position: relative;
  max-width: 560px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e6e8f0;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
}

/* Fanned deck of motivator cards, dealt in then gently floating. */
.deck {
  position: relative;
  height: 120px;
  margin-bottom: 20px;
}

.deck-slot {
  position: absolute;
  top: 10px;
  left: 50%;
  margin-left: -32px;
  transform-origin: bottom center;
}

.deck-card {
  width: 64px;
  height: 84px;
  border-radius: 12px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.08);
  box-shadow: 0 6px 14px rgba(15, 23, 42, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation:
    deck-deal 0.45s ease backwards,
    deck-float 3.2s ease-in-out infinite;
}

.deck-banner {
  height: 16px;
  flex-shrink: 0;
}

.deck-icon {
  flex: 1;
  min-height: 0;
  width: 100%;
  object-fit: contain;
  padding: 6px;
}

@keyframes deck-deal {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes deck-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}

@media (prefers-reduced-motion: reduce) {
  .deck-card {
    animation: deck-deal 0.45s ease backwards;
  }
}

.onboarding-lead {
  margin: 0 0 14px;
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  color: #1a1c29;
}

.onboarding-estimate {
  margin: 0 0 24px;
  font-size: 13px;
  color: #667085;
}

.onboarding-estimate strong {
  color: #1a1c29;
}

.onboarding-form {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.onboarding-input {
  flex: 1;
  min-width: 0;
  border: 1px solid #e6e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  font: inherit;
  font-size: 15px;
  color: #1a1c29;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.onboarding-input::placeholder {
  color: #b0b5c2;
}

.onboarding-input:focus {
  outline: none;
  border-color: #B4552F;
  box-shadow: 0 0 0 3px rgba(180, 85, 47, 0.15);
}

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.onboarding-cta {
  border: none;
  background: #B4552F;
  box-shadow: 0 4px 0 #8A3C1E;
  color: #ffffff;
  border-radius: 10px;
  padding: 14px 32px;
  font-size: 15px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.onboarding-cta:hover:not(:disabled) {
  transform: translateY(-1px);
}

.onboarding-cta:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #8A3C1E;
}

.onboarding-cta:disabled {
  background: #c7cad6;
  box-shadow: 0 4px 0 #a9adbd;
  cursor: not-allowed;
}

/* Mobile only — desktop layout above is untouched. */
@media (max-width: 480px) {
  .onboarding {
    padding: 32px 20px;
  }

  .onboarding-form {
    flex-direction: column;
  }

  .onboarding-cta {
    width: 100%;
  }
}
</style>
