import { Heart, Loader2, Check } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { Link } from 'react-router'
import { useToggleFavoriteMutation, useGetFavoriteStatusQuery } from '../../store/API';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';
import CartUtils from './CartUtils';
import AuthUtils from './AuthUtils';
import UnauthorizedModal from './UnauthorizedModal';

const HomePageUI = ({
  deal,
  product,
  url,
  handleAddToCart, 
  showUnauthorizedModal,
  setShowUnauthorizedModal,
  unauthorizedAction,
  setUnauthorizedAction,
}) => {
  const { t, i18n } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Dynamic translation states safely initialized
  const [translatedProductName, setTranslatedProductName] = useState(product?.name || '');
  const [translatedProductDescription, setTranslatedProductDescription] = useState(product?.shortDescription || '');

  // 1. SAFE HOOK RESOLUTION: Skip query execution completely if product or product.id is missing
  const { data: favoriteStatus } = useGetFavoriteStatusQuery(
    { productId: product?.id },
    { skip: !product?.id }
  );

  const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();
  const [localFavorite, setLocalFavorite] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    setIsAuthenticated(AuthUtils.isAuthenticated());
  }, []);

  // Dynamic translation effect
  useEffect(() => {
    async function translateFields() {
      const targetLang = i18n.language;
      if (!product) return;

      if (targetLang === 'en' && product.name) {
        setTranslatedProductName(await translateDynamicField(product.name, targetLang));
      } else {
        setTranslatedProductName(product.name || '');
      }
      
      if (targetLang === 'en' && product.shortDescription) {
        setTranslatedProductDescription(await translateDynamicField(product.shortDescription, targetLang));
      } else {
        setTranslatedProductDescription(product.shortDescription || '');
      }
    }
    translateFields();
  }, [i18n.language, product?.name, product?.shortDescription]);

  // Update local favorite state when API data arrives
  useEffect(() => {
    if (favoriteStatus) {
      setLocalFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  // 2. COMPONENT DEFENSIBILITY GUARD: Prevent rendering structural elements if product data hasn't arrived
  if (!product || !product.id) {
    return <div className="min-h-[350px] bg-gray-50 animate-pulse rounded-lg" />;
  }

  // ============= ADD TO CART HANDLER =============
  const onAddToCart = async (e, productData) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);
    setShowSuccess(false);

    try {
      if (isAuthenticated && handleAddToCart) {
        await handleAddToCart(productData.id);
      } else {
        CartUtils.addItem(productData, 1);
        window.dispatchEvent(new Event("cartUpdated"));
      }
      
      setIsLoading(false);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    } catch (error) {
      setIsLoading(false);
      
      if (error?.status === 401 || error?.data?.status === 401) {
        setUnauthorizedAction('add items to cart');
        setShowUnauthorizedModal(true);
        setIsAuthenticated(false);
      } else {
        toast.error(t('oCart') || 'Error adding to cart');
        console.error('Add to cart error:', error);
      }
    }
  };

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavoriteState = !localFavorite;
    setLocalFavorite(newFavoriteState);
    
    try {
      await toggleFavorite({ productId: product.id }).unwrap();
    } catch (err) {
      setLocalFavorite(!newFavoriteState);
      
      if (err?.status === 401 || err?.data?.status === 401) {
        setUnauthorizedAction('add items to favorites');
        setShowUnauthorizedModal(true);
      } else {
        toast.error('Failed to update favorites');
        console.error('Toggle favorite error:', err);
      }
    }
  };

  const renderButton = () => {
    if (isLoading) {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed flex justify-center items-center text-sm lg:text-md bg-indigo-400 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {t('adding')}
        </button>
      );
    }
    
    if (showSuccess) {
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
        onClick={(e) => onAddToCart(e, product)}
        className="w-full cursor-pointer flex justify-center items-center text-sm lg:text-md bg-indigo-500 hover:bg-indigo-600 text-white py-2 px-4 rounded-md font-medium transition-colors duration-200"
      >
        {t('addToCart')}
      </button>
    );
  };

  // ============= RENDER SPECIAL DEAL CARD =============
  if (deal) {
    return (
      <Link to={`/details/${product.id}`} className='bg-white p-1 border border-gray-300 cursor-pointer rounded-lg relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 flex flex-col justify-between'>
        <img 
          className='w-full rounded-lg p-3 aspect-square object-contain' 
          src={`https://ecommerce100-001-site1.ntempurl.com${url || ''}`} 
          alt={product.name || 'Product'}
          onError={(e) => {
            e.target.src = '/Icons/logo.svg';
          }}
        />
        <div className='font-semibold p-2 inter flex flex-col justify-between h-full'>
          <div className="flex flex-nowrap gap-2 items-center overflow-hidden">
            <h1 className="line-through truncate">{product.originalPrice} AZN</h1>
            <h1 className="text-[#FF4B43] truncate">{product.currentPrice} AZN</h1>
          </div>

          <p className='font-medium mb-3 whitespace-normal'>{translatedProductName}</p>
          <p className='text-gray-600 font-normal whitespace-normal [@media(min-width:450px)]:break-words line-clamp-3'>{translatedProductDescription}</p>
        </div>
        <div className='absolute top-2 left-2 lg:top-3 lg:right-3 p-6 w-0 h-0 flex justify-center items-center rounded-[50%] bg-[#FF4B43] text-white inter'>
          <p className='text-xs text-center font-semibold lg:text-sm'>{product.discountPercentage}%</p>
        </div>
        <div className="flex gap-3 p-2">
          {renderButton()}
      
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="p-3 group rounded-lg absolute right-3 top-3 border border-[#DEE2E7] cursor-pointer shadow-sm transition-colors disabled:opacity-50 bg-white"
          >
            <Heart
              className={`
                w-4 h-4 lg:w-5 lg:h-5 transition-colors
                ${localFavorite ? 'fill-indigo-500 text-indigo-500' : 'text-gray-400'}
                group-hover:fill-indigo-500 group-hover:text-indigo-500
              `}
            />
          </button>
        </div>
      </Link>
    );
  }
  
  // ============= RENDER REGULAR PRODUCT CARD =============
  return (
    <>
      <UnauthorizedModal
        isOpen={showUnauthorizedModal} 
        onClose={() => setShowUnauthorizedModal(false)}
        action={unauthorizedAction}
      />
      
      <Link
        to={`/details/${product.id}`}
        className="bg-white p-1 border border-gray-300 cursor-pointer rounded-lg relative transition-all duration-300 hover:shadow-lg hover:-translate-y-1 hover:border-gray-400 flex flex-col justify-between"
      >
        <img
          className="w-full rounded-lg p-3 aspect-square object-contain"
          src={`https://ecommerce100-001-site1.ntempurl.com${url || ''}`}
          alt={product.name || 'Product'}
          onError={(e) => {
            e.target.src = '/Icons/logo.svg';
          }}
        />
        <div className="font-semibold p-2 inter">
          <h1 className="text-lg">{product.currentPrice} AZN</h1>
          <p className="font-medium whitespace-normal mb-3">{translatedProductName}</p>
          <p className="text-gray-600 font-normal whitespace-normal [@media(min-width:450px)]:break-words line-clamp-3">
            {translatedProductDescription}
          </p>
        </div>
        <div className="flex gap-3 p-2">
          {renderButton()}
      
          <button
            onClick={handleFavoriteClick}
            disabled={isTogglingFavorite}
            className="p-2 group rounded-lg absolute right-3 top-3 border border-[#DEE2E7] cursor-pointer shadow-sm transition-colors disabled:opacity-50 bg-white"
          >
            <Heart
              className={`
                w-4 h-4 lg:w-5 lg:h-5 transition-colors
                ${localFavorite ? 'fill-indigo-500 text-indigo-500' : 'text-gray-400'}
                group-hover:fill-indigo-500 group-hover:text-indigo-500
              `}
            />
          </button>
        </div>
      </Link>
    </>
  );
};

export default HomePageUI;