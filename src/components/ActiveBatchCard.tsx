import React, { useState, useEffect } from 'react';
import type { LucideIcon } from 'lucide-react';
import { 
  Package, Droplets, Layers, RefreshCw, Hourglass, Filter, CheckCircle2, 
  Timer, Clock, Play, Pause as PauseIcon 
} from 'lucide-react';
import { useTimerStore } from '../stores/useTimerStore';
import { TimerService } from '../services/TimerService';
import { SOP_STEPS, type StepNumber } from '../types/batch';
import type { Batch } from '../types/batch';

interface ActiveBatchCardProps {
  batch: Batch;
  onClick: () => void;
}

// Step configuration with Lucide icons
const STEP_CONFIG: Record<number, {
  label: string;
  color: 'amber' | 'blue' | 'gray' | 'green';
  Icon: LucideIcon;
}> = {
  1: { label: 'Persiapan', color: 'gray', Icon: Package },
  2: { label: 'Ekstraksi', color: 'blue', Icon: Droplets },
  3: { label: 'Pemisahan', color: 'blue', Icon: Layers },
  4: { label: 'Pengadukan', color: 'amber', Icon: RefreshCw },
  5: { label: 'Fermentasi', color: 'amber', Icon: Hourglass },
  6: { label: 'Penyaringan', color: 'green', Icon: Filter },
  7: { label: 'Kontrol Kualitas', color: 'green', Icon: CheckCircle2 },
};

const getColors = (color: string) => {
  switch(color) {
    case 'amber': return {
      bar: 'bg-amber-400',
      badgeBg: 'bg-amber-50 dark:bg-amber-900/20',
      badgeText: 'text-amber-700 dark:text-amber-400',
      badgeBorder: 'border-amber-100 dark:border-amber-800/30',
      iconBg: 'bg-amber-50 dark:bg-amber-900/30',
      iconColor: 'text-amber-500',
      progressColor: 'text-amber-600 dark:text-amber-400',
      isUrgent: true
    };
    case 'blue': return {
      bar: 'bg-blue-400',
      badgeBg: 'bg-blue-50 dark:bg-blue-900/20',
      badgeText: 'text-blue-700 dark:text-blue-400',
      badgeBorder: 'border-blue-100 dark:border-blue-800/30',
      iconBg: 'bg-blue-50 dark:bg-blue-900/30',
      iconColor: 'text-blue-500',
      progressColor: 'text-blue-600 dark:text-blue-400',
      isUrgent: false
    };
    case 'green': return {
      bar: 'bg-primary',
      badgeBg: 'bg-green-50 dark:bg-green-900/20',
      badgeText: 'text-green-700 dark:text-green-400',
      badgeBorder: 'border-green-100 dark:border-green-800/30',
      iconBg: 'bg-green-50 dark:bg-green-900/30',
      iconColor: 'text-green-500',
      progressColor: 'text-green-600 dark:text-green-400',
      isUrgent: false
    };
    default: return {
      bar: 'bg-gray-300 dark:bg-gray-600',
      badgeBg: 'bg-gray-100 dark:bg-gray-700',
      badgeText: 'text-gray-600 dark:text-gray-300',
      badgeBorder: 'border-gray-200 dark:border-gray-600',
      iconBg: 'bg-gray-100 dark:bg-gray-800',
      iconColor: 'text-gray-400',
      progressColor: 'text-gray-600 dark:text-gray-300',
      isUrgent: false
    };
  }
};

