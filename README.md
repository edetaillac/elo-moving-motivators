# Moving Motivators

A small game to rank your **Moving Motivators** (Management 3.0) through a series of duels, instead of a tedious manual sort. In each duel, two motivators face off, you pick the one that speaks to you most, and an ELO score (like in chess) derives your ranking of the 10 motivators.

## How it works

- **Duels**: click a card (or use the ← → arrows) to pick the motivator that drives you more.
- **Unlocking**: the ranking unlocks once the results are stable enough — each motivator must have been compared several times (exposure) and the top trio must have settled. Expect ~40 to 60 duels.
- **Animated reveal**: once unlocked, the ranking is revealed from 10th place up to 1st, with a podium.

## Two modes

- **Solo** (default, `/`): you play and reveal your own ranking at the end.
- **Manager** (`/?mode=manager`): at the end you don't get your ranking but an **opaque code** (base64, unreadable as-is, no spoiler) to send to your manager.
- **Reveal page** (`/reveal`): the manager pastes the code (or drops the file) and runs the animated reveal to discover it together.

The mode is chosen via the shared URL: no parameter = solo, `?mode=manager` = export.

## Language

French by default, with an English version. A toggle in the header switches between FR and EN (the choice is remembered).

## Stack

Vue 3 (`<script setup>`) + TypeScript + Vue Router, built with Vite. No backend: the manager sharing goes through a client-side encoded code.

## Development

```
npm install       # or: make install (via docker)
npm run serve     # or: make serve   — dev + hot-reload at http://localhost:8080
npm run build     # or: make build   — type-check (vue-tsc) + production build
npm run preview   # serve the production build locally
npm run lint      # or: make lint
```
