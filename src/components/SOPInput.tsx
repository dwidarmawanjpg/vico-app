import React, { useState } from 'react';
import { ArrowLeft, Droplets, Thermometer, Disc, TrendingUp, PlayCircle } from 'lucide-react';
import { useBatchStore } from '../stores/useBatchStore';

interface SOPInputProps {
    onBack: () => void;
    onStart: () => void;
    onManualInput?: (data: { weight: number; water: number }) => void; // For manual mode with data
}

const SOPInput: React.FC<SOPInputProps> = ({ onBack, onStart, onManualInput }) => {
  const [mode, setMode] = useState<'gram' | 'target'>('gram');
  const [inputValue, setInputValue] = useState<number | string>(2500);
  const [isManualMode, setIsManualMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Unit toggle for target mode (mL / Liter)
  const [targetUnit, setTargetUnit] = useState<'ml' | 'liter'>('ml');
  
  // Unit toggle for parutan mode (gram / kg)
  const [weightUnit, setWeightUnit] = useState<'gram' | 'kg'>('kg');
  
  const { createBatch } = useBatchStore();
  
  // Derived state for calculations
  const numericValue = typeof inputValue === 'string' ? parseFloat(inputValue) || 0 : inputValue;

  // Helper: Format weight with dual units (Kg + gram)
  const formatWeight = (grams: number): string => {
    if (grams >= 1000) {
      const kg = grams / 1000;
      return `${kg.toLocaleString('id-ID', { maximumFractionDigits: 1 })} Kg (${grams.toLocaleString('id-ID')} g)`;
    }
    return `${grams.toLocaleString('id-ID')} gram`;
  };

  // Helper: Format volume with dual units (Liter + mL)
  const formatVolume = (liters: number): string => {
    const ml = liters * 1000;
    return `${liters.toLocaleString('id-ID', { maximumFractionDigits: 2 })} L (${ml.toLocaleString('id-ID')} mL)`;
  };

  // Calculation Logic
  // Assumption: 1 kg (1000g) coconut needs 1 Liter water
  // Assumption: 1 kg coconut yields approx 100-120 mL VCO
  
  const getCalculations = () => {
      if (mode === 'gram') {
          // Input is Coconut in Grams or Kg (convert to grams for calculations)
          const coconutGrams = weightUnit === 'kg' ? numericValue * 1000 : numericValue;
          const water = coconutGrams / 1000;
          const minYield = Math.floor(coconutGrams * 0.1);
          const maxYield = Math.floor(coconutGrams * 0.12);
          return { coconut: coconutGrams, water, minYield, maxYield, type: 'gram' as const };
      } else {
          // Input is Target in mL or Liter (convert to mL for calculations)
          const targetMl = targetUnit === 'liter' ? numericValue * 1000 : numericValue;
          // If target is 100mL, we need 1000g coconut (at 100mL/kg yield)
          const requiredCoconut = targetMl / 0.1;
          const requiredWater = requiredCoconut / 1000;
          const maxPotential = Math.floor(targetMl * 1.2);
          return { 
              requiredCoconut, 
              requiredWater, 
              target: targetMl, 
              maxPotential,
              type: 'ml' as const
          };
      }
  };

  const calcs = getCalculations();

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display">
      {/* Header */}
      <div className="flex items-center bg-white dark:bg-surface-dark p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-[#1e3a29]">
        <button 
            onClick={onBack}
            className="text-text-main dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">Mulai Produksi Baru</h2>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 gap-6 pb-24">
        {/* Method Selection */}
        <div className="flex">
          <div className="flex h-12 flex-1 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all duration-200 ${mode === 'gram' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <span className="truncate">PARUTAN (gram/kg)</span>
              <input 
                className="hidden" 
                name="method_selector" 
                type="radio" 
                value="gram" 
                checked={mode === 'gram'}
                onChange={() => {
                    setMode('gram');
                    setInputValue(2500); // Reset to default
                }}
              />
            </label>
            <label className={`flex cursor-pointer h-full grow items-center justify-center overflow-hidden rounded-lg px-2 text-sm font-bold transition-all duration-200 ${mode === 'target' ? 'bg-white dark:bg-surface-dark shadow-sm text-primary' : 'text-text-secondary dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
              <span className="truncate">TARGET (mL/L)</span>
              <input 
                className="hidden" 
                name="method_selector" 
                type="radio" 
                value="target"
                checked={mode === 'target'}
                onChange={() => {
                    setMode('target');
                    setInputValue(250); // Reset to default target
                }}
              />
            </label>
          </div>
        </div>

        {/* Primary Input */}
        <div className="flex flex-col gap-2">
          <label className="text-text-main dark:text-gray-200 text-sm font-medium ml-1">
              {mode === 'gram' 
                ? `Berat Parutan Kelapa (${weightUnit === 'kg' ? 'Kg' : 'gram'})` 
                : `Target Produksi (${targetUnit === 'liter' ? 'Liter' : 'mL'})`}
          </label>
          <div className="relative flex items-center">
            <input 
                className="w-full bg-white dark:bg-surface-dark border-2 border-transparent focus:border-primary dark:focus:border-primary hover:border-gray-200 dark:hover:border-gray-700 rounded-xl text-text-main dark:text-white text-4xl font-bold p-6 pr-28 shadow-sm focus:ring-0 transition-all placeholder:text-gray-300 outline-none" 
                placeholder="0" 
                type="number" 
                step={mode === 'gram' && weightUnit === 'kg' ? '0.1' : '1'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
            />
            {mode === 'gram' ? (
              <button
                onClick={() => setWeightUnit(prev => prev === 'gram' ? 'kg' : 'gram')}
                className="absolute right-4 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                {weightUnit === 'gram' ? 'g' : 'Kg'}
              </button>
            ) : (
              <button
                onClick={() => setTargetUnit(prev => prev === 'ml' ? 'liter' : 'ml')}
                className="absolute right-4 px-3 py-1.5 rounded-lg bg-primary/10 text-primary font-bold text-sm hover:bg-primary/20 transition-colors"
              >
                {targetUnit === 'ml' ? 'mL' : 'L'}
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Info Card */}
        <div className="rounded-xl bg-primary/10 border border-primary/20 p-5 flex flex-col gap-3">
            {calcs.type === 'gram' ? (
                // MODE A: PARUTAN
                <>
                     <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-primary-dark dark:text-primary">
                            <Droplets size={20} />
                            <span className="font-bold text-lg">
                                {formatVolume(calcs.water)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-300">
                             <Thermometer size={18} />
                             <span className="text-sm font-medium">35-40°C</span>
                        </div>
                     </div>
                     <div className="h-px bg-primary/20 w-full"></div>
                     <div className="flex items-center gap-2 text-text-main dark:text-white">
                        <TrendingUp size={20} className="text-primary-dark dark:text-primary" />
                        <span className="text-sm font-medium">
                            Estimasi Hasil: <span className="font-bold">
                                {calcs.minYield.toLocaleString('id-ID')} - {calcs.maxYield.toLocaleString('id-ID')} mL
                            </span>
                        </span>
                     </div>
                </>
            ) : (
                // MODE B: TARGET
                <>
                    <div className="flex items-center gap-2 text-text-main dark:text-white">
                        <Disc size={20} className="text-primary-dark dark:text-primary" />
                        <span className="font-bold text-lg">
                             Butuh Kelapa: {formatWeight(calcs.requiredCoconut)}
                        </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-300">
                            <Droplets size={18} />
                            <span className="text-sm font-medium">
                                Butuh Air: {formatVolume(calcs.requiredWater)}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-text-secondary dark:text-gray-300">
                             <Thermometer size={18} />
                             <span className="text-sm font-medium">35-40°C</span>
                        </div>
                    </div>

                    <div className="h-px bg-primary/20 w-full my-1"></div>

                     <div className="flex items-center gap-2 text-text-main dark:text-white">
                        <TrendingUp size={20} className="text-primary-dark dark:text-primary" />
                        <span className="text-sm font-medium">
                            Potensi Hasil: <span className="font-bold">
                                {calcs.target.toLocaleString('id-ID')} - {calcs.maxPotential.toLocaleString('id-ID')} mL
                            </span>
                        </span>
                     </div>
                </>
            )}
        </div>

        {/* Manual Mode Toggle */}
        <div className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <p className="text-text-main dark:text-white font-medium">Mode Pencatatan Manual</p>
            <p className="text-text-secondary dark:text-gray-400 text-xs">Lewati panduan SOP otomatis</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              className="sr-only peer" 
              type="checkbox" 
              checked={isManualMode}
              onChange={(e) => setIsManualMode(e.target.checked)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-auto p-4 bg-white dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 sticky bottom-0 z-20">
        <div className="flex flex-col gap-3 max-w-[480px] mx-auto">
          <p className="text-center text-xs text-text-secondary dark:text-gray-500 font-medium">
             ⚠️ {mode === 'gram' ? 'Minimal 100g, Maks 50kg' : 'Min 10mL, Maks 5000mL'}
          </p>
          <button 
            onClick={async () => {
              if (isLoading) return;
              
              // Calculate input weight based on mode and unit
              const inputWeight = mode === 'gram' 
                ? (weightUnit === 'kg' ? numericValue * 1000 : numericValue)
                : numericValue / 0.1; // Convert target mL to required grams
              
              // Calculate water volume
              const waterVolume = mode === 'gram' 
                ? (weightUnit === 'kg' ? numericValue : numericValue / 1000)
                : (numericValue / 0.1) / 1000;
              
              // MANUAL MODE: Skip batch creation, just navigate with data
              if (isManualMode && onManualInput) {
                onManualInput({ weight: inputWeight, water: waterVolume });
                return;
              }
              
              // STANDARD SOP MODE: Create batch then navigate
              setIsLoading(true);
              try {
                await createBatch({
                  inputWeight,
                  inputMode: mode,
                  isManualMode: false,
                  productionDate: new Date(),
                });
                onStart();
              } catch (error) {
                console.error('Failed to create batch:', error);
              } finally {
                setIsLoading(false);
              }
            }}
            disabled={isLoading || numericValue <= 0}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed">
            <span>{isLoading ? 'Memproses...' : 'MULAI PROSES'}</span>
            <PlayCircle size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SOPInput;
