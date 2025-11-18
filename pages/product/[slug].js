import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from 'next/head';
import MainLayout from '../../components/layout/MainLayout';
import BreadcrumbNavigation from '../../components/frontend/BreadcrumbNavigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import ProductCard from '../../components/frontend/ProductCard';
import CircularProgressScore from '../../components/frontend/CircularProgressScore';
import AddToCartModal from '../../components/frontend/AddToCartModal';
import DiscountLabel from '../../components/frontend/DiscountLabel';
import { useCartWishlist } from '../../hooks/useCartWishlist';
import { useWishlist } from '../../hooks/useWishlist';
import { useCurrency } from '../../hooks/useCurrency';
import { useAuth } from '../../hooks/useAuth';
import { getProductImageUrl, getProductImageAlt, getProductScreenshots } from '../../lib/imageUtils';

import 'swiper/css';
import 'swiper/css/autoplay';

import { Heart, ShoppingCart, ArrowLeft, ArrowRight, Globe, Calendar, Shield, CreditCard, Truck, CheckCircle, X, Eye } from "lucide-react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashCan } from '@fortawesome/free-solid-svg-icons';

// Screenshots Carousel Component
// Region Modal Component
function RegionModal({ isOpen, onClose, product, userCountry = "Poland" }) {
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  // Country code to name mapping (simplified - in production use a complete mapping)
  const countryCodeToName = {
    'US': 'United States', 'GB': 'United Kingdom', 'DE': 'Germany', 'FR': 'France',
    'IT': 'Italy', 'ES': 'Spain', 'PL': 'Poland', 'CA': 'Canada', 'AU': 'Australia',
    'JP': 'Japan', 'BR': 'Brazil', 'MX': 'Mexico', 'IN': 'India', 'CN': 'China',
    'RU': 'Russia', 'KR': 'South Korea', 'NL': 'Netherlands', 'SE': 'Sweden',
    'NO': 'Norway', 'DK': 'Denmark', 'FI': 'Finland', 'BE': 'Belgium', 'CH': 'Switzerland',
    'AT': 'Austria', 'PT': 'Portugal', 'IE': 'Ireland', 'CZ': 'Czech Republic',
    'HU': 'Hungary', 'GR': 'Greece', 'TR': 'Turkey', 'IL': 'Israel', 'ZA': 'South Africa',
    'EG': 'Egypt', 'NG': 'Nigeria', 'KE': 'Kenya', 'GH': 'Ghana', 'MA': 'Morocco',
    'DZ': 'Algeria', 'TN': 'Tunisia', 'LY': 'Libya', 'SD': 'Sudan', 'ET': 'Ethiopia',
    'UG': 'Uganda', 'TZ': 'Tanzania', 'RW': 'Rwanda', 'BF': 'Burkina Faso',
    'ML': 'Mali', 'NE': 'Niger', 'TD': 'Chad', 'CM': 'Cameroon', 'CF': 'Central African Republic',
    'GA': 'Gabon', 'CG': 'Congo', 'CD': 'Democratic Republic of Congo', 'AO': 'Angola',
    'ZM': 'Zambia', 'ZW': 'Zimbabwe', 'BW': 'Botswana', 'NA': 'Namibia', 'SZ': 'Eswatini',
    'LS': 'Lesotho', 'MG': 'Madagascar', 'MU': 'Mauritius', 'SC': 'Seychelles',
    'KM': 'Comoros', 'MZ': 'Mozambique', 'MW': 'Malawi', 'ZM': 'Zambia'
  };

  const isRegionFree = product.regionallimitations?.toLowerCase().includes('free');
  
  // Get restricted countries
  const restrictedCountries = product.countrylimitation || [];
  
  // Generate all countries list (in production, use a complete list)
  const allCountries = Object.values(countryCodeToName);
  
  // Calculate allowed countries (all countries minus restricted ones)
  const allowedCountries = isRegionFree ? 
    ['All countries worldwide'] : 
    allCountries.filter(country => {
      const countryCode = Object.keys(countryCodeToName).find(key => countryCodeToName[key] === country);
      return !restrictedCountries.includes(countryCode);
    });

  const filteredCountries = allowedCountries.filter(country =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-lg mx-auto">
        <div 
          className="rounded-2xl p-4 sm:p-6 max-h-[80vh] overflow-hidden"
          style={{
            backgroundColor: '#153E90',
            border: '1px solid rgba(160, 200, 250, 0.2)'
          }}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6 pr-8">
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <h2 className="text-sm sm:text-lg font-bold text-white leading-tight">
              This version of product can be activated in {isRegionFree ? 'All Regions' : (product.regionallimitations || 'Unknown Region')}
            </h2>
          </div>

          {/* Region Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-6">
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-1">The product region is restricted to:</p>
              <p className="text-white font-semibold text-sm sm:text-base">
                {isRegionFree ? 'Global' : (product.regionallimitations || 'Global')}
              </p>
            </div>
            <div>
              <p className="text-white/70 text-xs sm:text-sm mb-1">Your country:</p>
              <p className="text-white font-semibold text-sm sm:text-base">{userCountry}</p>
            </div>
          </div>

          {/* Countries List */}
          <div className="mb-3 sm:mb-4">
            <p className="text-white font-semibold mb-2 sm:mb-3 text-sm sm:text-base">
              {isRegionFree ? 
                'This product works in all countries. No regional limitations apply.' :
                'List of allowed countries for this product version:'
              }
            </p>
            
            {!isRegionFree && (
              <div className="mb-2 sm:mb-3">
                <input
                  type="text"
                  placeholder="Search country"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-white/40 text-sm sm:text-base"
                />
              </div>
            )}
          </div>

          {/* Country Grid */}
          {!isRegionFree && (
            <div className="max-h-48 sm:max-h-60 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1 sm:gap-2">
                {filteredCountries.map((country, index) => (
                  <div key={index} className="text-white text-xs sm:text-sm py-1">
                    {country}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ScreenshotsCarousel({ screenshots, onImageClick }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const imagesPerView = 4;
  const maxIndex = Math.max(0, screenshots.length - imagesPerView);

  const goToPrevious = () => {
    setCurrentIndex(Math.max(0, currentIndex - imagesPerView));
  };

  const goToNext = () => {
    setCurrentIndex(Math.min(maxIndex, currentIndex + imagesPerView));
  };

  const visibleScreenshots = screenshots.slice(currentIndex, currentIndex + imagesPerView);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
      <div className="relative">
        {/* Navigation Buttons positioned at center height of first and fourth images */}
        {screenshots.length > imagesPerView && (
          <>
            {/* Left Navigation Button - Center of first image */}
            {currentIndex > 0 && (
              <button
                onClick={goToPrevious}
                className="absolute top-1/2 left-2 w-10 h-10 bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full flex items-center justify-center z-20 shadow-lg border-2 border-white/30"
                style={{ transform: 'translateY(-50%)' }}
                aria-label="Previous screenshots"
              >
                <ArrowLeft className="w-5 h-5 text-white" />
              </button>
            )}

            {/* Right Navigation Button - Center of fourth image */}
            {currentIndex < maxIndex && (
              <button
                onClick={goToNext}
                className="absolute top-1/2 right-2 w-10 h-10 bg-gradient-to-r from-[#99b476] to-[#29adb2] rounded-full flex items-center justify-center z-20 shadow-lg border-2 border-white/30"
                style={{ transform: 'translateY(-50%)' }}
                aria-label="Next screenshots"
              >
                <ArrowRight className="w-5 h-5 text-white" />
              </button>
            )}
          </>
        )}

        {/* Screenshots Container - Full width grid */}
        <div className="grid grid-cols-4 gap-2">
          {visibleScreenshots.map((screenshot, index) => (
            <div 
              key={currentIndex + index}
              className="aspect-video rounded-lg overflow-hidden cursor-pointer group relative"
              onClick={() => onImageClick(screenshot)}
            >
              <img
                src={screenshot}
                alt={`Screenshot ${currentIndex + index + 1}`}
                className="w-full h-full object-cover transition-transform group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-game.svg';
                }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          ))}

          {/* Fill empty slots if less than 4 images */}
          {visibleScreenshots.length < imagesPerView && Array.from({ length: imagesPerView - visibleScreenshots.length }).map((_, index) => (
            <div key={`empty-${index}`} className="aspect-video rounded-lg bg-white/5"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProductPage({ product: initialProduct, recommendedProducts: initialRecommended }) {
  const router = useRouter();
  const { slug } = router.query;
  const { formatPrice } = useCurrency();
  const [product, setProduct] = useState(initialProduct);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomImage, setZoomImage] = useState(null);
  const [recommendedProducts, setRecommendedProducts] = useState(initialRecommended || []);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showLanguagePopup, setShowLanguagePopup] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  
  // Use hooks for cart and wishlist management - only when product exists
  const { addToCart, removeFromCart, isInCart, cartCount } = useCartWishlist();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user, isAuthenticated } = useAuth();
  
  // State for cart and wishlist status
  const [productInCart, setProductInCart] = useState(false);
  const [productInWishlist, setProductInWishlist] = useState(false);
  const [showCartModal, setShowCartModal] = useState(false);
  const [showRegionModal, setShowRegionModal] = useState(false);
  const [platformIcon, setPlatformIcon] = useState(null);

  // Responsive screen size detection
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    // Check on mount
    checkScreenSize();
    
    // Listen for resize events
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Click outside to close language popup on mobile
  useEffect(() => {
    if (!showLanguagePopup || isDesktop) return;
    
    const handleClickOutside = (event) => {
      if (!event.target.closest('.language-popup-container')) {
        setShowLanguagePopup(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showLanguagePopup, isDesktop]);

  // Update cart/wishlist status when product changes
  useEffect(() => {
    if (product && product.id) {
      setProductInCart(isInCart(product.id.toString()));
      setProductInWishlist(isInWishlist(product.id.toString()));
    }
  }, [product]);

  // Calculate discount percentage
  const getDiscountPercentage = () => {
    if (!product || !product.sale_price || !product.price) return 0;
    
    const regularPrice = parseFloat(product.price);
    const salePrice = parseFloat(product.sale_price);
    
    if (salePrice >= regularPrice || salePrice <= 0 || regularPrice <= 0) return 0;
    
    return Math.round(((regularPrice - salePrice) / regularPrice) * 100);
  };

  // Listen for cart updates from the cart manager
  useEffect(() => {
    if (typeof window === 'undefined' || !product) return;

    const handleCartUpdate = () => {
      setProductInCart(isInCart(product.id.toString()));
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    
    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [product, isInCart]);

  // Fetch product data from API using slug
  useEffect(() => {
    if (!slug) return;

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/products?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error('Product not found');
        }
        
        const data = await response.json();
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        console.log('📸 API Response Screenshots:', data.screenshotUrls?.length || 0, 'screenshots found');
        console.log('🖥️ API Response System Requirements:', data.systemRequirements?.length || 0, 'sections found');

        const mappedProduct = {
          ...data,
          final_price: data.price,
          cover_url: data.coverUrl || data.cover_url,
          cover_thumbnail: data.coverThumbnail || data.cover_thumbnail,
          screenshot_urls: data.screenshotUrls || data.screenshot_urls || [],
          screenshots: data.screenshotUrls || data.screenshot_urls || [], // Add this for direct access
          release_date: data.releaseDate || data.release_date,
          ageRating: data.ageRating || data.age_rating,
          in_stock: data.inStock !== undefined ? data.inStock : data.in_stock,
          original_name: data.originalName || data.original_name,
          system_requirements: data.systemRequirements || data.system_requirements || [],
          systemRequirements: data.systemRequirements || data.system_requirements || [], // Add this for direct access
          note: data.product_note || data.note,
          note_title_1: data.note_title_1,
          note_title_2: data.note_title_2
        };
        
        setProduct(mappedProduct);
        setError(null);
      } catch (err) {
        setError(err.message);
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  // Fetch platform icon based on product platform
  useEffect(() => {
    const fetchPlatformIcon = async () => {
      if (!product?.platform) return;
      
      try {
        const response = await fetch('/api/admin/attributes/platforms');
        const platforms = await response.json();
        const platformData = platforms.find(p => 
          p.title.toLowerCase() === product.platform.toLowerCase()
        );
        
        if (platformData && platformData.icon_url) {
          setPlatformIcon(platformData.icon_url);
        }
      } catch (error) {
        console.error('Error fetching platform icon:', error);
      }
    };

    fetchPlatformIcon();
  }, [product?.platform]);

  // This effect is no longer needed as cart and wishlist status are handled by hooks

  // Recommended products are fetched server-side with random=true for better performance

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      if (productInCart) {
        // Remove from cart if already in cart
        removeFromCart(product.id.toString());
      } else {
        // Add to cart if not in cart
        const success = addToCart(product);
        if (success) {
          setShowCartModal(true);
        }
      }
      // State will be updated automatically via the cartUpdated event listener
    } catch (error) {
      console.error('Error handling cart operation:', error);
    }
  };

  const handleToggleWishlist = async () => {
    if (!product) return;
    
    try {
      const result = await toggleWishlist(product);
      if (result.success) {
        console.log(`Product ${result.action} wishlist successfully`);
      } else {
        console.error('Failed to update wishlist:', result.error);
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    
    try {
      // Check if user is authenticated
      if (!isAuthenticated) {
        // Redirect to login page if not authenticated
        router.push('/auth/login');
        return;
      }
      
      // Add to cart first
      await addToCart(product);
      
      // Redirect to checkout
      router.push('/checkout');
    } catch (error) {
      console.error('Error in buy now process:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#153E90] pt-0 md:pt-10 lg:pt-24">
        <div className="max-w-[1400px] mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-white/20 rounded mb-4 w-3/4"></div>
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="aspect-[3/4] bg-white/20 rounded-lg mb-6"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-white/20 rounded w-full"></div>
                  <div className="h-4 bg-white/20 rounded w-2/3"></div>
                </div>
              </div>
              <div className="lg:w-[320px]">
                <div className="h-64 bg-white/20 rounded-lg"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
        <MainLayout
          title="Product Not Found | Gamava Gaming Store"
          description="The product you're looking for doesn't exist or has been removed."
          includeFooter={true}
        >
        <div className="max-w-[1400px] mx-auto px-4 py-8 mt-[150px]">
          <div className="text-center text-white">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p>The product you're looking for doesn't exist or has been removed.</p>
          </div>
        </div>
        </MainLayout>
    );
  }

  // Extract screenshots using centralized hierarchical fallback logic
  let validScreenshots = getProductScreenshots(product);
  
  // Priority: Use API-provided screenshots first
  if (product.screenshots && Array.isArray(product.screenshots) && product.screenshots.length > 0) {
    validScreenshots = product.screenshots;
    console.log('✅ Using API screenshots:', validScreenshots.length);
  } else if (product.screenshotUrls && Array.isArray(product.screenshotUrls) && product.screenshotUrls.length > 0) {
    validScreenshots = product.screenshotUrls;
    console.log('✅ Using API screenshotUrls:', validScreenshots.length);
  } else {
    console.log('🔄 Fallback to imageUtils extraction:', validScreenshots.length);
  }
  
  // If no screenshots found, use cover image as fallback
  if (validScreenshots.length === 0) {
    const coverImage = getProductImageUrl(product);
    if (coverImage !== '/placeholder-game.svg') {
      validScreenshots = [coverImage];
      console.log('📷 Using cover image as screenshot fallback');
    }
  }
  
  console.log('🎬 Final screenshots for display:', validScreenshots.length);

  const openZoom = (imageUrl) => {
    setZoomImage(imageUrl);
  };

  const closeZoom = () => {
    setZoomImage(null);
  };

  const navigateZoom = (direction) => {
    if (!zoomImage) return;
    
    const currentIndex = validScreenshots.indexOf(zoomImage);
    let newIndex;
    
    if (direction === 'next') {
      newIndex = currentIndex + 1 >= validScreenshots.length ? 0 : currentIndex + 1;
    } else {
      newIndex = currentIndex - 1 < 0 ? validScreenshots.length - 1 : currentIndex - 1;
    }
    
    setZoomImage(validScreenshots[newIndex]);
  };

  return (
    <MainLayout
      title={`${product ? product.name : 'Loading...'} | Gamava Gaming Store`}
      description={product ? product.description?.substring(0, 160) : 'Gaming product details'}
      includeFooter={true}
    >
      
      {/* Breadcrumb Navigation */}
      <BreadcrumbNavigation productName={product.name} />
      
      <div className="max-w-[1400px] mx-auto px-4 py-4 md:py-8">
        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 w-full">
          
          {/* Left Column - Content */}
          <div className="flex-1 lg:max-w-[calc(100%-340px)] lg:pr-8">
            
            {/* Product Header - Image and Info Side by Side */}
            <div className="flex flex-col lg:flex-row gap-6 mb-10">
              
              {/* Product Image with Discount Badge */}
              <div className="flex-shrink-0">
                <div className="w-full sm:w-60 md:w-80 lg:w-[300px] mx-auto lg:mx-0 aspect-[3/4] relative rounded-lg overflow-hidden">
                  <img
                    src={getProductImageUrl(product)}
                    alt={getProductImageAlt(product)}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-game.svg';
                    }}
                  />
                  
                  {/* Discount Badge */}
                  {getDiscountPercentage() > 0 && (
                    <div className="absolute top-0 left-0 z-50">
                      <DiscountLabel discount={getDiscountPercentage()} />
                    </div>
                  )}

                </div>
              </div>

              {/* Product Title and Info */}
              <div className="flex-1">
                {/* Product Title */}
                <h1 className="text-white font-bold mb-4" style={{ fontSize: '24px' }}>
                  {product.name}
                </h1>

                {/* Product Type, Platform Badges and Genre Section */}
                <div className="flex items-center gap-3 mb-6 flex-wrap">
                  {/* Product Type Badge */}
                  <div className="bg-blue-500 text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg">
                    {(() => {
                      // First check if there's a pre-calculated product_type field
                      if (product.product_type && product.product_type !== 'BASE GAME') {
                        return product.product_type.charAt(0).toUpperCase() + product.product_type.slice(1).toLowerCase();
                      }
                      
                      // Dynamic determination from genres and name
                      const productName = product.name?.toLowerCase() || '';
                      const genres = product.genres || [];
                      
                      // Check for specific patterns
                      if (productName.includes('prepaid') || productName.includes('gift card')) return 'Prepaid';
                      if (productName.includes('dlc') || productName.includes('downloadable content')) return 'DLC';
                      if (productName.includes('expansion')) return 'Expansion';
                      if (productName.includes('bundle') || productName.includes(' pack')) return 'Bundle';
                      if (productName.includes('currency') || productName.includes('coins') || productName.includes('credits')) return 'In-game currency';
                      if (productName.includes('cs:go') && productName.includes('skin')) return 'CS:GO Skin';
                      if (product.platform === 'Software') return 'Software';
                      
                      // Check genres if available
                      if (Array.isArray(genres)) {
                        const genreString = genres.join(' ').toLowerCase();
                        if (genreString.includes('dlc')) return 'DLC';
                        if (genreString.includes('expansion')) return 'Expansion';
                        if (genreString.includes('bundle')) return 'Bundle';
                        if (genreString.includes('software')) return 'Software';
                        if (genreString.includes('prepaid')) return 'Prepaid';
                      }
                      
                      // Default to Base Game for most products
                      return 'Base Game';
                    })()}
                  </div>
                  
                  {/* Platform */}
                  <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-4 py-2 rounded-full font-medium text-sm shadow-lg">
                    {product.platform?.charAt(0).toUpperCase() + product.platform?.slice(1).toLowerCase()}
                  </div>
                  
                  {/* Genre */}
                  {product.genres && product.genres.length > 0 && (
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full font-medium text-sm shadow-lg">
                      {(() => {
                        const genre = Array.isArray(product.genres) ? product.genres[0] : product.genres;
                        return genre?.charAt(0).toUpperCase() + genre?.slice(1).toLowerCase();
                      })()}
                    </div>
                  )}
                  
                  {/* Animated Circular Metacritic Score - Hidden */}
                  {/* <CircularProgressScore 
                    score={product.metacritic_score || 90} 
                    label="Metascore"
                    size={70}
                    background={true}
                    productId={product.id}
                  /> */}
                </div>

                {/* Separator Line */}
                <div className="border-t border-gray-600 mb-6"></div>

                {/* Product Info Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
                  {/* Platform */}
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#153e8f' }}>
                      {platformIcon ? (
                        <img 
                          src={platformIcon} 
                          alt={`${product.platform} Platform`} 
                          className="w-6 h-6"
                          onError={(e) => {
                            e.currentTarget.src = '';
                            setPlatformIcon(null);
                          }}
                        />
                      ) : (
                        <Shield className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white/70 font-bold" style={{ fontSize: '20px' }}>platform</p>
                        {/* Activation Details Check Button - Show for all products, display message if no details */}
                        <button
                          onClick={() => setShowActivationModal(true)}
                          className="flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-400 transition-colors"
                          title="Check activation details"
                        >
                          !
                        </button>
                      </div>
                      <p className="text-sm text-white font-medium">{product.platform}</p>
                    </div>
                  </div>

                  {/* Delivery */}
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#153e8f' }}>
                      <Truck className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 font-bold" style={{ fontSize: '20px' }}>Delivery</p>
                      <p className="text-sm text-white font-medium">
                        {(() => {
                          if (product.shipping_time_unit === 'Instant Delivery') {
                            return 'Instant Delivery';
                          } else if (product.shipping_time_value && product.shipping_time_unit) {
                            return `${product.shipping_time_value} ${product.shipping_time_unit}`;
                          } else {
                            return 'Instant Delivery'; // Default fallback
                          }
                        })()}
                      </p>
                    </div>
                  </div>

                  {/* Release Date */}
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#153e8f' }}>
                      <Calendar className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-white/70 font-bold" style={{ fontSize: '20px' }}>Release Date</p>
                      <p className="text-sm text-white font-medium">
                        {product.release_date ? new Date(product.release_date).toLocaleDateString() : 'Not Available'}
                      </p>
                    </div>
                  </div>

                  {/* Region */}
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: '#153e8f' }}>
                      <Globe className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-white/70 font-bold" style={{ fontSize: '20px' }}>Region</p>
                        <button
                          onClick={() => setShowRegionModal(true)}
                          className="flex items-center justify-center w-4 h-4 bg-blue-500 text-white rounded-full text-xs font-bold hover:bg-blue-400 transition-colors"
                          title="Check region compatibility"
                        >
                          !
                        </button>
                      </div>
                      <p className="text-sm text-white font-medium">
                        {product.regionallimitations || 'Global'}
                      </p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            {/* Note Section */}
            {(product.note || product.note_title_1 || product.note_title_2) && (
              <div className="mt-10 mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Note</h2>
                </div>
                
                <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-1" style={{
                  border: '1px solid rgba(160, 200, 250, 0.2)'
                }}>
                  {/* Title 1 */}
                  {product.note_title_1 && (
                    <div className="mb-1">
                      <div className="text-white/90 text-base leading-2" style={{
                        fontSize: '16px',
                        lineHeight: '1.1'
                      }}>
                        {product.note_title_1}
                      </div>
                    </div>
                  )}
                  
                  {/* Title 2 */}
                  {product.note_title_2 && (
                    <div className="mb-1">
                      <div className="text-[#29adb2] font-bold text-lg uppercase tracking-wider border-b border-[#29adb2]/30 pb-1 mb-1" style={{
                        background: 'linear-gradient(135deg, rgba(41, 173, 178, 0.1) 0%, rgba(153, 180, 118, 0.1) 100%)',
                        padding: '4px 6px 2px 6px',
                        borderRadius: '8px',
                        borderLeft: '4px solid #29adb2'
                      }}>
                        {product.note_title_2}
                      </div>
                    </div>
                  )}
                  
                  {/* Main Note Content */}
                  {product.note && (
                    <div 
                      className="product-note text-white/90 text-base leading-5 space-y-1 max-w-none"
                      style={{
                        fontSize: '16px',
                        lineHeight: '1.3'
                      }}
                      dangerouslySetInnerHTML={{
                        __html: product.note
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {/* Description Section */}
            <div className="mt-10 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Description</h2>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6" style={{
                border: '1px solid rgba(160, 200, 250, 0.2)'
              }}>
                <div 
                  className={`product-description text-white/90 text-base leading-8 space-y-4 max-w-none overflow-hidden transition-all duration-300 ${
                    !showFullDescription ? 'line-clamp-5' : ''
                  }`}
                  style={{
                    fontSize: '16px',
                    lineHeight: '1.8',
                    maxHeight: showFullDescription ? 'none' : '9rem',
                    WebkitLineClamp: showFullDescription ? 'none' : 5,
                    WebkitBoxOrient: 'vertical',
                    display: showFullDescription ? 'block' : '-webkit-box'
                  }}
                  dangerouslySetInnerHTML={{
                    __html: product.description || '<p class="text-white/60 italic">No description available for this product.</p>'
                  }}
                />
                
                {/* Show More/Less Button */}
                {product.description && product.description.length > 400 && (
                  <div className="mt-4 flex justify-center">
                    <button
                      onClick={() => setShowFullDescription(!showFullDescription)}
                      className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-all duration-200 hover:opacity-80"
                      style={{
                        backgroundColor: '#153e8f',
                        border: '1px solid rgba(160, 200, 250, 0.2)'
                      }}
                    >
                      {showFullDescription ? 'Show Less' : 'Show More'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* New Screenshots Section */}
            {validScreenshots.length > 0 && (
              <div className="mt-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Screenshots</h2>
                </div>
                
                {/* Screenshots Carousel - Full width matching other page elements */}
                <ScreenshotsCarousel 
                  screenshots={validScreenshots}
                  onImageClick={openZoom}
                />
              </div>
            )}

            {/* Overview Section - Full Width */}
            <div className="mt-10 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Overview</h2>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6" style={{
                border: '1px solid rgba(160, 200, 250, 0.2)'
              }}>
            
            <div className="space-y-4">
              {/* Languages */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Languages</span>
                <div className="flex flex-wrap gap-2 relative">
                  {product.languages && product.languages.length > 0 ? (
                    <>
                      {/* Visible languages based on screen size */}
                      {product.languages.slice(0, isDesktop ? 8 : 4).map((lang, index) => (
                        <span key={index} className="px-2 py-1 bg-white/20 rounded text-sm text-white">
                          {lang}
                        </span>
                      ))}
                      
                      {/* Overflow indicator and popup */}
                      {product.languages.length > (isDesktop ? 8 : 4) && (
                        <div className="relative language-popup-container">
                          <span 
                            className="px-2 py-1 bg-white/30 rounded text-sm text-white cursor-pointer hover:bg-white/40 transition-colors"
                            onMouseEnter={isDesktop ? () => setShowLanguagePopup(true) : undefined}
                            onMouseLeave={isDesktop ? () => setShowLanguagePopup(false) : undefined}
                            onClick={!isDesktop ? () => setShowLanguagePopup(!showLanguagePopup) : undefined}
                          >
                            +{product.languages.length - (isDesktop ? 8 : 4)}
                          </span>
                          
                          {/* Popup with remaining languages */}
                          {showLanguagePopup && (
                            <div className="absolute top-full right-0 mt-2 p-3 bg-[#153E90] border border-white/20 rounded-lg shadow-lg z-50 min-w-48 max-w-xs backdrop-blur-sm">
                              <div className="flex flex-wrap gap-2">
                                {product.languages.slice(isDesktop ? 8 : 4).map((lang, index) => (
                                  <span key={index} className="px-2 py-1 bg-white/20 rounded text-sm text-white">
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="text-white/60">Not specified</span>
                  )}
                </div>
              </div>

              {/* Release Date */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Release Date</span>
                <span className="text-white">
                  {product.release_date ? new Date(product.release_date).toLocaleDateString() : 'Not Available'}
                </span>
              </div>

              {/* Developers */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Developer</span>
                <span className="text-white">
                  {product.developers && product.developers.length > 0 ? product.developers.join(', ') : 'Not specified'}
                </span>
              </div>

              {/* Publishers */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Publisher</span>
                <span className="text-white">
                  {product.publishers && product.publishers.length > 0 ? product.publishers.join(', ') : 'Not specified'}
                </span>
              </div>

              {/* Delivery */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3 border-b border-white/10">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Delivery</span>
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                    <Truck className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-white">
                    {(() => {
                      if (product.shipping_time_unit === 'Instant Delivery') {
                        return 'Instant Delivery';
                      } else if (product.shipping_time_value && product.shipping_time_unit) {
                        return `${product.shipping_time_value} ${product.shipping_time_unit}`;
                      } else {
                        return 'Instant Delivery'; // Default fallback
                      }
                    })()}
                  </span>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-col md:flex-row md:items-center justify-between py-3">
                <span className="text-white/70 font-medium mb-2 md:mb-0">Genres</span>
                <div className="flex flex-wrap gap-2">
                  {product.genres && product.genres.length > 0 ? (
                    product.genres.map((genre, index) => (
                      <span key={index} className="px-2 py-1 bg-white/20 rounded text-sm text-white">
                        {genre}
                      </span>
                    ))
                  ) : (
                    <span className="text-white/60">Not specified</span>
                  )}
                </div>
              </div>
              </div>
              </div>
            </div>

            {/* System Requirements Section - Full Width */}
            {product.systemRequirements && product.systemRequirements.length > 0 && (
              <div className="mt-10 mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">System Requirements</h2>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6" style={{
                  border: '1px solid rgba(160, 200, 250, 0.2)'
                }}>
                  <div className="space-y-6">
                    {(() => {
                      const sysReqs = product.systemRequirements || [];
                      // Filter to show only Windows requirements
                      const windowsReqs = sysReqs.filter(sysReq => {
                        // Check section name
                        const name = (sysReq.name || sysReq.type || '').toLowerCase();
                        
                        // Check system field value for Windows vs Mac/Linux
                        if (sysReq.system) {
                          const systemValue = sysReq.system.toLowerCase();
                          return systemValue.includes('windows');
                        }
                        
                        // Check if any requirement values contain Mac or Linux keywords to exclude them
                        if (sysReq.requirements && Array.isArray(sysReq.requirements)) {
                          const hasNonWindows = sysReq.requirements.some(req => {
                            const value = (req.value || '').toLowerCase();
                            return value.includes('mac') || value.includes('linux') || value.includes('os x');
                          });
                          if (hasNonWindows) return false;
                        }
                        
                        // Check direct property values for Mac/Linux keywords
                        const sysReqValues = Object.values(sysReq).join(' ').toLowerCase();
                        if (sysReqValues.includes('mac os') || sysReqValues.includes('linux') || sysReqValues.includes('os x')) {
                          return false;
                        }
                        
                        // Include if name suggests Windows or is generic
                        return name.includes('windows') || name === 'system requirements' || name === '';
                      });
                      
                      return windowsReqs.map((sysReq, index) => (
                        <div key={index}>
                          <h3 className="text-lg font-semibold text-white mb-4">
                            {sysReq.name || sysReq.type || 'Windows System Requirements'}
                          </h3>
                          <div className="space-y-3">
                            {/* Handle new admin form structure with requirements array */}
                            {sysReq.requirements && Array.isArray(sysReq.requirements) ? (
                              sysReq.requirements
                                .filter(req => req.type && req.value && req.value.trim() !== '')
                                .map((req, reqIndex) => {
                                  // Function to get the appropriate icon for each requirement type
                                  const getRequirementIcon = (type) => {
                                    const iconType = type.toLowerCase();
                                    if (iconType.includes('os') || iconType.includes('operating')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('processor') || iconType.includes('cpu')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M6 7h12v10H6V7zm2 2v6h8V9H8zm-6-7h2v4H2V2zm18 0h2v4h-2V2zM2 18h2v4H2v-4zm18 0h2v4h-2v-4zM9 2h2v2H9V2zm4 0h2v2h-2V2zm-4 18h2v2H9v-2zm4 0h2v2h-2v-2z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('memory') || iconType.includes('ram')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M6 7h12c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2zm1 2v6h10V9H7zm1 1h2v4H8v-4zm3 0h2v4h-2v-4zm3 0h2v4h-2v-4z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('graphics') || iconType.includes('gpu') || iconType.includes('video')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M21 3H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6l2 2 2-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 13V7h16v6H4zm14-4h-2V7h2v2zm-3 0h-2V7h2v2z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('directx') || iconType.includes('dx')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v10zm4 0V7l5 5-5 5z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('storage') || iconType.includes('disk') || iconType.includes('hdd') || iconType.includes('ssd')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                        </svg>
                                      );
                                    } else if (iconType.includes('sound') || iconType.includes('audio')) {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                        </svg>
                                      );
                                    } else {
                                      return (
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                        </svg>
                                      );
                                    }
                                  };

                                  return (
                                    <div key={reqIndex} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                                      <div className="flex items-center gap-3">
                                        <div className="w-6 h-6 rounded bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center flex-shrink-0">
                                          {getRequirementIcon(req.type)}
                                        </div>
                                        <span className="text-white/70 font-medium">{req.type}:</span>
                                      </div>
                                      <span className="text-white text-right ml-4">{req.value}</span>
                                    </div>
                                  );
                                })
                            ) : (
                              /* Handle old structure with requirement array for backward compatibility */
                              sysReq.requirement && sysReq.requirement.map((req, reqIndex) => (
                                <div key={reqIndex} className="space-y-2">
                                  {req.split(/(?=OS:|Processor:|Memory:|Graphics:|DirectX:|Storage:|Additional Notes:)/).filter(part => part.trim()).map((part, partIndex) => {
                                    const trimmedPart = part.trim();
                                    if (!trimmedPart) return null;
                                    
                                    // Extract label and value
                                    const colonIndex = trimmedPart.indexOf(':');
                                    if (colonIndex === -1) {
                                      return (
                                        <div key={partIndex} className="text-white/90">
                                          {trimmedPart}
                                        </div>
                                      );
                                    }
                                    
                                    const label = trimmedPart.substring(0, colonIndex).trim();
                                    const value = trimmedPart.substring(colonIndex + 1).trim();
                                    
                                    // Function to get the appropriate icon for each requirement type
                                    const getRequirementIcon = (type) => {
                                      const iconType = type.toLowerCase();
                                      if (iconType.includes('os') || iconType.includes('operating')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 4h18v2H3V4zm0 7h18v2H3v-2zm0 7h18v2H3v-2z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('processor') || iconType.includes('cpu')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 7h12v10H6V7zm2 2v6h8V9H8zm-6-7h2v4H2V2zm18 0h2v4h-2V2zM2 18h2v4H2v-4zm18 0h2v4h-2v-4zM9 2h2v2H9V2zm4 0h2v2h-2V2zm-4 18h2v2H9v-2zm4 0h2v2h-2v-2z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('memory') || iconType.includes('ram')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M6 7h12c1.1 0 2 .9 2 2v6c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V9c0-1.1.9-2 2-2zm1 2v6h10V9H7zm1 1h2v4H8v-4zm3 0h2v4h-2v-4zm3 0h2v4h-2v-4z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('graphics') || iconType.includes('gpu') || iconType.includes('video')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M21 3H3c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h6l2 2 2-2h6c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM4 13V7h16v6H4zm14-4h-2V7h2v2zm-3 0h-2V7h2v2z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('directx') || iconType.includes('dx')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 5-5v10zm4 0V7l5 5-5 5z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('storage') || iconType.includes('disk') || iconType.includes('hdd') || iconType.includes('ssd')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z"/>
                                          </svg>
                                        );
                                      } else if (iconType.includes('sound') || iconType.includes('audio')) {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                                          </svg>
                                        );
                                      } else {
                                        return (
                                          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                          </svg>
                                        );
                                      }
                                    };

                                    return (
                                      <div key={partIndex} className="flex items-center justify-between py-2 border-b border-white/10 last:border-b-0">
                                        <div className="flex items-center gap-3">
                                          <div className="w-6 h-6 rounded bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center flex-shrink-0">
                                            {getRequirementIcon(label)}
                                          </div>
                                          <span className="text-white/70 font-medium">{label}:</span>
                                        </div>
                                        <span className="text-white text-right ml-4">{value}</span>
                                      </div>
                                    );
                                  })}
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}



            {/* Restriction Section */}
            {(product.agerating || product.age_rating || product.ageRatingDetails?.title) && (
              <div className="mt-10 mb-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-white">Restriction</h2>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6" style={{
                  border: '1px solid rgba(160, 200, 250, 0.2)'
                }}>
                  
                  <div className="flex items-start gap-4">
                    {/* Age Rating Badge with Original Image */}
                    {product.ageRatingDetails?.icon_url ? (
                      <div className="flex-shrink-0">
                        <img 
                          src={product.ageRatingDetails.icon_url} 
                          alt={product.ageRatingDetails?.secondary_title || 'Age Rating'} 
                          className="w-16 h-16 object-contain"
                        />
                      </div>
                    ) : (
                      <div className="bg-red-600 text-white font-bold px-4 py-2 rounded-lg text-lg flex items-center gap-1 flex-shrink-0">
                        {(product.ageRatingDetails?.secondary || product.agerating || product.age_rating) === 'Ages 18+' || 
                         (product.ageRatingDetails?.title || product.agerating || product.age_rating) === 'PEGI 18' ? (
                          <>
                            <span className="text-3xl font-black">18</span>
                            <span className="text-xs">+</span>
                          </>
                        ) : (product.ageRatingDetails?.secondary || product.agerating || product.age_rating) === 'Mature 17+' || 
                             (product.ageRatingDetails?.title || product.agerating || product.age_rating) === 'ESRB M' ? (
                          <span className="text-2xl font-black">M</span>
                        ) : (
                          <span className="text-xl font-black">
                            {(product.ageRatingDetails?.secondary || product.agerating || product.age_rating || '18+').replace('Ages ', '').replace('PEGI ', '').replace('ESRB ', '')}
                          </span>
                        )}
                      </div>
                    )}
                    
                    {/* Age Rating Information */}
                    <div className="flex-1">
                      <h3 className="text-white font-bold text-lg mb-2">
                        {product.ageRatingDetails?.secondary_title || 'Ages 18+'}
                      </h3>
                      <p className="text-white/90 leading-relaxed">
                        {product.ageRatingDetails?.description || 'Content suitable only for adults. May contain graphic violence, strong language, sexual content, and drug use'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recommended Products Section */}
            <div className="mt-10 mb-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#99b476] to-[#29adb2] flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-white">Recommended</h2>
              </div>
              
              <div className="recommended-products-swiper">
                {recommendedProducts.length > 0 && (
                  <Swiper
                    modules={[Autoplay]}
                    spaceBetween={12}
                    slidesPerView={2}
                    loop={recommendedProducts.length >= 6}
                    breakpoints={{
                      640: {
                        slidesPerView: 3,
                        spaceBetween: 16,
                      },
                      1024: {
                        slidesPerView: 4,
                        spaceBetween: 20,
                      },
                    }}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    className="recommended-swiper"
                  >
                    {recommendedProducts.map((recommendedProduct, index) => (
                      <SwiperSlide key={recommendedProduct.id}>
                        <ProductCard
                          product={{
                            ...recommendedProduct,
                            id: recommendedProduct.id.toString()
                          }}
                          index={index}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                )}
              </div>
            </div>

          </div>

          {/* Right Column - Sticky Cart Sidebar */}
          <div className="hidden lg:block lg:w-[320px] lg:sticky lg:self-start" style={{ top: '230px' }}>
            <div className="p-5 rounded-[20px]" style={{
              background: 'linear-gradient(315deg, #084796, #0a55b3)',
              boxShadow: 'inset 32px 32px 49px #084898, inset -32px -32px 49px #0a56b6, 10px 12px 29px -7px rgba(0, 0, 0, 0.69)'
            }}>
              
              {/* Price Section */}
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center gap-2 sm:gap-3 mb-2">
                  {/* Show original price with strikethrough if sale price exists */}
                  {product.sale_price && (
                    <span className="text-lg text-white/60 line-through font-normal">
                      {formatPrice(product.price)}
                    </span>
                  )}
                  <span className="text-2xl sm:text-3xl font-bold text-white">
                    {product.sale_price 
                      ? formatPrice(product.sale_price)
                      : formatPrice(product.price)
                    }
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                <button
                  onClick={handleAddToCart}
                  className="w-full text-white py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-opacity hover:opacity-80"
                  style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
                >
                  {productInCart ? (
                    <FontAwesomeIcon 
                      icon={faTrashCan} 
                      className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline text-white drop-shadow-sm" 
                      style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                    />
                  ) : (
                    <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 inline" />
                  )}
                  {productInCart ? 'Remove from Cart' : 'Add to Cart'}
                </button>
                
                <button
                  onClick={handleToggleWishlist}
                  className="w-full border-white/20 text-white hover:bg-white/10 py-3 sm:py-4 text-sm sm:text-base font-semibold rounded-lg transition-colors bg-[#ffffff17] border"
                >
                  <Heart className={`w-4 h-4 sm:w-5 sm:h-5 mr-2 inline ${productInWishlist ? 'fill-current' : ''}`} />
                  {productInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              </div>

              {/* Selling Points */}
              <div className="rounded-lg p-4" style={{ backgroundColor: '#153e8f' }}>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-white text-sm">Friendly Return Policy</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-white text-sm">Fast Checkout Process</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-white flex-shrink-0" />
                    <span className="text-white text-sm">Convenient Payment Options</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Sticky Add to Cart Button */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#153E90] border-t border-white/10 p-4 lg:hidden z-50">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            {/* Price */}
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-2 flex-1">
              <button
                onClick={handleAddToCart}
                className="flex-1 border-white/20 text-white hover:bg-white/10 py-3 text-sm font-semibold rounded-lg transition-colors bg-[#ffffff17] border"
              >
                {productInCart ? (
                  <FontAwesomeIcon 
                    icon={faTrashCan} 
                    className="w-4 h-4 mr-1 inline text-white drop-shadow-sm" 
                    style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
                  />
                ) : (
                  <ShoppingCart className="w-4 h-4 mr-1 inline" />
                )}
                {productInCart ? 'Remove' : 'Add to Cart'}
              </button>
              
              <button
                onClick={handleBuyNow}
                className="flex-1 text-white py-3 text-sm font-semibold rounded-lg transition-opacity hover:opacity-80"
                style={{ background: 'linear-gradient(131deg, #99b476 0%, #29adb2 100%)' }}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Zoom Modal */}
      {zoomImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={closeZoom}
        >
          <div className="relative w-full h-full flex items-center justify-center">
            {/* Close Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeZoom();
              }}
              className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10 pt-[-5px] pb-[-5px] mt-[97px] mb-[97px]"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            
            {/* Navigation Buttons */}
            {validScreenshots.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateZoom('prev');
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigateZoom('next');
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors z-10"
                >
                  <ArrowRight className="w-6 h-6 text-white" />
                </button>
              </>
            )}
            
            {/* Image Counter */}
            {validScreenshots.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm z-10">
                {validScreenshots.indexOf(zoomImage) + 1} / {validScreenshots.length}
              </div>
            )}
            
            {/* Zoomed Image */}
            <img
              src={zoomImage}
              alt="Zoomed screenshot"
              className="max-w-[80%] max-h-[80%] object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder-game.jpg';
              }}
            />
          </div>
        </div>
      )}
      
      {/* Add to Cart Modal */}
      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        cartCount={cartCount}
      />

      {/* Region Modal */}
      <RegionModal
        isOpen={showRegionModal}
        onClose={() => setShowRegionModal(false)}
        product={product}
        userCountry="Poland"
      />

      {/* Activation Details Modal */}
      {showActivationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-[#00347d] border border-white/30 rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/30">
              <div className="flex items-center gap-3">
                {/* Platform Icon */}
                <div className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-md">
                  <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white">{product.platform || 'Steam'} Activation Guide</h3>
              </div>
              <button
                onClick={() => setShowActivationModal(false)}
                className="text-white/70 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {/* Main Instructions Section */}
              <div className="bg-white/10 rounded-md p-4 mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C20.832 18.477 19.246 18 17.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h4 className="text-lg font-bold text-white">How to Activate Your {product.platform || 'Steam'} Product</h4>
                </div>
                
                {/* Dynamic activation content - always render exactly as saved in database */}
                {product.activationdetails ? (
                  <div className="space-y-4">
                    {/* Always render database content as-is, supporting HTML formatting */}
                    <div 
                      className="text-white/90 text-sm leading-relaxed activation-content"
                      dangerouslySetInnerHTML={{ __html: product.activationdetails }}
                    />
                  </div>
                ) : (
                  <p className="text-white/90 text-sm leading-relaxed">No activation instructions available for this product.</p>
                )}
              </div>
              
              {/* Quick Links Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                      </svg>
                    </div>
                    <h5 className="font-semibold text-white text-sm">{product.platform || 'Platform'} Store</h5>
                  </div>
                  <p className="text-white/70 text-xs">Download client & browse games</p>
                </div>
                
                <div className="bg-white/10 rounded-md p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h5 className="font-semibold text-white text-sm">Support</h5>
                  </div>
                  <p className="text-white/70 text-xs">Get help with activation issues</p>
                </div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end p-6 border-t border-white/30">
              <button
                onClick={() => setShowActivationModal(false)}
                className="px-6 py-2 bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white font-semibold rounded-full hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export async function getServerSideProps(context) {
  const { params, req } = context;
  const { slug } = params;
  
  try {
    // Determine the base URL for internal API calls
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers.host;
    const baseUrl = `${protocol}://${host}`;
    
    // Make internal API call to fetch product details
    const response = await fetch(`${baseUrl}/api/products?slug=${slug}`);
    
    if (!response.ok) {
      throw new Error(`Product API request failed: ${response.status}`);
    }
    
    const product = await response.json();
    
    if (!product || !product.id) {
      return {
        notFound: true
      };
    }

    // Use the API response data directly and add required properties
    const transformedProduct = {
      ...product,
      price: parseFloat(product.price) || 0,
      cover_url: product.coverUrl || product.coverThumbnail || '/placeholder.svg',
      screenshot_urls: product.screenshotUrls || [],
      age_rating: product.ageRating || '',
      release_date: product.releaseDate || '',
      system_requirements: product.systemRequirements || [],
      metacritic_score: product.metacriticScore || 90,
      qty: product.stock || 0
    };

    // Fetch random recommended products
    const recommendedResponse = await fetch(`${baseUrl}/api/products?limit=8&exclude=${transformedProduct.id}&random=true`);
    let recommendedProducts = [];
    
    if (recommendedResponse.ok) {
      const recommendedData = await recommendedResponse.json();
      if (recommendedData.success && recommendedData.products) {
        recommendedProducts = recommendedData.products.map(prod => ({
          ...prod,
          price: parseFloat(prod.price) || 0,
          cover_url: prod.coverUrl || prod.coverThumbnail || '/placeholder.svg'
        }));
      }
    }

    return {
      props: {
        product: transformedProduct,
        recommendedProducts
      }
    };
  } catch (error) {
    console.error('Error fetching product for SSR:', error);
    console.error('Error details:', error.message, error.stack);
    
    // Return 404 on error
    return {
      notFound: true
    };
  }
}