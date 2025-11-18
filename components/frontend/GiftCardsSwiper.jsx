import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const giftCards = [
  {
    id: 1,
    name: 'Steam Wallet Gift Card',
    originalPrice: 50.00,
    finalPrice: 45.00,
    discount: 10,
    coverUrl: 'https://cdn.akamai.steamstatic.com/steam/apps/223300/header.jpg',
    platform: 'Steam',
    inStock: true,
    featured: true
  },
  {
    id: 2,
    name: 'PlayStation Store Gift Card',
    originalPrice: 25.00,
    finalPrice: 23.00,
    discount: 8,
    coverUrl: 'https://gmedia.playstation.com/is/image/SIEPDC/playstation-store-gift-card-hero-desktop-01-en-30jul21',
    platform: 'PlayStation',
    inStock: true,
    featured: true
  },
  {
    id: 3,
    name: 'Xbox Live Gift Card',
    originalPrice: 30.00,
    finalPrice: 27.00,
    discount: 10,
    coverUrl: 'https://assets.xboxservices.com/assets/fb/d2/fbd2cb66-9b14-4b56-8f8c-7d5a4b8e8d8a.jpg',
    platform: 'Xbox',
    inStock: true,
    featured: true
  },
  {
    id: 4,
    name: 'Nintendo eShop Gift Card',
    originalPrice: 20.00,
    finalPrice: 18.50,
    discount: 7,
    coverUrl: 'https://assets.nintendo.com/image/upload/ar_16:9,b_auto:border,c_lpad/b_white/f_auto/q_auto/dpr_1.5/c_scale,w_400/ncom/en_US/merchandising/gift-cards/nintendo-eshop-cards-photo',
    platform: 'Nintendo',
    inStock: true,
    featured: true
  },
  {
    id: 5,
    name: 'Epic Games Store Gift Card',
    originalPrice: 15.00,
    finalPrice: 14.00,
    discount: 7,
    coverUrl: 'https://cdn2.unrealengine.com/epic-games-logo-1200x630-582x302-c2d7a5de4047.png',
    platform: 'Epic Games',
    inStock: true,
    featured: false
  }
];

function GiftCardItem({ giftCard, onAddToCart, onToggleWishlist, isInCart, isInWishlist }) {
  const router = useRouter();
  const [imageLoaded, setImageLoaded] = useState(false);
  
  const hasDiscount = giftCard.originalPrice > giftCard.finalPrice;

  const generateSlug = (name) => {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  };

  const handleProductClick = () => {
    const slug = generateSlug(giftCard.name);
    router.push(`/product/${slug}`);
  };

  return (
    <div className="product-card cursor-pointer" onClick={handleProductClick}>
      {hasDiscount && (
        <div className="product-card__discount">
          -{giftCard.discount}%
        </div>
      )}
      
      <div className="product-card__fav-btn">
        <button 
          className="fav-button"
          onClick={() => onToggleWishlist(giftCard)}
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
          backgroundImage: imageLoaded ? `url(${giftCard.coverUrl})` : 'none'
        }}
      >
        <img 
          src={giftCard.coverUrl}
          alt={giftCard.name}
          style={{ display: 'none' }}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
        />
      </div>

      <h3 className="product-card__title">{giftCard.name}</h3>
      
      <div className="product-card__bottom">
        <div className="product-card__price-wrapper">
          <p className="product-card__discount-price">
            €{giftCard.finalPrice.toFixed(2)}
          </p>
          {hasDiscount && (
            <p className="product-card__original-price discounted">
              €{giftCard.originalPrice.toFixed(2)}
            </p>
          )}
        </div>
        
        <button 
          className="product-card__cart-btn"
          onClick={() => onAddToCart(giftCard)}
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
            <span style={{ fontSize: '12px', color: '#f3f3f3' }}>{giftCard.platform}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function GiftCardsSwiper({ onAddToCart, onToggleWishlist, cartItems = [], wishlistItems = [], className = '' }) {
  return (
    <div className={`max-w-[1400px] mx-auto ${className}`}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation
        loop={giftCards.length >= 5}
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
        className="gift-cards-swiper"
      >
        {giftCards.map((giftCard) => (
          <SwiperSlide key={giftCard.id}>
            <GiftCardItem
              giftCard={giftCard}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isInCart={cartItems.includes(giftCard.id.toString())}
              isInWishlist={wishlistItems.includes(giftCard.id.toString())}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}