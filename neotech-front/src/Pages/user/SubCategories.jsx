import React, { useEffect, useState } from 'react';
import { useGetCategoryQuery, useGetRecommendedPageQuery, useGetRecommendedQuery } from '../../store/API';
import { Link, useLocation, useParams } from 'react-router';
import { Breadcrumb } from '../../products/Breadcrumb';
import SimilarProducts from '../../components/UI/SimilarRecommendedProducts';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';

// Skeleton Components
const SkeletonCategoryCard = () => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
    <div className="flex flex-col items-center text-center h-full">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 bg-gray-200 rounded-lg mb-4"></div>
      <div className="h-4 bg-gray-200 rounded w-24 sm:w-28 md:w-32"></div>
    </div>
  </div>
);

const SubCategoriesSkeleton = () => {
  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Breadcrumb Skeleton */}
        <div className="hidden md:block mb-5">
          <div className="flex items-center space-x-2 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-16"></div>
            <div className="h-4 bg-gray-200 rounded w-1"></div>
            <div className="h-4 bg-gray-200 rounded w-24"></div>
          </div>
        </div>
        
        {/* Page Title Skeleton */}
        <div className="mb-8 animate-pulse">
          <div className="h-8 sm:h-9 md:h-10 bg-gray-200 rounded w-48 sm:w-56 md:w-64"></div>
        </div>
        
        {/* Categories Grid Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {[...Array(8)].map((_, index) => (
            <SkeletonCategoryCard key={index} />
          ))}
        </div>

        {/* Similar Products Skeleton */}
        <SimilarProducts products={[]} isLoading={true} />
        
      </div>
    </section>
  );
};

// Category Card
const CategoryCard = ({ title, imageSrc = null, slug, parentCategory }) => (
  <Link
    to={`/products/${slug}`}
    state={{
      parentCategoryName: parentCategory?.name,
      parentCategorySlug: parentCategory?.slug
    }}
    className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
  >
    <div className="flex flex-col items-center text-center h-full">
      <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-lg flex items-center justify-center mb-4 group-hover:bg-gray-50 transition-colors">
        {imageSrc ? (
          <img
            src={`https://ecommerce100-001-site1.ntempurl.com/${imageSrc}`}
            alt={title}
            className="w-full h-full object-contain rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 bg-gray-200 rounded-md" />
        )}
      </div>
      <h3 className="text-sm sm:text-base md:text-lg font-medium text-gray-800 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
    </div>
  </Link>
);

// Main Component
const SubCategories = () => {
  const { slug } = useParams();
  const { data: subs, isLoading } = useGetCategoryQuery(slug);
  console.log(subs)
  const { data: similar, isLoading: isSimilarLoading } = useGetRecommendedPageQuery({
    categoryId: subs?.id,
    page: 1,
    pageSize: 6
  });
  console.log(similar)
  const location = useLocation();
  const { name } = location.state || {};
  const { i18n } = useTranslation();
  const [translatedSubs, setTranslatedSubs] = useState(null);

  useEffect(() => {
    async function translateCategoryData() {
      if (!subs) return;
      const targetLang = i18n.language;

      // If language is English, translate dynamically
      if (targetLang === 'en') {
        const translated = { ...subs };

        if (subs.name) {
          translated.name = await translateDynamicField(subs.name, targetLang);
        }

        if (Array.isArray(subs.subCategories)) {
          translated.subCategories = await Promise.all(
            subs.subCategories.map(async (sub) => ({
              ...sub,
              name: await translateDynamicField(sub.name, targetLang),
            }))
          );
        }

        setTranslatedSubs(translated);
      } else {
        // Use original data for non-English languages
        setTranslatedSubs(subs);
      }
    }

    translateCategoryData();
  }, [i18n.language, subs]);

  if (isLoading || !translatedSubs) {
    return <SubCategoriesSkeleton />;
  }

  return (
    <section className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        <div className=" md:block mb-5">
          <Breadcrumb />
        </div>
        
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900">
            {translatedSubs.name || name}
          </h1>
        </div>
        
        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {translatedSubs?.subCategories?.map((category, index) => (
            <CategoryCard
              key={index}
              title={category.name}
              imageSrc={category.imageUrl}
              slug={category.slug}
              parentCategory={translatedSubs}
            />
          ))}
        </div>

        {/* Similar Products Section */}
        <SimilarProducts
          products={similar?.items}
          isLoading={isSimilarLoading}
          useGridOnMobile={true}
        />
      </div>
    </section>
  );
};

export default SubCategories;

