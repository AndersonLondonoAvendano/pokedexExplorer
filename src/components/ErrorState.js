import { Button, StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../theme/index.js';

// Error block: a plain Spanish sentence that says what happened and what to do, plus a retry action.
// The message always comes from the strings file, so no technical detail ever reaches the user.
export default function ErrorState({ message, onRetry, compact = false }) {
  return (
    <View
      style={compact ? styles.compact : styles.full}
      accessibilityLiveRegion="polite"
    >
      {/* The alert role makes screen readers announce the failure as soon as it appears. */}
      <Text
        style={compact ? styles.compactText : styles.fullText}
        accessibilityRole="alert"
      >
        {message}
      </Text>
      {/* [CONCEPT] Button: the core Button is enough for a simple text action; it keeps the
          platform's own size and look, and its title doubles as the accessible label. */}
      <Button
        title={STRINGS.retryButton}
        onPress={onRetry}
        color={COLORS.accent}
        testID="retry-button"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  // Full block: message on top, retry button below it, all left-aligned and never centred.
  full: {
    flex: 1,
    alignItems: 'flex-start',
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.stateTop,
    gap: SPACING.lg,
  },
  fullText: {
    ...TYPOGRAPHY.heading,
    color: COLORS.ink,
    maxWidth: SIZES.messageMax,
  },
  // Compact row: the button sits to the right of the message and wraps below it when it does not fit.
  // The side margin comes from the container that hosts it.
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
