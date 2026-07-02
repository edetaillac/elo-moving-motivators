# Analyse externe : Moving Motivators, faut-il en faire un produit ?

---
date: 2026-07-02
contexte: Analyse multi-regards (technique, UX, produit, UI) de l'app vibe-codée Moving Motivators, en vue d'une éventuelle commercialisation. Audit du code source, tests en conditions réelles sur https://moving-motivators.static.evaneos.dev/ (partie complète jouée, code forgé testé sur /reveal), recherches marché et licence.
---

## TL;DR

Ne pas commercialiser ce produit tel quel, et probablement pas du tout en standalone. Trois raisons cumulatives : le job-to-be-done est déjà servi gratuitement partout (templates Miro/Figma officiels, outil EasyRetro, apps open source), le nom et les visuels Moving Motivators appartiennent à Management 3.0 B.V. (pas de Creative Commons, produits dérivés commerciaux possibles mais sans leur nom ni leurs illustrations, avec attribution), et la différenciation réelle (duels + ELO + reveal en 1:1) est clonable en un sprint, sans effet de réseau ni donnée accumulée.

La vraie valeur de l'asset est ailleurs : le pattern "assessment par duels + reveal partagé en 1:1" est excellent et transposable à des contenus sans IP tierce (valeurs d'équipe, drivers de carrière, préférences de feedback). Le code est propre et testable pour du vibe-coding, mais il y a un défaut produit majeur mesuré en test réel : la partie peut ne jamais se débloquer (73 duels joués, progression retombée 4 fois à 0 %, promesse affichée de 40 à 60), sans échappatoire ni sauvegarde.

## Verdict par regard

| Regard | Note globale | Résumé |
|---|---|---|
| Produit | Non viable en standalone | Marché unitaire servi par du gratuit, IP contraignante, différenciation non défendable |
| Technique | Base saine, produit incomplet | Code lisible et typé strict, mais zéro test, zéro persistance, stack Vue CLI en fin de vie |
| UX | Bonne idée, boucle centrale cassée | Le déblocage peut ne jamais arriver, progression qui régresse, paires répétées, tout se perd au refresh |
| UI | Réussie | Cohérente, joyeuse, reveal final excellent, quelques finitions manquantes |

---

## 1. Regard produit

### Propriété intellectuelle : contraignant, pas bloquant

Point vérifié en priorité car il conditionne tout le reste. Il n'y a pas de licence Creative Commons sur Moving Motivators, contrairement à une croyance répandue. Le contenu est © Management 3.0 B.V. La FAQ officielle (management30.com/faq) autorise les produits dérivés "inspirés de", y compris commerciaux, à deux conditions : ne pas utiliser leurs illustrations ni leur logo, et apposer "© Management 3.0" + "management30.com". Les téléchargements officiels portent la mention "Re-selling is not permitted". La licence facilitateur (fee annuelle + event fees) couvre les ateliers, pas un SaaS.

Conséquences concrètes :

- Un produit payant nommé "Moving Motivators" est une exposition juridique directe (marque exploitée commercialement par Management 3.0 B.V.). Il faudrait renommer, donc perdre le principal atout marketing
- Les icônes actuelles de l'app reproduisent l'iconographie des cartes officielles (podium, loupe, médaille...) : à refaire intégralement pour un usage commercial
- Le statut exact du dépôt de marque (EUIPO/USPTO) n'a pas pu être confirmé en ligne, à faire vérifier par un juriste avant toute décision. Seul un accord écrit avec Management 3.0 B.V. fait foi

### Concurrence : le gratuit occupe tout le terrain

Digitalisations directes, toutes gratuites : template officiel Miroverse, fichier Figma Community, outil EasyRetro (lead magnet), apps open source (ex. github.com/ngarbezza/moving-motivators). Personne ne vend l'exercice en direct, et ce n'est pas un hasard.

Adjacents payants, qui vendent une plateforme et jamais l'exercice seul :

