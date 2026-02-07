import React, { useEffect, useRef } from 'react';
import { useTimerStore } from '../stores/useTimerStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { SoundService } from '../services/SoundService';

/**
 * GlobalTimerListener
 * - Runs in the background to check for finished timers
 * - Handles auto-recovery when app wakes from suspension
 * - Triggers sound/notification globally (even if user is on Resume/Settings screen)
 */
const GlobalTimerListener: React.FC = () => {
    const { timers, rehydrateAll } = useTimerStore();
    const { shouldPlaySound, shouldShowNotification } = useSettingsStore();
    
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

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [rehydrateAll]);

    // 2. MONITOR: Check for finished timers every second
    useEffect(() => {
        const checkTimers = () => {
            Object.entries(timers).forEach(([batchId, timer]) => {
                const timerId = `${batchId}-${timer.stepNumber}`;
                
                // Condition: Timer finished (timeLeft === 0)
                // Note: We check 0 because our tick function stops at 0
                if (timer.timeLeft === 0) {
                    // Check if already triggered
                    if (!triggeredAlarms.current.has(timerId)) {
                        console.log(`Timer finished for ${timerId}, triggering alarm`);
                        triggeredAlarms.current.add(timerId);
                        
                        // Trigger Output
                        if (shouldPlaySound()) {
                            SoundService.playAlarmSound();
                        }
                        
                        if (shouldShowNotification()) {
                            SoundService.showNotification(
                                '⏰ Waktu Habis!',
                                `Timer untuk Batch selesai.`
                            );
                        }
                    }
                } else if (timer.timeLeft > 0) {
                    // Reset trigger if timer is reset/restarted
                    if (triggeredAlarms.current.has(timerId)) {
                        triggeredAlarms.current.delete(timerId);
                    }
                }
            });
        };

        const interval = setInterval(checkTimers, 1000);
        return () => clearInterval(interval);
    }, [timers, shouldPlaySound, shouldShowNotification]);

    return null; // Logic only, no UI
};

export default GlobalTimerListener;
