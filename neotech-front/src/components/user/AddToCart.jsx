import React from 'react';
import { v4 as uuidv4 } from 'uuid';

// Cart utility functions
export const CartUtils = {
  CART_KEY: 'ecommerce_cart',

  // Get cart from localStorage
  getCart() {
    try {
      const cart = localStorage.getItem(this.CART_KEY);
      return cart ? JSON.parse(cart) : { items: [], totalAmount: 0 };
    } catch (error) {
      console.error('Error reading cart:', error);
      return { items: [], totalAmount: 0 };
    }
  },

  // Save cart to localStorage
  saveCart(cart) {
    try {
      localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error('Error saving cart:', error);
    }
  },

  // Add item to cart
  addItem(product, quantity = 1) {
    const cart = this.getCart();
    
    // Extract needed data from product
    const cartItem = {
      id: uuidv4(), 
      cartId: uuidv4(), 
      productId: product.id,
      productName: product.name,
      productSku: product.sku,
      productDescription: product.shortDescription || product.description,
      productImageUrl: product.primaryImageUrl || (product.images?.[0]?.imageUrl),
      quantity: quantity,
      unitPrice: this.getProductPrice(product),
      totalPrice: this.getProductPrice(product) * quantity,
      createdAt: new Date().toISOString(),
    };

    // Check if product already exists in cart
    const existingItemIndex = cart.items.findIndex(
      item => item.productId === product.id
    );

    if (existingItemIndex > -1) {
      // Update quantity and total price
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].totalPrice = 
        cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].unitPrice;
    } else {
      // Add new item
      cart.items.push(cartItem);
    }

    // Recalculate total amount
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);

    this.saveCart(cart);
    return cart;
  },

  // Get product price (uses first available price or discounted price if exists)
  getProductPrice(product) {
    if (!product.prices || product.prices.length === 0) return 0;
    
    const price = product.prices[0];
    return price.discountedPrice > 0 ? price.discountedPrice : price.price;
  },

  // Remove item from cart
  removeItem(itemId) {
    const cart = this.getCart();
    cart.items = cart.items.filter(item => item.id !== itemId);
    cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    this.saveCart(cart);
    return cart;
  },

  // Update item quantity
  updateQuantity(itemId, quantity) {
    const cart = this.getCart();
    const item = cart.items.find(item => item.id === itemId);
    
    if (item && quantity > 0) {
      item.quantity = quantity;
      item.totalPrice = item.quantity * item.unitPrice;
      cart.totalAmount = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
      this.saveCart(cart);
    }
    
    return cart;
  },

  // Clear cart
  clearCart() {
    localStorage.removeItem(this.CART_KEY);
  },

  // Get cart item count
  getItemCount() {
    const cart = this.getCart();
    return cart.items.reduce((sum, item) => sum + item.quantity, 0);
  }
};

// AddToCart Component
const AddToCart = ({ product, quantity = 1, onSuccess, children, className }) => {
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = () => {
    setIsAdding(true);
    
    try {
      const updatedCart = CartUtils.addItem(product, quantity);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess(updatedCart);
      }

      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={className}
    >
      {children || (isAdding ? 'Adding...' : 'Add to Cart')}
    </button>
  );
};

// WhatsApp Order Creator Hook
export const useWhatsAppOrder = (createWPOrderMutation, me) => {
  const createOrder = async () => {
    try {
      const cart = CartUtils.getCart();

      if (!cart.items || cart.items.length === 0) {
        throw new Error('Cart is empty');
      }

      const orderPayload = {
        phoneNumber: "+994702971707",
        customerName: me?.fullName || "",
        customerPhone: me?.phoneNumber?.replace(/\D/g, '') || "0000000",
        items: cart.items.map(item => ({
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
          createdAt: item.createdAt,
        })),
        totalAmount: Number(cart.totalAmount) || 0,
        currency: "AZN",
      };

      const response = await createWPOrderMutation(orderPayload).unwrap();

      if (response.whatsAppUrl) {
        window.open(response.whatsAppUrl, "_blank");
        // Optionally clear cart after successful order
        // CartUtils.clearCart();
      }

      return response;
    } catch (error) {
      console.error("Error creating WhatsApp order:", error);
      throw error;
    }
  };

  return { createOrder };
};

export default AddToCart;
