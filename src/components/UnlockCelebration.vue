<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { t } from '@/i18n';

defineProps<{ name?: string; manager?: boolean }>();
const emit = defineEmits<{ (e: 'action'): void; (e: 'close'): void }>();

// Basic dialog a11y: focus the primary action on open, close on Escape.
const primaryBtn = ref<HTMLButtonElement | null>(null);
const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') emit('close');
};
onMounted(() => {
  primaryBtn.value?.focus();
  window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => window.removeEventListener('keydown', onKeydown));
</script>

<template>
  <div class="celebration-backdrop" @click.self="$emit('close')">

    <div
      class="celebration-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div class="celebration-emoji" aria-hidden="true">🎉</div>
      <h2 id="celebration-title">{{ name ? t('celebration.title', { name }) : t('celebration.titleNoName') }}</h2>
      <p>{{ manager ? t('celebration.textManager') : t('celebration.textSolo') }}</p>
      <div class="celebration-actions">
        <button ref="primaryBtn" class="celebration-primary" type="button" @click="$emit('action')">
          {{ manager ? t('celebration.primaryManager') : t('celebration.primarySolo') }}
        </button>
        <button class="celebration-secondary" type="button" @click="$emit('close')">
          {{ t('celebration.secondary') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.celebration-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 16, 26, 0.55);
  padding: 24px;
}

.celebration-card {
  position: relative;
  max-width: 420px;
  width: 100%;
  background: var(--c-surface);
  border-radius: 20px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(15, 16, 26, 0.35);
  animation: card-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes card-bounce-in {
  0% {
    transform: scale(0.7) translateY(30px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.celebration-emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 12px;
  animation: emoji-pop 0.6s ease 0.15s both;
}

@keyframes emoji-pop {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.25) rotate(8deg); }
  100% { transform: scale(1) rotate(0); }
}

@media (prefers-reduced-motion: reduce) {
  .celebration-card,
  .celebration-emoji {
    animation: none;
  }
}

.celebration-card h2 {
  margin: 0 0 12px;
  font-size: 27px;
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.05;
}

.celebration-card p {
  margin: 0 0 26px;
  font-size: 13px;
  line-height: 1.6;
  color: var(--c-ink-muted);
}

.celebration-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.celebration-primary {
  border: none;
  background: var(--c-brand);
  box-shadow: 0 4px 0 var(--c-brand-deep);
  color: var(--c-on-brand);
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.celebration-primary:hover {
  transform: translateY(-1px);
}

.celebration-primary:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--c-brand-deep);
}

/* The button is focused on open for a11y. Hide the default ring on
   programmatic/mouse focus so it matches the other buttons, but keep a
   clean, on-brand ring for keyboard users. */
.celebration-primary:focus {
  outline: none;
}

.celebration-primary:focus-visible {
  outline: none;
  box-shadow: 0 4px 0 var(--c-brand-deep), 0 0 0 3px rgba(180, 85, 47, 0.45);
}

.celebration-secondary {
  border: none;
  background: none;
  color: var(--c-ink-3);
  font-size: 12px;
  font-weight: 600;
  padding: 6px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.celebration-secondary:hover {
  color: var(--c-brand);
}
</style>
