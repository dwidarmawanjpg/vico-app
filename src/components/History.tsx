import React, { useState, useEffect } from 'react';
import BottomNav from './BottomNav';
import { BatchService } from '../services/BatchService';
import { YieldService } from '../services/YieldService';
import type { Batch as DBBatch } from '../types/batch';

// Display format for batch items
interface BatchDisplay {
    id: string;
    batchId: string;
    dateStr: string;
    timeStr: string;
    datetime: Date;
    status: 'Selesai' | 'Gagal';
    volume: number;
    notes?: string;
    quality?: 'Standard' | 'Premium' | 'Below Standard' | 'Poor';
}

interface HistoryProps {
    onBatchClick: (batch: BatchDisplay) => void;
    onNavigate: (tab: string) => void;
}

// Helper to transform DB batch to display format
const transformBatch = (batch: DBBatch): BatchDisplay => {
    // Use completedAt for time display, fallback to updatedAt, then date
    const displayTimestamp = batch.completedAt ?? batch.updatedAt ?? batch.date;
    const displayDate = new Date(displayTimestamp);
    
    // For date string, use original production date
    const productionDate = new Date(batch.date);
    
    const volume = batch.qcResult?.qc_total_vco_ml ?? 0;
    const efficiency = batch.inputWeight > 0 ? YieldService.calculateEfficiency(volume, batch.inputWeight) : 0;
    
    return {
        id: batch.id,
        batchId: batch.id,
        dateStr: productionDate.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }),
        timeStr: displayDate.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        datetime: displayDate,
        status: batch.status === 'done' ? 'Selesai' : 'Gagal',
        volume,
        notes: batch.qcResult?.qc_notes || (batch.status === 'failed' ? 'Produksi gagal' : undefined),
        quality: efficiency > 0 ? YieldService.getQualityRating(efficiency) : undefined,
    };
};

const History: React.FC<HistoryProps> = ({ onBatchClick, onNavigate }) => {
  const [batches, setBatches] = useState<BatchDisplay[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Load batches from database on mount
  useEffect(() => {
    const loadBatches = async () => {
      try {
        const dbBatches = await BatchService.getHistoryBatches();
        const displayBatches = dbBatches.map(transformBatch);
        setBatches(displayBatches);
      } catch (error) {
        console.error('Failed to load batches:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadBatches();
  }, []);

  // Filter batches by search query
  const filteredBatches = batches.filter(batch => 
    batch.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    batch.notes?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort Descending (Newest First) - use filtered batches
  const sortedBatches = [...filteredBatches].sort((a, b) => b.datetime.getTime() - a.datetime.getTime());

  // Group by Month
  const groupedBatches = sortedBatches.reduce((groups, batch) => {
      const monthYear = batch.datetime.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
      if (!groups[monthYear]) {
          groups[monthYear] = [];
      }
      groups[monthYear].push(batch);
      return groups;
  }, {} as Record<string, BatchDisplay[]>);

  const monthKeys = Object.keys(groupedBatches);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display">
      {/* Top App Bar - NO BACK ARROW */}
      <header className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors duration-200">
        <div className="flex items-center justify-center px-4 py-3">
          <h1 className="text-lg font-bold leading-tight tracking-tight text-center text-text-main dark:text-white">Riwayat Produksi</h1>
        </div>
        {/* Search Bar Area */}
        <div className="px-4 pb-4 pt-2">
          <label className="group flex items-center w-full h-12 bg-white dark:bg-surface-dark rounded-xl shadow-sm ring-1 ring-gray-200 dark:ring-gray-700 focus-within:ring-2 focus-within:ring-primary transition-all duration-200 overflow-hidden">
            <div className="flex items-center justify-center pl-4 pr-3 text-text-sub dark:text-gray-400">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input 
              className="flex w-full min-w-0 flex-1 h-full bg-transparent border-none p-0 text-base font-normal placeholder:text-gray-400 focus:ring-0 text-text-main dark:text-white outline-none" 
              placeholder="Cari batch..." 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </label>
        </div>
      </header>
 
      <div className="flex-1 overflow-y-auto w-full pb-32">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : monthKeys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-text-secondary dark:text-gray-400">
              <span className="material-symbols-outlined text-4xl mb-2">inventory_2</span>
              <p className="font-medium">Belum ada riwayat produksi</p>
              <p className="text-sm">Batch yang selesai akan muncul di sini</p>
            </div>
          ) : (
            <>
              {monthKeys.map((month) => (
                <div key={month} className="mb-6">
                    <div className="px-6 py-3 bg-gray-50/50 dark:bg-gray-800/50 sticky top-0 z-10 backdrop-blur-sm">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary dark:text-gray-400">{month}</h3>
                    </div>
                    <div className="px-4 flex flex-col gap-3 mt-2">
                         {groupedBatches[month].map((batch) => (
                            <div key={batch.id} onClick={() => onBatchClick(batch)} className={`group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-transparent transition-all active:scale-[0.99] cursor-pointer ${batch.status === 'Gagal' ? 'hover:border-red-500/30' : 'hover:border-primary/30'}`}>
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${batch.status === 'Gagal' ? 'bg-status-warning/10 text-status-warning' : 'bg-primary/10 text-primary'}`}>
                                            <span className="material-symbols-outlined">{batch.status === 'Gagal' ? 'block' : 'check_circle'}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-text-main dark:text-white group-hover:text-primary transition-colors">{batch.batchId}</h4>
                                            <div className="flex items-center gap-2 text-xs text-text-secondary dark:text-gray-400 mt-0.5">
                                                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">calendar_today</span> {batch.dateStr}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-gray-100 text-gray-600 border border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700">
                                        {batch.timeStr}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-gray-50 dark:border-gray-700/50">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                        <span className="material-symbols-outlined text-primary text-[18px]">water_drop</span>
                                        <div>
                                            <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase font-semibold">Volume</p>
                                            <p className="text-xs font-bold text-text-main dark:text-gray-200">{batch.volume} mL</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                                         <span className="material-symbols-outlined text-text-secondary dark:text-gray-400 text-[18px]">description</span>
                                         <div className="overflow-hidden">
                                            <p className="text-[10px] text-text-secondary dark:text-gray-400 uppercase font-semibold">Catatan</p>
                                            <p className="text-xs font-medium text-text-main dark:text-gray-200 truncate">{batch.notes || '-'}</p>
                                         </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
              ))}
            </>
          )}
      </div>

       {/* Bottom Navigation */}
      <BottomNav activeTab="history" onNavigate={onNavigate} />
    </div>
  );
};

export default History;
