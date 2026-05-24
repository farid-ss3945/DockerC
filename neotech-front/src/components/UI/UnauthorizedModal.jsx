import { LogIn, UserPlus } from 'lucide-react';
import React from 'react'
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';

const UnauthorizedModal = ({ isOpen, onClose, action }) => {
  const navigate = useNavigate();
  const {t} = useTranslation()
  
  if (!isOpen) return null;
  
  return (
    <div 
      className={`fixed inset-0 bg-white/30 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={onClose}
    >
      <div 
        className={`bg-white rounded-lg max-w-md w-full p-6 shadow-xl transform transition-all duration-300 ${
          isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <LogIn className="h-6 w-6 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t('signInRequired')}
          </h3>
          <p className="text-sm whitespace-normal text-gray-600 mb-6">
            {t('signInRequiredMessage')}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/login')}
              className="flex-1 bg-indigo-500  hover:bg-indigo-600 text-white py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              {t('signIn')}
            </button>
            <button
              onClick={() => navigate('/register')}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              {t('signUp')}
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t('continueBrowsing')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedModal
