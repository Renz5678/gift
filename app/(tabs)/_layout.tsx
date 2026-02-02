import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { SplashScreen, Tabs } from "expo-router";
import { useEffect } from "react";
import { Image } from 'react-native';

SplashScreen.preventAutoHideAsync();

export default function TabsLayout() {
  const [loaded] = useFonts({
    BatmanFont: require("../../assets/fonts/UncialAntiqua-Regular.ttf"),
    ArtistFont: require("../../assets/fonts/Lora-VariableFont_wght.ttf"),
    HeaderFont: require("../../assets/fonts/headerFont.ttf")
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          backgroundColor: 'white',
          paddingVertical: 5,
        },
        tabBarItemStyle: {
          borderRadius: 12,
          overflow: 'hidden',
          marginHorizontal: 4,
        },
        tabBarInactiveBackgroundColor: "transparent",
        headerTitleAlign: 'center',
      }}>
      <Tabs.Screen
        name="Cleoh"
        options={{
          title: "The Artist's Perspective",
          headerTitleStyle: {
            fontFamily: "ArtistFont",
            color: "white",
            fontSize: 16,
            lineHeight: 24,
          },
          tabBarLabel: "Cleoh",
          headerStyle: {
            backgroundColor: "#e6657a",
          },
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/icons/pucca-logo.png')}
              style={{ width: size, height: size }}
              resizeMode="contain" />
          ),
          tabBarActiveBackgroundColor: "#c23d6b9a",
          tabBarActiveTintColor: "black"
        }}
      />

      <Tabs.Screen
        name="Matthew"
        options={{
          title: "Batman's Rogue Gallery",
          headerTitleStyle: {
            fontFamily: "BatmanFont",
            color: "white",
            fontSize: 16,
            lineHeight: 24,
          },
          tabBarLabel: "Matthew",
          headerStyle: {
            backgroundColor: "black",
          },
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/icons/batman-logo.png')}
              style={{ width: size, height: size }}
              resizeMode="contain" />
          ),
          tabBarActiveBackgroundColor: "#1620759a",
          tabBarActiveTintColor: "black"
        }}
      />

      <Tabs.Screen
        name="PomodoroTimer"
        options={{
          headerShown: false,
          tabBarLabel: "Pomodoro",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="timer" size={size} color={color} />
          ),
          tabBarActiveBackgroundColor: "#807c7c9a",
          tabBarActiveTintColor: "black"
        }}
      />

      <Tabs.Screen
        name="Poke"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Image
              source={require('../../assets/icons/finger-cursor-material-svgrepo-com.png')}
              style={{ width: size, height: size }}
              resizeMode="contain" />
          ),
          tabBarActiveBackgroundColor: "#807c7c9a",
          tabBarActiveTintColor: "black"
        }}
      />

      <Tabs.Screen
        name="More"
        options={{
          headerShown: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="apps" size={size} color={color} />
          ),
          tabBarActiveBackgroundColor: "#807c7c9a",
          tabBarActiveTintColor: "black"
        }}
      />
    </Tabs>
  );
}