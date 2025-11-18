import React, { useState } from "react";
import { useRouter } from 'next/router';
import { GridSwiper } from "./GridSwiper";

const priceRanges = [
  { id: "under-5", label: "Under €5", maxPrice: 5, urlParam: "0-5" },
  { id: "under-10", label: "Under €10", maxPrice: 10, urlParam: "0-10" },
  { id: "under-20", label: "Under €20", maxPrice: 20, urlParam: "0-20" },
  { id: "under-50", label: "Under €50", maxPrice: 50, urlParam: "0-50" },
  { id: "under-100", label: "Under €100", maxPrice: 100, urlParam: "0-100" },
  { id: "under-200", label: "Under €200", maxPrice: 200, urlParam: "0-200" },
];

export function ExploreByPrice({ onPriceRangeSelect }) {
  const [selectedRange, setSelectedRange] = useState(null);
  const router = useRouter();

  const handlePriceRangeClick = (range, event) => {
    // Prevent event bubbling and only allow intentional clicks
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setSelectedRange(range.id);
    
    // Navigate to category page with price filter
    const searchParams = new URLSearchParams();
    searchParams.set('priceMin', '0');
    searchParams.set('priceMax', range.maxPrice.toString());
    
    router.push(`/category/all-products?${searchParams.toString()}`);
    
    if (onPriceRangeSelect) {
      onPriceRangeSelect(range);
    }
  };

  return (
    <section className="bg-[#000d6e] w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[16px] pb-[16px]">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-left mb-4 sm:mb-6 md:mb-8">
            Explore By Price
          </h2>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <GridSwiper
            items={priceRanges.map((range) => ({
              id: range.id,
              content: (
                <div 
                  className={`price-range-card cursor-pointer ${
                    selectedRange === range.id ? 'selected' : ''
                  }`}
                  onClick={(event) => handlePriceRangeClick(range, event)}
                >
                  <div className="price-range-content">
                    <span className="price-range-label font-semibold text-[18px]">Under</span>
                    <span className="price-range-amount">
                      €{range.maxPrice}
                    </span>
                  </div>
                </div>
              ),
            }))}
            itemsPerView={2}
            spaceBetween={16}
            autoplay={true}
            navigation={true}
            pagination={false}
            className="price-grid-swiper"
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
                slidesPerView: 6,
                spaceBetween: 16,
              },
            }}
          />
        </div>
      </div>
    </section>
  );
}