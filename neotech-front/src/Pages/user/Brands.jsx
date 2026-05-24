import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { useGetBrandsAdminQuery } from '../../store/API';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';

// Skeleton Components
const BrandCardSkeleton = () => (
  <div className='bg-white rounded-lg border-2 border-[#dee2e6] p-6 animate-pulse'>
    <div className='flex flex-col items-center'>
      <div className='w-full h-24 bg-gray-200 rounded mb-4'></div>
      <div className='h-5 bg-gray-200 rounded w-3/4 mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-1/2'></div>
    </div>
  </div>
);

const FeaturedBrandSkeleton = () => (
  <div className='bg-white rounded-lg border-2 border-[#dee2e6] overflow-hidden animate-pulse'>
    <div className='h-48 bg-gray-200'></div>
    <div className='p-6'>
      <div className='h-6 bg-gray-200 rounded w-3/4 mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-full mb-2'></div>
      <div className='h-4 bg-gray-200 rounded w-2/3 mb-4'></div>
      <div className='h-4 bg-gray-200 rounded w-1/3'></div>
    </div>
  </div>
);

const SkeletonLoader = () => (
  <section className='bg-[#F7FAFC] min-h-screen inter'>


    <div className='max-w-[90vw] mx-auto py-8'>
      {/* Search Bar Skeleton */}
      <div className='bg-white rounded-lg border border-[#dee2e6] p-4 mb-6'>
        <div className='h-12 bg-gray-200 rounded animate-pulse'></div>
      </div>

      {/* Alphabet Filter Skeleton */}
      <div className='bg-white rounded-lg border border-[#dee2e6] p-4 mb-8'>
        <div className='flex gap-2'>
          {[...Array(10)].map((_, i) => (
            <div key={i} className='h-10 w-10 bg-gray-200 rounded-lg animate-pulse'></div>
          ))}
        </div>
      </div>

      {/* Count Skeleton */}
      <div className='mb-6'>
        <div className='h-4 bg-gray-200 rounded w-32 animate-pulse'></div>
      </div>

      {/* Grid Skeleton */}
      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
        {[...Array(10)].map((_, i) => (
          <BrandCardSkeleton key={i} />
        ))}
      </div>

      {/* Featured Section Skeleton */}
      <div className='mt-16'>
        <div className='h-8 bg-gray-200 rounded w-48 mb-6 animate-pulse'></div>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {[...Array(3)].map((_, i) => (
            <FeaturedBrandSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  </section>
);

const Brands = () => {
  const { t, i18n } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState('All');
  const { data: brandsD, isLoading, error, refetch } = useGetBrandsAdminQuery();
  
  // Dynamic translation states
  const [translatedBrands, setTranslatedBrands] = useState([]);
  

  // Dynamic translation effect
  useEffect(() => {
    async function translateBrands() {
      if (!brandsD || brandsD.length === 0) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = await Promise.all(
          brandsD.map(async (brand) => ({
            ...brand,
            name: await translateDynamicField(brand.name, targetLang)
          }))
        );
        setTranslatedBrands(translated);
      } else {
        setTranslatedBrands(brandsD);
      }
    }
    translateBrands();
  }, [i18n.language, brandsD]);

  // Transform API data to include all necessary properties
  const currentBrands = translatedBrands.length > 0 ? translatedBrands : brandsD;
  const brands = currentBrands?.map(brand => ({
    name: brand?.name || "Brand",
    logo: brand?.logoUrl 
      ? `https://ecommerce100-001-site1.ntempurl.com${brand.logoUrl}` 
      : './Icons/banner-commercial.svg',
    products: brand?.productCount || 0,
    slug: brand?.slug
  })) || [];
  


  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLetter = selectedLetter === 'All' || brand.name.toUpperCase().startsWith(selectedLetter);
    return matchesSearch && matchesLetter;
  });

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <section className='bg-[#F7FAFC] min-h-screen inter'>
        <div className='flex flex-col items-center justify-center h-screen'>
          <div className='bg-white rounded-lg border border-red-200 p-8 text-center max-w-md'>
            <div className='w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4'>
              <svg className='w-8 h-8 text-indigo-500' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M6 18L18 6M6 6l12 12' />
              </svg>
            </div>
            <h3 className='text-xl font-semibold text-gray-900 mb-2'>{t('brandsSection.errorTitle')}</h3>
            <p className='text-[#505050] mb-4'>{t('brandsSection.errorMessage')}</p>
            <button 
              onClick={() => refetch()}
              className='bg-[#4F46E5] text-white px-6 py-2 rounded-lg hover:bg-[#3730A3] transition-colors'
            >
              {t('brandsSection.retry')}
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='bg-[#F7FAFC] min-h-screen inter'>
      {/* Hero Section */}


      <div className='max-w-[90vw] mx-auto py-8'>
        {/* Search Bar */}
        <div className='bg-white rounded-lg border border-[#dee2e6]  mb-6'>
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' size={20} />
            <input
              type='text'
              placeholder={t('brandsSection.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className='w-full pl-10 pr-4 py-3 border border-[#dee2e6] rounded-lg focus:outline-none focus:border-[#4F46E5] transition-colors'
            />
          </div>
        </div>

        

        {/* Brands Count */}
        <div className='mb-6'>
          <p className='text-[#505050]'>
            {t('brandsSection.showing')} <span className='font-semibold text-black'>{filteredBrands.length}</span> {t('brandsSection.brandCountLabel')}
          </p>
        </div>

        {/* Brands Grid */}
        {filteredBrands.length > 0 ? (
          <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'>
            {filteredBrands.map((brand, index) => (
              <Link
                key={index}
                to={`/products/brand/${brand.slug || brand.name.toLowerCase()}`}
                className='group bg-white rounded-lg border-2 border-[#dee2e6] p-6 hover:border-[#4F46E5] hover:shadow-lg transition-all duration-300 hover:-translate-y-1'
              >
                <div className='flex flex-col items-center'>
                  {/* Brand Logo */}
                  <div className='w-full h-24 flex items-center justify-center mb-4'>
                    <img
                      src={brand.logo}
                      alt={brand.name}
                      className='max-w-full max-h-full object-contain'
                      onError={(e) => {
                        e.target.src = './Icons/banner-commercial.svg';
                      }}
                    />
                  </div>

                  {/* Brand Name */}
                  <h3 className='text-lg font-semibold text-center mb-2 group-hover:text-[#4F46E5] transition-colors capitalize'>
                    {brand.name}
                  </h3>

                  {/* Product Count */}
                  <p className='text-sm text-[#505050] text-center mb-3'>
                    {brand.products} {brand.products === 1 ? 'product' : 'products'}
                  </p>

                  {/* View Button */}
                  <div className='flex items-center gap-2 text-[#4F46E5] text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity'>
                    View Products
                    <ChevronRight size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className='bg-white rounded-lg border border-[#dee2e6] p-12 text-center'>
            <img
              src='./Icons/banner-commercial.svg'
              alt='No results'
              className='w-24 h-24 mx-auto mb-4 opacity-50'
            />
            <h3 className='text-xl font-semibold mb-2'>No brands found</h3>
            <p className='text-[#505050]'>
              Try adjusting your search or filter criteria
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Brands;

