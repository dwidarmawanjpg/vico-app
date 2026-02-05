import React, { useState, useEffect } from 'react';
import { Calendar, Droplets, Target, TrendingUp, Pencil, X, Check } from 'lucide-react';
import { BatchService } from '../services/BatchService';
import { useUserStore } from '../stores/useUserStore';

interface MonthlyStats {
  totalVcoMl: number;
  batchCount: number;
}

const SummaryCard: React.FC = () => {
  const { profile, setMonthlyTarget } = useUserStore();
  const [stats, setStats] = useState<MonthlyStats>({
    totalVcoMl: 0,
    batchCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editValue, setEditValue] = useState('');

  // Get target from user profile
  const monthlyTarget = profile.monthlyTarget ?? 0;

  useEffect(() => {
    const loadStats = async () => {
      try {
        const data = await BatchService.getMonthlyStats();
        setStats({ totalVcoMl: data.totalVcoMl, batchCount: data.batchCount });
      } catch (error) {
        console.error('Failed to load monthly stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadStats();
  }, []);

  // Open modal with current value
  const openModal = () => {
    setEditValue(monthlyTarget > 0 ? String(monthlyTarget) : '');
    setShowModal(true);
  };

  // Save target
  const handleSave = () => {
    const value = parseInt(editValue) || 0;
    setMonthlyTarget(value);
    setShowModal(false);
  };

  // Calculate progress percentage
  const hasTarget = monthlyTarget > 0;
  const progressPercent = hasTarget 
    ? Math.min(100, (stats.totalVcoMl / monthlyTarget) * 100) 
    : 0;

  // Format number with locale
  const formatNumber = (num: number): string => {
    return num.toLocaleString('id-ID');
  };

  // Get current month name
  const currentMonth = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  return (
    <>
      <section className="bg-gradient-to-br from-primary/10 to-transparent dark:from-primary/5 rounded-2xl p-5 border border-primary/20 relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute -right-6 -bottom-6 opacity-10 rotate-12 pointer-events-none">
          <Droplets className="text-primary" size={120} />
        </div>
        
        <div className="relative z-10">
          {/* Header */}
          <h3 className="text-sm font-medium text-text-secondary dark:text-gray-400 mb-1 flex items-center gap-1.5">
            <Calendar className="text-primary" size={16} />
            Ringkasan {currentMonth}
          </h3>
          
          {/* Main Stats */}
          <div className="flex items-baseline gap-2 mt-2">
            {isLoading ? (
              <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-text-main dark:text-white tracking-tight">
                  {formatNumber(stats.totalVcoMl)}
                </h2>
                <span className="text-lg font-medium text-text-secondary dark:text-gray-400">mL</span>
              </>
            )}
          </div>
          
          {/* Batch Count */}
          {!isLoading && stats.batchCount > 0 && (
            <p className="text-xs text-text-secondary dark:text-gray-500 mt-1 flex items-center gap-1">
              <TrendingUp size={12} />
              dari {stats.batchCount} batch selesai
            </p>
          )}
          
          {/* Conditional: Show progress bar only if target > 0 */}
          {hasTarget && (
            <>
              {/* Progress Bar */}
              <div className="w-full bg-white/50 dark:bg-white/10 h-2 rounded-full mt-4 overflow-hidden">
                <div 
                  className="bg-primary h-full rounded-full transition-all duration-500 ease-out" 
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              
              {/* Target with Edit Button */}
              <div className="flex items-center justify-between mt-2">
                <button 
                  onClick={openModal}
                  className="text-xs text-text-secondary dark:text-gray-400 flex items-center gap-1.5 hover:text-primary transition-colors group"
                >
                  <Target size={12} />
                  Target: {formatNumber(monthlyTarget)} mL
                  <Pencil size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
                <p className="text-xs font-medium text-primary">
                  {progressPercent.toFixed(0)}%
                </p>
              </div>
            </>
          )}

          {/* Show set target button if no target */}
          {!hasTarget && !isLoading && (
            <button 
              onClick={openModal}
              className="mt-4 flex items-center gap-2 text-sm text-primary hover:text-primary-dark transition-colors"
            >
              <Target size={14} />
              <span className="font-medium">Set Target Bulanan</span>
              <Pencil size={12} />
            </button>
          )}
        </div>
      </section>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold text-text-main dark:text-white">Set Target Bulanan</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Modal Body */}
            <div className="p-4">
              <label className="block text-sm font-medium text-text-secondary dark:text-gray-400 mb-2">
                Target produksi VCO per bulan
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder="Contoh: 3800"
                  className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main dark:text-white text-lg font-semibold focus:ring-2 focus:ring-primary outline-none"
                  autoFocus
                />
                <span className="text-text-secondary dark:text-gray-400 font-medium">mL</span>
              </div>
              <p className="text-xs text-text-secondary dark:text-gray-500 mt-2">
                Ketik 0 atau kosongkan untuk menghapus target
              </p>
            </div>
            
            {/* Modal Footer */}
            <div className="flex gap-3 p-4 pt-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-text-main dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SummaryCard;
