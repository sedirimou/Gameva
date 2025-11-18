import { handleApiSuccess, handleApiError, handleApiWarning, errorMessages } from './errorHandler';

// Cart and Wishlist Management System
export class CartWishlistManager {
  constructor() {
    this.listeners = {
      cart: [],
      wishlist: []
    };
  }

  // Cart Methods
  getCart() {
    if (typeof window === 'undefined') return [];
    try {
      const cart = localStorage.getItem('cart');
      return cart ? JSON.parse(cart) : [];
    } catch (error) {
      console.error('Error reading cart from localStorage:', error);
      return [];
    }
  }

  addToCart(product, quantity = 1) {
    if (typeof window === 'undefined') {
      console.warn('Cannot add to cart: window not available');
      return false;
    }
    
    // Defensive check for invalid input
    if (!product || !product.id) {
      console.error('Invalid product passed to addToCart:', product)
      return false;
    }
    
    try {
      const cart = this.getCart();
      const existingItemIndex = cart.findIndex(item => item.id == product.id);
      
      // Check limit per basket constraint
      const limitPerBasket = product.limit_per_basket || product.limitPerBasket;
      if (limitPerBasket && limitPerBasket > 0) {
        const currentQuantity = existingItemIndex !== -1 ? cart[existingItemIndex].quantity : 0;
        const newTotalQuantity = currentQuantity + quantity;
        
        if (newTotalQuantity > limitPerBasket) {
          const availableSlots = limitPerBasket - currentQuantity;
          if (availableSlots <= 0) {
            // Show error notification
            this.showLimitErrorNotification(product.name, limitPerBasket);
            return false;
          } else {
            // Add only the available slots and show warning
            quantity = availableSlots;
            this.showLimitWarningNotification(product.name, limitPerBasket, availableSlots);
          }
        }
      }
      
      if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
      } else {
        cart.push({
          id: product.id,
          name: product.name,
          price: product.price,
          originalPrice: product.price,
          image: product.coverUrl || product.cover_url || product.image,
          platform: product.platform,
          quantity: quantity,
          limit_per_basket: limitPerBasket
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      this.notifyCartListeners();
      window.dispatchEvent(new Event('cartUpdated'));
      
      // Show success notification
      handleApiSuccess(`${product.name || 'Product'} added to your cart!`);
      
      return true;
    } catch (error) {
      console.error('Error adding to cart:', error);
      return false;
    }
  }

  removeFromCart(productId) {
    if (typeof window === 'undefined') return false;
    
    const cart = this.getCart();
    const removedItem = cart.find(item => item.id === productId);
    const updatedCart = cart.filter(item => item.id !== productId);
    
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    this.notifyCartListeners();
    window.dispatchEvent(new Event('cartUpdated'));
    
    // Show success notification
    if (removedItem) {
      handleApiSuccess(`${removedItem.name || 'Product'} removed from your cart!`);
    }
    
    return true;
  }

  updateCartQuantity(productId, quantity) {
    if (typeof window === 'undefined') return false;
    
    const cart = this.getCart();
    const itemIndex = cart.findIndex(item => item.id === productId);
    
    if (itemIndex !== -1) {
      if (quantity <= 0) {
        cart.splice(itemIndex, 1);
      } else {
        // Check limit per basket constraint
        const item = cart[itemIndex];
        const limitPerBasket = item.limit_per_basket;
        
        if (limitPerBasket && limitPerBasket > 0 && quantity > limitPerBasket) {
          // Show error notification and don't update
          this.showLimitErrorNotification(item.name, limitPerBasket);
          return false;
        }
        
        cart[itemIndex].quantity = quantity;
      }
      
      localStorage.setItem('cart', JSON.stringify(cart));
      this.notifyCartListeners();
      window.dispatchEvent(new Event('cartUpdated'));
      return true;
    }
    return false;
  }

  isInCart(productId) {
    const cart = this.getCart();
    return cart.some(item => item.id === productId);
  }

  getCartCount() {
    const cart = this.getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
  }

  clearCart() {
    if (typeof window === 'undefined') return false;
    
    localStorage.setItem('cart', JSON.stringify([]));
    this.notifyCartListeners();
    window.dispatchEvent(new Event('cartUpdated'));
    return true;
  }

  // Wishlist Methods
  getWishlist() {
    if (typeof window === 'undefined') return [];
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
  }

  addToWishlist(product) {
    if (typeof window === 'undefined') return false;
    
    const wishlist = this.getWishlist();
    const existingItem = wishlist.find(item => item.id === product.id);
    
    if (!existingItem) {
      wishlist.push({
        id: product.id,
        name: product.name,
        price: product.finalPrice || product.price,
        originalPrice: product.price,
        image: product.coverUrl || product.cover_url || product.image,
        platform: product.platform,
        addedAt: new Date().toISOString()
      });
      
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
      this.notifyWishlistListeners();
      window.dispatchEvent(new Event('wishlistUpdated'));
      return true;
    }
    return false;
  }

  removeFromWishlist(productId) {
    if (typeof window === 'undefined') return false;
    
    const wishlist = this.getWishlist();
    const updatedWishlist = wishlist.filter(item => item.id !== productId);
    
    localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
    this.notifyWishlistListeners();
    window.dispatchEvent(new Event('wishlistUpdated'));
    return true;
  }

  toggleWishlist(product) {
    if (this.isInWishlist(product.id)) {
      return { action: 'removed', success: this.removeFromWishlist(product.id) };
    } else {
      return { action: 'added', success: this.addToWishlist(product) };
    }
  }

  isInWishlist(productId) {
    const wishlist = this.getWishlist();
    return wishlist.some(item => item.id === productId);
  }

  getWishlistCount() {
    return this.getWishlist().length;
  }

  clearWishlist() {
    if (typeof window === 'undefined') return false;
    
    localStorage.setItem('wishlist', JSON.stringify([]));
    this.notifyWishlistListeners();
    window.dispatchEvent(new Event('wishlistUpdated'));
    return true;
  }

  // Listener Management
  onCartChange(callback) {
    this.listeners.cart.push(callback);
    return () => {
      this.listeners.cart = this.listeners.cart.filter(cb => cb !== callback);
    };
  }

  onWishlistChange(callback) {
    this.listeners.wishlist.push(callback);
    return () => {
      this.listeners.wishlist = this.listeners.wishlist.filter(cb => cb !== callback);
    };
  }

  notifyCartListeners() {
    const cart = this.getCart();
    this.listeners.cart.forEach(callback => callback(cart));
  }

  notifyWishlistListeners() {
    const wishlist = this.getWishlist();
    this.listeners.wishlist.forEach(callback => callback(wishlist));
  }

  // Limit validation helper methods
  showLimitErrorNotification(productName, limit) {
    handleApiError(
      new Error(`You can only add up to ${limit} unit${limit > 1 ? 's' : ''} of "${productName}" to your cart.`),
      `Cart limit reached for ${productName}`
    );
  }

  showLimitWarningNotification(productName, limit, addedQuantity) {
    handleApiWarning(
      `Only ${addedQuantity} unit${addedQuantity > 1 ? 's' : ''} of "${productName}" could be added. Cart limit is ${limit} unit${limit > 1 ? 's' : ''}.`
    );
  }

  // Utility Methods
  moveToCart(productId) {
    const wishlist = this.getWishlist();
    const item = wishlist.find(item => item.id === productId);
    
    if (item) {
      const success = this.addToCart(item);
      if (success) {
        this.removeFromWishlist(productId);
        return true;
      }
    }
    return false;
  }

  addAllWishlistToCart() {
    const wishlist = this.getWishlist();
    let successCount = 0;
    
    wishlist.forEach(item => {
      if (this.addToCart(item)) {
        successCount++;
      }
    });
    
    return successCount;
  }
}

// Create a singleton instance
export const cartWishlistManager = new CartWishlistManager();