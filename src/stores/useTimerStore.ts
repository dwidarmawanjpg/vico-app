import { create } from 'zustand';
import { TimerService } from '../services/TimerService';
import { NotificationService } from '../services/NotificationService';
import type { StepNumber } from '../types/batch';

/**
 * PATCH 1: Multi-Timer Store Structure
 * Uses a dictionary/map to support multiple concurrent timers
 * (e.g., Batch A in Fermentation while Batch B in Extraction)
 */

interface TimerData {
  timeLeft: number;        // Remaining time in seconds
  isActive: boolean;       // Is timer running
  totalDuration: number;   // Total duration for this step
  stepNumber: number;      // Current step number
}

interface TimerStore {
  // Dictionary of timers keyed by batchId
  timers: Record<string, TimerData>;
  
  // Actions
  initTimer: (batchId: string, stepNumber: StepNumber) => Promise<void>;
  initCustomTimer: (batchId: string, stepNumber: number, duration: number) => Promise<void>;
  startTimer: (batchId: string) => void;
  pauseTimer: (batchId: string) => Promise<void>;
  resumeTimer: (batchId: string) => Promise<void>;
  resetTimer: (batchId: string) => Promise<void>;
  tick: (batchId: string) => void;
  removeTimer: (batchId: string) => void;
  rehydrateAll: () => Promise<void>;
  getTimer: (batchId: string) => TimerData | undefined;
}

export const useTimerStore = create<TimerStore>((set, get) => ({
  timers: {},

  // Initialize a timer for a specific batch and step
  initTimer: async (batchId: string, stepNumber: StepNumber) => {
    const timer = await TimerService.startTimer(batchId, stepNumber);
    if (!timer) return; // Step has no timer
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: {
          timeLeft: timer.totalDuration,
          isActive: false,
          totalDuration: timer.totalDuration,
          stepNumber: timer.stepNumber,
        },
      },
    }));
  },

  // Initialize with custom duration
  initCustomTimer: async (batchId: string, stepNumber: number, duration: number) => {
    await TimerService.startCustomTimer(batchId, stepNumber, duration);
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: {
          timeLeft: duration,
          isActive: false,
          totalDuration: duration,
          stepNumber,
        },
      },
    }));
  },

  // Start/activate a timer
  startTimer: async (batchId: string) => { // Updated to async
    const timer = get().timers[batchId];
    if (!timer) return;
    
    // IMPORTANT: Persist active state to DB!
    await TimerService.activateTimer(batchId);
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: { ...timer, isActive: true },
      },
    }));

    // Schedule notification for remaining time
    const finishTime = Date.now() + (timer.timeLeft * 1000);
    NotificationService.scheduleTimer(batchId, finishTime, timer.totalDuration);
  },

  // Pause a timer and persist to DB
  pauseTimer: async (batchId: string) => {
    const timer = get().timers[batchId];
    if (!timer) return;
    
    await TimerService.pauseTimer(batchId);
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: { ...timer, isActive: false },
      },
    }));

    // Cancel pending notification
    NotificationService.cancelTimer(batchId);
  },

  // Resume a timer from paused state
  resumeTimer: async (batchId: string) => {
    const timer = get().timers[batchId];
    if (!timer) return;
    
    await TimerService.resumeTimer(batchId);
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: { ...timer, isActive: true },
      },
    }));

    // Re-schedule notification
    const finishTime = Date.now() + (timer.timeLeft * 1000);
    NotificationService.scheduleTimer(batchId, finishTime, timer.totalDuration);
  },

  // Reset timer to full duration
  resetTimer: async (batchId: string) => {
    console.log(`[TimerStore] Resetting timer for ${batchId}`);
    try {
        const timer = get().timers[batchId];
        if (!timer) {
            console.error(`[TimerStore] Timer not found for ${batchId}`);
            return;
        }
        
        await TimerService.resetTimer(batchId);
        
        set((state) => ({
          timers: {
            ...state.timers,
            [batchId]: {
              ...timer,
              timeLeft: timer.totalDuration,
              isActive: false,
            },
          },
        }));
        console.log(`[TimerStore] Timer reset state updated. New timeLeft: ${timer.totalDuration}`);
    
        // Cancel any notifications
        await NotificationService.cancelTimer(batchId);
    } catch (e) {
        console.error('[TimerStore] Failed to reset timer:', e);
        throw e; // Propagate to component
    }
  },

  // Decrement timer by 1 second (called from interval)
  tick: (batchId: string) => {
    const timer = get().timers[batchId];
    // ... existing tick logic (no change needed for notification) ...
    if (!timer || !timer.isActive || timer.timeLeft <= 0) return;
    
    const newTimeLeft = Math.max(0, timer.timeLeft - 1);
    
    set((state) => ({
      timers: {
        ...state.timers,
        [batchId]: {
          ...timer,
          timeLeft: newTimeLeft,
          // Auto-pause when timer reaches 0 (timer finished)
          isActive: newTimeLeft > 0 ? timer.isActive : false,
        },
      },
    }));
  },

  // Remove a timer (when batch is completed)
  removeTimer: (batchId: string) => {
    set((state) => {
      const { [batchId]: _, ...rest } = state.timers;
      return { timers: rest };
    });
    NotificationService.cancelTimer(batchId);
  },

  // Rehydrate all timers from IndexedDB on app load
  rehydrateAll: async () => {
    const timerStates = await TimerService.rehydrate();
    
    const timers: Record<string, TimerData> = {};
    
    timerStates.forEach((data, batchId) => {
      timers[batchId] = {
        timeLeft: data.remaining,
        isActive: data.isActive,
        totalDuration: data.totalDuration,
        stepNumber: data.stepNumber,
      };
    });
    
    set({ timers });
  },

  // Get timer for a specific batch
  getTimer: (batchId: string) => {
    return get().timers[batchId];
  },
}));
