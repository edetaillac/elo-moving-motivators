<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { t } from '@/i18n';

defineProps<{ name?: string; manager?: boolean }>();
const emit = defineEmits<{ (e: 'action'): void; (e: 'close'): void }>();

// Dialog a11y: focus the primary action on open, close on Escape, trap Tab
// inside the dialog, and hand focus back to wherever it was on close.
const primaryBtn = ref<HTMLButtonElement | null>(null);
const card = ref<HTMLElement | null>(null);
let previouslyFocused: HTMLElement | null = null;

const onKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    emit('close');
    return;
  }
  if (e.key !== 'Tab' || !card.value) return;
  const focusable = card.value.querySelectorAll<HTMLElement>(
    'button, [href], input, [tabindex]:not([tabindex="-1"])'
  );
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
};

onMounted(() => {
  previouslyFocused = document.activeElement as HTMLElement | null;
  primaryBtn.value?.focus();
  window.addEventListener('keydown', onKeydown);
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
  previouslyFocused?.focus?.();
});
</script>

<template>
  <div class="celebration-backdrop" @click.self="$emit('close')">

    <div
      ref="card"
      class="celebration-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      <div class="celebration-icon" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d6a32c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" /><path d="M18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" /></svg>
      </div>
      <h2 id="celebration-title">{{ name ? t('celebration.title', { name }) : t('celebration.titleNoName') }}</h2>
      <p>{{ manager ? t('celebration.textManager') : t('celebration.textSolo') }}</p>
      <div class="celebration-actions">
        <button ref="primaryBtn" class="celebration-primary" type="button" @click="$emit('action')">
          {{ manager ? t('celebration.primaryManager') : t('celebration.primarySolo') }}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
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
  background: rgba(44, 38, 34, 0.55);
  padding: 24px;
}

.celebration-card {
  position: relative;
  max-width: 420px;
  width: 100%;
  background: var(--c-surface);
  border-radius: 24px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(30, 25, 20, 0.35);
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

.celebration-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 163, 44, 0.14);
  animation: icon-pop 0.6s ease 0.15s both;
}

@keyframes icon-pop {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.15) rotate(8deg); }
  100% { transform: scale(1) rotate(0); }
}

@media (prefers-reduced-motion: reduce) {
  .celebration-card,
  .celebration-icon {
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

/* Filled accent pill with soft shadow, consistent with the other CTAs. */
.celebration-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  background: var(--c-brand);
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32);
  color: var(--c-on-brand);
  border-radius: 14px;
  padding: 14px 22px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.celebration-primary:hover {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

/* The button is focused on open for a11y. Hide the default ring on
   programmatic/mouse focus, keep a clean on-brand ring for keyboard users. */
.celebration-primary:focus {
  outline: none;
}

.celebration-primary:focus-visible {
  outline: none;
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32), 0 0 0 3px rgba(196, 115, 46, 0.4);
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
