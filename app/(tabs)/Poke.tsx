import PokeMessage from '@/components/PokeMessage'
import { useFocusEffect } from '@react-navigation/native'
import React, { useCallback, useState } from 'react'
import { View } from 'react-native'

const Poke = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

    const messages = [
        "Good morning, baby! 🥰 😚",
        "I miss you, baby :<<",
        "I love you, baby 😍 🤗",
        "Di mu na ba ko love :((",
        "Bebe time po plith  ^___^",
        "Study well, love 📚 💞",
        "Ingat ikaw baby! 😘 💋"
    ];

    useFocusEffect(
        useCallback(() => {
            return () => {
                setSelectedIndex(null);
            };
        }, [])
    );

    return (
        <View className='p-5 gap-5 mt-2'>
            {messages.map((message, index) => (
                <PokeMessage
                    key={index}
                    message={message}
                    isPressed={selectedIndex === index}
                    onPress={() => setSelectedIndex(prev => prev === index ? null : index)}
                />
            ))}
        </View>
    )
}

export default Poke