import React from 'react';
import { Search, Package, Tag, Grid } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// Skeleton Components
const CategorySkeletonMobile = () => (
  <div className="flex items-center gap-2 p-2 animate-pulse">
    <div className="w-8 h-8 bg-gray-200 rounded-lg" />
    <div className="flex-1">
      <div className="h-3 bg-gray-200 rounded w-20 mb-1" />
      <div className="h-2 bg-gray-200 rounded w-12" />
    </div>
  </div>
);

const BrandSkeletonMobile = () => (
  <div className="flex items-center gap-2 px-2 py-1.5 animate-pulse">
    <div className="w-5 h-5 bg-gray-200 rounded-full" />
    <div className="h-3 bg-gray-200 rounded w-16" />
  </div>
);

const ProductSkeletonMobile = () => (
  <div className="bg-white rounded-lg border border-[#dee2e6] p-2 animate-pulse">
    <div className="w-full aspect-square bg-gray-200 rounded-lg mb-2" />
    <div className="space-y-2">
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-1/3 mt-1" />
    </div>
  </div>
);

const MobileSearchDropdown = ({ 
  searchQuery, 
  searchResult, 
  isSearching, 
  onProductClick,
  onCategoryClick,
  onBrandClick,
  onViewAllProducts
}) => {
  // Empty state - before typing
  const {t} = useTranslation()
  if (searchQuery.length === 0 || searchQuery.length === 1) {
    return (
      <div className="py-12 text-center">
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
      <div className="space-y-6">
        {/* Categories Loading */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            CATEGORIES
          </h3>
          <div className="space-y-1">
            {[...Array(2)].map((_, idx) => (
              <CategorySkeletonMobile key={idx} />
            ))}
          </div>
        </div>

        {/* Brands Loading */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            BRANDS
          </h3>
          <div className="flex flex-wrap gap-2">
            {[...Array(3)].map((_, idx) => (
              <BrandSkeletonMobile key={idx} />
            ))}
          </div>
        </div>

        {/* Products Loading */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Package className="w-4 h-4" />
            PRODUCTS
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[...Array(4)].map((_, idx) => (
              <ProductSkeletonMobile key={idx} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No results state
  if (!searchResult || (!searchResult.categories?.length && !searchResult.brands?.length && !searchResult.products?.length)) {
    return (
      <div className="py-12 text-center">
        <Search className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-600 font-medium mb-1">No results found</p>
        <p className="text-gray-400 text-sm">
          Try searching with different keywords
        </p>
      </div>
    );
  }

  const hasCategories = searchResult.categories && searchResult.categories.length > 0;
  const hasBrands = searchResult.brands && searchResult.brands.length > 0;
  const hasProducts = searchResult.products && searchResult.products.length > 0;

  return (
    <div className="space-y-6 ">
      {/* Categories Section */}
      {hasCategories && (
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Grid className="w-4 h-4" />
            CATEGORIES ({searchResult.categories.length})
          </h3>
          <div className="space-y-1">
            {searchResult.categories.slice(0, 4).map((category) => (
              <div
                key={category.id}
                onClick={() => onCategoryClick(category.id, category.name)}
                className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors active:bg-gray-100"
              >
                <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Grid className="w-4 h-4 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{category.name}</p>
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
        <div>
          <h3 className="text-xs font-semibold text-gray-500 mb-3 flex items-center gap-2">
            <Tag className="w-4 h-4" />
            {t('brandsSection.brandsLabel')} ({searchResult.brands.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {searchResult.brands.slice(0, 6).map((brand) => (
              <div
                key={brand.id}
                onClick={() => onBrandClick(brand.slug, brand.name)}
                className="flex items-center gap-2 px-2.5 py-1.5 bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full cursor-pointer transition-colors border border-gray-200"
              >
                {brand.logoUrl ? (
                  <img 
                    src={`https://ecommerce100-001-site1.ntempurl.com${brand.logoUrl}`}
                    alt={brand.name}
                    className="w-5 h-5 rounded-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center">
                    <Tag className="w-3 h-3 text-gray-500" />
                  </div>
                )}
                <span className="text-xs font-medium text-gray-700">{brand.name}</span>
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
            PRODUCTS ({searchResult.products.length})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {searchResult.products.slice(0, 6).map((product) => (
              <div
                key={product.id}
                onClick={(e) => onProductClick(e, product.id)}
                onMouseDown={(e) => e.preventDefault()}
                className="bg-white rounded-lg border border-[#dee2e6] p-2 hover:shadow-md cursor-pointer transition-all active:scale-95"
              >
                <div className="relative w-full aspect-square bg-white rounded-lg flex items-center justify-center mb-2 overflow-hidden">
                  <img 
                    src={`https://ecommerce100-001-site1.ntempurl.com${product.primaryImageUrl}`}
                    alt={product.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = '/Icons/logo.svg';
                    }}
                  />
                  {product.isHotDeal && (
                    <div className="absolute top-1 right-1 bg-[#4F46E5] text-white text-[10px] px-1.5 py-0.5 rounded">
                      Hot
                    </div>
                  )}
                  {product.discountPercentage > 0 && (
                    <div className="absolute top-1 left-1 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-semibold">
                      -{product.discountPercentage}%
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-800 font-medium text-xs mb-1 line-clamp-2 min-h-[32px]">
                    {product.name}
                  </h4>
                  <p className="text-gray-400 text-[10px] mb-1 truncate">
                    {product.categoryName?.replace(/-/g, ' ')}
                  </p>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[#4F46E5] font-bold text-sm">
                      ${product.currentPrice.toLocaleString()}
                    </span>
                    {product.discountPercentage > 0 && (
                      <span className="text-gray-400 text-[10px] line-through">
                        ${product.originalPrice.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {searchResult.products.length > 6 && (
            <button
              onClick={onViewAllProducts}
              className="block w-full text-center mt-4 py-3 text-[#4F46E5] hover:text-indigo-700 active:text-indigo-800 font-medium text-sm transition-colors bg-gray-50 rounded-lg"
            >
              View all {searchResult.products.length} results →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileSearchDropdown;

