import React, { useEffect, useState, useRef } from 'react';
import { SlidersHorizontal, Filter, X, ChevronUp, ChevronDown } from 'lucide-react';
import { useFilterProductsMutation, useGetCategoriesQuery, useGetCategoryFiltersQuery, useGetFiltersQuery, useGetParentCategoriesQuery } from '../store/API';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../i18n';

// Move these components outside to prevent recreation on each render
const FilterSection = ({ title, isExpanded, onToggle, children }) => (
  <div className="border-b border-gray-200">
    <button 
      onClick={onToggle}
      type="button"
      className="w-full px-4 py-4 flex justify-between items-center text-left"
    >
      <span className="text-lg font-medium text-gray-900">{title}</span>
      {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </button>
    {isExpanded && (
      <div className="px-4 pb-4">
        {children}
      </div>
    )}
  </div>
);

const CheckboxItem = ({ label, checked, onChange }) => (
  <label className="flex items-center py-2 cursor-pointer">
    <div className="relative">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
      />
      <div className={`w-5 h-5 border-2 rounded flex items-center justify-center ${
        checked ? 'bg-indigo-500 border-indigo-500' : 'border-gray-300'
      }`}>
        {checked && (
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
      </div>
    </div>
    <span className="ml-3 text-gray-700">{label}</span>
  </label>
);

export function MobileFilterButtons({ onFilterResults, onLoadingChange, currentSort, onSortChange, currentPage, pageSize }) {
  const { t, i18n } = useTranslation();
  const [isSort, setIsSort] = useState(false);
  const [isFilter, setIsFilter] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  
  // Dynamic translation states
  const [translatedParentCat, setTranslatedParentCat] = useState([]);

  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: ParentCat, isLoading: isParentCatLoading } = useGetParentCategoriesQuery();
  const { data: customFilters, isLoading: isCustomLoading } = useGetFiltersQuery();
  
  const selectedCategoryId = selectedCategories.length > 0 ? selectedCategories[0] : null;
  const { data: categoryFilters, isLoading: isCategoryFiltersLoading } = useGetCategoryFiltersQuery(
    selectedCategoryId, 
    { skip: !selectedCategoryId }
  );

  const [filterProducts, { isLoading: isFiltering }] = useFilterProductsMutation();
  const hasFiltersApplied = useRef(false);
  const debounceTimer = useRef(null);

  const filtersToShow = selectedCategoryId && categoryFilters ? categoryFilters : customFilters;
  const isFiltersLoading = selectedCategoryId ? isCategoryFiltersLoading : isCustomLoading;

  const [expandedSections, setExpandedSections] = useState({
    category: true,
    priceRange: true
  });

  // Dynamic translation effect for parent categories
  useEffect(() => {
    async function translateParentCat() {
      if (!ParentCat || ParentCat.length === 0) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = await Promise.all(
          ParentCat.map(async (category) => ({
            ...category,
            name: await translateDynamicField(category.name, targetLang)
          }))
        );
        setTranslatedParentCat(translated);
      } else {
        setTranslatedParentCat(ParentCat);
      }
    }
    translateParentCat();
  }, [i18n.language, ParentCat]);

  useEffect(() => {
    if (isFilter) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFilter]);

  // Initialize selectedFilters when filters load
  useEffect(() => {
    if (filtersToShow) {
      const initialFilters = {};
      filtersToShow.forEach(filter => {
        if (!selectedFilters[filter.id]) {
          initialFilters[filter.id] = {
            filterId: filter.id,
            filterOptionIds: [],
            customValue: '',
            minValue: 0,
            maxValue: 0
          };
        }
      });
      
      setSelectedFilters(prev => ({
        ...prev,
        ...initialFilters
      }));

      // Set expanded state for each filter
      setExpandedSections(prev => {
        const newSections = { ...prev };
        filtersToShow.forEach(filter => {
          if (newSections[`filter-${filter.id}`] === undefined) {
            newSections[`filter-${filter.id}`] = true;
          }
        });
        return newSections;
      });
    }
  }, [filtersToShow]);

  // Reset filters when category changes
  useEffect(() => {
    if (selectedCategoryId) {
      setSelectedFilters({});
    }
  }, [selectedCategoryId]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [categoryId];
    });
  };

  const handleFilterChange = (isChecked, filterId, optionId) => {
    setSelectedFilters(prev => {
      const updatedFilters = { ...prev };
      
      if (!updatedFilters[filterId]) {
        updatedFilters[filterId] = {
          filterId: filterId,
          filterOptionIds: [],
          customValue: '',
          minValue: 0,
          maxValue: 0
        };
      }

      if (isChecked) {
        if (!updatedFilters[filterId].filterOptionIds.includes(optionId)) {
          updatedFilters[filterId].filterOptionIds.push(optionId);
        }
      } else {
        updatedFilters[filterId].filterOptionIds = updatedFilters[filterId].filterOptionIds.filter(
          id => id !== optionId
        );
      }

      return updatedFilters;
    });
  };

  const buildFilterCriteria = () => {
    const criteria = [];
    
    Object.values(selectedFilters).forEach(filter => {
      if (filter.filterOptionIds.length > 0 || filter.customValue || filter.minValue > 0 || filter.maxValue > 0) {
        criteria.push({
          filterId: filter.filterId,
          filterOptionIds: filter.filterOptionIds.length > 0 ? filter.filterOptionIds : null,
          customValue: filter.customValue || null,
          minValue: filter.minValue || null,
          maxValue: filter.maxValue || null
        });
      }
    });
    
    return criteria;
  };

  const buildActiveFilters = () => {
    const activeFilters = [];
    
    if (selectedCategories.length > 0 && categories) {
      selectedCategories.forEach(categoryId => {
        const category = categories.find(cat => cat.id === categoryId);
        if (category) {
          activeFilters.push({
            id: `category-${categoryId}`,
            key: `category-${categoryId}`,
            label: category.name,
            type: 'category',
            value: categoryId
          });
        }
      });
    }

    if (customFilters) {
      Object.values(selectedFilters).forEach(filter => {
        if (filter.filterOptionIds && filter.filterOptionIds.length > 0) {
          const customFilter = customFilters.find(cf => cf.id === filter.filterId);
          if (customFilter) {
            filter.filterOptionIds.forEach(optionId => {
              const option = customFilter.options?.find(opt => opt.id === optionId);
              if (option) {
                activeFilters.push({
                  id: `filter-${filter.filterId}-${optionId}`,
                  key: `filter-${filter.filterId}-${optionId}`,
                  label: `${customFilter.name}: ${option.displayName || option.label}`,
                  type: 'custom',
                  filterId: filter.filterId,
                  optionId: optionId
                });
              }
            });
          }
        }
      });
    }

    if (minPrice || maxPrice) {
      const priceLabel = minPrice && maxPrice 
        ? `Price: $${minPrice} - $${maxPrice}`
        : minPrice 
          ? `Price: $${minPrice}+`
          : `Price: up to $${maxPrice}`;
      
      activeFilters.push({
        id: 'price-range',
        key: 'price-range',
        label: priceLabel,
        type: 'price',
        minPrice,
        maxPrice
      });
    }

    return activeFilters;
  };

  const hasActiveFilters = () => {
    const hasCategories = selectedCategories.length > 0;
    const hasPrice = minPrice || maxPrice;
    const hasCustomFilters = Object.values(selectedFilters).some(filter => 
      filter.filterOptionIds?.length > 0 || 
      filter.customValue || 
      filter.minValue > 0 || 
      filter.maxValue > 0
    );
    
    return hasCategories || hasPrice || hasCustomFilters;
  };

  const applyFilters = async () => {
    const hasActiveFiltersApplied = hasActiveFilters();
    
    if (!hasActiveFiltersApplied) {
      hasFiltersApplied.current = false;
      if (onFilterResults) {
        onFilterResults(null, []);
      }
      return;
    }

    hasFiltersApplied.current = true;

    let sortByValue, sortOrderValue;
    if (currentSort) {
      const sortParts = currentSort.split('_');
      if (sortParts[0] === 'price') {
        sortByValue = 'price';
        sortOrderValue = sortParts[1];
      } else if (sortParts[0] === 'name') {
        sortByValue = 'name';
        sortOrderValue = sortParts[1];
      } else if (currentSort === 'newest') {
        sortByValue = 'createdDate';
        sortOrderValue = 'desc';
      }
    }

    const filterCriteria = buildFilterCriteria();

    const filterPayload = {
      categoryId: selectedCategories.length > 0 ? selectedCategories[0] : null,
      filterCriteria: filterCriteria.length > 0 ? filterCriteria : [],
      minPrice: minPrice ? parseFloat(minPrice) : null,
      maxPrice: maxPrice ? parseFloat(maxPrice) : null,
      sortBy: sortByValue || null,
      sortOrder: sortOrderValue || null,
      page: currentPage || 1,
      pageSize: pageSize || 20
    };

    if (onLoadingChange) {
      onLoadingChange(true);
    }

    try {
      const result = await filterProducts(filterPayload).unwrap();
      const activeFilters = buildActiveFilters();

      if (onFilterResults) {
        onFilterResults(result, activeFilters);
      }
    } catch (error) {
      console.error('Failed to filter products:', error);
      if (onFilterResults) {
        onFilterResults({ products: [], totalCount: 0 }, []);
      }
    } finally {
      if (onLoadingChange) {
        onLoadingChange(false);
      }
    }
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setSelectedFilters({});
    setMinPrice('');
    setMaxPrice('');
    hasFiltersApplied.current = false;
    if (onFilterResults) {
      onFilterResults(null, []);
    }
  };

  const handleShowResults = () => {
    applyFilters();
    setIsFilter(false);
  };

  return (
    <>
      {/* Mobile Filter Modal */}
      <div className={`fixed inset-0 bg-white z-5000 flex flex-col ${isFilter ? 'block' : 'hidden'}`}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h1 className="text-xl font-medium text-gray-900">{t('filters.filters')}</h1>
          <button onClick={() => setIsFilter(false)} className="p-1">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Category Filter */}
          <FilterSection
            title={t('filters.category')}
            isExpanded={expandedSections.category}
            onToggle={() => toggleSection('category')}
          >
            <div className="space-y-1">
              {(translatedParentCat.length > 0 ? translatedParentCat : ParentCat)?.slice(0, showAllCategories ? (translatedParentCat.length > 0 ? translatedParentCat : ParentCat).length : 5).map(item => (
                <CheckboxItem
                  key={item.id}
                  label={item.name}
                  checked={selectedCategories.includes(item.id)}
                  onChange={() => handleCategoryChange(item.id)}
                />
              ))}
              {(translatedParentCat.length > 0 ? translatedParentCat : ParentCat)?.length > 5 && (
                <button
                  onClick={() => setShowAllCategories(!showAllCategories)}
                  className="text-sm text-indigo-500 hover:text-indigo-600 font-medium mt-2"
                >
                  {showAllCategories ? t('filters.seeLess') : t('filters.seeAll')}
                </button>
              )}
            </div>
          </FilterSection>

          {/* Custom Filters */}
          {isFiltersLoading ? (
            <div className="p-4">
              <div className="animate-pulse space-y-4">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full" />
                  <div className="h-4 bg-gray-200 rounded w-4/5" />
                </div>
              </div>
            </div>
          ) : (
            filtersToShow?.map(filter => (
              <FilterSection
                key={filter.id}
                title={filter.name}
                isExpanded={expandedSections[`filter-${filter.id}`]}
                onToggle={() => toggleSection(`filter-${filter.id}`)}
              >
                <div className="space-y-1">
                  {filter.options?.map(option => (
                    <CheckboxItem
                      key={option.id}
                      label={option.displayName || option.label}
                      checked={selectedFilters[filter.id]?.filterOptionIds?.includes(option.id) || false}
                      onChange={(e) => handleFilterChange(e.target.checked, filter.id, option.id)}
                    />
                  ))}
                </div>
              </FilterSection>
            ))
          )}

          {/* Price Range */}
          <FilterSection
            title={t('filters.priceRange')}
            isExpanded={expandedSections.priceRange}
            onToggle={() => toggleSection('priceRange')}
          >
            <div className="flex items-center space-x-2" onMouseDown={(e) => e.stopPropagation()} onTouchStart={(e) => e.stopPropagation()}>
              <input
                type="number"
                placeholder={t('productsPage.min')}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder={t('productsPage.max')}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onFocus={(e) => e.stopPropagation()}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                min="0"
              />
            </div>
          </FilterSection>
        </div>

        <div className="p-4 border-t border-gray-200 flex gap-3">
          <button 
            onClick={handleClearFilters}
            className="flex-1 py-3 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium"
          >
            {t('productsPage.clear')}
          </button>
          <button 
            onClick={handleShowResults}
            className="flex-1 py-3 px-4 bg-indigo-500 text-white rounded-lg font-medium"
            disabled={isFiltering}
          >
            {isFiltering ? t('productsPage.loading') : t('productsPage.show')}
          </button>
        </div>
      </div>

      {/* Mobile Sort & Filter Buttons */}
      <div className="flex gap-2 mb-4 lg:hidden relative">
        <div className="flex gap-2 w-full">
          <div className="flex-1 min-w-0">
            <button
              onClick={() => setIsSort(!isSort)}
              className={`${isSort && 'rounded-b-none border-b-0'} flex items-center  justify-center gap-2 py-2 px-4 border border-gray-300 rounded-md bg-white hover:bg-gray-50 transition-all duration-500 w-full`}
            >
              <SlidersHorizontal className="w-4 h-4 flex-shrink-0" />
              <span className='whitespace-nowrap'>{t('productsPage.sorting')}</span>
            </button>
            
            <div className={`overflow-hidden transition-all duration-500 rounded-b-lg ${isSort ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}>
              <div className="border border-gray-300 border-t-0 rounded-b-lg bg-white shadow-lg">
                <div className="py-2 rounded-b-lg">
                  {[
                      { value: null, label: t('sortBy') },
                      { value: 'price_asc', label: t('priceLowToHigh') },
                      { value: 'price_desc', label: t('priceHighToLow') },
                      { value: 'name_asc' , label: t('nameAToZ') },
                      { value: 'name_desc', label: t('nameZToA') }
                    ].map((option) => (
                    <button
                      key={option.value}
                      className={`w-full text-start px-4 py-2 hover:bg-gray-50 transition-colors duration-200 ${currentSort === option.value ? 'bg-gray-100 font-medium' : ''}`}
                      onClick={() => {
                        if (onSortChange) {
                          onSortChange({ target: { value: option.value } });
                        }
                        setIsSort(false);
                      }}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsFilter(true)}
            className={`flex items-center justify-center gap-2 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition-all duration-500 overflow-hidden min-w-0 ${isSort ? "flex-shrink-[999] w-0 p-0 opacity-0" : "flex-1 opacity-100"}`}
          >
            <Filter className={`w-4 h-4 flex-shrink-0 transition-opacity duration-300 ${isSort ? "opacity-0" : "opacity-100"}`} />
            <span className={`whitespace-nowrap transition-opacity duration-300 ${isSort ? "opacity-0" : "opacity-100"}`}>
              {t('productsPage.filteringBtn')}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}
