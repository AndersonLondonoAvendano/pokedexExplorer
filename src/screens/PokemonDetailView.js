import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated,
  BackHandler,
  Button,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import ErrorState from '../components/ErrorState.js';
import LoadingState from '../components/LoadingState.js';
import StatBar from '../components/StatBar.js';
import TypeBadge from '../components/TypeBadge.js';
import { STRINGS } from '../config/strings.js';
import { usePokemonDetail } from '../hooks/usePokemonDetail.js';
import { useReduceMotion } from '../hooks/useReduceMotion.js';
import { COLORS, MOTION, SIZES, SPACING, TABULAR, TYPOGRAPHY, typeColorFor } from '../theme/index.js';
import { capitalize, formatMeasure, formatPokemonNumber } from '../utils/formatters.js';
import { pickNameStep } from '../utils/nameFit.js';

// The three sizes a name may use, largest first; pickNameStep chooses one so a long name
// never needs more than two lines.
const NAME_STEPS = [TYPOGRAPHY.display, TYPOGRAPHY.heading, TYPOGRAPHY.title];
const NAME_FONT_SIZES = NAME_STEPS.map((step) => step.fontSize);

// Detail view of one Pokémon: a top bar with "back", and below it the loading state, the error
// state or the full sheet. `onBack` is called when the user leaves the sheet.
export default function PokemonDetailView({ pokemonId, onBack }) {
  const { status, retry, pokemon } = usePokemonDetail(pokemonId);
  const reduceMotion = useReduceMotion();

  // [CONCEPT] useWindowDimensions: the field height and the name size depend on the screen width
  // and on the system font scale, and both update by themselves when they change.
  const { width, fontScale } = useWindowDimensions();
  const fieldHeight = Math.min(width, SIZES.fieldMax);

  // [CONCEPT] useRef: the two animated values and the "already revealed" flag must survive
  // re-renders, and changing them must not re-render the view. The curtain starts covering the
  // artwork (0) and the artwork starts slightly enlarged.
  const curtain = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(MOTION.revealScaleFrom)).current;
  const revealedRef = useRef(false);
  const revealAnimationRef = useRef(null);
  // Lets the stable `reveal` callback read the current field height without depending on it.
  const fieldHeightRef = useRef(fieldHeight);
  fieldHeightRef.current = fieldHeight;

  // [CONCEPT] useState: the bars wait for this flag so they are not seen full under the curtain.
  const [barsReady, setBarsReady] = useState(false);

  // Lifts the curtain and settles the artwork, once. Stable, because it reads only refs and setters.
  const reveal = useCallback(() => {
    if (revealedRef.current) return;
    revealedRef.current = true;
    // [CONCEPT] Animated: two timings run together. useNativeDriver moves the work to the UI thread,
    // which is possible because only transforms change (translateY and scale), never layout.
    const animation = Animated.parallel([
      Animated.timing(curtain, {
        toValue: -fieldHeightRef.current,
        duration: MOTION.reveal,
        easing: MOTION.easing,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: MOTION.reveal,
        easing: MOTION.easing,
        useNativeDriver: true,
      }),
    ]);
    revealAnimationRef.current = animation;
    animation.start(({ finished }) => {
      if (finished) setBarsReady(true);
    });
  }, [curtain, scale]);

  // [CONCEPT] useEffect: safety net. If the image never reports onLoad, the reveal still happens
  // after a delay, so the artwork is never left hidden. The cleanup cancels the pending timer.
  useEffect(() => {
    if (status !== 'success') return undefined;
    const timer = setTimeout(reveal, MOTION.revealFallback);
    return () => clearTimeout(timer);
  }, [status, reveal]);

  // [CONCEPT] useEffect: "Reduce motion" is read asynchronously and starts as false, so this runs
  // again when it turns true: it stops any reveal in progress and jumps to the final state.
  useEffect(() => {
    if (!reduceMotion) return;
    if (revealAnimationRef.current) revealAnimationRef.current.stop();
    revealedRef.current = true;
    curtain.setValue(-fieldHeight);
    scale.setValue(1);
    setBarsReady(true);
  }, [reduceMotion, fieldHeight, curtain, scale]);

  // [CONCEPT] useEffect: the Android hardware Back button returns to the list instead of closing the
  // app. The cleanup removes the listener when the view unmounts or `onBack` changes.
  useEffect(() => {
    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      onBack();
      return true;
    });
    return () => subscription.remove();
  }, [onBack]);

  let content;
  switch (status) {
    case 'loading':
      content = <LoadingState message={STRINGS.loadingDetail} />;
      break;
    case 'error':
      content = <ErrorState message={STRINGS.errorGeneric} onRetry={retry} />;
      break;
    default: {
      const typeColor = typeColorFor(pokemon.types[0]);
      const artSize = Math.round(fieldHeight * SIZES.artField);
      const nameStyle =
        NAME_STEPS[pickNameStep(pokemon.name, width - 2 * SPACING.page, fontScale, NAME_FONT_SIZES)];
      content = (
        // [CONCEPT] ScrollView: the sheet is a short, fixed set of blocks, so a plain scrolling
        // container is enough; a FlatList is only needed for long, repeated data.
        <ScrollView testID="pokemon-detail" contentContainerStyle={styles.scrollContent}>
          {/* The field keeps its height from the first frame, so loading the image moves nothing. */}
          <View style={[styles.field, { height: fieldHeight, backgroundColor: typeColor.background }]}>
            <Animated.Image
              source={{ uri: pokemon.imageUrl }}
              accessibilityLabel={capitalize(pokemon.name)}
              style={{ width: artSize, height: artSize, transform: [{ scale }] }}
              resizeMode="contain"
              onLoad={reveal}
            />
            <Animated.View
              pointerEvents="none"
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: typeColor.background, transform: [{ translateY: curtain }] },
              ]}
            />
          </View>

          {/* Sibling of the field, outside it: the curtain never covers it and it is visible from the first frame. */}
          <View style={styles.tag}>
            <Text style={styles.number}>{formatPokemonNumber(pokemon.id)}</Text>
            <Text accessibilityRole="header" style={[styles.name, nameStyle]}>{capitalize(pokemon.name)}</Text>
          </View>

          <View style={styles.body}>
            <View style={styles.badges}>
              {pokemon.types.map((type) => (
                <TypeBadge key={type} name={type} />
              ))}
            </View>

            <View style={styles.measures}>
              <View>
                <Text style={styles.measureValue}>
                  {formatMeasure(pokemon.heightMeters, STRINGS.meters)}
                </Text>
                <Text style={styles.measureLabel}>{STRINGS.heightLabel}</Text>
              </View>
              <View>
                <Text style={styles.measureValue}>
                  {formatMeasure(pokemon.weightKilograms, STRINGS.kilograms)}
                </Text>
                <Text style={styles.measureLabel}>{STRINGS.weightLabel}</Text>
              </View>
            </View>

            <View style={styles.stats}>
              <Text accessibilityRole="header" style={styles.statsTitle}>{STRINGS.statsTitle}</Text>
              <View style={styles.statRows}>
                {pokemon.stats.map((stat, index) => (
                  <StatBar
                    key={stat.name}
                    name={stat.name}
                    value={stat.value}
                    color={typeColor.bar}
                    delay={MOTION.barsStagger * index}
                    ready={barsReady}
                    animate={!reduceMotion}
                  />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }
  }

  return (
    <View style={styles.container}>
      {/* Always present, also while loading or after an error, so there is always a way out. */}
      <View style={styles.topBar}>
        <Button
          title={STRINGS.backButton}
          color={COLORS.ink}
          onPress={onBack}
          testID="back-button"
        />
      </View>
      {content}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: SPACING.page,
    paddingVertical: SPACING.sm,
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
  },
  // Full-bleed colour field; it clips the curtain and the enlarged artwork to its own box.
  field: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    paddingHorizontal: SPACING.page,
    paddingTop: SPACING.xxl,
    gap: SPACING.xxl,
  },
  // Full-bleed ink label directly under the field; it grows with its content (no fixed height).
  tag: {
    backgroundColor: COLORS.ink,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.page,
  },
  name: {
    color: COLORS.onInk,
  },
  number: {
    ...TYPOGRAPHY.caption,
    ...TABULAR,
    color: COLORS.onInk,
  },
  badges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  measures: {
    flexDirection: 'row',
    gap: SPACING.xxl,
  },
  measureValue: {
    ...TYPOGRAPHY.heading,
    ...TABULAR,
    color: COLORS.ink,
  },
  measureLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.inkMuted,
  },
  stats: {
    gap: SPACING.md,
  },
  statsTitle: {
    ...TYPOGRAPHY.title,
    color: COLORS.ink,
  },
  statRows: {
    gap: SPACING.md,
  },
});
