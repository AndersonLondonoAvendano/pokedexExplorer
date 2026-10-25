import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { STAT_MAX } from '../config/api.js';
import { STAT_LABELS } from '../config/labels.js';
import { STRINGS } from '../config/strings.js';
import { useReduceMotion } from '../hooks/useReduceMotion.js';
import { COLORS, MOTION, SIZES, SPACING, TABULAR, TYPOGRAPHY } from '../theme/index.js';

// One stat row: name, number and a bar whose length is the real value over the maximum (255),
// drawn on a track of full length. The number is always written next to the bar.
//
// Props:
//   name     string, API stat name in English (hp, attack, special-attack...)
//   value    number, base stat value
//   color    string, fill colour (the `bar` variant of the first type, chosen by the view)
//   delay    number, milliseconds to wait before growing (the view staggers the rows)
//   animate  boolean, false shows the final length at once
//   ready    boolean, false keeps the fill empty and waiting
//
// `ready` exists so that, while the detail view is still revealing its artwork, the bars are
// not seen full and then reset to empty: they stay empty until the view says it is their turn.
//
// [CONCEPT] props: the parent owns the timing (ready, delay) and the colour; the bar only
// knows how to draw one value and how to grow when it is told to.
export default function StatBar({ name, value, color, delay = 0, animate = true, ready = true }) {
  const label = STAT_LABELS[name] ?? name;
  // The fill is a full-size block scaled horizontally, so only a transform changes.
  const target = Math.min(value, STAT_MAX) / STAT_MAX;
  const reduceMotion = useReduceMotion();

  // [CONCEPT] useRef: the Animated.Value must survive re-renders without creating a new one,
  // and changing it must not re-render the component. The starting value is the final scale
  // when nothing will animate, so a static bar never starts at 0 and jumps.
  const scale = useRef(new Animated.Value(ready && !animate ? target : 0)).current;

  // [CONCEPT] useEffect: runs when the bar becomes ready or its inputs change. The cleanup stops
  // a running animation so nothing keeps updating after unmount or a new run. The effect only
  // writes to the Animated.Value (a ref), never to its own dependencies.
  useEffect(() => {
    if (!ready) {
      scale.setValue(0);
      return undefined;
    }
    if (!animate || reduceMotion) {
      scale.setValue(target);
      return undefined;
    }
    scale.setValue(0);
    // [CONCEPT] Animated: timing drives the scale from 0 to the final value. useNativeDriver
    // runs the animation on the UI thread, so it stays smooth even if the JS thread is busy;
    // the price is that only non-layout properties such as transform and opacity are allowed,
    // which is why the bar grows with scaleX instead of animating its width.
    const animation = Animated.timing(scale, {
      toValue: target,
      delay,
      duration: MOTION.bars,
      easing: MOTION.easing,
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [ready, animate, reduceMotion, delay, target, scale]);

  return (
    <View
      // No fixed height: at large text sizes the name wraps and the row grows.
      style={styles.row}
      accessible
      accessibilityLabel={STRINGS.statLabel(label, value)}
      testID={`stat-${name}`}
    >
      <Text style={styles.name}>{label}</Text>
      <Text style={styles.value}>{String(value)}</Text>
      <View style={styles.track}>
        {/* The colour depends on the data, so it is inline; the scale is the animated value. */}
        <Animated.View
          style={[styles.fill, { backgroundColor: color, transform: [{ scaleX: scale }] }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  name: {
    ...TYPOGRAPHY.body,
    color: COLORS.ink,
    width: SIZES.statName,
  },
  value: {
    ...TYPOGRAPHY.title,
    ...TABULAR,
    color: COLORS.ink,
    width: SIZES.statValue,
    textAlign: 'right',
  },
  track: {
    flex: 1,
    height: SIZES.bar,
    backgroundColor: COLORS.surface,
  },
  // Full width and height of the track; scaleX shortens it, anchored on the left edge.
  fill: {
    width: '100%',
    height: '100%',
    transformOrigin: 'left',
  },
});
