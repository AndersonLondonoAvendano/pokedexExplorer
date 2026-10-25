import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../theme/index.js';

// Loading block: the platform spinner always next to a visible text, never a spinner alone.
// [CONCEPT] props: the component only receives the text to show and its layout variant;
// it knows nothing about the network, so any screen can reuse it for its own request.
export default function LoadingState({ message, compact = false }) {
  return (
    <View
      style={compact ? styles.compact : styles.full}
      accessibilityLiveRegion="polite"
    >
      {/* The spinner is hidden from screen readers on both platforms: the visible text below is
          the only thing announced, and the polite live region on the container covers Android
          while the text covers iOS, so nothing is read twice. */}
      <ActivityIndicator
        size={compact ? 'small' : 'large'}
        color={COLORS.ink}
        importantForAccessibility="no"
        accessibilityElementsHidden
      />
      {/* No line limit and no fixed height, so the text grows with the system font scale. */}
      <Text style={compact ? styles.compactText : styles.fullText}>{message}</Text>
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
    gap: SPACING.md,
  },
  fullText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ink,
    maxWidth: SIZES.messageMax,
  },
  // Compact row: the side margin comes from the container that hosts it (list footer, search strip).
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
