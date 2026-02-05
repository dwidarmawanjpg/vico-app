import { db } from '../db/database';
import type { Batch, BatchStatus, StepChecklists, QCResult } from '../types/batch';

/**
 * BatchRepository - Low-level database operations for batches
 * Following Repository Pattern to separate DB logic from business logic
 */
export const BatchRepository = {
  /**
   * Create a new batch
   */
  async create(batch: Batch): Promise<string> {
    await db.batches.add(batch);
    return batch.id;
  },

  /**
   * Get a batch by ID
   */
  async getById(id: string): Promise<Batch | undefined> {
    return db.batches.get(id);
  },

  /**
   * Get all batches, sorted by date descending (newest first)
   */
  async getAll(): Promise<Batch[]> {
    return db.batches.orderBy('date').reverse().toArray();
  },

  /**
   * Get active batches (draft or in-process)
   */
  async getActive(): Promise<Batch[]> {
    return db.batches
      .where('status')
      .anyOf(['draft', 'process'] as BatchStatus[])
      .reverse()
      .sortBy('date');
  },

  /**
   * Get batches by status
   */
  async getByStatus(status: BatchStatus): Promise<Batch[]> {
    return db.batches.where('status').equals(status).toArray();
  },

  /**
   * Update a batch partially
   */
  async update(id: string, data: Partial<Batch>): Promise<void> {
    await db.batches.update(id, {
      ...data,
      updatedAt: Date.now(),
    });
  },

  /**
   * Update checklist items for a batch
   */
  async updateChecklists(id: string, checklists: Partial<StepChecklists>): Promise<void> {
    const batch = await db.batches.get(id);
    if (batch) {
      await db.batches.update(id, {
        checklists: { ...batch.checklists, ...checklists },
        updatedAt: Date.now(),
      });
    }
  },

  /**
   * Update QC result
   */
  async updateQCResult(id: string, qcResult: QCResult): Promise<void> {
    await db.batches.update(id, {
      qcResult,
      updatedAt: Date.now(),
    });
  },

  /**
   * Delete a batch
   */
  async delete(id: string): Promise<void> {
    await db.batches.delete(id);
  },

  /**
   * Clear all batches (for app reset)
   */
  async clearAll(): Promise<void> {
    await db.batches.clear();
  },

  /**
   * Count batches by status
   */
  async countByStatus(status: BatchStatus): Promise<number> {
    return db.batches.where('status').equals(status).count();
  },
};
