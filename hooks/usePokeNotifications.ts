import { useAuth } from '@/contexts/AuthContext';
import { useNotificationSetup } from '@/hooks/useNotificationSetup';
import { supabase } from '@/lib/supabase';
import {
    clearShownNotifications,
    getShownNotifications,
    markNotificationAsShown,
    removeShownNotifications,
} from '@/utils/notificationHelpers';
import { RealtimeChannel } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { useEffect, useState } from 'react';

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

    // Use shared notification setup hook
    useNotificationSetup('pokes', 'Poke Notifications', '#dc5454');

    useEffect(() => {
        if (!userEmail) return;

        // Fetch unread pokes on mount (queued pokes)
        const fetchUnreadPokes = async () => {
            try {
                const { data, error } = await supabase
                    .from('pokes')
                    .select('*')
                    .eq('receiver_email', userEmail)
                    .is('read_at', null)
                    .order('sent_at', { ascending: true });

                if (!error && data) {
                    setUnreadPokes(data);
                    // Only show notifications for pokes that haven't been shown yet
                    const shownNotifications = await getShownNotifications('poke');
                    data.forEach((poke) => {
                        if (!shownNotifications.includes(poke.id)) {
                            showPokeNotification(poke);
                        }
                    });
                }
            } catch (error) {
                console.error('Error fetching unread pokes:', error);
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
        try {
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
            await markNotificationAsShown('poke', poke.id);
        } catch (error) {
            console.error('Error showing poke notification:', error);
        }
    };

    const markAsRead = async (pokeId: string) => {
        try {
            const { error } = await supabase
                .from('pokes')
                .update({ read_at: new Date().toISOString() })
                .eq('id', pokeId);

            if (!error) {
                setUnreadPokes((prev) => prev.filter((p) => p.id !== pokeId));
                // Clean up the shown notification tracking
                await removeShownNotifications('poke', [pokeId]);
            }
        } catch (error) {
            console.error('Error marking poke as read:', error);
        }
    };

    const markAllAsRead = async () => {
        if (unreadPokes.length === 0) return;

        try {
            const { error } = await supabase
                .from('pokes')
                .update({ read_at: new Date().toISOString() })
                .eq('receiver_email', userEmail)
                .is('read_at', null);

            if (!error) {
                setUnreadPokes([]);
                // Clear all shown notifications when all are marked as read
                await clearShownNotifications('poke');
            }
        } catch (error) {
            console.error('Error marking all pokes as read:', error);
        }
    };

    return {
        unreadPokes,
        unreadCount: unreadPokes.length,
        markAsRead,
        markAllAsRead
    };
};