| Produit | Positionnement | Prix constaté |
|---|---|---|
| Attuned | Assessment de motivation intrinsèque forced-choice pour managers | 99 à 189 $/user/an |
| Officevibe / Workleap | Engagement + 1:1 + pulse surveys | ~5 $/user/mois |
| Popwork | Rituels 1:1 manager-report | 5 à 8 €/employé/mois |
| Retrium / TeamRetro / Neatro | Rétrospectives d'équipe | 25 à 39 $/équipe/mois |

Attuned est la version "produit sérieux" de cette idée : il valide la méthode par comparaisons forcées, et montre le niveau d'investissement requis (psychométrie, dashboards, ventes B2B) pour vendre sur ce créneau.

### Segments : petits, ou déjà équipés

- Facilitateurs licenciés Management 3.0 : ~500 dans le monde. Même à 100 €/an et 20 % de pénétration, ~10 k€ ARR. Micro-business au mieux
- Coachs agiles au sens large : des dizaines de milliers, mais culture du gratuit et outillage déjà capté par Miro/Mural
- Managers en direct : pas de canal d'acquisition, pas de ligne de budget
- People/HR : le seul segment solvable, mais il achète des plateformes (SSO, RGPD, intégrations HRIS), pas un exercice isolé

### Ce qui a de la valeur

Le mode manager avec code + révélation animée ensemble en 1:1 transforme un assessment en moment relationnel. C'est la trouvaille du produit, confirmée en test : le reveal est l'écran le plus réussi de l'app. Mais c'est une feature, pas un produit : pas de brevet possible, pas de backend donc pas d'accumulation, réimplémentable par EasyRetro demain.

### Recommandation produit

1. Ne pas engager de commercialisation, le cas d'affaires ne tient pas
2. Capitaliser autrement : open source avec l'attribution requise + article de blog tech sur la mécanique ELO appliquée au forced-choice (employer branding, coût quasi nul)
3. Si l'envie de monétiser persiste à titre personnel : accord écrit préalable avec Management 3.0 B.V., renommage, redesign des cartes, niche facilitateurs, avec des attentes de side project
4. À garder pour plus tard : le pattern duels + reveal transposé à des contenus sans IP tierce (valeurs d'équipe, drivers de carrière). Si un produit doit naître de ce code, c'est par là

---

## 2. Regard technique

### Points forts

- Code compact (~1 900 lignes utiles) et lisible, commentaires qui expliquent le pourquoi
- Modules purs séparés de l'UI et testables en l'état : `elo.ts`, `results.ts`, `i18n.ts` maison sans dépendance
- TypeScript strict réel (pas cosmétique) : interfaces partout, aucun `any` applicatif
- `decodeResults` défensif (try/catch, check de version, fallback), erreur utilisateur propre sur /reveal (vérifié en live)
- Critère de déblocage plus intelligent qu'un compteur : exposition minimale par carte ET stabilité du top 3 (le design est bon, c'est le calibrage qui pêche, voir UX)
- Attention a11y réelle par endroits : `prefers-reduced-motion`, contraste de bannière calculé, `aria-pressed` sur les switchs de langue
- Breakpoints responsive présents sur toutes les vues

### Problèmes critiques (bloquants pour vendre)

1. IP Management 3.0 (voir regard produit) : les visuels reproduisent l'iconographie officielle, le nom est leur marque
2. Aucune persistance : l'état vit en mémoire (`store.ts`, refs locales de `GameView.vue`). Un refresh, un onglet fermé, une mise en veille mobile = 40 à 73 duels perdus, sans même un garde `beforeunload`. Vécu en test : navigation vers /reveal, partie de 73 duels perdue. Pour une session de 5 à 10 minutes ciblant du mobile, c'est rédhibitoire
3. Le code "opaque" ne l'est pas : `btoa(JSON.stringify(...))` (`results.ts:21-28`). Démontré en test : un faux code forgé en une ligne de shell est accepté par /reveal et produit un classement crédible au nom de la personne. `atob()` dans une console lit le vrai code en 10 secondes. La promesse produit ("ce code est illisible tel quel") est fausse dans les deux sens : le manager peut spoiler, le joueur peut tricher
4. Zéro test, zéro CI : `updateElo` et `encodeResults`/`decodeResults` sont des fonctions pures qui se testent en 30 minutes, rien n'est protégé

