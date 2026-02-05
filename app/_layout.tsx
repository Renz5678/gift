import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { useFonts } from "expo-font";
import { SplashScreen, Stack, usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { ActivityIndicator, Animated, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LoginScreen from "./auth/LoginScreen";

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
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
}

function AuthenticatedApp() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#dc5454" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <MainApp />;
}

function MainApp() {
  // Initialize poke notifications
  const { usePokeNotifications } = require('@/hooks/usePokeNotifications');
  usePokeNotifications();

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
  const colorAnim = useRef(new Animated.Value(0)).current;

  // Determine target color based on pathname
  const isMatthewRoute = pathname.includes('/Matthew');

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: isMatthewRoute ? 1 : 0,
      duration: 300,
      useNativeDriver: false, // Color animations don't support native driver
    }).start();
  }, [isMatthewRoute]);

  // Interpolate between the two colors
  const backgroundColor = colorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#dc5454', '#000923'], // red to dark blue
  });

  return (
    <Animated.View style={[styles.header, { paddingTop: insets.top, backgroundColor }]}>
      <Text style={styles.headerTitle}>Mayo!</Text>
    </Animated.View>
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