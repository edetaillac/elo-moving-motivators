// Tiny cross-component UI state (no store, no props drilling).
// `revealOpen` is true while a ranking reveal (ResultsReveal) is on screen —
// in-game solo results, or the manager reveal page. The app-level floating
// language switch steps aside then: the reveal owns the full screen (podium,
// halo, fixed "Révéler" button), so it renders its own switch docked at the
// bottom of its content instead of having one pinned over the ceremony.
import { ref } from 'vue';

export const revealOpen = ref(false);
