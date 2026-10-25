import { useCallback, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { COLORS } from '../theme/index.js';
import PokemonDetailView from './PokemonDetailView.js';
import PokemonListView from './PokemonListView.js';

// Single screen of the app. Without a navigation library, it switches between the list and the
// detail view by itself, based on which Pokémon is selected.
export default function HomeScreen() {
  // [CONCEPT] useState: null means "show the list"; a number means "show the detail of that id".
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  // [CONCEPT] useCallback: keeps the same function identity across renders, so the detail view's
  // back-button effect does not unsubscribe and resubscribe on every render of this screen.
  const handleBack = useCallback(() => setSelectedPokemonId(null), []);

  const isDetailOpen = selectedPokemonId !== null;

  return (
    // [CONCEPT] View: the basic layout container; it fills the safe area so later content can grow.
    <View style={styles.container}>
      {/* The list stays mounted at full size while the detail is open. Unmounting it would lose
          the scroll position and request the first page again on return, and keeping it mounted
          this way does not depend on how each platform treats a view hidden with
          display: 'none'. The detail is drawn on top with an opaque background, and the covered
          list is removed from touches and screen readers so it cannot be reached. */}
      <View
        style={styles.listLayer}
        pointerEvents={isDetailOpen ? 'none' : 'auto'}
        importantForAccessibility={isDetailOpen ? 'no-hide-descendants' : 'auto'}
        accessibilityElementsHidden={isDetailOpen}
      >
        <PokemonListView onSelectPokemon={setSelectedPokemonId} />
      </View>
      {isDetailOpen ? (
        // Mounted only while open: its entrance runs once per opening and its request is
        // cancelled when it unmounts. The key remounts it if a different id ever arrives.
        <View style={styles.detailLayer}>
          <PokemonDetailView
            key={selectedPokemonId}
            pokemonId={selectedPokemonId}
            onBack={handleBack}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listLayer: {
    flex: 1,
  },
  detailLayer: {
    // Covers the whole area on top of the list.
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.ground,
  },
});
