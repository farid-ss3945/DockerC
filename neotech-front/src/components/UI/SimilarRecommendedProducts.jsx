import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Heart, Loader2, Check, LogIn, UserPlus } from 'lucide-react';
import { useToggleFavoriteMutation, useGetFavoriteStatusQuery, useAddCartItemMutation } from '../../store/API';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router';
import CartUtils from './CartUtils';
import AuthUtils from './AuthUtils';
import UnauthorizedModal from './UnauthorizedModal';
import { useTranslation } from 'react-i18next';

// Skeleton Loading Components
const SkeletonProductCard = ({ isMobile = false }) => {
  if (isMobile) {
    return (
      <div className="flex flex-col min-w-[70%] p-3 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)] animate-pulse">
        <div className="h-32 w-full bg-gray-200 rounded mb-3"></div>
        <div className="flex-1 flex flex-col space-y-2">
          <div className="h-3 bg-gray-200 rounded w-full"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="flex gap-2 mt-3">
          <div className="flex-1 h-8 bg-gray-200 rounded"></div>
          <div className="w-9 h-8 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200 min-w-[200px] flex-shrink-0 space-y-3 animate-pulse">
      <div className="py-4">
        <div className="h-48 bg-gray-200 rounded-lg mx-10"></div>
      </div>
      
      <div className="flex justify-between">
        <div className="space-y-2 flex-1">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-5 bg-gray-200 rounded w-16"></div>
        </div>
        <div className="w-9 h-9 bg-gray-200 rounded-lg"></div>
      </div>
      
      <div className="w-full h-9 bg-gray-200 rounded-lg"></div>
    </div>
  );
};



// Desktop Product Card
const ProductCard = ({ product, isAddingToCart, loadingProductId, showSuccess, onAddToCart, onUnauthorized }) => {
  const {t} = useTranslation()

  
  const { data: favoriteStatus } = useGetFavoriteStatusQuery({ productId: product.id });
  const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();
  const [localFavorite, setLocalFavorite] = useState(false);

  React.useEffect(() => {
    if (favoriteStatus) {
      setLocalFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavoriteState = !localFavorite;
    setLocalFavorite(newFavoriteState);
    
    try {
      await toggleFavorite({ productId: product.id }).unwrap();
    } catch (err) {
      setLocalFavorite(!newFavoriteState);
      
      // Check for 401 Unauthorized error
      if (err?.status === 401 || err?.originalStatus === 401) {
        onUnauthorized('add items to favorites');
      } else {
        toast.error('Failed to update favorites');
        console.error('Toggle favorite error:', err);
      }
    }
  };

  const renderButton = () => {
    const isThisProductLoading = isAddingToCart && loadingProductId === product.id;
    
    if (isThisProductLoading) {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed flex justify-center items-center text-sm bg-indigo-400 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Adding...
        </button>
      );
    }
    
    if (showSuccess === product.id) {
      return (
        <button
          disabled
          className="w-full cursor-default flex justify-center items-center text-sm bg-green-500 text-white py-2 px-4 rounded-lg font-medium transition-colors duration-200"
        >
          <Check className="w-4 h-4 mr-2" />
          Added
        </button>
      );
    }

    return (
      <button
        onClick={(e) => onAddToCart(e, product)}
        className="w-full cursor-pointer flex justify-center items-center text-sm bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg font-medium transition-colors duration-200"
      >
        {t('addToCart')}
      </button>
    );
  };

  return (
    <Link to={`/details/${product?.id}`} className="bg-white rounded-lg p-4 border cursor-pointer border-[#DEE2E6] min-w-[200px] flex-shrink-0 space-y-3">
      <div className="py-4">
        <img 
          src={`https://ecommerce100-001-site1.ntempurl.com${product.primaryImageUrl}`} 
          alt={product.name}
          className="h-48 object-contain max-w-[300px] mx-10 rounded-lg" 
          onError={(e) => {
            e.target.src = "/Icons/logo.svg";
          }}
        />
      </div>
      
      <div className='flex justify-between'>
        <div>
          <h3 className="font-medium text-gray-700 mb-1">
            {product.name && product.name.charAt(0).toUpperCase() + product.name.slice(1)}
          </h3>
          <p className="text-lg font-semibold text-gray-900">{product.currentPrice} AZN</p>
        </div>
        <button 
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className="top-2 right-2 self-start cursor-pointer p-2 border border-[#DEE2E6] bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Heart 
            className={`w-5 h-5 transition-colors ${
              localFavorite ? 'fill-indigo-500 text-indigo-500' : 'text-indigo-400'
            }`}
          />
        </button>
      </div>
      
      {renderButton()}
    </Link>
  );
};

// Mobile Product Card
const MobileProductCard = ({ product, isAddingToCart, loadingProductId, showSuccess, onAddToCart, onUnauthorized }) => {
  const {t} = useTranslation()
  const { data: favoriteStatus } = useGetFavoriteStatusQuery({ productId: product.id });
  const [toggleFavorite, { isLoading: isTogglingFavorite }] = useToggleFavoriteMutation();
  const [localFavorite, setLocalFavorite] = useState(false);

  React.useEffect(() => {
    if (favoriteStatus) {
      setLocalFavorite(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  const handleFavoriteClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const newFavoriteState = !localFavorite;
    setLocalFavorite(newFavoriteState);
    
    try {
      await toggleFavorite({ productId: product.id }).unwrap();
    } catch (err) {
      setLocalFavorite(!newFavoriteState);
      
      // Check for 401 Unauthorized error
      if (err?.status === 401 || err?.originalStatus === 401) {
        onUnauthorized('add items to favorites');
      } else {
        toast.error('Failed to update favorites');
        console.error('Toggle favorite error:', err);
      }
    }
  };

  const renderButton = () => {
    const isThisProductLoading = isAddingToCart && loadingProductId === product.id;
    
    if (isThisProductLoading) {
      return (
        <button
          disabled
          className="w-full cursor-not-allowed flex justify-center items-center text-xs bg-indigo-400 text-white py-1.5 px-3 rounded-md font-medium transition-colors duration-200"
        >
          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          Adding...
        </button>
      );
    }
    
    if (showSuccess === product.id) {
      return (
        <button
          disabled
          className="w-full cursor-default flex justify-center items-center text-xs bg-green-500 text-white py-1.5 px-3 rounded-md font-medium transition-colors duration-200"
        >
          <Check className="w-3 h-3 mr-1" />
          Added
        </button>
      );
    }

    return (
      <button
        onClick={(e) => onAddToCart(e, product)}
        className="w-full cursor-pointer flex justify-center items-center text-xs bg-indigo-500 hover:bg-indigo-600 text-white py-1.5 px-3 rounded-md font-medium transition-colors duration-200"
      >
       {t('addToCart')}
      </button>
    );
  };

  return (
    <Link to={`/details/${product?.id}`} className="flex flex-col min-w-[70%] p-3 bg-white rounded-lg shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]">
      <div className="w-full h-32 mb-3">
        <img
          src={`https://ecommerce100-001-site1.ntempurl.com${product.primaryImageUrl}`}
          alt={product.name}
          className="w-full h-full max-w-[300px] object-contain"
          onError={(e) => {
            e.target.src = "/Icons/logo.svg";
          }}
        />
      </div>
      <div className="flex-1 flex flex-col space-y-1.5">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</h3>
        <p className="text-indigo-500 font-semibold text-sm">{product.currentPrice} AZN</p>
      </div>
      <div className="flex gap-2 mt-3">
        {renderButton()}
        <button
          onClick={handleFavoriteClick}
          disabled={isTogglingFavorite}
          className="p-2 border border-[#DEE2E6] rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              localFavorite ? 'fill-indigo-500 text-indigo-500' : 'text-indigo-400'
            }`}
          />
        </button>
      </div>
    </Link>
  );
};

// Main Component
const SimilarProducts = ({ products, isLoading }) => {
  const scrollContainerRef = useRef(null);
  const [loadingProductId, setLoadingProductId] = useState(null);
  const [showSuccess, setShowSuccess] = useState(null);
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);
  const [unauthorizedAction, setUnauthorizedAction] = useState('');
  const [addCartItem, { isLoading: isAddingToCart }] = useAddCartItemMutation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const {t} = useTranslation()
  useEffect(() => {
    setIsAuthenticated(AuthUtils.isAuthenticated());
  }, []);

  const onAddToCart = async (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id
    
    setLoadingProductId(productId);
    
    try {
       if (isAuthenticated) {
          await addCartItem({ productId, quantity: 1 }).unwrap();

       } else {
         // Use localStorage for non-authenticated users
         CartUtils.addItem(product, 1);
         window.dispatchEvent(new Event("cartUpdated"));
       }
      setShowSuccess(productId);
      
      setTimeout(() => {
        setShowSuccess(null);
        setLoadingProductId(null);
      }, 2000);
    } catch (err) {
      setLoadingProductId(null);
      
      // Check for 401 Unauthorized error
      if (err?.status === 401 || err?.originalStatus === 401) {
        setUnauthorizedAction('add items to cart');
        setShowUnauthorizedModal(true);
      } else {
        toast.error('Failed to add item to cart');
        console.error('Add to cart error:', err);
      }
    }
  };

  const handleUnauthorized = (action) => {
    setUnauthorizedAction(action);
    setShowUnauthorizedModal(true);
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.offsetWidth * 0.8;
      
      if (direction === 'left') {
        container.scrollBy({
          left: -scrollAmount,
          behavior: 'smooth'
        });
      } else {
        container.scrollBy({
          left: scrollAmount,
          behavior: 'smooth'
        });
      }
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="md:hidden mt-4">
          <div className="px-4 py-4">
            <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
            <div className="overflow-x-scroll scrollbar-hide flex gap-3 rounded-lg p-3">
              {[...Array(2)].map((_, index) => (
                <SkeletonProductCard key={index} isMobile={true} />
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 hidden md:block">
          <div className="flex items-center justify-between mb-2">
            <div className="h-6 bg-gray-200 rounded w-36 animate-pulse"></div>
            <div className="flex space-x-2">
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="w-9 h-9 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          <div className="flex overflow-x-scroll gap-4 py-2">
            {[...Array(6)].map((_, index) => (
              <SkeletonProductCard key={index} />
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!products || products.length === 0) {
    return null;
  }

  return (
    <>
      <UnauthorizedModal
        isOpen={showUnauthorizedModal} 
        onClose={() => setShowUnauthorizedModal(false)}
        action={unauthorizedAction}
      />

      {/* Mobile View */}
      <div className="md:hidden mt-4">
        <div className="px-4 py-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('similarProd')}</h2>
          <div className="overflow-x-scroll scrollbar-hide flex gap-3 rounded-lg p-3">
            {products.map((product) => (
              <MobileProductCard 
                key={product.id}
                product={product}
                isAddingToCart={isAddingToCart}
                loadingProductId={loadingProductId}
                showSuccess={showSuccess}
                onAddToCart={onAddToCart}
                onUnauthorized={handleUnauthorized}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Desktop View */}
      <div className="mt-8 hidden md:block">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">{t('similarProd')}</h2>
          <div className="flex space-x-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 cursor-pointer hover:bg-red-100 hover:border-red-300 border border-gray-300 rounded-full"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600 hover:text-indigo-600" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="p-2 cursor-pointer hover:bg-red-100 hover:border-red-300 border border-gray-300 rounded-full"
            >
              <ChevronRight className="w-5 h-5 text-gray-600 hover:text-indigo-600" />
            </button>
          </div>
        </div>
        
        <div ref={scrollContainerRef} className="flex overflow-x-scroll gap-4 py-2">
          {products.map((product) => (
            <ProductCard 
              key={product.id}
              product={product}
              isAddingToCart={isAddingToCart}
              loadingProductId={loadingProductId}
              showSuccess={showSuccess}
              onAddToCart={onAddToCart}
              onUnauthorized={handleUnauthorized}
            />
          ))}
        </div>
      </div>
    </>
  );
};

export default SimilarProducts;

