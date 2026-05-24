import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import Burger from './Burger'
import { useGetCartCountQuery, useGetFavoritesCountQuery, useGetMeQuery, useSearchProductsQuery, useUpdateCartItemQuantityMutation } from "../../store/API";
import { Search, X } from 'lucide-react';
import { SearchContext } from '../../router/Context';
import { FaRegFile, FaRegUser, FaRegUserCircle, FaUserCircle } from 'react-icons/fa';
import { PiCarProfile } from 'react-icons/pi';
import i18next from 'i18next';
import { useTranslation } from 'react-i18next';
import SearchDropdown from '../UI/SearchDropdown'; // Import the new component
import UnauthorizedModal from '../UI/UnauthorizedModal';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Header = () => {
  const navigate = useNavigate();
  const [burgerVi, setBurgerVi] = useState(false);
  const [open, setOpen] = useState(false);
  
  // Initialize language from cookie or default to 'en'
  const [selected, setSelected] = useState(() => {
    const savedLang = getCookie('language');
    return savedLang || i18next.language || 'ru';
  });
  
  const { t } = useTranslation();
  const { searchOpen, setSearchOpen } = useContext(SearchContext);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const mobileSearchDropdownRef = useRef(null);
  const hasToken = document.cookie.split('; ').some(row => row.startsWith('token='));
  const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false)
  const [unauthorizedAction, setUnauthorizedAction] = useState('')

  const { data: cartCountData } = useGetCartCountQuery(undefined, {
    skip: !hasToken,
  });
  const { data: favoritesCount } = useGetFavoritesCountQuery(undefined, {
    skip: !hasToken,
  });
  
  const [cartCount, setCartCount] = useState(() => {
    const localCart = JSON.parse(localStorage.getItem("ecommerce_cart")) || { items: [] };
    return localCart.items.length;
  });
  
  // ✅ handle both cases safely
  useEffect(() => {
    if (hasToken && cartCountData !== undefined) {
      setCartCount(cartCountData);
    } else if (!hasToken) {
      const localCart = JSON.parse(localStorage.getItem("ecommerce_cart")) || { items: [] };
      setCartCount(localCart.items.length);
    }
  }, [hasToken, cartCountData]);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem("ecommerce_cart")) || { items: [] };
      setCartCount(cart.items.length);
    };

    // Listen for custom event
    window.addEventListener("cartUpdated", updateCartCount);

    // Also listen for cross-tab storage changes
    window.addEventListener("storage", updateCartCount);

    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
      window.removeEventListener("storage", updateCartCount);
    };
  }, []);
  
  const { data: me, isLoading: isMeLoading } = useGetMeQuery();


  
  const [searchWidth, setSearchWidth] = useState(0);
  const searchRef = useRef(null);

  useEffect(() => {
    if (searchRef.current) {
      setSearchWidth(searchRef.current.offsetWidth);
    }

    const handleResize = () => {
      if (searchRef.current) {
        setSearchWidth(searchRef.current.offsetWidth);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dropdownRefLang = useRef(null);

  const languages = [
    {
      name: "Русский",
      value: "ru"
    },
    {
      name: "English",
      value: "en"
    },
    {
      name: "Azerbaijani",
      value: "az"
    }
  ];

  const langName = {
    ru: "Русский",
    en: "English",
    az: "Azerbaijani"
  };

  // Initialize language on mount
  useEffect(() => {
    const savedLang = getCookie('language');
    if (savedLang && savedLang !== i18next.language) {
      i18next.changeLanguage(savedLang);
      setSelected(savedLang);
    }
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Handle language change
  useEffect(() => {
    i18next.changeLanguage(selected);
    // Store in cookie for persistence (1 year)
    document.cookie = `language=${selected}; path=/; max-age=31536000`;
  }, [selected]);

  const handleSelect = (language) => {
    setSelected(language);
    setOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchDropdownRef?.current && !searchDropdownRef?.current.contains(event.target)) {
        if (window.innerWidth > 1024) {
          setSearchOpen(false);
        }
      }
    }

    if (open || searchOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, searchOpen, setSearchOpen]);

  const { data: searchResult, isLoading: isSearching } = useSearchProductsQuery({ q: searchQuery }, {
    skip: !searchQuery || searchQuery.length < 2
  });

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchOpen(true);
  };

  const handleFavoriteClick = () => {
    setUnauthorizedAction('add items to Favorites');
    setShowUnauthorizedModal(true);
  }

  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchOpen(true);
  };

  const handleSearchFocus = () => {
    setSearchOpen(true);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim().length >= 2) {
      const query = searchQuery;
      setSearchOpen(false);
      setSearchQuery('');
      navigate(`/products?search=${query}`);
      window.location.reload()
    } else if (e.key === 'Escape') {
      handleClearSearch();
      e.target.blur();
    }
  };

  const handleProductClick = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    
    navigate(`/details/${productId}`);
    setTimeout(() => {
      setSearchOpen(false);
      setSearchQuery('');
    }, 100);
  };

  const handleCategoryClick = (catSlug, categoryName) => {
    navigate(`/products/${catSlug}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleViewAllClick = () => {
    const query = encodeURIComponent(searchQuery);
    navigate(`/products?search=${query}`);
    setSearchOpen(false);
    setSearchQuery('');
  };

  const handleBrandClick = (brandSlug, brandName) => {
    navigate(`/products/brand/${brandSlug}`);
    setSearchOpen(false);
    setSearchQuery('');
    
    setTimeout(() => {
      navigate(`/products?search=${query}`);
    }, 0);
  };

  return (
    <header className='pt-[59px] lg:pt-[84px]'>
      <UnauthorizedModal 
        isOpen={showUnauthorizedModal} 
        onClose={() => setShowUnauthorizedModal(false)}
        action={unauthorizedAction}
      />
      <Burger burgerV={burgerVi} setBurgerV={setBurgerVi}/>
      <nav className=''>
        <div className='flex justify-between lg:justify-around fixed top-0 z-50 bg-white/80 backdrop-blur-md w-full lg:items-center p-3 px-6 items-center'>
          <Link to='/' className='flex lg:flex-1 cursor-pointer lg:justify-center items-center gap-2'>
            <span className="font-bold text-3xl tracking-tighter text-gray-900">Neo<span className="text-[#4F46E5]">Tech</span></span>
          </Link>

          {/* Desktop Search */}
          <div className='hidden lg:flex-4 mr-20 lg:mr-0 lg:px-10 lg:block relative' ref={searchDropdownRef}>
            <div className=" self-center mx-auto">
              <div ref={searchRef} className="flex pl-2 rounded-lg items-center overflow-hidden shadow-sm hover:shadow-md border-1 border-[#dee2e6] bg-white">
                <Search className='p-[3px]'/>
                <input
                  type="text"
                  placeholder={t("searchProducts")}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={handleSearchFocus}
                  onKeyDown={handleKeyDown}
                  className="flex-1 py-2 px-3 w-full text-base border-none outline-none placeholder-gray-400"
                />
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="flex items-center pr-3 hover:opacity-70 transition-opacity"
                  >
                    <X className="w-5 h-5 text-gray-400" />
                  </button>
                )}
              </div>

              {/* Desktop Search Dropdown */}
              {searchOpen && (
                <div 
                  style={{ width: searchWidth }} 
                  className="search-results-container absolute top-full mt-2 bg-white border border-[#dee2e6] rounded-lg shadow-lg z-50 overflow-hidden max-w-[95vw]"
                >
                  <SearchDropdown
                    searchQuery={searchQuery}
                    searchResult={searchResult}
                    isSearching={isSearching}
                    onClose={() => setSearchOpen(false)}
                    onProductClick={handleProductClick}
                    onCategoryClick={handleCategoryClick}
                    onBrandClick={handleBrandClick}
                    onViewAllProducts={handleViewAllClick}
                    t={t}
                    width={searchWidth}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Profile / Favorites / Cart */}
          <div className='flex gap-5 items-start lg:gap-5 lg:flex-1 '>
            <div className='lg:hidden relative' ref={mobileSearchDropdownRef}>
              <button 
                className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
              >
              </button>
            </div>

            <div
              onClick={() => {hasToken ? navigate('/favorites') : handleFavoriteClick()}}
              className='flex flex-col items-center justify-center cursor-pointer hover:opacity-80 transition-opacity duration-200 relative'
            >
              <div className="relative">
                <img className='w-7' src="/Icons/favorites.svg" alt="Favorites" />
                {favoritesCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#4F46E5] text-white text-[10px] 
                                   rounded-full min-w-[18px] h-[18px] flex items-center justify-center 
                                   font-semibold px-1">
                    {favoritesCount > 99 ? '99+' : favoritesCount}
                  </span>
                )}
              </div>
              <p className='text-gray-500 text-md hidden lg:block whitespace-nowrap'>
                {t('favorites')}
              </p>
            </div>

            <Link
              to={'/cart'}
              className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 relative'
            >
              <div className="relative">
                <img className='w-7' src="/Icons/cart.svg" alt="Cart" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-[#4F46E5] text-white text-[10px] 
                                   rounded-full min-w-[18px] h-[18px] flex items-center justify-center 
                                   font-semibold px-1">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </div>
              <p className='text-gray-500 text-md hidden lg:block whitespace-nowrap'>
                {t('myCart')}
              </p>
            </Link>
            
            <Link
              to={hasToken ? "/profile" : "/login"}
              className='flex flex-col items-center cursor-pointer hover:opacity-80 transition-opacity duration-200'
            >
              {isMeLoading ? (
                <div className='flex flex-col items-center gap-1'>
                  <div className='w-7 h-7 rounded-full bg-gray-200 animate-pulse'></div>
                  <div className='w-16 h-3 bg-gray-200 rounded hidden lg:block animate-pulse'></div>
                </div>
              ) : hasToken ? (
                <div className='flex flex-col items-center gap-1'>
                  <FaUserCircle color='#64748b' size={28} />
                  <p className='text-gray-600 text-sm font-medium hidden lg:block whitespace-nowrap max-w-[100px] truncate'>
                    {me?.fullName}
                  </p>
                </div>
              ) : (
                <>
                  <img className='w-7' src="/Icons/profile.svg" alt="Profile" />
                  <p className='text-gray-500 hidden lg:block text-md whitespace-nowrap'>
                    {t('login')}
                  </p>
                </>
              )}
            </Link>

            <img
              onClick={() => setBurgerVi(true)}
              className='md:hidden cursor-pointer'
              src="/Icons/burger.svg"
              alt="Menu"
            />
          </div>
        </div>
      </nav>

      {/* Bottom Menu */}
      <div className="hidden md:block w-full bg-white border-gray-200 px-2 py-4">
        <div className="flex items-center justify-between max-w-[85vw] mx-auto">
          <div className="flex items-center space-x-8">
            {/* Navigation Links */}
            <nav className="flex items-center space-x-6 lg:space-x-8">
              <Link to='/products' className="text-gray-700 inter text-sm lg:text-base hover:text-gray-900 transition-colors duration-200">
                {t('products')}
              </Link>

              <Link to='/brands' className="text-gray-700 inter text-sm lg:text-base hover:text-gray-900 transition-colors duration-200">
                {t('brands')}
              </Link>
                          
              <Link to='/download' className="text-gray-700 inter text-sm lg:text-base hover:text-gray-900 transition-colors duration-200">
                {t('downloadPage')}
              </Link>

              
            </nav>
          </div>

          {/* Language & Phone */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center justify-center p-2">
              <div className="relative" ref={dropdownRef}>
                <div
                  onClick={() => setOpen(prev => !prev)}
                  className="flex items-center space-x-1 cursor-pointer hover:opacity-80 transition-opacity duration-200"
                >
                  <span className="text-gray-700 inter text-sm lg:text-base">{langName[selected]}</span>
                  <svg 
                    className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>

                {open && (
                  <div className="absolute top-full mt-1 right-0 bg-white border-[1px] border-black rounded-sm py-1 whitespace-nowrap z-10 shadow-lg">
                    {languages.map((language) => (
                      <div
                        key={language.value}
                        onClick={() => handleSelect(language.value)}
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-100 transition-colors duration-150 text-sm lg:text-base ${
                          selected === language.value ? 'bg-gray-50 font-medium' : ''
                        }`}
                      >
                        {language.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="items-center space-x-2 cursor-pointer [@media(max-width:870px)]:hidden flex hover:opacity-80 transition-opacity duration-200">
              <img src="/Icons/phone.svg" alt="phone" className="w-4 h-4" />
              <span className="text-gray-700 inter text-sm lg:text-base">
                +994702971707
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
