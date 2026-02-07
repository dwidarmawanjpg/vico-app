import { db } from '../db/database';
import type { TimerInstance } from '../types/batch';
import { SOP_STEPS, type StepNumber } from '../types/batch';

/**
 * TimerService - Timer management with IndexedDB persistence for rehydration
 * Handles start, pause, resume, and calculating remaining time across app restarts
 */
export const TimerService = {
  /**
   * Start a timer for a specific batch and step
   */
  async startTimer(batchId: string, stepNumber: StepNumber): Promise<TimerInstance | null> {
    const stepConfig = SOP_STEPS[stepNumber];
    if (!stepConfig.timer) return null; // No timer for this step
    
    const timer: TimerInstance = {
      batchId,
      stepNumber,
      totalDuration: stepConfig.timer,
      startTime: Date.now(),
      pausedAt: null,
      remainingWhenPaused: null,
      isActive: true,
    };
    
    // Upsert timer (delete existing if any)
    await db.timers.put(timer);
    return timer;
  },

  /**
   * Start a timer with custom duration
   */
  async startCustomTimer(batchId: string, stepNumber: number, duration: number): Promise<TimerInstance> {
    const timer: TimerInstance = {
      batchId,
      stepNumber,
      totalDuration: duration,
      startTime: Date.now(),
      pausedAt: null,
      remainingWhenPaused: null,
      isActive: true,
    };
    
    await db.timers.put(timer);
    return timer;
  },

  /**
   * Activate an existing timer (e.g. start after reset)
   * Preserves totalDuration
   */
  async activateTimer(batchId: string): Promise<void> {
    const timer = await db.timers.get(batchId);
    if (!timer) return; // Should exist

    await db.timers.update(batchId, {
      startTime: Date.now(),
      isActive: true,
      pausedAt: null,
      remainingWhenPaused: null,
    });
  },

  /**
   * Pause a timer - stores the paused timestamp and remaining time
   */
  async pauseTimer(batchId: string): Promise<void> {
    const timer = await db.timers.get(batchId);
    if (!timer || !timer.isActive) return;
    
    const remaining = this.calculateRemaining(timer);
    
    await db.timers.update(batchId, {
      pausedAt: Date.now(),
      remainingWhenPaused: remaining,
      isActive: false,
    });
  },

  /**
   * Resume a paused timer - recalculates start time based on remaining
   */
  async resumeTimer(batchId: string): Promise<void> {
    const timer = await db.timers.get(batchId);
    if (!timer || timer.isActive || timer.remainingWhenPaused === null) return;
    
    // Calculate new start time so that elapsed + remaining = total
    const newStartTime = Date.now() - (timer.totalDuration - timer.remainingWhenPaused) * 1000;
    
    await db.timers.update(batchId, {
      startTime: newStartTime,
      pausedAt: null,
      remainingWhenPaused: null,
      isActive: true,
    });
  },

  /**
   * Reset timer to full duration
   */
  async resetTimer(batchId: string): Promise<void> {
    const timer = await db.timers.get(batchId);
    if (!timer) return;
    
    await db.timers.update(batchId, {
      startTime: null, // Reset to null so calculateRemaining returns totalDuration
      pausedAt: null,
      remainingWhenPaused: null,
      isActive: false,
    });
  },

  /**
   * Get timer state for a batch
   */
  async getTimer(batchId: string): Promise<TimerInstance | undefined> {
    return db.timers.get(batchId);
  },

  /**
   * Get remaining time in seconds
   */
  getRemainingTime(timer: TimerInstance): number {
    return this.calculateRemaining(timer);
  },

  /**
   * Calculate remaining time for a timer
   */
  calculateRemaining(timer: TimerInstance): number {
    if (!timer.isActive && timer.remainingWhenPaused !== null) {
      return Math.max(0, timer.remainingWhenPaused);
    }
    
    if (!timer.startTime) return timer.totalDuration;
    
    const elapsedMs = Date.now() - timer.startTime;
    const elapsedSeconds = Math.floor(elapsedMs / 1000);
    const remaining = timer.totalDuration - elapsedSeconds;
    
    return Math.max(0, remaining);
  },

  /**
   * Rehydrate all active timers from IndexedDB on app load
   * Returns timers with updated remaining times
   */
  async rehydrate(): Promise<Map<string, { remaining: number; isActive: boolean; stepNumber: number; totalDuration: number }>> {
    const timers = await db.timers.toArray();
    const result = new Map<string, { remaining: number; isActive: boolean; stepNumber: number; totalDuration: number }>();
    
    for (const timer of timers) {
      const remaining = this.calculateRemaining(timer);
      result.set(timer.batchId, {
        remaining,
        isActive: timer.isActive,
        stepNumber: timer.stepNumber,
        totalDuration: timer.totalDuration,
      });
    }
    
    return result;
  },

  /**
   * Delete timer for a batch
   */
  async deleteTimer(batchId: string): Promise<void> {
    await db.timers.delete(batchId);
  },

  /**
   * Get default duration for a step
   */
  getStepDuration(stepNumber: StepNumber): number | null {
    return SOP_STEPS[stepNumber].timer;
  },
};
