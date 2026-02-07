/**
 * Settings Store - Persists app settings to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    // Notification & Sound settings
    alarmEnabled: boolean;
    soundEnabled: boolean;
    
    // Notification permission status
    notificationPermission: NotificationPermission | 'unsupported' | 'pending';
    
    // Actions
    setAlarmEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setNotificationPermission: (permission: NotificationPermission | 'unsupported' | 'pending') => void;
    
    // Combined check for playing sounds
    shouldPlaySound: () => boolean;
    shouldShowNotification: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Defaults
            alarmEnabled: true,
            soundEnabled: true,
            notificationPermission: 'pending',
            
            // Setters
            setAlarmEnabled: (enabled) => set({ alarmEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setNotificationPermission: (permission) => set({ notificationPermission: permission }),
            
            // Helpers
            shouldPlaySound: () => {
                const { alarmEnabled, soundEnabled } = get();
                return alarmEnabled && soundEnabled;
            },
            
            shouldShowNotification: () => {
                const { alarmEnabled, notificationPermission } = get();
                return alarmEnabled && notificationPermission === 'granted';
            },
        }),
        {
            name: 'vico-settings',
            partialize: (state) => ({
                alarmEnabled: state.alarmEnabled,
                soundEnabled: state.soundEnabled,
                // Don't persist permission - check at runtime
            }),
        }
    )
);

export default useSettingsStore;
