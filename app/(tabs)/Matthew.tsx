import MatthewCard from "@/components/MatthewCard";
import React from 'react';
import { ScrollView, View } from 'react-native';
import '../../global.css';

const Matthew = () => {
    return (
        <ScrollView className="flex-1">
            <View className="p-6 items-start justify-start">
                <MatthewCard title="Hello" description="Hello baby!" date="12-02-06" />
            </View>
        </ScrollView>
    )
}

export default Matthew

