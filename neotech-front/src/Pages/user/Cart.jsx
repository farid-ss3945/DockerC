import React, { useState, useCallback, useMemo, useEffect } from 'react'
import { ArrowLeft, Minus, Plus, ShoppingCart, Trash2, X, Loader2, Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router';
import { useGetCartItemsQuery, useUpdateCartItemQuantityMutation, useRemoveCartItemMutation, useRemoveCartMutation, useGetMeQuery, useCreateWhatsappOrderMutation } from '../../store/API';
import { toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import { translateDynamicField } from '../../i18n';
import SearchUI from '../../components/UI/SearchUI'
import { Breadcrumb } from '../../products/Breadcrumb'

const AuthUtils = {
  isAuthenticated() {
    const cookies = document.cookie.split(';');
    for (let cookie of cookies) {
      const [name] = cookie.trim().split('=');
      if (name === 'token' || name === 'authToken' || name === 'accessToken' || name === 'jwt') {
        return true;
      }
    }
    return false;
  }
};

const CartUtils = {
  CART_KEY: 'ecommerce_cart',

  getCart() {
    try {
      const cart = localStorage.getItem(this.CART_KEY);
      return cart ? JSON.parse(cart) : { 
        items: [], 
        totalPriceBeforeDiscount: 0, 
        totalDiscount: 0, 
        totalAmount: 0 
      };
    } catch (error) {
      console.error('Error reading cart:', error);
      return { 
        items: [], 
        totalPriceBeforeDiscount: 0, 
        totalDiscount: 0, 
        totalAmount: 0 
      };
    }
  },

  saveCart(cart) {
    try {
      cart.totalPriceBeforeDiscount = cart.totalPriceBeforeDiscount || 0;
      cart.totalDiscount = cart.totalDiscount || 0;
      cart.totalAmount = cart.totalAmount || 0;
      
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  removeItem(itemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    this.updateCartTotals(cart);
    return cart;
  },

  updateQuantity(itemId, quantity) {
    const cart = this.getCart();
    const item = cart.items.find(item => item.id === itemId);
    
    if (!item) {
      console.warn(`Item with id ${itemId} not found`);
      return cart;
    }
    
    if (quantity <= 0) {
      return this.removeItem(itemId);
    }

    item.quantity = quantity;
    const originalUnitPrice = item.unitPrice + (item.productDiscount || 0);
    item.totalPriceBeforeDiscount = originalUnitPrice * quantity;
    item.totalPrice = item.unitPrice * quantity;

    this.updateCartTotals(cart);
    return cart;
  },

  clearCart() {
    const emptyCart = { 
      items: [], 
      totalPriceBeforeDiscount: 0, 
      totalDiscount: 0, 
      totalAmount: 0 
    };
    localStorage.setItem(this.CART_KEY, JSON.stringify(emptyCart));
    window.dispatchEvent(new CustomEvent('cartUpdated', { detail: emptyCart }));
  },

  updateCartTotals(cart) {
    const totalPriceBeforeDiscount = cart.items.reduce(
      (sum, item) => sum + (item.totalPriceBeforeDiscount || 0),
      0
    );

    const totalDiscount = cart.items.reduce(
      (sum, item) => sum + ((item.productDiscount || 0) * (item.quantity || 0)),
      0
    );

    const totalAmount = cart.items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );

    cart.totalPriceBeforeDiscount = isNaN(totalPriceBeforeDiscount) ? 0 : totalPriceBeforeDiscount;
    cart.totalDiscount = isNaN(totalDiscount) ? 0 : totalDiscount;
    cart.totalAmount = isNaN(totalAmount) ? 0 : totalAmount;

    this.saveCart(cart);
  }
};

const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(null, args), delay);
  };
};

// Skeleton Components
const CartItemSkeletonMobile = () => (
  <div className="space-y-4 lg:hidden animate-pulse">
    <div className="flex items-start rounded-lg">
      <div className="w-30 h-30 bg-gray-300 rounded-lg mr-4"></div>
      <div className="flex-1 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      </div>
      <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
    </div>
    <div className="flex items-center justify-between">
      <div className="flex items-center border border-gray-300 rounded-lg">
        <div className="w-10 h-10 bg-gray-300 rounded"></div>
        <div className="w-12 h-10 bg-gray-300 mx-2 rounded"></div>
        <div className="w-10 h-10 bg-gray-300 rounded"></div>
      </div>
      <div className="h-6 bg-gray-300 rounded w-20"></div>
    </div>
  </div>
);

