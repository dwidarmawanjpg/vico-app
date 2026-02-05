import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, Save, PartyPopper } from 'lucide-react';
import { useBatchStore } from '../stores/useBatchStore';
import { BatchService } from '../services/BatchService';
import type { QCResult } from '../types/batch';

interface QCStepProps {
    onBack: () => void;
    onFinish: () => void;
}

const QCStep: React.FC<QCStepProps> = ({ onBack, onFinish }) => {
  const { currentBatch, refreshCurrentBatch } = useBatchStore();
  const [volume, setVolume] = useState<number | string>('');
  const [checks, setChecks] = useState({
      clearColor: false,
      normalAroma: false,
      noLayer: false
  });
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Guard: If no batch is loaded, show loading/error state
  if (!currentBatch) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark">
        <div className="text-center p-6">
          <p className="text-text-secondary dark:text-gray-400 mb-4">Batch tidak ditemukan</p>
          <button 
            onClick={onBack}
            className="px-6 py-3 bg-primary text-white rounded-xl font-medium"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const handleFinish = async () => {
      if (isSubmitting) return;
      
      setIsSubmitting(true);
      try {
          const qcResult: QCResult = {
              qc_total_vco_ml: Number(volume) || 0,
              qc_clear: checks.clearColor,
              qc_no_rancid_smell: checks.normalAroma,
              qc_oil_layer_good: checks.noLayer,
              qc_notes: notes
          };
          
          await BatchService.finalizeBatch(currentBatch.id, qcResult);
          await refreshCurrentBatch(); // Wait for state update
          setTimeout(() => {
             onFinish(); // Navigate after state is refreshed
          }, 100);
      } catch (error) {
          console.error('Failed to finalize batch:', error);
      } finally {
          setIsSubmitting(false);
      }
  };

  const handleSaveDraft = async () => {
      onBack(); // Just go back, data is already in draft state in DB
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-28 bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 antialiased selection:bg-primary/30 max-w-md mx-auto shadow-2xl">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center bg-surface-light dark:bg-surface-dark p-4 shadow-sm transition-colors duration-200">
        <button 
            onClick={onBack}
            aria-label="Go back" 
            className="flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-text-main dark:text-white"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="flex-1 text-center text-lg font-bold leading-tight tracking-tight text-text-main dark:text-white pr-12">
            Kontrol Kualitas
        </h2>
      </div>

      {/* Celebration Banner */}
      <div className="w-full bg-primary/10 dark:bg-primary/20 px-4 py-6 text-center">
        <div className="flex justify-center mb-2 text-primary dark:text-green-400">
            <PartyPopper size={32} />
        </div>
        <h3 className="text-xl font-bold leading-snug tracking-tight text-gray-900 dark:text-white">
            Selamat! <br/><span className="text-primary dark:text-green-400">Produksi hampir selesai.</span>
        </h3>
        <p className="mt-2 text-sm text-text-sub dark:text-gray-400">Silakan periksa detail batch terakhir sebelum finalisasi.</p>
      </div>

      <div className="flex flex-col gap-6 px-4 pt-6">
        {/* Section: Hasil Produksi */}
        <section className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-text-main dark:text-white">Hasil Produksi</h4>
          <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800">
            <label className="flex flex-col w-full">
              <span className="pb-2 text-sm font-medium text-text-sub dark:text-gray-400">Total Volume (mL)</span>
              <div className="relative flex items-center">
                <input 
                    className="form-input h-14 w-full rounded-xl border border-[#dde3e0] bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white px-4 text-2xl font-bold text-text-main placeholder:text-gray-300 focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none" 
                    placeholder="0" 
                    type="number" 
                    value={volume}
                    onChange={(e) => setVolume(e.target.value)}
                />
                <div className="absolute right-4 flex items-center gap-1 pointer-events-none">
                  <span className="text-sm font-semibold text-text-sub dark:text-gray-500">mL</span>
                </div>
              </div>
            </label>
          </div>
        </section>

        {/* Section: Cek Sensorik */}
        <section className="flex flex-col gap-3">
          <h4 className="text-base font-bold text-text-main dark:text-white">Cek Sensorik (Opsional)</h4>
          <div className="flex flex-col rounded-xl bg-surface-light dark:bg-surface-dark px-4 py-2 shadow-sm border border-gray-100 dark:border-gray-800">
            
            <label className="group flex cursor-pointer items-center gap-x-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-4 px-4">
              <input 
                className="size-6 rounded border-2 border-gray-300 bg-transparent text-primary checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 dark:border-gray-600 transition-colors cursor-pointer" 
                type="checkbox"
                checked={checks.clearColor}
                onChange={(e) => setChecks(p => ({...p, clearColor: e.target.checked}))}
              />
              <span className="flex-1 text-base font-normal leading-normal text-text-main dark:text-gray-200 group-active:scale-[0.98] transition-transform">Warna jernih/bening</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-x-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-4 px-4">
              <input 
                className="size-6 rounded border-2 border-gray-300 bg-transparent text-primary checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 dark:border-gray-600 transition-colors cursor-pointer" 
                type="checkbox"
                checked={checks.normalAroma}
                onChange={(e) => setChecks(p => ({...p, normalAroma: e.target.checked}))}
              />
              <span className="flex-1 text-base font-normal leading-normal text-text-main dark:text-gray-200 group-active:scale-[0.98] transition-transform">Aroma normal</span>
            </label>

            <label className="group flex cursor-pointer items-center gap-x-4 py-4 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors -mx-4 px-4">
              <input 
                className="size-6 rounded border-2 border-gray-300 bg-transparent text-primary checked:border-primary checked:bg-primary focus:ring-0 focus:ring-offset-0 dark:border-gray-600 transition-colors cursor-pointer" 
                type="checkbox"
                checked={checks.noLayer}
                onChange={(e) => setChecks(p => ({...p, noLayer: e.target.checked}))}
              />
              <span className="flex-1 text-base font-normal leading-normal text-text-main dark:text-gray-200 group-active:scale-[0.98] transition-transform">Tidak ada lapisan</span>
            </label>

          </div>
        </section>

        {/* Section: Catatan */}
        <section className="flex flex-col gap-3 mb-4">
          <h4 className="text-base font-bold text-text-main dark:text-white">Catatan (Opsional)</h4>
          <div className="rounded-xl bg-surface-light dark:bg-surface-dark shadow-sm border border-gray-100 dark:border-gray-800">
            <textarea 
                className="form-textarea block w-full resize-none rounded-xl border-0 bg-transparent p-4 text-base text-text-main placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-primary dark:text-white min-h-[120px] outline-none" 
                placeholder="Tambahkan catatan tentang batch ini jika ada..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>
        </section>
      </div>

      {/* Sticky Footer */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#141e18]/90 backdrop-blur-md p-4 border-t border-gray-100 dark:border-gray-800 z-50">
        <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <button 
                onClick={handleFinish}
                disabled={isSubmitting || !volume}
                className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 px-6 text-base font-bold text-white shadow-lg transition-transform active:scale-[0.98] ${isSubmitting || !volume ? 'bg-gray-400 cursor-not-allowed' : 'bg-primary shadow-primary/30 hover:bg-primary/90'}`}
            >
                <CheckCircle size={20} />
                {isSubmitting ? 'MEMPROSES...' : 'SELESAI BATCH'}
            </button>
            <button 
                onClick={handleSaveDraft}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-transparent py-3 px-6 text-base font-bold text-text-sub dark:text-gray-400 transition-transform active:scale-[0.98] hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <Save size={20} />
                SIMPAN DRAFT
            </button>
        </div>
      </div>
    </div>
  );
};

export default QCStep;
