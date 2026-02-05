import React from 'react';
import { Home, History, GraduationCap, Settings } from 'lucide-react';

interface BottomNavProps {
    activeTab: string;
    onNavigate: (tab: string) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onNavigate }) => {
    
    // Determine which tab is active for styling
    // mapping home -> 'home', history -> 'history', education -> 'education', settings -> 'settings'
    // 'history-detail' should highlight 'history'
    // 'education-detail' should highlight 'education' (though usually it has no bottom nav, but if it did)
    // Actually in my implementation details screens have Back buttons and NO bottom nav usually, 
    // BUT Education.tsx HAS bottom nav.
    
    const isHome = activeTab === 'home';
    const isHistory = activeTab === 'history' || activeTab === 'history-detail';
    const isEducation = activeTab === 'education' || activeTab === 'education-detail';
    const isSettings = activeTab === 'settings';

    return (
        <nav className="fixed bottom-0 left-0 right-0 mx-auto z-40 w-full max-w-md border-t border-gray-100 dark:border-gray-800 bg-white/95 dark:bg-surface-dark/95 backdrop-blur-lg pb-safe">
            <div className="grid h-16 grid-cols-4 items-center justify-items-center">
                <button 
                    onClick={() => onNavigate('home')}
                    className={`flex flex-col items-center justify-center gap-1 w-full h-full relative ${isHome ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'}`}
                >
                    <Home size={24} fill={isHome ? "currentColor" : "none"} />
                    <span className="text-[10px] font-medium">Beranda</span>
                    {isHome && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></span>}
                </button>

                <button 
                    onClick={() => onNavigate('history')}
                    className={`flex flex-col items-center justify-center gap-1 w-full h-full relative ${isHistory ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'}`}
                >
                    <History size={24} />
                    <span className="text-[10px] font-medium">Riwayat</span>
                    {isHistory && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></span>}
                </button>

                <button 
                    onClick={() => onNavigate('education')}
                    className={`flex flex-col items-center justify-center gap-1 w-full h-full relative ${isEducation ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'}`}
                >
                    <GraduationCap size={24} fill={isEducation ? "currentColor" : "none"} />
                    <span className="text-[10px] font-medium">Modul</span>
                    {isEducation && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></span>}
                </button>

                <button 
                    onClick={() => onNavigate('settings')}
                    className={`flex flex-col items-center justify-center gap-1 w-full h-full relative ${isSettings ? 'text-primary' : 'text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary'}`}
                >
                    <Settings size={24} fill={isSettings ? "currentColor" : "none"} />
                    <span className="text-[10px] font-medium">Akun</span>
                    {isSettings && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"></span>}
                </button>
            </div>
            {/* iOS Home Indicator Spacing */}
            <div className="h-4 w-full bg-white dark:bg-surface-dark"></div>
        </nav>
    );
};

export default BottomNav;
