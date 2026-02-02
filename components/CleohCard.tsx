import React from 'react'
import { Text, View } from 'react-native'

const CleohCard = ({ title, date, description }: { title: string, date: string, description: string }) => {
    return (
        <View className="bg-pink-200 rounded-lg p-5 mb-4 w-full min-h-40">
            <Text className="text-red-400 text-3xl font-bold mb-2">{title}</Text>
            <Text className="text-gray-500 text-l">{description}</Text>
            <Text className="text-gray-500 text-l">{date}</Text>
        </View>
    )
}

export default CleohCard