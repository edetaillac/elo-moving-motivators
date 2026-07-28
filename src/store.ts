// store.ts
import { reactive } from 'vue';

export interface Motivator {
    id: number;
    name: string;
    nameEn: string;
    srcImg: string;
    color: string;
    description: string;
    descriptionEn: string;
    elo: number;
    shownCount: number;
}

export type MotivatorDefinition = Omit<Motivator, 'elo' | 'shownCount'>;

// Play mode: solo reveals your own ranking, manager exports a code to share.
export type Mode = 'solo' | 'manager';

// Base motivator definitions. Shared between the game (reactive state below)
// and the manager reveal page, which rebuilds a ranking from a decoded code.
export const MOTIVATORS: MotivatorDefinition[] = [
    { id: 1, name: 'Reconnaissance', nameEn: 'Acceptance', srcImg: 'acceptance.webp', color: '#8b7bb8', description: 'J\'ai besoin que les personnes autour de moi approuvent ce que je fais et qui je suis', descriptionEn: 'The people around me approve of what I do and who I am' },
    { id: 2, name: 'Curiosité', nameEn: 'Curiosity', srcImg: 'curiosity.webp', color: '#7ba05b', description: 'J\'ai besoin de découvrir constamment de nouvelles choses', descriptionEn: 'I have plenty of things to investigate and to think about' },
    { id: 3, name: 'Liberté', nameEn: 'Freedom', srcImg: 'independance.webp', color: '#5c9e80', description: 'J\'ai besoin de disposer d\'une certaine liberté dans mes actions et prises d\'initiative', descriptionEn: 'I am independent of others with my work and my responsibilities' },
    { id: 4, name: 'Statut', nameEn: 'Status', srcImg: 'status.webp', color: '#d6a32c', description: 'J\'ai besoin d\'un poste qui m\'apporte un certain statut social', descriptionEn: 'My position is good, and recognized by the people who work with me' },
    { id: 5, name: 'Sens', nameEn: 'Goal', srcImg: 'goal.webp', color: '#c0553f', description: 'J\'ai besoin que mon travail ait un sens', descriptionEn: 'My purpose in life is reflected in the work that I do' },
    { id: 6, name: 'Valeurs', nameEn: 'Honor', srcImg: 'honor.webp', color: '#4e8c93', description: 'J\'ai besoin que mes valeurs personnelles se reflètent dans la façon dont je travaille', descriptionEn: 'I feel proud that my personal values are reflected in how I work' },
    { id: 7, name: 'Expertise', nameEn: 'Mastery', srcImg: 'mastery.webp', color: '#6e82a6', description: 'J\'ai besoin de maîtriser ce que je fais et de me sentir compétent', descriptionEn: 'My work challenges my competence but it is still within my abilities' },
    { id: 8, name: 'Ordre', nameEn: 'Order', srcImg: 'order.webp', color: '#7c8ba0', description: 'J\'ai besoin d\'évoluer dans un environnement structuré avec des règles bien définies', descriptionEn: 'There are enough rules and policies for a stable environment' },
    { id: 9, name: 'Pouvoir', nameEn: 'Power', srcImg: 'power.webp', color: '#c4732e', description: 'J\'ai besoin d\'avoir de l\'influence sur mon environnement', descriptionEn: 'There\'s enough room for me to influence what happens around me' },
    { id: 10, name: 'Interactions', nameEn: 'Relatedness', srcImg: 'relatedness.webp', color: '#c99ca6', description: 'J\'ai besoin d\'avoir de bonnes relations et d\'échanger régulièrement avec les autres', descriptionEn: 'I have good social contacts with the people in my work' },
];

export const state = reactive<{ items: Motivator[] }>({
    items: MOTIVATORS.map((m) => ({ ...m, elo: 1000, shownCount: 0 })),
});
