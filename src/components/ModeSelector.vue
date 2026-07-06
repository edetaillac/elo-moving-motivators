<script setup lang="ts">
// Solo / Manager mode picker, shown only on the onboarding screen.
// Two toggle buttons (aria-pressed, like LangSwitch) plus a help line.
// The help line is deliberately NOT always visible:
//  - desktop (hover: hover): it appears on hover/focus of a segment, showing
//    that segment's help;
//  - mobile (hover: none): no hover exists, so it shows the SELECTED mode's
//    help instead (Solo by default), updating on tap.
import { computed, ref } from 'vue';
import { t } from '@/i18n';

export type Mode = 'solo' | 'manager';

const props = defineProps<{ modelValue: Mode }>();
const emit = defineEmits<{ (e: 'update:modelValue', value: Mode): void }>();

const hovered = ref<Mode | null>(null);
// Follow the hovered segment on desktop; fall back to the selected mode on
// touch, where `hovered` stays null.
const helpMode = computed<Mode>(() => hovered.value ?? props.modelValue);
const helpText = computed(() =>
  helpMode.value === 'manager' ? t('onboarding.mode.managerHelp') : t('onboarding.mode.soloHelp')
);

const select = (mode: Mode) => emit('update:modelValue', mode);
</script>

<template>
  <div class="mode-selector" :class="{ hovering: hovered !== null }">
    <div class="mode-capsule" role="group" :aria-label="t('onboarding.mode.label')">
      <button
        type="button"
        class="mode-option"
        :class="{ active: modelValue === 'solo' }"
        :aria-pressed="modelValue === 'solo'"
        @click="select('solo')"
        @mouseenter="hovered = 'solo'"
        @mouseleave="hovered = null"
        @focus="hovered = 'solo'"
        @blur="hovered = null"
      >{{ t('onboarding.mode.solo') }}</button>
      <button
        type="button"
        class="mode-option"
        :class="{ active: modelValue === 'manager' }"
        :aria-pressed="modelValue === 'manager'"
        @click="select('manager')"
        @mouseenter="hovered = 'manager'"
        @mouseleave="hovered = null"
        @focus="hovered = 'manager'"
        @blur="hovered = null"
      >{{ t('onboarding.mode.manager') }}</button>
    </div>
    <p class="mode-help" aria-live="polite">{{ helpText }}</p>
  </div>
</template>

<style scoped>
.mode-selector {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
}

/* Segmented pill, same visual language as the progress-pill that appears in
   this exact spot once the game starts. */
.mode-capsule {
  display: inline-flex;
  padding: 4px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(15, 23, 42, 0.08);
}

.mode-option {
  border: none;
  background: none;
  /* Comfortable touch target on mobile (>= 44px tall with padding). */
  min-height: 38px;
  padding: 8px 20px;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  color: #667085;
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.mode-option:hover {
  color: #1a1c29;
}

.mode-option.active {
  background: #B4552F;
  color: #ffffff;
}

.mode-option:focus-visible {
  outline: 2px solid #B4552F;
  outline-offset: 2px;
}

/* Help line: hidden by default, height reserved so nothing jumps when it
   fades in on hover/focus. Two lines' worth for the longer (Manager) text. */
.mode-help {
  margin: 0;
  max-width: 320px;
  min-height: 2.6em;
  font-size: 12px;
  line-height: 1.3;
  color: #667085;
  text-align: center;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.mode-selector.hovering .mode-help {
  opacity: 1;
}

/* Touch devices: no hover, so keep the selected mode's help visible. */
@media (hover: none) {
  .mode-help {
    opacity: 1;
  }
}
</style>
