import { supabase } from '@/lib/supabase';
import { uploadImageToCloudinary } from '@/utils/cloudinaryUpload';
import { useEffect, useState } from 'react';

export interface StoryPost {
    id: string;
    author_email: string;
    author_username: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface UseStoryPostsReturn {
    posts: StoryPost[];
    loading: boolean;
    error: string | null;
    createPost: (title: string, content: string, imageUri?: string) => Promise<boolean>;
    deletePost: (postId: string) => Promise<boolean>;
    refreshPosts: () => Promise<void>;
}

export const useStoryPosts = (userEmail: string | null, username: string | null): UseStoryPostsReturn => {
    const [posts, setPosts] = useState<StoryPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch posts
    const fetchPosts = async () => {
        try {
            setLoading(true);
            setError(null);

            const { data, error: fetchError } = await supabase
                .from('story_posts')
                .select('*')
                .order('created_at', { ascending: false });

            if (fetchError) {
                throw fetchError;
            }

            setPosts(data || []);
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch posts');
        } finally {
            setLoading(false);
        }
    };

    // Subscribe to real-time changes
    useEffect(() => {
        fetchPosts();

        // Set up real-time subscription
        const channel = supabase
            .channel('story_posts_changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'story_posts',
                },
                (payload) => {
                    console.log('Real-time update:', payload);
                    fetchPosts(); // Refetch all posts on any change
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // Create a new post
    const createPost = async (title: string, content: string, imageUri?: string): Promise<boolean> => {
        if (!userEmail || !username) {
            setError('User not authenticated');
            return false;
        }

        try {
            setError(null);
            let imageUrl: string | null = null;

            // Upload image to Cloudinary if provided
            if (imageUri) {
                imageUrl = await uploadImageToCloudinary(imageUri);
            }

            // Insert post into database
            const { error: insertError } = await supabase
                .from('story_posts')
                .insert([
                    {
                        author_email: userEmail,
                        author_username: username,
                        title,
                        content,
                        image_url: imageUrl,
                    },
                ]);

            if (insertError) {
                throw insertError;
            }

            return true;
        } catch (err) {
            console.error('Error creating post:', err);
            setError(err instanceof Error ? err.message : 'Failed to create post');
            return false;
        }
    };

    // Delete a post
    const deletePost = async (postId: string): Promise<boolean> => {
        if (!userEmail) {
            setError('User not authenticated');
            return false;
        }

        try {
            setError(null);

            // Delete from database (RLS will ensure only author can delete)
            const { error: deleteError } = await supabase
                .from('story_posts')
                .delete()
                .eq('id', postId)
                .eq('author_email', userEmail);

            if (deleteError) {
                throw deleteError;
            }

            return true;
        } catch (err) {
            console.error('Error deleting post:', err);
            setError(err instanceof Error ? err.message : 'Failed to delete post');
            return false;
        }
    };

    // Manual refresh
    const refreshPosts = async () => {
        await fetchPosts();
    };

    return {
        posts,
        loading,
        error,
        createPost,
        deletePost,
        refreshPosts,
    };
};
