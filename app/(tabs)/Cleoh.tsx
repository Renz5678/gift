import CleohCard from "@/components/CleohCard";
import React from 'react';
import { ScrollView, View } from 'react-native';
import '../../global.css';

const Cleoh = () => {
    return (
        <ScrollView className="flex-1">
            <View className="p-6 items-start justify-start">
                <CleohCard title="Hello" description="Hello baby!" date="12-02-06" />
            </View>
        </ScrollView>
    )
}

export default Cleoh