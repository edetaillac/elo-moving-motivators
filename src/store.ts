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
    { id: 1, name: 'Reconnaissance', nameEn: 'Acceptance', srcImg: 'acceptance.webp', color: '#8b7bb8', description: 'J\'ai besoin que les personnes autour de moi approuvent ce que je fais et qui je suis', descriptionEn: 'The need to be approved of and accepted by others, to feel part of the group' },
    { id: 2, name: 'Curiosité', nameEn: 'Curiosity', srcImg: 'curiosity.webp', color: '#7ba05b', description: 'J\'ai besoin de découvrir constamment de nouvelles choses', descriptionEn: 'The urge to learn new things, explore and understand the world around you' },
    { id: 3, name: 'Liberté', nameEn: 'Freedom', srcImg: 'independance.webp', color: '#5c9e80', description: 'J\'ai besoin de disposer d\'une certaine liberté dans mes actions et prises d\'initiative', descriptionEn: 'The desire to make autonomous decisions and have control over your work and life' },
    { id: 4, name: 'Statut', nameEn: 'Status', srcImg: 'status.webp', color: '#d6a32c', description: 'J\'ai besoin d\'un poste qui m\'apporte un certain statut social', descriptionEn: 'The importance given to social position and prestige in the organization' },
    { id: 5, name: 'Sens', nameEn: 'Goal', srcImg: 'goal.webp', color: '#c0553f', description: 'J\'ai besoin que mon travail ait un sens', descriptionEn: 'The pursuit of a meaningful purpose aligned with your personal values' },
    { id: 6, name: 'Valeurs', nameEn: 'Honor', srcImg: 'honor.webp', color: '#4e8c93', description: 'J\'ai besoin que mes valeurs personnelles se reflètent dans la façon dont je travaille', descriptionEn: 'The pride of having your personal values reflected in the way you work' },
    { id: 7, name: 'Expertise', nameEn: 'Mastery', srcImg: 'mastery.webp', color: '#6e82a6', description: 'J\'ai besoin de maîtriser ce que je fais et de me sentir compétent', descriptionEn: 'The need to develop new skills and take on challenges' },
    { id: 8, name: 'Ordre', nameEn: 'Order', srcImg: 'order.webp', color: '#7c8ba0', description: 'J\'ai besoin d\'évoluer dans un environnement structuré avec des règles bien définies', descriptionEn: 'The need for clear structures and processes' },
    { id: 9, name: 'Pouvoir', nameEn: 'Power', srcImg: 'power.webp', color: '#c4732e', description: 'J\'ai besoin d\'avoir de l\'influence sur mon environnement', descriptionEn: 'The aspiration to influence others, have an impact and make decisions that matter' },
    { id: 10, name: 'Interactions', nameEn: 'Relatedness', srcImg: 'relatedness.webp', color: '#c99ca6', description: 'J\'ai besoin d\'avoir de bonnes relations et d\'échanger régulièrement avec les autres', descriptionEn: 'Highlights the importance of positive interactions with colleagues and partners' },
];

export const state = reactive<{ items: Motivator[] }>({
    items: MOTIVATORS.map((m) => ({ ...m, elo: 1000, shownCount: 0 })),
});
