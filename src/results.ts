// results.ts
// Encodes/decodes a player's ranking into an opaque, base64 code that can be
// sent to a manager without spoiling the result at a glance. No backend.
import { MOTIVATORS, Motivator } from './store';

interface ResultPayload {
    v: 1;
    name: string;
    elos: Record<number, number>;
}

// Base64 that survives accented characters (btoa is latin1-only).
function toBase64(str: string): string {
    return btoa(unescape(encodeURIComponent(str)));
}

function fromBase64(b64: string): string {
    return decodeURIComponent(escape(atob(b64)));
}

export function encodeResults(name: string, items: Motivator[]): string {
    const elos: Record<number, number> = {};
    items.forEach((item) => {
        elos[item.id] = Math.round(item.elo);
    });
    const payload: ResultPayload = { v: 1, name, elos };
    return toBase64(JSON.stringify(payload));
}

export interface DecodedResults {
    name: string;
    items: Motivator[];
}

// Returns the decoded ranking (sorted best-first), or null if the code is invalid.
export function decodeResults(code: string): DecodedResults | null {
    try {
        const payload = JSON.parse(fromBase64(code.trim())) as ResultPayload;
        if (!payload || payload.v !== 1 || typeof payload.elos !== 'object') {
            return null;
        }
        const items: Motivator[] = MOTIVATORS.map((m) => ({
            ...m,
            elo: payload.elos[m.id] ?? 1000,
            shownCount: 0,
        })).sort((a, b) => b.elo - a.elo);
        return { name: payload.name ?? '', items };
    } catch {
        return null;
    }
}
