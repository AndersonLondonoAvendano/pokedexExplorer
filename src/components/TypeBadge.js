import { StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { TYPE_LABELS } from '../config/labels.js';
import { SIZES, SPACING, TYPOGRAPHY, typeColorFor } from '../theme/index.js';
import { capitalize } from '../utils/formatters.js';

// A small straight-edged rectangle with the type name written inside. The colour only
// reinforces the name, it never carries the information alone.
//
// Props:
//   name  string, API type name in English (fire, water...). An unknown type shows its
//         name capitalised on the neutral fallback colours.
//
// [CONCEPT] props: the badge is a pure function of `name`; the label and the colours are
// derived from it, so the parent passes one string and nothing else.
export default function TypeBadge({ name }) {
  const label = TYPE_LABELS[name] ?? capitalize(name);
  const colors = typeColorFor(name);

  return (
    <View
      // minHeight (never a fixed height) lets the badge grow when the user enlarges the text.
      // Background and text colours depend on the data, so they are the only inline styles.
      style={[styles.badge, { backgroundColor: colors.background }]}
      accessible
      accessibilityLabel={STRINGS.typeLabel(label)}
      testID={`type-${name}`}
    >
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    minHeight: SIZES.badge,
    paddingHorizontal: SPACING.md,
    justifyContent: 'center',
  },
  label: {
    ...TYPOGRAPHY.caption,
  },
});
