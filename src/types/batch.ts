// Types for VCO Batch Production with 6-step SOP

// Step definitions with timer durations (in seconds)
export const SOP_STEPS = {
  1: { name: 'Persiapan Bahan', timer: null },
  2: { name: 'Ekstraksi Santan', timer: 5 * 60 },         // 5 minutes
  3: { name: 'Pemisahan Krim', timer: 2 * 60 * 60 },      // 2 hours
  4: { name: 'Pengadukan Krim', timer: 30 * 60 },         // 30 minutes
  5: { name: 'Fermentasi', timer: 24 * 60 * 60 },         // 24 hours
  6: { name: 'Ambil Minyak & Saring', timer: null },
} as const;

export type StepNumber = 1 | 2 | 3 | 4 | 5 | 6;

// Special step for QC (after step 6, or direct if manual mode)
export const QC_STEP = 7;

// Checklist keys per step
export interface StepChecklists {
  step1_parut_ready?: boolean;        // Parutan sudah siap & ditimbang
  step2_milk_filtered?: boolean;       // Santan sudah diperas & disaring
  step3_cream_visible?: boolean;       // Lapisan krim sudah terlihat
  step3_cream_collected?: boolean;     // Krim sudah diambil
  step4_stir_done?: boolean;           // Pengadukan 30 menit selesai
  step5_ferment_done?: boolean;        // Fermentasi selesai
  step6_oil_collected?: boolean;       // Minyak sudah diambil
  step6_filtered?: boolean;            // Minyak sudah disaring
}

// Required checklist items per step to advance
export const STEP_REQUIRED_CHECKLISTS: Record<StepNumber, (keyof StepChecklists)[]> = {
  1: ['step1_parut_ready'],
  2: ['step2_milk_filtered'],
  3: ['step3_cream_visible', 'step3_cream_collected'],
  4: ['step4_stir_done'],
  5: ['step5_ferment_done'],
  6: ['step6_oil_collected', 'step6_filtered'],
};

export interface QCResult {
  qc_total_vco_ml: number;            // Required: total oil in mL
  qc_clear?: boolean;                 // Jernih
  qc_no_rancid_smell?: boolean;       // Tidak bau tengik
  qc_oil_layer_good?: boolean;        // Lapisan minyak bagus
  qc_notes?: string;                  // Catatan
}

export type BatchStatus = 'draft' | 'process' | 'done' | 'failed';

export interface Batch {
  id: string;                         // e.g., "VCO-20260203-01"
  date: number;                       // production date timestamp
  status: BatchStatus;
  inputWeight: number;                // grams
  waterVolume: number;                // liters (calculated 1:1)
  inputMode: 'gram' | 'target';
  isManualMode: boolean;              // Skip SOP timers if true
  currentStep: number;                // 1-6, or 7 for QC
  checklists: StepChecklists;
  qcResult: QCResult | null;
  createdAt: number;
  updatedAt: number;
}

// Timer state for a single timer instance (multi-batch support)
export interface TimerInstance {
  batchId: string;
  stepNumber: number;
  totalDuration: number;              // total seconds for this step
  startTime: number | null;           // timestamp when started
  pausedAt: number | null;            // timestamp when paused
  remainingWhenPaused: number | null; // seconds remaining when paused
  isActive: boolean;
}

// User profile (stored in localStorage, no auth)
export interface UserProfile {
  name: string;
  location?: string;
  avatarUrl?: string;
  monthlyTarget?: number; // Monthly VCO production target in mL (0 = no target)
}

// Default user profile
export const DEFAULT_USER_PROFILE: UserProfile = {
  name: 'Pengguna VICO',
  location: 'Indonesia',
  monthlyTarget: 0, // No target by default
};
