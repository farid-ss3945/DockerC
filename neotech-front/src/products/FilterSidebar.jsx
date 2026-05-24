import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ChevronDown } from 'lucide-react';
import { useFilterProductsMutation, useGetCategoriesQuery, useGetCategoryFiltersQuery, useGetFiltersQuery, useGetParentCategoriesQuery } from '../store/API';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../i18n';

export const FilterSidebar = React.memo(({ 
  onFilterResults, 
  onLoadingChange, 
  currentSort, 
  currentPage, 
  isHotDeals, 
  isRecommended, 
  isBrand, 
  isSearch,      
  setCurrentPage, 
  pageSize, 
  forcedCategoryId = null, 
  showCategory = false 
}) => {
  const { t,i18n } = useTranslation();
  
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({});
  
  // Dynamic translation states
  const [translatedCategories, setTranslatedCategories] = useState([]);
  const [translatedParentCat, setTranslatedParentCat] = useState([]);
  const [translatedCustomFilters, setTranslatedCustomFilters] = useState([]);
  
  const { data: categories, isLoading: isCategoriesLoading } = useGetCategoriesQuery();
  const { data: ParentCat, isLoading: isParentCatLoading } = useGetParentCategoriesQuery();
  const { data: customFilters, isLoading: isCustomLoading } = useGetFiltersQuery();
  const [filterProducts, { isLoading: isFiltering }] = useFilterProductsMutation();
  
  const hasFiltersApplied = useRef(false);
  const debounceTimer = useRef(null);
  const isInitialMount = useRef(true);

  // Use forcedCategoryId if provided, otherwise use selected category
  const activeCategoryId = forcedCategoryId || (selectedCategories.length > 0 ? selectedCategories[0] : null);
  
  const { data: categoryFilters, isLoading: isCategoryFiltersLoading } = useGetCategoryFiltersQuery(
    activeCategoryId, 
    { skip: !activeCategoryId }
  );

  // Dynamic translation effect
  useEffect(() => {
    async function translateData() {
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        // Translate categories
        if (categories) {
          const translated = await Promise.all(
            categories.map(async (category) => ({
              ...category,
              name: await translateDynamicField(category.name, targetLang)
            }))
          );
          setTranslatedCategories(translated);
        }
        
        // Translate parent categories
        if (ParentCat) {
          const translated = await Promise.all(
            ParentCat.map(async (category) => ({
              ...category,
              name: await translateDynamicField(category.name, targetLang)
            }))
          );
          setTranslatedParentCat(translated);
        }
        
        // Translate custom filters
        if (customFilters) {
          const translated = await Promise.all(
            customFilters.map(async (filter) => ({
              ...filter,
              name: await translateDynamicField(filter.name, targetLang),
              options: filter.options ? await Promise.all(
                filter.options.map(async (option) => ({
                  ...option,
                  displayName: option.displayName ? await translateDynamicField(option.displayName, targetLang) : option.displayName,
                  label: option.label ? await translateDynamicField(option.label, targetLang) : option.label
                }))
              ) : filter.options
            }))
          );
          setTranslatedCustomFilters(translated);
        }
      } else {
        setTranslatedCategories(categories || []);
        setTranslatedParentCat(ParentCat || []);
        setTranslatedCustomFilters(customFilters || []);
      }
    }
    translateData();
  }, [i18n.language, categories, ParentCat, customFilters]);

  // Determine which filters to show - category-specific or general
  const filtersToShow = activeCategoryId && categoryFilters ? categoryFilters : (translatedCustomFilters.length > 0 ? translatedCustomFilters : customFilters);
  const isFiltersLoading = activeCategoryId ? isCategoryFiltersLoading : isCustomLoading;

  // Memoize buildActiveFilters function - don't include it in dependencies
  const buildActiveFilters = useCallback(() => {
    const activeFilters = [];
    
    // Add category filters only if shown
    if (showCategory && selectedCategories.length > 0 && (translatedCategories.length > 0 ? translatedCategories : categories)) {
      const categoriesToUse = translatedCategories.length > 0 ? translatedCategories : categories;
      selectedCategories.forEach(categoryId => {
        const category = categoriesToUse.find(cat => cat.id === categoryId);
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
  
    // Add custom filter selections
    const filtersToUse = translatedCustomFilters.length > 0 ? translatedCustomFilters : customFilters;
    if (filtersToUse) {
      Object.values(selectedFilters).forEach(filter => {
        if (filter.filterOptionIds && filter.filterOptionIds.length > 0) {
          const customFilter = filtersToUse.find(cf => cf.id === filter.filterId);
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
  
    // Add price range filter
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
  }, [showCategory, selectedCategories, categories, customFilters, selectedFilters, minPrice, maxPrice]);

  // Initialize selectedFilters when filters load or change
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
      
      if (Object.keys(initialFilters).length > 0) {
        setSelectedFilters(prev => ({
          ...prev,
          ...initialFilters
        }));
      }
    }
  }, [filtersToShow]);

  useEffect(() => {
    if (activeCategoryId) {
      setSelectedFilters({});
    }
  }, [activeCategoryId]);

  const toggleShowAll = useCallback(() => {
    setShowAllCategories(prev => !prev);
  }, []);

  const handleCategoryChange = useCallback((categoryId) => {
    setCurrentPage(1);
    setSelectedCategories(prev => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      }
      return [categoryId];
    });
  }, [setCurrentPage]);

  const handleFilterChange = useCallback((isChecked, filterId, optionId) => {
    setCurrentPage(1);

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
          updatedFilters[filterId].filterOptionIds = [...updatedFilters[filterId].filterOptionIds, optionId];
        }
      } else {
        updatedFilters[filterId].filterOptionIds = updatedFilters[filterId].filterOptionIds.filter(
          id => id !== optionId
        );
      }

      return updatedFilters;
    });
  }, [setCurrentPage]);

  const buildFilterCriteria = useCallback(() => {
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
  }, [selectedFilters]);

  const hasActiveFilters = useCallback(() => {
    const hasCategories = showCategory && selectedCategories.length > 0;
    const hasPrice = minPrice || maxPrice;
    const hasCustomFilters = Object.values(selectedFilters).some(filter => 
      filter.filterOptionIds?.length > 0 || 
      filter.customValue || 
      filter.minValue > 0 || 
      filter.maxValue > 0
    );
    const hasForcedCategory = !!forcedCategoryId;
    const hasSort = currentSort;

    return hasCategories || hasPrice || hasCustomFilters || hasForcedCategory || hasSort;
  }, [showCategory, selectedCategories, minPrice, maxPrice, selectedFilters, forcedCategoryId, currentSort]);

  // Separate effect for filter criteria changes (excludes currentPage)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(async () => {
      const hasActiveFiltersApplied = hasActiveFilters();
      
      if (!hasActiveFiltersApplied) {
        hasFiltersApplied.current = false;
        if (onFilterResults) {
          onFilterResults(null, []);
        }
        return;
      }
    
      hasFiltersApplied.current = true;

      const filterCriteria = buildFilterCriteria();
      const categoryIdToUse = forcedCategoryId || (selectedCategories.length > 0 ? selectedCategories[0] : null);
      const filterPayload = {
        categoryId: categoryIdToUse || null,
        brandSlug: isBrand || null,
        isHotDeal: isHotDeals || null,
        isRecommended: isRecommended || null,
        searchTerm: isSearch || null,
        filterCriteria: filterCriteria.length > 0 ? filterCriteria : [],
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : 1000000,
        sortBy: currentSort?.split("_")[0] || null,
        sortOrder: currentSort?.split("_")[1] || null,
        page: 1,
        pageSize: pageSize || 20
      };
    
      if (onLoadingChange) {
        onLoadingChange(true); 
      }
    
      try {
        const result = await filterProducts(filterPayload).unwrap();

        if (onFilterResults) {
          onFilterResults(result, buildActiveFilters());
        }
      } catch (error) {
        if (onFilterResults) {
          onFilterResults({ products: [], totalCount: 0 }, []);
        }
      } finally {
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    }, 300);
  
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [selectedCategories, selectedFilters, minPrice, maxPrice, currentSort, forcedCategoryId, isHotDeals, isBrand, isSearch, pageSize]);

  // Separate effect for page changes only (no debounce)
  useEffect(() => {
    if (!hasFiltersApplied.current || isInitialMount.current) {
      return;
    }

    const applyFiltersWithNewPage = async () => {
      const filterCriteria = buildFilterCriteria();
      const categoryIdToUse = forcedCategoryId || (selectedCategories.length > 0 ? selectedCategories[0] : null);

      const filterPayload = {
        categoryId: categoryIdToUse,
        brandSlug: isBrand,
        isHotDeal: isHotDeals,
        searchTerm: isSearch,
        filterCriteria: filterCriteria.length > 0 ? filterCriteria : [],
        minPrice: minPrice ? parseFloat(minPrice) : null,
        maxPrice: maxPrice ? parseFloat(maxPrice) : null,
        sortBy: currentSort?.split("_")[0],
        sortOrder: currentSort?.split("_")[1],
        page: currentPage,
        pageSize: pageSize || 20
      };
    
      if (onLoadingChange) {
        onLoadingChange(true); 
      }
    
      try {
        const result = await filterProducts(filterPayload).unwrap();

        if (onFilterResults) {
          onFilterResults(result, buildActiveFilters());
        }
      } catch (error) {
        if (onFilterResults) {
          onFilterResults({ products: [], totalCount: 0 }, []);
        }
      } finally {
        if (onLoadingChange) {
          onLoadingChange(false);
        }
      }
    };

    applyFiltersWithNewPage();
  }, [currentPage, pageSize]);

  const handleMinPriceChange = useCallback((e) => {
    setCurrentPage(1);
    setMinPrice(e.target.value);
  }, [setCurrentPage]);

  const handleMaxPriceChange = useCallback((e) => {
    setCurrentPage(1);
    setMaxPrice(e.target.value);
  }, [setCurrentPage]);

  if (isCategoriesLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-5 bg-gray-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-full" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
            <div className="h-4 bg-gray-200 rounded w-4/6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white border border-gray-200">
      {showCategory && (
        <>
          <hr className="mx-4 border-[#dee2e6]" />
          
          <details open>
            <summary className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
              <span className="font-medium text-gray-900">{t('filters.category')}</span>
              <ChevronDown className="chevron w-4 h-4 text-gray-500 transition-transform duration-200" />
            </summary>
            <div className="px-4 pb-4 space-y-2">
              {(translatedParentCat.length > 0 ? translatedParentCat : ParentCat)
                ?.slice(0, showAllCategories ? (translatedParentCat.length > 0 ? translatedParentCat : ParentCat).length : 5)
                .map(item => (
                  <label key={item.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-500 cursor-pointer border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedCategories.includes(item.id)}
                      onChange={() => handleCategoryChange(item.id)}
                    />
                    <span className="text-sm text-gray-700">{item.name}</span>
                  </label>
                ))}

              {(translatedParentCat.length > 0 ? translatedParentCat : ParentCat)?.length > 5 && (
                <button
                  onClick={toggleShowAll}
                  className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
                >
                  {showAllCategories ? t('filters.seeLess') : t('filters.seeAll')}
                </button>
              )}
            </div>
          </details>

          <hr className="mx-4 border-[#dee2e6]" />
        </>
      )}

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
        filtersToShow?.map(filter => {
          return (
            <details key={filter.id} open>
              <summary className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
                <span className="font-medium text-gray-900">{filter.name}</span>
                <ChevronDown className="chevron w-4 h-4 text-gray-500 transition-transform duration-200" />
              </summary>
              <div className="px-4 pb-4 space-y-2">
                {filter.options?.map(option => (
                  <label key={option.id} className="flex items-center space-x-2 cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 text-indigo-500 cursor-pointer border-gray-300 rounded focus:ring-indigo-500"
                      checked={selectedFilters[filter.id]?.filterOptionIds?.includes(option.id) || false}
                      onChange={(e) => {
                        handleFilterChange(e.target.checked, filter.id, option.id);
                      }}
                    />
                    <span className="text-sm text-gray-700">{option.displayName || option.label}</span>
                  </label>
                ))}
              </div>
              <hr className="mx-4 border-[#dee2e6]" />
            </details>
          );
        })
      )}

      <details open>
        <summary className="w-full flex items-center justify-between p-4 text-left cursor-pointer">
          <span className="font-medium text-gray-900">{t('priceRange')}</span>
          <ChevronDown className="chevron w-4 h-4 text-gray-500 transition-transform duration-200" />
        </summary>
        <div className="px-4 pb-4 space-y-3">
          <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder={t('productsPage.min')}
                value={minPrice}
                onChange={handleMinPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                min="0"
              />
              <span className="text-gray-500">-</span>
              <input
                type="number"
                placeholder={t('productsPage.max')}
                value={maxPrice}
                onChange={handleMaxPriceChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                min="0"
              />
          </div>
        </div>
      </details>

      {(isFiltering || isFiltersLoading) && (
        <div className="px-4 py-2 text-sm text-gray-500 flex items-center space-x-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500"></div>
          <span>{isFiltering ? t('productsPage.filtering') : t('productsPage.loadingFilters')}</span>
        </div>
      )}
    </div>
  );
});
