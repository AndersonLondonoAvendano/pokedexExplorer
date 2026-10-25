import { StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { COLORS, SPACING, TABULAR, TYPOGRAPHY } from '../theme/index.js';

// App title with the catalogue size underneath. `total` is a number, or null while the
// API has not answered yet (then only the title shows).
// The side page margin is added by the view that hosts the header, not here, so the
// title lines up with the search field and the grid below it.
export default function Header({ total }) {
  return (
    <View>
      {/* [CONCEPT] Text: in React Native all visible text must live inside a Text component;
          a bare string in a View would crash, and Text is what carries font and accessibility. */}
      {/* No line limit: the title wraps instead of being cut when the text is scaled up. */}
      <Text style={styles.title} accessibilityRole="header">
        {STRINGS.appTitle}
      </Text>
      {total !== null && <Text style={styles.subtitle}>{STRINGS.subtitle(total)}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    ...TYPOGRAPHY.display,
    color: COLORS.ink,
    textAlign: 'left',
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    ...TABULAR,
    color: COLORS.inkMuted,
    marginTop: SPACING.xs,
  },
});
