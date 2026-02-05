import React, { useState } from 'react';
import { useUserStore } from '../stores/useUserStore';

interface OnboardingProps {
    onStart: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onStart }) => {
  const [name, setName] = useState('');
  const { updateProfile } = useUserStore();

  const handleStart = () => {
    // Save name to store (use default if empty)
    const finalName = name.trim() || 'Pengguna VICO';
    updateProfile({ name: finalName });
    onStart();
  };


  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-background-light dark:bg-background-dark font-display antialiased">
      {/* Top Half: Branding Area */}
      <div className="relative flex h-[45vh] w-full flex-col items-center justify-center bg-[#dbe6e0]/30 dark:bg-[#102218] p-6 text-center">
        {/* Background Decoration */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-primary/10 to-transparent dark:from-primary/5"></div>
        <div className="z-10 flex flex-col items-center gap-4">
          {/* Logo / Icon Container */}
          <div className="flex h-32 w-32 items-center justify-center rounded-full bg-white p-6 shadow-sm dark:bg-[#1a3828]">
            <div 
                className="aspect-square w-full bg-contain bg-center bg-no-repeat" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCE0i_JqjiBWjimYsbRlw2gF84_7qeA76UxEJjI6Mkq5hVemWLzBYixz8f2NT_YNrIS2dRyILr8XrZcnBCat5msNe0SthlqmeOWP8tPsa_t1FtzY8Wg577-CSlHHuXD2BZj54yu2We5rugfbAzgdqg0acgVymdQD7fj-j0ugD_pKQ0Sgz6cK_QRDhTMtRPXyQQ4lk6EH1SS21TM7dnCZF_ikfSvVJvoEfQuZfldaEQSxeP0CM97Pd8IRVSRApcJhZyTzeI8PNsjEg")'}}
            ></div>
          </div>
          {/* Brand Name & Subtitle */}
          <div className="flex flex-col gap-1">
            <h1 className="text-4xl font-extrabold tracking-tight text-[#111814] dark:text-[#f0fdf4]">VICO</h1>
            <p className="text-lg font-medium text-[#618973] dark:text-[#a0c4ab]">Asisten VCO-mu</p>
          </div>
        </div>
      </div>
      
      {/* Bottom Half: Content Surface */}
      <div className="relative -mt-6 flex flex-1 flex-col rounded-t-[2rem] bg-white px-6 py-8 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] dark:bg-[#0c1a12] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.2)]">
        {/* Welcome Text */}
        <div className="mb-8 flex flex-col gap-2">
          <h2 className="text-center text-2xl font-bold leading-tight tracking-tight text-[#111814] dark:text-white">
            Selamat datang! Masukkan nama Anda untuk memulai.
          </h2>
        </div>
        
        {/* Input Field */}
        <div className="mb-8 w-full">
          <label className="flex flex-col gap-2">
            <span className="text-base font-medium text-[#111814] dark:text-[#dbe6e0]">Nama Ketua/Produsen</span>
            <div className="relative">
              <input 
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-14 w-full rounded-xl border border-[#dbe6e0] bg-white px-4 py-3 text-base text-[#111814] placeholder:text-[#618973] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary dark:border-[#2a4d3a] dark:bg-[#1a3828] dark:text-white dark:placeholder:text-[#618973] dark:focus:border-primary" 
                placeholder="Masukkan nama Anda" 
                type="text"
              />
            </div>
          </label>
        </div>
        
        {/* Action Button */}
        <div className="mt-auto mb-6 w-full">
          <button 
            onClick={handleStart}
            className="flex h-14 w-full cursor-pointer items-center justify-center rounded-xl bg-primary px-6 text-base font-bold tracking-[0.015em] text-[#111814] transition-transform active:scale-[0.98] hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 dark:focus:ring-offset-[#0c1a12]">
            MULAI SEKARANG
          </button>
        </div>
        
        {/* Meta Text / Disclaimer */}
        <div className="flex items-start justify-center gap-2 text-center">
          <span aria-hidden="true" className="material-symbols-outlined mt-0.5 text-sm text-[#618973] dark:text-[#618973]">info</span>
          <p className="max-w-xs text-xs font-normal leading-relaxed text-[#618973] dark:text-[#618973]">
            Aplikasi akan meminta izin notifikasi untuk alarm timer
          </p>
        </div>
        
        {/* Safe Area Spacer for Bottom Navigation/Gestures */}
        <div className="h-4 w-full"></div>
      </div>
    </div>
  );
};

export default Onboarding;
