<script setup lang="ts">
import { computed } from 'vue';
import { Motivator } from '@/store';
import { mName, mDesc } from '@/i18n';

const props = defineProps<{ item: Motivator }>();
defineEmits<{ (e: 'choose'): void }>();

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
  <button class="card" type="button" :style="{ '--accent': item.color }" @click="$emit('choose')">
    <div
      class="card-banner"
      :class="{ 'card-banner--dark-text': isLightColor }"
      :style="{ backgroundColor: item.color }"
    >{{ mName(item) }}</div>
    <div class="card-body">
      <div class="card-image">
        <img :src="require(`@/assets/icons/${item.srcImg}`)" :alt="mName(item)">
      </div>
      <p class="card-description">{{ mDesc(item) }}</p>
    </div>
  </button>
</template>

<style scoped>
.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 440px;
  background: var(--c-surface);
  border: 1px solid var(--c-border-faint);
  border-radius: 22px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 24px var(--c-border-faint);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover,
.card:focus-visible {
  transform: translateY(-6px);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 18px 30px -8px color-mix(in srgb, var(--accent) 45%, transparent),
    0 4px 10px var(--c-border-faint);
  outline: none;
}

/* No press dip on the card: at duel time the mouse is hovering (card lifted),
   so an :active translate made it jolt down on click. Choice feedback is the
   accent halo + the other card receding, not card movement. */

.card-banner {
  width: 100%;
  padding: 18px 16px;
  color: var(--c-on-brand);
  font-weight: 800;
  font-size: 20px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

/* Light banner (yellow, light pink…): dark ink for a readable contrast. */
.card-banner--dark-text {
  color: #14151f;
  text-shadow: none;
}

.card-body {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.card-image {
  width: 55%;
  max-width: 150px;
  margin: 0 auto;
}

.card-image img {
  display: block;
  width: 100%;
  height: auto;
}

.card-description {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--c-ink-2);
}
</style>