const CartItemSkeletonDesktop = () => (
  <div className="hidden lg:flex gap-4 animate-pulse">
    <div className="flex-1 flex">
      <div className="w-30 h-30 bg-gray-300 rounded-lg mr-4"></div>
      <div className="flex-1">
        <div className="space-y-2 mb-4">
          <div className="h-5 bg-gray-300 rounded w-3/4"></div>
          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          <div className="h-4 bg-gray-300 rounded w-1/3"></div>
        </div>
        <div className="h-8 bg-gray-300 rounded w-20 mt-7"></div>
      </div>
    </div>
    <div className="flex flex-col items-end justify-around px-4">
      <div className="h-6 bg-gray-300 rounded w-20"></div>
      <div className="flex items-center border border-gray-300 rounded-lg">
        <div className="w-10 h-10 bg-gray-300 rounded"></div>
        <div className="w-12 h-10 bg-gray-300 mx-2 rounded"></div>
        <div className="w-10 h-10 bg-gray-300 rounded"></div>
      </div>
    </div>
  </div>
);

const CartSummarySkeleton = () => (
  <div className="lg:bg-white lg:p-5 lg:shadow-sm py-1 lg:h-fit flex-2 lg:rounded-lg animate-pulse">
    <div className="border-t lg:border-none border-gray-200 pt-4 space-y-3">
      <div className="flex justify-between">
        <div className="h-5 bg-gray-300 rounded w-20"></div>
        <div className="h-5 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="flex justify-between">
        <div className="h-5 bg-gray-300 rounded w-20"></div>
        <div className="h-5 bg-gray-300 rounded w-16"></div>
      </div>
      <div className="flex justify-between pt-2 border-t border-gray-200">
        <div className="h-6 bg-gray-300 rounded w-16"></div>
        <div className="h-6 bg-gray-300 rounded w-20"></div>
      </div>
    </div>
    <div className="w-full h-14 bg-gray-300 rounded-lg mt-4"></div>
  </div>
);

const EmptyCartSkeleton = () => (
  <div className="flex-5 flex gap-5 p-4 flex-col bg-white lg:rounded-lg animate-pulse">
    {[...Array(3)].map((_, index) => (
      <div key={index}>
        <CartItemSkeletonMobile />
        <CartItemSkeletonDesktop />
        {index < 2 && <hr className="mx-2 border-[#dee2e6] my-4" />}
      </div>
    ))}
    <hr className="mx-2 border-[#dee2e6] hidden lg:block" />
    <div className="justify-between hidden lg:flex">
      <div className="h-10 bg-gray-300 rounded w-32"></div>
      <div className="h-10 bg-gray-300 rounded w-24"></div>
    </div>
  </div>
);

