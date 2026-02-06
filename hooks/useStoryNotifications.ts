import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface StoryPost {
    id: string;
    author_email: string;
    author_username: string;
    title: string;
    content: string;
    image_url: string | null;
    created_at: string;
}

const SHOWN_STORY_NOTIFICATIONS_KEY = '@story_shown_notifications';

// Helper functions to track shown notifications
const getShownNotifications = async (): Promise<string[]> => {
    try {
        const shown = await AsyncStorage.getItem(SHOWN_STORY_NOTIFICATIONS_KEY);
        return shown ? JSON.parse(shown) : [];
    } catch (error) {
        console.error('Error getting shown story notifications:', error);
        return [];
    }
};

const markNotificationAsShown = async (postId: string): Promise<void> => {
    try {
        const shown = await getShownNotifications();
        if (!shown.includes(postId)) {
            shown.push(postId);
            await AsyncStorage.setItem(SHOWN_STORY_NOTIFICATIONS_KEY, JSON.stringify(shown));
        }
    } catch (error) {
        console.error('Error marking story notification as shown:', error);
    }
};

export const useStoryNotifications = () => {
    const { userEmail } = useAuth();
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);
    const [partnerEmail, setPartnerEmail] = useState<string | null>(null);

    useEffect(() => {
        // Configure how notifications should be displayed
        Notifications.setNotificationHandler({
            handleNotification: async () => ({
                shouldShowAlert: true,
                shouldPlaySound: true,
                shouldSetBadge: true,
                shouldShowBanner: true,
                shouldShowList: true,
            }),
        });

        // Request notification permissions
        const requestPermissions = async () => {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;

            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }

            if (finalStatus !== 'granted') {
                console.log('Notification permissions not granted');
                return;
            }

            // Configure notification channel for Android
            if (Platform.OS === 'android') {
                await Notifications.setNotificationChannelAsync('story_posts', {
                    name: 'Story Post Notifications',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#ec4899',
                });
            }
        };

        requestPermissions();
    }, []);

    useEffect(() => {
        if (!userEmail) return;

        // Fetch partner email
        const fetchPartnerEmail = async () => {
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
                    const newPost = payload.new as StoryPost;

                    // Check if we've already shown this notification
                    const shownNotifications = await getShownNotifications();
                    if (!shownNotifications.includes(newPost.id)) {
                        showStoryNotification(newPost);
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
        await markNotificationAsShown(post.id);
    };

    return {
        partnerEmail,
    };
};
