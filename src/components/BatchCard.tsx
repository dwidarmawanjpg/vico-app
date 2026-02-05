import React from 'react';

interface BatchCardProps {
  id: string;
  type: string;
  typeColor: 'amber' | 'blue' | 'gray';
  status: 'active' | 'waiting';
  progressLabel: string;
  progressValue: string;
  progressIcon: string;
  actionLabel: string;
  actionIcon: string;
  mainIcon: string;
  mainIconFilled?: boolean;
}

const BatchCard: React.FC<BatchCardProps> = ({ 
  id, type, typeColor, status, progressLabel, progressValue, progressIcon, actionLabel, actionIcon, mainIcon, mainIconFilled 
}) => {
  
  const getColors = (color: string) => {
    switch(color) {
      case 'amber': return {
        bar: 'bg-amber-400',
        badgeBg: 'bg-amber-50 dark:bg-amber-900/20',
        badgeText: 'text-amber-700 dark:text-amber-400',
        badgeBorder: 'border-amber-100 dark:border-amber-800/30',
        iconColor: 'text-amber-500',
        progressColor: 'text-amber-600 dark:text-amber-400'
      };
      case 'blue': return {
        bar: 'bg-primary', // Using primary (green-ish/teal) as per second card in design which looks blue-ish but has primary border
        badgeBg: 'bg-blue-50 dark:bg-blue-900/20',
        badgeText: 'text-blue-700 dark:text-blue-400',
        badgeBorder: 'border-blue-100 dark:border-blue-800/30',
        iconColor: 'text-blue-500',
        progressColor: 'text-text-main dark:text-gray-200'
      };
      case 'gray': return {
        bar: 'bg-gray-300 dark:bg-gray-600',
        badgeBg: 'bg-gray-100 dark:bg-gray-700',
        badgeText: 'text-gray-600 dark:text-gray-300',
        badgeBorder: 'border-gray-200 dark:border-gray-600',
        iconColor: 'text-gray-400',
        progressColor: 'text-text-main dark:text-gray-200'
      };
      default: return {
        bar: 'bg-gray-400',
        badgeBg: 'bg-gray-100',
        badgeText: 'text-gray-700',
        badgeBorder: 'border-gray-200',
        iconColor: 'text-gray-500', 
        progressColor: 'text-gray-700'
      };
    }
  };

  const colors = getColors(typeColor);
  const opacity = status === 'waiting' ? 'opacity-90' : '';

  return (
    <article className={`bg-white dark:bg-surface-dark rounded-xl p-4 shadow-soft border border-gray-100 dark:border-gray-800 relative overflow-hidden group ${opacity}`}>
      <div className={`absolute top-0 left-0 w-1 h-full ${colors.bar}`}></div>
      <div className="flex justify-between items-start mb-3">
        <div>
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium mb-2 border ${colors.badgeBg} ${colors.badgeText} ${colors.badgeBorder}`}>
            {type}
          </span>
          <h4 className="text-base font-bold text-text-main dark:text-white">{id}</h4>
        </div>
        <div className={`size-10 rounded-full bg-background-light dark:bg-gray-800 flex items-center justify-center ${colors.iconColor}`}>
          <span className={`material-symbols-outlined ${mainIconFilled ? 'icon-filled' : ''}`}>{mainIcon}</span>
        </div>
      </div>
      <div className="flex items-end justify-between mt-2">
        <div className="flex flex-col">
          <span className="text-xs text-text-secondary dark:text-gray-400 mb-1">{progressLabel}</span>
          <div className={`flex items-center gap-1.5 font-bold text-lg ${colors.progressColor}`}>
            <span className="material-symbols-outlined text-[20px]">{progressIcon}</span>
            {progressValue}
          </div>
        </div>
        
        {typeColor === 'amber' ? (
             <button className="bg-primary hover:bg-primary-dark active:bg-primary-dark text-white pl-3 pr-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors shadow-sm shadow-primary/30">
                <span className="material-symbols-outlined text-[20px] icon-filled">{actionIcon}</span>
                {actionLabel}
            </button>
        ) : (
            <button className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-text-main dark:text-white pl-3 pr-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[20px]">{actionIcon}</span>
                {actionLabel}
            </button>
        )}
       
      </div>
    </article>
  );
};

export default BatchCard;
