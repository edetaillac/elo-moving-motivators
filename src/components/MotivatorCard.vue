<script setup lang="ts">
import { Motivator } from '@/store';

defineProps<{ item: Motivator }>();
defineEmits<{ (e: 'choose'): void }>();
</script>

<template>
  <button class="card" type="button" :style="{ '--accent': item.color }" @click="$emit('choose')">
    <div class="card-banner" :style="{ backgroundColor: item.color }">{{ item.name }}</div>
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
