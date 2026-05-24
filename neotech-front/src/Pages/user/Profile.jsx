import React, { useState, useEffect } from 'react'
import SearchUI from '../../components/UI/SearchUI'
import { Breadcrumb } from '../../products/Breadcrumb'
import { useChangePasswordMutation, useGetMeQuery, useLogoutMutation } from '../../store/API'
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';
import { LogIn } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

const Profile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data: me, isLoading: isUserLoading, error: userError } = useGetMeQuery();
  const [changePass, { isLoading: isPasswordLoading, error: passwordError }] = useChangePasswordMutation(); 
  const [logout, { isLoading: isLogoutLoading }] = useLogoutMutation();
  
  const [data, setData] = useState({
    name: '',
    lastName: '',
    email: '',
    password: ''
  });

  const roleNames = {
    0: 'Admin Role',
    1: t('profile.normalUser'),
    2: t('profile.retail'),
    3: t('profile.wholesale'),
    4: t('profile.vip')
  };

  const getRoleName = (roleId) => {
    return roleNames[roleId] || t('profile.unknownRole');
  };
  
  const [newPass, setNewPass] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Logout confirmation modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Track initial state for comparison
  const [initialData, setInitialData] = useState({});
  const [initialPassword, setInitialPassword] = useState('');

  // Animation state
  const [isVisible, setIsVisible] = useState(false);

  // Set initial data when fetched
  useEffect(() => {
    if (me) {
      const userData = {
        name: me.firstName || '',
        lastName: me.lastName || '',
        email: me.email || '',
        password: ''
      };
      setData(userData);
      setInitialData(userData);
      setInitialPassword('');
      setNewPass('');
    }
  }, [me]);

  // Trigger animations on mount
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Compare data to initial state
  const detailsChanged = 
    data.name !== initialData.name ||
    data.lastName !== initialData.lastName ||
    data.email !== initialData.email;

  const passwordChanged = data.password !== initialPassword || newPass !== '';

  // Password validation (computed values, no side effects)
  const getPasswordError = () => {
    if (!data.password && !newPass) return '';
    
    if (data.password && newPass && data.password === newPass) {
      return t('profile.passwordValidationError');
    }
    
    return '';
  };

  const passwordValidationError = getPasswordError();
  const hasPasswordError = passwordValidationError !== '';

  // Toggle password visibility functions
  const toggleCurrentPasswordVisibility = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };

  const toggleNewPasswordVisibility = () => {
    setShowNewPassword(!showNewPassword);
  };

  // Get API error message
  const getApiErrorMessage = (error) => {
    if (error?.status === 401) {
      return t('profile.unauthorizedMessage');
    }
    if (error?.data?.message) {
      return error.data.message;
    }
    if (error?.message) {
      return error.message;
    }
    return t('profile.errorOccurred');
  };

  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setInitialData({ ...data, password: '' });
      setSuccessMessage(t('profile.profileUpdatedSuccess'));
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    // Check for validation errors before submission
    if (hasPasswordError) {
      return;
    }

    try {
      const passwordData = {
        currentPass: data.password,
        newPass: newPass,
        confirmNewPassword: newPass
      };

      await changePass(passwordData).unwrap();
      
      setInitialPassword('');
      setData({ ...data, password: '' });
      setNewPass('');
      setSuccessMessage(t('profile.passwordChangedSuccess'));
      
      // Hide passwords after successful change
      setShowCurrentPassword(false);
      setShowNewPassword(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };
  const handleLogout = async () => {
    try {
      await logout().unwrap();
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      toast.success(t('profile.loggedOutSuccess'));
      navigate('/login'); 
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error(t('profile.logoutFailed'));
    }

  };

  // Loading state for initial user data
  if (isUserLoading) {
    return (
      <section className='bg-[#f7fafc] inter pb-22'>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FD1206]"></div>
        </div>
      </section>
    );
  }

  // Error state for user data
  if (userError) {
    return (
      <section className='bg-[#f7fafc] inter pb-22'>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="bg-red-50 border border-red-300 text-indigo-700 px-4 py-3 rounded-lg max-w-md">
            <div className='flex items-center'>
              <svg className='w-5 h-5 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
              </svg>
              <span className='font-medium'>{getApiErrorMessage(userError)}</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className='bg-[#f7fafc] inter pb-22'>
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.5s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slideInRight 0.5s ease-out forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.4s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .role-badge {
          transition: all 0.3s ease;
        }

        .input-focus {
          transition: all 0.3s ease;
        }

        .input-focus:focus {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(253, 18, 6, 0.1);
        }

        .button-hover {
          transition: all 0.3s ease;
        }

        .button-hover:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(253, 18, 6, 0.3);
        }

        .card-hover {
          transition: all 0.3s ease;
        }

        .card-hover:hover {
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
        }
      `}</style>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 animate-scale-in">
            <div className="flex items-center mb-4">
              <svg className="w-6 h-6 text-[#FD1206] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <h3 className="text-xl font-semibold">{t('profile.confirmLogout')}</h3>
            </div>
            <p className="text-gray-600 mb-6">{t('profile.logoutMessage')}</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                disabled={isLogoutLoading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {t('profile.cancel')}
              </button>
              <button
                onClick={handleLogout}
                disabled={isLogoutLoading}
                className="flex-1 px-4 py-2 bg-[#FD1206] text-white rounded-lg hover:bg-[#e01105] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLogoutLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('profile.loggingOut')}
                  </>
                ) : (
                  t('profile.logout')
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="lg:hidden px-4 pl-7 py-4 border-y bg-white lg:border-transparent border-[#dee2e6]">
        <div className="mb-4 lg:hidden">
          <SearchUI />
        </div>
        <Breadcrumb />
      </div>

      <div className={`p-4 pl-7 pb-7 md:max-w-[80vw] md:mx-auto md:px-0 text-xl md:text-2xl font-semibold lg:bg-transparent border-b md:border-0 border-[#dee2e6] ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        <div className='hidden lg:block'>
          <Breadcrumb />
        </div>
        <div className='flex items-center justify-between mt-4'>
          <div className='flex items-center gap-3'>
            <h1 className=''>{t('profile.profile')}</h1>
            <div className='px-4 py-2 rounded-xl bg-[#FFBBB8]'>
              <h3 className='text-base font-semibold text-black'>{getRoleName(me?.role)}</h3>
            </div>
          </div>
          <div className='flex gap-3'>
           

            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#FD1206] border border-[#FD1206] rounded-lg hover:bg-[#FD1206] hover:text-white transition-all duration-300 button-hover"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">{t('profile.logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="md:max-w-[80vw] md:mx-auto px-4 pt-4 animate-scale-in">
          <div className='bg-green-50 border border-green-300 text-green-700 px-4 py-3 rounded-lg shadow-lg'>
            <div className='flex items-center'>
              <svg className='w-4 h-4 mr-2 flex-shrink-0 animate-pulse-slow' fill='currentColor' viewBox='0 0 20 20'>
                <path fillRule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clipRule='evenodd' />
              </svg>
              <span className='text-sm font-medium'>{successMessage}</span>
            </div>
          </div>
        </div>
      )}

      <div className='bg-white md:max-w-[80vw] md:mx-auto'>
        {/* My details */}
        <div className={`bg-white p-6 pt-7 card-hover rounded-lg ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
          <h1 className='font-semibold text-2xl'>{t('profile.myDetails')}</h1>
          <h1 className='mt-9 mb-2 font-semibold text-lg hidden md:block'>{t('profile.personalInformation')}</h1>
          <hr className='mb-10 hidden md:block'/>

          <div className='flex justify-between md:gap-14'>
            <div className='hidden md:block animate-slide-in-right' style={{ animationDelay: '0.2s' }}>
              <p className='max-w-[250px] text-[#878787]'>
                {t('profile.personalInfoDesc')}
              </p>
            </div>

            <form
              onSubmit={handleDetailsSubmit}
              className='md:grid w-full md:w-[480px] md:grid-cols-2 md:gap-x-5'
            >
              <div className='flex flex-col mt-5 md:mt-0'>
                <span className='font-semibold'>{t('profile.firstName')}</span>
                <input
                  type='text'
                  required
                  disabled={isUserLoading}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className='bg-[#fbfbfb] py-2 mt-2 rounded-lg border border-[#DEE2E6] pl-4 w-full disabled:opacity-50 disabled:cursor-not-allowed input-focus'
                  value={data.name}
                />
              </div>

              <div className='flex flex-col mt-5 md:mt-0'>
                <span className='font-semibold'>{t('profile.lastName')}</span>
                <input
                  type='text'
                  required
                  disabled={isUserLoading}
                  onChange={(e) => setData({ ...data, lastName: e.target.value })}
                  className='bg-[#fbfbfb] py-2 mt-2 rounded-lg border border-[#DEE2E6] pl-4 w-full disabled:opacity-50 disabled:cursor-not-allowed input-focus'
                  value={data.lastName}
                />
              </div>

              <div className='flex flex-col col-span-2 mt-5'>
                <span className='font-semibold'>{t('profile.email')}</span>
                <input
                  type='email'
                  required
                  disabled={isUserLoading}
                  onChange={(e) => setData({ ...data, email: e.target.value })}
                  className='bg-[#fbfbfb] py-2 mt-2 rounded-lg border border-[#DEE2E6] pl-4 w-full disabled:opacity-50 disabled:cursor-not-allowed input-focus'
                  value={data.email}
                />
              </div>

              <button
                type="submit"
                disabled={!detailsChanged || isUserLoading}
                style={{
                  backgroundColor: (detailsChanged && !isUserLoading) ? '#FD1206' : '#DDDDDD',
                  cursor: (detailsChanged && !isUserLoading) ? 'pointer' : 'not-allowed'
                }}
                className='col-span-2 py-2 my-7 rounded-lg border border-[#DEE2E6] w-full text-white flex items-center justify-center button-hover'
              >
                {isUserLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('profile.saving')}
                  </>
                ) : (
                  t('profile.save')
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Password section */}
        <div className={`bg-white p-6 pt-7 mt-10 card-hover rounded-lg ${isVisible ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
          <h1 className='mt-9 mb-2 font-semibold text-lg hidden md:block'>{t('profile.password')}</h1>
          <hr className='mb-10 hidden md:block'/>

          <div className='flex md:justify-between md:gap-14'>
            <div className='hidden md:block animate-slide-in-right' style={{ animationDelay: '0.4s' }}>
              <p className='max-w-[250px] text-[#878787]'>
                {t('profile.passwordDesc')}
              </p>
            </div>

            <form
              onSubmit={handlePasswordSubmit}
              className='md:grid w-full md:w-[480px] md:grid-cols-2 md:gap-x-5'
            >
              <div className='flex flex-col col-span-2 mt-5 md:mt-0'>
                <span className='font-semibold'>{t('profile.currentPassword')}</span>
                <div className='relative'>
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    disabled={isPasswordLoading}
                    onChange={(e) => setData({ ...data, password: e.target.value })}
                    className={`bg-[#fbfbfb] py-2 mt-2 rounded-lg border pl-4 pr-12 w-full disabled:opacity-50 disabled:cursor-not-allowed input-focus ${
                      hasPasswordError && data.password ? 'border-indigo-500' : 'border-[#DEE2E6]'
                    }`}
                    value={data.password}
                  />
                  <button
                    type="button"
                    onClick={toggleCurrentPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    {showCurrentPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className='flex flex-col col-span-2 mt-5'>
                <span className='font-semibold'>{t('profile.newPassword')}</span>
                <div className='relative'>
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    disabled={isPasswordLoading}
                    onChange={(e) => setNewPass(e.target.value)}
                    className={`bg-[#fbfbfb] py-2 mt-2 rounded-lg border pl-4 pr-12 w-full disabled:opacity-50 disabled:cursor-not-allowed input-focus ${
                      hasPasswordError && newPass ? 'border-indigo-500' : 'border-[#DEE2E6]'
                    }`}
                    value={newPass}
                  />
                  <button
                    type="button"
                    onClick={toggleNewPasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 mt-1 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors duration-200"
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Validation Error message */}
              {hasPasswordError && passwordValidationError && (
                <div className='col-span-2 mt-3 mb-2 animate-scale-in'>
                  <div className='bg-red-50 border border-red-300 text-indigo-700 px-4 py-3 rounded-lg'>
                    <div className='flex items-center'>
                      <svg className='w-4 h-4 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                      </svg>
                      <span className='text-sm font-medium'>{passwordValidationError}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* API Error message */}
              {passwordError && (
                <div className='col-span-2 mt-3 mb-2 animate-scale-in'>
                  <div className='bg-red-50 border border-red-300 text-indigo-700 px-4 py-3 rounded-lg'>
                    <div className='flex items-center'>
                      <svg className='w-4 h-4 mr-2 flex-shrink-0' fill='currentColor' viewBox='0 0 20 20'>
                        <path fillRule='evenodd' d='M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z' clipRule='evenodd' />
                      </svg>
                      <span className='text-sm font-medium'>{getApiErrorMessage(passwordError)}</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!passwordChanged || hasPasswordError || isPasswordLoading}
                style={{
                  backgroundColor: (passwordChanged && !hasPasswordError && !isPasswordLoading) ? '#FD1206' : '#DDDDDD',
                  cursor: (passwordChanged && !hasPasswordError && !isPasswordLoading) ? 'pointer' : 'not-allowed'
                }}
                className='col-span-2 py-2 my-7 rounded-lg border border-[#DEE2E6] w-full text-white flex items-center justify-center button-hover'
              >
                {isPasswordLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('profile.changingPassword')}
                  </>
                ) : (
                  t('profile.save')
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Profile;
