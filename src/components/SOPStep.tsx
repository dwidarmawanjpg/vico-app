import React, { useState, useEffect } from 'react';
import { ArrowLeft, Timer, Edit2, Pause, RotateCcw, Play, Info, CheckCircle, Circle, ArrowRight, Target, ListOrdered, Home } from 'lucide-react';
import { useBatchStore } from '../stores/useBatchStore';
import { useTimerStore } from '../stores/useTimerStore';
import { BatchService } from '../services/BatchService';
import { SOP_STEPS, STEP_REQUIRED_CHECKLISTS, type StepNumber } from '../types/batch';
import { STEP_INSTRUCTIONS } from '../types/stepInstructions';

interface SOPStepProps {
    onBack: () => void;
    onNext: () => void;
    onHome: () => void; // Navigate to home (minimize)
}

const SOPStep: React.FC<SOPStepProps> = ({ onBack, onNext, onHome }) => {
  const { currentBatch, refreshCurrentBatch } = useBatchStore();
  const { timers, startTimer, pauseTimer, resumeTimer, resetTimer, initTimer, initCustomTimer, rehydrateAll } = useTimerStore();
  
  // Toast state for minimize feedback
  const [showToast, setShowToast] = useState(false);
  
  // Edit timer modal state
  const [showEditTimerModal, setShowEditTimerModal] = useState(false);
  const [editHours, setEditHours] = useState(0);
  const [editMinutes, setEditMinutes] = useState(0);
  const [editSeconds, setEditSeconds] = useState(0);
  
  // Derive values with fallbacks (needed for hooks that depend on these)
  const stepNumber = (currentBatch?.currentStep || 1) as StepNumber;
  const stepConfig = SOP_STEPS[stepNumber] || SOP_STEPS[1];
  const batchId = currentBatch?.id || '';

  const timerData = timers[batchId];
  const timeLeft = timerData?.timeLeft ?? 0;
  const isActive = timerData?.isActive ?? false;



  // Checklist State - must be declared before any conditional returns
  const [localChecklists, setLocalChecklists] = useState<Record<string, boolean>>({});

  // Initialize timer and rehydration on mount/step change
  useEffect(() => {
    if (batchId && stepNumber) {
       // Rehydrate timers first to get latest state from DB
       rehydrateAll().then(() => {
           // If no timer exists for this step/batch, initialize one
           if (!timers[batchId] || timers[batchId].stepNumber !== stepNumber) {
               if (stepConfig.timer) {
                 initTimer(batchId, stepNumber);
               }
           }
       });
    }
  }, [batchId, stepNumber, initTimer, rehydrateAll]);

  // Timer Tick handled by GlobalTimerListener now
  // This ensures timer runs even if we navigate to Settings

  // Sync local checklist state with batch data
  useEffect(() => {
    if (currentBatch?.checklists) {
        setLocalChecklists(currentBatch.checklists as Record<string, boolean>);
    }
  }, [currentBatch]);

  // Alarm trigger when timer hits 0
  // Alarm trigger when timer hits 0


  // Cleanup: Stop alarm when component unmounts (user navigates away)
  // Cleanup: Stop alarm when component unmounts (user navigates away)
  // REMOVED: Global alarm should persist until manually stopped
  // useEffect(() => {
  //   return () => {
  //     SoundService.stopAlarmSound();
  //   };
  // }, []);

  const requiredKeys = STEP_REQUIRED_CHECKLISTS[stepNumber] || [];
  const allChecked = requiredKeys.every(key => localChecklists[key]);

  // Guard: If no batch is loaded, show loading/error state (AFTER all hooks)
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

  // Redirect: If we're at step 7 (QC), immediately redirect to QC page
  // This shouldn't happen but is a safety net
  if (currentBatch.currentStep === 7) {
    // Use useEffect-like immediate call
    setTimeout(() => onNext(), 0);
    return (
      <div className="relative flex h-full min-h-screen w-full flex-col items-center justify-center max-w-md mx-auto bg-background-light dark:bg-background-dark">
        <div className="animate-pulse text-primary font-bold">Mengarahkan ke Kontrol Kualitas...</div>
      </div>
    );
  }

  // Handlers
  const handleChecklistToggle = async (key: string) => {
      try {
          const newValue = !localChecklists[key];
          setLocalChecklists(prev => ({ ...prev, [key]: newValue }));
          
          // Update DB
          if (batchId) {
              await BatchService.updateStepProgress(batchId, stepNumber, { [key]: newValue }, false);
              await refreshCurrentBatch();
          }
      } catch (error) {
          console.error('Failed to toggle checklist:', error);
      }
  };

  const handleNext = async () => {
      if (!batchId || !allChecked) return;
      
      try {
          // Explicitly advance
          const { nextStep } = await BatchService.updateStepProgress(batchId, stepNumber, localChecklists, true);
          
          await refreshCurrentBatch();
          
          // If we are now at QC step (7), navigate to QC screen
          if (nextStep === 7) {
              onNext(); // Signal parent to show QC screen
          }
      } catch (error) {
          console.error('Failed to advance step:', error);
      }
  };

  const formatTime = (val: number) => val.toString().padStart(2, '0');
  
  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display">
      {/* Top App Bar */}
      <div className="flex items-center bg-surface-light dark:bg-surface-dark p-4 pb-2 justify-between sticky top-0 z-10 shadow-sm dark:shadow-gray-800/30 pt-safe">
        {/* Back Button - Smart Logic */}
        <button 
            onClick={async () => {
                if (stepNumber > 1) {
                    // Go to previous step
                    await BatchService.setCurrentStep(batchId, stepNumber - 1);
                    await refreshCurrentBatch();
                } else {
                    // Step 1: Go to HOME instead of Input Screen
                    setShowToast(true);
                    setTimeout(() => setShowToast(false), 2000);
                    onHome();
                }
            }}
            className="text-text-main dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center">
            {`Tahap ${stepNumber}: ${stepConfig.name}`}
        </h2>
        {/* Home/Minimize Button */}
        <button 
            onClick={() => {
                setShowToast(true);
                setTimeout(() => {
                    setShowToast(false);
                    onHome();
                }, 500);
            }}
            className="text-text-main dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title="Minimize ke Home"
        >
          <Home size={22} />
        </button>
      </div>

      {/* Toast for minimize feedback */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-gray-800 text-white px-4 py-2.5 rounded-xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-200">
          <Home size={16} />
          <span className="font-medium text-sm">Produksi berjalan di latar belakang</span>
        </div>
      )}

      {/* Scrollable Content */}
      <div className="flex-1 flex flex-col p-4 gap-6 pb-24">
        {/* Interactive Step Indicators */}
        <div className="flex w-full flex-row items-center justify-between px-2">
            {[1, 2, 3, 4, 5, 6].map((step) => {
                const isActiveStep = step === stepNumber;
                const isCompleted = step < stepNumber;
                const isFuture = step > stepNumber;
                const isClickable = step <= stepNumber; // Can click current or previous
                
                const handleStepClick = async () => {
                    if (!isClickable) return;
                    if (step === stepNumber) return; // Already on this step
                    
                    // Navigate to clicked step
                    await BatchService.setCurrentStep(batchId, step);
                    await refreshCurrentBatch();
                };
                
                return (
                <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1">
                        {isActiveStep ? (
                            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30 ring-4 ring-white dark:ring-surface-dark transform scale-110">
                                <span className="text-white text-xs font-bold">{step}</span>
                            </div>
                        ) : (
                            <button 
                                onClick={handleStepClick}
                                disabled={isFuture}
                                className={`h-6 w-6 rounded-full flex items-center justify-center transition-all ${
                                    isCompleted 
                                        ? 'bg-primary/40 hover:bg-primary/60 cursor-pointer active:scale-95' 
                                        : 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'
                                }`}
                                title={isFuture ? 'Belum tersedia' : `Ke Tahap ${step}`}
                            >
                                <span className={`text-[10px] font-bold ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                    {step}
                                </span>
                            </button>
                        )}
                        <span className={`text-[10px] font-medium ${isActiveStep ? 'text-primary font-bold' : isCompleted ? 'text-primary/60' : 'text-gray-400'}`}>
                            {isActiveStep ? 'Proses' : isCompleted ? '✓' : step}
                        </span>
                    </div>
                    {step < 6 && <div className={`h-[2px] flex-1 mx-1 ${isCompleted ? 'bg-primary/20' : 'bg-gray-200 dark:bg-gray-700'}`}></div>}
                </React.Fragment>
                );
            })}
        </div>

        {/* Timer Card - Only show if step has a timer configured */}
        {stepConfig.timer && (
        <div className="bg-surface-light dark:bg-surface-dark rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center gap-6 relative">
            <div className="flex w-full justify-between items-center border-b border-gray-100 dark:border-gray-800 pb-4">
                <div className="flex items-center gap-2">
                    <Timer className="text-primary" size={20} />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Waktu Tersisa</h3>
                </div>
                <button 
                    onClick={() => {
                        // Pre-fill with current time split into H:M:S
                        const totalSecs = timeLeft > 0 ? timeLeft : (stepConfig.timer || 300);
                        const hrs = Math.floor(totalSecs / 3600);
                        const mins = Math.floor((totalSecs % 3600) / 60);
                        const secs = totalSecs % 60;
                        setEditHours(hrs);
                        setEditMinutes(mins);
                        setEditSeconds(secs);
                        setShowEditTimerModal(true);
                    }}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-primary transition-colors"
                    title="Edit durasi timer"
                >
                    <Edit2 size={18} />
                </button>
            </div>
            
            <div className="flex gap-2 w-full justify-center">
                {/* Hours */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-16 sm:w-20 items-center justify-center rounded-xl bg-[#f1f4f2] dark:bg-gray-800 border-b-4 border-gray-200 dark:border-gray-700">
                        <p className="text-text-main dark:text-white text-3xl sm:text-4xl font-bold leading-tight tracking-[-0.015em]">{formatTime(hours)}</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Jam</p>
                </div>
                <div className="flex h-20 items-center justify-center pb-6">
                    <p className="text-text-main dark:text-white text-3xl font-bold">:</p>
                </div>
                 {/* Minutes */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-16 sm:w-20 items-center justify-center rounded-xl bg-[#f1f4f2] dark:bg-gray-800 border-b-4 border-gray-200 dark:border-gray-700">
                        <p className="text-text-main dark:text-white text-3xl sm:text-4xl font-bold leading-tight tracking-[-0.015em]">{formatTime(minutes)}</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Menit</p>
                </div>
                <div className="flex h-20 items-center justify-center pb-6">
                    <p className="text-text-main dark:text-white text-3xl font-bold">:</p>
                </div>
                 {/* Seconds */}
                <div className="flex flex-col items-center gap-2">
                    <div className="flex h-20 w-16 sm:w-20 items-center justify-center rounded-xl bg-[#f1f4f2] dark:bg-gray-800 border-b-4 border-gray-200 dark:border-gray-700">
                         <p className="text-text-main dark:text-white text-3xl sm:text-4xl font-bold leading-tight tracking-[-0.015em]">{formatTime(seconds)}</p>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Detik</p>
                </div>
            </div>

            {/* Timer Controls - Mutually Exclusive States */}
            <div className="flex gap-4 w-full pt-2">
                {(() => {
                    const totalDuration = timerData?.totalDuration ?? stepConfig.timer ?? 0;
                    const isFinished = timeLeft === 0;
                    const isRunning = isActive && timeLeft > 0;
                    const isPaused = !isActive && timeLeft > 0 && timeLeft < totalDuration;

                    // CASE A: Timer Finished (timeLeft === 0)
                    if (isFinished) {
                        return (
                            <button 
                                onClick={async () => {
                                    console.log('Click: Ulangi Timer');
                                    try {
                                        await resetTimer(batchId);
                                    } catch (e) {
                                        alert('Gagal mereset timer');
                                    }
                                }}
                                className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center gap-2 font-bold transition-all active:scale-95"
                            >
                                <RotateCcw size={20} />
                                <span>Ulangi Timer</span>
                            </button>
                        );
                    }

                    // CASE B: Timer Running
                    if (isRunning) {
                        return (
                            <button 
                                onClick={() => pauseTimer(batchId)}
                                className="flex-1 h-12 rounded-xl bg-amber-500 text-white shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 font-bold hover:bg-amber-600 transition-all active:scale-95"
                            >
                                <Pause size={20} />
                                <span>Pause</span>
                            </button>
                        );
                    }

                    // CASE C: Timer Paused
                    if (isPaused) {
                        return (
                            <>
                                <button 
                                    onClick={() => resumeTimer(batchId)}
                                    className="flex-1 h-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-bold hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    <Play size={20} fill="currentColor" />
                                    <span>Lanjutkan</span>
                                </button>
                                <button 
                                    onClick={async () => {
                                        console.log('Click: Reset Paused Timer');
                                        try {
                                            await resetTimer(batchId);
                                        } catch (e) {
                                            alert('Gagal mereset timer');
                                        }
                                    }}
                                    className="h-12 w-12 rounded-xl bg-gray-100 dark:bg-gray-800 text-text-main dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-all active:scale-95"
                                    title="Reset timer"
                                >
                                    <RotateCcw size={20} />
                                </button>
                            </>
                        );
                    }

                    // CASE D: Timer Not Started (default)
                    return (
                        <button 
                            onClick={() => startTimer(batchId)}
                            className="flex-1 h-12 rounded-xl bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center gap-2 font-bold hover:bg-primary/90 transition-all active:scale-95"
                        >
                            <Play size={20} fill="currentColor" />
                            <span>Mulai Timer</span>
                        </button>
                    );
                })()}
            </div>
        </div>
        )}

        {/* Instructions - only show if instruction exists for this step */}
        {(() => {
            const instruction = STEP_INSTRUCTIONS[stepNumber];
            // Defensive: If no instruction for this step, don't render section
            if (!instruction) return null;
            
            return (
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-5 border border-blue-100 dark:border-blue-800/30 flex flex-col gap-4">
                    {/* Goal */}
                    <div className="flex gap-3">
                        <Target className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Tujuan</h4>
                            <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                                {instruction.goal}
                            </p>
                        </div>
                    </div>

                    {/* Parameters (if any) */}
                    {instruction.parameters && instruction.parameters.length > 0 && (
                        <div className="flex gap-3">
                            <Info className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Parameter</h4>
                                <ul className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed list-disc list-inside space-y-1">
                                    {instruction.parameters.map((param, i) => (
                                        <li key={i}>{param}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Steps */}
                    <div className="flex gap-3">
                        <ListOrdered className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" size={20} />
                        <div>
                            <h4 className="font-bold text-blue-900 dark:text-blue-100 text-sm mb-1">Langkah-langkah</h4>
                            <ol className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed list-decimal list-inside space-y-1">
                                {instruction.steps.map((step, i) => (
                                    <li key={i} className={step.startsWith('   ') ? 'ml-4 list-none' : ''}>{step.trim()}</li>
                                ))}
                            </ol>
                        </div>
                    </div>

                    {/* Timer Note (if any) */}
                    {instruction.timerNote && (
                        <div className="flex items-center gap-2 pt-2 border-t border-blue-100 dark:border-blue-800/50">
                            <Timer className="text-blue-600 dark:text-blue-400" size={16} />
                            <p className="text-blue-700 dark:text-blue-300 text-xs font-medium">Timer: {instruction.timerNote}</p>
                        </div>
                    )}
                </div>
            );
        })()}

        {/* Checklist */}
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 px-1">Checklist {stepConfig.name}</h3>
            
            {requiredKeys.map(key => {
                const labelMap: Record<string, string> = {
                    step1_parut_ready: 'Parutan sudah siap & ditimbang',
                    step2_milk_filtered: 'Santan sudah diperas & disaring', 
                    step3_cream_visible: 'Lapisan krim terlihat',
                    step3_cream_collected: 'Krim sudah dikumpulkan',
                    step4_stir_done: 'Pengadukan 30 menit selesai',
                    step5_ferment_done: 'Fermentasi selesai',
                    step6_oil_collected: 'Minyak sudah diambil',
                    step6_filtered: 'Minyak sudah disaring'
                };
                
                return (
                <label key={key} className={`flex items-center gap-4 p-4 rounded-xl border shadow-sm cursor-pointer transition-all ${localChecklists[key] ? 'bg-surface-light dark:bg-surface-dark border-primary' : 'bg-surface-light dark:bg-surface-dark border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}>
                    <div className="relative flex items-center justify-center" onClick={(e) => { e.preventDefault(); handleChecklistToggle(key); }}>
                        {localChecklists[key] ? (
                            <CheckCircle className="text-primary" size={24} fill="currentColor" /> 
                        ) : (
                            <Circle className="text-gray-300 dark:text-gray-600" size={24} />
                        )}
                    </div>
                    <span className={`text-base font-medium flex-1 ${localChecklists[key] ? 'text-text-main dark:text-white' : 'text-gray-600 dark:text-gray-300'}`}>{labelMap[key] || key}</span>
                    <input type="checkbox" className="hidden" checked={!!localChecklists[key]} onChange={() => handleChecklistToggle(key)} />
                </label>
                );
            })}
        </div>
      </div>

      {/* Sticky Footer */}
      <div className="sticky bottom-0 left-0 right-0 bg-surface-light dark:bg-surface-dark border-t border-gray-100 dark:border-gray-800 p-4 pb-8 z-20">
        <button 
            disabled={!allChecked}
            onClick={handleNext}
            className={`w-full h-14 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors ${
                allChecked 
                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary/90 cursor-pointer' 
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
            }`}
        >
            <span>{stepNumber === 6 ? 'LANJUT - KE QC' : 'LANJUT'}</span>
            <ArrowRight size={24} />
        </button>
      </div>

      {/* Edit Timer Modal */}
      {showEditTimerModal && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowEditTimerModal(false)}
        >
          <div 
            className="bg-white dark:bg-surface-dark rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-bold text-text-main dark:text-white mb-4 text-center">
              Edit Durasi Timer
            </h3>
            
            {/* 3-Input Layout: Hours : Minutes : Seconds */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {/* Hours */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="number"
                  value={editHours}
                  onChange={(e) => setEditHours(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                  className="w-16 h-16 text-2xl font-bold text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  max="99"
                />
                <span className="text-xs font-medium text-gray-500">Jam</span>
              </div>
              
              <span className="text-2xl font-bold text-gray-400 pb-5">:</span>
              
              {/* Minutes */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 h-16 text-2xl font-bold text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  max="59"
                />
                <span className="text-xs font-medium text-gray-500">Menit</span>
              </div>
              
              <span className="text-2xl font-bold text-gray-400 pb-5">:</span>
              
              {/* Seconds */}
              <div className="flex flex-col items-center gap-1">
                <input
                  type="number"
                  value={editSeconds}
                  onChange={(e) => setEditSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                  className="w-16 h-16 text-2xl font-bold text-center rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  min="0"
                  max="59"
                />
                <span className="text-xs font-medium text-gray-500">Detik</span>
              </div>
            </div>
            
            <p className="text-xs text-text-sub dark:text-gray-500 mb-4 text-center">
              Timer akan di-reset ke durasi baru
            </p>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowEditTimerModal(false)}
                className="flex-1 h-12 rounded-xl bg-gray-100 dark:bg-gray-700 text-text-main dark:text-white font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={async () => {
                  const totalSeconds = (editHours * 3600) + (editMinutes * 60) + editSeconds;
                  if (totalSeconds > 0) {
                    await initCustomTimer(batchId, stepNumber, totalSeconds);
                    setShowEditTimerModal(false);
                  }
                }}
                className="flex-1 h-12 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
};

export default SOPStep;
