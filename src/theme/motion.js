import { Easing } from 'react-native';

// Durations in milliseconds and the shared easing curve. Only the detail view moves:
// the shutter reveal of the artwork and then the stat bars.
export const MOTION = {
  reveal: 700, // shutter curtain lifting off the artwork
  revealScaleFrom: 1.12, // artwork scale at the start of the reveal (ends at 1)
  revealFallback: 1500, // start the reveal anyway if the image never reports onLoad
  bars: 520, // each stat bar growing from the left
  barsStagger: 50, // delay between consecutive bars
  easing: Easing.out(Easing.cubic), // fast start, gentle stop
};
