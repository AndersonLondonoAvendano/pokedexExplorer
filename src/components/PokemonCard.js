import { memo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { STRINGS } from '../config/strings.js';
import { SIZES, SPACING, SPECIMEN_PAIRS, TABULAR, TYPOGRAPHY } from '../theme/index.js';
import { capitalize, formatPokemonNumber } from '../utils/formatters.js';

// One colour specimen: a square tile with the artwork and, glued under it, a tag with
// the catalogue number and the name. The whole piece (square + tag) is the touch target.
//
// Props:
//   id        number, Pokédex id (shown as #025 and used in the testID)
//   name      string, API name in lowercase
//   imageUrl  string, remote artwork URL
//   pair      one entry of SPECIMEN_PAIRS (tile, tag and text colours); chosen by the list
//   tileSize  number, side of the square tile in dp (also the width of the whole piece)
//   onPress   function, called with the id when the piece is pressed
//   style     optional extra style from the parent (the list uses it to offset a column)
//
// [CONCEPT] React.memo: a long list re-renders every time a page arrives. With stable props
// (the list keeps onPress stable and the pair depends only on the position) a piece that did
// not change skips rendering, which keeps scrolling smooth.
function PokemonCard({ id, name, imageUrl, pair, tileSize, onPress, style }) {
  const pairStyles = PAIR_STYLES.get(pair);
  const artSize = Math.round(tileSize * SIZES.artTile);

  return (
    <Pressable
      // The pressed tone replaces the resting one in the same frame: no animation, no fade.
      style={({ pressed }) => [
        pressed ? pairStyles.tilePressed : pairStyles.tile,
        { width: tileSize },
        style,
      ]}
      onPress={() => onPress(id)}
      accessibilityRole="button"
      accessibilityLabel={STRINGS.cardLabel(capitalize(name), id)}
      testID={`pokemon-card-${id}`}
    >
      <View style={[styles.art, { width: tileSize, height: tileSize }]}>
        {/* [CONCEPT] Image: a remote image has no intrinsic size until it downloads, so width and
            height are always set (React Native cannot lay it out otherwise). `contain` shows
            the whole artwork, never cropped, at the same apparent scale in every tile. */}
        <Image
          source={{ uri: imageUrl }}
          width={artSize}
          height={artSize}
          style={{ width: artSize, height: artSize }}
          resizeMode="contain"
        />
      </View>
      {/* The tag has no fixed height and no line limit: it grows with its content,
          so a long name wraps to a new line instead of being cut. */}
      <View style={[styles.tag, pairStyles.tag]}>
        <Text style={[styles.number, TABULAR, pairStyles.tagText]}>
          {formatPokemonNumber(id)}
        </Text>
        <Text style={[styles.name, pairStyles.tagText]}>{capitalize(name)}</Text>
      </View>
    </Pressable>
  );
}

export default memo(PokemonCard);

// One small StyleSheet per colour pair, built once when the module loads, so colours
// never go through inline style objects while the list renders.
const PAIR_STYLES = new Map(
  SPECIMEN_PAIRS.map((pair) => [
    pair,
    StyleSheet.create({
      tile: { backgroundColor: pair.tile },
      tilePressed: { backgroundColor: pair.tilePressed },
      tag: { backgroundColor: pair.tag },
      tagText: { color: pair.tagText },
    }),
  ]),
);

const styles = StyleSheet.create({
  // Artwork centred in the square: the only centred element in the app.
  art: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Sits directly under the square with no gap; its height comes from the text inside.
  tag: {
    padding: SPACING.md,
  },
  number: {
    ...TYPOGRAPHY.caption,
  },
  name: {
    ...TYPOGRAPHY.title,
  },
});
