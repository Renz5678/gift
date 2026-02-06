import { Ionicons } from '@expo/vector-icons';
import { useFonts } from "expo-font";
import { SplashScreen, Tabs } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Image, Pressable } from 'react-native';

SplashScreen.preventAutoHideAsync();

// Animated Tab Button Component with bubble pop-out effect
function AnimatedTabButton(props: any) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;
  const bgScaleAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (props.accessibilityState?.selected) {
      // Animate when tab becomes active - bubble pop effect
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1.05,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Bubble enlarging effect for background
        Animated.spring(bgScaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 6,
          tension: 50,
          overshootClamping: false,
        }),
      ]).start();
    } else {
      // Animate when tab becomes inactive - bubble shrink
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 40,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.7,
          duration: 200,
          useNativeDriver: true,
        }),
        // Shrink background to nothing
        Animated.timing(bgScaleAnim, {
          toValue: 0,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [props.accessibilityState?.selected]);

  return (
    <Animated.View
      style={{
        flex: 1,
        transform: [{ scale: scaleAnim }],
        opacity: opacityAnim,
      }}
    >
      <Pressable {...props} style={[props.style, { flex: 1, overflow: 'hidden' }]}>
        {/* Bubble background layer */}
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: props.style?.backgroundColor || 'transparent',
            transform: [{ scale: bgScaleAnim }],
            borderRadius: 12,
          }}
        />
        {props.children}
      </Pressable>
    </Animated.View>
  );
}

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
        headerShown: false,
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
        animation: 'shift',
        tabBarButton: (props) => <AnimatedTabButton {...props} />,
      }}>
      <Tabs.Screen
        name="Ourchives"
        options={{
          title: "Our-chives",
          headerTitleStyle: {
            fontFamily: "ArtistFont",
            color: "white",
            fontSize: 16,
            lineHeight: 24,
          },
          tabBarLabel: "Our-chives",
          headerStyle: {
            backgroundColor: "#e6657a",
          },
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
          tabBarActiveBackgroundColor: "#c23d6b9a",
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