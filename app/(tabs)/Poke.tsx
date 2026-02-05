import PokeMessage from '@/components/PokeMessage';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

const Poke = () => {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [hasPartner, setHasPartner] = useState<boolean | null>(null);
    const [loading, setLoading] = useState(true);
    const { userEmail } = useAuth();

    const messages = [
        "Good morning, baby! 🥰 😚",
        "I miss you, baby :<<",
        "I love you, baby 😍 🤗",
        "Di mu na ba ko love :((",
        "Bebe time po plith  ^___^",
        "Study well, love 📚 💞",
        "Ingat ikaw baby! 😘 💋"
    ];

    const checkPartner = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('user_pairs')
            .select('partner_email')
            .eq('user_email', userEmail)
            .single();

        setHasPartner(!error && !!data);
        setLoading(false);
    };

    useEffect(() => {
        checkPartner();
    }, [userEmail]);

    useFocusEffect(
        useCallback(() => {
            checkPartner();
            return () => {
                setSelectedIndex(null);
            };
        }, [])
    );

    if (loading) {
        return (
            <View className='flex-1 justify-center items-center'>
                <ActivityIndicator size="large" color="#dc5454" />
            </View>
        );
    }

    if (!hasPartner) {
        return (
            <View className='flex-1 justify-center items-center p-6'>
                <View className='bg-white rounded-3xl p-8 w-full shadow-lg border-2 border-red-400'>
                    <Text className='text-3xl text-center mb-4'>💕</Text>
                    <Text className='text-2xl font-bold text-center mb-4 text-gray-800'>
                        No Partner Yet
                    </Text>
                    <Text className='text-base text-center text-gray-600 mb-6'>
                        You need to pair with your partner before you can send pokes!
                    </Text>
                    <Pressable
                        className='bg-red-400 rounded-xl p-4 items-center'
                        onPress={() => router.push('/(tabs)/More')}
                    >
                        <Text className='text-white text-lg font-bold'>
                            Go to Pairing
                        </Text>
                    </Pressable>
                </View>
            </View>
        );
    }

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