const formatTime = (seconds: number): string => {
  if (seconds < 0) seconds = 0;
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const ActiveBatchCard: React.FC<ActiveBatchCardProps> = ({ batch, onClick }) => {
  const { timers, rehydrateAll } = useTimerStore();
  const [displayTime, setDisplayTime] = useState<number>(0);
  
  const step = batch.currentStep as StepNumber;
  const stepConfig = STEP_CONFIG[step] || STEP_CONFIG[1];
  const colors = getColors(stepConfig.color);
  const StepIcon = stepConfig.Icon;
  
  // Get timer data for this batch
  const timerData = timers[batch.id];
  const isActive = timerData?.isActive ?? false;
  const hasTimer = SOP_STEPS[step as keyof typeof SOP_STEPS]?.timer != null;
  
  // Rehydrate timers on mount to get latest from DB
  useEffect(() => {
    rehydrateAll();
  }, []);
  
  // Real-time countdown using Date.now() differences
  useEffect(() => {
    if (!hasTimer) return;
    
    // Calculate remaining time from TimerService (uses Date.now() differences)
    const updateTime = async () => {
      const timerInstance = await TimerService.getTimer(batch.id);
      if (timerInstance) {
        const remaining = TimerService.getRemainingTime(timerInstance);
        setDisplayTime(remaining);
      } else if (timerData) {
        setDisplayTime(timerData.timeLeft);
      }
    };
    
    // Initial update
    updateTime();
    
    // Set interval for live countdown if timer is active
    let interval: number | undefined;
    if (isActive) {
      interval = window.setInterval(() => {
        updateTime();
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [batch.id, hasTimer, isActive, timerData?.timeLeft]);
  
  // Format date for display
  const batchDate = new Date(batch.date);
  const dateStr = batchDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

  // Determine timer status
  const timerFinished = hasTimer && displayTime <= 0;
  const timerPaused = hasTimer && !isActive && displayTime > 0;

  return (
    <article 
      onClick={onClick}
      className="bg-white dark:bg-surface-dark rounded-xl p-4 shadow-soft border border-gray-100 dark:border-gray-800 relative overflow-hidden group cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Left color bar */}
      <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`}></div>
      
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium mb-2 border ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}>
            {stepConfig.label}
          </span>
          <h4 className="text-base font-bold text-text-main dark:text-white">{batch.id}</h4>
        </div>
        <div className={`size-10 rounded-full ${colors.iconBg} flex items-center justify-center ${colors.iconColor}`}>
          <StepIcon size={20} />
        </div>
      </div>
      
      {/* Progress/Timer */}
      <div className="flex items-end justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary dark:text-gray-400 mb-1">
            {hasTimer 
              ? (timerFinished ? 'Timer selesai' : timerPaused ? 'Jeda' : 'Waktu tersisa') 
              : 'Dibuat'}
          </span>
          <div className={`flex items-center gap-1.5 font-bold text-lg ${
            timerFinished ? 'text-green-500' : timerPaused ? 'text-amber-500' : colors.progressColor
          }`}>
            {hasTimer ? (
              <>
                {timerFinished ? (
                  <>
                    <CheckCircle2 size={18} />
                    <span>Selesai</span>
                  </>
                ) : timerPaused ? (
                  <>
                    <PauseIcon size={18} />
                    {formatTime(displayTime)}
                  </>
                ) : (
                  <>
                    <Timer size={18} className="animate-pulse" />
                    {formatTime(displayTime)}
                  </>
                )}
              </>
            ) : (
              <>
                <Clock size={18} />
                {dateStr}
              </>
            )}
          </div>
        </div>
        
        {/* Action Button */}
        {timerFinished ? (
          <button className="bg-green-500 hover:bg-green-600 active:bg-green-700 text-white pl-3 pr-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-green-500/30">
            <Play size={18} fill="currentColor" />
            Lanjut
          </button>
        ) : colors.isUrgent ? (
          <button className="bg-primary hover:bg-primary-dark active:bg-primary-dark text-white pl-3 pr-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-primary/30">
            <Play size={18} fill="currentColor" />
            Lanjut
          </button>
        ) : (
          <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-main dark:text-white pl-3 pr-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Play size={18} />
            Lanjut
          </button>
        )}
      </div>
    </article>
  );
};

export default ActiveBatchCard;
