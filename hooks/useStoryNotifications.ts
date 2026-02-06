import { useAuth } from '@/contexts/AuthContext';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { supabase } from '@/lib/supabase';
import {
    getShownNotifications,
    markNotificationAsShown,
} from '@/utils/notificationHelpers';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

interface StoryPost {
    id: string;
    author_email: string;
    author_username: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
}

export const useStoryNotifications = () => {
    const { userEmail } = useAuth();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [partnerEmail, setPartnerEmail] = useState<string | null>(null);

    // Use shared notification setup hook
    useNotificationSetup('story_posts', 'Story Post Notifications', '#ec4899');

    useEffect(() => {
        if (!userEmail) return;

        // Fetch partner email
        const fetchPartnerEmail = async () => {
            try {
                const { data, error } = await supabase
                    .from('user_pairs')
                    .select('user_email, partner_email')
                    .or(`user_email.eq.${userEmail},partner_email.eq.${userEmail}`)
                    .eq('status', 'accepted')
                    .single();

                if (!error && data) {
                    const partner = data.user_email === userEmail ? data.partner_email : data.user_email;
                    setPartnerEmail(partner);
                }
            } catch (error) {
                console.error('Error fetching partner email:', error);
            }
        };

        fetchPartnerEmail();
    }, [userEmail]);

    useEffect(() => {
        if (!userEmail || !partnerEmail) return;

        // Subscribe to real-time story posts from partner
        const storyChannel = supabase
            .channel('story_posts_notifications')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'story_posts',
                    filter: `author_email=eq.${partnerEmail}`
                },
                async (payload) => {
                    try {
                        const newPost = payload.new as StoryPost;

                        // Check if we've already shown this notification
                        const shownNotifications = await getShownNotifications('story');
                        if (!shownNotifications.includes(newPost.id)) {
                            showStoryNotification(newPost);
                        }
                    } catch (error) {
                        console.error('Error handling story notification:', error);
                    }
                }
            )
            .subscribe();

        setChannel(storyChannel);

        // Cleanup
        return () => {
            if (storyChannel) {
                supabase.removeChannel(storyChannel);
            }
        };
    }, [userEmail, partnerEmail]);

    const showStoryNotification = async (post: StoryPost) => {
        try {
            const createdTime = new Date(post.created_at).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
            });

            await Notifications.scheduleNotificationAsync({
                content: {
                    title: `💕 New story from ${post.author_username}!`,
                    body: `${post.title}\n\nPosted at ${createdTime}`,
                    data: { postId: post.id, type: 'story_post' },
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: null, // Show immediately
            });

            // Mark this notification as shown
            await markNotificationAsShown('story', post.id);
        } catch (error) {
            console.error('Error showing story notification:', error);
        }
    };

    return {
        partnerEmail,
    };
};
