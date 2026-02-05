import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import '../../global.css';

interface PairingRequest {
    id: string;
    user_email: string;
    partner_email: string;
    status: string;
    created_at: string;
}

const More = () => {
    const { logout, userEmail } = useAuth();
    const [pairModalVisible, setPairModalVisible] = useState(false);
    const [partnerEmail, setPartnerEmail] = useState('');
    const [pairingRequests, setPairingRequests] = useState<PairingRequest[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasPair, setHasPair] = useState(false);
    const [myPartnerEmail, setMyPartnerEmail] = useState<string | null>(null);

    const fetchPairingRequests = async () => {
        const { data, error } = await supabase
            .from('user_pairs')
            .select('*')
            .eq('partner_email', userEmail)
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (!error && data) {
            setPairingRequests(data);
        }
    };

    const checkIfPaired = async () => {
        const { data, error } = await supabase
            .from('user_pairs')
            .select('*')
            .or(`user_email.eq.${userEmail},partner_email.eq.${userEmail}`)
            .eq('status', 'accepted')
            .single();

        if (!error && data) {
            setHasPair(true);
            // Get partner email
            const partnerEmail = data.user_email === userEmail ? data.partner_email : data.user_email;

            // Fetch partner's username
            const { data: partnerData } = await supabase
                .from('users')
                .select('username')
                .eq('email', partnerEmail)
                .single();

            setMyPartnerEmail(partnerData?.username || partnerEmail);
        } else {
            setHasPair(false);
            setMyPartnerEmail(null);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchPairingRequests();
            checkIfPaired();
        }, [userEmail])
    );

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        await logout();
                    },
                },
            ]
        );
    };

    const handlePairWith = () => {
        setPairModalVisible(true);
    };

    const handleSubmitPairing = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!partnerEmail.trim()) {
            Alert.alert('Error', 'Please enter your partner\'s email address');
            return;
        }
        if (!emailRegex.test(partnerEmail)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }
        if (partnerEmail.toLowerCase() === userEmail?.toLowerCase()) {
            Alert.alert('Error', 'You cannot pair with yourself');
            return;
        }

        setLoading(true);

        try {
            // Check if current user already has a partner
            const { data: myPair, error: myPairError } = await supabase
                .from('user_pairs')
                .select('*')
                .or(`user_email.eq.${userEmail},partner_email.eq.${userEmail}`)
                .eq('status', 'accepted')
                .single();

            if (!myPairError && myPair) {
                Alert.alert(
                    'Already Paired',
                    'You already have a partner! You can only pair with one person at a time.',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Check if partner email exists
            const { data: userExists, error: checkError } = await supabase
                .rpc('check_user_exists', { user_email: partnerEmail.toLowerCase() });

            if (!checkError && !userExists) {
                Alert.alert('Error', 'This email is not registered. Your partner needs to sign up first.');
                setLoading(false);
                return;
            }

            // Check if partner is already paired with someone (accepted status)
            const { data: existingPair, error: pairCheckError } = await supabase
                .from('user_pairs')
                .select('*')
                .or(`user_email.eq.${partnerEmail.toLowerCase()},partner_email.eq.${partnerEmail.toLowerCase()}`)
                .eq('status', 'accepted')
                .single();

            if (!pairCheckError && existingPair) {
                Alert.alert(
                    '💔 Already Taken',
                    'They\'re already paired with someone else. Sorry!',
                    [{ text: 'OK' }]
                );
                setLoading(false);
                return;
            }

            // Insert pairing request
            const { data, error } = await supabase
                .from('user_pairs')
                .insert([
                    {
                        user_email: userEmail,
                        partner_email: partnerEmail.toLowerCase(),
                        status: 'pending'
                    }
                ])
                .select();

            if (error) {
                if (error.code === '23505') {
                    Alert.alert('Info', 'You already sent a request to this email');
                } else {
                    Alert.alert('Error', error.message);
                }
                setLoading(false);
                return;
            }

            Alert.alert('Success! 💕', `Pairing request sent to ${partnerEmail}`);
            setPairModalVisible(false);
            setPartnerEmail('');
        } catch (error) {
            console.error('Pairing error:', error);
            Alert.alert('Error', 'Failed to create pairing. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (request: PairingRequest) => {
        try {
            const { error: updateError } = await supabase
                .from('user_pairs')
                .update({ status: 'accepted' })
                .eq('id', request.id);

            if (updateError) {
                Alert.alert('Error', 'Failed to accept request');
                return;
            }

            const { error: insertError } = await supabase
                .from('user_pairs')
                .insert([
                    {
                        user_email: userEmail,
                        partner_email: request.user_email,
                        status: 'accepted'
                    }
                ]);

            if (insertError && insertError.code !== '23505') {
                Alert.alert('Error', 'Failed to complete pairing');
                return;
            }

            Alert.alert('Success! 💕', 'You are now paired!');
            fetchPairingRequests();
            checkIfPaired(); // Refresh paired status
        } catch (error) {
            console.error('Accept error:', error);
            Alert.alert('Error', 'Something went wrong');
        }
    };

    const handleRejectRequest = async (request: PairingRequest) => {
        try {
            const { error } = await supabase
                .from('user_pairs')
                .update({ status: 'rejected' })
                .eq('id', request.id);

            if (error) {
                Alert.alert('Error', 'Failed to reject request');
                return;
            }

            Alert.alert('Rejected', 'Pairing request rejected');
            fetchPairingRequests();
        } catch (error) {
            console.error('Reject error:', error);
            Alert.alert('Error', 'Something went wrong');
        }
    };

    return (
        <View className="p-4">
            <ScrollView className='g-4'>
                <View className='w-full h-60 rounded-3xl'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>Games</Text>
                    </View>

                    <Pressable className='p-4 border-2 border-red-400 w-full h-20 justify-center'
                        onPress={() => router.push('/Games/Tetris')}>
                        <Text className='text-xl'>
                            Titres
                        </Text>
                    </Pressable>

                    <Pressable className='p-4 border-l-2 border-r-2 border-b-2 rounded-b-2xl border-red-400 w-full h-20 justify-center'
                        onPress={() => router.push('/Games/FloveyBird')}>
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

                <View className='w-full h-30 rounded-3xl'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>My Letter</Text>
                    </View>

                    <Pressable className='p-4 border-2 border-b-2 rounded-b-2xl border-red-400 w-full h-20 justify-center'>
                        <Text className='text-xl'>
                            To my dearest, Jeztra
                        </Text>
                    </Pressable>
                </View>

                {pairingRequests.length > 0 && (
                    <View className='w-full rounded-3xl mt-4'>
                        <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                            <Text className='text-white font-bold text-2xl'>
                                Pairing Requests ({pairingRequests.length})
                            </Text>
                        </View>

                        {pairingRequests.map((request, index) => (
                            <View
                                key={request.id}
                                className={`p-4 border-2 border-t-0 border-red-400 ${index === pairingRequests.length - 1 ? 'rounded-b-2xl' : ''}`}
                            >
                                <Text className='text-base mb-3'>
                                    <Text className='font-bold'>{request.user_email}</Text> wants to pair with you! 💕
                                </Text>
                                <View className='flex-row gap-2'>
                                    <Pressable
                                        className='flex-1 bg-green-500 rounded-lg p-3'
                                        onPress={() => handleAcceptRequest(request)}
                                    >
                                        <Text className='text-white text-center font-bold'>Accept</Text>
                                    </Pressable>
                                    <Pressable
                                        className='flex-1 bg-gray-400 rounded-lg p-3'
                                        onPress={() => handleRejectRequest(request)}
                                    >
                                        <Text className='text-white text-center font-bold'>Reject</Text>
                                    </Pressable>
                                </View>
                            </View>
                        ))}
                    </View>
                )}

                <View className='w-full rounded-3xl mt-4'>
                    <View className='w-full p-4 justify-center bg-red-400 rounded-t-2xl h-16'>
                        <Text className='text-white font-bold text-2xl'>Account</Text>
                    </View>

                    <Pressable
                        className={`p-4 border-2 border-red-400 w-full h-20 justify-center ${hasPair ? 'bg-green-100' : ''}`}
                        onPress={hasPair ? undefined : handlePairWith}
                        disabled={hasPair}
                    >
                        {hasPair ? (
                            <View>
                                <Text className='text-lg font-bold text-green-600 text-center'>
                                    ✓ You are now paired!
                                </Text>
                                <Text className='text-sm text-gray-600 text-center mt-1'>
                                    {myPartnerEmail}
                                </Text>
                            </View>
                        ) : (
                            <Text className='text-xl font-semibold'>
                                Pair with Partner
                            </Text>
                        )}
                    </Pressable>

                    <Pressable
                        className='p-4 border-2 border-t-0 rounded-b-2xl border-red-400 w-full h-20 justify-center'
                        onPress={handleLogout}
                    >
                        <Text className='text-xl text-red-600 font-bold'>
                            Logout
                        </Text>
                    </Pressable>
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={pairModalVisible}
                onRequestClose={() => !loading && setPairModalVisible(false)}
            >
                <View className="flex-1 justify-center items-center bg-black/50">
                    <View className="bg-white rounded-2xl p-6 w-[85%] shadow-xl">
                        <Text className="text-2xl font-bold mb-4 text-center">
                            Pair with Partner
                        </Text>
                        <Text className="text-base text-gray-600 mb-4">
                            Enter your partner's email address to send a pairing request
                        </Text>

                        <TextInput
                            className="border-2 border-gray-300 rounded-xl p-4 mb-6 text-base"
                            placeholder="partner@example.com"
                            placeholderTextColor="#999"
                            value={partnerEmail}
                            onChangeText={setPartnerEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoComplete="email"
                            editable={!loading}
                        />

                        <View className="flex-row gap-3">
                            <Pressable
                                className="flex-1 bg-gray-200 rounded-xl p-4 items-center"
                                onPress={() => {
                                    setPairModalVisible(false);
                                    setPartnerEmail('');
                                }}
                                disabled={loading}
                            >
                                <Text className="text-base font-semibold text-gray-700">
                                    Cancel
                                </Text>
                            </Pressable>

                            <Pressable
                                className="flex-1 bg-red-400 rounded-xl p-4 items-center"
                                onPress={handleSubmitPairing}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator color="white" />
                                ) : (
                                    <Text className="text-base font-semibold text-white">
                                        Send Request
                                    </Text>
                                )}
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

export default More
