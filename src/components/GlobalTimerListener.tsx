import React, { useEffect, useRef, useState } from 'react';
import { useTimerStore } from '../stores/useTimerStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { SoundService } from '../services/SoundService';
import { LocalNotifications } from '@capacitor/local-notifications';
import { NotificationService } from '../services/NotificationService';
import GlobalAlarmModal from './GlobalAlarmModal';

/**
 * GlobalTimerListener
 * - Runs in the background to check for finished timers
 * - Handles auto-recovery when app wakes from suspension
 * - Triggers sound/notification globally (even if user is on Resume/Settings screen)
 * - Renders Global Alarm Modal on top of everything
 */
const GlobalTimerListener: React.FC = () => {
    const { timers, rehydrateAll } = useTimerStore();
    const { shouldPlaySound, shouldShowNotification } = useSettingsStore();

    // State for the Global Modal
    const [activeAlarmBatchId, setActiveAlarmBatchId] = useState<string | null>(null);
    
    // Track which alarms have already been triggered to prevent looping
    // Format: "batchId-stepNumber"
    const triggeredAlarms = useRef<Set<string>>(new Set());

    // 1. RECOVERY: Sync with wall-clock time on visibility change (app wake up)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                console.log('App resumed: Syncing timers...');
                rehydrateAll();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        
        // Initial sync on mount
        rehydrateAll();

        // One-time setup: Register Notification Actions (Stop Alarm Button)
        NotificationService.registerActions();
        
        // Listener for Notification Actions
        const setupListener = async () => {
            await LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
                console.log('Notification action performed:', notification.actionId);
                if (notification.actionId === 'stop') {
                    // STOP ALARM
                    SoundService.stopAlarmSound();
                    setActiveAlarmBatchId(null); // Close modal if open
                }
            });
        };
        setupListener();

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            LocalNotifications.removeAllListeners();
        };
    }, [rehydrateAll]);

    // 2. MONITOR: Check for finished timers every second
    useEffect(() => {
        const checkTimers = () => {
            const { tick } = useTimerStore.getState(); // Use getState to avoid dependency loop

            // Iterate over all timers
            Object.entries(timers).forEach(([batchId, timer]) => {
                const timerId = `${batchId}-${timer.stepNumber}`;
                
                // 1. TICK: Decrement timer if active
                if (timer.isActive && timer.timeLeft > 0) {
                    tick(batchId);
                }
                
                // 2. CHECK COMPLETION
                if (timer.timeLeft === 0) {
                     // Timer finished!
                    if (!triggeredAlarms.current.has(timerId)) {
                        
                        // Check if we already handled this in this session
                        triggeredAlarms.current.add(timerId);
                        console.log(`Timer finished for ${timerId}, triggering alarm`);

                        // TRIGGER ACTIONS based on Settings
                        
                        // A. Play continuous alarm sound (if enabled)
                        if (shouldPlaySound()) {
                            SoundService.playAlarmSound();
                        }
                        
                        // B. Show Global Modal (Always? Or depends on setting?)
                        // User wants "Global Pop Up". It effectively replaces the sound.
                        // So we show it always if sound triggers.
                        // Actually, modal is visual. Notification is external.
                        // We show Modal regardless of notification setting, because user is IN APP (or app is active).
                        // If app acts as background running, we might be on Profil page. Modal handles it.
                        setActiveAlarmBatchId(batchId);
                        
                        // C. System Notification (handled by Scheduler)
                        // Fallback for Web/Dev
                         if (shouldShowNotification()) {
                            SoundService.showNotification(
                                '⏰ Waktu Habis!',
                                `Timer untuk Batch ${batchId} selesai.`
                            );
                        }
                    }
                } else if (timer.timeLeft > 0) {
                    // Reset trigger if timer is reset/restarted manually
                    if (triggeredAlarms.current.has(timerId)) {
                        triggeredAlarms.current.delete(timerId);
                    }
                }
            });
        };

        const interval = setInterval(checkTimers, 1000);
        return () => clearInterval(interval);
    }, [timers, shouldPlaySound, shouldShowNotification]);

    // Render Global Modal if Active
    if (activeAlarmBatchId) {
        return (
            <GlobalAlarmModal 
                batchId={activeAlarmBatchId} 
                onDismiss={() => {
                    setActiveAlarmBatchId(null);
                    SoundService.stopAlarmSound();
                    // Note: We don't reset timer here, user can do it on the Step page.
                }} 
            />
        );
    }

    return null; // Logic only, no UI
};

export default GlobalTimerListener;
