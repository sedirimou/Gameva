import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import MainLayout from '../components/layout/MainLayout';
import ProductSwiper from '../components/frontend/ProductSwiper';
import HeroSlider from '../components/frontend/HeroSlider';
import IconGridSection from '../components/frontend/IconGridSection';
import { ExploreByPlatform } from '../components/frontend/ExploreByPlatform';
import { ExploreByGenres } from '../components/frontend/ExploreByGenres';
import { ExploreByPrice } from '../components/frontend/ExploreByPrice';
import { getProductImageUrl } from '../lib/imageUtils';
import { safeSerializeProduct, validateForReactRender } from '../lib/serializationUtils';

import { query } from '../lib/database';

export default function HomePage({ products: initialProducts }) {
  const [products, setProducts] = useState(initialProducts || []);
  const [sections, setSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration and fetch sections
  useEffect(() => {
    setIsHydrated(true);
    fetchHomeSections();
    
    // Client-side fallback to fetch products if server-side failed
    if (products.length === 0) {
      setIsLoading(true);
      fetchProducts();
    }
  }, []);

  const fetchHomeSections = async () => {
    try {
      const response = await fetch('/api/home-sections');
      const data = await response.json();
      
      if (data.success && data.sections) {
        setSections(data.sections);
        console.log('✅ Home sections loaded:', data.sections.length);
      }
    } catch (error) {
      console.error('❌ Error fetching home sections:', error);
    } finally {
      setSectionsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      // Simplified request to prevent 431 header size errors
      const response = await fetch('/api/products?limit=40&orderBy=updatedAt&orderDirection=desc', {
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // API returns products array directly, not wrapped in success object
      if (Array.isArray(data) && data.length > 0) {
        setProducts(data);
        console.log('✅ Products loaded via client-side fallback:', data.length);
      } else if (data.success && data.products) {
        // Fallback for wrapped response format
        setProducts(data.products);
        console.log('✅ Products loaded via client-side fallback:', data.products.length);
      } else {
        console.warn('⚠️ API response missing products:', data);
      }
    } catch (error) {
      console.error('❌ Error fetching products client-side:', error);
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <>
      <Head>
        {/* Preload LCP hero image for performance */}
        <link rel="preload" as="image" href="https://cdn.gameseal.com/media/c5/ec/e8/1749134877/Desktop_ITEM1_(24).webp" />
        <link rel="dns-prefetch" href="https://cdn.gameseal.com" />
      </Head>
      
      <MainLayout 
        title="Gamava.net - Store" 
        description="Welcome to Gamava.net online store"
      >
        <div className="w-full overflow-x-hidden">
          <HeroSlider />
        
          {/* Fixed Section Order - Database-driven with exploration sections interspersed */}
          {sectionsLoading ? (
            <div className="max-w-[1400px] mx-auto px-4">
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
              </div>
            </div>
          ) : (
            <>
              {/* 1. Recommended For You */}
              <div className="max-w-[1400px] mx-auto px-4 -mt-24 sm:-mt-8 md:mt-8">
                {(() => {
                  const recommendedSection = sections.find(s => s.title === 'Recommended For You');
                  return recommendedSection ? (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-3 mt-0 font-onest">
                        {recommendedSection.title}
                      </h2>
                      {recommendedSection.products && recommendedSection.products.length > 0 ? (
                        <ProductSwiper products={recommendedSection.products} />
                      ) : (
                        <p className="text-gray-400 text-center py-8">No products available in this section</p>
                      )}
                    </section>
                  ) : (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-3 mt-0 font-onest">Recommended For You</h2>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
                        </div>
                      ) : (
                        <ProductSwiper products={products.slice(0, 8)} />
                      )}
                    </section>
                  );
                })()}
              </div>

              {/* 2. Explore By Platform */}
              <ExploreByPlatform onPlatformSelect={(platform) => console.log('Selected platform:', platform)} />

              {/* 3. Best Selling Games */}
              <div className="max-w-[1400px] mx-auto px-4">
                {(() => {
                  const gamesSection = sections.find(s => s.title === 'Best Selling Games');
                  return gamesSection ? (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">
                        {gamesSection.title}
                      </h2>
                      {gamesSection.products && gamesSection.products.length > 0 ? (
                        <ProductSwiper products={gamesSection.products} />
                      ) : (
                        <p className="text-gray-400 text-center py-8">No products available in this section</p>
                      )}
                    </section>
                  ) : (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">Best Selling Games</h2>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
                        </div>
                      ) : (
                        <ProductSwiper products={products.slice(8, 16)} />
                      )}
                    </section>
                  );
                })()}
              </div>

              {/* 4. Explore By Genres */}
              <ExploreByGenres onGenreSelect={(genre) => console.log('Selected genre:', genre)} />

              {/* 5. Best Selling Gift Cards */}
              <div className="max-w-[1400px] mx-auto px-4">
                {(() => {
                  const giftCardsSection = sections.find(s => s.title === 'Best selling gift cards');
                  return giftCardsSection ? (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">
                        {giftCardsSection.title}
                      </h2>
                      {giftCardsSection.products && giftCardsSection.products.length > 0 ? (
                        <ProductSwiper products={giftCardsSection.products} />
                      ) : (
                        <p className="text-gray-400 text-center py-8">No products available in this section</p>
                      )}
                    </section>
                  ) : (
                    <section>
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">Best selling gift cards</h2>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
                        </div>
                      ) : (
                        <ProductSwiper products={products.slice(16, 24)} />
                      )}
                    </section>
                  );
                })()}
              </div>

              {/* 6. Explore By Price */}
              <ExploreByPrice onPriceRangeSelect={(priceRange) => console.log('Selected price range:', priceRange)} />

              {/* 7. Best Selling Softwares */}
              <div className="max-w-[1400px] mx-auto px-4">
                {(() => {
                  const softwaresSection = sections.find(s => s.title === 'Best Selling Softwares');
                  return softwaresSection ? (
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">
                        {softwaresSection.title}
                      </h2>
                      {softwaresSection.products && softwaresSection.products.length > 0 ? (
                        <ProductSwiper products={softwaresSection.products} />
                      ) : (
                        <p className="text-gray-400 text-center py-8">No products available in this section</p>
                      )}
                    </section>
                  ) : (
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">Best Selling Softwares</h2>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
                        </div>
                      ) : (
                        <ProductSwiper products={products.slice(24, 30)} />
                      )}
                    </section>
                  );
                })()}
              </div>

              {/* 8. Our Features (Icon Grid Section) */}
              <IconGridSection />

              {/* 9. Best Selling Subscriptions */}
              <div className="max-w-[1400px] mx-auto px-4">
                {(() => {
                  const subscriptionsSection = sections.find(s => s.title === 'Best Selling Subscriptions');
                  return subscriptionsSection ? (
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">
                        {subscriptionsSection.title}
                      </h2>
                      {subscriptionsSection.products && subscriptionsSection.products.length > 0 ? (
                        <ProductSwiper products={subscriptionsSection.products} />
                      ) : (
                        <p className="text-gray-400 text-center py-8">No products available in this section</p>
                      )}
                    </section>
                  ) : (
                    <section className="mb-8">
                      <h2 className="text-2xl font-bold text-gray-light mb-4 mt-8 font-onest">Best Selling Subscriptions</h2>
                      {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#29adb2]"></div>
                        </div>
                      ) : (
                        <ProductSwiper products={products.slice(30, 38)} />
                      )}
                    </section>
                  );
                })()}
              </div>
            </>
          )}
        </div>
      </MainLayout>
    </>
  );
}



