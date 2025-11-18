import React, { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { GridSwiper } from "./GridSwiper";

// Default icon for genres
const getDefaultGenreIcon = () => (
  <svg className="w-8 h-8 mb-2" fill="white" viewBox="0 0 24 24">
    <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
    <path d="M12 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S2 17.523 2 12 6.477 2 12 2z" fill="white"/>
    <path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4-4-1.79-4-4z" fill="#1e40af"/>
    <path d="M12 8v8M8 12h8" stroke="#1e40af" strokeWidth="1"/>
  </svg>
);

// Render genre icon (custom or default)
const renderGenreIcon = (genre) => {
  if (genre?.icon_url) {
    return (
      <div className="relative w-8 h-8 mb-2">
        <img 
          src={genre.icon_url} 
          alt={`${genre.title || 'Genre'} icon`}
          className="w-8 h-8 object-contain"
          onError={(e) => {
            // Fallback to default icon if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      </div>
    );
  }
  return (
    <div className="relative w-8 h-8 mb-2">
      {getDefaultGenreIcon()}
    </div>
  );
};

export function ExploreByGenres({ onGenreSelect }) {
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [featuredGenres, setFeaturedGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchFeaturedGenres();
  }, []);

  const fetchFeaturedGenres = async () => {
    try {
      const response = await fetch('/api/admin/attributes/genres');
      const data = await response.json();
      // Filter only featured genres
      const featured = data.filter(genre => genre.is_featured);
      setFeaturedGenres(featured);
    } catch (error) {
      console.error('Error fetching featured genres:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreClick = (genre, event) => {
    // Prevent event bubbling and only allow intentional clicks
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    setSelectedGenre(genre.id);
    
    // Navigate to category page with genre filter
    const searchParams = new URLSearchParams();
    searchParams.set('genres', genre.title);
    
    router.push(`/category/all-products?${searchParams.toString()}`);
    
    if (onGenreSelect) {
      onGenreSelect(genre);
    }
  };

  if (loading) {
    return (
      <section className="bg-[#000d6e] w-full">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[16px] pb-[16px]">
          <div className="mb-6 sm:mb-8 md:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-left mb-4 sm:mb-6 md:mb-8">
              Explore By Genres
            </h2>
          </div>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </section>
    );
  }

  // Don't render if no featured genres
  if (featuredGenres.length === 0) {
    return null;
  }

  return (
    <section className="bg-[#000d6e] w-full">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 pt-[16px] pb-[16px]">
        <div className="mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white text-left mb-4 sm:mb-6 md:mb-8">
            Explore By Genres
          </h2>
        </div>

        <div className="max-w-[1400px] mx-auto">
          <GridSwiper
            items={featuredGenres.map((genre) => ({
            id: genre.id,
            content: (
              <div 
                className={`genre-card cursor-pointer ${
                  selectedGenre === genre.id ? 'selected' : ''
                }`}
                onClick={(event) => handleGenreClick(genre, event)}
              >
                <div className="genre-content">
                  {renderGenreIcon(genre)}
                  <span className="genre-label">
                    {genre?.title || 'Genre'}
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
          className="genres-grid-swiper"
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