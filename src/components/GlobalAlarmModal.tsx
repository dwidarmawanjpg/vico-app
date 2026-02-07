import React from 'react';
import { AlarmClock, XCircle } from 'lucide-react';
import { SoundService } from '../services/SoundService';

interface GlobalAlarmModalProps {
    batchId: string;
    onDismiss: () => void;
}

const GlobalAlarmModal: React.FC<GlobalAlarmModalProps> = ({ batchId, onDismiss }) => {
    // Determine batch name/display
    // For now, simplify. In future we can fetch batch details.
    
    const handleStop = () => {
        SoundService.stopAlarmSound();
        onDismiss();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-sm mx-4 bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border-2 border-red-500 overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="bg-red-500 p-6 flex flex-col items-center justify-center text-white">
                    <div className="bg-white/20 p-4 rounded-full mb-3 animate-bounce">
                        <AlarmClock size={48} strokeWidth={2.5} />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-center">WAKTU HABIS!</h2>
                    <p className="text-red-100 text-center text-sm mt-1">
                        Timer untuk Batch <span className="font-mono font-bold bg-white/20 px-1 rounded">{batchId}</span> selesai.
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 flex flex-col gap-4">
                    <p className="text-center text-gray-600 dark:text-gray-300">
                        Selesaikan pekerjaan Anda dan lanjut ke tahap berikutnya.
                    </p>

                    <button 
                        onClick={handleStop}
                        className="w-full h-14 bg-green-600 hover:bg-green-700 active:bg-green-800 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-500/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                    >
                        <XCircle size={24} />
                        MATIKAN & LANJUT
                    </button>
                    
                    {/* Optional: Snooze? No user request for snooze */}
                </div>
            </div>
        </div>
    );
};

export default GlobalAlarmModal;
