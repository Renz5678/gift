import { useAuth } from '@/contexts/AuthContext';
import React, { useEffect, useRef, useState } from 'react';
import {
    Alert,
    Animated,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

export default function LoginScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const { login, signup } = useAuth();

    // Animation values
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const scaleAnim = useRef(new Animated.Value(0.9)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 8,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleSubmit = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return;
        }

        if (!isLogin) {
            if (!username.trim()) {
                Alert.alert('Error', 'Please enter a username');
                return;
            }
            if (password !== confirmPassword) {
                Alert.alert('Error', 'Passwords do not match');
                return;
            }
        }

        const result = isLogin
            ? await login(email, password)
            : await signup(email, password, username);

        if (!result.success) {
            Alert.alert('Error', result.error || 'An error occurred');
        } else if (result.error) {
            // Success but with a message (e.g., email confirmation required)
            Alert.alert('Success', result.error);
        }
    };

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setConfirmPassword('');
        setUsername('');
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-white"
        >
            <ScrollView
                contentContainerStyle={{ flexGrow: 1 }}
                keyboardShouldPersistTaps="handled"
            >
                <Animated.View
                    className="flex-1 justify-center px-6 py-10"
                    style={{
                        opacity: fadeAnim,
                        transform: [
                            { translateY: slideAnim },
                            { scale: scaleAnim },
                        ],
                    }}
                >
                    {/* Header */}
                    <View className="items-center mb-12">
                        <Text
                            className="text-5xl text-[#dc5454] mb-2 py-2"
                            style={{ fontFamily: 'HeaderFont', lineHeight: 60 }}
                        >
                            Mayo!
                        </Text>
                    </View>

                    {/* Form */}
                    <View className="w-full">
                        {!isLogin && (
                            <View className="mb-5">
                                <Text className="text-base font-semibold text-[#333] mb-2">
                                    Username
                                </Text>
                                <TextInput
                                    className="border-2 border-[#e0e0e0] rounded-xl p-4 text-base bg-[#f9f9f9] text-[#333]"
                                    value={username}
                                    onChangeText={setUsername}
                                    placeholder="Choose a username"
                                    placeholderTextColor="#999"
                                    autoCapitalize="none"
                                    autoComplete="off"
                                />
                            </View>
                        )}

                        <View className="mb-5">
                            <Text className="text-base font-semibold text-[#333] mb-2">
                                Email
                            </Text>
                            <TextInput
                                className="border-2 border-[#e0e0e0] rounded-xl p-4 text-base bg-[#f9f9f9] text-[#333]"
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#999"
                                autoCapitalize="none"
                                keyboardType="email-address"
                                autoComplete="email"
                            />
                        </View>

                        <View className="mb-5">
                            <Text className="text-base font-semibold text-[#333] mb-2">
                                Password
                            </Text>
                            <TextInput
                                className="border-2 border-[#e0e0e0] rounded-xl p-4 text-base bg-[#f9f9f9] text-[#333]"
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                placeholderTextColor="#999"
                                secureTextEntry
                                autoCapitalize="none"
                            />
                        </View>

                        {!isLogin && (
                            <View className="mb-5">
                                <Text className="text-base font-semibold text-[#333] mb-2">
                                    Confirm Password
                                </Text>
                                <TextInput
                                    className="border-2 border-[#e0e0e0] rounded-xl p-4 text-base bg-[#f9f9f9] text-[#333]"
                                    value={confirmPassword}
                                    onChangeText={setConfirmPassword}
                                    placeholder="Confirm your password"
                                    placeholderTextColor="#999"
                                    secureTextEntry
                                    autoCapitalize="none"
                                />
                            </View>
                        )}

                        {/* Submit Button */}
                        <Pressable
                            className="bg-red-400 rounded-xl p-5 items-center mt-5 mb-5 shadow-lg active:opacity-80 active:scale-[0.98]"
                            onPress={handleSubmit}
                        >
                            <Text className="text-white text-lg font-bold">
                                {isLogin ? 'Log In' : 'Sign Up'}
                            </Text>
                        </Pressable>

                        {/* Toggle Mode */}
                        <View className="flex-row justify-center mt-6 items-center">
                            <Text className="text-sm text-[#666]">
                                {isLogin ? "Don't have an account? " : 'Already have an account? '}
                            </Text>
                            <Pressable onPress={toggleMode}>
                                <Text className="text-sm text-[#dc5454] font-bold">
                                    {isLogin ? 'Sign Up' : 'Log In'}
                                </Text>
                            </Pressable>
                        </View>
                    </View>
                </Animated.View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}