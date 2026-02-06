import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';

const SkeletonCard = () => {
    const pulseAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const pulse = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(pulseAnim, {
                    toValue: 0,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        );
        pulse.start();

        return () => pulse.stop();
    }, [pulseAnim]);

    const opacity = pulseAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0.3, 0.7],
    });

    return (
        <View className="bg-white rounded-lg p-5 mb-4 w-full min-h-40 border-2 border-gray-200">
            {/* Header skeleton */}
            <View className="flex-row items-center mb-3">
                <Animated.View
                    style={{ opacity }}
                    className="w-8 h-8 bg-gray-300 rounded-full mr-2"
                />
                <Animated.View
                    style={{ opacity }}
                    className="h-6 bg-gray-300 rounded flex-1"
                />
            </View>

            {/* Content skeleton */}
            <Animated.View
                style={{ opacity }}
                className="h-4 bg-gray-300 rounded mb-2"
            />
            <Animated.View
                style={{ opacity }}
                className="h-4 bg-gray-300 rounded mb-2 w-4/5"
            />
            <Animated.View
                style={{ opacity }}
                className="h-4 bg-gray-300 rounded mb-2 w-3/5"
            />

            {/* Footer skeleton */}
            <View className="flex-row justify-between items-center mt-3">
                <Animated.View
                    style={{ opacity }}
                    className="h-3 bg-gray-300 rounded w-20"
                />
                <Animated.View
                    style={{ opacity }}
                    className="h-3 bg-gray-300 rounded w-24"
                />
            </View>
        </View>
    );
};

export default SkeletonCard;
