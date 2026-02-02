import React from 'react'
import { Pressable, Text, View } from 'react-native'

const PomodoroTimer = () => {
    return (
        <View className='p-4 gap-4'>
            <Pressable className='w-full h-16 bg-pink-300 p-4 flex justify-center items-center rounded-xl'>
                <Text className='font-bold'>25 minutes work + 5 mins break</Text>
            </Pressable>

            <Pressable className='w-full h-16 bg-pink-200 p-4 flex justify-center items-center rounded-xl'>
                <Text className='font-bold'>Custom</Text>
            </Pressable>
        </View>
    )
}

export default PomodoroTimer