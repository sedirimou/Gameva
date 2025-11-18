import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import ProductCard from './ProductCard';
import 'swiper/css';

export function ProductsSwiper({
  products,
  className = "products-swiper"
}) {
  if (products.length === 0) {
    return null;
  }

  return (
    <Swiper
      spaceBetween={12}
      slidesPerView={2}
      loop={false}
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
      className={className}
    >
      {products.map((product, index) => {
        // Ensure we have a valid product object and ID
        if (!product || (!product.id && product.id !== 0)) {
          console.warn('ProductSwiper: Invalid product at index', index, product);
          return null;
        }
        
        return (
          <SwiperSlide key={String(product.id)}>
            <ProductCard
              product={{
                ...product,
                id: String(product.id),
                name: String(product.name || ''),
                platform: String(product.platform || ''),
                slug: String(product.slug || ''),
                images_cover_url: String(product.images_cover_url || '/placeholder-game.svg')
              }}
              index={index}
            />
          </SwiperSlide>
        );
      }).filter(Boolean)}
    </Swiper>
  );
}



// Keep backward compatibility with existing usage
export default function ProductSwiper({ products = [] }) {
  return (
    <ProductsSwiper 
      products={products}
    />
  );
}