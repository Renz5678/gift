import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';
import { Platform } from 'react-native';

/**
 * Shared hook for setting up notification permissions and handlers
 * Eliminates duplicate code between usePokeNotifications and useStoryNotifications
 * @param channelId - The Android notification channel ID
 * @param channelName - The Android notification channel name
 * @param lightColor - The notification light color (hex)
 */
export const useNotificationSetup = (
    channelId: string,
    channelName: string,
    lightColor: string = '#dc5454'
) => {
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
            try {
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
                    await Notifications.setNotificationChannelAsync(channelId, {
                        name: channelName,
                        importance: Notifications.AndroidImportance.HIGH,
                        vibrationPattern: [0, 250, 250, 250],
                        lightColor,
                    });
                }
            } catch (error) {
                console.error('Error setting up notifications:', error);
            }
        };

        requestPermissions();
    }, [channelId, channelName, lightColor]);
};
