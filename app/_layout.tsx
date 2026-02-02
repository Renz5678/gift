import { useFonts } from "expo-font";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function RootLayout() {
  const [loaded] = useFonts({
    HeaderFont: require("../assets/fonts/headerFont.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Stack>
      <Stack.Screen
        name="(tabs)"
        options={{
          header: () => <CustomHeader />,
        }}
      />
    </Stack>
  );
}

function CustomHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      <Text style={styles.headerTitle}>Mayo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#dc5454",
    height: 90, // Your custom height (will be added to the safe area inset)
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "HeaderFont"
  },
});