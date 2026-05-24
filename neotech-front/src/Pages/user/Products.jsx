import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { Grid, List, ChevronDown, Check } from 'lucide-react';
import { Breadcrumb } from '../../products/Breadcrumb';
import SearchUI from '../../components/UI/SearchUI';
import { FilterSidebar } from '../../products/FilterSidebar';
import { MobileFilterButtons } from '../../products/MobileFilters';
import { ProductCard } from '../../products/ProductCard';
import { Pagination } from '../../products/Pagination';
import CartUtils from '../../components/UI/CartUtils';
import AuthUtils from '../../components/UI/AuthUtils';
import { 
  useAddCartItemMutation, 
  useGetCategoriesQuery, 
  useToggleFavoriteMutation,
  useGetFavoritesQuery,
  useSearchProductsPageQuery,
  useGetProductsCategorySlugPageQuery,
  useGetHotDealsPageQuery,
  useGetRecommendedPageQuery,
  useGetProductsBrandPageQuery,
  useGetProductsPaginatedQuery
} from '../../store/API';
import { toast } from 'react-toastify';
import { useParams, useSearchParams, useLocation } from 'react-router';
import UnauthorizedModal from '../../components/UI/UnauthorizedModal';
import SEO from '../../components/SEO/SEO';
import { useTranslation } from 'react-i18next';

const ProductCardSkeleton = React.memo(({ col }) => (
  <div className={`bg-white rounded-lg border border-gray-200 overflow-hidden ${col ? '' : 'flex'}`}>
    {col ? (
      <>
        <div className="w-full aspect-square bg-gray-200 animate-pulse" />
        <div className="p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/3" />
        </div>
      </>
    ) : (
      <>
        <div className="w-48 h-48 bg-gray-200 animate-pulse flex-shrink-0" />
        <div className="p-4 flex-1 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-6 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
      </>
    )}
  </div>
));


