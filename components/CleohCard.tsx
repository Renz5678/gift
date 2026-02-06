import { getThemeConfig } from '@/utils/themeUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Alert, Image, Pressable, Text, View } from 'react-native';

interface CleohCardProps {
    id: string;
    title: string;
    date: string;
    description: string;
    authorUsername: string;
    imageUrl?: string | null;
    currentUserEmail?: string;
    authorEmail?: string;
    onDelete?: (id: string) => void;
}

const CleohCard = ({
    id,
    title,
    date,
    description,
    authorUsername,
    imageUrl,
    currentUserEmail,
    authorEmail,
    onDelete,
}: CleohCardProps) => {
    const theme = getThemeConfig(authorUsername, authorEmail);
    const canDelete = currentUserEmail === authorEmail;

    const handleDelete = () => {
        Alert.alert(
            'Delete Post',
            'Are you sure you want to delete this post?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => onDelete?.(id),
                },
            ]
        );
    };

    return (
        <View className={`${theme.cardBackground} rounded-lg p-5 mb-4 w-full min-h-40 border-2 ${theme.accentColor}`}>
            {/* Header with icon and delete button */}
            <View className="flex-row justify-between items-start mb-2">
                <View className="flex-row items-center flex-1">
                    {theme.iconSource === 'ionicon-heart' ? (
                        <Ionicons name="heart" size={32} color="#6b7280" style={{ marginRight: 8 }} />
                    ) : (
                        <Image
                            source={theme.iconSource}
                            resizeMode="contain"
                            style={{ width: 32, height: 32, marginRight: 8 }}
                        />
                    )}
                    <Text className={`${theme.titleColor} text-2xl font-bold flex-1`}>{title}</Text>
                </View>
                {canDelete && (
                    <Pressable onPress={handleDelete} className="ml-2 p-2">
                        <Text className={`${theme.titleColor} text-lg font-bold`}>✕</Text>
                    </Pressable>
                )}
            </View>

            {/* Image if available */}
            {imageUrl && (
                <View className="mb-3 rounded-lg overflow-hidden">
                    <Image
                        source={{ uri: imageUrl }}
                        style={{ width: '100%', height: 200 }}
                        resizeMode="cover"
                    />
                </View>
            )}

            {/* Content */}
            <Text className={`${theme.textColor} text-base mb-2`}>{description}</Text>

            {/* Footer with date and author */}
            <View className="flex-row justify-between items-center mt-2">
                <Text className={`${theme.textColor} text-sm opacity-70`}>{date}</Text>
                <Text className={`${theme.titleColor} text-sm font-semibold`}>by {authorUsername}</Text>
            </View>
        </View>
    );
};

export default CleohCard;
