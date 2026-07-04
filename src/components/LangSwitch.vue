<script setup lang="ts">
// Global, discreet FR/EN switch, fixed bottom-right, present on every route
// so the language can be changed at any point (onboarding, duel, reveal).
import { locale, setLocale } from '@/i18n';
</script>

<template>
  <div class="lang-switch-global">
    <button
      type="button"
      class="lang-flag"
      :class="{ active: locale === 'fr' }"
      :aria-pressed="locale === 'fr'"
      aria-label="Français"
      @click="setLocale('fr')"
    >🇫🇷</button>
    <button
      type="button"
      class="lang-flag"
      :class="{ active: locale === 'en' }"
      :aria-pressed="locale === 'en'"
      aria-label="English"
      @click="setLocale('en')"
    >🇬🇧</button>
  </div>
</template>

<style scoped>
.lang-switch-global {
  position: fixed;
  bottom: 14px;
  right: 14px;
  /* Below the celebration modal backdrop (z-index 20) so it's dimmed with the
     rest of the page when a dialog is open, above normal content otherwise. */
  z-index: 10;
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.65);
  backdrop-filter: blur(6px);
  border: 1px solid rgba(15, 23, 42, 0.06);
}

.lang-flag {
  border: none;
  background: none;
  font-size: 16px;
  line-height: 1;
  padding: 4px;
  border-radius: 999px;
  cursor: pointer;
  opacity: 0.4;
  filter: grayscale(0.6);
  transition: opacity 0.15s ease, filter 0.15s ease, background-color 0.15s ease;
}

.lang-flag:hover {
  opacity: 0.8;
}

.lang-flag.active {
  opacity: 1;
  filter: none;
  background: #eef0f6;
}
</style>
