import React, { useState, useMemo } from 'react';
import { ArrowLeft, Scale, Clock, Beaker, CheckCircle, AlertCircle, Save, AlertTriangle, Sparkles } from 'lucide-react';
import { BatchService } from '../services/BatchService';
import { YieldService } from '../services/YieldService';
import type { QCResult } from '../types/batch';

interface ManualBatchFormProps {
    onBack: () => void;
    onSuccess: () => void;
    initialWeight?: number; // In grams, passed from SOPInput
    initialWater?: number;  // In liters
}

const ManualBatchForm: React.FC<ManualBatchFormProps> = ({ onBack, onSuccess, initialWeight, initialWater }) => {
    // Section 1: Bahan Baku (Inputs)
    // Pre-fill from props if available (convert grams to kg for display)
    const [inputWeight, setInputWeight] = useState(() => 
        initialWeight ? String(initialWeight / 1000) : ''
    );
    const [waterVolume, setWaterVolume] = useState(() => 
        initialWater ? String(initialWater) : ''
    );
    const [inputUnit, setInputUnit] = useState<'gram' | 'kg'>('kg');
    
    // Water unit toggle
    const [waterUnit, setWaterUnit] = useState<'liter' | 'ml'>('liter');
    
    // Section 2: Waktu Produksi (Time)
    const [startDateTime, setStartDateTime] = useState('');
    const [endDateTime, setEndDateTime] = useState('');
    
    // Section 3: Hasil Produksi (Output)
    const [vcoVolume, setVcoVolume] = useState('');
    const [vcoUnit, setVcoUnit] = useState<'ml' | 'liter'>('ml');
    const [checks, setChecks] = useState({
        clearColor: false,
        normalAroma: false,
        noLayer: false
    });
    const [notes, setNotes] = useState('');
    
    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');

    // Calculations
    const weightInGrams = useMemo(() => {
        const val = parseFloat(inputWeight) || 0;
        return inputUnit === 'kg' ? val * 1000 : val;
    }, [inputWeight, inputUnit]);

    const waterInLiters = useMemo(() => {
        const val = parseFloat(waterVolume) || 0;
        return waterUnit === 'ml' ? val / 1000 : val;
    }, [waterVolume, waterUnit]);
    
    const ratio = useMemo(() => {
        if (weightInGrams <= 0) return 0;
        // Standard ratio is 1:1 (1kg coconut : 1L water)
        const expectedWater = weightInGrams / 1000; // Convert to kg for comparison
        return waterInLiters / expectedWater;
    }, [weightInGrams, waterInLiters]);

    const isRatioStandard = ratio >= 0.9 && ratio <= 1.1;

    // Time calculations
    const durationInfo = useMemo(() => {
        if (!startDateTime || !endDateTime) return null;
        const start = new Date(startDateTime).getTime();
        const end = new Date(endDateTime).getTime();
        if (end < start) return null;
        
        const diffMs = end - start;
        const totalMinutes = Math.floor(diffMs / 60000);
        const hours = Math.floor(totalMinutes / 60);
        const minutes = totalMinutes % 60;
        
        return { hours, minutes, totalMinutes };
    }, [startDateTime, endDateTime]);

    // Yield calculations - handle VCO unit conversion
    const vcoMl = useMemo(() => {
        const val = parseFloat(vcoVolume) || 0;
        return vcoUnit === 'liter' ? val * 1000 : val;
    }, [vcoVolume, vcoUnit]);
    const yieldPerKg = weightInGrams > 0 ? YieldService.calculateEfficiency(vcoMl, weightInGrams) : 0;

    // Validation
    const canSubmit = weightInGrams > 0 && vcoMl > 0 && startDateTime && endDateTime && durationInfo;

    const handleSubmit = async () => {
        if (!canSubmit || isSubmitting) return;
        
        setIsSubmitting(true);
        try {
            const startTime = new Date(startDateTime).getTime();
            const endTime = new Date(endDateTime).getTime();
            
            const qcResult: QCResult = {
                qc_total_vco_ml: vcoMl,
                qc_clear: checks.clearColor,
                qc_no_rancid_smell: checks.normalAroma,
                qc_oil_layer_good: checks.noLayer,
                qc_notes: notes || undefined
            };
            
            // Create batch directly as completed
            await BatchService.createManualBatch({
                date: startTime,
                inputWeight: weightInGrams,
                waterVolume: waterInLiters,
                inputMode: inputUnit === 'kg' ? 'gram' : 'gram',
                qcResult,
                completedAt: endTime,
            });
            
            setToastMessage('Batch berhasil disimpan! 🎉');
            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
                onSuccess();
            }, 1500);
        } catch (error) {
            console.error('Failed to save manual batch:', error);
            setToastMessage('Gagal menyimpan batch');
            setShowToast(true);
            setTimeout(() => setShowToast(false), 2000);
            setIsSubmitting(false);
        }
    };

    // Get current datetime for max value
    const now = new Date().toISOString().slice(0, 16);

    return (
        <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden pb-28 bg-background-light dark:bg-background-dark font-display text-text-main dark:text-gray-100 antialiased selection:bg-primary/30 max-w-md mx-auto shadow-2xl">
            {/* Toast Notification */}
            {showToast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
                    <Save size={16} />
                    <span className="font-medium text-sm">{toastMessage}</span>
                </div>
            )}

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
                    Input Manual
                </h2>
            </div>

            {/* Info Banner */}
            <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-blue-100 dark:border-blue-800/30">
                <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                    📝 Catat produksi yang sudah selesai dilakukan sebelumnya
                </p>
            </div>

            <div className="flex flex-col gap-6 px-4 pt-6">
                {/* Section 1: Bahan Baku */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Scale className="text-primary" size={20} />
                        <h3 className="text-base font-bold text-text-main dark:text-white">Bahan Baku</h3>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                        {/* Weight Input */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Berat Kelapa Parut
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step={inputUnit === 'kg' ? '0.1' : '1'}
                                    value={inputWeight}
                                    onChange={(e) => setInputWeight(e.target.value)}
                                    className="w-full h-12 px-4 pr-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setInputUnit(prev => prev === 'kg' ? 'gram' : 'kg')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                                >
                                    {inputUnit === 'kg' ? 'Kg' : 'g'}
                                </button>
                            </div>
                        </div>

                        {/* Water Volume */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Volume Air
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step={waterUnit === 'liter' ? '0.1' : '1'}
                                    value={waterVolume}
                                    onChange={(e) => setWaterVolume(e.target.value)}
                                    className="w-full h-12 px-4 pr-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setWaterUnit(prev => prev === 'liter' ? 'ml' : 'liter')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                                >
                                    {waterUnit === 'liter' ? 'L' : 'mL'}
                                </button>
                            </div>
                        </div>

                        {/* Ratio Badge */}
                        {weightInGrams > 0 && waterInLiters > 0 && (
                            <div className={`flex items-center gap-2 p-3 rounded-lg ${isRatioStandard ? 'bg-green-50 dark:bg-green-900/20' : 'bg-amber-50 dark:bg-amber-900/20'}`}>
                                {isRatioStandard ? (
                                    <CheckCircle className="text-green-500" size={18} />
                                ) : (
                                    <AlertCircle className="text-amber-500" size={18} />
                                )}
                                <span className={`text-sm font-medium ${isRatioStandard ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                                    Rasio {ratio.toFixed(2)}:1 ({isRatioStandard ? 'Standard' : 'Non-Standard'})
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 2: Waktu Produksi */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Clock className="text-primary" size={20} />
                        <h3 className="text-base font-bold text-text-main dark:text-white">Waktu Produksi</h3>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                        {/* Start Time */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Waktu Mulai
                            </label>
                            <input
                                type="datetime-local"
                                value={startDateTime}
                                onChange={(e) => setStartDateTime(e.target.value)}
                                max={now}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* End Time */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Waktu Selesai
                            </label>
                            <input
                                type="datetime-local"
                                value={endDateTime}
                                onChange={(e) => setEndDateTime(e.target.value)}
                                max={now}
                                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>

                        {/* Duration Display */}
                        {durationInfo && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-primary/10 dark:bg-primary/20 rounded-lg">
                                <Clock className="text-primary" size={18} />
                                <span className="text-sm font-bold text-primary">
                                    Total Durasi: {durationInfo.hours} Jam {durationInfo.minutes} Menit
                                </span>
                            </div>
                        )}

                        {startDateTime && endDateTime && !durationInfo && (
                            <div className="flex items-center justify-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <AlertCircle className="text-red-500" size={18} />
                                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                                    Waktu selesai harus setelah waktu mulai
                                </span>
                            </div>
                        )}
                    </div>
                </section>

                {/* Section 3: Hasil Produksi */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <Beaker className="text-primary" size={20} />
                        <h3 className="text-base font-bold text-text-main dark:text-white">Hasil Produksi</h3>
                    </div>
                    
                    <div className="bg-surface-light dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 space-y-4">
                        {/* VCO Volume */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Volume VCO
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    step={vcoUnit === 'liter' ? '0.1' : '1'}
                                    value={vcoVolume}
                                    onChange={(e) => setVcoVolume(e.target.value)}
                                    className="w-full h-14 px-4 pr-20 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white text-2xl font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                                    placeholder="0"
                                />
                                <button
                                    type="button"
                                    onClick={() => setVcoUnit(prev => prev === 'ml' ? 'liter' : 'ml')}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
                                >
                                    {vcoUnit === 'ml' ? 'mL' : 'L'}
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Quality Badge */}
                        {vcoMl > 0 && weightInGrams > 0 && (
                            <div className={`flex items-center justify-between p-4 rounded-xl ${
                                yieldPerKg >= 100 
                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                            }`}>
                                <div className="flex items-center gap-3">
                                    {yieldPerKg >= 100 ? (
                                        <div className="p-2 bg-green-100 dark:bg-green-800/30 rounded-lg">
                                            <Sparkles className="text-green-600 dark:text-green-400" size={20} />
                                        </div>
                                    ) : (
                                        <div className="p-2 bg-amber-100 dark:bg-amber-800/30 rounded-lg">
                                            <AlertTriangle className="text-amber-600 dark:text-amber-400" size={20} />
                                        </div>
                                    )}
                                    <div>
                                        <p className={`text-sm font-bold ${
                                            yieldPerKg >= 100 
                                                ? 'text-green-700 dark:text-green-400' 
                                                : 'text-amber-700 dark:text-amber-400'
                                        }`}>
                                            {yieldPerKg >= 100 ? 'Hasil Standard' : 'Hasil Rendah'}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {yieldPerKg >= 100 ? 'Yield memenuhi target' : 'Yield di bawah target (100 mL/kg)'}
                                        </p>
                                    </div>
                                </div>
                                <span className={`text-xl font-bold ${
                                    yieldPerKg >= 100 
                                        ? 'text-green-600 dark:text-green-400' 
                                        : 'text-amber-600 dark:text-amber-400'
                                }`}>
                                    {yieldPerKg.toFixed(1)}
                                    <span className="text-sm font-medium ml-0.5">mL/kg</span>
                                </span>
                            </div>
                        )}

                        {/* Sensory Checks */}
                        <div className="pt-2">
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-3">
                                Cek Sensorik (Opsional)
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={checks.clearColor}
                                        onChange={(e) => setChecks(p => ({...p, clearColor: e.target.checked}))}
                                        className="size-5 rounded border-2 border-gray-300 text-primary focus:ring-0"
                                    />
                                    <span className="text-sm text-text-main dark:text-gray-200">Warna jernih/bening</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={checks.normalAroma}
                                        onChange={(e) => setChecks(p => ({...p, normalAroma: e.target.checked}))}
                                        className="size-5 rounded border-2 border-gray-300 text-primary focus:ring-0"
                                    />
                                    <span className="text-sm text-text-main dark:text-gray-200">Aroma normal</span>
                                </label>
                                <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors">
                                    <input 
                                        type="checkbox"
                                        checked={checks.noLayer}
                                        onChange={(e) => setChecks(p => ({...p, noLayer: e.target.checked}))}
                                        className="size-5 rounded border-2 border-gray-300 text-primary focus:ring-0"
                                    />
                                    <span className="text-sm text-text-main dark:text-gray-200">Tidak ada lapisan</span>
                                </label>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-text-sub dark:text-gray-400 mb-2">
                                Catatan (Opsional)
                            </label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-text-main dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Tambahkan catatan..."
                            />
                        </div>
                    </div>
                </section>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-[#141e18]/90 backdrop-blur-md p-4 border-t border-gray-100 dark:border-gray-800 z-50">
                <div className="mx-auto flex w-full max-w-md flex-col gap-2">
                    <button 
                        onClick={handleSubmit}
                        disabled={!canSubmit || isSubmitting}
                        className={`flex w-full items-center justify-center gap-2 rounded-xl py-4 px-6 text-base font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                            canSubmit && !isSubmitting 
                                ? 'bg-primary shadow-primary/30 hover:bg-primary/90' 
                                : 'bg-gray-400 cursor-not-allowed'
                        }`}
                    >
                        <Save size={20} />
                        {isSubmitting ? 'MENYIMPAN...' : 'SIMPAN KE RIWAYAT'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ManualBatchForm;
