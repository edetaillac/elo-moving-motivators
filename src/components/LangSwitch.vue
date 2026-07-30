<script setup lang="ts">
// Discreet FR/EN switch, rendered once in App.vue so it's on every screen
// (accueil, duels, export, page de révélation): the wording can be flipped at
// any moment, mid-game included. Text segmented pill (no flag emoji), matching
// the mode toggle.
// Two placements: floating (default) pins it bottom-right over the page;
// `docked` drops it into the flow, for the ranking reveal where a pinned pill
// would sit over the ceremony.
import { locale, setLocale } from '@/i18n';

defineProps<{ docked?: boolean }>();
</script>

<template>
  <div class="lang-switch" :class="{ 'lang-switch--docked': docked }" role="group" aria-label="Language">
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

/* Docked: same pill, but in the flow at the end of the content and pushed to
   the right edge — it scrolls away with the page instead of hovering over it. */
.lang-switch--docked {
  position: static;
  margin-left: auto;
  width: fit-content;
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

/* Mobile: stays bottom-right, but compact. It now sits on every screen, so it
   has to share the bottom edge with the full-width entry CTAs and the reveal's
   centered "Révéler" button — the screens concerned reserve the clearance, and
   the smaller footprint keeps it clear of the centered button. */
@media (max-width: 480px) {
  .lang-switch {
    bottom: 12px;
    right: 12px;
    padding: 3px;
  }

  .lang-opt {
    min-width: 30px;
    padding: 5px 9px;
    font-size: 11.5px;
  }
}
</style>