export async function getServerSideProps() {
  try {
    console.log('🚀 Homepage SSR: Starting optimized product fetch...');
    
    // Optimized query with minimal data for homepage SSR
    const queryPromise = query(`
      SELECT id, name, platform, price, sale_price, qty,
             images_cover_url, images_cover_thumbnail, slug
      FROM products 
      ORDER BY updatedAt DESC 
      LIMIT 40
    `);

    // Reduced timeout for better performance
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database timeout')), 8000)
    );

    const result = await Promise.race([queryPromise, timeoutPromise]);
    console.log('✅ Homepage SSR: Products fetched successfully:', result.rows.length);

    // Minimal product transformation with safe serialization to prevent React error #130
    const products = result.rows.map(product => {
      const serializedProduct = safeSerializeProduct(product);
      
      // Validate each product for React safety
      if (!validateForReactRender(serializedProduct, 'homepage-product')) {
        console.warn('Unsafe product data detected and corrected:', product.id);
        return {
          id: String(product.id || ''),
          name: String(product.name || ''),
          platform: String(product.platform || ''),
          price: parseFloat(product.price) || 0,
          sale_price: product.sale_price ? parseFloat(product.sale_price) : null,
          qty: parseInt(product.qty) || 0,
          slug: String(product.slug || ''),
          images_cover_url: String(getProductImageUrl(product) || '/placeholder-game.svg')
        };
      }
      
      return serializedProduct;
    }).filter(product => product && product.id); // Remove any invalid products

    console.log('✅ Homepage SSR: Returning optimized data for', products.length, 'products');
    return {
      props: {
        products
      }
    };
  } catch (error) {
    console.error('❌ Homepage SSR: Database failed, using client-side fallback:', error.message);
    // Ensure we always return serializable props
    return {
      props: {
        products: []
      }
    };
  }
}