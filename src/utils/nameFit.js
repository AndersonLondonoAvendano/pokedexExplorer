import { capitalize } from './formatters.js';

// Estimated average width of one bold system-font character, in em. It is a
// constant of this algorithm (a conservative estimate), not a visual token.
const CHAR_EM = 0.62;

// Maximum number of lines a title may use.
const MAX_LINES = 2;

// Splits a name into the pieces where a line break is allowed: only after a
// hyphen (the piece keeps its hyphen) or at a space (the space is dropped).
// 'squawkabilly-blue plumage' -> [{ text: 'squawkabilly-', joiner: '' },
// { text: 'blue', joiner: '' }, { text: 'plumage', joiner: ' ' }].
// `joiner` is what separates the piece from the previous one on the same line.
function splitIntoSegments(name) {
  const segments = [];
  name.split(' ').forEach((word, wordIndex) => {
    const parts = word.split('-');
    parts
      .map((part, partIndex) => (partIndex < parts.length - 1 ? `${part}-` : part))
      .filter((part) => part.length > 0)
      .forEach((part, partIndex) => {
        const joiner = wordIndex > 0 && partIndex === 0 && segments.length > 0 ? ' ' : '';
        segments.push({ text: part, joiner });
      });
  });
  return segments;
}

// True when the segments, placed greedily line by line without exceeding
// `charsPerLine` characters, use at most MAX_LINES lines.
function fitsInLines(segments, charsPerLine) {
  if (charsPerLine < 1) return false;
  let lines = 1;
  let lineLength = 0;
  for (const { text, joiner } of segments) {
    if (text.length > charsPerLine) return false;
    const lengthOnSameLine = lineLength === 0 ? text.length : lineLength + joiner.length + text.length;
    if (lengthOnSameLine <= charsPerLine) {
      lineLength = lengthOnSameLine;
    } else {
      lines += 1;
      lineLength = text.length;
    }
  }
  return lines <= MAX_LINES;
}

// Picks the font size step for a long title so it never wraps past two lines.
//
// Rule: for each size f in `fontSizes` (largest first), estimate how many
// characters fit on one line as C(f) = floor(availableWidth / (CHAR_EM * f * fontScale)),
// where CHAR_EM = 0.62 em is the average width of a bold character and fontScale
// is the system text scale. The capitalized name fits at size f when its segments
// (breaks happen only after a '-' or at spaces, never inside a word) are placed
// line by line without exceeding C(f) characters, no segment is longer than C(f),
// and the result uses 2 lines or fewer.
//
// Returns the index of the FIRST size that fits; if none fits, the last index.
// Example: at availableWidth 320 and fontScale 1.3 with sizes [40, 26, 19],
// C = 9, 15 and 20, so 'Charizard' (9) -> 0 and 'Charmander' (10) -> 1.
export function pickNameStep(name, availableWidth, fontScale, fontSizes) {
  const segments = splitIntoSegments(capitalize(String(name ?? '').trim()));
  for (let index = 0; index < fontSizes.length; index += 1) {
    const charsPerLine = Math.floor(availableWidth / (CHAR_EM * fontSizes[index] * fontScale));
    if (fitsInLines(segments, charsPerLine)) return index;
  }
  return fontSizes.length - 1;
}
