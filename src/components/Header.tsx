import React from 'react';
import { User, Cloud } from 'lucide-react';
import { useUserStore } from '../stores/useUserStore';

const Header: React.FC = () => {
  const { profile } = useUserStore();
  
  return (
    <header className="fixed top-0 w-full max-w-md left-0 right-0 mx-auto z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Profile Avatar - Generic Placeholder or Custom Avatar */}
          <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center border-2 border-white dark:border-gray-700 shadow-sm overflow-hidden">
            {profile.avatarUrl ? (
              <img 
                src={profile.avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="text-primary" size={22} />
            )}
          </div>
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
