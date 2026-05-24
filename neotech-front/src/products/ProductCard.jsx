import React, { useState, useEffect } from 'react';
import { Heart, Check } from 'lucide-react';
import { Link } from 'react-router';
import { useGetFavoriteStatusQuery } from '../store/API';
import { translateDynamicField } from '../i18n'; // your dynamic translation helper
import { useTranslation } from 'react-i18next';

export function ProductCard({
  col,
  info,
  productData,
  handleAddToCart,
  isAddingToCart,
  toggleFavorite,
  isFavorite = false
}) {
  const { id, url, name: originalName, description: originalDescription, priceOriginal, price, discountPercentage, isHotDeal } = info;
  const [localFavorite, setLocalFavorite] = useState(isFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [name, setName] = useState(originalName);
  const [description, setDescription] = useState(originalDescription);
  const { data: favoriteStatus } = useGetFavoriteStatusQuery({ productId: id });
  const { i18n, t } = useTranslation();

  const hasDiscount = priceOriginal && price && priceOriginal > price;

  // Translate dynamic fields on language change
  useEffect(() => {
  async function translateFields() {
    const targetLang = i18n.language;
    // Only translate AZ → EN
    if (targetLang === "en") {
      setName(await translateDynamicField(originalName, targetLang));
      setDescription(await translateDynamicField(originalDescription, targetLang));
    } else {
      // AZ default
      setName(originalName);
      setDescription(originalDescription);
    }
  }
  translateFields();
}, [i18n.language, originalName, originalDescription]);


  useEffect(() => {
    if (justAdded) {
      const timer = setTimeout(() => setJustAdded(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [justAdded]);

  const handleCartClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (handleAddToCart) {
      handleAddToCart(id, productData);
      setJustAdded(true);
    }
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTogglingFavorite || !toggleFavorite) return;

    try {
      await toggleFavorite(id);
    } catch (error) {
    }
  };

  if (col) {
    // Column layout (grid view)
    return (
      <div className="bg-white rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border flex flex-col justify-between border-gray-100 overflow-hidden relative">
        <Link to={`/details/${id}`} className="block">
          <div className="aspect-square p-4 relative">
            <img
              src={`https://ecommerce100-001-site1.ntempurl.com${url}`}
              alt={name || 'Product'}
              className="w-full h-full object-contain"
              onError={(e) => { e.target.src = '/Icons/logo.svg'; }}
            />

            {isHotDeal && (
              <div className="absolute top-2 right-2 bg-[#4F46E5] text-white text-xs px-2 py-1 rounded font-semibold">
                {t('productCard.hotDeal')}
              </div>
            )}
            {hasDiscount && discountPercentage > 0 && (
              <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
                -{discountPercentage}%
              </div>
            )}
          </div>
        </Link>

        <div className="p-4 relative">
          

          <Link to={`/details/${id}`} className="block mb-4">
            <div className='flex gap-2'>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 line-clamp-2 min-h-[56px]">
                {name}
              </h3>
              <button
                onClick={handleFavoriteClick}
                disabled={isTogglingFavorite}
                className=" top-4 right-4 p-1 lg:p-2 h-fit rounded-lg border border-gray-200 bg-white shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed z-10"
              >
                <Heart
                  className={`w-4 h-4 lg:w-5 lg:h-5 transition-colors text-indigo-500 hover:fill-indigo-400 cursor-pointer ${
                    favoriteStatus?.isFavorite && 'fill-indigo-500'
                  }`}
                />
              </button>
            </div>
            {description && (
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {description}
              </p>
            )}

            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <p className="text-xl font-bold text-[#4F46E5]">{price} ₼</p>
              {hasDiscount && (
                <p className="text-sm text-gray-400 line-through">{priceOriginal} ₼</p>
              )}
            </div>
            {hasDiscount && (
              <p className="text-xs text-green-600 font-medium mt-1">
                {t('productCard.save')} {(priceOriginal - price).toFixed(2)} ₼
              </p>
            )}
          </Link>

          <button
            onClick={handleCartClick}
            disabled={isAddingToCart || justAdded}
            className={`w-full cursor-pointer text-sm lg:text-md py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              justAdded
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#4F46E5] hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                {t('productCard.addedToCart')}
              </>
            ) : isAddingToCart ? (
              t('productCard.adding')
            ) : (
              t('productCard.addToCart')
            )}
          </button>
        </div>
      </div>
    );
  } else {
    // Row layout (list view)
    return (
      <Link
        to={`/details/${id}`}
        className="border border-gray-200 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 rounded-2xl p-4 bg-white flex items-center gap-6 relative"
      >
        <div className="flex-shrink-0 h-full w-full max-w-[150px] relative">
          <img
            src={`https://ecommerce100-001-site1.ntempurl.com${url}`}
            alt={name || 'Product'}
            className="max-w-[150px] object-cover aspect-square w-full h-full rounded-lg"
            onError={(e) => {
              e.currentTarget.src = "/Icons/logo.svg";
              e.currentTarget.className =
                "object-contain aspect-square w-full h-full rounded-lg";
            }}
          />

          {hasDiscount && discountPercentage > 0 && (
            <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              -{discountPercentage}%
            </div>
          )}
          {isHotDeal && (
            <div className="absolute top-2 right-2 bg-[#4F46E5] text-white text-xs px-2 py-1 rounded font-semibold">
              {t('productCard.hotDeal')}
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 space-y-4">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold">{name}</h2>
              {description && (
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{description}</p>
              )}
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <p className="text-2xl font-bold text-[#4F46E5]">{price} ₼</p>
              </div>
            </div>

            <button
              onClick={handleFavoriteClick}
              disabled={isTogglingFavorite}
              className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Heart
                className={`w-6 h-6 transition-colors text-indigo-500 hover:fill-indigo-400 cursor-pointer ${
                  favoriteStatus?.isFavorite && 'fill-indigo-500'
                }`}
              />
            </button>
          </div>

          <button
            onClick={handleCartClick}
            disabled={isAddingToCart || justAdded}
            className={`h-fit self-end cursor-pointer w-[200px] text-sm lg:text-md py-3 px-4 rounded-md font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              justAdded
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-[#4F46E5] hover:bg-indigo-600 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-4 h-4" />
                {t('productCard.addedToCart')}
              </>
            ) : isAddingToCart ? (
              t('productCard.adding')
            ) : (
              t('productCard.addToCart')
            )}
          </button>
        </div>
      </Link>
    );
  }
}

