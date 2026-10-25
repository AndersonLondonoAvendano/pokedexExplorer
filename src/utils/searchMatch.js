// Pure helpers for partial-name search. They expect a term that is already normalized
// and has its spaces turned into hyphens.
import { isNumericQuery } from './formatters.js';

// 'exact' for a number or a single character (asked to the API as is);
// 'partial' for anything longer (matched against the name index).
export function searchKind(term) {
  return isNumericQuery(term) || term.length === 1 ? 'exact' : 'partial';
}

// Position group of a match: 0 exact name, 1 starts with the term, 2 contains it elsewhere.
function matchGroup(name, term) {
  if (name === term) return 0;
  return name.startsWith(term) ? 1 : 2;
}

// Decides what a partial term does against the index:
// { kind: 'none' | 'open' | 'list', id, total, items }.
// An exact name or a single match opens that Pokémon; otherwise the matches are sorted
// by group and then by id, and cut to `limit` while `total` keeps the full count.
export function resolveMatches(index, term, limit) {
  const matches = index.filter((entry) => entry.name.includes(term));

  const exact = matches.find((entry) => entry.name === term);
  if (exact) return { kind: 'open', id: exact.id, total: matches.length, items: [] };
  if (matches.length === 0) return { kind: 'none', id: null, total: 0, items: [] };
  if (matches.length === 1) return { kind: 'open', id: matches[0].id, total: 1, items: [] };

  const sorted = [...matches].sort(
    (a, b) => matchGroup(a.name, term) - matchGroup(b.name, term) || a.id - b.id,
  );
  return { kind: 'list', id: null, total: matches.length, items: sorted.slice(0, limit) };
}
