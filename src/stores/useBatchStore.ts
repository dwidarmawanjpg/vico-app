import { create } from 'zustand';
import { BatchService } from '../services/BatchService';
import type { Batch } from '../types/batch';

interface BatchStore {
  // Currently active/focused batch (for SOP flow)
  currentBatch: Batch | null;
  
  // All active batches (draft or process status)
  activeBatches: Batch[];
  
  // Loading state
  isLoading: boolean;
  
  // Actions
  setCurrentBatch: (batch: Batch | null) => void;
  loadActiveBatches: () => Promise<void>;
  createBatch: (params: {
    inputWeight: number;
    inputMode: 'gram' | 'target';
    isManualMode: boolean;
    productionDate?: Date;
  }) => Promise<Batch>;
  refreshCurrentBatch: () => Promise<void>;
  clearCurrentBatch: () => void;
}

export const useBatchStore = create<BatchStore>((set, get) => ({
  currentBatch: null,
  activeBatches: [],
  isLoading: false,

  // Set the current batch being worked on
  setCurrentBatch: (batch) => {
    set({ currentBatch: batch });
  },

  // Load all active batches from database
  loadActiveBatches: async () => {
    set({ isLoading: true });
    try {
      const batches = await BatchService.getActiveBatches();
      set({ activeBatches: batches });
    } finally {
      set({ isLoading: false });
    }
  },

  // Create a new batch and set it as current
  createBatch: async (params) => {
    const batch = await BatchService.createBatch(params);
    
    set((state) => ({
      currentBatch: batch,
      activeBatches: [batch, ...state.activeBatches],
    }));
    
    return batch;
  },

  // Refresh the current batch from database
  refreshCurrentBatch: async () => {
    const { currentBatch } = get();
    if (!currentBatch) return;
    
    const updated = await BatchService.getBatch(currentBatch.id);
    if (updated) {
      set({ currentBatch: updated });
    }
  },

  // Clear current batch (when done or navigating away)
  clearCurrentBatch: () => {
    set({ currentBatch: null });
  },
}));
