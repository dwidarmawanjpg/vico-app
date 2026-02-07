/**
 * SoundService - Synthesized alarm sounds using Web Audio API
 * Works offline without external audio files
 */

let audioContext: AudioContext | null = null;
let currentOscillator: OscillatorNode | null = null;
let currentGain: GainNode | null = null;
let isPlaying = false;
let beepInterval: NodeJS.Timeout | null = null;

/**
 * Initialize AudioContext (must be called after user interaction)
 */
function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    // Resume if suspended (browser policy)
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
    return audioContext;
}

/**
 * Play a single beep at specified frequency
 */
function playBeep(frequency: number = 880, duration: number = 200): void {
    const ctx = getAudioContext();
    
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine';
    
    // Envelope for smooth sound
    const now = ctx.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.01); // Attack
    gainNode.gain.linearRampToValueAtTime(0.3, now + duration / 1000 * 0.5); // Decay
    gainNode.gain.linearRampToValueAtTime(0, now + duration / 1000); // Release
    
    oscillator.start(now);
    oscillator.stop(now + duration / 1000);
}

/**
 * Play repeating alarm pattern (Beep-Beep-Pause)
 * Call stopAlarmSound() to stop
 */
export function playAlarmSound(): void {
    if (isPlaying) return;
    isPlaying = true;
    
    // Play initial beeps
    playDoubleBeep();
    
    // Repeat pattern every 2 seconds
    beepInterval = setInterval(() => {
        if (isPlaying) {
            playDoubleBeep();
        }
    }, 2000);
}

/**
 * Play double beep pattern
 */
function playDoubleBeep(): void {
    playBeep(880, 150); // First beep (A5)
    setTimeout(() => {
        playBeep(1047, 200); // Second beep higher (C6)
    }, 200);
}

/**
 * Stop the alarm sound
 */
export function stopAlarmSound(): void {
    isPlaying = false;
    
    if (beepInterval) {
        clearInterval(beepInterval);
        beepInterval = null;
    }
    
    if (currentOscillator) {
        try {
            currentOscillator.stop();
        } catch (e) {
            // Already stopped
        }
        currentOscillator = null;
    }
    
    if (currentGain) {
        currentGain.disconnect();
        currentGain = null;
    }
}

/**
 * Play a short confirmation beep (for button presses, etc.)
 */
export function playConfirmBeep(): void {
    playBeep(587, 100); // D5 - softer confirmation
}

/**
 * Play success chime (3 ascending tones)
 */
export function playSuccessChime(): void {
    playBeep(523, 150); // C5
    setTimeout(() => playBeep(659, 150), 150); // E5
    setTimeout(() => playBeep(784, 200), 300); // G5
}

/**
 * Check if sound is currently playing
 */
export function isSoundPlaying(): boolean {
    return isPlaying;
}

/**
 * Request notification permission from user
 * Should be called after user interaction
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
        console.warn('Notifications not supported in this browser');
        return 'denied';
    }
    
    if (Notification.permission === 'granted') {
        return 'granted';
    }
    
    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        return permission;
    }
    
    return Notification.permission;
}

/**
 * Show a notification (if permission granted)
 */
export function showNotification(title: string, body: string, options?: NotificationOptions): void {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
        const notification = new Notification(title, {
            body,
            icon: '/vico-logo.svg',
            badge: '/vico-logo.svg',
            tag: 'vico-timer',
            requireInteraction: true,
            ...options
        });
        
        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
        
        // Focus app when clicked
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
    if (!('Notification' in window)) {
        return 'unsupported';
    }
    return Notification.permission;
}

export const SoundService = {
    playAlarmSound,
    stopAlarmSound,
    playConfirmBeep,
    playSuccessChime,
    isSoundPlaying,
    requestNotificationPermission,
    showNotification,
    getNotificationPermission,
};

export default SoundService;
