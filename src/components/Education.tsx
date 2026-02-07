import React, { useState } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import BottomNav from './BottomNav';

export const modules = [
    {
      id: 1,
      category: 'Persiapan',
      title: 'Pemilihan Kelapa',
      description: 'Cara memilih kelapa tua yang tepat untuk hasil minyak maksimal.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD8kb1AzlPiv-Jw1VeqgXZtvaFJG3iTcJLcJIBZ09puW2Dv6nGf97e8YjxI_-n3yLozFARHpCAZuBXIvX2h5VJTF7MQhguIv3sV-6AzB1BIaEyiblXW-im6K4KSE9-liPde6Y198tVgk7P_wNwuKk3OnfsVL6DU2kOx1ZjvaBt7ceD0RQHzPgenLRrRjf0Sq2VOPrvV1LJxl7_XUFNaZ6VYcKXNcTD6UChgRWApYiLpEIswiYbINwBJVrj7i763VLWpFBO7HnEBhg',
      color: 'green',
      longDescription: "Memilih kelapa yang tepat adalah langkah terpenting dalam membuat minyak kelapa murni (VCO) berkualitas tinggi. Kelapa yang sudah matang sempurna memiliki kandungan minyak paling banyak dan kadar air yang pas.",
      goodTraits: [
          "Berat dan berisi saat diangkat",
          "Air berbunyi nyaring \"kopyor\" saat diguncang",
          "Kulit luar berwarna coklat tua merata",
          "Daging kelapa tebal dan keras"
      ],
      badTraits: [
          "Kelapa muda (sabut masih hijau)",
          "Retak atau bocor airnya",
          "Berjamur di bagian \"mata\" kelapa"
      ]
    },
    {
      id: 2,
      category: 'Proses',
      title: 'Suhu Ideal Fermentasi',
      description: 'Menjaga suhu ruangan agar proses fermentasi berjalan sempurna.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAjRlx0Ttsf3Mm9pTcxyhbo6foKSspIgFOVWkZiOdSba7E1180BIID4UnydSOpX3pIMPPFdVeWPkFTvm_33oJqFDpVhQ1eu0SD_KPVCvykALdANbfNrGHLlBZls_gbOtOwjxPw04OI91gQzcIG4p-qgOsNFJz8hcmaKbcykquSUb4o_ZcP6oO9ka1M75i4PuE6XGo11sZCorLxsXQPJghtnIaDTK3I7EOeEmP8tLenuoYRQyTwSTCigzflFp531_GUya3sE7juXoA',
      color: 'blue'
    },
    {
      id: 3,
      category: 'Proses',
      title: 'Teknik Ekstraksi',
      description: 'Metode pemisahan air dan minyak yang efisien tanpa mesin.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCV3z6GVI7jBWfXXyaVMjHvfJ5D8cdmJVyWMN-41Ch4B0x4CeZhcnW4cnO1WBmuW5IBzNFCNxUVaVvmDrDSPqwsa01-gD2goTU_SMyf41rfXTni_3FVSKKqJJGlL2IYfQ-TvIYQeVNm1RGfUf0_4UpmFl_G_0hu-DScESwKCtZCpYGlp6Psd16D6-N3IJv3mQ_YTLjboHnQY7ptVcLP2LN60dQl6vFqHIfObwltN5Ossk_O0PLee7GZWiBcvOyviBvU40TUkWsTmQ',
      color: 'blue'
    },
    {
      id: 4,
      category: 'Pemasaran',
      title: 'Strategi Kemasan',
      description: 'Membuat kemasan menarik untuk meningkatkan nilai jual.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBaDLF3EeIbPcTrKIZQH3XxSFu_mFRIgLr72j0DhjyUi7v0yf0R9vHTIMFFJGETsAiGRmbBapSN6-rN2c86tgtStaBlZ2oUmBe-7Xt7IdHsfPL9uWMdYwlzPODLwTkxJNg-0nTxjLQUfaWQGpU1DT_lhcaVRNo6skRfVl88QmnBrWSMfdJd-2wKlgAbx77jn0P4Spckud9TE5RSdLG0hCgObOdf22vV0nneHqb1ce5p9SREDAsqqcL8XdWNf73azLXTGl05hE1kfg',
      color: 'purple'
    },
    {
      id: 5,
      category: 'Kualitas',
      title: 'Standar Kejernihan',
      description: 'Parameter visual untuk menentukan grade A VCO.',
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB3I_yjIS0ba3tfIuQM69JXCnfdGKoyELuhRi9vCrZ6AfS5io9Z6ZBvUmzCTLuIL4Hm_8lBKkFZqRI_6sdKWJ0_kGZDJmNmigRWKWr_1bvQF6DY1Cnm9gb6fuLodeaDQfhXTn-7kxjE-wV5GIPebNxzaOABoM3f9Pt2JDpSA1TyBhO3ghX3yix7_A-ITdVZMZ64o189_ZO-2cgTM8SlC1LDmFOc1puKp9mF73SWmv9SivdlrfLRBhnuGVnWBY-8I2uB3kMyfP0C_A',
      color: 'orange'
    }
  ];

