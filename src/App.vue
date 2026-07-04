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
* {
  box-sizing: border-box;
}

body {
  font-family: 'Bricolage Grotesque', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  background-color: #f0f1f8;
  background-image:
    radial-gradient(circle at 12% 8%, rgba(180, 85, 47, 0.09), transparent 42%),
    radial-gradient(circle at 88% 6%, rgba(244, 91, 172, 0.08), transparent 40%),
    radial-gradient(circle at 50% 100%, rgba(52, 211, 153, 0.07), transparent 45%);
  background-attachment: fixed;
  color: #1a1c29;
  padding: 0;
  margin: 0;
  min-height: 100vh;
}
</style>
