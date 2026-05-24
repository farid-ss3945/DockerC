import { X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';

// Helper function to get cookie value
const getCookie = (name) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
};

const Burger = ({ burgerV, setBurgerV }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(() => {
    const savedLang = getCookie('language');
    return savedLang || i18next.language || 'ru';
  });
  const dropdownRef = useRef(null);

  const languages = [
    {
      name: "Русский",
      value: "ru",
      flag: "./Icons/ru-flag.svg"
    },
    {
      name: "English",
      value: "en",
      flag: "./Icons/usa-flag.svg"
    },
    {
      name: "Azerbaijani",
      value: "az",
      flag: "./Icons/az-flag.svg"
    }
  ];

  useEffect(() => {
    if (burgerV) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => (document.body.style.overflow = "auto");
  }, [burgerV]);

  // Sync with i18next language changes
  useEffect(() => {
    const handleLanguageChange = (lng) => {
      setSelected(lng);
    };

    i18next.on('languageChanged', handleLanguageChange);
    
    return () => {
      i18next.off('languageChanged', handleLanguageChange);
    };
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

  const handleLanguageChange = (langValue) => {
    setSelected(langValue);
    i18next.changeLanguage(langValue);
    document.cookie = `language=${langValue}; path=/; max-age=31536000`;
    setOpen(false);
  };

  const isLogged = document.cookie;
  const currentLanguage = languages.find(lang => lang.value === selected) || languages[0];

  if (burgerV) {
    return (
      <section className='overflow-x-hidden'>
        <div className='w-screen h-screen bg-white fixed left-0 top-0 z-[1000] flex flex-col'>
          <div className='flex items-center justify-between p-6 border-b border-gray-100'>
            <div className="font-bold text-2xl tracking-tighter text-gray-900">
              Neo<span className="text-[#4F46E5]">Tech</span>
            </div>
            <button onClick={() => setBurgerV(false)} className='p-2 hover:bg-gray-100 rounded-full transition-colors'>
              <X size={24} className='text-gray-600' />
            </button>
          </div>

          {/* Navigation items */}
          <nav className='flex-1 py-8 px-6'>
            <ul className='space-y-6'>
              <li>
                <Link
                  to='/products'
                  onClick={() => setBurgerV(false)}
                  className='block text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors py-4 border-b border-gray-200'
                >
                  {t('products')}
                </Link>
              </li>
              <li>
                <Link
                  to='/brands'
                  onClick={() => setBurgerV(false)}
                  className='block text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors py-4 border-b border-gray-200'
                >
                  {t('brands')}
                </Link>
              </li>
              <li>
                <Link
                  to='/download'
                  onClick={() => setBurgerV(false)}
                  className='block text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors py-4 border-b border-gray-200'
                >
                  {t('menu.download')}
                </Link>
              </li>
              
              {!isLogged && (
                <li>
                  <Link
                    to='/login'
                    onClick={() => setBurgerV(false)}
                    className='block text-xl font-medium text-gray-800 hover:text-blue-600 transition-colors py-4 border-b border-gray-200'
                  >
                    {t('menu.login')}
                  </Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Language Selector - Bottom Left */}
          <div className='p-6 mb-10 border-t border-gray-200'>
            <div className='relative' ref={dropdownRef}>
              <div
                onClick={() => setOpen(prev => !prev)}
                className='flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-3 rounded-lg transition-colors'
              >
                <img 
                  src={currentLanguage.flag} 
                  alt={currentLanguage.name} 
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span className="text-gray-700 font-medium text-base flex-1">
                  {currentLanguage.name}
                </span>
                <svg 
                  className={`w-5 h-5 text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>

              {open && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                  {languages.map((language) => (
                    <div
                      key={language.value}
                      onClick={() => handleLanguageChange(language.value)}
                      className={`flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                        selected === language.value ? 'bg-blue-50' : ''
                      }`}
                    >
                      <img 
                        src={language.flag} 
                        alt={language.name} 
                        className="w-6 h-4 object-cover rounded-sm"
                      />
                      <span className={`text-base ${
                        selected === language.value ? 'font-semibold text-blue-600' : 'text-gray-700'
                      }`}>
                        {language.name}
                      </span>
                      {selected === language.value && (
                        <svg className="w-5 h-5 text-blue-600 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }
};

export default Burger;
