import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Lock, Check, X, Trash2, Droplets, Scale, FileText, Eye, AlertTriangle, Sparkles, Save, CheckCircle, Clock } from 'lucide-react';
import { BatchService } from '../services/BatchService';
import { YieldService } from '../services/YieldService';
import type { Batch, QCResult } from '../types/batch';

interface HistoryDetailProps {
    batchId: string;
    onBack: () => void;
    onDelete?: () => void;
}

// Form data interface matching batch editable fields
interface FormData {
  date: number;
  inputWeight: number;
  waterVolume: number;
  qc_total_vco_ml: number;
  qc_clear: boolean;
  qc_no_rancid_smell: boolean;
  qc_oil_layer_good: boolean;
  qc_notes: string;
}

const HistoryDetail: React.FC<HistoryDetailProps> = ({ batchId, onBack, onDelete }) => {
  const [batch, setBatch] = useState<Batch | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Display unit toggles
  const [weightDisplayUnit, setWeightDisplayUnit] = useState<'gram' | 'kg'>('gram');
  const [waterDisplayUnit, setWaterDisplayUnit] = useState<'liter' | 'ml'>('liter');
  const [vcoDisplayUnit, setVcoDisplayUnit] = useState<'ml' | 'liter'>('ml');

  // Editable form state
  const [formData, setFormData] = useState<FormData>({
    date: Date.now(),
    inputWeight: 0,
    waterVolume: 0,
    qc_total_vco_ml: 0,
    qc_clear: false,
    qc_no_rancid_smell: false,
    qc_oil_layer_good: false,
    qc_notes: '',
  });

  // Load batch from database
  useEffect(() => {
    const loadBatch = async () => {
      try {
        const data = await BatchService.getBatch(batchId);
        if (data) {
          setBatch(data);
          // Initialize form with batch data
          setFormData({
            date: data.date,
            inputWeight: data.inputWeight,
            waterVolume: data.waterVolume,
            qc_total_vco_ml: data.qcResult?.qc_total_vco_ml ?? 0,
            qc_clear: data.qcResult?.qc_clear ?? false,
            qc_no_rancid_smell: data.qcResult?.qc_no_rancid_smell ?? false,
            qc_oil_layer_good: data.qcResult?.qc_oil_layer_good ?? false,
            qc_notes: data.qcResult?.qc_notes ?? '',
          });
        }
      } catch (error) {
        console.error('Failed to load batch:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBatch();
  }, [batchId]);

  // Calculate derived values
  const calculations = useMemo(() => {
    const gramsPerLiter = formData.waterVolume > 0 ? formData.inputWeight / formData.waterVolume : 0;
    const isStandardRatio = gramsPerLiter >= 900 && gramsPerLiter <= 1100;
    const yieldPerKg = formData.inputWeight > 0 
      ? YieldService.calculateEfficiency(formData.qc_total_vco_ml, formData.inputWeight) 
      : 0;
    const qualityRating = yieldPerKg > 0 ? YieldService.getQualityRating(yieldPerKg) : null;
    
    return { isStandardRatio, yieldPerKg, qualityRating };
  }, [formData.inputWeight, formData.waterVolume, formData.qc_total_vco_ml]);

  // Update form field
  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  // Save changes
  const handleSave = async () => {
    if (!batch || isSaving) return;
    
    setIsSaving(true);
    try {
      // Prepare updated QC result
      const qcResult: QCResult = {
        qc_total_vco_ml: formData.qc_total_vco_ml,
        qc_clear: formData.qc_clear,
        qc_no_rancid_smell: formData.qc_no_rancid_smell,
        qc_oil_layer_good: formData.qc_oil_layer_good,
        qc_notes: formData.qc_notes,
      };

      // Update batch via service
      await BatchService.updateBatch(batch.id, {
        date: formData.date,
        inputWeight: formData.inputWeight,
        waterVolume: formData.waterVolume,
        qcResult,
      });

      // Update local batch state
      setBatch(prev => prev ? { 
        ...prev, 
        date: formData.date,
        inputWeight: formData.inputWeight,
        waterVolume: formData.waterVolume,
        qcResult,
      } : null);

      setHasChanges(false);
      setShowSaveSuccess(true);
      setTimeout(() => setShowSaveSuccess(false), 2000);
    } catch (error) {
      console.error('Failed to save batch:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!batch || isDeleting) return;
    
    const confirmed = window.confirm(`Hapus batch ${batch.id}? Aksi ini tidak dapat dibatalkan.`);
    if (!confirmed) return;
    
    setIsDeleting(true);
    try {
      await BatchService.deleteBatch(batch.id);
      onDelete?.();
      onBack();
    } catch (error) {
      console.error('Failed to delete batch:', error);
      setIsDeleting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark">
        <div className="animate-pulse text-primary font-bold text-xl">Memuat...</div>
      </div>
    );
  }

  // Not found state
  if (!batch) {
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

  const statusConfig = {
    done: { label: 'Selesai', color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-100/50 dark:bg-green-900/20', borderColor: 'border-green-200 dark:border-green-800' },
    failed: { label: 'Gagal', color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-100/50 dark:bg-red-900/20', borderColor: 'border-red-200 dark:border-red-800' },
    process: { label: 'Proses', color: 'text-amber-600 dark:text-amber-400', bgColor: 'bg-amber-100/50 dark:bg-amber-900/20', borderColor: 'border-amber-200 dark:border-amber-800' },
    draft: { label: 'Draft', color: 'text-gray-600 dark:text-gray-400', bgColor: 'bg-gray-100/50 dark:bg-gray-800/20', borderColor: 'border-gray-200 dark:border-gray-700' },
  };

  const status = statusConfig[batch.status] || statusConfig.draft;

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between p-4 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
        <button 
            onClick={onBack}
            className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="text-text-main dark:text-white" size={24} />
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight text-text-main dark:text-white">Detail Batch</h2>
        {/* Save Button in Header */}
        <button 
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${hasChanges ? 'hover:bg-primary/10 text-primary' : 'text-gray-300 dark:text-gray-600'}`}
        >
          <Save size={22} />
        </button>
      </div>

      {/* Save Success Toast */}
      {showSaveSuccess && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle size={18} />
          <span className="font-medium text-sm">Perubahan disimpan!</span>
        </div>
      )}

      <div className="p-4 space-y-6 pb-32">
        {/* Header Card */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-text-main dark:text-white tracking-tight">{batch.id}</h3>
                <Lock className="text-gray-400 dark:text-gray-500" size={18} />
              </div>
            </div>
            <div>
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${status.bgColor} border ${status.borderColor}`}>
                <span className="text-[10px]">{batch.status === 'done' ? '🟢' : batch.status === 'failed' ? '🔴' : '🟡'}</span>
                <span className={`${status.color} text-sm font-semibold`}>{status.label}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Time & Duration Section */}
        {batch.createdAt && batch.completedAt && (
          <div>
            <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 px-1">Waktu & Durasi</label>
            <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Clock size={16} />
                  <span className="text-sm">Mulai</span>
                </div>
                <span className="text-text-main dark:text-white font-medium">
                  {new Date(batch.createdAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <CheckCircle size={16} />
                  <span className="text-sm">Selesai</span>
                </div>
                <span className="text-text-main dark:text-white font-medium">
                  {new Date(batch.completedAt).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                </span>
              </div>
              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Durasi</span>
                <span className="text-primary font-bold">
                  {(() => {
                    const diffMs = batch.completedAt - batch.createdAt;
                    const totalMinutes = Math.floor(diffMs / 60000);
                    const hours = Math.floor(totalMinutes / 60);
                    const minutes = totalMinutes % 60;
                    return `${hours} Jam ${minutes} Menit`;
                  })()}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Input & Ratio Section - EDITABLE */}
        <div>
          <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight px-1 mb-3 flex items-center gap-2">
            <Scale className="text-primary" size={20} />
            <span>Input & Rasio</span>
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Parutan - EDITABLE with Unit Toggle */}
              <div className="flex justify-between items-center py-1">
                <label className="text-gray-500 dark:text-gray-400 text-sm font-medium">Kelapa</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={weightDisplayUnit === 'kg' 
                      ? ((formData.inputWeight || 0) / 1000).toFixed(1) 
                      : formData.inputWeight || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('inputWeight', weightDisplayUnit === 'kg' ? val * 1000 : val);
                    }}
                    step={weightDisplayUnit === 'kg' ? '0.1' : '1'}
                    className="w-20 text-right bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-text-main dark:text-white text-base font-semibold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setWeightDisplayUnit(prev => prev === 'gram' ? 'kg' : 'gram')}
                    className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors min-w-[32px]"
                  >
                    {weightDisplayUnit === 'gram' ? 'g' : 'Kg'}
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
              
              {/* Air - EDITABLE with Unit Toggle */}
              <div className="flex justify-between items-center py-1">
                <label className="text-gray-500 dark:text-gray-400 text-sm font-medium">Air</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={waterDisplayUnit === 'liter' ? '0.1' : '1'}
                    value={waterDisplayUnit === 'ml' 
                      ? ((formData.waterVolume || 0) * 1000).toFixed(0) 
                      : formData.waterVolume || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('waterVolume', waterDisplayUnit === 'ml' ? val / 1000 : val);
                    }}
                    className="w-20 text-right bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-text-main dark:text-white text-base font-semibold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setWaterDisplayUnit(prev => prev === 'liter' ? 'ml' : 'liter')}
                    className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors min-w-[32px]"
                  >
                    {waterDisplayUnit === 'liter' ? 'L' : 'mL'}
                  </button>
                </div>
              </div>

              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
              
              {/* Mode - READ ONLY */}
              <div className="flex justify-between items-center py-1">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Mode Input</p>
                <p className="text-text-main dark:text-white text-base font-semibold text-right capitalize">
                  {batch.inputMode === 'gram' ? 'Gram' : 'Target mL'}
                </p>
              </div>
              
              {/* Ratio Badge - AUTO CALCULATED */}
              <div className="pt-2">
                {calculations.isStandardRatio ? (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700/50 rounded-lg p-3 flex items-center justify-center gap-2">
                    <Check className="text-green-600 dark:text-green-400" size={16} />
                    <p className="text-green-700 dark:text-green-400 font-bold text-sm">Rasio Standard (1:1)</p>
                  </div>
                ) : (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-lg p-3 flex items-center justify-center gap-2">
                    <AlertTriangle className="text-yellow-600 dark:text-yellow-400" size={16} />
                    <p className="text-yellow-700 dark:text-yellow-400 font-bold text-sm">Rasio Non-Standard</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Results Section - EDITABLE */}
        <div>
          <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight px-1 mb-3 flex items-center gap-2">
            <Droplets className="text-primary" size={20} />
            <span>Hasil</span>
          </h3>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 space-y-4">
              {/* Volume - EDITABLE with Unit Toggle */}
              <div className="flex justify-between items-center py-1">
                <label className="text-gray-500 dark:text-gray-400 text-sm font-medium">Volume VCO</label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step={vcoDisplayUnit === 'liter' ? '0.1' : '1'}
                    value={vcoDisplayUnit === 'liter' 
                      ? ((formData.qc_total_vco_ml || 0) / 1000).toFixed(1) 
                      : formData.qc_total_vco_ml || ''}
                    onChange={(e) => {
                      const val = Number(e.target.value);
                      updateField('qc_total_vco_ml', vcoDisplayUnit === 'liter' ? val * 1000 : val);
                    }}
                    className="w-20 text-right bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1.5 text-text-main dark:text-white text-base font-semibold focus:ring-2 focus:ring-primary outline-none"
                    placeholder="0"
                  />
                  <button
                    onClick={() => setVcoDisplayUnit(prev => prev === 'ml' ? 'liter' : 'ml')}
                    className="px-2 py-1 rounded-lg bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors min-w-[32px]"
                  >
                    {vcoDisplayUnit === 'ml' ? 'mL' : 'L'}
                  </button>
                </div>
              </div>
              
              <div className="h-px bg-gray-100 dark:bg-gray-800"></div>
              
              {/* Yield - AUTO CALCULATED */}
              <div className="flex justify-between items-center py-1">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Yield</p>
                <p className="text-text-main dark:text-white text-base font-semibold text-right">{calculations.yieldPerKg.toFixed(1)} mL/kg</p>
              </div>
              
              {/* Quality Badge - AUTO CALCULATED */}
              {calculations.qualityRating && (
                <div className="pt-2">
                  {calculations.qualityRating === 'Premium' || calculations.qualityRating === 'Standard' ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg p-3 flex items-center justify-center gap-2">
                      <Sparkles className="text-green-600 dark:text-green-400" size={16} />
                      <p className="text-green-700 dark:text-green-400 font-bold text-sm">Hasil {calculations.qualityRating}</p>
                    </div>
                  ) : (
                    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg p-3 flex items-center justify-center gap-2">
                      <AlertTriangle className="text-amber-600 dark:text-amber-400" size={16} />
                      <p className="text-amber-700 dark:text-amber-400 font-bold text-sm">Hasil {calculations.qualityRating}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sensory Check - EDITABLE CHECKBOXES */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
              <Eye className="text-primary" size={20} />
              <span>Cek Sensorik</span>
            </h3>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 p-4">
            <div className="grid grid-cols-1 gap-3">
              {/* Clear Color */}
              <button 
                onClick={() => updateField('qc_clear', !formData.qc_clear)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`flex items-center justify-center size-6 rounded-full ${formData.qc_clear ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                  {formData.qc_clear ? <Check size={14} /> : <X size={14} />}
                </div>
                <span className="text-text-main dark:text-gray-200 text-sm font-medium">Warna jernih</span>
              </button>
              
              {/* Normal Aroma */}
              <button 
                onClick={() => updateField('qc_no_rancid_smell', !formData.qc_no_rancid_smell)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`flex items-center justify-center size-6 rounded-full ${formData.qc_no_rancid_smell ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                  {formData.qc_no_rancid_smell ? <Check size={14} /> : <X size={14} />}
                </div>
                <span className="text-text-main dark:text-gray-200 text-sm font-medium">Aroma normal (tidak tengik)</span>
              </button>
              
              {/* Good Oil Layer */}
              <button 
                onClick={() => updateField('qc_oil_layer_good', !formData.qc_oil_layer_good)}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className={`flex items-center justify-center size-6 rounded-full ${formData.qc_oil_layer_good ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'}`}>
                  {formData.qc_oil_layer_good ? <Check size={14} /> : <X size={14} />}
                </div>
                <span className="text-text-main dark:text-gray-200 text-sm font-medium">Lapisan minyak bagus</span>
              </button>
            </div>
          </div>
        </div>

        {/* Notes - EDITABLE TEXTAREA */}
        <div>
          <div className="flex justify-between items-center mb-3 px-1">
            <h3 className="text-text-main dark:text-white text-lg font-bold leading-tight flex items-center gap-2">
              <FileText className="text-primary" size={20} />
              <span>Catatan</span>
            </h3>
          </div>
          <div className="bg-white dark:bg-surface-dark rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden focus-within:ring-2 focus-within:ring-primary transition-all">
            <textarea
              value={formData.qc_notes}
              onChange={(e) => updateField('qc_notes', e.target.value)}
              placeholder="Tambahkan catatan..."
              rows={3}
              className="w-full p-4 bg-transparent border-none outline-none resize-none text-text-main dark:text-gray-300 text-base leading-relaxed placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Delete Button */}
        <div className="pt-6">
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="w-full group relative overflow-hidden rounded-xl border-2 border-red-500 dark:border-red-500/80 bg-transparent px-6 py-4 text-center transition-all duration-300 hover:bg-red-50 dark:hover:bg-red-950/30 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center justify-center gap-2">
              <Trash2 className={`text-red-600 dark:text-red-400 ${isDeleting ? 'animate-pulse' : ''}`} size={24} />
              <span className="text-base font-bold text-red-600 dark:text-red-400">
                {isDeleting ? 'MENGHAPUS...' : 'HAPUS BATCH'}
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Floating Save Button */}
      {hasChanges && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-[calc(100%-2rem)]">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full flex items-center justify-center gap-3 bg-primary hover:bg-primary-dark text-white px-6 py-4 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
          >
            <Save size={20} />
            <span className="font-bold text-base">
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default HistoryDetail;
