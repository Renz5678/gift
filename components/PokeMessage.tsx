import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, Text } from 'react-native';

const PokeMessage = ({
    message,
    isPressed,
    onPress
}: {
    message: string;
    isPressed: boolean;
    onPress: () => void;
}) => {
    return (
        <Pressable
            className='w-full h-20 bg-gray-200 rounded-3xl p-2 flex align-center justify-center pl-6'
            onPress={onPress}
        >
            <Text className='text-justify text-xl'>
                {message}
            </Text>

            {isPressed && (
                <Pressable className='absolute right-4 bg-gray-400 h-12 w-12 rounded-full justify-center items-center'>
                    <Ionicons name="send" size={24} color="white" />
                </Pressable>
            )}
        </Pressable>
    )
}

export default PokeMessage