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
    { id: 1, name: 'Acceptation', nameEn: 'Acceptance', srcImg: 'acceptance.webp', color: '#8b7bb8', description: 'Le besoin d\'être reconnu et accepté par les autres, de se sentir inclus dans le groupe', descriptionEn: 'The need to be approved of and accepted by others, to feel part of the group' },
    { id: 2, name: 'Curiosité', nameEn: 'Curiosity', srcImg: 'curiosity.webp', color: '#7ba05b', description: 'L\'envie d\'apprendre de nouvelles choses, d\'explorer et de comprendre le monde qui nous entoure', descriptionEn: 'The urge to learn new things, explore and understand the world around you' },
    { id: 3, name: 'Indépendance', nameEn: 'Freedom', srcImg: 'independance.webp', color: '#5c9e80', description: 'Représente le désir de prendre des décisions autonomes et d\'avoir un contrôle sur le travail et sa vie', descriptionEn: 'The desire to make autonomous decisions and have control over your work and life' },
    { id: 4, name: 'Statut', nameEn: 'Status', srcImg: 'status.webp', color: '#d6a32c', description: 'L\'importance accordée à la position sociale et au prestige dans l\'organisation', descriptionEn: 'The importance given to social position and prestige in the organization' },
    { id: 5, name: 'Objectif', nameEn: 'Goal', srcImg: 'goal.webp', color: '#c0553f', description: 'Incarne la quête d\'un objectif significatif et aligné avec les valeurs personnelles', descriptionEn: 'The pursuit of a meaningful purpose aligned with your personal values' },
    { id: 6, name: 'Honneur', nameEn: 'Honor', srcImg: 'honor.webp', color: '#4e8c93', description: 'Représente la fierté d\'avoir ses valeurs personnelles qui se reflètent dans la manière de travailler', descriptionEn: 'The pride of having your personal values reflected in the way you work' },
    { id: 7, name: 'Maitrise', nameEn: 'Mastery', srcImg: 'mastery.webp', color: '#6e82a6', description: 'Reflète le besoin de développer de nouvelles compétences et de relever des défis', descriptionEn: 'The need to develop new skills and take on challenges' },
    { id: 8, name: 'Ordre', nameEn: 'Order', srcImg: 'order.webp', color: '#7c8ba0', description: 'Incarne le besoin d\'avoir des structures et des processus clairs', descriptionEn: 'The need for clear structures and processes' },
    { id: 9, name: 'Pouvoir', nameEn: 'Power', srcImg: 'power.webp', color: '#c4732e', description: 'L\'aspiration à influencer les autres, à avoir un impact et à prendre des décisions qui comptent', descriptionEn: 'The aspiration to influence others, have an impact and make decisions that matter' },
    { id: 10, name: 'Relations', nameEn: 'Relatedness', srcImg: 'relatedness.webp', color: '#c99ca6', description: 'Met en avant l\'importance des interactions positives avec les collègues et les partenaires', descriptionEn: 'Highlights the importance of positive interactions with colleagues and partners' },
];

export const state = reactive<{ items: Motivator[] }>({
    items: MOTIVATORS.map((m) => ({ ...m, elo: 1000, shownCount: 0 })),
});