const CustomDropdown = React.memo(({ value, onChange, options }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const selectedOption = useMemo(() => 
    options.find(opt => opt.value === value) || options[0],
    [options, value]
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = useCallback((optionValue) => {
    onChange({ target: { value: optionValue } });
    setIsOpen(false);
  }, [onChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full lg:w-auto min-w-[180px] flex items-center justify-between gap-3 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-all"
      >
        <span>{selectedOption.label}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-full lg:w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelect(option.value)}
              className={`w-full flex items-center justify-between px-4 py-3 text-sm text-left transition-colors ${
                value === option.value
                  ? 'bg-gray-50 text-gray-900 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check className="w-4 h-4 text-gray-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

function Products() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const locationPath = location.pathname;
  const {t} = useTranslation();
  
  // Get parent category info from navigation state
  const parentCategoryInfo = location.state || null;

  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedAction, setUnauthorizedAction] = useState('');
  
  // Get search query from URL params
  const searchQuery = searchParams.get('search');
  const categoryParam = searchParams.get('category');
  const brandParam = searchParams.get('brand');
  
  // Extract brand slug if this is a brand route - memoize this
  const { isBrandRoute, brandSlug, isHotDeals, isRecommended, isBrand, isSearch, isCategoryParam, isBrandParam, isSpecialSlug } = useMemo(() => {
    const pathParts = locationPath.split('/');
    const isBrandRoute = pathParts.includes('brand');
    const brandSlug = isBrandRoute ? pathParts[pathParts.indexOf('brand') + 1] : null;
    const isHotDeals = slug === 'hot-deals';
    const isRecommended = slug === 'recommended';
    const isBrand = isBrandRoute && brandSlug;
    const isSearch = !!searchQuery;
    const isCategoryParam = !!categoryParam;
    const isBrandParam = !!brandParam;
    const isSpecialSlug = isHotDeals || isRecommended || isBrand || isSearch || isCategoryParam || isBrandParam;
    
    return { isBrandRoute, brandSlug, isHotDeals, isRecommended, isBrand, isSearch, isCategoryParam, isBrandParam, isSpecialSlug };
  }, [locationPath, slug, searchQuery, categoryParam, brandParam]);
  
  const categoryName = useMemo(() => {
    if (isHotDeals) return t('productsPage.hotDeals');
    if (isRecommended) return t('productsPage.recommended');
    if (isBrand) return brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1);
    if (isSearch) return t('productsPage.searchResultsFor', { query: searchQuery });
    if (isCategoryParam) return categoryParam.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    return slug?.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) || t('allProducts');
  }, [isHotDeals, isRecommended, isBrand, isSearch, isCategoryParam, brandSlug, searchQuery, categoryParam, slug, t]);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024); 
  const [template, setTemplate] = useState(isMobile ? "cols" : "rows");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); 

  // Query for search results
  const { data: searchResults, isLoading: isSearchLoading } = useSearchProductsPageQuery(
    { 
      searchTerm: searchQuery,
      page: currentPage,
      pageSize: 10
    },
    { skip: !isSearch || !searchQuery || searchQuery.length < 2 }
  );

  const { data: productDefault, isLoading: isLoadingProducts } = useGetProductsCategorySlugPageQuery(
    {
      categorySlug: slug,
      page: currentPage,
      pageSize: 10
    },
    { skip: !slug || isSpecialSlug }
  );

  const { data: hotDeals, isLoading: isHotDealsLoading } = useGetHotDealsPageQuery(
    {
      page: currentPage,
      pageSize: 10
    },
    { skip: !isHotDeals }
  );

  const { data: recommended, isLoading: isRecommendedLoading } = useGetRecommendedPageQuery(
    {
      limit: 10,
      page: currentPage,
      pageSize: 10
    }, 
    { skip: !isRecommended }
  );

  const { data: brandProducts, isLoading: isBrandLoading } = useGetProductsBrandPageQuery(
    {
      brandSlug: brandSlug,
      page: currentPage,
      pageSize: 10
    }, 
    { skip: !isBrand }
  );

  const { data: allProductsData, isLoading: isLoadingAllProducts } = useGetProductsPaginatedQuery(
    { page: currentPage, pageSize: 10 },
    { skip: !!slug || isSpecialSlug }
  );

  const { data: categories } = useGetCategoriesQuery();
  const { data: favorites } = useGetFavoritesQuery();
  
  const [products, setProducts] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [sortBy, setSortBy] = useState(null);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const [activeFilters, setActiveFilters] = useState([]);
  
  const [addCartItem] = useAddCartItemMutation();
  const [toggleFavorite] = useToggleFavoriteMutation();
  const [addingIds, setAddingIds] = useState(new Set());
  const [isAuthenticated, setIsAuthenticated] = useState(() => AuthUtils.isAuthenticated());

  // Sort options for dropdown - memoized
  const sortOptions = useMemo(() => [
    { value: null, label: t('sortBy') },
    { value: 'price_asc', label: t('priceLowToHigh') },
    { value: 'price_desc', label: t('priceHighToLow') },
    { value: 'name_asc' , label: t('nameAToZ') },
    { value: 'name_desc', label: t('nameZToA') }
  ], [t]);

  const categoryId = useMemo(() => {
    if (!slug || !categories || isSpecialSlug) return null;
     
    const category = categories.find(cat => 
      cat.slug.toLowerCase().replace(/\s+/g, '-') === slug.toLowerCase()
    );

    return category?.id ;
  }, [slug, categories, isSpecialSlug]);

  const prevDataRef = useRef({});
  
  useEffect(() => {
    if (filtersApplied) return; 
    
    let newProducts = null;
    let newTotalItems = 0;
    let dataKey = '';

    if (isSearch && searchResults?.items) {
      dataKey = 'search';
      newProducts = searchResults?.items;
      newTotalItems = searchResults?.totalCount;
    } else if (isHotDeals && hotDeals) {
      dataKey = 'hotDeals';
      newProducts = hotDeals?.items;
      newTotalItems = hotDeals?.totalCount;
    } else if (isRecommended && recommended?.items) {
      dataKey = 'recommended';
      newProducts = recommended?.items;
      newTotalItems = recommended?.totalCount;
    } else if (isBrand && brandProducts) {
      dataKey = 'brand';
      newProducts = brandProducts?.items;
      newTotalItems = brandProducts?.totalCount;
    } else if (slug && !isSpecialSlug && productDefault) {
      dataKey = 'category';
      newProducts = productDefault?.items;
      newTotalItems = productDefault?.totalCount;
    } else if (!slug && !isSpecialSlug && allProductsData) {
      dataKey = 'all';
      newProducts = allProductsData?.items;
      newTotalItems = allProductsData.totalCount;
    }

    // Only update if data actually changed
    if (newProducts && (
      prevDataRef.current.key !== dataKey || 
      prevDataRef.current.products !== newProducts ||
      prevDataRef.current.totalItems !== newTotalItems
    )) {
      prevDataRef.current = { key: dataKey, products: newProducts, totalItems: newTotalItems };
      setProducts(newProducts);
      setTotalItems(newTotalItems);
    }
  }, [
    searchResults, 
    productDefault, 
    hotDeals, 
    recommended, 
    brandProducts,
    allProductsData,
    filtersApplied, 
    isSearch,
    isHotDeals, 
    isRecommended, 
    isBrand, 
    isSpecialSlug,
    slug
  ]);

  // Calculate pagination - memoized
  const totalPages = useMemo(() => Math.ceil(totalItems / itemsPerPage), [totalItems, itemsPerPage]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleFilterResults = useCallback((data, filters = []) => {
    setActiveFilters(filters);

    if (data === null) {
      setFiltersApplied(false);
      // Reset to appropriate default data
      if (isSearch && searchResults) {
        const searchProducts = searchResults.items || [];
        setProducts(searchProducts);
        setTotalItems(searchResults.totalCount || 0);
      } else if (isHotDeals && hotDeals) {
        setProducts(hotDeals.items || []);
        setTotalItems(hotDeals.totalCount || 0);
      } else if (isRecommended && recommended?.items) {
        setProducts(recommended.items);
        setTotalItems(recommended.totalCount || 0);
      } else if (isBrand && brandProducts) {
        setProducts(brandProducts.items || []);
        setTotalItems(brandProducts.totalCount || 0);
      } else if (slug && productDefault) {
        setProducts(productDefault.items || []);
        setTotalItems(productDefault.totalCount || 0);
      } else if (!slug && allProductsData) {
        setProducts(allProductsData.items || []);
        setTotalItems(allProductsData.totalCount || 0);
      }
    } else if (data?.products) {
      setFiltersApplied(true);
      setProducts(data.products);
      setTotalItems(data.totalCount || data.products?.length);
    } else {
      setFiltersApplied(true);
      setProducts([]);
      setTotalItems(0);
    }
  }, [
    searchResults,
    productDefault,
    allProductsData,
    hotDeals, 
    recommended, 
    brandProducts, 
    isSearch,
    isHotDeals, 
    isRecommended, 
    isBrand,
    slug
  ]);

  const handleSortChange = useCallback((e) => {
    const value = e.target.value;
    setSortBy(value);
  }, []);

  const handleAddToCart = useCallback(async (id, productData) => {
    if (!id) return;

    setAddingIds(prev => new Set(prev).add(id));

    try {
      if (isAuthenticated) {
        await addCartItem({ productId: id, quantity: 1 }).unwrap();
      } else {
        CartUtils.addItem(productData, 1);
        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (err) {
      console.error(err);
      if (err?.status === 401 || err?.data?.status === 401) {
        toast.error(t('pleaseLoginFirst'));
      } else {
        toast.error(t('failedAddToCart'));
      }
    } finally {
      setAddingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  }, [isAuthenticated, addCartItem]);

  const handleToggleFavorite = useCallback(async (id) => {
    if (!id) return;

    try {
      await toggleFavorite({productId: id}).unwrap();
    } catch (err) {
      console.error(err);
      if (err?.status === 401 || err?.data?.status === 401) {
        setUnauthorizedAction(t('productsPage.addToCartAction'));
        setShowUnauthorizedModal(true);
        setIsAuthenticated(false);
      } else {
        toast.error(t('failedUpdateFavorites'));
      }
    }
  }, [toggleFavorite]);

  const isProductFavorited = useCallback((productId) => {
    if (!favorites) return false;
    return favorites.includes(productId);
  }, [favorites]);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // Mobil gÃ¶rÃ¼nÃ¼ÅŸdÉ™ hÉ™miÅŸÉ™ "cols" (grid), desktopda "rows" (list)
    if (isMobile) {
      setTemplate("cols");
    } else {
      setTemplate("rows");
    }
  }, [isMobile]);

  // Determine loading state based on slug type - memoized
  const shouldShowLoading = useMemo(() => {
    return isLoading || 
      (isSearch && isSearchLoading && !filtersApplied) ||
      (isHotDeals && isHotDealsLoading && !filtersApplied) ||
      (isRecommended && isRecommendedLoading && !filtersApplied) ||
      (isBrand && isBrandLoading && !filtersApplied) ||
      (slug && !isSpecialSlug && isLoadingProducts && !filtersApplied) ||
      (!slug && !isSpecialSlug && isLoadingAllProducts && !filtersApplied);
  }, [
    isLoading,
    isSearch,
    isSearchLoading,
    isHotDeals,
    isHotDealsLoading,
    isRecommended,
    isRecommendedLoading,
    isBrand,
    isBrandLoading,
    slug,
    isSpecialSlug,
    isLoadingProducts,
    isLoadingAllProducts,
    filtersApplied
  ]);

  // Memoize skeleton array
  const skeletonArray = useMemo(() => Array.from({ length: 6 }), []);

  // Generate SEO data based on current page type
  const seoTitle = useMemo(() => {
    if (isHotDeals) return 'Hot Deals - NeoTech Electronics';
    if (isRecommended) return 'Recommended Products - NeoTech Electronics';
    if (isBrand) return `${brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)} Products - NeoTech Electronics`;
    if (isSearch) return `Search Results for "${searchQuery}" - NeoTech Electronics`;
    if (isCategoryParam) return `${categoryParam.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - NeoTech Electronics`;
    if (slug) return `${slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())} - NeoTech Electronics`;
    return 'All Products - NeoTech Electronics';
  }, [isHotDeals, isRecommended, isBrand, isSearch, isCategoryParam, brandSlug, searchQuery, categoryParam, slug]);

  const seoDescription = useMemo(() => {
    if (isHotDeals) return 'Discover amazing hot deals on electronics at NeoTech Electronics. Limited time offers on computers, laptops, printers, and more.';
    if (isRecommended) return 'Browse our recommended products - carefully selected electronics for the best quality and value at NeoTech Electronics.';
    if (isBrand) return `Shop ${brandSlug.charAt(0).toUpperCase() + brandSlug.slice(1)} products at NeoTech Electronics. Best prices and authentic products.`;
    if (isSearch) return `Search results for "${searchQuery}" at NeoTech Electronics. Find the best electronics products.`;
    if (isCategoryParam) return `Browse ${categoryParam.replace(/-/g, ' ')} products at NeoTech Electronics. Quality electronics with best prices.`;
    if (slug) return `Shop ${slug.replace(/-/g, ' ')} products at NeoTech Electronics. Best selection and prices.`;
    return 'Browse all electronics products at NeoTech Electronics. Computers, laptops, printers, surveillance systems, and more.';
  }, [isHotDeals, isRecommended, isBrand, isSearch, isCategoryParam, brandSlug, searchQuery, categoryParam, slug]);

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${categoryName}, electronics, NeoTech, Azerbaijan, ${isBrand ? brandSlug : ''}, ${isSearch ? searchQuery : ''}`}
        image="/Icons/logo.png"
        type="website"
      />
      <UnauthorizedModal 
        isOpen={showUnauthorizedModal} 
        onClose={() => setShowUnauthorizedModal(false)}
        action={unauthorizedAction}
      />

      <div className="min-h-screen bg-[#f7fafc] inter">
        <div className='lg:hidden px-4 py-4 border-y-1 border-[#dee2e6] bg-white'>
          <div className='mb-4'><SearchUI /></div>
          <Breadcrumb categoryData={parentCategoryInfo ? {
            parentCategoryName: parentCategoryInfo.parentCategoryName,
            parentCategorySlug: parentCategoryInfo.parentCategorySlug,
            categoryName: categoryName,
            categorySlug: slug
          } : null} />
        </div>
        
        <div className='lg:hidden bg-white px-4 py-4'>
          <h1 className="text-2xl font-medium text-gray-900">
            {categoryName} ({totalItems || 0})
          </h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className='hidden lg:block lg:pl-4'><Breadcrumb categoryData={parentCategoryInfo ? {
            parentCategoryName: parentCategoryInfo.parentCategoryName,
            parentCategorySlug: parentCategoryInfo.parentCategorySlug,
            categoryName: categoryName,
            categorySlug: slug
          } : null} /></div>
          
          <div className="lg:flex lg:gap-8 lg:mt-5">
            <div className="hidden lg:block lg:w-64 lg:flex-shrink-0">
              <FilterSidebar 
                onFilterResults={handleFilterResults}
                onLoadingChange={setIsLoading}
                currentSort={sortBy}
                currentPage={currentPage}
                isHotDeals={isHotDeals ? true : false}
                isRecommended={isRecommended ? true : false}
                isBrand={isBrand ? brandSlug : ''} 
                isSearch={isSearch ? searchQuery : ''} 
                setCurrentPage={setCurrentPage}
                pageSize={itemsPerPage}
                forcedCategoryId={categoryId}
                showCategory={isSpecialSlug || !slug}
              />
            </div>

            <div className="flex-1"> 
              <MobileFilterButtons 
                onFilterResults={handleFilterResults}
                onLoadingChange={setIsLoading}
                currentSort={sortBy}
                onSortChange={handleSortChange}
                currentPage={currentPage}
                pageSize={itemsPerPage}
                forcedCategoryId={categoryId}
              />
              
              <div className="hidden lg:flex items-center justify-between bg-white p-3 rounded-lg border-[#dee2e6] border-1">
                {shouldShowLoading ? (
                  <>
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-48" />
                    <div className="flex items-center space-x-4">
                      <div className="h-10 bg-gray-200 rounded animate-pulse w-32" />
                      <div className="h-10 bg-gray-200 rounded animate-pulse w-20" />
                    </div>
                  </>
                ) : (
                  <>
                   <span className="text-sm text-gray-600">
                    {t('itemsFoundPr', { count: totalItems || 0 })}

                    {categoryName && (
                      <> {t('inCategoryPr')} <span className="font-semibold">{categoryName}</span></>
                    )}
                  </span>


                    <div className="hidden lg:flex items-center space-x-4">
                      <CustomDropdown
                        value={sortBy}
                        onChange={handleSortChange}
                        options={sortOptions}
                      />
                      <div className="flex border border-gray-300 rounded-md overflow-hidden">
                        <button 
                          onClick={() => {
                            if (!isMobile) {
                              setTemplate("cols");
                            }
                          }} 
                          className={`p-2 ${template === "cols" ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'} cursor-pointer`}
                        >
                          <Grid className="w-4 h-4" />
                        </button>

                        <button 
                          onClick={() => {
                            if (!isMobile) {
                              setTemplate("rows");
                            }
                          }} 
                          className={`p-2 ${template === "cols" ? 'bg-white text-gray-900' : 'bg-gray-900 text-white'} cursor-pointer`}
                        >
                          <List className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className={`mt-4 ${template === "cols" ? 'grid grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6' : 'flex flex-col gap-4'}`}>
                {shouldShowLoading ? (
                  skeletonArray.map((_, index) => (
                    <ProductCardSkeleton key={index} col={template === "cols"} />
                  ))
                ) : products?.length > 0 ? (
                  products.map((item) => {
                    const cardInfo = {
                      url: item.primaryImageUrl,
                      name: item.name,
                      priceOriginal: item?.originalPrice,
                      price: item?.currentPrice,
                      id: item.id,
                      description: item.shortDescription
                    };
                    return (
                      <ProductCard 
                        key={item.id} 
                        col={template === "cols"} 
                        info={cardInfo}
                        productData={item}
                        handleAddToCart={handleAddToCart}
                        isAddingToCart={addingIds.has(item.id)}
                        toggleFavorite={handleToggleFavorite}
                        isFavorite={isProductFavorited(item.id)}
                      />
                    );
                  })
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">{t('productsPage.noProductsFound')}</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {isSearch ? t('productsPage.tryDifferentKeywords') : t('productsPage.tryAdjustingFilters')}
                    </p>
                  </div>
                )}
              </div>

              {!shouldShowLoading && totalPages > 1 && (
                <Pagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Products;

