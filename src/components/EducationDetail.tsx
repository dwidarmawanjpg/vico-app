import React from 'react';
import { ArrowLeft, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { EducationModule, ContentBlock } from '../data/educationModules';

interface EducationDetailProps {
    module: EducationModule;
    onBack: () => void;
}

const EducationDetail: React.FC<EducationDetailProps> = ({ module, onBack }) => {
  
  // Helper to render content blocks
  const renderBlock = (block: ContentBlock, index: number) => {
      switch (block.type) {
          case 'paragraph':
              return (
                  <p key={index} className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed mb-6 font-serif">
                      {block.content}
                  </p>
              );
          case 'heading':
              const HeadingTag = block.level === 2 ? 'h2' : 'h3';
              const className = block.level === 2 
                  ? "text-2xl font-bold text-text-main dark:text-white mt-8 mb-4 tracking-tight"
                  : "text-xl font-bold text-text-main dark:text-white mt-6 mb-3";
              return (
                  <HeadingTag key={index} className={className}>
                      {block.content}
                  </HeadingTag>
              );
          case 'image':
              return (
                  <figure key={index} className="my-8 -mx-4 sm:mx-0">
                      <img 
                          src={block.src} 
                          alt={block.alt || 'Article image'}
                          className="w-full h-auto sm:rounded-2xl"
                          loading="lazy"
                      />
                      {block.caption && (
                          <figcaption className="text-center text-sm text-gray-500 dark:text-gray-400 mt-2 italic px-4">
                              {block.caption}
                          </figcaption>
                      )}
                  </figure>
              );
          case 'list':
              return (
                  <ul key={index} className={`pl-5 mb-6 space-y-2 ${block.style === 'number' ? 'list-decimal' : 'list-disc'} marker:text-primary`}>
                      {block.items.map((item, i) => (
                          <li key={i} className="text-gray-700 dark:text-gray-300 text-lg leading-relaxed pl-2">
                              {item}
                          </li>
                      ))}
                  </ul>
              );
          case 'quote':
              return (
                  <blockquote key={index} className="border-l-4 border-primary pl-6 py-2 my-8 italic bg-gray-50 dark:bg-gray-800/50 pr-4 rounded-r-lg">
                      <p className="text-xl text-text-main dark:text-white font-serif mb-2">"{block.content}"</p>
                      {block.author && <cite className="text-sm text-gray-500 dark:text-gray-400 not-italic block uppercase tracking-wider font-bold">— {block.author}</cite>}
                  </blockquote>
              );
          case 'callout':
              const colors = {
                  info: 'bg-blue-50 text-blue-900 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800',
                  warning: 'bg-orange-50 text-orange-900 border-orange-200 dark:bg-orange-900/20 dark:text-orange-200 dark:border-orange-800',
                  tip: 'bg-green-50 text-green-900 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800'
              };
              const Icons = {
                  info: Info,
                  warning: AlertCircle,
                  tip: CheckCircle
              };
              const Icon = Icons[block.variant];
              
              return (
                  <div key={index} className={`flex gap-4 p-5 rounded-xl border mb-8 ${colors[block.variant]} `}>
                      <Icon className="shrink-0 mt-0.5" size={24} />
                      <div>
                          {block.title && <h4 className="font-bold mb-1 text-lg">{block.title}</h4>}
                          <p className="leading-relaxed">{block.content}</p>
                      </div>
                  </div>
              );
          default:
              return null;
      }
  };

  return (
    <div className="relative flex h-full min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl font-display text-text-main dark:text-white">
      {/* Article Header (Sticky) */}
      <div className="sticky top-0 z-30 flex items-center bg-white/80 dark:bg-[#141e18]/80 backdrop-blur-md p-4 justify-between border-b border-gray-100 dark:border-white/5 pt-safe transition-all">
        <button 
            onClick={onBack}
            className="text-text-main dark:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-full p-2 -ml-2 transition-colors"
        >
            <ArrowLeft size={24} />
        </button>
        {/* No Share/Bookmark icons as requested */}
      </div>

      <div className="flex-1 overflow-y-auto pb-24">
        {/* Edge-to-Edge Hero Image */}
        <div className="relative w-full aspect-[4/3] sm:aspect-video">
            <img 
                src={module.thumbnail} 
                alt={module.title}
                className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background-light dark:from-background-dark via-transparent to-transparent"></div>
        </div>

        {/* Article Meta & Content Wrapper */}
        <div className="px-5 -mt-20 relative z-10">
             {/* Category Tag */}
             <span className="inline-block bg-primary text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider shadow-lg shadow-primary/30">
                 {module.category}
             </span>

             <h1 className="text-3xl sm:text-4xl font-extrabold text-text-main dark:text-white leading-tight mb-8 tracking-tight drop-shadow-sm">
                 {module.title}
             </h1>

             {/* Author Info REMOVED as requested */}

             {/* Dynamic Content Blocks */}
             <div className="article-content">
                 {module.content.map((block, index) => renderBlock(block, index))}
             </div>

             {/* Sources/References */}
             {module.references && module.references.length > 0 && (
                 <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                     <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">Referensi / Sumber</h4>
                     <ul className="space-y-2">
                         {module.references.map((ref, idx) => (
                             <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 leading-normal">
                                 {ref.url ? (
                                     <a href={ref.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors hover:underline">
                                         {ref.title}
                                     </a>
                                 ) : (
                                     <span>{ref.title}</span>
                                 )}
                             </li>
                         ))}
                     </ul>
                 </div>
             )}
        </div>
      </div>
    </div>
  );
};

export default EducationDetail;
