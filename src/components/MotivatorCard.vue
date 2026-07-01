<script setup lang="ts">
import { computed } from 'vue';
import { Motivator } from '@/store';

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
    >{{ item.name }}</div>
    <div class="card-body">
      <div class="card-image">
        <img :src="require(`@/assets/icons/${item.srcImg}`)" :alt="item.name">
      </div>
      <p class="card-description">{{ item.description }}</p>
    </div>
  </button>
</template>

<style scoped>
.card {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-width: 440px;
  background: #ffffff;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 22px;
  overflow: hidden;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  text-align: center;
  box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04), 0 10px 24px rgba(15, 23, 42, 0.06);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}

.card:hover,
.card:focus-visible {
  transform: translateY(-6px);
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.05),
    0 18px 30px -8px color-mix(in srgb, var(--accent) 45%, transparent),
    0 4px 10px rgba(15, 23, 42, 0.06);
  outline: none;
}

.card:active {
  transform: translateY(-2px) scale(0.99);
}

.card-banner {
  width: 100%;
  padding: 18px 16px;
  color: #ffffff;
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
  width: 100%;
}

.card-image img {
  display: block;
  width: 100%;
  height: auto;
}

.card-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #667085;
}
</style>
