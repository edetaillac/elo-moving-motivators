<script setup lang="ts">
import { ref } from 'vue';
import { Motivator } from '@/store';
import { decodeResults } from '@/results';
import ResultsReveal from '@/components/ResultsReveal.vue';
import { t } from '@/i18n';

const codeInput = ref('');
const error = ref('');
const revealName = ref('');
const revealItems = ref<Motivator[] | null>(null);

const loadCode = () => {
  const decoded = decodeResults(codeInput.value);
  if (!decoded) {
    error.value = t('revealPage.error');
    return;
  }
  error.value = '';
  revealName.value = decoded.name;
  revealItems.value = decoded.items;
};

const onFile = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    codeInput.value = String(reader.result || '').trim();
    loadCode();
  };
  reader.readAsText(file);
};

const reset = () => {
  revealItems.value = null;
  revealName.value = '';
  codeInput.value = '';
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
      <div class="uploader-emoji">🎬</div>
      <h1>{{ t('revealPage.title') }}</h1>
      <p class="uploader-lead">{{ t('revealPage.lead') }}</p>

      <textarea
        v-model="codeInput"
        class="uploader-code"
        rows="4"
        spellcheck="false"
        :placeholder="t('revealPage.placeholder')"
        @input="error = ''"
      />

      <p v-if="error" class="uploader-error">{{ error }}</p>

      <div class="uploader-actions">
        <button class="uploader-primary" type="button" :disabled="!codeInput.trim()" @click="loadCode">
          {{ t('revealPage.start') }}
        </button>
        <label class="uploader-file">
          {{ t('revealPage.import') }}
          <input type="file" accept=".txt,text/plain" hidden @change="onFile">
        </label>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reveal-view {
  max-width: 1300px;
  margin: 0 auto;
  min-height: 100vh;
  padding: 40px 24px 32px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.uploader {
  position: relative;
  max-width: 520px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
}

.uploader-emoji {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 12px;
}

.uploader h1 {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.uploader-lead {
  margin: 0 0 22px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--c-ink-muted);
}

.uploader-code {
  width: 100%;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--c-ink);
  background: var(--c-surface-2);
  resize: none;
  word-break: break-all;
}

.uploader-code:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px var(--c-focus-ring);
}

.uploader-error {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--c-danger);
}

.uploader-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  align-items: center;
  margin-top: 18px;
}

/* Chunky, Duolingo-style "pressable" button. */
.uploader-primary {
  border: none;
  background: var(--c-brand);
  box-shadow: 0 4px 0 var(--c-brand-deep);
  color: var(--c-on-brand);
  border-radius: 10px;
  padding: 14px 26px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.uploader-primary:hover:not(:disabled) {
  transform: translateY(-1px);
}

.uploader-primary:active:not(:disabled) {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--c-brand-deep);
}

.uploader-primary:disabled {
  background: var(--c-disabled-bg);
  box-shadow: 0 4px 0 var(--c-disabled-edge);
  cursor: not-allowed;
}

.uploader-file {
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-ink-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.uploader-file:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

/* Mobile only — desktop layout above is untouched. */
@media (max-width: 480px) {
  .reveal-view {
    padding: 24px 16px;
  }

  .uploader {
    padding: 32px 20px;
  }

  .uploader-actions {
    flex-direction: column;
  }

  .uploader-primary,
  .uploader-file {
    width: 100%;
    text-align: center;
  }
}
</style>
