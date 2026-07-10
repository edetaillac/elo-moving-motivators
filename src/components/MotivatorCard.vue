<script setup lang="ts">
import { computed } from 'vue';
import { Motivator } from '@/store';
import { mName, mDesc } from '@/i18n';
import { iconUrl } from '@/icons';

const props = defineProps<{
  item: Motivator;
  // Duel resolution states, driven by the view during the 650ms pick dwell.
  won?: boolean;
  lost?: boolean;
}>();
defineEmits<{ (e: 'choose'): void }>();

// Either card is being resolved: freeze the pointer so it no longer reads as
// clickable while the winner/loser animation plays.
const resolving = computed(() => props.won || props.lost);

// Pick a readable banner text color from the background luminance (YIQ):
// dark ink on light banners (yellow, light pink…), white on dark ones.
// Fixes the low-contrast white-on-yellow / white-on-light-pink cases.
const isLightColor = computed(() => {
  const hex = props.item.color.replace('#', '');
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 >= 150;
});
</script>

<template>
  <button
    class="card"
    type="button"
    :class="{ 'card--won': won, 'card--lost': lost, 'card--resolving': resolving }"
    :style="{ '--accent': item.color }"
    @click="$emit('choose')"
  >
    <!-- Winner acknowledgement: a white check badge in the card's accent color. -->
    <span v-if="won" class="card-check" aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12l5 5L20 6" /></svg>
    </span>
    <div
      class="card-banner"
      :class="{ 'card-banner--dark-text': isLightColor }"
      :style="{ backgroundColor: item.color }"
    >{{ mName(item) }}</div>
    <div class="card-body">
      <div class="card-icon">
        <img :src="iconUrl(item.srcImg)" :alt="mName(item)">
      </div>
      <p class="card-description">{{ mDesc(item) }}</p>
    </div>
  </button>
</template>

<style scoped>
.card {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  /* Body tinted with the motivator color, the illustration sits in a white
     circle for contrast. */
  background: color-mix(in srgb, var(--accent) 12%, var(--c-surface));
  border: none;
  border-radius: 22px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: center;
  box-shadow: 0 12px 34px rgba(30, 25, 20, 0.09);
  transition:
    transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
    box-shadow 0.4s ease,
    opacity 0.4s ease,
    filter 0.4s ease;
}

/* Hover lift only while the duel is live (not mid-resolution). */
.card:not(.card--resolving):hover,
.card:not(.card--resolving):focus-visible {
  transform: translateY(-4px);
  box-shadow:
    0 18px 40px rgba(30, 25, 20, 0.12),
    0 6px 16px color-mix(in srgb, var(--accent) 22%, transparent);
  outline: none;
}

/* Resolution states (handoff): the picked card pops with an accent outline and
   stronger shadow, the other recedes (fade + shrink + desaturate). */
.card--resolving {
  cursor: default;
}

.card--won {
  transform: scale(1.035);
  outline: 3px solid var(--accent);
  outline-offset: -1px;
  box-shadow: 0 22px 46px color-mix(in srgb, var(--accent) 38%, transparent);
}

.card--lost {
  opacity: 0.4;
  transform: scale(0.97);
  filter: grayscale(0.5);
}

.card-check {
  position: absolute;
  /* Centered vertically on the banner name (banner has 15px top padding). */
  top: 8px;
  right: 12px;
  width: 30px;
  height: 30px;
  border-radius: 999px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  z-index: 3;
}

.card-banner {
  width: 100%;
  padding: 15px 16px;
  color: var(--c-on-brand);
  font-weight: 800;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
}

/* Light banner (yellow, light pink…): dark ink for a readable contrast. */
.card-banner--dark-text {
  color: #2c2622;
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 20px;
  padding: 28px 24px 30px;
}

/* White circle holding the real card illustration, lifted off the tinted body. */
.card-icon {
  width: 96px;
  height: 96px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fff;
  box-shadow: 0 2px 10px rgba(30, 25, 20, 0.08);
}

.card-icon img {
  display: block;
  width: 64px;
  height: 64px;
  object-fit: contain;
}

.card-description {
  margin: 0;
  font-size: 14.5px;
  line-height: 1.5;
  color: var(--c-ink-2);
  max-width: 230px;
}
</style>
