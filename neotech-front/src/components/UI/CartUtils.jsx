const CartUtils = {
    CART_KEY: 'ecommerce_cart',

    // ✅ Get cart from localStorage
    getCart() {
        try {
            const cart = localStorage.getItem(this.CART_KEY);
            return cart
                ? JSON.parse(cart)
                : { items: [], totalPriceBeforeDiscount: 0, totalDiscount: 0, totalAmount: 0 };
        } catch (error) {
            console.error('Error reading cart:', error);
            return { items: [], totalPriceBeforeDiscount: 0, totalDiscount: 0, totalAmount: 0 };
        }
    },

    // ✅ Save cart to localStorage + dispatch update event
    saveCart(cart) {
        try {
            // Ensure totals are numbers, not null
            cart.totalPriceBeforeDiscount = cart.totalPriceBeforeDiscount || 0;
            cart.totalDiscount = cart.totalDiscount || 0;
            cart.totalAmount = cart.totalAmount || 0;
            
            localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
            window.dispatchEvent(new CustomEvent('cartUpdated', { detail: cart }));
        } catch (error) {
            console.error('Error saving cart:', error);
        }
    },

    // ✅ UUID generator
    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    },

    // ✅ Get product price (handles discounted price)
    getProductPrice(product) {
        if (product.currentPrice) return Number(product.currentPrice);
        if (!product.prices || product.prices.length === 0) return 0;
        const price = product.prices[0];
        return price.discountedPrice > 0 ? price.discountedPrice : price.price;
    },

    // ✅ Add or update item in cart
    addItem(product, quantity = 1) {
        const cart = this.getCart();
        const unitPrice = this.getProductPrice(product);
        const originalPrice = product.originalPrice || unitPrice;
        const productDiscount = originalPrice - unitPrice;

        const existingItemIndex = cart.items.findIndex(
            (item) => item.productId === product.id
        );

        if (existingItemIndex > -1) {
            // Update existing item
            const existingItem = cart.items[existingItemIndex];
            existingItem.quantity += quantity;
            existingItem.totalPriceBeforeDiscount = originalPrice * existingItem.quantity;
            existingItem.totalPrice = unitPrice * existingItem.quantity;
        } else {
            // Add new item
            const cartItem = {
                id: this.generateUUID(),
                cartId: this.generateUUID(),
                productId: product.id,
                productName: product.name,
                productSku: product.sku,
                productDescription: product.shortDescription || product.description || '',
                productImageUrl: product.primaryImageUrl || product.images?.[0]?.imageUrl || '',
                quantity,
                unitPrice,
                productDiscount,
                totalPriceBeforeDiscount: originalPrice * quantity,
                totalPrice: unitPrice * quantity,
                createdAt: new Date().toISOString(),
            };
            cart.items.push(cartItem);
        }

        this.updateCartTotals(cart);
        return cart;
    },

    // ✅ Remove item from cart
    removeItem(itemId) {
        const cart = this.getCart();
        cart.items = cart.items.filter(item => item.id !== itemId);
        this.updateCartTotals(cart);
        return cart;
    },

    // ✅ Update item quantity
    updateQuantity(itemId, quantity) {
        const cart = this.getCart();
        const item = cart.items.find(item => item.id === itemId);

        if (!item) {
            console.warn(`Item with id ${itemId} not found`);
            return cart;
        }

        if (quantity <= 0) {
            // Remove item if quantity is 0 or negative
            return this.removeItem(itemId);
        }

        // Update quantity and recalculate prices
        item.quantity = quantity;
        const originalUnitPrice = item.unitPrice + (item.productDiscount || 0);
        item.totalPriceBeforeDiscount = originalUnitPrice * quantity;
        item.totalPrice = item.unitPrice * quantity;

        this.updateCartTotals(cart);
        return cart;
    },

    // ✅ Clear entire cart
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

    // ✅ Get total item count (sum of all quantities)
    getItemCount() {
        const cart = this.getCart();
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    // ✅ Update cart totals based on items
    updateCartTotals(cart) {
        // Calculate total price before any discounts
        const totalPriceBeforeDiscount = cart.items.reduce(
            (sum, item) => sum + (item.totalPriceBeforeDiscount || 0),
            0
        );

        // Calculate total discount (sum of all individual product discounts)
        const totalDiscount = cart.items.reduce(
            (sum, item) => sum + ((item.productDiscount || 0) * (item.quantity || 0)),
            0
        );

        // Calculate final amount (can also use sum of totalPrice)
        const totalAmount = cart.items.reduce(
            (sum, item) => sum + (item.totalPrice || 0),
            0
        );

        // Set values with NaN protection
        cart.totalPriceBeforeDiscount = isNaN(totalPriceBeforeDiscount) ? 0 : totalPriceBeforeDiscount;
        cart.totalDiscount = isNaN(totalDiscount) ? 0 : totalDiscount;
        cart.totalAmount = isNaN(totalAmount) ? 0 : totalAmount;

        this.saveCart(cart);
    }
};

export default CartUtils;
