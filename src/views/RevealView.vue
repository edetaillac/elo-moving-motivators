<script setup lang="ts">
import { computed, ref } from 'vue';
import { Motivator } from '@/store';
import { decodeResults } from '@/results';
import ResultsReveal from '@/components/ResultsReveal.vue';
import LangSwitch from '@/components/LangSwitch.vue';
import { t } from '@/i18n';

const codeInput = ref('');
const fileName = ref('');
const fileContent = ref('');
const error = ref('');
const revealName = ref('');
const revealItems = ref<Motivator[] | null>(null);

const fileRef = ref<HTMLInputElement | null>(null);

// Launch is available as soon as there's something to decode: pasted code or a
// loaded file.
const canLaunch = computed(() => codeInput.value.trim() !== '' || fileContent.value !== '');

const launch = () => {
  const raw = codeInput.value.trim() || fileContent.value;
  const decoded = decodeResults(raw);
  if (!decoded) {
    error.value = t('revealPage.error');
    return;
  }
  error.value = '';
  revealName.value = decoded.name;
  revealItems.value = decoded.items;
};

const pickFile = () => fileRef.value?.click();

const onFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    fileContent.value = String(reader.result || '').trim();
    fileName.value = file.name;
    error.value = '';
  };
  reader.readAsText(file);
};

const reset = () => {
  revealItems.value = null;
  revealName.value = '';
  codeInput.value = '';
  fileContent.value = '';
  fileName.value = '';
  error.value = '';
};
</script>

<template>
  <div class="reveal-view">
    <ResultsReveal
      v-if="revealItems"
      :items="revealItems"
      :name="revealName"
      @close="reset"
    />

    <div v-else class="uploader">
      <div class="uploader-icon" aria-hidden="true">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d6a32c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" /><path d="M18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" /></svg>
      </div>

      <h1 class="uploader-title">{{ t('revealPage.title') }}</h1>
      <p class="uploader-lead">{{ t('revealPage.lead') }}</p>

      <textarea
        v-model="codeInput"
        class="uploader-code"
        rows="4"
        spellcheck="false"
        :placeholder="t('revealPage.placeholder')"
        @input="error = ''"
      />

      <p v-if="error" class="uploader-error" role="alert">{{ error }}</p>

      <div class="uploader-actions">
        <button class="uploader-primary" type="button" :disabled="!canLaunch" @click="launch">
          {{ t('revealPage.start') }}
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" /></svg>
        </button>
        <button class="uploader-file" type="button" @click="pickFile">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M8 8l4-4 4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
          {{ t('revealPage.import') }}
        </button>
      </div>

      <p v-if="fileName" class="uploader-file-loaded">{{ t('revealPage.fileLoaded', { name: fileName }) }}</p>

      <input ref="fileRef" type="file" accept=".txt,text/plain" hidden @change="onFile">
    </div>

    <!-- Language switch on the landing only, so it's there for whoever opens the
         reveal, but out of the way during the animated reveal itself. -->
    <LangSwitch v-if="!revealItems" />
  </div>
</template>

<style scoped>
.reveal-view {
  min-height: 100vh;
  padding: 48px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  /* Warm gold halo from the top, matching the accueil and the reveal ceremony. */
  background: radial-gradient(ellipse 70% 45% at 50% 0%, rgba(214, 163, 44, 0.1), transparent 70%), var(--c-bg);
}

.uploader {
  position: relative;
  max-width: 540px;
  width: 100%;
  margin: 0 auto;
  background: var(--c-surface);
  border-radius: 26px;
  padding: 44px 44px 40px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(30, 25, 20, 0.1);
}

/* Gold sparkle badge, tying into the reveal's crown. */
.uploader-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 163, 44, 0.14);
}

.uploader-title {
  margin: 0 0 10px;
  font-size: clamp(26px, 3.5vw, 32px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-ink);
}

.uploader-lead {
  margin: 0 0 28px;
  font-size: 15.5px;
  line-height: 1.5;
  color: var(--c-ink-3);
}

.uploader-code {
  width: 100%;
  resize: none;
  border: 1.5px solid var(--c-border-soft);
  border-radius: 16px;
  padding: 16px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--c-ink);
  background: var(--c-surface-2);
  outline: none;
  word-break: break-all;
}

.uploader-code:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px var(--c-focus-ring);
}

.uploader-code::placeholder {
  color: var(--c-ink-faint);
}

.uploader-error {
  margin: 12px 0 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--c-danger);
}

.uploader-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 22px;
}

/* Filled accent pill (handoff): soft drop shadow, disabled goes muted beige. */
.uploader-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  padding: 13px 24px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  white-space: nowrap;
  background: var(--c-brand);
  color: var(--c-on-brand);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.uploader-primary:hover:not(:disabled) {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

.uploader-primary:disabled {
  background: var(--c-disabled-bg);
  color: var(--c-ink-faint);
  cursor: not-allowed;
  box-shadow: none;
}

/* Outline secondary. */
.uploader-file {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid var(--c-border-soft);
  background: var(--c-surface);
  color: var(--c-ink-2);
  border-radius: 14px;
  padding: 13px 22px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.uploader-file:hover {
  border-color: color-mix(in srgb, var(--c-brand) 40%, transparent);
  color: var(--c-brand);
}

.uploader-file-loaded {
  margin: 18px 0 0;
  font-size: 13.5px;
  font-weight: 600;
  color: #5c9e80;
}

/* Mobile only. */
@media (max-width: 480px) {
  .reveal-view {
    padding: 24px 16px;
  }

  .uploader {
    padding: 32px 22px;
  }

  .uploader-actions {
    flex-direction: column;
  }

  .uploader-primary,
  .uploader-file {
    width: 100%;
    justify-content: center;
  }
}
</style>
