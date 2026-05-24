import React, { useState, useEffect } from 'react';
import { Search, Package, Tag, Grid } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';

// Skeleton Components
const CategorySkeleton = () => (
  <div className="flex items-center gap-3 p-2 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-lg" />
    <div className="flex-1">
      <div className="h-4 bg-gray-200 rounded w-24 mb-1" />
      <div className="h-3 bg-gray-200 rounded w-16" />
    </div>
  </div>
);

const BrandSkeleton = () => (
  <div className="flex items-center gap-3 p-2 animate-pulse">
    <div className="w-10 h-10 bg-gray-200 rounded-full" />
    <div className="h-4 bg-gray-200 rounded w-20" />
  </div>
);

const ProductSkeletonDesktop = () => (
  <div className="bg-white rounded-lg border border-[#dee2e6] p-3 animate-pulse">
    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-3" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-5 bg-gray-200 rounded w-1/3 mt-2" />
    </div>
  </div>
);

const SearchDropdown = ({ 
  searchQuery, 
  searchResult, 
  isSearching, 
  onClose,
  onProductClick,
  onCategoryClick,
  onBrandClick,
  onViewAllProducts,
  t,
  width 
}) => {
  const { i18n } = useTranslation();
  
  // Dynamic translation states
  const [translatedSearchResult, setTranslatedSearchResult] = useState(null);
  
  // Dynamic translation effect
  useEffect(() => {
    async function translateSearchResult() {
      if (!searchResult) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = { ...searchResult };
        
        // Translate categories
        if (searchResult.categories) {
          translated.categories = await Promise.all(
            searchResult.categories.map(async (category) => ({
              ...category,
              name: await translateDynamicField(category.name, targetLang)
            }))
          );
        }
        
        // Translate brands
        if (searchResult.brands) {
          translated.brands = await Promise.all(
            searchResult.brands.map(async (brand) => ({
              ...brand,
              name: await translateDynamicField(brand.name, targetLang)
            }))
          );
        }
        
        // Translate products
        if (searchResult.products) {
          translated.products = await Promise.all(
            searchResult.products.map(async (product) => ({
              ...product,
              name: await translateDynamicField(product.name, targetLang),
              categoryName: product.categoryName ? await translateDynamicField(product.categoryName, targetLang) : product.categoryName
            }))
          );
        }
        
        setTranslatedSearchResult(translated);
      } else {
        setTranslatedSearchResult(searchResult);
      }
    }
    translateSearchResult();
  }, [i18n.language, searchResult]);

  // Empty state - before typing
  if (searchQuery.length === 0 || searchQuery.length === 1) {
    return (
      <div className="p-8 text-center">
        <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium mb-1">Start typing to search</p>
        <p className="text-gray-400 text-sm">
          Search for products, categories, and brands
        </p>
      </div>
    );
  }

  // Loading state
  if (isSearching) {
    return (
      <div className="p-4 max-h-[70vh] overflow-y-auto">
        {/* Categories Loading */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            CATEGORIES
          </h3>
          <div className="space-y-2">
            {[...Array(2)].map((_, idx) => (
              <CategorySkeleton key={idx} />
            ))}
          </div>
        </div>

        {/* Brands Loading */}
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            BRANDS
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, idx) => (
              <BrandSkeleton key={idx} />
            ))}
          </div>
        </div>

        {/* Products Loading */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            PRODUCTS
          </h3>
          <div className="grid grid-cols-2 [@media(min-width:1200px)]:grid-cols-3 [@media(min-width:1500px)]:grid-cols-4 gap-3">
            {[...Array(4)].map((_, idx) => (
              <ProductSkeletonDesktop key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No results state
  const currentSearchResult = translatedSearchResult || searchResult;
  if (!currentSearchResult || (!currentSearchResult.categories?.length && !currentSearchResult.brands?.length && !currentSearchResult.products?.length)) {
    return (
      <div className="p-12 text-center">
        <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium mb-1">No results found</p>
        <p className="text-gray-400 text-sm">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  const hasCategories = currentSearchResult.categories && currentSearchResult.categories.length > 0;
  const hasBrands = currentSearchResult.brands && currentSearchResult.brands.length > 0;
  const hasProducts = currentSearchResult.products && currentSearchResult.products.length > 0;

  return (
    <div className="p-4 max-h-[70vh] overflow-y-auto">
      {/* Categories Section */}
      {hasCategories && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            CATEGORIES ({currentSearchResult.categories.length})
          </h3>
          <div className="space-y-1">
            {currentSearchResult.categories.slice(0, 5).map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.slug, category.name)}
                className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors group"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                  <Grid className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">{category.name}</p>
                  {category.productCount > 0 && (
                    <p className="text-xs text-gray-500">{category.productCount} products</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Brands Section */}
      {hasBrands && (
        <div className="mb-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
{t('brandsSection.brandsLabel')} ({currentSearchResult.brands.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {currentSearchResult.brands.slice(0, 6).map((brand) => (
              <div
                key={brand.id}
                onClick={() => onBrandClick(brand.slug, brand.name)}
                className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded-full cursor-pointer transition-colors group border border-gray-200"
              >
                {brand.logoUrl ? (
                  <img 
                    src={`https://ecommerce100-001-site1.ntempurl.com${brand.logoUrl}`}
                    alt={brand.name}
                    className="w-6 h-6 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <Tag className="w-3 h-3 text-gray-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">{brand.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Products Section */}
      {hasProducts && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            PRODUCTS ({currentSearchResult.products.length})
          </h3>
          <div className="grid grid-cols-2 [@media(min-width:1200px)]:grid-cols-3 [@media(min-width:1500px)]:grid-cols-4 gap-3">
            {currentSearchResult.products.slice(0, 4).map((product) => (
              <div
                key={product.id}
                onClick={(e) => onProductClick(e, product.id)}
                onMouseDown={(e) => e.preventDefault()}
                className="bg-white rounded-lg border border-[#dee2e6] p-3 hover:shadow-md cursor-pointer transition-all group"
              >
                <div className="relative w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-3 overflow-hidden">
                  <img 
                    src={`https://ecommerce100-001-site1.ntempurl.com${product.primaryImageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = '/Icons/logo.svg';
                    }}
                  />
                  {product.isHotDeal && (
                    <div className="absolute top-2 right-2 bg-[#4F46E5] text-white text-xs px-2 py-1 rounded">
                      Hot Deal
                    </div>
                  )}
                  {product.discountPercentage > 0 && (
                    <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      -{product.discountPercentage}%
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-800 font-medium text-sm mb-1 line-clamp-2 min-h-[40px]">
                    {product.name}
                  </h4>
                  <p className="text-gray-400 text-xs mb-2 truncate">
                    {product.categoryName?.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[#4F46E5] font-bold text-base">
                      {product.currentPrice.toLocaleString()} AZN
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-gray-400 text-xs line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {currentSearchResult.products.length > 4 && (
            <button
              onClick={onViewAllProducts}
              className="block w-full text-center mt-4 py-2 text-[#4F46E5] hover:text-indigo-700 font-medium text-sm transition-colors"
            >
              View all {currentSearchResult.products.length} products →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchDropdown;

