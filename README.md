# Moving Motivators

Un petit jeu pour classer ses **Moving Motivators** (Management 3.0) par une série de duels, plutôt qu'un tri manuel fastidieux. À chaque duel, deux motivateurs s'affrontent, tu choisis celui qui te parle le plus, et un score façon ELO (comme aux échecs) en déduit ton classement des 10 motivateurs.

## Comment ça marche

- **Duels** : clique sur une carte (ou flèches ← →) pour désigner le motivateur qui te motive le plus.
- **Fiabilisation** : le classement se débloque quand les résultats sont assez stables — chaque motivateur doit avoir été comparé plusieurs fois (exposition) et le trio de tête doit s'être stabilisé. Compter ~40 à 60 duels.
- **Révélation animée** : une fois débloqué, le classement se dévoile de la 10e place vers la 1re, avec un podium.

## Deux modes

- **Solo** (par défaut, `/`) : tu joues et tu découvres toi-même ton classement à la fin.
- **Manager** (`/?mode=manager`) : à la fin, tu n'obtiens pas ton classement mais un **code opaque** (base64, illisible tel quel, pas de spoiler) à envoyer à ton manager.
- **Page de révélation** (`/reveal`) : le manager colle le code (ou dépose le fichier) et lance la révélation animée pour la découvrir ensemble.

Le mode se choisit via l'URL partagée : pas de paramètre = solo, `?mode=manager` = export.

## Stack

Vue 3 (`<script setup>`) + TypeScript + Vue Router, build via Vue CLI (webpack). Pas de backend : le partage manager passe par un code encodé côté client.

## Développement

```
npm install       # ou : make install (via docker)
npm run serve     # ou : make serve   — dev + hot-reload sur http://localhost:8080
npm run build     # ou : make build   — build de production
npm run lint      # ou : make lint
```
