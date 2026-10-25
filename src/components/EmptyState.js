import { StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../theme/index.js';

// No-results block: a clear sentence (it already names the searched term) instead of an empty screen.
// The testID goes on the container so automated checks can find the whole block.
export default function EmptyState({ message, compact = false, testID }) {
  return (
    <View
      style={compact ? styles.compact : styles.full}
      accessibilityLiveRegion="polite"
      testID={testID}
    >
      {/* The alert role makes screen readers announce the result; no line limit, so it scales. */}
      <Text
        style={compact ? styles.compactText : styles.fullText}
        accessibilityRole="alert"
      >
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  // Full block: left-aligned in the upper third of the available area, never centred.
  full: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.stateTop,
  },
  fullText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ink,
    maxWidth: SIZES.messageMax,
  },
  // Compact row: the side margin comes from the container that hosts it (search strip).
  compact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: SPACING.md,
    paddingVertical: SPACING.md,
  },
  compactText: {
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
    flexShrink: 1,
  },
});
