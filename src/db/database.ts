import Dexie, { type EntityTable } from 'dexie';
import type { Batch, TimerInstance } from '../types/batch';

// Database class with typed tables
class VICODatabase extends Dexie {
  batches!: EntityTable<Batch, 'id'>;
  timers!: EntityTable<TimerInstance, 'batchId'>;

  constructor() {
    super('VICODatabase');
    
    this.version(1).stores({
      // Primary key is 'id', indexed fields: date, status
      batches: 'id, date, status, currentStep',
      // Primary key is 'batchId' for timer lookup
      timers: 'batchId, stepNumber',
    });
  }
}

// Singleton database instance
export const db = new VICODatabase();

// Helper to generate batch ID in format: VCO-YYYYMMDD-NN
export const generateBatchId = async (date: Date = new Date()): Promise<string> => {
  const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
  const prefix = `VCO-${dateStr}`;
  
  // Count existing batches for this date to generate sequence number
  const existingBatches = await db.batches
    .where('id')
    .startsWith(prefix)
    .count();
  
  const sequence = (existingBatches + 1).toString().padStart(2, '0');
  return `${prefix}-${sequence}`;
};
