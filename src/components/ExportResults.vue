<script setup lang="ts">
import { computed, ref } from 'vue';
import { Motivator } from '@/store';
import { encodeResults } from '@/results';
import { t } from '@/i18n';

const props = defineProps<{ name: string; items: Motivator[] }>();
defineEmits<{ (e: 'close'): void }>();

const code = computed(() => encodeResults(props.name, props.items));
const copied = ref(false);

const copyCode = async () => {
  try {
    await navigator.clipboard.writeText(code.value);
    copied.value = true;
    setTimeout(() => {
      copied.value = false;
    }, 1800);
  } catch {
    copied.value = false;
  }
};

const downloadCode = () => {
  const blob = new Blob([code.value], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const slug = props.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') || 'resultats';
  a.href = url;
  a.download = `moving-motivators-${slug}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};
</script>

<template>
  <div class="export">
    <div class="export-emoji">🎁</div>
    <h2>{{ name ? t('export.title', { name }) : t('export.titleNoName') }}</h2>
    <p class="export-lead">{{ t('export.lead') }}</p>

    <textarea
      class="export-code"
      :value="code"
      readonly
      rows="3"
      spellcheck="false"
      @focus="($event.target as HTMLTextAreaElement).select()"
    />

    <div class="export-actions">
      <button class="export-primary" type="button" @click="copyCode">
        {{ copied ? t('export.copied') : t('export.copy') }}
      </button>
      <button class="export-secondary" type="button" @click="downloadCode">
        {{ t('export.download') }}
      </button>
    </div>

    <p class="export-hint">{{ t('export.hint') }}</p>
  </div>
</template>

<style scoped>
.export {
  max-width: 520px;
  margin: 0 auto;
  background: var(--c-surface);
  border: 1px solid var(--c-border);
  border-radius: 16px;
  padding: 36px 32px;
  text-align: center;
}

.export-emoji {
  font-size: 40px;
  line-height: 1;
  margin-bottom: 12px;
}

.export h2 {
  margin: 0 0 12px;
  font-size: 22px;
  letter-spacing: -0.01em;
}

.export-lead {
  margin: 0 0 20px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--c-ink-muted);
}

.export-code {
  width: 100%;
  border: 1px solid var(--c-border);
  border-radius: 10px;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: var(--c-ink-muted);
  background: var(--c-surface-2);
  resize: none;
  word-break: break-all;
}

.export-code:focus {
  outline: none;
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px var(--c-focus-ring);
}

.export-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 18px;
}

/* Chunky, Duolingo-style "pressable" button. */
.export-primary {
  border: none;
  background: var(--c-brand);
  box-shadow: 0 4px 0 var(--c-brand-deep);
  color: var(--c-on-brand);
  border-radius: 10px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.export-primary:hover {
  transform: translateY(-1px);
}

.export-primary:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 var(--c-brand-deep);
}

.export-secondary {
  border: 1px solid var(--c-border);
  background: var(--c-surface);
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  color: var(--c-ink-muted);
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.export-secondary:hover {
  border-color: var(--c-brand);
  color: var(--c-brand);
}

.export-hint {
  margin: 18px 0 0;
  font-size: 12px;
  color: var(--c-ink-faint);
}

/* Mobile only — desktop layout above is untouched. */
@media (max-width: 480px) {
  .export {
    padding: 28px 20px;
  }

  .export-actions {
    flex-direction: column;
  }

  .export-primary,
  .export-secondary {
    width: 100%;
  }
}
</style>
