import React, { useState } from 'react';
import { 
    User, Edit2, Download, ChevronRight, Timer, Volume2, 
    Trash2, Droplet, Bell, Save, X
} from 'lucide-react';
import BottomNav from './BottomNav';
import { useUserStore } from '../stores/useUserStore';
import { db } from '../db/database';

interface SettingsProps {
    onNavigate: (tab: string) => void;
}

const Settings: React.FC<SettingsProps> = ({ onNavigate }) => {
  const { profile, updateProfile, resetProfile } = useUserStore();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editLocation, setEditLocation] = useState(profile.location);

  const [alarmEnabled, setAlarmEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleSaveProfile = () => {
    updateProfile({ name: editName, location: editLocation });
    setIsEditing(false);
  };

  const handleResetApp = async () => {
    if (window.confirm('⚠️ PERINGATAN: Semua data akan dihapus permanen! Apakah Anda yakin?')) {
        try {
            await db.delete(); // Delete Dexie DB
            await db.open();   // Re-open (creates fresh)
            resetProfile();    // Clear local storage profile
            localStorage.clear(); 
            window.location.reload();
        } catch (error) {
            console.error('Failed to reset app:', error);
            alert('Gagal mereset aplikasi');
        }
    }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display text-text-main dark:text-white pb-24">
      {/* Top App Bar */}
      <div className="sticky top-0 z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-colors">
        <div className="flex items-center justify-center h-16 px-4">
            <h2 className="text-lg font-bold leading-tight tracking-[-0.015em] text-center">Setelan</h2>
        </div>
      </div>

      <div className="flex flex-col gap-2 p-4 w-full">
        {/* Profil Section */}
        <section className="flex flex-col gap-2">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                <User size={20} className="text-primary" />
                Profil
            </h3>
            <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                {/* Profile Avatar - Generic Placeholder or Custom */}
                <div className="h-14 w-14 rounded-full bg-primary/20 flex items-center justify-center shrink-0 border-2 border-primary overflow-hidden">
                    {profile.avatarUrl ? (
                        <img 
                            src={profile.avatarUrl}
                            alt="Profile"
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <User size={28} className="text-primary" />
                    )}
                </div>
                
                {isEditing ? (
                    <div className="flex flex-col flex-1 gap-2">
                        <input 
                            className="text-base font-semibold border-b border-primary/50 focus:border-primary outline-none bg-transparent"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            placeholder="Nama Lengkap"
                        />
                        <input 
                            className="text-sm font-normal text-gray-500 border-b border-gray-200 outline-none bg-transparent"
                            value={editLocation}
                            onChange={(e) => setEditLocation(e.target.value)}
                            placeholder="Lokasi Produksi"
                        />
                    </div>
                ) : (
                    <div className="flex flex-col flex-1 min-w-0">
                        <p className="text-base font-semibold leading-normal truncate">Nama: {profile.name}</p>
                        <p className="text-text-sub dark:text-gray-400 text-sm font-normal truncate">{profile.location}</p>
                    </div>
                )}

                <div className="flex gap-2">
                    {isEditing ? (
                        <>
                            <button onClick={() => setIsEditing(false)} className="flex size-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">
                                <X size={18} />
                            </button>
                            <button onClick={handleSaveProfile} className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                                <Save size={18} />
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="flex size-10 items-center justify-center rounded-full bg-background-light dark:bg-black/20 text-primary hover:bg-primary/10 transition-colors">
                            <Edit2 size={18} />
                        </button>
                    )}
                </div>
            </div>
        </section>

        {/* Target Produksi Section */}
        <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                <Droplet size={20} className="text-primary" />
                Target Produksi
            </h3>
            <div className="bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
                <label className="text-sm font-medium text-text-sub dark:text-gray-400 mb-2 block">
                    Target Bulanan (mL)
                </label>
                <div className="flex items-center gap-3">
                    <input 
                        type="number"
                        value={profile.monthlyTarget ?? 0}
                        onChange={(e) => updateProfile({ monthlyTarget: parseInt(e.target.value) || 0 })}
                        className="flex-1 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-text-main dark:text-white text-lg font-semibold focus:ring-2 focus:ring-primary outline-none"
                        placeholder="Contoh: 3800"
                    />
                    <span className="text-text-sub dark:text-gray-400 font-medium">mL</span>
                </div>
                <p className="text-xs text-text-sub dark:text-gray-500 mt-2">
                    Ketik 0 untuk menyembunyikan progress bar di home
                </p>
            </div>
        </section>

        {/* Data Section */}
        <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[20px]">analytics</span>
                Data
            </h3>
            <div className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 cursor-pointer active:scale-[0.98] transition-transform group">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-12 group-hover:bg-primary/20 transition-colors">
                    <Download size={24} />
                </div>
                <div className="flex flex-col flex-1 justify-center">
                    <p className="text-base font-medium leading-normal line-clamp-1">Export Data (CSV)</p>
                    <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-normal line-clamp-2">Unduh semua riwayat produksi</p>
                </div>
                <div className="shrink-0 text-gray-400 dark:text-gray-500">
                    <ChevronRight size={24} />
                </div>
            </div>
        </section>

        {/* Notifikasi Section */}
        <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                <Bell size={20} className="text-primary" />
                Notifikasi
            </h3>
            <div className="bg-white dark:bg-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {/* Alarm Timer */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="text-text-main dark:text-white flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 size-10">
                            <Timer size={20} />
                        </div>
                        <p className="text-base font-medium">Alarm Timer</p>
                    </div>
                    <button 
                        onClick={() => setAlarmEnabled(!alarmEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${alarmEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${alarmEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                </div>
                {/* Suara Notifikasi */}
                <div className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                        <div className="text-text-main dark:text-white flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 shrink-0 size-10">
                            <Volume2 size={20} />
                        </div>
                        <p className="text-base font-medium">Suara Notifikasi</p>
                    </div>
                    <button 
                        onClick={() => setSoundEnabled(!soundEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${soundEnabled ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-700'}`}
                    >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${soundEnabled ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                </div>
            </div>
        </section>

        {/* Zona Bahaya Section */}
        <section className="flex flex-col gap-2 mt-4">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                 <span className="material-symbols-outlined text-red-500 text-[20px]">warning</span>
                Zona Bahaya
            </h3>
            <div 
                onClick={handleResetApp}
                className="flex items-center gap-4 bg-white dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30 cursor-pointer active:bg-red-50 dark:active:bg-red-900/20 transition-colors group"
            >
                <div className="text-red-500 dark:text-red-400 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/20 shrink-0 size-12 group-hover:bg-red-100 dark:group-hover:bg-red-900/30 transition-colors">
                    <Trash2 size={24} />
                </div>
                <div className="flex flex-col flex-1 justify-center">
                    <p className="text-red-600 dark:text-red-400 text-base font-semibold leading-normal line-clamp-1">Reset Aplikasi</p>
                    <p className="text-red-400 dark:text-red-300/70 text-sm font-normal leading-normal line-clamp-2">Hapus semua data dan kembali ke awal</p>
                </div>
            </div>
        </section>

        {/* Tentang Section */}
        <section className="flex flex-col gap-4 mt-4 mb-8">
            <h3 className="text-lg font-bold leading-tight tracking-[-0.015em] py-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#111814] dark:text-gray-400 text-[20px]">info</span>
                Tentang
            </h3>
            <div className="bg-white dark:bg-surface-dark p-5 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col items-center text-center gap-2">
                <div className="size-16 rounded-2xl bg-primary/20 flex items-center justify-center mb-2">
                    <Droplet size={32} className="text-primary fill-current" />
                </div>
                <p className="text-lg font-bold">VICO</p>
                <p className="text-text-sub dark:text-gray-400 text-sm">Versi 1.0.0 (Build 202601)</p>
                <div className="w-full h-px bg-gray-100 dark:bg-gray-800 my-2"></div>
                <p className="text-gray-400 dark:text-gray-500 text-xs">© 2026 VICO App. All rights reserved.</p>
            </div>
            <div className="mt-4 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Dibuat dengan <span className="text-red-500">❤️</span> untuk produsen VCO Indonesia</p>
            </div>
        </section>
      </div>

       {/* Bottom Navigation */}
       <BottomNav activeTab="settings" onNavigate={onNavigate} />
    </div>
  );
};

export default Settings;
