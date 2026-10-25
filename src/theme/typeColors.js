// Flat colour for each of the 18 Pokémon types, keyed by the API type name.
// `text` is chosen for at least 4.5:1 contrast on `background`; `bar` is darkened
// where needed so a stat bar reaches at least 3:1 against its stone track.
// One line per type: the contrast check parses this exact format.
export const TYPE_COLORS = {
  normal: { background: '#A9A399', text: '#1F1E1D', bar: '#807B74' },
  fire: { background: '#E3602F', text: '#1F1E1D', bar: '#CF592D' },
  water: { background: '#2F6DC6', text: '#FFFFFF', bar: '#2F6DC6' },
  electric: { background: '#F1C232', text: '#1F1E1D', bar: '#927829' },
  grass: { background: '#4F9A4A', text: '#1F1E1D', bar: '#4A8E46' },
  ice: { background: '#86CFD6', text: '#1F1E1D', bar: '#5D888C' },
  fighting: { background: '#B83C2C', text: '#FFFFFF', bar: '#B83C2C' },
  poison: { background: '#8E4A9C', text: '#FFFFFF', bar: '#8E4A9C' },
  ground: { background: '#CFA25A', text: '#1F1E1D', bar: '#9A7A48' },
  flying: { background: '#8EA6E6', text: '#1F1E1D', bar: '#6D7DAA' },
  psychic: { background: '#E2557F', text: '#1F1E1D', bar: '#CE5075' },
  bug: { background: '#93AE2E', text: '#1F1E1D', bar: '#708329' },
  rock: { background: '#AE9650', text: '#1F1E1D', bar: '#917E46' },
  ghost: { background: '#584A86', text: '#FFFFFF', bar: '#584A86' },
  dragon: { background: '#4458C8', text: '#FFFFFF', bar: '#4458C8' },
  dark: { background: '#4A3F38', text: '#FFFFFF', bar: '#4A3F38' },
  steel: { background: '#8EA1AE', text: '#1F1E1D', bar: '#72808A' },
  fairy: { background: '#E9A2C6', text: '#1F1E1D', bar: '#986D82' },
};

// Neutral fallback for a type name the app does not know yet.
export const DEFAULT_TYPE_COLOR = { background: '#A9A399', text: '#1F1E1D', bar: '#807B74' };

// Returns the colours for an API type name, or the neutral fallback.
export const typeColorFor = (name) => TYPE_COLORS[name] ?? DEFAULT_TYPE_COLOR;
