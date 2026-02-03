import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import '../../global.css';

const More = () => {
    return (
        <View className="p-4">
            <ScrollView className='g-4'>
                <View className='w-full h-60 rounded-3xl'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>Games</Text>
                    </View>

                    <Pressable className='p-4 border-2 border-red-400 w-full h-20 justify-center'>
                        <Text className='text-xl'>
                            Titres
                        </Text>
                    </Pressable>

                    <Pressable className='p-4 border-2 border-b-2 rounded-b-2xl border-red-400 w-full h-20 justify-center'>
                        <Text className='text-xl'>
                            Flovey Bird
                        </Text>
                    </Pressable>
                </View>

                <View className='w-full h-40 rounded-3xl'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>This Year's Song :{"))"}</Text>
                    </View>

                    <Pressable className='p-4 border-2 border-b-2 rounded-b-2xl border-red-400 w-full h-20 justify-center'>
                        <Text className='text-xl'>
                            Click Me Babyyyy
                        </Text>
                    </Pressable>
                </View>

                <View className='w-full h-60 rounded-3xl'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>My Letter</Text>
                    </View>

                    <Pressable className='p-4 border-2 border-b-2 rounded-b-2xl border-red-400 w-full h-20 justify-center'>
                        <Text className='text-xl'>
                            To my dearest, Jeztra
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>
        </View>
    )
}

export default More