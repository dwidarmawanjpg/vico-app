import React from 'react';
import { ArrowLeft, Tag, CheckCircle, XCircle } from 'lucide-react';

export interface ModuleData {
    id: number;
    category: string;
    title: string;
    description: string; // Short description
    image: string;
    color: string;
    // Detail specific props
    longDescription?: string;
    goodTraits?: string[];
    badTraits?: string[];
}

interface EducationDetailProps {
    module: ModuleData;
    onBack: () => void;
}

const EducationDetail: React.FC<EducationDetailProps> = ({ module, onBack }) => {
    
  // Default values if detail data is missing (since we are extending the previous simple model)
  const longDesc = module.longDescription || "Memilih kelapa yang tepat adalah langkah terpenting dalam membuat minyak kelapa murni (VCO) berkualitas tinggi. Kelapa yang sudah matang sempurna memiliki kandungan minyak paling banyak dan kadar air yang pas.";
  
  const goodList = module.goodTraits || [
      "Berat dan berisi saat diangkat",
      "Air berbunyi nyaring \"kopyor\" saat diguncang",
      "Kulit luar berwarna coklat tua merata",
      "Daging kelapa tebal dan keras"
  ];

  const badList = module.badTraits || [
      "Kelapa muda (sabut masih hijau)",
      "Retak atau bocor airnya",
      "Berjamur di bagian \"mata\" kelapa"
  ];

  const getCategoryTheme = (color: string) => {
      switch (color) {
          case 'green': return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-900 dark:text-green-400', icon: 'text-green-800 dark:text-green-500', border: 'border-green-200 dark:border-green-800' };
          case 'blue': return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-900 dark:text-blue-400', icon: 'text-blue-800 dark:text-blue-500', border: 'border-blue-200 dark:border-blue-800' };
          case 'purple': return { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-900 dark:text-purple-400', icon: 'text-purple-800 dark:text-purple-500', border: 'border-purple-200 dark:border-purple-800' };
          case 'orange': return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-900 dark:text-orange-400', icon: 'text-orange-800 dark:text-orange-500', border: 'border-orange-200 dark:border-orange-800' };
          default: return { bg: 'bg-gray-50 dark:bg-gray-800', text: 'text-gray-900 dark:text-gray-300', icon: 'text-gray-700 dark:text-gray-500', border: 'border-gray-200 dark:border-gray-700' };
      }
  };

  const theme = getCategoryTheme(module.color);

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display text-text-main dark:text-white group/design-root">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md p-4 pb-2 justify-between border-b border-transparent dark:border-white/5">
        <button 
            onClick={onBack}
            className="text-text-main dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 -ml-2 transition-colors flex shrink-0 items-center justify-center"
        >
            <ArrowLeft size={24} />
        </button>
        <h2 className="text-text-main dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-10">Modul</h2>
      </div>

      <div className="flex-1 overflow-y-auto pb-8">
        {/* Hero Image */}
        <div className="@container p-4 pb-0">
            <div 
                className="w-full bg-center bg-no-repeat bg-cover flex flex-col justify-end overflow-hidden bg-gray-200 dark:bg-gray-800 rounded-xl min-h-[240px] shadow-sm relative group" 
                style={{ backgroundImage: `url("${module.image}")` }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
        </div>

        {/* Category Tag */}
        <div className="flex gap-3 px-4 pt-4 flex-wrap">
            <div className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg border pl-2 pr-3 ${theme.bg} ${theme.border}`}>
                <Tag size={18} className={theme.icon} />
                <p className={`${theme.text} text-sm font-medium leading-normal`}>{module.category}</p>
            </div>
        </div>

        {/* Title */}
        <h1 className="text-text-main dark:text-white tracking-tight text-[28px] font-bold leading-tight px-4 pt-4 pb-4">
            {module.title}
        </h1>

        {/* Divider */}
        <div className="px-4">
            <div className="h-px w-full bg-gray-200 dark:bg-white/10"></div>
        </div>

        {/* Content Card */}
        <div className="px-4 py-6">
            <div className="bg-white dark:bg-[#152a20] rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-white/5">
                <p className="text-gray-700 dark:text-gray-300 text-base font-normal leading-relaxed pb-6">
                    {longDesc}
                </p>

                {/* Good Traits */}
                <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="text-primary fill-current" size={24} />
                        <h3 className="text-text-main dark:text-white text-lg font-bold">Ciri kelapa yang baik</h3>
                    </div>
                    <ul className="space-y-3 pl-1">
                        {goodList.map((item, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"></span>
                                <span className="text-gray-700 dark:text-gray-300 text-base">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="h-px w-full bg-gray-100 dark:bg-white/5 mb-6"></div>

                {/* Bad Traits */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <XCircle className="text-red-500 fill-current" size={24} />
                        <h3 className="text-text-main dark:text-white text-lg font-bold">Hindari</h3>
                    </div>
                    <ul className="space-y-3 pl-1">
                         {badList.map((item, idx) => (
                            <li key={idx} className="flex gap-3 items-start">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400 mt-2 shrink-0"></span>
                                <span className="text-gray-700 dark:text-gray-300 text-base">{item}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
        
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default EducationDetail;
