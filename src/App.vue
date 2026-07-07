<script setup lang="ts">
// Thin shell: routing lives in router/index.ts.
// - /        → GameView (play the duels, export a code)
// - /reveal  → RevealView (manager loads a code and reveals the ranking)
import LangSwitch from '@/components/LangSwitch.vue';
</script>

<template>
  <router-view />
  <LangSwitch />
</template>

<style>
/* Design tokens: single source of truth for color. Named by role, not by hue,
   so themes swap by redefining these variables without touching a component.
   Motivator colors live in store.ts (they're data, not theme). */
:root {
  color-scheme: light;

  /* Brand */
  --c-brand: #B4552F;
  --c-brand-deep: #8A3C1E;   /* pressable button bottom edge, hover */
  --c-brand-soft: #D98A5E;   /* progress gradient start */
  --c-focus-ring: rgba(180, 85, 47, 0.15);
  --c-on-brand: #ffffff;     /* text/icons on a brand-colored surface */

  /* Text (ink), from strongest to faintest */
  --c-ink: #1a1c29;
  --c-ink-2: #475467;
  --c-ink-3: #5f6675;
  --c-ink-muted: #667085;
  --c-ink-faint: #6d7482;   /* AA 4.5:1 on light surfaces (was #98a2b3, ~2.6:1) */
  --c-ink-placeholder: #b0b5c2;

  /* Surfaces & backgrounds */
  --c-bg: #f0f1f8;
  --c-surface: #ffffff;
  --c-surface-2: #f9fafc;
  --c-surface-3: #eef0f6;
  --c-glass: rgba(255, 255, 255, 0.7);
  --c-glass-strong: rgba(255, 255, 255, 0.65);

  /* Borders */
  --c-border: #e6e8f0;
  --c-border-faint: rgba(15, 23, 42, 0.06);
  --c-border-soft: rgba(15, 23, 42, 0.08);

  /* States */
  --c-disabled-bg: #c7cad6;
  --c-disabled-edge: #a9adbd;
  --c-danger: #b91c1c;
  --c-dashed: #d0d5e0;       /* reveal "?" mask outline + glyph */
}

/* Dark theme: same roles, re-mapped. Brand terracotta stays; surfaces and ink
   flip. Glass must flip too (a white glass on a dark page reads as a light blob). */
@media (prefers-color-scheme: dark) {
  :root {
    color-scheme: dark;

    --c-ink: #f0f1f8;
    --c-ink-2: #c3c8d4;
    --c-ink-3: #a6acbb;
    --c-ink-muted: #8b93a4;
    --c-ink-faint: #868da0;   /* AA 4.5:1 on dark surfaces */
    --c-ink-placeholder: #5a6274;

    --c-bg: #14151f;
    --c-surface: #1e2030;
    --c-surface-2: #191b28;
    --c-surface-3: #262a3b;
    --c-glass: rgba(30, 32, 48, 0.7);
    --c-glass-strong: rgba(30, 32, 48, 0.65);

    --c-border: #2e3242;
    --c-border-faint: rgba(255, 255, 255, 0.07);
    --c-border-soft: rgba(255, 255, 255, 0.1);

    --c-disabled-bg: #3a3f52;
    --c-disabled-edge: #2b2f3e;
    --c-dashed: #3a3f52;
  }
}

* {
  box-sizing: border-box;
}

body {
  font-family: 'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--c-bg);
  background-image:
    radial-gradient(circle at 12% 8%, rgba(180, 85, 47, 0.09), transparent 42%),
    radial-gradient(circle at 88% 6%, rgba(244, 91, 172, 0.08), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.07), transparent 45%);
  background-attachment: fixed;
  color: var(--c-ink);
  padding: 0;
  margin: 0;
  min-height: 100vh;
}
</style>
