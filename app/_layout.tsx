import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname } from "expo-router";
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
  const pathname = usePathname();

  // Change color only for /Matthew route
  const headerColor = pathname.includes('/Matthew') ? '#000923' : '#dc5454';

  return (
    <View style={[styles.header, { paddingTop: insets.top, backgroundColor: headerColor }]}>
      <Text style={styles.headerTitle}>Mayo!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 90,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontFamily: "HeaderFont"
  },
});