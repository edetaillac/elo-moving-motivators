// Lightweight i18n: a reactive locale + a flat message dictionary. FR by default.
import { ref } from 'vue';
import { Motivator } from './store';

export type Locale = 'fr' | 'en';

const STORAGE_KEY = 'mm-locale';
const saved = (typeof localStorage !== 'undefined' && localStorage.getItem(STORAGE_KEY)) as Locale | null;

export const locale = ref<Locale>(saved === 'en' ? 'en' : 'fr');

export function setLocale(l: Locale): void {
  locale.value = l;
  try {
    localStorage.setItem(STORAGE_KEY, l);
  } catch {
    /* ignore */
  }
}

type Dict = Record<string, string>;

const messages: Record<Locale, Dict> = {
  fr: {
    'header.subtitle.onboarding': 'Découvre ce qui t\'anime vraiment, parmi 10 motivateurs.',
    'header.subtitle.duel': 'À chaque duel, choisis la carte la plus importante pour toi.',
    'header.duels': '{n} duel{s}',
    'header.progress': '🔒 progression {p}%',
    'header.unlocked': '✨ Classement débloqué',
    'header.seeRanking': 'Voir mon classement ✨',
    'header.getCode': 'Récupérer mon code 🎁',
    'arena.hint': 'Clique une carte, ou utilise les flèches ← →',
    'footer.history': 'Historique',
    'footer.restart': 'Recommencer',
    'footer.restartConfirm': 'Recommencer ?',
    'footer.restartYes': 'Oui',
    'footer.restartCancel': 'Annuler',
    'onboarding.lead': "Deux motivateurs s'affrontent, tu gardes celui qui compte le plus pour toi. Duel après duel, ton classement se dessine.",
    'onboarding.estimate': 'Compte {b} pour débloquer ton classement complet.',
    'onboarding.estimateBold': '40 à 60 duels',
    'onboarding.namePlaceholder': 'Ton prénom',
    'onboarding.cta': "C'est parti ! 🚀",
    'onboarding.mode.label': 'Mode de jeu',
    'onboarding.mode.solo': 'Solo',
    'onboarding.mode.manager': 'Manager',
    'onboarding.mode.soloHelp': 'Tu découvres ton classement à la fin.',
    'onboarding.mode.managerHelp': 'Tu partages un code à ton manager, révélation ensemble plus tard.',
    'celebration.title': 'Bravo {name} !',
    'celebration.titleNoName': 'Bravo !',
    'celebration.textManager': "Tu as joué assez de duels pour établir ton classement des 10 motivateurs. Récupère ton code et envoie-le à ton manager pour le révéler ensemble.",
    'celebration.textSolo': "Tu as joué assez de duels pour établir ton classement des 10 motivateurs. Prêt à découvrir tes résultats ?",
    'celebration.primaryManager': 'Récupérer mon code 🎁',
    'celebration.primarySolo': 'Découvrir le classement ✨',
    'celebration.secondary': 'Continuer à jouer',
    'export.title': "C'est prêt, {name} !",
    'export.titleNoName': "C'est prêt !",
    'export.lead': 'Ton classement est établi, mais gardé secret. Envoie ce code à ton manager : il le chargera sur la page de révélation pour le découvrir avec toi.',
    'export.copy': 'Copier le code',
    'export.copied': 'Copié ✅',
    'export.download': 'Télécharger (.txt)',
    'export.hint': 'Pas de spoiler : ce code est illisible tel quel, ton classement reste une surprise.',
    'reveal.title': 'Le classement de {name}',
    'reveal.titleNoName': 'Révélation du classement',
    'reveal.close': 'Fermer',
    'reveal.next': 'Révéler la {label}',
    'reveal.done': 'Classement complet ✨',
    'reveal.place': '{n}e place',
    'reveal.place1': '1re place',
    'revealPage.title': 'Révélation du classement',
    'revealPage.lead': "Colle le code envoyé par la personne, ou dépose son fichier, puis lance la révélation animée.",
    'revealPage.placeholder': 'Colle le code ici…',
    'revealPage.error': 'Code invalide. Vérifie que tu as bien collé le code complet.',
    'revealPage.start': 'Lancer la révélation ✨',
    'revealPage.import': 'Importer un fichier',
  },
  en: {
    'header.subtitle.onboarding': 'Discover what really drives you, across 10 motivators.',
    'header.subtitle.duel': 'Each duel, pick the card that matters most to you.',
    'header.duels': '{n} duel{s}',
    'header.progress': '🔒 progress {p}%',
    'header.unlocked': '✨ Ranking unlocked',
    'header.seeRanking': 'See my ranking ✨',
    'header.getCode': 'Get my code 🎁',
    'arena.hint': 'Click a card, or use the ← → arrows',
    'footer.history': 'History',
    'footer.restart': 'Restart',
    'footer.restartConfirm': 'Restart?',
    'footer.restartYes': 'Yes',
    'footer.restartCancel': 'Cancel',
    'onboarding.lead': 'Two motivators face off, keep the one that matters most to you. Duel after duel, your ranking takes shape.',
    'onboarding.estimate': 'Expect {b} to unlock your full ranking.',
    'onboarding.estimateBold': '40 to 60 duels',
    'onboarding.namePlaceholder': 'Your first name',
    'onboarding.cta': "Let's go! 🚀",
    'onboarding.mode.label': 'Game mode',
    'onboarding.mode.solo': 'Solo',
    'onboarding.mode.manager': 'Manager',
    'onboarding.mode.soloHelp': 'You reveal your own ranking at the end.',
    'onboarding.mode.managerHelp': 'You share a code with your manager to reveal it together later.',
    'celebration.title': 'Well done {name}!',
    'celebration.titleNoName': 'Well done!',
    'celebration.textManager': "You've played enough duels to settle your ranking of the 10 motivators. Grab your code and send it to your manager to reveal it together.",
    'celebration.textSolo': "You've played enough duels to settle your ranking of the 10 motivators. Ready to discover your results?",
    'celebration.primaryManager': 'Get my code 🎁',
    'celebration.primarySolo': 'Reveal the ranking ✨',
    'celebration.secondary': 'Keep playing',
    'export.title': "Ready, {name}!",
    'export.titleNoName': 'Ready!',
    'export.lead': 'Your ranking is set, but kept secret. Send this code to your manager: they will load it on the reveal page to discover it with you.',
    'export.copy': 'Copy code',
    'export.copied': 'Copied ✅',
    'export.download': 'Download (.txt)',
    'export.hint': "No spoiler: this code is unreadable as-is, your ranking stays a surprise.",
    'reveal.title': "{name}'s ranking",
    'reveal.titleNoName': 'Ranking reveal',
    'reveal.close': 'Close',
    'reveal.next': 'Reveal {label}',
    'reveal.done': 'Full ranking ✨',
    'reveal.place': '{n}th place',
    'reveal.place1': '1st place',
    'revealPage.title': 'Ranking reveal',
    'revealPage.lead': 'Paste the code sent by the person, or drop their file, then start the animated reveal.',
    'revealPage.placeholder': 'Paste the code here…',
    'revealPage.error': "Invalid code. Make sure you pasted the whole code.",
    'revealPage.start': 'Start the reveal ✨',
    'revealPage.import': 'Import a file',
  },
};

export function t(key: string, params: Record<string, string | number> = {}): string {
  let str = messages[locale.value][key] ?? key;
  for (const [k, v] of Object.entries(params)) {
    str = str.replace(`{${k}}`, String(v));
  }
  return str;
}

// English ordinal for place labels (1st, 2nd, 3rd, 4th…).
function enOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

export function placeLabel(n: number): string {
  if (locale.value === 'en') return `${enOrdinal(n)} place`;
  return n === 1 ? t('reveal.place1') : t('reveal.place', { n });
}

// Localized motivator name / description.
export const mName = (m: Motivator): string => (locale.value === 'en' ? m.nameEn : m.name);
export const mDesc = (m: Motivator): string => (locale.value === 'en' ? m.descriptionEn : m.description);