interface EducationProps {
    onNavigate: (tab: string) => void;
    onModuleClick?: (module: typeof modules[0]) => void;
}

const Education: React.FC<EducationProps> = ({ onNavigate, onModuleClick }) => {
  const [activeCategory, setActiveCategory] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['Semua', 'Persiapan', 'Proses', 'Kualitas', 'Pemasaran'];

  const filteredModules = modules.filter(m => {
      const matchesCategory = activeCategory === 'Semua' || m.category === activeCategory;
      const matchesSearch = m.title.toLowerCase().includes(searchQuery.toLowerCase()) || m.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
  });

  const getCategoryColor = (color: string) => {
      switch (color) {
          case 'green': 
          case 'blue': 
          case 'purple': 
          case 'orange': 
              return 'bg-green-50 text-green-700 ring-green-600/20 dark:bg-green-900/30 dark:text-green-400';
          default: return 'bg-gray-50 text-gray-700 ring-gray-600/20';
      }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display">
      {/* Header */}
      <div className="flex items-center px-4 py-3 pb-2 justify-center bg-white dark:bg-surface-dark sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800 pt-safe">
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] text-center">Modul Edukasi</h2>
      </div>

      {/* Search Bar */}
      <div className="px-4 py-3 bg-white dark:bg-surface-dark">
        <label className="flex flex-col min-w-40 h-14 w-full">
            <div className="flex w-full flex-1 items-stretch rounded-xl h-full shadow-sm">
                <div className="text-text-sub dark:text-gray-400 flex border-none bg-[#f1f4f2] dark:bg-gray-800 items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <Search size={22} />
                </div>
                <input 
                    className="flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-main dark:text-white focus:outline-0 focus:ring-0 border-none bg-[#f1f4f2] dark:bg-gray-800 focus:border-none h-full placeholder:text-text-sub dark:placeholder:text-gray-500 px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal" 
                    placeholder="Cari modul..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
        </label>
      </div>

      {/* Categories */}
      <div className="flex gap-3 px-4 py-2 overflow-x-auto no-scrollbar pb-4 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-gray-800">
        {categories.map((cat) => (
            <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all active:scale-95 ${
                    activeCategory === cat 
                    ? 'bg-primary shadow-sm text-white' 
                    : 'bg-[#f1f4f2] dark:bg-gray-800 text-text-main dark:text-gray-300 border border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                }`}
            >
                <p className="text-sm font-medium leading-normal">{cat}</p>
            </button>
        ))}
      </div>

      {/* List Modules */}
      <div className="flex flex-col gap-1 pb-24 bg-background-light dark:bg-background-dark/50 pt-2 min-h-full">
        {filteredModules.map((module) => (
            <div 
                key={module.id} 
                onClick={() => onModuleClick && onModuleClick(module)}
                className="flex gap-4 bg-white dark:bg-surface-dark px-4 py-4 justify-between items-center border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer group"
            >
                <div className="flex items-start gap-4 flex-1">
                    <div 
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-[80px] shrink-0 shadow-sm relative overflow-hidden bg-gray-200" 
                        style={{ backgroundImage: `url("${module.image}")` }}
                    >
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>
                    <div className="flex flex-1 flex-col justify-center h-full gap-1">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${getCategoryColor(module.color)}`}>
                                {module.category}
                            </span>
                        </div>
                        <p className="text-text-main dark:text-white text-base font-semibold leading-tight line-clamp-1">{module.title}</p>
                        <p className="text-text-sub dark:text-gray-400 text-sm font-normal leading-snug line-clamp-2">{module.description}</p>
                    </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                    <ChevronRight className="text-gray-300 dark:text-gray-600 transition-transform group-hover:translate-x-1" size={24} />
                </div>
            </div>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav activeTab="education" onNavigate={onNavigate} />
    </div>
  );
};

export default Education;
