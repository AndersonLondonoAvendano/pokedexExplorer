import { useEffect, useState } from 'react';
import { AccessibilityInfo } from 'react-native';

// Reports whether the system "Reduce motion" setting is on, and updates when the user changes it.
// Animated components read this value to jump straight to their final state instead of animating.
export function useReduceMotion() {
  // [CONCEPT] useState: keeps the current setting so the component re-renders when it changes;
  // it starts as false and is corrected by the initial read below.
  const [reduceMotion, setReduceMotion] = useState(false);

  // [CONCEPT] useEffect: the dependency array is empty because the hook only needs to read the
  // setting and subscribe once, when the component mounts; the cleanup removes the listener on unmount.
  useEffect(() => {
    // Guards against setting state after unmount if the initial read resolves late.
    let active = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((enabled) => {
        if (active) setReduceMotion(enabled);
      })
      .catch(() => {
        // If the platform cannot report the setting, animations stay enabled.
      });

    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) => {
      if (active) setReduceMotion(enabled);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  return reduceMotion;
}
