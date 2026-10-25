import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import PokemonListView from './PokemonListView.js';

// Single screen of the app. Without a navigation library, it switches between the list and the
// detail view by itself, based on which Pokémon is selected.
export default function HomeScreen() {
  // [CONCEPT] useState: null means "show the list"; a number means "show the detail of that id".
  // Keeping it here lets the list keep its scroll position while the detail is open.
  const [selectedPokemonId, setSelectedPokemonId] = useState(null);

  return (
    // [CONCEPT] View: the basic layout container; it fills the safe area so later content can grow.
    <View style={styles.container}>
      <PokemonListView onSelectPokemon={setSelectedPokemonId} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
