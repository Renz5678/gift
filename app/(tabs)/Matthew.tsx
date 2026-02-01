import { useFonts } from "expo-font";
import { SplashScreen } from 'expo-router';
import React, { useEffect } from 'react';
import { Text, View } from 'react-native';

SplashScreen.preventAutoHideAsync();

const Matthew = () => {
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
        <View>
            <Text>Renz</Text>
        </View>
    )
}

export default Matthew