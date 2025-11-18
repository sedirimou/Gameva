import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import '@splidejs/react-splide/css/core';

export default function HeroSlider() {
  const router = useRouter();
  const [heroSlides, setHeroSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active hero sections from admin panel
  useEffect(() => {
    const fetchHeroSections = async () => {
      try {
        console.log('🔥 FETCHING HERO SECTIONS FROM DATABASE...');
        const response = await fetch('/api/hero-sections');
        const data = await response.json();
        
        console.log('🔥 API RESPONSE:', data);
        console.log('🔥 Heroes data:', data.heroes);
        
        if (data.success && data.heroes && data.heroes.length > 0) {
          // Transform admin hero data to match slider format with strict serialization
          const transformedHeroes = data.heroes.map(hero => ({
            id: String(hero.id || ''),
            image: String(hero.image || '/placeholder-game.svg'),
            title: String(hero.title || ''),
            button_label: String(hero.button_label || ''),
            link: String(hero.link || ''),
            position: parseInt(hero.position) || 0
          })).filter(hero => hero.id && hero.image); // Only include valid heroes
          
          console.log('🔥 TRANSFORMED HEROES:', transformedHeroes);
          console.log('🔥 USING DATABASE HERO DATA - NO FALLBACK!');
          setHeroSlides(transformedHeroes);
        } else {
          console.log('🚨 NO HEROES FOUND IN DATABASE - THIS SHOULD NOT HAPPEN!');
          console.log('🚨 API Response:', data);
          // Only use fallback if absolutely no data found
          setHeroSlides([]);
        }
      } catch (error) {
        console.error('🚨 ERROR FETCHING HERO SECTIONS:', error);
        // Only use fallback on complete fetch error
        setHeroSlides([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSections();
  }, []);

  const splideOptions = {
    type: 'loop',
    perPage: 1,
    perMove: 1,
    gap: '1rem',
    rewind: false,
    infinite: true,
    padding: {
      left: '5rem',
      right: '5rem',
    },
    breakpoints: {
      1024: {
        padding: {
          left: '3rem',
          right: '3rem',
        },
      },
      768: {
        padding: {
          left: '2rem',
          right: '2rem',
        },
      },
      640: {
        padding: {
          left: '1rem',
          right: '1rem',
        },
      },
    },
    autoplay: true,
    interval: 4000,
    pauseOnHover: true,
    pauseOnFocus: true,
    resetProgress: false,
    arrows: true,
    pagination: true,
    speed: 800,
    easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    drag: true,
    keyboard: true,
    wheel: false,
    waitForTransition: true,
  };

  // Show loading state
  if (loading) {
    return (
      <div 
        className="w-full py-3 md:py-12"
        style={{
          background: 'linear-gradient(to bottom, #000d6e, #153e8f)',
          minHeight: '400px'
        }}
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="h-[220px] md:h-[350px] lg:h-[400px] rounded-2xl bg-white/10 animate-pulse">
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="w-full py-3 md:py-12"
      style={{
        background: 'linear-gradient(to bottom, #000d6e, #153e8f)',
        minHeight: '400px'
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <Splide
          options={splideOptions}
          className="hero-splide"
        >
          {heroSlides.map((slide) => (
            <SplideSlide key={slide.id}>
              <div 
                className="relative block h-[220px] md:h-[350px] lg:h-[400px] rounded-2xl overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
              >
                <img 
                  src={slide.image}
                  alt={String(slide.title || `Gaming slide ${slide.id || ''}`)}
                  className="w-full h-full object-cover pointer-events-none"
                  loading={slide.id === 1 ? "eager" : "lazy"}
                  fetchPriority={slide.id === 1 ? "high" : "low"}
                />
                
                {/* Text and Button Overlay */}
                <div className="absolute inset-0">
                  {/* Title overlay - centered if present */}
                  {slide.title && (
                    <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                      <div className="text-center text-white px-4">
                        <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-shadow-lg">
                          {String(slide.title || '')}
                        </h2>
                      </div>
                    </div>
                  )}
                  
                  {/* Button overlay - bottom-right corner */}
                  {slide.button_label && slide.link && (
                    <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6">
                      <button 
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          
                          console.log('🎯 HERO BUTTON CLICKED!');
                          console.log('🎯 Raw slide.link from database:', slide.link);
                          console.log('🎯 Button Label:', slide.button_label);
                          console.log('🎯 Full slide data:', JSON.stringify(slide, null, 2));
                          
                          // Only navigate if we have a valid link from admin panel
                          if (!slide.link) {
                            console.log('🚨 NO LINK CONFIGURED - Navigation cancelled');
                            return;
                          }
                          
                          // Add visual feedback
                          e.target.style.opacity = '0.7';
                          setTimeout(() => {
                            if (e.target) {
                              e.target.style.opacity = '1';
                            }
                          }, 200);
                          
                          // Navigate immediately to the URL from the link column
                          console.log('📍 NAVIGATING TO URL FROM LINK COLUMN:', slide.link);
                          
                          try {
                            // Clear localStorage for clean navigation
                            localStorage.removeItem('category-filters');
                            localStorage.removeItem('price-filters');
                            localStorage.removeItem('applied-filters');
                            localStorage.setItem('hero-navigation', 'true');
                            console.log('🧹 Cleared localStorage');
                          } catch (error) {
                            console.log('localStorage not available:', error);
                          }
                          
                          // Force navigation using window.location to exact URL from database
                          console.log('🚀 Executing navigation to database URL...');
                          window.location.href = slide.link;
                        }}
                        className="bg-gradient-to-r from-[#99b476] to-[#29adb2] text-white px-4 py-3 md:px-6 md:py-3 rounded-md font-bold text-sm md:text-base hover:opacity-90 transition-opacity duration-300 shadow-xl border-2 border-white border-opacity-30 z-10 relative cursor-pointer uppercase tracking-wide"
                      >
                        {String(slide.button_label || '')}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </SplideSlide>
          ))}
        </Splide>
      </div>

      <style jsx global>{`
        /* Core Splide Styles */
        .splide__track {
          position: relative;
          z-index: 0;
          overflow: hidden;
        }

        .splide__list {
          backface-visibility: hidden;
          display: flex;
          height: 100%;
          margin: 0!important;
          padding: 0!important;
        }

        .splide__slide {
          backface-visibility: hidden;
          box-sizing: border-box;
          flex-shrink: 0;
          list-style-type: none!important;
          margin: 0;
          position: relative;
        }

        .splide__slide img {
          vertical-align: bottom;
        }

        .splide__slider {
          position: relative;
        }

        .splide__slider.is-initialized .splide__slide {
          cursor: pointer;
        }

        .splide__arrows {
          display: flex;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 100%;
          z-index: 1;
        }

        .splide__arrow {
          align-items: center;
          background: rgba(0, 0, 0, 0.7)!important;
          border: 2px solid rgba(255, 255, 255, 0.3)!important;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          height: 3em;
          justify-content: center;
          opacity: 0.7;
          padding: 0;
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          width: 3em;
          z-index: 1;
          color: white!important;
          outline: none;
          transition: all 0.3s ease;
        }

        .splide__arrow:hover {
          opacity: 1;
          background: rgba(0, 0, 0, 0.9)!important;
          border-color: rgba(255, 255, 255, 0.8)!important;
          transform: translateY(-50%) scale(1.1);
        }

        .splide__arrow:disabled {
          opacity: 0.3;
        }

        .splide__arrow--prev {
          left: 1em;
        }

        .splide__arrow--next {
          right: 1em;
        }

        .splide__arrow svg {
          fill: currentColor;
          height: 1.2em;
          width: 1.2em;
        }

        .splide__pagination {
          align-items: center;
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          margin: 0;
          pointer-events: none;
          position: absolute;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1;
        }

        .splide__pagination li {
          display: inline-block;
          line-height: 1;
          list-style-type: none;
          margin: 0;
          pointer-events: auto;
        }

        .splide__pagination__page {
          background: rgba(255, 255, 255, 0.5);
          border: 2px solid rgba(255, 255, 255, 0.7);
          border-radius: 50%;
          cursor: pointer;
          display: inline-block;
          font-size: 0;
          height: 12px;
          margin: 0 6px;
          opacity: 0.7;
          outline: none;
          padding: 0;
          position: relative;
          transition: all 0.3s ease;
          width: 12px;
        }

        .splide__pagination__page.is-active {
          background: white!important;
          border-color: white!important;
          opacity: 1;
          transform: scale(1.2);
        }

        .splide__pagination__page:hover {
          opacity: 1;
        }

        .splide__pagination__page:focus-visible {
          outline: 3px solid #0bf;
          outline-offset: 3px;
        }

        .splide.is-focus-in .splide__pagination__page:focus {
          outline: 3px solid #0bf;
          outline-offset: 3px;
        }

        .splide__progress__bar {
          width: 0;
        }

        .splide {
          position: relative;
          visibility: hidden;
        }

        .splide.is-initialized,
        .splide.is-rendered {
          visibility: visible;
        }

        /* Hero Slider Custom Styles */
        .hero-splide .splide__slide {
          background-size: cover!important;
          background-position: center!important;
          background-repeat: no-repeat!important;
        }

        /* Text shadow for better readability on overlay text */
        .text-shadow-lg {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
        }

        @media (max-width: 768px) {
          .splide__arrow {
            width: 2.5em!important;
            height: 2.5em!important;
          }

          .splide__arrow svg {
            width: 1em!important;
            height: 1em!important;
          }

          .splide__arrow--prev {
            left: 0.5em!important;
          }

          .splide__arrow--next {
            right: 0.5em!important;
          }

          .splide__pagination {
            bottom: 1rem!important;
          }

          .splide__pagination__page {
            width: 10px!important;
            height: 10px!important;
            margin: 0 4px!important;
          }
        }
      `}</style>
    </div>
  );
}