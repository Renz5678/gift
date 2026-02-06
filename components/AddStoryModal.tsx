import * as ImagePicker from 'expo-image-picker';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from 'react-native';

interface AddStoryModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (title: string, content: string, imageUri?: string) => Promise<boolean>;
    username: string;
}

const AddStoryModal = ({ visible, onClose, onSubmit, username }: AddStoryModalProps) => {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const resetForm = () => {
        setTitle('');
        setContent('');
        setImageUri(null);
    };

    const handleClose = () => {
        resetForm();
        onClose();
    };

    const pickImage = async () => {
        try {
            // Request permission
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'We need camera roll permissions to select images.');
                return;
            }

            // Launch image picker
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: true,
                aspect: [16, 9],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                setImageUri(result.assets[0].uri);
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const removeImage = () => {
        setImageUri(null);
    };

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            Alert.alert('Missing Information', 'Please provide both a title and content.');
            return;
        }

        setLoading(true);
        try {
            const success = await onSubmit(title.trim(), content.trim(), imageUri || undefined);

            if (success) {
                Alert.alert('Success', 'Your story has been posted!');
                handleClose();
            } else {
                Alert.alert('Error', 'Failed to create post. Please try again.');
            }
        } catch (error) {
            console.error('Error submitting post:', error);
            Alert.alert('Error', 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={handleClose}
        >
            <View className="flex-1 bg-black/50 justify-end">
                <View className="bg-white rounded-t-3xl p-6 max-h-[90%]">
                    {/* Header */}
                    <View className="flex-row justify-between items-center mb-4">
                        <Text className="text-2xl font-bold text-gray-800">Share Your Story</Text>
                        <Pressable onPress={handleClose} className="p-2">
                            <Text className="text-2xl text-gray-600">✕</Text>
                        </Pressable>
                    </View>

                    <ScrollView showsVerticalScrollIndicator={false}>
                        {/* Title Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Title</Text>
                            <TextInput
                                className="border-2 border-gray-300 rounded-lg p-3 text-base"
                                placeholder="Give your story a title..."
                                value={title}
                                onChangeText={setTitle}
                                maxLength={100}
                            />
                        </View>

                        {/* Content Input */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Content</Text>
                            <TextInput
                                className="border-2 border-gray-300 rounded-lg p-3 text-base min-h-[120px]"
                                placeholder="Share your thoughts..."
                                value={content}
                                onChangeText={setContent}
                                multiline
                                numberOfLines={6}
                                textAlignVertical="top"
                                maxLength={1000}
                            />
                        </View>

                        {/* Image Picker */}
                        <View className="mb-4">
                            <Text className="text-gray-700 font-semibold mb-2">Image (Optional)</Text>

                            {imageUri ? (
                                <View className="relative">
                                    <Image
                                        source={{ uri: imageUri }}
                                        style={{ width: '100%', height: 200, borderRadius: 12 }}
                                        resizeMode="cover"
                                    />
                                    <Pressable
                                        onPress={removeImage}
                                        className="absolute top-2 right-2 bg-red-500 rounded-full w-8 h-8 items-center justify-center"
                                    >
                                        <Text className="text-white font-bold">✕</Text>
                                    </Pressable>
                                </View>
                            ) : (
                                <Pressable
                                    onPress={pickImage}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-8 items-center justify-center"
                                >
                                    <Text className="text-4xl mb-2">📷</Text>
                                    <Text className="text-gray-600">Tap to add an image</Text>
                                </Pressable>
                            )}
                        </View>

                        {/* Submit Button */}
                        <Pressable
                            onPress={handleSubmit}
                            disabled={loading}
                            className={`${loading ? 'bg-gray-400' : 'bg-pink-500'
                                } rounded-lg p-4 items-center justify-center mb-4`}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <Text className="text-white font-bold text-lg">Post Story</Text>
                            )}
                        </Pressable>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
};

export default AddStoryModal;
