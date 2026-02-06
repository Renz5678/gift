import AsyncStorage from '@react-native-async-storage/async-storage';

const POKE_NOTIFICATIONS_KEY = '@poke_shown_notifications';
const STORY_NOTIFICATIONS_KEY = '@story_shown_notifications';
const MAX_TRACKED_NOTIFICATIONS = 100; // Prevent unbounded growth

/**
 * Gets the list of shown notification IDs for a specific type
 * @param type - The type of notification ('poke' or 'story')
 * @returns Array of notification IDs that have been shown
 */
export const getShownNotifications = async (type: 'poke' | 'story'): Promise<string[]> => {
    try {
        const key = type === 'poke' ? POKE_NOTIFICATIONS_KEY : STORY_NOTIFICATIONS_KEY;
        const shown = await AsyncStorage.getItem(key);
        return shown ? JSON.parse(shown) : [];
    } catch (error) {
        console.error(`Error getting shown ${type} notifications:`, error);
        return [];
    }
};

/**
 * Marks a notification as shown to prevent duplicate displays
 * @param type - The type of notification ('poke' or 'story')
 * @param notificationId - The ID of the notification to mark as shown
 */
export const markNotificationAsShown = async (
    type: 'poke' | 'story',
    notificationId: string
): Promise<void> => {
    try {
        const shown = await getShownNotifications(type);

        if (!shown.includes(notificationId)) {
            // Add new notification ID
            shown.push(notificationId);

            // Trim array if it exceeds max size (keep most recent)
            const trimmedShown = shown.length > MAX_TRACKED_NOTIFICATIONS
                ? shown.slice(-MAX_TRACKED_NOTIFICATIONS)
                : shown;

            const key = type === 'poke' ? POKE_NOTIFICATIONS_KEY : STORY_NOTIFICATIONS_KEY;
            await AsyncStorage.setItem(key, JSON.stringify(trimmedShown));
        }
    } catch (error) {
        console.error(`Error marking ${type} notification as shown:`, error);
    }
};

/**
 * Clears all shown notification tracking for a specific type
 * Useful when marking all notifications as read
 * @param type - The type of notification ('poke' or 'story')
 */
export const clearShownNotifications = async (type: 'poke' | 'story'): Promise<void> => {
    try {
        const key = type === 'poke' ? POKE_NOTIFICATIONS_KEY : STORY_NOTIFICATIONS_KEY;
        await AsyncStorage.removeItem(key);
    } catch (error) {
        console.error(`Error clearing shown ${type} notifications:`, error);
    }
};

/**
 * Removes specific notification IDs from the tracking list
 * Useful for cleanup when notifications are marked as read
 * @param type - The type of notification ('poke' or 'story')
 * @param notificationIds - Array of notification IDs to remove
 */
export const removeShownNotifications = async (
    type: 'poke' | 'story',
    notificationIds: string[]
): Promise<void> => {
    try {
        const shown = await getShownNotifications(type);
        const filtered = shown.filter(id => !notificationIds.includes(id));

        const key = type === 'poke' ? POKE_NOTIFICATIONS_KEY : STORY_NOTIFICATIONS_KEY;
        await AsyncStorage.setItem(key, JSON.stringify(filtered));
    } catch (error) {
        console.error(`Error removing shown ${type} notifications:`, error);
    }
};
