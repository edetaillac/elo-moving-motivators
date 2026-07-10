<script setup lang="ts">
// Thin shell: routing lives in router/index.ts.
// - /        → GameView (play the duels, export a code)
// - /reveal  → RevealView (manager loads a code and reveals the ranking)
// The language switch is rendered per-view (onboarding + reveal landing only),
// so it doesn't sit over the duel and the results.
</script>

<template>
  <router-view />
</template>

<style>
/* Design tokens: single source of truth for color. Named by role, not by hue,
   so themes swap by redefining these variables without touching a component.
   Motivator colors live in store.ts (they're data, not theme). */
:root {
  color-scheme: light;

  /* Brand: warm terracotta accent (bars, filled buttons). */
  --c-brand: #c4732e;
  --c-brand-deep: #a85f21;   /* pressable button bottom edge, hover */
  --c-brand-soft: #dda06a;   /* progress gradient start */
  --c-focus-ring: rgba(196, 115, 46, 0.18);
  --c-on-brand: #ffffff;     /* text/icons on a brand-colored surface */

  /* Text (ink), from strongest to faintest */
  --c-ink: #2c2622;
  --c-ink-2: #5b524a;        /* card body text */
  --c-ink-3: #8a7f75;        /* secondary text */
  --c-ink-muted: #8a7f75;
  --c-ink-faint: #a89e94;    /* discreet / hint */
  --c-ink-placeholder: #b6ab9f;

  /* Surfaces & backgrounds: warm neutral. */
  --c-bg: #f4f1ec;
  --c-surface: #ffffff;
  --c-surface-2: #faf7f2;
  --c-surface-3: #ece6dc;
  --c-glass: rgba(255, 255, 255, 0.6);
  --c-glass-strong: rgba(255, 255, 255, 0.72);

  /* Borders (warm, keyed off the ink) */
  --c-border: #e6dfd4;
  --c-border-faint: rgba(44, 38, 34, 0.07);
  --c-border-soft: rgba(44, 38, 34, 0.15);

  /* States */
  --c-disabled-bg: #d9d1c5;
  --c-disabled-edge: #c3b8a8;
  --c-danger: #b3392a;
  --c-dashed: #d8cfc2;       /* reveal "?" mask outline + glyph */
}

* {
  box-sizing: border-box;
}

body {
  /* Text in Figtree; display headings switch to Bricolage Grotesque below. */
  font-family: 'Figtree', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--c-bg);
  color: var(--c-ink);
  padding: 0;
  margin: 0;
  min-height: 100vh;
}

/* Display type: the wordmark and section titles keep the distinctive grotesque. */
h1, h2, h3, h4, .display {
  font-family: 'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}
</style>
