<script setup lang="ts">
// Discreet FR/EN switch, fixed bottom-right, present on the entry screens so the
// language can be changed before playing. Text segmented pill (no flag emoji),
// matching the mode toggle.
import { locale, setLocale } from '@/i18n';
</script>

<template>
  <div class="lang-switch" role="group" aria-label="Language">
    <button
      type="button"
      class="lang-opt"
      :class="{ active: locale === 'fr' }"
      :aria-pressed="locale === 'fr'"
      @click="setLocale('fr')"
    >FR</button>
    <button
      type="button"
      class="lang-opt"
      :class="{ active: locale === 'en' }"
      :aria-pressed="locale === 'en'"
      @click="setLocale('en')"
    >EN</button>
  </div>
</template>

<style scoped>
.lang-switch {
  position: fixed;
  bottom: 20px;
  right: 20px;
  /* Below the celebration modal backdrop (z-index 20) so it's dimmed with the
     rest of the page when a dialog is open, above normal content otherwise. */
  z-index: 10;
  display: flex;
  gap: 2px;
  padding: 4px;
  border-radius: 999px;
  background: var(--c-glass-strong);
  backdrop-filter: blur(6px);
  border: 1px solid var(--c-border-soft);
  box-shadow: 0 6px 16px rgba(30, 25, 20, 0.08);
}

.lang-opt {
  border: none;
  background: none;
  min-width: 40px;
  padding: 8px 14px;
  border-radius: 999px;
  font: inherit;
  font-size: 13px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: var(--c-ink-muted);
  cursor: pointer;
  transition: color 0.15s ease, background-color 0.15s ease;
}

.lang-opt:hover {
  color: var(--c-ink);
}

.lang-opt.active {
  background: var(--c-brand);
  color: var(--c-on-brand);
}

.lang-opt:focus-visible {
  outline: 2px solid var(--c-brand);
  outline-offset: 2px;
}

/* Mobile: move to the top-right corner. Bottom-right would overlap the entry
   CTAs ("C'est parti", "Importer un fichier") that go full-width at the bottom
   of the card on small screens. */
@media (max-width: 480px) {
  .lang-switch {
    top: 14px;
    right: 14px;
    bottom: auto;
  }
}
</style>
