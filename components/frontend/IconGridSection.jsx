import { useState, useEffect } from 'react';
import { GridSwiper } from "./GridSwiper";

const IconGridSection = () => {
  const [icons, setIcons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchIconGrid();
  }, []);

  const fetchIconGrid = async () => {
    try {
      const response = await fetch('/api/icon-grid');
      if (response.ok) {
        const data = await response.json();
        setIcons(data.icons || []);
      }
    } catch (error) {
      console.error('Error fetching icon grid:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIconClick = (icon) => {
    if (icon.redirect_link) {
      if (icon.link_target === '_blank') {
        window.open(icon.redirect_link, '_blank');
      } else {
        window.location.href = icon.redirect_link;
      }
    }
  };

  if (loading) {
    return null; // Return nothing while loading
  }

  if (!icons.length) {
    return null; // Return nothing if no icons
  }

  return (
    <div className="bg-[#000d6e] py-8 mt-8">
      <div className="max-w-[1400px] mx-auto px-4">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-left mb-4 sm:mb-6 md:mb-8">
            Our Features
          </h2>
        </div>
        <GridSwiper
          items={icons.map((icon) => ({
            id: icon.id,
            content: (
              <div
                className={`price-range-card text-center ${
                  icon.redirect_link ? 'cursor-pointer transition-colors' : ''
                }`}
                onClick={() => handleIconClick(icon)}
              >
                {icon.icon_path && (
                  <div className="mb-2 flex justify-center">
                    <img
                      src={icon.icon_path}
                      alt={icon.title || 'Icon'}
                      className="w-10 h-10"
                    />
                  </div>
                )}
                {icon.title && (
                  <h3 className="font-bold text-white text-sm md:text-base">{icon.title}</h3>
                )}
                {icon.subtitle && (
                  <p className="font-semibold text-white/90 text-xs md:text-sm">{icon.subtitle}</p>
                )}
              </div>
            ),
          }))}
          itemsPerView={2}
          spaceBetween={16}
          autoplay={true}
          navigation={true}
          pagination={false}
          className="icons-grid-swiper"
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
  );
};

export default IconGridSection;