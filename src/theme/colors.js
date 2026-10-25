// App palette: warm stone neutrals, one tinted ink and a single sage accent.
// Saturated colour lives only in the data (artwork and type colours).
export const COLORS = {
  ground: '#EEECEA', // app background and status bar area
  surface: '#E4E1DD', // search field, stat bar track, tile A
  field: '#CDC3B6', // tile C (only full ink text on top of it)
  sage: '#D6D9CF', // tile B
  stone4: '#DCD6CF', // tile D
  surfacePressed: '#D5D2CF', // each *Pressed tone is one step darker, shown while a tile is held
  sagePressed: '#C8CBC2',
  fieldPressed: '#C0B7AB',
  stone4Pressed: '#CEC8C2',
  ink: '#2B2A29', // main text and half of the specimen tags
  inkMuted: '#615D59', // secondary text, only on ground or surface
  onInk: '#EEECEA', // text on an ink tag
  accent: '#4F5E48', // action buttons and the other half of the specimen tags
  onAccent: '#FFFFFF', // text on an accent tag
  typeInkDark: '#1F1E1D', // dark text on light type colours
  typeInkLight: '#FFFFFF', // light text on dark type colours
};

// Four tile/tag pairs that rotate through the grid. With two columns, no
// neighbouring tile (side by side or stacked) repeats a colour.
export const SPECIMEN_PAIRS = [
  { tile: COLORS.surface, tilePressed: COLORS.surfacePressed, tag: COLORS.ink, tagText: COLORS.onInk }, // A
  { tile: COLORS.sage, tilePressed: COLORS.sagePressed, tag: COLORS.accent, tagText: COLORS.onAccent }, // B
  { tile: COLORS.field, tilePressed: COLORS.fieldPressed, tag: COLORS.accent, tagText: COLORS.onAccent }, // C
  { tile: COLORS.stone4, tilePressed: COLORS.stone4Pressed, tag: COLORS.ink, tagText: COLORS.onInk }, // D
];

// Picks the colour pair for the tile at a given list position.
export const pairFor = (index) => SPECIMEN_PAIRS[index % SPECIMEN_PAIRS.length];
