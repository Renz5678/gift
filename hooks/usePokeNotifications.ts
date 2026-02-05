import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
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
                // Show notifications for queued pokes
                data.forEach((poke) => {
                    showPokeNotification(poke);
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
        }
    };

    return {
        unreadPokes,
        unreadCount: unreadPokes.length,
        markAsRead,
        markAllAsRead
    };
};
