import { BatchRepository } from '../repositories/BatchRepository';
import { db, generateBatchId } from '../db/database';
import type { Batch, QCResult, StepChecklists, StepNumber } from '../types/batch';
import { QC_STEP } from '../types/batch';

interface CreateBatchParams {
  inputWeight: number;
  inputMode: 'gram' | 'target';
  isManualMode: boolean;
  productionDate?: Date;
}

/**
 * BatchService - Business logic for batch operations
 * Uses BatchRepository for database access
 */
export const BatchService = {
  /**
   * Create a new batch
   * PATCH 2: If isManualMode is true, skip to QC step directly
   */
  async createBatch(params: CreateBatchParams): Promise<Batch> {
    const { inputWeight, inputMode, isManualMode, productionDate = new Date() } = params;
    
    // Calculate water volume (1:1 ratio - 1kg coconut = 1L water)
    const waterVolume = inputWeight / 1000;
    
    // Generate unique batch ID
    const id = await generateBatchId(productionDate);
    
    const now = Date.now();
    
    const batch: Batch = {
      id,
      date: productionDate.getTime(),
      status: 'process',
      inputWeight,
      waterVolume,
      inputMode,
      isManualMode,
      // PATCH 2: Manual mode skips to QC (step 7), normal mode starts at step 1
      currentStep: isManualMode ? QC_STEP : 1,
      checklists: {},
      qcResult: null,
      createdAt: now,
      updatedAt: now,
    };
    
    await BatchRepository.create(batch);
    return batch;
  },

  /**
   * Get a batch by ID
   */
  async getBatch(id: string): Promise<Batch | undefined> {
    return BatchRepository.getById(id);
  },

  /**
   * Update a batch with partial data
   */
  async updateBatch(id: string, data: Partial<Batch>): Promise<void> {
    await BatchRepository.update(id, data);
  },

  /**
   * Get all active batches (for home screen display)
   */
  async getActiveBatches(): Promise<Batch[]> {
    return BatchRepository.getActive();
  },

  /**
   * Get all completed/failed batches for history
   */
  async getHistoryBatches(): Promise<Batch[]> {
    const all = await BatchRepository.getAll();
    return all.filter(b => b.status === 'done' || b.status === 'failed');
  },

  /**
   * Get monthly statistics for the current month
   */
  async getMonthlyStats(): Promise<{ totalVcoMl: number; batchCount: number; targetMl: number }> {
    const all = await BatchRepository.getAll();
    
    // Get current month boundaries
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999).getTime();
    
    // Filter batches completed in current month
    const monthlyBatches = all.filter(b => 
      b.status === 'done' && 
      b.date >= startOfMonth && 
      b.date <= endOfMonth
    );
    
    // Calculate total VCO
    const totalVcoMl = monthlyBatches.reduce((sum, batch) => {
      return sum + (batch.qcResult?.qc_total_vco_ml ?? 0);
    }, 0);
    
    return {
      totalVcoMl,
      batchCount: monthlyBatches.length,
      targetMl: 3800, // Default monthly target
    };
  },

  /**
   * Update step progress - advance to next step if all checklists complete
   */
  async updateStepProgress(
    batchId: string, 
    stepNumber: StepNumber, 
    checklist: Partial<StepChecklists>,
    shouldAdvance: boolean = false
  ): Promise<{ advanced: boolean; nextStep: number }> {
    const batch = await BatchRepository.getById(batchId);
    
    // Defensive: If batch not found, return safe default (no advancement)
    if (!batch) {
      console.warn(`Batch ${batchId} not found - may have been deleted`);
      return { advanced: false, nextStep: stepNumber };
    }
    
    // Merge new checklist items
    const updatedChecklists = { ...batch.checklists, ...checklist };
    
    let nextStep = batch.currentStep;
    
    if (shouldAdvance && stepNumber === batch.currentStep) {
      // Advance to next step (or QC if completing step 6)
      nextStep = stepNumber >= 6 ? QC_STEP : stepNumber + 1;
    }
    
    await BatchRepository.update(batchId, {
      checklists: updatedChecklists,
      currentStep: nextStep,
    });
    
    return { advanced: nextStep !== batch.currentStep, nextStep };
  },

  /**
   * Update current step directly (for navigation)
   */
  async setCurrentStep(batchId: string, step: number): Promise<void> {
    await BatchRepository.update(batchId, { currentStep: step });
  },

  /**
   * Cancel a batch - set status to failed
   */
  async cancelBatch(batchId: string): Promise<void> {
    await BatchRepository.update(batchId, { status: 'failed' });
    // Also delete any associated timer
    await db.timers.delete(batchId);
  },

  /**
   * Save batch as draft
   */
  async saveDraft(batchId: string, qcResult?: Partial<QCResult>): Promise<void> {
    const updateData: Partial<Batch> = { status: 'draft' };
    if (qcResult) {
      updateData.qcResult = qcResult as QCResult;
    }
    await BatchRepository.update(batchId, updateData);
  },

  /**
   * Finalize a batch - set status to done with QC result
   */
  async finalizeBatch(batchId: string, qcResult: QCResult): Promise<void> {
    await BatchRepository.update(batchId, {
      status: 'done',
      currentStep: QC_STEP,
      qcResult,
      completedAt: Date.now(), // Save completion timestamp
    });
    // Clean up timer
    await db.timers.delete(batchId);
  },

  /**
   * Delete a batch completely
   */
  async deleteBatch(batchId: string): Promise<void> {
    await BatchRepository.delete(batchId);
    await db.timers.delete(batchId);
  },

  /**
   * Get count of active batches
   */
  async getActiveCount(): Promise<number> {
    const draftCount = await BatchRepository.countByStatus('draft');
    const processCount = await BatchRepository.countByStatus('process');
    return draftCount + processCount;
  },
};
