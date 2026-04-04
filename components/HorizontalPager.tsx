import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface HorizontalPagerProps {
  children: React.ReactNode[];
  page?: number;
  onPageChange?: (page: number) => void;
}

const HorizontalPager: React.FC<HorizontalPagerProps> = ({ children, page, onPageChange }) => {
  const [internalPage, setInternalPage] = useState(0);
  const currentPage = page !== undefined ? page : internalPage;

  const handlePageChange = (nextPage: number) => {
    if (page === undefined) setInternalPage(nextPage);
    onPageChange?.(nextPage);
  };

  return (
    <div className="relative w-full overflow-hidden">
      {/* Navigation Arrows at Top */}
      {children.length > 1 && (
        <div className="flex items-center justify-between px-4 mb-4">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className={`p-2 rounded-full transition-all ${currentPage === 0 ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-slate-800 shadow-lg hover:scale-110 active:scale-95 text-brand-primary'}`}
          >
            <ChevronLeftIcon className="w-6 h-6" />
          </button>
          
          <div className="flex gap-1.5">
            {children.map((_, index) => (
              <div
                key={index}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  currentPage === index ? 'bg-brand-primary w-3' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === children.length - 1}
            className={`p-2 rounded-full transition-all ${currentPage === children.length - 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-slate-800 shadow-lg hover:scale-110 active:scale-95 text-brand-primary'}`}
          >
            <ChevronRightIcon className="w-6 h-6" />
          </button>
        </div>
      )}

      <motion.div
        className="flex w-full"
        animate={{ x: `-${currentPage * 100}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        layout
      >
        {children.map((child, index) => (
          <div key={index} className="w-full flex-shrink-0 min-w-full">
            {child}
          </div>
        ))}
      </motion.div>
      
      {/* Bottom Page Indicators (Optional, keeping for now but smaller) */}
      <div className="flex justify-center gap-2 mt-4 sm:hidden">
        {children.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              currentPage === index ? 'bg-brand-primary w-4' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HorizontalPager;
