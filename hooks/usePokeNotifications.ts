import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';
import { Platform } from 'react-native';

interface Poke {
    id: string;
    sender_email: string;
    receiver_email: string;
    message: string;
    sent_at: string;
    read_at: string | null;
}

const SHOWN_NOTIFICATIONS_KEY = '@poke_shown_notifications';

// Helper functions to track shown notifications
const getShownNotifications = async (): Promise<string[]> => {
    try {
        const shown = await AsyncStorage.getItem(SHOWN_NOTIFICATIONS_KEY);
        return shown ? JSON.parse(shown) : [];
    } catch (error) {
        console.error('Error getting shown notifications:', error);
        return [];
    }
};

const markNotificationAsShown = async (pokeId: string): Promise<void> => {
    try {
        const shown = await getShownNotifications();
        if (!shown.includes(pokeId)) {
            shown.push(pokeId);
            await AsyncStorage.setItem(SHOWN_NOTIFICATIONS_KEY, JSON.stringify(shown));
        }
    } catch (error) {
        console.error('Error marking notification as shown:', error);
    }
};

const clearShownNotifications = async (): Promise<void> => {
    try {
        await AsyncStorage.removeItem(SHOWN_NOTIFICATIONS_KEY);
    } catch (error) {
        console.error('Error clearing shown notifications:', error);
    }
};

export const usePokeNotifications = () => {
    const { userEmail } = useAuth();
    const [unreadPokes, setUnreadPokes] = useState<Poke[]>([]);
    const [channel, setChannel] = useState<RealtimeChannel | null>(null);

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
                await Notifications.setNotificationChannelAsync('pokes', {
                    name: 'Poke Notifications',
                    importance: Notifications.AndroidImportance.HIGH,
                    vibrationPattern: [0, 250, 250, 250],
                    lightColor: '#dc5454',
                });
            }
        };

        requestPermissions();
    }, []);

    useEffect(() => {
        if (!userEmail) return;

        // Fetch unread pokes on mount (queued pokes)
        const fetchUnreadPokes = async () => {
            const { data, error } = await supabase
                .from('pokes')
                .select('*')
                .eq('receiver_email', userEmail)
                .is('read_at', null)
                .order('sent_at', { ascending: true });

            if (!error && data) {
                setUnreadPokes(data);
                // Only show notifications for pokes that haven't been shown yet
                const shownNotifications = await getShownNotifications();
                data.forEach((poke) => {
                    if (!shownNotifications.includes(poke.id)) {
                        showPokeNotification(poke);
                    }
                });
            }
        };

        fetchUnreadPokes();

        // Subscribe to real-time pokes
        const pokeChannel = supabase
            .channel('pokes-channel')
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'pokes',
                    filter: `receiver_email=eq.${userEmail}`
                },
                (payload) => {
                    const newPoke = payload.new as Poke;
                    setUnreadPokes((prev) => [...prev, newPoke]);
                    showPokeNotification(newPoke);
                }
            )
            .subscribe();

        setChannel(pokeChannel);

        // Cleanup
        return () => {
            if (pokeChannel) {
                supabase.removeChannel(pokeChannel);
            }
        };
    }, [userEmail]);

    const showPokeNotification = async (poke: Poke) => {
        const sentTime = new Date(poke.sent_at).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });

        // Fetch sender's username
        const { data: senderData } = await supabase
            .from('users')
            .select('username')
            .eq('email', poke.sender_email)
            .single();

        const senderName = senderData?.username || 'Your partner';

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `💕 Poke from ${senderName}!`,
                body: `${poke.message}\n\nSent at ${sentTime}`,
                data: { pokeId: poke.id },
                sound: true,
                priority: Notifications.AndroidNotificationPriority.HIGH,
            },
            trigger: null, // Show immediately
        });

        // Mark this notification as shown
        await markNotificationAsShown(poke.id);
    };

    const markAsRead = async (pokeId: string) => {
        const { error } = await supabase
            .from('pokes')
            .update({ read_at: new Date().toISOString() })
            .eq('id', pokeId);

        if (!error) {
            setUnreadPokes((prev) => prev.filter((p) => p.id !== pokeId));
        }
    };

    const markAllAsRead = async () => {
        if (unreadPokes.length === 0) return;

        const { error } = await supabase
            .from('pokes')
            .update({ read_at: new Date().toISOString() })
            .eq('receiver_email', userEmail)
            .is('read_at', null);

        if (!error) {
            setUnreadPokes([]);
            // Clear shown notifications when all are marked as read
            await clearShownNotifications();
        }
    };

    return {
        unreadPokes,
        unreadCount: unreadPokes.length,
        markAsRead,
        markAllAsRead
    };
};
