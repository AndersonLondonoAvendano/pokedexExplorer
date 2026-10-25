import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
// [CONCEPT] SafeAreaView: taken from react-native-safe-area-context because the core version is
// deprecated and only works on iOS; this one reads the real insets on both platforms so content
// never sits under the notch, the status bar or the gesture area.
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import HomeScreen from './src/screens/HomeScreen.js';
import { COLORS } from './src/theme/index.js';

// Root of the app: only provides the safe areas and the status bar, no logic lives here.
export default function App() {
  return (
    // The provider measures the device insets once and shares them with every SafeAreaView below.
    <SafeAreaProvider>
      {/* The stone background is painted by this view, so it also fills the inset areas edge to edge. */}
      <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
        <HomeScreen />
      </SafeAreaView>
      {/* Dark icons stay readable on the light stone ground. */}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}

// [CONCEPT] StyleSheet: styles are declared once outside the render, so they are validated and
// not recreated on every render.
const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.ground,
  },
});
