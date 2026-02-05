import React from 'react';

interface ProductionButtonProps {
    onClick?: () => void;
}

const ProductionButton: React.FC<ProductionButtonProps> = ({ onClick }) => {
  return (
    <button onClick={onClick} className="w-full bg-text-main dark:bg-primary text-white dark:text-white h-14 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-gray-200 dark:shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all mb-8 font-bold text-base">

      <span className="material-symbols-outlined">add_circle</span>
      MULAI PRODUKSI BARU
    </button>
  );
};

export default ProductionButton;
