import { LocalNotifications } from '@capacitor/local-notifications';
import { useSettingsStore } from '../stores/useSettingsStore';

// Helper to convert string IDs to stable integers for Android notifications
function hashString(s: string): number {
    let hash = 0;
    if (s.length === 0) return hash;
    for (let i = 0; i < s.length; i++) {
        const char = s.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash); // Positive int
}

export const NotificationService = {
    async registerActions() {
        try {
            await LocalNotifications.registerActionTypes({
                types: [{
                    id: 'ALARM_ACTION',
                    actions: [{
                        id: 'stop',
                        title: 'Matikan Alarm',
                        destructive: true,
                        foreground: true // Bring app to foreground to handle stopping sound reliably
                    }]
                }]
            });
        } catch (e) {
            console.error('Failed to register notification actions:', e);
        }
    },

    /**
     * Schedule a notification for when the timer finishes
     */
    async scheduleTimer(batchId: string, finishTime: number, totalDuration: number) {
        // Check settings first
        const { shouldShowNotification } = useSettingsStore.getState();
        if (!shouldShowNotification()) return;

        const notifId = hashString(batchId);
        
        try {
            // Cancel any existing notification for this batch first
            await LocalNotifications.cancel({ notifications: [{ id: notifId }] });

            // Schedule new notification
            await LocalNotifications.schedule({
                notifications: [{
                    id: notifId,
                    title: "⏰ Waktu Habis!",
                    body: `Timer untuk Batch ${batchId} telah selesai.`,
                    schedule: { at: new Date(finishTime) }, // EXACT future time
                    sound: undefined, // Default system sound
                    actionTypeId: 'ALARM_ACTION', // Link to action
                    extra: { batchId },
                    channelId: 'default'
                }]
            });
            console.log(`Scheduled notification for ${batchId} at ${new Date(finishTime).toLocaleTimeString()} (Total: ${totalDuration}s)`);
        } catch (error) {
            console.error('Failed to schedule notification:', error);
        }
    },

    /**
     * Cancel a scheduled notification (e.g. when paused or reset)
     */
    async cancelTimer(batchId: string) {
        const notifId = hashString(batchId);
        try {
            await LocalNotifications.cancel({ notifications: [{ id: notifId }] });
            // remove pending also if needed
             const pending = await LocalNotifications.getPending();
             if (pending.notifications.some(n => n.id === notifId)) {
                 // cancel explicitly again if needed, but 'cancel' handles pending
             }
        } catch (error) {
            console.error('Failed to cancel notification:', error);
        }
    }
};
