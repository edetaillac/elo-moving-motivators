<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { Motivator } from '@/store';
import { encodeResults } from '@/results';
import { t } from '@/i18n';

const props = defineProps<{ name: string; items: Motivator[] }>();
defineEmits<{ (e: 'close'): void }>();

const code = computed(() => encodeResults(props.name, props.items));
const copied = ref(false);

// Phase switch: move focus to the heading on open so it doesn't drop to <body>.
const headingRef = ref<HTMLElement | null>(null);
onMounted(() => headingRef.value?.focus());

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
    <div class="export-icon" aria-hidden="true">
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#d6a32c" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15l-1.9-4.1L5.5 9l4.6-1.4z" /><path d="M18.5 15l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8z" /></svg>
    </div>

    <h1 ref="headingRef" tabindex="-1" class="export-title">{{ name ? t('export.title', { name }) : t('export.titleNoName') }}</h1>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></svg>
        {{ copied ? t('export.copied') : t('export.copy') }}
      </button>
      <button class="export-secondary" type="button" @click="downloadCode">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v11M8 11l4 4 4-4M5 20h14" /></svg>
        {{ t('export.download') }}
      </button>
    </div>

    <p class="export-hint">{{ t('export.hint') }}</p>
  </div>
</template>

<style scoped>
/* Twin of the manager entry (RevealView): same card, badge and buttons. */
.export {
  max-width: 540px;
  width: 100%;
  margin: 0 auto;
  background: var(--c-surface);
  border-radius: 26px;
  padding: 44px 44px 40px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(30, 25, 20, 0.1);
}

.export-icon {
  width: 72px;
  height: 72px;
  border-radius: 999px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(214, 163, 44, 0.14);
}

.export-title {
  margin: 0 0 10px;
  font-size: clamp(24px, 3.2vw, 30px);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: var(--c-ink);
}

/* Focused programmatically on open, no visible ring needed. */
.export-title:focus {
  outline: none;
}

.export-lead {
  margin: 0 0 24px;
  font-size: 15.5px;
  line-height: 1.5;
  color: var(--c-ink-3);
}

.export-code {
  width: 100%;
  border: 1.5px solid var(--c-border-soft);
  border-radius: 16px;
  padding: 16px;
  font-family: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 14px;
  line-height: 1.5;
  color: var(--c-ink-2);
  background: var(--c-surface-2);
  resize: none;
  outline: none;
  word-break: break-all;
}

.export-code:focus {
  border-color: var(--c-brand);
  box-shadow: 0 0 0 3px var(--c-focus-ring);
}

.export-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 22px;
}

/* Filled accent pill. */
.export-primary {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  border-radius: 14px;
  padding: 13px 24px;
  font: inherit;
  font-size: 15px;
  font-weight: 700;
  background: var(--c-brand);
  color: var(--c-on-brand);
  cursor: pointer;
  box-shadow: 0 8px 20px rgba(196, 115, 46, 0.32);
  transition: background-color 0.15s ease, transform 0.1s ease;
}

.export-primary:hover {
  background: var(--c-brand-deep);
  transform: translateY(-1px);
}

/* Outline secondary. */
.export-secondary {
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

.export-secondary:hover {
  border-color: color-mix(in srgb, var(--c-brand) 40%, transparent);
  color: var(--c-brand);
}

.export-hint {
  margin: 22px 0 0;
  font-size: 13px;
  color: var(--c-ink-faint);
}

/* Mobile only. */
@media (max-width: 480px) {
  .export {
    padding: 32px 22px;
  }

  .export-actions {
    flex-direction: column;
  }

  .export-primary,
  .export-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>
