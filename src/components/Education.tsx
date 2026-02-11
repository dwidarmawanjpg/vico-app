import React, { useState } from 'react';
import { Search } from 'lucide-react';
import BottomNav from './BottomNav';
import { educationModules, EducationModule } from '../data/educationModules';

interface EducationProps {
    onNavigate: (tab: string) => void;
    onModuleClick?: (module: EducationModule) => void;
}

const Education: React.FC<EducationProps> = ({ onNavigate, onModuleClick }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Semua', 'Persiapan', 'Proses', 'Kualitas', 'Pemasaran'];

  const filteredModules = educationModules.filter(m => {
      const matchesCategory = activeCategory === 'Semua' || m.category === activeCategory;
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display pb-24">
      {/* Header */}
      <div className="flex items-center px-4 py-4 justify-between bg-white/80 dark:bg-surface-dark/80 backdrop-blur-md sticky top-0 z-20 pt-safe transition-colors border-b border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-bold tracking-tight text-text-main dark:text-white">Modul Edukasi</h2>
        <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-2">
           <Search size={20} className="text-gray-500 dark:text-gray-400" />
        </div>
      </div>

      {/* Search & Categories */}
      <div className="bg-white dark:bg-surface-dark pt-2 pb-4 shadow-sm z-10 sticky top-[72px] transition-colors">
         {/* Search Bar - Minimalist */}
         <div className="px-4 mb-4">
            <div className="relative">
                <input 
                    type="text" 
                    placeholder="Cari artikel..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 dark:bg-gray-800/50 border-none rounded-xl py-3 pl-11 pr-4 text-text-main dark:text-white placeholder:text-gray-400 focus:ring-1 focus:ring-primary outline-none transition-all"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>
         </div>

         {/* Categories - Horizontal Scroll */}
         <div className="flex overflow-x-auto gap-2 px-4 pb-2 no-scrollbar">
            {categories.map((cat) => (
                <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        activeCategory === cat 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-gray-700'
                    }`}
                >
                    {cat}
                </button>
            ))}
         </div>
      </div>

      {/* Article Feed - Magazine Style */}
      <div className="flex-1 p-4 flex flex-col gap-8">
          {filteredModules.map((module) => (
              <article 
                key={module.id}
                onClick={() => onModuleClick && onModuleClick(module)}
                className="group flex flex-col gap-4 cursor-pointer border-b border-gray-100 dark:border-gray-800 pb-8 last:border-0"
              >
                  {/* Visual Card */}
                  <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gray-200 dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800 transition-transform active:scale-[0.98]">
                      <img 
                        src={module.thumbnail} 
                        alt={module.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Overlay Gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>
                      
                      {/* Category Badge on Image */}
                      <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur-sm px-3 py-1 rounded-full border border-white/20">
                          <span className="text-xs font-bold text-text-main dark:text-white uppercase tracking-wider">{module.category}</span>
                      </div>
                  </div>

                  {/* Text Content - Minimalist (No Author/Date) */}
                  <div className="flex flex-col gap-2 px-1">
                      <h3 className="text-xl font-bold text-text-main dark:text-white leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                          {module.title}
                      </h3>
                      <p className="text-sm text-text-secondary dark:text-gray-400 line-clamp-3 leading-relaxed">
                          {module.excerpt}
                      </p>
                  </div>
              </article>
          ))}
          
          {/* Empty State */}
          {filteredModules.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-center px-8">
                  <div className="bg-gray-100 dark:bg-gray-800 rounded-full p-4 mb-4">
                      <Search size={32} className="text-gray-400" />
                  </div>
                  <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">Artikel tidak ditemukan</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Coba kata kunci lain atau ubah kategori filter.</p>
              </div>
          )}
      </div>

      <BottomNav activeTab="education" onNavigate={onNavigate} />
    </div>
  );
};

export default Education;
