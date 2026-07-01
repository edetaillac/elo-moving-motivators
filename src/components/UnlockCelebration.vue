<script setup lang="ts">
defineProps<{ name?: string; manager?: boolean }>();
defineEmits<{ (e: 'action'): void; (e: 'close'): void }>();

const CONFETTI_COLORS = ['#6366f1', '#f45bac', '#fbbf24', '#34d399', '#f97316'];
const confettiPieces = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  left: Math.random() * 100,
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  delay: Math.random() * 0.4,
  duration: 1.6 + Math.random() * 0.8,
  rotate: Math.random() * 360,
}));
</script>

<template>
  <div class="celebration-backdrop">
    <div class="confetti">
      <span
        v-for="p in confettiPieces"
        :key="p.id"
        class="confetti-piece"
        :style="{
          left: p.left + '%',
          backgroundColor: p.color,
          animationDelay: p.delay + 's',
          animationDuration: p.duration + 's',
          transform: `rotate(${p.rotate}deg)`,
        }"
      />
    </div>

    <div class="celebration-card">
      <div class="celebration-emoji">🎉</div>
      <h2>{{ name ? `Bravo ${name} !` : 'Bravo !' }}</h2>
      <p v-if="manager">
        Tu as joué assez de duels pour établir ton classement des 10 motivateurs.
        Récupère ton code et envoie-le à ton manager pour le révéler ensemble.
      </p>
      <p v-else>
        Tu as joué assez de duels pour établir ton classement des 10 motivateurs.
        Prêt à découvrir tes résultats ?
      </p>
      <div class="celebration-actions">
        <button class="celebration-primary" type="button" @click="$emit('action')">
          {{ manager ? 'Récupérer mon code 🎁' : 'Découvrir le classement ✨' }}
        </button>
        <button class="celebration-secondary" type="button" @click="$emit('close')">
          Continuer à jouer
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.celebration-backdrop {
  position: fixed;
  inset: 0;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 16, 26, 0.55);
  padding: 24px;
}

.confetti {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.confetti-piece {
  position: absolute;
  top: -12px;
  width: 9px;
  height: 16px;
  border-radius: 2px;
  animation-name: confetti-fall;
  animation-timing-function: ease-in;
  animation-fill-mode: forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(70vh) rotate(360deg);
    opacity: 0;
  }
}

.celebration-card {
  position: relative;
  max-width: 420px;
  width: 100%;
  background: #ffffff;
  border-radius: 20px;
  padding: 36px 32px;
  text-align: center;
  box-shadow: 0 24px 60px rgba(15, 16, 26, 0.35);
  animation: card-bounce-in 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes card-bounce-in {
  0% {
    transform: scale(0.7) translateY(30px);
    opacity: 0;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}

.celebration-emoji {
  font-size: 44px;
  line-height: 1;
  margin-bottom: 12px;
  animation: emoji-pop 0.6s ease 0.15s both;
}

@keyframes emoji-pop {
  0% { transform: scale(0) rotate(-20deg); }
  60% { transform: scale(1.25) rotate(8deg); }
  100% { transform: scale(1) rotate(0); }
}

.celebration-card h2 {
  margin: 0 0 12px;
  font-size: 21px;
  letter-spacing: -0.01em;
}

.celebration-card p {
  margin: 0 0 26px;
  font-size: 13px;
  line-height: 1.6;
  color: #667085;
}

.celebration-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* Chunky, Duolingo-style "pressable" button: solid bottom edge that flattens on click. */
.celebration-primary {
  border: none;
  background: #6366f1;
  box-shadow: 0 4px 0 #4338ca;
  color: #ffffff;
  border-radius: 10px;
  padding: 14px 20px;
  font-size: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.1s ease, box-shadow 0.1s ease;
}

.celebration-primary:hover {
  transform: translateY(-1px);
}

.celebration-primary:active {
  transform: translateY(3px);
  box-shadow: 0 1px 0 #4338ca;
}

.celebration-secondary {
  border: none;
  background: none;
  color: #98a2b3;
  font-size: 12px;
  font-weight: 600;
  padding: 6px;
  cursor: pointer;
  transition: color 0.15s ease;
}

.celebration-secondary:hover {
  color: #6366f1;
}
</style>
