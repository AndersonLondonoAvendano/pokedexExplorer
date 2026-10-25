import { Button, Keyboard, StyleSheet, TextInput, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { COLORS, SIZES, SPACING, TYPOGRAPHY } from '../theme/index.js';

// Search row: the text field and the native button. The text lives in the parent, which also
// owns the search; this component only reports typing and submitting.
export default function SearchBar({ value, onChangeText, onSearch }) {
  // Both the keyboard key and the button end here: the keyboard closes first so the result or
  // the state strip below is not hidden behind it, then the search starts.
  const handleSubmit = () => {
    // [CONCEPT] Keyboard: Keyboard.dismiss() closes the on-screen keyboard from code once the
    // user has submitted, so the answer is visible.
    Keyboard.dismiss();
    onSearch(value);
  };

  return (
    <View style={styles.row}>
      {/* [CONCEPT] TextInput: the native text field where the user types the name or number.
          [CONCEPT] controlled input: value and onChangeText come from the parent, so React state
          is the single source of truth for the text and the field never holds a hidden copy. */}
      <TextInput
        style={styles.input}
        testID="search-input"
        value={value}
        onChangeText={onChangeText}
        placeholder={STRINGS.searchPlaceholder}
        placeholderTextColor={COLORS.inkMuted}
        accessibilityLabel={STRINGS.searchLabel}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={handleSubmit}
      />
      {/* Native Button: the platform draws and sizes it, so it is not wrapped or restyled. */}
      <Button
        title={STRINGS.searchButton}
        color={COLORS.accent}
        onPress={handleSubmit}
        testID="search-button"
        accessibilityLabel={STRINGS.searchButton}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    minHeight: SIZES.input,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
  },
});
