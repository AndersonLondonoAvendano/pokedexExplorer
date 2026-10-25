import { Pressable, StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../theme/index.js';

// Line above the search results: how many Pokémon matched the term, and the action that goes
// back to the full list. The side margin comes from the container that hosts it.
//
// [CONCEPT] props: the header only receives numbers, the term and the action; it does not know
// where the results come from.
export default function SearchResultsHeader({ term, total, shown, onViewAll }) {
  const status =
    total > shown
      ? STRINGS.resultsStatusCapped(shown, total, term)
      : STRINGS.resultsStatus(total, term);

  return (
    <View style={styles.row}>
      {/* Live region: a new search is announced by screen readers without moving focus. */}
      <Text
        style={styles.status}
        testID="search-results-status"
        accessibilityLiveRegion="polite"
      >
        {status}
      </Text>
      <Pressable
        testID="search-clear"
        onPress={onViewAll}
        accessibilityRole="button"
        accessibilityLabel={STRINGS.viewAllLabel}
        style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
      >
        <Text style={styles.actionText}>{STRINGS.viewAll}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  // The action moves to its own line when the status does not leave room for it.
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: SPACING.md,
  },
  status: {
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
    flexShrink: 1,
    paddingVertical: SPACING.sm,
  },
  action: {
    minHeight: SIZES.touch,
    minWidth: SIZES.touch,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionPressed: {
    backgroundColor: COLORS.surfacePressed,
  },
  actionText: {
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
    textDecorationLine: 'underline',
  },
});
