import React from 'react';
import { Cloud } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';
import logoVico from '../assets/logo-vico.png'; // Pastikan import ini ada

const Header: React.FC = () => {
  const { profile } = useUserStore();
  
  return (
    <header className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 pt-safe">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          
          {/* Container lingkaran dihapus. Gambar langsung ditampilkan. */}
          <img 
            src={profile.avatarUrl || logoVico}
            alt="VICO Logo"
            // h-10: Set tinggi sekitar 40px (sesuai ukuran header)
            // w-auto: Lebar menyesuaikan otomatis agar tidak gepeng
            // object-contain: Pastikan seluruh logo terlihat utuh
            className="h-10 w-auto object-contain"
          />

        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-surface-dark rounded-full border border-gray-100 dark:border-gray-700 shadow-sm">
            <Cloud className="text-primary" size={18} />
            <span className="text-xs font-medium text-text-secondary dark:text-gray-400">Offline Ready</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;