### Problèmes majeurs

- Validation d'entrée incomplète sur /reveal : des elos non numériques ou un nom de 5 000 caractères passent le decode (`results.ts:44-47`). Pas d'XSS en revanche (interpolation Vue partout, aucun `v-html`)
- Fiabilité statistique survendue : la stabilité ne porte que sur le top 3 mais la révélation affiche un ordre strict de 1 à 10. Avec ~5 à 10 duels par carte et K=32 fixe, les rangs 4 à 8 sont du bruit. Afficher des tiers (podium / milieu / bas) ou apparier par proximité d'ELO
- Stack en fin de vie : Vue CLI en maintenance mode (Vite recommandé depuis 2022), ESLint 7 EOL, @typescript-eslint 5.4 non compatible officiellement avec TS 5.9, Node 19 EOL dans le docker-compose (qui n'expose d'ailleurs aucun port)
- Pas d'undo alors que le handler clavier écoute au niveau `window` : une flèche accidentelle compte définitivement
- Accessibilité des modales : overlay de célébration sans `role="dialog"`, sans trap de focus, sans Escape. `lang` du document figé à `fr` même en anglais
- Duplication : switch de langue copié-collé entre 2 fichiers, bouton "Duolingo-style" dupliqué 5 fois, `GameView.vue` (547 lignes) mélange logique de jeu et UI. Il manque `LangSwitch.vue`, `BaseButton.vue` et un composable `useDuelGame()`

Nuance sur le déploiement : le fallback SPA fonctionne sur static.evaneos.dev (/reveal chargé à froid sans 404, vérifié), mais aucune config de prod n'est versionnée dans le repo, donc ce comportement n'est pas garanti ailleurs.

---

## 3. Regard UX

Testé en conditions réelles : partie complète au clavier, mode reveal avec code valide et invalide, toggle FR/EN.

### Ce qui marche

- Onboarding limpide : une phrase, une promesse chiffrée (40 à 60 duels), un prénom, c'est parti
- Le duel est un bon pattern : deux cartes, un choix, faible charge cognitive, clavier supporté
- Le reveal est la meilleure partie du produit : révélation manuelle carte par carte du 10e au podium, bien rythmée pour un 1:1, couronne sur le n°1, état d'erreur propre sur code invalide
- FR/EN complet avec persistance du choix

### Le défaut central, mesuré : le déblocage peut ne jamais arriver

Session de test réelle : 73 duels joués, classement jamais débloqué. La progression affichée a fait du yo-yo : 0 % → 60 % (26 duels) → 20 % (38) → 10 % (50) → 0 % (52) → 20 % (63) → 0 % (70) → 0 % (73). Mécanisme en cause (`GameView.vue:128-141`) : la progression est `min(exposition, stabilité)` et le streak de stabilité retombe à 0 dès que le trio de tête change. Un utilisateur aux préférences serrées ou changeantes dépasse largement la promesse des 40 à 60 duels, voit sa barre reculer sans explication, et n'a aucune porte de sortie : pas de plafond de duels, pas de bouton "voir mon classement quand même", pas de sauvegarde. L'abandon à ce stade coûte la totalité de la session.

C'est le premier problème à régler, avant toute considération de commercialisation : plafond dur (~60 duels) avec proposition du classement assorti d'un indice de confiance, progression monotone (afficher le maximum atteint), et explication des deux critères dans l'UI.

### Autres frictions constatées

