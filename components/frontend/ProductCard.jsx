import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { createPortal } from 'react-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';
import { useCartWishlist } from '../../hooks/useCartWishlist';
import { useWishlist } from '../../hooks/useWishlist';
import { useCurrency } from '../../hooks/useCurrency';
import { handleApiSuccess, handleApiError } from '../../lib/errorHandler';
import { getProductImageUrl, getProductImageAlt } from '../../lib/imageUtils';

import AddToCartModal from './AddToCartModal';
import DiscountLabel from './DiscountLabel';
import dynamic from 'next/dynamic';

function ProductCardClient({
  product,
  index = 0,
  viewMode = 'grid'
}) {
  const router = useRouter();
  const { 
    addToCart, 
    isInCart,
    cartCount 
  } = useCartWishlist();
  const {
    toggleWishlist,
    isInWishlist
  } = useWishlist();
  const {
    formatPrice: formatCurrencyPrice,
    currentCurrency
  } = useCurrency();
  
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [platformIcon, setPlatformIcon] = useState(null);

  useEffect(() => {
    setIsMounted(true);
    fetchPlatformIcon();
  }, [product.platform]);

  const fetchPlatformIcon = async () => {
    if (!product.platform) return;
    
    try {
      // Try fetch first, fallback to XMLHttpRequest if needed
      let platforms;
      
      try {
        const response = await fetch('/api/admin/attributes/platforms', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          platforms = await response.json();
        } else {
          throw new Error(`Fetch failed with status: ${response.status}`);
        }
      } catch (fetchError) {
        // Fallback to XMLHttpRequest with better error handling
        platforms = await new Promise((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', '/api/admin/attributes/platforms', true);
          xhr.setRequestHeader('Accept', 'application/json');
          
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              if (xhr.status >= 200 && xhr.status < 300) {
                try {
                  const result = JSON.parse(xhr.responseText);
                  resolve(result);
                } catch (parseError) {
                  reject(new Error('Failed to parse JSON response'));
                }
              } else if (xhr.status === 0) {
                // Status 0 typically means request was aborted or network issue
                reject(new Error('Network request aborted or failed'));
              } else {
                reject(new Error(`Request failed with status: ${xhr.status}`));
              }
            }
          };
          
          xhr.onerror = () => reject(new Error('Network error'));
          xhr.timeout = 5000; // Reduced timeout
          xhr.ontimeout = () => reject(new Error('Request timeout'));
          xhr.send();
        });
      }
      
      if (platforms && Array.isArray(platforms)) {
        const platformData = platforms.find(p => 
          p.title && p.title.toLowerCase() === product.platform.toLowerCase()
        );
        
        if (platformData && platformData.icon_url) {
          setPlatformIcon(platformData.icon_url);
        }
      }
    } catch (error) {
      // Silently fail for platform icons - not critical for functionality
      // console.error('Error fetching platform icon:', error);
    }
  };

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    
    if (isAddingToCart) return;
    setIsAddingToCart(true);

    try {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Adding to cart:', product);
      }
      if (typeof addToCart === 'function') {
        const success = addToCart(product);
        if (process.env.NODE_ENV !== 'test') {
          console.log('Add to cart result:', success);
        }
        
        if (success) {
          setShowCartModal(true);
        } else {
          handleApiError(new Error('Failed to add item to cart'));
        }
      } else {
        console.warn('addToCart function not available in test environment');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      handleApiError(error, 'Error adding item to cart');
    } finally {
      setTimeout(() => setIsAddingToCart(false), 500);
    }
  };

  const handleToggleWishlist = async (e) => {
    e.stopPropagation();
    
    if (isTogglingWishlist) return;
    setIsTogglingWishlist(true);

    try {
      if (process.env.NODE_ENV !== 'test') {
        console.log('Clicking wishlist button for product:', product.id, 'Currently in wishlist:', productIsInWishlist);
      }
      if (typeof toggleWishlist === 'function') {
        const result = await toggleWishlist(product);
        console.log('Toggle result:', result);
        if (result && !result.success) {
          console.error('Failed to update wishlist:', result.error);
        }
      } else {
        // Silently handle test environment - no console warnings needed
        if (process.env.NODE_ENV !== 'test') {
          console.warn('toggleWishlist function not available');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    } finally {
      setIsTogglingWishlist(false);
    }
  };

  const productIsInCart = isMounted ? isInCart(product.id) : false;
  const productIsInWishlist = isMounted ? isInWishlist(product.id) : false;

  // Generate product slug from name using same logic as API
  const generateSlug = (name) => {
    if (!name) return '';
    return name.toLowerCase().replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  };

  const handleProductClick = () => {
    // Generate slug from product name to match API lookup logic
    const slug = generateSlug(product.name);
    const identifier = slug || product.kinguinid || product.id;
    router.push(`/product/${identifier}`);
  };

  const formatPrice = (price) => {
    // Handle null, undefined, or invalid price values
    if (!price || isNaN(price)) {
      return formatCurrencyPrice(0);
    }
    // Use real currency conversion
    return formatCurrencyPrice(price);
  }

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!product.sale_price || !product.price) return 0;
    const originalPrice = parseFloat(product.price);
    const salePrice = parseFloat(product.sale_price);
    if (salePrice >= originalPrice) return 0;
    return Math.round(((originalPrice - salePrice) / originalPrice) * 100);
  };

  // Get final price - use only the calculated price column
  const getFinalPrice = () => {
    return product.price || 0;
  };

  // Get original price - use only the calculated price column
  const getOriginalPrice = () => {
    return product.price || 0;
  };

  if (viewMode === 'list') {
    return (
      <div 
        className="flex items-center bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-4 cursor-pointer hover:bg-white/20 transition-all duration-200"
        onClick={handleProductClick}
      >
        {/* List Image - No background */}
        <div className="w-24 h-24 flex-shrink-0 mr-4 relative overflow-visible">
          <img 
            src={getProductImageUrl(product)} 
            alt={getProductImageAlt(product)}
            className="w-full h-full object-cover rounded-lg"
            onError={(e) => {
              e.currentTarget.src = '/placeholder-game.svg';
            }}
          />
          {getDiscountPercentage() > 0 && (
            <div className="absolute top-0 left-0 z-50">
              <DiscountLabel discount={getDiscountPercentage()} />
            </div>
          )}
        </div>
        
        {/* List Content */}
        <div className="flex-1">
          <h3 className="text-white font-semibold text-lg mb-1">{String(product.name || '')}</h3>
          <p className="text-white/70 text-sm mb-2">{String(product.platform || '')} • {String(product.region || '')}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Show original price with strikethrough if sale price exists and place it before sale price */}
              {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) && (
                <span className="text-sm text-white/60 line-through font-normal">
                  {formatPrice(product.price)}
                </span>
              )}
              <span className="text-lg font-bold text-[#c5e898]">
                {product.sale_price && parseFloat(product.sale_price) < parseFloat(product.price) 
                  ? formatPrice(product.sale_price)
                  : formatPrice(product.price)
                }
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleToggleWishlist}
                className="p-2 bg-transparent border border-white/20 rounded hover:bg-[#153E90] transition-colors"
              >
{productIsInWishlist ? (
                  // Trash/Delete icon when in wishlist
                  <svg 
                    className="h-4 w-4 text-white/90"
                    viewBox="0 0 24 24" 
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path 
                      d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
                      stroke="currentColor" 
                      strokeWidth="1.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  // Heart icon when not in wishlist
                  <svg 
                    className="h-4 w-4 text-white/60"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path 
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                )}
              </button>
              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`px-4 py-2 text-white rounded transition-all flex items-center gap-2 ${
                  productIsInCart 
                    ? 'bg-green-600' 
                    : isAddingToCart 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-[#99b476] to-[#29adb2] hover:opacity-90'
                }`}
              >
                <FontAwesomeIcon icon={faCartPlus} />
                {String(isAddingToCart ? 'Adding...' : productIsInCart ? 'In Cart' : 'Add to Cart')}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
    <article 
      className="product-card sm:mt-8 sm:mb-8 md:mt-12 md:mb-12 lg:mt-[60px] lg:mb-[60px] mt-[50px] mb-[50px] cursor-pointer"
      style={{ animationDelay: `${50 * index}ms` }}
      onClick={handleProductClick}
    >
      {/* Favorite Button */}
      <div className="product-card__fav-btn" data-action="favorite">
        <button
          onClick={handleToggleWishlist}
          disabled={isTogglingWishlist}
          className={`fav-button ${isTogglingWishlist ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
{productIsInWishlist ? (
            // Trash/Delete icon when in wishlist - WHITE COLOR
            <svg 
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14zM10 11v6M14 11v6" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            // Heart icon when not in wishlist - WHITE COLOR
            <svg 
              className="h-5 w-5 text-white"
              viewBox="0 0 24 24" 
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          )}
        </button>
      </div>
      {/* No discount badge - final_price is selling price, price is purchase price */}
      {/* Product Image */}
      <div className="product-card__cover relative overflow-visible">
        <img 
          src={getProductImageUrl(product)} 
          alt={getProductImageAlt(product)}
          className="w-full h-full object-cover rounded-lg"
          loading={index < 8 ? "eager" : "lazy"}
          fetchPriority={index < 4 ? "high" : "low"}
          onError={(e) => {
            e.currentTarget.src = '/placeholder-game.svg';
          }}
        />
        {getDiscountPercentage() > 0 && (
          <div className="absolute top-0 left-0 z-50">
            <DiscountLabel discount={getDiscountPercentage()} />
          </div>
        )}
      </div>
      {/* Product Name */}
      <p className="product-card__title">{String(product.name || '')}</p>
      {/* Bottom Section - Price and Cart */}
      <div className="product-card__bottom">
        <div className="product-card__price-wrapper flex items-center">
          {/* Show sale price first (main price) and original price with strikethrough on same line */}
          <h3 className="product-card__discount-price">
            {product.sale_price 
              ? formatPrice(product.sale_price)
              : formatPrice(product.price)
            }
          </h3>
          {product.sale_price && (
            <span className="text-xs text-white/60 line-through font-normal ml-2">
              {formatPrice(product.price)}
            </span>
          )}
        </div>

        <button
          className={`product-card__cart-btn ${
            productIsInCart ? 'bg-green-600' : isAddingToCart ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          data-action="cart"
          onClick={handleAddToCart}
          disabled={isAddingToCart}
          title={productIsInCart ? 'Already in cart' : 'Add to cart'}
        >
          <FontAwesomeIcon 
            icon={faCartPlus} 
            className={`h-6 w-6 ${isAddingToCart ? 'animate-pulse' : ''}`} 
          />
        </button>
      </div>
      {/* Platform Info - Simplified */}
      <div className="product-card__platforms-wrapper">
        <div className="product-card__platforms">
          <img src="/instant_delivery.svg" alt="Instant Delivery" className="h-6 w-6" title="Instant Delivery" />
          <img src="/key.svg" alt="Digital Key" className="h-6 w-6" title="Digital Key" />
          {platformIcon ? (
            <img 
              src={platformIcon} 
              alt={String(`${product.platform || ''} Platform`)} 
              className="h-6 w-6" 
              title={String(`${product.platform || ''} Platform`)}
              onError={(e) => {
                e.currentTarget.src = '/steam.svg';
              }}
            />
          ) : (
            <img src="/steam.svg" alt="Platform" className="h-6 w-6" title="Platform" />
          )}
        </div>
      </div>

    </article>
    
    {/* Modal rendered using portal to escape container boundaries */}
    {showCartModal && typeof window !== 'undefined' && createPortal(
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cartCount={cartCount}
      />,
      document.body
    )}
    </>
  );
}

