import CleohCard from "@/components/CleohCard";
import React from 'react';
import { Image, Pressable, ScrollView, View } from 'react-native';
import '../../global.css';

const Cleoh = () => {
    return (
        <View className="flex-1">
            <ScrollView className="flex-1">
                <View className="p-6 items-start justify-start">
                    <CleohCard title="Hello" description="Hello baby!" date="12-02-06" />
                </View>
            </ScrollView>

            <Pressable className="w-16 h-16 bg-pink-300 rounded-full absolute bottom-6 right-6 flex justify-center items-center">
                <Image
                    source={require("../../assets/icons/ribbon-add.png")}
                    resizeMode="contain"
                    style={{ height: 40, width: 40 }} />
            </Pressable>
        </View>

    )
}

export default Cleoh