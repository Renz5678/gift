import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, Text, View } from 'react-native';

const PokeMessage = ({
    message,
    isPressed,
    onPress
}: {
    message: string;
    isPressed: boolean;
    onPress: () => void;
}) => {
    const [showModal, setShowModal] = useState(false);
    const [sending, setSending] = useState(false);
    const { userEmail } = useAuth();

    // Helper function to format remaining cooldown time
    const formatCooldownTime = (milliseconds: number): string => {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);

        if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} and ${seconds} second${seconds !== 1 ? 's' : ''}`;
        }
        return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    };

    const handleSend = async () => {
        setSending(true);

        try {
            const LAST_POKE_KEY = `@last_poke_time_${userEmail}`;
            const cooldownPeriod = 15 * 60 * 1000; // 15 minutes in milliseconds

            // Check local cooldown first (faster than database query)
            const lastPokeTimeStr = await AsyncStorage.getItem(LAST_POKE_KEY);
            if (lastPokeTimeStr) {
                const lastPokeTime = parseInt(lastPokeTimeStr, 10);
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - lastPokeTime;

                if (timeDifference < cooldownPeriod) {
                    const remainingTime = cooldownPeriod - timeDifference;
                    const formattedTime = formatCooldownTime(remainingTime);
                    Alert.alert(
                        'Cooldown Active ⏰',
                        `Please wait ${formattedTime} before sending another poke!`,
                        [{ text: 'OK' }]
                    );
                    setSending(false);
                    setShowModal(false);
                    return;
                }
            }

            // Get partner email from user_pairs
            const { data: pairData, error: pairError } = await supabase
                .from('user_pairs')
                .select('partner_email')
                .eq('user_email', userEmail)
                .single();

            if (pairError || !pairData) {
                Alert.alert('Error', 'You need to pair with your partner first!');
                setSending(false);
                return;
            }

            // Double-check with database (in case of multiple devices or cleared storage)
            const { data: recentPoke, error: cooldownError } = await supabase
                .from('pokes')
                .select('sent_at')
                .eq('sender_email', userEmail)
                .eq('receiver_email', pairData.partner_email)
                .order('sent_at', { ascending: false })
                .limit(1)
                .single();

            if (!cooldownError && recentPoke) {
                const lastPokeTime = new Date(recentPoke.sent_at).getTime();
                const currentTime = new Date().getTime();
                const timeDifference = currentTime - lastPokeTime;

                if (timeDifference < cooldownPeriod) {
                    const remainingTime = cooldownPeriod - timeDifference;
                    const formattedTime = formatCooldownTime(remainingTime);
                    Alert.alert(
                        'Cooldown Active ⏰',
                        `Please wait ${formattedTime} before sending another poke!`,
                        [{ text: 'OK' }]
                    );
                    setSending(false);
                    setShowModal(false);
                    // Update local storage with the actual last poke time
                    await AsyncStorage.setItem(LAST_POKE_KEY, lastPokeTime.toString());
                    return;
                }
            }

            // Send poke to database
            const { error: pokeError } = await supabase
                .from('pokes')
                .insert([
                    {
                        sender_email: userEmail,
                        receiver_email: pairData.partner_email,
                        message: message
                    }
                ]);

            if (pokeError) {
                Alert.alert('Error', 'Failed to send poke. Please try again.');
                console.error('Poke error:', pokeError);
            } else {
                // Update last poke time in AsyncStorage
                await AsyncStorage.setItem(LAST_POKE_KEY, new Date().getTime().toString());
                Alert.alert('Sent! 💕', 'Your poke has been sent to your partner!');
                setShowModal(false);
                onPress(); // Deselect the message
            }
        } catch (error) {
            console.error('Error sending poke:', error);
            Alert.alert('Error', 'Something went wrong. Please try again.');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <Pressable
                className='w-full h-20 bg-gray-200 rounded-3xl p-2 flex align-center justify-center pl-6'
                onPress={onPress}
            >
                <Text className='text-justify text-xl'>
                    {message}
                </Text>

                {isPressed && (
                    <Pressable
                        className='absolute right-4 bg-red-400 h-12 w-12 rounded-full justify-center items-center'
                        onPress={(e) => {
                            e.stopPropagation();
                            setShowModal(true);
                        }}
                    >
                        <Ionicons name="send" size={24} color="white" />
                    </Pressable>
                )}
            </Pressable>

            <Modal
                transparent
                visible={showModal}
                animationType="fade"
                onRequestClose={() => setShowModal(false)}
            >
                <Pressable
                    className='flex-1 justify-center items-center bg-black/50'
                    onPress={() => !sending && setShowModal(false)}
                >
                    <Pressable
                        className='bg-white rounded-2xl w-4/5'
                        onPress={(e) => e.stopPropagation()}
                    >
                        <View className='w-full p-4 bg-red-400 rounded-t-2xl justify-center'>
                            <Text className='text-xl font-bold text-white'>Send Poke?</Text>
                        </View>

                        <View className='p-6 h-36 pt-8'>
                            <Text className='text-gray-600 mb-6'>
                                Send <Text className='italic font-bold'>{message}</Text>  ?
                            </Text>

                            <View className='flex-row gap-3'>
                                <Pressable
                                    className='flex-1 bg-gray-200 p-3 rounded-lg'
                                    onPress={() => setShowModal(false)}
                                    disabled={sending}
                                >
                                    <Text className='text-center font-semibold'>Cancel</Text>
                                </Pressable>

                                <Pressable
                                    className='flex-1 bg-red-400 p-3 rounded-lg'
                                    onPress={handleSend}
                                    disabled={sending}
                                >
                                    {sending ? (
                                        <ActivityIndicator color="white" />
                                    ) : (
                                        <Text className='text-center font-semibold text-white'>Send</Text>
                                    )}
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
                </Pressable>
            </Modal>
        </>
    )
}

export default PokeMessage