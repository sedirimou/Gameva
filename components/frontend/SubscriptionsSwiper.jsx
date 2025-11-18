import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const subscriptions = [
  {
    id: 1,
    name: 'Xbox Game Pass Ultimate',
    originalPrice: 14.99,
    finalPrice: 12.99,
    discount: 13,
    coverUrl: 'https://assets.xboxservices.com/assets/4d/c8/4dc8b8e1-3c4f-4b7a-8b1e-6f8d9e0c1a2b.jpg',
    platform: 'Xbox',
    duration: '1 Month',
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: 'PlayStation Plus Premium',
    originalPrice: 16.99,
    finalPrice: 14.99,
    discount: 12,
    coverUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/ps-plus-premium-hero-desktop-01-en-30jul21',
    platform: 'PlayStation',
    duration: '1 Month',
    inStock: true,
    featured: true
  },
  {
    id: 3,
    name: 'EA Play Pro',
    originalPrice: 14.99,
    finalPrice: 11.99,
    discount: 20,
    coverUrl: 'https://media.contentapi.ea.com/content/dam/ea/ea-play/common/ea-play-logo-white.png',
    platform: 'PC',
    duration: '1 Month',
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: 'Ubisoft+',
    originalPrice: 14.99,
    finalPrice: 12.99,
    discount: 13,
    coverUrl: 'https://staticctf.akamaized.net/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4F8g8d4JvNrQ1QJrJqBfJf/ubisoft-plus-logo.png',
    platform: 'PC',
    duration: '1 Month',
    inStock: true,
    featured: true
  },
  {
    id: 5,
    name: 'Nintendo Switch Online',
    originalPrice: 3.99,
    finalPrice: 3.49,
    discount: 13,
    coverUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,c_lpad,w_1240/b_white/f_auto/q_auto/ncom/en_US/merchandising/switch-online/nintendo-switch-online-logo',
    platform: 'Nintendo',
    duration: '1 Month',
    inStock: true,
    featured: false
  }
];

function SubscriptionItem({ subscription, onAddToCart, onToggleWishlist, isInCart, isInWishlist }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const hasDiscount = subscription.originalPrice > subscription.finalPrice;

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleProductClick = () => {
    const slug = generateSlug(subscription.name);
    router.push(`/product/${slug}`);
  };

  return (
    <div className="product-card cursor-pointer" onClick={handleProductClick}>
      {hasDiscount && (
        <div className="product-card__discount">
          -{subscription.discount}%
        </div>
      )}
      
      <div className="product-card__fav-btn">
        <button 
          className="fav-button"
          onClick={() => onToggleWishlist(subscription)}
          aria-label={isInWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill={isInWishlist ? "#c5e898" : "none"} stroke={isInWishlist ? "#c5e898" : "#f3f3f3"} strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </button>
      </div>

      <div 
        className={`product-card__cover ${!imageLoaded ? 'loading' : ''}`}
        style={{ 
          backgroundImage: imageLoaded ? `url(${subscription.coverUrl})` : 'none'
        }}
      >
        <img 
          src={subscription.coverUrl}
          alt={subscription.name}
          style={{ display: 'none' }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>

      <h3 className="product-card__title">{subscription.name}</h3>
      
      <div className="product-card__bottom">
        <div className="product-card__price-wrapper">
          <p className="product-card__discount-price">
            €{subscription.finalPrice.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="product-card__original-price discounted">
              €{subscription.originalPrice.toFixed(2)}
            </p>
          )}
        </div>
        
        <button 
          className="product-card__cart-btn"
          onClick={() => onAddToCart(subscription)}
          aria-label={isInCart ? "Remove from cart" : "Add to cart"}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <circle cx="9" cy="21" r="1"/>
            <circle cx="20" cy="21" r="1"/>
            <path d="m1 1 4 2 2 13 14 1"/>
          </svg>
        </button>
      </div>

      <div className="product-card__platforms-wrapper">
        <div className="product-card__platforms">
          <div className="platform-entry">
            <span style={{ fontSize: '12px', color: '#f3f3f3' }}>{subscription.platform}</span>
          </div>
          <div className="platform-entry">
            <span style={{ fontSize: '10px', color: '#a0a0a0' }}>{subscription.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SubscriptionsSwiper({ onAddToCart, onToggleWishlist, cartItems = [], wishlistItems = [], className = '' }) {
  return (
    <div className={`max-w-[1400px] mx-auto ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation
        loop={subscriptions.length >= 5}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 5,
            spaceBetween: 20,
          },
        }}
        className="subscriptions-swiper"
      >
        {subscriptions.map((subscription) => (
          <SwiperSlide key={subscription.id}>
            <SubscriptionItem
              subscription={subscription}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInCart={cartItems.includes(subscription.id.toString())}
              isInWishlist={wishlistItems.includes(subscription.id.toString())}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}