// Export a dynamic component that only renders on client
export function ProductCard(props) {
  const [isMounted, setIsMounted] = useState(false);
  
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  if (!isMounted) {
    // Return a placeholder during SSR that matches the structure
    return (
      <article 
        className="product-card sm:mt-8 sm:mb-8 md:mt-12 md:mb-12 lg:mt-[60px] lg:mb-[60px] mt-[50px] mb-[50px] cursor-pointer"
        style={{ animationDelay: `${50 * (props.index || 0)}ms` }}
      >
        {/* Basic placeholder structure */}
        <div className="product-card__fav-btn" data-action="favorite">
          <button className="fav-button">
            <svg className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" 
                fill="white" stroke="white" strokeWidth="2" />
            </svg>
          </button>
        </div>
        <div className="product-card__cover">
          <img 
            src={props.product ? getProductImageUrl(props.product) : '/placeholder-game.svg'} 
            alt={String(props.product ? getProductImageAlt(props.product) : 'Product')}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
        <p className="product-card__title">{String(props.product?.name || 'Loading...')}</p>
        <div className="product-card__bottom">
          <div className="product-card__price-wrapper">
            <h3 className="product-card__discount-price">
              ${String(props.product?.final_price || props.product?.finalPrice || props.product?.price || '0.00')}
            </h3>
          </div>
          <button className="product-card__cart-btn" disabled>
            <FontAwesomeIcon icon={faCartPlus} className="h-6 w-6" />
          </button>
        </div>
        <div className="product-card__platforms-wrapper">
          <div className="product-card__platforms">
            <img src="/instant_delivery.svg" alt="Instant Delivery" className="h-6 w-6" />
            <img src="/key.svg" alt="Digital Key" className="h-6 w-6" />
            <img src="/steam.svg" alt="Platform" className="h-6 w-6" />
          </div>
        </div>
      </article>
    );
  }
  
  return <ProductCardClient {...props} />;
}

export default ProductCard;