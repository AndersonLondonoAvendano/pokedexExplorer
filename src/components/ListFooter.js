import { StyleSheet, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { SPACING } from '../theme/index.js';
import ErrorState from './ErrorState.js';
import LoadingState from './LoadingState.js';

// End of the list: shows the state of the next page request. The container is always mounted
// (also when idle, with no content) so the space under the last row never jumps.
// The side margin comes from the list's content container, not from this footer.
//
// [CONCEPT] props: the footer only receives the status and the retry action; it does not know
// how pages are fetched, so the list view decides when to show it and what retry means.
export default function ListFooter({ footerStatus, onRetry }) {
  return (
    <View style={styles.container} testID="list-footer">
      {footerStatus === 'loading' && (
        <LoadingState compact message={STRINGS.loadingMore} />
      )}
      {footerStatus === 'error' && (
        <ErrorState compact message={STRINGS.errorGeneric} onRetry={onRetry} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // The right column is pushed down by the stagger, so the footer clears it plus one gap.
    marginTop: SPACING.stagger + SPACING.md,
  },
});
