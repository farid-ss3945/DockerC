import React, { useState, useEffect } from 'react';
import SearchUI from '../../components/UI/SearchUI';
import { Breadcrumb } from '../../products/Breadcrumb';
import { Heart, Loader2, Check, Trash2 } from 'lucide-react';
import {
  useGetFavoritesQuery,
  useRemoveFavoriteMutation,
  useAddCartItemMutation,
  useClearFavoritesMutation,
  useGetRecommendedQuery
} from '../../store/API';
import { toast } from 'react-toastify';
import { Link } from 'react-router';
import SimilarProducts from '../../components/UI/SimilarRecommendedProducts';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';

const WishList = () => {
  const { t, i18n } = useTranslation();

  const [page, setPage] = useState(1);
  const pageSize = 20;
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  
  // Dynamic translation states
  const [translatedFavorites, setTranslatedFavorites] = useState([]);

  const { data: recommendation, isRecLoading } = useGetRecommendedQuery({ limit: 6 });
  const { data: favoritesData, isLoading, error } = useGetFavoritesQuery({ page, pageSize });
  const [removeFavorite, { isLoading: isRemovingFavorite }] = useRemoveFavoriteMutation();
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [clearFavorites] = useClearFavoritesMutation();

  const favorites = favoritesData?.favorites || [];
  const totalCount = favoritesData?.totalCount || 0;

  // Dynamic translation effect
  useEffect(() => {
    async function translateFavorites() {
      if (!favorites || favorites.length === 0) return;
      
      const targetLang = i18n.language;
      if (targetLang === 'en') {
        const translated = await Promise.all(
          favorites.map(async (favorite) => ({
            ...favorite,
            product: {
              ...favorite.product,
              name: await translateDynamicField(favorite.product.name, targetLang),
              shortDescription: favorite.product.shortDescription ? 
                await translateDynamicField(favorite.product.shortDescription, targetLang) : 
                favorite.product.shortDescription
            }
          }))
        );
        setTranslatedFavorites(translated);
      } else {
        setTranslatedFavorites(favorites);
      }
    }
    translateFavorites();
  }, [i18n.language, favorites]);

  const handleRemoveFavorite = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite({ productId }).unwrap();
    } catch (err) {
      toast.error(t('failedToRemoveFavorite'));
      console.error('Remove favorite error:', err);
    }
  };

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setLoadingProductId(productId);
    try {
      await addCartItem({ productId, quantity: 1 }).unwrap();
      setShowSuccess(productId);
      setTimeout(() => {
        setShowSuccess(null);
        setLoadingProductId(null);
      }, 2000);
    } catch (err) {
      setLoadingProductId(null);
      if (err?.status === 401 || err?.data?.status === 401) {
        toast.error(t('pleaseLoginFirst'));
      } else {
        toast.error(t('failedToAddToCart'));
      }
      console.error('Add to cart error:', err);
    }
  };

  const handleClearAll = async () => {
      try {
        await clearFavorites().unwrap();
      } catch (err) {
        toast.error(t('failedToClearFavorites'));
        console.error('Clear favorites error:', err);
      }
  };

  const renderButton = (productId) => {
    const isThisProductLoading = isAddingToCart && loadingProductId === productId;

    if (isThisProductLoading) {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed flex justify-center items-center text-sm lg:text-md bg-indigo-400 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('addingToCart')}
        </button>
      );
    }

    if (showSuccess === productId) {
      return (
        <button
          disabled
          className="w-full cursor-default flex justify-center items-center text-sm lg:text-md bg-green-500 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
        >
          <Check className="w-4 h-4 mr-2" />
          {t('addedToCart')}
        </button>
      );
    }

    return (
      <button
        onClick={(e) => handleAddToCart(e, productId)}
        className="w-full whitespace-nowrap cursor-pointer flex justify-center items-center text-sm lg:text-md bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
      >
        {t('addToCart')}
      </button>
    );
  };

  if (isLoading) {
    return (
      <section className="inter bg-[#f7fafc] min-h-screen flex items-center justify-center">
        <div className="text-xl">{t('loadingFavorites')}</div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="inter bg-[#f7fafc] min-h-screen flex items-center justify-center">
        <div className="text-xl text-indigo-600">{t('errorLoadingFavorites')}</div>
      </section>
    );
  }

  return (
    <section className="inter bg-[#f7fafc]  pb-8">
      {/* Mobile Search + Breadcrumb */}
      <div className="lg:hidden px-4 pl-7 py-4 bg-white lg:border-transparent">
        <Breadcrumb />
      </div>

      <div className="min-h-[80vh] lg:max-w-[90vw] lg:mx-auto border border-[#dee2e6] lg:border-0">
        <div className="p-4 pl-7 pb-0 hidden lg:block">
          <Breadcrumb />
        </div>

        <div className="p-4 pl-7 text-xl md:text-2xl font-semibold bg-white lg:bg-transparent border-b lg:border-0 border-[#dee2e6] mb-3 flex justify-between items-center">
          <h1>
            {t('favorites')} ({totalCount})
          </h1>
          {favorites?.length > 0 && (
            <button
              onClick={handleClearAll}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-normal flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {t('clearAll')}
            </button>
          )}
        </div>

        <div className="lg:bg-transparent rounded-lg flex flex-col mx-auto md:mx-0 max-w-[95vh] md:max-w-full lg:flex-row lg:gap-4 shadow-sm lg:shadow-none lg: p-4 space-y-4">
          <div className="flex-5 flex gap-5 flex-col lg:rounded-lg">
            {favorites?.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <Heart className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-xl text-gray-600">{t('favoritesEmpty')}</p>
                <p className="text-gray-500 mt-2">{t('favoritesEmptyHint')}</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 [@media(min-width:1300px)]:grid-cols-5 lg:grid-cols-4 gap-2 ">
                {(translatedFavorites.length > 0 ? translatedFavorites : favorites).map((item) => (
                  <Link
                    key={item.id}
                    to={`/details/${item.product.id}`}
                    className="bg-white flex flex-col justify-between p-1 border-1 cursor-pointer border-gray-300 rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 relative"
                  >
                    <img
                      className="w-full rounded-lg p-3 aspect-square"
                      src={`https://ecommerce100-001-site1.ntempurl.com${item.product.primaryImageUrl}`}
                      alt={item.product.name || 'Product'}
                      onError={(e) => {
                        e.target.src = '/Icons/logo.svg';
                      }}
                    />
                    <div className="font-semibold p-2 inter">
                      <h1 className="text-lg">
                        {item.product.currentPrice} AZN
                      </h1>
                      <p className="font-medium mb-3 whitepsace-normal">{item.product.name || 'Product'}</p>
                      {item.product.shortDescription && (
                        <p className="text-gray-600 font-normal whitespace-normal [@media(min-width:450px)]:break-words line-clamp-3 text-sm">
                          {item.product.shortDescription}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-3 p-2">
                      {renderButton(item.product.id)}
                      <button
                        onClick={(e) => handleRemoveFavorite(e, item.product.id)}
                        disabled={isRemovingFavorite}
                        className="p-1 rounded-lg border-[#DEE2E7] bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <Heart className="w-4 h-4 lg:w-5 lg:h-5 fill-indigo-500 text-indigo-500" />
                      </button>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > pageSize && (
              <div className="flex justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  {t('previous')}
                </button>
                <span className="px-4 py-2 bg-white border border-gray-300 rounded-md">
                  {t('page')} {page} {t('of')} {Math.ceil(totalCount / pageSize)}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(totalCount / pageSize)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                >
                  {t('next')}
                </button>
              </div>
            )}
          </div>
        </div>

        <SimilarProducts products={recommendation?.recentlyAdded} isLoading={isRecLoading} />
      </div>
    </section>
  );
};

export default WishList;

