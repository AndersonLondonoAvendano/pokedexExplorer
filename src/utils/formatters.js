// Pure formatting helpers. They build every string by hand instead of relying on
// the device locale, so the output is identical on every phone.

// Formats a Pokédex id as a three-digit catalogue number: 25 -> '#025'.
export function formatPokemonNumber(id) {
  // [CONCEPT] padStart: fills the id with leading zeros so every number has at least three digits (#001, #025, #150).
  return `#${String(id).padStart(3, '0')}`;
}

// Uppercases the first letter: 'pikachu' -> 'Pikachu'.
export function capitalize(text) {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1);
}

// Reads the numeric id at the end of a resource URL:
// 'https://pokeapi.co/api/v2/pokemon/25/' -> 25. Returns null if there is none.
export function extractIdFromUrl(url) {
  const match = /\/(\d+)\/?$/.exec(String(url ?? ''));
  return match ? Number(match[1]) : null;
}

// Trims and lowercases a search term; a digits-only term loses its leading zeros
// so it matches the API id: '  PiKaChu ' -> 'pikachu', ' 025 ' -> '25'.
export function normalizeQuery(query) {
  const cleaned = String(query ?? '').trim().toLowerCase();
  return /^\d+$/.test(cleaned) ? String(Number(cleaned)) : cleaned;
}

// True when the term is made only of digits (after trimming spaces).
export function isNumericQuery(query) {
  return /^\d+$/.test(String(query ?? '').trim());
}

// The API reports height in decimeters: 4 -> 0.4 meters.
export function decimetersToMeters(decimeters) {
  return decimeters / 10;
}

// The API reports weight in hectograms: 60 -> 6 kilograms.
export function hectogramsToKilograms(hectograms) {
  return hectograms / 10;
}

// Spanish (Colombia) number format with at most one decimal:
// thousands with a dot and decimals with a comma, dropping a trailing ',0'.
// 1351 -> '1.351', 0.4 -> '0,4', 90.5 -> '90,5', 6 -> '6'.
export function formatNumber(value) {
  const rounded = Math.round(value * 10) / 10;
  const [integerPart, decimalPart] = Math.abs(rounded).toFixed(1).split('.');
  const sign = rounded < 0 ? '-' : '';
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return decimalPart === '0'
    ? `${sign}${withThousands}`
    : `${sign}${withThousands},${decimalPart}`;
}

// Number followed by a space and its unit: (1.7, 'm') -> '1,7 m'.
export function formatMeasure(value, unit) {
  return `${formatNumber(value)} ${unit}`;
}

// Turns the spaces inside an already normalized search term into hyphens, the
// way the API writes multi-word names: 'mr mime' -> 'mr-mime', 'mime  jr' -> 'mime-jr'.
// It does not trim or lowercase; call normalizeQuery first.
export function hyphenateSpaces(term) {
  return term.replace(/\s+/g, '-');
}
