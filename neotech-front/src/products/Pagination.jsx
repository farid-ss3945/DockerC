import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { current } from '@reduxjs/toolkit';
import { useTranslation } from 'react-i18next';

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const { t } = useTranslation();
  const getPageNumbers = () => {
    const pages = [];
    const showPages = 5;
    
    if (totalPages <= showPages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      }
      
      if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center mt-8">
      <div className="flex items-center bg-white rounded-lg shadow-sm">
        <button 
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className={`p-2 w-10 h-10 rounded-l-lg flex justify-center items-center border border-gray-300 border-r-0 transition-colors
            ${currentPage === 1 
              ? 'opacity-50 cursor-not-allowed bg-gray-50' 
              : 'hover:bg-gray-100 cursor-pointer bg-white'}`}
          aria-label={t('pagination.previousPage')}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          page === '...' ? (
            <span 
              key={`ellipsis-${index}`} 
              className="w-10 h-10 flex items-center justify-center text-gray-400 border-t border-b border-gray-300 bg-white"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              disabled={currentPage === page}
              className={`w-10 h-10 text-sm font-medium border-t border-b border-gray-300 transition-colors
                ${currentPage === page 
                  ? 'bg-gray-900 text-white cursor-default' 
                  : 'text-gray-700 hover:bg-gray-100 cursor-pointer bg-white'}`}
              aria-label={`${t('pagination.page')} ${page}`}
              aria-current={currentPage === page ? 'page' : undefined}
            >
              {page}
            </button>
          )
        ))}

        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className={`p-2 w-10 h-10 rounded-r-lg flex justify-center items-center border border-gray-300 border-l-0 transition-colors
            ${currentPage === totalPages 
              ? 'opacity-50 cursor-not-allowed bg-gray-50' 
              : 'hover:bg-gray-100 cursor-pointer bg-white'}`}
          aria-label={t('pagination.nextPage')}
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
