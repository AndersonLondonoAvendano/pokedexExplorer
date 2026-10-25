// Five type sizes, far apart, on the system font (SF Pro on iOS, Roboto on Android),
// so no fontFamily is set. Heavy weights and negative tracking on the large sizes.
// Values are in dp; fontWeight is a string, as React Native expects.
export const TYPOGRAPHY = {
  display: { fontSize: 40, fontWeight: '900', lineHeight: 42, letterSpacing: -1.2 }, // app title, name on the detail view
  heading: { fontSize: 26, fontWeight: '800', lineHeight: 30, letterSpacing: -0.6 }, // height and weight figures, long names
  title: { fontSize: 19, fontWeight: '700', lineHeight: 24, letterSpacing: -0.2 }, // tag name, section title, state messages
  body: { fontSize: 16, fontWeight: '400', lineHeight: 23, letterSpacing: 0 }, // subtitle, search field, stat names
  caption: { fontSize: 13, fontWeight: '600', lineHeight: 18, letterSpacing: 0.1 }, // tag number, type badges, measure labels
};

// Fixed-width digits for every number (ids, stat values, measures, totals),
// so figures line up and do not jump when they change.
export const TABULAR = { fontVariant: ['tabular-nums'] };
