import React, { useContext, useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router'
import { Search, X } from 'lucide-react';
import { SearchContext } from '../../router/Context';
import { useSearchProductsQuery } from "../../store/API";
import MobileSearchDropdown from './MobileSearchDropdown';

const SearchUI = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  const { searchOpen, setSearchOpen } = useContext(SearchContext);
  const searchDropdownRef = useRef(null);
  
  const closeMobileSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const { data: searchResult, isLoading: isSearching } = useSearchProductsQuery(
    { q: searchQuery },
    {
      skip: searchQuery.length < 2,
    }
  );

  
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        // Optional: close on outside click
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent background scrolling on mobile
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      // Restore scrolling when closed
      document.body.style.overflow = 'unset';
    };
  }, [searchOpen, setSearchOpen]);
  

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        // Optional: close on outside click
      }
    }

    if (searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchOpen, setSearchOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    if(value === "") {
      handleClearSearch()
    }
    setSearchQuery(value);
    setSearchOpen(true);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      handleClearSearch();
      e.target.blur();
    }
  };

  const handleProductClick = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigate(`/details/${productId}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleCategoryClick = (categorySlug, categoryName) => {
    navigate(`/products?category=${categorySlug}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleBrandClick = (brandSlug, brandName) => {
    navigate(`/products/brand/${brandName}`);
    setSearchOpen(false);
    setSearchQuery('');
  };
  const handleViewAllClick = () => {
    const query = encodeURIComponent(searchQuery);
    navigate(`/products?search=${query}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  return (
    <div className="pb-0 lg:hidden border-t-[#DEE2E6]" ref={searchDropdownRef}>
      <div className="p-3">
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleKeyDown}
            className="w-full pl-11 pr-12 py-2 bg-white border border-[#dee2e6] rounded-lg focus:outline-none placeholder:text-gray-400 text-gray-700 text-base"
            placeholder="Search products..."
          />
          
          {searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 
                p-1 rounded-full hover:bg-gray-100 transition-colors duration-200
                text-gray-400 hover:text-gray-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Dropdown - Full Screen Overlay */}
      {searchOpen && (
        <div className="search-results-container fixed inset-0 bg-white z-5000 overflow-y-auto">
          <div className="p-4">
            {/* Mobile Search Header */}
            <div className="flex items-center gap-3 mb-4">
              <button 
                onClick={closeMobileSearch}
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>
              <div className="flex-1 flex rounded-lg overflow-hidden border border-[#dee2e6] bg-white">
                <div className="flex items-center pl-3">
                  <Search className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  autoFocus
                  className="flex-1 py-2 px-3 text-base border-none outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="flex items-center pr-3 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>
            </div>
              
            {/* Mobile Search Results */}
            <MobileSearchDropdown
              searchQuery={searchQuery}
              searchResult={searchResult}
              isSearching={isSearching}
              onProductClick={handleProductClick}
              onCategoryClick={handleCategoryClick}
              onBrandClick={handleBrandClick}
              onViewAllProducts={handleViewAllClick}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchUI;
