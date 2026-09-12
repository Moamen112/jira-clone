import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { Text, Spinner } from "../src/components/base";
import { useTheme, spacing, radius } from "../src/tokens";

const SPLASH_DURATION_MS = 2000;

/**
 * Splash screen — shown first on app launch. After a short delay it
 * navigates to the main tabs so the splash is never part of history.
 */
export default function SplashScreen() {
  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/(tabs)");
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <View style={[styles.screen, { backgroundColor: colors.paper }]}>
      <View style={[styles.logoMark, { backgroundColor: colors.accent }]}>
        <Text variant="display" bold color="#FFFFFF">
          J
        </Text>
      </View>

      <Text variant="heading" bold style={styles.title}>
        Jira Clone
      </Text>

      <Text variant="body" muted style={styles.tagline}>
        Boards · Cards · Sprints
      </Text>

      <Spinner
        size="small"
        color={colors.accent}
        label="Loading…"
        style={styles.spinner}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing[4],
  },
  logoMark: {
    width: 72,
    height: 72,
    borderRadius: radius.card,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: spacing[4],
  },
  tagline: {
    marginTop: spacing[2],
  },
  spinner: {
    marginTop: spacing[6],
  },
});
