// store.ts
import { reactive } from 'vue';

export interface Motivator {
    id: number;
    name: string;
    srcImg: string;
    color: string;
    description: string;
    elo: number;
    shownCount: number;
}

export type MotivatorDefinition = Omit<Motivator, 'elo' | 'shownCount'>;

// Base motivator definitions. Shared between the game (reactive state below)
// and the manager reveal page, which rebuilds a ranking from a decoded code.
export const MOTIVATORS: MotivatorDefinition[] = [
    { id: 1, name: 'Acceptation', srcImg: 'acceptance.png', color: '#e6ea08', description: 'Le besoin d\'être reconnu et accepté par les autres, de se sentir inclus dans le groupe' },
    { id: 2, name: 'Curiosité', srcImg: 'curiosity.png', color: '#f9a60d', description: 'L\'envie d\'apprendre de nouvelles choses, d\'explorer et de comprendre le monde qui nous entoure' },
    { id: 3, name: 'Indépendance', srcImg: 'independance.png', color: '#ef2e31', description: 'Représente le désir de prendre des décisions autonomes et d\'avoir un contrôle sur le travail et sa vie' },
    { id: 4, name: 'Statut', srcImg: 'status.png', color: '#f45bac', description: 'L\'importance accordée à la position sociale et au prestige dans l\'organisation' },
    { id: 5, name: 'Objectif', srcImg: 'goal.png', color: '#432c84', description: 'Incarne la quête d\'un objectif significatif et aligné avec les valeurs personnelles' },
    { id: 6, name: 'Honneur', srcImg: 'honor.png', color: '#40c1ea', description: 'Représente la fierté d\'avoir ses valeurs personnelles qui se reflètent dans la manière de travailler' },
    { id: 7, name: 'Maitrise', srcImg: 'mastery.png', color: '#66caa7', description: 'Reflète le besoin de développer de nouvelles compétences et de relever des défis' },
    { id: 8, name: 'Ordre', srcImg: 'order.png', color: '#f8b2d2', description: 'Incarne le besoin d\'avoir des structures et des processus clairs' },
    { id: 9, name: 'Pouvoir', srcImg: 'power.png', color: '#9cb022', description: 'L\'aspiration à influencer les autres, à avoir un impact et à prendre des décisions qui comptent' },
    { id: 10, name: 'Relations', srcImg: 'relatedness.png', color: '#32b765', description: 'Met en avant l\'importance des interactions positives avec les collègues et les partenaires' },
];

export const state = reactive<{ items: Motivator[] }>({
    items: MOTIVATORS.map((m) => ({ ...m, elo: 1000, shownCount: 0 })),
});
