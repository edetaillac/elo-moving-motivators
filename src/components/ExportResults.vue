<script setup lang="ts">
import { computed, ref } from 'vue';
import { Motivator } from '@/store';
import { encodeResults } from '@/results';

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
    <h2>{{ name ? `C'est prêt, ${name} !` : "C'est prêt !" }}</h2>
    <p class="export-lead">
      Ton classement est établi, mais gardé secret. Envoie ce code à ton manager :
      il le chargera sur la page de révélation pour le découvrir avec toi.
    </p>

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
        {{ copied ? 'Copié ✅' : 'Copier le code' }}
      </button>
      <button class="export-secondary" type="button" @click="downloadCode">
        Télécharger (.txt)
      </button>
    </div>

    <p class="export-hint">
      Pas de spoiler : ce code est illisible tel quel, ton classement reste une surprise.
    </p>
  </div>
</template>

<style scoped>
.export {
  max-width: 520px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #e6e8f0;
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
  color: #667085;
}

.export-code {
  width: 100%;
  border: 1px solid #e6e8f0;
  border-radius: 10px;
  padding: 12px 14px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #667085;
  background: #f9fafc;
  resize: none;
  word-break: break-all;
}

.export-code:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
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
  background: #6366f1;
  box-shadow: 0 4px 0 #4338ca;
  color: #ffffff;
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
  box-shadow: 0 1px 0 #4338ca;
}

.export-secondary {
  border: 1px solid #e6e8f0;
  background: #ffffff;
  border-radius: 10px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 700;
  color: #667085;
  cursor: pointer;
  transition: border-color 0.15s ease, color 0.15s ease;
}

.export-secondary:hover {
  border-color: #6366f1;
  color: #6366f1;
}

.export-hint {
  margin: 18px 0 0;
  font-size: 12px;
  color: #98a2b3;
}
</style>