// Checkout Modal Component
const CheckoutModal = ({ isOpen, onClose, cartItems, onSubmit, isSubmitting, isSuccess }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: ''
  });
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.customerName.trim()) {
      setError('Please enter your full name');
      return false;
    }
    if (!formData.customerPhone.trim()) {
      setError('Please enter your phone number');
      return false;
    }
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    onSubmit(formData);
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        customerName: '',
        customerPhone: ''
      });
      setError('');
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div 
        className="bg-white rounded-lg max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900">{t('checkout')}</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items Preview */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 max-h-60 overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            {t('orderSummary') || 'Order Summary'} ({cartItems?.items?.length || 0} {t('items')})
          </h4>
          <div className="space-y-2">
            {cartItems?.items?.slice(0, 3).map((item) => (
              <div key={item.id} className="flex items-center gap-3 bg-white p-2 rounded-lg">
                <img 
                  src={`https://ecommerce100-001-site1.ntempurl.com${item?.productImageUrl}`}
                  alt={item?.productName}
                  className="w-12 h-12 object-contain rounded bg-gray-50 p-1"
                  onError={(e) => {
                    e.target.src = "/Icons/logo.svg"
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold text-gray-900">
                  {(item.unitPrice * item.quantity).toFixed(2)} AZN
                </span>
              </div>
            ))}
            {cartItems?.items?.length > 3 && (
              <p className="text-sm text-gray-500 text-center py-1">
                +{cartItems.items.length - 3} more items
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
                {t('fullName') || 'Full Name'} <span className="text-indigo-500">*</span>
              </label>
              <input
                type="text"
                id="customerName"
                name="customerName"
                value={formData.customerName}
                onChange={handleInputChange}
                disabled={isSubmitting || isSuccess}
                placeholder="Enter your full name"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
                {t('phoneNumber') || 'Phone Number'} <span className="text-indigo-500">*</span>
              </label>
              <input
                type="tel"
                id="customerPhone"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                disabled={isSubmitting || isSuccess}
                placeholder="+994 XX XXX XX XX"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-indigo-600">{error}</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>{t('subtotal') || 'Subtotal'}:</span>
                <span>{(cartItems?.totalPriceBeforeDiscount || 0).toFixed(2)} AZN</span>
              </div>
              {(cartItems?.totalDiscount || 0) > 0 && (
                <div className="flex items-center justify-between text-sm text-indigo-500">
                  <span>{t('discount') || 'Discount'}:</span>
                  <span>- {(cartItems?.totalDiscount || 0).toFixed(2)} AZN</span>
                </div>
              )}
              <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                <span className="font-medium text-gray-900">{t('total') || 'Total Amount'}:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {(cartItems?.totalAmount || 0).toFixed(2)} AZN
                </span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className={`w-full mt-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
              isSuccess
                ? 'bg-green-500 text-white cursor-default'
                : isSubmitting
                ? 'bg-indigo-400 text-white cursor-not-allowed'
                : 'bg-indigo-500 hover:bg-indigo-600 text-white cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('processing') || 'Processing...'}
              </>
            ) : isSuccess ? (
              <>
                <Check className="w-5 h-5" />
                {t('quickOrder.orderPlacedSuccess')}
              </>
            ) : (
              <>
                <ShoppingCart className="w-5 h-5" />
                {t('placeOrder') || 'Place Order'}
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

const Cart = () => {
  const { t, i18n } = useTranslation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [localCart, setLocalCart] = useState({ 
    items: [], 
    totalPriceBeforeDiscount: 0,
    totalDiscount: 0,
    totalAmount: 0 
  });
  
  const [translatedCartItems, setTranslatedCartItems] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isOrderSubmitting, setIsOrderSubmitting] = useState(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  const { data: cartItemsD, isLoading: apiLoading, isError } = useGetCartItemsQuery(undefined, {
    skip: !isAuthenticated
  });
  
  const { data: me } = useGetMeQuery();
  const [updateCartItemQuantity] = useUpdateCartItemQuantityMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [removeCart] = useRemoveCartMutation();
  const [createWPOrder] = useCreateWhatsappOrderMutation();

  const [removingItems, setRemovingItems] = useState(new Set());
  const [isRemovingCart, setIsRemovingCart] = useState(false);
  const [localQuantities, setLocalQuantities] = useState({});
  const [updatingItems, setUpdatingItems] = useState(new Set());

  useEffect(() => {
    const authStatus = AuthUtils.isAuthenticated();
    setIsAuthenticated(authStatus);
    
    if (!authStatus) {
      setLocalCart(CartUtils.getCart());
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      const handleCartUpdate = (e) => {
        setLocalCart(e.detail);
      };
      
      window.addEventListener('cartUpdated', handleCartUpdate);
      return () => window.removeEventListener('cartUpdated', handleCartUpdate);
    }
  }, [isAuthenticated]);

  const cartItems = isAuthenticated ? cartItemsD : localCart;
  const isLoading = isAuthenticated ? apiLoading : false;

useEffect(() => {
  async function translateCartItems() {
    if (!cartItems?.items || cartItems.items.length === 0) {
      setTranslatedCartItems({ items: [], totalPriceBeforeDiscount: 0, totalDiscount: 0, totalAmount: 0 });
      return;
    }

    const targetLang = i18n.language;
    if (targetLang === 'en') {
      const translated = {
        ...cartItems,
        items: await Promise.all(
          cartItems.items.map(async (item) => ({
            ...item,
            productName: await translateDynamicField(item.productName, targetLang),
            productDescription: item.productDescription ? await translateDynamicField(item.productDescription, targetLang) : item.productDescription
          }))
        )
      };
      setTranslatedCartItems(translated);
    } else {
      setTranslatedCartItems(cartItems);
    }
  }
  translateCartItems();
}, [i18n.language, cartItems]);

  const handleCheckoutSubmit = async (formData) => {
    setIsOrderSubmitting(true);
    
    try {
      const orderPayload = {
        phoneNumber: "+994702971707",
        customerName: formData?.customerName || me?.fullName,
        customerPhone: formData?.customerPhone?.replace(/\D/g, '') || me?.phoneNumber,
        items: cartItems?.items?.map(item => ({
          id: item.id,
          cartId: item.cartId,
          productId: item.productId,
          productName: item.productName,
          productSku: item.productSku,
          productDescription: item.productDescription,
          productImageUrl: item.productImageUrl || "",
          quantity: Number(item.quantity),
          unitPrice: Number(item.unitPrice),
          totalPrice: Number(item.totalPrice),
          createdAt: item.createdAt ? new Date(item.createdAt).toISOString() : new Date().toISOString(),
        })) ?? [],
        totalAmount: Number(cartItems?.totalAmount) || 0,
        currency: "AZN",
      };

      const response = await createWPOrder(orderPayload).unwrap();

      if (response.whatsAppUrl) {
        setIsOrderSuccess(true);
        toast.success(t('quickOrder.orderPlacedSuccess') || 'Order Placed Successfully!');
        
        setTimeout(async () => {
          window.open(response.whatsAppUrl, "_blank");
          
          if (isAuthenticated) {
            await removeCart().unwrap();
          } else {
            CartUtils.clearCart();
            setLocalCart({ 
              items: [], 
              totalPriceBeforeDiscount: 0,
              totalDiscount: 0,
              totalAmount: 0 
            });
          }
          
          setIsCheckoutModalOpen(false);
          setIsOrderSuccess(false);
        }, 1500);
      }
    } catch (error) {
      console.error('Order creation error:', error);
      setIsOrderSubmitting(false);
      toast.error(t('quickOrder.orderFailed') || 'Failed to place order. Please try again.');
    }
  };

  const debouncedUpdate = useMemo(
    () => debounce(async (cartItemId, quantity) => {
      if (!isAuthenticated) return;
      
      try {
        setUpdatingItems(prev => new Set(prev).add(cartItemId));
        await updateCartItemQuantity({ cartItemId, quantity }).unwrap();
      } catch (error) {
        console.error('Failed to update cart item:', error);
        setLocalQuantities(prev => {
          const newState = { ...prev };
          delete newState[cartItemId];
          return newState;
        });
      } finally {
        setUpdatingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(cartItemId);
          return newSet;
        });
      }
    }, 500),
    [updateCartItemQuantity, isAuthenticated]
  );

  useEffect(() => {
    if (isAuthenticated && cartItemsD?.items) {
      setLocalQuantities(prev => {
        const newState = { ...prev };
        let hasChanges = false;

        cartItemsD.items.forEach(item => {
          if (newState[item.id] === item.quantity) {
            delete newState[item.id];
            hasChanges = true;
          }
        });

        return hasChanges ? newState : prev;
      });
    }
  }, [cartItemsD, isAuthenticated]);

  const getEffectiveQuantity = useCallback((item) => {
    return localQuantities[item.id] !== undefined ? localQuantities[item.id] : item.quantity;
  }, [localQuantities]);

  const handleQuantityChange = useCallback((item, newQuantity) => {
    if (newQuantity < 1) return;

    if (isAuthenticated) {
      setLocalQuantities(prev => ({
        ...prev,
        [item.id]: newQuantity
      }));
      debouncedUpdate(item.id, newQuantity);
    } else {
      const updatedCart = CartUtils.updateQuantity(item.id, newQuantity);
      setLocalCart(updatedCart);
    }
  }, [isAuthenticated, debouncedUpdate]);

  const handleIncrement = useCallback((item) => {
    const currentQuantity = getEffectiveQuantity(item);
    handleQuantityChange(item, currentQuantity + 1);
  }, [getEffectiveQuantity, handleQuantityChange]);

  const handleDecrement = useCallback((item) => {
    const currentQuantity = getEffectiveQuantity(item);
    if (currentQuantity > 1) {
      handleQuantityChange(item, currentQuantity - 1);
    }
  }, [getEffectiveQuantity, handleQuantityChange]);

  const handleRemoveItem = async (id) => {
    try {
      setRemovingItems(prev => new Set(prev).add(id));
      
      if (isAuthenticated) {
        await removeCartItem({ id }).unwrap();
      } else {
        const updatedCart = CartUtils.removeItem(id);
        setLocalCart(updatedCart);
      }
      
    } catch (error) {
      console.error('Failed to remove cart item:', error);
    } finally {
      setRemovingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  const handleRemoveCart = async () => {
    try {
      setIsRemovingCart(true);
      
      if (isAuthenticated) {
        await removeCart().unwrap();
      } else {
        CartUtils.clearCart();
        setLocalCart({ 
          items: [], 
          totalPriceBeforeDiscount: 0,
          totalDiscount: 0,
          totalAmount: 0 
        });
      }
      
    } catch (error) {
      console.error('Failed to remove cart:', error);
    } finally {
      setIsRemovingCart(false);
    }
  };

  if (isError) {
    return (
      <section className="inter bg-[#f7fafc] min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{t('errorLoadingCart')}</h2>
          <p className="text-gray-600">{t('pleaseTryAgainLater')}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="inter bg-[#f7fafc] whitepsace-nowrap">
      <div className="lg:hidden px-4 pl-7 py-4 border-y bg-white lg:border-transparent border-[#dee2e6]">
        <div className="mb-4 lg:hidden">
          <SearchUI />
        </div>
        <Breadcrumb />
      </div>

      <div className="min-h-[80vh] lg:max-w-[90vw] lg:mx-auto border border-[#dee2e6] lg:border-0">
        <div className='p-4 pl-7 pb-0 hidden lg:block'>
          <Breadcrumb />
        </div>

        <div className="p-4 pl-7 text-xl font-semibold bg-white lg:bg-transparent border-b lg:border-0 border-[#dee2e6] mb-3">
          {isLoading ? (
            <div className="h-7 bg-gray-300 rounded w-40 animate-pulse"></div>
          ) : (
            <h1>{t('myCart')} ({(translatedCartItems || cartItems)?.items?.length || 0})</h1>
          )}
        </div>

        <div className="bg-white lg:bg-transparent rounded-lg flex flex-col lg:flex-row lg:gap-4 shadow-sm lg:shadow-none p-4 space-y-4">
          {isLoading ? (
            <>
              <EmptyCartSkeleton />
              <CartSummarySkeleton />
            </>
          ) : (
            <>
              <div className='flex-5 flex gap-5 p-4 flex-col bg-white lg:rounded-lg'>
                {(translatedCartItems || cartItems)?.items?.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('yourCartIsEmpty')}</h3>
                    <p className="text-gray-600">{t('addItemsToStart')}</p>
                  </div>
                ) : (
                  (translatedCartItems || cartItems)?.items?.map((item, index) => {
                    const effectiveQuantity = getEffectiveQuantity(item);
                    const isItemUpdating = updatingItems.has(item.id);
                    const isItemRemoving = removingItems.has(item.id);

                    return (
                      <div key={item.id}>
                        {/* Mobile View */}
                        <div className="space-y-4 lg:hidden">
                          <div className="flex items-start rounded-lg">
                            <div className="w-30 h-30 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              <img
                                className='w-full rounded-lg p-3 aspect-square'
                                src={`https://ecommerce100-001-site1.ntempurl.com${item?.productImageUrl}`}
                                alt={item?.productName || 'Product'}
                                onError={(e) => {
                                  e.target.src = "/Icons/logo.svg"
                                }}
                              />
                            </div>

                            <div className="flex-1">
                              <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                {item.productName}
                              </h3>
                            </div>

                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="p-2 text-indigo-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              disabled={isItemRemoving || isItemUpdating}
                            >
                              <Trash2 size={24} />
                            </button>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() => handleDecrement(item)}
                                disabled={effectiveQuantity <= 1 || isItemUpdating || isItemRemoving}
                              >
                                <Minus size={16} />
                              </button>
                              <span className={`px-4 py-2 border-x border-[#dee2e6] text-center ${isItemUpdating ? 'opacity-50' : ''}`}>
                                {effectiveQuantity}
                              </span>
                              <button
                                className="p-2 hover:bg-gray-100 transition-colors disabled:opacity-50"
                                onClick={() => handleIncrement(item)}
                                disabled={isItemUpdating || isItemRemoving}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            <div className="text-xl font-semibold text-gray-900">
                              {(item.unitPrice * effectiveQuantity).toFixed(2)} AZN
                            </div>
                          </div>
                        </div>

                        {/* Desktop View */}
                        <div className='hidden lg:flex gap-4'>
                          <div className='flex-1 flex'>
                            <div className="w-30 h-30 rounded-lg flex items-center justify-center mr-4 overflow-hidden">
                              <img
                                className="w-full rounded-lg p-3 aspect-square"
                                src={`https://ecommerce100-001-site1.ntempurl.com${item?.productImageUrl}`}
                                alt={item?.productName || "Product"}
                                onError={(e) => {
                                  e.currentTarget.src = "/Icons/logo.svg";
                                }}
                              />
                            </div>

                            <div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg text-gray-900 mb-1">
                                  {item.productName}
                                </h3>
                              </div>

                              <button
                                className='px-3 p-1 mt-7 shadow-md bg-white hover:bg-gray-100 cursor-pointer text-indigo-500 rounded-lg border-1 border-[#dee2e6] disabled:opacity-50 disabled:cursor-not-allowed'
                                onClick={() => handleRemoveItem(item.id)}
                                disabled={isItemRemoving || isItemUpdating}
                              >
                                {isItemRemoving ? t('removing') : t('remove')}
                              </button>
                            </div>
                          </div>

                          <div className="flex flex-col items-end justify-around px-4">
                            <div className="text-lg font-semibold text-gray-900">
                              {(item.unitPrice * effectiveQuantity).toFixed(2)} AZN
                            </div>

                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                className="p-2 hover:bg-gray-100 h-full cursor-pointer transition-colors disabled:opacity-50"
                                onClick={() => handleDecrement(item)}
                                disabled={effectiveQuantity <= 1 || isItemUpdating || isItemRemoving}
                              >
                                <Minus size={16} />
                              </button>
                              <span className={`px-4 py-2 border-x border-[#dee2e6] text-center ${isItemUpdating ? 'opacity-50' : ''}`}>
                                {effectiveQuantity}
                              </span>
                              <button
                                className="p-2 h-full hover:bg-gray-100 cursor-pointer transition-colors disabled:opacity-50"
                                onClick={() => handleIncrement(item)}
                                disabled={isItemUpdating || isItemRemoving}
                              >
                                <Plus size={16} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {index < ((translatedCartItems || cartItems)?.items?.length - 1) && (
                          <hr className="mx-2 border-[#dee2e6] my-4" />
                        )}
                      </div>
                    )
                  })
                )}

                {(translatedCartItems || cartItems)?.items?.length > 0 && (
                  <>
                    <hr className="mx-2 border-[#dee2e6] hidden lg:block" />
                    <div className='justify-between hidden lg:flex'>
                      <Link to='/' className='flex items-center gap-2 text-white bg-black inter p-2 rounded-lg'>
                        <ArrowLeft size={20} />
                        <p>{t('backToShop')}</p>
                      </Link>
                      <button
                        onClick={() => handleRemoveCart()}
                        className='px-3 bg-white hover:bg-gray-100 cursor-pointer text-indigo-500 rounded-lg border-1 border-[#bfc2c6] disabled:opacity-50 disabled:cursor-not-allowed'
                        disabled={isRemovingCart}
                      >
                        {isRemovingCart ? t('removingAll') : t('removeAll')}
                      </button>
                    </div>
                  </>
                )}
              </div>

              <div className='lg:bg-white lg:p-5 lg:shadow-sm py-1 lg:h-fit flex-2 lg:rounded-lg'>
                <div className="border-t lg:border-none border-gray-200 pt-4 space-y-3">
                  <div className="flex justify-between text-gray-600 text-lg">
                    <span>{t('subtotal')}:</span>
                    <span>{((translatedCartItems || cartItems)?.totalPriceBeforeDiscount || 0).toFixed(2)} AZN</span>
                  </div>
                  <div className="flex justify-between text-indigo-500 text-lg">
                    <span>{t('discount')}:</span>
                    <span>- {((translatedCartItems || cartItems)?.totalDiscount || 0).toFixed(2)} AZN</span>
                  </div>
                  <div className="flex justify-between text-lg mb-7 font-bold text-gray-900 pt-2 border-t border-gray-200">
                    <span>{t('total')}:</span>
                    <span>{((translatedCartItems || cartItems)?.totalAmount || 0).toFixed(2)} AZN</span>
                  </div>
                </div>

                <button
                  onClick={() => !me ? setIsCheckoutModalOpen(true) : handleCheckoutSubmit()}
                  className="w-full cursor-pointer bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!(translatedCartItems || cartItems)?.items?.length}
                >
                  <ShoppingCart size={20} />
                  <span>{t('buyNow')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => {
          if (!isOrderSubmitting) {
            setIsCheckoutModalOpen(false);
          }
        }}
        cartItems={translatedCartItems || cartItems}
        onSubmit={handleCheckoutSubmit}
        isSubmitting={isOrderSubmitting}
        isSuccess={isOrderSuccess}
      />
    </section>
  );
};

export default Cart;

