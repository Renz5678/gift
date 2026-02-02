import React from 'react'
import { Text, View } from 'react-native'

const MatthewCard = ({ title, date, description }: { title: string, date: string, description: string }) => {
    return (
        <View className="bg-gray-600 rounded-lg p-5 mb-4 w-full min-h-40">
            <Text className="text-gray-100 text-3xl font-bold mb-2">{title}</Text>
            <Text className="text-gray-400 text-l">{description}</Text>
            <Text className="text-gray-400 text-l">{date}</Text>
        </View>
    )
}

export default MatthewCard