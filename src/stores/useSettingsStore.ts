/**
 * Settings Store - Persists app settings to localStorage
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SettingsState {
    // Notification & Sound settings
    notificationEnabled: boolean; // "Notifikasi Background"
    soundEnabled: boolean;        // "Suara Alarm"
    
    // Notification permission status
    notificationPermission: NotificationPermission | 'unsupported' | 'pending';
    
    // Actions
    setNotificationEnabled: (enabled: boolean) => void;
    setSoundEnabled: (enabled: boolean) => void;
    setNotificationPermission: (permission: NotificationPermission | 'unsupported' | 'pending') => void;
    
    // Checkers
    shouldPlaySound: () => boolean;
    shouldShowNotification: () => boolean;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set, get) => ({
            // Defaults
            notificationEnabled: true,
            soundEnabled: true,
            notificationPermission: 'pending',
            
            // Setters
            setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),
            setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
            setNotificationPermission: (permission) => set({ notificationPermission: permission }),
            
            // Helpers
            shouldPlaySound: () => {
                const { soundEnabled } = get();
                return soundEnabled;
            },
            
            shouldShowNotification: () => {
                const { notificationEnabled, notificationPermission } = get();
                // We check permission here, but UI should also enforce it
                return notificationEnabled && notificationPermission === 'granted';
            },
        }),
        {
            name: 'vico-settings',
            partialize: (state) => ({
                notificationEnabled: state.notificationEnabled,
                soundEnabled: state.soundEnabled,
            }),
        }
    )
);

export default useSettingsStore;
