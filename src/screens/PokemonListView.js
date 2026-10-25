import { useCallback, useRef } from 'react';
import { FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import ErrorState from '../components/ErrorState.js';
import Header from '../components/Header.js';
import ListFooter from '../components/ListFooter.js';
import LoadingState from '../components/LoadingState.js';
import PokemonCard from '../components/PokemonCard.js';
import { usePokemonList } from '../hooks/usePokemonList.js';
import { SPACING, pairFor } from '../theme/index.js';

// Paginated Pokédex list: the first-page state (under the title) or the two-column
// grid, whose list header holds the title and scrolls with it.
// `onSelectPokemon` is called with the id of the pressed piece.
export default function PokemonListView({ onSelectPokemon }) {
  const { status, retry, items, total, footerStatus, loadMore } = usePokemonList();

  // [CONCEPT] useWindowDimensions: the width is read from the screen so the two tiles fill the row
  // on any phone, and it updates by itself when the window changes size.
  const { width } = useWindowDimensions();
  const tileSize = Math.floor((width - 2 * SPACING.page - SPACING.md) / 2);

  // [CONCEPT] keyExtractor: gives each row a stable key (the Pokémon id), so the list can
  // reuse rows when pages are appended instead of re-creating them.
  const keyExtractor = useCallback((item) => String(item.id), []);

  const renderItem = useCallback(
    ({ item, index }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        imageUrl={item.imageUrl}
        pair={pairFor(index)}
        tileSize={tileSize}
        onPress={onSelectPokemon}
        style={index % 2 === 1 ? styles.staggered : undefined}
      />
    ),
    [tileSize, onSelectPokemon],
  );

  // [CONCEPT] useRef: the ref holds the FlatList instance so its imperative scrollToEnd method
  // can be called without re-rendering the screen (a ref change does not trigger a render).
  const listRef = useRef(null);

  // The footer grows when it switches from the loading line to the error block, but it only
  // measures its new height after it has rendered. An effect on footerStatus would run before
  // that measurement and could scroll to the old end. onContentSizeChange fires once the content
  // has really grown, so message and retry button end up in view. It only acts while the footer
  // shows the error, and the content size no longer changes then, so it never takes the scroll
  // back from a user who scrolls up afterwards.
  const handleContentSizeChange = useCallback(() => {
    if (footerStatus === 'error') {
      listRef.current?.scrollToEnd({ animated: false });
    }
  }, [footerStatus]);

  // Built once per render and used in both places: inside the list (scrolls away with it) and
  // above the full first-page states (where there is no list).
  const header = <Header total={total} />;

  let content;
  switch (status) {
    case 'loading':
      content = (
        <>
          <View style={styles.stateHeader}>{header}</View>
          <LoadingState message={STRINGS.loadingList} />
        </>
      );
      break;
    case 'error':
      content = (
        <>
          <View style={styles.stateHeader}>{header}</View>
          <ErrorState message={STRINGS.errorGeneric} onRetry={retry} />
        </>
      );
      break;
    default:
      content = (
        // [CONCEPT] FlatList: renders only the rows near the screen, so hundreds of Pokémon stay
        // light. [CONCEPT] numColumns: 2 lays the items out as a grid of two columns.
        // [CONCEPT] onEndReached: asks the hook for the next page when the user scrolls near
        // the end, which gives the endless scroll.
        <FlatList
          ref={listRef}
          testID="pokemon-list"
          onContentSizeChange={handleContentSizeChange}
          data={items}
          numColumns={2}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={<View style={styles.listHeader}>{header}</View>}
          ListFooterComponent={<ListFooter footerStatus={footerStatus} onRetry={retry} />}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={RowSeparator}
          contentContainerStyle={styles.content}
        />
      );
  }

  // The search field will sit fixed ABOVE the list, outside the header, so it stays visible
  // while the header scrolls away.
  return (
    <View style={styles.container}>
      {content}
    </View>
  );
}

function RowSeparator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  // Inside the list the side margin comes from the content container; the bottom padding is
  // the space between the subtitle and the grid.
  listHeader: {
    paddingBottom: SPACING.xl,
  },
  // Above a full state there is no list, so the header carries the page margin itself; the
  // space below it is the state's own top offset.
  stateHeader: {
    paddingHorizontal: SPACING.page,
  },
  content: {
    paddingHorizontal: SPACING.page,
    paddingBottom: SPACING.xxxl,
  },
  row: {
    gap: SPACING.md,
  },
  separator: {
    height: SPACING.md,
  },
  // Right column sits lower than the left one.
  staggered: {
    transform: [{ translateY: SPACING.stagger }],
  },
});
