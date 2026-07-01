<script setup lang="ts">
import { ref } from 'vue';
import { Motivator } from '@/store';
import { decodeResults } from '@/results';
import ResultsReveal from '@/components/ResultsReveal.vue';
import { t, locale, setLocale } from '@/i18n';

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
      <div class="lang-switch">
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
  background: #ffffff;
  border: 1px solid #e6e8f0;
  border-radius: 16px;
  padding: 40px 32px;
  text-align: center;
}

.lang-switch {
  position: absolute;
  top: 14px;
  right: 16px;
  display: flex;
  gap: 4px;
}

.lang-flag {
  border: none;
  background: none;
  font-size: 18px;
  line-height: 1;
  padding: 4px;
  border-radius: 8px;
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
  color: #667085;
}

.uploader-code {
  width: 100%;
  border: 1px solid #e6e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #1a1c29;
  background: #f9fafc;
  resize: none;
  word-break: break-all;
}

.uploader-code:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.uploader-error {
  margin: 10px 0 0;
  font-size: 12px;
  font-weight: 600;
  color: #b91c1c;
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
  background: #6366f1;
  box-shadow: 0 4px 0 #4338ca;
  color: #ffffff;
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
  box-shadow: 0 1px 0 #4338ca;
}

.uploader-primary:disabled {
  background: #c7cad6;
  box-shadow: 0 4px 0 #a9adbd;
  cursor: not-allowed;
}

.uploader-file {
  border: 1px solid #e6e8f0;
  background: #ffffff;
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #667085;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.uploader-file:hover {
  border-color: #6366f1;
  color: #6366f1;
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
