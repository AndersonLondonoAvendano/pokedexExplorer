// Spacing scale in dp. Inside a block 8 to 16; between blocks 24 to 48.
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12, // gap between grid columns and rows, tag padding
  lg: 16,
  page: 20, // left and right page margin on every screen
  xl: 24,
  xxl: 32,
  xxxl: 48, // single bottom padding at the end of the list
  stagger: 40, // downward offset of the right grid column
  stateTop: 48, // top offset of full-screen loading and error blocks
};

// Component sizes in dp, plus two ratios relative to their container.
export const SIZES = {
  touch: 48, // minimum touch target of custom controls
  input: 48, // minimum height of the search field
  badge: 32, // minimum height of a type badge
  bar: 10, // height of a stat bar
  fieldMax: 360, // maximum height of the colour field on the detail view
  artTile: 0.78, // artwork size as a fraction of the tile side
  artField: 0.8, // artwork size as a fraction of the detail field height
  statName: 116, // width of the stat name column
  statValue: 44, // width of the stat value column
  messageMax: 320, // maximum width of a state message
};