- La même paire peut être proposée 3 à 4 fois d'affilée (vécu plusieurs fois en partie). Cause : tirage pondéré vers les cartes sous-exposées sans interdiction de répéter la paire précédente (`GameView.vue:29-40`). Ressenti utilisateur : "c'est buggé, mon clic n'a pas compté"
- Le verrou d'animation (200 ms) avale les choix rapides : 5 appuis flèche rapides = 1 seul duel compté. À l'inverse, un appui pendant le fondu est accepté alors que les cartes ne sont pas encore visibles : on peut voter à l'aveugle
- Aucune reprise de partie ni undo (voir technique)
- Le texte de /reveal promet un drag & drop de fichier qui n'existe pas, seul un input file est câblé
- Le prénom saisi n'apparaît nulle part pendant le jeu, uniquement à la fin

---

## 4. Regard UI

### Ce qui est réussi

- Direction artistique cohérente et joyeuse : cartes à bannière colorée, palette propre par motivateur, contraste du texte de bannière calculé, icônes lisibles
- L'écran de reveal final est excellent : podium 2/1/3, couronne, grille 4 à 10, barres d'écart sous les cartes du podium
- Micro-interactions soignées (pop des cartes, pill de progression, boutons à relief type Duolingo)
- États désactivés clairs (CTA grisé tant que le prénom est vide)

### À corriger

- L'écran de duel est perdu dans la page en desktop : deux cartes de ~330 px dans un viewport de 1440, header très haut, ~40 % d'espace vide en bas. Recentrer verticalement ou densifier
- L'onboarding a le même défaut : carte petite, très basse dans la page, titre déconnecté tout en haut
- Les barres d'écart ELO du podium n'ont aucune légende, et la barre rouge sous le 3e se lit comme "mauvais" alors que c'est juste la couleur de la carte Indépendance
- "Le classement de Alex" : élision française non gérée (d'Alex)
- Transitions entre duels perçues comme lentes quand l'onglet est throttlé, avec un écran vide entre deux paires : prévoir un état visuel pendant le swap plutôt qu'un vide
- Em-dash dans la copy anglaise de l'onboarding ("face off —"), incohérent avec le reste de la ponctuation
- Titre d'onglet non localisé, pas de meta description, pas de manifest PWA alors que l'usage mobile en atelier est le cas nominal

---

## Actions recommandées

### Horizon 1, quel que soit le destin du produit (quelques jours)

1. Corriger la boucle de déblocage : plafond dur de duels + "révéler quand même" + progression monotone. C'est le défaut qui fait abandonner
2. Persistance localStorage de la partie avec reprise au chargement
3. Interdire la répétition immédiate de la même paire
4. Tests unitaires sur `elo.ts` et `results.ts` + GitHub Actions lint/test/build
5. Reformuler la promesse du code ("pas lisible d'un coup d'œil" plutôt que "illisible")

### Horizon 2, si l'app doit vivre sérieusement en interne (1 à 2 semaines)

6. Migration Vite + montée ESLint/Node, undo, a11y des modales, validation stricte du decode, factorisation LangSwitch/BaseButton/useDuelGame
7. Affichage par tiers ou appariement par proximité d'ELO pour ne pas survendre les rangs 4 à 8
8. Export image du board final de reveal (usage 1:1 réel)

### Horizon 3, seulement si la piste commerciale est retenue malgré l'avis

9. Trancher l'IP d'abord : juriste + accord écrit Management 3.0 B.V., renommage, redesign complet des visuels
10. Pivoter le contenu vers un exercice propriétaire (valeurs d'équipe, drivers de carrière) plutôt que de payer le coût IP pour un marché déjà gratuit
11. Backend minimal (comptes, sessions d'équipe, historique) en connaissance de cause : RGPD sur données RH sensibles, et 10 à 20 fois l'investissement actuel

### Limites de l'analyse

Chiffres marché et pricing concurrents issus de pages publiques non vérifiées indépendamment. Statut du dépôt de marque Moving Motivators non confirmé. Test UX mené via automatisation navigateur : les durées de transition perçues peuvent différer légèrement d'un usage manuel, mais les comportements structurels (progression qui régresse, paires répétées, absence de plafond, perte au refresh, code forgeable) sont reproduits et vérifiés dans le code.
