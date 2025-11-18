import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

export function GridSwiper({
  items,
  itemsPerView = 2,
  spaceBetween = 16,
  autoplay = false,
  navigation = true,
  pagination = false,
  className = "grid-swiper",
  breakpoints = {
    640: {
      slidesPerView: 3,
      spaceBetween: 16,
    },
    768: {
      slidesPerView: 4,
      spaceBetween: 16,
    },
    1024: {
      slidesPerView: 6,
      spaceBetween: 16,
    },
  }
}) {
  const modules = [];
  if (autoplay) modules.push(Autoplay);
  if (navigation) modules.push(Navigation);
  if (pagination) modules.push(Pagination);

  const swiperProps = {
    modules,
    spaceBetween,
    slidesPerView: itemsPerView,
    loop: false,
    breakpoints,
    className,
  };

  if (autoplay) {
    swiperProps.autoplay = {
      delay: 3000,
      disableOnInteraction: false,
    };
  }

  if (navigation) {
    swiperProps.navigation = true;
  }

  if (pagination) {
    swiperProps.pagination = {
      clickable: true,
    };
  }

  return (
    <Swiper {...swiperProps}>
      {items.map((item) => (
        <SwiperSlide key={item.id}>
          {item.content}
        </SwiperSlide>
      ))}
    </Swiper>
  );
}