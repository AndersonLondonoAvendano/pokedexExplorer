import { useCallback, useRef, useState } from 'react';
import { FlatList, Keyboard, StyleSheet, useWindowDimensions, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import EmptyState from '../components/EmptyState.js';
import ErrorState from '../components/ErrorState.js';
import Header from '../components/Header.js';
import ListFooter from '../components/ListFooter.js';
import LoadingState from '../components/LoadingState.js';
import PokemonCard from '../components/PokemonCard.js';
import SearchBar from '../components/SearchBar.js';
import SearchResultsHeader from '../components/SearchResultsHeader.js';
import { usePokemonList } from '../hooks/usePokemonList.js';
import { usePokemonSearch } from '../hooks/usePokemonSearch.js';
import { COLORS, SPACING, pairFor } from '../theme/index.js';

// Paginated Pokédex list: the first-page state (under the title) or the two-column
// grid, whose list header holds the title and scrolls with it.
// `onSelectPokemon` is called with the id of the pressed piece.
export default function PokemonListView({ onSelectPokemon }) {
  const { status, retry, items, total, footerStatus, loadMore } = usePokemonList();

  // [CONCEPT] useState: the text of the search field lives here, and it is kept when a piece is
  // pressed or a search ends.
  const [text, setText] = useState('');
  // A found Pokémon opens its detail through the same callback as a pressed piece.
  const {
    status: searchStatus,
    retry: retrySearch,
    lastQuery,
    results,
    search,
    reset: resetSearch,
    clearResults,
  } = usePokemonSearch({ onFound: onSelectPokemon });

  // Pressing a piece always cancels any search first, then opens the detail.
  const handleSelectPiece = useCallback(
    (id) => {
      resetSearch();
      onSelectPokemon(id);
    },
    [resetSearch, onSelectPokemon],
  );

  // A result opens its detail too, but the results stay open underneath, so going back to the
  // list finds them as they were. The keyboard is closed first so the first touch is not lost.
  const handleSelectResult = useCallback(
    (id) => {
      Keyboard.dismiss();
      resetSearch();
      onSelectPokemon(id);
    },
    [resetSearch, onSelectPokemon],
  );

  // An emptied field with results open goes back to the full list.
  const handleChangeText = useCallback(
    (value) => {
      setText(value);
      if (results && value.trim() === '') clearResults();
    },
    [results, clearResults],
  );

  // While the search strip shows its error it owns the only retry button (the list footer drops its own).
  const searchFailed = searchStatus === 'error';
  const firstPageFailed = status === 'error';

  // When both fail, the big block owns the only retry button, so it repeats both requests.
  const retryFirstPage = useCallback(() => {
    retry();
    if (searchFailed) retrySearch();
  }, [retry, retrySearch, searchFailed]);

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
        onPress={handleSelectPiece}
        style={index % 2 === 1 ? styles.staggered : undefined}
      />
    ),
    [tileSize, handleSelectPiece],
  );

  const renderResult = useCallback(
    ({ item, index }) => (
      <PokemonCard
        id={item.id}
        name={item.name}
        imageUrl={item.imageUrl}
        pair={pairFor(index)}
        tileSize={tileSize}
        onPress={handleSelectResult}
        style={index % 2 === 1 ? styles.staggered : undefined}
      />
    ),
    [tileSize, handleSelectResult],
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
          <ErrorState message={STRINGS.errorGeneric} onRetry={retryFirstPage} />
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
          ListFooterComponent={(
            <ListFooter footerStatus={footerStatus} onRetry={searchFailed ? undefined : retry} />
          )}
          keyboardShouldPersistTaps="handled"
          columnWrapperStyle={styles.row}
          ItemSeparatorComponent={RowSeparator}
          contentContainerStyle={styles.content}
        />
      );
  }

  // Fixed zone above the list and outside the header, so the field stays visible while the
  // header scrolls away. The strip below the field shows the search state.
  let strip = null;
  switch (searchStatus) {
    case 'loading':
      strip = <LoadingState compact message={STRINGS.loadingSearch} />;
      break;
    case 'empty':
      strip = (
        <EmptyState compact testID="search-empty" message={STRINGS.searchNotFound(lastQuery)} />
      );
      break;
    case 'error':
      // The message is not drawn twice: the strip stays out while the first-page error block shows it.
      strip = firstPageFailed ? null : (
        <ErrorState compact message={STRINGS.errorGeneric} onRetry={retrySearch} />
      );
      break;
    default:
      strip = null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchZone}>
        <SearchBar value={text} onChangeText={handleChangeText} onSearch={search} />
        {strip ? <View style={styles.strip}>{strip}</View> : null}
        {results ? (
          <View style={styles.resultsHeader}>
            <SearchResultsHeader
              term={results.term}
              total={results.total}
              shown={results.items.length}
              onViewAll={clearResults}
            />
          </View>
        ) : null}
      </View>
      <View style={styles.body}>
        {/* The main list stays mounted under the results, so its scroll and pages are kept; while
            the results are open it is out of reach of touches and screen readers. */}
        <View
          style={styles.fill}
          pointerEvents={results ? 'none' : 'auto'}
          importantForAccessibility={results ? 'no-hide-descendants' : 'auto'}
          accessibilityElementsHidden={Boolean(results)}
        >
          {content}
        </View>
        {results ? (
          <View style={styles.resultsLayer}>
            {/* The second grid has no onEndReached: the matches are already all in memory.
                The key restarts its scroll when a new set of results replaces the old one. */}
            <FlatList
              key={results.version}
              testID="search-results-list"
              data={results.items}
              numColumns={2}
              keyExtractor={keyExtractor}
              renderItem={renderResult}
              ListFooterComponent={<View style={styles.resultsFooter} />}
              keyboardShouldPersistTaps="handled"
              columnWrapperStyle={styles.row}
              ItemSeparatorComponent={RowSeparator}
              contentContainerStyle={styles.content}
            />
          </View>
        ) : null}
      </View>
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
  // Fixed search zone: page margin on the sides, space before the title or the grid.
  searchZone: {
    marginHorizontal: SPACING.page,
    paddingBottom: SPACING.lg,
  },
  strip: {
    marginTop: SPACING.sm,
  },
  resultsHeader: {
    marginTop: SPACING.sm,
  },
  // Holds the main list and the results layer, below the fixed search zone.
  body: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  resultsLayer: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.ground,
  },
  // Same clearance under the last row as the main list footer (the right column is pushed down).
  resultsFooter: {
    marginTop: SPACING.stagger + SPACING.md,
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
    // Each tile keeps its own height, so a two-line name does not stretch its neighbour.
    alignItems: 'flex-start',
  },
  separator: {
    height: SPACING.md,
  },
  // Right column sits lower than the left one.
  staggered: {
    transform: [{ translateY: SPACING.stagger }],
  },
});
