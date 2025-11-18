import { useState, useEffect } from 'react';
import Link from 'next/link';
import EcommerceLayout from '../components/layout/EcommerceLayout';
import { useRouter } from 'next/router';
import { useCurrency } from '../hooks/useCurrency';
import { getProductImageUrl } from '../lib/imageUtils';


export default function CartPage() {
  const router = useRouter();
  const { formatPrice, calculateTotal, formatTotal, loading: currencyLoading } = useCurrency();
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantities, setQuantities] = useState({});
  const [couponExpanded, setCouponExpanded] = useState(false);

  useEffect(() => {
    // Only run on client side to avoid SSR issues
    if (typeof window === 'undefined') return;
    
    try {
      // Load cart from localStorage - new format stores full product objects
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      
      // Check if cart has new format (array of objects) or old format (array of IDs)
      if (savedCart.length > 0 && typeof savedCart[0] === 'object') {
        // New format: array of product objects with quantities
        // Always fetch fresh product data to enrich with current pricing
        setCartItems(savedCart);
        const initialQuantities = {};
        savedCart.forEach(item => {
          initialQuantities[item.id] = item.quantity || 1;
        });
        setQuantities(initialQuantities);
        // We'll fetch products in a separate useEffect
      } else {
        // Old format or empty: array of product IDs
        setCartItems(savedCart);
        const initialQuantities = {};
        savedCart.forEach(id => {
          initialQuantities[id] = 1;
        });
        setQuantities(initialQuantities);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
      setCartItems([]);
      setQuantities({});
      setLoading(false);
    }
  }, []);

  // Fetch products when cartItems changes
  useEffect(() => {
    if (cartItems.length > 0) {
      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [cartItems]);

  const fetchProducts = async () => {
    try {
      // Get product IDs from cart items
      const productIds = cartItems.map(item => 
        typeof item === 'object' ? item.id : item
      ).filter(Boolean);
      
      if (productIds.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }
      
      // Use POST method to enrich cart items with fresh sale price data including limit_per_basket
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: productIds, include_limits: true })
      });
      
      const data = await response.json();
      

      
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromCart = (productId) => {
    const newCartItems = cartItems.filter(item => 
      typeof item === 'object' ? item.id !== productId : item !== productId
    );
    setCartItems(newCartItems);
    
    // Only access localStorage and window on client side
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(newCartItems));
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (error) {
        console.error('Error updating cart in localStorage:', error);
      }
    }
    
    const newQuantities = { ...quantities };
    delete newQuantities[productId];
    setQuantities(newQuantities);
  };

  const handleQuantityChange = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    // Find the product to check its limit
    const product = cartProducts.find(p => p.id === productId);
    const limitPerBasket = product?.limit_per_basket;
    
    // Check limit per basket constraint
    if (limitPerBasket && limitPerBasket > 0 && newQuantity > limitPerBasket) {
      // Import error handler dynamically for client-side use
      import('../lib/errorHandler').then(({ handleApiError }) => {
        handleApiError(
          new Error(`You can only add up to ${limitPerBasket} unit${limitPerBasket > 1 ? 's' : ''} of "${product.name}" to your cart.`),
          `Cart limit reached for ${product.name}`
        );
      });
      return;
    }
    
    // Update quantities state
    setQuantities(prev => ({
      ...prev,
      [productId]: newQuantity
    }));
    
    // Update cart items with new quantity
    const updatedCartItems = cartItems.map(item => {
      if (typeof item === 'object' && item.id === productId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    setCartItems(updatedCartItems);
    
    // Only access localStorage and window on client side
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(updatedCartItems));
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (error) {
        console.error('Error updating cart quantity in localStorage:', error);
      }
    }
  };

  // Filter products that are in the cart and enrich with fresh data
  const cartProducts = cartItems.length > 0 && typeof cartItems[0] === 'object' 
    ? cartItems.map(cartItem => {
        // Enrich cart item with fresh product data for current pricing
        const freshProduct = Array.isArray(products) ? products.find(p => p.id === cartItem.id) : null;
        return freshProduct ? { ...freshProduct, quantity: cartItem.quantity } : cartItem;
      })
    : Array.isArray(products) ? products.filter(product => cartItems.includes(product.id.toString())) : []; // Old format: filter from products

  // Create cart items array with quantities for currency calculation
  const cartItemsForTotal = Array.isArray(cartProducts) ? cartProducts.map(product => ({
    ...product,
    quantity: quantities[product.id] || product.quantity || 1,
    price: product.sale_price || product.sellingPrice || product.final_price || product.finalPrice || product.price || 0
  })) : [];

  // Only calculate totals when currency data is loaded
  const subtotal = currencyLoading ? 0 : calculateTotal(cartItemsForTotal);
  const tax = 0; // No tax
  const total = subtotal;

  const handleCheckout = () => {
    // Don't allow checkout until currency is loaded
    if (currencyLoading) {
      console.log('❌ Currency still loading, cannot proceed to checkout');
      return;
    }
    
    if (!cartProducts.length) {
      console.log('❌ No products in cart, cannot proceed to checkout');
      return;
    }
    
    console.log('🛒 Preparing checkout data...');
    console.log('Cart products:', cartProducts);
    console.log('Quantities:', quantities);
    console.log('Subtotal:', subtotal);
    console.log('Total:', total);
    
    // Save cart data for checkout with detailed product information
    const checkoutData = {
      items: cartProducts.map(product => {
        const quantity = quantities[product.id] || product.quantity || 1;
        console.log(`📦 Item: ${product.name}, Price: €${product.sale_price || product.final_price || product.finalPrice || product.price}, Qty: ${quantity}`);
        return {
          ...product,
          quantity: quantity
        };
      }),
      subtotal,
      tax,
      total
    };
    
    console.log('💾 Saving checkout data to localStorage:', checkoutData);
    localStorage.setItem('checkoutData', JSON.stringify(checkoutData));
    
    console.log('🚀 Navigating to checkout page...');
    router.push('/checkout');
  };

  return (
    <EcommerceLayout 
      title="Shopping Cart" 
      description="Your gaming cart on Gamava"
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Shopping Cart</h1>
        <p className="text-white/80">
          {cartProducts.length} {cartProducts.length === 1 ? 'item' : 'items'} in your cart
        </p>
      </div>

      {/* Cart Content */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
        </div>
      ) : !Array.isArray(cartProducts) || cartProducts.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.8 5.2c-.1.3-.5.8-1.2.8H4m4 0v6m0-6h8m0 0v6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-white/80 mb-8">
            Browse our games and add them to your cart
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-lg hover:opacity-90 transition-opacity"
          >
            Browse Games
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {Array.isArray(cartProducts) && cartProducts.map((product, index) => {
              const quantity = quantities[product.id] || product.quantity || 1;
              return (
                <div key={`cart-item-${product.id || index}`} className="bg-white/5 rounded-lg p-6 flex flex-col md:flex-row gap-4">
                  <div className="w-24 h-32 bg-[#153e8f] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img 
                      src={getProductImageUrl(product)} 
                      alt={product.name}
                      className="w-full h-full object-cover"
                      style={{ aspectRatio: '3/4' }}
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-game.svg';
                      }}
                    />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
                    <p className="text-white/60 text-sm mb-3">{product.platform}</p>
                    
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-white/10 rounded-lg">
                          <button
                            onClick={() => handleQuantityChange(product.id, quantity - 1)}
                            className="px-3 py-1 hover:bg-white/10 rounded-l-lg"
                          >
                            −
                          </button>
                          <span className="px-4 py-1">{quantity}</span>
                          <button
                            onClick={() => handleQuantityChange(product.id, quantity + 1)}
                            disabled={product.limit_per_basket && quantity >= product.limit_per_basket}
                            className={`px-3 py-1 rounded-r-lg ${
                              product.limit_per_basket && quantity >= product.limit_per_basket
                                ? 'opacity-40 cursor-not-allowed bg-white/5'
                                : 'hover:bg-white/10'
                            }`}
                            title={
                              product.limit_per_basket && quantity >= product.limit_per_basket
                                ? `Maximum ${product.limit_per_basket} unit${product.limit_per_basket > 1 ? 's' : ''} allowed`
                                : ''
                            }
                          >
                            +
                          </button>
                        </div>
                        {product.limit_per_basket && (
                          <span className="text-xs text-white/60">
                            Max: {product.limit_per_basket}
                          </span>
                        )}
                        
                        <button
                          onClick={() => handleRemoveFromCart(product.id)}
                          className="text-red-400 hover:text-red-300 text-sm"
                        >
                          Remove
                        </button>
                      </div>
                      
                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Show original price with strikethrough if sale price exists */}
                          {product.sale_price && (
                            <span className="text-sm text-white/60 line-through font-normal">
                              {formatPrice(product.price * quantity)}
                            </span>
                          )}
                          <div className="text-lg font-bold">
                            {formatPrice((product.sale_price 
                              ? product.sale_price 
                              : (product.sellingPrice || product.finalPrice || product.price || 0)) * quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/5 rounded-lg p-6 sticky top-8 shadow-lg">
              <h3 className="text-xl font-bold mb-6">Order Summary</h3>
              
              {/* Coupon Section */}
              <div className="bg-white/5 rounded-lg p-4 mb-6">
                <button 
                  onClick={() => setCouponExpanded(!couponExpanded)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h4 className="text-sm font-medium text-white">Have a coupon?</h4>
                  <svg 
                    className={`w-4 h-4 text-white transition-transform ${couponExpanded ? 'rotate-180' : ''}`}
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {couponExpanded && (
                  <div className="flex gap-2 mt-3">
                    <input 
                      type="text" 
                      placeholder="Enter coupon code"
                      className="flex-1 p-2 bg-white/10 border border-white/20 rounded text-white text-sm placeholder-white/50 focus:border-[#153e90] focus:outline-none"
                    />
                    <button 
                      className="px-4 py-2 bg-white/10 border border-white/20 rounded text-white text-sm hover:bg-white/20 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>
                    {currencyLoading ? (
                      <div className="inline-flex items-center">
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span className="ml-2 text-sm">Loading...</span>
                      </div>
                    ) : (
                      formatPrice(subtotal)
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Tax</span>
                  <span>{formatPrice(0)}</span>
                </div>
                <div className="border-t border-white/10 pt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      {currencyLoading ? (
                        <div className="inline-flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span className="ml-2">Loading...</span>
                        </div>
                      ) : (
                        formatPrice(total)
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleCheckout}
                disabled={currencyLoading || cartProducts.length === 0}
                className={`w-full py-3 text-white font-semibold rounded-lg transition-opacity mb-4 ${
                  currencyLoading || cartProducts.length === 0
                    ? 'bg-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-[#99b476] to-[#29adb2] hover:opacity-90'
                }`}
              >
                {currencyLoading ? 'Loading Currency...' : 'Proceed to Checkout'}
              </button>
              
              <a
                href="/"
                className="block w-full py-3 bg-white/10 text-white text-center rounded-lg hover:bg-white/15 transition-colors"
              >
                Continue Shopping
              </a>
            </div>
          </div>
        </div>
      )}
    </EcommerceLayout>
  );
}