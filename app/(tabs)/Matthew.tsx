import MatthewCard from "@/components/MatthewCard";
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import '../../global.css';

const Matthew = () => {
    return (
        <View className="flex-1">
            <ScrollView className="flex-1 h-screen">
                <View className="p-6 items-start justify-start">
                    <MatthewCard title="Hello" description="Hello baby!" date="12-02-06" />
                </View>
            </ScrollView>

            <Pressable className="w-16 h-16 bg-blue-950 rounded-full absolute bottom-6 right-6 flex justify-center items-center">
                <Image
                    source={require("../../assets/icons/batman-add.png")}
                    resizeMode="contain"
                    style={{ height: 45, width: 45 }} />
            </Pressable>
        </View>

    )
}

export default Matthew

