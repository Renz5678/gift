import AddStoryModal from '@/components/AddStoryModal';
import CleohCard from "@/components/CleohCard";
import { useAuth } from '@/contexts/AuthContext';
import { useStoryPosts } from '@/hooks/useStoryPosts';
import { getFABIcon } from '@/utils/themeUtils';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import '../../global.css';

const Cleoh = () => {
    const { userEmail, username } = useAuth();
    const { posts, loading, error, createPost, deletePost, refreshPosts } = useStoryPosts(userEmail, username);
    const [modalVisible, setModalVisible] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refreshPosts();
        setRefreshing(false);
    };

    const handleCreatePost = async (title: string, content: string, imageUri?: string) => {
        return await createPost(title, content, imageUri);
    };

    const handleDeletePost = async (postId: string) => {
        await deletePost(postId);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <View className="flex-1 bg-gray-50">
            <ScrollView
                className="flex-1"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
                }
            >
                <View className="p-6 items-start justify-start">
                    {/* Header */}
                    <View className="mb-6 w-full">
                        <Text className="text-3xl font-bold text-gray-800 mb-2">Our Story</Text>
                        <Text className="text-gray-600">Shared memories and moments 💕</Text>
                    </View>

                    {/* Loading State */}
                    {loading && posts.length === 0 && (
                        <View className="w-full items-center justify-center py-20">
                            <ActivityIndicator size="large" color="#ec4899" />
                            <Text className="text-gray-600 mt-4">Loading stories...</Text>
                        </View>
                    )}

                    {/* Error State */}
                    {error && (
                        <View className="w-full bg-red-100 border border-red-400 rounded-lg p-4 mb-4">
                            <Text className="text-red-700">{error}</Text>
                        </View>
                    )}

                    {/* Empty State */}
                    {!loading && posts.length === 0 && !error && (
                        <View className="w-full items-center justify-center py-20">
                            <Text className="text-6xl mb-4">📖</Text>
                            <Text className="text-xl font-semibold text-gray-700 mb-2">
                                No stories yet
                            </Text>
                            <Text className="text-gray-600 text-center">
                                Start sharing your memories by tapping the + button below
                            </Text>
                        </View>
                    )}

                    {/* Posts List */}
                    {posts.map((post) => (
                        <CleohCard
                            key={post.id}
                            id={post.id}
                            title={post.title}
                            description={post.content}
                            date={formatDate(post.created_at)}
                            authorUsername={post.author_username}
                            imageUrl={post.image_url}
                            currentUserEmail={userEmail || undefined}
                            authorEmail={post.author_email}
                            onDelete={handleDeletePost}
                        />
                    ))}
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <Pressable
                className="w-16 h-16 bg-pink-300 rounded-full absolute bottom-6 right-6 flex justify-center items-center shadow-lg"
                onPress={() => setModalVisible(true)}
            >
                <Image
                    source={getFABIcon(username || '')}
                    resizeMode="contain"
                    style={{ height: 40, width: 40 }}
                />
            </Pressable>

            {/* Add Story Modal */}
            <AddStoryModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                onSubmit={handleCreatePost}
                username={username || ''}
            />
        </View>
    );
};

export default Cleoh;