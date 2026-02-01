import { Ionicons } from "@expo/vector-icons";
import { useFonts } from "expo-font";
import { SplashScreen, Tabs } from "expo-router";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

export default function TabsLayout() {
  const [loaded] = useFonts({
    BatmanFont: require("../../assets/fonts/UncialAntiqua-Regular.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Tabs>
      <Tabs.Screen
        name="Cleoh"
        options={{
          title: "The Artist's Perspective",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Matthew"

        options={{
          title: "Batman's Crime History",
          headerTitleStyle: {
            fontFamily: "BatmanFont",
            color: "white",
            textAlign: "center",
          },
          headerStyle: {
            backgroundColor: "black",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          )
        }}
      />

      {/* <Tabs.Screen
        name="Placeholder"
        options={{
          title: "Placeholder",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      /> */}
    </Tabs>
  );
}